import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin, handleAuthError } from '@/lib/auth-utils'
import { requireEventOwnership } from '@/lib/permissions'
import { createLogger } from '@/lib/logger'
import { nanoid } from 'nanoid'

const logger = createLogger({ module: 'manual-checkin' })

/**
 * POST /api/admin/events/[id]/checkin/manual
 * Check in a guest manually by guest ID (without QR code)
 * Creates RSVP if needed
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
    const { guestId, desk, notes } = body as { guestId: string; desk?: string; notes?: string }

    if (!guestId) {
      return NextResponse.json(
        { error: 'Guest ID required' },
        { status: 400 }
      )
    }

    // Find the guest
    const guest = await prisma.guest.findFirst({
      where: {
        id: guestId,
        eventId,
      },
      include: {
        rsvp: true,
        checkins: {
          orderBy: { checkedInAt: 'desc' },
          take: 1
        }
      }
    })

    if (!guest) {
      return NextResponse.json(
        { error: 'Guest not found' },
        { status: 404 }
      )
    }

    // Check if already checked in
    if (guest.checkins && guest.checkins.length > 0) {
      return NextResponse.json(
        {
          error: 'Invité déjà enregistré',
          alreadyCheckedIn: true,
          existingCheckin: guest.checkins[0],
          guest: {
            id: guest.id,
            firstName: guest.firstName,
            lastName: guest.lastName,
            email: guest.email,
            company: guest.company,
          }
        },
        { status: 400 }
      )
    }

    // If no RSVP, create one (confirm the guest)
    let rsvp = guest.rsvp
    if (!rsvp) {
      rsvp = await prisma.rSVP.create({
        data: {
          guestId: guest.id,
          eventId,
          attending: true,
          qrCodeId: nanoid(12),
          plusOnes: 0,
          consentPhotos: true,
          respondedAt: new Date(),
        }
      })
      logger.info({ guestId, eventId }, 'Created RSVP for manual check-in')
    } else if (rsvp.attending !== true) {
      // Update RSVP to attending if not already
      rsvp = await prisma.rSVP.update({
        where: { id: rsvp.id },
        data: { attending: true, respondedAt: new Date() }
      })
    }

    // Create checkin
    const checkin = await prisma.checkin.create({
      data: {
        eventId,
        guestId: guest.id,
        qrCodeId: rsvp.qrCodeId,
        desk: desk || 'Manual',
        notes: notes || 'Check-in manuel sans QR code',
        checkedInAt: new Date()
      }
    })

    logger.info({ guestId, eventId, checkinId: checkin.id }, 'Manual check-in successful')

    return NextResponse.json({
      success: true,
      checkin,
      guest: {
        id: guest.id,
        firstName: guest.firstName,
        lastName: guest.lastName,
        email: guest.email,
        company: guest.company,
      },
      rsvpCreated: !guest.rsvp
    })
  } catch (error) {
    logger.error({ error }, 'Error during manual checkin')
    return handleAuthError(error)
  }
}
