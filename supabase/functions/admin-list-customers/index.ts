import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.95.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-supabase-api-version',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) return json({ error: 'Unauthorized' }, 401);

    const userClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const token = authHeader.replace('Bearer ', '');
    const { data: claims } = await userClient.auth.getClaims(token);
    const callerId = claims?.claims?.sub;
    if (!callerId) return json({ error: 'Unauthorized' }, 401);

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
    if (!roleCheck) return json({ error: 'Forbidden' }, 403);

    const body = await req.json().catch(() => ({}));
    const action = (body.action ?? 'list') as string;

    const { data: adminRoles } = await admin
      .from('user_roles')
      .select('user_id')
      .eq('role', 'admin');
    const adminIds = new Set((adminRoles ?? []).map((r: any) => r.user_id));

    if (action === 'list') {
      const search = (body.search ?? '').trim();
      const filter = (body.filter ?? 'all') as string;
      const dateFrom = body.date_from as string | undefined;
      const dateTo = body.date_to as string | undefined;
      const orderStatus = body.order_status as string | undefined;
      const minSpend = body.min_spend != null ? Number(body.min_spend) : undefined;
      const maxSpend = body.max_spend != null ? Number(body.max_spend) : undefined;
      const city = (body.city ?? '').trim().toLowerCase();
      const sortBy = (body.sort_by ?? 'last_activity') as string;
      const sortDir = (body.sort_dir ?? 'desc') as 'asc' | 'desc';

      let q = admin
        .from('profiles')
        .select('id, email, full_name, phone, created_at')
        .order('created_at', { ascending: false })
        .limit(500);
      if (search)
        q = q.or(
          `email.ilike.%${search}%,full_name.ilike.%${search}%,phone.ilike.%${search}%`,
        );
      const { data: profiles, error } = await q;
      if (error) throw error;

      let rows = (profiles ?? []).filter((p: any) => !adminIds.has(p.id));
      const ids = rows.map((p: any) => p.id);

      const [ordersRes, scentsRes, quizRes] = await Promise.all([
        admin
          .from('orders')
          .select('user_id, total, status, created_at, shipping_address')
          .in('user_id', ids),
        admin.from('saved_scents').select('user_id, created_at').in('user_id', ids),
        admin.from('quiz_responses').select('user_id, created_at').in('user_id', ids),
      ]);

      const ordersFiltered = (ordersRes.data ?? []).filter((o: any) => {
        if (dateFrom && o.created_at < dateFrom) return false;
        if (dateTo && o.created_at > dateTo + 'T23:59:59') return false;
        if (orderStatus && orderStatus !== 'any' && o.status !== orderStatus) return false;
        return true;
      });

      const aggOrders = new Map<string, { count: number; total: number; last: string | null; cities: Set<string> }>();
      for (const o of ordersFiltered) {
        const cur = aggOrders.get(o.user_id) ?? { count: 0, total: 0, last: null, cities: new Set<string>() };
        cur.count += 1;
        cur.total += Number(o.total ?? 0);
        if (!cur.last || (o.created_at && o.created_at > cur.last)) cur.last = o.created_at;
        const c = (o.shipping_address?.city ?? '').toString().toLowerCase();
        if (c) cur.cities.add(c);
        aggOrders.set(o.user_id, cur);
      }
      const aggScents = new Map<string, { count: number; last: string | null }>();
      for (const s of scentsRes.data ?? []) {
        const cur = aggScents.get(s.user_id) ?? { count: 0, last: null };
        cur.count += 1;
        if (!cur.last || (s.created_at && s.created_at > cur.last)) cur.last = s.created_at;
        aggScents.set(s.user_id, cur);
      }
      const aggQuiz = new Map<string, { count: number; last: string | null }>();
      for (const q of quizRes.data ?? []) {
        if (!q.user_id) continue;
        const cur = aggQuiz.get(q.user_id) ?? { count: 0, last: null };
        cur.count += 1;
        if (!cur.last || (q.created_at && q.created_at > cur.last)) cur.last = q.created_at;
        aggQuiz.set(q.user_id, cur);
      }

      let customers = rows.map((p: any) => {
        const o = aggOrders.get(p.id);
        const s = aggScents.get(p.id);
        const qa = aggQuiz.get(p.id);
        const lastActivity =
          [o?.last, s?.last, qa?.last, p.created_at]
            .filter(Boolean)
            .sort()
            .reverse()[0] ?? p.created_at;
        return {
          id: p.id,
          email: p.email,
          full_name: p.full_name,
          phone: p.phone,
          created_at: p.created_at,
          orders_count: o?.count ?? 0,
          orders_total: o?.total ?? 0,
          scents_count: s?.count ?? 0,
          quiz_count: qa?.count ?? 0,
          last_activity: lastActivity,
          cities: o ? Array.from(o.cities) : [],
        };
      });

      if (filter === 'has_orders') customers = customers.filter((c) => c.orders_count > 0);
      else if (filter === 'has_scents') customers = customers.filter((c) => c.scents_count > 0);
      else if (filter === 'quiz_takers') customers = customers.filter((c) => c.quiz_count > 0);

      if (minSpend != null && !isNaN(minSpend))
        customers = customers.filter((c) => c.orders_total >= minSpend);
      if (maxSpend != null && !isNaN(maxSpend))
        customers = customers.filter((c) => c.orders_total <= maxSpend);
      if (city)
        customers = customers.filter((c) => c.cities.some((x: string) => x.includes(city)));
      if (dateFrom || dateTo || (orderStatus && orderStatus !== 'any'))
        customers = customers.filter((c) => c.orders_count > 0);

      const dir = sortDir === 'asc' ? 1 : -1;
      customers.sort((a: any, b: any) => {
        const av = a[sortBy] ?? (typeof b[sortBy] === 'number' ? 0 : '');
        const bv = b[sortBy] ?? (typeof a[sortBy] === 'number' ? 0 : '');
        if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
        return String(av).localeCompare(String(bv)) * dir;
      });
      return json({ customers });
    }

    if (action === 'detail') {
      const id = body.id as string;
      if (!id) throw new Error('id required');

      const { data: profile, error: pErr } = await admin
        .from('profiles')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (pErr) throw pErr;
      if (!profile) throw new Error('Customer not found');

      const [ordersRes, scentsRes, quizRes, referralsRes, rewardsRes, waRes] = await Promise.all([
        admin
          .from('orders')
          .select('*')
          .eq('user_id', id)
          .order('created_at', { ascending: false }),
        admin
          .from('saved_scents')
          .select('*')
          .eq('user_id', id)
          .order('created_at', { ascending: false }),
        admin
          .from('quiz_responses')
          .select('*')
          .eq('user_id', id)
          .order('created_at', { ascending: false })
          .limit(20),
        admin.from('referrals').select('*').eq('referrer_id', id),
        admin.from('referral_rewards').select('*').eq('referrer_id', id),
        profile.phone
          ? admin
              .from('whatsapp_optins')
              .select('consent, created_at')
              .eq('phone', profile.phone)
              .order('created_at', { ascending: false })
              .limit(1)
          : Promise.resolve({ data: [] as any[] }),
      ]);

      const orderIds = (ordersRes.data ?? []).map((o: any) => o.id);
      const { data: items } = orderIds.length
        ? await admin.from('order_items').select('*').in('order_id', orderIds)
        : { data: [] as any[] };
      const itemsByOrder = new Map<string, any[]>();
      for (const it of items ?? []) {
        const arr = itemsByOrder.get(it.order_id) ?? [];
        arr.push(it);
        itemsByOrder.set(it.order_id, arr);
      }
      const orders = (ordersRes.data ?? []).map((o: any) => ({
        ...o,
        items: itemsByOrder.get(o.id) ?? [],
      }));

      return json({
        profile,
        orders,
        scents: scentsRes.data ?? [],
        quiz_responses: quizRes.data ?? [],
        referrals: referralsRes.data ?? [],
        referral_rewards: rewardsRes.data ?? [],
        whatsapp_optin: (waRes as any)?.data?.[0] ?? null,
      });
    }

    throw new Error('Unknown action');
  } catch (e) {
    return json({ error: (e as Error).message }, 400);
  }
});
