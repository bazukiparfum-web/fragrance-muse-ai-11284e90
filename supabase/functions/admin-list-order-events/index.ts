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
    if (!claims?.claims?.sub) {
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
      .eq('user_id', claims.claims.sub)
      .eq('role', 'admin')
      .maybeSingle();
    if (!roleCheck) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { orderId } = await req.json().catch(() => ({}));
    if (!orderId) {
      return new Response(JSON.stringify({ error: 'orderId required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: events, error: evErr } = await admin
      .from('order_events')
      .select('id, event_type, source, metadata, occurred_at')
      .eq('order_id', orderId)
      .order('occurred_at', { ascending: true });
    if (evErr) throw evErr;

    let merged = events ?? [];

    if (merged.length === 0) {
      // Derive a fallback timeline for historical orders
      const { data: order } = await admin
        .from('orders')
        .select('id, created_at, updated_at, status, payment_method, payment_gateway')
        .eq('id', orderId)
        .maybeSingle();

      const { data: queueRows } = await admin
        .from('production_queue')
        .select('id, fragrance_code, size, quantity, created_at')
        .eq('order_id', orderId)
        .order('created_at', { ascending: true });

      const derived: any[] = [];
      if (order) {
        derived.push({
          id: `derived-created-${order.id}`,
          event_type: 'order_created',
          source: 'derived',
          metadata: {
            payment_method: order.payment_method,
            payment_gateway: order.payment_gateway,
          },
          occurred_at: order.created_at,
        });
        if (order.status === 'paid') {
          derived.push({
            id: `derived-paid-${order.id}`,
            event_type: 'payment_received',
            source: 'derived',
            metadata: { payment_method: order.payment_method ?? 'prepaid' },
            occurred_at: order.updated_at ?? order.created_at,
          });
        }
      }
      for (const q of queueRows ?? []) {
        derived.push({
          id: `derived-queue-${q.id}`,
          event_type: 'production_enqueued',
          source: 'derived',
          metadata: {
            queue_item_id: q.id,
            fragrance_code: q.fragrance_code,
            size: q.size,
            quantity: q.quantity,
            payment_method: order?.payment_method ?? 'prepaid',
            trigger: order?.payment_method === 'cod' ? 'orders/create' : 'orders/paid',
          },
          occurred_at: q.created_at,
        });
      }
      derived.sort((a, b) => new Date(a.occurred_at).getTime() - new Date(b.occurred_at).getTime());
      merged = derived;
    }

    return new Response(JSON.stringify({ events: merged }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
