import { NextRequest, NextResponse } from 'next/server'
import { validateGuestToken } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const guest = await validateGuestToken(token)

    if (!guest) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Return guest info and event details
    return NextResponse.json({
      guest: {
        id: guest.id,
        firstName: guest.firstName,
        lastName: guest.lastName,
        email: guest.email,
        company: guest.company,
      },
      event: {
        id: guest.event.id,
        name: guest.event.name,
        startsAt: guest.event.startsAt,
        endsAt: guest.event.endsAt,
        venueName: guest.event.venueName,
        address: guest.event.address,
        city: guest.event.city,
        country: guest.event.country,
        description: guest.event.description,
        program: guest.event.program,
        dressCode: guest.event.dressCode,
        rsvpDeadline: guest.event.rsvpDeadline,
        maxPlusOnes: guest.event.maxPlusOnes,
        allowPlusOnes: guest.event.allowPlusOnes,
        requireMeal: guest.event.requireMeal,
        mealOptions: guest.event.mealOptions,
        enableTransport: guest.event.enableTransport,
        enableLodging: guest.event.enableLodging,
        enableAccessibility: guest.event.enableAccessibility,
        enablePhotoConsent: guest.event.enablePhotoConsent,
      },
      rsvp: guest.rsvp,
    })
  } catch (error) {
    console.error('Error fetching guest:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
