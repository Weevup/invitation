import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ qrCodeId: string }> }
) {
  try {
    const { qrCodeId } = await params
    const body = await request.json()
    const { desk, eventId, manualGuestId } = body

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
        checkedInAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      checkin,
      guest: rsvp.guest
    })
  } catch (error) {
    console.error('Error during checkin:', error)
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
    console.error('Error verifying QR code:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
