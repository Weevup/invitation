'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import {
  BookOpen,
  Code2,
  TestTube,
  Rocket,
  Database,
  Mail,
  Shield,
  Layers,
  GitBranch,
  FileCode,
  Download
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function DocumentationPage() {
  const [activeSection, setActiveSection] = useState<string>('overview')

  const sections = {
    overview: {
      title: 'Vue d&apos;ensemble',
      icon: BookOpen,
      content: `# 📚 Documentation Complète

Bienvenue dans la documentation de l'application de gestion d'invitations Weevup. Cette documentation complète vous guidera à travers tous les aspects de l'application, du développement au déploiement.

## 🎯 Objectif de l'application

Cette application permet de gérer l'ensemble du cycle de vie d'un événement :
- **Création d'événement** avec showcase personnalisable
- **Gestion des invités** et imports CSV
- **Cycle de communication** : Save the Date → Invitation → RSVP
- **Tracking complet** des emails et interactions
- **Intégrations email** multi-providers (SendGrid, Resend, Mailgun, SMTP)
- **Check-in** avec QR codes
- **Statistiques** et analytics en temps réel

## 📖 Sections disponibles

- **Architecture** : Comprendre la structure technique
- **Développement** : Guide pour développer et contribuer
- **Tests** : Guide end-to-end pour tester l'application
- **API** : Documentation complète des endpoints
- **Base de données** : Schémas et modèles de données
- **Email** : Système d'intégration et webhooks
- **Sécurité** : Tokens, encryption, webhooks
- **Déploiement** : Guide de mise en production`
    },
    architecture: {
      title: 'Architecture',
      icon: Layers,
      content: `# 🏗️ Architecture

## Stack Technique

### Frontend
- **Next.js 15.0.3** - App Router avec React Server Components
- **React 19.0.0** - Dernière version avec Server Components
- **TypeScript 5.7.2** - Type safety complète
- **Tailwind CSS 3.4.1** - Styling utility-first
- **shadcn/ui** - Composants UI réutilisables

### Backend
- **Next.js API Routes** - Endpoints serverless
- **Prisma 6.0.0** - ORM type-safe
- **PostgreSQL** - Base de données relationnelle
- **Zod** - Validation runtime des données

### Email & Intégrations
- **SendGrid** - Provider email professionnel
- **Resend** - Provider email moderne
- **Mailgun** - Provider email flexible
- **Nodemailer** - SMTP custom

### Sécurité
- **Crypto** - Encryption AES-256-CBC
- **SHA-256** - Hashing des tokens
- **Webhook Signatures** - Vérification RSA/HMAC

## Structure du Projet

\`\`\`
invitation/
├── app/                      # Next.js App Router
│   ├── admin/               # Interface admin
│   │   ├── events/         # Gestion événements
│   │   ├── guests/         # Gestion invités
│   │   ├── invitations/    # Envoi invitations
│   │   ├── rsvp/           # Gestion RSVP
│   │   ├── statistics/     # Analytics
│   │   └── settings/       # Configuration
│   ├── api/                # API Routes
│   │   ├── admin/          # Endpoints admin
│   │   ├── rsvp/           # Endpoints RSVP public
│   │   └── webhooks/       # Webhooks providers
│   ├── event/              # Pages showcase public
│   └── rsvp/               # Formulaire RSVP
├── components/             # Composants React
│   ├── admin/             # Composants admin
│   ├── showcase/          # Éditeurs showcase
│   └── ui/                # shadcn/ui
├── lib/                   # Utilitaires
│   ├── auth.ts           # Authentification
│   ├── email-service.ts  # Service email unifié
│   └── prisma.ts         # Client Prisma
└── prisma/               # Base de données
    ├── schema.prisma     # Schéma de données
    └── migrations/       # Migrations SQL
\`\`\`

## Flux de Données Principaux

### 1. Création d'Événement
\`\`\`
Admin → Create Event Form → API Route → Prisma → PostgreSQL
                                    ↓
                        Generate Showcase + Token Hash
\`\`\`

### 2. Envoi d'Invitations
\`\`\`
Admin → Select Guests → Email Service → Provider API
                            ↓               ↓
                    Create EmailLog    Webhook ←┘
                            ↓
                    Track Delivery/Opens/Clicks
\`\`\`

### 3. RSVP Guest
\`\`\`
Guest → Click Link → Verify Token → Show RSVP Form
                                         ↓
                                    Submit Response
                                         ↓
                              Update Guest + Send Email
\`\`\``
    },
    development: {
      title: 'Guide Développement',
      icon: Code2,
      content: `# 👨‍💻 Guide de Développement

## Installation

### Prérequis
- Node.js 18+
- PostgreSQL 14+
- npm ou yarn

### Setup Initial

\`\`\`bash
# Cloner le repository
git clone <repo-url>
cd invitation

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env

# Éditer .env avec vos valeurs
DATABASE_URL="postgresql://user:password@localhost:5432/invitation"
NEXTAUTH_SECRET="votre-secret-aleatoire"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"

# Initialiser la base de données
npx prisma migrate dev
npx prisma generate

# Seed avec données de démo
npm run db:seed:complete

# Lancer le serveur de développement
npm run dev
\`\`\`

Accédez à http://localhost:3000

### Compte Admin par Défaut
- Email : admin@weevup.com
- Aucun mot de passe requis (système de magic link)

## Structure des Composants

### Pages Admin
Toutes les pages admin utilisent le layout \`app/admin/layout.tsx\` avec sidebar.

\`\`\`typescript
// Exemple de page admin
export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1>Titre de la Page</h1>
        <Button>Action</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contenu</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Votre contenu */}
        </CardContent>
      </Card>
    </div>
  )
}
\`\`\`

### API Routes

Les routes API utilisent les conventions Next.js 15 :

\`\`\`typescript
// app/api/example/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const data = await prisma.model.findMany()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validation avec Zod
    const validated = schema.parse(body)

    const result = await prisma.model.create({
      data: validated
    })

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: 'Validation error' },
      { status: 400 }
    )
  }
}
\`\`\`

## Bonnes Pratiques

### Types TypeScript
- Utilisez les types générés par Prisma
- Créez des interfaces pour les props
- Évitez \`any\`, préférez \`unknown\`

### Gestion d'État
- Client Components : \`useState\`, \`useEffect\`
- Server Components par défaut
- Fetch data côté serveur quand possible

### Styling
- Utilisez Tailwind CSS
- Composants shadcn/ui pour l'UI
- Classes utilitaires personnalisées dans globals.css

### Base de Données
\`\`\`bash
# Créer une migration
npx prisma migrate dev --name description_changement

# Appliquer les migrations en production
npx prisma migrate deploy

# Regénérer le client Prisma
npx prisma generate

# Ouvrir Prisma Studio (GUI)
npx prisma studio
\`\`\`

### Tests
\`\`\`bash
# Build de production local
npm run build

# Vérifier les types TypeScript
npx tsc --noEmit

# Linter
npm run lint
\`\`\``
    },
    testing: {
      title: 'Guide de Test',
      icon: TestTube,
      content: `# 🧪 Guide de Test End-to-End

## Préparation

### 1. Reset de la Base de Données

\`\`\`bash
# Reset complet
npx prisma migrate reset

# Seed avec données complètes
npm run db:seed:complete
\`\`\`

### 2. Données de Test Créées

**Événement** : Tech Summit 2025
- Date : 15 septembre 2025
- Lieu : Station F, Paris
- 15 invités avec statuts variés

**Invités** :
- 7 confirmés (46.7%) dont 5 avec +1 = 12 participants
- 2 déclinés (13.3%)
- 6 en attente (40%)

## Parcours Admin

### 1. Connexion
1. Aller sur \`/admin\`
2. Utiliser : admin@weevup.com
3. Vérifier l'accès au dashboard

### 2. Gestion Événement
1. Aller dans "Événements"
2. Cliquer sur "Tech Summit 2025"
3. **Onglet Informations** :
   - Vérifier toutes les informations
   - Modifier une info et sauvegarder
4. **Onglet Showcase** :
   - Vérifier les 4 speakers
   - Vérifier la timeline (6 étapes)
   - Vérifier la galerie (6 photos)
   - Vérifier les sponsors (4 niveaux)
   - Vérifier les FAQ (5 questions)
5. **Onglet Configuration** :
   - Vérifier RSVP activé
   - Vérifier +1 autorisés (max 2)
   - Vérifier choix de repas requis

### 3. Gestion des Invités
1. Aller dans "Invités"
2. **Filtres** :
   - Tester filtre "Confirmés" → 7 résultats
   - Tester filtre "Déclinés" → 2 résultats
   - Tester filtre "En attente" → 6 résultats
3. **Actions** :
   - Cliquer sur un invité → Voir détails
   - Vérifier les logs d'email
   - Vérifier QR code (pour confirmés)

### 4. Envoi d'Invitations
1. Aller dans "Invitations"
2. **Filtrer** : Invités sans invitation envoyée
3. **Tester** :
   - Sélectionner 1-2 invités
   - Prévisualiser l'email
   - (Ne pas envoyer si intégration pas configurée)

### 5. Gestion RSVP
1. Aller dans "RSVP"
2. Vérifier les statistiques :
   - Taux de réponse
   - Confirmations / Déclinaisons
   - Total participants (avec +1)
3. **Filtrer par statut**
4. **Exporter** : Télécharger CSV

### 6. Configuration Intégrations
1. Aller dans "Paramètres" → "Intégrations"
2. **Onglets disponibles** :
   - SendGrid
   - Resend
   - Mailgun
   - SMTP Custom
3. **Configurer un provider** :
   - Entrer API key
   - Définir From Email
   - Activer tracking
   - Sauvegarder
4. **Tester** : Cliquer "Tester la connexion"

### 7. Statistiques
1. Aller dans "Statistiques"
2. **Vérifier** :
   - Graphique de statuts invités
   - Timeline des réponses
   - Taux d'ouverture emails
   - Métriques engagement

## Parcours Invité (RSVP)

### 1. Accès à l'Invitation
Récupérer un token invité depuis la base :
\`\`\`bash
npx prisma studio
# Ouvrir table Guest
# Copier le token d'un invité "PENDING"
\`\`\`

URL : \`http://localhost:3000/rsvp/[token]\`

### 2. Formulaire RSVP - Acceptation
1. **Étape 1** : Réponse
   - Sélectionner "Je confirme ma présence"
2. **Étape 2** : Accompagnant (si +1 autorisé)
   - Ajouter 1 accompagnant
   - Saisir nom/prénom
3. **Étape 3** : Choix de repas
   - Sélectionner menu pour soi
   - Sélectionner menu pour +1
4. **Soumettre** : Animation confettis
5. **Email** : Confirmation envoyée

### 3. Formulaire RSVP - Déclinaison
1. Utiliser un autre token
2. Sélectionner "Je ne peux pas venir"
3. (Optionnel) Ajouter un message
4. Soumettre
5. Message de regret affiché

### 4. Vérification Post-RSVP
Retour admin :
1. Aller dans "RSVP"
2. Vérifier nouveau statut
3. Vérifier +1 comptabilisé
4. Vérifier choix repas enregistré

## Test du Showcase Public

### 1. Accès Public
URL : \`http://localhost:3000/event/tech-summit-2025\`

### 2. Sections à Vérifier
1. **Hero** :
   - Cover image
   - Titre événement
   - Date, heure, lieu
   - Bouton RSVP (disabled sans token)
2. **Description** :
   - Texte formaté
   - Programme
3. **Speakers** :
   - 4 speakers avec photos
   - Bio et titre
4. **Timeline** :
   - 6 étapes de la journée
   - Heures + descriptions
5. **Galerie** :
   - 6 photos en grille
   - Lightbox au clic
6. **Sponsors** :
   - 4 niveaux (Platine, Or, Argent, Bronze)
   - Logos affichés
7. **FAQ** :
   - 5 questions
   - Accordéon expandable

## Scénarios Avancés

### Test Email Tracking
1. Configurer provider email
2. Envoyer invitation à votre email
3. Ouvrir l'email
4. Cliquer sur les liens
5. Retour admin → "Statistiques"
6. Vérifier tracking ouverture + clics

### Test Import CSV
1. Créer fichier CSV :
\`\`\`csv
firstName,lastName,email,phone
Jean,Dupont,jean@example.com,+33612345678
Marie,Martin,marie@example.com,
\`\`\`
2. Aller dans "Invités"
3. Importer le CSV
4. Vérifier les invités créés

### Test QR Code Check-in
1. Aller dans "RSVP"
2. Cliquer sur invité confirmé
3. Afficher QR code
4. Scanner avec app (contient token)
5. Vérifier données décodées`
    },
    api: {
      title: 'Documentation API',
      icon: FileCode,
      content: `# 🔌 Documentation API

## Endpoints Admin

### Events

#### GET /api/admin/events
Liste tous les événements

**Response** :
\`\`\`json
[{
  "id": "string",
  "name": "string",
  "slug": "string",
  "startsAt": "date",
  "venueName": "string",
  "guestCount": number
}]
\`\`\`

#### POST /api/admin/events
Crée un nouvel événement

**Request** :
\`\`\`json
{
  "name": "string",
  "slug": "string",
  "startsAt": "date",
  "endsAt": "date",
  "venueName": "string",
  "address": "string",
  "city": "string",
  "country": "string"
}
\`\`\`

#### PUT /api/admin/events/[id]
Met à jour un événement

#### DELETE /api/admin/events/[id]
Supprime un événement

### Guests

#### GET /api/admin/events/[id]/guests
Liste les invités d'un événement

**Query Params** :
- \`status\` : PENDING | ACCEPTED | DECLINED
- \`search\` : Recherche nom/email

#### POST /api/admin/events/[id]/guests
Crée un invité

**Request** :
\`\`\`json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "phone": "string?"
}
\`\`\`

#### POST /api/admin/events/[id]/guests/import
Import CSV d'invités

**Request** : FormData avec fichier CSV

### Invitations

#### POST /api/admin/events/[id]/invitations/send
Envoie des invitations

**Request** :
\`\`\`json
{
  "guestIds": ["id1", "id2"],
  "type": "SAVE_THE_DATE" | "INVITATION" | "CONFIRMATION"
}
\`\`\`

#### GET /api/admin/events/[id]/invitations/preview/[guestId]
Prévisualise une invitation

### Email Integrations

#### GET /api/admin/integrations/email
Liste les intégrations email

#### POST /api/admin/integrations/email
Crée/met à jour une intégration

**Request** :
\`\`\`json
{
  "provider": "SENDGRID" | "RESEND" | "MAILGUN" | "SMTP",
  "apiKey": "string?",
  "apiSecret": "string?",
  "fromEmail": "string",
  "fromName": "string?",
  "trackOpens": boolean,
  "trackClicks": boolean,
  "isPrimary": boolean
}
\`\`\`

#### POST /api/admin/integrations/email/test
Teste une intégration

#### DELETE /api/admin/integrations/email/[id]
Supprime une intégration

### Statistics

#### GET /api/admin/events/[id]/statistics
Statistiques complètes d'un événement

**Response** :
\`\`\`json
{
  "totalGuests": number,
  "accepted": number,
  "declined": number,
  "pending": number,
  "totalParticipants": number,
  "emailStats": {
    "sent": number,
    "delivered": number,
    "opened": number,
    "clicked": number
  },
  "mealBreakdown": {
    "menu": count
  }
}
\`\`\`

## Endpoints Public

### RSVP

#### GET /api/rsvp/[token]
Récupère les infos invité pour RSVP

**Response** :
\`\`\`json
{
  "guest": {
    "id": "string",
    "firstName": "string",
    "lastName": "string",
    "status": "string"
  },
  "event": {
    "name": "string",
    "startsAt": "date",
    "allowPlusOnes": boolean,
    "maxPlusOnes": number,
    "requireMeal": boolean,
    "mealOptions": ["string"]
  }
}
\`\`\`

#### POST /api/rsvp/[token]
Soumet une réponse RSVP

**Request** :
\`\`\`json
{
  "attending": boolean,
  "plusOnes": number,
  "mealChoice": "string?",
  "allergies": "string?",
  "accessibilityNotes": "string?",
  "transportNeeds": "string?",
  "lodgingNeeds": "string?",
  "consentPhotos": boolean
}
\`\`\`

### Tracking

#### GET /api/track/open/[trackingId]/pixel.gif
Pixel de tracking d'ouverture email

#### GET /api/track/click/[trackingId]
Redirige et track le clic

## Webhooks

### SendGrid

#### POST /api/webhooks/email/sendgrid
Webhook pour événements SendGrid

**Events** : delivered, open, click, bounce, spam_report

**Signature** : RSA-SHA256 dans header \`X-Twilio-Email-Event-Webhook-Signature\`

### Resend

#### POST /api/webhooks/email/resend
Webhook pour événements Resend

**Events** : email.sent, email.delivered, email.opened, email.clicked, email.bounced

**Signature** : HMAC-SHA256 dans header \`svix-signature\`

### Mailgun

#### POST /api/webhooks/email/mailgun
Webhook pour événements Mailgun

**Events** : delivered, opened, clicked, failed

**Signature** : HMAC-SHA256 (timestamp + token + signature)

## Authentification

Actuellement, l'authentification admin utilise un système de magic link basique.

Pour les endpoints admin, vérifier la session utilisateur :

\`\`\`typescript
import { auth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  // Votre logique
}
\`\`\`

## Codes d'Erreur

- \`200\` : Success
- \`201\` : Created
- \`400\` : Bad Request (validation error)
- \`401\` : Unauthorized
- \`403\` : Forbidden
- \`404\` : Not Found
- \`409\` : Conflict (duplicate)
- \`500\` : Internal Server Error`
    },
    database: {
      title: 'Base de Données',
      icon: Database,
      content: `# 🗄️ Base de Données

## Schéma Prisma

### User
\`\`\`prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  role      UserRole @default(ADMIN)
  createdAt DateTime @default(now())
  events    Event[]
}

enum UserRole {
  ADMIN
  ORGANIZER
}
\`\`\`

### Event
\`\`\`prisma
model Event {
  id          String    @id @default(cuid())
  name        String
  slug        String    @unique
  startsAt    DateTime
  endsAt      DateTime?
  venueName   String
  address     String?
  city        String?
  country     String?
  description String?   @db.Text
  program     String?   @db.Text
  coverImage  String?
  dressCode   String?

  // RSVP Configuration
  allowPlusOnes   Boolean   @default(false)
  maxPlusOnes     Int       @default(1)
  rsvpDeadline    DateTime?
  requireMeal     Boolean   @default(false)
  mealOptions     String[]

  // Showcase Content (JSON)
  speakers   Json?
  timeline   Json?
  sponsors   Json?
  gallery    String[]
  faq        Json?

  // Relations
  userId     String
  user       User      @relation(fields: [userId], references: [id])
  guests     Guest[]

  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt
}
\`\`\`

### Guest
\`\`\`prisma
model Guest {
  id             String       @id @default(cuid())
  firstName      String
  lastName       String
  email          String
  phone          String?
  token          String       @unique
  tokenHash      String       @unique
  status         GuestStatus  @default(PENDING)

  // Response
  attending Boolean?
  plusOnes  Int      @default(0)

  // Meal preferences
  mealChoice String?
  allergies  String?  @db.Text

  // Additional info
  accessibilityNotes String? @db.Text
  transportNeeds     String? @db.Text
  lodgingNeeds       String? @db.Text

  // Consents
  consentPhotos Boolean @default(false)

  // QR Code for check-in
  qrCodeId String @unique @default(cuid())

  // Relations
  eventId        String
  event          Event         @relation(fields: [eventId], references: [id], onDelete: Cascade)
  emailLogs      EmailLog[]

  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt

  @@unique([eventId, email])
}

enum GuestStatus {
  PENDING
  ACCEPTED
  DECLINED
}
\`\`\`

### EmailIntegration
\`\`\`prisma
model EmailIntegration {
  id              String        @id @default(cuid())
  provider        EmailProvider
  isActive        Boolean       @default(false)
  isPrimary       Boolean       @default(false)

  // Credentials (encrypted)
  apiKey          String?
  apiSecret       String?
  smtpHost        String?
  smtpPort        Int?
  smtpUser        String?
  smtpPass        String?

  // Configuration
  fromEmail       String?
  fromName        String?
  replyTo         String?
  webhookUrl      String?
  webhookSecret   String?
  trackOpens      Boolean       @default(true)
  trackClicks     Boolean       @default(true)

  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
}

enum EmailProvider {
  SENDGRID
  RESEND
  MAILGUN
  SMTP
}
\`\`\`

### EmailLog
\`\`\`prisma
model EmailLog {
  id              String      @id @default(cuid())
  guestId         String
  guest           Guest       @relation(fields: [guestId], references: [id], onDelete: Cascade)

  type            EmailType
  subject         String
  sentAt          DateTime    @default(now())

  // Provider Info
  provider        EmailProvider?
  messageId       String?     @unique

  // Tracking
  sentAt          DateTime?
  openedAt        DateTime?
  clickedAt       DateTime?
  bouncedAt       DateTime?

  error           String?     @db.Text

  tracking        EmailTracking[]
}

enum EmailType {
  SAVE_THE_DATE
  INVITE
  INVITATION
  REMINDER
  CONFIRMATION
  INFO
  CUSTOM
}
\`\`\`

### EmailTracking
\`\`\`prisma
model EmailTracking {
  id              String    @id @default(cuid())
  emailLogId      String
  emailLog        EmailLog  @relation(fields: [emailLogId], references: [id], onDelete: Cascade)

  event           TrackingEvent
  occurredAt      DateTime  @default(now())

  // Metadata
  ipAddress       String?
  userAgent       String?
  location        String?
  clickedUrl      String?
}

enum TrackingEvent {
  SENT
  DELIVERED
  OPENED
  CLICKED
  BOUNCED
  SPAM_REPORTED
  FAILED
}
\`\`\`

## Requêtes Utiles

### Statistiques Événement
\`\`\`typescript
const stats = await prisma.event.findUnique({
  where: { id: eventId },
  include: {
    guests: {
      select: {
        status: true,
        plusOnesCount: true,
        mealChoice: true,
        plusOnesMealChoices: true,
      }
    },
    _count: {
      select: {
        guests: true
      }
    }
  }
})

const totalGuests = stats._count.guests
const accepted = stats.guests.filter(g => g.status === 'ACCEPTED').length
const totalParticipants = stats.guests
  .filter(g => g.status === 'ACCEPTED')
  .reduce((sum, g) => sum + 1 + g.plusOnesCount, 0)
\`\`\`

### Performance Email
\`\`\`typescript
const emailStats = await prisma.emailLog.groupBy({
  by: ['type'],
  where: {
    guest: {
      eventId: eventId
    }
  },
  _count: {
    _all: true
  }
})
\`\`\`

### Invités à Relancer
\`\`\`typescript
const toRemind = await prisma.guest.findMany({
  where: {
    eventId: eventId,
    status: 'PENDING',
    emailLogs: {
      some: {
        type: 'INVITATION',
        sentAt: {
          lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 jours
        }
      }
    }
  }
})
\`\`\``
    },
    email: {
      title: 'Système Email',
      icon: Mail,
      content: `# 📧 Système d'Intégration Email

## Architecture

Le système email supporte 4 providers différents via une interface unifiée.

### Service Unifié

\`\`\`typescript
// lib/email-service.ts
export async function sendEmail(
  data: EmailData,
  integration: EmailIntegration
): Promise<EmailResult>
\`\`\`

### Providers Supportés

1. **SendGrid** - Enterprise-grade, tracking avancé
2. **Resend** - Moderne, developer-friendly
3. **Mailgun** - Flexible, puissant
4. **SMTP** - Custom, utilise Nodemailer

## Configuration

### 1. Créer une Intégration

Admin → Paramètres → Intégrations

**SendGrid** :
- API Key : Depuis SendGrid dashboard
- From Email : Email vérifié
- Webhook URL : \`https://yourdomain.com/api/webhooks/email/sendgrid\`

**Resend** :
- API Key : Depuis Resend dashboard
- From Email : Email vérifié
- Webhook : Configurer dans Resend

**Mailgun** :
- API Key : Depuis Mailgun dashboard
- API Secret : Webhook signing key
- Domain : Votre domaine Mailgun

**SMTP** :
- Host : smtp.example.com
- Port : 587 (STARTTLS) ou 465 (SSL)
- User : votre-email@example.com
- Pass : mot de passe

### 2. Activer le Tracking

- **Track Opens** : Insère un pixel invisible
- **Track Clicks** : Réécrit les URLs

### 3. Tester la Connexion

Bouton "Tester la connexion" envoie un email de test.

## Webhooks

Les webhooks permettent de recevoir des événements en temps réel.

### Configuration SendGrid

1. SendGrid Dashboard → Settings → Mail Settings → Event Webhook
2. HTTP POST URL : \`https://yourdomain.com/api/webhooks/email/sendgrid\`
3. Events : Delivered, Opened, Clicked, Bounced, Spam Report
4. Signature Verification : ENABLED

### Configuration Resend

1. Resend Dashboard → Webhooks
2. Endpoint : \`https://yourdomain.com/api/webhooks/email/resend\`
3. Events : email.delivered, email.opened, email.clicked, email.bounced

### Configuration Mailgun

1. Mailgun Dashboard → Webhooks
2. Delivered : \`https://yourdomain.com/api/webhooks/email/mailgun\`
3. Opened : \`https://yourdomain.com/api/webhooks/email/mailgun\`
4. Clicked : \`https://yourdomain.com/api/webhooks/email/mailgun\`

## Sécurité

### Vérification des Signatures

**SendGrid** (RSA-SHA256) :
\`\`\`typescript
const verifier = crypto.createVerify('RSA-SHA256')
const data = timestamp + payload
verifier.update(data)
const isValid = verifier.verify(publicKey, signature, 'base64')
\`\`\`

**Resend** (HMAC-SHA256 via Svix) :
\`\`\`typescript
// Utilise le header svix-signature
const webhook = new Webhook(webhookSecret)
const verified = webhook.verify(payload, headers)
\`\`\`

**Mailgun** (HMAC-SHA256) :
\`\`\`typescript
const hmac = crypto.createHmac('sha256', webhookSecret)
const data = timestamp + token
hmac.update(data)
const computedSignature = hmac.digest('hex')
const isValid = computedSignature === signature
\`\`\`

### Encryption des Credentials

Tous les API keys et secrets sont encryptés avec AES-256-CBC :

\`\`\`typescript
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY // 32 bytes
const ENCRYPTION_IV = process.env.ENCRYPTION_IV   // 16 bytes

function encrypt(text: string): string {
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv)
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return encrypted
}

function decrypt(encrypted: string): string {
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv)
  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}
\`\`\`

## Tracking

### Pixel de Tracking (Opens)

\`\`\`html
<img src="https://yourdomain.com/api/track/open/TRACKING_ID/pixel.gif"
     width="1" height="1" alt="" />
\`\`\`

### URL Tracking (Clicks)

\`\`\`
Original: https://example.com/rsvp/TOKEN
Tracked:  https://yourdomain.com/api/track/click/TRACKING_ID?url=https://example.com/rsvp/TOKEN
\`\`\`

## Types d'Emails

### 1. Save the Date
Annonce préliminaire de l'événement

### 2. Invitation
Invitation officielle avec lien RSVP

### 3. Confirmation
Confirmation après RSVP acceptée

### 4. Reminder
Rappel avant l'événement (à implémenter)

## Exemple d'Utilisation

\`\`\`typescript
import { sendEmail } from '@/lib/email-service'

// Récupérer l'intégration primaire
const integration = await prisma.emailIntegration.findFirst({
  where: {
    isActive: true,
    isPrimary: true
  }
})

// Envoyer un email
const result = await sendEmail({
  to: guest.email,
  subject: 'Invitation - Tech Summit 2025',
  html: emailTemplate,
  trackingId: tracking.id
}, integration)

// Logger le résultat
await prisma.emailLog.create({
  data: {
    guestId: guest.id,
    type: 'INVITATION',
    provider: integration.provider,
    messageId: result.messageId,
    subject: 'Invitation - Tech Summit 2025'
  }
})
\`\`\``
    },
    security: {
      title: 'Sécurité',
      icon: Shield,
      content: `# 🔒 Sécurité

## Tokens Invités

### Génération

Chaque invité reçoit un token unique et sécurisé :

\`\`\`typescript
import crypto from 'crypto'

export function generateGuestToken(): string {
  // 32 bytes = 256 bits d'entropie
  return crypto.randomBytes(32).toString('hex')
}
\`\`\`

### Hashing

Les tokens sont hashés avant stockage en base :

\`\`\`typescript
export function hashToken(token: string): string {
  return crypto
    .createHash('sha256')
    .update(token)
    .digest('hex')
}
\`\`\`

### Utilisation

\`\`\`typescript
// Création invité
const token = generateGuestToken()
const tokenHash = hashToken(token)

await prisma.guest.create({
  data: {
    token,           // Stocké en clair (envoyé par email)
    tokenHash,       // Hash pour lookup
    // ...
  }
})

// Vérification
const guest = await prisma.guest.findUnique({
  where: { tokenHash: hashToken(providedToken) }
})
\`\`\`

**Pourquoi stocker le token en clair ?**
- Nécessaire pour l'envoyer par email
- Le hash seul est utilisé pour la recherche
- Si la base est compromise, difficile de retrouver les tokens

## Encryption des Credentials

### Variables d'Environnement

\`\`\`bash
# .env
ENCRYPTION_KEY="your-32-byte-hex-string"  # 64 caractères hex
ENCRYPTION_IV="your-16-byte-hex-string"   # 32 caractères hex
\`\`\`

Génération :
\`\`\`bash
# Key (32 bytes)
openssl rand -hex 32

# IV (16 bytes)
openssl rand -hex 16
\`\`\`

### Algorithme

AES-256-CBC (Advanced Encryption Standard, 256-bit key, Cipher Block Chaining)

\`\`\`typescript
const algorithm = 'aes-256-cbc'
const key = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex')
const iv = Buffer.from(process.env.ENCRYPTION_IV!, 'hex')

export function encrypt(text: string): string {
  const cipher = crypto.createCipheriv(algorithm, key, iv)
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return encrypted
}

export function decrypt(encrypted: string): string {
  const decipher = crypto.createDecipheriv(algorithm, key, iv)
  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}
\`\`\`

### Données Encryptées

- API Keys (SendGrid, Resend, Mailgun)
- API Secrets
- SMTP Passwords
- Webhook Secrets

## Webhooks

### Importance de la Vérification

Les webhooks doivent **toujours** vérifier la signature pour :
- Confirmer l'origine (authenticity)
- Empêcher la falsification (integrity)
- Éviter les replay attacks

### SendGrid (RSA-SHA256)

\`\`\`typescript
import crypto from 'crypto'

// Public key fournie par SendGrid
const publicKey = \`-----BEGIN PUBLIC KEY-----
...
-----END PUBLIC KEY-----\`

function verifySignature(
  payload: string,
  signature: string,
  timestamp: string
): boolean {
  const verifier = crypto.createVerify('RSA-SHA256')
  const data = timestamp + payload
  verifier.update(data)

  try {
    return verifier.verify(publicKey, signature, 'base64')
  } catch {
    return false
  }
}
\`\`\`

### Resend (Svix)

\`\`\`typescript
import { Webhook } from 'svix'

const webhook = new Webhook(webhookSecret)

try {
  const payload = webhook.verify(body, headers)
  // Payload vérifié
} catch (err) {
  // Signature invalide
  return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
}
\`\`\`

### Mailgun (HMAC-SHA256)

\`\`\`typescript
function verifyMailgunSignature(
  timestamp: string,
  token: string,
  signature: string,
  signingKey: string
): boolean {
  const hmac = crypto.createHmac('sha256', signingKey)
  const data = timestamp + token
  hmac.update(data)
  const computedSignature = hmac.digest('hex')

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(computedSignature)
  )
}
\`\`\`

## Validation des Données

### Zod Schemas

Toutes les entrées utilisateur sont validées :

\`\`\`typescript
import { z } from 'zod'

const rsvpSchema = z.object({
  attending: z.boolean(),
  plusOnes: z.number().min(0).max(5),
  mealChoice: z.string().optional(),
  allergies: z.string().max(500).optional(),
  accessibilityNotes: z.string().max(500).optional(),
  transportNeeds: z.string().max(500).optional(),
  lodgingNeeds: z.string().max(500).optional(),
  consentPhotos: z.boolean().default(false)
})

// Utilisation
try {
  const validated = rsvpSchema.parse(requestBody)
  // Données sûres
} catch (error) {
  // Validation échouée
  return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
}
\`\`\`

## Bonnes Pratiques

### 1. Variables d'Environnement
- ❌ Ne jamais commit les fichiers .env
- ✅ Utiliser .env.example avec des placeholders
- ✅ Rotation régulière des secrets

### 2. API Keys
- ✅ Toujours encrypter avant stockage
- ✅ Utiliser des scopes minimaux
- ✅ Révoquer les clés inutilisées

### 3. Webhooks
- ✅ Toujours vérifier la signature
- ✅ Vérifier le timestamp (éviter replay)
- ✅ Logger les webhooks suspects

### 4. Tokens
- ✅ Utiliser crypto.randomBytes (pas Math.random)
- ✅ Minimum 32 bytes d'entropie
- ✅ Hash avant lookup en base
- ✅ Expiration après utilisation ou délai

### 5. Rate Limiting
À implémenter :
- Limiter les tentatives RSVP
- Limiter les appels API
- Throttling sur les webhooks

### 6. HTTPS
- ✅ Toujours utiliser HTTPS en production
- ✅ Redirect HTTP → HTTPS
- ✅ HSTS headers

### 7. SQL Injection
- ✅ Prisma protège automatiquement
- ✅ Ne jamais construire de requêtes SQL manuellement
- ✅ Valider toutes les entrées avec Zod`
    },
    deployment: {
      title: 'Déploiement',
      icon: Rocket,
      content: `# 🚀 Déploiement

## Vercel (Recommandé)

Vercel est la plateforme optimale pour Next.js.

### 1. Prérequis

- Compte Vercel
- Repository Git (GitHub, GitLab, Bitbucket)
- Base de données PostgreSQL externe

### 2. Base de Données

Options recommandées :
- **Vercel Postgres** - Intégration native
- **Supabase** - Gratuit, généreux
- **Neon** - Serverless PostgreSQL
- **Railway** - Simple, efficace

Exemple Supabase :
\`\`\`
DATABASE_URL="postgresql://postgres:PASSWORD@db.xxx.supabase.co:5432/postgres"
\`\`\`

### 3. Variables d'Environnement

Dans Vercel Dashboard → Settings → Environment Variables :

\`\`\`bash
# Database
DATABASE_URL=postgresql://...

# Auth
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=https://yourdomain.com

# Base URL
NEXT_PUBLIC_BASE_URL=https://yourdomain.com

# Encryption (générer avec: openssl rand -hex 32 et 16)
ENCRYPTION_KEY=your-64-char-hex-string
ENCRYPTION_IV=your-32-char-hex-string

# Email Providers (optionnel si configuré dans l'UI)
SENDGRID_API_KEY=SG.xxx
RESEND_API_KEY=re_xxx
MAILGUN_API_KEY=xxx
\`\`\`

### 4. Build Settings

Vercel détecte automatiquement Next.js :

- **Build Command** : \`npm run build\`
- **Output Directory** : \`.next\`
- **Install Command** : \`npm install\`

### 5. Déploiement

\`\`\`bash
# Installer Vercel CLI
npm i -g vercel

# Premier déploiement
vercel

# Production
vercel --prod
\`\`\`

Ou via Git :
1. Push vers GitHub
2. Import dans Vercel
3. Déploiement automatique

### 6. Migrations Base de Données

**Important** : Ne jamais utiliser \`prisma migrate dev\` en production !

\`\`\`bash
# Appliquer les migrations en production
npx prisma migrate deploy

# Générer le client Prisma
npx prisma generate
\`\`\`

Dans \`package.json\` :
\`\`\`json
{
  "scripts": {
    "build": "prisma generate && prisma migrate deploy && next build",
    "postinstall": "prisma generate"
  }
}
\`\`\`

### 7. Domaine Custom

1. Vercel Dashboard → Settings → Domains
2. Ajouter votre domaine
3. Configurer DNS (A ou CNAME)
4. SSL automatique (Let's Encrypt)

### 8. Webhooks

Après déploiement, configurer les webhooks :

**SendGrid** :
\`https://yourdomain.com/api/webhooks/email/sendgrid\`

**Resend** :
\`https://yourdomain.com/api/webhooks/email/resend\`

**Mailgun** :
\`https://yourdomain.com/api/webhooks/email/mailgun\`

## Autres Plateformes

### Railway

\`\`\`bash
# Installer Railway CLI
npm i -g @railway/cli

# Login
railway login

# Init projet
railway init

# Ajouter PostgreSQL
railway add postgresql

# Déployer
railway up
\`\`\`

### Docker

\`\`\`dockerfile
FROM node:18-alpine AS base

# Dependencies
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# Runner
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
\`\`\`

\`next.config.js\` :
\`\`\`javascript
module.exports = {
  output: 'standalone'
}
\`\`\`

Build & Run :
\`\`\`bash
docker build -t invitation-app .
docker run -p 3000:3000 \\
  -e DATABASE_URL="postgresql://..." \\
  -e NEXTAUTH_SECRET="..." \\
  invitation-app
\`\`\`

## Post-Déploiement

### 1. Seed Initial

\`\`\`bash
# Créer un admin
npx prisma db seed

# Ou données de démo
npm run db:seed:complete
\`\`\`

### 2. Vérifications

- [ ] Application accessible
- [ ] Login admin fonctionne
- [ ] Création événement OK
- [ ] Email integration testée
- [ ] Webhooks configurés
- [ ] RSVP public fonctionnel
- [ ] Tracking actif

### 3. Monitoring

Vercel fournit :
- Analytics (visiteurs, pages)
- Logs (erreurs, requêtes)
- Performance (Core Web Vitals)

Ajout recommandé :
- Sentry (error tracking)
- LogRocket (session replay)
- Plausible/Fathom (analytics privacy-friendly)

### 4. Backups

Base de données :
\`\`\`bash
# Backup
pg_dump $DATABASE_URL > backup.sql

# Restore
psql $DATABASE_URL < backup.sql
\`\`\`

Automatiser avec :
- Supabase : Backups automatiques
- Vercel Postgres : Point-in-time recovery
- Railway : Daily backups

## Performance

### 1. Caching

Next.js cache automatiquement :
- Static pages (ISR)
- API responses (fetch)
- Images (next/image)

### 2. Edge Functions

Déplacer certaines API routes vers l'edge :

\`\`\`typescript
// app/api/track/route.ts
export const runtime = 'edge'
\`\`\`

### 3. Database Connection Pooling

Utiliser Prisma Accelerate ou PgBouncer :

\`\`\`
DATABASE_URL="postgresql://user:pass@pooler.supabase.com:6543/postgres?pgbouncer=true"
\`\`\`

### 4. CDN

Vercel CDN global automatique pour :
- Pages statiques
- Images optimisées
- Assets publics`
    }
  }

  const sectionList = [
    { id: 'overview', ...sections.overview },
    { id: 'architecture', ...sections.architecture },
    { id: 'development', ...sections.development },
    { id: 'testing', ...sections.testing },
    { id: 'api', ...sections.api },
    { id: 'database', ...sections.database },
    { id: 'email', ...sections.email },
    { id: 'security', ...sections.security },
    { id: 'deployment', ...sections.deployment },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Documentation</h1>
          <p className="text-muted-foreground mt-2">
            Guides complets pour développer, tester et déployer l&apos;application
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <a href="/DEVELOPER.md" download>
              <Download className="h-4 w-4 mr-2" />
              DEVELOPER.md
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a href="/TESTING.md" download>
              <Download className="h-4 w-4 mr-2" />
              TESTING.md
            </a>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <Card className="lg:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="text-lg">Sections</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <nav className="space-y-1">
              {sectionList.map((section) => {
                const Icon = section.icon
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                      activeSection === section.id
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm font-medium">{section.title}</span>
                  </button>
                )
              })}
            </nav>
          </CardContent>
        </Card>

        {/* Content Area */}
        <Card className="lg:col-span-3">
          <CardContent className="pt-6">
            <div className="prose prose-sm max-w-none dark:prose-invert">
              {sections[activeSection as keyof typeof sections].content
                .split('\n')
                .map((line, i) => {
                  // Headers
                  if (line.startsWith('# ')) {
                    return <h1 key={i} className="text-3xl font-bold mt-8 mb-4">{line.slice(2)}</h1>
                  }
                  if (line.startsWith('## ')) {
                    return <h2 key={i} className="text-2xl font-bold mt-6 mb-3">{line.slice(3)}</h2>
                  }
                  if (line.startsWith('### ')) {
                    return <h3 key={i} className="text-xl font-semibold mt-4 mb-2">{line.slice(4)}</h3>
                  }
                  if (line.startsWith('#### ')) {
                    return <h4 key={i} className="text-lg font-semibold mt-3 mb-2">{line.slice(5)}</h4>
                  }

                  // Code blocks
                  if (line.startsWith('```')) {
                    const lang = line.slice(3)
                    return <div key={i} className="text-xs text-muted-foreground font-mono mt-2">{lang}</div>
                  }

                  // Lists
                  if (line.match(/^[\-\*] /)) {
                    return <li key={i} className="ml-4">{line.slice(2)}</li>
                  }
                  if (line.match(/^\d+\. /)) {
                    return <li key={i} className="ml-4 list-decimal">{line.slice(line.indexOf('. ') + 2)}</li>
                  }

                  // Bold/checkboxes
                  if (line.includes('**')) {
                    const parts = line.split('**')
                    return (
                      <p key={i} className="my-2">
                        {parts.map((part, j) =>
                          j % 2 === 1 ? <strong key={j}>{part}</strong> : part
                        )}
                      </p>
                    )
                  }

                  if (line.startsWith('- [ ]') || line.startsWith('- [x]')) {
                    const checked = line.startsWith('- [x]')
                    return (
                      <div key={i} className="flex items-center gap-2 my-1">
                        <input type="checkbox" checked={checked} readOnly className="rounded" />
                        <span>{line.slice(6)}</span>
                      </div>
                    )
                  }

                  // Empty lines
                  if (!line.trim()) {
                    return <div key={i} className="h-2" />
                  }

                  // Regular paragraphs
                  return <p key={i} className="my-2">{line}</p>
                })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Code2 className="h-5 w-5" />
              Développement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Setup, structure, bonnes pratiques
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveSection('development')}
            >
              Voir le guide
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TestTube className="h-5 w-5" />
              Tests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Parcours end-to-end, scénarios
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveSection('testing')}
            >
              Voir le guide
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Rocket className="h-5 w-5" />
              Déploiement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Vercel, Docker, production
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveSection('deployment')}
            >
              Voir le guide
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
