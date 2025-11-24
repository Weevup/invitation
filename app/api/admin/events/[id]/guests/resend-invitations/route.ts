import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin, handleAuthError } from '@/lib/auth-utils'
import { requireEventOwnership } from '@/lib/permissions'
import { sendEmailLegacy as sendEmail, renderTemplate } from '@/lib/email-service'
import { createLogger } from '@/lib/logger'

const logger = createLogger({ module: 'resend-invitations' })

/**
 * POST /api/admin/events/[id]/guests/resend-invitations
 * Resends invitations to selected guests
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

    // Get event and selected guests
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        name: true,
        startsAt: true,
        venueName: true,
        city: true,
      },
    })

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    const guests = await prisma.guest.findMany({
      where: {
        id: { in: guestIds },
        eventId,
      },
    })

    if (guests.length === 0) {
      return NextResponse.json(
        { error: 'No valid guests found' },
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

    // Get invitation template
    const invitationTemplate = await prisma.emailTemplate.findFirst({
      where: {
        type: 'INVITATION',
        isActive: true,
      },
      orderBy: [
        { isDefault: 'desc' },
        { updatedAt: 'desc' },
      ],
    })

    if (!invitationTemplate) {
      return NextResponse.json(
        { error: 'No invitation email template configured' },
        { status: 500 }
      )
    }

    let successCount = 0
    let failureCount = 0
    const errors: string[] = []

    // Send invitations
    for (const guest of guests) {
      try {
        const invitationLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/guest/${guest.token}`

        const variables = {
          'guest.firstName': guest.firstName,
          'guest.lastName': guest.lastName || '',
          'guest.email': guest.email,
          'event.name': event.name,
          'event.date': new Date(event.startsAt).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          }),
          'event.time': new Date(event.startsAt).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          'event.location': event.venueName || '',
          'rsvpLink': invitationLink,
          'unsubscribeUrl': `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/unsubscribe?email=${encodeURIComponent(guest.email)}&token=${guest.token}`,
        }

        const renderedSubject = renderTemplate(invitationTemplate.subject, variables)
        const renderedHtml = renderTemplate(invitationTemplate.htmlContent, variables)

        await sendEmail({
          to: guest.email,
          subject: renderedSubject,
          html: renderedHtml,
          eventId,
          guestId: guest.id,
          type: 'INVITATION' as 'INVITATION',
        })

        successCount++
      } catch (error) {
        failureCount++
        logger.error({ error, guestId: guest.id, guestEmail: guest.email }, 'Failed to resend invitation')
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
    logger.error({ error }, 'Error resending invitations')
    return handleAuthError(error)
  }
}
