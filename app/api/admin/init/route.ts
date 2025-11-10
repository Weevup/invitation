import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateGuestToken, hashToken } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function POST() {
  try {
    // Check if events already exist
    const existingEvents = await prisma.event.findMany()
    if (existingEvents.length > 0) {
      return NextResponse.json({
        message: 'La base de données contient déjà des événements',
        eventCount: existingEvents.length,
      })
    }

    // Create admin user if not exists
    let adminUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } })
    if (!adminUser) {
      const defaultPassword = await bcrypt.hash('admin123', 10)
      adminUser = await prisma.user.create({
        data: {
          email: 'admin@weevup.com',
          password: defaultPassword,
          name: 'Admin',
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
      },
    })

    // Create demo guests
    const demoGuests = [
      { firstName: 'Sophie', lastName: 'Martin', email: 'sophie.martin@example.com', company: 'Tech Solutions' },
      { firstName: 'Jean', lastName: 'Dupont', email: 'jean.dupont@example.com', company: 'Digital Agency' },
      { firstName: 'Marie', lastName: 'Dubois', email: 'marie.dubois@example.com', company: 'Creative Studio' },
      { firstName: 'Pierre', lastName: 'Bernard', email: 'pierre.bernard@example.com', company: 'Startup Inc' },
      { firstName: 'Alice', lastName: 'Petit', email: 'alice.petit@example.com', company: 'Innovation Lab' },
    ]

    let guestsCreated = 0
    for (const guestData of demoGuests) {
      const token = generateGuestToken()
      const tokenHash = hashToken(token)
      const tokenExpiry = new Date()
      tokenExpiry.setDate(tokenExpiry.getDate() + 90)

      await prisma.guest.create({
        data: {
          ...guestData,
          eventId: event.id,
          token: token,
          tokenHash,
          tokenExpiry,
        },
      })
      guestsCreated++
    }

    return NextResponse.json({
      success: true,
      message: 'Événement de démo créé avec succès!',
      event: {
        id: event.id,
        name: event.name,
        startsAt: event.startsAt,
        venueName: event.venueName,
      },
      guestsCreated,
    })
  } catch (error) {
    console.error('Error initializing:', error)
    return NextResponse.json(
      {
        error: 'Erreur lors de l\'initialisation',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
