import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin, handleAuthError } from '@/lib/auth-utils'
import { requireEventOwnership } from '@/lib/permissions'
import { sendEmail as sendEmailDirect, renderTemplate, TemplateVariables } from '@/lib/email-service'
import { generateQRCode, getCheckinUrl } from '@/lib/qrcode'
import { formatDateTime } from '@/lib/utils'
import { createLogger } from '@/lib/logger'

const logger = createLogger({ module: 'send-final-invites' })

/**
 * POST /api/admin/events/[id]/guests/send-final-invites
 * Sends final convocation emails with QR code to confirmed guests
 *
 * Body: { guestIds: string[] }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin()
    const { id: eventId } = await params
    await requireEventOwnership(eventId, session.user.id)

    const body = await request.json()
    const { guestIds, templateId } = body as { guestIds: string[], templateId?: string }

    if (!guestIds || guestIds.length === 0) {
      return NextResponse.json(
        { error: 'No guests selected' },
        { status: 400 }
      )
    }

    // Limit to 100 guests at once to avoid overload
    if (guestIds.length > 100) {
      return NextResponse.json(
        { error: 'Maximum 100 guests can be processed at once' },
        { status: 400 }
      )
    }

    // Get event details
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        name: true,
        startsAt: true,
        endsAt: true,
        venueName: true,
        address: true,
        city: true,
        description: true,
      },
    })

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    // Get selected guests with their RSVPs (only confirmed ones)
    const guests = await prisma.guest.findMany({
      where: {
        id: { in: guestIds },
        eventId,
        rsvp: {
          attending: true, // Only send to confirmed guests
        },
      },
      include: {
        rsvp: true,
      },
    })

    if (guests.length === 0) {
      return NextResponse.json(
        { error: 'No confirmed guests found in the selection' },
        { status: 404 }
      )
    }

    // Get active email integration
    const emailIntegration = await prisma.emailIntegration.findFirst({
      where: { isActive: true, isPrimary: true },
    })

    if (!emailIntegration) {
      return NextResponse.json(
        { error: 'No active email integration configured' },
        { status: 500 }
      )
    }

    // Get template - prioritize user-selected templateId
    let convocationTemplate = null

    if (templateId) {
      // User selected a specific template
      convocationTemplate = await prisma.emailTemplate.findFirst({
        where: {
          id: templateId,
          isActive: true,
        },
      })
    }

    // Fallback: try to find a template with slug 'final-convocation'
    if (!convocationTemplate) {
      convocationTemplate = await prisma.emailTemplate.findFirst({
        where: {
          slug: 'final-convocation',
          isActive: true,
        },
      })
    }

    // Fallback: try to find a generic INFO template
    if (!convocationTemplate) {
      convocationTemplate = await prisma.emailTemplate.findFirst({
        where: {
          type: 'INFO',
          isActive: true,
        },
        orderBy: [
          { isDefault: 'desc' },
          { updatedAt: 'desc' },
        ],
      })
    }

    let successCount = 0
    let failureCount = 0
    const errors: string[] = []

    // Build venue string
    let eventVenue = event.venueName || ''
    if (event.city) {
      eventVenue += eventVenue ? `, ${event.city}` : event.city
    }

    // Send convocations
    for (const guest of guests) {
      try {
        if (!guest.rsvp) continue

        // Generate QR code for check-in
        const checkinUrl = getCheckinUrl(guest.rsvp.qrCodeId)
        const qrCodeDataUrl = await generateQRCode(checkinUrl)

        let emailHtml: string
        let emailSubject: string

        if (convocationTemplate) {
          // Use custom template
          const variables: TemplateVariables = {
            'guest.firstName': guest.firstName,
            'guest.lastName': guest.lastName || '',
            'guest.email': guest.email,
            'event.name': event.name,
            'event.date': formatDateTime(event.startsAt),
            'event.time': new Date(event.startsAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
            'event.location': eventVenue,
            'event.address': event.address || '',
            'event.description': event.description || '',
            'qrCode': qrCodeDataUrl, // QR code as data URL
            'unsubscribeUrl': `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/unsubscribe?email=${encodeURIComponent(guest.email)}&token=${guest.token}`,
          }

          emailHtml = renderTemplate(convocationTemplate.htmlContent, variables)
          emailSubject = renderTemplate(convocationTemplate.subject, variables)
        } else {
          // Use default template
          emailSubject = `🎫 Votre confirmation : ${event.name}`
          emailHtml = generateDefaultConvocationEmail({
            guestName: guest.firstName,
            eventName: event.name,
            eventDate: formatDateTime(event.startsAt),
            eventTime: new Date(event.startsAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
            eventEndTime: event.endsAt ? new Date(event.endsAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : undefined,
            eventLocation: eventVenue,
            eventAddress: event.address || '',
            eventCity: event.city || undefined,
            eventDescription: event.description || undefined,
            qrCodeDataUrl,
            plusOnes: guest.rsvp?.plusOnes || 0,
            mealChoice: guest.rsvp?.mealChoice || undefined,
            allergies: guest.rsvp?.allergies || undefined,
            qrCodeId: guest.rsvp.qrCodeId,
          })
        }

        // Send email
        const emailResult = await sendEmailDirect(
          {
            to: guest.email,
            from: emailIntegration.fromEmail || 'noreply@example.com',
            fromName: emailIntegration.fromName || 'Weevup',
            subject: emailSubject,
            html: emailHtml,
          },
          {
            id: emailIntegration.id,
            provider: emailIntegration.provider,
            apiKey: emailIntegration.apiKey,
            apiSecret: emailIntegration.apiSecret,
            smtpHost: emailIntegration.smtpHost,
            smtpPort: emailIntegration.smtpPort,
            smtpUser: emailIntegration.smtpUser,
            smtpPass: emailIntegration.smtpPass,
            fromEmail: emailIntegration.fromEmail,
            fromName: emailIntegration.fromName,
            replyTo: emailIntegration.replyTo,
            trackOpens: emailIntegration.trackOpens,
            trackClicks: emailIntegration.trackClicks,
          }
        )

        if (emailResult.success) {
          // Log email send
          await prisma.emailLog.create({
            data: {
              eventId,
              guestId: guest.id,
              type: 'INFO',
              status: 'SENT',
              subject: emailSubject,
              providerId: emailResult.messageId,
              sentAt: new Date(),
            },
          })

          // Update guest to mark convocation sent
          await prisma.guest.update({
            where: { id: guest.id },
            data: { lastEmailAt: new Date() },
          })

          successCount++
        } else {
          throw new Error(emailResult.error || 'Email send failed')
        }
      } catch (error) {
        failureCount++
        logger.error({ error, guestId: guest.id, guestEmail: guest.email }, 'Failed to send final convocation')
        errors.push(`${guest.firstName} ${guest.lastName || ''} (${guest.email})`)
      }
    }

    return NextResponse.json({
      success: true,
      sent: successCount,
      failed: failureCount,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    logger.error({ error }, 'Error sending final convocations')
    return handleAuthError(error)
  }
}

/**
 * Generates a default convocation email with QR code
 */
function generateDefaultConvocationEmail(params: {
  guestName: string
  eventName: string
  eventDate: string
  eventTime: string
  eventEndTime?: string
  eventLocation: string
  eventAddress: string
  eventCity?: string
  eventDescription?: string
  qrCodeDataUrl: string
  plusOnes?: number
  mealChoice?: string
  allergies?: string
  qrCodeId: string
}): string {
  // Build Google Maps link
  const mapQuery = encodeURIComponent(`${params.eventAddress} ${params.eventCity || ''}`.trim())
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`

  // Build calendar link (Google Calendar)
  const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(params.eventName)}&location=${encodeURIComponent(`${params.eventLocation}, ${params.eventAddress}`)}&details=${encodeURIComponent(params.eventDescription || '')}`

  // Plus ones section
  const plusOnesHtml = params.plusOnes && params.plusOnes > 0 ? `
        <div class="info-card">
          <div class="info-icon">👥</div>
          <div class="info-content">
            <div class="info-label">Accompagnants</div>
            <div class="info-value">${params.plusOnes} personne${params.plusOnes > 1 ? 's' : ''}</div>
          </div>
        </div>` : ''

  // Meal section
  const mealHtml = params.mealChoice ? `
        <div class="info-card">
          <div class="info-icon">🍽️</div>
          <div class="info-content">
            <div class="info-label">Menu sélectionné</div>
            <div class="info-value">${params.mealChoice}</div>
            ${params.allergies ? `<div class="info-note">Allergies/régime : ${params.allergies}</div>` : ''}
          </div>
        </div>` : ''

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${params.eventName} - Votre Convocation</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f0f4f8; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f0f4f8;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0, 70, 69, 0.12);">

          <!-- Header avec gradient -->
          <tr>
            <td style="background: linear-gradient(135deg, #004645 0%, #009197 50%, #00b4a0 100%); padding: 50px 40px; text-align: center;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <span style="display: inline-block; background-color: rgba(255,255,255,0.2); color: white; padding: 8px 20px; border-radius: 50px; font-size: 12px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 20px;">
                      ✓ Confirmation de participation
                    </span>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 20px;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; line-height: 1.2;">
                      ${params.eventName}
                    </h1>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 15px;">
                    <p style="margin: 0; color: rgba(255,255,255,0.9); font-size: 16px;">
                      Votre présence est confirmée !
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Message de bienvenue -->
          <tr>
            <td style="padding: 40px 40px 20px;">
              <p style="margin: 0; color: #1a1a1a; font-size: 18px; line-height: 1.6;">
                Bonjour <strong>${params.guestName}</strong>,
              </p>
              <p style="margin: 20px 0 0; color: #4a5568; font-size: 16px; line-height: 1.7;">
                Nous avons le plaisir de vous confirmer votre inscription. Veuillez trouver ci-dessous votre convocation avec toutes les informations pratiques et votre <strong>QR code d'accès personnel</strong>.
              </p>
            </td>
          </tr>

          <!-- Informations événement -->
          <tr>
            <td style="padding: 20px 40px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border-radius: 12px; border: 1px solid #e2e8f0;">
                <tr>
                  <td style="padding: 30px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <!-- Date -->
                      <tr>
                        <td style="padding-bottom: 20px;">
                          <table role="presentation" cellspacing="0" cellpadding="0">
                            <tr>
                              <td style="width: 50px; vertical-align: top;">
                                <div style="width: 44px; height: 44px; background: linear-gradient(135deg, #004645, #009197); border-radius: 10px; text-align: center; line-height: 44px; font-size: 20px;">
                                  📅
                                </div>
                              </td>
                              <td style="vertical-align: middle; padding-left: 15px;">
                                <div style="color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Date</div>
                                <div style="color: #1e293b; font-size: 16px; font-weight: 600;">${params.eventDate}</div>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <!-- Heure -->
                      <tr>
                        <td style="padding-bottom: 20px;">
                          <table role="presentation" cellspacing="0" cellpadding="0">
                            <tr>
                              <td style="width: 50px; vertical-align: top;">
                                <div style="width: 44px; height: 44px; background: linear-gradient(135deg, #004645, #009197); border-radius: 10px; text-align: center; line-height: 44px; font-size: 20px;">
                                  🕐
                                </div>
                              </td>
                              <td style="vertical-align: middle; padding-left: 15px;">
                                <div style="color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Horaire</div>
                                <div style="color: #1e293b; font-size: 16px; font-weight: 600;">${params.eventTime}${params.eventEndTime ? ` - ${params.eventEndTime}` : ''}</div>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <!-- Lieu -->
                      <tr>
                        <td>
                          <table role="presentation" cellspacing="0" cellpadding="0">
                            <tr>
                              <td style="width: 50px; vertical-align: top;">
                                <div style="width: 44px; height: 44px; background: linear-gradient(135deg, #004645, #009197); border-radius: 10px; text-align: center; line-height: 44px; font-size: 20px;">
                                  📍
                                </div>
                              </td>
                              <td style="vertical-align: middle; padding-left: 15px;">
                                <div style="color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Lieu</div>
                                <div style="color: #1e293b; font-size: 16px; font-weight: 600;">${params.eventLocation}</div>
                                <div style="color: #64748b; font-size: 14px; margin-top: 4px;">${params.eventAddress}</div>
                                <a href="${mapsUrl}" target="_blank" style="display: inline-block; margin-top: 10px; color: #009197; font-size: 13px; text-decoration: none; font-weight: 500;">
                                  📍 Voir sur Google Maps →
                                </a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- QR Code Section -->
          <tr>
            <td style="padding: 20px 40px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: linear-gradient(135deg, #004645 0%, #006666 100%); border-radius: 16px; overflow: hidden;">
                <tr>
                  <td style="padding: 35px; text-align: center;">
                    <h2 style="margin: 0 0 10px; color: #ffffff; font-size: 20px; font-weight: 600;">
                      🎫 Votre Pass d'Entrée
                    </h2>
                    <p style="margin: 0 0 25px; color: rgba(255,255,255,0.85); font-size: 14px;">
                      Présentez ce QR code à l'accueil pour un enregistrement rapide
                    </p>
                    <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
                      <tr>
                        <td style="background-color: #ffffff; padding: 15px; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.2);">
                          <img src="${params.qrCodeDataUrl}" alt="QR Code d'accès" width="180" height="180" style="display: block; border-radius: 8px;" />
                        </td>
                      </tr>
                    </table>
                    <p style="margin: 20px 0 0; color: rgba(255,255,255,0.7); font-size: 12px;">
                      Code unique : ${params.qrCodeId.substring(0, 8).toUpperCase()}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          ${plusOnesHtml || mealHtml ? `
          <!-- Détails personnels -->
          <tr>
            <td style="padding: 20px 40px;">
              <h3 style="margin: 0 0 15px; color: #1e293b; font-size: 16px; font-weight: 600;">
                📋 Récapitulatif de votre inscription
              </h3>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
                <tr>
                  <td style="padding: 20px;">
                    ${params.plusOnes && params.plusOnes > 0 ? `
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: ${params.mealChoice ? '15px' : '0'};">
                      <tr>
                        <td style="width: 40px; vertical-align: top; font-size: 20px;">👥</td>
                        <td style="vertical-align: top;">
                          <div style="color: #64748b; font-size: 12px; text-transform: uppercase; margin-bottom: 4px;">Accompagnants</div>
                          <div style="color: #1e293b; font-size: 15px; font-weight: 500;">${params.plusOnes} personne${params.plusOnes > 1 ? 's' : ''}</div>
                        </td>
                      </tr>
                    </table>
                    ` : ''}
                    ${params.mealChoice ? `
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="width: 40px; vertical-align: top; font-size: 20px;">🍽️</td>
                        <td style="vertical-align: top;">
                          <div style="color: #64748b; font-size: 12px; text-transform: uppercase; margin-bottom: 4px;">Menu sélectionné</div>
                          <div style="color: #1e293b; font-size: 15px; font-weight: 500;">${params.mealChoice}</div>
                          ${params.allergies ? `<div style="color: #64748b; font-size: 13px; margin-top: 4px;">Allergies/régime : ${params.allergies}</div>` : ''}
                        </td>
                      </tr>
                    </table>
                    ` : ''}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          ` : ''}

          <!-- Informations importantes -->
          <tr>
            <td style="padding: 20px 40px;">
              <h3 style="margin: 0 0 15px; color: #1e293b; font-size: 16px; font-weight: 600;">
                ⚠️ Informations importantes
              </h3>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <!-- Tenue -->
                <tr>
                  <td style="padding-bottom: 12px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #fef3c7; border-radius: 10px; border-left: 4px solid #f59e0b;">
                      <tr>
                        <td style="padding: 15px 20px;">
                          <table role="presentation" cellspacing="0" cellpadding="0">
                            <tr>
                              <td style="width: 35px; vertical-align: top; font-size: 20px;">👔</td>
                              <td style="vertical-align: top;">
                                <div style="color: #92400e; font-size: 14px; font-weight: 600; margin-bottom: 4px;">Dress code</div>
                                <div style="color: #a16207; font-size: 13px;">Tenue de soirée élégante recommandée</div>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- Cadeau -->
                <tr>
                  <td style="padding-bottom: 12px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #fce7f3; border-radius: 10px; border-left: 4px solid #ec4899;">
                      <tr>
                        <td style="padding: 15px 20px;">
                          <table role="presentation" cellspacing="0" cellpadding="0">
                            <tr>
                              <td style="width: 35px; vertical-align: top; font-size: 20px;">🎁</td>
                              <td style="vertical-align: top;">
                                <div style="color: #9d174d; font-size: 14px; font-weight: 600; margin-bottom: 4px;">Cadeau</div>
                                <div style="color: #be185d; font-size: 13px;">N'oubliez pas d'apporter un cadeau pour les mariés !</div>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- Piscine -->
                <tr>
                  <td style="padding-bottom: 12px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #e0f2fe; border-radius: 10px; border-left: 4px solid #0ea5e9;">
                      <tr>
                        <td style="padding: 15px 20px;">
                          <table role="presentation" cellspacing="0" cellpadding="0">
                            <tr>
                              <td style="width: 35px; vertical-align: top; font-size: 20px;">🏊</td>
                              <td style="vertical-align: top;">
                                <div style="color: #0369a1; font-size: 14px; font-weight: 600; margin-bottom: 4px;">Piscine disponible</div>
                                <div style="color: #0284c7; font-size: 13px;">Pensez à prendre votre maillot de bain si vous souhaitez profiter de la piscine</div>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- Attention aux oeuvres -->
                <tr>
                  <td>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #fee2e2; border-radius: 10px; border-left: 4px solid #ef4444;">
                      <tr>
                        <td style="padding: 15px 20px;">
                          <table role="presentation" cellspacing="0" cellpadding="0">
                            <tr>
                              <td style="width: 35px; vertical-align: top; font-size: 20px;">🖼️</td>
                              <td style="vertical-align: top;">
                                <div style="color: #b91c1c; font-size: 14px; font-weight: 600; margin-bottom: 4px;">Attention aux œuvres d'art</div>
                                <div style="color: #dc2626; font-size: 13px;">Le lieu contient des œuvres d'art précieuses. Merci de faire attention et de ne pas les toucher.</div>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Conseils pratiques -->
          <tr>
            <td style="padding: 20px 40px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #ecfdf5; border-radius: 12px; border-left: 4px solid #10b981;">
                <tr>
                  <td style="padding: 20px 25px;">
                    <h3 style="margin: 0 0 12px; color: #065f46; font-size: 15px; font-weight: 600;">
                      💡 Rappels pratiques
                    </h3>
                    <ul style="margin: 0; padding: 0 0 0 20px; color: #047857; font-size: 14px; line-height: 1.8;">
                      <li>Arrivez <strong>15 minutes avant</strong> le début de l'événement</li>
                      <li>Gardez cet email accessible sur votre téléphone</li>
                      <li>L'adresse exacte est indiquée ci-dessus avec le lien Google Maps</li>
                      <li>En cas d'empêchement, prévenez-nous dès que possible</li>
                    </ul>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Bouton Calendrier -->
          <tr>
            <td style="padding: 20px 40px 30px; text-align: center;">
              <a href="${calendarUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #009197, #00b4a0); color: #ffffff; text-decoration: none; padding: 14px 30px; border-radius: 8px; font-size: 14px; font-weight: 600; box-shadow: 0 4px 14px rgba(0, 145, 151, 0.4);">
                📅 Ajouter à mon calendrier
              </a>
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
</html>
  `.trim()
}
