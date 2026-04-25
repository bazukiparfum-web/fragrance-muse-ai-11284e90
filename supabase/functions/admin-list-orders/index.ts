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

    const { search = '', status = 'all', page = 0, pageSize = 20 } = await req.json().catch(() => ({}));
    const from = page * pageSize;
    const to = from + pageSize - 1;

    let query = admin
      .from('orders')
      .select('id, order_number, shopify_order_number, total, status, created_at, user_id')
      .order('created_at', { ascending: false })
      .range(from, to);

    if (status !== 'all') query = query.eq('status', status);
    if (search) query = query.or(`order_number.ilike.%${search}%,shopify_order_number.ilike.%${search}%`);

    const { data: orders, error } = await query;
    if (error) throw error;

    const userIds = [...new Set((orders ?? []).map((o: any) => o.user_id).filter(Boolean))];
    const { data: profiles } = await admin
      .from('profiles')
      .select('id, email')
      .in('id', userIds);
    const emailMap = new Map((profiles ?? []).map((p: any) => [p.id, p.email]));

    const enriched = (orders ?? []).map((o: any) => ({
      ...o,
      user_email: emailMap.get(o.user_id) ?? null,
    }));

    return new Response(JSON.stringify({ orders: enriched }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
