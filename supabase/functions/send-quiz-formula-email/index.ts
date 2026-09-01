// Sends the immediate "your formula" email after a visitor saves their quiz
// result email. The recipient is never taken from the request body — it is read
// from the quiz session row, so this endpoint cannot be used to mail arbitrary
// addresses.

import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'
import { sendTemplateEmailLogged } from '../_shared/transactional-email-templates/send-and-log.ts'

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!supabaseUrl || !serviceKey) {
    console.error('Missing required environment variables')
    return json({ error: 'Server configuration error' }, 500)
  }

  let sessionId: unknown
  try {
    const body = await req.json()
    sessionId = body?.sessionId
  } catch {
    return json({ error: 'Invalid JSON in request body' }, 400)
  }

  if (typeof sessionId !== 'string' || sessionId.length < 8 || sessionId.length > 128) {
    return json({ error: 'sessionId is required' }, 400)
  }

  const supabase = createClient(supabaseUrl, serviceKey)

  const { data: session, error: lookupError } = await supabase
    .from('quiz_sessions')
    .select('session_id, email, formula_results')
    .eq('session_id', sessionId)
    .maybeSingle()

  if (lookupError) {
    console.error('Failed to load quiz session', lookupError)
    return json({ error: 'Failed to load session' }, 500)
  }
  if (!session?.email) {
    return json({ error: 'No email saved for this session' }, 404)
  }

  // deno-lint-ignore no-explicit-any
  const results = Array.isArray(session.formula_results) ? (session.formula_results as any[]) : []
  const top = results[0] ?? null

  try {
    const result = await sendTemplateEmailLogged(
      supabase,
      'quiz-formula-immediate',
      session.email,
      {
        idempotencyKey: `quiz-formula-immediate-${session.session_id}`,
        templateData: {
          sessionId: session.session_id,
          bestMatchName: top?.fragrance_name || top?.name || null,
          formulaResults: results,
        },
      },
    )
    if (!result.sent) {
      return json({ success: false, reason: result.reason })
    }
    return json({ success: true })
  } catch (error) {
    console.error('Failed to send quiz formula email', error)
    return json({ error: 'Failed to send email' }, 500)
  }
})
