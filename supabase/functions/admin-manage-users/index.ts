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

    const body = await req.json();
    const action = body.action as string;

    if (action === 'list') {
      const search = (body.search ?? '').trim();
      let q = admin.from('profiles').select('id, email, full_name').limit(50);
      if (search) q = q.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`);
      const { data: profiles, error } = await q;
      if (error) throw error;

      const ids = (profiles ?? []).map((p: any) => p.id);
      const { data: roles } = await admin
        .from('user_roles')
        .select('user_id, role')
        .in('user_id', ids)
        .eq('role', 'admin');
      const adminSet = new Set((roles ?? []).map((r: any) => r.user_id));

      return new Response(
        JSON.stringify({
          users: (profiles ?? []).map((p: any) => ({ ...p, is_admin: adminSet.has(p.id) })),
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    if (action === 'grant_admin' || action === 'revoke_admin') {
      const userId = body.userId as string;
      if (!userId) throw new Error('userId required');
      if (action === 'revoke_admin' && userId === callerId) {
        throw new Error('Cannot revoke your own admin role');
      }
      if (action === 'grant_admin') {
        const { error } = await admin
          .from('user_roles')
          .insert({ user_id: userId, role: 'admin' });
        if (error && !error.message.includes('duplicate')) throw error;
      } else {
        const { error } = await admin
          .from('user_roles')
          .delete()
          .eq('user_id', userId)
          .eq('role', 'admin');
        if (error) throw error;
      }
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error('Unknown action');
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
