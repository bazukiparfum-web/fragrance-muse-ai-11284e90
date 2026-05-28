import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-application-name',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const body = await req.json().catch(() => ({}));
    const action = String(body?.action ?? 'list');

    if (action === 'list') {
      const { data: formulas, error } = await admin
        .from('machine_formulas')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(500);
      if (error) throw error;

      const scentIds = Array.from(
        new Set((formulas ?? []).map((f: any) => f.saved_scent_id).filter(Boolean)),
      );
      const codes = (formulas ?? []).map((f: any) => f.fragrance_code).filter(Boolean);

      const [scentsRes, queueRes] = await Promise.all([
        scentIds.length
          ? admin.from('saved_scents').select('id, user_id, name, is_public').in('id', scentIds)
          : Promise.resolve({ data: [], error: null } as any),
        codes.length
          ? admin
              .from('production_queue')
              .select('fragrance_code, status')
              .in('fragrance_code', codes)
          : Promise.resolve({ data: [], error: null } as any),
      ]);

      const userIds = Array.from(
        new Set((scentsRes.data ?? []).map((s: any) => s.user_id).filter(Boolean)),
      );
      const profilesRes = userIds.length
        ? await admin.from('profiles').select('id, email, full_name').in('id', userIds)
        : ({ data: [] } as any);

      const profilesById: Record<string, any> = {};
      for (const p of profilesRes.data ?? []) profilesById[p.id] = p;
      const scentsById: Record<string, any> = {};
      for (const s of scentsRes.data ?? []) scentsById[s.id] = s;

      const queueByCode: Record<string, { total: number; completed: number; pending: number }> = {};
      for (const q of queueRes.data ?? []) {
        const k = q.fragrance_code as string;
        queueByCode[k] ||= { total: 0, completed: 0, pending: 0 };
        queueByCode[k].total++;
        if (q.status === 'completed') queueByCode[k].completed++;
        if (q.status === 'pending' || q.status === 'in_progress') queueByCode[k].pending++;
      }

      return new Response(
        JSON.stringify({ formulas, scents: scentsById, profiles: profilesById, queueByCode }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    if (action === 'requeue') {
      const { fragrance_code, size = '30ml', quantity = 1 } = body;
      if (!fragrance_code) throw new Error('fragrance_code required');

      const { data: formula, error: fErr } = await admin
        .from('machine_formulas')
        .select('*')
        .eq('fragrance_code', fragrance_code)
        .maybeSingle();
      if (fErr) throw fErr;
      if (!formula) throw new Error('Formula not found');

      const { data: inserted, error: iErr } = await admin
        .from('production_queue')
        .insert({
          fragrance_code,
          size,
          quantity,
          status: 'pending',
          formula: formula.notes_formula,
          saved_scent_id: formula.saved_scent_id,
          machine_notes: `Re-queued from Formula Library`,
        })
        .select('id')
        .single();
      if (iErr) throw iErr;

      return new Response(JSON.stringify({ ok: true, id: inserted.id }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error(`Unknown action: ${action}`);
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
