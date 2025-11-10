import { PrismaClient, UserRole, GuestStatus, EmailStatus, EmailType, EmailProvider } from '@prisma/client'
import * as crypto from 'crypto'
import bcrypt from 'bcryptjs'

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

  const defaultPassword = await bcrypt.hash('admin123', 10)

  const adminWeevup = await prisma.user.create({
    data: {
      email: 'contact@weevup.com',
      password: defaultPassword,
      name: 'Admin Weevup',
      role: UserRole.ADMIN
    }
  })

  const adminDemo = await prisma.user.create({
    data: {
      email: 'demo@weevup.com',
      password: defaultPassword,
      name: 'Admin Demo',
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
      provider: EmailProvider.RESEND,
      isActive: true,
      isPrimary: true,
      apiKey: 'demo_resend_key_encrypted_for_testing',
      fromEmail: 'noreply@weevup.com',
      fromName: 'Weevup Events',
      replyTo: 'contact@weevup.com',
      webhookUrl: 'https://app.weevup.com/api/webhooks/email/resend',
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
  // 3. TEMPLATES D'EMAIL COMPLETS
  // ====================================
  console.log('📝 Création des templates d\'email...')

  const saveTheDateTemplate = await prisma.emailTemplate.create({
    data: {
      name: 'Save the Date - Standard',
      slug: 'save-the-date-standard',
      description: 'Template standard pour l\'annonce initiale d\'événement',
      type: EmailType.SAVE_THE_DATE,
      subject: '📅 Save the Date - {{event.name}}',
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: {{fontFamily}}; background-color: #f5f5f5; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 8px; overflow: hidden; }
            .header { background: {{primaryColor}}; color: white; padding: 40px 20px; text-align: center; }
            .content { padding: 40px 30px; }
            .footer { background: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #666; }
            .button { display: inline-block; background: {{accentColor}}; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Save the Date!</h1>
              <p style="font-size: 18px; margin-top: 10px;">{{event.name}}</p>
            </div>
            <div class="content">
              <p>Bonjour {{guest.firstName}},</p>
              <p>Nous sommes ravis de vous annoncer <strong>{{event.name}}</strong> qui se tiendra le <strong>{{event.date}}</strong>.</p>
              <p>📍 <strong>Lieu:</strong> {{event.location}}, {{event.city}}</p>
              <p>L'invitation officielle avec tous les détails suivra prochainement.</p>
              <p style="text-align: center;">
                <a href="{{showcaseUrl}}" class="button">En savoir plus</a>
              </p>
            </div>
            <div class="footer">
              <p>Weevup Events © 2025 - Plateforme de gestion d'événements</p>
            </div>
          </div>
        </body>
        </html>
      `,
      textContent: 'Save the Date! {{event.name}} - {{event.date}} à {{event.location}}, {{event.city}}',
      primaryColor: '#004645',
      secondaryColor: '#009197',
      accentColor: '#FF4713',
      fontFamily: 'Arial, sans-serif',
      isDefault: true,
      isActive: true,
      usageCount: 150,
      lastUsedAt: new Date('2025-01-15')
    }
  })

  const invitationTemplate = await prisma.emailTemplate.create({
    data: {
      name: 'Invitation Officielle - Standard',
      slug: 'invitation-standard',
      description: 'Invitation formelle avec détails complets et RSVP',
      type: EmailType.INVITATION,
      subject: '🎟️ Vous êtes invité - {{event.name}}',
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: {{fontFamily}}; background-color: #f5f5f5; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, {{primaryColor}} 0%, {{secondaryColor}} 100%); color: white; padding: 50px 30px; text-align: center; }
            .content { padding: 40px 30px; }
            .info-box { background: #f9f9f9; padding: 20px; border-left: 4px solid {{accentColor}}; margin: 20px 0; }
            .button { display: inline-block; background: {{accentColor}}; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
            .footer { background: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 32px;">{{event.name}}</h1>
              <p style="font-size: 18px; margin-top: 15px; opacity: 0.9;">{{event.date}}</p>
            </div>
            <div class="content">
              <p>Cher(e) {{guest.firstName}} {{guest.lastName}},</p>
              <p>Nous avons le plaisir de vous inviter à participer à <strong>{{event.name}}</strong>.</p>

              <div class="info-box">
                <p style="margin: 0;"><strong>📅 Date:</strong> {{event.date}}</p>
                <p style="margin: 10px 0 0 0;"><strong>📍 Lieu:</strong> {{event.location}}, {{event.address}}, {{event.city}}</p>
                <p style="margin: 10px 0 0 0;"><strong>⏰ Horaires:</strong> {{event.time}}</p>
              </div>

              <p><strong>Merci de confirmer votre présence avant le {{rsvpDeadline}}</strong></p>

              <p style="text-align: center;">
                <a href="{{rsvpLink}}" class="button">Confirmer ma présence</a>
              </p>

              <p style="font-size: 14px; color: #666; margin-top: 30px;">Pour toute question, n'hésitez pas à nous contacter à contact@weevup.com</p>
            </div>
            <div class="footer">
              <p>Weevup Events © 2025</p>
              <p style="margin-top: 10px;"><a href="{{showcaseUrl}}" style="color: {{accentColor}};">Voir le site de l'événement</a></p>
            </div>
          </div>
        </body>
        </html>
      `,
      textContent: 'Vous êtes invité au {{event.name}} le {{event.date}}. Confirmez votre présence: {{rsvpLink}}',
      primaryColor: '#004645',
      secondaryColor: '#009197',
      accentColor: '#FF4713',
      fontFamily: 'Arial, sans-serif',
      isDefault: true,
      isActive: true,
      usageCount: 420,
      lastUsedAt: new Date('2025-02-01')
    }
  })

  const reminderTemplate = await prisma.emailTemplate.create({
    data: {
      name: 'Rappel - Derniers jours RSVP',
      slug: 'reminder-rsvp',
      description: 'Rappel pour les invités qui n\'ont pas encore répondu',
      type: EmailType.REMINDER,
      subject: '⏰ Rappel - Plus que quelques jours pour confirmer - {{event.name}}',
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: {{fontFamily}}; background-color: #f5f5f5; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 8px; overflow: hidden; }
            .header { background: {{accentColor}}; color: white; padding: 30px 20px; text-align: center; }
            .content { padding: 40px 30px; }
            .urgent { background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .button { display: inline-block; background: {{accentColor}}; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
            .footer { background: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">⏰ Derniers jours!</h1>
            </div>
            <div class="content">
              <p>Bonjour {{guest.firstName}},</p>

              <div class="urgent">
                <p style="margin: 0; font-weight: bold;">⚠️ La date limite pour confirmer votre présence au {{event.name}} approche!</p>
              </div>

              <p>Nous n'avons pas encore reçu votre confirmation pour le <strong>{{event.name}}</strong> qui se tiendra le <strong>{{event.date}}</strong>.</p>

              <p>Merci de nous faire part de votre réponse avant le <strong>{{rsvpDeadline}}</strong>.</p>

              <p style="text-align: center;">
                <a href="{{rsvpLink}}" class="button">Confirmer maintenant</a>
              </p>
            </div>
            <div class="footer">
              <p>Weevup Events © 2025</p>
            </div>
          </div>
        </body>
        </html>
      `,
      textContent: 'Rappel: Merci de confirmer votre présence au {{event.name}} avant le {{rsvpDeadline}}. {{rsvpLink}}',
      primaryColor: '#004645',
      secondaryColor: '#009197',
      accentColor: '#FF4713',
      fontFamily: 'Arial, sans-serif',
      isDefault: false,
      isActive: true,
      usageCount: 180,
      lastUsedAt: new Date('2025-02-10')
    }
  })

  const confirmationTemplate = await prisma.emailTemplate.create({
    data: {
      name: 'Confirmation de participation',
      slug: 'confirmation-attendance',
      description: 'Email de confirmation après RSVP positif',
      type: EmailType.CONFIRMATION,
      subject: '✅ Votre participation au {{event.name}} est confirmée!',
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: {{fontFamily}}; background-color: #f5f5f5; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 8px; overflow: hidden; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 40px 20px; text-align: center; }
            .content { padding: 40px 30px; }
            .info-card { background: #f9fafb; padding: 20px; border-radius: 5px; margin: 20px 0; }
            .button { display: inline-block; background: {{accentColor}}; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 10px 5px; }
            .footer { background: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">✅ C'est confirmé!</h1>
              <p style="font-size: 18px; margin-top: 10px; opacity: 0.9;">Votre place est réservée</p>
            </div>
            <div class="content">
              <p>Bonjour {{guest.firstName}},</p>
              <p>Merci d'avoir confirmé votre participation au <strong>{{event.name}}</strong>!</p>

              <div class="info-card">
                <h3 style="margin-top: 0; color: {{primaryColor}};">Récapitulatif</h3>
                <p><strong>📅 Date:</strong> {{event.date}}</p>
                <p><strong>📍 Lieu:</strong> {{event.location}}, {{event.city}}</p>
              </div>

              <p style="text-align: center;">
                <a href="{{showcaseUrl}}" class="button">Voir le programme</a>
              </p>

              <p style="font-size: 14px; color: #666; margin-top: 30px;">À très bientôt!</p>
            </div>
            <div class="footer">
              <p>Weevup Events © 2025</p>
            </div>
          </div>
        </body>
        </html>
      `,
      textContent: 'Votre participation au {{event.name}} est confirmée! Rendez-vous le {{event.date}} à {{event.location}}.',
      primaryColor: '#004645',
      secondaryColor: '#009197',
      accentColor: '#FF4713',
      fontFamily: 'Arial, sans-serif',
      isDefault: false,
      isActive: true,
      usageCount: 320,
      lastUsedAt: new Date('2025-02-05')
    }
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
      description: `Le Tech Summit 2025 est l'événement incontournable de l'innovation technologique en France.

🎯 Au programme :
• 50+ conférences par des experts internationaux
• 20 ateliers techniques hands-on
• Espace exposition avec 100+ startups
• Networking sessions et cocktails
• Remise des Tech Awards 2025`,
      program: `**JOUR 1 - Jeudi 15 Mai 2025**

**08h30 - 09h00** | Accueil et petit-déjeuner
**09h00 - 09h30** | Cérémonie d'ouverture
**09h30 - 10h30** | Keynote : "L'IA Générative"
**11h00 - 12h30** | Sessions parallèles
**12h30 - 14h00** | Déjeuner networking
**14h00 - 15h30** | Ateliers techniques
**16h00 - 17h30** | Table ronde
**19h00 - 22h00** | Cocktail de bienvenue`,
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
      showcaseBannerImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87',
      showcaseTheme: 'weevup',
      showcasePrimaryColor: '#004645',
      showcaseSecondaryColor: '#FF4713',
      showcaseCountdown: true,
      showcaseSocialShare: true,
      showcaseGallery: [
        'https://images.unsplash.com/photo-1540575467063-178a50c2df87',
        'https://images.unsplash.com/photo-1475721027785-f74eccf877e2'
      ],
      showcaseFAQ: [
        {
          question: 'Comment accéder au Palais des Congrès?',
          answer: 'Accessible en métro (ligne 1, station Porte Maillot), RER C ou voiture avec parking.'
        },
        {
          question: 'Le Wi-Fi est-il disponible?',
          answer: 'Oui, Wi-Fi haute vitesse gratuit pour tous les participants.'
        }
      ],
      adminId: adminDemo.id
    }
  })

  console.log(`✅ ${eventTechSummit.name}`)
  console.log(`   📍 ${eventTechSummit.venueName}, ${eventTechSummit.city}`)
  console.log(`   📅 ${eventTechSummit.startsAt.toLocaleDateString('fr-FR')}`)

  // Invités Tech Summit (30 invités)
  const guestsTechSummit = [
    { firstName: 'Sophie', lastName: 'Martin', email: 'sophie.martin@techcorp.com', company: 'TechCorp', tags: ['VIP', 'Speaker'], attending: true, plusOnes: 1, meal: 'Végétarien' },
    { firstName: 'Marc', lastName: 'Dubois', email: 'marc.dubois@startup.com', company: 'StartupLab', tags: ['Sponsor'], attending: true, plusOnes: 0, meal: 'Standard' },
    { firstName: 'Julie', lastName: 'Bernard', email: 'julie.bernard@innovate.com', company: 'InnovateCo', tags: ['Speaker'], attending: true, plusOnes: 0, meal: 'Vegan' },
    { firstName: 'Thomas', lastName: 'Petit', email: 'thomas.petit@dev.com', company: 'DevStudio', tags: ['Participant'], attending: false, plusOnes: 0, meal: null },
    { firstName: 'Marie', lastName: 'Robert', email: 'marie.robert@cloud.com', company: 'CloudSystems', tags: ['VIP'], attending: true, plusOnes: 2, meal: 'Standard' },
    { firstName: 'Pierre', lastName: 'Richard', email: 'pierre.richard@data.com', company: 'DataCorp', tags: ['Participant'], attending: true, plusOnes: 0, meal: 'Végétarien' },
    { firstName: 'Emma', lastName: 'Durand', email: 'emma.durand@ai.com', company: 'AI Ventures', tags: ['Speaker'], attending: true, plusOnes: 1, meal: 'Standard' },
    { firstName: 'Lucas', lastName: 'Moreau', email: 'lucas.moreau@cyber.com', company: 'CyberSec', tags: ['Sponsor'], attending: true, plusOnes: 0, meal: 'Halal' },
    { firstName: 'Chloé', lastName: 'Simon', email: 'chloe.simon@green.com', company: 'GreenTech', tags: ['Participant'], attending: null, plusOnes: 0, meal: null },
    { firstName: 'Antoine', lastName: 'Laurent', email: 'antoine.laurent@block.com', company: 'BlockchainHub', tags: ['VIP'], attending: true, plusOnes: 1, meal: 'Vegan' },
    { firstName: 'Léa', lastName: 'Michel', email: 'lea.michel@design.com', company: 'DesignLab', tags: ['Participant'], attending: true, plusOnes: 0, meal: 'Standard' },
    { firstName: 'Hugo', lastName: 'Garcia', email: 'hugo.garcia@media.com', company: 'MediaTech', tags: ['Press'], attending: true, plusOnes: 1, meal: 'Végétarien' },
    { firstName: 'Camille', lastName: 'Martinez', email: 'camille.martinez@fin.com', company: 'FinTech Pro', tags: ['Sponsor'], attending: true, plusOnes: 0, meal: 'Standard' },
    { firstName: 'Alexandre', lastName: 'Lopez', email: 'alexandre.lopez@iot.com', company: 'IoT Solutions', tags: ['Participant'], attending: false, plusOnes: 0, meal: null },
    { firstName: 'Sarah', lastName: 'Gonzalez', email: 'sarah.gonzalez@quantum.com', company: 'QuantumTech', tags: ['Speaker'], attending: true, plusOnes: 0, meal: 'Kosher' },
    { firstName: 'Maxime', lastName: 'Rodriguez', email: 'maxime.rodriguez@robot.com', company: 'RoboticsCo', tags: ['Participant'], attending: true, plusOnes: 2, meal: 'Standard' },
    { firstName: 'Laura', lastName: 'Hernandez', email: 'laura.hernandez@eco.com', company: 'EcoTech', tags: ['VIP'], attending: null, plusOnes: 0, meal: null },
    { firstName: 'Nicolas', lastName: 'Perez', email: 'nicolas.perez@smart.com', company: 'SmartCity', tags: ['Participant'], attending: true, plusOnes: 0, meal: 'Vegan' },
    { firstName: 'Manon', lastName: 'Sanchez', email: 'manon.sanchez@health.com', company: 'HealthTech', tags: ['Sponsor'], attending: true, plusOnes: 1, meal: 'Standard' },
    { firstName: 'Julien', lastName: 'Ramirez', email: 'julien.ramirez@ed.com', company: 'EdTech Plus', tags: ['Participant'], attending: true, plusOnes: 0, meal: 'Végétarien' },
    { firstName: 'Clara', lastName: 'Torres', email: 'clara.torres@space.com', company: 'SpaceTech', tags: ['Speaker'], attending: true, plusOnes: 0, meal: 'Standard' },
    { firstName: 'Quentin', lastName: 'Flores', email: 'quentin.flores@auto.com', company: 'AutoTech', tags: ['Participant'], attending: false, plusOnes: 0, meal: null },
    { firstName: 'Inès', lastName: 'Rivera', email: 'ines.rivera@bio.com', company: 'BioTech Lab', tags: ['VIP'], attending: true, plusOnes: 1, meal: 'Vegan' },
    { firstName: 'Romain', lastName: 'Gomez', email: 'romain.gomez@nano.com', company: 'NanoTech', tags: ['Participant'], attending: true, plusOnes: 0, meal: 'Standard' },
    { firstName: 'Anaïs', lastName: 'Diaz', email: 'anais.diaz@game.com', company: 'GameDev Studio', tags: ['Participant'], attending: null, plusOnes: 0, meal: null },
    { firstName: 'Vincent', lastName: 'Morales', email: 'vincent.morales@cloud.com', company: 'CloudNative', tags: ['Speaker'], attending: true, plusOnes: 0, meal: 'Standard' },
    { firstName: 'Océane', lastName: 'Jimenez', email: 'oceane.jimenez@ds.com', company: 'DataScience Co', tags: ['Participant'], attending: true, plusOnes: 1, meal: 'Végétarien' },
    { firstName: 'Arthur', lastName: 'Ruiz', email: 'arthur.ruiz@ml.com', company: 'MLOps Inc', tags: ['Sponsor'], attending: true, plusOnes: 0, meal: 'Standard' },
    { firstName: 'Zoé', lastName: 'Alvarez', email: 'zoe.alvarez@web.com', company: 'WebDev Agency', tags: ['Participant'], attending: true, plusOnes: 0, meal: 'Vegan' },
    { firstName: 'Baptiste', lastName: 'Castillo', email: 'baptiste.castillo@mobile.com', company: 'MobileTech', tags: ['Participant'], attending: false, plusOnes: 0, meal: null }
  ]

  let totalGuests = 0
  let totalRsvps = 0
  let totalEmailLogs = 0
  let totalCheckins = 0

  for (const guestData of guestsTechSummit) {
    const token = generateToken()
    const tokenHash = hashToken(token)
    const status = guestData.attending === null ? GuestStatus.INVITED : GuestStatus.RESPONDED

    const guest = await prisma.guest.create({
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
        status: status,
        lastEmailAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
      }
    })
    totalGuests++

    // Créer RSVP si répondu
    if (guestData.attending !== null) {
      const rsvp = await prisma.rSVP.create({
        data: {
          eventId: eventTechSummit.id,
          guestId: guest.id,
          attending: guestData.attending,
          plusOnes: guestData.plusOnes || 0,
          mealChoice: guestData.meal,
          allergies: Math.random() > 0.8 ? 'Fruits à coque' : null,
          consentPhotos: Math.random() > 0.3
        }
      })
      totalRsvps++

      // Créer check-in pour certains invités qui ont dit oui
      if (guestData.attending && Math.random() > 0.5) {
        await prisma.checkin.create({
          data: {
            eventId: eventTechSummit.id,
            guestId: guest.id,
            qrCodeId: rsvp.qrCodeId,
            checkedInAt: new Date(eventTechSummit.startsAt.getTime() - Math.random() * 60 * 60 * 1000),
            desk: ['A', 'B', 'C'][Math.floor(Math.random() * 3)]
          }
        })
        totalCheckins++
      }
    }

    // Créer EmailLogs
    // Save the Date
    await prisma.emailLog.create({
      data: {
        eventId: eventTechSummit.id,
        guestId: guest.id,
        type: EmailType.SAVE_THE_DATE,
        status: EmailStatus.OPENED,
        subject: '📅 Save the Date - Tech Summit 2025',
        providerId: `resend_${crypto.randomBytes(16).toString('hex')}`,
        sentAt: new Date('2025-01-15T10:00:00Z'),
        openedAt: new Date('2025-01-15T14:30:00Z'),
        clickedAt: Math.random() > 0.5 ? new Date('2025-01-15T14:35:00Z') : null
      }
    })
    totalEmailLogs++

    // Invitation
    const invStatus = Math.random() > 0.95 ? EmailStatus.BOUNCED : EmailStatus.OPENED
    await prisma.emailLog.create({
      data: {
        eventId: eventTechSummit.id,
        guestId: guest.id,
        type: EmailType.INVITATION,
        status: invStatus,
        subject: '🎟️ Vous êtes invité au Tech Summit 2025',
        providerId: `resend_${crypto.randomBytes(16).toString('hex')}`,
        sentAt: new Date('2025-02-01T09:00:00Z'),
        openedAt: invStatus === EmailStatus.OPENED ? new Date('2025-02-01T11:20:00Z') : null,
        clickedAt: invStatus === EmailStatus.OPENED && Math.random() > 0.4 ? new Date('2025-02-01T11:25:00Z') : null
      }
    })
    totalEmailLogs++

    // Rappel si pas encore répondu
    if (status === GuestStatus.INVITED) {
      await prisma.emailLog.create({
        data: {
          eventId: eventTechSummit.id,
          guestId: guest.id,
          type: EmailType.REMINDER,
          status: EmailStatus.OPENED,
          subject: '⏰ Rappel - Tech Summit 2025',
          providerId: `resend_${crypto.randomBytes(16).toString('hex')}`,
          sentAt: new Date('2025-02-10T14:00:00Z'),
          openedAt: new Date('2025-02-10T16:00:00Z')
        }
      })
      totalEmailLogs++
    }

    // Confirmation si a dit oui
    if (guestData.attending === true) {
      await prisma.emailLog.create({
        data: {
          eventId: eventTechSummit.id,
          guestId: guest.id,
          type: EmailType.CONFIRMATION,
          status: EmailStatus.OPENED,
          subject: '✅ Confirmation - Tech Summit 2025',
          providerId: `resend_${crypto.randomBytes(16).toString('hex')}`,
          sentAt: new Date('2025-02-05T10:00:00Z'),
          openedAt: new Date('2025-02-05T15:00:00Z')
        }
      })
      totalEmailLogs++
    }
  }

  console.log(`   👥 ${guestsTechSummit.length} invités créés`)
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
      coverImage: 'https://images.unsplash.com/photo-1519167758481-83f29da8c43f',
      description: 'Rejoignez-nous pour célébrer une décennie d\'innovation et de succès !',
      program: `19h00 - Accueil champagne
20h30 - Dîner gastronomique
22h00 - Rétrospective Weevup
22h30 - Soirée DJ
00h30 - Clôture`,
      dressCode: 'Élégant & décontracté',
      rsvpDeadline: new Date('2025-06-10T23:59:59Z'),
      maxPlusOnes: 1,
      allowPlusOnes: true,
      requireMeal: true,
      mealOptions: ['Menu Classique', 'Menu Végétarien', 'Menu Végan'],
      enableTransport: true,
      enableLodging: false,
      enableAccessibility: true,
      enablePhotoConsent: true,
      showcaseEnabled: true,
      showcaseTitle: '10 ans de Weevup',
      showcaseSubtitle: 'Une décennie d\'innovation • 20 Juin 2025',
      showcasePrimaryColor: '#004645',
      showcaseSecondaryColor: '#FF4713',
      adminId: adminWeevup.id
    }
  })

  console.log(`✅ ${eventWeevup.name}`)
  console.log(`   📍 ${eventWeevup.venueName}, ${eventWeevup.city}`)
  console.log(`   📅 ${eventWeevup.startsAt.toLocaleDateString('fr-FR')}`)

  // Invités Weevup (20 invités)
  const guestsWeevup = [
    { firstName: 'François', lastName: 'Legrand', email: 'f.legrand@client1.com', company: 'Client Corp', tags: ['VIP', 'Client'], attending: true, plusOnes: 1, meal: 'Menu Classique' },
    { firstName: 'Isabelle', lastName: 'Moreau', email: 'i.moreau@partner.com', company: 'Partner Inc', tags: ['Partenaire'], attending: true, plusOnes: 1, meal: 'Menu Végétarien' },
    { firstName: 'Laurent', lastName: 'Bernard', email: 'l.bernard@startup.fr', company: 'Startup FR', tags: ['Client'], attending: true, plusOnes: 0, meal: 'Menu Végan' },
    { firstName: 'Caroline', lastName: 'Dupont', email: 'c.dupont@tech.com', company: 'TechCo', tags: ['VIP', 'Presse'], attending: true, plusOnes: 1, meal: 'Menu Classique' },
    { firstName: 'Philippe', lastName: 'Rousseau', email: 'p.rousseau@innovate.fr', company: 'Innovate SA', tags: ['Partenaire'], attending: null, plusOnes: 0, meal: null },
    { firstName: 'Nathalie', lastName: 'Blanc', email: 'n.blanc@digital.com', company: 'Digital Solutions', tags: ['Client'], attending: true, plusOnes: 0, meal: 'Menu Végétarien' },
    { firstName: 'Olivier', lastName: 'Petit', email: 'o.petit@dev.fr', company: 'DevHub', tags: ['VIP'], attending: true, plusOnes: 1, meal: 'Menu Classique' },
    { firstName: 'Sylvie', lastName: 'Martin', email: 's.martin@cloud.com', company: 'CloudTech', tags: ['Client'], attending: false, plusOnes: 0, meal: null },
    { firstName: 'Thierry', lastName: 'Garcia', email: 't.garcia@ai.fr', company: 'AI France', tags: ['Partenaire'], attending: true, plusOnes: 0, meal: 'Menu Végan' },
    { firstName: 'Valérie', lastName: 'Moreau', email: 'v.moreau@media.com', company: 'MediaGroup', tags: ['Presse'], attending: true, plusOnes: 1, meal: 'Menu Classique' },
    { firstName: 'Jean-Marc', lastName: 'Leroy', email: 'jm.leroy@corp.fr', company: 'Corp France', tags: ['VIP', 'Client'], attending: true, plusOnes: 1, meal: 'Menu Classique' },
    { firstName: 'Christine', lastName: 'Dubois', email: 'c.dubois@tech.fr', company: 'TechFR', tags: ['Client'], attending: null, plusOnes: 0, meal: null },
    { firstName: 'Patrick', lastName: 'Roux', email: 'p.roux@startup.com', company: 'StartupHub', tags: ['Partenaire'], attending: true, plusOnes: 0, meal: 'Menu Végétarien' },
    { firstName: 'Monique', lastName: 'Vincent', email: 'm.vincent@digital.fr', company: 'Digital FR', tags: ['Client'], attending: true, plusOnes: 1, meal: 'Menu Classique' },
    { firstName: 'Alain', lastName: 'Chevalier', email: 'a.chevalier@data.com', company: 'DataCorp', tags: ['VIP'], attending: true, plusOnes: 0, meal: 'Menu Végan' },
    { firstName: 'Brigitte', lastName: 'Girard', email: 'b.girard@cloud.fr', company: 'CloudFR', tags: ['Client'], attending: false, plusOnes: 0, meal: null },
    { firstName: 'Daniel', lastName: 'Fontaine', email: 'd.fontaine@cyber.com', company: 'CyberSec', tags: ['Partenaire'], attending: true, plusOnes: 1, meal: 'Menu Classique' },
    { firstName: 'Sandrine', lastName: 'Lopez', email: 's.lopez@fin.fr', company: 'FinTech FR', tags: ['Client'], attending: true, plusOnes: 0, meal: 'Menu Végétarien' },
    { firstName: 'Michel', lastName: 'Martinez', email: 'm.martinez@block.com', company: 'Blockchain Co', tags: ['VIP'], attending: null, plusOnes: 0, meal: null },
    { firstName: 'Annie', lastName: 'Sanchez', email: 'a.sanchez@health.fr', company: 'HealthTech', tags: ['Partenaire'], attending: true, plusOnes: 1, meal: 'Menu Classique' }
  ]

  for (const guestData of guestsWeevup) {
    const token = generateToken()
    const tokenHash = hashToken(token)
    const status = guestData.attending === null ? GuestStatus.INVITED : GuestStatus.RESPONDED

    const guest = await prisma.guest.create({
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
        status: status
      }
    })
    totalGuests++

    if (guestData.attending !== null) {
      await prisma.rSVP.create({
        data: {
          eventId: eventWeevup.id,
          guestId: guest.id,
          attending: guestData.attending,
          plusOnes: guestData.plusOnes || 0,
          mealChoice: guestData.meal,
          consentPhotos: true
        }
      })
      totalRsvps++
    }

    // EmailLogs
    await prisma.emailLog.create({
      data: {
        eventId: eventWeevup.id,
        guestId: guest.id,
        type: EmailType.SAVE_THE_DATE,
        status: EmailStatus.OPENED,
        subject: '📅 Save the Date - 10 ans de Weevup',
        providerId: `resend_${crypto.randomBytes(16).toString('hex')}`,
        sentAt: new Date('2025-05-01T10:00:00Z'),
        openedAt: new Date('2025-05-01T15:00:00Z')
      }
    })
    totalEmailLogs++

    await prisma.emailLog.create({
      data: {
        eventId: eventWeevup.id,
        guestId: guest.id,
        type: EmailType.INVITATION,
        status: EmailStatus.OPENED,
        subject: '🎉 10 ans de Weevup - Vous êtes invité',
        providerId: `resend_${crypto.randomBytes(16).toString('hex')}`,
        sentAt: new Date('2025-05-15T10:00:00Z'),
        openedAt: new Date('2025-05-15T16:00:00Z'),
        clickedAt: Math.random() > 0.5 ? new Date('2025-05-15T16:05:00Z') : null
      }
    })
    totalEmailLogs++
  }

  console.log(`   👥 ${guestsWeevup.length} invités créés`)
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
      description: 'Julie et Thomas ont le plaisir de vous inviter à célébrer leur union.',
      program: `15h00 - Cérémonie laïque
16h30 - Cocktail & vin d'honneur
19h30 - Dîner de gala
22h00 - Ouverture du bal
00h00 - Soirée dansante`,
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

  // Invités Mariage (24 invités)
  const guestsWedding = [
    { firstName: 'Pierre', lastName: 'Martin', email: 'pierre.martin@email.com', tags: ['Famille', 'Parents', 'Côté mariée'], attending: true, plusOnes: 1, meal: 'Menu Adulte' },
    { firstName: 'Claire', lastName: 'Martin', email: 'claire.martin@email.com', tags: ['Famille', 'Parents', 'Côté mariée'], attending: true, plusOnes: 0, meal: 'Menu Végétarien' },
    { firstName: 'Émilie', lastName: 'Martin', email: 'emilie.martin@email.com', tags: ['Famille', 'Sœur', 'Témoin'], attending: true, plusOnes: 1, meal: 'Menu Adulte' },
    { firstName: 'Luc', lastName: 'Dubois', email: 'luc.dubois@email.com', tags: ['Famille', 'Parents', 'Côté marié'], attending: true, plusOnes: 1, meal: 'Menu Adulte' },
    { firstName: 'Anne', lastName: 'Dubois', email: 'anne.dubois@email.com', tags: ['Famille', 'Parents', 'Côté marié'], attending: true, plusOnes: 0, meal: 'Menu Adulte' },
    { firstName: 'Maxime', lastName: 'Dubois', email: 'maxime.dubois@email.com', tags: ['Famille', 'Frère', 'Témoin'], attending: true, plusOnes: 1, meal: 'Menu Adulte' },
    { firstName: 'Sophie', lastName: 'Leclerc', email: 'sophie.leclerc@email.com', tags: ['Amis', 'Témoin'], attending: true, plusOnes: 1, meal: 'Menu Végétarien' },
    { firstName: 'Antoine', lastName: 'Bernard', email: 'antoine.bernard@email.com', tags: ['Amis', 'Témoin'], attending: true, plusOnes: 1, meal: 'Menu Adulte' },
    { firstName: 'Chloé', lastName: 'Rousseau', email: 'chloe.rousseau@email.com', tags: ['Amis', 'Université'], attending: true, plusOnes: 1, meal: 'Menu Adulte' },
    { firstName: 'Lucas', lastName: 'Moreau', email: 'lucas.moreau@email.com', tags: ['Amis', 'Enfance'], attending: true, plusOnes: 1, meal: 'Menu Adulte' },
    { firstName: 'Laura', lastName: 'Girard', email: 'laura.girard@email.com', tags: ['Amis', 'Travail'], attending: null, plusOnes: 0, meal: null },
    { firstName: 'Hugo', lastName: 'Laurent', email: 'hugo.laurent@email.com', tags: ['Amis', 'Université'], attending: true, plusOnes: 0, meal: 'Menu Adulte' },
    { firstName: 'Emma', lastName: 'Fontaine', email: 'emma.fontaine@email.com', tags: ['Amis', 'Enfance'], attending: true, plusOnes: 1, meal: 'Menu Adulte' },
    { firstName: 'Nicolas', lastName: 'Simon', email: 'nicolas.simon@email.com', tags: ['Amis', 'Travail'], attending: null, plusOnes: 0, meal: null },
    { firstName: 'Léa', lastName: 'Morel', email: 'lea.morel@email.com', tags: ['Amis', 'Université'], attending: false, plusOnes: 0, meal: null },
    { firstName: 'Julien', lastName: 'Garcia', email: 'julien.garcia@email.com', tags: ['Amis', 'Sport'], attending: true, plusOnes: 1, meal: 'Menu Adulte' },
    { firstName: 'Mathilde', lastName: 'Blanc', email: 'mathilde.blanc@email.com', tags: ['Amis', 'Couple'], attending: true, plusOnes: 1, meal: 'Menu Végétarien' },
    { firstName: 'Alexandre', lastName: 'Blanc', email: 'alexandre.blanc@email.com', tags: ['Amis', 'Couple'], attending: true, plusOnes: 0, meal: 'Menu Adulte' },
    { firstName: 'Sarah', lastName: 'Petit', email: 'sarah.petit@email.com', tags: ['Amis', 'Voisins'], attending: true, plusOnes: 1, meal: 'Menu Adulte' },
    { firstName: 'Vincent', lastName: 'Roux', email: 'vincent.roux@email.com', tags: ['Amis', 'Voyage'], attending: false, plusOnes: 0, meal: null },
    { firstName: 'Anaïs', lastName: 'Chevalier', email: 'anais.chevalier@email.com', tags: ['Amis', 'Danse'], attending: null, plusOnes: 0, meal: null },
    { firstName: 'Camille', lastName: 'Dubois', email: 'camille.dubois@email.com', tags: ['Famille', 'Sœur'], attending: true, plusOnes: 0, meal: 'Menu Végétarien' },
    { firstName: 'Julien', lastName: 'Mercier', email: 'julien.mercier@email.com', tags: ['Famille', 'Grands-parents'], attending: true, plusOnes: 1, meal: 'Menu Adulte' },
    { firstName: 'Marie', lastName: 'Mercier', email: 'marie.mercier@email.com', tags: ['Famille', 'Grands-parents'], attending: true, plusOnes: 0, meal: 'Menu Adulte' }
  ]

  for (const guestData of guestsWedding) {
    const token = generateToken()
    const tokenHash = hashToken(token)
    const status = guestData.attending === null ? GuestStatus.INVITED : GuestStatus.RESPONDED

    const guest = await prisma.guest.create({
      data: {
        eventId: eventWedding.id,
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
    totalGuests++

    if (guestData.attending !== null) {
      await prisma.rSVP.create({
        data: {
          eventId: eventWedding.id,
          guestId: guest.id,
          attending: guestData.attending,
          plusOnes: guestData.plusOnes || 0,
          mealChoice: guestData.meal,
          consentPhotos: Math.random() > 0.2
        }
      })
      totalRsvps++
    }

    // EmailLogs
    await prisma.emailLog.create({
      data: {
        eventId: eventWedding.id,
        guestId: guest.id,
        type: EmailType.SAVE_THE_DATE,
        status: EmailStatus.OPENED,
        subject: '💍 Save the Date - Mariage Julie & Thomas',
        providerId: `resend_${crypto.randomBytes(16).toString('hex')}`,
        sentAt: new Date('2025-04-01T10:00:00Z'),
        openedAt: new Date('2025-04-01T15:00:00Z')
      }
    })
    totalEmailLogs++

    await prisma.emailLog.create({
      data: {
        eventId: eventWedding.id,
        guestId: guest.id,
        type: EmailType.INVITATION,
        status: EmailStatus.OPENED,
        subject: '💝 Invitation - Mariage Julie & Thomas',
        providerId: `resend_${crypto.randomBytes(16).toString('hex')}`,
        sentAt: new Date('2025-05-01T10:00:00Z'),
        openedAt: new Date('2025-05-01T14:00:00Z'),
        clickedAt: Math.random() > 0.3 ? new Date('2025-05-01T14:05:00Z') : null
      }
    })
    totalEmailLogs++

    if (guestData.attending === true) {
      await prisma.emailLog.create({
        data: {
          eventId: eventWedding.id,
          guestId: guest.id,
          type: EmailType.CONFIRMATION,
          status: EmailStatus.OPENED,
          subject: '✅ Confirmation - Mariage Julie & Thomas',
          providerId: `resend_${crypto.randomBytes(16).toString('hex')}`,
          sentAt: new Date('2025-05-10T10:00:00Z'),
          openedAt: new Date('2025-05-10T12:00:00Z')
        }
      })
      totalEmailLogs++
    }
  }

  console.log(`   👥 ${guestsWedding.length} invités créés`)
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
      description: 'Soirée de gala au profit de l\'association "Enfants du Monde".',
      program: `19h00 - Accueil & tapis rouge
19h30 - Cocktail dînatoire
21h00 - Dîner de gala
22h00 - Vente aux enchères
23h00 - Concert privé`,
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
      showcaseSubtitle: 'Enfants du Monde • 25 Septembre 2025',
      showcasePrimaryColor: '#1e3a8a',
      showcaseSecondaryColor: '#3b82f6',
      adminId: adminDemo.id
    }
  })

  console.log(`✅ ${eventGala.name}`)
  console.log(`   📍 ${eventGala.venueName}, ${eventGala.city}`)
  console.log(`   📅 ${eventGala.startsAt.toLocaleDateString('fr-FR')}`)

  // Invités Gala (15 invités)
  const guestsGala = [
    { firstName: 'François', lastName: 'Legrand', email: 'f.legrand@vip.com', company: 'LuxeCorp', tags: ['VIP', 'Donateur'], attending: true, plusOnes: 1, meal: 'Menu Prestige' },
    { firstName: 'Isabelle', lastName: 'Moreau', email: 'i.moreau@foundation.org', company: 'Foundation', tags: ['Partenaire'], attending: true, plusOnes: 1, meal: 'Menu Végétarien' },
    { firstName: 'Laurent', lastName: 'Bernard', email: 'l.bernard@media.fr', company: 'MediaGroup', tags: ['Presse'], attending: true, plusOnes: 0, meal: 'Menu Prestige' },
    { firstName: 'Catherine', lastName: 'Dupont', email: 'c.dupont@luxury.com', company: 'Luxury Brand', tags: ['VIP', 'Sponsor'], attending: true, plusOnes: 1, meal: 'Menu Prestige' },
    { firstName: 'Jacques', lastName: 'Martin', email: 'j.martin@corp.fr', company: 'Corp International', tags: ['Donateur'], attending: null, plusOnes: 0, meal: null },
    { firstName: 'Véronique', lastName: 'Petit', email: 'v.petit@charity.org', company: 'Charity Org', tags: ['Association'], attending: true, plusOnes: 0, meal: 'Menu Végétarien' },
    { firstName: 'Henri', lastName: 'Rousseau', email: 'h.rousseau@bank.com', company: 'Private Bank', tags: ['VIP', 'Donateur'], attending: true, plusOnes: 1, meal: 'Menu Prestige' },
    { firstName: 'Sophie', lastName: 'Blanc', email: 's.blanc@fashion.fr', company: 'Fashion House', tags: ['Sponsor'], attending: true, plusOnes: 1, meal: 'Menu Végan' },
    { firstName: 'Christophe', lastName: 'Garcia', email: 'c.garcia@art.com', company: 'Art Gallery', tags: ['Partenaire'], attending: false, plusOnes: 0, meal: null },
    { firstName: 'Martine', lastName: 'Lopez', email: 'm.lopez@hotel.fr', company: 'Hotel Group', tags: ['VIP'], attending: true, plusOnes: 1, meal: 'Menu Prestige' },
    { firstName: 'Gérard', lastName: 'Moreau', email: 'g.moreau@finance.com', company: 'Finance Corp', tags: ['Donateur'], attending: true, plusOnes: 0, meal: 'Menu Prestige' },
    { firstName: 'Hélène', lastName: 'Dubois', email: 'h.dubois@ngo.org', company: 'NGO International', tags: ['Association'], attending: null, plusOnes: 0, meal: null },
    { firstName: 'Bernard', lastName: 'Roux', email: 'b.roux@invest.fr', company: 'Investment Fund', tags: ['VIP', 'Donateur'], attending: true, plusOnes: 1, meal: 'Menu Prestige' },
    { firstName: 'Dominique', lastName: 'Simon', email: 'd.simon@luxury.fr', company: 'Luxury Goods', tags: ['Sponsor'], attending: true, plusOnes: 1, meal: 'Menu Végétarien' },
    { firstName: 'André', lastName: 'Vincent', email: 'a.vincent@wine.com', company: 'Wine Estate', tags: ['Partenaire'], attending: true, plusOnes: 0, meal: 'Menu Prestige' }
  ]

  for (const guestData of guestsGala) {
    const token = generateToken()
    const tokenHash = hashToken(token)
    const status = guestData.attending === null ? GuestStatus.INVITED : GuestStatus.RESPONDED

    const guest = await prisma.guest.create({
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
        status: status
      }
    })
    totalGuests++

    if (guestData.attending !== null) {
      await prisma.rSVP.create({
        data: {
          eventId: eventGala.id,
          guestId: guest.id,
          attending: guestData.attending,
          plusOnes: guestData.plusOnes || 0,
          mealChoice: guestData.meal,
          consentPhotos: true
        }
      })
      totalRsvps++
    }

    // EmailLogs
    await prisma.emailLog.create({
      data: {
        eventId: eventGala.id,
        guestId: guest.id,
        type: EmailType.INVITATION,
        status: EmailStatus.OPENED,
        subject: '🎭 Gala de Charité - Invitation',
        providerId: `resend_${crypto.randomBytes(16).toString('hex')}`,
        sentAt: new Date('2025-08-01T10:00:00Z'),
        openedAt: new Date('2025-08-01T14:00:00Z'),
        clickedAt: Math.random() > 0.4 ? new Date('2025-08-01T14:05:00Z') : null
      }
    })
    totalEmailLogs++
  }

  console.log(`   👥 ${guestsGala.length} invités créés`)
  console.log('')

  // ====================================
  // 8. ÉVÉNEMENT 5: WORKSHOP LEADERSHIP
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
      description: 'Workshop intensif sur le leadership à l\'ère digitale.',
      program: `09h00 - Accueil & petit-déjeuner
09h30 - Introduction
10h30 - Atelier Communication
12h00 - Déjeuner
13h30 - Atelier Gestion du changement
15h30 - Atelier Intelligence émotionnelle
17h00 - Clôture`,
      dressCode: 'Business casual',
      rsvpDeadline: new Date('2025-04-03T23:59:59Z'),
      maxPlusOnes: 0,
      allowPlusOnes: false,
      requireMeal: true,
      mealOptions: ['Standard', 'Végétarien', 'Vegan'],
      enableTransport: false,
      enableLodging: false,
      enableAccessibility: true,
      enablePhotoConsent: true,
      showcaseEnabled: true,
      showcaseTitle: 'Workshop Leadership',
      showcaseSubtitle: '10 Avril 2025 • Station F',
      showcasePrimaryColor: '#059669',
      showcaseSecondaryColor: '#10b981',
      adminId: adminDemo.id
    }
  })

  console.log(`✅ ${eventWorkshop.name}`)
  console.log(`   📍 ${eventWorkshop.venueName}, ${eventWorkshop.city}`)
  console.log(`   📅 ${eventWorkshop.startsAt.toLocaleDateString('fr-FR')}`)

  // Invités Workshop (18 invités)
  const guestsWorkshop = [
    { firstName: 'Maxime', lastName: 'Roussel', email: 'maxime.r@techstart.com', company: 'TechStart', tags: ['Manager'], attending: true, plusOnes: 0, meal: 'Standard' },
    { firstName: 'Laura', lastName: 'Vincent', email: 'laura.v@innohub.com', company: 'InnoHub', tags: ['CEO'], attending: true, plusOnes: 0, meal: 'Végétarien' },
    { firstName: 'David', lastName: 'Morel', email: 'david.m@datacorp.com', company: 'DataCorp', tags: ['CTO'], attending: true, plusOnes: 0, meal: 'Standard' },
    { firstName: 'Pauline', lastName: 'Leroy', email: 'pauline.l@startup.fr', company: 'Startup FR', tags: ['Founder'], attending: null, plusOnes: 0, meal: null },
    { firstName: 'Stéphane', lastName: 'Garnier', email: 'stephane.g@digital.com', company: 'Digital Co', tags: ['Director'], attending: true, plusOnes: 0, meal: 'Vegan' },
    { firstName: 'Audrey', lastName: 'Chevalier', email: 'audrey.c@cloud.fr', company: 'CloudFR', tags: ['Manager'], attending: true, plusOnes: 0, meal: 'Standard' },
    { firstName: 'Julien', lastName: 'Fontaine', email: 'julien.f@ai.com', company: 'AI Solutions', tags: ['VP Engineering'], attending: false, plusOnes: 0, meal: null },
    { firstName: 'Caroline', lastName: 'Girard', email: 'caroline.g@tech.fr', company: 'TechFR', tags: ['COO'], attending: true, plusOnes: 0, meal: 'Végétarien' },
    { firstName: 'Olivier', lastName: 'Lopez', email: 'olivier.l@dev.com', company: 'DevCo', tags: ['CTO'], attending: true, plusOnes: 0, meal: 'Standard' },
    { firstName: 'Nathalie', lastName: 'Roux', email: 'nathalie.r@fin.fr', company: 'FinTech', tags: ['CFO'], attending: null, plusOnes: 0, meal: null },
    { firstName: 'Thomas', lastName: 'Bernard', email: 'thomas.b@media.com', company: 'MediaTech', tags: ['Manager'], attending: true, plusOnes: 0, meal: 'Standard' },
    { firstName: 'Isabelle', lastName: 'Blanc', email: 'isabelle.b@cyber.fr', company: 'CyberSec', tags: ['Director'], attending: true, plusOnes: 0, meal: 'Vegan' },
    { firstName: 'Marc', lastName: 'Dupont', email: 'marc.d@block.com', company: 'Blockchain', tags: ['CEO'], attending: true, plusOnes: 0, meal: 'Standard' },
    { firstName: 'Sandrine', lastName: 'Martin', email: 'sandrine.m@health.fr', company: 'HealthTech', tags: ['VP Product'], attending: false, plusOnes: 0, meal: null },
    { firstName: 'Philippe', lastName: 'Garcia', email: 'philippe.g@auto.com', company: 'AutoTech', tags: ['Manager'], attending: true, plusOnes: 0, meal: 'Végétarien' },
    { firstName: 'Valérie', lastName: 'Moreau', email: 'valerie.m@green.fr', company: 'GreenTech', tags: ['Founder'], attending: true, plusOnes: 0, meal: 'Vegan' },
    { firstName: 'Christophe', lastName: 'Petit', email: 'christophe.p@iot.com', company: 'IoT Corp', tags: ['CTO'], attending: true, plusOnes: 0, meal: 'Standard' },
    { firstName: 'Sylvie', lastName: 'Simon', email: 'sylvie.s@space.fr', company: 'SpaceTech', tags: ['Director'], attending: null, plusOnes: 0, meal: null }
  ]

  for (const guestData of guestsWorkshop) {
    const token = generateToken()
    const tokenHash = hashToken(token)
    const status = guestData.attending === null ? GuestStatus.INVITED : GuestStatus.RESPONDED

    const guest = await prisma.guest.create({
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
        status: status
      }
    })
    totalGuests++

    if (guestData.attending !== null) {
      await prisma.rSVP.create({
        data: {
          eventId: eventWorkshop.id,
          guestId: guest.id,
          attending: guestData.attending,
          plusOnes: 0,
          mealChoice: guestData.meal,
          consentPhotos: true
        }
      })
      totalRsvps++
    }

    // EmailLogs
    await prisma.emailLog.create({
      data: {
        eventId: eventWorkshop.id,
        guestId: guest.id,
        type: EmailType.INVITATION,
        status: EmailStatus.OPENED,
        subject: '📚 Workshop Leadership - Inscription',
        providerId: `resend_${crypto.randomBytes(16).toString('hex')}`,
        sentAt: new Date('2025-03-01T10:00:00Z'),
        openedAt: new Date('2025-03-01T11:00:00Z'),
        clickedAt: Math.random() > 0.3 ? new Date('2025-03-01T11:05:00Z') : null
      }
    })
    totalEmailLogs++

    if (status === GuestStatus.INVITED) {
      await prisma.emailLog.create({
        data: {
          eventId: eventWorkshop.id,
          guestId: guest.id,
          type: EmailType.REMINDER,
          status: EmailStatus.DELIVERED,
          subject: '⏰ Rappel - Workshop Leadership',
          providerId: `resend_${crypto.randomBytes(16).toString('hex')}`,
          sentAt: new Date('2025-03-25T10:00:00Z')
        }
      })
      totalEmailLogs++
    }
  }

  console.log(`   👥 ${guestsWorkshop.length} invités créés`)
  console.log('')

  // ====================================
  // 10. STATISTIQUES FINALES
  // ====================================
  console.log('📊 ========================================')
  console.log('   RÉSUMÉ DE LA GÉNÉRATION COMPLÈTE')
  console.log('   ========================================')
  console.log('')

  console.log('📊 Totaux:')
  console.log(`   👤 ${await prisma.user.count()} utilisateurs`)
  console.log(`   🎉 ${await prisma.event.count()} événements`)
  console.log(`   👥 ${totalGuests} invités`)
  console.log(`   📝 ${totalRsvps} RSVPs`)
  console.log(`   📧 ${totalEmailLogs} emails envoyés`)
  console.log(`   🎟️ ${totalCheckins} check-ins`)
  console.log(`   📝 ${await prisma.emailTemplate.count()} templates`)
  console.log(`   🔌 ${await prisma.emailIntegration.count()} intégration email`)
  console.log('')

  const events = await prisma.event.findMany({
    include: {
      _count: {
        select: {
          guests: true,
          rsvps: true
        }
      }
    },
    orderBy: {
      startsAt: 'asc'
    }
  })

  console.log('🎉 Événements créés:')
  for (const event of events) {
    const attending = await prisma.rSVP.count({
      where: { eventId: event.id, attending: true }
    })
    console.log('')
    console.log(`   ${event.name}`)
    console.log(`   📍 ${event.venueName}, ${event.city}`)
    console.log(`   📅 ${event.startsAt.toLocaleDateString('fr-FR')}`)
    console.log(`   👥 ${event._count.guests} invités • ✅ ${attending} confirmés • 📧 ${event._count.rsvps} réponses`)
    console.log(`   🔗 /events/${event.slug}`)
  }
  console.log('')

  console.log('✅ ========================================')
  console.log('   GÉNÉRATION COMPLÈTE TERMINÉE !')
  console.log('   ========================================')
  console.log('')
  console.log('🚀 Prochaines étapes:')
  console.log('   1. Démarrer le serveur: npm run dev')
  console.log('   2. Accéder au dashboard: http://localhost:3000/admin')
  console.log('   3. Tester les showcases des événements')
  console.log('   4. Vérifier les statistiques et le tracking email')
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
