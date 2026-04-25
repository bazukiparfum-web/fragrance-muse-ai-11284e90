import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

function shortToken(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let s = '';
  const arr = new Uint8Array(10);
  crypto.getRandomValues(arr);
  for (const b of arr) s += chars[b % chars.length];
  return s;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const ANON = Deno.env.get('SUPABASE_ANON_KEY')!;
    const SERVICE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const userClient = createClient(SUPABASE_URL, ANON, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: authErr } = await userClient.auth.getUser();
    if (authErr || !userData?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const userId = userData.user.id;

    const body = await req.json();
    const { savedScentId, fragranceName, fragranceCode, summary, imagePrompt } = body;
    if (!fragranceName || typeof fragranceName !== 'string') {
      return new Response(JSON.stringify({ error: 'fragranceName required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const admin = createClient(SUPABASE_URL, SERVICE);

    // Reuse if a share already exists for this scent + user
    if (savedScentId) {
      const { data: existing } = await admin
        .from('quiz_result_shares')
        .select('*')
        .eq('saved_scent_id', savedScentId)
        .eq('user_id', userId)
        .maybeSingle();
      if (existing) {
        return new Response(JSON.stringify({ share: existing }), {
          status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    let token2 = shortToken();
    // Ensure unique
    for (let i = 0; i < 5; i++) {
      const { data: c } = await admin.from('quiz_result_shares').select('id').eq('token', token2).maybeSingle();
      if (!c) break;
      token2 = shortToken();
    }

    const { data: inserted, error: insErr } = await admin
      .from('quiz_result_shares')
      .insert({
        token: token2,
        user_id: userId,
        saved_scent_id: savedScentId || null,
        fragrance_name: fragranceName,
        fragrance_code: fragranceCode || null,
        summary: summary || null,
        og_image_prompt: imagePrompt || null,
        og_image_status: 'pending',
      })
      .select()
      .single();

    if (insErr) throw insErr;

    // Fire-and-forget OG image generation
    const fnUrl = `${SUPABASE_URL}/functions/v1/generate-quiz-og-image`;
    fetch(fnUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${SERVICE}` },
      body: JSON.stringify({ shareId: inserted.id }),
    }).catch((e) => console.error('OG generation kickoff failed', e));

    return new Response(JSON.stringify({ share: inserted }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('share-quiz-result error', err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
