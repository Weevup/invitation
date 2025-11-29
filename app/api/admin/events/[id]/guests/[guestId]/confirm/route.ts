import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin, handleAuthError } from '@/lib/auth-utils'
import { requireEventOwnership } from '@/lib/permissions'
import { createLogger } from '@/lib/logger'

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
