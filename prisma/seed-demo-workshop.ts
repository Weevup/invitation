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
  console.log('📚 ========================================')
  console.log('   DÉMO: WORKSHOP PROFESSIONNEL')
  console.log('   ========================================')
  console.log('')

  // Créer un utilisateur pour le workshop
  const defaultPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'workshop@weevup.com' },
    update: {},
    create: {
      email: 'workshop@weevup.com',
      password: defaultPassword,
      name: 'Admin Workshop',
      role: UserRole.ADMIN
    }
  })

  console.log(`✅ Admin créé: ${admin.email}`)

  // Créer l'événement workshop
  const event = await prisma.event.upsert({
    where: { slug: 'workshop-leadership-2025' },
    update: {},
    create: {
      name: 'Workshop Leadership & Management 2025',
      slug: 'workshop-leadership-2025',
      startsAt: new Date('2025-04-10T09:00:00Z'),
      endsAt: new Date('2025-04-10T17:00:00Z'),
      venueName: 'Station F',
      address: '5 Parvis Alan Turing',
      city: 'Paris',
      country: 'France',
      coverImage: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b',
      description: `Workshop intensif d'une journée sur le leadership et le management d'équipe à l'ère digitale

🎯 Objectifs de la formation:
• Développer votre style de leadership authentique
• Maîtriser les techniques de communication efficace
• Gérer le changement et accompagner les transformations
• Développer votre intelligence émotionnelle
• Créer une culture d'équipe performante

👥 Public visé:
Managers, chefs de projet, entrepreneurs, directeurs et toute personne en position de leadership souhaitant développer ses compétences managériales.

🎓 Intervenants:
3 experts reconnus en leadership et management avec plus de 20 ans d'expérience chacun.

📜 Certification:
Un certificat de participation vous sera délivré en fin de journée.

💼 Ce qui est inclus:
• Support de formation complet
• Petit-déjeuner & déjeuner
• Pauses café
• Accès au groupe privé LinkedIn des participants
• Coaching de suivi (1h offerte)`,

      program: `**09h00 - 09h30** | Accueil & petit-déjeuner
Networking et distribution des supports de formation

**09h30 - 10h00** | Introduction
Les nouveaux défis du leadership à l'ère digitale
_Par Sarah Dupont, Executive Coach_

**10h00 - 11h30** | Module 1 - Communication efficace
• Les fondamentaux de la communication interpersonnelle
• Adapter son message à son audience
• Communication assertive et feedback constructif
• Atelier pratique: Exercices de communication en binôme

**11h30 - 11h45** | Pause café

**11h45 - 13h00** | Module 2 - Gestion du changement
• Comprendre les résistances au changement
• Les étapes du processus de transformation
• Accompagner ses équipes dans le changement
• Atelier pratique: Cas d'étude en groupe

**13h00 - 14h30** | Déjeuner networking
Déjeuner buffet et échanges entre participants

**14h30 - 16h00** | Module 3 - Intelligence émotionnelle
• Les 4 piliers de l'intelligence émotionnelle
• Développer son empathie et sa conscience de soi
• Gérer ses émotions et celles de son équipe
• Atelier pratique: Tests et mises en situation

**16h00 - 16h15** | Pause café

**16h15 - 16h45** | Table ronde & Q&A
Questions-réponses avec tous les intervenants

**16h45 - 17h00** | Clôture
Remise des certificats et plan d'action personnel`,

      dressCode: 'Business casual - Tenue confortable pour les ateliers pratiques',
      rsvpDeadline: new Date('2025-04-03T23:59:59Z'),
      maxPlusOnes: 0,
      allowPlusOnes: false,
      requireMeal: true,
      mealOptions: [
        'Menu Standard (Viande/Poisson)',
        'Menu Végétarien',
        'Menu Vegan',
        'Menu Sans gluten'
      ],
      enableTransport: false,
      enableLodging: false,
      enableAccessibility: true,
      enablePhotoConsent: true,
      showcaseEnabled: true,
      showcaseTitle: 'Workshop Leadership & Management',
      showcaseSubtitle: 'Développez vos compétences de leader • 10 Avril 2025 • Station F Paris',
      showcaseBannerImage: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b',
      showcaseTheme: 'weevup',
      showcasePrimaryColor: '#059669',
      showcaseSecondaryColor: '#10b981',
      showcaseCountdown: true,
      showcaseSocialShare: true,
      showcaseFAQ: [
        {
          question: 'Quel est le niveau requis pour participer ?',
          answer: 'Ce workshop s\'adresse aux personnes ayant au minimum 2 ans d\'expérience en management ou en position de leadership. Aucun prérequis technique n\'est nécessaire.'
        },
        {
          question: 'Recevrai-je un certificat ?',
          answer: 'Oui, un certificat de participation vous sera délivré en fin de journée. Ce certificat peut être valorisé dans le cadre de la formation continue.'
        },
        {
          question: 'Le support de formation est-il fourni ?',
          answer: 'Oui, vous recevrez un support complet (version papier et digitale) comprenant toutes les présentations, des fiches pratiques et une bibliographie.'
        },
        {
          question: 'Les repas sont-ils inclus ?',
          answer: 'Oui, le petit-déjeuner, le déjeuner et toutes les pauses café sont inclus dans le prix de la formation. Merci de nous indiquer vos préférences alimentaires lors de votre inscription.'
        },
        {
          question: 'Y a-t-il un suivi après la formation ?',
          answer: 'Oui! Vous aurez accès à un groupe privé LinkedIn pour échanger avec les autres participants. De plus, 1h de coaching individuel vous est offerte dans les 3 mois suivant le workshop.'
        },
        {
          question: 'Combien de participants maximum ?',
          answer: 'Le workshop est limité à 25 participants pour garantir une qualité d\'échange optimale et permettre des ateliers pratiques en petits groupes.'
        },
        {
          question: 'Comment se rendre à Station F ?',
          answer: 'Station F est accessible par le métro ligne 6 (station Chevaleret) ou RER C (station Bibliothèque François Mitterrand). L\'adresse exacte: 5 Parvis Alan Turing, 75013 Paris.'
        }
      ],
      showcaseTimeline: [
        {
          time: '09h00',
          title: 'Accueil',
          description: 'Petit-déjeuner et networking'
        },
        {
          time: '09h30',
          title: 'Introduction',
          description: 'Les nouveaux défis du leadership'
        },
        {
          time: '10h00',
          title: 'Communication efficace',
          description: 'Techniques et ateliers pratiques'
        },
        {
          time: '11h45',
          title: 'Gestion du changement',
          description: 'Accompagner les transformations'
        },
        {
          time: '13h00',
          title: 'Déjeuner networking',
          description: 'Échanges entre participants'
        },
        {
          time: '14h30',
          title: 'Intelligence émotionnelle',
          description: 'Développer son EQ'
        },
        {
          time: '16h15',
          title: 'Table ronde & Q&A',
          description: 'Questions avec les experts'
        },
        {
          time: '16h45',
          title: 'Clôture',
          description: 'Remise des certificats'
        }
      ],
      showcaseGallery: [
        'https://images.unsplash.com/photo-1515187029135-18ee286d815b',
        'https://images.unsplash.com/photo-1552664730-d307ca884978',
        'https://images.unsplash.com/photo-1531482615713-2afd69097998',
        'https://images.unsplash.com/photo-1558403194-611308249627'
      ],
      showcaseSpeakers: [
        {
          name: 'Sarah Dupont',
          title: 'Executive Coach & Leadership Expert',
          bio: '20+ ans d\'expérience en coaching de dirigeants. Ancienne DRH de grandes entreprises du CAC40.',
          photo: 'https://i.pravatar.cc/300?img=1',
          linkedin: 'https://linkedin.com/in/sarahdupont'
        },
        {
          name: 'Marc Lefebvre',
          title: 'Expert en Management du Changement',
          bio: 'Consultant senior spécialisé dans les transformations organisationnelles. Auteur de 3 livres sur le management.',
          photo: 'https://i.pravatar.cc/300?img=12',
          linkedin: 'https://linkedin.com/in/marclefebvre'
        },
        {
          name: 'Dr. Julie Martin',
          title: 'Psychologue Organisationnelle',
          bio: 'Docteur en psychologie, spécialiste de l\'intelligence émotionnelle en entreprise.',
          photo: 'https://i.pravatar.cc/300?img=5',
          linkedin: 'https://linkedin.com/in/juliemartin'
        }
      ],
      adminId: admin.id
    }
  })

  console.log(`✅ Événement créé: ${event.name}`)
  console.log(`   📍 ${event.venueName}, ${event.city}`)
  console.log(`   📅 ${event.startsAt.toLocaleDateString('fr-FR')}`)
  console.log('')

  // Créer les invités/participants
  console.log('👥 Création des participants...')

  const guests = [
    // CEOs & Founders
    { firstName: 'Maxime', lastName: 'Roussel', email: 'maxime.r@techstart.io', company: 'TechStart', position: 'CEO & Founder', tags: ['CEO', 'Startup'], attending: true, meal: 'Menu Standard (Viande/Poisson)' },
    { firstName: 'Laura', lastName: 'Vincent', email: 'laura.v@innohub.fr', company: 'InnoHub', position: 'CEO', tags: ['CEO', 'Scale-up'], attending: true, meal: 'Menu Végétarien' },
    { firstName: 'Sophie', lastName: 'Blanchard', email: 's.blanchard@greentech.com', company: 'GreenTech Solutions', position: 'Founder & CEO', tags: ['CEO', 'Impact'], attending: true, meal: 'Menu Vegan' },

    // CTOs & Tech Leaders
    { firstName: 'David', lastName: 'Morel', email: 'david.m@datacorp.io', company: 'DataCorp', position: 'CTO', tags: ['CTO', 'Tech'], attending: true, meal: 'Menu Standard (Viande/Poisson)' },
    { firstName: 'Julie', lastName: 'Mercier', email: 'j.mercier@cloudnative.fr', company: 'CloudNative', position: 'VP Engineering', tags: ['CTO', 'Cloud'], attending: null, meal: null },
    { firstName: 'Thomas', lastName: 'Bernard', email: 't.bernard@devops.io', company: 'DevOps Pro', position: 'Head of Engineering', tags: ['Tech', 'DevOps'], attending: true, meal: 'Menu Sans gluten' },

    // Product Managers
    { firstName: 'Camille', lastName: 'Durand', email: 'c.durand@saas.com', company: 'SaaS Platform', position: 'Head of Product', tags: ['Product', 'SaaS'], attending: true, meal: 'Menu Végétarien' },
    { firstName: 'Alexandre', lastName: 'Petit', email: 'a.petit@mobile.app', company: 'MobileApp Inc', position: 'VP Product', tags: ['Product', 'Mobile'], attending: true, meal: 'Menu Standard (Viande/Poisson)' },

    // Team Managers
    { firstName: 'Marie', lastName: 'Leroy', email: 'm.leroy@marketing.agency', company: 'Creative Agency', position: 'Marketing Director', tags: ['Manager', 'Marketing'], attending: true, meal: 'Menu Vegan' },
    { firstName: 'Pierre', lastName: 'Roux', email: 'p.roux@sales.tech', company: 'SalesTech', position: 'Sales Director', tags: ['Manager', 'Sales'], attending: true, meal: 'Menu Standard (Viande/Poisson)' },
    { firstName: 'Émilie', lastName: 'Garnier', email: 'e.garnier@hr.solutions', company: 'HR Solutions', position: 'HR Director', tags: ['Manager', 'RH'], attending: false, meal: null },

    // Project Managers
    { firstName: 'Lucas', lastName: 'Simon', email: 'l.simon@project.io', company: 'ProjectFlow', position: 'Senior PM', tags: ['Project Manager', 'Agile'], attending: true, meal: 'Menu Standard (Viande/Poisson)' },
    { firstName: 'Chloé', lastName: 'Laurent', email: 'c.laurent@consulting.fr', company: 'Consulting Partners', position: 'Project Manager', tags: ['Project Manager', 'Consulting'], attending: true, meal: 'Menu Végétarien' },

    // Entrepreneurs
    { firstName: 'Hugo', lastName: 'Moreau', email: 'h.moreau@startup.xyz', company: 'Startup XYZ', position: 'Co-Founder', tags: ['Entrepreneur', 'Startup'], attending: true, meal: 'Menu Standard (Viande/Poisson)' },
    { firstName: 'Léa', lastName: 'Fontaine', email: 'l.fontaine@ecommerce.store', company: 'E-Commerce Store', position: 'Founder', tags: ['Entrepreneur', 'E-commerce'], attending: null, meal: null },

    // Mid-level Managers
    { firstName: 'Antoine', lastName: 'Dubois', email: 'a.dubois@corp.com', company: 'Corporate Inc', position: 'Team Lead', tags: ['Manager', 'Corporate'], attending: true, meal: 'Menu Standard (Viande/Poisson)' },
    { firstName: 'Sarah', lastName: 'Garcia', email: 's.garcia@finance.fr', company: 'Finance Corp', position: 'Operations Manager', tags: ['Manager', 'Finance'], attending: true, meal: 'Menu Végétarien' },
    { firstName: 'Nicolas', lastName: 'Martinez', email: 'n.martinez@logistics.com', company: 'Logistics Solutions', position: 'Supply Chain Manager', tags: ['Manager', 'Logistics'], attending: true, meal: 'Menu Sans gluten' },

    // Aspirants leaders
    { firstName: 'Manon', lastName: 'Blanc', email: 'm.blanc@junior.tech', company: 'TechCorp', position: 'Junior Manager', tags: ['Junior', 'Tech'], attending: true, meal: 'Menu Vegan' },
    { firstName: 'Quentin', lastName: 'Chevalier', email: 'q.chevalier@design.studio', company: 'Design Studio', position: 'Design Lead', tags: ['Design', 'Creative'], attending: true, meal: 'Menu Végétarien' },
    { firstName: 'Anaïs', lastName: 'Rousseau', email: 'a.rousseau@media.group', company: 'Media Group', position: 'Content Manager', tags: ['Manager', 'Media'], attending: null, meal: null }
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
        tokenExpiry: new Date('2025-04-15'),
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
          plusOnes: 0, // Pas d'accompagnateurs pour un workshop pro
          mealChoice: guestData.meal || null,
          consentPhotos: Math.random() > 0.3 // 70% consent
        }
      })
      rsvpsCreated++
    }
  }

  console.log(`✅ ${guestsCreated} participants créés`)
  console.log(`✅ ${rsvpsCreated} confirmations`)
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

  const spotsRemaining = 25 - attendingCount

  console.log('📊 ========================================')
  console.log('   RÉSUMÉ')
  console.log('   ========================================')
  console.log('')
  console.log(`📚 ${event.name}`)
  console.log(`📍 ${event.venueName}, ${event.city}`)
  console.log(`📅 ${event.startsAt.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`)
  console.log(`⏰ ${event.startsAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} - ${event.endsAt?.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`)
  console.log('')
  console.log(`👥 PARTICIPANTS:`)
  console.log(`   Total inscrits: ${guestsCreated}`)
  console.log(`   ✅ Confirmés: ${attendingCount}`)
  console.log(`   ❌ Déclinés: ${notAttendingCount}`)
  console.log(`   ⏳ En attente: ${pendingCount}`)
  console.log(`   📍 Places restantes: ${spotsRemaining}/25`)
  console.log('')
  console.log(`🔗 Showcase: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/events/${event.slug}`)
  console.log('')
  console.log('✅ ========================================')
  console.log('   WORKSHOP CRÉÉ AVEC SUCCÈS !')
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
