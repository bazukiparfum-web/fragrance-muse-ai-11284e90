// Quiz retargeting scheduler — runs via pg_cron hourly.
// Picks eligible quiz_sessions and dispatches the next-in-sequence retargeting email.
// Days-since-completion → template:
//   1 → day1, 3 → day3, 7 → day7, 25 → day25
// (Email 0 — "immediate" — is sent inline from the email-capture form.)

import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'
import { createClient } from 'npm:@supabase/supabase-js@2.39.0'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

type Step = { day: number; template: string }
const STEPS: Step[] = [
  { day: 1, template: 'quiz-followup-day1' },
  { day: 3, template: 'quiz-followup-day3' },
  { day: 7, template: 'quiz-followup-day7' },
  { day: 25, template: 'quiz-followup-day25' },
]

const noteNames = (arr: any): string[] => {
  if (!arr) return []
  if (Array.isArray(arr) && arr.length > 0 && typeof arr[0] === 'string') return arr as string[]
  return (Array.isArray(arr) ? arr : []).map((n: any) => n?.name || n?.note).filter(Boolean)
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE)
  const now = new Date()
  const nowIso = now.toISOString()

  const dispatched: Array<{ session_id: string; template: string; status: string }> = []

  try {
    const { data: rows, error } = await supabase
      .from('quiz_sessions')
      .select('id, session_id, email, completed_at, retarget_count, last_retargeted_at, formula_results, customer_profile')
      .not('email', 'is', null)
      .eq('converted', false)
      .gt('expires_at', nowIso)
      .lt('retarget_count', STEPS.length + 1)
      .limit(500)

    if (error) throw error

    for (const row of rows ?? []) {
      const daysSince = Math.floor(
        (now.getTime() - new Date(row.completed_at).getTime()) / 86_400_000,
      )
      // Don't send more than one retarget email per 20 hours.
      if (row.last_retargeted_at) {
        const hoursSinceLast =
          (now.getTime() - new Date(row.last_retargeted_at).getTime()) / 3_600_000
        if (hoursSinceLast < 20) continue
      }

      const nextStepIndex = row.retarget_count // 0-based; first step is day1
      const step = STEPS[nextStepIndex]
      if (!step) continue
      if (daysSince < step.day) continue

      const topResult = Array.isArray(row.formula_results) ? row.formula_results[0] : null
      const topNotesRaw =
        topResult?.top_notes ?? topResult?.formula?.top ?? null
      const templateData: Record<string, unknown> = {
        sessionId: row.session_id,
        bestMatchName: topResult?.fragrance_name || topResult?.name || null,
        topNotes: noteNames(topNotesRaw),
        dreamWord: (row.customer_profile as any)?.dream_word || null,
        formulaResults: row.formula_results || [],
      }

      try {
        const resp = await supabase.functions.invoke('send-transactional-email', {
          body: {
            templateName: step.template,
            recipientEmail: row.email,
            idempotencyKey: `${step.template}-${row.session_id}`,
            templateData,
          },
        })
        const ok = !resp.error
        dispatched.push({ session_id: row.session_id, template: step.template, status: ok ? 'sent' : 'failed' })
        if (ok) {
          await supabase
            .from('quiz_sessions')
            .update({
              retargeted: true,
              retarget_count: (row.retarget_count ?? 0) + 1,
              last_retargeted_at: nowIso,
            })
            .eq('id', row.id)
        }
      } catch (e) {
        console.error('dispatch failed', row.session_id, e)
        dispatched.push({ session_id: row.session_id, template: step.template, status: 'error' })
      }
    }

    return new Response(
      JSON.stringify({ ok: true, processed: rows?.length ?? 0, dispatched }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (e) {
    console.error('scheduler error', e)
    return new Response(JSON.stringify({ ok: false, error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
