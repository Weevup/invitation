// Templates d'emails pour le cycle complet : Save the Date → Invitation → RSVP

interface SaveTheDateData {
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
  guestName: string;
  logoUrl?: string;
  headerImage?: string;
}

interface InvitationData {
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
  guestName: string;
  logoUrl?: string;
  headerImage?: string;
}

interface ReminderData {
  eventName: string;
  date: string;
  time: string;
  location: string;
  address: string;
  guestName: string;
  qrCodeUrl?: string;
  primaryColor: string;
}

export function generateSaveTheDateEmail(data: SaveTheDateData): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.eventName} - Save the Date</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f5f5f5;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: ${data.backgroundColor};
    }
    .header {
      padding: 40px 20px;
      text-align: center;
      background: linear-gradient(135deg, ${data.primaryColor}, ${data.accentColor});
    }
    ${data.headerImage ? `
    .header-image {
      width: 100%;
      height: 200px;
      object-fit: cover;
    }
    ` : ''}
    .logo {
      max-height: 60px;
      margin-bottom: 20px;
    }
    .tagline {
      color: ${data.accentColor};
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-bottom: 15px;
    }
    .event-name {
      color: ${data.primaryColor};
      font-size: 36px;
      font-weight: bold;
      margin: 20px 0;
      line-height: 1.2;
    }
    .date-location {
      display: flex;
      justify-content: center;
      gap: 30px;
      margin: 30px 0;
      flex-wrap: wrap;
    }
    .info-item {
      display: flex;
      align-items: center;
      gap: 10px;
      color: ${data.primaryColor};
      font-weight: 600;
    }
    .content {
      padding: 40px 20px;
      text-align: center;
    }
    .teaser {
      color: #333;
      font-size: 16px;
      line-height: 1.6;
      margin: 20px 0;
    }
    .cta-button {
      display: inline-block;
      padding: 15px 40px;
      background-color: ${data.secondaryColor};
      color: white;
      text-decoration: none;
      border-radius: 50px;
      font-weight: bold;
      margin: 30px 0;
      font-size: 16px;
    }
    .footer-message {
      color: ${data.primaryColor};
      font-style: italic;
      font-size: 14px;
      margin-top: 30px;
      opacity: 0.8;
    }
    .footer {
      background-color: #f9f9f9;
      padding: 30px 20px;
      text-align: center;
      color: #666;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="container">
    ${data.headerImage ? `<img src="${data.headerImage}" alt="Header" class="header-image" />` : ''}

    <div class="content">
      ${data.logoUrl ? `<img src="${data.logoUrl}" alt="Logo" class="logo" />` : ''}

      <p class="tagline">${data.tagline}</p>

      <h1 class="event-name">${data.eventName}</h1>

      <div class="date-location">
        <div class="info-item">
          <span>📅</span>
          <span>${data.dateAnnouncement}</span>
        </div>
        <div class="info-item">
          <span>📍</span>
          <span>${data.locationHint}</span>
        </div>
      </div>

      <p class="teaser">${data.teaserMessage}</p>

      ${data.ctaLink ? `
        <a href="${data.ctaLink}" class="cta-button">
          ✨ ${data.ctaText}
        </a>
      ` : ''}

      <p class="footer-message">${data.footerMessage}</p>
    </div>

    <div class="footer">
      <p>Cet email a été envoyé à ${data.guestName}</p>
      <p>© ${new Date().getFullYear()} - Tous droits réservés</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

export function generateInvitationEmail(data: InvitationData): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.eventName} - Invitation</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f5f5f5;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: white;
    }
    ${data.headerImage ? `
    .header-image {
      width: 100%;
      height: 250px;
      object-fit: cover;
    }
    ` : ''}
    .content {
      padding: 50px 30px;
      text-align: center;
    }
    .logo {
      max-height: 60px;
      margin-bottom: 20px;
    }
    .welcome {
      color: #666;
      font-size: 18px;
      margin-bottom: 10px;
    }
    .event-name {
      color: ${data.primaryColor};
      font-size: 42px;
      font-weight: bold;
      margin: 20px 0;
      line-height: 1.2;
    }
    .description {
      color: #333;
      font-size: 16px;
      line-height: 1.6;
      margin: 30px 0;
    }
    .event-details {
      background-color: #f9f9f9;
      border-left: 4px solid ${data.secondaryColor};
      padding: 30px;
      margin: 30px 0;
      text-align: left;
    }
    .detail-row {
      display: flex;
      align-items: flex-start;
      margin: 15px 0;
      gap: 15px;
    }
    .detail-icon {
      color: ${data.secondaryColor};
      font-size: 20px;
      min-width: 30px;
    }
    .detail-content {
      color: #333;
    }
    .detail-label {
      font-weight: bold;
      color: ${data.primaryColor};
      margin-bottom: 5px;
    }
    .rsvp-button {
      display: inline-block;
      padding: 18px 50px;
      background: linear-gradient(135deg, ${data.primaryColor}, ${data.secondaryColor});
      color: white;
      text-decoration: none;
      border-radius: 50px;
      font-weight: bold;
      margin: 40px 0 20px;
      font-size: 18px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    }
    .rsvp-note {
      color: #666;
      font-size: 14px;
      margin-top: 10px;
    }
    .footer {
      background-color: #f9f9f9;
      padding: 30px 20px;
      text-align: center;
      color: #666;
      font-size: 12px;
      border-top: 1px solid #e0e0e0;
    }
  </style>
</head>
<body>
  <div class="container">
    ${data.headerImage ? `<img src="${data.headerImage}" alt="Header" class="header-image" />` : ''}

    <div class="content">
      ${data.logoUrl ? `<img src="${data.logoUrl}" alt="Logo" class="logo" />` : ''}

      <p class="welcome">${data.welcomeMessage}</p>

      <h1 class="event-name">${data.eventName}</h1>

      <p class="description">${data.description}</p>

      <div class="event-details">
        <div class="detail-row">
          <div class="detail-icon">📅</div>
          <div class="detail-content">
            <div class="detail-label">Date</div>
            <div>${data.date}</div>
          </div>
        </div>

        <div class="detail-row">
          <div class="detail-icon">🕐</div>
          <div class="detail-content">
            <div class="detail-label">Heure</div>
            <div>${data.time}</div>
          </div>
        </div>

        <div class="detail-row">
          <div class="detail-icon">📍</div>
          <div class="detail-content">
            <div class="detail-label">Lieu</div>
            <div>${data.location}</div>
            <div style="color: #666; margin-top: 5px;">${data.address}</div>
          </div>
        </div>
      </div>

      <a href="${data.rsvpLink}" class="rsvp-button">
        ✓ Confirmer ma présence
      </a>

      <p class="rsvp-note">
        Merci de confirmer votre présence avant le ${new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR')}
      </p>
    </div>

    <div class="footer">
      <p>Invitation personnelle pour ${data.guestName}</p>
      <p>© ${new Date().getFullYear()} - Tous droits réservés</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

export function generateReminderEmail(data: ReminderData): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.eventName} - Rappel</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f5f5f5;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: white;
    }
    .header {
      background: linear-gradient(135deg, ${data.primaryColor}, #FF4713);
      color: white;
      padding: 40px 20px;
      text-align: center;
    }
    .countdown-badge {
      background-color: rgba(255,255,255,0.2);
      display: inline-block;
      padding: 10px 20px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: bold;
      margin-bottom: 15px;
    }
    .event-name {
      font-size: 32px;
      font-weight: bold;
      margin: 15px 0;
    }
    .content {
      padding: 40px 30px;
      text-align: center;
    }
    .reminder-text {
      color: #333;
      font-size: 18px;
      margin: 20px 0;
    }
    .event-info {
      background: linear-gradient(135deg, #f9f9f9, #f0f0f0);
      border-radius: 15px;
      padding: 30px;
      margin: 30px 0;
    }
    .info-item {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      margin: 15px 0;
      font-size: 16px;
      color: #333;
    }
    .qr-code {
      margin: 30px 0;
      padding: 20px;
      background-color: white;
      border-radius: 10px;
      display: inline-block;
    }
    .qr-code img {
      width: 200px;
      height: 200px;
    }
    .qr-note {
      color: #666;
      font-size: 14px;
      margin-top: 10px;
    }
    .tips {
      background-color: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 20px;
      margin: 30px 0;
      text-align: left;
    }
    .tips-title {
      font-weight: bold;
      color: #856404;
      margin-bottom: 10px;
    }
    .tips-list {
      color: #856404;
      font-size: 14px;
      line-height: 1.8;
    }
    .footer {
      background-color: #f9f9f9;
      padding: 30px 20px;
      text-align: center;
      color: #666;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="countdown-badge">⏰ C'est bientôt !</div>
      <h1 class="event-name">${data.eventName}</h1>
      <p>Nous avons hâte de vous voir !</p>
    </div>

    <div class="content">
      <p class="reminder-text">
        Bonjour ${data.guestName},<br><br>
        Nous vous rappelons que vous avez confirmé votre présence à notre événement.
      </p>

      <div class="event-info">
        <div class="info-item">
          <span style="font-size: 24px;">📅</span>
          <strong>${data.date}</strong>
        </div>
        <div class="info-item">
          <span style="font-size: 24px;">🕐</span>
          <strong>${data.time}</strong>
        </div>
        <div class="info-item">
          <span style="font-size: 24px;">📍</span>
          <div>
            <strong>${data.location}</strong><br>
            <span style="font-size: 14px; color: #666;">${data.address}</span>
          </div>
        </div>
      </div>

      ${data.qrCodeUrl ? `
      <div class="qr-code">
        <img src="${data.qrCodeUrl}" alt="QR Code" />
      </div>
      <p class="qr-note">
        Présentez ce QR code à votre arrivée pour un check-in rapide
      </p>
      ` : ''}

      <div class="tips">
        <div class="tips-title">💡 Conseils pratiques</div>
        <div class="tips-list">
          • Prévoyez d'arriver 15 minutes en avance<br>
          • Conservez cet email sur votre téléphone<br>
          • En cas d'empêchement de dernière minute, prévenez-nous
        </div>
      </div>
    </div>

    <div class="footer">
      <p>À très bientôt !</p>
      <p>© ${new Date().getFullYear()} - Tous droits réservés</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

// Fonction helper pour générer un email de relance pour les non-répondants
export function generateFollowUpEmail(data: InvitationData & { daysRemaining: number }): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.eventName} - Relance RSVP</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f5f5f5;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: white;
    }
    .header {
      background: linear-gradient(135deg, #FF4713, #FF6B3D);
      color: white;
      padding: 40px 20px;
      text-align: center;
    }
    .urgency-badge {
      background-color: rgba(255,255,255,0.3);
      display: inline-block;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: bold;
      margin-bottom: 10px;
    }
    .content {
      padding: 40px 30px;
      text-align: center;
    }
    .message {
      color: #333;
      font-size: 16px;
      line-height: 1.6;
      margin: 20px 0;
    }
    .deadline {
      background-color: #fff3cd;
      border: 2px dashed #ffc107;
      padding: 20px;
      margin: 30px 0;
      border-radius: 10px;
    }
    .deadline-text {
      color: #856404;
      font-weight: bold;
      font-size: 18px;
    }
    .rsvp-button {
      display: inline-block;
      padding: 18px 50px;
      background: linear-gradient(135deg, #FF4713, #FF6B3D);
      color: white;
      text-decoration: none;
      border-radius: 50px;
      font-weight: bold;
      margin: 30px 0;
      font-size: 18px;
      box-shadow: 0 4px 15px rgba(255,71,19,0.3);
    }
    .footer {
      background-color: #f9f9f9;
      padding: 30px 20px;
      text-align: center;
      color: #666;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="urgency-badge">⏰ Réponse attendue</div>
      <h1>${data.eventName}</h1>
    </div>

    <div class="content">
      <p class="message">
        Bonjour ${data.guestName},<br><br>
        Nous vous avons envoyé une invitation et n'avons pas encore reçu votre réponse.
        Nous aimerions savoir si vous pourrez être des nôtres !
      </p>

      <div class="deadline">
        <div class="deadline-text">
          ⏳ Plus que ${data.daysRemaining} jours pour répondre
        </div>
      </div>

      <a href="${data.rsvpLink}" class="rsvp-button">
        Répondre maintenant
      </a>

      <p class="message" style="font-size: 14px; color: #666;">
        Votre réponse nous aidera à finaliser l'organisation de l'événement.<br>
        Merci de votre compréhension !
      </p>
    </div>

    <div class="footer">
      <p>© ${new Date().getFullYear()} - Tous droits réservés</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

// ============================================================================
// Simple Templates (Legacy Compatibility)
// These are simpler templates for backward compatibility with existing routes
// ============================================================================

/**
 * Simple invitation email template
 * @deprecated Consider using generateInvitationEmail for richer templates
 */
export function getInvitationEmailTemplate(params: {
  guestName: string
  eventName: string
  eventDate: string
  eventVenue: string
  invitationUrl: string
  unsubscribeUrl?: string
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
            ${params.unsubscribeUrl ? `<p style="font-size: 12px; color: #a0aec0; margin-top: 10px;"><a href="${params.unsubscribeUrl}" style="color: #a0aec0; text-decoration: underline;">Se désabonner</a></p>` : ''}
            <p>Si vous avez reçu cet email par erreur, veuillez l'ignorer.</p>
          </div>
        </div>
      </body>
    </html>
  `
}

/**
 * Simple confirmation email template
 */
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

            ${params.attending ? `
              <div style="background: #edf2f7; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #48bb78;">
                <p style="margin: 0;"><strong>📱 Votre QR code d'accès</strong></p>
                <p style="font-size: 14px; color: #718096; margin: 10px 0 0 0;">
                  Un QR code a été généré et est disponible sur la page de confirmation que vous venez de voir.
                  Vous pouvez le télécharger et le sauvegarder sur votre téléphone pour présentation à l'entrée de l'événement.
                </p>
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

/**
 * Simple reminder email template
 * @deprecated Consider using generateReminderEmail for richer templates
 */
export function getReminderEmailTemplate(params: {
  guestName: string
  eventName: string
  eventDate: string
  eventVenue: string
  invitationUrl: string
  rsvpDeadline?: string
  unsubscribeUrl?: string
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
            ${params.unsubscribeUrl ? `<p style="font-size: 12px; color: #a0aec0; margin-top: 10px;"><a href="${params.unsubscribeUrl}" style="color: #a0aec0; text-decoration: underline;">Se désabonner</a></p>` : ''}
            <p>Si vous avez déjà répondu, veuillez ignorer ce message.</p>
          </div>
        </div>
      </body>
    </html>
  `
}
