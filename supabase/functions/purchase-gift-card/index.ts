import { createClient } from "https://esm.sh/@supabase/supabase-js@2.78.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-api-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const TIERS = {
  signature: { amount: 999, label: "Signature" },
  luxury: { amount: 1999, label: "Luxury" },
} as const;

function generateCode() {
  const seg = () =>
    Array.from({ length: 4 }, () =>
      "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[Math.floor(Math.random() * 32)],
    ).join("");
  return `BAZ-${seg()}-${seg()}-${seg()}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const body = await req.json();
    const tier = body.tier as keyof typeof TIERS;
    if (!TIERS[tier]) throw new Error("invalid_tier");

    const recipient_name = String(body.recipient_name ?? "").slice(0, 100).trim();
    const sender_name = String(body.sender_name ?? "").slice(0, 100).trim();
    const personal_message = String(body.personal_message ?? "").slice(0, 150);
    const delivery_type = body.delivery_type === "physical" ? "physical" : "digital";
    if (!recipient_name || !sender_name) throw new Error("missing_names");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Get user from JWT if present
    const authHeader = req.headers.get("Authorization");
    let purchaser_id: string | null = null;
    if (authHeader) {
      const jwt = authHeader.replace("Bearer ", "");
      const { data: { user } } = await supabase.auth.getUser(jwt);
      purchaser_id = user?.id ?? null;
    }

    const amount = TIERS[tier].amount;
    const code = generateCode();

    const { data, error } = await supabase
      .from("gift_cards")
      .insert({
        code,
        tier,
        amount_inr: amount,
        balance_inr: amount,
        delivery_type,
        recipient_name,
        sender_name,
        personal_message: personal_message || null,
        recipient_email: delivery_type === "digital" ? body.recipient_email ?? null : null,
        shipping_address: delivery_type === "physical" ? body.shipping_address ?? null : null,
        purchaser_id,
        status: "active", // v1: mark active immediately; payment gateway wiring is a follow-up
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(
      JSON.stringify({ ok: true, code: data.code, id: data.id, amount }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("purchase-gift-card error", e);
    return new Response(
      JSON.stringify({ ok: false, error: (e as Error).message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
