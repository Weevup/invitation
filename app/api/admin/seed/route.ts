import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateGuestToken, hashToken } from '@/lib/auth'
import { UserRole, GuestStatus } from '@prisma/client'

function generateToken(): string {
  return generateGuestToken()
}

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

    // ====================================
    // 1. UTILISATEURS
    // ====================================
    const adminWeevup = await prisma.user.create({
      data: {
        email: 'contact@weevup.com',
        role: UserRole.ADMIN
      }
    })

    const adminDemo = await prisma.user.create({
      data: {
        email: 'demo@weevup.com',
        role: UserRole.ADMIN
      }
    })

    // ====================================
    // 2. ÉVÉNEMENT 1: TECH SUMMIT 2025
    // ====================================
    const eventTechSummit = await prisma.event.create({
      data: {
        name: 'Tech Summit 2025 - L\'Innovation en Action',
        slug: 'tech-summit-2025',
        startsAt: new Date('2025-05-15T09:00:00Z'),
        endsAt: new Date('2025-05-16T18:00:00Z'),
        venueName: 'Palais des Congrès de Paris',
        address: '2 Place de la Porte Maillot',
        city: 'Paris',
        country: 'France',
        coverImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87',
        description: 'Le Tech Summit 2025 est l\'événement incontournable de l\'innovation technologique en France.',
        program: 'Programme complet sur 2 jours avec conférences, ateliers et networking',
        dressCode: 'Business casual',
        rsvpDeadline: new Date('2025-05-01T23:59:59Z'),
        maxPlusOnes: 2,
        allowPlusOnes: true,
        requireMeal: true,
        mealOptions: ['Standard', 'Végétarien', 'Vegan', 'Sans gluten', 'Halal', 'Kosher'],
        enableTransport: true,
        enableLodging: true,
        enableAccessibility: true,
        enablePhotoConsent: true,
        showcaseEnabled: true,
        showcaseTitle: 'Tech Summit 2025',
        showcaseSubtitle: 'L\'Innovation en Action • 15-16 Mai 2025 • Paris',
        showcasePrimaryColor: '#004645',
        showcaseSecondaryColor: '#FF4713',
        adminId: adminDemo.id
      }
    })

    // ====================================
    // 3. ÉVÉNEMENT 2: 10 ANS DE WEEVUP
    // ====================================
    const eventWeevup = await prisma.event.create({
      data: {
        name: '10 ans de Weevup',
        slug: 'weevup-10-ans',
        startsAt: new Date('2025-06-20T19:00:00Z'),
        endsAt: new Date('2025-06-21T01:00:00Z'),
        venueName: 'Molitor Paris',
        address: '13 Rue Nungesser et Coli',
        city: 'Paris',
        country: 'France',
        coverImage: 'https://images.unsplash.com/photo-1519167758481-83f29da8c43f?w=1200',
        description: 'Rejoignez-nous pour célébrer une décennie d\'innovation et de succès !',
        program: `19h00 - Accueil champagne & cocktail
20h30 - Dîner gastronomique
22h00 - Rétrospective Weevup
22h30 - Soirée DJ
00h30 - Clôture`,
        dressCode: 'Élégant & décontracté',
        rsvpDeadline: new Date('2025-06-10T23:59:59Z'),
        maxPlusOnes: 1,
        allowPlusOnes: true,
        requireMeal: true,
        mealOptions: ['Menu Classique', 'Menu Végétarien', 'Menu Végan', 'Menu Sans gluten', 'Menu Halal'],
        enableTransport: true,
        enableLodging: false,
        enableAccessibility: true,
        enablePhotoConsent: true,
        showcaseEnabled: true,
        showcaseTitle: '10 ans de Weevup',
        showcaseSubtitle: 'Une décennie d\'innovation • 20 Juin 2025 • Molitor Paris',
        showcasePrimaryColor: '#004645',
        showcaseSecondaryColor: '#FF4713',
        adminId: adminWeevup.id
      }
    })

    // ====================================
    // 4. ÉVÉNEMENT 3: MARIAGE JULIE & THOMAS
    // ====================================
    const eventWedding = await prisma.event.create({
      data: {
        name: 'Mariage de Julie & Thomas',
        slug: 'mariage-julie-thomas',
        startsAt: new Date('2025-07-12T15:00:00Z'),
        endsAt: new Date('2025-07-13T02:00:00Z'),
        venueName: 'Château de Vaux-le-Vicomte',
        address: 'Château de Vaux-le-Vicomte',
        city: 'Maincy',
        country: 'France',
        coverImage: 'https://images.unsplash.com/photo-1519741497674-611481863552',
        description: 'Julie et Thomas ont le plaisir de vous inviter à célébrer leur union dans le cadre enchanteur du Château de Vaux-le-Vicomte.',
        program: `15h00 - Cérémonie laïque dans les jardins
16h30 - Cocktail & vin d'honneur
19h30 - Dîner de gala
22h00 - Ouverture du bal
23h00 - Pièce montée
00h00 - Soirée dansante
02h00 - Fin de la réception`,
        dressCode: 'Tenue de soirée / Smoking',
        rsvpDeadline: new Date('2025-06-12T23:59:59Z'),
        maxPlusOnes: 1,
        allowPlusOnes: true,
        requireMeal: true,
        mealOptions: ['Menu Adulte', 'Menu Végétarien', 'Menu Enfant'],
        enableTransport: true,
        enableLodging: true,
        enableAccessibility: true,
        enablePhotoConsent: true,
        showcaseEnabled: true,
        showcaseTitle: 'Julie & Thomas',
        showcaseSubtitle: '12 Juillet 2025 • Château de Vaux-le-Vicomte',
        showcasePrimaryColor: '#d4af37',
        showcaseSecondaryColor: '#f8e5d0',
        adminId: adminDemo.id
      }
    })

    // ====================================
    // 5. ÉVÉNEMENT 4: GALA DE CHARITÉ
    // ====================================
    const eventGala = await prisma.event.create({
      data: {
        name: 'Gala de Charité - Enfants du Monde',
        slug: 'gala-charite-2025',
        startsAt: new Date('2025-09-25T19:00:00Z'),
        endsAt: new Date('2025-09-26T00:00:00Z'),
        venueName: 'Hôtel de Ville de Paris',
        address: 'Place de l\'Hôtel de Ville',
        city: 'Paris',
        country: 'France',
        coverImage: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622',
        description: 'Soirée de gala au profit de l\'association "Enfants du Monde". Ensemble, faisons la différence.',
        program: `19h00 - Accueil & tapis rouge
19h30 - Cocktail dînatoire
20h30 - Présentation de l'association
21h00 - Dîner de gala
22h00 - Vente aux enchères caritative
23h00 - Concert privé
00h00 - Clôture`,
        dressCode: 'Tenue de gala / Black tie',
        rsvpDeadline: new Date('2025-09-10T23:59:59Z'),
        maxPlusOnes: 1,
        allowPlusOnes: true,
        requireMeal: true,
        mealOptions: ['Menu Prestige', 'Menu Végétarien', 'Menu Végan'],
        enableTransport: true,
        enableLodging: false,
        enableAccessibility: true,
        enablePhotoConsent: true,
        showcaseEnabled: true,
        showcaseTitle: 'Gala de Charité',
        showcaseSubtitle: 'Enfants du Monde • 25 Septembre 2025 • Paris',
        showcasePrimaryColor: '#1e3a8a',
        showcaseSecondaryColor: '#3b82f6',
        adminId: adminDemo.id
      }
    })

    // ====================================
    // 6. ÉVÉNEMENT 5: WORKSHOP PROFESSIONNEL
    // ====================================
    const eventWorkshop = await prisma.event.create({
      data: {
        name: 'Workshop Leadership & Management',
        slug: 'workshop-leadership-2025',
        startsAt: new Date('2025-04-10T09:00:00Z'),
        endsAt: new Date('2025-04-10T17:00:00Z'),
        venueName: 'Station F',
        address: '5 Parvis Alan Turing',
        city: 'Paris',
        country: 'France',
        coverImage: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b',
        description: 'Workshop intensif d\'une journée sur le leadership et le management d\'équipe à l\'ère digitale.',
        program: `09h00 - Accueil & petit-déjeuner
09h30 - Introduction : Les nouveaux défis du leadership
10h30 - Atelier 1 : Communication efficace
12h00 - Déjeuner networking
13h30 - Atelier 2 : Gestion du changement
15h00 - Pause café
15h30 - Atelier 3 : Intelligence émotionnelle
16h30 - Table ronde & Q&A
17h00 - Clôture & remise des certificats`,
        dressCode: 'Business casual',
        rsvpDeadline: new Date('2025-04-03T23:59:59Z'),
        maxPlusOnes: 0,
        allowPlusOnes: false,
        requireMeal: true,
        mealOptions: ['Standard', 'Végétarien', 'Vegan', 'Sans gluten'],
        enableTransport: false,
        enableLodging: false,
        enableAccessibility: true,
        enablePhotoConsent: true,
        showcaseEnabled: true,
        showcaseTitle: 'Workshop Leadership',
        showcaseSubtitle: 'Leadership & Management • 10 Avril 2025 • Station F',
        showcasePrimaryColor: '#059669',
        showcaseSecondaryColor: '#10b981',
        adminId: adminDemo.id
      }
    })

    // ====================================
    // 7. CRÉATION DE QUELQUES INVITÉS PAR ÉVÉNEMENT
    // ====================================
    const events = [
      { event: eventTechSummit, count: 5 },
      { event: eventWeevup, count: 5 },
      { event: eventWedding, count: 5 },
      { event: eventGala, count: 5 },
      { event: eventWorkshop, count: 5 }
    ]

    let totalGuestsCreated = 0
    const sampleUrls: string[] = []

    for (const { event, count } of events) {
      for (let i = 0; i < count; i++) {
        const token = generateToken()
        const tokenHash = hashToken(token)

        await prisma.guest.create({
          data: {
            eventId: event.id,
            firstName: `Invité${i + 1}`,
            lastName: event.name.split(' ')[0],
            email: `guest${i + 1}@${event.slug}.com`,
            company: 'Demo Company',
            tags: ['Demo'],
            token: token,
            tokenHash: tokenHash,
            tokenExpiry: new Date('2025-12-31'),
            status: GuestStatus.INVITED
          }
        })

        totalGuestsCreated++

        // Garder un exemple d'URL par événement
        if (i === 0) {
          sampleUrls.push(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/guest/${token}`)
        }
      }
    }

    const allEvents = await prisma.event.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        startsAt: true,
        venueName: true,
        city: true,
      },
      orderBy: {
        startsAt: 'asc'
      }
    })

    return NextResponse.json({
      message: '✅ 5 événements de démonstration créés avec succès!',
      events: allEvents.map(e => ({
        id: e.id,
        name: e.name,
        slug: e.slug,
        date: e.startsAt.toLocaleDateString('fr-FR'),
        location: `${e.venueName}, ${e.city}`,
        showcaseUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/events/${e.slug}`
      })),
      totalEventsCreated: allEvents.length,
      totalGuestsCreated: totalGuestsCreated,
      sampleInvitationUrls: sampleUrls,
      admins: [
        { email: adminWeevup.email, role: 'Admin Weevup' },
        { email: adminDemo.email, role: 'Admin Demo' }
      ]
    })
  } catch (error) {
    console.error('Error seeding database:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
