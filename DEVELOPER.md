# Documentation Développeur - Invitation Manager

Guide technique complet pour comprendre l'architecture et contribuer au projet.

## 📚 Table des Matières

1. [Architecture Globale](#architecture-globale)
2. [Stack Technique](#stack-technique)
3. [Structure du Projet](#structure-du-projet)
4. [Modèles de Données](#modèles-de-données)
5. [Flux Principaux](#flux-principaux)
6. [APIs](#apis)
7. [Composants Clés](#composants-clés)
8. [Système d'Email](#système-demail)
9. [Sécurité](#sécurité)
10. [Développement](#développement)
11. [Déploiement](#déploiement)
12. [Bonnes Pratiques](#bonnes-pratiques)

---

## Architecture Globale

### Vue d'Ensemble

```
┌─────────────────────────────────────────────────────────────┐
│                    INVITATION MANAGER                        │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Frontend   │  │   Backend    │  │   Database   │     │
│  │              │  │              │  │              │     │
│  │  Next.js 15  │──│  API Routes  │──│  PostgreSQL  │     │
│  │  React 19    │  │  Server Comp │  │  + Prisma    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │Email Providers│  │   Storage    │  │  Auth/Token  │     │
│  │  SendGrid    │  │   Vercel     │  │  Magic Links │     │
│  │  Resend      │  │   Blob       │  │  JWT/Hash    │     │
│  │  Mailgun     │  │              │  │              │     │
│  │  SMTP        │  │              │  │              │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### Principes de Design

**1. Server-First Architecture**
- Maximise l'utilisation de React Server Components
- Minimise le JavaScript côté client
- Améliore les performances et le SEO

**2. Type Safety**
- TypeScript strict partout
- Prisma pour type-safe database access
- Zod pour validation runtime

**3. Progressive Enhancement**
- Fonctionne sans JavaScript (formulaires)
- Amélioration progressive avec React
- Responsive mobile-first

**4. Security by Default**
- Tokens hashés en base
- Encryption des credentials
- CSRF protection
- Input validation

---

## Stack Technique

### Frontend

| Technologie | Version | Usage |
|-------------|---------|-------|
| **Next.js** | 15.0.3 | Framework React avec App Router |
| **React** | 19.0.0 | UI Library |
| **TypeScript** | 5.7.2 | Type safety |
| **Tailwind CSS** | 3.4.17 | Styling |
| **Framer Motion** | 11.15.0 | Animations |
| **Radix UI** | Latest | Composants accessibles |
| **shadcn/ui** | Latest | UI components |
| **Lucide React** | 0.468.0 | Icons |
| **React Hook Form** | 7.54.2 | Formulaires |
| **Zod** | 3.24.1 | Validation schéma |

### Backend

| Technologie | Version | Usage |
|-------------|---------|-------|
| **Prisma** | 6.0.0 | ORM |
| **PostgreSQL** | 16+ | Base de données |
| **Nodemailer** | 6.9.16 | SMTP emails |
| **QRCode** | 1.5.4 | Génération QR codes |
| **bcryptjs** | 2.4.3 | Hashing |
| **jsonwebtoken** | 9.0.2 | JWT tokens |

### Outils de Développement

```json
{
  "eslint": "^9.17.0",
  "prettier": "Latest",
  "tsx": "^4.19.2",
  "prisma": "^6.0.0"
}
```

---

## Structure du Projet

```
invitation/
├── app/                          # Next.js App Router
│   ├── (auth)/                  # Groupe de routes auth
│   ├── admin/                   # Interface administrateur
│   │   ├── layout.tsx           # Layout avec sidebar
│   │   ├── page.tsx             # Dashboard
│   │   ├── events/              # Gestion événements
│   │   │   ├── [id]/           # Détails événement
│   │   │   │   ├── layout.tsx  # Sidebar événement
│   │   │   │   ├── page.tsx    # Vue d'ensemble
│   │   │   │   ├── guests/     # Invités
│   │   │   │   ├── invitation/ # Config invitation
│   │   │   │   ├── save-the-date/
│   │   │   │   ├── rsvp-config/
│   │   │   │   ├── showcase/   # Éditeur showcase
│   │   │   │   └── communications/
│   │   │   └── new/            # Création événement
│   │   ├── settings/
│   │   │   └── integrations/   # Config email providers
│   │   ├── setup/              # Configuration initiale
│   │   └── tutoriel/           # Guide utilisateur
│   ├── api/                     # API Routes
│   │   ├── admin/              # APIs admin
│   │   │   ├── events/
│   │   │   ├── guests/
│   │   │   ├── integrations/   # Email integrations
│   │   │   └── setup/
│   │   ├── guest/              # APIs invités
│   │   ├── rsvp/               # Gestion RSVP
│   │   ├── track/              # Email tracking
│   │   │   ├── open/[id]/
│   │   │   └── click/[id]/
│   │   └── webhooks/           # Webhooks providers
│   │       └── email/
│   │           ├── sendgrid/
│   │           ├── resend/
│   │           └── mailgun/
│   ├── event/[slug]/           # Showcase public
│   ├── guest/[token]/          # Formulaire RSVP
│   └── layout.tsx              # Root layout
├── components/                  # React components
│   ├── ui/                     # shadcn/ui components
│   ├── admin/                  # Composants admin
│   │   └── sidebar.tsx
│   ├── showcase/               # Éditeurs showcase
│   │   ├── gallery-editor.tsx
│   │   ├── speakers-editor.tsx
│   │   ├── sponsors-editor.tsx
│   │   ├── timeline-editor.tsx
│   │   └── faq-editor.tsx
│   └── [feature-components].tsx
├── lib/                        # Utilities
│   ├── prisma.ts              # Prisma client
│   ├── auth.ts                # Auth helpers
│   ├── email-service.ts       # Email sending
│   ├── email-templates.ts     # Email templates
│   └── utils.ts               # Utilities
├── prisma/                     # Database
│   ├── schema.prisma          # Schema
│   ├── migrations/            # Migrations
│   ├── seed.ts                # Seed simple
│   ├── seed-weevup.ts         # Seed Weevup
│   └── seed-complete.ts       # Seed complet
├── public/                     # Assets statiques
├── styles/                     # Styles globaux
├── TESTING.md                 # Guide de test
├── DEVELOPER.md               # Ce fichier
└── package.json
```

---

## Modèles de Données

### Schéma Prisma - Relations

```
User (Admin)
  │
  └──> Event (1:N)
         │
         ├──> Guest (1:N)
         │     │
         │     ├──> RSVP (1:1)
         │     ├──> Checkin (1:1)
         │     └──> EmailLog (1:N)
         │
         └──> EmailTracking (1:N)

EmailIntegration (Global)
```

### Modèle Event

**Champs principaux:**
```typescript
{
  id: string
  name: string
  slug: string (unique)
  startsAt: DateTime
  endsAt: DateTime
  venueName: string
  address: string
  city: string
  country: string

  // RSVP Config
  rsvpDeadline: DateTime
  allowPlusOnes: boolean
  maxPlusOnes: int
  requireMeal: boolean
  mealOptions: string[]

  // Features
  enableTransport: boolean
  enableLodging: boolean
  enableAccessibility: boolean
  enablePhotoConsent: boolean

  // Showcase
  showcaseEnabled: boolean
  showcaseTheme: string
  showcaseSections: string[]
  speakers: Json (array)
  timeline: Json (array)
  sponsors: Json (array)
  gallery: string[] (URLs)
  faq: Json (array)

  // Relations
  guests: Guest[]
  admin: User
}
```

### Modèle Guest

**Statuts possibles:**
```typescript
enum GuestStatus {
  PENDING     // Invitation pas encore envoyée
  INVITED     // Invitation envoyée, pas de réponse
  RESPONDED   // A répondu (oui ou non)
  BOUNCED     // Email bounced
}
```

**Token Security:**
```typescript
{
  token: string        // En clair pour les URLs
  tokenHash: string    // Hash SHA-256 stocké en base
  tokenExpiry: DateTime
}
```

### Modèle RSVP

```typescript
{
  id: string
  eventId: string
  guestId: string (unique per event)

  // Participation
  attending: boolean
  plusOnes: int (0-N)

  // Repas
  mealChoice: string?
  dietaryRestrictions: string?
  allergies: string?

  // Logistique
  needsTransport: boolean
  needsLodging: boolean
  needsAccessibility: boolean
  accessibilityNeeds: string?

  // Consentements
  consentPhotos: boolean

  // Timestamps
  createdAt: DateTime
  updatedAt: DateTime
}
```

### Modèle EmailIntegration

```typescript
{
  id: string
  provider: EmailProvider (SENDGRID | RESEND | MAILGUN | SMTP)

  isActive: boolean
  isPrimary: boolean (unique)

  // Credentials (encrypted)
  apiKey?: string
  apiSecret?: string
  smtpHost?: string
  smtpPort?: int
  smtpUser?: string
  smtpPass?: string

  // Config
  fromEmail?: string
  fromName?: string
  replyTo?: string

  // Tracking
  trackOpens: boolean
  trackClicks: boolean

  // Webhooks
  webhookUrl?: string
  webhookSecret?: string

  // Limits
  dailyLimit?: int
  monthlyLimit?: int

  // Stats
  lastTestedAt?: DateTime
  lastUsedAt?: DateTime
}
```

---

## Flux Principaux

### 1. Création d'Événement

```
Admin → /admin/events/new
  │
  ├─> Remplir formulaire
  │   ├── Informations générales
  │   ├── Configuration RSVP
  │   └── Features (transport, etc.)
  │
  ├─> POST /api/admin/events
  │   └── Prisma.event.create()
  │
  ├─> Redirect → /admin/events/[id]
  │
  └─> Configure sections:
      ├── Save the Date config
      ├── Invitation config
      ├── RSVP config
      └── Showcase builder
```

### 2. Import d'Invités

```
Admin → /admin/events/[id]/guests
  │
  ├─> Upload CSV
  │   └── Format: firstName,lastName,email,company,tags
  │
  ├─> POST /api/admin/guests/import
  │   ├── Parse CSV (papaparse)
  │   ├── Validate emails
  │   ├── Generate unique tokens
  │   ├── Hash tokens (SHA-256)
  │   └── Bulk insert Prisma
  │
  └─> Display:
      ├── Success count
      ├── Error list (duplicates, invalid)
      └── Sample invitation URLs
```

### 3. Envoi d'Invitations

```
Admin → Communications Page
  │
  ├─> Select guests (all / filtered)
  │
  ├─> Choose template (Save the Date / Invitation)
  │
  ├─> POST /api/admin/send-invitations
  │   │
  │   ├─> For each guest:
  │   │   ├── Get primary EmailIntegration
  │   │   ├── Decrypt credentials
  │   │   ├── Generate email HTML
  │   │   │   ├── Personalization (name, etc.)
  │   │   │   ├── Unique RSVP link (/guest/[token])
  │   │   │   └── Tracking pixel
  │   │   ├── Send via provider
  │   │   │   └── sendEmail(data, integration)
  │   │   ├── Create EmailLog
  │   │   └── Create EmailTracking
  │   │
  │   └─> Update Guest.status = 'INVITED'
  │
  └─> Display results:
      ├── Sent count
      ├── Failed count
      └── Error details
```

### 4. Parcours RSVP Invité

```
Guest → Click email link
  │
  ├─> /guest/[token]
  │   │
  │   ├─> Validate token
  │   │   ├── Find by hash
  │   │   ├── Check expiry
  │   │   └── Load guest + event
  │   │
  │   └─> Display multi-step form:
  │
  ├─> Step 1: Participation (Oui/Non)
  │   └── If Non → Skip to confirmation
  │
  ├─> Step 2: Accompagnants (if allowed)
  │   └── 0 to maxPlusOnes
  │
  ├─> Step 3: Choix repas (if required)
  │   ├── Select from mealOptions
  │   └── Allergies/restrictions
  │
  ├─> Step 4: Préférences
  │   ├── Transport
  │   ├── Lodging
  │   └── Accessibility
  │
  ├─> Step 5: Consentements
  │   └── Photos
  │
  ├─> Step 6: Récapitulatif
  │   └── Review all answers
  │
  ├─> Step 7: Soumission
  │   │
  │   ├─> POST /api/rsvp
  │   │   ├── Validate data
  │   │   ├── Upsert RSVP
  │   │   ├── Update Guest.status = 'RESPONDED'
  │   │   ├── Generate QR code (if attending)
  │   │   ├── Create Checkin record
  │   │   └── Send confirmation email
  │   │
  │   └─> Display:
  │       ├── Success message + confetti
  │       ├── QR code (if attending)
  │       └── Modification instructions
```

### 5. Email Tracking

```
Email Sent → Invité
  │
  ├─> Email opened
  │   └── Tracking pixel loaded
  │       └── GET /api/track/open/[trackingId]
  │           ├── Update EmailTracking.openedAt
  │           ├── Update EmailLog.status = 'OPENED'
  │           └── Return 1x1 transparent GIF
  │
  └─> Link clicked
      └── Click tracking link
          └── GET /api/track/click/[trackingId]?url=[target]
              ├── Update EmailTracking.clickedAt
              ├── Update EmailLog.status = 'CLICKED'
              └── Redirect to target URL
```

### 6. Webhooks Email Providers

```
Provider → Webhook Event
  │
  ├─> POST /api/webhooks/email/[provider]
  │   │
  │   ├─> Verify signature
  │   │   ├── SendGrid: RSA-SHA256
  │   │   ├── Resend: HMAC-SHA256
  │   │   └── Mailgun: HMAC-SHA256
  │   │
  │   ├─> Parse event
  │   │   ├── delivered
  │   │   ├── opened
  │   │   ├── clicked
  │   │   ├── bounced
  │   │   └── complained
  │   │
  │   ├─> Find EmailLog by providerId
  │   │
  │   ├─> Update statuses
  │   │   ├── EmailLog.status
  │   │   ├── EmailTracking.status
  │   │   └── Guest.status (if bounced)
  │   │
  │   └─> Return 200 OK
  │
  └─> Provider retries if error
```

---

## APIs

### Structure des Routes API

#### Admin APIs

**GET /api/admin/events**
- Liste tous les événements
- Permissions: ADMIN only

**POST /api/admin/events**
```typescript
Body: {
  name: string
  slug: string
  startsAt: DateTime
  endsAt: DateTime
  venueName: string
  // ... all event fields
}
Response: { event: Event }
```

**GET /api/admin/events/[id]**
- Détails d'un événement
- Includes: guests, stats

**PATCH /api/admin/events/[id]**
- Update event

**DELETE /api/admin/events/[id]**
- Soft delete (ou hard selon implémentation)

**POST /api/admin/guests/import**
```typescript
Body: {
  eventId: string
  guests: {
    firstName: string
    lastName: string
    email: string
    company?: string
    tags?: string[]
  }[]
}
Response: {
  created: number
  errors: { row: number, error: string }[]
}
```

**POST /api/admin/integrations/email**
```typescript
Body: {
  provider: EmailProvider
  apiKey?: string
  // ... provider-specific fields
}
Response: { integration: EmailIntegration }
```

**POST /api/admin/integrations/email/test**
```typescript
Body: {
  integrationId: string
}
Response: {
  success: boolean
  messageId?: string
  error?: string
}
```

#### Guest APIs

**GET /api/guest/[token]**
```typescript
Response: {
  guest: Guest
  event: Event
  rsvp?: RSVP
}
```

**POST /api/rsvp**
```typescript
Body: {
  token: string
  attending: boolean
  plusOnes?: number
  mealChoice?: string
  // ... all RSVP fields
}
Response: {
  rsvp: RSVP
  qrCode?: string
}
```

#### Tracking APIs

**GET /api/track/open/[trackingId]**
- Returns: 1x1 transparent GIF
- Side effect: Updates tracking

**GET /api/track/click/[trackingId]?url=[target]**
- Returns: 302 redirect
- Side effect: Updates tracking

#### Webhook APIs

**POST /api/webhooks/email/sendgrid**
**POST /api/webhooks/email/resend**
**POST /api/webhooks/email/mailgun**
- Body: Provider-specific event format
- Response: 200 OK

---

## Composants Clés

### ShowcaseBuilder

**Emplacement:** `components/showcase-builder.tsx`

**Fonction:** Éditeur WYSIWYG du showcase public

**Fonctionnalités:**
- 8 thèmes prédéfinis
- Drag & drop sections
- Preview temps réel (split-screen)
- Éditeurs spécialisés:
  - Gallery: Upload images
  - Speakers: CRUD speakers
  - Sponsors: 3 tiers (Platinum, Gold, Silver)
  - Timeline: Events chronologiques
  - FAQ: Questions/réponses

**State management:**
```typescript
const [showcaseTheme, setShowcaseTheme] = useState<string>()
const [sections, setSections] = useState<string[]>()
const [speakers, setSpeakers] = useState<Speaker[]>()
// ... etc
```

**Sauvegarde:**
```typescript
await fetch(`/api/admin/events/${eventId}`, {
  method: 'PATCH',
  body: JSON.stringify({
    showcaseTheme,
    showcaseSections: sections,
    speakers,
    // ...
  })
})
```

### RSVPProgress

**Emplacement:** `components/rsvp-progress.tsx`

**Fonction:** Formulaire multi-étapes avec navigation

**Étapes:**
```typescript
const steps = [
  { id: 'participation', label: 'Participation' },
  { id: 'plusones', label: 'Accompagnants' },
  { id: 'meal', label: 'Repas' },
  { id: 'preferences', label: 'Préférences' },
  { id: 'consent', label: 'Consentements' },
  { id: 'summary', label: 'Récapitulatif' },
  { id: 'confirmation', label: 'Confirmation' }
]
```

**Navigation:**
- Boutons Précédent/Suivant
- Validation par étape
- Skip conditionnels (si attending=false)

### AdminSidebar

**Emplacement:** `components/admin/sidebar.tsx`

**Structure:**
```typescript
const navSections: NavSection[] = [
  {
    title: "Vue d'ensemble",
    items: [{ name: 'Tableau de bord', href: '/admin', icon: LayoutDashboard }]
  },
  {
    title: "Gestion des événements",
    items: [
      { name: 'Événements', href: '/admin/events', icon: Calendar },
      { name: 'Invités & RSVP', href: '/admin/rsvp', icon: CheckSquare }
    ]
  },
  {
    title: "Analyse & Configuration",
    items: [
      { name: 'Statistiques', href: '/admin/analytics', icon: BarChart },
      { name: 'Intégrations', href: '/admin/settings/integrations', icon: Plug },
      { name: 'Configuration', href: '/admin/setup', icon: Settings }
    ]
  },
  // ...
]
```

---

## Système d'Email

### Architecture

```
┌──────────────────────────────────────────────────────┐
│             EmailIntegration (Config)                 │
│  ┌──────────────────────────────────────────────┐   │
│  │ Provider: SENDGRID | RESEND | MAILGUN | SMTP│   │
│  │ Credentials: Encrypted                        │   │
│  │ isPrimary: boolean                           │   │
│  └──────────────────────────────────────────────┘   │
└───────────────────┬──────────────────────────────────┘
                    │
                    ▼
        ┌────────────────────────┐
        │  lib/email-service.ts  │
        │                        │
        │  sendEmail(data, int)  │
        └───────┬────────────────┘
                │
    ┌───────────┴────────────┐
    │                        │
    ▼                        ▼
sendViaSendGrid()      sendViaResend()
    │                        │
    ▼                        ▼
sendViaMailgun()       sendViaSMTP()
    │                        │
    └────────────┬───────────┘
                 │
                 ▼
        ┌────────────────┐
        │  Email Sent    │
        │                │
        │ + EmailLog     │
        │ + EmailTracking│
        └────────────────┘
```

### Fonctions Principales

#### sendEmail()

**Signature:**
```typescript
async function sendEmail(
  data: EmailData,
  integration: EmailIntegration
): Promise<EmailResult>

interface EmailData {
  to: string | string[]
  from?: string
  fromName?: string
  replyTo?: string
  subject: string
  html: string
  text?: string
  cc?: string | string[]
  bcc?: string | string[]
}

interface EmailResult {
  success: boolean
  messageId?: string
  error?: string
}
```

**Logic:**
```typescript
export async function sendEmail(data, integration) {
  const from = data.from || integration.fromEmail
  const fromName = data.fromName || integration.fromName

  switch (integration.provider) {
    case 'SENDGRID':
      return sendViaSendGrid(data, integration, from, fromName)
    case 'RESEND':
      return sendViaResend(data, integration, from, fromName)
    case 'MAILGUN':
      return sendViaMailgun(data, integration, from, fromName)
    case 'SMTP':
      return sendViaSMTP(data, integration, from, fromName)
  }
}
```

#### Encryption

**Chiffrement AES-256-CBC:**
```typescript
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-32-chars'
const ALGORITHM = 'aes-256-cbc'

function encrypt(text: string): string {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(
    ALGORITHM,
    Buffer.from(ENCRYPTION_KEY.slice(0, 32)),
    iv
  )
  let encrypted = cipher.update(text)
  encrypted = Buffer.concat([encrypted, cipher.final()])
  return iv.toString('hex') + ':' + encrypted.toString('hex')
}

function decrypt(text: string): string {
  const parts = text.split(':')
  const iv = Buffer.from(parts.shift()!, 'hex')
  const encrypted = Buffer.from(parts.join(':'), 'hex')
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    Buffer.from(ENCRYPTION_KEY.slice(0, 32)),
    iv
  )
  let decrypted = decipher.update(encrypted)
  decrypted = Buffer.concat([decrypted, decipher.final()])
  return decrypted.toString()
}
```

**Usage:**
```typescript
// Save
await prisma.emailIntegration.create({
  data: {
    apiKey: encrypt(apiKey)
  }
})

// Retrieve
const apiKey = decrypt(integration.apiKey)
```

---

## Sécurité

### 1. Token Management

**Génération:**
```typescript
import crypto from 'crypto'

export function generateGuestToken(): string {
  return crypto.randomBytes(32).toString('hex') // 64 chars
}
```

**Hashing:**
```typescript
export function hashToken(token: string): string {
  return crypto
    .createHash('sha256')
    .update(token)
    .digest('hex')
}
```

**Storage:**
```typescript
const token = generateGuestToken()
const tokenHash = hashToken(token)

await prisma.guest.create({
  data: {
    token,        // Send in email
    tokenHash,    // Store in database
    tokenExpiry: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days
  }
})
```

**Validation:**
```typescript
const hash = hashToken(tokenFromUrl)
const guest = await prisma.guest.findUnique({
  where: { tokenHash: hash }
})

if (!guest || guest.tokenExpiry < new Date()) {
  throw new Error('Invalid or expired token')
}
```

### 2. API Security

**CSRF Protection:**
- Next.js built-in protection
- SameSite cookies

**Rate Limiting:**
- TODO: Implement avec Upstash ou Vercel Edge Config

**Input Validation:**
```typescript
import { z } from 'zod'

const RSVPSchema = z.object({
  token: z.string().length(64),
  attending: z.boolean(),
  plusOnes: z.number().min(0).max(5),
  mealChoice: z.string().optional(),
  // ...
})

const validated = RSVPSchema.parse(body)
```

### 3. Webhook Signature Verification

**SendGrid:**
```typescript
function verifySignature(payload, signature, timestamp, publicKey) {
  const verifier = crypto.createVerify('RSA-SHA256')
  const data = timestamp + payload
  verifier.update(data)
  return verifier.verify(publicKey, signature, 'base64')
}
```

**Resend/Mailgun (HMAC-SHA256):**
```typescript
function verifyWebhookSignature(payload, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret)
  hmac.update(payload)
  const expected = hmac.digest('hex')
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  )
}
```

### 4. Environment Variables

**Required:**
```env
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_APP_URL="https://your-domain.com"
ENCRYPTION_KEY="your-32-character-encryption-key"
```

**Email Providers (optional):**
```env
# SendGrid
SENDGRID_API_KEY="SG.xxx"
SENDGRID_WEBHOOK_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----..."

# Resend
RESEND_API_KEY="re_xxx"
RESEND_WEBHOOK_SECRET="whsec_xxx"

# Mailgun
MAILGUN_API_KEY="key-xxx"
MAILGUN_DOMAIN="mg.yourdomain.com"
MAILGUN_WEBHOOK_SIGNING_KEY="xxx"
```

---

## Développement

### Setup Local

**1. Clone et install:**
```bash
git clone https://github.com/weevup/invitation.git
cd invitation
npm install
```

**2. Database:**
```bash
# Avec Docker
docker run --name postgres-invitation \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=invitation \
  -p 5432:5432 \
  -d postgres:16

# Ou utilisez une instance existante
```

**3. Configure .env.local:**
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/invitation"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
ENCRYPTION_KEY="your-32-character-encryption-key-here123"
```

**4. Migrations et seed:**
```bash
npx prisma migrate dev
npm run db:seed:complete
```

**5. Run dev server:**
```bash
npm run dev
# Ouvrir http://localhost:3000
```

### Commandes Utiles

```bash
# Prisma
npx prisma studio              # UI pour explorer la DB
npx prisma migrate dev         # Créer migration
npx prisma migrate deploy      # Appliquer migrations
npx prisma generate            # Générer client

# Database
npm run db:seed                # Seed basique
npm run db:seed:weevup         # Seed Weevup 10 ans
npm run db:seed:complete       # Seed complet (recommandé)

# Build
npm run build                  # Build production
npm start                      # Start production server

# Lint
npm run lint                   # ESLint
```

### Hot Reload

Next.js 15 supporte:
- Fast Refresh pour React
- Server Components auto-refresh
- API routes hot reload

### Debugging

**VS Code launch.json:**
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node-terminal",
      "request": "launch",
      "command": "npm run dev"
    },
    {
      "name": "Next.js: debug client-side",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000"
    }
  ]
}
```

---

## Déploiement

### Vercel (Recommandé)

**1. Push to GitHub:**
```bash
git push origin main
```

**2. Import sur Vercel:**
- Connect GitHub repo
- Auto-detect Next.js
- Configure env vars

**3. Environment Variables:**
```
DATABASE_URL
ENCRYPTION_KEY
NEXT_PUBLIC_APP_URL
# + Email providers
```

**4. Build Settings:**
```
Build Command: prisma migrate deploy && next build
Output Directory: .next
Install Command: npm install
```

**5. Deploy:**
- Automatic on git push
- Preview deployments pour branches
- Production sur main

### Autres Plateformes

**Docker:**
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build
CMD ["npm", "start"]
```

**Self-Hosted:**
```bash
npm run build
npm start
# Proxy avec Nginx/Caddy
```

---

## Bonnes Pratiques

### 1. Conventions de Code

**Naming:**
- Components: PascalCase (`AdminSidebar.tsx`)
- Files: kebab-case (`email-service.ts`)
- Functions: camelCase (`sendEmail()`)
- Constants: UPPER_SNAKE_CASE (`ENCRYPTION_KEY`)

**File Organization:**
```typescript
// Imports
import { external } from 'library'
import { internal } from '@/lib/utils'

// Types
interface MyType {}

// Constants
const CONSTANT = 'value'

// Functions
function myFunction() {}

// Component
export default function MyComponent() {}
```

### 2. TypeScript

**Strict mode activé:**
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

**Typage explicite:**
```typescript
// ✅ Good
const guests: Guest[] = await prisma.guest.findMany()

// ❌ Bad
const guests = await prisma.guest.findMany() // Type inference ok but explicit better
```

### 3. Server vs Client Components

**Default: Server Components**
```typescript
// app/page.tsx - Server Component (default)
export default async function Page() {
  const data = await fetchData() // OK
  return <div>{data}</div>
}
```

**Client Components:**
```typescript
// components/interactive.tsx
"use client"

export function Interactive() {
  const [state, setState] = useState() // OK
  useEffect(() => {}, []) // OK
  return <button onClick={...}>
}
```

### 4. Error Handling

**Try-Catch dans APIs:**
```typescript
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validated = schema.parse(body)
    const result = await doSomething(validated)
    return NextResponse.json(result)
  } catch (error) {
    console.error('API error:', error)
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### 5. Database Queries

**Use transactions pour opérations multiples:**
```typescript
await prisma.$transaction([
  prisma.guest.update({ where: { id }, data: { status: 'RESPONDED' } }),
  prisma.rSVP.create({ data: rsvpData }),
  prisma.checkin.create({ data: checkinData })
])
```

**Préférer `updateMany` pour bulk updates:**
```typescript
await prisma.guest.updateMany({
  where: { eventId, status: 'PENDING' },
  data: { status: 'INVITED' }
})
```

### 6. Performance

**Lazy loading d'images:**
```typescript
<Image
  src={url}
  alt="..."
  loading="lazy"
  width={800}
  height={600}
/>
```

**Dynamic imports:**
```typescript
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Spinner />,
  ssr: false
})
```

---

## Ressources

### Documentation

- [Next.js 15](https://nextjs.org/docs)
- [React 19](https://react.dev)
- [Prisma](https://www.prisma.io/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)

### Email Providers

- [SendGrid Docs](https://docs.sendgrid.com)
- [Resend Docs](https://resend.com/docs)
- [Mailgun Docs](https://documentation.mailgun.com)

### Support

- GitHub Issues: [Create issue](https://github.com/weevup/invitation/issues)
- Email: dev@weevup.com

---

## Contribution

### Workflow

1. Fork le repo
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

### Guidelines

- Écrire des tests (TODO: setup testing)
- Documenter les nouvelles features
- Suivre les conventions de code
- Update CHANGELOG.md

---

**Happy Coding! 🚀**
