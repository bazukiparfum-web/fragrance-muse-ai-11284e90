import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.95.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const VALID_SIZES = new Set(['30ml', '50ml', '100ml']);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const body = await req.json();
    const rows = Array.isArray(body?.rows) ? body.rows : [];
    if (!rows.length) throw new Error('No rows supplied');

    const errors: { row: number; error: string }[] = [];
    const valid: any[] = [];

    rows.forEach((r: any, i: number) => {
      const code = String(r.fragrance_code ?? '').trim();
      const size = String(r.size ?? '').trim();
      let formula = r.formula;

      if (typeof formula === 'string') {
        try {
          formula = JSON.parse(formula);
        } catch {
          errors.push({ row: i + 1, error: 'formula is not valid JSON' });
          return;
        }
      }

      if (!code) return errors.push({ row: i + 1, error: 'fragrance_code required' });
      if (!VALID_SIZES.has(size)) return errors.push({ row: i + 1, error: `size must be 30ml/50ml/100ml (got "${size}")` });
      if (!formula || typeof formula !== 'object') return errors.push({ row: i + 1, error: 'formula required' });

      valid.push({
        fragrance_code: code,
        size,
        quantity: Math.max(parseInt(String(r.quantity ?? 1), 10) || 1, 1),
        status: 'pending',
        formula,
        machine_notes: r.machine_notes ? String(r.machine_notes) : null,
      });
    });

    let inserted = 0;
    if (valid.length) {
      const { data, error } = await admin.from('production_queue').insert(valid).select('id');
      if (error) throw error;
      inserted = data?.length ?? 0;
    }

    return new Response(JSON.stringify({ ok: true, inserted, errors }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
