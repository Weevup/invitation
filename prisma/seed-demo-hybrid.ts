import { PrismaClient, UserRole, GuestStatus } from '@prisma/client'
import * as crypto from 'crypto'

const prisma = new PrismaClient()

function generateToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

async function main() {
  console.log('🌐 ========================================')
  console.log('   DÉMO: ÉVÉNEMENT HYBRIDE - TECH SUMMIT 2025')
  console.log('   (Présentiel + Remote)')
  console.log('   ========================================')
  console.log('')

  // Créer un utilisateur administrateur
  const admin = await prisma.user.upsert({
    where: { email: 'hybrid@weevup.com' },
    update: {},
    create: {
      email: 'hybrid@weevup.com',
      role: UserRole.ADMIN
    }
  })

  console.log(`✅ Admin créé: ${admin.email}`)

  // Créer l'événement hybride
  const event = await prisma.event.upsert({
    where: { slug: 'tech-summit-2025-hybrid' },
    update: {},
    create: {
      name: 'Tech Summit 2025 - Édition Hybride',
      slug: 'tech-summit-2025-hybrid',
      startsAt: new Date('2025-09-15T09:00:00Z'),
      endsAt: new Date('2025-09-15T18:00:00Z'),
      venueName: 'Station F',
      address: '5 Parvis Alan Turing, 75013',
      city: 'Paris',
      country: 'France',
      coverImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87',
      description: `Le Tech Summit 2025 revient dans un format innovant : participez en présentiel à Station F ou suivez l'événement en direct depuis chez vous !

🎯 Format Hybride :
• **En présentiel** : Accès à tous les workshops, networking, déjeuner et goodies
• **En remote** : Streaming HD de toutes les conférences, chat en direct, Q&A interactif

🚀 Au programme :
• Keynotes inspirantes de leaders tech
• Workshops pratiques (présentiel uniquement)
• Sessions de networking
• Démos de startups innovantes
• Table ronde sur l'IA et le futur du travail

📺 Technologie :
Plateforme de streaming dédiée avec interaction en temps réel pour les participants à distance.

Que vous soyez sur place ou en ligne, vivez une expérience inoubliable !`,

      program: `**09h00 - 09h30** | Accueil & Petit-déjeuner
🏢 Présentiel : Café & croissants à l'accueil
💻 Remote : Ouverture de la plateforme de streaming

**09h30 - 10h30** | Keynote d'ouverture
"L'avenir de la Tech en 2025"
Par Sarah Chen, CEO de TechVision
🌐 Diffusé en direct pour tous

**10h45 - 12h00** | Sessions parallèles
Workshop A : IA Générative (présentiel)
Workshop B : DevOps moderne (présentiel)
Conférence C : Cybersécurité (hybride)

**12h00 - 13h30** | Pause déjeuner
🏢 Présentiel : Déjeuner buffet
💻 Remote : Pause libre + networking virtuel

**13h30 - 15h00** | Table ronde
"Le futur du travail hybride"
🌐 Diffusé en direct + Q&A interactive

**15h15 - 16h45** | Démos startups
Pitch de 10 startups innovantes
🌐 Hybride avec votes en ligne

**17h00 - 17h45** | Keynote de clôture
"Tech for Good : Impact & Responsabilité"
🌐 Diffusé en direct

**17h45 - 18h30** | Networking & Cocktail
🏢 Présentiel uniquement
💻 Remote : Afterwork virtuel optionnel`,

      dressCode: '🏢 Présentiel : Business casual recommandé | 💻 Remote : Tenue confortable !',
      rsvpDeadline: new Date('2025-09-01T23:59:59Z'),
      maxPlusOnes: 1,
      allowPlusOnes: true,
      requireMeal: true,
      mealOptions: [
        '🏢 Présentiel - Menu Omnivore',
        '🏢 Présentiel - Menu Végétarien',
        '🏢 Présentiel - Menu Vegan',
        '💻 Participation à distance (pas de repas)'
      ],
      enableTransport: true,
      enableLodging: false,
      enableAccessibility: true,
      enablePhotoConsent: true,
      showcaseEnabled: true,
      showcaseTitle: 'Tech Summit 2025',
      showcaseSubtitle: 'Présentiel à Paris ou En ligne • 15 septembre 2025',
      showcaseBannerImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87',
      showcaseTheme: 'weevup',
      showcasePrimaryColor: '#6366f1',
      showcaseSecondaryColor: '#8b5cf6',
      adminId: admin.id
    }
  })

  console.log(`✅ Événement créé: ${event.name}`)

  // Invités en présentiel
  const inPersonGuests = [
    { firstName: 'Marie', lastName: 'Dubois', email: 'marie.dubois@example.com', company: 'TechCorp', attending: true, meal: '🏢 Présentiel - Menu Végétarien' },
    { firstName: 'Thomas', lastName: 'Martin', email: 'thomas.martin@example.com', company: 'StartupLab', attending: true, meal: '🏢 Présentiel - Menu Omnivore' },
    { firstName: 'Sophie', lastName: 'Bernard', email: 'sophie.bernard@example.com', company: 'InnovateTech', attending: true, meal: '🏢 Présentiel - Menu Vegan' },
    { firstName: 'Lucas', lastName: 'Petit', email: 'lucas.petit@example.com', company: 'DataFlow', attending: true, meal: '🏢 Présentiel - Menu Omnivore' },
    { firstName: 'Emma', lastName: 'Durand', email: 'emma.durand@example.com', company: 'CloudSys', attending: true, meal: '🏢 Présentiel - Menu Végétarien' },
    { firstName: 'Alexandre', lastName: 'Moreau', email: 'alexandre.moreau@example.com', company: 'SecureNet', attending: true, meal: '🏢 Présentiel - Menu Omnivore' },
    { firstName: 'Léa', lastName: 'Simon', email: 'lea.simon@example.com', company: 'AILabs', attending: true, meal: '🏢 Présentiel - Menu Vegan' },
    { firstName: 'Hugo', lastName: 'Laurent', email: 'hugo.laurent@example.com', company: 'DevOps Inc', attending: true, meal: '🏢 Présentiel - Menu Omnivore' },
  ]

  // Invités à distance
  const remoteGuests = [
    { firstName: 'Camille', lastName: 'Lefebvre', email: 'camille.lefebvre@example.com', company: 'RemoteTech', attending: true, meal: '💻 Participation à distance (pas de repas)' },
    { firstName: 'Nathan', lastName: 'Roux', email: 'nathan.roux@example.com', company: 'GlobalSoft', attending: true, meal: '💻 Participation à distance (pas de repas)' },
    { firstName: 'Chloé', lastName: 'Girard', email: 'chloe.girard@example.com', company: 'Digital Nomads', attending: true, meal: '💻 Participation à distance (pas de repas)' },
    { firstName: 'Antoine', lastName: 'Bonnet', email: 'antoine.bonnet@example.com', company: 'CloudFirst', attending: true, meal: '💻 Participation à distance (pas de repas)' },
    { firstName: 'Jade', lastName: 'Fontaine', email: 'jade.fontaine@example.com', company: 'TechHub', attending: true, meal: '💻 Participation à distance (pas de repas)' },
    { firstName: 'Maxime', lastName: 'Chevalier', email: 'maxime.chevalier@example.com', company: 'ByteCraft', attending: true, meal: '💻 Participation à distance (pas de repas)' },
    { firstName: 'Inès', lastName: 'Garnier', email: 'ines.garnier@example.com', company: 'WebForce', attending: true, meal: '💻 Participation à distance (pas de repas)' },
    { firstName: 'Gabriel', lastName: 'Faure', email: 'gabriel.faure@example.com', company: 'CodeMasters', attending: true, meal: '💻 Participation à distance (pas de repas)' },
  ]

  // Invités indécis/en attente
  const pendingGuests = [
    { firstName: 'Julie', lastName: 'Mercier', email: 'julie.mercier@example.com', company: 'TechVentures', attending: null, meal: null },
    { firstName: 'Pierre', lastName: 'Blanc', email: 'pierre.blanc@example.com', company: 'Innovation Co', attending: null, meal: null },
    { firstName: 'Clara', lastName: 'Rousseau', email: 'clara.rousseau@example.com', company: 'Future Labs', attending: null, meal: null },
    { firstName: 'Louis', lastName: 'Vincent', email: 'louis.vincent@example.com', company: 'NextGen', attending: null, meal: null },
  ]

  const allGuests = [...inPersonGuests, ...remoteGuests, ...pendingGuests]

  console.log('')
  console.log('👥 Création des invités...')

  for (const guestData of allGuests) {
    const token = generateToken()
    const tokenHash = hashToken(token)

    const guest = await prisma.guest.create({
      data: {
        firstName: guestData.firstName,
        lastName: guestData.lastName,
        email: guestData.email,
        company: guestData.company,
        eventId: event.id,
        status: guestData.attending === true ? GuestStatus.INVITED : GuestStatus.PENDING,
        token,
        tokenHash
      }
    })

    // Créer RSVP pour ceux qui ont confirmé
    if (guestData.attending !== null && guestData.meal) {
      const qrCodeId = crypto.randomUUID()
      await prisma.rSVP.create({
        data: {
          guestId: guest.id,
          eventId: event.id,
          attending: guestData.attending,
          plusOnes: 0,
          mealChoice: guestData.meal,
          consentPhotos: true,
          qrCodeId,
          accessibilityNotes: guestData.meal.includes('💻') ? 'Participant à distance - Pas de besoins physiques' : undefined
        }
      })

      const mode = guestData.meal.includes('💻') ? '💻 Remote' : '🏢 Présentiel'
      console.log(`   ✓ ${guestData.firstName} ${guestData.lastName} - ${mode}`)
    } else {
      console.log(`   ⏳ ${guestData.firstName} ${guestData.lastName} - En attente`)
    }
  }

  console.log('')
  console.log('📊 Statistiques :')
  console.log(`   • Total invités : ${allGuests.length}`)
  console.log(`   • Présentiel confirmé : ${inPersonGuests.length}`)
  console.log(`   • Remote confirmé : ${remoteGuests.length}`)
  console.log(`   • En attente : ${pendingGuests.length}`)
  console.log('')
  console.log('✅ Seed hybride terminé avec succès!')
  console.log('')
  console.log('🔗 Lien invité exemple (Marie Dubois):')
  const sampleGuest = await prisma.guest.findFirst({
    where: { email: 'marie.dubois@example.com' }
  })
  if (sampleGuest) {
    console.log(`   http://localhost:3000/guest/${sampleGuest.token}`)
  }
  console.log('')
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
