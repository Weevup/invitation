import nodemailer from 'nodemailer'
import { prisma } from './prisma'

// Local type definition (sync with Prisma schema)
type EmailType = 'INVITE' | 'REMINDER' | 'CONFIRMATION' | 'SAVE_THE_DATE' | 'CUSTOM'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: process.env.SMTP_USER && process.env.SMTP_PASSWORD ? {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  } : undefined,
})

interface SendEmailParams {
  to: string
  subject: string
  html: string
  eventId: string
  guestId: string
  type: EmailType
}

export async function sendEmail({
  to,
  subject,
  html,
  eventId,
  guestId,
  type,
}: SendEmailParams) {
  try {
    // Create email log
    const emailLog = await prisma.emailLog.create({
      data: {
        eventId,
        guestId,
        type,
        subject,
        status: 'PENDING',
      },
    })

    // Send email
    const info = await transporter.sendMail({
      from: `${process.env.EMAIL_FROM_NAME || 'Invitation Manager'} <${process.env.EMAIL_FROM || 'noreply@invitation-manager.com'}>`,
      to,
      subject,
      html,
    })

    // Update log
    await prisma.emailLog.update({
      where: { id: emailLog.id },
      data: {
        status: 'SENT',
        providerId: info.messageId,
        sentAt: new Date(),
      },
    })

    // Update guest last email
    await prisma.guest.update({
      where: { id: guestId },
      data: { lastEmailAt: new Date() },
    })

    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Error sending email:', error)
    return { success: false, error }
  }
}

export function getInvitationEmailTemplate(params: {
  guestName: string
  eventName: string
  eventDate: string
  eventVenue: string
  invitationUrl: string
}) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #ffffff; padding: 40px 20px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
          .footer { background: #f7fafc; padding: 20px; text-align: center; font-size: 14px; color: #718096; border-radius: 0 0 8px 8px; }
          .event-details { background: #f7fafc; padding: 20px; border-radius: 6px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Vous êtes invité(e) !</h1>
          </div>
          <div class="content">
            <p>Bonjour ${params.guestName},</p>
            <p>Nous avons le plaisir de vous inviter à notre événement :</p>

            <div class="event-details">
              <h2 style="margin-top: 0;">${params.eventName}</h2>
              <p><strong>📅 Date :</strong> ${params.eventDate}</p>
              <p><strong>📍 Lieu :</strong> ${params.eventVenue}</p>
            </div>

            <p>Merci de confirmer votre présence en cliquant sur le bouton ci-dessous :</p>

            <div style="text-align: center;">
              <a href="${params.invitationUrl}" class="button">Répondre à l'invitation</a>
            </div>

            <p>Ce lien est personnel et sécurisé. Vous pourrez modifier votre réponse à tout moment avant la date limite.</p>
          </div>
          <div class="footer">
            <p>Cet email a été envoyé par Invitation Manager</p>
            <p>Si vous avez reçu cet email par erreur, veuillez l'ignorer.</p>
          </div>
        </div>
      </body>
    </html>
  `
}

export function getConfirmationEmailTemplate(params: {
  guestName: string
  eventName: string
  eventDate: string
  eventVenue: string
  attending: boolean
  qrCodeUrl?: string
}) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: ${params.attending ? 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}; color: white; padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #ffffff; padding: 40px 20px; }
          .footer { background: #f7fafc; padding: 20px; text-align: center; font-size: 14px; color: #718096; border-radius: 0 0 8px 8px; }
          .qr-code { text-align: center; margin: 30px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${params.attending ? '✓ Réponse confirmée' : 'Réponse enregistrée'}</h1>
          </div>
          <div class="content">
            <p>Bonjour ${params.guestName},</p>
            <p>${params.attending
              ? 'Merci d\'avoir confirmé votre présence à notre événement !'
              : 'Nous avons bien enregistré votre réponse.'
            }</p>

            <div style="background: #f7fafc; padding: 20px; border-radius: 6px; margin: 20px 0;">
              <h2 style="margin-top: 0;">${params.eventName}</h2>
              <p><strong>📅 Date :</strong> ${params.eventDate}</p>
              <p><strong>📍 Lieu :</strong> ${params.eventVenue}</p>
            </div>

            ${params.attending && params.qrCodeUrl ? `
              <div class="qr-code">
                <p><strong>Votre QR code d'accès :</strong></p>
                <img src="${params.qrCodeUrl}" alt="QR Code" style="max-width: 200px;" />
                <p style="font-size: 14px; color: #718096;">Présentez ce code à l'entrée de l'événement</p>
              </div>
            ` : ''}

            <p style="font-size: 14px; color: #718096; margin-top: 30px;">
              Vous pouvez modifier votre réponse à tout moment en utilisant le lien de votre invitation initiale.
            </p>
          </div>
          <div class="footer">
            <p>Cet email a été envoyé par Invitation Manager</p>
          </div>
        </div>
      </body>
    </html>
  `
}

export function getReminderEmailTemplate(params: {
  guestName: string
  eventName: string
  eventDate: string
  eventVenue: string
  invitationUrl: string
  rsvpDeadline?: string
}) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ed8936 0%, #dd6b20 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #ffffff; padding: 40px 20px; }
          .button { display: inline-block; background: #ed8936; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
          .footer { background: #f7fafc; padding: 20px; text-align: center; font-size: 14px; color: #718096; border-radius: 0 0 8px 8px; }
          .event-details { background: #f7fafc; padding: 20px; border-radius: 6px; margin: 20px 0; }
          .urgent { background: #fff5f5; border-left: 4px solid #ed8936; padding: 15px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⏰ Rappel : Confirmez votre présence</h1>
          </div>
          <div class="content">
            <p>Bonjour ${params.guestName},</p>
            <p>Nous n'avons pas encore reçu votre réponse concernant votre participation à notre événement.</p>

            <div class="event-details">
              <h2 style="margin-top: 0;">${params.eventName}</h2>
              <p><strong>📅 Date :</strong> ${params.eventDate}</p>
              <p><strong>📍 Lieu :</strong> ${params.eventVenue}</p>
            </div>

            ${params.rsvpDeadline ? `
              <div class="urgent">
                <p style="margin: 0;"><strong>⚠️ Date limite de réponse :</strong> ${params.rsvpDeadline}</p>
              </div>
            ` : ''}

            <p>Merci de nous faire savoir si vous serez présent(e) en cliquant sur le bouton ci-dessous :</p>

            <div style="text-align: center;">
              <a href="${params.invitationUrl}" class="button">Répondre maintenant</a>
            </div>

            <p style="font-size: 14px; color: #718096; margin-top: 30px;">
              Votre réponse nous aidera à mieux organiser cet événement. Merci de votre compréhension.
            </p>
          </div>
          <div class="footer">
            <p>Cet email a été envoyé par Invitation Manager</p>
            <p>Si vous avez déjà répondu, veuillez ignorer ce message.</p>
          </div>
        </div>
      </body>
    </html>
  `
}
