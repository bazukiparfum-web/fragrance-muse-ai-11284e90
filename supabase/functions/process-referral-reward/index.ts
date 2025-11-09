import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { orderId, userId, referralRewardId } = await req.json();

    console.log('Processing referral reward:', { orderId, userId, referralRewardId });

    // Get the referral reward
    const { data: reward, error: rewardError } = await supabase
      .from('referral_rewards')
      .select('*, referrals(*)')
      .eq('id', referralRewardId)
      .single();

    if (rewardError || !reward) {
      throw new Error('Referral reward not found');
    }

    // Check if this is the referee's first order
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (ordersError) throw ordersError;

    const isFirstOrder = orders && orders.length === 1 && orders[0].id === orderId;

    if (!isFirstOrder) {
      console.log('Not first order, skipping referral reward processing');
      return new Response(
        JSON.stringify({ success: false, message: 'Not first order' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Mark referee's discount as used and complete the reward
    const { error: updateError } = await supabase
      .from('referral_rewards')
      .update({
        status: 'completed',
        referee_discount_used: true,
        referee_order_id: orderId,
        completed_at: new Date().toISOString(),
      })
      .eq('id', referralRewardId);

    if (updateError) throw updateError;

    // Create a new reward for the referrer (their discount)
    const { error: referrerRewardError } = await supabase
      .from('referral_rewards')
      .insert({
        referral_id: reward.referral_id,
        referrer_id: reward.referrer_id,
        referee_id: userId,
        status: 'completed',
        referrer_discount_amount: 100,
        referee_discount_amount: 0,
        referrer_discount_used: false,
        completed_at: new Date().toISOString(),
      });

    if (referrerRewardError) throw referrerRewardError;

    // Update referral uses count
    const { error: referralUpdateError } = await supabase
      .from('referrals')
      .update({
        uses_count: (reward.referrals.uses_count || 0) + 1,
      })
      .eq('id', reward.referral_id);

    if (referralUpdateError) throw referralUpdateError;

    // Update fragrance share count if applicable
    if (reward.referrals.fragrance_id) {
      const { data: currentScent } = await supabase
        .from('saved_scents')
        .select('share_count')
        .eq('id', reward.referrals.fragrance_id)
        .single();

      if (currentScent) {
        const { error: fragranceUpdateError } = await supabase
          .from('saved_scents')
          .update({
            share_count: (currentScent.share_count || 0) + 1,
          })
          .eq('id', reward.referrals.fragrance_id);

        if (fragranceUpdateError) {
          console.error('Error updating fragrance share count:', fragranceUpdateError);
        }
      }
    }

    console.log('Referral reward processed successfully');

    return new Response(
      JSON.stringify({ success: true, message: 'Referral reward processed' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error processing referral reward:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
