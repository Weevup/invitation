/**
 * Seed complet pour tester tous les modules avec données réalistes
 * Inclut : Sessions simples, Workshops, Team Building, Activités libres, Transport, Hébergement
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Démarrage du seed complet des modules...')

  // Nettoyage (optionnel - décommenter si besoin)
  // await prisma.sessionParticipant.deleteMany()
  // await prisma.sessionGroup.deleteMany()
  // await prisma.session.deleteMany()
  // await prisma.room.deleteMany()
  // await prisma.accommodation.deleteMany()
  // await prisma.transport.deleteMany()
  // await prisma.rSVP.deleteMany()
  // await prisma.guest.deleteMany()
  // await prisma.event.deleteMany()

  // 1. Récupérer un admin existant
  const admin = await prisma.user.findFirst({
    where: { role: 'ADMIN' }
  })

  if (!admin) {
    console.log('⚠️  Aucun admin trouvé. Veuillez créer un admin d\'abord.')
    return
  }

  // 2. Créer l'événement
  const event = await prisma.event.create({
    data: {
      name: 'Séminaire Innovation 2025',
      slug: 'seminaire-innovation-2025-seed',
      description: 'Séminaire annuel de 3 jours avec workshops, team building et activités',
      startsAt: new Date('2025-06-15T09:00:00Z'),
      endsAt: new Date('2025-06-17T18:00:00Z'),
      venueName: 'Domaine des Collines',
      address: '15 Route du Château',
      city: 'Aix-en-Provence',
      country: 'France',
      adminId: admin.id,
    },
  })

  console.log(`✓ Événement créé: ${event.name}`)

  // 3. Créer les invités (80 participants)
  const guestNames = [
    'Sophie Martin', 'Thomas Dubois', 'Marie Leroy', 'Pierre Bernard',
    'Julie Simon', 'Antoine Michel', 'Claire Petit', 'Nicolas Durand',
    'Emma Roux', 'Lucas Moreau', 'Léa Fournier', 'Hugo Girard',
    'Chloé Bonnet', 'Alexandre Lambert', 'Sarah Rousseau', 'Maxime Vincent',
    'Laura Muller', 'Julien Lefevre', 'Camille Fontaine', 'Baptiste Chevalier',
    'Manon Garcia', 'Valentin Martinez', 'Lucie Robert', 'Théo Richard',
    'Anaïs Blanc', 'Mathis Garnier', 'Inès Faure', 'Louis André',
    'Alice Mercier', 'Noah Dupont', 'Jade Bertrand', 'Arthur Laurent',
    'Zoé Morel', 'Gabriel Simon', 'Lina Giraud', 'Raphaël Roche',
    'Mia Barbier', 'Tom Arnaud', 'Lily Renard', 'Paul Leclerc',
    'Charlotte Brun', 'Victor Lacroix', 'Ambre Roy', 'Louis Caron',
    'Rose Philippe', 'Jules Vasseur', 'Jeanne Picard', 'Adam Moulin',
    'Margaux Dumas', 'Nathan Colin', 'Margot Guerin', 'Ethan Gautier',
    'Pauline Henry', 'Benjamin Perrin', 'Elise Marchand', 'Quentin Denis',
    'Juliette Noel', 'Alexandre Lemaire', 'Eva Meyer', 'Hugo Boyer',
    'Océane Leroux', 'Romain Blanchard', 'Lola Joly', 'Dylan Benoit',
    'Maëlys Fabre', 'Enzo Bertrand', 'Louane Dupuis', 'Mathéo Clement',
    'Iris Payet', 'Nathan Vidal', 'Lou Roussel', 'Timéo Perez',
    'Clara Robin', 'Léo Morin', 'Yasmine David', 'Axel Bourgeois',
    'Romane Renaud', 'Lucas Blanc', 'Anaëlle Bouvier', 'Tom Gerard'
  ]

  const guests = []
  for (let i = 0; i < 80; i++) {
    const [firstName, lastName] = guestNames[i].split(' ')
    // Generate unique token for each guest
    const token = `token-${event.id}-${i}-${Date.now()}`
    const tokenHash = `hash-${event.id}-${i}-${Date.now()}`

    const guest = await prisma.guest.create({
      data: {
        eventId: event.id,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
        firstName,
        lastName,
        token,
        tokenHash,
        company: i < 40 ? 'TechCorp' : 'InnoSolutions',
        jobTitle: i % 4 === 0 ? 'Manager' : i % 4 === 1 ? 'Développeur' : i % 4 === 2 ? 'Designer' : 'Consultant',
        rsvp: {
          create: {
            eventId: event.id,
            attending: true,
          },
        },
      },
    })
    guests.push(guest)
  }

  console.log(`✓ ${guests.length} invités créés`)

  // 3. JOUR 1 - DIMANCHE 15 JUIN

  // Arrivée / Accueil (09:00-10:00)
  const arrival = await prisma.session.create({
    data: {
      eventId: event.id,
      title: 'Accueil et enregistrement',
      description: 'Accueil des participants, remise des badges et goodies',
      type: 'ARRIVAL',
      startTime: new Date('2025-06-15T09:00:00Z'),
      endTime: new Date('2025-06-15T10:00:00Z'),
      duration: 60,
      venue: 'Domaine des Collines',
      room: 'Hall d\'entrée',
      status: 'PUBLISHED',
      timelineOrder: 1,
      requiresGroups: false,
    },
  })

  // Keynote d'ouverture (10:00-11:30)
  const keynote = await prisma.session.create({
    data: {
      eventId: event.id,
      title: 'Keynote : L\'Innovation en 2025',
      description: 'Présentation des tendances innovation et objectifs de l\'année',
      type: 'KEYNOTE',
      startTime: new Date('2025-06-15T10:00:00Z'),
      endTime: new Date('2025-06-15T11:30:00Z'),
      duration: 90,
      venue: 'Domaine des Collines',
      room: 'Grand Amphithéâtre',
      capacity: 100,
      status: 'PUBLISHED',
      timelineOrder: 2,
      requiresGroups: false,
      participants: {
        create: guests.map(g => ({ guestId: g.id })),
      },
    },
  })

  // Pause café (11:30-12:00)
  await prisma.session.create({
    data: {
      eventId: event.id,
      title: 'Pause café',
      type: 'BREAK',
      startTime: new Date('2025-06-15T11:30:00Z'),
      endTime: new Date('2025-06-15T12:00:00Z'),
      duration: 30,
      venue: 'Domaine des Collines',
      room: 'Terrasse',
      status: 'PUBLISHED',
      timelineOrder: 3,
      requiresGroups: false,
    },
  })

  // WORKSHOPS - Après-midi (14:00-17:00) - 3 ateliers en parallèle
  const workshop1 = await prisma.session.create({
    data: {
      eventId: event.id,
      title: 'Ateliers Innovation',
      description: 'Workshops thématiques en petits groupes',
      type: 'WORKSHOP',
      startTime: new Date('2025-06-15T14:00:00Z'),
      endTime: new Date('2025-06-15T17:00:00Z'),
      duration: 180,
      venue: 'Domaine des Collines',
      room: 'Salles A, B, C',
      capacity: 80,
      status: 'PUBLISHED',
      timelineOrder: 4,
      requiresGroups: true,
      participants: {
        create: guests.slice(0, 60).map(g => ({ guestId: g.id })),
      },
    },
  })

  // Créer les groupes pour les workshops
  const workshopGroups = await Promise.all([
    prisma.sessionGroup.create({
      data: {
        sessionId: workshop1.id,
        name: 'Atelier IA & Machine Learning',
        description: 'Intelligence artificielle et applications pratiques',
        color: '#3B82F6',
        capacity: 20,
        order: 1,
      },
    }),
    prisma.sessionGroup.create({
      data: {
        sessionId: workshop1.id,
        name: 'Atelier Design Thinking',
        description: 'Méthodologie créative de résolution de problèmes',
        color: '#10B981',
        capacity: 20,
        order: 2,
      },
    }),
    prisma.sessionGroup.create({
      data: {
        sessionId: workshop1.id,
        name: 'Atelier Blockchain & Web3',
        description: 'Technologies décentralisées et crypto',
        color: '#F59E0B',
        capacity: 20,
        order: 3,
      },
    }),
  ])

  // Assigner les participants aux workshops
  for (let i = 0; i < 60; i++) {
    const groupIndex = i % 3
    await prisma.sessionParticipant.updateMany({
      where: {
        sessionId: workshop1.id,
        guestId: guests[i].id,
      },
      data: {
        groupId: workshopGroups[groupIndex].id,
      },
    })
  }

  console.log(`✓ Workshop avec ${workshopGroups.length} ateliers créé`)

  // Déjeuner (12:00-14:00)
  await prisma.session.create({
    data: {
      eventId: event.id,
      title: 'Déjeuner',
      type: 'MEAL',
      startTime: new Date('2025-06-15T12:00:00Z'),
      endTime: new Date('2025-06-15T14:00:00Z'),
      duration: 120,
      venue: 'Domaine des Collines',
      room: 'Restaurant',
      status: 'PUBLISHED',
      timelineOrder: 5,
      requiresGroups: false,
    },
  })

  // Dîner (19:00-21:00)
  await prisma.session.create({
    data: {
      eventId: event.id,
      title: 'Dîner de gala',
      type: 'MEAL',
      startTime: new Date('2025-06-15T19:00:00Z'),
      endTime: new Date('2025-06-15T21:00:00Z'),
      duration: 120,
      venue: 'Domaine des Collines',
      room: 'Grande Salle',
      status: 'PUBLISHED',
      timelineOrder: 6,
      requiresGroups: false,
    },
  })

  // 4. JOUR 2 - LUNDI 16 JUIN

  // TEAM BUILDING (09:00-12:00)
  const teamBuilding = await prisma.session.create({
    data: {
      eventId: event.id,
      title: 'Team Building Challenge',
      description: 'Activités sportives et ludiques en équipes',
      type: 'TEAMBUILDING',
      startTime: new Date('2025-06-16T09:00:00Z'),
      endTime: new Date('2025-06-16T12:00:00Z'),
      duration: 180,
      venue: 'Domaine des Collines',
      room: 'Parc extérieur',
      capacity: 80,
      status: 'PUBLISHED',
      timelineOrder: 7,
      requiresGroups: true,
      participants: {
        create: guests.map(g => ({ guestId: g.id })),
      },
    },
  })

  // Créer les équipes pour le team building
  const teams = await Promise.all([
    prisma.sessionGroup.create({
      data: {
        sessionId: teamBuilding.id,
        name: 'Équipe Rouge',
        description: 'Les Conquérants',
        color: '#EF4444',
        capacity: 20,
        order: 1,
      },
    }),
    prisma.sessionGroup.create({
      data: {
        sessionId: teamBuilding.id,
        name: 'Équipe Bleue',
        description: 'Les Stratèges',
        color: '#3B82F6',
        capacity: 20,
        order: 2,
      },
    }),
    prisma.sessionGroup.create({
      data: {
        sessionId: teamBuilding.id,
        name: 'Équipe Verte',
        description: 'Les Innovateurs',
        color: '#10B981',
        capacity: 20,
        order: 3,
      },
    }),
    prisma.sessionGroup.create({
      data: {
        sessionId: teamBuilding.id,
        name: 'Équipe Jaune',
        description: 'Les Créatifs',
        color: '#F59E0B',
        capacity: 20,
        order: 4,
      },
    }),
  ])

  // Assigner les participants aux équipes
  for (let i = 0; i < 80; i++) {
    const teamIndex = i % 4
    await prisma.sessionParticipant.updateMany({
      where: {
        sessionId: teamBuilding.id,
        guestId: guests[i].id,
      },
      data: {
        groupId: teams[teamIndex].id,
      },
    })
  }

  console.log(`✓ Team Building avec ${teams.length} équipes créé`)

  // Déjeuner (12:00-14:00)
  await prisma.session.create({
    data: {
      eventId: event.id,
      title: 'Déjeuner buffet',
      type: 'MEAL',
      startTime: new Date('2025-06-16T12:00:00Z'),
      endTime: new Date('2025-06-16T14:00:00Z'),
      duration: 120,
      venue: 'Domaine des Collines',
      room: 'Terrasse',
      status: 'PUBLISHED',
      timelineOrder: 8,
      requiresGroups: false,
    },
  })

  // ACTIVITÉS LIBRES (14:00-17:00)
  const freeTime = await prisma.session.create({
    data: {
      eventId: event.id,
      title: 'Activités libres',
      description: 'Choix d\'activités selon les préférences',
      type: 'FREE_TIME',
      startTime: new Date('2025-06-16T14:00:00Z'),
      endTime: new Date('2025-06-16T17:00:00Z'),
      duration: 180,
      venue: 'Région Aix-en-Provence',
      capacity: 80,
      status: 'PUBLISHED',
      timelineOrder: 9,
      requiresGroups: true,
      participants: {
        create: guests.slice(0, 70).map(g => ({ guestId: g.id })),
      },
    },
  })

  // Créer les activités libres
  const activities = await Promise.all([
    prisma.sessionGroup.create({
      data: {
        sessionId: freeTime.id,
        name: 'Randonnée Sainte-Victoire',
        description: 'Randonnée guidée sur la montagne emblématique',
        color: '#059669',
        capacity: 20,
        order: 1,
      },
    }),
    prisma.sessionGroup.create({
      data: {
        sessionId: freeTime.id,
        name: 'Visite vignobles',
        description: 'Découverte des vins de Provence avec dégustation',
        color: '#7C3AED',
        capacity: 15,
        order: 2,
      },
    }),
    prisma.sessionGroup.create({
      data: {
        sessionId: freeTime.id,
        name: 'Spa & Détente',
        description: 'Soins et relaxation au spa du domaine',
        color: '#06B6D4',
        capacity: 15,
        order: 3,
      },
    }),
    prisma.sessionGroup.create({
      data: {
        sessionId: freeTime.id,
        name: 'Golf',
        description: 'Parcours 18 trous au golf d\'Aix',
        color: '#84CC16',
        capacity: 12,
        order: 4,
      },
    }),
    prisma.sessionGroup.create({
      data: {
        sessionId: freeTime.id,
        name: 'Visite culturelle Aix',
        description: 'Tour guidé du centre historique d\'Aix-en-Provence',
        color: '#F97316',
        capacity: 20,
        order: 5,
      },
    }),
  ])

  // Assigner les participants aux activités (répartition variée)
  const activityAssignments = [
    { activity: 0, participants: guests.slice(0, 18) },    // Randonnée: 18
    { activity: 1, participants: guests.slice(18, 30) },   // Vignobles: 12
    { activity: 2, participants: guests.slice(30, 43) },   // Spa: 13
    { activity: 3, participants: guests.slice(43, 53) },   // Golf: 10
    { activity: 4, participants: guests.slice(53, 70) },   // Culture: 17
  ]

  for (const assignment of activityAssignments) {
    for (const guest of assignment.participants) {
      await prisma.sessionParticipant.updateMany({
        where: {
          sessionId: freeTime.id,
          guestId: guest.id,
        },
        data: {
          groupId: activities[assignment.activity].id,
        },
      })
    }
  }

  console.log(`✓ Activités libres avec ${activities.length} options créées`)

  // Conférence technique (17:00-18:30)
  await prisma.session.create({
    data: {
      eventId: event.id,
      title: 'Table ronde : Futur du travail',
      description: 'Discussion sur les nouvelles formes de travail et collaboration',
      type: 'PANEL',
      startTime: new Date('2025-06-16T17:00:00Z'),
      endTime: new Date('2025-06-16T18:30:00Z'),
      duration: 90,
      venue: 'Domaine des Collines',
      room: 'Auditorium',
      capacity: 100,
      status: 'PUBLISHED',
      timelineOrder: 10,
      requiresGroups: false,
    },
  })

  // 5. JOUR 3 - MARDI 17 JUIN

  // Session de clôture (09:00-11:00)
  await prisma.session.create({
    data: {
      eventId: event.id,
      title: 'Session de clôture & Roadmap',
      description: 'Synthèse du séminaire et plan d\'action',
      type: 'CONFERENCE',
      startTime: new Date('2025-06-17T09:00:00Z'),
      endTime: new Date('2025-06-17T11:00:00Z'),
      duration: 120,
      venue: 'Domaine des Collines',
      room: 'Grand Amphithéâtre',
      capacity: 100,
      status: 'PUBLISHED',
      timelineOrder: 11,
      requiresGroups: false,
    },
  })

  // Déjeuner d'adieu (11:30-13:30)
  await prisma.session.create({
    data: {
      eventId: event.id,
      title: 'Déjeuner d\'adieu',
      type: 'MEAL',
      startTime: new Date('2025-06-17T11:30:00Z'),
      endTime: new Date('2025-06-17T13:30:00Z'),
      duration: 120,
      venue: 'Domaine des Collines',
      room: 'Restaurant',
      status: 'PUBLISHED',
      timelineOrder: 12,
      requiresGroups: false,
    },
  })

  // Départs (14:00-16:00)
  await prisma.session.create({
    data: {
      eventId: event.id,
      title: 'Départs échelonnés',
      type: 'DEPARTURE',
      startTime: new Date('2025-06-17T14:00:00Z'),
      endTime: new Date('2025-06-17T16:00:00Z'),
      duration: 120,
      venue: 'Domaine des Collines',
      status: 'PUBLISHED',
      timelineOrder: 13,
      requiresGroups: false,
    },
  })

  // 6. TRANSPORT

  // Vols arrivée
  await prisma.transport.create({
    data: {
      eventId: event.id,
      type: 'FLIGHT',
      departureLocation: 'Paris CDG',
      arrivalLocation: 'Marseille Provence',
      departureTime: new Date('2025-06-15T07:00:00Z'),
      arrivalTime: new Date('2025-06-15T08:20:00Z'),
      transportNumber: 'AF7642',
      capacity: 45,
      notes: 'Vol charter groupe TechCorp',
      participants: {
        create: guests.slice(0, 40).map(g => ({ guestId: g.id })),
      },
    },
  })

  await prisma.transport.create({
    data: {
      eventId: event.id,
      type: 'FLIGHT',
      departureLocation: 'Lyon Saint-Exupéry',
      arrivalLocation: 'Marseille Provence',
      departureTime: new Date('2025-06-15T07:30:00Z'),
      arrivalTime: new Date('2025-06-15T08:15:00Z'),
      transportNumber: 'AF7715',
      capacity: 40,
      notes: 'Vol charter groupe InnoSolutions',
      participants: {
        create: guests.slice(40, 80).map(g => ({ guestId: g.id })),
      },
    },
  })

  // Navettes aéroport → domaine
  await prisma.transport.create({
    data: {
      eventId: event.id,
      type: 'BUS',
      departureLocation: 'Aéroport Marseille Provence',
      arrivalLocation: 'Domaine des Collines',
      departureTime: new Date('2025-06-15T08:45:00Z'),
      arrivalTime: new Date('2025-06-15T09:30:00Z'),
      transportNumber: 'Navette 1',
      capacity: 50,
      notes: 'Bus confort climatisé',
    },
  })

  await prisma.transport.create({
    data: {
      eventId: event.id,
      type: 'BUS',
      departureLocation: 'Aéroport Marseille Provence',
      arrivalLocation: 'Domaine des Collines',
      departureTime: new Date('2025-06-15T09:00:00Z'),
      arrivalTime: new Date('2025-06-15T09:45:00Z'),
      transportNumber: 'Navette 2',
      capacity: 50,
      notes: 'Bus confort climatisé',
    },
  })

  // Vols retour
  await prisma.transport.create({
    data: {
      eventId: event.id,
      type: 'FLIGHT',
      departureLocation: 'Marseille Provence',
      arrivalLocation: 'Paris CDG',
      departureTime: new Date('2025-06-17T17:00:00Z'),
      arrivalTime: new Date('2025-06-17T18:20:00Z'),
      transportNumber: 'AF7643',
      capacity: 45,
      notes: 'Vol retour groupe TechCorp',
    },
  })

  console.log(`✓ Transport créé (5 trajets)`)

  // 7. HÉBERGEMENT

  const hotel1 = await prisma.accommodation.create({
    data: {
      eventId: event.id,
      name: 'Domaine des Collines - Bâtiment Principal',
      type: 'HOTEL',
      address: '15 Route du Château',
      city: 'Aix-en-Provence',
      country: 'France',
      postalCode: '13100',
      starRating: 4,
      totalRooms: 30,
      allocatedRooms: 30,
      checkInTime: '15:00',
      checkOutTime: '11:00',
      isPreferred: true,
      isActive: true,
    },
  })

  const hotel2 = await prisma.accommodation.create({
    data: {
      eventId: event.id,
      name: 'Domaine des Collines - Villas',
      type: 'VILLA',
      address: '15 Route du Château',
      city: 'Aix-en-Provence',
      country: 'France',
      postalCode: '13100',
      totalRooms: 10,
      allocatedRooms: 10,
      checkInTime: '15:00',
      checkOutTime: '11:00',
      isPreferred: true,
      isActive: true,
    },
  })

  // Chambres hôtel principal
  const roomTypes = ['SINGLE', 'DOUBLE', 'DOUBLE', 'TWIN', 'SUITE']
  for (let i = 1; i <= 30; i++) {
    const roomType = roomTypes[i % 5] as any
    await prisma.room.create({
      data: {
        accommodationId: hotel1.id,
        roomNumber: `${100 + i}`,
        floor: Math.floor(i / 10) + 1,
        type: roomType,
        maxOccupancy: roomType === 'SUITE' ? 4 : roomType === 'SINGLE' ? 1 : 2,
        isAccessible: i % 10 === 0,
      },
    })
  }

  // Villas
  for (let i = 1; i <= 10; i++) {
    await prisma.room.create({
      data: {
        accommodationId: hotel2.id,
        roomNumber: `Villa ${i}`,
        type: 'APARTMENT',
        maxOccupancy: 4,
        view: 'Jardin',
      },
    })
  }

  console.log(`✓ Hébergement créé (2 établissements, 40 chambres)`)

  console.log('\n✅ Seed terminé avec succès!')
  console.log(`
📊 Résumé:
- 1 événement (Séminaire Innovation 2025)
- 80 participants
- 13 sessions sur 3 jours
  * 1 Workshop avec 3 ateliers (60 participants)
  * 1 Team Building avec 4 équipes (80 participants)
  * 1 Activités libres avec 5 options (70 participants)
  * Sessions simples (keynotes, conférences, repas, etc.)
- 5 trajets de transport
- 2 hébergements avec 40 chambres

🎯 Accédez au Planning Opérationnel pour voir toutes les données!
  `)
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
