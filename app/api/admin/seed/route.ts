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

    // Create Weevup 10th anniversary event with full showcase
    const event = await prisma.event.create({
      data: {
        name: '10 ans de Weevup',
        slug: '10-ans-de-weevup-' + Date.now(),
        description: `🎉 Une décennie d'innovation, de créativité et de collaboration !

Rejoignez-nous pour célébrer 10 ans d'aventure entrepreneuriale au cœur de Paris. Cette soirée unique au Molitor sera l'occasion de se retrouver, d'échanger et de fêter ensemble cette étape importante.

Au programme : cocktail dînatoire, DJ set, surprises et moments inoubliables dans un lieu d'exception.`,
        program: `18h30 - Accueil & Cocktail de bienvenue
19h00 - Discours d'ouverture
19h30 - Cocktail dînatoire
21h00 - DJ set & dancefloor
23h00 - Fin de la soirée`,
        dressCode: 'Chic & Décontracté',
        startsAt: new Date('2025-06-15T19:00:00'),
        endsAt: new Date('2025-06-15T23:00:00'),
        venueName: 'Molitor Paris',
        address: '13 Rue Nungesser et Coli',
        city: 'Paris 75016',
        country: 'France',
        adminId: adminUser.id,
        // Showcase - Enabled with full content
        showcaseEnabled: true,
        showcaseTitle: '10 ans de Weevup',
        showcaseSubtitle: 'Une décennie d\'innovation et de créativité',
        showcaseBannerImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1920&h=600&fit=crop',
        showcaseTheme: 'weevup',
        showcasePrimaryColor: '#004645',
        showcaseSecondaryColor: '#FF4713',
        showcaseSections: ['hero', 'countdown', 'video', 'description', 'program', 'details', 'gallery', 'faq', 'cta'],
        showcaseCountdown: true,
        showcaseSocialShare: true,
        showcaseVideo: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        showcaseGallery: [
          'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&h=800&fit=crop',
          'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=800&fit=crop',
          'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=800&h=800&fit=crop',
          'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&h=800&fit=crop',
          'https://images.unsplash.com/photo-1519167758481-83f29da8c9a0?w=800&h=800&fit=crop',
          'https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=800&h=800&fit=crop',
        ],
        showcaseFAQ: [
          {
            question: 'Quelle est la tenue recommandée ?',
            answer: 'La soirée est placée sous le signe du chic et du décontracté. Venez élégants mais à l\'aise pour profiter pleinement de la soirée !'
          },
          {
            question: 'Y a-t-il un parking disponible ?',
            answer: 'Oui, le Molitor dispose d\'un parking souterrain. Cependant, nous recommandons l\'utilisation des transports en commun (Métro 9 - Porte de Saint-Cloud).'
          },
          {
            question: 'Peut-on venir accompagné ?',
            answer: 'Cette invitation est strictement nominative. Si vous souhaitez venir accompagné, merci de nous contacter à l\'avance.'
          },
          {
            question: 'Y a-t-il des options végétariennes/vegan ?',
            answer: 'Absolument ! Le cocktail dînatoire proposera une variété d\'options pour tous les régimes alimentaires. N\'hésitez pas à nous signaler vos restrictions.'
          },
        ],
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
