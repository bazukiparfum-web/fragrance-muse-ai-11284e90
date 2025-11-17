import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SHOPIFY_STORE_DOMAIN = 'fragrance-muse-ai-vq4z1.myshopify.com';
const SHOPIFY_API_VERSION = '2025-07';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { referralRewardId, discountAmount } = await req.json();
    console.log('Creating Shopify discount for referral reward:', referralRewardId);

    // Get the referral reward
    const { data: reward, error: rewardError } = await supabaseClient
      .from('referral_rewards')
      .select('*, referrals(*)')
      .eq('id', referralRewardId)
      .single();

    if (rewardError || !reward) {
      return new Response(
        JSON.stringify({ error: 'Referral reward not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate unique discount code
    const discountCode = `FRIEND${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Create Shopify price rule
    const priceRuleData = {
      price_rule: {
        title: `Referral Discount - ${discountCode}`,
        target_type: 'line_item',
        target_selection: 'all',
        allocation_method: 'across',
        value_type: 'fixed_amount',
        value: `-${discountAmount}`,
        customer_selection: 'all',
        once_per_customer: true,
        usage_limit: 1,
        starts_at: new Date().toISOString(),
      },
    };

    const priceRuleResponse = await fetch(
      `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/price_rules.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': Deno.env.get('SHOPIFY_ACCESS_TOKEN') ?? '',
        },
        body: JSON.stringify(priceRuleData),
      }
    );

    if (!priceRuleResponse.ok) {
      const errorText = await priceRuleResponse.text();
      console.error('Shopify price rule error:', errorText);
      throw new Error(`Failed to create price rule: ${errorText}`);
    }

    const { price_rule } = await priceRuleResponse.json();

    // Create discount code
    const discountCodeData = {
      discount_code: {
        code: discountCode,
        usage_count: 0,
      },
    };

    const discountResponse = await fetch(
      `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/price_rules/${price_rule.id}/discount_codes.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': Deno.env.get('SHOPIFY_ACCESS_TOKEN') ?? '',
        },
        body: JSON.stringify(discountCodeData),
      }
    );

    if (!discountResponse.ok) {
      const errorText = await discountResponse.text();
      console.error('Shopify discount code error:', errorText);
      throw new Error(`Failed to create discount code: ${errorText}`);
    }

    const { discount_code } = await discountResponse.json();

    console.log('Successfully created Shopify discount:', discountCode);

    return new Response(
      JSON.stringify({
        discountCode: discount_code.code,
        priceRuleId: price_rule.id,
        discountCodeId: discount_code.id,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in create-referral-discount:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
