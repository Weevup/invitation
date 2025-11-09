import { Event, Guest, EmailTemplate } from '@prisma/client'
import { prisma } from '@/lib/prisma'

/**
 * Replace template variables with actual values
 */
export function renderTemplate(
  template: string,
  variables: Record<string, any>
): string {
  let rendered = template

  // Replace all {{variable}} patterns
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
    rendered = rendered.replace(regex, String(value || ''))
  })

  return rendered
}

/**
 * Get template variables from event and guest data
 */
export function getTemplateVariables(
  event: Event,
  guest: Guest,
  extraData?: Record<string, any>
) {
  const rsvpLink = `${process.env.NEXT_PUBLIC_APP_URL}/rsvp/${guest.token}`
  const showcaseLink = `${process.env.NEXT_PUBLIC_APP_URL}/events/${event.slug}`

  const eventDate = new Date(event.startsAt)
  const formattedDate = eventDate.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
  const formattedTime = eventDate.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  })

  return {
    // Event data
    'event.name': event.name,
    'event.date': formattedDate,
    'event.time': formattedTime,
    'event.location': event.venueName,
    'event.address': `${event.address}, ${event.city}${event.country ? ', ' + event.country : ''}`,
    'event.city': event.city,
    'event.description': event.description || '',
    'event.organizerName': 'Weevup',

    // Guest data
    'guest.firstName': guest.firstName,
    'guest.lastName': guest.lastName,
    'guest.email': guest.email,
    'guest.fullName': `${guest.firstName} ${guest.lastName}`,

    // Links
    'rsvpLink': rsvpLink,
    'showcaseLink': showcaseLink,
    'unsubscribeLink': `${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe/${guest.token}`,

    // Colors (from template or defaults)
    'primaryColor': extraData?.primaryColor || '#004645',
    'secondaryColor': extraData?.secondaryColor || '#009197',
    'accentColor': extraData?.accentColor || '#FF4713',
    'fontFamily': extraData?.fontFamily || 'Arial, sans-serif',

    // Additional data
    ...extraData
  }
}

/**
 * Get email template by type and render it
 */
export async function getRenderedTemplate(
  templateType: string,
  event: Event,
  guest: Guest
) {
  // Try to find a custom template for this event
  const template = await prisma.emailTemplate.findFirst({
    where: {
      type: templateType,
      isActive: true
    },
    orderBy: {
      isDefault: 'desc' // Prioritize default templates
    }
  })

  if (!template) {
    throw new Error(`No active template found for type: ${templateType}`)
  }

  const variables = getTemplateVariables(event, guest, {
    primaryColor: template.primaryColor,
    secondaryColor: template.secondaryColor,
    accentColor: template.accentColor,
    fontFamily: template.fontFamily
  })

  const html = renderTemplate(template.htmlContent, variables)
  const subject = renderTemplate(template.subject, variables)
  const text = template.textContent
    ? renderTemplate(template.textContent, variables)
    : undefined

  // Update template usage
  await prisma.emailTemplate.update({
    where: { id: template.id },
    data: {
      usageCount: { increment: 1 },
      lastUsedAt: new Date()
    }
  })

  return {
    subject,
    html,
    text,
    template
  }
}

/**
 * Default invitation template (fallback if no template exists)
 */
export const DEFAULT_INVITATION_TEMPLATE = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f5f5f5;
      line-height: 1.6;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #004645 0%, #009197 100%);
      color: #ffffff;
      padding: 40px 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0 0 10px 0;
      font-size: 28px;
      font-weight: 600;
    }
    .header p {
      margin: 0;
      font-size: 16px;
      opacity: 0.9;
    }
    .content {
      padding: 40px 30px;
      color: #333333;
    }
    .content h2 {
      color: #004645;
      font-size: 20px;
      margin: 0 0 20px 0;
    }
    .content p {
      margin: 0 0 15px 0;
      font-size: 16px;
    }
    .button {
      display: inline-block;
      background-color: #FF4713;
      color: #ffffff !important;
      padding: 14px 32px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      font-size: 16px;
      margin: 20px 0;
      transition: background-color 0.2s;
    }
    .button:hover {
      background-color: #e03d0f;
    }
    .info-box {
      background-color: #f9f9f9;
      border-left: 4px solid #009197;
      padding: 20px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .info-box p {
      margin: 5px 0;
      font-size: 15px;
    }
    .info-box strong {
      color: #004645;
    }
    .footer {
      background-color: #f9f9f9;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e0e0e0;
    }
    .footer p {
      margin: 5px 0;
      color: #666666;
      font-size: 13px;
    }
    .footer a {
      color: #009197;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>{{event.name}}</h1>
      <p>📅 {{event.date}} • 📍 {{event.location}}</p>
    </div>

    <div class="content">
      <h2>Bonjour {{guest.firstName}},</h2>

      <p>Nous avons le plaisir de vous inviter à participer à notre événement.</p>

      <div class="info-box">
        <p><strong>📅 Date :</strong> {{event.date}} à {{event.time}}</p>
        <p><strong>📍 Lieu :</strong> {{event.location}}</p>
        <p><strong>📫 Adresse :</strong> {{event.address}}</p>
      </div>

      <p style="text-align: center;">
        <a href="{{rsvpLink}}" class="button">Confirmer ma présence</a>
      </p>

      <p>Nous espérons vous compter parmi nous !</p>

      <p style="margin-top: 30px; color: #666; font-size: 14px;">
        Si vous ne pouvez pas venir, merci de nous en informer via le lien ci-dessus.
      </p>
    </div>

    <div class="footer">
      <p>Cet email a été envoyé par <strong>Weevup</strong></p>
      <p><a href="{{showcaseLink}}">Voir les détails de l'événement</a></p>
      <p style="margin-top: 15px;">
        <a href="{{unsubscribeLink}}" style="color: #999;">Se désinscrire</a>
      </p>
    </div>
  </div>
</body>
</html>`
