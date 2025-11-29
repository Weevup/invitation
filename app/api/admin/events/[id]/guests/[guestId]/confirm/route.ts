import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin, handleAuthError } from '@/lib/auth-utils'
import { requireEventOwnership } from '@/lib/permissions'
import { createLogger } from '@/lib/logger'
import { sendEmailLegacy } from '@/lib/email-service'

const logger = createLogger({ module: 'guest', type: 'manual-confirm' })

/**
 * POST /api/admin/events/[id]/guests/[guestId]/confirm
 * Manually confirm a guest (for oral confirmations)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; guestId: string }> }
) {
  try {
    const session = await requireAdmin()
    const { id: eventId, guestId } = await params

    // Parse request body for options
    const body = await request.json().catch(() => ({}))
    const { sendConfirmationEmail = false } = body

    // Verify admin owns this event
    await requireEventOwnership(eventId, session.user.id)

    // Check if guest exists and load event details
    const guest = await prisma.guest.findUnique({
      where: { id: guestId },
      include: {
        rsvp: true,
        event: {
          select: {
            id: true,
            name: true,
            startsAt: true,
            venueName: true,
          },
        },
      },
    })

    if (!guest || guest.eventId !== eventId) {
      return NextResponse.json(
        { error: 'Invité introuvable' },
        { status: 404 }
      )
    }

    // Send confirmation email if requested
    if (sendConfirmationEmail) {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
        const subject = `Confirmation de votre participation - ${guest.event.name}`
        const html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #009197;">Confirmation de participation</h2>
            <p>Bonjour ${guest.firstName},</p>
            <p>Nous confirmons votre participation à <strong>${guest.event.name}</strong>.</p>
            <p>Vous pouvez accéder à votre invitation et modifier vos informations à tout moment :</p>
            <p style="text-align: center; margin: 30px 0;">
              <a href="${baseUrl}/guest/${guest.token}" style="background: #009197; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                Voir mon invitation
              </a>
            </p>
            <p>À très bientôt !</p>
          </div>
        `

        await sendEmailLegacy({
          to: guest.email,
          subject,
          html,
          eventId,
          guestId: guest.id,
          type: 'CONFIRMATION',
        })

        logger.info({ guestId, eventId }, 'Confirmation email sent for manual confirmation')
      } catch (emailError) {
        logger.error({ error: emailError, guestId, eventId }, 'Failed to send confirmation email')
        // Don't fail the confirmation if email fails
      }
    }

    // If RSVP already exists, update it
    if (guest.rsvp) {
      const updatedRsvp = await prisma.rSVP.update({
        where: { id: guest.rsvp.id },
        data: {
          attending: true,
          respondedAt: new Date(),
          // Keep existing data
        },
      })

      // Add "Confirmation orale" tag to guest
      const currentTags = guest.tags || []
      if (!currentTags.includes('Confirmation orale')) {
        await prisma.guest.update({
          where: { id: guestId },
          data: {
            tags: [...currentTags, 'Confirmation orale'],
          },
        })
      }

      logger.info(
        {
          guestId,
          eventId,
          rsvpId: updatedRsvp.id,
          adminId: session.user.id,
        },
        'Guest manually confirmed (RSVP updated)'
      )

      return NextResponse.json({
        success: true,
        message: 'Invité confirmé manuellement',
        rsvp: updatedRsvp,
      })
    }

    // Create new minimal RSVP with attending = true
    const newRsvp = await prisma.rSVP.create({
      data: {
        guestId,
        eventId,
        attending: true,
        plusOnes: 0,
        consentPhotos: false,
        respondedAt: new Date(),
        qrCodeId: `manual-${guestId}-${Date.now()}`,
      },
    })

    // Add "Confirmation orale" tag to guest
    const currentTags = guest.tags || []
    if (!currentTags.includes('Confirmation orale')) {
      await prisma.guest.update({
        where: { id: guestId },
        data: {
          tags: [...currentTags, 'Confirmation orale'],
        },
      })
    }

    logger.info(
      {
        guestId,
        eventId,
        rsvpId: newRsvp.id,
        adminId: session.user.id,
      },
      'Guest manually confirmed (RSVP created)'
    )

    return NextResponse.json({
      success: true,
      message: 'Invité confirmé manuellement',
      rsvp: newRsvp,
    })
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      },
      'Error manually confirming guest'
    )
    return handleAuthError(error)
  }
}

/**
 * DELETE /api/admin/events/[id]/guests/[guestId]/confirm
 * Remove manual confirmation (set attending back to null)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; guestId: string }> }
) {
  try {
    const session = await requireAdmin()
    const { id: eventId, guestId } = await params

    // Verify admin owns this event
    await requireEventOwnership(eventId, session.user.id)

    // Check if guest exists
    const guest = await prisma.guest.findUnique({
      where: { id: guestId },
      include: {
        rsvp: true,
      },
    })

    if (!guest || guest.eventId !== eventId) {
      return NextResponse.json(
        { error: 'Invité introuvable' },
        { status: 404 }
      )
    }

    if (!guest.rsvp) {
      return NextResponse.json(
        { error: 'Aucune confirmation à supprimer' },
        { status: 404 }
      )
    }

    // Set attending back to null
    const updatedRsvp = await prisma.rSVP.update({
      where: { id: guest.rsvp.id },
      data: {
        attending: null,
      },
    })

    logger.info(
      {
        guestId,
        eventId,
        rsvpId: updatedRsvp.id,
        adminId: session.user.id,
      },
      'Manual confirmation removed'
    )

    return NextResponse.json({
      success: true,
      message: 'Confirmation manuelle supprimée',
      rsvp: updatedRsvp,
    })
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      },
      'Error removing manual confirmation'
    )
    return handleAuthError(error)
  }
}
