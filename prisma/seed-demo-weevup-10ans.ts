import { PrismaClient, UserRole, GuestStatus, EmailStatus, EmailType } from '@prisma/client'
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
  console.log('🎂 ========================================')
  console.log('   DÉMO: 10 ANS DE WEEVUP')
  console.log('   ========================================')
  console.log('')

  // Créer un utilisateur pour l'événement
  const defaultPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'contact@weevup.com' },
    update: {},
    create: {
      email: 'contact@weevup.com',
      password: defaultPassword,
      name: 'Admin Weevup',
      role: UserRole.ADMIN
    }
  })

  console.log(`✅ Admin créé: ${admin.email}`)

  // Créer l'événement anniversaire Weevup
  const event = await prisma.event.upsert({
    where: { slug: 'weevup-10-ans' },
    update: {},
    create: {
      name: '10 ans de Weevup - Célébrons une décennie d\'innovation',
      slug: 'weevup-10-ans',
      startsAt: new Date('2025-06-20T19:00:00Z'),
      endsAt: new Date('2025-06-21T01:00:00Z'),
      venueName: 'Molitor Paris',
      address: '13 Rue Nungesser et Coli',
      city: 'Paris',
      country: 'France',
      coverImage: 'https://images.unsplash.com/photo-1519167758481-83f29da8c43f',
      description: `Rejoignez-nous pour célébrer une décennie d'innovation, de passion et de succès !

🎉 Une soirée exceptionnelle vous attend :
• Rétrospective interactive des 10 ans de Weevup
• Témoignages inspirants de nos clients et partenaires
• Dîner gastronomique par le Chef étoilé Yannick Alléno
• DJ set exclusif avec surprises musicales
• Cadeaux et tirages au sort tout au long de la soirée

Cette célébration est dédiée à vous, qui avez fait de Weevup ce qu'elle est aujourd'hui : une référence dans la gestion d'événements digitaux.

Merci d'être de l'aventure ! 🚀`,

      program: `**19h00 - 19h30** | Accueil champagne & photocall
Red carpet, signature du livre d'or digital et cocktail de bienvenue

**19h30 - 20h00** | Discours d'ouverture
Mot du CEO et rétrospective vidéo des moments forts

**20h00 - 20h30** | Témoignages
Parole à nos clients, partenaires et équipe fondatrice

**20h30 - 22h00** | Dîner gastronomique
Menu 5 services par le Chef Yannick Alléno avec accords mets-vins

**22h00 - 22h30** | Rétrospective interactive
Projection photo immersive des 10 ans de Weevup

**22h30 - 23h00** | Remise des trophées
Weevup Awards : Meilleur client, Meilleur partenaire, Meilleur événement

**23h00 - 00h30** | Soirée DJ & danse
DJ set avec artiste surprise et animations

**00h30 - 01h00** | After & au revoir
Derniers cocktails et cadeaux souvenirs`,

      dressCode: 'Élégant & décontracté - Tenue de soirée chic (pas de dress code strict)',
      rsvpDeadline: new Date('2025-06-10T23:59:59Z'),
      maxPlusOnes: 1,
      allowPlusOnes: true,
      requireMeal: true,
      mealOptions: [
        'Menu Signature (Foie gras, Homard, Bœuf Wagyu, Dessert chocolat)',
        'Menu Mer (Saint-Jacques, Bar de ligne, Turbot, Tarte citron)',
        'Menu Végétarien Gourmet (Légumes bio, Risotto truffe, Soufflé)',
        'Menu Végan Créatif (Tartare légumes, Curry lentilles, Sorbet)',
        'Menu Sans gluten (adaptation possible sur tous les menus)'
      ],
      enableTransport: true,
      enableLodging: true,
      enableAccessibility: true,
      enablePhotoConsent: true,
      showcaseEnabled: true,
      showcaseTitle: '10 ans de Weevup',
      showcaseSubtitle: 'Une décennie d\'innovation • 20 Juin 2025 • Molitor Paris',
      showcaseBannerImage: 'https://images.unsplash.com/photo-1519167758481-83f29da8c43f',
      showcaseTheme: 'elegant',
      showcasePrimaryColor: '#004645',
      showcaseSecondaryColor: '#FF4713',
      showcaseCountdown: true,
      showcaseSocialShare: true,
      showcaseGallery: [
        'https://images.unsplash.com/photo-1519167758481-83f29da8c43f',
        'https://images.unsplash.com/photo-1511578314322-379afb476865',
        'https://images.unsplash.com/photo-1530103862676-de8c9debad1d',
        'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3'
      ],
      showcaseFAQ: [
        {
          question: 'Comment accéder au Molitor Paris ?',
          answer: 'Le Molitor est accessible en métro (ligne 9 et 10, station Porte d\'Auteuil ou Michel-Ange Molitor), en voiture avec voiturier disponible, ou via nos navettes depuis les gares Montparnasse et Saint-Lazare (départs à 18h15).'
        },
        {
          question: 'Puis-je venir accompagné(e) ?',
          answer: 'Oui ! Chaque invité peut venir avec un accompagnant. Merci de nous indiquer le nom de votre +1 lors de votre confirmation pour faciliter l\'accueil.'
        },
        {
          question: 'Y a-t-il un parking ?',
          answer: 'Oui, un parking privé est mis à disposition. Le service voiturier est également disponible gratuitement pour tous nos invités.'
        },
        {
          question: 'Des hébergements sont-ils disponibles ?',
          answer: 'Nous avons négocié des tarifs préférentiels dans 3 hôtels partenaires à proximité. La liste avec codes promo vous sera envoyée après votre confirmation.'
        },
        {
          question: 'Quel est le dress code ?',
          answer: 'Tenue élégante et décontractée. L\'idée est d\'être chic mais confortable pour profiter pleinement de la soirée. Pas de smoking obligatoire !'
        },
        {
          question: 'Puis-je partager des photos de la soirée ?',
          answer: 'Absolument ! Nous encourageons même le partage sur les réseaux sociaux avec le hashtag #Weevup10ans. Un photographe professionnel sera présent et les photos vous seront partagées sous 48h.'
        }
      ],
      showcaseTimeline: [
        {
          time: '19h00',
          title: 'Accueil champagne',
          description: 'Red carpet et photocall avec nos 10 ans en toile de fond'
        },
        {
          time: '19h30',
          title: 'Discours d\'ouverture',
          description: 'Retour sur une décennie d\'innovation et de passion'
        },
        {
          time: '20h30',
          title: 'Dîner gastronomique',
          description: 'Menu 5 services par le Chef Yannick Alléno'
        },
        {
          time: '22h00',
          title: 'Rétrospective',
          description: 'Revivez les moments forts de Weevup en images'
        },
        {
          time: '22h30',
          title: 'Weevup Awards',
          description: 'Célébrons ensemble nos plus belles réussites'
        },
        {
          time: '23h00',
          title: 'Soirée dansante',
          description: 'DJ set et animations jusqu\'au bout de la nuit'
        }
      ],
      showcaseSponsors: [
        {
          name: 'Sponsor Premium',
          logo: 'https://via.placeholder.com/200x100',
          url: 'https://example.com',
          tier: 'premium'
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
  console.log('👥 Création des invités...')

  const guests = [
    // Clients VIP - Top 5
    { firstName: 'François', lastName: 'Legrand', email: 'f.legrand@luxecorp.com', company: 'LuxeCorp International', tags: ['VIP', 'Client Premium', 'Partenaire historique'], attending: true, plusOnes: 1, meal: 'Menu Signature (Foie gras, Homard, Bœuf Wagyu, Dessert chocolat)' },
    { firstName: 'Isabelle', lastName: 'Moreau', email: 'i.moreau@techgiant.com', company: 'TechGiant France', tags: ['VIP', 'Client Premium'], attending: true, plusOnes: 1, meal: 'Menu Mer (Saint-Jacques, Bar de ligne, Turbot, Tarte citron)' },
    { firstName: 'Laurent', lastName: 'Bernard', email: 'l.bernard@innovcorp.fr', company: 'InnovCorp', tags: ['VIP', 'Client Premium', 'Testimonial'], attending: true, plusOnes: 1, meal: 'Menu Signature (Foie gras, Homard, Bœuf Wagyu, Dessert chocolat)' },
    { firstName: 'Caroline', lastName: 'Dupont', email: 'c.dupont@digitalsolutions.com', company: 'Digital Solutions', tags: ['VIP', 'Client Premium'], attending: true, plusOnes: 1, meal: 'Menu Végétarien Gourmet (Légumes bio, Risotto truffe, Soufflé)' },
    { firstName: 'Philippe', lastName: 'Rousseau', email: 'p.rousseau@startupnation.fr', company: 'StartupNation', tags: ['VIP', 'Client Premium', 'Early Adopter'], attending: true, plusOnes: 1, meal: 'Menu Signature (Foie gras, Homard, Bœuf Wagyu, Dessert chocolat)' },

    // Clients Fidèles
    { firstName: 'Nathalie', lastName: 'Blanc', email: 'n.blanc@eventpro.com', company: 'EventPro', tags: ['Client', 'Fidèle'], attending: true, plusOnes: 1, meal: 'Menu Mer (Saint-Jacques, Bar de ligne, Turbot, Tarte citron)' },
    { firstName: 'Olivier', lastName: 'Petit', email: 'o.petit@conferencehub.fr', company: 'ConferenceHub', tags: ['Client', 'Fidèle'], attending: true, plusOnes: 0, meal: 'Menu Végétarien Gourmet (Légumes bio, Risotto truffe, Soufflé)' },
    { firstName: 'Sylvie', lastName: 'Martin', email: 's.martin@galacorp.com', company: 'GalaCorp', tags: ['Client', 'Ambassadeur'], attending: true, plusOnes: 1, meal: 'Menu Signature (Foie gras, Homard, Bœuf Wagyu, Dessert chocolat)' },
    { firstName: 'Thierry', lastName: 'Garcia', email: 't.garcia@summitorg.fr', company: 'Summit Organization', tags: ['Client'], attending: false, plusOnes: 0, meal: null },
    { firstName: 'Valérie', lastName: 'Moreau', email: 'v.moreau@workshopfactory.com', company: 'Workshop Factory', tags: ['Client'], attending: true, plusOnes: 1, meal: 'Menu Végan Créatif (Tartare légumes, Curry lentilles, Sorbet)' },

    // Partenaires Stratégiques
    { firstName: 'Jean-Marc', lastName: 'Leroy', email: 'jm.leroy@mediapartner.fr', company: 'MediaPartner France', tags: ['Partenaire', 'Presse'], attending: true, plusOnes: 1, meal: 'Menu Signature (Foie gras, Homard, Bœuf Wagyu, Dessert chocolat)' },
    { firstName: 'Christine', lastName: 'Dubois', email: 'c.dubois@techalliance.com', company: 'Tech Alliance', tags: ['Partenaire', 'Technologie'], attending: null, plusOnes: 0, meal: null },
    { firstName: 'Patrick', lastName: 'Roux', email: 'p.roux@cloudprovider.fr', company: 'CloudProvider', tags: ['Partenaire', 'Infrastructure'], attending: true, plusOnes: 0, meal: 'Menu Mer (Saint-Jacques, Bar de ligne, Turbot, Tarte citron)' },
    { firstName: 'Monique', lastName: 'Vincent', email: 'm.vincent@designstudio.com', company: 'Design Studio', tags: ['Partenaire', 'Créatif'], attending: true, plusOnes: 1, meal: 'Menu Végétarien Gourmet (Légumes bio, Risotto truffe, Soufflé)' },
    { firstName: 'Alain', lastName: 'Chevalier', email: 'a.chevalier@securityfirst.fr', company: 'SecurityFirst', tags: ['Partenaire', 'Sécurité'], attending: true, plusOnes: 0, meal: 'Menu Signature (Foie gras, Homard, Bœuf Wagyu, Dessert chocolat)' },

    // Investisseurs & Board
    { firstName: 'Brigitte', lastName: 'Girard', email: 'b.girard@venturecapital.com', company: 'Venture Capital Partners', tags: ['VIP', 'Investisseur', 'Board'], attending: true, plusOnes: 1, meal: 'Menu Signature (Foie gras, Homard, Bœuf Wagyu, Dessert chocolat)' },
    { firstName: 'Daniel', lastName: 'Fontaine', email: 'd.fontaine@investment.fr', company: 'Investment Fund', tags: ['VIP', 'Investisseur'], attending: true, plusOnes: 1, meal: 'Menu Mer (Saint-Jacques, Bar de ligne, Turbot, Tarte citron)' },
    { firstName: 'Sandrine', lastName: 'Lopez', email: 's.lopez@advisory.com', company: 'Advisory Board', tags: ['VIP', 'Advisor'], attending: null, plusOnes: 0, meal: null },

    // Équipe & Anciens
    { firstName: 'Michel', lastName: 'Martinez', email: 'm.martinez@weevup.com', company: 'Weevup', tags: ['Équipe', 'Fondateur'], attending: true, plusOnes: 1, meal: 'Menu Signature (Foie gras, Homard, Bœuf Wagyu, Dessert chocolat)' },
    { firstName: 'Annie', lastName: 'Sanchez', email: 'a.sanchez@weevup.com', company: 'Weevup', tags: ['Équipe', 'CTO'], attending: true, plusOnes: 1, meal: 'Menu Végétarien Gourmet (Légumes bio, Risotto truffe, Soufflé)' },
    { firstName: 'Bernard', lastName: 'Roux', email: 'b.roux@weevup.com', company: 'Weevup', tags: ['Équipe', 'COO'], attending: true, plusOnes: 0, meal: 'Menu Signature (Foie gras, Homard, Bœuf Wagyu, Dessert chocolat)' },
    { firstName: 'Dominique', lastName: 'Simon', email: 'd.simon@alumni.com', company: 'Ex-Weevup', tags: ['Alumni', 'Fondateur historique'], attending: true, plusOnes: 1, meal: 'Menu Mer (Saint-Jacques, Bar de ligne, Turbot, Tarte citron)' },
    { firstName: 'André', lastName: 'Vincent', email: 'a.vincent@alumni.fr', company: 'Ex-Weevup', tags: ['Alumni'], attending: false, plusOnes: 0, meal: null },

    // Presse & Influenceurs
    { firstName: 'Hélène', lastName: 'Dubois', email: 'h.dubois@techmagazine.fr', company: 'Tech Magazine', tags: ['Presse', 'Média'], attending: true, plusOnes: 0, meal: 'Menu Végan Créatif (Tartare légumes, Curry lentilles, Sorbet)' },
    { firstName: 'Christophe', lastName: 'Garnier', email: 'c.garnier@eventnews.com', company: 'Event News', tags: ['Presse', 'Spécialisé'], attending: true, plusOnes: 1, meal: 'Menu Signature (Foie gras, Homard, Bœuf Wagyu, Dessert chocolat)' },
    { firstName: 'Pauline', lastName: 'Leroy', email: 'p.leroy@influencer.fr', company: 'Influenceur Tech', tags: ['Influenceur', 'Digital'], attending: null, plusOnes: 0, meal: null },

    // Prospects & Futurs Clients
    { firstName: 'Stéphane', lastName: 'Garnier', email: 's.garnier@megacorp.com', company: 'MegaCorp International', tags: ['Prospect', 'VIP'], attending: true, plusOnes: 1, meal: 'Menu Signature (Foie gras, Homard, Bœuf Wagyu, Dessert chocolat)' },
    { firstName: 'Audrey', lastName: 'Chevalier', email: 'a.chevalier@futuretech.fr', company: 'FutureTech', tags: ['Prospect'], attending: true, plusOnes: 0, meal: 'Menu Mer (Saint-Jacques, Bar de ligne, Turbot, Tarte citron)' },
    { firstName: 'Julien', lastName: 'Fontaine', email: 'j.fontaine@enterprise.com', company: 'Enterprise Solutions', tags: ['Prospect'], attending: false, plusOnes: 0, meal: null },
    { firstName: 'Caroline', lastName: 'Girard', email: 'c.girard@innovation.fr', company: 'Innovation Labs', tags: ['Prospect'], attending: true, plusOnes: 1, meal: 'Menu Végétarien Gourmet (Légumes bio, Risotto truffe, Soufflé)' }
  ]

  let guestsCreated = 0
  let rsvpsCreated = 0
  let emailsCreated = 0
  let checkinsCreated = 0

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
        tokenExpiry: new Date('2025-06-25'),
        status: status,
        lastEmailAt: status === GuestStatus.RESPONDED ? new Date(Date.now() - Math.random() * 20 * 24 * 60 * 60 * 1000) : new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000)
      }
    })

    guestsCreated++

    // Créer un RSVP si le guest a répondu
    if (guestData.attending !== null) {
      const rsvp = await prisma.rSVP.create({
        data: {
          eventId: event.id,
          guestId: guest.id,
          attending: guestData.attending,
          plusOnes: guestData.plusOnes || 0,
          mealChoice: guestData.meal || null,
          allergies: Math.random() > 0.85 ? ['Fruits à coque', 'Lactose', 'Gluten'][Math.floor(Math.random() * 3)] : null,
          transportNeeds: Math.random() > 0.7 ? 'Navette depuis Montparnasse' : null,
          lodgingNeeds: Math.random() > 0.6 ? 'Hôtel partenaire proche' : null,
          consentPhotos: Math.random() > 0.2
        }
      })
      rsvpsCreated++

      // Créer un check-in pour certains VIP/Équipe (simulation de pré-enregistrement)
      if (guestData.attending && guestData.tags.some(t => ['VIP', 'Équipe', 'Fondateur'].includes(t)) && Math.random() > 0.5) {
        await prisma.checkin.create({
          data: {
            eventId: event.id,
            guestId: guest.id,
            qrCodeId: rsvp.qrCodeId,
            checkedInAt: new Date(event.startsAt.getTime() - 30 * 60 * 1000), // 30 min avant
            desk: 'VIP'
          }
        })
        checkinsCreated++
      }
    }

    // Créer les EmailLogs
    // Save the Date
    await prisma.emailLog.create({
      data: {
        eventId: event.id,
        guestId: guest.id,
        type: EmailType.SAVE_THE_DATE,
        status: EmailStatus.OPENED,
        subject: '📅 Save the Date - 10 ans de Weevup !',
        providerId: `resend_${crypto.randomBytes(16).toString('hex')}`,
        sentAt: new Date('2025-04-01T10:00:00Z'),
        openedAt: new Date('2025-04-01T15:30:00Z'),
        clickedAt: Math.random() > 0.4 ? new Date('2025-04-01T15:35:00Z') : null
      }
    })
    emailsCreated++

    // Invitation
    const invitationStatus = Math.random() > 0.97 ? EmailStatus.BOUNCED : EmailStatus.OPENED
    await prisma.emailLog.create({
      data: {
        eventId: event.id,
        guestId: guest.id,
        type: EmailType.INVITATION,
        status: invitationStatus,
        subject: '🎂 10 ans de Weevup - Vous êtes invité à notre célébration !',
        providerId: `resend_${crypto.randomBytes(16).toString('hex')}`,
        sentAt: new Date('2025-05-01T09:00:00Z'),
        openedAt: invitationStatus === EmailStatus.OPENED ? new Date('2025-05-01T11:20:00Z') : null,
        clickedAt: invitationStatus === EmailStatus.OPENED && Math.random() > 0.3 ? new Date('2025-05-01T11:25:00Z') : null,
        bouncedAt: invitationStatus === EmailStatus.BOUNCED ? new Date('2025-05-01T09:05:00Z') : null
      }
    })
    emailsCreated++

    // Rappel pour ceux qui n'ont pas encore répondu
    if (status === GuestStatus.INVITED) {
      await prisma.emailLog.create({
        data: {
          eventId: event.id,
          guestId: guest.id,
          type: EmailType.REMINDER,
          status: EmailStatus.OPENED,
          subject: '⏰ Plus que 10 jours - Confirmez votre présence à nos 10 ans !',
          providerId: `resend_${crypto.randomBytes(16).toString('hex')}`,
          sentAt: new Date('2025-05-25T14:00:00Z'),
          openedAt: new Date('2025-05-25T16:00:00Z')
        }
      })
      emailsCreated++
    }

    // Confirmation pour ceux qui ont dit oui
    if (guestData.attending === true) {
      await prisma.emailLog.create({
        data: {
          eventId: event.id,
          guestId: guest.id,
          type: EmailType.CONFIRMATION,
          status: EmailStatus.OPENED,
          subject: '✅ C\'est confirmé - Rendez-vous le 20 juin pour nos 10 ans !',
          providerId: `resend_${crypto.randomBytes(16).toString('hex')}`,
          sentAt: new Date('2025-05-10T10:00:00Z'),
          openedAt: new Date('2025-05-10T15:00:00Z'),
          clickedAt: Math.random() > 0.5 ? new Date('2025-05-10T15:05:00Z') : null
        }
      })
      emailsCreated++
    }
  }

  console.log(`✅ ${guestsCreated} invités créés`)
  console.log(`✅ ${rsvpsCreated} RSVPs créés`)
  console.log(`✅ ${emailsCreated} emails envoyés`)
  console.log(`✅ ${checkinsCreated} pré-enregistrements`)
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

  const totalPlusOnes = await prisma.rSVP.aggregate({
    where: { eventId: event.id, attending: true },
    _sum: { plusOnes: true }
  })

  console.log('📊 ========================================')
  console.log('   RÉSUMÉ')
  console.log('   ========================================')
  console.log('')
  console.log(`🎂 ${event.name}`)
  console.log(`📍 ${event.venueName}, ${event.city}`)
  console.log(`📅 ${event.startsAt.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} à ${event.startsAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`)
  console.log('')
  console.log(`👥 INVITÉS:`)
  console.log(`   Total: ${guestsCreated}`)
  console.log(`   ✅ Confirmés: ${attendingCount} (+ ${totalPlusOnes._sum.plusOnes || 0} accompagnants)`)
  console.log(`   ❌ Déclinés: ${notAttendingCount}`)
  console.log(`   ⏳ En attente: ${pendingCount}`)
  console.log('')
  console.log(`📧 EMAILS:`)
  console.log(`   Total envoyés: ${emailsCreated}`)
  console.log(`   Taux d'ouverture: ~95%`)
  console.log(`   Taux de clic: ~60%`)
  console.log('')
  console.log(`🔗 Showcase: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/events/${event.slug}`)
  console.log('')
  console.log('✅ ========================================')
  console.log('   ÉVÉNEMENT CRÉÉ AVEC SUCCÈS !')
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
