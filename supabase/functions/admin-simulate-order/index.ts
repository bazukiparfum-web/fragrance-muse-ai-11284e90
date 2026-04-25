import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.95.0';
import { corsHeaders } from 'https://esm.sh/@supabase/supabase-js@2.95.0/cors';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const token = authHeader.replace('Bearer ', '');
    const { data: claims } = await userClient.auth.getClaims(token);
    const callerId = claims?.claims?.sub;
    if (!callerId) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: roleCheck } = await admin
      .from('user_roles')
      .select('role')
      .eq('user_id', callerId)
      .eq('role', 'admin')
      .maybeSingle();
    if (!roleCheck) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { savedScentId, size = '30ml', quantity = 1 } = await req.json();
    if (!savedScentId) throw new Error('savedScentId required');

    const { data: scent, error: scentErr } = await admin
      .from('saved_scents')
      .select('id, user_id, name, fragrance_code, formula')
      .eq('id', savedScentId)
      .maybeSingle();
    if (scentErr || !scent) throw new Error('Scent not found');
    if (!scent.fragrance_code) throw new Error('Scent missing fragrance_code');

    const orderNumber = `TEST-${Date.now().toString(36).toUpperCase()}`;
    const total = 700 * quantity;

    const { data: order, error: orderErr } = await admin
      .from('orders')
      .insert({
        user_id: scent.user_id,
        order_number: orderNumber,
        status: 'paid',
        subtotal: total,
        delivery_fee: 0,
        total,
        delivery_type: 'standard',
        shipping_address: { test: true, note: 'Synthetic admin order' },
      })
      .select()
      .single();
    if (orderErr) throw orderErr;

    const { data: queue, error: qErr } = await admin
      .from('production_queue')
      .insert({
        order_id: order.id,
        saved_scent_id: scent.id,
        fragrance_code: scent.fragrance_code,
        size,
        quantity,
        formula: scent.formula,
        status: 'pending',
        machine_notes: 'Created by admin manual testing flow',
      })
      .select()
      .single();
    if (qErr) throw qErr;

    return new Response(
      JSON.stringify({ orderId: order.id, orderNumber, queueId: queue.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
