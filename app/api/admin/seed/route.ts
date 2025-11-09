import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateGuestToken, hashToken } from '@/lib/auth'
import { UserRole, GuestStatus, EmailProvider, EmailType, EmailStatus } from '@prisma/client'

function generateToken(): string {
  return generateGuestToken()
}

export async function POST() {
  try {
    // Check if events already exist
    const existingEvents = await prisma.event.findMany()
    if (existingEvents.length > 0) {
      return NextResponse.json(
        { error: 'Database already contains events. Clear the database first if you want to reseed.' },
        { status: 400 }
      )
    }

    // ====================================
    // 1. UTILISATEURS
    // ====================================
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

    // ====================================
    // 1.5. EMAIL INTEGRATION & TEMPLATES
    // ====================================
    const emailIntegration = await prisma.emailIntegration.create({
      data: {
        provider: EmailProvider.SENDGRID,
        isActive: true,
        isPrimary: true,
        apiKey: 'SG.demo_key_encrypted_for_testing',
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

    // Templates d'emails
    const saveTheDateTemplate = await prisma.emailTemplate.create({
      data: {
        name: 'Save the Date - Événement Tech',
        slug: 'save-the-date-tech',
        description: 'Template pour l\'annonce initiale des événements',
        type: EmailType.SAVE_THE_DATE,
        subject: '📅 Save the Date - {{eventName}}',
        htmlContent: `<!DOCTYPE html><html><body style="font-family: Arial; background: #f5f5f5; padding: 20px;"><div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden;"><div style="background: {{primaryColor}}; color: white; padding: 40px 20px; text-align: center;"><h1>Save the Date!</h1><p style="font-size: 18px;">{{eventName}}</p></div><div style="padding: 40px 30px;"><p>Bonjour {{firstName}},</p><p>Nous sommes ravis de vous annoncer <strong>{{eventName}}</strong> qui se tiendra le <strong>{{eventDate}}</strong>.</p><p>📍 <strong>Lieu:</strong> {{venueName}}, {{city}}</p><p>L'invitation officielle avec tous les détails suivra prochainement.</p><p style="text-align: center; margin: 30px 0;"><a href="{{showcaseUrl}}" style="display: inline-block; background: {{accentColor}}; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">En savoir plus</a></p></div></div></body></html>`,
        textContent: 'Save the Date! {{eventName}} - {{eventDate}} à {{venueName}}, {{city}}',
        primaryColor: '#004645',
        secondaryColor: '#009197',
        accentColor: '#FF4713',
        fontFamily: 'Arial, sans-serif',
        isDefault: true,
        isActive: true,
        usageCount: 250,
        lastUsedAt: new Date()
      }
    })

    const invitationTemplate = await prisma.emailTemplate.create({
      data: {
        name: 'Invitation Officielle',
        slug: 'invitation-officielle',
        description: 'Invitation formelle avec détails complets et RSVP',
        type: EmailType.INVITATION,
        subject: '🎟️ Vous êtes invité à {{eventName}}',
        htmlContent: `<!DOCTYPE html><html><body style="font-family: Arial; background: #f5f5f5; padding: 20px;"><div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);"><div style="background: linear-gradient(135deg, {{primaryColor}} 0%, {{secondaryColor}} 100%); color: white; padding: 50px 30px; text-align: center;"><h1 style="margin: 0; font-size: 32px;">{{eventName}}</h1><p style="font-size: 18px; margin-top: 15px;">{{eventDate}}</p></div><div style="padding: 40px 30px;"><p>Cher(e) {{firstName}} {{lastName}},</p><p>Nous avons le plaisir de vous inviter à participer à <strong>{{eventName}}</strong>.</p><div style="background: #f9f9f9; padding: 20px; border-left: 4px solid {{accentColor}}; margin: 20px 0;"><p style="margin: 0;"><strong>📅 Date:</strong> {{eventDate}}</p><p style="margin: 10px 0 0 0;"><strong>📍 Lieu:</strong> {{venueName}}, {{city}}</p></div><p><strong>Merci de confirmer votre présence avant le {{rsvpDeadline}}</strong></p><p style="text-align: center; margin: 30px 0;"><a href="{{rsvpLink}}" style="display: inline-block; background: {{accentColor}}; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold;">Confirmer ma présence</a></p></div></div></body></html>`,
        textContent: 'Vous êtes invité au {{eventName}} le {{eventDate}}. Confirmez: {{rsvpLink}}',
        primaryColor: '#004645',
        secondaryColor: '#009197',
        accentColor: '#FF4713',
        fontFamily: 'Arial, sans-serif',
        isDefault: true,
        isActive: true,
        usageCount: 500,
        lastUsedAt: new Date()
      }
    })

    const reminderTemplate = await prisma.emailTemplate.create({
      data: {
        name: 'Rappel RSVP',
        slug: 'reminder-rsvp',
        description: 'Rappel pour les invités qui n\'ont pas encore répondu',
        type: EmailType.REMINDER,
        subject: '⏰ Rappel - Confirmez votre présence à {{eventName}}',
        htmlContent: `<!DOCTYPE html><html><body style="font-family: Arial; background: #f5f5f5; padding: 20px;"><div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden;"><div style="background: {{accentColor}}; color: white; padding: 30px 20px; text-align: center;"><h1>⏰ Derniers jours!</h1></div><div style="padding: 40px 30px;"><p>Bonjour {{firstName}},</p><div style="background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 5px; margin: 20px 0;"><p style="margin: 0; font-weight: bold;">⚠️ La date limite approche!</p></div><p>Nous n'avons pas encore reçu votre confirmation pour <strong>{{eventName}}</strong> ({{eventDate}}).</p><p>Merci de nous faire part de votre réponse avant le <strong>{{rsvpDeadline}}</strong>.</p><p style="text-align: center; margin: 30px 0;"><a href="{{rsvpLink}}" style="display: inline-block; background: {{accentColor}}; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold;">Confirmer maintenant</a></p></div></div></body></html>`,
        textContent: 'Rappel: Confirmez votre présence à {{eventName}} avant le {{rsvpDeadline}}. {{rsvpLink}}',
        primaryColor: '#004645',
        secondaryColor: '#009197',
        accentColor: '#FF4713',
        fontFamily: 'Arial, sans-serif',
        isDefault: false,
        isActive: true,
        usageCount: 180,
        lastUsedAt: new Date()
      }
    })

    const confirmationTemplate = await prisma.emailTemplate.create({
      data: {
        name: 'Confirmation de participation',
        slug: 'confirmation-attendance',
        description: 'Email de confirmation après RSVP positif',
        type: EmailType.CONFIRMATION,
        subject: '✅ Votre participation à {{eventName}} est confirmée!',
        htmlContent: `<!DOCTYPE html><html><body style="font-family: Arial; background: #f5f5f5; padding: 20px;"><div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden;"><div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 40px 20px; text-align: center;"><h1>✅ C'est confirmé!</h1><p style="font-size: 18px;">Votre place est réservée</p></div><div style="padding: 40px 30px;"><p>Bonjour {{firstName}},</p><p>Merci d'avoir confirmé votre participation à <strong>{{eventName}}</strong>!</p><div style="background: #f9fafb; padding: 20px; border-radius: 5px; margin: 20px 0;"><h3 style="margin-top: 0;">Récapitulatif</h3><p><strong>📅 Date:</strong> {{eventDate}}</p><p><strong>📍 Lieu:</strong> {{venueName}}, {{city}}</p><p><strong>👥 Participants:</strong> {{attendeeCount}}</p></div><p>À très bientôt!</p></div></div></body></html>`,
        textContent: 'Votre participation à {{eventName}} est confirmée! RDV le {{eventDate}} à {{venueName}}.',
        primaryColor: '#004645',
        secondaryColor: '#009197',
        accentColor: '#FF4713',
        fontFamily: 'Arial, sans-serif',
        isDefault: false,
        isActive: true,
        usageCount: 380,
        lastUsedAt: new Date()
      }
    })

    // ====================================
    // 2. ÉVÉNEMENT 1: TECH SUMMIT 2025
    // ====================================
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
        description: `🚀 Le Tech Summit 2025 est L'ÉVÉNEMENT tech incontournable de l'année !

Rejoignez plus de 2000 professionnels du secteur pour deux jours intensifs d'innovation, de networking et d'apprentissage au cœur de Paris.

🎯 POURQUOI VENIR ?
• Découvrir les dernières tendances tech : IA générative, Cloud native, Cybersécurité, DevOps
• Networker avec les meilleurs experts et décideurs du secteur
• Assister à 50+ conférences par des speakers internationaux de renom
• Participer à 20 ateliers techniques hands-on
• Rencontrer 100+ startups et scale-ups innovantes

💡 THÉMATIQUES 2025
🤖 Intelligence Artificielle & Machine Learning
☁️ Cloud Computing & Architecture Distribuée
🔐 Cybersécurité & Zero Trust
⚡ DevOps & Platform Engineering
📊 Data Science & Analytics
🌐 Web3 & Blockchain

🎁 INCLUS DANS VOTRE PASS
✓ Accès à toutes les conférences et ateliers
✓ Déjeuners gastronomiques et pauses café premium
✓ Kit participant (badge, sac, goodies tech)
✓ Accès VIP à la plateforme de networking
✓ Certificat de participation
✓ Replay vidéo de toutes les sessions

Ne manquez pas l'événement tech de l'année ! 🔥`,

        program: `**JOUR 1 - Jeudi 15 Mai 2025**

**08h30 - 09h00** | Accueil & Petit-déjeuner
Enregistrement, remise des badges et networking autour d'un petit-déjeuner continental

**09h00 - 09h30** | Cérémonie d'ouverture
Mot de bienvenue et présentation du programme par l'équipe Tech Summit

**09h30 - 10h30** | 🎤 KEYNOTE PRINCIPALE
**"L'IA Générative : Révolution ou Évolution ?"**
Par Sophie Martin, CTO de TechCorp
Découvrez comment l'IA générative transforme radicalement l'industrie tech

**10h30 - 11h00** | Pause Café & Networking

**11h00 - 12h30** | Sessions Parallèles - Track 1, 2, 3
📌 **Track 1 - Cloud Native**
"Kubernetes en Production : Best Practices 2025"

📌 **Track 2 - Cybersécurité**
"Zero Trust Architecture : De la théorie à la pratique"

📌 **Track 3 - Data Science**
"MLOps : Industrialiser vos modèles ML"

**12h30 - 14h00** | Déjeuner Networking
Buffet gastronomique et networking dans l'espace exposition

**14h00 - 15h30** | Ateliers Techniques (sur inscription)
🛠️ Atelier 1 : "Construire une API GraphQL performante"
🛠️ Atelier 2 : "Sécuriser votre infra Cloud avec Terraform"
🛠️ Atelier 3 : "Fine-tuning de modèles LLM"

**15h30 - 16h00** | Pause Café

**16h00 - 17h30** | 🎙️ Table Ronde
**"L'avenir du travail à l'ère de l'IA"**
Avec Sophie Martin (TechCorp), Julie Bernard (InnovateCo), Emma Durand (AI Ventures)

**17h30 - 18h00** | Networking Informel

**19h00 - 22h00** | 🍸 Cocktail de Bienvenue (VIP sur invitation)
Rooftop du Palais des Congrès


**JOUR 2 - Vendredi 16 Mai 2025**

**09h00 - 09h30** | Petit-déjeuner

**09h30 - 10h30** | 🎤 KEYNOTE
**"Sustainable Tech : Innover de manière responsable"**
Par Dr. Sarah Gonzalez, QuantumTech

**10h30 - 11h00** | Pause Café

**11h00 - 12h30** | Sessions Parallèles - Track 1, 2, 3
📌 **Track 1 - DevOps**
"Platform Engineering : La nouvelle révolution DevOps"

📌 **Track 2 - Web3**
"Smart Contracts : Au-delà du hype"

📌 **Track 3 - Mobile**
"React Native vs Flutter : Le match 2025"

**12h30 - 14h00** | Déjeuner

**14h00 - 15h30** | Startup Pitch & Démos
10 startups prometteuses pitchent leurs innovations

**15h30 - 16h00** | Pause

**16h00 - 17h00** | 🏆 Panel Final
**"Les Licornes Françaises de Demain"**

**17h00 - 18h00** | Remise des Tech Awards 2025 & Clôture
Networking et au revoir jusqu'à l'année prochaine !`,

        dressCode: 'Business casual - Sneakers tech acceptées 😉',
        rsvpDeadline: new Date('2025-05-01T23:59:59Z'),
        maxPlusOnes: 2,
        allowPlusOnes: true,
        requireMeal: true,
        mealOptions: ['Standard', 'Végétarien', 'Vegan', 'Sans gluten', 'Halal', 'Kosher'],
        enableTransport: true,
        enableLodging: true,
        enableAccessibility: true,
        enablePhotoConsent: true,

        // Save the Date Config
        saveTheDateConfig: {
          eventName: 'Tech Summit 2025',
          tagline: '🚀 L\'Innovation en Action',
          dateAnnouncement: '15-16 Mai 2025',
          locationHint: 'Palais des Congrès, Paris',
          teaserMessage: 'Préparez-vous pour 2 jours intenses d\'innovation tech ! 50+ conférences, 20 ateliers, 2000+ participants. Les inscriptions ouvrent bientôt...',
          primaryColor: '#004645',
          secondaryColor: '#FF4713',
          accentColor: '#009197',
          backgroundColor: '#9CD9F6',
          ctaText: 'Je bloque la date ! 🗓️',
          ctaAction: 'interest',
          showInterestForm: true,
          showCountdown: true,
          showSocialShare: true,
          animationStyle: 'confetti',
          footerMessage: 'Invitation officielle début avril 2025',
          logoImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=200',
          headerImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200',
        },

        // Invitation Config
        invitationConfig: {
          welcomeMessage: 'Vous êtes invité au plus grand événement tech de l\'année ! 🎉',
          description: '2 jours d\'innovation, 50+ conférences, 2000+ participants. Rejoignez-nous pour le Tech Summit 2025 !',
          primaryColor: '#004645',
          secondaryColor: '#009197',
          accentColor: '#FF4713',
          showMap: true,
          showProgram: true,
          showDressCode: true,
          ctaText: 'Confirmer ma présence 🚀',
          footerMessage: 'Au plaisir de vous accueillir au Tech Summit 2025 !',
          logoUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=200',
          headerImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200',
        },

        // RSVP Config
        rsvpConfig: {
          welcomeMessage: 'Confirmez votre participation au Tech Summit 2025',
          confirmationMessage: 'Merci ! Votre place est réservée. Rendez-vous les 15-16 mai à Paris ! 🎉',
          primaryColor: '#004645',
          accentColor: '#FF4713',
          showMealPreferences: true,
          showPlusOnes: true,
          showAccessibility: true,
          showTransport: true,
          showLodging: true,
          requirePhotoConsent: true,
        },

        // Showcase
        showcaseEnabled: true,
        showcaseTitle: 'Tech Summit 2025',
        showcaseSubtitle: 'L\'Innovation en Action • 15-16 Mai 2025 • Paris',
        showcaseBannerImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1920',
        showcaseTheme: 'weevup',
        showcasePrimaryColor: '#004645',
        showcaseSecondaryColor: '#FF4713',
        showcaseSections: ['hero', 'countdown', 'video', 'description', 'speakers', 'program', 'sponsors', 'details', 'gallery', 'faq', 'cta'],
        showcaseCountdown: true,
        showcaseSocialShare: true,
        showcaseVideo: 'https://www.youtube.com/embed/dQw4w9WgXcQ',

        showcaseGallery: [
          'https://images.unsplash.com/photo-1540575467063-178a50c2df87',
          'https://images.unsplash.com/photo-1475721027785-f74eccf877e2',
          'https://images.unsplash.com/photo-1505373877841-8d25f7d46678',
          'https://images.unsplash.com/photo-1591115765373-5207764f72e7',
          'https://images.unsplash.com/photo-1515187029135-18ee286d815b',
          'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3'
        ],

        showcaseSpeakers: [
          {
            name: 'Sophie Martin',
            title: 'CTO, TechCorp',
            bio: 'Sophie est une pionnière de l\'IA avec plus de 15 ans d\'expérience. Ancienne de Google Brain, elle dirige maintenant l\'innovation chez TechCorp où elle supervise une équipe de 200+ ingénieurs ML. Auteure de 3 livres sur l\'IA et conférencière internationale reconnue.',
            photo: 'https://i.pravatar.cc/400?img=1',
            linkedin: 'https://linkedin.com/in/sophiemartin',
            twitter: '@sophietech'
          },
          {
            name: 'Julie Bernard',
            title: 'Head of Cloud Architecture, InnovateCo',
            bio: 'Experte cloud reconnue, Julie a orchestré la migration cloud de plus de 50 entreprises du CAC40. Certifiée AWS, GCP et Azure, elle est également formatrice et créatrice de contenu tech avec 100K+ followers.',
            photo: 'https://i.pravatar.cc/400?img=5',
            linkedin: 'https://linkedin.com/in/juliebernard',
            twitter: '@juliecloud'
          },
          {
            name: 'Emma Durand',
            title: 'CEO & Founder, AI Ventures',
            bio: 'Entrepreneuse serial et investisseuse dans les deeptech. Emma a fondé 3 startups dont 2 licornes. Elle investit maintenant dans l\'IA responsable via son fonds AI Ventures (150M€ sous gestion).',
            photo: 'https://i.pravatar.cc/400?img=9',
            linkedin: 'https://linkedin.com/in/emmadurand',
            twitter: '@emmaventures'
          },
          {
            name: 'Dr. Sarah Gonzalez',
            title: 'Quantum Computing Lead, QuantumTech',
            bio: 'Docteure en physique quantique du MIT, Sarah dirige la recherche en informatique quantique chez QuantumTech. Ses travaux sur les algorithmes quantiques ont été publiés dans Nature et Science.',
            photo: 'https://i.pravatar.cc/400?img=20',
            linkedin: 'https://linkedin.com/in/sarahgonzalez',
            twitter: '@sarahquantum'
          },
          {
            name: 'Marc Dubois',
            title: 'VP Security, CyberSecure',
            bio: 'Expert en cybersécurité avec 20 ans d\'expérience. Marc a protégé les infrastructures critiques de gouvernements et banques. Il évangélise l\'approche Zero Trust à travers l\'Europe.',
            photo: 'https://i.pravatar.cc/400?img=12',
            linkedin: 'https://linkedin.com/in/marcdubois'
          },
          {
            name: 'Clara Torres',
            title: 'Lead DevOps Engineer, CloudNative',
            bio: 'Contributrice Kubernetes et CNCF Ambassador, Clara est une référence mondiale du cloud native. Elle anime le plus grand meetup DevOps de France (5000+ membres).',
            photo: 'https://i.pravatar.cc/400?img=16',
            linkedin: 'https://linkedin.com/in/claratorres',
            twitter: '@claradevops'
          }
        ],

        showcaseSponsors: [
          {
            name: 'TechCorp Global',
            logo: 'https://via.placeholder.com/300x120/004645/FFFFFF?text=TechCorp',
            website: 'https://techcorp.example.com',
            tier: 'platinum',
            description: 'Leader mondial de l\'IA'
          },
          {
            name: 'CloudNative Inc',
            logo: 'https://via.placeholder.com/300x120/009197/FFFFFF?text=CloudNative',
            website: 'https://cloudnative.example.com',
            tier: 'platinum',
            description: 'Solutions cloud d\'entreprise'
          },
          {
            name: 'CyberSecure',
            logo: 'https://via.placeholder.com/300x120/FF4713/FFFFFF?text=CyberSecure',
            website: 'https://cybersecure.example.com',
            tier: 'gold',
            description: 'Cybersécurité nouvelle génération'
          },
          {
            name: 'AI Ventures',
            logo: 'https://via.placeholder.com/300x120/1e3a8a/FFFFFF?text=AI+Ventures',
            website: 'https://aiventures.example.com',
            tier: 'gold',
            description: 'Fonds d\'investissement deeptech'
          },
          {
            name: 'DataFlow',
            logo: 'https://via.placeholder.com/300x120/059669/FFFFFF?text=DataFlow',
            website: 'https://dataflow.example.com',
            tier: 'silver',
            description: 'Plateforme de data analytics'
          },
          {
            name: 'DevOps Pro',
            logo: 'https://via.placeholder.com/300x120/7c3aed/FFFFFF?text=DevOps+Pro',
            website: 'https://devopspro.example.com',
            tier: 'silver',
            description: 'Outils DevOps enterprise'
          }
        ],

        showcaseFAQ: [
          {
            question: 'Comment accéder au Palais des Congrès ?',
            answer: 'Le Palais des Congrès est accessible par métro (ligne 1, station Porte Maillot) ou RER (ligne C). Un parking souterrain de 600 places est disponible. Nous recommandons vivement les transports en commun.'
          },
          {
            question: 'Le Wi-Fi est-il disponible ?',
            answer: 'Oui ! Un réseau Wi-Fi dédié ultra-rapide (fibre 10Gb/s) sera déployé pour l\'événement. Les identifiants vous seront communiqués lors de votre enregistrement.'
          },
          {
            question: 'Puis-je amener des accompagnateurs ?',
            answer: 'Oui, vous pouvez inviter jusqu\'à 2 accompagnateurs. Le tarif accompagnateur est de 199€/personne. Inscrivez-les lors de votre RSVP.'
          },
          {
            question: 'Y a-t-il des options alimentaires spéciales ?',
            answer: 'Absolument ! Nous proposons 6 options : Standard, Végétarien, Vegan, Sans gluten, Halal et Kosher. Précisez votre choix lors de l\'inscription.'
          },
          {
            question: 'Les sessions sont-elles enregistrées ?',
            answer: 'Oui, toutes les conférences et keynotes seront filmées. Les replays seront disponibles 48h après l\'événement sur notre plateforme.'
          },
          {
            question: 'Y a-t-il un dress code ?',
            answer: 'Business casual. L\'ambiance est professionnelle mais décontractée. Les sneakers tech sont totalement acceptées ! 👟'
          },
          {
            question: 'Puis-je modifier mon RSVP ?',
            answer: 'Oui, jusqu\'à 48h avant l\'événement via le lien reçu par email. Pour toute urgence, contactez-nous à tech@summit2025.com'
          },
          {
            question: 'Un certificat de participation sera-t-il délivré ?',
            answer: 'Oui, tous les participants recevront un certificat numérique de 14h de formation (éligible CPF pour certains profils).'
          }
        ],

        showcaseTimeline: [
          {
            time: '08:30',
            title: 'Accueil & Enregistrement',
            description: 'Récupérez votre badge et votre kit participant'
          },
          {
            time: '09:00',
            title: 'Cérémonie d\'ouverture',
            description: 'Lancement officiel du Tech Summit 2025'
          },
          {
            time: '09:30',
            title: 'Keynote: L\'IA Générative',
            description: 'Par Sophie Martin, CTO TechCorp'
          },
          {
            time: '11:00',
            title: 'Sessions parallèles',
            description: '3 tracks simultanés: Cloud, Cyber, Data'
          },
          {
            time: '12:30',
            title: 'Déjeuner networking',
            description: 'Buffet gastronomique et networking'
          },
          {
            time: '14:00',
            title: 'Ateliers techniques',
            description: 'Sessions hands-on (sur inscription)'
          },
          {
            time: '16:00',
            title: 'Table ronde',
            description: 'L\'avenir du travail à l\'ère de l\'IA'
          },
          {
            time: '19:00',
            title: 'Cocktail VIP',
            description: 'Networking en rooftop (sur invitation)'
          }
        ],

        adminId: adminDemo.id
      }
    })

    // ====================================
    // 3. ÉVÉNEMENT 2: 10 ANS DE WEEVUP
    // ====================================
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
        description: `🎉 Une décennie d'innovation, de créativité et de succès !

C'est avec une immense fierté et beaucoup d'émotion que nous vous invitons à célébrer les **10 ans de Weevup** dans le cadre d'exception du Molitor Paris.

📅 **UNE SOIRÉE INOUBLIABLE**
Le 20 juin 2025, rejoignez-nous pour une soirée unique qui marquera cette étape importante de notre aventure entrepreneuriale.

🎯 **AU PROGRAMME**
• **19h00** - Accueil champagne au bord de la piscine mythique
• **20h00** - Cocktail dînatoire gastronomique by Chef étoilé
• **21h30** - Rétrospective vidéo: 10 ans en images
• **22h00** - Surprises et animations
• **22h30** - DJ set & dancefloor jusqu'à l'aube
• **00h00** - Feu d'artifice surprise

🌟 **POURQUOI CETTE SOIRÉE EST SPÉCIALE**
Ces 10 années n'auraient pas été possibles sans VOUS : nos clients, partenaires, investisseurs et amis qui nous ont fait confiance depuis le début.

Cette soirée est notre façon de dire MERCI et de célébrer ensemble nos succès passés... et ceux à venir !

💎 **LE LIEU**
Le Molitor, monument historique Art Déco, alliance parfaite entre élégance parisienne et modernité. Un lieu mythique pour une soirée mémorable.

Dress code: **Chic & Festif** - Sortez vos plus belles tenues ! ✨`,

        program: `**19h00 - 19h30** | Accueil Champagne
Arrivée des invités, photocall et coupe de champagne au bord de la piscine

**19h30 - 20h00** | Discours de Bienvenue
Mot de Marie Dubois, CEO & Fondatrice
"10 ans déjà... Et ce n'est que le début !"

**20h00 - 21h30** | Cocktail Dînatoire Gastronomique
Menu signature créé spécialement pour la soirée par un Chef étoilé
• Huîtres de Cancale & Caviar Ossetra
• Mini burgers de bœuf Wagyu
• Tataki de thon rouge
• Risotto aux truffes
• Stations live: Sushis, Pasta bar, Cheese & Wine
• Desserts d'exception & Bar à chocolats

**21h30 - 22h00** | Rétrospective "10 ans en images"
Projection vidéo exclusive: les moments forts de notre histoire
Témoignages émouvants de clients et partenaires

**22h00 - 22h30** | Surprises & Animations
• Discours de l'équipe fondatrice
• Remise des "Weevup Awards" à nos meilleurs partenaires
• Annonces exclusives pour 2026 😉

**22h30 - 00h30** | DJ Set & Dancefloor
DJ résident + musicien live (saxophone)
Les meilleurs hits des 10 dernières années !

**00h00** | 🎆 Surprise Pyrotechnique
Feu d'artifice au-dessus de la piscine du Molitor

**00h30 - 01h00** | Fin de soirée en beauté
Dernières danses et au revoir`,

        dressCode: 'Chic & Festif - Sortez vos plus belles tenues ! 🎩✨',
        rsvpDeadline: new Date('2025-06-10T23:59:59Z'),
        maxPlusOnes: 1,
        allowPlusOnes: true,
        requireMeal: true,
        mealOptions: ['Menu Signature', 'Menu Végétarien', 'Menu Végan', 'Menu Sans gluten', 'Menu Halal'],
        enableTransport: true,
        enableLodging: false,
        enableAccessibility: true,
        enablePhotoConsent: true,

        // Save the Date Config
        saveTheDateConfig: {
          eventName: '10 ans de Weevup',
          tagline: '🎊 Une décennie d\'excellence',
          dateAnnouncement: '20 Juin 2025',
          locationHint: 'Molitor Paris - Lieu d\'exception',
          teaserMessage: 'Préparez-vous pour LA soirée de l\'année ! Champagne, gastronomie, DJ set et surprises au programme. Dress code: Chic & Festif',
          primaryColor: '#004645',
          secondaryColor: '#FF4713',
          accentColor: '#009197',
          backgroundColor: '#9CD9F6',
          ctaText: 'Je viens faire la fête ! 🎉',
          ctaAction: 'interest',
          showInterestForm: true,
          showCountdown: true,
          showSocialShare: true,
          animationStyle: 'confetti',
          footerMessage: 'Invitation officielle à venir • RSVP obligatoire',
          logoImage: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200',
          headerImage: 'https://images.unsplash.com/photo-1519167758481-83f29da8c43f?w=1200',
        },

        // Invitation Config
        invitationConfig: {
          welcomeMessage: '✨ Vous êtes notre invité d\'honneur pour célébrer 10 ans d\'aventure !',
          description: 'Rejoignez-nous au Molitor pour une soirée exceptionnelle: champagne, gastronomie, DJ set et surprises !',
          primaryColor: '#004645',
          secondaryColor: '#009197',
          accentColor: '#FF4713',
          showMap: true,
          showProgram: true,
          showDressCode: true,
          ctaText: 'Je serai là ! 🥂',
          footerMessage: 'Votre présence sera notre plus beau cadeau 💝',
          logoUrl: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200',
          headerImage: 'https://images.unsplash.com/photo-1519167758481-83f29da8c43f?w=1200',
        },

        // RSVP Config
        rsvpConfig: {
          welcomeMessage: 'Confirmez votre présence à notre anniversaire !',
          confirmationMessage: 'Génial ! On a hâte de célébrer avec vous. À très vite au Molitor ! 🎉🥂',
          primaryColor: '#004645',
          accentColor: '#FF4713',
          showMealPreferences: true,
          showPlusOnes: true,
          showAccessibility: true,
          showTransport: true,
          showLodging: false,
          requirePhotoConsent: true,
        },

        // Showcase
        showcaseEnabled: true,
        showcaseTitle: '10 ans de Weevup',
        showcaseSubtitle: 'Une décennie d\'innovation • 20 Juin 2025 • Molitor Paris',
        showcaseBannerImage: 'https://images.unsplash.com/photo-1519167758481-83f29da8c43f?w=1920',
        showcaseTheme: 'weevup',
        showcasePrimaryColor: '#004645',
        showcaseSecondaryColor: '#FF4713',
        showcaseCountdown: true,
        showcaseSocialShare: true,

        showcaseGallery: [
          'https://images.unsplash.com/photo-1511578314322-379afb476865',
          'https://images.unsplash.com/photo-1492684223066-81342ee5ff30',
          'https://images.unsplash.com/photo-1505236858219-8359eb29e329',
          'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3',
          'https://images.unsplash.com/photo-1519167758481-83f29da8c9a0',
          'https://images.unsplash.com/photo-1478146896981-b80fe463b330'
        ],

        showcaseSpeakers: [
          {
            name: 'Marie Dubois',
            title: 'CEO & Fondatrice',
            bio: 'Marie a fondé Weevup il y a 10 ans avec une vision: révolutionner la gestion d\'événements. Son leadership visionnaire a permis à l\'entreprise de passer de 2 personnes à 150+ collaborateurs et de devenir leader européen.',
            photo: 'https://i.pravatar.cc/400?img=1'
          },
          {
            name: 'Thomas Martin',
            title: 'CTO & Co-fondateur',
            bio: 'Architecte de la plateforme Weevup depuis le jour 1, Thomas a bâti une infrastructure qui gère aujourd\'hui 100K+ événements par an. Passionné par l\'innovation tech et l\'automatisation.',
            photo: 'https://i.pravatar.cc/400?img=12'
          },
          {
            name: 'Sophie Laurent',
            title: 'Directrice Créative',
            bio: 'Avec son équipe créative de 30 personnes, Sophie transforme chaque événement en expérience mémorable. Elle a remporté 5 awards internationaux pour ses créations.',
            photo: 'https://i.pravatar.cc/400?img=5'
          }
        ],

        showcaseFAQ: [
          {
            question: 'Puis-je venir accompagné(e) ?',
            answer: 'Oui ! Chaque invitation est valable pour 2 personnes (vous + 1 accompagnateur). Merci de préciser lors de votre RSVP.'
          },
          {
            question: 'Y a-t-il un parking ?',
            answer: 'Le Molitor dispose d\'un parking privé. Cependant, nous recommandons vivement les taxis/VTC car la soirée est festive ! 🍾'
          },
          {
            question: 'Quel est le dress code ?',
            answer: 'Chic & Festif ! C\'est une grande soirée, alors sortez vos plus belles tenues. Smoking, robes de soirée... faites-vous plaisir ! ✨'
          },
          {
            question: 'Jusqu\'à quelle heure ?',
            answer: 'La soirée se termine officiellement à 1h du matin. Des navettes retour seront organisées vers Paris centre.'
          }
        ],

        showcaseTimeline: [
          {
            time: '19:00',
            title: 'Accueil Champagne',
            description: 'Photocall & champagne au bord de la piscine'
          },
          {
            time: '19:30',
            title: 'Discours de bienvenue',
            description: 'Marie Dubois, CEO: "10 ans déjà..."'
          },
          {
            time: '20:00',
            title: 'Cocktail dînatoire',
            description: 'Menu gastronomique by Chef étoilé'
          },
          {
            time: '21:30',
            title: 'Rétrospective vidéo',
            description: '10 ans d\'histoire en images'
          },
          {
            time: '22:30',
            title: 'DJ Set',
            description: 'Dancefloor & ambiance festive !'
          },
          {
            time: '00:00',
            title: 'Feu d\'artifice surprise',
            description: 'Spectacle pyrotechnique 🎆'
          }
        ],

        adminId: adminWeevup.id
      }
    })

    // ====================================
    // 4. ÉVÉNEMENT 3: MARIAGE JULIE & THOMAS
    // ====================================
    const eventWedding = await prisma.event.create({
      data: {
        name: 'Mariage de Julie & Thomas',
        slug: 'mariage-julie-thomas',
        startsAt: new Date('2025-07-12T14:30:00Z'),
        endsAt: new Date('2025-07-13T02:00:00Z'),
        venueName: 'Château de Vaux-le-Vicomte',
        address: '77950 Maincy',
        city: 'Maincy',
        country: 'France',
        coverImage: 'https://images.unsplash.com/photo-1519741497674-611481863552',
        description: `💍 Julie & Thomas unissent leurs destins !

Après 8 années d'amour, de rires et de complicité, nous avons décidé de dire OUI pour la vie ! 💕

Et c'est avec une immense joie que nous souhaitons partager ce moment unique avec vous, nos familles et amis les plus chers.

🏰 **LE LIEU DE NOS RÊVES**
Le Château de Vaux-le-Vicomte, joyau du 17ème siècle et chef-d'œuvre architectural, accueillera notre union. Ses jardins à la française et son élégance intemporelle feront de notre mariage un conte de fées.

💐 **NOTRE HISTOIRE**
Thomas et Julie se sont rencontrés en 2017 lors d'un trek au Népal. Un coup de foudre au sommet de l'Himalaya, et depuis, nous ne nous sommes plus quittés. Des montagnes népalaises aux plages de Bali, des soirées jeux entre amis aux dimanches cocooning, chaque moment ensemble est magique.

🎊 **UNE JOURNÉE INOUBLIABLE**
• **14h30** - Cérémonie laïque dans les jardins
• **16h00** - Vin d'honneur & cocktail champêtre
• **19h00** - Dîner gastronomique sous chapiteau
• **21h00** - Ouverture de bal & soirée festive
• **23h00** - Pièce montée & feu d'artifice
• **00h00** - DJ & dancefloor jusqu'au bout de la nuit

✨ **L'ESPRIT DE NOTRE MARIAGE**
Romantique, chaleureux et festif ! Nous voulons une journée pleine d'émotions, de rires et de danse. Une célébration à notre image: authentique et joyeuse.

👗 **DRESS CODE**
Tenue de cérémonie élégante. Mesdames, privilégiez les robes longues. Messieurs, costume de rigueur. Évitez le blanc (réservé à la mariée !) et le noir total.

💌 **UN MOT DU CŒUR**
Votre présence à nos côtés ce jour-là sera le plus beau des cadeaux. Nous avons hâte de célébrer l'amour avec vous !

Avec tout notre amour,
Julie & Thomas 💑`,

        program: `**14h00 - 14h30** | Accueil des invités
Arrivée au Château, installation et rafraîchissements de bienvenue

**14h30 - 15h30** | 💒 Cérémonie Laïque
Cérémonie dans les jardins à la française du Château
• Entrée de la mariée au son du violoncelle
• Échange des vœux personnalisés
• Rituel des rubans & témoignages des proches
• Échange des alliances
• Premier baiser d'époux

**15h30 - 16h00** | Lâcher de colombes & Photos officielles
Photos de famille et de groupe dans les jardins

**16h00 - 19h00** | 🥂 Vin d'Honneur & Cocktail Champêtre
Cocktail déjeunatoire dans le parc
• Bar à champagne & cocktails signature
• Buffet de mignardises salées et sucrées
• Oyster bar & station de charcuterie artisanale
• Animation musicale live (duo guitare-violoncelle)
• Jeux en bois géants & photobooth

**19h00 - 20h00** | Installation & Découverte du chapiteau
Les invités découvrent la décoration et s'installent à leur table

**20h00 - 21h00** | 🍽️ Dîner Gastronomique - Entrées
• Foie gras mi-cuit, chutney de figues et pain d'épices
• Ou Saint-Jacques snackées, émulsion citronnée
Menu enfant disponible

**21h00 - 22h00** | Plat Principal
• Filet de bœuf Rossini, légumes de saison et gratin dauphinois
• Ou Dos de cabillaud, sauce vierge et risotto crémeux
• Option végétarienne: Risotto aux champignons et truffe

**22h00 - 23h00** | 💃 Ouverture de Bal
Première danse des mariés sur "Perfect" de Ed Sheeran
Suivie de danses avec parents et témoins

**23h00 - 23h30** | Pièce Montée & Spectacle
• Présentation de la pièce montée (croquembouche traditionnel)
• 🎆 Feu d'artifice au-dessus du château
• Desserts gourmands & bar à desserts

**23h30 - 02h00** | 🎵 Soirée Dansante
DJ avec playlist personnalisée (tous styles musicaux)
Bar ouvert & animations

**02h00** | Fin de la soirée
Navettes retour vers Paris et les hôtels partenaires`,

        dressCode: 'Tenue de cérémonie élégante - Robes longues & Costumes 🤵👰',
        rsvpDeadline: new Date('2025-06-20T23:59:59Z'),
        maxPlusOnes: 1,
        allowPlusOnes: true,
        requireMeal: true,
        mealOptions: ['Filet de bœuf', 'Cabillaud', 'Menu Végétarien', 'Menu Enfant'],
        enableTransport: true,
        enableLodging: true,
        enableAccessibility: true,
        enablePhotoConsent: true,

        saveTheDateConfig: {
          eventName: 'Julie & Thomas',
          tagline: '💍 Nous nous marions !',
          dateAnnouncement: '12 Juillet 2025',
          locationHint: 'Château de Vaux-le-Vicomte, Maincy',
          teaserMessage: 'Réservez votre journée ! Nous avons hâte de célébrer l\'amour avec vous dans le cadre magique de Vaux-le-Vicomte. Cérémonie, cocktail, dîner et soirée dansante jusqu\'au bout de la nuit ! 💕',
          primaryColor: '#d4a574',
          secondaryColor: '#f4e4d7',
          accentColor: '#8b6f47',
          backgroundColor: '#fff9f5',
          ctaText: 'On sera là ! 💕',
          ctaAction: 'interest',
          showInterestForm: true,
          showCountdown: true,
          showSocialShare: true,
          animationStyle: 'hearts',
          footerMessage: 'Invitation officielle à suivre • Liste de mariage disponible',
          logoImage: 'https://images.unsplash.com/photo-1460978812857-470ed1c77af0?w=200',
          headerImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200',
        },

        invitationConfig: {
          welcomeMessage: '💕 Vous êtes invités au mariage de Julie & Thomas',
          description: 'Cérémonie, cocktail champêtre, dîner gastronomique et soirée dansante au Château de Vaux-le-Vicomte',
          primaryColor: '#d4a574',
          secondaryColor: '#8b6f47',
          accentColor: '#f4e4d7',
          showMap: true,
          showProgram: true,
          showDressCode: true,
          ctaText: 'Confirmer notre présence 💍',
          footerMessage: 'Votre présence sera notre plus beau cadeau 💝',
          logoUrl: 'https://images.unsplash.com/photo-1460978812857-470ed1c77af0?w=200',
          headerImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200',
        },

        rsvpConfig: {
          welcomeMessage: 'Confirmez votre présence à notre mariage',
          confirmationMessage: 'Merci infiniment ! Nous avons hâte de partager ce moment magique avec vous ! 💕✨',
          primaryColor: '#d4a574',
          accentColor: '#8b6f47',
          showMealPreferences: true,
          showPlusOnes: true,
          showAccessibility: true,
          showTransport: true,
          showLodging: true,
          requirePhotoConsent: true,
        },

        showcaseEnabled: true,
        showcaseTitle: 'Julie & Thomas',
        showcaseSubtitle: 'Nous nous marions • 12 Juillet 2025 • Château de Vaux-le-Vicomte',
        showcaseBannerImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1920',
        showcaseTheme: 'elegant',
        showcasePrimaryColor: '#d4a574',
        showcaseSecondaryColor: '#8b6f47',
        showcaseCountdown: true,
        showcaseSocialShare: true,
        showcaseVideo: 'https://www.youtube.com/embed/GibiNy4d4gc',

        showcaseGallery: [
          'https://images.unsplash.com/photo-1519741497674-611481863552',
          'https://images.unsplash.com/photo-1511285560929-80b456fea0bc',
          'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6',
          'https://images.unsplash.com/photo-1519225421980-715cb0215aed',
          'https://images.unsplash.com/photo-1522673607211-8389d32c1c0e',
          'https://images.unsplash.com/photo-1537633552985-df8429e8048b'
        ],

        showcaseSpeakers: [
          {
            name: 'Marie Petit',
            title: 'Témoin de Julie - Meilleure amie depuis 20 ans',
            bio: 'Marie et Julie sont inséparables depuis la maternelle. De leurs premiers pas à l\'école aux soirées pyjama en passant par les voyages autour du monde, elles ont tout partagé. Marie a vu naître l\'histoire avec Thomas et ne pouvait être que témoin de cette union.',
            photo: 'https://i.pravatar.cc/400?img=5'
          },
          {
            name: 'Lucas Moreau',
            title: 'Témoin de Thomas - Frère & meilleur ami',
            bio: 'Lucas, le grand frère de Thomas, a toujours été son confident et complice. Ensemble depuis l\'enfance dans toutes les aventures, Lucas connaît Thomas mieux que personne. Il est fier et ému d\'être le témoin de son bonheur.',
            photo: 'https://i.pravatar.cc/400?img=12'
          },
          {
            name: 'Céline Durand',
            title: 'Officiant de cérémonie',
            bio: 'Céline est officiante de cérémonies laïques depuis 8 ans. Passionnée par les histoires d\'amour uniques, elle crée des cérémonies sur-mesure, émouvantes et authentiques. Elle accompagnera Julie et Thomas dans l\'écriture et l\'animation de leur cérémonie.',
            photo: 'https://i.pravatar.cc/400?img=9'
          },
          {
            name: 'Jean & Françoise Petit',
            title: 'Parents de Julie',
            bio: 'Jean et Françoise sont mariés depuis 35 ans et ont élevé Julie avec amour et bienveillance. Ils accueillent Thomas comme leur fils et sont impatients de célébrer cette union qui unit deux familles.',
            photo: 'https://i.pravatar.cc/400?img=25'
          },
          {
            name: 'Pierre & Isabelle Moreau',
            title: 'Parents de Thomas',
            bio: 'Pierre et Isabelle, mariés depuis 38 ans, transmettent leurs valeurs d\'amour et de famille. Ils adorent Julie et sont ravis de l\'accueillir officiellement dans la famille Moreau lors de cette belle journée.',
            photo: 'https://i.pravatar.cc/400?img=30'
          }
        ],

        showcaseFAQ: [
          {
            question: 'À quelle heure dois-je arriver ?',
            answer: 'La cérémonie commence à 14h30 précises. Nous vous recommandons d\'arriver vers 14h00 pour vous installer tranquillement et profiter du lieu.'
          },
          {
            question: 'Y a-t-il un parking au Château ?',
            answer: 'Oui, le Château dispose d\'un grand parking gratuit. Des navettes seront également organisées depuis la gare de Melun (25 min de Paris Gare de Lyon).'
          },
          {
            question: 'Où dormir ?',
            answer: 'Nous avons négocié des tarifs préférentiels dans 3 hôtels à proximité. Les coordonnées vous seront communiquées avec l\'invitation. Des navettes retour seront assurées en fin de soirée.'
          },
          {
            question: 'Puis-je venir avec mes enfants ?',
            answer: 'Bien sûr ! Les enfants sont les bienvenus. Un menu enfant et des animations seront prévus. Précisez-le lors de votre RSVP.'
          },
          {
            question: 'Y a-t-il une liste de mariage ?',
            answer: 'Votre présence est notre plus beau cadeau ! Si vous souhaitez nous gâter, nous avons créé une liste de mariage en ligne et une cagnotte voyage de noces. Le lien sera dans l\'invitation.'
          },
          {
            question: 'Quel est le dress code exactement ?',
            answer: 'Tenue de cérémonie élégante. Mesdames: robes longues ou mi-longues chics. Messieurs: costume-cravate. Les talons aiguilles sont déconseillés (jardins et gravier). Évitez le blanc (réservé à la mariée) et le noir total.'
          },
          {
            question: 'La soirée se déroule en intérieur ou extérieur ?',
            answer: 'La cérémonie et le cocktail seront en extérieur dans les jardins (plan B en salle si pluie). Le dîner et la soirée dansante se dérouleront sous un magnifique chapiteau.'
          },
          {
            question: 'Jusqu\'à quelle heure dure la soirée ?',
            answer: 'La soirée se termine à 2h du matin. Des navettes seront organisées pour Paris et les hôtels partenaires vers 2h30.'
          }
        ],

        showcaseTimeline: [
          {
            time: '14:00',
            title: 'Accueil des invités',
            description: 'Arrivée et rafraîchissements de bienvenue'
          },
          {
            time: '14:30',
            title: 'Cérémonie laïque',
            description: 'Échange des vœux dans les jardins'
          },
          {
            time: '15:30',
            title: 'Photos officielles',
            description: 'Photos de famille et lâcher de colombes'
          },
          {
            time: '16:00',
            title: 'Vin d\'honneur',
            description: 'Cocktail champêtre dans le parc'
          },
          {
            time: '20:00',
            title: 'Dîner gastronomique',
            description: 'Menu 3 services sous chapiteau'
          },
          {
            time: '22:00',
            title: 'Ouverture de bal',
            description: 'Première danse des mariés'
          },
          {
            time: '23:00',
            title: 'Pièce montée & feu d\'artifice',
            description: 'Moment magique avec spectacle pyrotechnique'
          },
          {
            time: '23:30',
            title: 'Soirée dansante',
            description: 'DJ et dancefloor jusqu\'à 2h'
          }
        ],

        adminId: adminDemo.id
      }
    })

    // ====================================
    // 5. ÉVÉNEMENT 4: GALA DE CHARITÉ
    // ====================================
    const eventGala = await prisma.event.create({
      data: {
        name: 'Gala de Charité - Enfance & Avenir',
        slug: 'gala-charite-enfance-avenir',
        startsAt: new Date('2025-09-25T19:00:00Z'),
        endsAt: new Date('2025-09-26T01:00:00Z'),
        venueName: 'Hôtel de Crillon',
        address: '10 Place de la Concorde',
        city: 'Paris',
        country: 'France',
        coverImage: 'https://images.unsplash.com/photo-1511578314322-379afb476865',
        description: `✨ 15ème Gala de Charité au profit de l'association "Enfance & Avenir"

Mesdames, Messieurs, Chers Généreux Donateurs,

C'est avec un immense honneur que nous vous convions à la **15ème édition** de notre Gala de Charité annuel, événement phare qui permet chaque année de transformer des vies.

🎯 **NOTRE MISSION**
Depuis 15 ans, l'association "Enfance & Avenir" œuvre pour offrir un accès à l'éducation aux enfants défavorisés à travers le monde. Grâce à votre générosité, nous avons pu :
• 🏫 Construire 87 écoles dans 12 pays
• 📚 Offrir des bourses à 15 000+ enfants
• 👨‍🏫 Former 2 500 enseignants
• 💻 Équiper 200 salles informatiques

🌟 **LE GALA 2025**
Cette soirée d'exception réunira 300 personnalités du monde des affaires, de la politique et du spectacle dans le cadre prestigieux de l'Hôtel de Crillon, palace mythique de la Place de la Concorde.

🎭 **UNE SOIRÉE EXCEPTIONNELLE**
• **19h00** - Accueil champagne & cocktail VIP
• **20h30** - Dîner gastronomique 5 services
• **22h00** - Concert privé avec Soprano (en exclusivité!)
• **23h00** - Vente aux enchères caritative
• **00h00** - Soirée dansante avec orchestre live

💎 **DRESS CODE**
Black Tie - Tenue de soirée de gala obligatoire
Smoking ou costume sombre pour ces messieurs
Robe longue de soirée pour ces dames

🎁 **IMPACT DE VOTRE PRÉSENCE**
Chaque participation contribue directement à notre mission :
• 150€ = 1 an de scolarité pour un enfant
• 500€ = Équipement d'une classe complète
• 2000€ = Formation d'un enseignant pendant 1 an
• 10000€ = Construction d'une salle de classe

L'intégralité des bénéfices sera reversée à nos programmes éducatifs.

🏆 **INVITÉS D'HONNEUR**
• Madame la Ministre de l'Éducation Nationale
• Plusieurs ambassadeurs et personnalités engagées
• Soprano, parrain de l'association depuis 5 ans

Votre présence et votre générosité changent des vies.

Avec toute notre gratitude,
**Fondation Enfance & Avenir** 💙`,

        program: `**19h00 - 20h00** | Accueil Champagne & Photocall
• Tapis rouge et photocall officiel
• Champagne Krug & canapés gastronomiques
• Cocktails signature au bar
• Trio jazz & ambiance feutrée
• Exposition photos "15 ans d'actions"

**20h00 - 20h30** | Installation en salle de gala
Les invités découvrent la décoration exceptionnelle et prennent place

**20h30 - 21h00** | Discours d'ouverture & Témoignages
• Mot de bienvenue du Président de l'association
• Témoignage vidéo d'enfants bénéficiaires
• Présentation des projets 2025-2026
• Intervention de Madame la Ministre

**21h00 - 23h00** | 🍽️ Dîner Gastronomique 5 Services
Menu créé par le Chef étoilé de l'Hôtel de Crillon

**Amuse-bouche**
Cuillère de foie gras & gelée de Sauternes

**Entrée**
Homard breton, légumes croquants & bisque légère

**Poisson**
Saint-Pierre rôti, risotto aux asperges & truffe noire

**Viande**
Filet de bœuf Wagyu, jus corsé & légumes de saison
_Option végétarienne : Légumes du moment en croûte feuilletée_

**Dessert**
Sphère chocolat-passion, sorbet fruits exotiques

**Mignardises & café**
Accompagnés de Champagne Cristal Roederer

**23h00 - 23h45** | 🎤 Concert Privé - SOPRANO
Concert acoustique exclusif de 45 minutes
Nos plus grands hits revisités pour vous

**23h45 - 00h30** | 🎨 Vente aux Enchères Caritative
Commissaire-priseur : Maître Delacroix de Christie's

Lots d'exception :
• Semaine dans villa privée à Saint-Barthélemy
• Dîner privé avec un Chef 3 étoiles Michelin
• Week-end VIP au Grand Prix de Monaco
• Œuvre originale signée par artiste contemporain
• Séjour safari de luxe au Kenya
• Expérience VIP backstage avec Soprano

**00h30 - 01h00** | 🎵 Soirée Dansante
Orchestre live & DJ
Bar ouvert premium

**01h00** | Clôture & Au revoir
Remerciements finaux et distribution de cadeaux aux participants`,

        dressCode: 'Black Tie - Smoking & Robes longues de soirée 🎩👗',
        rsvpDeadline: new Date('2025-09-10T23:59:59Z'),
        maxPlusOnes: 1,
        allowPlusOnes: true,
        requireMeal: true,
        mealOptions: ['Menu Classique', 'Menu Végétarien', 'Menu Sans gluten', 'Régime spécial (préciser)'],
        enableTransport: true,
        enableLodging: false,
        enableAccessibility: true,
        enablePhotoConsent: true,

        saveTheDateConfig: {
          eventName: 'Gala de Charité',
          tagline: '✨ Enfance & Avenir - 15ème édition',
          dateAnnouncement: '25 Septembre 2025',
          locationHint: 'Hôtel de Crillon, Paris',
          teaserMessage: 'Réservez votre soirée pour le plus grand gala de charité de l\'année ! Dîner gastronomique, concert privé de Soprano et vente aux enchères exceptionnelle. Black Tie exigé. Places limitées.',
          primaryColor: '#1a1a2e',
          secondaryColor: '#c9a227',
          accentColor: '#eee',
          backgroundColor: '#0f0f1e',
          ctaText: 'Réserver ma place 💎',
          ctaAction: 'interest',
          showInterestForm: true,
          showCountdown: true,
          showSocialShare: true,
          animationStyle: 'sparkles',
          footerMessage: 'Votre générosité change des vies • Places limitées à 300 personnes',
          logoImage: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=200',
          headerImage: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200',
        },

        invitationConfig: {
          welcomeMessage: '✨ Vous êtes cordialement invité au Gala de Charité 2025',
          description: 'Soirée d\'exception au profit de l\'association Enfance & Avenir. Dîner gastronomique, concert privé et vente aux enchères.',
          primaryColor: '#1a1a2e',
          secondaryColor: '#c9a227',
          accentColor: '#eee',
          showMap: true,
          showProgram: true,
          showDressCode: true,
          ctaText: 'Confirmer ma présence 💎',
          footerMessage: 'Merci pour votre générosité et votre engagement 💙',
          logoUrl: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=200',
          headerImage: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200',
        },

        rsvpConfig: {
          welcomeMessage: 'Confirmez votre participation au Gala 2025',
          confirmationMessage: 'Merci infiniment pour votre engagement ! Nous sommes honorés de votre présence. À très bientôt ! ✨💙',
          primaryColor: '#1a1a2e',
          accentColor: '#c9a227',
          showMealPreferences: true,
          showPlusOnes: true,
          showAccessibility: true,
          showTransport: true,
          showLodging: false,
          requirePhotoConsent: true,
        },

        showcaseEnabled: true,
        showcaseTitle: 'Gala de Charité 2025',
        showcaseSubtitle: 'Enfance & Avenir • 25 Septembre 2025 • Hôtel de Crillon, Paris',
        showcaseBannerImage: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1920',
        showcaseTheme: 'elegant',
        showcasePrimaryColor: '#1a1a2e',
        showcaseSecondaryColor: '#c9a227',
        showcaseCountdown: true,
        showcaseSocialShare: true,
        showcaseVideo: 'https://www.youtube.com/embed/0yW7w8F2TVA',

        showcaseGallery: [
          'https://images.unsplash.com/photo-1511578314322-379afb476865',
          'https://images.unsplash.com/photo-1519167758481-83f29da8c43f',
          'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3',
          'https://images.unsplash.com/photo-1478146896981-b80fe463b330',
          'https://images.unsplash.com/photo-1505236858219-8359eb29e329',
          'https://images.unsplash.com/photo-1492684223066-81342ee5ff30'
        ],

        showcaseSpeakers: [
          {
            name: 'Dr. Catherine Beaumont',
            title: 'Présidente - Fondation Enfance & Avenir',
            bio: 'Ancienne directrice de l\'UNICEF France, Catherine a fondé Enfance & Avenir il y a 15 ans après une mission humanitaire bouleversante en Afrique. Sous sa direction, l\'association a construit 87 écoles et aidé 15 000+ enfants. Elle a reçu la Légion d\'Honneur en 2022 pour son engagement.',
            photo: 'https://i.pravatar.cc/400?img=1',
            linkedin: 'https://linkedin.com/in/catherinebeaumont'
          },
          {
            name: 'Soprano',
            title: 'Parrain de l\'association & Artiste',
            bio: 'Rappeur multi-platine et artiste engagé, Soprano est parrain d\'Enfance & Avenir depuis 5 ans. Originaire des Comores, il connaît l\'importance de l\'éducation et s\'investit personnellement dans le financement de 3 écoles en Afrique. Il offrira un concert privé exclusif lors du gala.',
            photo: 'https://i.pravatar.cc/400?img=12',
            twitter: '@Sopranopsy4',
            linkedin: 'https://linkedin.com/in/soprano'
          },
          {
            name: 'Amélie Rousseau',
            title: 'Ministre de l\'Éducation Nationale',
            bio: 'Madame la Ministre a fait de l\'accès universel à l\'éducation une priorité de son ministère. Elle soutient activement les initiatives d\'Enfance & Avenir et interviendra lors du gala pour présenter le nouveau partenariat public-privé.',
            photo: 'https://i.pravatar.cc/400?img=5'
          },
          {
            name: 'Jean-Philippe Marchand',
            title: 'Ambassadeur de France au Sénégal',
            bio: 'Diplomate de carrière passionné par la coopération éducative, Jean-Philippe a facilité l\'implantation de 12 écoles d\'Enfance & Avenir en Afrique de l\'Ouest. Il témoignera de l\'impact concret de vos dons sur le terrain.',
            photo: 'https://i.pravatar.cc/400?img=13'
          },
          {
            name: 'Fatou Diallo',
            title: 'Ancienne bénéficiaire, aujourd\'hui médecin',
            bio: 'Fatou a été l\'une des premières bénéficiaires d\'une bourse d\'Enfance & Avenir en 2010. Grâce à votre soutien, elle a pu faire des études de médecine et retourne maintenant soigner dans son village natal au Mali. Son témoignage vidéo sera diffusé lors du gala.',
            photo: 'https://i.pravatar.cc/400?img=9'
          },
          {
            name: 'Pierre Delacroix',
            title: 'Commissaire-priseur - Christie\'s Paris',
            bio: 'Expert en art contemporain et commissaire-priseur réputé, Pierre anime bénévolement la vente aux enchères du gala depuis 10 ans. Grâce à son talent, les enchères ont rapporté plus de 2M€ à l\'association.',
            photo: 'https://i.pravatar.cc/400?img=14',
            linkedin: 'https://linkedin.com/in/pierredelacroix'
          }
        ],

        showcaseSponsors: [
          {
            name: 'Groupe LVMH',
            logo: 'https://via.placeholder.com/300x120/1a1a2e/FFFFFF?text=LVMH',
            website: 'https://lvmh.com',
            tier: 'platinum',
            description: 'Mécène Platinum - 100 000€'
          },
          {
            name: 'BNP Paribas',
            logo: 'https://via.placeholder.com/300x120/00915a/FFFFFF?text=BNP+Paribas',
            website: 'https://bnpparibas.com',
            tier: 'platinum',
            description: 'Mécène Platinum - 100 000€'
          },
          {
            name: 'Fondation Total',
            logo: 'https://via.placeholder.com/300x120/c9a227/000000?text=TOTAL',
            website: 'https://fondation.total.com',
            tier: 'gold',
            description: 'Mécène Gold - 50 000€'
          },
          {
            name: 'Air France',
            logo: 'https://via.placeholder.com/300x120/002157/FFFFFF?text=Air+France',
            website: 'https://airfrance.com',
            tier: 'gold',
            description: 'Mécène Gold - 50 000€'
          },
          {
            name: 'Accor Hotels',
            logo: 'https://via.placeholder.com/300x120/8b0000/FFFFFF?text=ACCOR',
            website: 'https://accor.com',
            tier: 'silver',
            description: 'Mécène Silver - 25 000€'
          },
          {
            name: 'Veuve Clicquot',
            logo: 'https://via.placeholder.com/300x120/f39c12/000000?text=Veuve+Clicquot',
            website: 'https://veuveclicquot.com',
            tier: 'silver',
            description: 'Partenaire Champagne'
          }
        ],

        showcaseFAQ: [
          {
            question: 'Quel est le tarif de participation ?',
            answer: 'La participation au gala est de 500€ par personne, entièrement déductibles des impôts à 66%. Cette contribution inclut le dîner gastronomique, le concert et l\'accès à la vente aux enchères.'
          },
          {
            question: 'Comment sont utilisés les fonds collectés ?',
            answer: '100% des bénéfices sont reversés à nos programmes éducatifs. Les frais d\'organisation sont pris en charge par nos sponsors. Chaque euro que vous donnez va directement aux enfants.'
          },
          {
            question: 'Puis-je faire un don supplémentaire ?',
            answer: 'Absolument ! Vous pourrez faire des dons lors de la vente aux enchères, ou directement en ligne. Tous les dons sont éligibles à une réduction fiscale de 66%.'
          },
          {
            question: 'Le dress code est-il vraiment obligatoire ?',
            answer: 'Oui, le gala est un événement Black Tie. Messieurs: smoking ou costume sombre. Dames: robe longue de soirée. L\'élégance fait partie de l\'expérience et du prestige de la soirée.'
          },
          {
            question: 'Y a-t-il un service voiturier ?',
            answer: 'Oui, un service de voiturier gratuit sera assuré toute la soirée à l\'entrée de l\'Hôtel de Crillon. Des taxis et VTC seront également disponibles en fin de soirée.'
          },
          {
            question: 'Puis-je rencontrer Soprano ?',
            answer: 'Soprano donnera un concert et sera présent durant la soirée. Les donateurs VIP (2000€+) auront accès à un cocktail privé avec lui avant le dîner.'
          },
          {
            question: 'Comment participer aux enchères ?',
            answer: 'Tous les invités peuvent participer. Les lots seront présentés après le concert. Vous recevrez une palette numérotée à votre arrivée. Enchères en salle et en ligne simultanées.'
          },
          {
            question: 'Y a-t-il des tables VIP ?',
            answer: 'Oui, des tables VIP (10 personnes) sont disponibles pour 8000€. Elles incluent: emplacement privilégié, champagne premium, rencontre avec Soprano et reconnaissance officielle lors du gala.'
          }
        ],

        showcaseTimeline: [
          {
            time: '19:00',
            title: 'Accueil Champagne',
            description: 'Tapis rouge, photocall et cocktail VIP'
          },
          {
            time: '20:30',
            title: 'Discours d\'ouverture',
            description: 'Présentation des projets 2025'
          },
          {
            time: '21:00',
            title: 'Dîner gastronomique',
            description: 'Menu 5 services by Chef étoilé'
          },
          {
            time: '23:00',
            title: 'Concert Soprano',
            description: 'Performance acoustique exclusive'
          },
          {
            time: '23:45',
            title: 'Vente aux enchères',
            description: 'Lots d\'exception pour la bonne cause'
          },
          {
            time: '00:30',
            title: 'Soirée dansante',
            description: 'Orchestre live & DJ'
          }
        ],

        adminId: adminDemo.id
      }
    })

    // ====================================
    // 6. ÉVÉNEMENT 5: WORKSHOP LEADERSHIP
    // ====================================
    const eventWorkshop = await prisma.event.create({
      data: {
        name: 'Workshop Leadership Transformationnel',
        slug: 'workshop-leadership-2025',
        startsAt: new Date('2025-10-08T09:00:00Z'),
        endsAt: new Date('2025-10-10T17:00:00Z'),
        venueName: 'Domaine de Chantilly - Centre de Séminaires',
        address: '7 Rue du Connétable',
        city: 'Chantilly',
        country: 'France',
        coverImage: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2',
        description: `🎯 Développez votre Leadership pour l'ère Moderne

**3 jours intensifs pour transformer votre approche du leadership**

Dans un monde en mutation permanente, les leaders d'aujourd'hui doivent réinventer leur approche. Ce workshop exclusif de 3 jours vous permettra de développer un leadership authentique, inspirant et adapté aux défis contemporains.

🌟 **POUR QUI ?**
Ce programme s'adresse aux dirigeants, cadres supérieurs et entrepreneurs qui souhaitent :
• Développer leur impact et leur influence
• Inspirer et motiver leurs équipes
• Naviguer efficacement dans la complexité
• Aligner valeurs personnelles et pratiques professionnelles
• Construire une culture d'innovation et d'engagement

💡 **APPROCHE PÉDAGOGIQUE**
Notre méthodologie unique combine :
• **Ateliers interactifs** - Mise en pratique immédiate des concepts
• **Coaching individuel** - 2 sessions privées avec nos experts
• **Intelligence collective** - Partage d'expériences entre pairs
• **Neurosciences** - Techniques basées sur la science du cerveau
• **Mindfulness** - Pratiques de présence et de centrage

📚 **LES 5 PILIERS DU PROGRAMME**

🧠 **1. Conscience de Soi**
Comprendre vos forces, zones d'ombre et moteurs profonds

💬 **2. Communication Inspirante**
Maîtriser l'art du storytelling et de l'influence positive

🤝 **3. Intelligence Émotionnelle**
Développer empathie, écoute et gestion des émotions

⚡ **4. Agilité Décisionnelle**
Décider efficacement en contexte d'incertitude

🌱 **5. Leadership Régénératif**
Créer des organisations durables et humaines

🎁 **INCLUS DANS VOTRE PARTICIPATION**
✓ 3 jours de formation intensive (21h)
✓ 2 sessions de coaching individuel (1h chacune)
✓ Hébergement 3 nuits au Domaine de Chantilly****
✓ Tous les repas gastronomiques inclus
✓ Kit participant (livre, journal, outils)
✓ Accès plateforme e-learning pendant 6 mois
✓ Certification "Leadership Transformationnel"
✓ Intégration communauté alumni

👥 **VOS FACILITATEURS**
Une équipe d'experts reconnus internationalement dans le leadership, la psychologie organisationnelle et le coaching exécutif.

📍 **LE LIEU**
Le Domaine de Chantilly offre un cadre d'exception propice à la réflexion et à la transformation. Château historique, jardins à la française et équipements modernes.

⚠️ **PLACES LIMITÉES**
Maximum 20 participants pour garantir un accompagnement personnalisé et des échanges de qualité.

🏆 **CERTIFICATION**
À l'issue du workshop, vous recevrez une certification reconnue "Leadership Transformationnel" validant 21h de formation professionnelle continue.

Investissez dans votre développement. Transformez votre leadership.`,

        program: `**JOUR 1 - Mardi 8 Octobre 2025 - CONSCIENCE & FONDATIONS**

**08h30 - 09h00** | Accueil & Petit-déjeuner
Installation dans les salons du Château

**09h00 - 09h30** | Cérémonie d'Ouverture
• Présentation du programme et des facilitateurs
• Exercice de présence et intention
• Création du contrat de groupe

**09h30 - 12h30** | Module 1: Conscience de Soi
🧠 **Le Leader Conscient**
• Atelier: Cartographie de votre leadership actuel
• Assessment 360° - Résultats et débriefing
• Identification de vos forces et zones d'ombre
• Vos valeurs profondes et leur expression au quotidien

**12h30 - 14h00** | Déjeuner Networking
Buffet gastronomique dans l'orangerie

**14h00 - 17h00** | Module 2: Votre Identité de Leader
✨ **Qui êtes-vous vraiment ?**
• Exploration de votre parcours et moments clés
• Votre "pourquoi" profond (exercice Golden Circle)
• Construction de votre manifeste personnel
• Partage en cercle de confiance

**17h00 - 17h30** | Pause & Réflexion personnelle

**17h30 - 19h00** | 1ère Session de Coaching Individuel
Rendez-vous privés avec les coachs (groupes tournants)

**19h00 - 20h00** | Pratique de Centrage
Méditation guidée & exercices de présence

**20h00 - 22h00** | Dîner convivial
Échanges libres dans une ambiance détendue


**JOUR 2 - Mercredi 9 Octobre 2025 - COMMUNICATION & INFLUENCE**

**08h00 - 08h30** | Pratique matinale
Yoga ou marche méditative dans les jardins

**08h30 - 09h00** | Petit-déjeuner énergisant

**09h00 - 12h30** | Module 3: Communication Inspirante
💬 **L'Art d'Influencer Positivement**
• Neurosciences de la communication
• Storytelling: raconter pour inspirer
• Prise de parole en public - Atelier pratique
• Feedback transformationnel
• Conversations difficiles: techniques avancées

**12h30 - 14h00** | Déjeuner

**14h00 - 17h00** | Module 4: Intelligence Émotionnelle
🤝 **Le Leadership du Cœur**
• Comprendre et réguler vos émotions
• Développer l'empathie authentique
• L'écoute profonde (Deep Listening)
• Gérer les résistances et les conflits
• Créer la sécurité psychologique

**17h00 - 17h30** | Pause

**17h30 - 19h00** | Atelier: Cas Pratiques
Simulation de situations managériales complexes
Débriefing collectif et partage d'apprentissages

**19h00 - 20h00** | Temps libre
Promenade dans le parc ou repos

**20h00 - 22h30** | Dîner Gala
Soirée spéciale avec invité surprise (leader inspirant)


**JOUR 3 - Jeudi 10 Octobre 2025 - AGILITÉ & IMPACT**

**08h00 - 08h30** | Pratique matinale

**08h30 - 09h00** | Petit-déjeuner

**09h00 - 12h00** | Module 5: Agilité Décisionnelle
⚡ **Décider dans la Complexité**
• VUCA: comprendre le monde actuel
• Prise de décision en incertitude
• Pensée systémique et vision long terme
• Délégation et empowerment
• L'art du "lâcher-prise"

**12h00 - 13h30** | Déjeuner

**13h30 - 15h30** | Module 6: Leadership Régénératif
🌱 **Créer l'Organisation de Demain**
• Culture d'innovation et d'expérimentation
• Leadership serviteur et distributif
• Développement durable et RSE
• Bien-être et performance
• Votre vision pour votre organisation

**15h30 - 16h00** | Pause

**16h00 - 17h00** | 2ème Session de Coaching Individuel
Élaboration de votre plan d'action personnalisé

**17h00 - 18h00** | Cérémonie de Clôture
• Partage des engagements personnels
• Feedback et apprentissages
• Remise des certifications
• Célébration collective

**18h00** | Au revoir et départs
Navettes vers Paris et gares`,

        dressCode: 'Business casual - Confort privilégié pour les ateliers',
        rsvpDeadline: new Date('2025-09-25T23:59:59Z'),
        maxPlusOnes: 0,
        allowPlusOnes: false,
        requireMeal: true,
        mealOptions: ['Standard', 'Végétarien', 'Vegan', 'Sans gluten', 'Allergies (préciser)'],
        enableTransport: true,
        enableLodging: true,
        enableAccessibility: true,
        enablePhotoConsent: true,

        saveTheDateConfig: {
          eventName: 'Workshop Leadership',
          tagline: '🎯 Transformez votre impact',
          dateAnnouncement: '8-10 Octobre 2025',
          locationHint: 'Domaine de Chantilly',
          teaserMessage: '3 jours intensifs pour développer un leadership authentique et inspirant. Ateliers, coaching individuel, intelligence collective. Places limitées à 20 participants. Certification incluse.',
          primaryColor: '#1e40af',
          secondaryColor: '#3b82f6',
          accentColor: '#60a5fa',
          backgroundColor: '#eff6ff',
          ctaText: 'Je candidate 🚀',
          ctaAction: 'interest',
          showInterestForm: true,
          showCountdown: true,
          showSocialShare: false,
          animationStyle: 'fade',
          footerMessage: 'Sélection sur dossier • Réponse sous 7 jours',
          logoImage: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=200',
          headerImage: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1200',
        },

        invitationConfig: {
          welcomeMessage: '🎯 Vous êtes sélectionné pour le Workshop Leadership Transformationnel',
          description: '3 jours intensifs au Domaine de Chantilly pour développer votre leadership. Ateliers, coaching et certification.',
          primaryColor: '#1e40af',
          secondaryColor: '#3b82f6',
          accentColor: '#60a5fa',
          showMap: true,
          showProgram: true,
          showDressCode: true,
          ctaText: 'Confirmer ma participation 🎯',
          footerMessage: 'Au plaisir de vous accompagner dans votre transformation',
          logoUrl: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=200',
          headerImage: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1200',
        },

        rsvpConfig: {
          welcomeMessage: 'Confirmez votre participation au Workshop',
          confirmationMessage: 'Parfait ! Votre place est réservée. Vous recevrez les détails pratiques par email. À très bientôt ! 🎯',
          primaryColor: '#1e40af',
          accentColor: '#3b82f6',
          showMealPreferences: true,
          showPlusOnes: false,
          showAccessibility: true,
          showTransport: true,
          showLodging: true,
          requirePhotoConsent: true,
        },

        showcaseEnabled: true,
        showcaseTitle: 'Workshop Leadership Transformationnel',
        showcaseSubtitle: '3 jours pour transformer votre impact • 8-10 Oct 2025 • Chantilly',
        showcaseBannerImage: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1920',
        showcaseTheme: 'professional',
        showcasePrimaryColor: '#1e40af',
        showcaseSecondaryColor: '#3b82f6',
        showcaseCountdown: true,
        showcaseSocialShare: false,
        showcaseVideo: 'https://www.youtube.com/embed/UF8uR6Z6KLc',

        showcaseGallery: [
          'https://images.unsplash.com/photo-1475721027785-f74eccf877e2',
          'https://images.unsplash.com/photo-1542744173-8e7e53415bb0',
          'https://images.unsplash.com/photo-1531482615713-2afd69097998',
          'https://images.unsplash.com/photo-1552664730-d307ca884978',
          'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4',
          'https://images.unsplash.com/photo-1556761175-5973dc0f32e7'
        ],

        showcaseSpeakers: [
          {
            name: 'Dr. Marc Renault',
            title: 'Psychologue Organisationnel & Coach Exécutif',
            bio: 'Docteur en psychologie et coach certifié ICF (MCC), Marc accompagne depuis 20 ans des dirigeants de multinationales. Auteur de 3 livres sur le leadership dont le best-seller "Le Leader Authentique". Il a coaché 500+ dirigeants et formé 10 000+ managers à travers le monde.',
            photo: 'https://i.pravatar.cc/400?img=12',
            linkedin: 'https://linkedin.com/in/marcrenault'
          },
          {
            name: 'Sophie Chen',
            title: 'Experte en Intelligence Émotionnelle',
            bio: 'Formée à Harvard et certifiée en neurosciences appliquées, Sophie est une référence mondiale de l\'IE. Elle a travaillé avec Google, Microsoft et L\'Oréal. Son TEDx "L\'empathie au cœur du leadership" compte 2M+ vues.',
            photo: 'https://i.pravatar.cc/400?img=5',
            linkedin: 'https://linkedin.com/in/sophiechen',
            twitter: '@SophieChenIE'
          },
          {
            name: 'Thomas Dubois',
            title: 'Expert en Leadership Agile',
            bio: 'Ancien dirigeant chez McKinsey, Thomas s\'est spécialisé dans la transformation organisationnelle et le leadership agile. Il intervient régulièrement à HEC et à l\'INSEAD. Il a accompagné 50+ transformations d\'entreprises du CAC40.',
            photo: 'https://i.pravatar.cc/400?img=13',
            linkedin: 'https://linkedin.com/in/thomasdubois'
          },
          {
            name: 'Isabelle Martin',
            title: 'Coach en Communication & Storytelling',
            bio: 'Ancienne journaliste et consultante en communication de crise, Isabelle forme les dirigeants à la prise de parole impactante. Elle a préparé 200+ dirigeants pour leurs keynotes, levées de fonds et interventions médias.',
            photo: 'https://i.pravatar.cc/400?img=9',
            linkedin: 'https://linkedin.com/in/isabellemartin'
          },
          {
            name: 'Dr. Jean Moreau',
            title: 'Neuroscientifique & Chercheur',
            bio: 'Docteur en neurosciences de la Sorbonne, Jean traduit les découvertes scientifiques en outils pratiques pour les leaders. Ses recherches sur la neuroplasticité et la prise de décision font autorité. Il intervient au MIT et à Stanford.',
            photo: 'https://i.pravatar.cc/400?img=14',
            linkedin: 'https://linkedin.com/in/jeanmoreau'
          }
        ],

        showcaseFAQ: [
          {
            question: 'À qui s\'adresse ce workshop ?',
            answer: 'Ce programme s\'adresse aux dirigeants, cadres supérieurs (C-level, VP, Directeurs) et entrepreneurs avec minimum 5 ans d\'expérience en management. Un processus de sélection sur dossier garantit l\'homogénéité du groupe.'
          },
          {
            question: 'Quel est l\'investissement ?',
            answer: 'Le tarif est de 4 500€ HT par participant, incluant 3 jours de formation, 2 sessions de coaching, hébergement 3 nuits****, tous les repas, le kit participant et 6 mois d\'accès e-learning. Prise en charge OPCO possible.'
          },
          {
            question: 'Quelle est la taille du groupe ?',
            answer: 'Maximum 20 participants pour garantir un accompagnement personnalisé, des échanges de qualité et 2 sessions de coaching individuel pour chacun.'
          },
          {
            question: 'Vais-je recevoir une certification ?',
            answer: 'Oui, vous recevrez un certificat "Leadership Transformationnel" validant 21h de formation professionnelle continue, reconnu par les principales organisations de coaching (ICF, EMCC).'
          },
          {
            question: 'L\'hébergement est-il inclus ?',
            answer: 'Oui, 3 nuits en chambre individuelle au Domaine de Chantilly**** sont incluses, ainsi que tous les repas (petits-déjeuners, déjeuners, dîners).'
          },
          {
            question: 'Comment se rendre à Chantilly ?',
            answer: 'Chantilly est à 40 min de Paris en train (Gare du Nord). Nous organisons des navettes depuis/vers la gare. Si vous venez en voiture, un parking gratuit est disponible.'
          },
          {
            question: 'Puis-je venir juste pour certains jours ?',
            answer: 'Non, le programme est conçu comme un parcours progressif sur 3 jours. La présence complète est requise pour bénéficier de la certification et de la transformation visée.'
          },
          {
            question: 'Y a-t-il un suivi après le workshop ?',
            answer: 'Oui ! Vous intégrez notre communauté alumni avec accès à une plateforme e-learning pendant 6 mois, webinaires mensuels, et événements de networking trimestriels. Un coach reste disponible pour 2 sessions de suivi à distance.'
          }
        ],

        showcaseTimeline: [
          {
            time: 'J1 - 09:00',
            title: 'Ouverture & Conscience de Soi',
            description: 'Assessment 360° et exploration de votre identité de leader'
          },
          {
            time: 'J1 - 14:00',
            title: 'Votre Leadership Authentique',
            description: 'Construction de votre manifeste personnel'
          },
          {
            time: 'J1 - 17:30',
            title: '1ère session coaching individuel',
            description: 'Rendez-vous privé avec un coach expert'
          },
          {
            time: 'J2 - 09:00',
            title: 'Communication Inspirante',
            description: 'Storytelling et prise de parole impactante'
          },
          {
            time: 'J2 - 14:00',
            title: 'Intelligence Émotionnelle',
            description: 'Empathie, écoute profonde et gestion des émotions'
          },
          {
            time: 'J3 - 09:00',
            title: 'Agilité Décisionnelle',
            description: 'Décider efficacement dans la complexité'
          },
          {
            time: 'J3 - 13:30',
            title: 'Leadership Régénératif',
            description: 'Créer l\'organisation de demain'
          },
          {
            time: 'J3 - 17:00',
            title: 'Clôture & Certification',
            description: 'Partage des engagements et remise des certificats'
          }
        ],

        adminId: adminDemo.id
      }
    })

    // ====================================
    // 6. INVITÉS POUR TOUS LES ÉVÉNEMENTS
    // ====================================

    // Données de démonstration réalistes pour les invités (45 invités)
    const demoGuestsData = [
      // VIP & Speakers (10)
      { firstName: 'Sophie', lastName: 'Martin', email: 'sophie.martin@example.com', company: 'TechCorp', tags: ['VIP', 'Speaker'], attending: true, plusOnes: 1, meal: 'Végétarien', allergies: 'Fruits à coque' },
      { firstName: 'Julie', lastName: 'Bernard', email: 'julie.bernard@example.com', company: 'InnovateCo', tags: ['VIP', 'Speaker'], attending: true, plusOnes: 0, meal: 'Vegan', allergies: null },
      { firstName: 'Emma', lastName: 'Durand', email: 'emma.durand@example.com', company: 'AI Ventures', tags: ['VIP', 'Speaker'], attending: true, plusOnes: 1, meal: 'Standard', allergies: null },
      { firstName: 'Sarah', lastName: 'Gonzalez', email: 'sarah.gonzalez@example.com', company: 'QuantumTech', tags: ['VIP', 'Speaker'], attending: true, plusOnes: 0, meal: 'Kosher', allergies: null },
      { firstName: 'Clara', lastName: 'Torres', email: 'clara.torres@example.com', company: 'CloudNative', tags: ['VIP', 'Speaker'], attending: true, plusOnes: 0, meal: 'Vegan', allergies: null },
      { firstName: 'Vincent', lastName: 'Morales', email: 'vincent.morales@example.com', company: 'DataScience Co', tags: ['VIP', 'Speaker'], attending: true, plusOnes: 2, meal: 'Standard', allergies: null },
      { firstName: 'Ethan', lastName: 'Suarez', email: 'ethan.suarez@example.com', company: 'Redis Labs', tags: ['VIP', 'Speaker'], attending: true, plusOnes: 0, meal: 'Vegan', allergies: null },
      { firstName: 'Mathilde', lastName: 'Ortiz', email: 'mathilde.ortiz@example.com', company: 'AR/VR Studios', tags: ['VIP', 'Speaker'], attending: true, plusOnes: 1, meal: 'Standard', allergies: null },
      { firstName: 'Enzo', lastName: 'Medina', email: 'enzo.medina@example.com', company: 'Microservices Co', tags: ['VIP', 'Speaker'], attending: true, plusOnes: 1, meal: 'Standard', allergies: null },
      { firstName: 'Raphaël', lastName: 'Santos', email: 'raphael.santos@example.com', company: 'Kafka Streams', tags: ['VIP'], attending: true, plusOnes: 1, meal: 'Standard', allergies: 'Arachides' },

      // Sponsors (8)
      { firstName: 'Marc', lastName: 'Dubois', email: 'marc.dubois@example.com', company: 'StartupLab', tags: ['Sponsor'], attending: true, plusOnes: 0, meal: 'Standard', allergies: null },
      { firstName: 'Lucas', lastName: 'Moreau', email: 'lucas.moreau@example.com', company: 'CyberSec', tags: ['Sponsor'], attending: true, plusOnes: 0, meal: 'Halal', allergies: null },
      { firstName: 'Camille', lastName: 'Martinez', email: 'camille.martinez@example.com', company: 'FinTech Pro', tags: ['Sponsor'], attending: true, plusOnes: 0, meal: 'Standard', allergies: null },
      { firstName: 'Arthur', lastName: 'Ruiz', email: 'arthur.ruiz@example.com', company: 'MLOps Inc', tags: ['Sponsor'], attending: true, plusOnes: 1, meal: 'Standard', allergies: null },
      { firstName: 'Louis', lastName: 'Moreno', email: 'louis.moreno@example.com', company: 'API Gateway', tags: ['Sponsor'], attending: true, plusOnes: 0, meal: 'Standard', allergies: null },
      { firstName: 'Noé', lastName: 'Silva', email: 'noe.silva@example.com', company: 'gRPC Systems', tags: ['Sponsor'], attending: true, plusOnes: 2, meal: 'Végétarien', allergies: null },
      { firstName: 'Manon', lastName: 'Sanchez', email: 'manon.sanchez@example.com', company: 'HealthTech', tags: ['Sponsor'], attending: true, plusOnes: 1, meal: 'Standard', allergies: 'Fruits de mer' },
      { firstName: 'Gabriel', lastName: 'Navarro', email: 'gabriel.navarro@example.com', company: '3D Printing Co', tags: ['Sponsor'], attending: null, plusOnes: 0, meal: null, allergies: null },

      // Press & Media (5)
      { firstName: 'Hugo', lastName: 'Garcia', email: 'hugo.garcia@example.com', company: 'MediaTech', tags: ['Press'], attending: true, plusOnes: 1, meal: 'Végétarien', allergies: 'Gluten' },
      { firstName: 'Inès', lastName: 'Rivera', email: 'ines.rivera@example.com', company: 'TechNews', tags: ['Press'], attending: true, plusOnes: 0, meal: 'Vegan', allergies: null },
      { firstName: 'Océane', lastName: 'Jimenez', email: 'oceane.jimenez@example.com', company: 'La Tribune Tech', tags: ['Press'], attending: true, plusOnes: 0, meal: 'Standard', allergies: null },
      { firstName: 'Lucie', lastName: 'Vargas', email: 'lucie.vargas@example.com', company: 'Les Échos', tags: ['Press'], attending: null, plusOnes: 0, meal: null, allergies: null },
      { firstName: 'Victoria', lastName: 'Pena', email: 'victoria.pena@example.com', company: 'France Info', tags: ['Press'], attending: false, plusOnes: 0, meal: null, allergies: null },

      // Participants réguliers (22)
      { firstName: 'Thomas', lastName: 'Petit', email: 'thomas.petit@example.com', company: 'DevStudio', tags: ['Participant'], attending: false, plusOnes: 0, meal: null, allergies: null },
      { firstName: 'Marie', lastName: 'Robert', email: 'marie.robert@example.com', company: 'CloudSystems', tags: ['Participant'], attending: true, plusOnes: 2, meal: 'Standard', allergies: 'Lactose' },
      { firstName: 'Pierre', lastName: 'Richard', email: 'pierre.richard@example.com', company: 'DataCorp', tags: ['Participant'], attending: true, plusOnes: 0, meal: 'Végétarien', allergies: null },
      { firstName: 'Chloé', lastName: 'Simon', email: 'chloe.simon@example.com', company: 'GreenTech', tags: ['Participant'], attending: null, plusOnes: 0, meal: null, allergies: null },
      { firstName: 'Antoine', lastName: 'Laurent', email: 'antoine.laurent@example.com', company: 'BlockchainHub', tags: ['Participant'], attending: true, plusOnes: 1, meal: 'Vegan', allergies: null },
      { firstName: 'Léa', lastName: 'Michel', email: 'lea.michel@example.com', company: 'DesignLab', tags: ['Participant'], attending: true, plusOnes: 0, meal: 'Standard', allergies: null },
      { firstName: 'Alexandre', lastName: 'Lopez', email: 'alexandre.lopez@example.com', company: 'IoT Solutions', tags: ['Participant'], attending: false, plusOnes: 0, meal: null, allergies: null },
      { firstName: 'Maxime', lastName: 'Rodriguez', email: 'maxime.rodriguez@example.com', company: 'RoboticsCo', tags: ['Participant'], attending: true, plusOnes: 2, meal: 'Standard', allergies: null },
      { firstName: 'Laura', lastName: 'Hernandez', email: 'laura.hernandez@example.com', company: 'EcoTech', tags: ['Participant'], attending: null, plusOnes: 0, meal: null, allergies: null },
      { firstName: 'Nicolas', lastName: 'Perez', email: 'nicolas.perez@example.com', company: 'SmartCity', tags: ['Participant'], attending: true, plusOnes: 0, meal: 'Vegan', allergies: null },
      { firstName: 'Julien', lastName: 'Ramirez', email: 'julien.ramirez@example.com', company: 'EdTech Plus', tags: ['Participant'], attending: true, plusOnes: 0, meal: 'Végétarien', allergies: null },
      { firstName: 'Quentin', lastName: 'Flores', email: 'quentin.flores@example.com', company: 'AutoTech', tags: ['Participant'], attending: false, plusOnes: 0, meal: null, allergies: null },
      { firstName: 'Romain', lastName: 'Gomez', email: 'romain.gomez@example.com', company: 'NanoTech', tags: ['Participant'], attending: true, plusOnes: 0, meal: 'Standard', allergies: null },
      { firstName: 'Anaïs', lastName: 'Diaz', email: 'anais.diaz@example.com', company: 'GameDev Studio', tags: ['Participant'], attending: null, plusOnes: 0, meal: null, allergies: null },
      { firstName: 'Zoé', lastName: 'Alvarez', email: 'zoe.alvarez@example.com', company: 'WebDev Agency', tags: ['Participant'], attending: true, plusOnes: 0, meal: 'Vegan', allergies: 'Soja' },
      { firstName: 'Baptiste', lastName: 'Castillo', email: 'baptiste.castillo@example.com', company: 'MobileTech', tags: ['Participant'], attending: false, plusOnes: 0, meal: null, allergies: null },
      { firstName: 'Tom', lastName: 'Cruz', email: 'tom.cruz@example.com', company: 'DevOps Pro', tags: ['Participant'], attending: true, plusOnes: 0, meal: 'Standard', allergies: null },
      { firstName: 'Elise', lastName: 'Reyes', email: 'elise.reyes@example.com', company: 'UX Design Lab', tags: ['Participant'], attending: true, plusOnes: 1, meal: 'Vegan', allergies: null },
      { firstName: 'Jade', lastName: 'Romero', email: 'jade.romero@example.com', company: 'NetworkSec', tags: ['Participant'], attending: true, plusOnes: 0, meal: 'Végétarien', allergies: null },
      { firstName: 'Nathan', lastName: 'Gutierrez', email: 'nathan.gutierrez@example.com', company: 'Container Tech', tags: ['Participant'], attending: false, plusOnes: 0, meal: null, allergies: null },
      { firstName: 'Lola', lastName: 'Aguilar', email: 'lola.aguilar@example.com', company: 'Serverless Inc', tags: ['Participant'], attending: true, plusOnes: 0, meal: 'Standard', allergies: null },
      { firstName: 'Mila', lastName: 'Ortega', email: 'mila.ortega@example.com', company: 'EventMesh', tags: ['Participant'], attending: null, plusOnes: 0, meal: null, allergies: null },
      { firstName: 'Adam', lastName: 'Castro', email: 'adam.castro@example.com', company: 'GraphQL Hub', tags: ['Participant'], attending: true, plusOnes: 0, meal: 'Vegan', allergies: null },
      { firstName: 'Juliette', lastName: 'Mendez', email: 'juliette.mendez@example.com', company: 'RestAPI Pro', tags: ['Participant'], attending: true, plusOnes: 0, meal: 'Standard', allergies: null },
      { firstName: 'Alice', lastName: 'Ramos', email: 'alice.ramos@example.com', company: 'WebSocket Tech', tags: ['Participant'], attending: true, plusOnes: 0, meal: 'Standard', allergies: null },
      { firstName: 'Lily', lastName: 'Figueroa', email: 'lily.figueroa@example.com', company: 'MongoDB Inc', tags: ['Participant'], attending: true, plusOnes: 0, meal: 'Standard', allergies: null },
      { firstName: 'Dylan', lastName: 'Leon', email: 'dylan.leon@example.com', company: 'PostgreSQL Pro', tags: ['Participant'], attending: null, plusOnes: 0, meal: null, allergies: null }
    ]

    // Liste des événements créés
    const allEventsForGuests = [
      eventTechSummit,
      eventWeevup,
      eventWedding,
      eventGala,
      eventWorkshop
    ]

    let totalGuestsCreated = 0
    let totalRsvpsCreated = 0

    // Créer des invités pour chaque événement
    for (const event of allEventsForGuests) {
      for (let i = 0; i < demoGuestsData.length; i++) {
        const guestData = demoGuestsData[i]
        const token = generateToken()
        const tokenHash = hashToken(token)

        // Déterminer le statut en fonction de la réponse
        let status: GuestStatus
        if (guestData.attending === null) {
          status = GuestStatus.INVITED
        } else {
          status = GuestStatus.RESPONDED
        }

        // Créer un email unique pour chaque événement
        const uniqueEmail = `${guestData.email.split('@')[0]}+${event.slug}@${guestData.email.split('@')[1]}`

        const guest = await prisma.guest.create({
          data: {
            eventId: event.id,
            firstName: guestData.firstName,
            lastName: guestData.lastName,
            email: uniqueEmail,
            company: guestData.company,
            tags: guestData.tags,
            token: token,
            tokenHash: tokenHash,
            tokenExpiry: new Date('2025-12-31'),
            status: status,
            lastEmailAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
          }
        })

        totalGuestsCreated++

        // Créer un RSVP si le guest a répondu
        if (guestData.attending !== null) {
          await prisma.rSVP.create({
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

          totalRsvpsCreated++
        }
      }
    }

    // ====================================
    // 7. EMAIL LOGS & TRACKINGS
    // ====================================
    let totalEmailLogsCreated = 0
    let totalEmailTrackingsCreated = 0
    let totalCheckinsCreated = 0

    // Pour chaque événement, créer des logs d'emails et des trackings
    let trackingCounter = 0
    for (const event of allEventsForGuests) {
      const guests = await prisma.guest.findMany({
        where: { eventId: event.id }
      })

      for (const guest of guests) {
        // Save the Date (envoyé à tous) - 2 mois avant
        const saveTheDateSentAt = new Date(event.startsAt)
        saveTheDateSentAt.setMonth(saveTheDateSentAt.getMonth() - 2)

        await prisma.emailLog.create({
          data: {
            eventId: event.id,
            guestId: guest.id,
            type: EmailType.SAVE_THE_DATE,
            status: EmailStatus.OPENED,
            subject: `📅 Save the Date - ${event.name}`,
            providerId: `sg_${Math.random().toString(36).substring(7)}`,
            sentAt: saveTheDateSentAt,
            openedAt: new Date(saveTheDateSentAt.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000),
            clickedAt: Math.random() > 0.5 ? new Date(saveTheDateSentAt.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000) : null
          }
        })
        totalEmailLogsCreated++

        // Email Tracking Save the Date
        trackingCounter++
        await prisma.emailTracking.create({
          data: {
            id: `${event.id}-${guest.id}-std-${trackingCounter}`,
            eventId: event.id,
            guestId: guest.id,
            type: 'save-the-date',
            status: 'opened',
            sentAt: saveTheDateSentAt,
            openedAt: new Date(saveTheDateSentAt.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000),
            clickedAt: Math.random() > 0.5 ? new Date(saveTheDateSentAt.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000) : null
          }
        })
        totalEmailTrackingsCreated++

        // Invitation officielle (envoyée à tous) - 1 mois avant
        const invitationSentAt = new Date(event.startsAt)
        invitationSentAt.setMonth(invitationSentAt.getMonth() - 1)

        const invitationStatus = Math.random() > 0.95 ? EmailStatus.BOUNCED :
                                Math.random() > 0.1 ? EmailStatus.OPENED : EmailStatus.DELIVERED

        await prisma.emailLog.create({
          data: {
            eventId: event.id,
            guestId: guest.id,
            type: EmailType.INVITATION,
            status: invitationStatus,
            subject: `🎟️ Vous êtes invité à ${event.name}`,
            providerId: `sg_${Math.random().toString(36).substring(7)}`,
            sentAt: invitationSentAt,
            openedAt: invitationStatus === EmailStatus.OPENED ?
                      new Date(invitationSentAt.getTime() + Math.random() * 5 * 24 * 60 * 60 * 1000) : null,
            clickedAt: invitationStatus === EmailStatus.OPENED && Math.random() > 0.4 ?
                       new Date(invitationSentAt.getTime() + Math.random() * 5 * 24 * 60 * 60 * 1000) : null,
            bouncedAt: invitationStatus === EmailStatus.BOUNCED ? invitationSentAt : null,
            error: invitationStatus === EmailStatus.BOUNCED ? 'Email address not found' : null
          }
        })
        totalEmailLogsCreated++

        // Email Tracking Invitation
        trackingCounter++
        await prisma.emailTracking.create({
          data: {
            id: `${event.id}-${guest.id}-inv-${trackingCounter}`,
            eventId: event.id,
            guestId: guest.id,
            type: 'invitation',
            status: invitationStatus === EmailStatus.BOUNCED ? 'failed' : invitationStatus === EmailStatus.OPENED ? 'opened' : 'delivered',
            sentAt: invitationSentAt,
            openedAt: invitationStatus === EmailStatus.OPENED ? new Date(invitationSentAt.getTime() + Math.random() * 5 * 24 * 60 * 60 * 1000) : null,
            clickedAt: invitationStatus === EmailStatus.OPENED && Math.random() > 0.4 ? new Date(invitationSentAt.getTime() + Math.random() * 5 * 24 * 60 * 60 * 1000) : null
          }
        })
        totalEmailTrackingsCreated++

        // Rappel (seulement pour ceux qui n'ont pas encore répondu)
        if (guest.status === GuestStatus.INVITED) {
          const reminderSentAt = new Date(event.startsAt)
          reminderSentAt.setDate(reminderSentAt.getDate() - 10)

          await prisma.emailLog.create({
            data: {
              eventId: event.id,
              guestId: guest.id,
              type: EmailType.REMINDER,
              status: Math.random() > 0.2 ? EmailStatus.OPENED : EmailStatus.DELIVERED,
              subject: `⏰ Rappel - Confirmez votre présence à ${event.name}`,
              providerId: `sg_${Math.random().toString(36).substring(7)}`,
              sentAt: reminderSentAt,
              openedAt: Math.random() > 0.2 ?
                        new Date(reminderSentAt.getTime() + Math.random() * 3 * 24 * 60 * 60 * 1000) : null
            }
          })
          totalEmailLogsCreated++
        }

        // Confirmation (pour ceux qui ont dit oui)
        if (guest.status === GuestStatus.RESPONDED) {
          const rsvp = await prisma.rSVP.findUnique({
            where: { guestId: guest.id }
          })

          if (rsvp?.attending) {
            const confirmationSentAt = new Date(rsvp.createdAt.getTime() + 60000)

            await prisma.emailLog.create({
              data: {
                eventId: event.id,
                guestId: guest.id,
                type: EmailType.CONFIRMATION,
                status: EmailStatus.OPENED,
                subject: `✅ Votre participation à ${event.name} est confirmée!`,
                providerId: `sg_${Math.random().toString(36).substring(7)}`,
                sentAt: confirmationSentAt,
                openedAt: new Date(confirmationSentAt.getTime() + Math.random() * 24 * 60 * 60 * 1000)
              }
            })
            totalEmailLogsCreated++

            // Créer des check-ins simulés pour certains invités confirmés (60% de chance)
            if (Math.random() > 0.4) {
              await prisma.checkin.create({
                data: {
                  eventId: event.id,
                  guestId: guest.id,
                  qrCodeId: rsvp.qrCodeId,
                  checkedInAt: new Date(event.startsAt.getTime() - Math.random() * 60 * 60 * 1000),
                  desk: ['A', 'B', 'C'][Math.floor(Math.random() * 3)],
                  notes: guest.tags.includes('VIP') ? 'Badge VIP délivré' : Math.random() > 0.8 ? 'Badge standard' : undefined
                }
              })
              totalCheckinsCreated++
            }
          }
        }
      }
    }

    const allEvents = await prisma.event.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        startsAt: true,
        venueName: true,
        city: true,
      },
      orderBy: {
        startsAt: 'asc'
      }
    })

    return NextResponse.json({
      message: '✅ Base de données peuplée avec des données de démonstration complètes!',
      summary: {
        events: allEvents.length,
        guests: totalGuestsCreated,
        rsvps: totalRsvpsCreated,
        emailLogs: totalEmailLogsCreated,
        emailTrackings: totalEmailTrackingsCreated,
        checkins: totalCheckinsCreated,
        emailTemplates: 4,
        emailIntegration: 1,
        admins: 2
      },
      events: allEvents.map(e => ({
        id: e.id,
        name: e.name,
        slug: e.slug,
        date: e.startsAt.toLocaleDateString('fr-FR'),
        location: `${e.venueName}, ${e.city}`,
        showcaseUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/events/${e.slug}`,
        guestsCount: demoGuestsData.length
      })),
      details: {
        guestsPerEvent: demoGuestsData.length,
        guestCategories: {
          'VIP & Speakers': 10,
          'Sponsors': 8,
          'Press': 5,
          'Participants': 22
        },
        emailTypes: {
          'Save the Date': totalGuestsCreated,
          'Invitation': totalGuestsCreated,
          'Reminder': '~30% des invités',
          'Confirmation': '~70% des confirmés'
        }
      },
      admins: [
        { email: adminWeevup.email, role: 'Admin Weevup' },
        { email: adminDemo.email, role: 'Admin Demo' }
      ]
    })
  } catch (error) {
    console.error('Error seeding database:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
