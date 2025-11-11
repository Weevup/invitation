import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { TransportType, BookingStatus, RoomType, RoomStatus, EmailType, EmailStatus } from '@prisma/client'
import { generateGuestToken, hashToken } from '@/lib/auth'
import bcrypt from 'bcryptjs'
import { requireAdmin, handleAuthError } from '@/lib/auth-utils'

function generateToken(): string {
  return generateGuestToken()
}

export async function POST() {
  try {
    // Get the current logged-in admin
    const session = await requireAdmin()

    // Additional safety: Only allow in development OR if explicitly enabled in production
    if (process.env.NODE_ENV === 'production' && process.env.ALLOW_SEED !== 'true') {
      return NextResponse.json(
        {
          success: false,
          error: 'Cette opération est désactivée en production',
          help: 'Pour activer le seed en production, ajoutez la variable d\'environnement ALLOW_SEED=true dans Vercel'
        },
        { status: 403 }
      )
    }

    // ====================================
    // NETTOYAGE DES DONNÉES EXISTANTES
    // ====================================
    // Supprimer les événements existants et leurs données associées
    // Les comptes admin sont préservés
    const existingEvents = await prisma.event.findMany({
      where: { adminId: session.user.id }
    })

    if (existingEvents.length > 0) {
      console.log(`[SEED] Suppression de ${existingEvents.length} événement(s) existant(s) pour ${session.user.email}...`)

      // Supprimer dans l'ordre pour respecter les contraintes de clés étrangères
      // Supprimer uniquement les données liées aux événements de cet admin
      const eventIds = existingEvents.map(e => e.id)

      // Get all transport manifests for these events
      const manifests = await prisma.transportManifest.findMany({
        where: { eventId: { in: eventIds } },
        select: { id: true }
      })
      const manifestIds = manifests.map(m => m.id)

      // Get all accommodations for these events
      const accommodations = await prisma.accommodation.findMany({
        where: { eventId: { in: eventIds } },
        select: { id: true }
      })
      const accommodationIds = accommodations.map(a => a.id)

      // Get all rooms for these accommodations
      const rooms = await prisma.room.findMany({
        where: { accommodationId: { in: accommodationIds } },
        select: { id: true }
      })
      const roomIds = rooms.map(r => r.id)

      // Get all sessions for these events
      const sessions = await prisma.session.findMany({
        where: { eventId: { in: eventIds } },
        select: { id: true }
      })
      const sessionIds = sessions.map(s => s.id)

      // Delete in correct order
      if (manifestIds.length > 0) {
        await prisma.manifestParticipant.deleteMany({
          where: { manifestId: { in: manifestIds } }
        })
      }

      if (roomIds.length > 0) {
        await prisma.roomAssignment.deleteMany({
          where: { roomId: { in: roomIds } }
        })
      }

      if (sessionIds.length > 0) {
        await prisma.sessionParticipant.deleteMany({
          where: { sessionId: { in: sessionIds } }
        })
      }

      await prisma.transportManifest.deleteMany({
        where: { eventId: { in: eventIds } }
      })
      await prisma.transportBooking.deleteMany({
        where: { eventId: { in: eventIds } }
      })
      await prisma.room.deleteMany({
        where: { accommodationId: { in: accommodationIds } }
      })
      await prisma.accommodation.deleteMany({
        where: { eventId: { in: eventIds } }
      })
      await prisma.eventModule.deleteMany({
        where: { eventId: { in: eventIds } }
      })
      await prisma.emailLog.deleteMany({
        where: { eventId: { in: eventIds } }
      })
      await prisma.emailTracking.deleteMany({
        where: { eventId: { in: eventIds } }
      })
      await prisma.checkin.deleteMany({
        where: { eventId: { in: eventIds } }
      })
      await prisma.rSVP.deleteMany({
        where: { eventId: { in: eventIds } }
      })
      await prisma.guest.deleteMany({
        where: { eventId: { in: eventIds } }
      })
      await prisma.scheduledEmail.deleteMany({
        where: { eventId: { in: eventIds } }
      })
      await prisma.eventRemindersConfig.deleteMany({
        where: { eventId: { in: eventIds } }
      })
      await prisma.session.deleteMany({
        where: { eventId: { in: eventIds } }
      })
      await prisma.timelineEvent.deleteMany({
        where: { eventId: { in: eventIds } }
      })
      await prisma.event.deleteMany({
        where: { id: { in: eventIds } }
      })

      console.log('[SEED] Événements existants supprimés avec succès')
    }

    // ====================================
    // 1. UTILISER L'ADMIN CONNECTÉ
    // ====================================
    // Utiliser l'admin qui lance le seed pour créer les événements
    // Cela garantit que l'admin verra les événements créés
    const adminWeevup = { id: session.user.id }

    // ====================================
    // 2. ÉVÉNEMENT 1 - 10 ANS WEEVUP
    // ====================================
    const event10AnsWeevup = await prisma.event.create({
      data: {
        adminId: adminWeevup.id,
        name: '10 ans Weevup - Célébration',
        slug: '10-ans-weevup-celebration',
        description: 'Une soirée exceptionnelle pour célébrer 10 années d\'innovation et de succès avec Weevup',
        startsAt: new Date('2025-06-20T19:00:00'),
        endsAt: new Date('2025-06-20T23:59:00'),
        venueName: 'Le Pavillon Royal',
        address: '148 Avenue des Champs-Élysées, 75008 Paris',
        city: 'Paris',
        country: 'France',
        dressCode: 'Élégant / Cocktail',
        coverImage: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1920',

        // RSVP Configuration
        rsvpDeadline: new Date('2025-06-01T23:59:59'),
        allowPlusOnes: true,
        maxPlusOnes: 1,
        requireMeal: true,
        mealOptions: ['Menu Omnivore', 'Menu Végétarien', 'Menu Vegan', 'Menu Sans Gluten'],
        enablePhotoConsent: true,
        enableAccessibility: true,
        enableTransport: true,
        enableLodging: true,

        // Showcase Configuration
        showcaseEnabled: true,
        showcaseTitle: '10 Ans d\'Innovation',
        showcaseSubtitle: '2015 - 2025 : Une décennie de transformation digitale',
        showcaseBannerImage: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1920',
        showcasePrimaryColor: '#004645',
        showcaseSecondaryColor: '#FF4713',
        showcaseTheme: 'weevup',
        showcaseSocialShare: true,
        showcaseCountdown: true,

        // Program détaillé
        program: `19h00 - Accueil & Cocktail
Champagne de bienvenue et amuse-bouches gastronomiques

20h00 - Cérémonie d'Ouverture
Rétrospective en images et vidéos de ces 10 années

20h30 - Témoignages & Surprises
Interventions de clients et partenaires, remise de prix

21h00 - Dîner Gastronomique
Menu d'exception créé par le Chef étoilé Antoine Lefèvre

22h30 - Soirée Dansante
DJ set et ambiance festive jusqu'au bout de la nuit`,

        // Showcase Timeline
        showcaseTimeline: [
          {
            time: '19:00',
            title: 'Accueil & Cocktail',
            description: 'Champagne de bienvenue, amuse-bouches gastronomiques et networking',
            location: 'Salon Principal'
          },
          {
            time: '20:00',
            title: 'Cérémonie d\'Ouverture',
            description: 'Rétrospective en images et vidéos de ces 10 années',
            location: 'Grand Auditorium'
          },
          {
            time: '21:00',
            title: 'Dîner Gastronomique',
            description: 'Menu d\'exception créé par le Chef étoilé Antoine Lefèvre',
            location: 'Salle de Banquet'
          },
          {
            time: '22:30',
            title: 'Soirée Dansante',
            description: 'DJ set et ambiance festive',
            location: 'Salon Principal'
          }
        ],

        // Speakers
        showcaseSpeakers: [
          {
            name: 'Jean-Michel Dubois',
            title: 'CEO & Fondateur',
            company: 'Weevup',
            bio: '15 ans d\'expérience dans la tech, entrepreneur passionné, mentor pour startups',
            photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400'
          },
          {
            name: 'Sophie Martin',
            title: 'CTO',
            company: 'Weevup',
            bio: 'Experte en architecture cloud et IA, speaker internationale',
            photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400'
          }
        ],

        // Sponsors
        showcaseSponsors: [
          {
            name: 'Microsoft Azure',
            tier: 'Platinum',
            logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a8/Microsoft_Azure_Logo.svg',
            url: 'https://azure.microsoft.com'
          },
          {
            name: 'AWS',
            tier: 'Platinum',
            logo: 'https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg',
            url: 'https://aws.amazon.com'
          }
        ],

        // Gallery
        showcaseGallery: [
          {
            url: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800',
            caption: 'Notre premier bureau en 2015'
          },
          {
            url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800',
            caption: 'L\'équipe lors de notre première conférence'
          },
          {
            url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800',
            caption: 'Hackathon annuel 2018'
          },
          {
            url: 'https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=800',
            caption: 'Lancement de notre nouvelle plateforme'
          }
        ],

        // FAQ
        showcaseFAQ: [
          {
            question: 'Où se déroule la soirée ?',
            answer: 'La soirée se tiendra au Pavillon Royal, 148 Avenue des Champs-Élysées, 75008 Paris.'
          },
          {
            question: 'Y a-t-il un parking disponible ?',
            answer: 'Oui, un parking privé est disponible pour les invités avec service de voituriers.'
          },
          {
            question: 'Puis-je venir accompagné(e) ?',
            answer: 'Bien sûr ! Vous pouvez inviter un accompagnant lors de votre RSVP.'
          },
          {
            question: 'Quel est le dress code ?',
            answer: 'Tenue élégante / cocktail recommandée pour cette soirée spéciale.'
          }
        ],

        // RSVP Config avec questions personnalisées
        rsvpConfig: {
          message: 'Merci de confirmer votre présence avant le 1er juin 2025. Vos préférences nous aideront à organiser une soirée parfaite.',
          customQuestions: [
            {
              question: 'Quelle année vous a le plus marqué chez Weevup ?',
              type: 'text',
              required: false
            },
            {
              question: 'Souhaitez-vous prendre la parole lors de la soirée ?',
              type: 'choice',
              options: ['Oui, avec plaisir', 'Peut-être', 'Non merci'],
              required: false
            }
          ]
        }
      }
    })

    // ====================================
    // 3. ÉVÉNEMENT 2 - TECH SUMMIT 2025
    // ====================================
    const eventTechSummit = await prisma.event.create({
      data: {
        adminId: adminWeevup.id,
        name: 'Tech Summit 2025',
        slug: 'tech-summit-2025',
        description: 'La plus grande conférence tech de l\'année réunissant les leaders de l\'innovation - 2 jours intenses de conférences, ateliers et networking',
        startsAt: new Date('2025-09-15T08:30:00'),
        endsAt: new Date('2025-09-16T18:00:00'),
        venueName: 'Paris Convention Center',
        address: '2 Place de la Porte de Versailles, 75015 Paris',
        city: 'Paris',
        country: 'France',
        dressCode: 'Business Casual / Tech Casual',
        coverImage: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1920',

        // RSVP Configuration
        rsvpDeadline: new Date('2025-08-15T23:59:59'),
        allowPlusOnes: false,
        maxPlusOnes: 0,
        requireMeal: true,
        mealOptions: ['Omnivore', 'Végétarien', 'Vegan', 'Sans Gluten', 'Halal', 'Casher'],
        enablePhotoConsent: true,
        enableAccessibility: true,
        enableLodging: true,

        // Showcase Configuration
        showcaseEnabled: true,
        showcaseTitle: 'Tech Summit 2025',
        showcaseSubtitle: 'Shape the Future of Technology',
        showcaseBannerImage: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1920',
        showcasePrimaryColor: '#1E3A8A',
        showcaseSecondaryColor: '#F59E0B',
        showcaseTheme: 'modern',
        showcaseSocialShare: true,
        showcaseCountdown: true,

        // Program détaillé sur 2 jours
        program: `JOUR 1 - Lundi 15 septembre

08:30 - Accueil & Petit-déjeuner
09:30 - Keynote : L'IA va-t-elle remplacer les développeurs ?
10:30 - Sessions Parallèles (5 tracks)
13:00 - Déjeuner Networking
14:30 - Ateliers Hands-On
17:00 - Panel : Le Futur du Cloud Computing
19:00 - Cocktail & Soirée Networking

JOUR 2 - Mardi 16 septembre

08:30 - Petit-déjeuner
09:00 - Keynote : Web3 - Revolution ou Buzzword ?
10:00 - Sessions Parallèles (5 tracks)
12:30 - Déjeuner
14:00 - Lightning Talks (12 talks de 10min)
16:00 - Keynote de Clôture : L'Éthique dans la Tech
17:00 - Remise des Prix Hackathon (50 000€)
18:00 - Clôture`,

        // Showcase Timeline détaillée
        showcaseTimeline: [
          {
            time: '08:30',
            title: 'Accueil & Petit-déjeuner',
            description: 'Café, viennoiseries et networking matinal',
            day: 'Jour 1'
          },
          {
            time: '09:30',
            title: 'Keynote : L\'IA va-t-elle remplacer les développeurs ?',
            description: 'Plongée fascinante dans l\'avenir du développement avec l\'IA',
            day: 'Jour 1',
            speaker: 'Yann LeCun'
          },
          {
            time: '13:00',
            title: 'Déjeuner Networking',
            description: 'Buffet gastronomique et networking entre participants',
            day: 'Jour 1'
          },
          {
            time: '19:00',
            title: 'Cocktail & Soirée Networking',
            description: 'Cocktail dînatoire, DJ set et networking',
            day: 'Jour 1'
          },
          {
            time: '09:00',
            title: 'Keynote : Web3 - Revolution ou Buzzword ?',
            description: 'État des lieux objectif de la blockchain et du Web3',
            day: 'Jour 2',
            speaker: 'Vitalik Buterin'
          },
          {
            time: '17:00',
            title: 'Remise des Prix Hackathon',
            description: 'Annonce des gagnants et remise des 50 000€ de prix',
            day: 'Jour 2'
          }
        ],

        // Speakers internationaux
        showcaseSpeakers: [
          {
            name: 'Yann LeCun',
            title: 'Chief AI Scientist',
            company: 'Meta',
            bio: 'Pionnier du Deep Learning, Prix Turing 2018, professeur à NYU',
            photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'
          },
          {
            name: 'Vitalik Buterin',
            title: 'Co-founder',
            company: 'Ethereum',
            bio: 'Créateur d\'Ethereum, figure emblématique du Web3',
            photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400'
          },
          {
            name: 'Cassie Kozyrkov',
            title: 'Chief Decision Scientist',
            company: 'Google',
            bio: 'Experte en Data Science et Decision Intelligence',
            photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400'
          }
        ],

        // Sponsors par tier
        showcaseSponsors: [
          {
            name: 'Google Cloud',
            tier: 'Diamond',
            logo: 'https://www.gstatic.com/devrel-devsite/prod/v870e399c64f7c43c99a3043db4b3a74327bb93d0914e84a0c3dba90bbfd67625/cloud/images/favicons/onecloud/super_cloud.png',
            url: 'https://cloud.google.com'
          },
          {
            name: 'Microsoft',
            tier: 'Diamond',
            logo: 'https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg',
            url: 'https://microsoft.com'
          },
          {
            name: 'AWS',
            tier: 'Platinum',
            logo: 'https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg',
            url: 'https://aws.amazon.com'
          },
          {
            name: 'GitHub',
            tier: 'Platinum',
            logo: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
            url: 'https://github.com'
          }
        ],

        // Gallery de l'édition précédente
        showcaseGallery: [
          {
            url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
            caption: 'Main stage 2024'
          },
          {
            url: 'https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=800',
            caption: 'Expo tech avec 80+ stands'
          },
          {
            url: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800',
            caption: 'Ateliers hands-on'
          },
          {
            url: 'https://images.unsplash.com/photo-1551818255-e6e10975bc17?w=800',
            caption: 'Hackathon 24h'
          }
        ],

        // FAQ complète
        showcaseFAQ: [
          {
            question: 'Quel est le prix du billet ?',
            answer: 'Les pass VIP (invitations) sont offerts. Billets standard à 299€ (early bird) et 399€ (tarif normal). Étudiants : -50%.'
          },
          {
            question: 'L\'événement est-il en français ou en anglais ?',
            answer: 'Keynotes en anglais avec traduction simultanée. Autres sessions en français ou anglais (indiqué dans le programme).'
          },
          {
            question: 'Y a-t-il des ateliers pour débutants ?',
            answer: 'Oui ! Tracks pour tous niveaux, du débutant à l\'expert. Indiquez votre niveau lors du RSVP.'
          },
          {
            question: 'Le WiFi est-il inclus ?',
            answer: 'Oui, WiFi haut débit disponible dans tout le centre de conférence.'
          },
          {
            question: 'Y aura-t-il un replay des conférences ?',
            answer: 'Oui ! Toutes les sessions seront enregistrées et mises en ligne 2 semaines après l\'événement.'
          }
        ],

        // RSVP Config avec questions techniques
        rsvpConfig: {
          message: 'Confirmez votre participation avant le 15 août pour garantir votre place. Les places sont limitées !',
          customQuestions: [
            {
              question: 'Quel est votre niveau d\'expertise technique ?',
              type: 'choice',
              options: ['Débutant', 'Intermédiaire', 'Avancé', 'Expert'],
              required: true
            },
            {
              question: 'Quels sujets vous intéressent le plus ?',
              type: 'multiple',
              options: ['Intelligence Artificielle', 'Cloud Computing', 'Cybersécurité', 'Web3 & Blockchain', 'DevOps', 'Data Science'],
              required: true
            },
            {
              question: 'Souhaitez-vous participer au hackathon 24h ?',
              type: 'choice',
              options: ['Oui, seul', 'Oui, en équipe', 'Non'],
              required: false
            },
            {
              question: 'Taille de t-shirt pour le pack goodies',
              type: 'choice',
              options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
              required: true
            }
          ]
        }
      }
    })

    // ====================================
    // 4. INVITÉS POUR 10 ANS WEEVUP
    // ====================================
    const guestsWeevup = []

    // VIP Clients
    const vipClients = [
      { firstName: 'Marie', lastName: 'Dupont', email: 'marie.dupont@exemple.fr', company: 'TechCorp France', tags: ['VIP', 'Client'], attending: true, meal: 'Menu Végétarien', plusOnes: 1 },
      { firstName: 'Thomas', lastName: 'Bernard', email: 'thomas.bernard@exemple.fr', company: 'Innov Solutions', tags: ['VIP', 'Client'], attending: true, meal: 'Menu Omnivore', plusOnes: 1 },
      { firstName: 'Sophie', lastName: 'Leroy', email: 'sophie.leroy@exemple.fr', company: 'Digital Ventures', tags: ['VIP', 'Partenaire'], attending: true, meal: 'Menu Vegan', plusOnes: 0, allergies: 'Fruits à coque' },
      { firstName: 'Pierre', lastName: 'Moreau', email: 'pierre.moreau@exemple.fr', company: 'StartupHub', tags: ['VIP', 'Investisseur'], attending: true, meal: 'Menu Omnivore', plusOnes: 1 },
      { firstName: 'Isabelle', lastName: 'Petit', email: 'isabelle.petit@exemple.fr', company: 'Finance Plus', tags: ['VIP', 'Client'], attending: false }
    ]

    for (const guest of vipClients) {
      const token = generateToken()
      const tokenHash = await hashToken(token)

      const createdGuest = await prisma.guest.create({
        data: {
          eventId: event10AnsWeevup.id,
          firstName: guest.firstName,
          lastName: guest.lastName,
          email: guest.email,
          company: guest.company,
          token: token,
          tokenHash: tokenHash,
          tags: guest.tags,
          status: guest.attending !== undefined ? 'RESPONDED' : 'INVITED'
        }
      })

      if (guest.attending !== undefined) {
        const qrCodeId = `WV10-${createdGuest.id.slice(0, 8).toUpperCase()}`

        await prisma.rSVP.create({
          data: {
            guestId: createdGuest.id,
            eventId: event10AnsWeevup.id,
            attending: guest.attending,
            plusOnes: guest.plusOnes || 0,
            mealChoice: guest.meal,
            allergies: guest.allergies,
            qrCodeId,
            consentPhotos: true,
            createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
          }
        })

        // Check-in aléatoire pour certains invités
        if (guest.attending && Math.random() > 0.5) {
          await prisma.checkin.create({
            data: {
              eventId: event10AnsWeevup.id,
              guestId: createdGuest.id,
              qrCodeId,
              desk: ['A', 'B', 'C'][Math.floor(Math.random() * 3)],
              checkedInAt: new Date('2025-06-20T18:30:00')
            }
          })
        }
      }

      guestsWeevup.push(createdGuest)
    }

    // Équipe Weevup
    const teamMembers = [
      { firstName: 'Lucas', lastName: 'Dubois', email: 'lucas.dubois@weevup.com', company: 'Weevup', tags: ['Équipe', 'Tech'], attending: true, meal: 'Menu Omnivore' },
      { firstName: 'Emma', lastName: 'Martin', email: 'emma.martin@weevup.com', company: 'Weevup', tags: ['Équipe', 'Marketing'], attending: true, meal: 'Menu Végétarien' },
      { firstName: 'Alexandre', lastName: 'Rousseau', email: 'alex.rousseau@weevup.com', company: 'Weevup', tags: ['Équipe', 'Sales'], attending: true, meal: 'Menu Omnivore' },
      { firstName: 'Camille', lastName: 'Laurent', email: 'camille.laurent@weevup.com', company: 'Weevup', tags: ['Équipe', 'Design'], attending: true, meal: 'Menu Vegan' },
      { firstName: 'Nicolas', lastName: 'Simon', email: 'nicolas.simon@weevup.com', company: 'Weevup', tags: ['Équipe', 'Tech'], attending: true, meal: 'Menu Sans Gluten', allergies: 'Gluten' }
    ]

    for (const member of teamMembers) {
      const token = generateToken()
      const tokenHash = await hashToken(token)

      const createdGuest = await prisma.guest.create({
        data: {
          eventId: event10AnsWeevup.id,
          firstName: member.firstName,
          lastName: member.lastName,
          email: member.email,
          company: member.company,
          token: token,
          tokenHash: tokenHash,
          tags: member.tags,
          status: 'RESPONDED'
        }
      })

      const qrCodeId = `WV10-${createdGuest.id.slice(0, 8).toUpperCase()}`

      await prisma.rSVP.create({
        data: {
          guestId: createdGuest.id,
          eventId: event10AnsWeevup.id,
          attending: member.attending,
          plusOnes: 0,
          mealChoice: member.meal,
          allergies: member.allergies,
          qrCodeId,
          consentPhotos: true,
          createdAt: new Date(Date.now() - Math.random() * 20 * 24 * 60 * 60 * 1000)
        }
      })

      // Toute l'équipe est déjà check-in
      await prisma.checkin.create({
        data: {
          eventId: event10AnsWeevup.id,
          guestId: createdGuest.id,
          qrCodeId,
          desk: 'A',
          checkedInAt: new Date('2025-06-20T18:00:00')
        }
      })

      guestsWeevup.push(createdGuest)
    }

    // ====================================
    // 5. INVITÉS POUR TECH SUMMIT 2025
    // ====================================
    const guestsTechSummit = []

    // Speakers & VIPs
    const speakers = [
      { firstName: 'Yann', lastName: 'LeCun', email: 'yann@meta.com', company: 'Meta', tags: ['Speaker', 'VIP', 'IA'], attending: true, meal: 'Végétarien', expertise: 'Expert' },
      { firstName: 'Vitalik', lastName: 'Buterin', email: 'vitalik@ethereum.org', company: 'Ethereum Foundation', tags: ['Speaker', 'VIP', 'Web3'], attending: true, meal: 'Vegan', expertise: 'Expert' },
      { firstName: 'Cassie', lastName: 'Kozyrkov', email: 'cassie@google.com', company: 'Google', tags: ['Speaker', 'VIP', 'Data'], attending: true, meal: 'Omnivore', expertise: 'Expert' }
    ]

    for (const speaker of speakers) {
      const token = generateToken()
      const tokenHash = await hashToken(token)

      const createdGuest = await prisma.guest.create({
        data: {
          eventId: eventTechSummit.id,
          firstName: speaker.firstName,
          lastName: speaker.lastName,
          email: speaker.email,
          company: speaker.company,
          token: token,
          tokenHash: tokenHash,
          tags: speaker.tags,
          status: 'RESPONDED'
        }
      })

      const qrCodeId = `TS25-${createdGuest.id.slice(0, 8).toUpperCase()}`

      await prisma.rSVP.create({
        data: {
          guestId: createdGuest.id,
          eventId: eventTechSummit.id,
          attending: speaker.attending,
          plusOnes: 0,
          mealChoice: speaker.meal,
          qrCodeId,
          consentPhotos: true,
          createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000)
        }
      })

      guestsTechSummit.push(createdGuest)
    }

    // Participants standard
    const participants = [
      { firstName: 'Julie', lastName: 'Fontaine', email: 'julie.f@techco.fr', company: 'TechCo', tags: ['Participant', 'Developer'], attending: true, meal: 'Végétarien', expertise: 'Intermédiaire' },
      { firstName: 'Marc', lastName: 'Durand', email: 'marc.d@startup.io', company: 'StartupIO', tags: ['Participant', 'CTO'], attending: true, meal: 'Omnivore', expertise: 'Avancé' },
      { firstName: 'Laura', lastName: 'Chen', email: 'laura.chen@cloudnative.com', company: 'CloudNative Corp', tags: ['Participant', 'DevOps'], attending: true, meal: 'Omnivore', expertise: 'Avancé' },
      { firstName: 'Antoine', lastName: 'Mercier', email: 'antoine.m@datascience.fr', company: 'DataScience Lab', tags: ['Participant', 'Data Scientist'], attending: true, meal: 'Vegan', expertise: 'Intermédiaire' },
      { firstName: 'Sarah', lastName: 'Johnson', email: 'sarah.j@securetech.com', company: 'SecureTech', tags: ['Participant', 'Security'], attending: true, meal: 'Sans Gluten', expertise: 'Expert', allergies: 'Gluten' },
      { firstName: 'David', lastName: 'Lefebvre', email: 'david.l@webdev.fr', company: 'WebDev Agency', tags: ['Participant', 'Developer'], attending: false },
      { firstName: 'Amélie', lastName: 'Blanc', email: 'amelie.b@innovation.io', company: 'Innovation Hub', tags: ['Participant', 'Product'], attending: null }
    ]

    for (const participant of participants) {
      const token = generateToken()
      const tokenHash = await hashToken(token)

      const createdGuest = await prisma.guest.create({
        data: {
          eventId: eventTechSummit.id,
          firstName: participant.firstName,
          lastName: participant.lastName,
          email: participant.email,
          company: participant.company,
          token: token,
          tokenHash: tokenHash,
          tags: participant.tags,
          status: participant.attending === null ? 'INVITED' : 'RESPONDED'
        }
      })

      if (participant.attending !== null && participant.attending !== undefined) {
        const qrCodeId = `TS25-${createdGuest.id.slice(0, 8).toUpperCase()}`

        await prisma.rSVP.create({
          data: {
            guestId: createdGuest.id,
            eventId: eventTechSummit.id,
            attending: participant.attending,
            plusOnes: 0,
            mealChoice: participant.meal,
            allergies: participant.allergies,
            qrCodeId: participant.attending ? qrCodeId : undefined,
            consentPhotos: participant.attending,
            createdAt: new Date(Date.now() - Math.random() * 40 * 24 * 60 * 60 * 1000)
          }
        })
      }

      guestsTechSummit.push(createdGuest)
    }

    // ====================================
    // 6. MODULE TRANSPORT - 10 ANS WEEVUP
    // ====================================
    // Activer le module Transport
    await prisma.eventModule.create({
      data: {
        eventId: event10AnsWeevup.id,
        moduleType: 'TRANSPORT',
        isActive: true
      }
    })

    // Réservations individuelles de transport
    const transportBookingsWeevup = [
      {
        guest: guestsWeevup[0], // Marie Dupont
        type: 'FLIGHT' as TransportType,
        status: 'BOOKED' as BookingStatus,
        departure: { city: 'Lyon', airport: 'LYS', date: '2025-06-20', time: '15:30' },
        arrival: { city: 'Paris', airport: 'CDG', date: '2025-06-20', time: '16:45' },
        carrier: 'Air France',
        bookingRef: 'AF7823',
        seatNumber: '12A',
        estimatedCost: 180,
        actualCost: 175,
        isPaidByCompany: true
      },
      {
        guest: guestsWeevup[1], // Thomas Bernard
        type: 'TRAIN' as TransportType,
        status: 'CONFIRMED' as BookingStatus,
        departure: { city: 'Marseille', station: 'Gare Saint-Charles', date: '2025-06-20', time: '13:15' },
        arrival: { city: 'Paris', station: 'Gare de Lyon', date: '2025-06-20', time: '16:30' },
        carrier: 'SNCF TGV',
        bookingRef: 'TGV9462',
        seatNumber: '45',
        estimatedCost: 120,
        actualCost: 115,
        isPaidByCompany: true
      },
      {
        guest: guestsWeevup[2], // Sophie Leroy
        type: 'TRAIN' as TransportType,
        status: 'BOOKED' as BookingStatus,
        departure: { city: 'Bordeaux', station: 'Gare Saint-Jean', date: '2025-06-20', time: '12:00' },
        arrival: { city: 'Paris', station: 'Gare Montparnasse', date: '2025-06-20', time: '15:05' },
        carrier: 'SNCF TGV',
        bookingRef: 'TGV7721',
        seatNumber: '23',
        estimatedCost: 140,
        actualCost: 140,
        isPaidByCompany: true,
        notes: 'Préférence siège couloir'
      },
      {
        guest: guestsWeevup[3], // Pierre Moreau
        type: 'PERSONAL_CAR' as TransportType,
        status: 'CONFIRMED' as BookingStatus,
        departure: { city: 'Versailles', address: '12 Rue de la Paroisse', date: '2025-06-20', time: '17:30' },
        arrival: { address: '148 Avenue des Champs-Élysées', city: 'Paris', date: '2025-06-20', time: '18:15' },
        notes: 'Arrivée en Tesla Model S',
        isPaidByCompany: false
      }
    ]

    for (const booking of transportBookingsWeevup) {
      await prisma.transportBooking.create({
        data: {
          eventId: event10AnsWeevup.id,
          guestId: booking.guest.id,
          type: booking.type,
          status: booking.status,
          departure: booking.departure,
          arrival: booking.arrival,
          carrier: booking.carrier,
          bookingRef: booking.bookingRef,
          seatNumber: booking.seatNumber,
          estimatedCost: booking.estimatedCost,
          actualCost: booking.actualCost,
          currency: 'EUR',
          isPaidByCompany: booking.isPaidByCompany,
          notes: booking.notes
        }
      })
    }

    // Manifeste : Navette Aéroport CDG → Hôtel
    const manifestCDG = await prisma.transportManifest.create({
      data: {
        eventId: event10AnsWeevup.id,
        type: 'SHUTTLE',
        name: 'Navette Aéroport CDG → Pavillon Royal',
        description: 'Navette groupée depuis l\'aéroport Charles de Gaulle vers le lieu de la soirée',
        departure: {
          city: 'Roissy-en-France',
          address: 'Terminal 2E - Porte 8',
          date: '2025-06-20',
          time: '17:00'
        },
        arrival: {
          city: 'Paris',
          address: '148 Avenue des Champs-Élysées',
          date: '2025-06-20',
          time: '18:00'
        },
        maxCapacity: 20,
        currentCount: 0,
        costPerPerson: 0,
        currency: 'EUR',
        status: 'OPEN'
      }
    })

    // Ajouter des participants au manifeste CDG
    const cdgParticipants = [guestsWeevup[5], guestsWeevup[6], guestsWeevup[7]] // Équipe membres
    for (let i = 0; i < cdgParticipants.length; i++) {
      await prisma.manifestParticipant.create({
        data: {
          manifestId: manifestCDG.id,
          guestId: cdgParticipants[i].id,
          seatNumber: `${i + 1}`
        }
      })
    }

    // Mettre à jour le compteur
    await prisma.transportManifest.update({
      where: { id: manifestCDG.id },
      data: { currentCount: cdgParticipants.length }
    })

    // ====================================
    // 7. MODULE TRANSPORT - TECH SUMMIT
    // ====================================
    // Activer le module Transport
    await prisma.eventModule.create({
      data: {
        eventId: eventTechSummit.id,
        moduleType: 'TRANSPORT',
        isActive: true
      }
    })

    // Réservations VIP pour speakers
    const transportBookingsSummit = [
      {
        guest: guestsTechSummit[0], // Yann LeCun
        type: 'FLIGHT' as TransportType,
        status: 'BOOKED' as BookingStatus,
        departure: { city: 'New York', airport: 'JFK', date: '2025-09-14', time: '18:00' },
        arrival: { city: 'Paris', airport: 'CDG', date: '2025-09-15', time: '07:30' },
        carrier: 'Air France',
        bookingRef: 'AF007',
        seatNumber: '2A',
        estimatedCost: 4500,
        actualCost: 4200,
        isPaidByCompany: true,
        internalNotes: 'VIP Speaker - Business Class confirmée'
      },
      {
        guest: guestsTechSummit[1], // Vitalik Buterin
        type: 'FLIGHT' as TransportType,
        status: 'CONFIRMED' as BookingStatus,
        departure: { city: 'Singapore', airport: 'SIN', date: '2025-09-14', time: '01:00' },
        arrival: { city: 'Paris', airport: 'CDG', date: '2025-09-14', time: '08:45' },
        carrier: 'Singapore Airlines',
        bookingRef: 'SQ334',
        seatNumber: '1K',
        estimatedCost: 5200,
        actualCost: 5200,
        isPaidByCompany: true,
        internalNotes: 'VIP Speaker - Suite réservée'
      },
      {
        guest: guestsTechSummit[2], // Cassie Kozyrkov
        type: 'FLIGHT' as TransportType,
        status: 'BOOKED' as BookingStatus,
        departure: { city: 'San Francisco', airport: 'SFO', date: '2025-09-14', time: '12:00' },
        arrival: { city: 'Paris', airport: 'CDG', date: '2025-09-15', time: '07:00' },
        carrier: 'United Airlines',
        bookingRef: 'UA990',
        seatNumber: '3F',
        estimatedCost: 3800,
        actualCost: 3600,
        isPaidByCompany: true
      },
      {
        guest: guestsTechSummit[3], // Julie Fontaine
        type: 'TRAIN' as TransportType,
        status: 'BOOKED' as BookingStatus,
        departure: { city: 'Lille', station: 'Lille Europe', date: '2025-09-15', time: '06:30' },
        arrival: { city: 'Paris', station: 'Gare du Nord', date: '2025-09-15', time: '07:30' },
        carrier: 'SNCF TGV',
        bookingRef: 'TGV5512',
        seatNumber: '12',
        estimatedCost: 45,
        actualCost: 42,
        isPaidByCompany: true
      },
      {
        guest: guestsTechSummit[4], // Marc Durand
        type: 'TAXI' as TransportType,
        status: 'REQUESTED' as BookingStatus,
        departure: { city: 'Paris', address: 'Hôtel Hilton Opera', date: '2025-09-15', time: '08:00' },
        arrival: { city: 'Paris', address: '2 Place de la Porte de Versailles', date: '2025-09-15', time: '08:30' },
        estimatedCost: 35,
        isPaidByCompany: false,
        notes: 'Taxi standard'
      }
    ]

    for (const booking of transportBookingsSummit) {
      await prisma.transportBooking.create({
        data: {
          eventId: eventTechSummit.id,
          guestId: booking.guest.id,
          type: booking.type,
          status: booking.status,
          departure: booking.departure,
          arrival: booking.arrival,
          carrier: booking.carrier,
          bookingRef: booking.bookingRef,
          seatNumber: booking.seatNumber,
          estimatedCost: booking.estimatedCost,
          actualCost: booking.actualCost,
          currency: 'EUR',
          isPaidByCompany: booking.isPaidByCompany,
          notes: booking.notes,
          internalNotes: booking.internalNotes
        }
      })
    }

    // Manifeste 1 : Navette Hôtel → Convention Center (Matin Jour 1)
    const manifestMorning1 = await prisma.transportManifest.create({
      data: {
        eventId: eventTechSummit.id,
        type: 'SHUTTLE',
        name: 'Navette Hôtels → Convention Center (Matin J1)',
        description: 'Circuit des hôtels partenaires vers le Paris Convention Center',
        departure: {
          city: 'Paris',
          address: 'Départ circuit hôtels - Premier départ Hilton Opera',
          date: '2025-09-15',
          time: '07:30'
        },
        arrival: {
          city: 'Paris',
          address: '2 Place de la Porte de Versailles',
          date: '2025-09-15',
          time: '08:15'
        },
        maxCapacity: 50,
        currentCount: 0,
        costPerPerson: 0,
        currency: 'EUR',
        status: 'OPEN'
      }
    })

    // Manifeste 2 : Navette retour (Soir Jour 1)
    const manifestEvening1 = await prisma.transportManifest.create({
      data: {
        eventId: eventTechSummit.id,
        type: 'SHUTTLE',
        name: 'Navette Convention Center → Hôtels (Soir J1)',
        description: 'Retour vers les hôtels après la soirée networking',
        departure: {
          city: 'Paris',
          address: '2 Place de la Porte de Versailles',
          date: '2025-09-15',
          time: '22:00'
        },
        arrival: {
          city: 'Paris',
          address: 'Circuit hôtels - Dernier arrêt Marriott Rive Gauche',
          date: '2025-09-15',
          time: '23:00'
        },
        maxCapacity: 50,
        currentCount: 0,
        costPerPerson: 0,
        currency: 'EUR',
        status: 'OPEN'
      }
    })

    // Manifeste 3 : Bus VIP Aéroport (Jour 2 - fin)
    const manifestAirport = await prisma.transportManifest.create({
      data: {
        eventId: eventTechSummit.id,
        type: 'SHUTTLE',
        name: 'Navette VIP Convention Center → CDG',
        description: 'Navette express pour les participants ayant un vol le soir même',
        departure: {
          city: 'Paris',
          address: '2 Place de la Porte de Versailles',
          date: '2025-09-16',
          time: '18:30'
        },
        arrival: {
          city: 'Roissy-en-France',
          address: 'Aéroport CDG - Terminaux 1 et 2',
          date: '2025-09-16',
          time: '19:45'
        },
        maxCapacity: 30,
        currentCount: 0,
        costPerPerson: 25,
        currency: 'EUR',
        status: 'CONFIRMED'
      }
    })

    // Ajouter participants aux manifestes
    const morning1Participants = [guestsTechSummit[3], guestsTechSummit[5], guestsTechSummit[6]]
    for (let i = 0; i < morning1Participants.length; i++) {
      await prisma.manifestParticipant.create({
        data: {
          manifestId: manifestMorning1.id,
          guestId: morning1Participants[i].id,
          seatNumber: `${i + 1}`
        }
      })
    }
    await prisma.transportManifest.update({
      where: { id: manifestMorning1.id },
      data: { currentCount: morning1Participants.length }
    })

    const airportParticipants = [guestsTechSummit[0], guestsTechSummit[1], guestsTechSummit[2]]
    for (let i = 0; i < airportParticipants.length; i++) {
      await prisma.manifestParticipant.create({
        data: {
          manifestId: manifestAirport.id,
          guestId: airportParticipants[i].id,
          seatNumber: `A${i + 1}`
        }
      })
    }
    await prisma.transportManifest.update({
      where: { id: manifestAirport.id },
      data: { currentCount: airportParticipants.length }
    })

    // ====================================
    // 8. AGENDA (SESSIONS) - 10 ANS WEEVUP
    // ====================================
    // Créer le programme détaillé de la journée
    const sessionsWeevup = []

    // Session 1 : Accueil & Cocktail
    const session1 = await prisma.session.create({
      data: {
        eventId: event10AnsWeevup.id,
        title: 'Accueil & Cocktail de bienvenue',
        description: 'Champagne de bienvenue, amuse-bouches gastronomiques et networking informel',
        type: 'MEAL',
        status: 'PUBLISHED',
        startTime: new Date('2025-06-20T19:00:00'),
        endTime: new Date('2025-06-20T20:00:00'),
        duration: 60,
        venue: 'Le Pavillon Royal',
        room: 'Salon Principal',
        capacity: 50,
        requiresRegistration: false,
        isPublic: true,
        isHighlighted: false,
        color: '#10B981',
        icon: 'glass-champagne',
        catering: 'Champagne, amuse-bouches'
      }
    })
    sessionsWeevup.push(session1)

    // Session 2 : Cérémonie d'ouverture
    const session2 = await prisma.session.create({
      data: {
        eventId: event10AnsWeevup.id,
        title: 'Cérémonie d\'ouverture - 10 ans en images',
        description: 'Rétrospective vidéo de ces 10 années d\'innovation. Témoignages émouvants et surprises.',
        type: 'KEYNOTE',
        status: 'PUBLISHED',
        startTime: new Date('2025-06-20T20:00:00'),
        endTime: new Date('2025-06-20T20:45:00'),
        duration: 45,
        venue: 'Le Pavillon Royal',
        room: 'Grand Auditorium',
        capacity: 100,
        requiresRegistration: false,
        isPublic: true,
        isHighlighted: true,
        color: '#3B82F6',
        icon: 'presentation',
        equipment: ['Projecteur 4K', 'Micro sans fil', 'Écran géant'],
        speakers: [
          {
            name: 'Jean-Michel Dubois',
            title: 'CEO & Fondateur',
            company: 'Weevup',
            photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400'
          }
        ]
      }
    })
    sessionsWeevup.push(session2)

    // Session 3 : Témoignages & Remise de prix
    const session3 = await prisma.session.create({
      data: {
        eventId: event10AnsWeevup.id,
        title: 'Témoignages clients & Remise de prix',
        description: 'Interventions de clients et partenaires. Remise des Weevup Awards aux collaborateurs d\'exception.',
        type: 'CONFERENCE',
        status: 'PUBLISHED',
        startTime: new Date('2025-06-20T20:45:00'),
        endTime: new Date('2025-06-20T21:00:00'),
        duration: 15,
        venue: 'Le Pavillon Royal',
        room: 'Grand Auditorium',
        capacity: 100,
        requiresRegistration: false,
        isPublic: true,
        isHighlighted: false,
        color: '#F59E0B',
        icon: 'award',
        speakers: [
          {
            name: 'Marie Dupont',
            title: 'Directrice Innovation',
            company: 'TechCorp France'
          },
          {
            name: 'Thomas Bernard',
            title: 'CEO',
            company: 'Innov Solutions'
          }
        ]
      }
    })
    sessionsWeevup.push(session3)

    // Session 4 : Dîner gastronomique
    const session4 = await prisma.session.create({
      data: {
        eventId: event10AnsWeevup.id,
        title: 'Dîner gastronomique',
        description: 'Menu d\'exception en 5 services créé par le Chef étoilé Antoine Lefèvre. Accord mets & vins.',
        type: 'MEAL',
        status: 'PUBLISHED',
        startTime: new Date('2025-06-20T21:00:00'),
        endTime: new Date('2025-06-20T22:30:00'),
        duration: 90,
        venue: 'Le Pavillon Royal',
        room: 'Salle de Banquet',
        capacity: 50,
        requiresRegistration: false,
        isPublic: true,
        isHighlighted: true,
        color: '#EF4444',
        icon: 'utensils',
        catering: 'Menu gastronomique 5 services + Accord mets & vins',
        speakers: [
          {
            name: 'Chef Antoine Lefèvre',
            title: 'Chef Étoilé',
            company: 'Restaurant Le Pavillon'
          }
        ]
      }
    })
    sessionsWeevup.push(session4)

    // Session 5 : Soirée dansante
    const session5 = await prisma.session.create({
      data: {
        eventId: event10AnsWeevup.id,
        title: 'Soirée dansante & DJ Set',
        description: 'Ambiance festive avec DJ live. Bar ouvert et photobooth.',
        type: 'TEAMBUILDING',
        status: 'PUBLISHED',
        startTime: new Date('2025-06-20T22:30:00'),
        endTime: new Date('2025-06-20T23:59:00'),
        duration: 89,
        venue: 'Le Pavillon Royal',
        room: 'Salon Principal',
        capacity: 100,
        requiresRegistration: false,
        isPublic: true,
        isHighlighted: false,
        color: '#8B5CF6',
        icon: 'music',
        equipment: ['DJ Setup', 'Piste de danse éclairée', 'Photobooth'],
        catering: 'Bar ouvert'
      }
    })
    sessionsWeevup.push(session5)

    // Inscrire des participants aux sessions
    for (const session of sessionsWeevup) {
      // Inscrire tous les invités confirmés
      const confirmedGuests = guestsWeevup.slice(0, 8)

      for (const guest of confirmedGuests) {
        await prisma.sessionParticipant.create({
          data: {
            sessionId: session.id,
            guestId: guest.id,
            status: 'confirmed',
            registeredAt: new Date(Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000)
          }
        })
      }
    }

    // ====================================
    // 9. TIMELINE COMPLÈTE - 10 ANS WEEVUP
    // ====================================
    // Créer une timeline qui montre le parcours complet d'un invité

    // J-1 : 19 juin - Arrivées et check-in
    await prisma.timelineEvent.create({
      data: {
        eventId: event10AnsWeevup.id,
        type: 'HOTEL_CHECKIN',
        title: 'Arrivée des invités & Check-in hôtel',
        description: 'Arrivée des invités de province. Check-in dans les hôtels Le Pavillon Royal et Hôtel de la Paix.',
        startTime: new Date('2025-06-19T14:00:00'),
        endTime: new Date('2025-06-19T20:00:00'),
        allDay: false,
        location: 'Hôtels partenaires - Paris 8ème',
        icon: 'hotel',
        color: '#06B6D4',
        isPublic: true
      }
    })

    // J : 20 juin matin - Arrivées tardives
    await prisma.timelineEvent.create({
      data: {
        eventId: event10AnsWeevup.id,
        type: 'TRANSPORT_ARRIVAL',
        title: 'Arrivées le jour J',
        description: 'Arrivées des invités de dernière minute (trains, vols). Navette CDG disponible à 17h.',
        startTime: new Date('2025-06-20T12:00:00'),
        endTime: new Date('2025-06-20T18:00:00'),
        allDay: false,
        location: 'Gares & Aéroport CDG',
        icon: 'plane-arrival',
        color: '#10B981',
        isPublic: false
      }
    })

    // J : 20 juin - Chaque session devient un événement timeline
    for (const session of sessionsWeevup) {
      await prisma.timelineEvent.create({
        data: {
          eventId: event10AnsWeevup.id,
          type: 'SESSION',
          title: session.title,
          description: session.description || '',
          startTime: session.startTime,
          endTime: session.endTime,
          allDay: false,
          location: `${session.venue} - ${session.room}`,
          icon: session.icon || 'calendar',
          color: session.color || '#6366F1',
          isPublic: true,
          sessionId: session.id
        }
      })
    }

    // J+1 : 21 juin - Check-out
    await prisma.timelineEvent.create({
      data: {
        eventId: event10AnsWeevup.id,
        type: 'HOTEL_CHECKOUT',
        title: 'Check-out & Départs',
        description: 'Check-out des hôtels. Navettes organisées vers gares et aéroport pour les invités de province.',
        startTime: new Date('2025-06-21T08:00:00'),
        endTime: new Date('2025-06-21T12:00:00'),
        allDay: false,
        location: 'Hôtels partenaires',
        icon: 'luggage',
        color: '#F59E0B',
        isPublic: true
      }
    })

    await prisma.timelineEvent.create({
      data: {
        eventId: event10AnsWeevup.id,
        type: 'TRANSPORT_DEPARTURE',
        title: 'Navettes de départ',
        description: 'Navettes organisées vers l\'aéroport CDG (9h, 11h) et gares parisiennes.',
        startTime: new Date('2025-06-21T09:00:00'),
        endTime: new Date('2025-06-21T12:00:00'),
        allDay: false,
        location: 'Hôtels → Gares & CDG',
        icon: 'bus',
        color: '#EF4444',
        isPublic: false
      }
    })

    // ====================================
    // 10. MODULE HÉBERGEMENT - 10 ANS WEEVUP
    // ====================================
    // Activer le module Hébergement
    await prisma.eventModule.create({
      data: {
        eventId: event10AnsWeevup.id,
        moduleType: 'ACCOMMODATION',
        isActive: true
      }
    })

    // Hôtel 1 : Le Pavillon Royal (Hôtel haut de gamme)
    const hotelPavillonRoyal = await prisma.accommodation.create({
      data: {
        eventId: event10AnsWeevup.id,
        name: 'Le Pavillon Royal',
        type: 'HOTEL',
        address: '148 Avenue des Champs-Élysées',
        city: 'Paris',
        country: 'France',
        postalCode: '75008',
        phone: '+33 1 42 25 14 15',
        email: 'contact@pavillonroyal.fr',
        website: 'https://pavillonroyal.fr',
        starRating: 5,
        amenities: ['WiFi Gratuit', 'Spa', 'Restaurant Gastronomique', 'Bar', 'Room Service 24/7', 'Parking Voiturier'],
        description: 'Hôtel 5 étoiles situé directement sur les Champs-Élysées, lieu même de la soirée. Luxe et élégance.',
        totalRooms: 120,
        allocatedRooms: 15,
        latitude: 48.8698,
        longitude: 2.3074,
        distanceFromVenue: 0.0, // C'est le lieu de l'événement
        bookingDeadline: new Date('2025-06-01'),
        bookingRef: 'WEEVUP10',
        isPreferred: true,
        contactPerson: 'Marie Fontaine',
        checkInTime: '15:00',
        checkOutTime: '11:00'
      }
    })

    // Hôtel 2 : Hôtel de la Paix (Plus abordable, à proximité)
    const hotelDeLaPaix = await prisma.accommodation.create({
      data: {
        eventId: event10AnsWeevup.id,
        name: 'Hôtel de la Paix',
        type: 'HOTEL',
        address: '12 Rue Balzac',
        city: 'Paris',
        country: 'France',
        postalCode: '75008',
        phone: '+33 1 40 76 34 56',
        email: 'reservations@hoteldelapaix.fr',
        website: 'https://hoteldelapaix-paris.com',
        starRating: 4,
        amenities: ['WiFi Gratuit', 'Petit-déjeuner', 'Concierge', 'Parking'],
        description: 'Hôtel 4 étoiles à 5 minutes à pied du lieu de la soirée. Confort et proximité garantis.',
        totalRooms: 80,
        allocatedRooms: 20,
        latitude: 48.8745,
        longitude: 2.3012,
        distanceFromVenue: 0.4,
        bookingDeadline: new Date('2025-06-01'),
        bookingRef: 'WV10YEARS',
        isPreferred: false,
        contactPerson: 'Jean Dupuis',
        checkInTime: '14:00',
        checkOutTime: '12:00'
      }
    })

    // Créer des chambres pour Le Pavillon Royal
    const roomsPavillonRoyal = []
    // 5 Suites
    for (let i = 1; i <= 5; i++) {
      const room = await prisma.room.create({
        data: {
          accommodationId: hotelPavillonRoyal.id,
          roomNumber: `Suite ${i}`,
          floor: Math.floor((i - 1) / 5) + 5,
          type: 'SUITE',
          status: i <= 3 ? 'ASSIGNED' : 'AVAILABLE',
          maxOccupancy: 2,
          currentOccupancy: i <= 3 ? 2 : 0,
          bedConfiguration: '1 King Size Bed + Salon',
          view: 'Vue sur les Champs-Élysées',
          isAccessible: i === 1,
          isSmokingAllowed: false,
          amenities: ['Mini-bar', 'Nespresso', 'Baignoire Jacuzzi', 'Télé 65"', 'Coffre-fort'],
          ratePerNight: 450.0,
          currency: 'EUR',
          availableFrom: new Date('2025-06-19'),
          availableUntil: new Date('2025-06-21')
        }
      })
      roomsPavillonRoyal.push(room)
    }

    // 10 Chambres Doubles
    for (let i = 1; i <= 10; i++) {
      const room = await prisma.room.create({
        data: {
          accommodationId: hotelPavillonRoyal.id,
          roomNumber: `${300 + i}`,
          floor: 3,
          type: 'DOUBLE',
          status: i <= 5 ? 'ASSIGNED' : 'AVAILABLE',
          maxOccupancy: 2,
          currentOccupancy: i <= 5 ? 1 : 0,
          bedConfiguration: '1 Lit Double Queen Size',
          view: i % 2 === 0 ? 'Vue Jardin' : 'Vue Ville',
          isAccessible: i === 10,
          isSmokingAllowed: false,
          amenities: ['Mini-bar', 'Nespresso', 'Télé 50"', 'Coffre-fort'],
          ratePerNight: 280.0,
          currency: 'EUR',
          availableFrom: new Date('2025-06-19'),
          availableUntil: new Date('2025-06-21')
        }
      })
      roomsPavillonRoyal.push(room)
    }

    // Créer des chambres pour Hôtel de la Paix
    const roomsDeLaPaix = []
    for (let i = 1; i <= 15; i++) {
      const room = await prisma.room.create({
        data: {
          accommodationId: hotelDeLaPaix.id,
          roomNumber: `${200 + i}`,
          floor: Math.floor((i - 1) / 5) + 2,
          type: i <= 3 ? 'TWIN' : 'DOUBLE',
          status: i <= 7 ? 'ASSIGNED' : 'AVAILABLE',
          maxOccupancy: 2,
          currentOccupancy: i <= 7 ? 1 : 0,
          bedConfiguration: i <= 3 ? '2 Lits Simples' : '1 Lit Double',
          view: i % 3 === 0 ? 'Vue Cour' : 'Vue Rue',
          isAccessible: i === 15,
          isSmokingAllowed: false,
          amenities: ['WiFi', 'Télé', 'Bureau', 'Sèche-cheveux'],
          ratePerNight: 180.0,
          currency: 'EUR',
          availableFrom: new Date('2025-06-19'),
          availableUntil: new Date('2025-06-21')
        }
      })
      roomsDeLaPaix.push(room)
    }

    // Assigner des chambres aux invités VIP de 10 ans Weevup
    const roomAssignmentsWeevup = [
      {
        guest: guestsWeevup[0], // Marie Dupont (VIP)
        room: roomsPavillonRoyal[0], // Suite 1
        checkIn: '2025-06-20',
        checkOut: '2025-06-21',
        nights: 1,
        notes: 'Suite accessible, préférence lit king size'
      },
      {
        guest: guestsWeevup[1], // Thomas Bernard (VIP)
        room: roomsPavillonRoyal[1], // Suite 2
        checkIn: '2025-06-20',
        checkOut: '2025-06-21',
        nights: 1,
        notes: 'Arrivée tardive prévue vers 18h'
      },
      {
        guest: guestsWeevup[2], // Sophie Leroy (VIP Partenaire)
        room: roomsPavillonRoyal[2], // Suite 3
        checkIn: '2025-06-19',
        checkOut: '2025-06-21',
        nights: 2,
        notes: 'Arrivée la veille, besoin de calme'
      },
      {
        guest: guestsWeevup[3], // Pierre Moreau (VIP Investisseur)
        room: roomsPavillonRoyal[5], // Chambre Double 301
        checkIn: '2025-06-20',
        checkOut: '2025-06-21',
        nights: 1,
        notes: 'Préférence vue ville'
      },
      {
        guest: guestsWeevup[5], // Lucas Dubois (Équipe)
        room: roomsDeLaPaix[0], // 201
        checkIn: '2025-06-19',
        checkOut: '2025-06-21',
        nights: 2,
        notes: 'Arrivée le 19 pour préparation'
      },
      {
        guest: guestsWeevup[6], // Emma Martin (Équipe)
        room: roomsDeLaPaix[1], // 202
        checkIn: '2025-06-19',
        checkOut: '2025-06-21',
        nights: 2
      },
      {
        guest: guestsWeevup[7], // Alexandre Rousseau (Équipe)
        room: roomsDeLaPaix[2], // 203
        checkIn: '2025-06-19',
        checkOut: '2025-06-21',
        nights: 2
      }
    ]

    for (const assignment of roomAssignmentsWeevup) {
      await prisma.roomAssignment.create({
        data: {
          roomId: assignment.room.id,
          guestId: assignment.guest.id,
          checkInDate: new Date(assignment.checkIn),
          checkOutDate: new Date(assignment.checkOut),
          numberOfNights: assignment.nights,
          isPrimaryGuest: true,
          specialRequests: assignment.notes,
          isConfirmed: true,
          confirmedAt: new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000),
          isPaid: true,
          paidAmount: assignment.room.ratePerNight! * assignment.nights,
          currency: 'EUR'
        }
      })
    }

    // ====================================
    // 8. AGENDA (SESSIONS) - TECH SUMMIT 2025
    // ====================================
    // Créer un programme de conférence sur 2 jours avec sessions parallèles
    const sessionsTechSummit = []

    // JOUR 1 - 15 septembre 2025
    // Session 1 : Accueil & petit-déjeuner
    const summitSession1 = await prisma.session.create({
      data: {
        eventId: eventTechSummit.id,
        title: 'Accueil & Petit-déjeuner networking',
        description: 'Café, viennoiseries et premier networking. Récupération des badges.',
        type: 'MEAL',
        status: 'PUBLISHED',
        startTime: new Date('2025-09-15T08:00:00'),
        endTime: new Date('2025-09-15T09:00:00'),
        duration: 60,
        venue: 'Paris Convention Center',
        room: 'Hall Principal',
        capacity: 200,
        requiresRegistration: false,
        isPublic: true,
        isHighlighted: false,
        color: '#10B981',
        icon: 'coffee',
        catering: 'Petit-déjeuner continental'
      }
    })
    sessionsTechSummit.push(summitSession1)

    // Session 2 : Keynote d'ouverture - IA
    const summitSession2 = await prisma.session.create({
      data: {
        eventId: eventTechSummit.id,
        title: 'Keynote : The Future of AI - Yann LeCun',
        description: 'Vision de l\'avenir de l\'intelligence artificielle par le Prix Turing Yann LeCun, Chief AI Scientist chez Meta.',
        type: 'KEYNOTE',
        status: 'PUBLISHED',
        startTime: new Date('2025-09-15T09:00:00'),
        endTime: new Date('2025-09-15T10:00:00'),
        duration: 60,
        venue: 'Paris Convention Center',
        room: 'Grand Auditorium',
        capacity: 500,
        requiresRegistration: false,
        isPublic: true,
        isHighlighted: true,
        color: '#3B82F6',
        icon: 'presentation',
        equipment: ['Projecteur 4K', 'Micro cravate', 'Écran LED géant'],
        speakers: [
          {
            name: 'Yann LeCun',
            title: 'Chief AI Scientist & Turing Award Winner',
            company: 'Meta',
            bio: 'Pionnier du deep learning et Prix Turing 2018',
            photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'
          }
        ]
      }
    })
    sessionsTechSummit.push(summitSession2)

    // Session 3 : Workshop blockchain
    const summitSession3 = await prisma.session.create({
      data: {
        eventId: eventTechSummit.id,
        title: 'Workshop : Smart Contracts & Ethereum',
        description: 'Atelier pratique sur le développement de smart contracts avec Vitalik Buterin. Apportez votre laptop.',
        type: 'WORKSHOP',
        status: 'PUBLISHED',
        startTime: new Date('2025-09-15T10:30:00'),
        endTime: new Date('2025-09-15T12:00:00'),
        duration: 90,
        venue: 'Paris Convention Center',
        room: 'Salle Workshop A',
        capacity: 50,
        requiresRegistration: true,
        isPublic: true,
        isHighlighted: true,
        color: '#8B5CF6',
        icon: 'laptop-code',
        equipment: ['WiFi haut débit', 'Prises électriques', 'Écran'],
        speakers: [
          {
            name: 'Vitalik Buterin',
            title: 'Co-founder',
            company: 'Ethereum',
            bio: 'Créateur d\'Ethereum et pionnier de la blockchain',
            photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400'
          }
        ],
        prerequisites: ['Connaissance de base en programmation', 'Laptop avec Node.js installé']
      }
    })
    sessionsTechSummit.push(summitSession3)

    // Session 4 : Panel Data Science
    const summitSession4 = await prisma.session.create({
      data: {
        eventId: eventTechSummit.id,
        title: 'Panel : Data Science in Production',
        description: 'Discussion avec Cassie Kozyrkov (Google) sur les défis du déploiement de modèles ML en production.',
        type: 'CONFERENCE',
        status: 'PUBLISHED',
        startTime: new Date('2025-09-15T10:30:00'),
        endTime: new Date('2025-09-15T12:00:00'),
        duration: 90,
        venue: 'Paris Convention Center',
        room: 'Salle Conférence B',
        capacity: 100,
        requiresRegistration: false,
        isPublic: true,
        isHighlighted: false,
        color: '#F59E0B',
        icon: 'chart-bar',
        speakers: [
          {
            name: 'Cassie Kozyrkov',
            title: 'Chief Decision Scientist',
            company: 'Google',
            bio: 'Experte en Data Science et prise de décision',
            photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400'
          }
        ]
      }
    })
    sessionsTechSummit.push(summitSession4)

    // Session 5 : Déjeuner networking
    const summitSession5 = await prisma.session.create({
      data: {
        eventId: eventTechSummit.id,
        title: 'Déjeuner networking',
        description: 'Buffet gastronomique et networking. Rencontrez les speakers et autres participants.',
        type: 'MEAL',
        status: 'PUBLISHED',
        startTime: new Date('2025-09-15T12:00:00'),
        endTime: new Date('2025-09-15T13:30:00'),
        duration: 90,
        venue: 'Paris Convention Center',
        room: 'Espace Restauration',
        capacity: 200,
        requiresRegistration: false,
        isPublic: true,
        isHighlighted: false,
        color: '#EF4444',
        icon: 'utensils',
        catering: 'Buffet chaud & froid, options végétariennes'
      }
    })
    sessionsTechSummit.push(summitSession5)

    // Session 6 : Track Tech - Cloud Native
    const summitSession6 = await prisma.session.create({
      data: {
        eventId: eventTechSummit.id,
        title: 'Cloud Native Architecture',
        description: 'Architectures cloud-native : Kubernetes, microservices et serverless.',
        type: 'CONFERENCE',
        status: 'PUBLISHED',
        startTime: new Date('2025-09-15T14:00:00'),
        endTime: new Date('2025-09-15T15:30:00'),
        duration: 90,
        venue: 'Paris Convention Center',
        room: 'Salle Conférence A',
        capacity: 100,
        requiresRegistration: false,
        isPublic: true,
        isHighlighted: false,
        color: '#06B6D4',
        icon: 'cloud'
      }
    })
    sessionsTechSummit.push(summitSession6)

    // Session 7 : Track Business - Cybersécurité
    const summitSession7 = await prisma.session.create({
      data: {
        eventId: eventTechSummit.id,
        title: 'Cybersécurité : Enjeux 2025',
        description: 'Les nouveaux défis de la cybersécurité à l\'ère de l\'IA et du cloud.',
        type: 'CONFERENCE',
        status: 'PUBLISHED',
        startTime: new Date('2025-09-15T14:00:00'),
        endTime: new Date('2025-09-15T15:30:00'),
        duration: 90,
        venue: 'Paris Convention Center',
        room: 'Salle Conférence B',
        capacity: 80,
        requiresRegistration: false,
        isPublic: true,
        isHighlighted: false,
        color: '#DC2626',
        icon: 'shield-check'
      }
    })
    sessionsTechSummit.push(summitSession7)

    // Session 8 : Pause café & networking
    const summitSession8 = await prisma.session.create({
      data: {
        eventId: eventTechSummit.id,
        title: 'Pause café & Networking',
        description: 'Pause café, snacks et discussions informelles.',
        type: 'BREAK',
        status: 'PUBLISHED',
        startTime: new Date('2025-09-15T15:30:00'),
        endTime: new Date('2025-09-15T16:00:00'),
        duration: 30,
        venue: 'Paris Convention Center',
        room: 'Espace Lounge',
        capacity: 200,
        requiresRegistration: false,
        isPublic: true,
        isHighlighted: false,
        color: '#10B981',
        icon: 'coffee',
        catering: 'Café, thé, jus de fruits, snacks'
      }
    })
    sessionsTechSummit.push(summitSession8)

    // Session 9 : Closing keynote jour 1
    const summitSession9 = await prisma.session.create({
      data: {
        eventId: eventTechSummit.id,
        title: 'Keynote de clôture J1 : Tech for Good',
        description: 'Comment la technologie peut résoudre les grands défis sociétaux et environnementaux.',
        type: 'KEYNOTE',
        status: 'PUBLISHED',
        startTime: new Date('2025-09-15T16:00:00'),
        endTime: new Date('2025-09-15T17:00:00'),
        duration: 60,
        venue: 'Paris Convention Center',
        room: 'Grand Auditorium',
        capacity: 500,
        requiresRegistration: false,
        isPublic: true,
        isHighlighted: true,
        color: '#3B82F6',
        icon: 'presentation'
      }
    })
    sessionsTechSummit.push(summitSession9)

    // Session 10 : Cocktail de clôture J1
    const summitSession10 = await prisma.session.create({
      data: {
        eventId: eventTechSummit.id,
        title: 'Cocktail de clôture Jour 1',
        description: 'Cocktail dînatoire avec champagne et networking décontracté.',
        type: 'MEAL',
        status: 'PUBLISHED',
        startTime: new Date('2025-09-15T17:30:00'),
        endTime: new Date('2025-09-15T19:30:00'),
        duration: 120,
        venue: 'Paris Convention Center',
        room: 'Terrasse Panoramique',
        capacity: 200,
        requiresRegistration: false,
        isPublic: true,
        isHighlighted: true,
        color: '#8B5CF6',
        icon: 'glass-champagne',
        catering: 'Cocktail dînatoire, champagne, bar ouvert'
      }
    })
    sessionsTechSummit.push(summitSession10)

    // JOUR 2 - 16 septembre 2025
    // Session 11 : Accueil J2
    const summitSession11 = await prisma.session.create({
      data: {
        eventId: eventTechSummit.id,
        title: 'Accueil Jour 2 & Petit-déjeuner',
        description: 'Café et viennoiseries pour bien démarrer la seconde journée.',
        type: 'MEAL',
        status: 'PUBLISHED',
        startTime: new Date('2025-09-16T08:30:00'),
        endTime: new Date('2025-09-16T09:00:00'),
        duration: 30,
        venue: 'Paris Convention Center',
        room: 'Hall Principal',
        capacity: 200,
        requiresRegistration: false,
        isPublic: true,
        isHighlighted: false,
        color: '#10B981',
        icon: 'coffee',
        catering: 'Petit-déjeuner'
      }
    })
    sessionsTechSummit.push(summitSession11)

    // Session 12 : Keynote J2 - Startups & Innovation
    const summitSession12 = await prisma.session.create({
      data: {
        eventId: eventTechSummit.id,
        title: 'Keynote : Construire la prochaine licorne tech',
        description: 'Retours d\'expérience de founders qui ont créé et scalé des startups tech à succès.',
        type: 'KEYNOTE',
        status: 'PUBLISHED',
        startTime: new Date('2025-09-16T09:00:00'),
        endTime: new Date('2025-09-16T10:00:00'),
        duration: 60,
        venue: 'Paris Convention Center',
        room: 'Grand Auditorium',
        capacity: 500,
        requiresRegistration: false,
        isPublic: true,
        isHighlighted: true,
        color: '#3B82F6',
        icon: 'presentation'
      }
    })
    sessionsTechSummit.push(summitSession12)

    // Session 13 : Cérémonie de clôture
    const summitSession13 = await prisma.session.create({
      data: {
        eventId: eventTechSummit.id,
        title: 'Cérémonie de clôture & Prix Innovation',
        description: 'Remise des prix, annonces et remerciements. Au revoir et à l\'année prochaine !',
        type: 'CONFERENCE',
        status: 'PUBLISHED',
        startTime: new Date('2025-09-16T10:30:00'),
        endTime: new Date('2025-09-16T11:30:00'),
        duration: 60,
        venue: 'Paris Convention Center',
        room: 'Grand Auditorium',
        capacity: 500,
        requiresRegistration: false,
        isPublic: true,
        isHighlighted: true,
        color: '#F59E0B',
        icon: 'award'
      }
    })
    sessionsTechSummit.push(summitSession13)

    // Inscrire les participants aux sessions
    for (const session of sessionsTechSummit) {
      // Inscrire les invités confirmés
      const confirmedGuestsSummit = guestsTechSummit.slice(0, 8)

      for (const guest of confirmedGuestsSummit) {
        await prisma.sessionParticipant.create({
          data: {
            sessionId: session.id,
            guestId: guest.id,
            status: 'confirmed',
            registeredAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
          }
        })
      }
    }

    // ====================================
    // 9. TIMELINE COMPLÈTE - TECH SUMMIT 2025
    // ====================================
    // Timeline pour une conférence de 2 jours avec hébergement

    // J-1 : 14 septembre - Arrivées anticipées
    await prisma.timelineEvent.create({
      data: {
        eventId: eventTechSummit.id,
        type: 'HOTEL_CHECKIN',
        title: 'Arrivées J-1 & Check-in hôtels',
        description: 'Arrivée anticipée des speakers internationaux et participants VIP. Check-in Hilton Opera et Marriott.',
        startTime: new Date('2025-09-14T14:00:00'),
        endTime: new Date('2025-09-14T22:00:00'),
        allDay: false,
        location: 'Hilton Opera & Marriott Rive Gauche',
        icon: 'hotel',
        color: '#06B6D4',
        isPublic: false
      }
    })

    // J : 15 septembre - Jour 1 de la conférence
    await prisma.timelineEvent.create({
      data: {
        eventId: eventTechSummit.id,
        type: 'TRANSPORT_ARRIVAL',
        title: 'Arrivées Jour 1',
        description: 'Navettes VIP depuis les hôtels vers le Convention Center. Départs à 7h30, 7h45, 8h.',
        startTime: new Date('2025-09-15T07:00:00'),
        endTime: new Date('2025-09-15T08:30:00'),
        allDay: false,
        location: 'Hôtels → Paris Convention Center',
        icon: 'bus',
        color: '#10B981',
        isPublic: false
      }
    })

    // Créer des événements timeline pour chaque session importante
    for (const session of sessionsTechSummit.filter(s => s.isHighlighted || s.type === 'KEYNOTE')) {
      await prisma.timelineEvent.create({
        data: {
          eventId: eventTechSummit.id,
          type: 'SESSION',
          title: session.title,
          description: session.description || '',
          startTime: session.startTime,
          endTime: session.endTime,
          allDay: false,
          location: `${session.venue} - ${session.room}`,
          icon: session.icon || 'calendar',
          color: session.color || '#6366F1',
          isPublic: true,
          sessionId: session.id
        }
      })
    }

    // J+1 : 16 septembre soir - Fin de la conférence
    await prisma.timelineEvent.create({
      data: {
        eventId: eventTechSummit.id,
        type: 'TRANSPORT_DEPARTURE',
        title: 'Navettes retour hôtels',
        description: 'Navettes organisées depuis le Convention Center vers les hôtels après la clôture.',
        startTime: new Date('2025-09-16T11:30:00'),
        endTime: new Date('2025-09-16T13:00:00'),
        allDay: false,
        location: 'Convention Center → Hôtels',
        icon: 'bus',
        color: '#10B981',
        isPublic: false
      }
    })

    // J+2 : 17 septembre - Check-out et départs
    await prisma.timelineEvent.create({
      data: {
        eventId: eventTechSummit.id,
        type: 'HOTEL_CHECKOUT',
        title: 'Check-out & Départs',
        description: 'Check-out des hôtels. Navettes organisées vers aéroports (CDG, Orly) et gares.',
        startTime: new Date('2025-09-17T08:00:00'),
        endTime: new Date('2025-09-17T12:00:00'),
        allDay: false,
        location: 'Hôtels partenaires',
        icon: 'luggage',
        color: '#F59E0B',
        isPublic: false
      }
    })

    await prisma.timelineEvent.create({
      data: {
        eventId: eventTechSummit.id,
        type: 'TRANSPORT_DEPARTURE',
        title: 'Navettes aéroports & gares',
        description: 'Navettes groupées vers CDG (9h, 11h), Orly (10h) et gares parisiennes.',
        startTime: new Date('2025-09-17T09:00:00'),
        endTime: new Date('2025-09-17T13:00:00'),
        allDay: false,
        location: 'Hôtels → CDG, Orly, Gares',
        icon: 'plane-departure',
        color: '#EF4444',
        isPublic: false
      }
    })

    // ====================================
    // 10. MODULE HÉBERGEMENT - TECH SUMMIT
    // ====================================
    // Activer le module Hébergement
    await prisma.eventModule.create({
      data: {
        eventId: eventTechSummit.id,
        moduleType: 'ACCOMMODATION',
        isActive: true
      }
    })

    // Hôtel 1 : Hilton Paris Opera
    const hotelHiltonOpera = await prisma.accommodation.create({
      data: {
        eventId: eventTechSummit.id,
        name: 'Hilton Paris Opera',
        type: 'HOTEL',
        address: '108 Rue Saint-Lazare',
        city: 'Paris',
        country: 'France',
        postalCode: '75008',
        phone: '+33 1 40 08 44 44',
        email: 'events@hiltonparis.com',
        website: 'https://www.hilton.com/paris-opera',
        starRating: 4,
        amenities: ['WiFi Gratuit', 'Salle de Sport', 'Restaurant', 'Bar', 'Business Center', 'Parking'],
        description: 'Hôtel 4 étoiles moderne idéalement situé. Navette gratuite vers le Convention Center.',
        totalRooms: 268,
        allocatedRooms: 50,
        latitude: 48.8765,
        longitude: 2.3272,
        distanceFromVenue: 4.2,
        bookingDeadline: new Date('2025-08-15'),
        bookingRef: 'TECHSUM25',
        isPreferred: true,
        contactPerson: 'Sarah Williams',
        checkInTime: '15:00',
        checkOutTime: '12:00'
      }
    })

    // Hôtel 2 : Marriott Rive Gauche
    const hotelMarriottRiveGauche = await prisma.accommodation.create({
      data: {
        eventId: eventTechSummit.id,
        name: 'Marriott Rive Gauche',
        type: 'HOTEL',
        address: '17 Boulevard Saint-Jacques',
        city: 'Paris',
        country: 'France',
        postalCode: '75014',
        phone: '+33 1 40 78 79 80',
        email: 'reservations@marriott-paris.fr',
        website: 'https://www.marriott.com/paris-rive-gauche',
        starRating: 4,
        amenities: ['WiFi', 'Piscine', 'Restaurant', 'Bar', 'Salle de Sport', 'Navette'],
        description: 'À 10 minutes du Convention Center. Confort Marriott avec piscine intérieure.',
        totalRooms: 200,
        allocatedRooms: 40,
        latitude: 48.8322,
        longitude: 2.3369,
        distanceFromVenue: 2.1,
        bookingDeadline: new Date('2025-08-15'),
        bookingRef: 'TS2025',
        isPreferred: false,
        contactPerson: 'Pierre Dubois',
        checkInTime: '15:00',
        checkOutTime: '11:00'
      }
    })

    // Créer des chambres pour Hilton Opera (20 chambres exemple)
    const roomsHilton = []
    for (let i = 1; i <= 20; i++) {
      const room = await prisma.room.create({
        data: {
          accommodationId: hotelHiltonOpera.id,
          roomNumber: `${500 + i}`,
          floor: 5 + Math.floor((i - 1) / 10),
          type: i <= 3 ? 'SUITE' : 'DOUBLE',
          status: i <= 8 ? 'ASSIGNED' : 'AVAILABLE',
          maxOccupancy: i <= 3 ? 3 : 2,
          currentOccupancy: i <= 8 ? 1 : 0,
          bedConfiguration: i <= 3 ? '1 King + Salon' : '1 Queen Bed',
          view: i % 2 === 0 ? 'Vue Ville' : 'Vue Cour',
          isAccessible: i === 20,
          isSmokingAllowed: false,
          amenities: ['WiFi', 'Télé Smart', 'Mini-bar', 'Coffre-fort', 'Bureau'],
          ratePerNight: i <= 3 ? 350.0 : 220.0,
          currency: 'EUR',
          availableFrom: new Date('2025-09-14'),
          availableUntil: new Date('2025-09-17')
        }
      })
      roomsHilton.push(room)
    }

    // Créer des chambres pour Marriott (15 chambres exemple)
    const roomsMarriott = []
    for (let i = 1; i <= 15; i++) {
      const room = await prisma.room.create({
        data: {
          accommodationId: hotelMarriottRiveGauche.id,
          roomNumber: `${400 + i}`,
          floor: 4,
          type: i <= 2 ? 'SUITE' : 'DOUBLE',
          status: i <= 6 ? 'ASSIGNED' : 'AVAILABLE',
          maxOccupancy: 2,
          currentOccupancy: i <= 6 ? 1 : 0,
          bedConfiguration: i <= 2 ? '1 King + Salon' : '1 Queen Bed',
          view: i % 3 === 0 ? 'Vue Seine' : 'Vue Jardin',
          isAccessible: i === 15,
          isSmokingAllowed: false,
          amenities: ['WiFi', 'Télé', 'Mini-frigo', 'Bureau'],
          ratePerNight: i <= 2 ? 320.0 : 200.0,
          currency: 'EUR',
          availableFrom: new Date('2025-09-14'),
          availableUntil: new Date('2025-09-17')
        }
      })
      roomsMarriott.push(room)
    }

    // Assigner des chambres aux speakers et participants VIP
    const roomAssignmentsSummit = [
      {
        guest: guestsTechSummit[0], // Yann LeCun (Speaker VIP)
        room: roomsHilton[0], // Suite
        checkIn: '2025-09-14',
        checkOut: '2025-09-17',
        nights: 3,
        notes: 'Speaker VIP - Suite avec vue, arrivée le 14 au soir'
      },
      {
        guest: guestsTechSummit[1], // Vitalik Buterin (Speaker VIP)
        room: roomsHilton[1], // Suite
        checkIn: '2025-09-14',
        checkOut: '2025-09-17',
        nights: 3,
        notes: 'Speaker VIP - Suite, préférence calme'
      },
      {
        guest: guestsTechSummit[2], // Cassie Kozyrkov (Speaker VIP)
        room: roomsHilton[2], // Suite
        checkIn: '2025-09-14',
        checkOut: '2025-09-17',
        nights: 3,
        notes: 'Speaker VIP - Suite avec bureau'
      },
      {
        guest: guestsTechSummit[3], // Julie Fontaine
        room: roomsHilton[3], // Double
        checkIn: '2025-09-14',
        checkOut: '2025-09-17',
        nights: 3
      },
      {
        guest: guestsTechSummit[4], // Marc Durand
        room: roomsHilton[4], // Double
        checkIn: '2025-09-15',
        checkOut: '2025-09-17',
        nights: 2
      },
      {
        guest: guestsTechSummit[5], // Laura Chen
        room: roomsMarriott[0], // Suite
        checkIn: '2025-09-14',
        checkOut: '2025-09-17',
        nights: 3
      },
      {
        guest: guestsTechSummit[6], // Antoine Mercier
        room: roomsMarriott[2], // Double
        checkIn: '2025-09-14',
        checkOut: '2025-09-16',
        nights: 2
      },
      {
        guest: guestsTechSummit[7], // Sarah Johnson
        room: roomsMarriott[3], // Double
        checkIn: '2025-09-15',
        checkOut: '2025-09-17',
        nights: 2
      }
    ]

    for (const assignment of roomAssignmentsSummit) {
      await prisma.roomAssignment.create({
        data: {
          roomId: assignment.room.id,
          guestId: assignment.guest.id,
          checkInDate: new Date(assignment.checkIn),
          checkOutDate: new Date(assignment.checkOut),
          numberOfNights: assignment.nights,
          isPrimaryGuest: true,
          specialRequests: assignment.notes,
          isConfirmed: true,
          confirmedAt: new Date(Date.now() - Math.random() * 20 * 24 * 60 * 60 * 1000),
          isPaid: assignment.guest === guestsTechSummit[0] || assignment.guest === guestsTechSummit[1] || assignment.guest === guestsTechSummit[2],
          paidAmount: assignment.room.ratePerNight! * assignment.nights,
          currency: 'EUR'
        }
      })
    }

    // ====================================
    // 10. EMAIL LOGS - ENVOI & SUIVI
    // ====================================
    // Créer des EmailLogs pour montrer l'historique d'envoi
    const emailLogTypes: Array<{ type: EmailType; subject: string; days: number }> = [
      { type: 'SAVE_THE_DATE', subject: 'Save the Date - 10 ans Weevup', days: 60 },
      { type: 'INVITE', subject: 'Invitation - 10 ans Weevup Célébration', days: 30 },
      { type: 'REMINDER', subject: 'Rappel - Soirée 10 ans Weevup ce vendredi', days: 2 }
    ]

    // Envoyer des emails aux invités de 10 ans Weevup
    for (const guest of guestsWeevup.slice(0, 8)) {
      for (const emailType of emailLogTypes) {
        const sentDate = new Date(Date.now() - emailType.days * 24 * 60 * 60 * 1000)

        // Déterminer le status aléatoirement pour simuler un vrai scénario
        let status: EmailStatus
        if (emailType.type === 'SAVE_THE_DATE' || emailType.type === 'INVITE') {
          const rand = Math.random()
          if (rand > 0.8) status = 'CLICKED'
          else if (rand > 0.5) status = 'OPENED'
          else if (rand > 0.1) status = 'DELIVERED'
          else status = 'SENT'
        } else {
          status = Math.random() > 0.3 ? 'OPENED' : 'DELIVERED'
        }

        await prisma.emailLog.create({
          data: {
            eventId: event10AnsWeevup.id,
            guestId: guest.id,
            type: emailType.type,
            subject: emailType.subject,
            status: status,
            sentAt: sentDate,
            openedAt: ['OPENED', 'CLICKED'].includes(status) ? new Date(sentDate.getTime() + Math.random() * 48 * 60 * 60 * 1000) : undefined,
            clickedAt: status === 'CLICKED' ? new Date(sentDate.getTime() + Math.random() * 72 * 60 * 60 * 1000) : undefined
          }
        })
      }
    }

    // Envoyer des emails aux participants de Tech Summit
    const emailLogTypesSummit: Array<{ type: EmailType; subject: string; days: number }> = [
      { type: 'SAVE_THE_DATE', subject: 'Save the Date - Tech Summit 2025', days: 90 },
      { type: 'INVITE', subject: 'Votre invitation au Tech Summit 2025', days: 45 },
      { type: 'REMINDER', subject: 'Tech Summit 2025 - C\'est dans 2 semaines !', days: 14 }
    ]

    for (const guest of guestsTechSummit.slice(0, 8)) {
      for (const emailType of emailLogTypesSummit) {
        const sentDate = new Date(Date.now() - emailType.days * 24 * 60 * 60 * 1000)

        let status: EmailStatus
        if (emailType.type === 'SAVE_THE_DATE' || emailType.type === 'INVITE') {
          const rand = Math.random()
          if (rand > 0.7) status = 'CLICKED'
          else if (rand > 0.4) status = 'OPENED'
          else if (rand > 0.1) status = 'DELIVERED'
          else status = 'SENT'
        } else {
          status = Math.random() > 0.5 ? 'OPENED' : 'SENT'
        }

        await prisma.emailLog.create({
          data: {
            eventId: eventTechSummit.id,
            guestId: guest.id,
            type: emailType.type,
            subject: emailType.subject,
            status: status,
            sentAt: sentDate,
            openedAt: ['OPENED', 'CLICKED'].includes(status) ? new Date(sentDate.getTime() + Math.random() * 24 * 60 * 60 * 1000) : undefined,
            clickedAt: status === 'CLICKED' ? new Date(sentDate.getTime() + Math.random() * 48 * 60 * 60 * 1000) : undefined
          }
        })
      }
    }

    // ====================================
    // 11. RÉSUMÉ FINAL
    // ====================================
    const totalEmailLogs = await prisma.emailLog.count()
    const totalAccommodations = await prisma.accommodation.count()
    const totalRooms = await prisma.room.count()
    const totalRoomAssignments = await prisma.roomAssignment.count()
    const totalSessions = await prisma.session.count()
    const totalSessionParticipants = await prisma.sessionParticipant.count()
    const totalTimelineEvents = await prisma.timelineEvent.count()

    return NextResponse.json({
      success: true,
      message: '🎉 Base de données remplie avec succès ! 2 événements complets avec toutes les fonctionnalités',
      totalEventsCreated: 2,
      totalGuestsCreated: guestsWeevup.length + guestsTechSummit.length,
      events: [
        {
          name: event10AnsWeevup.name,
          date: '20 juin 2025',
          location: 'Paris - Le Pavillon Royal',
          showcaseUrl: `/event/${event10AnsWeevup.slug}`,
          adminUrl: `/admin/events/${event10AnsWeevup.id}`,
          modules: {
            agenda: {
              sessions: sessionsWeevup.length,
              participants: sessionsWeevup.length * 8,
              timelineEvents: 9
            },
            transport: {
              bookings: transportBookingsWeevup.length,
              manifests: 1,
              manifestParticipants: 3
            },
            accommodation: {
              hotels: 2,
              rooms: 30,
              assignments: roomAssignmentsWeevup.length
            }
          }
        },
        {
          name: eventTechSummit.name,
          date: '15-16 septembre 2025',
          location: 'Paris - Convention Center',
          showcaseUrl: `/event/${eventTechSummit.slug}`,
          adminUrl: `/admin/events/${eventTechSummit.id}`,
          modules: {
            agenda: {
              sessions: sessionsTechSummit.length,
              participants: sessionsTechSummit.length * 8,
              timelineEvents: 10
            },
            transport: {
              bookings: transportBookingsSummit.length,
              manifests: 3,
              manifestParticipants: 6
            },
            accommodation: {
              hotels: 2,
              rooms: 35,
              assignments: roomAssignmentsSummit.length
            }
          }
        }
      ],
      statistics: {
        users: 1,
        events: 2,
        guests: {
          weevup10Ans: guestsWeevup.length,
          techSummit: guestsTechSummit.length,
          total: guestsWeevup.length + guestsTechSummit.length
        },
        agenda: {
          totalSessions: totalSessions,
          totalSessionParticipants: totalSessionParticipants,
          totalTimelineEvents: totalTimelineEvents
        },
        transport: {
          totalBookings: transportBookingsWeevup.length + transportBookingsSummit.length,
          totalManifests: 4,
          totalManifestParticipants: 9
        },
        accommodation: {
          totalAccommodations: totalAccommodations,
          totalRooms: totalRooms,
          totalAssignments: totalRoomAssignments
        },
        emails: {
          totalEmailLogs: totalEmailLogs,
          eventsTracked: 2
        }
      },
      features: {
        '✅ Vue d\'ensemble': 'Événements créés avec détails complets',
        '✅ Showcase': 'Pages publiques avec timeline, speakers, sponsors, gallery, FAQ',
        '✅ Invités': `${guestsWeevup.length + guestsTechSummit.length} invités avec tags, entreprises, statuts`,
        '✅ Check-in': 'QR codes générés, check-ins simulés',
        '✅ RSVP': 'Confirmations avec choix de repas, allergies, +1',
        '✅ Envoi & Suivi': `${totalEmailLogs} emails envoyés (Save the Date, Invitation, Rappel)`,
        '✅ Dashboard Planif.': 'Données complètes pour analytics',
        '✅ Agenda & Timeline': `${totalSessions} sessions (gala + conférence 2j) + ${totalTimelineEvents} événements timeline intégrés`,
        '✅ Programme': 'Programme détaillé avec speakers, horaires, salles - affiché sur showcase',
        '✅ Transport': `${transportBookingsWeevup.length + transportBookingsSummit.length} réservations (vol, train, navettes) synchronisées avec timeline`,
        '✅ Hébergement': `${totalAccommodations} hôtels, ${totalRooms} chambres, ${totalRoomAssignments} assignations liées aux arrivées/départs`
      }
    })

  } catch (error) {
    console.error('Seed error:', error)
    return handleAuthError(error)
  }
}
