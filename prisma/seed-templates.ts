import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('📧 Creating default email templates...')

  // 1. Save the Date Template
  const saveTheDateTemplate = await prisma.emailTemplate.upsert({
    where: { slug: 'save-the-date-default' },
    update: {},
    create: {
      name: 'Save the Date - Par défaut',
      slug: 'save-the-date-default',
      description: 'Template élégant pour annoncer la date de votre événement',
      type: 'INVITE',
      subject: '📅 Save the Date : {{event.name}}',
      isDefault: true,
      htmlContent: `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Save the Date</title>
</head>
<body style="margin: 0; padding: 0; font-family: {{fontFamily}}; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f5f5f5; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header with gradient -->
          <tr>
            <td style="background: linear-gradient(135deg, {{primaryColor}} 0%, {{secondaryColor}} 100%); padding: 60px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 36px; font-weight: 700; letter-spacing: -0.5px;">Save the Date</h1>
              <div style="width: 60px; height: 3px; background-color: {{accentColor}}; margin: 20px auto;"></div>
              <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 18px; opacity: 0.9;">Un événement à ne pas manquer</p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 50px 40px;">
              <p style="margin: 0 0 25px 0; color: #333333; font-size: 18px; line-height: 1.6;">
                Bonjour <strong>{{guest.firstName}}</strong>,
              </p>

              <p style="margin: 0 0 30px 0; color: #555555; font-size: 16px; line-height: 1.8;">
                Nous sommes ravis de vous annoncer que nous organisons un événement exceptionnel et nous aimerions vous y voir !
              </p>

              <!-- Event Box -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-left: 4px solid {{accentColor}}; border-radius: 8px; margin: 30px 0;">
                <tr>
                  <td style="padding: 30px;">
                    <h2 style="margin: 0 0 20px 0; color: {{primaryColor}}; font-size: 28px; font-weight: 700;">{{event.name}}</h2>

                    <table cellpadding="0" cellspacing="0" border="0" style="margin: 15px 0;">
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: {{accentColor}}; font-size: 20px; margin-right: 10px;">📅</span>
                          <span style="color: #333333; font-size: 16px; font-weight: 600;">{{event.date}}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: {{accentColor}}; font-size: 20px; margin-right: 10px;">📍</span>
                          <span style="color: #333333; font-size: 16px;">{{event.location}}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin: 30px 0 20px 0; color: #555555; font-size: 16px; line-height: 1.8;">
                Plus de détails suivront bientôt. En attendant, marquez cette date dans votre agenda !
              </p>

              <p style="margin: 30px 0 0 0; color: #333333; font-size: 16px;">
                À très bientôt,<br>
                <strong>L'équipe {{event.organizerName}}</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 30px 40px; text-align: center; border-top: 1px solid #e9ecef;">
              <p style="margin: 0; color: #6c757d; font-size: 13px; line-height: 1.6;">
                &copy; {{event.organizerName}}. Tous droits réservés.<br>
                Vous recevez cet email car vous êtes inscrit à nos événements.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
      textContent: `Save the Date - {{event.name}}

Bonjour {{guest.firstName}},

Nous sommes ravis de vous annoncer que nous organisons un événement exceptionnel et nous aimerions vous y voir !

📅 Date : {{event.date}}
📍 Lieu : {{event.location}}

Plus de détails suivront bientôt. En attendant, marquez cette date dans votre agenda !

À très bientôt,
L'équipe {{event.organizerName}}`
    }
  })

  console.log(`✓ Save the Date template created: ${saveTheDateTemplate.name}`)

  // 2. Invitation Template
  const invitationTemplate = await prisma.emailTemplate.upsert({
    where: { slug: 'invitation-default' },
    update: {},
    create: {
      name: 'Invitation - Par défaut',
      slug: 'invitation-default',
      description: 'Template complet pour les invitations avec bouton RSVP',
      type: 'INVITE',
      subject: '✨ Vous êtes invité : {{event.name}}',
      isDefault: true,
      htmlContent: `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invitation</title>
</head>
<body style="margin: 0; padding: 0; font-family: {{fontFamily}}; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f5f5f5; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, {{primaryColor}} 0%, {{secondaryColor}} 100%); padding: 50px 40px; text-align: center; position: relative;">
              <div style="position: absolute; top: 20px; right: 20px; background-color: {{accentColor}}; color: #ffffff; padding: 8px 16px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase;">Invitation</div>
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700;">Vous êtes invité !</h1>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 50px 40px;">
              <p style="margin: 0 0 25px 0; color: #333333; font-size: 18px; line-height: 1.6;">
                Bonjour <strong>{{guest.firstName}} {{guest.lastName}}</strong>,
              </p>

              <p style="margin: 0 0 30px 0; color: #555555; font-size: 16px; line-height: 1.8;">
                C'est avec grand plaisir que nous vous invitons à participer à notre événement exceptionnel. Votre présence serait un honneur pour nous !
              </p>

              <!-- Event Details Card -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(135deg, {{primaryColor}}08 0%, {{secondaryColor}}08 100%); border: 2px solid {{accentColor}}; border-radius: 12px; margin: 30px 0;">
                <tr>
                  <td style="padding: 35px;">
                    <h2 style="margin: 0 0 25px 0; color: {{primaryColor}}; font-size: 26px; font-weight: 700; text-align: center;">
                      {{event.name}}
                    </h2>

                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef;">
                          <table cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td style="width: 30px; vertical-align: top;">
                                <span style="color: {{accentColor}}; font-size: 20px;">📅</span>
                              </td>
                              <td>
                                <div style="color: #6c757d; font-size: 13px; margin-bottom: 3px;">Date</div>
                                <div style="color: #333333; font-size: 16px; font-weight: 600;">{{event.date}}</div>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef;">
                          <table cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td style="width: 30px; vertical-align: top;">
                                <span style="color: {{accentColor}}; font-size: 20px;">🕐</span>
                              </td>
                              <td>
                                <div style="color: #6c757d; font-size: 13px; margin-bottom: 3px;">Heure</div>
                                <div style="color: #333333; font-size: 16px; font-weight: 600;">{{event.time}}</div>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0;">
                          <table cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td style="width: 30px; vertical-align: top;">
                                <span style="color: {{accentColor}}; font-size: 20px;">📍</span>
                              </td>
                              <td>
                                <div style="color: #6c757d; font-size: 13px; margin-bottom: 3px;">Lieu</div>
                                <div style="color: #333333; font-size: 16px; font-weight: 600;">{{event.location}}</div>
                                <div style="color: #6c757d; font-size: 14px; margin-top: 3px;">{{event.address}}</div>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 35px 0;">
                <tr>
                  <td align="center">
                    <a href="{{rsvpLink}}" style="display: inline-block; background-color: {{accentColor}}; color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 50px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(255, 71, 19, 0.3); transition: all 0.3s;">
                      Confirmer ma présence
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 30px 0 0 0; color: #555555; font-size: 15px; line-height: 1.8; text-align: center;">
                Merci de confirmer votre présence avant le <strong>{{event.rsvpDeadline}}</strong>
              </p>

              <p style="margin: 35px 0 0 0; color: #333333; font-size: 16px;">
                Nous avons hâte de vous y retrouver !<br><br>
                Cordialement,<br>
                <strong>{{event.organizerName}}</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 30px 40px; text-align: center; border-top: 1px solid #e9ecef;">
              <p style="margin: 0 0 10px 0; color: #6c757d; font-size: 13px; line-height: 1.6;">
                &copy; {{event.organizerName}}. Tous droits réservés.
              </p>
              <p style="margin: 0; color: #adb5bd; font-size: 12px;">
                Vous recevez cet email car vous êtes invité à cet événement.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
      textContent: `Vous êtes invité : {{event.name}}

Bonjour {{guest.firstName}} {{guest.lastName}},

C'est avec grand plaisir que nous vous invitons à participer à notre événement exceptionnel. Votre présence serait un honneur pour nous !

DÉTAILS DE L'ÉVÉNEMENT :
------------------------
📅 Date : {{event.date}}
🕐 Heure : {{event.time}}
📍 Lieu : {{event.location}}
    {{event.address}}

→ Confirmez votre présence : {{rsvpLink}}

Merci de confirmer votre présence avant le {{event.rsvpDeadline}}.

Nous avons hâte de vous y retrouver !

Cordialement,
{{event.organizerName}}`
    }
  })

  console.log(`✓ Invitation template created: ${invitationTemplate.name}`)

  // 3. Confirmation Template
  const confirmationTemplate = await prisma.emailTemplate.upsert({
    where: { slug: 'confirmation-default' },
    update: {},
    create: {
      name: 'Confirmation - Par défaut',
      slug: 'confirmation-default',
      description: 'Template de confirmation de participation avec QR code',
      type: 'CONFIRMATION',
      subject: '✅ Votre participation est confirmée : {{event.name}}',
      isDefault: true,
      htmlContent: `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmation</title>
</head>
<body style="margin: 0; padding: 0; font-family: {{fontFamily}}; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f5f5f5; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
          <!-- Success Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 50px 40px; text-align: center;">
              <div style="width: 70px; height: 70px; background-color: #ffffff; border-radius: 50%; margin: 0 auto 20px auto; display: flex; align-items: center; justify-content: center;">
                <span style="color: #10b981; font-size: 40px;">✓</span>
              </div>
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Participation confirmée !</h1>
              <p style="margin: 15px 0 0 0; color: #ffffff; font-size: 16px; opacity: 0.9;">Nous avons hâte de vous accueillir</p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 50px 40px;">
              <p style="margin: 0 0 25px 0; color: #333333; font-size: 18px; line-height: 1.6;">
                Bonjour <strong>{{guest.firstName}}</strong>,
              </p>

              <p style="margin: 0 0 30px 0; color: #555555; font-size: 16px; line-height: 1.8;">
                Merci d'avoir confirmé votre participation ! Nous sommes ravis de compter sur votre présence.
              </p>

              <!-- Event Summary -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8f9fa; border-radius: 8px; margin: 30px 0;">
                <tr>
                  <td style="padding: 30px;">
                    <h2 style="margin: 0 0 20px 0; color: {{primaryColor}}; font-size: 24px; font-weight: 700;">{{event.name}}</h2>

                    <table cellpadding="0" cellspacing="0" border="0" style="margin: 0;">
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: #10b981; font-size: 18px; margin-right: 12px;">📅</span>
                          <span style="color: #333333; font-size: 15px;">{{event.date}} à {{event.time}}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: #10b981; font-size: 18px; margin-right: 12px;">📍</span>
                          <span style="color: #333333; font-size: 15px;">{{event.location}}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Important Info -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 8px; margin: 30px 0;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0; color: #856404; font-size: 14px; line-height: 1.6;">
                      <strong>📱 Important :</strong> Conservez cet email précieusement. Il vous sera demandé à l'entrée de l'événement pour confirmer votre identité.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- What to Expect -->
              <div style="margin: 35px 0;">
                <h3 style="margin: 0 0 20px 0; color: {{primaryColor}}; font-size: 20px; font-weight: 600;">À quoi s'attendre ?</h3>

                <table cellpadding="0" cellspacing="0" border="0" style="margin: 0;">
                  <tr>
                    <td style="width: 30px; vertical-align: top; padding: 10px 0;">
                      <div style="width: 24px; height: 24px; background-color: {{accentColor}}; border-radius: 50%; color: #ffffff; text-align: center; line-height: 24px; font-size: 12px; font-weight: 600;">1</div>
                    </td>
                    <td style="padding: 10px 0;">
                      <div style="color: #333333; font-size: 15px; font-weight: 600; margin-bottom: 3px;">Arrivée et accueil</div>
                      <div style="color: #6c757d; font-size: 14px;">Présentez-vous à l'accueil avec cet email</div>
                    </td>
                  </tr>
                  <tr>
                    <td style="width: 30px; vertical-align: top; padding: 10px 0;">
                      <div style="width: 24px; height: 24px; background-color: {{accentColor}}; border-radius: 50%; color: #ffffff; text-align: center; line-height: 24px; font-size: 12px; font-weight: 600;">2</div>
                    </td>
                    <td style="padding: 10px 0;">
                      <div style="color: #333333; font-size: 15px; font-weight: 600; margin-bottom: 3px;">Check-in</div>
                      <div style="color: #6c757d; font-size: 14px;">Récupérez votre badge et documents</div>
                    </td>
                  </tr>
                  <tr>
                    <td style="width: 30px; vertical-align: top; padding: 10px 0;">
                      <div style="width: 24px; height: 24px; background-color: {{accentColor}}; border-radius: 50%; color: #ffffff; text-align: center; line-height: 24px; font-size: 12px; font-weight: 600;">3</div>
                    </td>
                    <td style="padding: 10px 0;">
                      <div style="color: #333333; font-size: 15px; font-weight: 600; margin-bottom: 3px;">Profitez de l'événement !</div>
                      <div style="color: #6c757d; font-size: 14px;">Networking, conférences et bien plus</div>
                    </td>
                  </tr>
                </table>
              </div>

              <p style="margin: 35px 0 0 0; color: #333333; font-size: 16px;">
                À très bientôt,<br>
                <strong>L'équipe {{event.organizerName}}</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 30px 40px; text-align: center; border-top: 1px solid #e9ecef;">
              <p style="margin: 0 0 10px 0; color: #6c757d; font-size: 13px; line-height: 1.6;">
                Une question ? Contactez-nous directement.
              </p>
              <p style="margin: 0; color: #adb5bd; font-size: 12px;">
                &copy; {{event.organizerName}}. Tous droits réservés.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
      textContent: `✅ Participation confirmée : {{event.name}}

Bonjour {{guest.firstName}},

Merci d'avoir confirmé votre participation ! Nous sommes ravis de compter sur votre présence.

RÉCAPITULATIF :
---------------
{{event.name}}
📅 {{event.date}} à {{event.time}}
📍 {{event.location}}

IMPORTANT :
Conservez cet email précieusement. Il vous sera demandé à l'entrée de l'événement pour confirmer votre identité.

À QUOI S'ATTENDRE ?
1. Arrivée et accueil - Présentez-vous à l'accueil avec cet email
2. Check-in - Récupérez votre badge et documents
3. Profitez de l'événement ! - Networking, conférences et bien plus

À très bientôt,
L'équipe {{event.organizerName}}`
    }
  })

  console.log(`✓ Confirmation template created: ${confirmationTemplate.name}`)

  console.log('\n✅ All default email templates created successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
