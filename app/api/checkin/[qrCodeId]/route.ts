import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkinRateLimit, getRateLimitIdentifier, getRateLimitHeaders, normalizeRateLimitResult } from '@/lib/rate-limit'
import { checkinSchema, validateSchema } from '@/lib/validations'
import { createLogger } from '@/lib/logger'

const checkinLogger = createLogger({ module: 'checkin' })

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ qrCodeId: string }> }
) {
  try {
    const { qrCodeId } = await params

    // Rate limiting
    const identifier = getRateLimitIdentifier(request, qrCodeId)
    const rawResult = await checkinRateLimit.limit(identifier)
    const rateLimitResult = normalizeRateLimitResult(rawResult)

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: 'RATE_LIMIT_EXCEEDED',
          message: 'Trop de scans en peu de temps. Veuillez ralentir.',
        },
        {
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult)
        }
      )
    }

    const body = await request.json()

    // Validate data with Zod
    const validation = validateSchema(checkinSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'VALIDATION_ERROR',
          message: 'Les données sont invalides',
          errors: validation.errors,
        },
        { status: 400 }
      )
    }

    const { desk, notes } = validation.data

    // Find the RSVP with this QR code
    const rsvp = await prisma.rSVP.findFirst({
      where: { qrCodeId },
      include: {
        guest: true,
        event: true
      }
    })

    if (!rsvp) {
      return NextResponse.json(
        { error: 'QR code invalide' },
        { status: 404 }
      )
    }

    // Check if guest already checked in
    const existingCheckin = await prisma.checkin.findFirst({
      where: {
        guestId: rsvp.guestId,
        eventId: rsvp.eventId
      }
    })

    if (existingCheckin) {
      return NextResponse.json(
        {
          error: 'Invité déjà enregistré',
          alreadyCheckedIn: true,
          existingCheckin,
          guest: rsvp.guest
        },
        { status: 400 }
      )
    }

    // Create checkin
    const checkin = await prisma.checkin.create({
      data: {
        eventId: rsvp.eventId,
        guestId: rsvp.guestId,
        qrCodeId: qrCodeId,
        desk: desk || 'A',
        notes: notes,
        checkedInAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      checkin,
      guest: rsvp.guest
    })
  } catch (error) {
    checkinLogger.error({ error, stack: error instanceof Error ? error.stack : undefined, qrCodeId }, 'Error during checkin')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET endpoint to verify QR code without checking in
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ qrCodeId: string }> }
) {
  try {
    const { qrCodeId } = await params

    const rsvp = await prisma.rSVP.findFirst({
      where: { qrCodeId },
      include: {
        guest: {
          include: {
            checkins: {
              orderBy: { checkedInAt: 'desc' },
              take: 1
            }
          }
        },
        event: {
          select: {
            id: true,
            name: true,
            startsAt: true,
            venueName: true
          }
        }
      }
    })

    if (!rsvp) {
      return NextResponse.json(
        { error: 'QR code invalide' },
        { status: 404 }
      )
    }

    const isCheckedIn = rsvp.guest.checkins && rsvp.guest.checkins.length > 0

    return NextResponse.json({
      guest: rsvp.guest,
      event: rsvp.event,
      rsvp: {
        attending: rsvp.attending,
        plusOnes: rsvp.plusOnes,
        mealChoice: rsvp.mealChoice
      },
      isCheckedIn,
      latestCheckin: isCheckedIn ? rsvp.guest.checkins[0] : null
    })
  } catch (error) {
    checkinLogger.error({ error, stack: error instanceof Error ? error.stack : undefined, qrCodeId }, 'Error verifying QR code')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
