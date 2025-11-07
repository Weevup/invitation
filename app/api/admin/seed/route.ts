import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateGuestToken, hashToken } from '@/lib/auth'
import crypto from 'crypto'

export async function POST() {
  try {
    // Check if events already exist
    const existingEvents = await prisma.event.findMany()
    if (existingEvents.length > 0) {
      return NextResponse.json(
        { error: 'Database already contains events. Clear the database first if you want to reseed.' },
        { status: 400 }
      )
    }

    // Create admin user if not exists
    let adminUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } })
    if (!adminUser) {
      adminUser = await prisma.user.create({
        data: {
          email: 'admin@weevup.com',
          role: 'ADMIN',
        },
      })
    }

    // Create Weevup 10th anniversary event
    const event = await prisma.event.create({
      data: {
        name: '10 ans de Weevup',
        slug: '10-ans-de-weevup-' + Date.now(),
        description: 'Célébration des 10 ans de l\'agence Weevup au Molitor Paris',
        startsAt: new Date('2025-06-15T19:00:00'),
        venueName: 'Molitor Paris',
        address: '13 Rue Nungesser et Coli',
        city: 'Paris 75016',
        country: 'France',
        adminId: adminUser.id,
        // Showcase defaults
        showcaseEnabled: false,
        showcaseTheme: 'weevup',
        showcasePrimaryColor: '#004645',
        showcaseSecondaryColor: '#FF4713',
        showcaseSections: ['hero', 'description', 'details', 'cta'],
      },
    })

    // Create demo guests
    const demoGuests = [
      { firstName: 'Sophie', lastName: 'Martin', email: 'sophie.martin@example.com', company: 'Tech Solutions' },
      { firstName: 'Jean', lastName: 'Dupont', email: 'jean.dupont@example.com', company: 'Digital Agency' },
      { firstName: 'Marie', lastName: 'Dubois', email: 'marie.dubois@example.com', company: 'Creative Studio' },
      { firstName: 'Pierre', lastName: 'Bernard', email: 'pierre.bernard@example.com', company: 'Startup Inc' },
      { firstName: 'Alice', lastName: 'Petit', email: 'alice.petit@example.com', company: 'Innovation Lab' },
      { firstName: 'Thomas', lastName: 'Robert', email: 'thomas.robert@example.com', company: 'Web Agency' },
      { firstName: 'Emma', lastName: 'Richard', email: 'emma.richard@example.com', company: 'Design Co' },
      { firstName: 'Lucas', lastName: 'Simon', email: 'lucas.simon@example.com', company: 'Media Group' },
      { firstName: 'Léa', lastName: 'Laurent', email: 'lea.laurent@example.com', company: 'Brand Studio' },
      { firstName: 'Hugo', lastName: 'Leroy', email: 'hugo.leroy@example.com', company: 'Marketing Pro' },
    ]

    const guests = []
    for (const guestData of demoGuests) {
      const token = generateGuestToken()
      const tokenHash = hashToken(token)
      const tokenExpiry = new Date()
      tokenExpiry.setDate(tokenExpiry.getDate() + 90) // 90 days validity

      const guest = await prisma.guest.create({
        data: {
          ...guestData,
          eventId: event.id,
          token: token, // Store raw token (Note: not ideal for security, but required by schema)
          tokenHash,
          tokenExpiry,
        },
      })

      guests.push({
        ...guest,
        invitationUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/guest/${token}`,
      })
    }

    return NextResponse.json({
      message: 'Database seeded successfully!',
      event: {
        id: event.id,
        name: event.name,
        date: event.startsAt,
        location: `${event.venueName}, ${event.address}, ${event.city}`,
      },
      guestsCreated: guests.length,
      sampleInvitationUrl: guests[0]?.invitationUrl,
    })
  } catch (error) {
    console.error('Error seeding database:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
