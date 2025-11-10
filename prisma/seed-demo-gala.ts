import { PrismaClient, UserRole, GuestStatus } from '@prisma/client'
import * as crypto from 'crypto'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

function generateToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

async function main() {
  console.log('🎭 ========================================')
  console.log('   DÉMO: GALA DE CHARITÉ')
  console.log('   ========================================')
  console.log('')

  // Créer un utilisateur pour le gala
  const defaultPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'gala@weevup.com' },
    update: {},
    create: {
      email: 'gala@weevup.com',
      password: defaultPassword,
      name: 'Admin Gala',
      role: UserRole.ADMIN
    }
  })

  console.log(`✅ Admin créé: ${admin.email}`)

  // Créer l'événement gala
  const event = await prisma.event.upsert({
    where: { slug: 'gala-charite-2025' },
    update: {},
    create: {
      name: 'Gala de Charité - Enfants du Monde',
      slug: 'gala-charite-2025',
      startsAt: new Date('2025-09-25T19:00:00Z'),
      endsAt: new Date('2025-09-26T00:00:00Z'),
      venueName: 'Hôtel de Ville de Paris',
      address: 'Place de l\'Hôtel de Ville',
      city: 'Paris',
      country: 'France',
      coverImage: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622',
      description: `Soirée de gala exceptionnelle au profit de l'association "Enfants du Monde"

L'Hôtel de Ville de Paris accueille cette année encore notre gala annuel de bienfaisance. Une soirée prestigieuse où élégance rime avec générosité.

🎯 Notre mission:
Collecter des fonds pour offrir accès à l'éducation, aux soins et à un avenir meilleur aux enfants défavorisés à travers le monde.

✨ Une soirée d'exception:
• Tapis rouge & photocall
• Cocktail dînatoire raffiné
• Présentation des projets de l'association
• Dîner gastronomique 5 services
• Vente aux enchères d'œuvres d'art
• Concert privé avec artiste surprise
• Tombola caritative

100% des fonds récoltés sont reversés à nos programmes éducatifs.

Ensemble, faisons la différence ! 🌍`,

      program: `**19h00** - Accueil & tapis rouge
Arrivée des invités, photocall officiel

**19h30** - Cocktail dînatoire
Champagne et mets raffinés dans les salons d'apparat

**20h30** - Présentation de l'association
Témoignages et projets 2025

**21h00** - Dîner de gala
Menu gastronomique 5 services par le Chef étoilé Pierre Gagnaire

**22h00** - Vente aux enchères caritative
Œuvres d'art, objets de collection et expériences uniques

**22h45** - Tombola
Tirage au sort de lots exceptionnels

**23h00** - Concert privé
Artiste international surprise

**00h00** - Clôture
Remerciements et au revoir`,

      dressCode: 'Tenue de gala obligatoire / Black tie - Smoking pour messieurs, robe longue pour mesdames',
      rsvpDeadline: new Date('2025-09-10T23:59:59Z'),
      maxPlusOnes: 1,
      allowPlusOnes: true,
      requireMeal: true,
      mealOptions: [
        'Menu Prestige (Caviar, Homard, Wagyu)',
        'Menu Végétarien Gourmet',
        'Menu Végan Gastronomique'
      ],
      enableTransport: true,
      enableLodging: false,
      enableAccessibility: true,
      enablePhotoConsent: true,
      showcaseEnabled: true,
      showcaseTitle: 'Gala de Charité 2025',
      showcaseSubtitle: 'Enfants du Monde • 25 Septembre 2025 • Hôtel de Ville de Paris',
      showcaseBannerImage: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622',
      showcaseTheme: 'weevup',
      showcasePrimaryColor: '#1e3a8a',
      showcaseSecondaryColor: '#3b82f6',
      showcaseCountdown: true,
      showcaseSocialShare: true,
      showcaseFAQ: [
        {
          question: 'Quel est le prix du billet ?',
          answer: 'Le tarif de participation est de 500€ par personne, intégralement déductible des impôts. Ce montant comprend le cocktail, le dîner gastronomique, les boissons et le concert.'
        },
        {
          question: 'Comment sont utilisés les fonds collectés ?',
          answer: '100% des fonds collectés sont reversés à nos programmes éducatifs. Nous finançons des écoles, des fournitures scolaires, des bourses d\'études et des formations professionnelles dans 15 pays.'
        },
        {
          question: 'Puis-je faire un don supplémentaire ?',
          answer: 'Oui, absolument! Vous pourrez faire des dons lors de la vente aux enchères, participer à la tombola, ou faire un don direct. Un reçu fiscal vous sera délivré.'
        },
        {
          question: 'Y aura-t-il un photographe ?',
          answer: 'Oui, un photographe professionnel immortalisera la soirée. Les photos seront disponibles sur notre site quelques jours après l\'événement. Un photocall sera également à votre disposition.'
        },
        {
          question: 'Comment se rendre à l\'Hôtel de Ville ?',
          answer: 'L\'Hôtel de Ville est accessible en métro (lignes 1 et 11, station Hôtel de Ville). Un service de voiturier est disponible pour les invités. Les coordonnées précises vous seront communiquées après votre confirmation.'
        },
        {
          question: 'Puis-je devenir sponsor de l\'événement ?',
          answer: 'Oui! Nous proposons plusieurs formules de partenariat. Contactez-nous à sponsor@enfantsdumonde.org pour plus d\'informations.'
        }
      ],
      showcaseTimeline: [
        {
          time: '19h00',
          title: 'Tapis rouge',
          description: 'Arrivée des invités et photocall officiel'
        },
        {
          time: '19h30',
          title: 'Cocktail dînatoire',
          description: 'Champagne et mets raffinés'
        },
        {
          time: '21h00',
          title: 'Dîner de gala',
          description: 'Menu 5 services par Chef étoilé'
        },
        {
          time: '22h00',
          title: 'Vente aux enchères',
          description: 'Œuvres d\'art et expériences uniques'
        },
        {
          time: '23h00',
          title: 'Concert privé',
          description: 'Artiste international surprise'
        }
      ],
      showcaseGallery: [
        'https://images.unsplash.com/photo-1511795409834-ef04bbd61622',
        'https://images.unsplash.com/photo-1540575467063-178a50c2df87',
        'https://images.unsplash.com/photo-1505373877841-8d25f7d46678',
        'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3'
      ],
      showcaseSponsors: [
        {
          name: 'Fondation BNP Paribas',
          logo: 'https://via.placeholder.com/200x80/1e3a8a/FFFFFF?text=BNP+Paribas',
          tier: 'Platinum',
          url: 'https://fondation.bnpparibas'
        },
        {
          name: 'LVMH',
          logo: 'https://via.placeholder.com/200x80/3b82f6/FFFFFF?text=LVMH',
          tier: 'Gold',
          url: 'https://lvmh.fr'
        },
        {
          name: 'Air France',
          logo: 'https://via.placeholder.com/200x80/60a5fa/FFFFFF?text=Air+France',
          tier: 'Gold',
          url: 'https://airfrance.fr'
        },
        {
          name: 'Le Figaro',
          logo: 'https://via.placeholder.com/200x80/93c5fd/000000?text=Le+Figaro',
          tier: 'Silver',
          url: 'https://lefigaro.fr'
        }
      ],
      adminId: admin.id
    }
  })

  console.log(`✅ Événement créé: ${event.name}`)
  console.log(`   📍 ${event.venueName}, ${event.city}`)
  console.log(`   📅 ${event.startsAt.toLocaleDateString('fr-FR')}`)
  console.log('')

  // Créer les invités
  console.log('👥 Création des invités VIP...')

  const guests = [
    // Grands donateurs & VIP
    { firstName: 'François', lastName: 'Legrand', email: 'f.legrand@luxecorp.com', company: 'LuxeCorp International', tags: ['VIP', 'Grand Donateur', 'Membre du Conseil'], attending: true, plusOnes: 1, meal: 'Menu Prestige (Caviar, Homard, Wagyu)' },
    { firstName: 'Isabelle', lastName: 'de Montfort', email: 'i.montfort@foundation.org', company: 'Fondation de Montfort', tags: ['VIP', 'Partenaire', 'Mécène'], attending: true, plusOnes: 1, meal: 'Menu Végétarien Gourmet' },
    { firstName: 'Jean-Pierre', lastName: 'Valois', email: 'jp.valois@banking.fr', company: 'Valois Private Banking', tags: ['VIP', 'Grand Donateur'], attending: true, plusOnes: 1, meal: 'Menu Prestige (Caviar, Homard, Wagyu)' },
    { firstName: 'Catherine', lastName: 'Beaumont', email: 'c.beaumont@luxury.com', company: 'Beaumont Luxury Group', tags: ['VIP', 'Sponsor Gold'], attending: true, plusOnes: 1, meal: 'Menu Prestige (Caviar, Homard, Wagyu)' },
    { firstName: 'Philippe', lastName: 'Dufresne', email: 'p.dufresne@investment.fr', company: 'Dufresne Investment', tags: ['VIP', 'Membre du Conseil'], attending: null, plusOnes: 0, meal: null },

    // Sponsors & Partenaires
    { firstName: 'Sophie', lastName: 'Laurent', email: 's.laurent@bnp.fr', company: 'BNP Paribas', tags: ['Sponsor', 'Platinum'], attending: true, plusOnes: 1, meal: 'Menu Prestige (Caviar, Homard, Wagyu)' },
    { firstName: 'Marc', lastName: 'Arnault', email: 'm.arnault@lvmh.fr', company: 'LVMH', tags: ['Sponsor', 'Gold'], attending: true, plusOnes: 1, meal: 'Menu Prestige (Caviar, Homard, Wagyu)' },
    { firstName: 'Claire', lastName: 'Dubois', email: 'c.dubois@airfrance.fr', company: 'Air France', tags: ['Sponsor', 'Gold'], attending: true, plusOnes: 0, meal: 'Menu Végétarien Gourmet' },
    { firstName: 'Olivier', lastName: 'Girard', email: 'o.girard@cartier.com', company: 'Cartier', tags: ['Sponsor', 'Silver'], attending: true, plusOnes: 1, meal: 'Menu Prestige (Caviar, Homard, Wagyu)' },
    { firstName: 'Nathalie', lastName: 'Rousseau', email: 'n.rousseau@chanel.fr', company: 'Chanel', tags: ['Sponsor', 'Silver'], attending: false, plusOnes: 0, meal: null },

    // Presse & Média
    { firstName: 'Laurent', lastName: 'Bernard', email: 'l.bernard@lefigaro.fr', company: 'Le Figaro', tags: ['Presse', 'Média'], attending: true, plusOnes: 0, meal: 'Menu Prestige (Caviar, Homard, Wagyu)' },
    { firstName: 'Marie', lastName: 'Leclerc', email: 'm.leclerc@france2.fr', company: 'France 2', tags: ['Presse', 'Télévision'], attending: true, plusOnes: 1, meal: 'Menu Végétarien Gourmet' },
    { firstName: 'Thomas', lastName: 'Moreau', email: 't.moreau@parismatch.fr', company: 'Paris Match', tags: ['Presse', 'Magazine'], attending: null, plusOnes: 0, meal: null },

    // Personnalités & Ambassadeurs
    { firstName: 'Amélie', lastName: 'Fontaine', email: 'a.fontaine@actress.com', company: 'Comédienne', tags: ['Ambassadeur', 'Célébrité'], attending: true, plusOnes: 1, meal: 'Menu Végan Gastronomique' },
    { firstName: 'Antoine', lastName: 'Mercier', email: 'a.mercier@sports.com', company: 'Sportif professionnel', tags: ['Ambassadeur', 'Sport'], attending: true, plusOnes: 1, meal: 'Menu Prestige (Caviar, Homard, Wagyu)' },

    // Membres du bureau de l'association
    { firstName: 'Dr. Marie', lastName: 'Petit', email: 'm.petit@enfantsdumonde.org', company: 'Enfants du Monde', tags: ['Association', 'Présidente'], attending: true, plusOnes: 1, meal: 'Menu Végétarien Gourmet' },
    { firstName: 'Pierre', lastName: 'Roux', email: 'p.roux@enfantsdumonde.org', company: 'Enfants du Monde', tags: ['Association', 'Directeur Général'], attending: true, plusOnes: 1, meal: 'Menu Prestige (Caviar, Homard, Wagyu)' },
    { firstName: 'Julien', lastName: 'Simon', email: 'j.simon@enfantsdumonde.org', company: 'Enfants du Monde', tags: ['Association', 'Trésorier'], attending: true, plusOnes: 0, meal: 'Menu Végan Gastronomique' },

    // Invités divers
    { firstName: 'Camille', lastName: 'Blanc', email: 'c.blanc@diplomat.gouv.fr', company: 'Ministère des Affaires Étrangères', tags: ['Officiel', 'Diplomate'], attending: true, plusOnes: 1, meal: 'Menu Prestige (Caviar, Homard, Wagyu)' },
    { firstName: 'Alexandre', lastName: 'Chevalier', email: 'a.chevalier@unesco.org', company: 'UNESCO', tags: ['Officiel', 'International'], attending: null, plusOnes: 0, meal: null },
    { firstName: 'Lucie', lastName: 'Garnier', email: 'l.garnier@philanthrope.com', company: 'Philanthrope', tags: ['VIP', 'Donateur'], attending: true, plusOnes: 1, meal: 'Menu Végétarien Gourmet' }
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
        company: guestData.company,
        tags: guestData.tags,
        token: token,
        tokenHash: tokenHash,
        tokenExpiry: new Date('2025-09-30'),
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
          consentPhotos: Math.random() > 0.1 // 90% consent pour ce type d'événement
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
  console.log(`🎭 ${event.name}`)
  console.log(`📍 ${event.venueName}, ${event.city}`)
  console.log(`📅 ${event.startsAt.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`)
  console.log('')
  console.log(`👥 INVITÉS:`)
  console.log(`   Total: ${guestsCreated}`)
  console.log(`   ✅ Confirmés: ${attendingCount}`)
  console.log(`   ❌ Déclinés: ${notAttendingCount}`)
  console.log(`   ⏳ En attente: ${pendingCount}`)
  console.log('')
  console.log(`💰 Impact estimé: ${attendingCount * 500}€ de fonds collectés`)
  console.log('')
  console.log(`🔗 Showcase: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/events/${event.slug}`)
  console.log('')
  console.log('✅ ========================================')
  console.log('   GALA DE CHARITÉ CRÉÉ AVEC SUCCÈS !')
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
