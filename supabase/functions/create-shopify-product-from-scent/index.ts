// Returns Shopify variant IDs for the shared "Custom AI Fragrance" placeholder
// product so custom-scent Add-to-Cart and Reorder work without an Admin API
// token. Cart + checkout flow uses the Storefront API (already configured via
// Lovable's native Shopify integration). The per-scent formula/metadata stays
// in our DB (saved_scents + machine_formulas); the production-queue webhook
// matches orders back to scents via saved_scent_id mapping rather than via a
// unique Shopify product per scent.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-supabase-api-version',
};

// Shared placeholder product — created once via Lovable's Shopify integration.
const SHARED_PRODUCT_ID = '15151907864940';
const SHARED_VARIANTS = [
  { id: '53827401810284', size: '30ml', price: '700.00' },
  { id: '53827401843052', size: '50ml', price: '1099.00' },
  { id: '53827401875820', size: '100ml', price: '1899.00' },
];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ANON_TEST_USER_ID = '00000000-0000-0000-0000-000000000000';
    const authHeader = req.headers.get('Authorization');

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Resolve user — fall back to anon test user when auth is bypassed.
    let userId: string = ANON_TEST_USER_ID;
    let useAdmin = true;

    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabaseAdmin.auth.getUser(token);
      if (user) {
        userId = user.id;
        useAdmin = false;
      }
    }

    const body = await req.json();
    let { scentId } = body as { scentId?: string };
    const scentPayload = (body as any).scent;

    const isUUID = (s: unknown): s is string =>
      typeof s === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);

    // If no UUID scentId, create the saved_scent server-side (bypasses RLS via service role).
    if (!isUUID(scentId)) {
      if (!scentPayload || !scentPayload.name || !scentPayload.formula) {
        return new Response(
          JSON.stringify({ error: 'Missing scent payload (name + formula required when scentId is not provided).' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const { data: inserted, error: insertError } = await supabaseAdmin
        .from('saved_scents')
        .insert([{
          user_id: userId,
          name: scentPayload.name,
          formula: scentPayload.formula,
          match_score: scentPayload.match_score ?? scentPayload.matchScore ?? null,
          intensity: scentPayload.intensity ?? null,
          longevity: scentPayload.longevity ?? null,
          prices: scentPayload.prices ?? null,
          formulation_notes: scentPayload.formulation_notes ?? scentPayload.formulationNotes ?? null,
          quiz_answers: scentPayload.quiz_answers ?? scentPayload.quizAnswers ?? null,
        }])
        .select('id, name, shopify_product_id')
        .single();

      if (insertError || !inserted) {
        console.error('[custom-scent] insert failed:', insertError);
        return new Response(
          JSON.stringify({ error: 'Failed to save scent: ' + (insertError?.message ?? 'unknown') }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      scentId = inserted.id;
    }

    console.log('[custom-scent] resolving variants for scent:', scentId, 'user:', userId);

    // Verify the scent exists (skip user filter in bypass mode for E2E testing).
    let query = supabaseAdmin.from('saved_scents').select('id, name, shopify_product_id').eq('id', scentId);
    if (!useAdmin) query = query.eq('user_id', userId);
    const { data: scent, error: scentError } = await query.maybeSingle();

    if (scentError) {
      return new Response(
        JSON.stringify({ error: 'Database error: ' + scentError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    if (!scent) {
      return new Response(
        JSON.stringify({ error: 'Scent not found. Please make sure the scent is saved first.' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }


    // Track the shared product id on the scent (helps webhook / production queue
    // mapping). Best-effort — don't fail the request if this write is blocked.
    if (scent.shopify_product_id !== SHARED_PRODUCT_ID) {
      await supabaseAdmin
        .from('saved_scents')
        .update({ shopify_product_id: SHARED_PRODUCT_ID })
        .eq('id', scentId);
    }

    return new Response(
      JSON.stringify({
        productId: `gid://shopify/Product/${SHARED_PRODUCT_ID}`,
        variantIds: SHARED_VARIANTS.map((v) => ({
          id: `gid://shopify/ProductVariant/${v.id}`,
          size: v.size,
          price: v.price,
        })),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in create-shopify-product-from-scent:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
