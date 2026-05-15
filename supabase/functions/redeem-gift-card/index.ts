import { createClient } from "https://esm.sh/@supabase/supabase-js@2.78.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-api-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { code } = await req.json();
    if (!code || typeof code !== "string") throw new Error("missing_code");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const authHeader = req.headers.get("Authorization");
    let user_id: string | null = null;
    if (authHeader) {
      const jwt = authHeader.replace("Bearer ", "");
      const { data: { user } } = await supabase.auth.getUser(jwt);
      user_id = user?.id ?? null;
    }

    const { data: card, error } = await supabase
      .from("gift_cards")
      .select("*")
      .eq("code", code.trim().toUpperCase())
      .maybeSingle();

    if (error) throw error;
    if (!card) {
      return new Response(
        JSON.stringify({ ok: false, error: "Gift card not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (card.status !== "active") {
      return new Response(
        JSON.stringify({ ok: false, error: `Gift card ${card.status}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { error: upErr } = await supabase
      .from("gift_cards")
      .update({
        status: "redeemed",
        redeemed_by: user_id,
        redeemed_at: new Date().toISOString(),
        balance_inr: 0,
      })
      .eq("id", card.id);
    if (upErr) throw upErr;

    return new Response(
      JSON.stringify({
        ok: true,
        amount: card.amount_inr,
        tier: card.tier,
        recipient_name: card.recipient_name,
        sender_name: card.sender_name,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("redeem-gift-card error", e);
    return new Response(
      JSON.stringify({ ok: false, error: (e as Error).message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
