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
        // RSVP Configuration
        rsvpDeadline: new Date('2025-06-01T23:59:59'),
        maxPlusOnes: 1,
        allowPlusOnes: true,
        requireMeal: true,
        mealOptions: ['Viande', 'Poisson', 'Végétarien', 'Vegan'],
        // Features enabled
        enableTransport: true,
        enableLodging: true,
        enableAccessibility: true,
        enablePhotoConsent: true,
        // Communication Configuration - Save the Date
        saveTheDateConfig: {
          eventName: '10 ans de Weevup',
          tagline: 'Réservez la date !',
          dateAnnouncement: '15 Juin 2025',
          locationHint: 'Molitor Paris',
          teaserMessage: 'Une soirée exceptionnelle pour célébrer 10 ans d\'innovation et de créativité. Les détails suivront prochainement...',
          primaryColor: '#004645',
          secondaryColor: '#FF4713',
          accentColor: '#009197',
          backgroundColor: '#9CD9F6',
          ctaText: 'Je bloque la date ✨',
          ctaAction: 'interest',
          showInterestForm: true,
          showCountdown: true,
          showSocialShare: true,
          animationStyle: 'confetti',
          footerMessage: 'Invitation officielle à venir début mai',
          logoImage: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200&h=80&fit=crop',
          headerImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&h=400&fit=crop',
        },
        // Communication Configuration - Invitation
        invitationConfig: {
          welcomeMessage: 'Vous êtes cordialement invité(e) à',
          description: 'Rejoignez-nous pour célébrer 10 années d\'aventure entrepreneuriale ! Une soirée unique au cœur de Paris avec cocktail dînatoire, DJ set et surprises.',
          primaryColor: '#004645',
          secondaryColor: '#009197',
          accentColor: '#FF4713',
          showMap: true,
          showProgram: true,
          showDressCode: true,
          ctaText: 'Confirmer ma présence',
          footerMessage: 'Nous avons hâte de vous retrouver !',
          logoUrl: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200&h=80&fit=crop',
          headerImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&h=400&fit=crop',
        },
        // Communication Configuration - RSVP
        rsvpConfig: {
          welcomeMessage: 'Merci de confirmer votre présence',
          confirmationMessage: 'Votre réponse a bien été enregistrée. À très bientôt !',
          primaryColor: '#004645',
          accentColor: '#FF4713',
          showMealPreferences: true,
          showPlusOnes: true,
          showAccessibility: true,
          showTransport: true,
          showLodging: true,
          requirePhotoConsent: true,
        },
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
        showcaseSpeakers: [
          {
            name: 'Marie Dubois',
            title: 'CEO & Fondatrice',
            bio: 'Marie a fondé Weevup il y a 10 ans avec une vision: révolutionner la gestion d\'événements. Son leadership a permis à l\'entreprise de devenir un acteur majeur du secteur.',
            photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
          },
          {
            name: 'Thomas Martin',
            title: 'CTO',
            bio: 'Expert en technologies événementielles, Thomas pilote l\'innovation technique chez Weevup. Passionné par l\'IA et l\'automatisation.',
            photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
          },
          {
            name: 'Sophie Laurent',
            title: 'Directrice Créative',
            bio: 'Sophie transforme chaque événement en expérience mémorable. Son approche créative et son sens du détail font toute la différence.',
            photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
          },
        ],
        showcaseSponsors: [
          {
            name: 'Tech Corp',
            logo: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200&h=100&fit=crop',
            website: 'https://techcorp.example.com',
            tier: 'platinum',
          },
          {
            name: 'Digital Solutions',
            logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200&h=100&fit=crop',
            website: 'https://digitalsolutions.example.com',
            tier: 'gold',
          },
          {
            name: 'Innovation Labs',
            logo: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200&h=100&fit=crop',
            website: 'https://innovationlabs.example.com',
            tier: 'gold',
          },
          {
            name: 'Creative Studio',
            logo: 'https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=200&h=100&fit=crop',
            website: '',
            tier: 'silver',
          },
        ],
        showcaseTimeline: [
          {
            time: '18:30',
            title: 'Accueil & Cocktail de bienvenue',
            description: 'Arrivée des invités, remise des badges et cocktail de bienvenue dans le hall du Molitor',
          },
          {
            time: '19:00',
            title: 'Discours d\'ouverture',
            description: 'Mot de bienvenue de Marie Dubois, CEO, et rétrospective des 10 ans de Weevup',
          },
          {
            time: '19:30',
            title: 'Cocktail dînatoire',
            description: 'Buffet gastronomique avec animations culinaires et networking',
          },
          {
            time: '21:00',
            title: 'DJ Set & Dancefloor',
            description: 'Ambiance musicale avec DJ résident et ouverture de la piste de danse',
          },
          {
            time: '22:30',
            title: 'Surprise anniversaire',
            description: 'Animation spéciale pour célébrer ces 10 années',
          },
          {
            time: '23:00',
            title: 'Fin de la soirée',
            description: 'Derniers échanges et départ des invités',
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
