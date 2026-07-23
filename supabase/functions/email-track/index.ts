import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

// 1x1 transparent GIF
const PIXEL = Uint8Array.from([
  0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00, 0x80, 0x00, 0x00,
  0x00, 0x00, 0x00, 0xff, 0xff, 0xff, 0x21, 0xf9, 0x04, 0x01, 0x00, 0x00, 0x00,
  0x00, 0x2c, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0x02, 0x02,
  0x44, 0x01, 0x00, 0x3b,
])

const ALLOWED_HOSTS = new Set([
  'bazukifragrance.com',
  'www.bazukifragrance.com',
  'fragrance-muse-ai.lovable.app',
  'id-preview--594f5be5-d338-466d-a59a-bd7af563f183.lovable.app',
  'wa.me',
  'api.whatsapp.com',
])

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
)

const extractEmailFromMid = (mid: string | null): string | null => {
  if (!mid) return null
  // waitlist-confirm-<email>
  const m = mid.match(/^waitlist-confirm-(.+)$/i)
  return m ? m[1].toLowerCase() : null
}

const resolveVariant = async (
  provided: string | null,
  template: string,
  email: string | null,
): Promise<'A' | 'B' | null> => {
  if (provided === 'A' || provided === 'B') return provided
  if (!email) return null
  if (template === 'waitlist-confirmation') {
    const { data } = await supabase
      .from('waitlist_signups')
      .select('email_variant')
      .eq('email', email)
      .maybeSingle()
    const v = data?.email_variant
    return v === 'A' || v === 'B' ? v : null
  }
  return null
}

const logEvent = async (row: {
  message_id: string | null
  template_name: string
  recipient_email: string
  variant: 'A' | 'B' | null
  event_type: 'open' | 'click' | 'conversion'
  conversion_kind?: 'share' | 'redeem' | 'return_visit' | null
  metadata?: Record<string, unknown>
}) => {
  try {
    await supabase.from('email_events').insert({
      message_id: row.message_id,
      template_name: row.template_name,
      recipient_email: row.recipient_email,
      variant: row.variant,
      event_type: row.event_type,
      conversion_kind: row.conversion_kind ?? null,
      metadata: row.metadata ?? {},
    })
  } catch (e) {
    console.warn('[email-track] insert failed', (e as Error).message)
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  const url = new URL(req.url)
  const action = url.searchParams.get('a') || ''
  const template = (url.searchParams.get('t') || '').slice(0, 64)
  const mid = url.searchParams.get('mid')
  const providedV = url.searchParams.get('v')

  // ---------- GET: open pixel ----------
  if (req.method === 'GET' && action === 'open') {
    const email = extractEmailFromMid(mid)
    if (template && email) {
      const variant = await resolveVariant(providedV, template, email)
      await logEvent({
        message_id: mid,
        template_name: template,
        recipient_email: email,
        variant,
        event_type: 'open',
      })
    }
    return new Response(PIXEL, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-store, no-cache, must-revalidate, private',
        'Pragma': 'no-cache',
      },
    })
  }

  // ---------- GET: click redirect ----------
  if (req.method === 'GET' && action === 'click') {
    const target = url.searchParams.get('u') || ''
    let safeTarget = 'https://www.bazukifragrance.com/home'
    try {
      const parsed = new URL(target)
      if (ALLOWED_HOSTS.has(parsed.host)) safeTarget = parsed.toString()
    } catch { /* ignore */ }

    const email = extractEmailFromMid(mid)
    if (template && email) {
      const variant = await resolveVariant(providedV, template, email)
      await logEvent({
        message_id: mid,
        template_name: template,
        recipient_email: email,
        variant,
        event_type: 'click',
        metadata: { target: safeTarget },
      })
    }

    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        Location: safeTarget,
        'Cache-Control': 'no-store',
      },
    })
  }

  // ---------- POST: conversion log ----------
  if (req.method === 'POST') {
    try {
      const body = await req.json().catch(() => ({}))
      const templateName = String(body.template_name || '').slice(0, 64)
      const email = String(body.recipient_email || '').trim().toLowerCase().slice(0, 255)
      const kind = body.conversion_kind as ('share' | 'redeem' | 'return_visit' | undefined)
      const bMid = body.message_id ? String(body.message_id).slice(0, 128) : null
      if (!templateName || !email || !kind) {
        return new Response(JSON.stringify({ error: 'Missing fields' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      const variant = await resolveVariant(
        typeof body.variant === 'string' ? body.variant : null,
        templateName,
        email,
      )
      // Only record if we can associate a variant — otherwise it's noise.
      if (!variant) {
        return new Response(JSON.stringify({ ok: true, skipped: 'no_variant' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      await logEvent({
        message_id: bMid,
        template_name: templateName,
        recipient_email: email,
        variant,
        event_type: 'conversion',
        conversion_kind: kind,
        metadata: typeof body.metadata === 'object' && body.metadata ? body.metadata : {},
      })
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    } catch (e) {
      return new Response(JSON.stringify({ error: (e as Error).message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
  }

  return new Response('Not found', { status: 404, headers: corsHeaders })
})
