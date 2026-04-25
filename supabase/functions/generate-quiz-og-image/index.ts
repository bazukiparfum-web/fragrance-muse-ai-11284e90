import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function buildPrompt(name: string, summary: string | null, code: string | null): string {
  const moodLine = summary ? `Mood: ${summary}.` : '';
  return `A luxurious 1200x630 wide social media banner image for the perfume "${name}". ${moodLine} ${code ? `Fragrance code: ${code}.` : ''} Show an elegant glass perfume bottle on a marble surface with soft golden lighting, dramatic shadows, swirling mist, and botanical accents (petals, citrus peel, woody elements). Premium editorial fashion photography style, deep blacks, warm gold accents, BAZUKI luxury brand aesthetic. No text. Cinematic, hyper-detailed.`;
}

async function generateImage(prompt: string, model: string): Promise<string | null> {
  const apiKey = Deno.env.get('LOVABLE_API_KEY');
  if (!apiKey) throw new Error('LOVABLE_API_KEY missing');

  const resp = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      modalities: ['image', 'text'],
    }),
  });

  if (!resp.ok) {
    console.error('AI gateway error', resp.status, await resp.text());
    return null;
  }

  const data = await resp.json();
  const url = data?.choices?.[0]?.message?.images?.[0]?.image_url?.url;
  return url || null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { shareId } = await req.json();
    if (!shareId) {
      return new Response(JSON.stringify({ error: 'shareId required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SERVICE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const admin = createClient(SUPABASE_URL, SERVICE);

    const { data: share, error: shareErr } = await admin
      .from('quiz_result_shares')
      .select('*')
      .eq('id', shareId)
      .single();
    if (shareErr || !share) throw new Error('Share not found');

    const prompt = share.og_image_prompt || buildPrompt(share.fragrance_name, share.summary, share.fragrance_code);

    // Try Pro first, fallback to Flash
    let dataUrl = await generateImage(prompt, 'google/gemini-3-pro-image-preview');
    if (!dataUrl) {
      console.log('Pro model failed, trying flash');
      dataUrl = await generateImage(prompt, 'google/gemini-3.1-flash-image-preview');
    }
    if (!dataUrl) {
      dataUrl = await generateImage(prompt, 'google/gemini-2.5-flash-image');
    }

    if (!dataUrl) {
      await admin.from('quiz_result_shares').update({ og_image_status: 'failed' }).eq('id', shareId);
      return new Response(JSON.stringify({ error: 'Image generation failed' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Decode base64 data URL
    const match = dataUrl.match(/^data:(image\/[a-zA-Z]+);base64,(.+)$/);
    if (!match) throw new Error('Invalid image data URL');
    const contentType = match[1];
    const base64 = match[2];
    const binary = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

    const ext = contentType.split('/')[1] || 'png';
    const path = `${share.token}.${ext}`;

    const { error: upErr } = await admin.storage
      .from('quiz-og-images')
      .upload(path, binary, { contentType, upsert: true });
    if (upErr) throw upErr;

    const { data: pub } = admin.storage.from('quiz-og-images').getPublicUrl(path);

    await admin
      .from('quiz_result_shares')
      .update({ og_image_url: pub.publicUrl, og_image_status: 'ready', og_image_prompt: prompt })
      .eq('id', shareId);

    return new Response(JSON.stringify({ url: pub.publicUrl }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('generate-quiz-og-image error', err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
