import { Resend } from 'resend'

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY)

export interface SendEmailParams {
  to: string | string[]
  subject: string
  html: string
  text?: string
  replyTo?: string
}

/**
 * Send an email using Resend
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
  replyTo
}: SendEmailParams) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not configured')
  }

  const from = process.env.EMAIL_FROM || 'noreply@weevup.com'
  const fromName = process.env.EMAIL_FROM_NAME || 'Weevup Events'

  try {
    const result = await resend.emails.send({
      from: `${fromName} <${from}>`,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text,
      replyTo
    })

    return {
      success: true,
      messageId: result.data?.id,
      error: null
    }
  } catch (error) {
    console.error('Error sending email with Resend:', error)
    return {
      success: false,
      messageId: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Send multiple emails in batch
 */
export async function sendBatchEmails(emails: SendEmailParams[]) {
  const results = await Promise.allSettled(
    emails.map(email => sendEmail(email))
  )

  const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length
  const failed = results.length - successful

  return {
    total: results.length,
    successful,
    failed,
    results
  }
}
