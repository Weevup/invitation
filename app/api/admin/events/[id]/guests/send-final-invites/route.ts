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
    const { guestIds } = body as { guestIds: string[] }

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

    // Get final convocation template (or create default)
    let convocationTemplate = await prisma.emailTemplate.findFirst({
      where: {
        slug: 'final-convocation',
        isActive: true,
      },
    })

    // If no specific template, try to find a generic INFO template
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
          emailSubject = `Convocation : ${event.name}`
          emailHtml = generateDefaultConvocationEmail({
            guestName: guest.firstName,
            eventName: event.name,
            eventDate: formatDateTime(event.startsAt),
            eventTime: new Date(event.startsAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
            eventLocation: eventVenue,
            eventAddress: event.address || '',
            qrCodeDataUrl,
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
  eventLocation: string
  eventAddress: string
  qrCodeDataUrl: string
}): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${params.eventName} - Convocation</title>
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
      background: linear-gradient(135deg, #004645, #009197);
      color: white;
      padding: 40px 20px;
      text-align: center;
    }
    .badge {
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
    .greeting {
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
    .qr-section {
      margin: 40px 0;
      padding: 30px;
      background-color: #f7fafc;
      border-radius: 15px;
    }
    .qr-title {
      color: #004645;
      font-size: 20px;
      font-weight: bold;
      margin-bottom: 20px;
    }
    .qr-code {
      background-color: white;
      padding: 20px;
      border-radius: 10px;
      display: inline-block;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .qr-code img {
      width: 200px;
      height: 200px;
    }
    .qr-note {
      color: #666;
      font-size: 14px;
      margin-top: 15px;
    }
    .tips {
      background-color: #e6f7f7;
      border-left: 4px solid #009197;
      padding: 20px;
      margin: 30px 0;
      text-align: left;
      border-radius: 0 10px 10px 0;
    }
    .tips-title {
      font-weight: bold;
      color: #004645;
      margin-bottom: 10px;
    }
    .tips-list {
      color: #004645;
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
      <div class="badge">Convocation officielle</div>
      <h1 class="event-name">${params.eventName}</h1>
      <p>Nous avons le plaisir de vous accueillir !</p>
    </div>

    <div class="content">
      <p class="greeting">
        Bonjour ${params.guestName},<br><br>
        Votre participation a bien ete enregistree. Voici votre convocation officielle avec votre QR code d'acces.
      </p>

      <div class="event-info">
        <div class="info-item">
          <span style="font-size: 24px;">&#128197;</span>
          <strong>${params.eventDate}</strong>
        </div>
        <div class="info-item">
          <span style="font-size: 24px;">&#128336;</span>
          <strong>${params.eventTime}</strong>
        </div>
        <div class="info-item">
          <span style="font-size: 24px;">&#128205;</span>
          <div>
            <strong>${params.eventLocation}</strong><br>
            <span style="font-size: 14px; color: #666;">${params.eventAddress}</span>
          </div>
        </div>
      </div>

      <div class="qr-section">
        <div class="qr-title">&#128274; Votre QR Code d'acces</div>
        <div class="qr-code">
          <img src="${params.qrCodeDataUrl}" alt="QR Code" />
        </div>
        <p class="qr-note">
          Presentez ce QR code a l'entree pour un enregistrement rapide.<br>
          Conservez cet email sur votre telephone ou imprimez-le.
        </p>
      </div>

      <div class="tips">
        <div class="tips-title">&#128161; Informations pratiques</div>
        <div class="tips-list">
          &#8226; Prevoyez d'arriver 15 minutes en avance<br>
          &#8226; Conservez cet email sur votre telephone<br>
          &#8226; En cas d'empechement de derniere minute, prevenez-nous
        </div>
      </div>
    </div>

    <div class="footer">
      <p>A tres bientot !</p>
      <p>&copy; ${new Date().getFullYear()} - Tous droits reserves</p>
    </div>
  </div>
</body>
</html>
  `.trim()
}
