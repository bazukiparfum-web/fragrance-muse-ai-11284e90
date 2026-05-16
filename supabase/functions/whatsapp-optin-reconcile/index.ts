import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@3.23.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-api-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const BodySchema = z.object({
  cartId: z.string().min(1),
  orderNumber: z.string().min(1),
});

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
    const listRes = await fetch(
      `https://${shopDomain}/admin/api/2025-07/orders.json?name=${encodeURIComponent(name)}&status=any&limit=1`,
      { headers: { "X-Shopify-Access-Token": token, "Content-Type": "application/json" } },
    );
    if (!listRes.ok) return { orderId: null, status: "failed", error: `list_${listRes.status}` };
    const order = (await listRes.json())?.orders?.[0];
    if (!order?.id) return { orderId: null, status: "failed", error: "order_not_found" };
    const tag = `WhatsApp opt-in: ${phone} (consent: ${consent ? "yes" : "no"})`;
    const existing: string = order.note || "";
    if (existing.includes(tag)) return { orderId: String(order.id), status: "sent" };
    const putRes = await fetch(
      `https://${shopDomain}/admin/api/2025-07/orders/${order.id}.json`,
      {
        method: "PUT",
        headers: { "X-Shopify-Access-Token": token, "Content-Type": "application/json" },
        body: JSON.stringify({ order: { id: order.id, note: existing ? `${existing}\n${tag}` : tag } }),
      },
    );
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
  try { json = await req.json(); } catch {
    return new Response(JSON.stringify({ ok: false, error: "invalid_json" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) {
    return new Response(JSON.stringify({ ok: false, error: "invalid_body" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const { cartId, orderNumber } = parsed.data;

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: row, error } = await supabase
    .from("whatsapp_optins")
    .select("id, phone, consent, shopify_order_number")
    .eq("cart_id", cartId)
    .maybeSingle();

  if (error) {
    return new Response(JSON.stringify({ ok: false, error: "db_error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  if (!row) {
    return new Response(JSON.stringify({ ok: true, found: false }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const attach = await attachShopifyOrderNote(orderNumber, row.phone, row.consent);
  await supabase
    .from("whatsapp_optins")
    .update({
      shopify_order_number: orderNumber,
      shopify_order_id: attach.orderId,
      shopify_note_status: attach.status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", row.id);

  return new Response(JSON.stringify({ ok: true, found: true, status: attach.status }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
