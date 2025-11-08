/**
 * Service d'envoi d'emails avec support pour Resend et SendGrid
 *
 * Configuration requise dans .env :
 * - RESEND_API_KEY ou SENDGRID_API_KEY
 * - EMAIL_FROM (adresse email expéditeur vérifiée)
 * - EMAIL_PROVIDER (resend ou sendgrid)
 */

import {
  generateSaveTheDateEmail,
  generateInvitationEmail,
  generateReminderEmail,
  generateFollowUpEmail,
} from './email-templates';

export interface EmailConfig {
  provider: 'resend' | 'sendgrid';
  apiKey: string;
  fromEmail: string;
  fromName: string;
}

export interface SendEmailParams {
  to: string;
  toName: string;
  subject: string;
  html: string;
  trackingId?: string;
}

export interface EmailTrackingData {
  id: string;
  eventId: string;
  guestId: string;
  type: 'save-the-date' | 'invitation' | 'reminder' | 'follow-up';
  sentAt: Date;
  openedAt?: Date;
  clickedAt?: Date;
  status: 'sent' | 'delivered' | 'opened' | 'clicked' | 'failed';
}

class EmailService {
  private config: EmailConfig | null = null;

  /**
   * Initialise le service avec la configuration
   */
  configure(config: EmailConfig) {
    this.config = config;
  }

  /**
   * Récupère la configuration depuis les variables d'environnement
   */
  private getConfig(): EmailConfig {
    if (this.config) {
      return this.config;
    }

    const provider = (process.env.EMAIL_PROVIDER || 'resend') as 'resend' | 'sendgrid';
    const apiKey = provider === 'resend'
      ? process.env.RESEND_API_KEY || ''
      : process.env.SENDGRID_API_KEY || '';
    const fromEmail = process.env.EMAIL_FROM || 'noreply@example.com';
    const fromName = process.env.EMAIL_FROM_NAME || 'Weevup';

    if (!apiKey) {
      throw new Error(`API key for ${provider} is not configured. Please set ${provider.toUpperCase()}_API_KEY in .env`);
    }

    return { provider, apiKey, fromEmail, fromName };
  }

  /**
   * Envoie un email via Resend
   */
  private async sendViaResend(params: SendEmailParams): Promise<{ id: string; success: boolean }> {
    const config = this.getConfig();

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
          from: `${config.fromName} <${config.fromEmail}>`,
          to: params.to,
          subject: params.subject,
          html: this.addTrackingPixel(params.html, params.trackingId),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send email via Resend');
      }

      return { id: data.id, success: true };
    } catch (error) {
      console.error('Error sending email via Resend:', error);
      throw error;
    }
  }

  /**
   * Envoie un email via SendGrid
   */
  private async sendViaSendGrid(params: SendEmailParams): Promise<{ id: string; success: boolean }> {
    const config = this.getConfig();

    try {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
          personalizations: [
            {
              to: [{ email: params.to, name: params.toName }],
            },
          ],
          from: {
            email: config.fromEmail,
            name: config.fromName,
          },
          subject: params.subject,
          content: [
            {
              type: 'text/html',
              value: this.addTrackingPixel(params.html, params.trackingId),
            },
          ],
          tracking_settings: {
            click_tracking: { enable: true },
            open_tracking: { enable: true },
          },
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`SendGrid error: ${error}`);
      }

      // SendGrid retourne un header X-Message-Id
      const messageId = response.headers.get('X-Message-Id') || 'unknown';

      return { id: messageId, success: true };
    } catch (error) {
      console.error('Error sending email via SendGrid:', error);
      throw error;
    }
  }

  /**
   * Ajoute un pixel de tracking à l'email
   */
  private addTrackingPixel(html: string, trackingId?: string): string {
    if (!trackingId) {
      return html;
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const trackingPixel = `<img src="${baseUrl}/api/track/open/${trackingId}" width="1" height="1" style="display:block;" alt="" />`;

    // Insère le pixel juste avant la balise </body>
    return html.replace('</body>', `${trackingPixel}</body>`);
  }

  /**
   * Remplace les liens dans l'email par des liens trackés
   */
  private addLinkTracking(html: string, trackingId: string): string {
    if (!trackingId) {
      return html;
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Remplace tous les liens href par des liens de tracking
    return html.replace(
      /href="([^"]+)"/g,
      (match, url) => {
        if (url.startsWith('mailto:') || url.startsWith('#')) {
          return match;
        }
        const trackingUrl = `${baseUrl}/api/track/click/${trackingId}?url=${encodeURIComponent(url)}`;
        return `href="${trackingUrl}"`;
      }
    );
  }

  /**
   * Envoie un email générique
   */
  async sendEmail(params: SendEmailParams): Promise<{ id: string; success: boolean }> {
    const config = this.getConfig();

    // Ajoute le tracking des liens si un trackingId est fourni
    if (params.trackingId) {
      params.html = this.addLinkTracking(params.html, params.trackingId);
    }

    if (config.provider === 'resend') {
      return this.sendViaResend(params);
    } else {
      return this.sendViaSendGrid(params);
    }
  }

  /**
   * Envoie un Save the Date
   */
  async sendSaveTheDate(data: {
    to: string;
    toName: string;
    eventName: string;
    tagline: string;
    dateAnnouncement: string;
    locationHint: string;
    teaserMessage: string;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    backgroundColor: string;
    ctaText: string;
    ctaLink?: string;
    footerMessage: string;
    logoUrl?: string;
    headerImage?: string;
    trackingId?: string;
  }): Promise<{ id: string; success: boolean }> {
    const html = generateSaveTheDateEmail({
      eventName: data.eventName,
      tagline: data.tagline,
      dateAnnouncement: data.dateAnnouncement,
      locationHint: data.locationHint,
      teaserMessage: data.teaserMessage,
      primaryColor: data.primaryColor,
      secondaryColor: data.secondaryColor,
      accentColor: data.accentColor,
      backgroundColor: data.backgroundColor,
      ctaText: data.ctaText,
      ctaLink: data.ctaLink,
      footerMessage: data.footerMessage,
      guestName: data.toName,
      logoUrl: data.logoUrl,
      headerImage: data.headerImage,
    });

    return this.sendEmail({
      to: data.to,
      toName: data.toName,
      subject: `${data.eventName} - Save the Date`,
      html,
      trackingId: data.trackingId,
    });
  }

  /**
   * Envoie une invitation
   */
  async sendInvitation(data: {
    to: string;
    toName: string;
    eventName: string;
    welcomeMessage: string;
    description: string;
    date: string;
    time: string;
    location: string;
    address: string;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    rsvpLink: string;
    logoUrl?: string;
    headerImage?: string;
    trackingId?: string;
  }): Promise<{ id: string; success: boolean }> {
    const html = generateInvitationEmail({
      eventName: data.eventName,
      welcomeMessage: data.welcomeMessage,
      description: data.description,
      date: data.date,
      time: data.time,
      location: data.location,
      address: data.address,
      primaryColor: data.primaryColor,
      secondaryColor: data.secondaryColor,
      accentColor: data.accentColor,
      rsvpLink: data.rsvpLink,
      guestName: data.toName,
      logoUrl: data.logoUrl,
      headerImage: data.headerImage,
    });

    return this.sendEmail({
      to: data.to,
      toName: data.toName,
      subject: `Vous êtes invité(e) - ${data.eventName}`,
      html,
      trackingId: data.trackingId,
    });
  }

  /**
   * Envoie un rappel
   */
  async sendReminder(data: {
    to: string;
    toName: string;
    eventName: string;
    date: string;
    time: string;
    location: string;
    address: string;
    primaryColor: string;
    qrCodeUrl?: string;
    trackingId?: string;
  }): Promise<{ id: string; success: boolean }> {
    const html = generateReminderEmail({
      eventName: data.eventName,
      date: data.date,
      time: data.time,
      location: data.location,
      address: data.address,
      guestName: data.toName,
      qrCodeUrl: data.qrCodeUrl,
      primaryColor: data.primaryColor,
    });

    return this.sendEmail({
      to: data.to,
      toName: data.toName,
      subject: `Rappel - ${data.eventName}`,
      html,
      trackingId: data.trackingId,
    });
  }

  /**
   * Envoie une relance (follow-up)
   */
  async sendFollowUp(data: {
    to: string;
    toName: string;
    eventName: string;
    welcomeMessage: string;
    description: string;
    date: string;
    time: string;
    location: string;
    address: string;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    rsvpLink: string;
    daysRemaining: number;
    trackingId?: string;
  }): Promise<{ id: string; success: boolean }> {
    const html = generateFollowUpEmail({
      eventName: data.eventName,
      welcomeMessage: data.welcomeMessage,
      description: data.description,
      date: data.date,
      time: data.time,
      location: data.location,
      address: data.address,
      primaryColor: data.primaryColor,
      secondaryColor: data.secondaryColor,
      accentColor: data.accentColor,
      rsvpLink: data.rsvpLink,
      guestName: data.toName,
      daysRemaining: data.daysRemaining,
    });

    return this.sendEmail({
      to: data.to,
      toName: data.toName,
      subject: `⏰ Réponse attendue - ${data.eventName}`,
      html,
      trackingId: data.trackingId,
    });
  }

  /**
   * Test de configuration email
   */
  async testConfiguration(testEmail: string): Promise<{ success: boolean; message: string }> {
    try {
      const result = await this.sendEmail({
        to: testEmail,
        toName: 'Test User',
        subject: 'Test de configuration email - Weevup',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8">
              <title>Test Email</title>
            </head>
            <body style="font-family: Arial, sans-serif; padding: 40px; background-color: #f5f5f5;">
              <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px;">
                <h1 style="color: #004645; margin-bottom: 20px;">✅ Configuration Email Réussie</h1>
                <p style="color: #333; line-height: 1.6;">
                  Félicitations ! Votre configuration email fonctionne correctement.
                </p>
                <p style="color: #666; font-size: 14px; margin-top: 30px;">
                  Vous pouvez maintenant envoyer des Save the Date, Invitations et Rappels à vos invités.
                </p>
                <div style="margin-top: 30px; padding: 20px; background-color: #f0f0f0; border-radius: 5px;">
                  <p style="margin: 0; color: #666; font-size: 12px;">
                    <strong>Provider:</strong> ${this.getConfig().provider}<br>
                    <strong>From:</strong> ${this.getConfig().fromEmail}
                  </p>
                </div>
              </div>
            </body>
          </html>
        `,
      });

      return {
        success: true,
        message: `Email de test envoyé avec succès à ${testEmail}. ID: ${result.id}`,
      };
    } catch (error) {
      return {
        success: false,
        message: `Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
      };
    }
  }
}

// Singleton instance
export const emailService = new EmailService();

/**
 * NEW: Unified email sending with dynamic integrations
 * Supports SendGrid, Resend, Mailgun, and custom SMTP
 */

import nodemailer from 'nodemailer'
import crypto from 'crypto'

// Encryption helpers
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'change-this-in-production-32chr'
const ALGORITHM = 'aes-256-cbc'

function decrypt(text: string): string {
  const textParts = text.split(':')
  const iv = Buffer.from(textParts.shift()!, 'hex')
  const encryptedText = Buffer.from(textParts.join(':'), 'hex')
  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY.slice(0, 32)), iv)
  let decrypted = decipher.update(encryptedText)
  decrypted = Buffer.concat([decrypted, decipher.final()])
  return decrypted.toString()
}

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
}

export interface EmailIntegration {
  id: string
  provider: 'SENDGRID' | 'RESEND' | 'MAILGUN' | 'SMTP'
  apiKey?: string
  apiSecret?: string
  smtpHost?: string
  smtpPort?: number
  smtpUser?: string
  smtpPass?: string
  fromEmail?: string
  fromName?: string
  replyTo?: string
  trackOpens: boolean
  trackClicks: boolean
}

export interface EmailResult {
  success: boolean
  messageId?: string
  error?: string
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
    console.error('Email sending error:', error)
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
  fromName?: string,
  replyTo?: string
): Promise<EmailResult> {
  const apiKey = integration.apiKey ? decrypt(integration.apiKey) : ''

  const payload = {
    personalizations: [{
      to: Array.isArray(data.to) ? data.to.map(email => ({ email })) : [{ email: data.to }],
      subject: data.subject,
    }],
    from: { email: from, ...(fromName && { name: fromName }) },
    ...(replyTo && { reply_to: { email: replyTo } }),
    content: [
      { type: 'text/html', value: data.html },
      ...(data.text ? [{ type: 'text/plain', value: data.text }] : []),
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
  fromName?: string,
  replyTo?: string
): Promise<EmailResult> {
  const apiKey = integration.apiKey ? decrypt(integration.apiKey) : ''

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
  fromName?: string,
  replyTo?: string
): Promise<EmailResult> {
  const apiKey = integration.apiKey ? decrypt(integration.apiKey) : ''
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
  fromName?: string,
  replyTo?: string
): Promise<EmailResult> {
  const smtpPass = integration.smtpPass ? decrypt(integration.smtpPass) : ''

  const transporter = nodemailer.createTransport({
    host: integration.smtpHost,
    port: integration.smtpPort || 587,
    secure: integration.smtpPort === 465,
    auth: {
      user: integration.smtpUser,
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
  }

  const info = await transporter.sendMail(mailOptions)

  return { success: true, messageId: info.messageId }
}
