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

    const {
      search = '',
      utmSource = 'all',
      referralCode = '',
      from: fromDate = null,
      to: toDate = null,
      page = 0,
      pageSize = 50,
      all = false,
    } = await req.json().catch(() => ({}));

    let query = admin
      .from('waitlist_signups')
      .select('id, email, phone, utm_source, referral_code, created_at', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (utmSource !== 'all') {
      if (utmSource === '__none__') query = query.is('utm_source', null);
      else query = query.eq('utm_source', utmSource);
    }
    if (referralCode) query = query.ilike('referral_code', `%${referralCode}%`);
    if (search) query = query.ilike('email', `%${search}%`);
    if (fromDate) query = query.gte('created_at', fromDate);
    if (toDate) query = query.lte('created_at', toDate);

    if (!all) {
      const start = page * pageSize;
      const end = start + pageSize - 1;
      query = query.range(start, end);
    } else {
      query = query.limit(10000);
    }

    const { data: rows, error, count } = await query;
    if (error) throw error;

    // Distinct utm_sources for filter dropdown (cheap: table is small).
    const { data: distinctRows } = await admin
      .from('waitlist_signups')
      .select('utm_source')
      .limit(5000);
    const utmSources = Array.from(
      new Set((distinctRows ?? []).map((r: any) => r.utm_source).filter(Boolean)),
    ).sort();

    return new Response(
      JSON.stringify({ rows: rows ?? [], count: count ?? 0, utmSources }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
