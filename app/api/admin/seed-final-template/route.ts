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
        title: 'Prêt pour la soirée ?',
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
      id: 'text-intro',
      type: 'text',
      order: 2,
      content: {
        html: `<p style="font-size: 16px; color: #1e293b;">Bonjour <strong>{{guest.firstName}}</strong>,</p>
<p style="font-size: 15px; color: #475569; line-height: 1.7;">Nous sommes heureux de vous compter parmi les invités. Vous trouverez ci-dessous votre accès personnel ainsi que les informations essentielles pour préparer votre venue.</p>`,
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
        html: `<div style="background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; padding: 30px; text-align: center;">
          <h3 style="margin: 0 0 10px; color: #1e293b; font-size: 18px; font-weight: 600;">Votre QR code d'accès</h3>
          <p style="margin: 0 0 20px; color: #64748b; font-size: 14px;">À présenter à l'arrivée, sur votre téléphone ou imprimé.</p>
          <div style="background: #ffffff; padding: 15px; border-radius: 12px; display: inline-block; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">{{qrCode}}</div>
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
      content: { height: 'large' },
    },
    {
      id: 'text-infos-title',
      type: 'text',
      order: 6,
      content: {
        html: `<h2 style="margin: 0 0 20px; color: #1e293b; font-size: 20px; font-weight: 600; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">📍 Informations pratiques</h2>`,
        fontSize: 'medium',
        align: 'left',
        color: '#1e293b',
        padding: 'small',
      },
    },
    {
      id: 'text-infos',
      type: 'text',
      order: 7,
      content: {
        html: `<table style="width: 100%; font-size: 15px; color: #334155;">
          <tr><td style="padding: 8px 0; color: #64748b; width: 100px;">Date</td><td style="padding: 8px 0; font-weight: 500;">{{event.date}}</td></tr>
          <tr><td style="padding: 8px 0; color: #64748b;">À partir de</td><td style="padding: 8px 0; font-weight: 500;">{{event.time}}</td></tr>
          <tr><td style="padding: 8px 0; color: #64748b;">Lieu</td><td style="padding: 8px 0; font-weight: 500;">{{event.location}}</td></tr>
          <tr><td style="padding: 8px 0; color: #64748b;">Adresse</td><td style="padding: 8px 0; font-weight: 500;">{{event.address}}</td></tr>
        </table>`,
        fontSize: 'medium',
        align: 'left',
        color: '#334155',
        padding: 'medium',
      },
    },
    {
      id: 'text-acces',
      type: 'text',
      order: 8,
      content: {
        html: `<div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px 20px; border-radius: 0 8px 8px 0; margin-top: 15px;">
          <p style="margin: 0 0 5px; color: #92400e; font-size: 14px; font-weight: 600;">🚪 Accès</p>
          <p style="margin: 0; color: #a16207; font-size: 14px;">L'entrée se fait par la piscine intérieure, à l'adresse indiquée.<br/>Veuillez ne pas passer par l'entrée principale de l'hôtel.</p>
        </div>`,
        fontSize: 'medium',
        align: 'left',
        color: '#1e293b',
        padding: 'small',
      },
    },
    {
      id: 'spacer-4',
      type: 'spacer',
      order: 9,
      content: { height: 'large' },
    },
    {
      id: 'text-prepare-title',
      type: 'text',
      order: 10,
      content: {
        html: `<h2 style="margin: 0 0 20px; color: #1e293b; font-size: 20px; font-weight: 600; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">✨ Préparez votre venue</h2>`,
        fontSize: 'medium',
        align: 'left',
        color: '#1e293b',
        padding: 'small',
      },
    },
    {
      id: 'text-dresscode',
      type: 'text',
      order: 11,
      content: {
        html: `<div style="margin-bottom: 20px;">
          <p style="margin: 0 0 5px; color: #1e293b; font-size: 15px; font-weight: 600;">👔 Dress Code</p>
          <p style="margin: 0; color: #64748b; font-size: 14px;">Tenue de soirée élégante recommandée.</p>
        </div>`,
        fontSize: 'medium',
        align: 'left',
        color: '#1e293b',
        padding: 'small',
      },
    },
    {
      id: 'text-cadeau',
      type: 'text',
      order: 12,
      content: {
        html: `<div style="margin-bottom: 20px;">
          <p style="margin: 0 0 5px; color: #1e293b; font-size: 15px; font-weight: 600;">🎁 Cadeau</p>
          <p style="margin: 0; color: #64748b; font-size: 14px;">Vous êtes invité à apporter un cadeau pour l'association Elise Princesse Courageuse.</p>
        </div>`,
        fontSize: 'medium',
        align: 'left',
        color: '#1e293b',
        padding: 'small',
      },
    },
    {
      id: 'text-piscine',
      type: 'text',
      order: 13,
      content: {
        html: `<div style="margin-bottom: 20px;">
          <p style="margin: 0 0 5px; color: #1e293b; font-size: 15px; font-weight: 600;">🏊 Piscine</p>
          <p style="margin: 0; color: #64748b; font-size: 14px;">La piscine sera accessible. Si vous souhaitez en profiter, prévoyez votre maillot.</p>
        </div>`,
        fontSize: 'medium',
        align: 'left',
        color: '#1e293b',
        padding: 'small',
      },
    },
    {
      id: 'text-oeuvres',
      type: 'text',
      order: 14,
      content: {
        html: `<div style="margin-bottom: 20px;">
          <p style="margin: 0 0 5px; color: #1e293b; font-size: 15px; font-weight: 600;">🖼️ Œuvres d'art</p>
          <p style="margin: 0; color: #64748b; font-size: 14px;">Des œuvres seront exposées dans les anciennes cabines. Merci d'y accorder une attention particulière.</p>
        </div>`,
        fontSize: 'medium',
        align: 'left',
        color: '#1e293b',
        padding: 'small',
      },
    },
    {
      id: 'spacer-5',
      type: 'spacer',
      order: 15,
      content: { height: 'large' },
    },
    {
      id: 'text-rappels',
      type: 'text',
      order: 16,
      content: {
        html: `<div style="background: #f0fdf4; border-radius: 12px; padding: 25px;">
          <h3 style="margin: 0 0 15px; color: #166534; font-size: 16px; font-weight: 600;">💡 Pour profiter pleinement de la soirée</h3>
          <ul style="margin: 0; padding: 0 0 0 20px; color: #15803d; font-size: 14px; line-height: 1.8;">
            <li>Conservez cet email et votre QR code à portée de main</li>
            <li>En cas d'empêchement, informez-nous directement en répondant à ce message</li>
          </ul>
        </div>`,
        fontSize: 'medium',
        align: 'left',
        color: '#166534',
        padding: 'medium',
      },
    },
    {
      id: 'spacer-6',
      type: 'spacer',
      order: 17,
      content: { height: 'large' },
    },
    {
      id: 'text-conclusion',
      type: 'text',
      order: 18,
      content: {
        html: `<p style="font-size: 15px; color: #475569; line-height: 1.7;">Nous avons hâte de célébrer avec vous et de partager une soirée exceptionnelle.</p>
<p style="font-size: 16px; color: #1e293b; font-weight: 500; margin-top: 15px;">À très bientôt.</p>`,
        fontSize: 'medium',
        align: 'left',
        color: '#475569',
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
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f0f4f8; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f0f4f8;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%); padding: 50px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                Prêt pour la soirée ?
              </h1>
              <p style="margin: 15px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">
                {{event.name}}
              </p>
            </td>
          </tr>

          <!-- Introduction -->
          <tr>
            <td style="padding: 40px 40px 20px;">
              <p style="margin: 0; color: #1e293b; font-size: 16px; line-height: 1.6;">
                Bonjour <strong>{{guest.firstName}}</strong>,
              </p>
              <p style="margin: 20px 0 0; color: #475569; font-size: 15px; line-height: 1.7;">
                Nous sommes heureux de vous compter parmi les invités. Vous trouverez ci-dessous votre accès personnel ainsi que les informations essentielles pour préparer votre venue.
              </p>
            </td>
          </tr>

          <!-- QR Code Section -->
          <tr>
            <td style="padding: 20px 40px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
                <tr>
                  <td style="padding: 30px; text-align: center;">
                    <h3 style="margin: 0 0 10px; color: #1e293b; font-size: 18px; font-weight: 600;">
                      Votre QR code d'accès
                    </h3>
                    <p style="margin: 0 0 20px; color: #64748b; font-size: 14px;">
                      À présenter à l'arrivée, sur votre téléphone ou imprimé.
                    </p>
                    <div style="background: #ffffff; padding: 15px; border-radius: 12px; display: inline-block; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
                      {{qrCode}}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Informations pratiques -->
          <tr>
            <td style="padding: 30px 40px 20px;">
              <h2 style="margin: 0 0 20px; color: #1e293b; font-size: 20px; font-weight: 600; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">
                📍 Informations pratiques
              </h2>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font-size: 15px; color: #334155;">
                <tr>
                  <td style="padding: 10px 0; color: #64748b; width: 100px; vertical-align: top;">Date</td>
                  <td style="padding: 10px 0; font-weight: 500;">{{event.date}}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #64748b; vertical-align: top;">À partir de</td>
                  <td style="padding: 10px 0; font-weight: 500;">{{event.time}}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #64748b; vertical-align: top;">Lieu</td>
                  <td style="padding: 10px 0; font-weight: 500;">{{event.location}}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #64748b; vertical-align: top;">Adresse</td>
                  <td style="padding: 10px 0; font-weight: 500;">{{event.address}}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Accès -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 0 8px 8px 0;">
                <tr>
                  <td style="padding: 15px 20px;">
                    <p style="margin: 0 0 5px; color: #92400e; font-size: 14px; font-weight: 600;">🚪 Accès</p>
                    <p style="margin: 0; color: #a16207; font-size: 14px; line-height: 1.6;">
                      L'entrée se fait par la piscine intérieure, à l'adresse indiquée.<br/>
                      Veuillez ne pas passer par l'entrée principale de l'hôtel.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Préparez votre venue -->
          <tr>
            <td style="padding: 20px 40px;">
              <h2 style="margin: 0 0 25px; color: #1e293b; font-size: 20px; font-weight: 600; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">
                ✨ Préparez votre venue
              </h2>

              <!-- Dress Code -->
              <div style="margin-bottom: 25px;">
                <p style="margin: 0 0 5px; color: #1e293b; font-size: 15px; font-weight: 600;">👔 Dress Code</p>
                <p style="margin: 0; color: #64748b; font-size: 14px; line-height: 1.6;">Tenue de soirée élégante recommandée.</p>
              </div>

              <!-- Cadeau -->
              <div style="margin-bottom: 25px;">
                <p style="margin: 0 0 5px; color: #1e293b; font-size: 15px; font-weight: 600;">🎁 Cadeau</p>
                <p style="margin: 0; color: #64748b; font-size: 14px; line-height: 1.6;">Vous êtes invité à apporter un cadeau pour l'association Elise Princesse Courageuse.</p>
              </div>

              <!-- Piscine -->
              <div style="margin-bottom: 25px;">
                <p style="margin: 0 0 5px; color: #1e293b; font-size: 15px; font-weight: 600;">🏊 Piscine</p>
                <p style="margin: 0; color: #64748b; font-size: 14px; line-height: 1.6;">La piscine sera accessible. Si vous souhaitez en profiter, prévoyez votre maillot.</p>
              </div>

              <!-- Œuvres d'art -->
              <div style="margin-bottom: 10px;">
                <p style="margin: 0 0 5px; color: #1e293b; font-size: 15px; font-weight: 600;">🖼️ Œuvres d'art</p>
                <p style="margin: 0; color: #64748b; font-size: 14px; line-height: 1.6;">Des œuvres seront exposées dans les anciennes cabines. Merci d'y accorder une attention particulière.</p>
              </div>
            </td>
          </tr>

          <!-- Rappels -->
          <tr>
            <td style="padding: 20px 40px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f0fdf4; border-radius: 12px;">
                <tr>
                  <td style="padding: 25px;">
                    <h3 style="margin: 0 0 15px; color: #166534; font-size: 16px; font-weight: 600;">
                      💡 Pour profiter pleinement de la soirée
                    </h3>
                    <ul style="margin: 0; padding: 0 0 0 20px; color: #15803d; font-size: 14px; line-height: 1.8;">
                      <li>Conservez cet email et votre QR code à portée de main</li>
                      <li>En cas d'empêchement, informez-nous directement en répondant à ce message</li>
                    </ul>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Conclusion -->
          <tr>
            <td style="padding: 30px 40px 20px;">
              <p style="margin: 0; color: #475569; font-size: 15px; line-height: 1.7;">
                Nous avons hâte de célébrer avec vous et de partager une soirée exceptionnelle.
              </p>
              <p style="margin: 20px 0 0; color: #1e293b; font-size: 16px; font-weight: 500;">
                À très bientôt.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 25px 40px; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="margin: 0; color: #64748b; font-size: 13px;">
                Une question ? Répondez directement à cet email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

const textContent = `Prêt pour la soirée ?
{{event.name}}

Bonjour {{guest.firstName}},

Nous sommes heureux de vous compter parmi les invités. Vous trouverez ci-dessous votre accès personnel ainsi que les informations essentielles pour préparer votre venue.

📍 INFORMATIONS PRATIQUES
Date : {{event.date}}
À partir de : {{event.time}}
Lieu : {{event.location}}
Adresse : {{event.address}}

🚪 ACCÈS
L'entrée se fait par la piscine intérieure, à l'adresse indiquée.
Veuillez ne pas passer par l'entrée principale de l'hôtel.

✨ PRÉPAREZ VOTRE VENUE

👔 Dress Code
Tenue de soirée élégante recommandée.

🎁 Cadeau
Vous êtes invité à apporter un cadeau pour l'association Elise Princesse Courageuse.

🏊 Piscine
La piscine sera accessible. Si vous souhaitez en profiter, prévoyez votre maillot.

🖼️ Œuvres d'art
Des œuvres seront exposées dans les anciennes cabines. Merci d'y accorder une attention particulière.

💡 POUR PROFITER PLEINEMENT DE LA SOIRÉE
- Conservez cet email et votre QR code à portée de main
- En cas d'empêchement, informez-nous directement en répondant à ce message

Nous avons hâte de célébrer avec vous et de partager une soirée exceptionnelle.

À très bientôt.`

// POST - Create the Final Access template (one-time use)
export async function POST() {
  try {
    await requireAdmin()

    const templateData = {
      name: 'Confirmation & Accès (avec QR Code)',
      description: 'Email final avec QR code d\'entrée pour les invités confirmés',
      type: 'INFO' as const,
      subject: '🎫 Bienvenue - {{event.name}}',
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
