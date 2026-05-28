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
    const { id, ids, status, action } = body ?? {};
    const allowed = ['pending', 'in_progress', 'completed', 'failed'];

    // Bulk delete dummy jobs
    if (action === 'delete_dummy') {
      const targetIds: string[] = Array.isArray(ids) ? ids : [];
      if (!targetIds.length) throw new Error('No ids provided');
      const { data: rows, error: fetchErr } = await admin
        .from('production_queue')
        .select('id, fragrance_code')
        .in('id', targetIds);
      if (fetchErr) throw fetchErr;
      const dummyIds = (rows ?? [])
        .filter((r: any) => typeof r.fragrance_code === 'string' && r.fragrance_code.startsWith('DUMMY-'))
        .map((r: any) => r.id);
      if (dummyIds.length) {
        const { error: delErr } = await admin.from('production_queue').delete().in('id', dummyIds);
        if (delErr) throw delErr;
      }
      return new Response(JSON.stringify({ ok: true, deleted: dummyIds.length }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!allowed.includes(status)) throw new Error('Invalid status');

    const update: any = { status };
    if (status === 'in_progress') update.started_at = new Date().toISOString();
    if (status === 'completed' || status === 'failed') update.completed_at = new Date().toISOString();

    // Bulk status update
    if (Array.isArray(ids) && ids.length) {
      const { error } = await admin.from('production_queue').update(update).in('id', ids);
      if (error) throw error;
      return new Response(JSON.stringify({ ok: true, updated: ids.length }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!id) throw new Error('Missing id');
    const { error } = await admin.from('production_queue').update(update).eq('id', id);
    if (error) throw error;

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
