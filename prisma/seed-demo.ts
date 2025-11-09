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

// Données de démonstration réalistes
const demoGuests = [
  { firstName: 'Sophie', lastName: 'Martin', email: 'sophie.martin@example.com', company: 'TechCorp', tags: ['VIP', 'Speaker'], attending: true, plusOnes: 1, meal: 'Végétarien', allergies: 'Fruits à coque' },
  { firstName: 'Marc', lastName: 'Dubois', email: 'marc.dubois@example.com', company: 'StartupLab', tags: ['Sponsor'], attending: true, plusOnes: 0, meal: 'Standard', allergies: null },
  { firstName: 'Julie', lastName: 'Bernard', email: 'julie.bernard@example.com', company: 'InnovateCo', tags: ['Speaker'], attending: true, plusOnes: 0, meal: 'Vegan', allergies: null },
  { firstName: 'Thomas', lastName: 'Petit', email: 'thomas.petit@example.com', company: 'DevStudio', tags: ['Participant'], attending: false, plusOnes: 0, meal: null, allergies: null },
  { firstName: 'Marie', lastName: 'Robert', email: 'marie.robert@example.com', company: 'CloudSystems', tags: ['VIP'], attending: true, plusOnes: 2, meal: 'Standard', allergies: 'Lactose' },
  { firstName: 'Pierre', lastName: 'Richard', email: 'pierre.richard@example.com', company: 'DataCorp', tags: ['Participant'], attending: true, plusOnes: 0, meal: 'Végétarien', allergies: null },
  { firstName: 'Emma', lastName: 'Durand', email: 'emma.durand@example.com', company: 'AI Ventures', tags: ['Speaker'], attending: true, plusOnes: 1, meal: 'Standard', allergies: null },
  { firstName: 'Lucas', lastName: 'Moreau', email: 'lucas.moreau@example.com', company: 'CyberSec', tags: ['Sponsor'], attending: true, plusOnes: 0, meal: 'Halal', allergies: null },
  { firstName: 'Chloé', lastName: 'Simon', email: 'chloe.simon@example.com', company: 'GreenTech', tags: ['Participant'], attending: null, plusOnes: 0, meal: null, allergies: null },
  { firstName: 'Antoine', lastName: 'Laurent', email: 'antoine.laurent@example.com', company: 'BlockchainHub', tags: ['VIP'], attending: true, plusOnes: 1, meal: 'Vegan', allergies: null },
  { firstName: 'Léa', lastName: 'Michel', email: 'lea.michel@example.com', company: 'DesignLab', tags: ['Participant'], attending: true, plusOnes: 0, meal: 'Standard', allergies: null },
  { firstName: 'Hugo', lastName: 'Garcia', email: 'hugo.garcia@example.com', company: 'MediaTech', tags: ['Press'], attending: true, plusOnes: 1, meal: 'Végétarien', allergies: 'Gluten' },
  { firstName: 'Camille', lastName: 'Martinez', email: 'camille.martinez@example.com', company: 'FinTech Pro', tags: ['Sponsor'], attending: true, plusOnes: 0, meal: 'Standard', allergies: null },
  { firstName: 'Alexandre', lastName: 'Lopez', email: 'alexandre.lopez@example.com', company: 'IoT Solutions', tags: ['Participant'], attending: false, plusOnes: 0, meal: null, allergies: null },
  { firstName: 'Sarah', lastName: 'Gonzalez', email: 'sarah.gonzalez@example.com', company: 'QuantumTech', tags: ['Speaker'], attending: true, plusOnes: 0, meal: 'Kosher', allergies: null },
  { firstName: 'Maxime', lastName: 'Rodriguez', email: 'maxime.rodriguez@example.com', company: 'RoboticsCo', tags: ['Participant'], attending: true, plusOnes: 2, meal: 'Standard', allergies: null },
  { firstName: 'Laura', lastName: 'Hernandez', email: 'laura.hernandez@example.com', company: 'EcoTech', tags: ['VIP'], attending: null, plusOnes: 0, meal: null, allergies: null },
  { firstName: 'Nicolas', lastName: 'Perez', email: 'nicolas.perez@example.com', company: 'SmartCity', tags: ['Participant'], attending: true, plusOnes: 0, meal: 'Vegan', allergies: null },
  { firstName: 'Manon', lastName: 'Sanchez', email: 'manon.sanchez@example.com', company: 'HealthTech', tags: ['Sponsor'], attending: true, plusOnes: 1, meal: 'Standard', allergies: 'Fruits de mer' },
  { firstName: 'Julien', lastName: 'Ramirez', email: 'julien.ramirez@example.com', company: 'EdTech Plus', tags: ['Participant'], attending: true, plusOnes: 0, meal: 'Végétarien', allergies: null },
  { firstName: 'Clara', lastName: 'Torres', email: 'clara.torres@example.com', company: 'SpaceTech', tags: ['Speaker'], attending: true, plusOnes: 0, meal: 'Standard', allergies: null },
  { firstName: 'Quentin', lastName: 'Flores', email: 'quentin.flores@example.com', company: 'AutoTech', tags: ['Participant'], attending: false, plusOnes: 0, meal: null, allergies: null },
  { firstName: 'Inès', lastName: 'Rivera', email: 'ines.rivera@example.com', company: 'BioTech Lab', tags: ['VIP'], attending: true, plusOnes: 1, meal: 'Vegan', allergies: null },
  { firstName: 'Romain', lastName: 'Gomez', email: 'romain.gomez@example.com', company: 'NanoTech', tags: ['Participant'], attending: true, plusOnes: 0, meal: 'Standard', allergies: null },
  { firstName: 'Anaïs', lastName: 'Diaz', email: 'anais.diaz@example.com', company: 'GameDev Studio', tags: ['Participant'], attending: null, plusOnes: 0, meal: null, allergies: null },
  { firstName: 'Vincent', lastName: 'Morales', email: 'vincent.morales@example.com', company: 'CloudNative', tags: ['Speaker'], attending: true, plusOnes: 0, meal: 'Standard', allergies: null },
  { firstName: 'Océane', lastName: 'Jimenez', email: 'oceane.jimenez@example.com', company: 'DataScience Co', tags: ['Participant'], attending: true, plusOnes: 1, meal: 'Végétarien', allergies: null },
  { firstName: 'Arthur', lastName: 'Ruiz', email: 'arthur.ruiz@example.com', company: 'MLOps Inc', tags: ['Sponsor'], attending: true, plusOnes: 0, meal: 'Standard', allergies: null },
  { firstName: 'Zoé', lastName: 'Alvarez', email: 'zoe.alvarez@example.com', company: 'WebDev Agency', tags: ['Participant'], attending: true, plusOnes: 0, meal: 'Vegan', allergies: 'Soja' },
  { firstName: 'Baptiste', lastName: 'Castillo', email: 'baptiste.castillo@example.com', company: 'MobileTech', tags: ['Participant'], attending: false, plusOnes: 0, meal: null, allergies: null },
  { firstName: 'Mathilde', lastName: 'Ortiz', email: 'mathilde.ortiz@example.com', company: 'AR/VR Studios', tags: ['VIP'], attending: true, plusOnes: 2, meal: 'Standard', allergies: null },
  { firstName: 'Gabriel', lastName: 'Navarro', email: 'gabriel.navarro@example.com', company: '3D Printing Co', tags: ['Participant'], attending: true, plusOnes: 0, meal: 'Végétarien', allergies: null },
  { firstName: 'Lucie', lastName: 'Vargas', email: 'lucie.vargas@example.com', company: 'SaaS Platform', tags: ['Speaker'], attending: null, plusOnes: 0, meal: null, allergies: null },
  { firstName: 'Tom', lastName: 'Cruz', email: 'tom.cruz@example.com', company: 'DevOps Pro', tags: ['Participant'], attending: true, plusOnes: 0, meal: 'Standard', allergies: null },
  { firstName: 'Elise', lastName: 'Reyes', email: 'elise.reyes@example.com', company: 'UX Design Lab', tags: ['Participant'], attending: true, plusOnes: 1, meal: 'Vegan', allergies: null },
  { firstName: 'Louis', lastName: 'Moreno', email: 'louis.moreno@example.com', company: 'API Gateway', tags: ['Sponsor'], attending: true, plusOnes: 0, meal: 'Standard', allergies: null },
  { firstName: 'Jade', lastName: 'Romero', email: 'jade.romero@example.com', company: 'NetworkSec', tags: ['Participant'], attending: true, plusOnes: 0, meal: 'Végétarien', allergies: null },
  { firstName: 'Nathan', lastName: 'Gutierrez', email: 'nathan.gutierrez@example.com', company: 'Container Tech', tags: ['VIP'], attending: false, plusOnes: 0, meal: null, allergies: null },
  { firstName: 'Lola', lastName: 'Aguilar', email: 'lola.aguilar@example.com', company: 'Serverless Inc', tags: ['Participant'], attending: true, plusOnes: 0, meal: 'Standard', allergies: null },
  { firstName: 'Enzo', lastName: 'Medina', email: 'enzo.medina@example.com', company: 'Microservices Co', tags: ['Speaker'], attending: true, plusOnes: 1, meal: 'Standard', allergies: null },
  { firstName: 'Mila', lastName: 'Ortega', email: 'mila.ortega@example.com', company: 'EventMesh', tags: ['Participant'], attending: null, plusOnes: 0, meal: null, allergies: null },
  { firstName: 'Adam', lastName: 'Castro', email: 'adam.castro@example.com', company: 'GraphQL Hub', tags: ['Participant'], attending: true, plusOnes: 0, meal: 'Vegan', allergies: null },
  { firstName: 'Juliette', lastName: 'Mendez', email: 'juliette.mendez@example.com', company: 'RestAPI Pro', tags: ['Participant'], attending: true, plusOnes: 0, meal: 'Standard', allergies: null },
  { firstName: 'Noé', lastName: 'Silva', email: 'noe.silva@example.com', company: 'gRPC Systems', tags: ['Sponsor'], attending: true, plusOnes: 2, meal: 'Végétarien', allergies: null },
  { firstName: 'Alice', lastName: 'Ramos', email: 'alice.ramos@example.com', company: 'WebSocket Tech', tags: ['Participant'], attending: true, plusOnes: 0, meal: 'Standard', allergies: null },
  { firstName: 'Raphaël', lastName: 'Santos', email: 'raphael.santos@example.com', company: 'Kafka Streams', tags: ['VIP'], attending: true, plusOnes: 1, meal: 'Standard', allergies: 'Arachides' },
  { firstName: 'Victoria', lastName: 'Pena', email: 'victoria.pena@example.com', company: 'RabbitMQ Pro', tags: ['Participant'], attending: false, plusOnes: 0, meal: null, allergies: null },
  { firstName: 'Ethan', lastName: 'Suarez', email: 'ethan.suarez@example.com', company: 'Redis Labs', tags: ['Speaker'], attending: true, plusOnes: 0, meal: 'Vegan', allergies: null },
  { firstName: 'Lily', lastName: 'Figueroa', email: 'lily.figueroa@example.com', company: 'MongoDB Inc', tags: ['Participant'], attending: true, plusOnes: 0, meal: 'Standard', allergies: null },
  { firstName: 'Dylan', lastName: 'Leon', email: 'dylan.leon@example.com', company: 'PostgreSQL Pro', tags: ['Participant'], attending: null, plusOnes: 0, meal: null, allergies: null }
]

async function main() {
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

  // 1. Créer un utilisateur admin
  console.log('👤 Création de l\'utilisateur admin...')
  const admin = await prisma.user.create({
    data: {
      email: 'admin@weevup.com',
      role: UserRole.ADMIN
    }
  })
  console.log(`✅ Admin créé: ${admin.email}`)

  // 2. Créer une intégration email (SendGrid)
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
  console.log(`✅ Intégration email créée: ${emailIntegration.provider}`)

  // 3. Créer des templates d'email
  console.log('📝 Création des templates d\'email...')

  const saveTheDateTemplate = await prisma.emailTemplate.create({
    data: {
      name: 'Save the Date - Conférence Tech 2025',
      slug: 'save-the-date-tech-2025',
      description: 'Template pour l\'annonce initiale de la conférence',
      type: EmailType.SAVE_THE_DATE,
      subject: '📅 Save the Date - Tech Summit 2025',
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
              <p style="font-size: 18px; margin-top: 10px;">{{eventName}}</p>
            </div>
            <div class="content">
              <p>Bonjour {{firstName}},</p>
              <p>Nous sommes ravis de vous annoncer la <strong>{{eventName}}</strong> qui se tiendra le <strong>{{eventDate}}</strong>.</p>
              <p>📍 <strong>Lieu:</strong> {{venueName}}, {{city}}</p>
              <p>Cette conférence réunira les meilleurs experts du secteur pour deux jours d'innovation, de networking et d'apprentissage.</p>
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
      textContent: 'Save the Date! {{eventName}} - {{eventDate}} à {{venueName}}, {{city}}',
      primaryColor: '#004645',
      secondaryColor: '#009197',
      accentColor: '#FF4713',
      fontFamily: 'Arial, sans-serif',
      isDefault: true,
      isActive: true,
      usageCount: 50,
      lastUsedAt: new Date('2025-01-15')
    }
  })

  const invitationTemplate = await prisma.emailTemplate.create({
    data: {
      name: 'Invitation Officielle - Tech Summit',
      slug: 'invitation-tech-summit',
      description: 'Invitation formelle avec détails complets et RSVP',
      type: EmailType.INVITATION,
      subject: '🎟️ Vous êtes invité au Tech Summit 2025',
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
              <h1 style="margin: 0; font-size: 32px;">{{eventName}}</h1>
              <p style="font-size: 18px; margin-top: 15px; opacity: 0.9;">{{eventDate}}</p>
            </div>
            <div class="content">
              <p>Cher(e) {{firstName}} {{lastName}},</p>
              <p>Nous avons le plaisir de vous inviter à participer au <strong>{{eventName}}</strong>, l'événement incontournable de l'innovation technologique.</p>

              <div class="info-box">
                <p style="margin: 0;"><strong>📅 Date:</strong> {{eventDate}}</p>
                <p style="margin: 10px 0 0 0;"><strong>📍 Lieu:</strong> {{venueName}}, {{address}}, {{city}}</p>
                <p style="margin: 10px 0 0 0;"><strong>⏰ Horaires:</strong> 9h00 - 18h00</p>
              </div>

              <h3 style="color: {{primaryColor}};">Au programme:</h3>
              <ul>
                <li>Conférences plénières avec des speakers internationaux</li>
                <li>Ateliers techniques et démonstrations</li>
                <li>Sessions de networking</li>
                <li>Déjeuner et pauses café</li>
              </ul>

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
      textContent: 'Vous êtes invité au {{eventName}} le {{eventDate}}. Confirmez votre présence: {{rsvpLink}}',
      primaryColor: '#004645',
      secondaryColor: '#009197',
      accentColor: '#FF4713',
      fontFamily: 'Arial, sans-serif',
      isDefault: true,
      isActive: true,
      usageCount: 150,
      lastUsedAt: new Date('2025-02-01')
    }
  })

  const reminderTemplate = await prisma.emailTemplate.create({
    data: {
      name: 'Rappel - Derniers jours pour RSVP',
      slug: 'reminder-rsvp',
      description: 'Rappel pour les invités qui n\'ont pas encore répondu',
      type: EmailType.REMINDER,
      subject: '⏰ Rappel - Plus que quelques jours pour confirmer votre présence',
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
              <p>Bonjour {{firstName}},</p>

              <div class="urgent">
                <p style="margin: 0; font-weight: bold;">⚠️ La date limite pour confirmer votre présence au {{eventName}} approche!</p>
              </div>

              <p>Nous n'avons pas encore reçu votre confirmation pour le <strong>{{eventName}}</strong> qui se tiendra le <strong>{{eventDate}}</strong>.</p>

              <p>Afin de finaliser l'organisation (repas, badges, matériel), merci de nous faire part de votre réponse avant le <strong>{{rsvpDeadline}}</strong>.</p>

              <p style="text-align: center;">
                <a href="{{rsvpLink}}" class="button">Confirmer maintenant</a>
              </p>

              <p style="font-size: 14px; color: #666;">Si vous avez déjà répondu, merci d'ignorer ce message.</p>
            </div>
            <div class="footer">
              <p>Weevup Events © 2025</p>
            </div>
          </div>
        </body>
        </html>
      `,
      textContent: 'Rappel: Merci de confirmer votre présence au {{eventName}} avant le {{rsvpDeadline}}. {{rsvpLink}}',
      primaryColor: '#004645',
      secondaryColor: '#009197',
      accentColor: '#FF4713',
      fontFamily: 'Arial, sans-serif',
      isDefault: false,
      isActive: true,
      usageCount: 75,
      lastUsedAt: new Date('2025-02-10')
    }
  })

  const confirmationTemplate = await prisma.emailTemplate.create({
    data: {
      name: 'Confirmation de participation',
      slug: 'confirmation-attendance',
      description: 'Email de confirmation après RSVP positif',
      type: EmailType.CONFIRMATION,
      subject: '✅ Votre participation au {{eventName}} est confirmée!',
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: {{fontFamily}}; background-color: #f5f5f5; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 8px; overflow: hidden; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 40px 20px; text-align: center; }
            .content { padding: 40px 30px; }
            .qr-placeholder { background: #f0f0f0; padding: 40px; text-align: center; margin: 20px 0; border: 2px dashed #ccc; }
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
              <p>Bonjour {{firstName}},</p>
              <p>Merci d'avoir confirmé votre participation au <strong>{{eventName}}</strong>!</p>

              <div class="info-card">
                <h3 style="margin-top: 0; color: {{primaryColor}};">Récapitulatif de votre inscription</h3>
                <p><strong>📅 Date:</strong> {{eventDate}}</p>
                <p><strong>📍 Lieu:</strong> {{venueName}}, {{city}}</p>
                <p><strong>👥 Nombre de participants:</strong> {{attendeeCount}}</p>
                <p><strong>🍽️ Repas:</strong> {{mealChoice}}</p>
              </div>

              <div class="qr-placeholder">
                <p style="margin: 0; color: #666;">📱 Votre QR Code d'accès</p>
                <p style="font-size: 12px; color: #999; margin-top: 10px;">Présentez ce code à l'entrée</p>
              </div>

              <h3 style="color: {{primaryColor}};">Informations pratiques:</h3>
              <ul>
                <li><strong>Accueil:</strong> Dès 8h30</li>
                <li><strong>Début de la conférence:</strong> 9h00 précises</li>
                <li><strong>Parking:</strong> Gratuit sur place</li>
                <li><strong>Wi-Fi:</strong> Disponible dans toute la salle</li>
              </ul>

              <p style="text-align: center;">
                <a href="{{showcaseUrl}}" class="button">Programme complet</a>
                <a href="{{rsvpLink}}" class="button" style="background: #6b7280;">Modifier ma réponse</a>
              </p>

              <p style="font-size: 14px; color: #666; margin-top: 30px;">À très bientôt!</p>
            </div>
            <div class="footer">
              <p>Weevup Events © 2025</p>
              <p style="margin-top: 10px;">Des questions? Contactez-nous: contact@weevup.com</p>
            </div>
          </div>
        </body>
        </html>
      `,
      textContent: 'Votre participation au {{eventName}} est confirmée! Rendez-vous le {{eventDate}} à {{venueName}}.',
      primaryColor: '#004645',
      secondaryColor: '#009197',
      accentColor: '#FF4713',
      fontFamily: 'Arial, sans-serif',
      isDefault: false,
      isActive: true,
      usageCount: 120,
      lastUsedAt: new Date('2025-02-05')
    }
  })

  console.log(`✅ ${4} templates créés`)

  // 4. Créer l'événement principal
  console.log('🎉 Création de l\'événement...')

  const eventDate = new Date('2025-05-15T09:00:00Z')
  const rsvpDeadline = new Date('2025-05-01T23:59:59Z')

  const event = await prisma.event.create({
    data: {
      name: 'Tech Summit 2025 - L\'Innovation en Action',
      slug: 'tech-summit-2025',
      startsAt: eventDate,
      endsAt: new Date('2025-05-16T18:00:00Z'),
      venueName: 'Palais des Congrès de Paris',
      address: '2 Place de la Porte Maillot',
      city: 'Paris',
      country: 'France',
      coverImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87',
      description: `Le Tech Summit 2025 est l'événement incontournable de l'innovation technologique en France.

Rejoignez plus de 2000 professionnels du secteur pour deux jours de conférences, d'ateliers et de networking autour des dernières tendances tech : IA, Cloud, Cybersécurité, DevOps, et bien plus encore.

🎯 Au programme :
• 50+ conférences par des experts internationaux
• 20 ateliers techniques hands-on
• Espace exposition avec 100+ startups et entreprises
• Networking sessions et cocktails
• Remise des Tech Awards 2025

🎁 Inclus dans votre participation :
• Accès à toutes les conférences et ateliers
• Déjeuners et pauses café
• Kit participant (badge, sac, goodies)
• Accès à la plateforme de networking
• Certificat de participation`,

      program: `**JOUR 1 - Jeudi 15 Mai 2025**

**08h30 - 09h00** | Accueil et petit-déjeuner
**09h00 - 09h30** | Cérémonie d'ouverture
**09h30 - 10h30** | Keynote : "L'IA Générative : Opportunités et Défis" - Sophie Martin, TechCorp
**10h30 - 11h00** | Pause café
**11h00 - 12h30** | Sessions parallèles :
  • Track 1 : Cloud Native & Kubernetes
  • Track 2 : Cybersécurité & Zero Trust
  • Track 3 : Data Science & ML Ops
**12h30 - 14h00** | Déjeuner networking
**14h00 - 15h30** | Ateliers techniques (sur inscription)
**15h30 - 16h00** | Pause
**16h00 - 17h30** | Table ronde : "L'avenir du travail à l'ère de l'IA"
**17h30 - 18h00** | Networking informel
**19h00 - 22h00** | Cocktail de bienvenue (sur invitation)

**JOUR 2 - Vendredi 16 Mai 2025**

**09h00 - 09h30** | Petit-déjeuner
**09h30 - 10h30** | Keynote : "Sustainable Tech : Innover de manière responsable"
**10h30 - 11h00** | Pause café
**11h00 - 12h30** | Sessions parallèles :
  • Track 1 : DevOps & Platform Engineering
  • Track 2 : Web3 & Blockchain
  • Track 3 : Mobile & Cross-platform
**12h30 - 14h00** | Déjeuner
**14h00 - 15h30** | Démonstrations startups & pitchs
**15h30 - 16h00** | Pause
**16h00 - 17h00** | Panel : "Les licornes françaises de demain"
**17h00 - 18h00** | Remise des Tech Awards & Clôture`,

      dressCode: 'Business casual',

      rsvpDeadline: rsvpDeadline,
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
        'https://images.unsplash.com/photo-1475721027785-f74eccf877e2',
        'https://images.unsplash.com/photo-1505373877841-8d25f7d46678',
        'https://images.unsplash.com/photo-1591115765373-5207764f72e7'
      ],

      showcaseSpeakers: [
        {
          name: 'Sophie Martin',
          title: 'CTO, TechCorp',
          bio: 'Experte en IA et Machine Learning avec plus de 15 ans d\'expérience',
          photo: 'https://i.pravatar.cc/300?img=1',
          linkedin: 'https://linkedin.com/in/sophiemartin'
        },
        {
          name: 'Julie Bernard',
          title: 'Head of Innovation, InnovateCo',
          bio: 'Spécialiste du Cloud et de l\'architecture distribuée',
          photo: 'https://i.pravatar.cc/300?img=5',
          linkedin: 'https://linkedin.com/in/juliebernard'
        },
        {
          name: 'Emma Durand',
          title: 'CEO, AI Ventures',
          bio: 'Entrepreneuse et investisseuse dans les technologies émergentes',
          photo: 'https://i.pravatar.cc/300?img=9',
          linkedin: 'https://linkedin.com/in/emmadurand'
        },
        {
          name: 'Sarah Gonzalez',
          title: 'Quantum Computing Lead, QuantumTech',
          bio: 'Pionnière dans le domaine de l\'informatique quantique',
          photo: 'https://i.pravatar.cc/300?img=20',
          linkedin: 'https://linkedin.com/in/sarahgonzalez'
        }
      ],

      showcaseSponsors: [
        {
          name: 'TechCorp',
          logo: 'https://via.placeholder.com/200x80/004645/FFFFFF?text=TechCorp',
          tier: 'Platinum',
          url: 'https://techcorp.example.com'
        },
        {
          name: 'StartupLab',
          logo: 'https://via.placeholder.com/200x80/009197/FFFFFF?text=StartupLab',
          tier: 'Gold',
          url: 'https://startuplab.example.com'
        },
        {
          name: 'CloudSystems',
          logo: 'https://via.placeholder.com/200x80/FF4713/FFFFFF?text=CloudSystems',
          tier: 'Gold',
          url: 'https://cloudsystems.example.com'
        },
        {
          name: 'CyberSec',
          logo: 'https://via.placeholder.com/200x80/004645/FFFFFF?text=CyberSec',
          tier: 'Silver',
          url: 'https://cybersec.example.com'
        }
      ],

      showcaseFAQ: [
        {
          question: 'Comment accéder au Palais des Congrès?',
          answer: 'Le Palais des Congrès est accessible en métro (ligne 1, station Porte Maillot), en RER (ligne C) ou en voiture avec parking sur place.'
        },
        {
          question: 'Le Wi-Fi est-il disponible?',
          answer: 'Oui, un réseau Wi-Fi haute vitesse sera disponible gratuitement pour tous les participants. Les identifiants seront fournis lors de votre enregistrement.'
        },
        {
          question: 'Puis-je amener des accompagnateurs?',
          answer: 'Oui, vous pouvez inviter jusqu\'à 2 accompagnateurs. Merci de les déclarer lors de votre RSVP.'
        },
        {
          question: 'Y a-t-il des options végétariennes/vegan pour les repas?',
          answer: 'Absolument! Nous proposons plusieurs options de repas : standard, végétarien, vegan, sans gluten, halal et kosher. Merci de préciser votre choix lors de votre inscription.'
        },
        {
          question: 'Puis-je modifier mon RSVP après confirmation?',
          answer: 'Oui, vous pouvez modifier votre réponse jusqu\'à 48h avant l\'événement en utilisant le lien reçu par email.'
        },
        {
          question: 'Un certificat de participation sera-t-il délivré?',
          answer: 'Oui, tous les participants recevront un certificat de participation numérique après l\'événement.'
        }
      ],

      showcaseTimeline: [
        {
          time: '08h30',
          title: 'Accueil & Petit-déjeuner',
          description: 'Enregistrement des participants et networking matinal'
        },
        {
          time: '09h00',
          title: 'Cérémonie d\'ouverture',
          description: 'Mot de bienvenue et présentation du programme'
        },
        {
          time: '09h30',
          title: 'Keynote principale',
          description: 'L\'IA Générative : Opportunités et Défis'
        },
        {
          time: '11h00',
          title: 'Sessions parallèles',
          description: 'Cloud, Cybersécurité, Data Science'
        },
        {
          time: '12h30',
          title: 'Déjeuner networking',
          description: 'Repas et échanges entre participants'
        },
        {
          time: '14h00',
          title: 'Ateliers techniques',
          description: 'Sessions pratiques hands-on'
        },
        {
          time: '16h00',
          title: 'Table ronde',
          description: 'L\'avenir du travail à l\'ère de l\'IA'
        },
        {
          time: '19h00',
          title: 'Cocktail de bienvenue',
          description: 'Networking informel et détente'
        }
      ],

      showcaseVideo: 'https://www.youtube.com/embed/dQw4w9WgXcQ',

      adminId: admin.id
    }
  })

  console.log(`✅ Événement créé: ${event.name}`)

  // 5. Créer les invités et leurs RSVPs
  console.log('👥 Création des invités et RSVPs...')

  let guestsCreated = 0
  let rsvpsCreated = 0
  let checkinsCreated = 0

  for (const guestData of demoGuests) {
    const token = generateToken()
    const tokenHash = hashToken(token)

    // Déterminer le statut en fonction de la réponse
    let status: GuestStatus
    if (guestData.attending === null) {
      status = GuestStatus.INVITED
    } else {
      status = GuestStatus.RESPONDED
    }

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
        tokenExpiry: new Date('2025-12-31'),
        status: status,
        lastEmailAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Dans les 30 derniers jours
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
          mealChoice: guestData.meal,
          allergies: guestData.allergies,
          accessibilityNotes: guestData.tags.includes('VIP') ? 'Accès prioritaire souhaité' : undefined,
          transportNeeds: Math.random() > 0.8 ? 'Navette depuis la gare' : undefined,
          lodgingNeeds: Math.random() > 0.7 ? 'Réservation hôtel à proximité' : undefined,
          consentPhotos: Math.random() > 0.3
        }
      })

      rsvpsCreated++

      // Créer des check-ins pour certains invités qui ont dit oui (simulation)
      if (guestData.attending && Math.random() > 0.6) {
        await prisma.checkin.create({
          data: {
            eventId: event.id,
            guestId: guest.id,
            qrCodeId: rsvp.qrCodeId,
            checkedInAt: new Date(eventDate.getTime() - Math.random() * 60 * 60 * 1000), // 0-1h avant l'événement
            desk: ['A', 'B', 'C'][Math.floor(Math.random() * 3)],
            notes: Math.random() > 0.8 ? 'Badge VIP délivré' : undefined
          }
        })
        checkinsCreated++
      }
    }
  }

  console.log(`✅ ${guestsCreated} invités créés`)
  console.log(`✅ ${rsvpsCreated} RSVPs créés`)
  console.log(`✅ ${checkinsCreated} check-ins créés`)

  // 6. Créer des EmailLogs pour simuler l'activité
  console.log('📨 Création des logs d\'emails...')

  const guests = await prisma.guest.findMany({
    where: { eventId: event.id }
  })

  let emailLogsCreated = 0

  for (const guest of guests) {
    // Save the Date (envoyé à tous)
    const saveTheDateSentAt = new Date('2025-01-15T10:00:00Z')
    await prisma.emailLog.create({
      data: {
        eventId: event.id,
        guestId: guest.id,
        type: EmailType.SAVE_THE_DATE,
        status: EmailStatus.OPENED,
        subject: '📅 Save the Date - Tech Summit 2025',
        providerId: `sg_${crypto.randomBytes(16).toString('hex')}`,
        sentAt: saveTheDateSentAt,
        openedAt: new Date(saveTheDateSentAt.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000), // Ouvert dans les 7 jours
        clickedAt: Math.random() > 0.5 ? new Date(saveTheDateSentAt.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000) : null
      }
    })
    emailLogsCreated++

    // Invitation officielle (envoyée à tous)
    const invitationSentAt = new Date('2025-02-01T09:00:00Z')
    const invitationStatus = Math.random() > 0.95 ? EmailStatus.BOUNCED :
                            Math.random() > 0.1 ? EmailStatus.OPENED : EmailStatus.DELIVERED

    await prisma.emailLog.create({
      data: {
        eventId: event.id,
        guestId: guest.id,
        type: EmailType.INVITATION,
        status: invitationStatus,
        subject: '🎟️ Vous êtes invité au Tech Summit 2025',
        providerId: `sg_${crypto.randomBytes(16).toString('hex')}`,
        sentAt: invitationSentAt,
        openedAt: invitationStatus === EmailStatus.OPENED ?
                  new Date(invitationSentAt.getTime() + Math.random() * 5 * 24 * 60 * 60 * 1000) : null,
        clickedAt: invitationStatus === EmailStatus.OPENED && Math.random() > 0.4 ?
                   new Date(invitationSentAt.getTime() + Math.random() * 5 * 24 * 60 * 60 * 1000) : null,
        bouncedAt: invitationStatus === EmailStatus.BOUNCED ? invitationSentAt : null,
        error: invitationStatus === EmailStatus.BOUNCED ? 'Email address not found' : null
      }
    })
    emailLogsCreated++

    // Rappel (seulement pour ceux qui n'ont pas encore répondu)
    if (guest.status === GuestStatus.INVITED) {
      const reminderSentAt = new Date('2025-02-10T14:00:00Z')
      await prisma.emailLog.create({
        data: {
          eventId: event.id,
          guestId: guest.id,
          type: EmailType.REMINDER,
          status: Math.random() > 0.2 ? EmailStatus.OPENED : EmailStatus.DELIVERED,
          subject: '⏰ Rappel - Plus que quelques jours pour confirmer votre présence',
          providerId: `sg_${crypto.randomBytes(16).toString('hex')}`,
          sentAt: reminderSentAt,
          openedAt: Math.random() > 0.2 ?
                    new Date(reminderSentAt.getTime() + Math.random() * 3 * 24 * 60 * 60 * 1000) : null
        }
      })
      emailLogsCreated++
    }

    // Confirmation (pour ceux qui ont dit oui)
    if (guest.status === GuestStatus.RESPONDED) {
      const rsvp = await prisma.rSVP.findUnique({
        where: { guestId: guest.id }
      })

      if (rsvp?.attending) {
        const confirmationSentAt = new Date(rsvp.createdAt.getTime() + 60000) // 1 minute après le RSVP
        await prisma.emailLog.create({
          data: {
            eventId: event.id,
            guestId: guest.id,
            type: EmailType.CONFIRMATION,
            status: EmailStatus.OPENED,
            subject: '✅ Votre participation au Tech Summit 2025 est confirmée!',
            providerId: `sg_${crypto.randomBytes(16).toString('hex')}`,
            sentAt: confirmationSentAt,
            openedAt: new Date(confirmationSentAt.getTime() + Math.random() * 24 * 60 * 60 * 1000)
          }
        })
        emailLogsCreated++
      }
    }
  }

  console.log(`✅ ${emailLogsCreated} logs d'emails créés`)

  // 7. Créer des EmailTrackings
  console.log('📊 Création des trackings d\'emails...')

  let trackingsCreated = 0

  for (const guest of guests) {
    // Tracking Save the Date
    await prisma.emailTracking.create({
      data: {
        id: `${event.id}-${guest.id}-save-the-date-${Date.now()}`,
        eventId: event.id,
        guestId: guest.id,
        type: 'save-the-date',
        status: 'opened',
        sentAt: new Date('2025-01-15T10:00:00Z'),
        openedAt: new Date('2025-01-15T14:30:00Z'),
        clickedAt: Math.random() > 0.5 ? new Date('2025-01-15T14:35:00Z') : null
      }
    })
    trackingsCreated++

    // Tracking Invitation
    const invitationStatus = Math.random() > 0.95 ? 'failed' :
                            Math.random() > 0.1 ? 'opened' : 'delivered'

    await prisma.emailTracking.create({
      data: {
        id: `${event.id}-${guest.id}-invitation-${Date.now() + 1}`,
        eventId: event.id,
        guestId: guest.id,
        type: 'invitation',
        status: invitationStatus,
        sentAt: new Date('2025-02-01T09:00:00Z'),
        openedAt: invitationStatus === 'opened' ? new Date('2025-02-01T11:20:00Z') : null,
        clickedAt: invitationStatus === 'opened' && Math.random() > 0.4 ? new Date('2025-02-01T11:25:00Z') : null
      }
    })
    trackingsCreated++
  }

  console.log(`✅ ${trackingsCreated} trackings créés`)

  // 8. Statistiques finales
  console.log('\n📊 ===== RÉSUMÉ DE LA DÉMONSTRATION =====')
  console.log(`\n🎉 Événement: ${event.name}`)
  console.log(`📅 Date: ${event.startsAt.toLocaleDateString('fr-FR')}`)
  console.log(`📍 Lieu: ${event.venueName}, ${event.city}`)

  const stats = await prisma.event.findUnique({
    where: { id: event.id },
    include: {
      _count: {
        select: {
          guests: true,
          rsvps: true,
          checkins: true,
          emailLogs: true,
          emailTrackings: true
        }
      }
    }
  })

  const attendingCount = await prisma.rSVP.count({
    where: {
      eventId: event.id,
      attending: true
    }
  })

  const notAttendingCount = await prisma.rSVP.count({
    where: {
      eventId: event.id,
      attending: false
    }
  })

  const pendingCount = await prisma.guest.count({
    where: {
      eventId: event.id,
      status: GuestStatus.INVITED
    }
  })

  const emailsByStatus = await prisma.emailLog.groupBy({
    by: ['status'],
    where: { eventId: event.id },
    _count: {
      _all: true
    }
  })

  console.log(`\n👥 INVITÉS:`)
  console.log(`   Total: ${stats?._count.guests}`)
  console.log(`   ✅ Confirmés: ${attendingCount}`)
  console.log(`   ❌ Déclinés: ${notAttendingCount}`)
  console.log(`   ⏳ En attente: ${pendingCount}`)

  console.log(`\n📨 EMAILS:`)
  console.log(`   Total envoyés: ${stats?._count.emailLogs}`)
  emailsByStatus.forEach(stat => {
    console.log(`   ${stat.status}: ${stat._count._all}`)
  })

  console.log(`\n🎟️ CHECK-INS:`)
  console.log(`   Total: ${stats?._count.checkins}`)

  console.log(`\n📧 TEMPLATES:`)
  console.log(`   Save the Date: ${saveTheDateTemplate.usageCount} utilisations`)
  console.log(`   Invitation: ${invitationTemplate.usageCount} utilisations`)
  console.log(`   Reminder: ${reminderTemplate.usageCount} utilisations`)
  console.log(`   Confirmation: ${confirmationTemplate.usageCount} utilisations`)

  console.log(`\n🔌 INTÉGRATION:`)
  console.log(`   Provider: ${emailIntegration.provider}`)
  console.log(`   Status: ${emailIntegration.isActive ? 'Active' : 'Inactive'}`)
  console.log(`   Tracking: Opens ${emailIntegration.trackOpens ? '✓' : '✗'}, Clicks ${emailIntegration.trackClicks ? '✓' : '✗'}`)

  console.log(`\n✨ ===================================`)
  console.log(`✅ Démonstration complète générée avec succès!`)
  console.log(`\n🔗 URL de showcase: ${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/events/${event.slug}`)
  console.log(`📧 Admin email: ${admin.email}`)
  console.log(`\n`)
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors de la génération de la démo:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
