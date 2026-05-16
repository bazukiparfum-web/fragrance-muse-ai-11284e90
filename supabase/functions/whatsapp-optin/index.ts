import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@3.23.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-api-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const BodySchema = z.object({
  phone: z.string().min(6).max(20),
  consent: z.boolean(),
  cartId: z.string().nullable().optional(),
  orderNumber: z.string().nullable().optional(),
  source: z.enum(["cart_drawer", "order_confirmation"]),
});

function normalizePhone(input: string): string | null {
  const cleaned = input.replace(/[^\d+]/g, "");
  if (!cleaned) return null;
  // Already E.164-ish
  if (cleaned.startsWith("+")) {
    const digits = cleaned.slice(1);
    if (digits.length < 10 || digits.length > 15) return null;
    return "+" + digits;
  }
  // 10-digit Indian number → +91
  if (/^\d{10}$/.test(cleaned)) return "+91" + cleaned;
  // 12 digits starting with 91
  if (/^91\d{10}$/.test(cleaned)) return "+" + cleaned;
  return null;
}

async function attachShopifyOrderNote(
  orderNumber: string,
  phone: string,
  consent: boolean,
): Promise<{ orderId: string | null; status: "sent" | "failed" | "skipped"; error?: string }> {
  const shopDomain = Deno.env.get("SHOPIFY_STORE_PERMANENT_DOMAIN") ||
    Deno.env.get("SHOPIFY_SHOP_DOMAIN");
  const token = Deno.env.get("SHOPIFY_ACCESS_TOKEN");
  if (!shopDomain || !token) return { orderId: null, status: "skipped", error: "missing_shopify_env" };

  try {
    const name = orderNumber.startsWith("#") ? orderNumber : `#${orderNumber}`;
    const listUrl = `https://${shopDomain}/admin/api/2025-07/orders.json?name=${encodeURIComponent(name)}&status=any&limit=1`;
    const listRes = await fetch(listUrl, {
      headers: { "X-Shopify-Access-Token": token, "Content-Type": "application/json" },
    });
    if (!listRes.ok) return { orderId: null, status: "failed", error: `list_${listRes.status}` };
    const listJson = await listRes.json();
    const order = listJson?.orders?.[0];
    if (!order?.id) return { orderId: null, status: "failed", error: "order_not_found" };

    const existingNote: string = order.note || "";
    const tag = `WhatsApp opt-in: ${phone} (consent: ${consent ? "yes" : "no"})`;
    if (existingNote.includes(tag)) {
      return { orderId: String(order.id), status: "sent" };
    }
    const newNote = existingNote ? `${existingNote}\n${tag}` : tag;

    const putUrl = `https://${shopDomain}/admin/api/2025-07/orders/${order.id}.json`;
    const putRes = await fetch(putUrl, {
      method: "PUT",
      headers: { "X-Shopify-Access-Token": token, "Content-Type": "application/json" },
      body: JSON.stringify({ order: { id: order.id, note: newNote } }),
    });
    if (!putRes.ok) return { orderId: String(order.id), status: "failed", error: `put_${putRes.status}` };
    return { orderId: String(order.id), status: "sent" };
  } catch (e) {
    return { orderId: null, status: "failed", error: String(e) };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ ok: false, error: "method_not_allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "invalid_json" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) {
    return new Response(
      JSON.stringify({ ok: false, error: "invalid_body", details: parsed.error.flatten() }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const { phone, consent, cartId, orderNumber, source } = parsed.data;
  const normalized = normalizePhone(phone);
  if (!normalized) {
    return new Response(JSON.stringify({ ok: false, error: "invalid_phone" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // Pick conflict target
  let upsertRes;
  const baseRow: Record<string, unknown> = {
    phone: normalized,
    consent,
    cart_id: cartId ?? null,
    shopify_order_number: orderNumber ?? null,
    source,
    updated_at: new Date().toISOString(),
  };

  if (orderNumber) {
    upsertRes = await supabase
      .from("whatsapp_optins")
      .upsert(baseRow, { onConflict: "shopify_order_number" })
      .select()
      .maybeSingle();
  } else if (cartId) {
    upsertRes = await supabase
      .from("whatsapp_optins")
      .upsert(baseRow, { onConflict: "cart_id" })
      .select()
      .maybeSingle();
  } else {
    upsertRes = await supabase
      .from("whatsapp_optins")
      .insert(baseRow)
      .select()
      .maybeSingle();
  }

  if (upsertRes.error) {
    console.error("whatsapp-optin upsert error", upsertRes.error);
    return new Response(JSON.stringify({ ok: false, error: "db_error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Attach to Shopify order if we know the order number
  let noteStatus: "pending" | "sent" | "failed" | "skipped" = "pending";
  if (orderNumber) {
    const attach = await attachShopifyOrderNote(orderNumber, normalized, consent);
    noteStatus = attach.status;
    await supabase
      .from("whatsapp_optins")
      .update({
        shopify_order_id: attach.orderId,
        shopify_note_status: attach.status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", upsertRes.data!.id);
  }

  return new Response(
    JSON.stringify({ ok: true, id: upsertRes.data?.id, shopify_note_status: noteStatus }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
