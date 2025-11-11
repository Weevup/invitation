import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { TransportType, BookingStatus } from '@prisma/client'
import { generateGuestToken, hashToken } from '@/lib/auth'
import bcrypt from 'bcryptjs'
import { requireAdmin, handleAuthError } from '@/lib/auth-utils'

function generateToken(): string {
  return generateGuestToken()
}

export async function POST() {
  try {
    await requireAdmin()

    // Additional safety: Only allow in development
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        {
          success: false,
          error: 'Cette opération est désactivée en production',
        },
        { status: 403 }
      )
    }

    // Check if events already exist
    const existingEvents = await prisma.event.findMany()
    if (existingEvents.length > 0) {
      return NextResponse.json(
        { error: 'Database already contains events. Clear the database first if you want to reseed.' },
        { status: 400 }
      )
    }

    // ====================================
    // 1. UTILISATEUR ADMIN
    // ====================================
    const defaultPassword = await bcrypt.hash('admin123', 10)
    const adminWeevup = await prisma.user.upsert({
      where: { email: 'contact@weevup.com' },
      update: {},
      create: {
        email: 'contact@weevup.com',
        password: defaultPassword,
        name: 'Admin Weevup',
        role: 'ADMIN'
      }
    })

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

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully with Transport module!',
      totalEventsCreated: 2,
      totalGuestsCreated: guestsWeevup.length + guestsTechSummit.length,
      events: [
        {
          name: event10AnsWeevup.name,
          date: '20 juin 2025',
          location: 'Paris',
          showcaseUrl: `/event/${event10AnsWeevup.slug}`,
          transport: {
            bookings: transportBookingsWeevup.length,
            manifests: 1,
            manifestParticipants: 3
          }
        },
        {
          name: eventTechSummit.name,
          date: '15-16 septembre 2025',
          location: 'Paris',
          showcaseUrl: `/event/${eventTechSummit.slug}`,
          transport: {
            bookings: transportBookingsSummit.length,
            manifests: 3,
            manifestParticipants: 6
          }
        }
      ],
      data: {
        users: 1,
        events: 2,
        guests: {
          weevup10Ans: guestsWeevup.length,
          techSummit: guestsTechSummit.length,
          total: guestsWeevup.length + guestsTechSummit.length
        },
        transport: {
          totalBookings: transportBookingsWeevup.length + transportBookingsSummit.length,
          totalManifests: 4,
          totalManifestParticipants: 9
        }
      }
    })

  } catch (error) {
    console.error('Seed error:', error)
    return handleAuthError(error)
  }
}
