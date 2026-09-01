// Waitlist drip scheduler. Runs on cron and dispatches Day 3, Day 8,
// One-Week-Out (Aug 22), and Final Call (Aug 28) emails to
// waitlist signups. Idempotency keys prevent duplicate sends.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { sendTemplateEmailLogged } from '../_shared/transactional-email-templates/send-and-log.ts'


const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const CTA_URL = 'https://www.bazukifragrance.com/shop/quiz'
const HOME_URL = 'https://www.bazukifragrance.com/home'
const WEEK_OUT_DATE = '2026-08-22'
const FINAL_CALL_DATE = '2026-08-28'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  )

  const today = new Date().toISOString().slice(0, 10)
  const now = new Date()
  const iso = (d: Date) => d.toISOString()

  const stats = { day3: 0, day8: 0, weekOut: 0, finalCall: 0, skipped: 0, errors: 0 }

  const send = async (
    templateName: string,
    email: string,
    idempotencyKey: string,
    templateData: Record<string, unknown>,
  ) => {
    try {
      await sendTemplateEmailLogged(supabase, templateName, email, {
        idempotencyKey,
        templateData,
      })
    } catch (error) {
      stats.errors++
      const retryAfter =
        error && typeof error === 'object' && 'retryAfterSeconds' in error
          ? ((error as { retryAfterSeconds: number | null }).retryAfterSeconds ?? 60)
          : null
      if (retryAfter !== null) {
        // Rate limited — wait out the window, then retry this send once.
        await new Promise((r) => setTimeout(r, retryAfter * 1000))
        try {
          await sendTemplateEmailLogged(supabase, templateName, email, {
            idempotencyKey,
            templateData,
          })
          stats.errors--
          return
        } catch (retryError) {
          console.error('send failed after retry', templateName, retryError)
          return
        }
      }
      console.error('send failed', templateName, error instanceof Error ? error.message : error)
    }
  }


  // --- Day 3 window: signups aged 3-4 days
  {
    const start = new Date(now.getTime() - 4 * 86400_000)
    const end = new Date(now.getTime() - 3 * 86400_000)
    const { data } = await supabase
      .from('waitlist_signups')
      .select('email, first_name')
      .gte('created_at', iso(start))
      .lt('created_at', iso(end))
      .limit(1000)
    for (const row of data ?? []) {
      stats.day3++
      await send('waitlist-drip-day3', row.email, `waitlist-drip-day3-${row.email}`, {
        firstName: row.first_name ?? null,
      })
    }
  }

  // --- Day 8 window: signups aged 8-9 days
  {
    const start = new Date(now.getTime() - 9 * 86400_000)
    const end = new Date(now.getTime() - 8 * 86400_000)
    const { data } = await supabase
      .from('waitlist_signups')
      .select('email, first_name, referral_code')
      .gte('created_at', iso(start))
      .lt('created_at', iso(end))
      .limit(1000)
    for (const row of data ?? []) {
      stats.day8++
      const shareUrl = row.referral_code
        ? `https://www.bazukifragrance.com/coming-soon?ref=${row.referral_code}`
        : HOME_URL
      await send('waitlist-drip-day8', row.email, `waitlist-drip-day8-${row.email}`, {
        firstName: row.first_name ?? null,
        referralCode: row.referral_code ?? null,
        shareUrl,
      })
    }
  }

  // --- One Week Out — send once on Aug 22 to all existing signups
  if (today === WEEK_OUT_DATE) {
    const { data: spotsData } = await supabase.rpc('spots_remaining')
    const spots = typeof spotsData === 'number' ? spotsData : undefined
    const { data } = await supabase.from('waitlist_signups').select('email, first_name').limit(5000)
    for (const row of data ?? []) {
      stats.weekOut++
      await send('waitlist-week-out', row.email, `waitlist-week-out-${row.email}`, {
        firstName: row.first_name ?? null,
        spotsRemaining: spots,
      })
    }
  }

  // --- Final Call — send once on Aug 28 to all existing signups
  if (today === FINAL_CALL_DATE) {
    const { data } = await supabase.from('waitlist_signups').select('email, first_name').limit(5000)
    for (const row of data ?? []) {
      stats.finalCall++
      await send('waitlist-final-call', row.email, `waitlist-final-call-${row.email}`, {
        firstName: row.first_name ?? null,
        ctaUrl: CTA_URL,
      })
    }
  }

  return new Response(JSON.stringify({ ok: true, today, stats }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
