import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.95.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const SIZES = ['30ml', '50ml', '100ml'];

function pickRandom<T>(arr: T[], n: number): T[] {
  const copy = [...arr];
  const out: T[] = [];
  for (let i = 0; i < n && copy.length; i++) {
    const idx = Math.floor(Math.random() * copy.length);
    out.push(copy.splice(idx, 1)[0]);
  }
  return out;
}

function randomPercentages(n: number): number[] {
  const raw = Array.from({ length: n }, () => Math.random());
  const sum = raw.reduce((a, b) => a + b, 0);
  const pct = raw.map((v) => Math.round((v / sum) * 100));
  const diff = 100 - pct.reduce((a, b) => a + b, 0);
  pct[0] += diff;
  return pct;
}

function shortCode() {
  return Math.random().toString(36).slice(2, 10).toUpperCase();
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { count = 5 } = await req.json().catch(() => ({}));
    const n = Math.min(Math.max(parseInt(String(count), 10) || 5, 1), 50);

    // Load active mapped notes
    const { data: mappings, error: mapErr } = await admin
      .from('ingredient_mappings')
      .select('note_name')
      .eq('is_active', true);
    if (mapErr) throw mapErr;

    const noteNames = (mappings ?? []).map((m: any) => m.note_name).filter(Boolean);
    if (noteNames.length < 3) throw new Error('Need at least 3 active ingredient mappings to seed');

    const rows = [];
    for (let i = 0; i < n; i++) {
      const noteCount = 3 + Math.floor(Math.random() * 3); // 3..5
      const picked = pickRandom(noteNames, Math.min(noteCount, noteNames.length));
      const pcts = randomPercentages(picked.length);
      const size = SIZES[Math.floor(Math.random() * SIZES.length)];
      const totalVolume = parseInt(size, 10);

      // Split notes across top/heart/base buckets so generate_machine_formula-style consumers work
      const formula = {
        top: picked.slice(0, Math.ceil(picked.length / 3)).map((name, idx) => ({
          name,
          note: name,
          percentage: pcts[idx],
          category: 'top',
        })),
        heart: picked.slice(Math.ceil(picked.length / 3), Math.ceil((picked.length * 2) / 3)).map((name, idx) => ({
          name,
          note: name,
          percentage: pcts[Math.ceil(picked.length / 3) + idx],
          category: 'heart',
        })),
        base: picked.slice(Math.ceil((picked.length * 2) / 3)).map((name, idx) => ({
          name,
          note: name,
          percentage: pcts[Math.ceil((picked.length * 2) / 3) + idx],
          category: 'base',
        })),
        total_volume_ml: totalVolume,
      };

      const intensities = ['low', 'medium', 'high'];
      const longevities = ['2-4 hours', '6-8 hours', '12+ hours'];
      const intensity = intensities[Math.floor(Math.random() * intensities.length)];
      const longevity = longevities[Math.floor(Math.random() * longevities.length)];
      (formula as any).intensity = intensity;
      (formula as any).longevity = longevity;

      rows.push({
        fragrance_code: `DUMMY-${shortCode()}`,
        size,
        quantity: 1,
        status: 'pending',
        formula,
      });
    }

    const { data, error } = await admin.from('production_queue').insert(rows).select('id');
    if (error) throw error;

    return new Response(JSON.stringify({ ok: true, inserted: data?.length ?? 0 }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
