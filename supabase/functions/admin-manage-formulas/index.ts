import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-application-name',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Deep equality for plain JSON
function jsonEq(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const userClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: claims } = await userClient.auth.getClaims(authHeader.replace('Bearer ', ''));
    const callerId = claims?.claims?.sub;
    if (!callerId) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    const { data: roleCheck } = await admin.from('user_roles').select('role').eq('user_id', callerId).eq('role', 'admin').maybeSingle();
    if (!roleCheck) return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

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

    if (action === 'import_preview') {
      const incoming: any[] = Array.isArray(body?.formulas) ? body.formulas : [];
      if (!incoming.length) throw new Error('No formulas in payload');

      const codes = incoming.map((f) => String(f.fragrance_code || '').trim()).filter(Boolean);
      const { data: existing, error } = await admin
        .from('machine_formulas')
        .select('*')
        .in('fragrance_code', codes);
      if (error) throw error;

      const byCode: Record<string, any> = {};
      for (const e of existing ?? []) byCode[e.fragrance_code] = e;

      const newRows: any[] = [];
      const updatedRows: any[] = [];
      const unchangedRows: any[] = [];
      const invalidRows: { fragrance_code: string; reason: string }[] = [];

      for (const f of incoming) {
        const code = String(f.fragrance_code || '').trim();
        if (!code) {
          invalidRows.push({ fragrance_code: '(missing)', reason: 'fragrance_code is required' });
          continue;
        }
        if (!f.formula_name) {
          invalidRows.push({ fragrance_code: code, reason: 'formula_name is required' });
          continue;
        }
        if (!f.notes_formula || typeof f.notes_formula !== 'object') {
          invalidRows.push({ fragrance_code: code, reason: 'notes_formula missing' });
          continue;
        }
        const vol = Number(f.total_volume_ml ?? 30);
        if (!Number.isFinite(vol) || vol <= 0) {
          invalidRows.push({ fragrance_code: code, reason: 'total_volume_ml invalid' });
          continue;
        }

        const cur = byCode[code];
        if (!cur) {
          newRows.push({ ...f, fragrance_code: code, total_volume_ml: vol });
        } else {
          const diff: Record<string, { from: any; to: any }> = {};
          if (cur.formula_name !== f.formula_name) diff.formula_name = { from: cur.formula_name, to: f.formula_name };
          if (Number(cur.total_volume_ml) !== vol) diff.total_volume_ml = { from: cur.total_volume_ml, to: vol };
          if (!jsonEq(cur.notes_formula, f.notes_formula)) diff.notes_formula = { from: cur.notes_formula, to: f.notes_formula };
          if (f.pump_instructions && !jsonEq(cur.pump_instructions, f.pump_instructions)) {
            diff.pump_instructions = { from: cur.pump_instructions, to: f.pump_instructions };
          }
          if (Object.keys(diff).length === 0) {
            unchangedRows.push({ fragrance_code: code });
          } else {
            updatedRows.push({
              fragrance_code: code,
              current_version: cur.version,
              diff,
              incoming: { ...f, fragrance_code: code, total_volume_ml: vol },
            });
          }
        }
      }

      return new Response(
        JSON.stringify({ new: newRows, updated: updatedRows, unchanged: unchangedRows, invalid: invalidRows }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    if (action === 'import_apply') {
      const incoming: any[] = Array.isArray(body?.formulas) ? body.formulas : [];
      const resolutions: Record<string, 'apply' | 'skip'> = body?.resolutions ?? {};
      if (!incoming.length) throw new Error('No formulas in payload');

      const codes = incoming.map((f) => String(f.fragrance_code || '').trim()).filter(Boolean);
      const { data: existing, error: eErr } = await admin
        .from('machine_formulas')
        .select('fragrance_code, version')
        .in('fragrance_code', codes);
      if (eErr) throw eErr;
      const versionByCode: Record<string, number> = {};
      for (const e of existing ?? []) versionByCode[e.fragrance_code] = e.version ?? 1;

      let inserted = 0, updated = 0, skipped = 0, failed = 0;
      const errors: string[] = [];

      for (const f of incoming) {
        const code = String(f.fragrance_code || '').trim();
        const decision = resolutions[code] ?? 'apply';
        if (decision === 'skip') { skipped++; continue; }

        const isUpdate = code in versionByCode;
        const nextVersion = isUpdate ? (versionByCode[code] + 1) : 1;

        const row: any = {
          fragrance_code: code,
          formula_name: f.formula_name,
          total_volume_ml: Number(f.total_volume_ml ?? 30),
          notes_formula: f.notes_formula,
          version: nextVersion,
          updated_at: new Date().toISOString(),
        };
        if (f.pump_instructions) row.pump_instructions = f.pump_instructions;
        if (f.ingredients_formula) row.ingredients_formula = f.ingredients_formula;
        if (f.saved_scent_id) row.saved_scent_id = f.saved_scent_id;

        const { error: uErr } = await admin
          .from('machine_formulas')
          .upsert(row, { onConflict: 'fragrance_code' });
        if (uErr) {
          failed++;
          errors.push(`${code}: ${uErr.message}`);
        } else if (isUpdate) {
          updated++;
        } else {
          inserted++;
        }
      }

      return new Response(JSON.stringify({ inserted, updated, skipped, failed, errors }), {
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
