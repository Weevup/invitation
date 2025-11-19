/**
 * Unified email service with database-backed integrations
 * Supports SendGrid, Resend, Mailgun, and custom SMTP
 *
 * Configuration: All email providers are configured via /admin/settings/integrations
 * No environment variables needed for email configuration anymore.
 */

import nodemailer from 'nodemailer'
import { decrypt, safeDecrypt } from './encryption'
import { emailLogger } from './logger'

export interface EmailData {
  to: string | string[]
  from?: string
  fromName?: string
  replyTo?: string
  subject: string
  html: string
  text?: string
  cc?: string | string[]
  bcc?: string | string[]
  unsubscribeUrl?: string  // Optional unsubscribe URL for List-Unsubscribe header
  listId?: string           // Optional List-ID for bulk emails
}

export interface EmailIntegration {
  id: string
  provider: 'SENDGRID' | 'RESEND' | 'MAILGUN' | 'SMTP'
  apiKey?: string | null
  apiSecret?: string | null
  smtpHost?: string | null
  smtpPort?: number | null
  smtpUser?: string | null
  smtpPass?: string | null
  fromEmail?: string | null
  fromName?: string | null
  replyTo?: string | null
  trackOpens: boolean
  trackClicks: boolean
}

export interface EmailResult {
  success: boolean
  messageId?: string
  error?: string
}

export interface TemplateVariables {
  // Event information
  'event.name'?: string
  'event.date'?: string
  'event.time'?: string
  'event.location'?: string
  'event.address'?: string
  'event.description'?: string

  // Guest information
  'guest.firstName'?: string
  'guest.lastName'?: string
  'guest.email'?: string

  // RSVP information
  'rsvpLink'?: string
  'rsvpDeadline'?: string

  // Host information
  'host.name'?: string
  'host.email'?: string

  // Design variables
  'fontFamily'?: string
  'primaryColor'?: string
  'secondaryColor'?: string
  'accentColor'?: string

  // Additional custom variables
  [key: string]: string | undefined
}

/**
 * Renders an email template by replacing variables with actual values
 * Variables format: {{variableName}} or {{object.property}}
 *
 * Example:
 * ```ts
 * const html = renderTemplate(template.htmlContent, {
 *   'event.name': 'Tech Summit 2025',
 *   'guest.firstName': 'Marie',
 *   'rsvpLink': 'https://app.com/rsvp/abc123',
 *   'primaryColor': '#004645'
 * })
 * ```
 */
export function renderTemplate(
  template: string,
  variables: TemplateVariables
): string {
  let rendered = template

  // Replace each variable in the template
  Object.entries(variables).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      // Create regex to match {{key}} with optional whitespace
      const regex = new RegExp(`\\{\\{\\s*${key.replace(/\./g, '\\.')}\\s*\\}\\}`, 'g')
      rendered = rendered.replace(regex, value)
    }
  })

  // Remove any remaining unreplaced variables (optional - set to empty string)
  rendered = rendered.replace(/\{\{[^}]+\}\}/g, '')

  return rendered
}

/**
 * Send email using a template
 * This function fetches a template from database and renders it with variables
 */
export async function sendEmailWithTemplate(
  templateId: string,
  variables: TemplateVariables,
  data: Omit<EmailData, 'html' | 'subject'>,
  integration: EmailIntegration,
  prisma: any // PrismaClient type
): Promise<EmailResult> {
  try {
    // Fetch template from database
    const template = await prisma.emailTemplate.findUnique({
      where: { id: templateId }
    })

    if (!template) {
      return {
        success: false,
        error: `Template with ID ${templateId} not found`
      }
    }

    if (!template.isActive) {
      return {
        success: false,
        error: `Template ${template.name} is not active`
      }
    }

    // Add template design variables to the variables object
    const allVariables: TemplateVariables = {
      ...variables,
      fontFamily: template.fontFamily,
      primaryColor: template.primaryColor,
      secondaryColor: template.secondaryColor,
      accentColor: template.accentColor
    }

    // Render template
    const html = renderTemplate(template.htmlContent, allVariables)
    const subject = renderTemplate(template.subject, allVariables)
    const text = template.textContent ? renderTemplate(template.textContent, allVariables) : undefined

    // Update template usage stats
    await prisma.emailTemplate.update({
      where: { id: templateId },
      data: {
        usageCount: { increment: 1 },
        lastUsedAt: new Date()
      }
    })

    // Send email
    return await sendEmail(
      {
        ...data,
        html,
        subject,
        text
      },
      integration
    )
  } catch (error) {
    emailLogger.error({ error, templateId }, 'Error sending email with template')
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Send email using a specific integration
 */
export async function sendEmail(
  data: EmailData,
  integration: EmailIntegration
): Promise<EmailResult> {
  try {
    const from = data.from || integration.fromEmail
    const fromName = data.fromName || integration.fromName
    const replyTo = data.replyTo || integration.replyTo

    switch (integration.provider) {
      case 'SENDGRID':
        return await sendViaSendGrid(data, integration, from!, fromName, replyTo)
      case 'RESEND':
        return await sendViaResend(data, integration, from!, fromName, replyTo)
      case 'MAILGUN':
        return await sendViaMailgun(data, integration, from!, fromName, replyTo)
      case 'SMTP':
        return await sendViaSMTP(data, integration, from!, fromName, replyTo)
      default:
        return { success: false, error: `Unsupported provider: ${integration.provider}` }
    }
  } catch (error) {
    emailLogger.error(
      { error, provider: integration.provider, to: data.to, subject: data.subject },
      'Email sending error'
    )
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

async function sendViaSendGrid(
  data: EmailData,
  integration: EmailIntegration,
  from: string,
  fromName?: string | null,
  replyTo?: string | null
): Promise<EmailResult> {
  const apiKey = integration.apiKey || ''

  const payload = {
    personalizations: [{
      to: Array.isArray(data.to) ? data.to.map(email => ({ email })) : [{ email: data.to }],
      subject: data.subject,
    }],
    from: { email: from, ...(fromName && { name: fromName }) },
    ...(replyTo && { reply_to: { email: replyTo } }),
    content: [
      ...(data.text ? [{ type: 'text/plain', value: data.text }] : []),
      { type: 'text/html', value: data.html },
    ],
    tracking_settings: {
      click_tracking: { enable: integration.trackClicks },
      open_tracking: { enable: integration.trackOpens },
    },
  }

  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const error = await response.text()
    return { success: false, error: `SendGrid error: ${error}` }
  }

  return { success: true, messageId: response.headers.get('x-message-id') || undefined }
}

async function sendViaResend(
  data: EmailData,
  integration: EmailIntegration,
  from: string,
  fromName?: string | null,
  replyTo?: string | null
): Promise<EmailResult> {
  const apiKey = integration.apiKey || ''

  const payload = {
    from: fromName ? `${fromName} <${from}>` : from,
    to: Array.isArray(data.to) ? data.to : [data.to],
    ...(replyTo && { reply_to: replyTo }),
    subject: data.subject,
    html: data.html,
    ...(data.text && { text: data.text }),
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const result = await response.json()

  if (!response.ok) {
    return { success: false, error: `Resend error: ${result.message || JSON.stringify(result)}` }
  }

  return { success: true, messageId: result.id }
}

async function sendViaMailgun(
  data: EmailData,
  integration: EmailIntegration,
  from: string,
  fromName?: string | null,
  replyTo?: string | null
): Promise<EmailResult> {
  const apiKey = integration.apiKey || ''
  const domain = integration.apiSecret

  const formData = new FormData()
  formData.append('from', fromName ? `${fromName} <${from}>` : from)
  formData.append('to', Array.isArray(data.to) ? data.to.join(',') : data.to)
  if (replyTo) formData.append('h:Reply-To', replyTo)
  formData.append('subject', data.subject)
  formData.append('html', data.html)
  if (data.text) formData.append('text', data.text)
  if (integration.trackOpens) formData.append('o:tracking-opens', 'yes')
  if (integration.trackClicks) formData.append('o:tracking-clicks', 'yes')

  const response = await fetch(`https://api.mailgun.net/v3/${domain}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${Buffer.from(`api:${apiKey}`).toString('base64')}`,
    },
    body: formData,
  })

  const result = await response.json()

  if (!response.ok) {
    return { success: false, error: `Mailgun error: ${result.message || JSON.stringify(result)}` }
  }

  return { success: true, messageId: result.id }
}

async function sendViaSMTP(
  data: EmailData,
  integration: EmailIntegration,
  from: string,
  fromName?: string | null,
  replyTo?: string | null
): Promise<EmailResult> {
  const smtpPass = integration.smtpPass || ''

  const transporter = nodemailer.createTransport({
    host: integration.smtpHost || undefined,
    port: integration.smtpPort || 587,
    secure: integration.smtpPort === 465,
    auth: {
      user: integration.smtpUser || undefined,
      pass: smtpPass,
    },
  })

  const mailOptions = {
    from: fromName ? `${fromName} <${from}>` : from,
    to: Array.isArray(data.to) ? data.to.join(', ') : data.to,
    ...(replyTo && { replyTo }),
    subject: data.subject,
    html: data.html,
    ...(data.text && { text: data.text }),
    headers: {
      // Anti-spam headers
      ...(data.listId && { 'List-ID': data.listId }),
      ...(data.unsubscribeUrl && {
        'List-Unsubscribe': `<${data.unsubscribeUrl}>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click'
      }),
      'X-Entity-Ref-ID': `event-invitation-${Date.now()}`,
      'Precedence': 'bulk',
    }
  }

  const info = await transporter.sendMail(mailOptions)

  return { success: true, messageId: info.messageId }
}

/**
 * Legacy-compatible sendEmail function
 * Automatically fetches active email integration and creates email logs
 *
 * @deprecated For new code, use sendEmail() with explicit EmailIntegration
 */
export async function sendEmailLegacy(params: {
  to: string
  subject: string
  html: string
  eventId: string
  guestId: string
  type: 'INVITE' | 'REMINDER' | 'CONFIRMATION' | 'SAVE_THE_DATE' | 'FOLLOW_UP' | 'CUSTOM'
}): Promise<{ success: boolean; messageId?: string; error?: any }> {
  const { prisma } = await import('./prisma')
  const { EmailType, EmailStatus } = await import('@prisma/client')

  try {
    // Create email log
    const emailLog = await prisma.emailLog.create({
      data: {
        eventId: params.eventId,
        guestId: params.guestId,
        type: params.type as any,
        subject: params.subject,
        status: EmailStatus.PENDING,
      },
    })

    // Try to fetch active email integration from database
    let integration: EmailIntegration | null = null
    try {
      const dbIntegration = await prisma.emailIntegration.findFirst({
        where: { isActive: true }
      })
      if (dbIntegration && dbIntegration.apiKey) {
        integration = {
          id: dbIntegration.id,
          provider: dbIntegration.provider as any,
          apiKey: dbIntegration.apiKey ? safeDecrypt(dbIntegration.apiKey) : null,
          apiSecret: dbIntegration.apiSecret ? safeDecrypt(dbIntegration.apiSecret) : null,
          smtpHost: dbIntegration.smtpHost,
          smtpPort: dbIntegration.smtpPort,
          smtpUser: dbIntegration.smtpUser,
          smtpPass: dbIntegration.smtpPass ? safeDecrypt(dbIntegration.smtpPass) : null,
          fromEmail: dbIntegration.fromEmail,
          fromName: dbIntegration.fromName,
          replyTo: dbIntegration.replyTo,
          trackOpens: dbIntegration.trackOpens,
          trackClicks: dbIntegration.trackClicks,
        }
      }
    } catch (err) {
      emailLogger.warn('No active email integration found, using SMTP fallback')
    }

    // Fallback to SMTP from environment variables if no integration
    if (!integration) {
      integration = {
        id: 'env-smtp',
        provider: 'SMTP',
        smtpHost: process.env.SMTP_HOST || 'smtp.ethereal.email',
        smtpPort: parseInt(process.env.SMTP_PORT || '587'),
        smtpUser: process.env.SMTP_USER || undefined,
        smtpPass: process.env.SMTP_PASSWORD || undefined,
        fromEmail: process.env.EMAIL_FROM || 'noreply@invitation-manager.com',
        fromName: process.env.EMAIL_FROM_NAME || 'Invitation Manager',
        replyTo: undefined,
        trackOpens: false,
        trackClicks: false,
      }
    }

    // Send email using new system
    const emailData: EmailData = {
      to: params.to,
      subject: params.subject,
      html: params.html,
    }

    const result = await sendEmail(emailData, integration)

    if (result.success) {
      // Update log
      await prisma.emailLog.update({
        where: { id: emailLog.id },
        data: {
          status: EmailStatus.SENT,
          providerId: result.messageId,
          sentAt: new Date(),
        },
      })

      // Update guest last email
      await prisma.guest.update({
        where: { id: params.guestId },
        data: { lastEmailAt: new Date() },
      })

      return { success: true, messageId: result.messageId }
    } else {
      // Update log with error
      await prisma.emailLog.update({
        where: { id: emailLog.id },
        data: {
          status: EmailStatus.FAILED,
          error: result.error || 'Unknown error',
        },
      })

      return { success: false, error: result.error }
    }
  } catch (error) {
    emailLogger.error({ error }, 'Error in sendEmailLegacy')
    return { success: false, error }
  }
}
