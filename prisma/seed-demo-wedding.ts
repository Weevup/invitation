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
  console.log('💒 ========================================')
  console.log('   DÉMO: MARIAGE JULIE & THOMAS')
  console.log('   ========================================')
  console.log('')

  // Créer un utilisateur pour le mariage
  const admin = await prisma.user.upsert({
    where: { email: 'mariage@weevup.com' },
    update: {},
    create: {
      email: 'mariage@weevup.com',
      role: UserRole.ADMIN
    }
  })

  console.log(`✅ Admin créé: ${admin.email}`)

  // Créer l'événement mariage
  const event = await prisma.event.upsert({
    where: { slug: 'mariage-julie-thomas' },
    update: {},
    create: {
      name: 'Mariage de Julie & Thomas',
      slug: 'mariage-julie-thomas',
      startsAt: new Date('2025-07-12T15:00:00Z'),
      endsAt: new Date('2025-07-13T02:00:00Z'),
      venueName: 'Château de Vaux-le-Vicomte',
      address: 'Château de Vaux-le-Vicomte',
      city: 'Maincy',
      country: 'France',
      coverImage: 'https://images.unsplash.com/photo-1519741497674-611481863552',
      description: `Julie et Thomas ont le plaisir de vous inviter à célébrer leur union dans le cadre enchanteur du Château de Vaux-le-Vicomte.

💝 Une journée magique vous attend :
• Cérémonie laïque dans les jardins à la française
• Cocktail & vin d'honneur au bord des bassins
• Dîner de gala dans la salle des fêtes
• Ouverture du bal par les mariés
• Soirée dansante jusqu'à l'aube

Nous avons hâte de partager ce moment unique avec vous !

Julie & Thomas 💕`,

      program: `**15h00** - Cérémonie laïque dans les jardins
Échange des vœux et bénédiction sous l'arbre centenaire

**16h30** - Cocktail & vin d'honneur
Champagne, canapés et moment convivial au bord des bassins

**19h30** - Dîner de gala
Menu gastronomique préparé par notre chef étoilé

**22h00** - Ouverture du bal
Première danse des mariés suivie du bal

**23h00** - Pièce montée
Découpe de la pièce montée traditionnelle

**00h00** - Soirée dansante
DJ et animations jusqu'au petit matin

**02h00** - Fin de la réception
Navettes retour pour Paris`,

      dressCode: 'Tenue de soirée / Smoking pour les hommes, robe longue conseillée pour les femmes',
      rsvpDeadline: new Date('2025-06-12T23:59:59Z'),
      maxPlusOnes: 1,
      allowPlusOnes: true,
      requireMeal: true,
      mealOptions: [
        'Menu Adulte (Foie gras, Boeuf, Fraisier)',
        'Menu Végétarien (Tartare légumes, Risotto, Fraisier)',
        'Menu Enfant (Nuggets & Frites)'
      ],
      enableTransport: true,
      enableLodging: true,
      enableAccessibility: true,
      enablePhotoConsent: true,
      showcaseEnabled: true,
      showcaseTitle: 'Julie & Thomas',
      showcaseSubtitle: '12 Juillet 2025 • Château de Vaux-le-Vicomte',
      showcaseBannerImage: 'https://images.unsplash.com/photo-1519741497674-611481863552',
      showcaseTheme: 'weevup',
      showcasePrimaryColor: '#d4af37',
      showcaseSecondaryColor: '#f8e5d0',
      showcaseCountdown: true,
      showcaseSocialShare: true,
      showcaseFAQ: [
        {
          question: 'Comment se rendre au château ?',
          answer: 'Le Château de Vaux-le-Vicomte est situé à 55km de Paris. Nous mettons à disposition des navettes depuis Paris (départ Gare de Lyon à 13h30). Si vous venez en voiture, un parking gratuit est disponible.'
        },
        {
          question: 'Puis-je amener mes enfants ?',
          answer: 'Oui bien sûr ! Les enfants sont les bienvenus. Un menu spécial enfant est prévu. Merci de nous indiquer le nombre d\'enfants lors de votre confirmation.'
        },
        {
          question: 'Y a-t-il des hébergements à proximité ?',
          answer: 'Oui, nous avons négocié des tarifs préférentiels dans plusieurs hôtels de la région. La liste vous sera communiquée après votre confirmation.'
        },
        {
          question: 'Quelle est la tenue recommandée ?',
          answer: 'Tenue de soirée élégante. Pour les hommes : costume sombre ou smoking. Pour les femmes : robe longue conseillée. La cérémonie et le cocktail se déroulent dans les jardins, prévoir des chaussures adaptées.'
        },
        {
          question: 'Y a-t-il une liste de mariage ?',
          answer: 'Votre présence est le plus beau des cadeaux ! Si vous souhaitez néanmoins nous faire plaisir, une urne sera à votre disposition le jour J.'
        },
        {
          question: 'Puis-je prendre des photos ?',
          answer: 'Oui, mais nous vous demandons de respecter la cérémonie (pas de téléphones pendant l\'échange des vœux). Un photographe professionnel sera présent toute la journée. Les photos vous seront partagées après le mariage.'
        }
      ],
      showcaseTimeline: [
        {
          time: '15h00',
          title: 'Cérémonie laïque',
          description: 'Échange des vœux dans les jardins à la française'
        },
        {
          time: '16h30',
          title: 'Vin d\'honneur',
          description: 'Cocktail champagne au bord des bassins'
        },
        {
          time: '19h30',
          title: 'Dîner de gala',
          description: 'Menu gastronomique dans la salle des fêtes'
        },
        {
          time: '22h00',
          title: 'Ouverture du bal',
          description: 'Première danse et soirée dansante'
        },
        {
          time: '23h00',
          title: 'Pièce montée',
          description: 'Découpe de la pièce montée traditionnelle'
        }
      ],
      showcaseGallery: [
        'https://images.unsplash.com/photo-1519741497674-611481863552',
        'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6',
        'https://images.unsplash.com/photo-1511285560929-80b456fea0bc',
        'https://images.unsplash.com/photo-1606800052052-a08af7148866'
      ],
      adminId: admin.id
    }
  })

  console.log(`✅ Événement créé: ${event.name}`)
  console.log(`   📍 ${event.venueName}, ${event.city}`)
  console.log(`   📅 ${event.startsAt.toLocaleDateString('fr-FR')}`)
  console.log('')

  // Créer les invités
  console.log('👥 Création des invités...')

  const guests = [
    // Famille de Julie (côté mariée)
    { firstName: 'Pierre', lastName: 'Martin', email: 'pierre.martin@email.com', tags: ['Famille', 'Parents', 'Côté mariée'], attending: true, plusOnes: 1, meal: 'Menu Adulte (Foie gras, Boeuf, Fraisier)' },
    { firstName: 'Claire', lastName: 'Martin', email: 'claire.martin@email.com', tags: ['Famille', 'Parents', 'Côté mariée'], attending: true, plusOnes: 1, meal: 'Menu Végétarien (Tartare légumes, Risotto, Fraisier)' },
    { firstName: 'Émilie', lastName: 'Martin', email: 'emilie.martin@email.com', tags: ['Famille', 'Sœur', 'Témoin', 'Côté mariée'], attending: true, plusOnes: 1, meal: 'Menu Adulte (Foie gras, Boeuf, Fraisier)' },
    { firstName: 'Julien', lastName: 'Mercier', email: 'julien.mercier@email.com', tags: ['Famille', 'Grands-parents', 'Côté mariée'], attending: true, plusOnes: 1, meal: 'Menu Adulte (Foie gras, Boeuf, Fraisier)' },
    { firstName: 'Marie', lastName: 'Mercier', email: 'marie.mercier@email.com', tags: ['Famille', 'Grands-parents', 'Côté mariée'], attending: true, plusOnes: 1, meal: 'Menu Adulte (Foie gras, Boeuf, Fraisier)' },

    // Famille de Thomas (côté marié)
    { firstName: 'Luc', lastName: 'Dubois', email: 'luc.dubois@email.com', tags: ['Famille', 'Parents', 'Côté marié'], attending: true, plusOnes: 1, meal: 'Menu Adulte (Foie gras, Boeuf, Fraisier)' },
    { firstName: 'Anne', lastName: 'Dubois', email: 'anne.dubois@email.com', tags: ['Famille', 'Parents', 'Côté marié'], attending: true, plusOnes: 1, meal: 'Menu Adulte (Foie gras, Boeuf, Fraisier)' },
    { firstName: 'Maxime', lastName: 'Dubois', email: 'maxime.dubois@email.com', tags: ['Famille', 'Frère', 'Témoin', 'Côté marié'], attending: true, plusOnes: 1, meal: 'Menu Adulte (Foie gras, Boeuf, Fraisier)' },
    { firstName: 'Camille', lastName: 'Dubois', email: 'camille.dubois@email.com', tags: ['Famille', 'Sœur', 'Côté marié'], attending: true, plusOnes: 0, meal: 'Menu Végétarien (Tartare légumes, Risotto, Fraisier)' },

    // Amis de Julie
    { firstName: 'Sophie', lastName: 'Leclerc', email: 'sophie.leclerc@email.com', tags: ['Amis', 'Témoin', 'Côté mariée'], attending: true, plusOnes: 1, meal: 'Menu Végétarien (Tartare légumes, Risotto, Fraisier)' },
    { firstName: 'Chloé', lastName: 'Rousseau', email: 'chloe.rousseau@email.com', tags: ['Amis', 'Université', 'Côté mariée'], attending: true, plusOnes: 1, meal: 'Menu Adulte (Foie gras, Boeuf, Fraisier)' },
    { firstName: 'Laura', lastName: 'Girard', email: 'laura.girard@email.com', tags: ['Amis', 'Travail', 'Côté mariée'], attending: null, plusOnes: 0, meal: null },
    { firstName: 'Emma', lastName: 'Fontaine', email: 'emma.fontaine@email.com', tags: ['Amis', 'Enfance', 'Côté mariée'], attending: true, plusOnes: 1, meal: 'Menu Adulte (Foie gras, Boeuf, Fraisier)' },
    { firstName: 'Léa', lastName: 'Morel', email: 'lea.morel@email.com', tags: ['Amis', 'Université', 'Côté mariée'], attending: false, plusOnes: 0, meal: null },

    // Amis de Thomas
    { firstName: 'Antoine', lastName: 'Bernard', email: 'antoine.bernard@email.com', tags: ['Amis', 'Témoin', 'Côté marié'], attending: true, plusOnes: 1, meal: 'Menu Adulte (Foie gras, Boeuf, Fraisier)' },
    { firstName: 'Lucas', lastName: 'Moreau', email: 'lucas.moreau@email.com', tags: ['Amis', 'Enfance', 'Côté marié'], attending: true, plusOnes: 1, meal: 'Menu Adulte (Foie gras, Boeuf, Fraisier)' },
    { firstName: 'Hugo', lastName: 'Laurent', email: 'hugo.laurent@email.com', tags: ['Amis', 'Université', 'Côté marié'], attending: true, plusOnes: 0, meal: 'Menu Adulte (Foie gras, Boeuf, Fraisier)' },
    { firstName: 'Nicolas', lastName: 'Simon', email: 'nicolas.simon@email.com', tags: ['Amis', 'Travail', 'Côté marié'], attending: null, plusOnes: 0, meal: null },
    { firstName: 'Julien', lastName: 'Garcia', email: 'julien.garcia@email.com', tags: ['Amis', 'Sport', 'Côté marié'], attending: true, plusOnes: 1, meal: 'Menu Adulte (Foie gras, Boeuf, Fraisier)' },

    // Amis communs
    { firstName: 'Mathilde', lastName: 'Blanc', email: 'mathilde.blanc@email.com', tags: ['Amis', 'Couple ami'], attending: true, plusOnes: 1, meal: 'Menu Végétarien (Tartare légumes, Risotto, Fraisier)' },
    { firstName: 'Alexandre', lastName: 'Blanc', email: 'alexandre.blanc@email.com', tags: ['Amis', 'Couple ami'], attending: true, plusOnes: 0, meal: 'Menu Adulte (Foie gras, Boeuf, Fraisier)' },
    { firstName: 'Sarah', lastName: 'Petit', email: 'sarah.petit@email.com', tags: ['Amis', 'Voisins'], attending: true, plusOnes: 1, meal: 'Menu Adulte (Foie gras, Boeuf, Fraisier)' },
    { firstName: 'Vincent', lastName: 'Roux', email: 'vincent.roux@email.com', tags: ['Amis', 'Voyage'], attending: false, plusOnes: 0, meal: null },
    { firstName: 'Anaïs', lastName: 'Chevalier', email: 'anais.chevalier@email.com', tags: ['Amis', 'Danse'], attending: null, plusOnes: 0, meal: null }
  ]

  let guestsCreated = 0
  let rsvpsCreated = 0

  for (const guestData of guests) {
    const token = generateToken()
    const tokenHash = hashToken(token)

    const status = guestData.attending === null ? GuestStatus.INVITED : GuestStatus.RESPONDED

    const guest = await prisma.guest.create({
      data: {
        eventId: event.id,
        firstName: guestData.firstName,
        lastName: guestData.lastName,
        email: guestData.email,
        tags: guestData.tags,
        token: token,
        tokenHash: tokenHash,
        tokenExpiry: new Date('2025-07-20'),
        status: status
      }
    })

    guestsCreated++

    // Créer un RSVP si le guest a répondu
    if (guestData.attending !== null) {
      await prisma.rSVP.create({
        data: {
          eventId: event.id,
          guestId: guest.id,
          attending: guestData.attending,
          plusOnes: guestData.plusOnes || 0,
          mealChoice: guestData.meal || null,
          consentPhotos: Math.random() > 0.2
        }
      })
      rsvpsCreated++
    }
  }

  console.log(`✅ ${guestsCreated} invités créés`)
  console.log(`✅ ${rsvpsCreated} RSVPs créés`)
  console.log('')

  // Statistiques
  const attendingCount = await prisma.rSVP.count({
    where: { eventId: event.id, attending: true }
  })

  const notAttendingCount = await prisma.rSVP.count({
    where: { eventId: event.id, attending: false }
  })

  const pendingCount = await prisma.guest.count({
    where: { eventId: event.id, status: GuestStatus.INVITED }
  })

  console.log('📊 ========================================')
  console.log('   RÉSUMÉ')
  console.log('   ========================================')
  console.log('')
  console.log(`💒 ${event.name}`)
  console.log(`📍 ${event.venueName}, ${event.city}`)
  console.log(`📅 ${event.startsAt.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`)
  console.log('')
  console.log(`👥 INVITÉS:`)
  console.log(`   Total: ${guestsCreated}`)
  console.log(`   ✅ Confirmés: ${attendingCount}`)
  console.log(`   ❌ Déclinés: ${notAttendingCount}`)
  console.log(`   ⏳ En attente: ${pendingCount}`)
  console.log('')
  console.log(`🔗 Showcase: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/events/${event.slug}`)
  console.log('')
  console.log('✅ ========================================')
  console.log('   MARIAGE CRÉÉ AVEC SUCCÈS !')
  console.log('   ========================================')
  console.log('')
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
