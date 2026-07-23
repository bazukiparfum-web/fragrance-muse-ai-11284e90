import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { code, email, order_id } = await req.json();
    if (typeof code !== 'string' || typeof email !== 'string') {
      return json({ error: 'Missing code or email' }, 400);
    }
    const normalizedCode = code.trim().toUpperCase();
    const normalizedEmail = email.trim().toLowerCase();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Cap check
    const { data: openData } = await supabase.rpc('referrals_open');
    if (openData !== true) {
      return json({ valid: false, reason: 'closed' }, 200);
    }

    // Code owner
    const { data: owner } = await supabase
      .from('waitlist_signups')
      .select('email, referral_code')
      .eq('referral_code', normalizedCode)
      .maybeSingle();

    if (!owner) return json({ valid: false, reason: 'invalid' }, 200);
    if (owner.email.toLowerCase() === normalizedEmail) {
      return json({ valid: false, reason: 'self_referral' }, 200);
    }

    // Already redeemed by this email?
    const { data: existing } = await supabase
      .from('referral_redemptions')
      .select('id')
      .eq('redeemer_email', normalizedEmail)
      .maybeSingle();
    if (existing) return json({ valid: false, reason: 'already_redeemed' }, 200);

    // Validation-only
    if (!order_id) return json({ valid: true, discount: 50 }, 200);

    // Commit redemption
    const { error: insertErr } = await supabase.from('referral_redemptions').insert({
      referral_code: normalizedCode,
      redeemer_email: normalizedEmail,
      order_id: String(order_id),
    });
    if (insertErr) {
      if ((insertErr as { code?: string }).code === '23505') {
        return json({ valid: false, reason: 'already_redeemed' }, 200);
      }
      return json({ error: insertErr.message }, 500);
    }

    // Log A/B conversion (redeem) for both parties if either is in a variant.
    try {
      for (const target of [normalizedEmail, owner.email.toLowerCase()]) {
        const { data: wl } = await supabase
          .from('waitlist_signups')
          .select('email_variant')
          .eq('email', target)
          .maybeSingle();
        const v = wl?.email_variant;
        if (v === 'A' || v === 'B') {
          await supabase.from('email_events').insert({
            message_id: `waitlist-confirm-${target}`,
            template_name: 'waitlist-confirmation',
            recipient_email: target,
            variant: v,
            event_type: 'conversion',
            conversion_kind: 'redeem',
            metadata: { order_id: String(order_id), referral_code: normalizedCode },
          });
        }
      }
    } catch (_e) { /* non-blocking */ }

    return json({ valid: true, discount: 50, redeemed: true }, 200);
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : 'Unknown error' }, 500);
  }
});

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
