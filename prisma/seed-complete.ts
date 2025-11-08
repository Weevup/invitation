import { PrismaClient } from '@prisma/client'
import { hashToken, generateGuestToken } from '../lib/auth'

const prisma = new PrismaClient()

async function main() {
  console.log('🎉 Creating Complete Demo Event with Full Data...')

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@weevup.com' },
    update: {},
    create: {
      email: 'admin@weevup.com',
      role: 'ADMIN',
    },
  })

  console.log('✓ Admin user created:', admin.email)

  // Create comprehensive event with all features
  const event = await prisma.event.upsert({
    where: { slug: 'tech-summit-2025' },
    update: {},
    create: {
      name: 'Tech Summit 2025',
      slug: 'tech-summit-2025',
      startsAt: new Date('2025-09-15T09:00:00'),
      endsAt: new Date('2025-09-15T18:00:00'),
      venueName: 'Station F',
      address: '5 Parvis Alan Turing',
      city: 'Paris',
      country: 'France',
      coverImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200',
      description: `Le Tech Summit 2025 est LE rendez-vous annuel des professionnels de la tech en France.

🎯 Au programme :
• Conférences inspirantes avec 20+ speakers internationaux
• Tables rondes sur l'IA, le Web3 et la cybersécurité
• Networking avec 500+ participants
• Démonstrations de startups innovantes
• Afterparty exclusive

Rejoignez-nous pour une journée d'échanges, d'innovation et de networking !`,
      program: `09h00 - Accueil & petit-déjeuner
10h00 - Keynote d'ouverture
11h00 - Ateliers parallèles
12h30 - Déjeuner networking
14h00 - Tables rondes
16h00 - Démonstrations startups
17h30 - Cocktail de clôture`,
      dressCode: 'Business casual',
      rsvpDeadline: new Date('2025-09-01T23:59:59'),
      maxPlusOnes: 2,
      allowPlusOnes: true,
      requireMeal: true,
      mealOptions: [
        'Menu Omnivore',
        'Menu Végétarien',
        'Menu Végan',
        'Menu Sans gluten',
        'Menu Halal',
        'Menu Casher'
      ],
      enableTransport: true,
      enableLodging: true,
      enableAccessibility: true,
      enablePhotoConsent: true,
      adminId: admin.id,

      // Showcase configuration complète
      showcaseEnabled: true,
      showcaseTitle: 'Tech Summit 2025',
      showcaseSubtitle: 'L\'événement tech de l\'année',
      showcaseTheme: 'midnight',
      primaryColor: '#6366f1',
      secondaryColor: '#a855f7',
      accentColor: '#ec4899',
      showcaseSections: [
        'hero',
        'countdown',
        'description',
        'speakers',
        'timeline',
        'gallery',
        'sponsors',
        'faq',
        'details',
        'cta'
      ],
      speakers: [
        {
          name: 'Sarah Chen',
          role: 'CEO, AI Innovations',
          bio: 'Pionnière de l\'IA générative et ancienne directrice R&D chez Google',
          photo: 'https://i.pravatar.cc/300?img=5',
          linkedin: 'https://linkedin.com/in/sarah-chen',
          twitter: 'https://twitter.com/sarahchen'
        },
        {
          name: 'Marcus Johnson',
          role: 'CTO, CyberSecure',
          bio: 'Expert en cybersécurité, auteur de 3 livres sur la protection des données',
          photo: 'https://i.pravatar.cc/300?img=12',
          linkedin: 'https://linkedin.com/in/marcus-johnson'
        },
        {
          name: 'Léa Dubois',
          role: 'Founder, GreenTech Solutions',
          bio: 'Entrepreneure engagée pour une tech durable et éthique',
          photo: 'https://i.pravatar.cc/300?img=9',
          linkedin: 'https://linkedin.com/in/lea-dubois',
          twitter: 'https://twitter.com/leadubois'
        },
        {
          name: 'Dr. Raj Patel',
          role: 'Head of Research, Quantum Labs',
          bio: 'Chercheur en informatique quantique, 15 publications dans Nature',
          photo: 'https://i.pravatar.cc/300?img=13',
          linkedin: 'https://linkedin.com/in/raj-patel'
        }
      ],
      timeline: [
        { time: '09:00', title: 'Accueil & Networking', description: 'Café et viennoiseries offerts' },
        { time: '10:00', title: 'Keynote: L\'avenir de l\'IA', description: 'Par Sarah Chen' },
        { time: '11:00', title: 'Ateliers parallèles', description: '3 tracks: IA, Cybersécurité, Web3' },
        { time: '12:30', title: 'Déjeuner buffet', description: 'Networking libre' },
        { time: '14:00', title: 'Table ronde: Tech & Éthique', description: 'Avec nos 4 speakers principaux' },
        { time: '15:30', title: 'Pause café', description: '' },
        { time: '16:00', title: 'Pitch des startups', description: '10 startups innovantes en 5min' },
        { time: '17:30', title: 'Cocktail de clôture', description: 'DJ set & networking' }
      ],
      gallery: [
        'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
        'https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=800',
        'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800',
        'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800',
        'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800',
        'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800'
      ],
      sponsors: [
        { name: 'TechCorp', logo: 'https://via.placeholder.com/200x80/6366f1/ffffff?text=TechCorp', tier: 'platinum', website: 'https://techcorp.example.com' },
        { name: 'AI Solutions', logo: 'https://via.placeholder.com/200x80/a855f7/ffffff?text=AI+Solutions', tier: 'platinum', website: 'https://aisolutions.example.com' },
        { name: 'CloudNet', logo: 'https://via.placeholder.com/200x80/ec4899/ffffff?text=CloudNet', tier: 'gold', website: 'https://cloudnet.example.com' },
        { name: 'DataHub', logo: 'https://via.placeholder.com/200x80/8b5cf6/ffffff?text=DataHub', tier: 'gold', website: 'https://datahub.example.com' },
        { name: 'SecureIT', logo: 'https://via.placeholder.com/200x80/3b82f6/ffffff?text=SecureIT', tier: 'silver', website: 'https://secureit.example.com' },
        { name: 'DevTools', logo: 'https://via.placeholder.com/200x80/06b6d4/ffffff?text=DevTools', tier: 'silver', website: 'https://devtools.example.com' }
      ],
      faq: [
        { question: 'Quel est le code vestimentaire ?', answer: 'Business casual : élégant mais confortable. Pas de costume obligatoire !' },
        { question: 'Le déjeuner est-il inclus ?', answer: 'Oui ! Un déjeuner buffet est offert à tous les participants avec options végétariennes et sans gluten.' },
        { question: 'Puis-je venir avec des collègues ?', answer: 'Absolument ! Vous pouvez inviter jusqu\'à 2 accompagnants lors de votre inscription.' },
        { question: 'Y a-t-il un parking ?', answer: 'Station F dispose d\'un parking souterrain. Des places vélo sont également disponibles.' },
        { question: 'L\'événement est-il accessible PMR ?', answer: 'Oui, le lieu est 100% accessible. Merci de nous indiquer vos besoins lors de l\'inscription.' },
        { question: 'Puis-je modifier ma réponse ?', answer: 'Oui, vous pouvez modifier votre RSVP jusqu\'au 1er septembre via votre lien personnel.' }
      ],
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
    },
  })

  console.log('✓ Event created:', event.name)
  console.log('')

  // Create diverse guests with different statuses
  console.log('📧 Creating guests with varied responses...')

  const guestsData = [
    // VIPs qui ont accepté avec +1
    { firstName: 'Sophie', lastName: 'Martin', email: 'sophie.martin@techcorp.com', company: 'TechCorp', tags: ['VIP', 'Speaker'], rsvp: { attending: true, plusOnes: 1, meal: 'Menu Végétarien', dietary: 'Aucune allergie', transport: true, accessibility: false } },
    { firstName: 'Alexandre', lastName: 'Dubois', email: 'alex.dubois@aifund.com', company: 'AI Fund', tags: ['VIP', 'Investor'], rsvp: { attending: true, plusOnes: 2, meal: 'Menu Omnivore', dietary: 'Intolérance au lactose', transport: false, accessibility: false } },
    { firstName: 'Camille', lastName: 'Bernard', email: 'camille.bernard@startup.io', company: 'Startup.io', tags: ['VIP', 'Partner'], rsvp: { attending: true, plusOnes: 1, meal: 'Menu Végan', dietary: 'Végan', transport: true, accessibility: true } },

    // Participants confirmés sans +1
    { firstName: 'Thomas', lastName: 'Rousseau', email: 'thomas.rousseau@cloudnet.fr', company: 'CloudNet', tags: ['Attendee', 'Tech'], rsvp: { attending: true, plusOnes: 0, meal: 'Menu Omnivore', dietary: '', transport: false, accessibility: false } },
    { firstName: 'Julie', lastName: 'Moreau', email: 'julie.moreau@devtools.com', company: 'DevTools', tags: ['Attendee', 'Developer'], rsvp: { attending: true, plusOnes: 0, meal: 'Menu Sans gluten', dietary: 'Allergie au gluten', transport: true, accessibility: false } },
    { firstName: 'Marc', lastName: 'Petit', email: 'marc.petit@datahub.io', company: 'DataHub', tags: ['Attendee'], rsvp: { attending: true, plusOnes: 0, meal: 'Menu Halal', dietary: 'Halal', transport: false, accessibility: false } },
    { firstName: 'Laura', lastName: 'Garcia', email: 'laura.garcia@secureit.com', company: 'SecureIT', tags: ['Attendee', 'Security'], rsvp: { attending: true, plusOnes: 1, meal: 'Menu Végétarien', dietary: '', transport: true, accessibility: false } },

    // Personnes qui ont décliné
    { firstName: 'Pierre', lastName: 'Leblanc', email: 'pierre.leblanc@corp.com', company: 'BigCorp', tags: ['Invited'], rsvp: { attending: false, plusOnes: 0, meal: null, dietary: null, transport: false, accessibility: false } },
    { firstName: 'Emma', lastName: 'Fontaine', email: 'emma.fontaine@consulting.fr', company: 'TechConsulting', tags: ['Invited'], rsvp: { attending: false, plusOnes: 0, meal: null, dietary: null, transport: false, accessibility: false } },

    // Personnes en attente (pas encore répondu)
    { firstName: 'Nicolas', lastName: 'Durand', email: 'nicolas.durand@startup.co', company: 'InnovStartup', tags: ['Invited', 'Startup'], rsvp: null },
    { firstName: 'Amélie', lastName: 'Lefebvre', email: 'amelie.lefebvre@media.fr', company: 'TechMedia', tags: ['Press'], rsvp: null },
    { firstName: 'David', lastName: 'Mercier', email: 'david.mercier@invest.com', company: 'VentureCapital', tags: ['Investor'], rsvp: null },
    { firstName: 'Isabelle', lastName: 'Simon', email: 'isabelle.simon@agency.com', company: 'DigitalAgency', tags: ['Partner'], rsvp: null },
    { firstName: 'Julien', lastName: 'Laurent', email: 'julien.laurent@freelance.fr', company: 'Freelance', tags: ['Developer'], rsvp: null },
    { firstName: 'Claire', lastName: 'Roux', email: 'claire.roux@univ.fr', company: 'Université Paris Tech', tags: ['Academic'], rsvp: null },
  ]

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const createdGuests: any[] = []

  for (const guestData of guestsData) {
    const token = generateGuestToken()
    const tokenHash = hashToken(token)

    const guest = await prisma.guest.create({
      data: {
        firstName: guestData.firstName,
        lastName: guestData.lastName,
        email: guestData.email,
        company: guestData.company,
        tags: guestData.tags,
        eventId: event.id,
        token,
        tokenHash,
        tokenExpiry: new Date('2025-09-30T23:59:59'),
        status: guestData.rsvp === null ? 'PENDING' : (guestData.rsvp.attending ? 'RESPONDED' : 'RESPONDED'),
      },
    })

    createdGuests.push({ ...guest, rsvpData: guestData.rsvp })

    // Create RSVP if guest has responded
    if (guestData.rsvp !== null) {
      await prisma.rSVP.create({
        data: {
          eventId: event.id,
          guestId: guest.id,
          attending: guestData.rsvp.attending,
          plusOnes: guestData.rsvp.plusOnes,
          mealChoice: guestData.rsvp.meal,
          dietaryRestrictions: guestData.rsvp.dietary || '',
          allergies: guestData.rsvp.dietary || 'Aucune',
          needsTransport: guestData.rsvp.transport,
          needsAccessibility: guestData.rsvp.accessibility,
          consentPhotos: true,
        },
      })

      // Create check-in for confirmed attendees
      if (guestData.rsvp.attending) {
        await prisma.checkin.create({
          data: {
            eventId: event.id,
            guestId: guest.id,
            checkedIn: false,
            qrCode: `TECH2025-${guest.id.substring(0, 8).toUpperCase()}`,
          },
        })
      }
    }

    const invitationUrl = `${baseUrl}/guest/${token}`
    const status = guestData.rsvp === null ? '⏳ Pending' : (guestData.rsvp.attending ? '✅ Confirmed' : '❌ Declined')

    console.log(`${status} ${guest.firstName} ${guest.lastName} (${guest.email})`)
    if (guestData.rsvp === null) {
      console.log(`  🔗 ${invitationUrl}`)
    }
  }

  console.log('')
  console.log('📊 RSVP Statistics:')
  const confirmed = guestsData.filter(g => g.rsvp?.attending === true).length
  const declined = guestsData.filter(g => g.rsvp?.attending === false).length
  const pending = guestsData.filter(g => g.rsvp === null).length
  const totalPlusOnes = guestsData.reduce((sum, g) => sum + (g.rsvp?.plusOnes || 0), 0)

  console.log(`  ✅ Confirmed: ${confirmed} (+ ${totalPlusOnes} accompagnants = ${confirmed + totalPlusOnes} total)`)
  console.log(`  ❌ Declined: ${declined}`)
  console.log(`  ⏳ Pending: ${pending}`)
  console.log(`  📈 Response rate: ${Math.round((confirmed + declined) / guestsData.length * 100)}%`)
  console.log('')

  // Create email logs for confirmed guests
  console.log('📧 Creating email logs...')
  for (const guest of createdGuests) {
    if (guest.rsvpData !== null) {
      // Save the Date email
      await prisma.emailLog.create({
        data: {
          eventId: event.id,
          guestId: guest.id,
          type: 'SAVE_THE_DATE',
          subject: `🎯 Save the Date - ${event.name}`,
          status: 'DELIVERED',
          sentAt: new Date('2025-07-01T10:00:00'),
          openedAt: new Date('2025-07-01T14:30:00'),
        },
      })

      // Invitation email
      await prisma.emailLog.create({
        data: {
          eventId: event.id,
          guestId: guest.id,
          type: 'INVITATION',
          subject: `Vous êtes invité(e) - ${event.name}`,
          status: guest.rsvpData.attending ? 'CLICKED' : 'OPENED',
          sentAt: new Date('2025-08-01T09:00:00'),
          openedAt: new Date('2025-08-01T11:20:00'),
          clickedAt: guest.rsvpData.attending ? new Date('2025-08-01T11:21:00') : undefined,
        },
      })

      // Confirmation email for those who confirmed
      if (guest.rsvpData.attending) {
        await prisma.emailLog.create({
          data: {
            eventId: event.id,
            guestId: guest.id,
            type: 'CONFIRMATION',
            subject: `✅ Confirmation - ${event.name}`,
            status: 'DELIVERED',
            sentAt: new Date('2025-08-01T11:25:00'),
            openedAt: new Date('2025-08-02T09:00:00'),
          },
        })
      }
    }
  }
  console.log('✓ Email logs created')
  console.log('')

  // Create email tracking entries
  console.log('📊 Creating email tracking data...')
  for (const guest of createdGuests) {
    if (guest.rsvpData !== null) {
      await prisma.emailTracking.create({
        data: {
          id: `${event.id}-${guest.id}-invitation-${Date.now()}`,
          eventId: event.id,
          guestId: guest.id,
          type: 'invitation',
          status: guest.rsvpData.attending ? 'clicked' : 'opened',
          sentAt: new Date('2025-08-01T09:00:00'),
          openedAt: new Date('2025-08-01T11:20:00'),
          clickedAt: guest.rsvpData.attending ? new Date('2025-08-01T11:21:00') : undefined,
        },
      })
    }
  }
  console.log('✓ Email tracking created')
  console.log('')

  console.log('═══════════════════════════════════════════════════════════')
  console.log('✅ Complete Demo Event Created Successfully!')
  console.log('═══════════════════════════════════════════════════════════')
  console.log('')
  console.log('📋 Summary:')
  console.log(`   Event: ${event.name}`)
  console.log(`   Date: ${event.startsAt.toLocaleDateString('fr-FR')}`)
  console.log(`   Venue: ${event.venueName}, ${event.city}`)
  console.log(`   Guests: ${guestsData.length} total`)
  console.log(`   RSVPs: ${confirmed} confirmed, ${declined} declined, ${pending} pending`)
  console.log(`   Showcase: Enabled with ${event.speakers?.length || 0} speakers, ${event.sponsors?.length || 0} sponsors`)
  console.log('')
  console.log('🎯 Next steps:')
  console.log('1. Run: npm run dev')
  console.log('2. Visit: http://localhost:3000/admin')
  console.log('3. Test showcase: http://localhost:3000/event/tech-summit-2025')
  console.log('4. Test RSVP with pending guest links above')
  console.log('')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
