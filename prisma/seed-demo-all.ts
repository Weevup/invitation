import { PrismaClient, UserRole, GuestStatus, EmailStatus, EmailType, EmailProvider } from '@prisma/client'
import * as crypto from 'crypto'

const prisma = new PrismaClient()

// Fonction pour générer un token unique
function generateToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

// Fonction pour hasher un token
function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

async function main() {
  console.log('🎯 ========================================')
  console.log('   GÉNÉRATION COMPLÈTE - TOUS LES DÉMOS')
  console.log('   ========================================')
  console.log('')

  console.log('🧹 Nettoyage de la base de données...')

  // Supprimer toutes les données existantes dans l'ordre inverse des dépendances
  await prisma.emailTracking.deleteMany({})
  await prisma.emailLog.deleteMany({})
  await prisma.checkin.deleteMany({})
  await prisma.rSVP.deleteMany({})
  await prisma.guest.deleteMany({})
  await prisma.event.deleteMany({})
  await prisma.user.deleteMany({})
  await prisma.emailTemplate.deleteMany({})
  await prisma.emailIntegration.deleteMany({})

  console.log('✅ Base de données nettoyée')
  console.log('')

  // ====================================
  // 1. UTILISATEURS
  // ====================================
  console.log('👤 Création des utilisateurs...')

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

  console.log(`✅ ${adminWeevup.email}`)
  console.log(`✅ ${adminDemo.email}`)
  console.log('')

  // ====================================
  // 2. INTÉGRATION EMAIL
  // ====================================
  console.log('📧 Configuration de l\'intégration email...')

  const emailIntegration = await prisma.emailIntegration.create({
    data: {
      provider: EmailProvider.SENDGRID,
      isActive: true,
      isPrimary: true,
      apiKey: 'SG.demo_key_encrypted',
      fromEmail: 'noreply@weevup.com',
      fromName: 'Weevup Events',
      replyTo: 'contact@weevup.com',
      webhookUrl: 'https://app.weevup.com/api/webhooks/email/sendgrid',
      webhookSecret: 'webhook_secret_encrypted',
      trackOpens: true,
      trackClicks: true,
      dailyLimit: 10000,
      monthlyLimit: 300000,
      lastTestedAt: new Date(),
      lastUsedAt: new Date()
    }
  })

  console.log(`✅ ${emailIntegration.provider} - Active`)
  console.log('')

  // ====================================
  // 3. TEMPLATES D'EMAIL
  // ====================================
  console.log('📝 Création des templates d\'email...')

  await prisma.emailTemplate.createMany({
    data: [
      {
        name: 'Save the Date - Standard',
        slug: 'save-the-date-standard',
        description: 'Template standard pour les save the date',
        type: EmailType.SAVE_THE_DATE,
        subject: '📅 Save the Date - {{eventName}}',
        htmlContent: '<html><body><h1>Save the Date!</h1><p>{{eventName}} - {{eventDate}}</p></body></html>',
        textContent: 'Save the Date! {{eventName}} - {{eventDate}}',
        primaryColor: '#004645',
        secondaryColor: '#009197',
        accentColor: '#FF4713',
        fontFamily: 'Arial, sans-serif',
        isDefault: true,
        isActive: true,
        usageCount: 0
      },
      {
        name: 'Invitation - Standard',
        slug: 'invitation-standard',
        description: 'Template standard pour les invitations',
        type: EmailType.INVITATION,
        subject: '🎟️ Vous êtes invité - {{eventName}}',
        htmlContent: '<html><body><h1>Vous êtes invité!</h1><p>{{eventName}} - {{eventDate}}</p></body></html>',
        textContent: 'Vous êtes invité à {{eventName}}',
        primaryColor: '#004645',
        secondaryColor: '#009197',
        accentColor: '#FF4713',
        fontFamily: 'Arial, sans-serif',
        isDefault: true,
        isActive: true,
        usageCount: 0
      },
      {
        name: 'Rappel - Standard',
        slug: 'reminder-standard',
        description: 'Template standard pour les rappels',
        type: EmailType.REMINDER,
        subject: '⏰ Rappel - {{eventName}}',
        htmlContent: '<html><body><h1>Rappel</h1><p>N\'oubliez pas de confirmer votre présence!</p></body></html>',
        textContent: 'Rappel: Confirmez votre présence à {{eventName}}',
        primaryColor: '#004645',
        secondaryColor: '#009197',
        accentColor: '#FF4713',
        fontFamily: 'Arial, sans-serif',
        isDefault: false,
        isActive: true,
        usageCount: 0
      },
      {
        name: 'Confirmation - Standard',
        slug: 'confirmation-standard',
        description: 'Template standard pour les confirmations',
        type: EmailType.CONFIRMATION,
        subject: '✅ Confirmation - {{eventName}}',
        htmlContent: '<html><body><h1>Confirmé!</h1><p>Votre participation est confirmée.</p></body></html>',
        textContent: 'Votre participation à {{eventName}} est confirmée!',
        primaryColor: '#004645',
        secondaryColor: '#009197',
        accentColor: '#FF4713',
        fontFamily: 'Arial, sans-serif',
        isDefault: false,
        isActive: true,
        usageCount: 0
      }
    ]
  })

  console.log('✅ 4 templates créés')
  console.log('')

  // ====================================
  // 4. ÉVÉNEMENT 1: TECH SUMMIT 2025
  // ====================================
  console.log('🎉 Création de l\'événement: Tech Summit 2025...')

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

  console.log(`✅ ${eventTechSummit.name}`)
  console.log(`   📍 ${eventTechSummit.venueName}, ${eventTechSummit.city}`)
  console.log(`   📅 ${eventTechSummit.startsAt.toLocaleDateString('fr-FR')}`)
  console.log('')

  // ====================================
  // 5. ÉVÉNEMENT 2: 10 ANS DE WEEVUP
  // ====================================
  console.log('🎉 Création de l\'événement: 10 ans de Weevup...')

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

  console.log(`✅ ${eventWeevup.name}`)
  console.log(`   📍 ${eventWeevup.venueName}, ${eventWeevup.city}`)
  console.log(`   📅 ${eventWeevup.startsAt.toLocaleDateString('fr-FR')}`)
  console.log('')

  // ====================================
  // 6. ÉVÉNEMENT 3: MARIAGE JULIE & THOMAS
  // ====================================
  console.log('🎉 Création de l\'événement: Mariage Julie & Thomas...')

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

  console.log(`✅ ${eventWedding.name}`)
  console.log(`   📍 ${eventWedding.venueName}, ${eventWedding.city}`)
  console.log(`   📅 ${eventWedding.startsAt.toLocaleDateString('fr-FR')}`)
  console.log('')

  // ====================================
  // 7. ÉVÉNEMENT 4: GALA DE CHARITÉ
  // ====================================
  console.log('🎉 Création de l\'événement: Gala de Charité...')

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

  console.log(`✅ ${eventGala.name}`)
  console.log(`   📍 ${eventGala.venueName}, ${eventGala.city}`)
  console.log(`   📅 ${eventGala.startsAt.toLocaleDateString('fr-FR')}`)
  console.log('')

  // ====================================
  // 8. ÉVÉNEMENT 5: WORKSHOP PROFESSIONNEL
  // ====================================
  console.log('🎉 Création de l\'événement: Workshop Leadership...')

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

  console.log(`✅ ${eventWorkshop.name}`)
  console.log(`   📍 ${eventWorkshop.venueName}, ${eventWorkshop.city}`)
  console.log(`   📅 ${eventWorkshop.startsAt.toLocaleDateString('fr-FR')}`)
  console.log('')

  // ====================================
  // 9. CRÉATION DES INVITÉS
  // ====================================
  console.log('👥 Création des invités pour tous les événements...')

  let totalGuests = 0

  // Invités pour Tech Summit (30 invités)
  const guestsTechSummit = [
    { firstName: 'Sophie', lastName: 'Martin', email: 'sophie.martin@techcorp.com', company: 'TechCorp', tags: ['VIP', 'Speaker'] },
    { firstName: 'Marc', lastName: 'Dubois', email: 'marc.dubois@startup.com', company: 'StartupLab', tags: ['Sponsor'] },
    { firstName: 'Julie', lastName: 'Bernard', email: 'julie.bernard@innovate.com', company: 'InnovateCo', tags: ['Speaker'] },
    { firstName: 'Thomas', lastName: 'Petit', email: 'thomas.petit@dev.com', company: 'DevStudio', tags: ['Participant'] },
    { firstName: 'Marie', lastName: 'Robert', email: 'marie.robert@cloud.com', company: 'CloudSystems', tags: ['VIP'] },
  ]

  for (const guestData of guestsTechSummit) {
    const token = generateToken()
    const tokenHash = hashToken(token)

    await prisma.guest.create({
      data: {
        eventId: eventTechSummit.id,
        firstName: guestData.firstName,
        lastName: guestData.lastName,
        email: guestData.email,
        company: guestData.company,
        tags: guestData.tags,
        token: token,
        tokenHash: tokenHash,
        tokenExpiry: new Date('2025-12-31'),
        status: Math.random() > 0.3 ? GuestStatus.RESPONDED : GuestStatus.INVITED
      }
    })
    totalGuests++
  }

  // Invités pour Weevup (10 invités)
  const guestsWeevup = [
    { firstName: 'Sophie', lastName: 'Martin', email: 'sophie.martin@example.com', company: 'TechCorp', tags: ['VIP', 'Client'] },
    { firstName: 'Jean', lastName: 'Dupont', email: 'jean.dupont@example.com', company: 'InnovateLab', tags: ['Partenaire'] },
    { firstName: 'Marie', lastName: 'Durand', email: 'marie.durand@example.com', company: 'Digital Solutions', tags: ['VIP', 'Presse'] },
    { firstName: 'Pierre', lastName: 'Leblanc', email: 'pierre.leblanc@example.com', company: 'StartupHub', tags: ['Client'] },
    { firstName: 'Amélie', lastName: 'Rousseau', email: 'amelie.rousseau@example.com', company: 'CloudTech', tags: ['VIP', 'Partenaire'] },
  ]

  for (const guestData of guestsWeevup) {
    const token = generateToken()
    const tokenHash = hashToken(token)

    await prisma.guest.create({
      data: {
        eventId: eventWeevup.id,
        firstName: guestData.firstName,
        lastName: guestData.lastName,
        email: guestData.email,
        company: guestData.company,
        tags: guestData.tags,
        token: token,
        tokenHash: tokenHash,
        tokenExpiry: new Date('2025-06-25'),
        status: GuestStatus.INVITED
      }
    })
    totalGuests++
  }

  // Invités pour le Mariage (40 invités)
  const guestsWedding = [
    { firstName: 'Pierre', lastName: 'Martin', email: 'pierre.martin@email.com', tags: ['Famille', 'Côté mariée'] },
    { firstName: 'Claire', lastName: 'Martin', email: 'claire.martin@email.com', tags: ['Famille', 'Côté mariée'] },
    { firstName: 'Luc', lastName: 'Dubois', email: 'luc.dubois@email.com', tags: ['Famille', 'Côté marié'] },
    { firstName: 'Anne', lastName: 'Dubois', email: 'anne.dubois@email.com', tags: ['Famille', 'Côté marié'] },
    { firstName: 'Sophie', lastName: 'Leclerc', email: 'sophie.leclerc@email.com', tags: ['Amis', 'Témoin'] },
  ]

  for (const guestData of guestsWedding) {
    const token = generateToken()
    const tokenHash = hashToken(token)

    await prisma.guest.create({
      data: {
        eventId: eventWedding.id,
        firstName: guestData.firstName,
        lastName: guestData.lastName,
        email: guestData.email,
        tags: guestData.tags,
        token: token,
        tokenHash: tokenHash,
        tokenExpiry: new Date('2025-07-20'),
        status: Math.random() > 0.4 ? GuestStatus.RESPONDED : GuestStatus.INVITED
      }
    })
    totalGuests++
  }

  // Invités pour le Gala (15 invités)
  const guestsGala = [
    { firstName: 'François', lastName: 'Legrand', email: 'f.legrand@vip.com', company: 'LuxeCorp', tags: ['VIP', 'Donateur'] },
    { firstName: 'Isabelle', lastName: 'Moreau', email: 'i.moreau@foundation.org', company: 'Foundation', tags: ['Partenaire'] },
    { firstName: 'Laurent', lastName: 'Bernard', email: 'l.bernard@media.fr', company: 'MediaGroup', tags: ['Presse'] },
  ]

  for (const guestData of guestsGala) {
    const token = generateToken()
    const tokenHash = hashToken(token)

    await prisma.guest.create({
      data: {
        eventId: eventGala.id,
        firstName: guestData.firstName,
        lastName: guestData.lastName,
        email: guestData.email,
        company: guestData.company,
        tags: guestData.tags,
        token: token,
        tokenHash: tokenHash,
        tokenExpiry: new Date('2025-09-30'),
        status: GuestStatus.INVITED
      }
    })
    totalGuests++
  }

  // Invités pour le Workshop (20 invités)
  const guestsWorkshop = [
    { firstName: 'Maxime', lastName: 'Roussel', email: 'maxime.r@company.com', company: 'TechStart', tags: ['Manager'] },
    { firstName: 'Laura', lastName: 'Vincent', email: 'laura.v@company.com', company: 'InnoHub', tags: ['CEO'] },
    { firstName: 'David', lastName: 'Morel', email: 'david.m@company.com', company: 'DataCorp', tags: ['CTO'] },
  ]

  for (const guestData of guestsWorkshop) {
    const token = generateToken()
    const tokenHash = hashToken(token)

    await prisma.guest.create({
      data: {
        eventId: eventWorkshop.id,
        firstName: guestData.firstName,
        lastName: guestData.lastName,
        email: guestData.email,
        company: guestData.company,
        tags: guestData.tags,
        token: token,
        tokenHash: tokenHash,
        tokenExpiry: new Date('2025-04-15'),
        status: Math.random() > 0.5 ? GuestStatus.RESPONDED : GuestStatus.INVITED
      }
    })
    totalGuests++
  }

  console.log(`✅ ${totalGuests} invités créés au total`)
  console.log('')

  // ====================================
  // 10. STATISTIQUES FINALES
  // ====================================
  console.log('📊 ========================================')
  console.log('   RÉSUMÉ DE LA GÉNÉRATION COMPLÈTE')
  console.log('   ========================================')
  console.log('')

  const events = await prisma.event.findMany({
    include: {
      _count: {
        select: {
          guests: true,
          rsvps: true
        }
      }
    }
  })

  for (const event of events) {
    console.log(`🎉 ${event.name}`)
    console.log(`   📍 ${event.venueName}, ${event.city}`)
    console.log(`   📅 ${event.startsAt.toLocaleDateString('fr-FR')}`)
    console.log(`   👥 ${event._count.guests} invités`)
    console.log(`   🔗 /events/${event.slug}`)
    console.log('')
  }

  console.log('📊 Totaux:')
  console.log(`   👤 ${await prisma.user.count()} utilisateurs`)
  console.log(`   🎉 ${await prisma.event.count()} événements`)
  console.log(`   👥 ${await prisma.guest.count()} invités`)
  console.log(`   📧 ${await prisma.emailTemplate.count()} templates`)
  console.log(`   🔌 ${await prisma.emailIntegration.count()} intégration email`)
  console.log('')

  console.log('✅ ========================================')
  console.log('   GÉNÉRATION COMPLÈTE TERMINÉE !')
  console.log('   ========================================')
  console.log('')
  console.log('🚀 Prochaines étapes:')
  console.log('   1. Démarrer le serveur: npm run dev')
  console.log('   2. Accéder au dashboard: http://localhost:3000/admin')
  console.log('   3. Tester les différentes showcases')
  console.log('')
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors de la génération:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
