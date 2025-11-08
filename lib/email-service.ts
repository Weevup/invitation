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
