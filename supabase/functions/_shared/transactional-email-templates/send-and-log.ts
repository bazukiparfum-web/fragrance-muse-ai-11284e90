// Sends a registered template through Lovable's managed email API and records
// the outcome in the app's own email_send_log table (notification/history only —
// it never gates a send). Suppression, retries, and rate limits are enforced by
// Lovable server-side.

import {
  sendTemplateEmail,
  type SendTemplateEmailOptions,
  type SendTemplateEmailResult,
} from './send-email.ts'

// deno-lint-ignore no-explicit-any
type SupabaseLike = { from: (table: string) => any }

async function writeLog(
  supabase: SupabaseLike,
  row: {
    template_name: string
    recipient_email: string
    status: 'sent' | 'suppressed' | 'failed'
    error_message?: string
  },
): Promise<void> {
  const { error } = await supabase.from('email_send_log').insert({
    message_id: null,
    ...row,
  })
  if (error) {
    console.error('Failed to write email_send_log row', {
      code: error.code,
      message: error.message,
      status: row.status,
      template_name: row.template_name,
    })
  }
}

export async function sendTemplateEmailLogged(
  supabase: SupabaseLike,
  templateName: string,
  to: string,
  options: SendTemplateEmailOptions = {},
): Promise<SendTemplateEmailResult> {
  try {
    const result = await sendTemplateEmail(templateName, to, options)
    await writeLog(supabase, {
      template_name: templateName,
      recipient_email: to,
      status: result.sent ? 'sent' : 'suppressed',
      ...(result.sent ? {} : { error_message: 'Recipient suppressed' }),
    })
    return result
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    await writeLog(supabase, {
      template_name: templateName,
      recipient_email: to,
      status: 'failed',
      error_message: message.slice(0, 1000),
    })
    throw error
  }
}

export type { SendTemplateEmailResult }
