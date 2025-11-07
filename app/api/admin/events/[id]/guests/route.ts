import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateGuestToken, hashToken } from '@/lib/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params
    const body = await request.json()

    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    })

    if (!event) {
      return NextResponse.json(
        { error: 'Événement introuvable' },
        { status: 404 }
      )
    }

    // Check if email already exists for this event
    const existingGuest = await prisma.guest.findUnique({
      where: {
        eventId_email: {
          eventId,
          email: body.email,
        },
      },
    })

    if (existingGuest) {
      return NextResponse.json(
        { error: 'Un invité avec cet email existe déjà pour cet événement' },
        { status: 400 }
      )
    }

    // Generate token
    const token = generateGuestToken()
    const tokenHash = hashToken(token)
    const tokenExpiry = new Date()
    tokenExpiry.setDate(tokenExpiry.getDate() + 90) // 90 days validity

    // Create guest
    const guest = await prisma.guest.create({
      data: {
        eventId,
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        company: body.company || null,
        tags: body.tags || [],
        token,
        tokenHash,
        tokenExpiry,
      },
    })

    return NextResponse.json({
      ...guest,
      invitationUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/guest/${token}`,
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating guest:', error)
    return NextResponse.json(
      {
        error: 'Erreur lors de la création de l\'invité',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
