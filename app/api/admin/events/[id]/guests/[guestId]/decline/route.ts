import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin, handleAuthError } from '@/lib/auth-utils'
import { requireEventOwnership } from '@/lib/permissions'
import { createLogger } from '@/lib/logger'
import { sendEmailLegacy } from '@/lib/email-service'

const logger = createLogger({ module: 'guest', type: 'manual-decline' })

/**
 * POST /api/admin/events/[id]/guests/[guestId]/decline
 * Manually decline a guest (for manual declinations)
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
    const { sendDeclineEmail = false } = body

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

    // Send decline acknowledgment email if requested
    if (sendDeclineEmail) {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
        const subject = `Votre réponse pour ${guest.event.name}`
        const html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #004645;">Réponse enregistrée</h2>
            <p>Bonjour ${guest.firstName},</p>
            <p>Nous avons bien pris en compte votre réponse concernant <strong>${guest.event.name}</strong>.</p>
            <p>Nous regrettons que vous ne puissiez pas participer et espérons vous revoir lors d'un prochain événement.</p>
            <p>Si vous changez d'avis, vous pouvez toujours accéder à votre invitation :</p>
            <p style="text-align: center; margin: 30px 0;">
              <a href="${baseUrl}/guest/${guest.token}" style="background: #009197; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                Voir mon invitation
              </a>
            </p>
            <p>Cordialement,</p>
          </div>
        `

        await sendEmailLegacy({
          to: guest.email,
          subject,
          html,
          eventId,
          guestId: guest.id,
          type: 'INFO',
        })

        logger.info({ guestId, eventId }, 'Decline email sent for manual declination')
      } catch (emailError) {
        logger.error({ error: emailError, guestId, eventId }, 'Failed to send decline email')
        // Don't fail the decline if email fails
      }
    }

    // If RSVP already exists, update it
    if (guest.rsvp) {
      const updatedRsvp = await prisma.rSVP.update({
        where: { id: guest.rsvp.id },
        data: {
          attending: false,
          respondedAt: new Date(),
          // Keep existing data
        },
      })

      // Add "Déclinaison manuelle" tag to guest
      const currentTags = guest.tags || []
      if (!currentTags.includes('Déclinaison manuelle')) {
        await prisma.guest.update({
          where: { id: guestId },
          data: {
            tags: [...currentTags, 'Déclinaison manuelle'],
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
        'Guest manually declined (RSVP updated)'
      )

      return NextResponse.json({
        success: true,
        message: 'Invité décliné manuellement',
        rsvp: updatedRsvp,
      })
    }

    // Create new minimal RSVP with attending = false
    const newRsvp = await prisma.rSVP.create({
      data: {
        guestId,
        eventId,
        attending: false,
        plusOnes: 0,
        consentPhotos: false,
        respondedAt: new Date(),
        qrCodeId: `manual-decline-${guestId}-${Date.now()}`,
      },
    })

    // Add "Déclinaison manuelle" tag to guest
    const currentTags = guest.tags || []
    if (!currentTags.includes('Déclinaison manuelle')) {
      await prisma.guest.update({
        where: { id: guestId },
        data: {
          tags: [...currentTags, 'Déclinaison manuelle'],
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
      'Guest manually declined (RSVP created)'
    )

    return NextResponse.json({
      success: true,
      message: 'Invité décliné manuellement',
      rsvp: newRsvp,
    })
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      },
      'Error manually declining guest'
    )
    return handleAuthError(error)
  }
}

/**
 * DELETE /api/admin/events/[id]/guests/[guestId]/decline
 * Remove manual decline (set attending back to null)
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
        { error: 'Aucune déclinaison à supprimer' },
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
      'Manual decline removed'
    )

    return NextResponse.json({
      success: true,
      message: 'Déclinaison manuelle supprimée',
      rsvp: updatedRsvp,
    })
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      },
      'Error removing manual decline'
    )
    return handleAuthError(error)
  }
}
