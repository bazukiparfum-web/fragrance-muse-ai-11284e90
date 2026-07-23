// Creates a Shopify discount code (50% off first order) for a given BZK-XXXX referral code.
// Called after signup with the newly-generated personal code.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { code } = await req.json();
    if (typeof code !== 'string' || !/^BZK-[A-Z0-9]{4}$/.test(code)) {
      return json({ error: 'Invalid code format' }, 400);
    }

    const shopDomain = Deno.env.get('SHOPIFY_STORE_DOMAIN') || '';
    const adminToken =
      Deno.env.get('SHOPIFY_ADMIN_ACCESS_TOKEN') ||
      Deno.env.get('SHOPIFY_ACCESS_TOKEN') || '';

    if (!shopDomain || !adminToken) {
      // Non-blocking: allow signup even if Shopify not fully wired yet
      return json({ ok: false, reason: 'shopify_not_configured' }, 200);
    }

    const apiBase = `https://${shopDomain}/admin/api/2025-07`;

    // 1. Create price rule (50% off, one use per customer, first order)
    const priceRuleRes = await fetch(`${apiBase}/price_rules.json`, {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': adminToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        price_rule: {
          title: code,
          target_type: 'line_item',
          target_selection: 'all',
          allocation_method: 'across',
          value_type: 'percentage',
          value: '-50.0',
          customer_selection: 'all',
          once_per_customer: true,
          usage_limit: 100,
          starts_at: new Date().toISOString(),
          prerequisite_subtotal_range: { greater_than_or_equal_to: '0.00' },
        },
      }),
    });

    if (!priceRuleRes.ok) {
      const errText = await priceRuleRes.text();
      console.error('Price rule create failed', priceRuleRes.status, errText);
      return json({ ok: false, error: errText }, 200);
    }
    const priceRule = (await priceRuleRes.json()).price_rule;

    // 2. Attach discount code
    const codeRes = await fetch(`${apiBase}/price_rules/${priceRule.id}/discount_codes.json`, {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': adminToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ discount_code: { code } }),
    });

    if (!codeRes.ok) {
      const errText = await codeRes.text();
      console.error('Discount code create failed', codeRes.status, errText);
      return json({ ok: false, error: errText }, 200);
    }

    return json({ ok: true, code }, 200);
  } catch (e) {
    console.error('create-referral-shopify-discount error', e);
    return json({ error: e instanceof Error ? e.message : 'Unknown error' }, 500);
  }
});

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
