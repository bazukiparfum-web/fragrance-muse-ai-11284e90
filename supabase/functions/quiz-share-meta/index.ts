import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const DEFAULT_OG = 'https://lovable.dev/opengraph-image-p98pqg.png';
const SITE_BASE = 'https://bazukifragrance.com';

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function isCrawler(ua: string): boolean {
  if (!ua) return false;
  const bots = /facebook|twitter|linkedin|slack|discord|whatsapp|telegram|pinterest|google|bing|bot|crawler|spider|preview|embed/i;
  return bots.test(ua);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    // Token from query ?t= or last path segment
    const token = url.searchParams.get('t') || url.pathname.split('/').filter(Boolean).pop();
    if (!token) {
      return new Response('Missing token', { status: 400, headers: corsHeaders });
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SERVICE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const admin = createClient(SUPABASE_URL, SERVICE);

    const { data: share } = await admin
      .from('quiz_result_shares')
      .select('*')
      .eq('token', token)
      .maybeSingle();

    const targetUrl = share?.saved_scent_id
      ? `${SITE_BASE}/collection/${share.saved_scent_id}`
      : `${SITE_BASE}/shop/quiz/results?share=${token}`;

    const ua = req.headers.get('user-agent') || '';

    // For real users: 302 redirect to actual app
    if (!isCrawler(ua)) {
      return Response.redirect(targetUrl, 302);
    }

    const title = share ? `${share.fragrance_name} — My BAZUKI Fragrance` : 'BAZUKI Custom Fragrance';
    const description = share?.summary
      ? share.summary
      : 'Discover my AI-personalized perfume from BAZUKI. Take the quiz to find yours.';
    const ogImage = share?.og_image_status === 'ready' && share.og_image_url ? share.og_image_url : DEFAULT_OG;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:image" content="${escapeHtml(ogImage)}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:url" content="${escapeHtml(targetUrl)}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${escapeHtml(ogImage)}" />
  <meta http-equiv="refresh" content="0; url=${escapeHtml(targetUrl)}" />
</head>
<body>
  <p>Redirecting to <a href="${escapeHtml(targetUrl)}">${escapeHtml(title)}</a>…</p>
</body>
</html>`;

    return new Response(html, {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=300' },
    });
  } catch (err) {
    console.error('quiz-share-meta error', err);
    return new Response('Server error', { status: 500, headers: corsHeaders });
  }
});
