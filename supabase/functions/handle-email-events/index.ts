import { createEmailWebhookHandler } from 'npm:@lovable.dev/email-js@0.1.0'
import { createClient } from 'npm:@supabase/supabase-js@2'

// Notification-only mirror of terminal email outcomes into the app's own
// history tables. Lovable enforces suppression at send time — these rows never
// gate a send.

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

type Reason = 'bounce' | 'complaint' | 'unsubscribe'

const STATUS_BY_REASON: Record<Reason, 'bounced' | 'complained' | 'suppressed'> = {
  bounce: 'bounced',
  complaint: 'complained',
  unsubscribe: 'suppressed',
}

const MESSAGE_BY_REASON: Record<Reason, string> = {
  bounce: 'Permanent bounce — email address is invalid or rejected',
  complaint: 'Spam complaint — recipient marked email as spam',
  unsubscribe: 'Recipient unsubscribed',
}

async function record(
  reason: Reason,
  event: { event_id: string; data: { recipient: string; message_id?: string } },
): Promise<void> {
  const supabase = createClient(supabaseUrl, serviceKey)
  const email = event.data.recipient.toLowerCase()

  const { error: suppressError } = await supabase
    .from('suppressed_emails')
    .upsert({ email, reason, metadata: null }, { onConflict: 'email' })

  if (suppressError) {
    console.error('Failed to upsert suppressed email', {
      code: suppressError.code,
      message: suppressError.message,
      event_id: event.event_id,
    })
    throw new Error('Failed to record suppression')
  }

  const { error: logError } = await supabase.from('email_send_log').insert({
    message_id: event.data.message_id ?? null,
    template_name: 'system',
    recipient_email: email,
    status: STATUS_BY_REASON[reason],
    error_message: MESSAGE_BY_REASON[reason],
    metadata: null,
  })

  if (logError) {
    console.error('Failed to insert email_send_log row', {
      code: logError.code,
      message: logError.message,
      event_id: event.event_id,
    })
    throw new Error('Failed to record email event')
  }
}

const handler = createEmailWebhookHandler({
  apiKey: Deno.env.get('LOVABLE_API_KEY')!,
  on: {
    'email.bounced': async (event) => {
      await record('bounce', event)
    },
    'email.complaint': async (event) => {
      await record('complaint', event)
    },
    'email.unsubscribed': async (event) => {
      await record('unsubscribe', event)
    },
  },
})

Deno.serve((req) => handler(req))
