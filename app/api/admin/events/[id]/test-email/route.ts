import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail, renderTemplate } from '@/lib/email-service'
import { requireAdmin, handleAuthError } from '@/lib/auth-utils'
import { requireEventOwnership } from '@/lib/permissions'
import { createLogger } from '@/lib/logger'

const logger = createLogger({ module: 'test-email-api' })

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin()
    const { id: eventId } = await params

    // Verify ownership
    await requireEventOwnership(eventId, session.user.id)

    const body = await request.json()
    const { templateId, testEmail, templateType } = body

    if (!testEmail) {
      return NextResponse.json(
        { error: 'Email destinataire requis' },
        { status: 400 }
      )
    }

    // Get event details for variables
    const event = await prisma.event.findUnique({
      where: { id: eventId }
    })

    if (!event) {
      return NextResponse.json(
        { error: 'Événement non trouvé' },
        { status: 404 }
      )
    }

    // Get template
    let template
    if (templateId) {
      template = await prisma.emailTemplate.findUnique({
        where: { id: templateId }
      })
    } else if (templateType) {
      // Find template by type/slug
      template = await prisma.emailTemplate.findFirst({
        where: {
          OR: [
            { type: templateType },
            { slug: templateType }
          ],
          isActive: true
        }
      })
    }

    if (!template) {
      return NextResponse.json(
        { error: 'Template non trouvé' },
        { status: 404 }
      )
    }

    // Get email integration
    const emailIntegration = await prisma.emailIntegration.findFirst({
      where: {
        isPrimary: true,
        isActive: true
      }
    })

    if (!emailIntegration) {
      return NextResponse.json(
        { error: 'Aucune intégration email active trouvée' },
        { status: 400 }
      )
    }

    // Prepare test variables
    const variables = {
      'guest.firstName': 'Test',
      'guest.lastName': 'Utilisateur',
      'guest.email': testEmail,
      'event.name': event.name,
      'event.date': new Date(event.startsAt).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      'event.time': new Date(event.startsAt).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      'event.location': `${event.venueName || 'Lieu'}, ${event.city || 'Ville'}`,
      'event.address': event.address || 'Adresse de l\'événement',
      'rsvpLink': `${process.env.NEXT_PUBLIC_APP_URL || 'https://app.weevup.com'}/rsvp/test-token`,
    }

    // Render template
    const htmlContent = renderTemplate(template.htmlContent, variables)
    const subject = renderTemplate(template.subject, variables)

    // Send test email
    const result = await sendEmail(
      {
        to: testEmail,
        subject: `[TEST] ${subject}`,
        html: htmlContent,
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

    if (result.success) {
      logger.info({ templateId, testEmail, eventId }, 'Test email sent successfully')
      return NextResponse.json({
        success: true,
        message: `Email de test envoyé à ${testEmail}`,
        messageId: result.messageId
      })
    } else {
      logger.error({ error: result.error, templateId, testEmail }, 'Failed to send test email')
      return NextResponse.json(
        { error: result.error || 'Échec de l\'envoi' },
        { status: 500 }
      )
    }

  } catch (error) {
    logger.error({ error }, 'Error in test email API')
    return handleAuthError(error)
  }
}
