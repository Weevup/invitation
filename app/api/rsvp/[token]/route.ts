import { NextRequest, NextResponse } from 'next/server'
import { validateGuestToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendEmail, getConfirmationEmailTemplate } from '@/lib/email'
import { generateQRCode, getCheckinUrl } from '@/lib/qrcode'
import { formatDateTime } from '@/lib/utils'

export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const guest = await validateGuestToken(params.token)

    if (!guest) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Validate data
    const {
      attending,
      plusOnes,
      mealChoice,
      allergies,
      accessibilityNotes,
      transportNeeds,
      lodgingNeeds,
      consentPhotos,
    } = body

    // Check if deadline passed
    if (guest.event.rsvpDeadline && new Date(guest.event.rsvpDeadline) < new Date()) {
      return NextResponse.json(
        { error: 'RSVP deadline has passed' },
        { status: 400 }
      )
    }

    // Update or create RSVP
    const rsvp = await prisma.rSVP.upsert({
      where: { guestId: guest.id },
      create: {
        eventId: guest.eventId,
        guestId: guest.id,
        attending: attending ?? null,
        plusOnes: plusOnes || 0,
        mealChoice,
        allergies,
        accessibilityNotes,
        transportNeeds,
        lodgingNeeds,
        consentPhotos: consentPhotos || false,
      },
      update: {
        attending: attending ?? null,
        plusOnes: plusOnes || 0,
        mealChoice,
        allergies,
        accessibilityNotes,
        transportNeeds,
        lodgingNeeds,
        consentPhotos: consentPhotos || false,
        updatedAt: new Date(),
      },
    })

    // Update guest status
    await prisma.guest.update({
      where: { id: guest.id },
      data: { status: 'RESPONDED' },
    })

    // Generate QR code if attending
    let qrCodeData = null
    if (attending) {
      const checkinUrl = getCheckinUrl(rsvp.qrCodeId)
      qrCodeData = await generateQRCode(checkinUrl)
    }

    // Send confirmation email
    const emailHtml = getConfirmationEmailTemplate({
      guestName: guest.firstName,
      eventName: guest.event.name,
      eventDate: formatDateTime(guest.event.startsAt),
      eventVenue: `${guest.event.venueName}, ${guest.event.city}`,
      attending: attending || false,
      qrCodeUrl: qrCodeData || undefined,
    })

    await sendEmail({
      to: guest.email,
      subject: attending
        ? `Confirmation : ${guest.event.name}`
        : `Réponse enregistrée : ${guest.event.name}`,
      html: emailHtml,
      eventId: guest.eventId,
      guestId: guest.id,
      type: 'CONFIRMATION',
    })

    return NextResponse.json({
      success: true,
      rsvp,
      qrCode: qrCodeData,
    })
  } catch (error) {
    console.error('Error saving RSVP:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
