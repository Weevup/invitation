import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin, handleAuthError } from '@/lib/auth-utils'

// Block structure for WYSIWYG editor
const blocksJson = JSON.stringify({
  id: 'final-access-qrcode',
  name: 'Confirmation & Accès (avec QR Code)',
  globalStyles: {
    fontFamily: 'Arial',
    primaryColor: '#1e3a5f',
    secondaryColor: '#2d5a87',
    backgroundColor: '#f0f4f8',
    containerWidth: 600,
  },
  blocks: [
    {
      id: 'header-1',
      type: 'header',
      order: 0,
      content: {
        title: '🎫 Confirmation d\'accès',
        subtitle: '{{event.name}}',
        backgroundColor: '#1e3a5f',
        textColor: '#FFFFFF',
        align: 'center',
      },
    },
    {
      id: 'spacer-1',
      type: 'spacer',
      order: 1,
      content: { height: 'large' },
    },
    {
      id: 'text-1',
      type: 'text',
      order: 2,
      content: {
        html: '<p>Bonjour <strong>{{guest.firstName}}</strong>,</p><p>Votre participation est confirmée ! Voici toutes les informations importantes pour le jour J.</p>',
        fontSize: 'medium',
        align: 'left',
        color: '#1e293b',
        padding: 'medium',
      },
    },
    {
      id: 'spacer-2',
      type: 'spacer',
      order: 3,
      content: { height: 'medium' },
    },
    {
      id: 'qrcode-section',
      type: 'text',
      order: 4,
      content: {
        html: `<div style="background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); border-radius: 12px; border: 2px solid #cbd5e1; padding: 30px; text-align: center;">
          <p style="margin: 0 0 15px; color: #1e293b; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">🎫 Votre QR Code d'entrée</p>
          <div style="background: #ffffff; padding: 15px; border-radius: 12px; display: inline-block; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">{{qrCode}}</div>
          <p style="margin: 15px 0 0; color: #64748b; font-size: 13px;">Présentez ce code à l'entrée</p>
        </div>`,
        fontSize: 'medium',
        align: 'center',
        color: '#1e293b',
        padding: 'medium',
      },
    },
    {
      id: 'spacer-3',
      type: 'spacer',
      order: 5,
      content: { height: 'medium' },
    },
    {
      id: 'infobox-event',
      type: 'infoBox',
      order: 6,
      content: {
        icon: '📅',
        title: 'Détails de l\'événement',
        description: 'Date : {{event.date}}\nHeure : {{event.time}}\nLieu : {{event.location}}\nAdresse : {{event.address}}',
        backgroundColor: '#f1f5f9',
        borderColor: '#2d5a87',
      },
    },
    {
      id: 'spacer-4',
      type: 'spacer',
      order: 7,
      content: { height: 'medium' },
    },
    {
      id: 'text-important',
      type: 'text',
      order: 8,
      content: {
        html: '<h3 style="color: #1e293b; margin-bottom: 15px;">⚠️ Informations importantes</h3>',
        fontSize: 'medium',
        align: 'left',
        color: '#1e293b',
        padding: 'small',
      },
    },
    {
      id: 'twocolumn-1',
      type: 'twoColumn',
      order: 9,
      content: {
        leftColumn: '<div style="background: #fef3c7; border-radius: 10px; padding: 15px; text-align: center;"><p style="font-size: 20px; margin: 0;">👔</p><p style="margin: 8px 0 0; color: #92400e; font-size: 13px; font-weight: 600;">Dress code</p><p style="margin: 4px 0 0; color: #a16207; font-size: 12px;">Tenue de soirée élégante</p></div>',
        rightColumn: '<div style="background: #fce7f3; border-radius: 10px; padding: 15px; text-align: center;"><p style="font-size: 20px; margin: 0;">🎁</p><p style="margin: 8px 0 0; color: #9d174d; font-size: 13px; font-weight: 600;">Cadeau</p><p style="margin: 4px 0 0; color: #be185d; font-size: 12px;">N\'oubliez pas d\'apporter un cadeau</p></div>',
        leftWidth: 50,
        rightWidth: 50,
        gap: 'medium',
      },
    },
    {
      id: 'spacer-5',
      type: 'spacer',
      order: 10,
      content: { height: 'small' },
    },
    {
      id: 'twocolumn-2',
      type: 'twoColumn',
      order: 11,
      content: {
        leftColumn: '<div style="background: #dbeafe; border-radius: 10px; padding: 15px; text-align: center;"><p style="font-size: 20px; margin: 0;">🏊</p><p style="margin: 8px 0 0; color: #1e40af; font-size: 13px; font-weight: 600;">Piscine</p><p style="margin: 4px 0 0; color: #1d4ed8; font-size: 12px;">Disponible - pensez au maillot</p></div>',
        rightColumn: '<div style="background: #fee2e2; border-radius: 10px; padding: 15px; text-align: center;"><p style="font-size: 20px; margin: 0;">🖼️</p><p style="margin: 8px 0 0; color: #991b1b; font-size: 13px; font-weight: 600;">Œuvres d\'art</p><p style="margin: 4px 0 0; color: #dc2626; font-size: 12px;">Attention aux œuvres exposées</p></div>',
        leftWidth: 50,
        rightWidth: 50,
        gap: 'medium',
      },
    },
    {
      id: 'spacer-6',
      type: 'spacer',
      order: 12,
      content: { height: 'medium' },
    },
    {
      id: 'infobox-rappels',
      type: 'infoBox',
      order: 13,
      content: {
        icon: '💡',
        title: 'Rappels',
        description: '• Arrivez 15 minutes avant le début\n• Gardez cet email accessible sur votre téléphone\n• En cas d\'empêchement, prévenez-nous',
        backgroundColor: '#ecfdf5',
        borderColor: '#10b981',
      },
    },
    {
      id: 'spacer-7',
      type: 'spacer',
      order: 14,
      content: { height: 'large' },
    },
    {
      id: 'text-footer',
      type: 'text',
      order: 15,
      content: {
        html: '<p style="text-align: center; color: #1e293b; font-size: 16px; font-weight: 600;">À très bientôt ! 🎉</p><p style="text-align: center; color: #64748b; font-size: 13px;">Une question ? Répondez directement à cet email.</p>',
        fontSize: 'small',
        align: 'center',
        color: '#64748b',
        padding: 'medium',
      },
    },
  ],
})

const htmlContent = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{event.name}} - Votre Confirmation</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f0f4f8;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f0f4f8;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08); overflow: hidden;">

          <!-- Header with gradient -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%); padding: 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                🎫 Confirmation d'accès
              </h1>
              <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">
                {{event.name}}
              </p>
            </td>
          </tr>

          <!-- Welcome message -->
          <tr>
            <td style="padding: 40px 40px 20px;">
              <p style="margin: 0; color: #1e293b; font-size: 18px; line-height: 1.6;">
                Bonjour <strong>{{guest.firstName}}</strong>,
              </p>
              <p style="margin: 15px 0 0; color: #475569; font-size: 16px; line-height: 1.7;">
                Votre participation est confirmée ! Voici toutes les informations importantes pour le jour J.
              </p>
            </td>
          </tr>

          <!-- QR Code Section -->
          <tr>
            <td style="padding: 20px 40px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); border-radius: 12px; border: 2px solid #cbd5e1;">
                <tr>
                  <td style="padding: 30px; text-align: center;">
                    <p style="margin: 0 0 15px; color: #1e293b; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                      Votre QR Code d'entrée
                    </p>
                    <div style="background: #ffffff; padding: 15px; border-radius: 12px; display: inline-block; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                      {{qrCode}}
                    </div>
                    <p style="margin: 15px 0 0; color: #64748b; font-size: 13px;">
                      Présentez ce code à l'entrée
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Event Details -->
          <tr>
            <td style="padding: 20px 40px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; border-radius: 12px;">
                <tr>
                  <td style="padding: 25px;">
                    <h3 style="margin: 0 0 20px; color: #1e293b; font-size: 16px; font-weight: 600;">
                      📅 Détails de l'événement
                    </h3>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="padding: 8px 0; color: #64748b; font-size: 14px; width: 100px;">Date</td>
                        <td style="padding: 8px 0; color: #1e293b; font-size: 14px; font-weight: 500;">{{event.date}}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Heure</td>
                        <td style="padding: 8px 0; color: #1e293b; font-size: 14px; font-weight: 500;">{{event.time}}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Lieu</td>
                        <td style="padding: 8px 0; color: #1e293b; font-size: 14px; font-weight: 500;">{{event.location}}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Adresse</td>
                        <td style="padding: 8px 0; color: #1e293b; font-size: 14px; font-weight: 500;">{{event.address}}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Important Info Cards -->
          <tr>
            <td style="padding: 20px 40px;">
              <h3 style="margin: 0 0 15px; color: #1e293b; font-size: 16px; font-weight: 600;">
                ⚠️ Informations importantes
              </h3>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td width="50%" style="padding: 8px 8px 8px 0; vertical-align: top;">
                    <div style="background: #fef3c7; border-radius: 10px; padding: 15px; height: 100%;">
                      <p style="margin: 0; font-size: 20px;">👔</p>
                      <p style="margin: 8px 0 0; color: #92400e; font-size: 13px; font-weight: 600;">Dress code</p>
                      <p style="margin: 4px 0 0; color: #a16207; font-size: 12px;">Tenue de soirée élégante</p>
                    </div>
                  </td>
                  <td width="50%" style="padding: 8px 0 8px 8px; vertical-align: top;">
                    <div style="background: #fce7f3; border-radius: 10px; padding: 15px; height: 100%;">
                      <p style="margin: 0; font-size: 20px;">🎁</p>
                      <p style="margin: 8px 0 0; color: #9d174d; font-size: 13px; font-weight: 600;">Cadeau</p>
                      <p style="margin: 4px 0 0; color: #be185d; font-size: 12px;">N'oubliez pas d'apporter un cadeau</p>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td width="50%" style="padding: 8px 8px 8px 0; vertical-align: top;">
                    <div style="background: #dbeafe; border-radius: 10px; padding: 15px; height: 100%;">
                      <p style="margin: 0; font-size: 20px;">🏊</p>
                      <p style="margin: 8px 0 0; color: #1e40af; font-size: 13px; font-weight: 600;">Piscine</p>
                      <p style="margin: 4px 0 0; color: #1d4ed8; font-size: 12px;">Disponible - pensez au maillot</p>
                    </div>
                  </td>
                  <td width="50%" style="padding: 8px 0 8px 8px; vertical-align: top;">
                    <div style="background: #fee2e2; border-radius: 10px; padding: 15px; height: 100%;">
                      <p style="margin: 0; font-size: 20px;">🖼️</p>
                      <p style="margin: 8px 0 0; color: #991b1b; font-size: 13px; font-weight: 600;">Œuvres d'art</p>
                      <p style="margin: 4px 0 0; color: #dc2626; font-size: 12px;">Attention aux œuvres exposées</p>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Reminders -->
          <tr>
            <td style="padding: 20px 40px 30px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #ecfdf5; border-radius: 10px; border-left: 4px solid #10b981;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 10px; color: #047857; font-size: 14px; font-weight: 600;">
                      💡 Rappels
                    </p>
                    <ul style="margin: 0; padding: 0 0 0 20px; color: #047857; font-size: 14px; line-height: 1.8;">
                      <li>Arrivez <strong>15 minutes avant</strong> le début</li>
                      <li>Gardez cet email accessible sur votre téléphone</li>
                      <li>En cas d'empêchement, prévenez-nous</li>
                    </ul>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 30px 40px; border-top: 1px solid #e2e8f0;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <p style="margin: 0 0 10px; color: #1e293b; font-size: 16px; font-weight: 600;">
                      À très bientôt ! 🎉
                    </p>
                    <p style="margin: 0; color: #64748b; font-size: 13px; line-height: 1.6;">
                      Une question ? Répondez directement à cet email.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Copyright -->
          <tr>
            <td style="background-color: #1e293b; padding: 20px 40px; text-align: center;">
              <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                © ${new Date().getFullYear()} - Généré par Weevup
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

const textContent = `🎫 CONFIRMATION - {{event.name}}

Bonjour {{guest.firstName}},

Votre participation est confirmée ! Voici les informations importantes.

📅 DATE : {{event.date}}
🕐 HEURE : {{event.time}}
📍 LIEU : {{event.location}}
{{event.address}}

⚠️ INFORMATIONS IMPORTANTES :
- 👔 Dress code : Tenue de soirée élégante
- 🎁 N'oubliez pas d'apporter un cadeau
- 🏊 Piscine disponible - pensez au maillot
- 🖼️ Attention aux œuvres d'art

💡 RAPPELS :
- Arrivez 15 minutes en avance
- Gardez cet email sur votre téléphone
- Présentez le QR code à l'entrée

À très bientôt !`

// POST - Create the Final Access template (one-time use)
export async function POST() {
  try {
    await requireAdmin()

    const templateData = {
      name: 'Confirmation & Accès (avec QR Code)',
      description: 'Email final avec QR code d\'entrée pour les invités confirmés',
      type: 'INFO' as const,
      subject: '🎫 Votre confirmation : {{event.name}}',
      isDefault: true,
      htmlContent,
      textContent,
      blocksJson,
      primaryColor: '#1e3a5f',
      secondaryColor: '#2d5a87',
      accentColor: '#10b981',
      fontFamily: 'Arial, sans-serif',
    }

    const template = await prisma.emailTemplate.upsert({
      where: { slug: 'final-access-qrcode' },
      update: templateData,
      create: {
        ...templateData,
        slug: 'final-access-qrcode',
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Template créé avec succès',
      template: {
        id: template.id,
        name: template.name,
        slug: template.slug
      }
    })
  } catch (error) {
    return handleAuthError(error)
  }
}
