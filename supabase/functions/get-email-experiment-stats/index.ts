import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const authHeader = req.headers.get('Authorization') || ''
    if (!authHeader.startsWith('Bearer ')) {
      return json({ error: 'Unauthorized' }, 401)
    }

    const admin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )
    const anon = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } },
    )

    const token = authHeader.replace('Bearer ', '')
    const { data: claimsData, error: claimsErr } = await anon.auth.getClaims(token)
    if (claimsErr || !claimsData?.claims?.sub) return json({ error: 'Unauthorized' }, 401)

    const { data: isAdmin } = await admin
      .from('user_roles')
      .select('role')
      .eq('user_id', claimsData.claims.sub)
      .eq('role', 'admin')
      .maybeSingle()
    if (!isAdmin) return json({ error: 'Forbidden' }, 403)

    const body = await req.json().catch(() => ({}))
    const template = String(body.template_name || 'waitlist-confirmation').slice(0, 64)
    const days = Number(body.days) > 0 ? Math.min(365, Number(body.days)) : null // null = all-time

    const since = days ? new Date(Date.now() - days * 86400000).toISOString() : null

    // Assigned counts per variant (from waitlist_signups.email_variant)
    let assignedQ = admin
      .from('waitlist_signups')
      .select('email_variant, email, created_at')
      .not('email_variant', 'is', null)
    if (since) assignedQ = assignedQ.gte('created_at', since)
    const { data: assignedRows, error: assignedErr } = await assignedQ
    if (assignedErr) return json({ error: assignedErr.message }, 500)

    const assigned = { A: 0, B: 0 }
    const emailToVariant = new Map<string, 'A' | 'B'>()
    for (const r of assignedRows ?? []) {
      const v = r.email_variant as 'A' | 'B' | null
      if (v === 'A' || v === 'B') {
        assigned[v]++
        emailToVariant.set((r.email as string).toLowerCase(), v)
      }
    }

    // Sent counts — deduped by message_id from email_send_log where status='sent'
    let sentQ = admin
      .from('email_send_log')
      .select('message_id, recipient_email, status, created_at')
      .eq('template_name', template)
      .in('status', ['sent', 'pending'])
    if (since) sentQ = sentQ.gte('created_at', since)
    const { data: sendRows } = await sentQ
    const sentByVariant = { A: 0, B: 0 }
    const seenMid = new Set<string>()
    for (const r of sendRows ?? []) {
      const mid = r.message_id as string | null
      if (!mid || seenMid.has(mid)) continue
      seenMid.add(mid)
      const email = ((r.recipient_email as string) || '').toLowerCase()
      const v = emailToVariant.get(email)
      if (v) sentByVariant[v]++
    }

    // Events
    let evQ = admin
      .from('email_events')
      .select('variant, event_type, conversion_kind, recipient_email, created_at')
      .eq('template_name', template)
    if (since) evQ = evQ.gte('created_at', since)
    const { data: evRows } = await evQ

    const opens = { A: new Set<string>(), B: new Set<string>() }
    const clicks = { A: new Set<string>(), B: new Set<string>() }
    const conversions = {
      A: { total: new Set<string>(), share: 0, redeem: 0, return_visit: 0 },
      B: { total: new Set<string>(), share: 0, redeem: 0, return_visit: 0 },
    }

    for (const e of evRows ?? []) {
      const v = e.variant as 'A' | 'B' | null
      if (v !== 'A' && v !== 'B') continue
      const email = ((e.recipient_email as string) || '').toLowerCase()
      if (e.event_type === 'open') opens[v].add(email)
      else if (e.event_type === 'click') clicks[v].add(email)
      else if (e.event_type === 'conversion') {
        conversions[v].total.add(email)
        const k = e.conversion_kind as 'share' | 'redeem' | 'return_visit' | null
        if (k === 'share') conversions[v].share++
        else if (k === 'redeem') conversions[v].redeem++
        else if (k === 'return_visit') conversions[v].return_visit++
      }
    }

    const build = (v: 'A' | 'B') => ({
      assigned: assigned[v],
      sent: sentByVariant[v],
      opens: opens[v].size,
      clicks: clicks[v].size,
      conversions: conversions[v].total.size,
      breakdown: {
        share: conversions[v].share,
        redeem: conversions[v].redeem,
        return_visit: conversions[v].return_visit,
      },
      open_rate: sentByVariant[v] ? opens[v].size / sentByVariant[v] : 0,
      click_rate: sentByVariant[v] ? clicks[v].size / sentByVariant[v] : 0,
      conversion_rate: sentByVariant[v] ? conversions[v].total.size / sentByVariant[v] : 0,
    })

    return json({ template, days, variants: { A: build('A'), B: build('B') } })
  } catch (e) {
    return json({ error: (e as Error).message }, 500)
  }
})

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}
