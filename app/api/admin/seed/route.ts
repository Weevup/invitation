import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateGuestToken, hashToken } from '@/lib/auth'

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
    // 1. UTILISATEUR ADMIN
    // ====================================
    const adminWeevup = await prisma.user.upsert({
      where: { email: 'contact@weevup.com' },
      update: {},
      create: {
        email: 'contact@weevup.com',
        role: 'ADMIN'
      }
    })

    // ====================================
    // 2. ÉVÉNEMENT 1 - 10 ANS WEEVUP
    // ====================================
    const event10AnsWeevup = await prisma.event.create({
      data: {
        userId: adminWeevup.id,
        name: '10 ans Weevup - Célébration',
        slug: '10-ans-weevup-celebration',
        description: 'Une soirée exceptionnelle pour célébrer 10 années d\'innovation et de succès avec Weevup',
        startsAt: new Date('2025-06-20T19:00:00'),
        endsAt: new Date('2025-06-20T23:59:00'),
        timezone: 'Europe/Paris',
        venueName: 'Le Pavillon Royal',
        venueAddress: '148 Avenue des Champs-Élysées',
        city: 'Paris',
        postalCode: '75008',
        country: 'France',
        capacity: 200,
        isPublic: false,
        status: 'DRAFT',
        primaryColor: '#004645',
        secondaryColor: '#009197',
        accentColor: '#FF4713',

        // Save the Date
        saveTheDateEnabled: true,
        saveTheDateTitle: 'Save the Date - 10 ans Weevup',
        saveTheDateSubtitle: 'Une décennie d\'innovation à célébrer ensemble',
        saveTheDateMessage: `Cher(e)s ami(e)s de Weevup,

C'est avec une immense fierté et émotion que nous vous annonçons une soirée exceptionnelle pour célébrer 10 années d'aventure entrepreneuriale.

Depuis 2015, Weevup accompagne les entreprises dans leur transformation digitale avec passion et innovation. Cette réussite, c'est avant tout grâce à vous : nos clients, partenaires, collaborateurs et amis.

Réservez dès maintenant votre soirée du 20 juin 2025 pour une célébration mémorable au cœur de Paris !

Au programme : cocktail dînatoire, animations surprises, rétrospective en images, et bien sûr... des surprises !

L'invitation officielle avec tous les détails suivra prochainement.

À très bientôt,
L'équipe Weevup`,
        saveTheDateImageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200',
        saveTheDateBackgroundColor: '#004645',
        saveTheDateTextColor: '#FFFFFF',
        saveTheDateSendDate: new Date('2025-02-01T10:00:00'),

        // Invitation
        invitationEnabled: true,
        invitationTitle: 'Vous êtes invité à célébrer les 10 ans de Weevup',
        invitationSubtitle: 'Une soirée exceptionnelle pour célébrer ensemble',
        invitationMessage: `Cher(e) {{firstName}} {{lastName}},

C'est avec un immense plaisir que nous vous invitons à notre soirée de célébration des 10 ans de Weevup.

Cette décennie a été marquée par des innovations, des rencontres extraordinaires et des projets passionnants. Vous avez contribué, de près ou de loin, à cette belle aventure et nous tenons à partager ce moment unique avec vous.

**Au programme de la soirée :**

🥂 **19h00 - Accueil & Cocktail**
Champagne de bienvenue et amuse-bouches gastronomiques

🎭 **20h00 - Rétrospective & Surprises**
Retour sur 10 ans d'aventure en images et vidéos
Témoignages de clients et partenaires

🍽️ **21h00 - Dîner Gastronomique**
Menu conçu par notre chef étoilé
Accords mets & vins d'exception

🎵 **22h30 - Soirée Dansante**
DJ set et ambiance festive jusqu'au bout de la nuit

**Dress code :** Élégant / Cocktail

Nous serions ravis de vous compter parmi nous pour cette soirée mémorable.

Merci de confirmer votre présence avant le 1er juin 2025.

Au plaisir de vous retrouver,

L'équipe Weevup`,
        invitationImageUrl: 'https://images.unsplash.com/photo-1519167758481-83f29da5b775?w=1200',
        invitationBackgroundColor: '#FFFFFF',
        invitationTextColor: '#004645',
        invitationDressCode: 'Élégant / Cocktail',
        invitationSendDate: new Date('2025-04-01T10:00:00'),

        // RSVP Configuration
        rsvpEnabled: true,
        rsvpDeadline: new Date('2025-06-01T23:59:59'),
        rsvpMessage: 'Merci de confirmer votre présence avant le 1er juin 2025. Vos préférences nous aideront à organiser une soirée parfaite.',
        rsvpAllowPlusOnes: true,
        rsvpMaxPlusOnes: 1,
        rsvpCollectMealPreference: true,
        rsvpMealOptions: ['Menu Omnivore', 'Menu Végétarien', 'Menu Vegan', 'Menu Sans Gluten'],
        rsvpCollectAllergies: true,
        rsvpCollectDietaryRestrictions: true,
        rsvpCollectAccessibility: true,
        rsvpCollectTransport: true,
        rsvpCollectAccommodation: true,
        rsvpCollectPhotoConsent: true,
        rsvpCustomQuestions: [
          {
            question: 'Quelle année vous a le plus marqué chez Weevup ?',
            type: 'text',
            required: false
          },
          {
            question: 'Souhaitez-vous prendre la parole lors de la soirée ?',
            type: 'choice',
            options: ['Oui, avec plaisir', 'Peut-être', 'Non merci'],
            required: false
          }
        ],

        // Showcase Configuration
        showcaseEnabled: true,
        showcaseHeroTitle: '10 Ans d\'Innovation',
        showcaseHeroSubtitle: '2015 - 2025 : Une décennie de transformation digitale',
        showcaseHeroImageUrl: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1920',
        showcaseAboutTitle: 'Une Décennie d\'Excellence',
        showcaseAboutContent: `En 2015, Weevup naissait d'une vision audacieuse : rendre la transformation digitale accessible à toutes les entreprises. Dix ans plus tard, nous avons accompagné plus de 500 entreprises, développé des solutions innovantes reconnues internationalement, et bâti une équipe de passionnés.

Cette soirée est l'occasion de célébrer ensemble ces 10 années d'aventure, de remercier tous ceux qui ont contribué à cette réussite, et de dévoiler nos ambitions pour la prochaine décennie.

Rejoignez-nous pour une soirée mémorable mêlant émotion, convivialité et célébration !`,
        showcaseScheduleTitle: 'Programme de la Soirée',
        showcaseSchedule: [
          {
            time: '19:00',
            title: 'Accueil & Cocktail',
            description: 'Champagne de bienvenue, amuse-bouches gastronomiques et networking dans le salon principal',
            location: 'Salon Principal'
          },
          {
            time: '20:00',
            title: 'Cérémonie d\'Ouverture',
            description: 'Mot de bienvenue du fondateur, rétrospective en images et vidéos de ces 10 années',
            location: 'Grand Auditorium',
            speakers: ['Jean-Michel Dubois', 'Sophie Martin']
          },
          {
            time: '20:30',
            title: 'Témoignages & Surprises',
            description: 'Interventions de clients et partenaires, remise de prix, annonces spéciales',
            location: 'Grand Auditorium'
          },
          {
            time: '21:00',
            title: 'Dîner Gastronomique',
            description: 'Menu d\'exception créé par le Chef étoilé Antoine Lefèvre, accords mets & vins',
            location: 'Salle de Banquet'
          },
          {
            time: '22:30',
            title: 'Soirée Dansante',
            description: 'DJ set avec DJ Martin jusqu\'à minuit, bar et animations',
            location: 'Salon Principal'
          }
        ],
        showcaseSpeakers: [
          {
            name: 'Jean-Michel Dubois',
            title: 'CEO & Fondateur',
            company: 'Weevup',
            bio: '15 ans d\'expérience dans la tech, entrepreneur passionné, mentor pour startups',
            imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
            linkedin: 'https://linkedin.com/in/jmdubois',
            twitter: '@jmdubois'
          },
          {
            name: 'Sophie Martin',
            title: 'CTO',
            company: 'Weevup',
            bio: 'Experte en architecture cloud et IA, speaker internationale, auteure de 2 livres tech',
            imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
            linkedin: 'https://linkedin.com/in/sophiemartin'
          },
          {
            name: 'Antoine Lefèvre',
            title: 'Chef Étoilé',
            company: 'Restaurant Le Pavillon',
            bio: 'Chef étoilé Michelin, spécialiste de la cuisine française moderne',
            imageUrl: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400'
          }
        ],
        showcaseSponsors: [
          {
            name: 'Microsoft Azure',
            tier: 'Platinum',
            logo: 'https://img-prod-cms-rt-microsoft-com.akamaized.net/cms/api/am/imageFileData/RE1Mu3b?ver=5c31',
            website: 'https://azure.microsoft.com',
            description: 'Partenaire cloud stratégique'
          },
          {
            name: 'AWS',
            tier: 'Platinum',
            logo: 'https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg',
            website: 'https://aws.amazon.com'
          },
          {
            name: 'Google Cloud',
            tier: 'Gold',
            logo: 'https://www.gstatic.com/devrel-devsite/prod/v870e399c64f7c43c99a3043db4b3a74327bb93d0914e84a0c3dba90bbfd67625/cloud/images/favicons/onecloud/super_cloud.png',
            website: 'https://cloud.google.com'
          },
          {
            name: 'OVHcloud',
            tier: 'Gold',
            logo: 'https://www.ovhcloud.com/sites/default/files/styles/large_screen_1x/public/2022-07/OVHcloud_Logo.png',
            website: 'https://www.ovhcloud.com'
          }
        ],
        showcaseGallery: [
          {
            imageUrl: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800',
            caption: 'Notre premier bureau en 2015'
          },
          {
            imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800',
            caption: 'L\'équipe lors de notre première conférence'
          },
          {
            imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800',
            caption: 'Hackathon annuel 2018'
          },
          {
            imageUrl: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800',
            caption: 'Séminaire d\'équipe 2020'
          },
          {
            imageUrl: 'https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=800',
            caption: 'Lancement de notre nouvelle plateforme'
          },
          {
            imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
            caption: 'Soirée client 2023'
          }
        ],
        showcaseFaq: [
          {
            question: 'Où se déroule la soirée ?',
            answer: 'La soirée se tiendra au Pavillon Royal, situé au 148 Avenue des Champs-Élysées, 75008 Paris. Un lieu prestigieux au cœur de la capitale.'
          },
          {
            question: 'Y a-t-il un parking disponible ?',
            answer: 'Oui, un parking privé est disponible pour les invités. Merci de l\'indiquer lors de votre confirmation. Des voituriers seront également présents.'
          },
          {
            question: 'Puis-je venir accompagné(e) ?',
            answer: 'Bien sûr ! Vous pouvez inviter un accompagnant. Merci de l\'indiquer lors de votre RSVP pour que nous puissions l\'ajouter à la liste.'
          },
          {
            question: 'Quel est le dress code ?',
            answer: 'Tenue élégante / cocktail. Nous vous encourageons à vous habiller avec élégance pour cette soirée spéciale !'
          },
          {
            question: 'Des options végétariennes/vegan sont-elles disponibles ?',
            answer: 'Absolument ! Notre chef propose des menus végétariens, vegan et sans gluten. Merci de préciser vos préférences lors de votre RSVP.'
          },
          {
            question: 'Y aura-t-il un photographe ?',
            answer: 'Oui, un photographe professionnel immortalisera la soirée. Les photos seront partagées après l\'événement. Vous pouvez indiquer vos préférences concernant le droit à l\'image lors du RSVP.'
          },
          {
            question: 'Comment puis-je me rendre sur place ?',
            answer: 'Le lieu est accessible en métro (ligne 1, 9 - Franklin D. Roosevelt), bus (lignes 28, 32, 42, 73, 80), ou taxi/VTC. Un service de navette depuis les gares principales peut être organisé sur demande.'
          }
        ]
      }
    })

    // ====================================
    // 3. ÉVÉNEMENT 2 - TECH SUMMIT 2025
    // ====================================
    const eventTechSummit = await prisma.event.create({
      data: {
        userId: adminWeevup.id,
        name: 'Tech Summit 2025',
        slug: 'tech-summit-2025',
        description: 'La plus grande conférence tech de l\'année réunissant les leaders de l\'innovation',
        startsAt: new Date('2025-09-15T08:30:00'),
        endsAt: new Date('2025-09-16T18:00:00'),
        timezone: 'Europe/Paris',
        venueName: 'Paris Convention Center',
        venueAddress: '2 Place de la Porte de Versailles',
        city: 'Paris',
        postalCode: '75015',
        country: 'France',
        capacity: 1500,
        isPublic: true,
        status: 'PUBLISHED',
        primaryColor: '#1E3A8A',
        secondaryColor: '#3B82F6',
        accentColor: '#F59E0B',

        // Save the Date
        saveTheDateEnabled: true,
        saveTheDateTitle: 'Save the Date - Tech Summit 2025',
        saveTheDateSubtitle: 'L\'événement tech incontournable de l\'année',
        saveTheDateMessage: `Chers passionnés de technologie,

Marquez vos agendas ! Le Tech Summit 2025 revient pour sa 5ème édition les 15 et 16 septembre 2025.

Cette année, nous réunissons les plus grands experts mondiaux de l'IA, du Cloud, de la Cybersécurité et du Web3 pour deux jours intenses de conférences, ateliers et networking.

**Les temps forts :**
- 50+ conférences et keynotes
- 30+ ateliers pratiques
- 100+ speakers internationaux
- Exposition tech avec 80+ stands
- Hackathon 24h avec 50 000€ de prix
- Soirée de gala & networking

Que vous soyez développeur, CTO, entrepreneur ou simplement curieux des dernières innovations, le Tech Summit est LE rendez-vous à ne pas manquer.

Les inscriptions ouvriront en avril 2025.

Stay tuned!

L'équipe Tech Summit`,
        saveTheDateImageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200',
        saveTheDateBackgroundColor: '#1E3A8A',
        saveTheDateTextColor: '#FFFFFF',
        saveTheDateSendDate: new Date('2025-01-15T09:00:00'),

        // Invitation
        invitationEnabled: true,
        invitationTitle: 'Vous êtes invité au Tech Summit 2025',
        invitationSubtitle: '2 jours d\'innovation, d\'inspiration et de networking',
        invitationMessage: `Bonjour {{firstName}},

Nous sommes ravis de vous inviter au **Tech Summit 2025**, l'événement technologique le plus attendu de l'année.

Cette 5ème édition s'annonce exceptionnelle avec une programmation riche et variée autour des technologies qui façonnent notre avenir.

**🎯 Pourquoi participer ?**

✨ Découvrez les dernières innovations en IA, Cloud, Cybersécurité et Web3
🎤 Écoutez 100+ experts internationaux partager leur vision
🛠️ Participez à des ateliers hands-on pour monter en compétences
🤝 Networkez avec 1500+ professionnels de la tech
🏆 Assistez au hackathon avec 50 000€ de prix à remporter
🎉 Profitez d'une soirée de gala exclusive

**📅 Programme 2 jours :**

**Jour 1 - Lundi 15 septembre**
- 08h30 : Accueil & petit-déjeuner
- 09h30 : Keynote d'ouverture
- 10h30 : Conférences parallèles & ateliers
- 13h00 : Déjeuner networking
- 14h30 : Sessions l'après-midi
- 19h00 : Cocktail & soirée networking

**Jour 2 - Mardi 16 septembre**
- 08h30 : Petit-déjeuner
- 09h00 : Conférences & workshops
- 12h30 : Déjeuner
- 14h00 : Dernières sessions
- 17h00 : Remise des prix hackathon
- 18h00 : Clôture

**🎫 Votre pass inclut :**
- Accès à toutes les conférences et ateliers
- Déjeuners et pauses café
- Goodies pack (t-shirt, badge, swag)
- Accès à l'exposition & stands
- Soirée de gala du lundi soir
- Certificat de participation

**Merci de confirmer votre présence avant le 15 août 2025.**

Au plaisir de vous y retrouver !

L'équipe Tech Summit 2025`,
        invitationImageUrl: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1200',
        invitationBackgroundColor: '#FFFFFF',
        invitationTextColor: '#1E3A8A',
        invitationDressCode: 'Business Casual / Tech Casual',
        invitationSendDate: new Date('2025-05-01T09:00:00'),

        // RSVP Configuration
        rsvpEnabled: true,
        rsvpDeadline: new Date('2025-08-15T23:59:59'),
        rsvpMessage: 'Confirmez votre participation avant le 15 août pour garantir votre place. Les places sont limitées !',
        rsvpAllowPlusOnes: false,
        rsvpCollectMealPreference: true,
        rsvpMealOptions: ['Omnivore', 'Végétarien', 'Vegan', 'Sans Gluten', 'Halal', 'Casher'],
        rsvpCollectAllergies: true,
        rsvpCollectDietaryRestrictions: true,
        rsvpCollectAccessibility: true,
        rsvpCollectTransport: false,
        rsvpCollectAccommodation: true,
        rsvpCollectPhotoConsent: true,
        rsvpCustomQuestions: [
          {
            question: 'Quel est votre niveau d\'expertise technique ?',
            type: 'choice',
            options: ['Débutant', 'Intermédiaire', 'Avancé', 'Expert'],
            required: true
          },
          {
            question: 'Quels sujets vous intéressent le plus ?',
            type: 'multiple',
            options: ['Intelligence Artificielle', 'Cloud Computing', 'Cybersécurité', 'Web3 & Blockchain', 'DevOps', 'Data Science'],
            required: true
          },
          {
            question: 'Souhaitez-vous participer au hackathon 24h ?',
            type: 'choice',
            options: ['Oui, seul', 'Oui, en équipe', 'Non'],
            required: false
          },
          {
            question: 'Taille de t-shirt pour le pack goodies',
            type: 'choice',
            options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
            required: true
          }
        ],

        // Showcase Configuration
        showcaseEnabled: true,
        showcaseHeroTitle: 'Tech Summit 2025',
        showcaseHeroSubtitle: 'Shape the Future of Technology',
        showcaseHeroImageUrl: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1920',
        showcaseAboutTitle: 'L\'Événement Tech de l\'Année',
        showcaseAboutContent: `Le Tech Summit est devenu LA référence des conférences technologiques en Europe. Depuis 5 ans, nous réunissons les meilleurs experts, innovateurs et passionnés pour explorer ensemble les technologies qui transforment notre monde.

**Cette année, cap sur l'avenir avec :**

🤖 **IA & Machine Learning** : Les dernières avancées en IA générative, computer vision et NLP
☁️ **Cloud & Infrastructure** : Architecture cloud native, serverless, et edge computing
🔒 **Cybersécurité** : Zero Trust, threat intelligence et conformité RGPD
🌐 **Web3 & Blockchain** : DeFi, NFT et applications décentralisées
⚙️ **DevOps & Platform Engineering** : CI/CD, GitOps et observabilité
📊 **Data & Analytics** : Big Data, Data Science et Business Intelligence

**Un format unique :**
- 5 tracks parallèles pour s'adapter à tous les profils
- Des sessions de 45min pour une immersion complète
- Des ateliers hands-on pour pratiquer immédiatement
- Un hackathon 24h pour mettre en pratique
- Une expo tech pour découvrir les derniers outils

Que vous soyez développeur, architecte, CTO, data scientist ou simplement curieux, le Tech Summit vous offre une expérience d'apprentissage incomparable.`,
        showcaseScheduleTitle: 'Programme Complet',
        showcaseSchedule: [
          // Jour 1
          {
            time: '08:30',
            title: 'Accueil & Petit-déjeuner',
            description: 'Café, viennoiseries et networking matinal',
            location: 'Hall Principal',
            day: 'Lundi 15 sept'
          },
          {
            time: '09:30',
            title: 'Keynote : L\'IA va-t-elle remplacer les développeurs ?',
            description: 'Une plongée fascinante dans l\'avenir du développement avec l\'IA',
            location: 'Grand Auditorium',
            speakers: ['Yann LeCun'],
            day: 'Lundi 15 sept'
          },
          {
            time: '10:30',
            title: 'Sessions Parallèles - Track 1 à 5',
            description: 'Conférences sur IA, Cloud, Cyber, Web3, DevOps',
            location: 'Salles A, B, C, D, E',
            day: 'Lundi 15 sept'
          },
          {
            time: '13:00',
            title: 'Déjeuner Networking',
            description: 'Buffet gastronomique et networking entre participants',
            location: 'Restaurant',
            day: 'Lundi 15 sept'
          },
          {
            time: '14:30',
            title: 'Ateliers Hands-On',
            description: 'Workshops pratiques de 2h : RAG avec LangChain, Kubernetes avancé, Zero Trust, Smart Contracts',
            location: 'Labs 1-6',
            day: 'Lundi 15 sept'
          },
          {
            time: '17:00',
            title: 'Panel : Le Futur du Cloud Computing',
            description: 'Débat avec les CTOs des plus grandes entreprises tech',
            location: 'Grand Auditorium',
            speakers: ['Panel de 5 experts'],
            day: 'Lundi 15 sept'
          },
          {
            time: '19:00',
            title: 'Cocktail & Soirée Networking',
            description: 'Cocktail dînatoire, DJ set, et networking dans une ambiance décontractée',
            location: 'Rooftop Terrace',
            day: 'Lundi 15 sept'
          },
          // Jour 2
          {
            time: '08:30',
            title: 'Petit-déjeuner',
            description: 'Café et viennoiseries',
            location: 'Hall Principal',
            day: 'Mardi 16 sept'
          },
          {
            time: '09:00',
            title: 'Keynote : Web3 - Revolution ou Buzzword ?',
            description: 'État des lieux objectif de la blockchain et du Web3',
            location: 'Grand Auditorium',
            speakers: ['Vitalik Buterin'],
            day: 'Mardi 16 sept'
          },
          {
            time: '10:00',
            title: 'Sessions Parallèles - Track 1 à 5',
            description: 'Deuxième vague de conférences',
            location: 'Salles A, B, C, D, E',
            day: 'Mardi 16 sept'
          },
          {
            time: '12:30',
            title: 'Déjeuner',
            description: 'Buffet et networking',
            location: 'Restaurant',
            day: 'Mardi 16 sept'
          },
          {
            time: '14:00',
            title: 'Lightning Talks',
            description: '12 talks de 10 minutes sur des sujets variés',
            location: 'Grand Auditorium',
            day: 'Mardi 16 sept'
          },
          {
            time: '16:00',
            title: 'Keynote de Clôture : L\'Éthique dans la Tech',
            description: 'Réflexion sur la responsabilité des technologues',
            location: 'Grand Auditorium',
            speakers: ['Tristan Harris'],
            day: 'Mardi 16 sept'
          },
          {
            time: '17:00',
            title: 'Remise des Prix Hackathon',
            description: 'Annonce des gagnants et remise des 50 000€ de prix',
            location: 'Grand Auditorium',
            day: 'Mardi 16 sept'
          },
          {
            time: '18:00',
            title: 'Clôture & Au Revoir',
            description: 'Mot de fin et rendez-vous pour 2026 !',
            location: 'Grand Auditorium',
            day: 'Mardi 16 sept'
          }
        ],
        showcaseSpeakers: [
          {
            name: 'Yann LeCun',
            title: 'Chief AI Scientist',
            company: 'Meta',
            bio: 'Pionnier du Deep Learning, Prix Turing 2018, professeur à NYU',
            imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
            linkedin: 'https://linkedin.com/in/yann-lecun',
            twitter: '@ylecun'
          },
          {
            name: 'Vitalik Buterin',
            title: 'Co-founder',
            company: 'Ethereum',
            bio: 'Créateur d\'Ethereum, figure emblématique du Web3',
            imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
            twitter: '@VitalikButerin'
          },
          {
            name: 'Tristan Harris',
            title: 'Co-founder',
            company: 'Center for Humane Technology',
            bio: 'Ex-Google, expert en éthique tech, documentaire "The Social Dilemma"',
            imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400',
            twitter: '@tristanharris'
          },
          {
            name: 'Cassie Kozyrkov',
            title: 'Chief Decision Scientist',
            company: 'Google',
            bio: 'Experte en Data Science et Decision Intelligence',
            imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
            linkedin: 'https://linkedin.com/in/cassie-kozyrkov',
            twitter: '@quaesita'
          },
          {
            name: 'Kelsey Hightower',
            title: 'Staff Developer Advocate',
            company: 'Google Cloud',
            bio: 'Expert Kubernetes, speaker international, auteur',
            imageUrl: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400',
            twitter: '@kelseyhightower'
          },
          {
            name: 'Stephanie Wong',
            title: 'Developer Advocate',
            company: 'Google Cloud',
            bio: 'Spécialiste Cloud Architecture et DevOps',
            imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400',
            twitter: '@stephr_wong'
          }
        ],
        showcaseSponsors: [
          {
            name: 'Google Cloud',
            tier: 'Diamond',
            logo: 'https://www.gstatic.com/devrel-devsite/prod/v870e399c64f7c43c99a3043db4b3a74327bb93d0914e84a0c3dba90bbfd67625/cloud/images/favicons/onecloud/super_cloud.png',
            website: 'https://cloud.google.com',
            description: 'Partenaire Diamond & Main Stage'
          },
          {
            name: 'Microsoft',
            tier: 'Diamond',
            logo: 'https://img-prod-cms-rt-microsoft-com.akamaized.net/cms/api/am/imageFileData/RE1Mu3b?ver=5c31',
            website: 'https://microsoft.com'
          },
          {
            name: 'AWS',
            tier: 'Platinum',
            logo: 'https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg',
            website: 'https://aws.amazon.com'
          },
          {
            name: 'GitHub',
            tier: 'Platinum',
            logo: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
            website: 'https://github.com'
          },
          {
            name: 'Docker',
            tier: 'Gold',
            logo: 'https://www.docker.com/wp-content/uploads/2022/03/Moby-logo.png',
            website: 'https://docker.com'
          },
          {
            name: 'MongoDB',
            tier: 'Gold',
            logo: 'https://www.mongodb.com/assets/images/global/favicon.ico',
            website: 'https://mongodb.com'
          },
          {
            name: 'Datadog',
            tier: 'Silver',
            logo: 'https://imgix.datadoghq.com/img/dd_logo_n_70x75.png',
            website: 'https://datadoghq.com'
          },
          {
            name: 'HashiCorp',
            tier: 'Silver',
            logo: 'https://www.datocms-assets.com/2885/1620155116-brandhccorp.svg',
            website: 'https://hashicorp.com'
          }
        ],
        showcaseGallery: [
          {
            imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
            caption: 'Main stage 2024'
          },
          {
            imageUrl: 'https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=800',
            caption: 'Expo tech avec 80+ stands'
          },
          {
            imageUrl: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800',
            caption: 'Ateliers hands-on'
          },
          {
            imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800',
            caption: 'Networking entre sessions'
          },
          {
            imageUrl: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800',
            caption: 'Soirée de gala 2024'
          },
          {
            imageUrl: 'https://images.unsplash.com/photo-1551818255-e6e10975bc17?w=800',
            caption: 'Hackathon 24h'
          },
          {
            imageUrl: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800',
            caption: 'Remise des prix'
          },
          {
            imageUrl: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800',
            caption: '1500+ participants'
          }
        ],
        showcaseFaq: [
          {
            question: 'Quel est le prix du billet ?',
            answer: 'Les pass VIP (invitations) sont offerts. Les billets standard sont à 299€ (early bird) et 399€ (tarif normal). Les étudiants bénéficient d\'une réduction de 50%.'
          },
          {
            question: 'L\'événement est-il en français ou en anglais ?',
            answer: 'Les keynotes sont en anglais avec traduction simultanée. Les autres sessions sont soit en français, soit en anglais (indiqué dans le programme).'
          },
          {
            question: 'Dois-je choisir mes sessions à l\'avance ?',
            answer: 'Non, vous êtes libre de circuler entre les différentes tracks. Les salles ont une capacité limitée, premier arrivé, premier servi.'
          },
          {
            question: 'Y a-t-il des ateliers pour débutants ?',
            answer: 'Oui ! Nous proposons des tracks pour tous niveaux, du débutant à l\'expert. Indiquez votre niveau lors du RSVP pour recevoir des recommandations personnalisées.'
          },
          {
            question: 'Le WiFi est-il inclus ?',
            answer: 'Oui, un WiFi haut débit est disponible dans tout le centre de conférence. Les identifiants vous seront communiqués à votre arrivée.'
          },
          {
            question: 'Puis-je participer au hackathon sans être inscrit à la conférence ?',
            answer: 'Non, le hackathon est réservé aux participants de la conférence. L\'inscription se fait lors du RSVP.'
          },
          {
            question: 'Des hôtels à proximité sont-ils recommandés ?',
            answer: 'Oui, nous avons négocié des tarifs préférentiels avec 5 hôtels partenaires. Les détails vous seront envoyés après votre confirmation.'
          },
          {
            question: 'L\'événement est-il accessible PMR ?',
            answer: 'Oui, le Paris Convention Center est entièrement accessible. Merci de nous indiquer vos besoins spécifiques lors du RSVP.'
          },
          {
            question: 'Puis-je annuler ma participation ?',
            answer: 'Oui, les annulations sont possibles jusqu\'au 1er septembre 2025. Contactez-nous à support@techsummit.com.'
          },
          {
            question: 'Y aura-t-il un replay des conférences ?',
            answer: 'Oui ! Toutes les sessions principales seront enregistrées et mises en ligne 2 semaines après l\'événement pour les participants.'
          }
        ]
      }
    })

    // ====================================
    // 4. INVITÉS POUR 10 ANS WEEVUP
    // ====================================
    const guestsWeevup = []

    // Clients VIP
    const vipClients = [
      { firstName: 'Marie', lastName: 'Dupont', email: 'marie.dupont@exemple.fr', company: 'TechCorp France', tags: ['VIP', 'Client'],attending: true, meal: 'Menu Végétarien', plusOnes: 1 },
      { firstName: 'Thomas', lastName: 'Bernard', email: 'thomas.bernard@exemple.fr', company: 'Innov Solutions', tags: ['VIP', 'Client'], attending: true, meal: 'Menu Omnivore', plusOnes: 1 },
      { firstName: 'Sophie', lastName: 'Leroy', email: 'sophie.leroy@exemple.fr', company: 'Digital Ventures', tags: ['VIP', 'Partenaire'], attending: true, meal: 'Menu Vegan', plusOnes: 0, allergies: 'Fruits à coque' },
      { firstName: 'Pierre', lastName: 'Moreau', email: 'pierre.moreau@exemple.fr', company: 'StartupHub', tags: ['VIP', 'Investisseur'], attending: true, meal: 'Menu Omnivore', plusOnes: 1 },
      { firstName: 'Isabelle', lastName: 'Petit', email: 'isabelle.petit@exemple.fr', company: 'Finance Plus', tags: ['VIP', 'Client'], attending: false }
    ]

    for (const guest of vipClients) {
      const token = generateToken()
      const hashedToken = await hashToken(token)

      const createdGuest = await prisma.guest.create({
        data: {
          eventId: event10AnsWeevup.id,
          firstName: guest.firstName,
          lastName: guest.lastName,
          email: guest.email,
          company: guest.company,
          token: hashedToken,
          tags: guest.tags,
          status: 'PENDING'
        }
      })

      if (guest.attending !== undefined) {
        const qrCodeId = `WV10-${createdGuest.id.slice(0, 8).toUpperCase()}`

        await prisma.rSVP.create({
          data: {
            guestId: createdGuest.id,
            eventId: event10AnsWeevup.id,
            attending: guest.attending,
            plusOnes: guest.plusOnes || 0,
            mealChoice: guest.meal,
            allergies: guest.allergies,
            qrCodeId,
            consentPhotos: true,
            createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
          }
        })

        // Certains invités ont déjà check-in
        if (guest.attending && Math.random() > 0.5) {
          await prisma.checkin.create({
            data: {
              eventId: event10AnsWeevup.id,
              guestId: createdGuest.id,
              qrCodeId,
              desk: ['A', 'B', 'C'][Math.floor(Math.random() * 3)],
              checkedInAt: new Date('2025-06-20T18:30:00')
            }
          })
        }
      }

      guestsWeevup.push(createdGuest)
    }

    // Équipe Weevup
    const teamMembers = [
      { firstName: 'Lucas', lastName: 'Dubois', email: 'lucas.dubois@weevup.com', company: 'Weevup', tags: ['Équipe', 'Tech'], attending: true, meal: 'Menu Omnivore' },
      { firstName: 'Emma', lastName: 'Martin', email: 'emma.martin@weevup.com', company: 'Weevup', tags: ['Équipe', 'Marketing'], attending: true, meal: 'Menu Végétarien' },
      { firstName: 'Alexandre', lastName: 'Rousseau', email: 'alex.rousseau@weevup.com', company: 'Weevup', tags: ['Équipe', 'Sales'], attending: true, meal: 'Menu Omnivore' },
      { firstName: 'Camille', lastName: 'Laurent', email: 'camille.laurent@weevup.com', company: 'Weevup', tags: ['Équipe', 'Design'], attending: true, meal: 'Menu Vegan' },
      { firstName: 'Nicolas', lastName: 'Simon', email: 'nicolas.simon@weevup.com', company: 'Weevup', tags: ['Équipe', 'Tech'], attending: true, meal: 'Menu Sans Gluten', allergies: 'Gluten' }
    ]

    for (const member of teamMembers) {
      const token = generateToken()
      const hashedToken = await hashToken(token)

      const createdGuest = await prisma.guest.create({
        data: {
          eventId: event10AnsWeevup.id,
          firstName: member.firstName,
          lastName: member.lastName,
          email: member.email,
          company: member.company,
          token: hashedToken,
          tags: member.tags,
          status: 'PENDING'
        }
      })

      const qrCodeId = `WV10-${createdGuest.id.slice(0, 8).toUpperCase()}`

      await prisma.rSVP.create({
        data: {
          guestId: createdGuest.id,
          eventId: event10AnsWeevup.id,
          attending: member.attending,
          plusOnes: 0,
          mealChoice: member.meal,
          allergies: member.allergies,
          qrCodeId,
          consentPhotos: true,
          createdAt: new Date(Date.now() - Math.random() * 20 * 24 * 60 * 60 * 1000)
        }
      })

      // Équipe déjà check-in
      await prisma.checkin.create({
        data: {
          eventId: event10AnsWeevup.id,
          guestId: createdGuest.id,
          qrCodeId,
          desk: 'A',
          checkedInAt: new Date('2025-06-20T18:00:00')
        }
      })

      guestsWeevup.push(createdGuest)
    }

    // ====================================
    // 5. INVITÉS POUR TECH SUMMIT 2025
    // ====================================
    const guestsTechSummit = []

    // Speakers & VIPs
    const speakers = [
      { firstName: 'Yann', lastName: 'LeCun', email: 'yann@meta.com', company: 'Meta', tags: ['Speaker', 'VIP', 'IA'], attending: true, meal: 'Végétarien', expertise: 'Expert' },
      { firstName: 'Vitalik', lastName: 'Buterin', email: 'vitalik@ethereum.org', company: 'Ethereum Foundation', tags: ['Speaker', 'VIP', 'Web3'], attending: true, meal: 'Vegan', expertise: 'Expert' },
      { firstName: 'Cassie', lastName: 'Kozyrkov', email: 'cassie@google.com', company: 'Google', tags: ['Speaker', 'VIP', 'Data'], attending: true, meal: 'Omnivore', expertise: 'Expert' },
      { firstName: 'Kelsey', lastName: 'Hightower', email: 'kelsey@google.com', company: 'Google Cloud', tags: ['Speaker', 'VIP', 'DevOps'], attending: true, meal: 'Omnivore', expertise: 'Expert' }
    ]

    for (const speaker of speakers) {
      const token = generateToken()
      const hashedToken = await hashToken(token)

      const createdGuest = await prisma.guest.create({
        data: {
          eventId: eventTechSummit.id,
          firstName: speaker.firstName,
          lastName: speaker.lastName,
          email: speaker.email,
          company: speaker.company,
          token: hashedToken,
          tags: speaker.tags,
          status: 'CONFIRMED'
        }
      })

      const qrCodeId = `TS25-${createdGuest.id.slice(0, 8).toUpperCase()}`

      await prisma.rSVP.create({
        data: {
          guestId: createdGuest.id,
          eventId: eventTechSummit.id,
          attending: speaker.attending,
          plusOnes: 0,
          mealChoice: speaker.meal,
          qrCodeId,
          consentPhotos: true,
          customResponses: {
            expertise: speaker.expertise,
            topics: ['Intelligence Artificielle', 'Cloud Computing'],
            hackathon: 'Non',
            tshirt: 'L'
          },
          createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000)
        }
      })

      guestsTechSummit.push(createdGuest)
    }

    // Participants standard
    const participants = [
      { firstName: 'Julie', lastName: 'Fontaine', email: 'julie.f@techco.fr', company: 'TechCo', tags: ['Participant', 'Developer'], attending: true, meal: 'Végétarien', expertise: 'Intermédiaire' },
      { firstName: 'Marc', lastName: 'Durand', email: 'marc.d@startup.io', company: 'StartupIO', tags: ['Participant', 'CTO'], attending: true, meal: 'Omnivore', expertise: 'Avancé' },
      { firstName: 'Laura', lastName: 'Chen', email: 'laura.chen@cloudnative.com', company: 'CloudNative Corp', tags: ['Participant', 'DevOps'], attending: true, meal: 'Omnivore', expertise: 'Avancé' },
      { firstName: 'Antoine', lastName: 'Mercier', email: 'antoine.m@datascience.fr', company: 'DataScience Lab', tags: ['Participant', 'Data Scientist'], attending: true, meal: 'Vegan', expertise: 'Intermédiaire' },
      { firstName: 'Sarah', lastName: 'Johnson', email: 'sarah.j@securetech.com', company: 'SecureTech', tags: ['Participant', 'Security'], attending: true, meal: 'Sans Gluten', expertise: 'Expert', allergies: 'Gluten' },
      { firstName: 'David', lastName: 'Lefebvre', email: 'david.l@webdev.fr', company: 'WebDev Agency', tags: ['Participant', 'Developer'], attending: false },
      { firstName: 'Amélie', lastName: 'Blanc', email: 'amelie.b@innovation.io', company: 'Innovation Hub', tags: ['Participant', 'Product'], attending: null }
    ]

    for (const participant of participants) {
      const token = generateToken()
      const hashedToken = await hashToken(token)

      const createdGuest = await prisma.guest.create({
        data: {
          eventId: eventTechSummit.id,
          firstName: participant.firstName,
          lastName: participant.lastName,
          email: participant.email,
          company: participant.company,
          token: hashedToken,
          tags: participant.tags,
          status: participant.attending === null ? 'PENDING' : 'CONFIRMED'
        }
      })

      if (participant.attending !== null && participant.attending !== undefined) {
        const qrCodeId = `TS25-${createdGuest.id.slice(0, 8).toUpperCase()}`

        await prisma.rSVP.create({
          data: {
            guestId: createdGuest.id,
            eventId: eventTechSummit.id,
            attending: participant.attending,
            plusOnes: 0,
            mealChoice: participant.meal,
            allergies: participant.allergies,
            qrCodeId: participant.attending ? qrCodeId : undefined,
            consentPhotos: participant.attending,
            customResponses: participant.attending ? {
              expertise: participant.expertise || 'Intermédiaire',
              topics: ['Intelligence Artificielle', 'Cloud Computing'],
              hackathon: Math.random() > 0.7 ? 'Oui, seul' : 'Non',
              tshirt: ['M', 'L', 'XL'][Math.floor(Math.random() * 3)]
            } : undefined,
            createdAt: new Date(Date.now() - Math.random() * 40 * 24 * 60 * 60 * 1000)
          }
        })
      }

      guestsTechSummit.push(createdGuest)
    }

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully with rich data!',
      data: {
        users: 1,
        events: 2,
        guests: {
          weevup10Ans: guestsWeevup.length,
          techSummit: guestsTechSummit.length,
          total: guestsWeevup.length + guestsTechSummit.length
        }
      }
    })

  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json(
      { error: 'Failed to seed database', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
