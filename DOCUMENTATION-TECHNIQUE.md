# 🔧 Documentation Technique - Invitation Manager

**Pour développeurs et IA - À LIRE AVANT TOUTE MODIFICATION**

> ⚠️ **CRITIQUE** : Ce document contient l'historique complet, l'architecture, et tous les points d'attention pour éviter les régressions. Lisez-le ENTIÈREMENT avant de commencer des travaux.

**Dernière mise à jour** : 10 novembre 2025
**Version** : 1.0.0 - Phase 1 Complete
**Statut** : ✅ Production Ready

---

## 📚 Table des Matières

1. [Vue d'Ensemble du Projet](#1-vue-densemble-du-projet)
2. [Architecture Technique](#2-architecture-technique)
3. [Historique des Modifications Critiques](#3-historique-des-modifications-critiques)
4. [Points d'Attention & Pièges Connus](#4-points-dattention--pièges-connus)
5. [Base de Données & Prisma](#5-base-de-données--prisma)
6. [Sécurité & Authentication](#6-sécurité--authentication)
7. [Email & Communication](#7-email--communication)
8. [Tests & Qualité](#8-tests--qualité)
9. [Déploiement & CI/CD](#9-déploiement--cicd)
10. [Roadmap & TODOs](#10-roadmap--todos)

---

## 1. Vue d'Ensemble du Projet

### Qu'est-ce que c'est ?

Invitation Manager est une **application full-stack de gestion d'invitations événementielles** avec :
- Dashboard admin complet
- Système RSVP en 7 étapes
- Envoi d'emails automatisés (3 templates)
- QR codes pour check-in
- Pages showcase personnalisables
- Analytics en temps réel

### Stack Technique

```
Frontend:
  - Next.js 15 (App Router) + React 19 + TypeScript 5.7
  - Tailwind CSS 3.4 + shadcn/ui (Radix UI)
  - Framer Motion 11.15 (animations)
  - Recharts 3.3 (analytics)

Backend:
  - Next.js API Routes
  - Prisma 6.0 (ORM)
  - PostgreSQL 14+ (Neon en production)
  - Zod 3.24 (validation)

Email:
  - Resend 6.4 (API recommandée)
  - Nodemailer 6.9 (fallback SMTP)
  - SendGrid (alternative)

Sécurité:
  - jsonwebtoken 9.0 (JWT)
  - bcryptjs 2.4 (hashing)
  - crypto native (encryption AES-256-GCM)
```

### Dépendances Clés à NE JAMAIS MODIFIER sans Tests

⚠️ **CRITIQUES** (breaking changes possibles) :
- `next@^15.0.3` - App Router, async params
- `react@^19.0.0` - Nouvelle version majeure
- `prisma@^6.0.0` + `@prisma/client@^6.0.0` - Migrations
- `typescript@^5.7.2` - Typage strict

✅ **Stables** (mise à jour safe) :
- `tailwindcss`, `lucide-react`, `date-fns`
- `zod`, `clsx`, `framer-motion`

---

## 2. Architecture Technique

### Structure des Dossiers

```
invitation/
├── app/                          # Next.js 15 App Router
│   ├── (auth)/                   # Groupe de routes avec layout auth
│   ├── admin/                    # Dashboard admin (protégé)
│   │   ├── events/[id]/          # Gestion événement
│   │   │   ├── guests/           # Gestion invités
│   │   │   ├── emails/           # Envoi emails
│   │   │   ├── rsvps/            # Suivi réponses
│   │   │   ├── checkin/          # Check-in QR
│   │   │   ├── analytics/        # Analytics
│   │   │   └── showcase/         # Config showcase
│   │   ├── setup/                # Configuration initiale
│   │   └── system/               # Diagnostics système
│   ├── guest/[token]/            # Page RSVP invité (public)
│   ├── event/[slug]/             # Showcase public
│   └── api/                      # API Routes
│       ├── admin/                # API admin (protégée)
│       │   ├── events/           # CRUD événements
│       │   ├── guests/           # CRUD invités
│       │   ├── emails/           # Envoi emails
│       │   ├── analytics/        # Données analytics
│       │   └── integrations/     # Config intégrations
│       ├── guest/                # API invités (publique)
│       │   ├── validate-token/   # Validation token
│       │   └── rsvp/             # Soumission RSVP
│       ├── track/                # Tracking emails (webhooks)
│       └── webhooks/             # Webhooks providers email
│
├── components/                   # Composants React réutilisables
│   ├── ui/                       # shadcn/ui (NE PAS MODIFIER)
│   ├── admin/                    # Composants admin
│   ├── guest/                    # Composants invités
│   └── showcase/                 # Composants showcase
│
├── lib/                          # Utilitaires & configuration
│   ├── prisma.ts                 # ✅ Client Prisma singleton
│   ├── auth.ts                   # ⚠️ JWT & tokens (modifié récemment)
│   ├── encryption.ts             # ✅ AES-256-GCM encryption
│   ├── email-service.ts          # ✅ Service email unifié
│   ├── email.ts                  # ⚠️ Legacy SMTP (à migrer)
│   ├── email-templates.ts        # ✅ Templates HTML
│   ├── rate-limit.ts             # ✅ Rate limiting
│   ├── env.ts                    # ✅ Validation environnement
│   └── showcase-*.ts             # ✅ Showcase utilities
│
├── prisma/                       # Prisma ORM
│   ├── schema.prisma             # ⚠️ Schéma de la DB (9 tables)
│   ├── migrations/               # ✅ 6 migrations appliquées
│   │   ├── 20250101_init/
│   │   ├── 20250107_add_showcase_fields/
│   │   ├── 20250108_add_communication_and_features/
│   │   ├── 20250108_add_email_templates/
│   │   ├── 20250108_add_email_integrations/
│   │   └── 20251109_add_invitation_tracking_fields/
│   └── seed*.ts                  # Scripts de seed (7 fichiers)
│
├── scripts/                      # Scripts utilitaires
│   ├── apply-all-migrations.sql  # ✅ SQL complet idempotent
│   ├── check-db-status.sql       # ✅ Diagnostic DB
│   └── setup-database.sh         # ⚠️ Setup auto (legacy)
│
└── tests/                        # Tests E2E Playwright
    └── e2e/                      # 5 tests principaux
```

### Conventions de Code

#### Routes API Next.js 15

**⚠️ IMPORTANT** : Next.js 15 nécessite `await params` dans les routes dynamiques.

**✅ CORRECT** :
```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params  // ✅ await obligatoire
  // ...
}
```

**❌ INCORRECT** :
```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }  // ❌ Pas Promise
) {
  const { id } = params  // ❌ Pas d'await
  // ...
}
```

#### Prisma Client

**⚠️ TOUJOURS utiliser le singleton** de `lib/prisma.ts` :

```typescript
// ✅ CORRECT
import { prisma } from '@/lib/prisma'

// ❌ INCORRECT
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()  // ❌ Crée une nouvelle instance
```

**Raison** : Évite les connexions multiples en dev (hot reload).

#### Types Prisma

**⚠️ NE JAMAIS utiliser `any` pour les types Prisma** :

```typescript
// ✅ CORRECT
import { Event, Guest, RSVP } from '@prisma/client'

// ❌ INCORRECT
const event: any = await prisma.event.findUnique(...)
```

---

## 3. Historique des Modifications Critiques

### Phase 1 : Développement Initial (Jan-Oct 2025)

#### 1.1 Création du Projet
- Initialisation Next.js 15 + Prisma
- Schéma DB initial (6 tables)
- Dashboard admin basique
- Formulaire RSVP

#### 1.2 Ajout des Fonctionnalités
- **Showcase pages** (20250107)
- **Communication & features** (20250108)
- **Email templates** (20250108)
- **Multi-provider email** (20250108)
- **Invitation tracking** (20251109)

### Phase 1.5 : Corrections de Sécurité & Optimisations (10 Nov 2025)

**⚠️ CRITIQUE** : 67 erreurs TypeScript identifiées et corrigées + optimisation middleware Edge Function.

#### 3.1 Vulnérabilités SQL Injection

**Fichier** : `app/api/admin/database-status/route.ts`

**Problème** :
```typescript
// ❌ AVANT (vulnérable)
const result = await prisma.$queryRawUnsafe<any[]>(`
  SELECT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = '${enumName}'
  ) as exists
`)
```

**Solution** :
```typescript
// ✅ APRÈS (sécurisé)
const result = await prisma.$queryRaw<Array<{ exists: boolean }>>`
  SELECT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = ${enumName}
  ) as exists
`
```

**Impact** : Élimination complète du risque d'injection SQL.

#### 3.2 Configuration JWT

**Fichier** : `lib/auth.ts`

**Problèmes** :
1. Secret par défaut faible
2. Typage `as any` sur options
3. Import `SignOptions` non utilisé

**Solutions** :
```typescript
// ✅ Validation en production
const JWT_SECRET = process.env.JWT_SECRET as Secret

if (!JWT_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('JWT_SECRET must be defined in production environment')
}

// ✅ Cast any pour compatibilité versions jsonwebtoken
return jwt.sign(payload, JWT_SECRET_DEV, { expiresIn } as any)
```

**⚠️ NOTE IMPORTANTE** : Le `as any` sur les options JWT est **nécessaire** pour la compatibilité entre différentes versions de `@types/jsonwebtoken`. Les tentatives de typage strict (`SignOptions`) causent des erreurs de build.

**NE PAS MODIFIER** sans tester sur Vercel !

#### 3.3 Configuration Images Next.js

**Fichier** : `next.config.js`

**Problème** :
```javascript
// ❌ AVANT (dangereux)
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: '**',  // ❌ Accepte TOUS les domaines
    },
  ],
}
```

**Solution** :
```javascript
// ✅ APRÈS (sécurisé)
images: {
  remotePatterns: [
    { protocol: 'https', hostname: 'res.cloudinary.com' },
    { protocol: 'https', hostname: 'images.unsplash.com' },
    { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
    { protocol: 'https', hostname: '*.public.blob.vercel-storage.com' },
  ],
}
```

**Impact** : Protection contre hotlinking et exploitation.

#### 3.4 Variables d'Environnement

**Fichier** : `.env.example`

**Ajouts critiques** :
```env
# ⚠️ OBLIGATOIRE en production
JWT_SECRET="votre-secret-jwt-64-caracteres"
ENCRYPTION_KEY="32-caracteres-exactement-ici"
```

**Génération** :
```bash
# JWT_SECRET
openssl rand -hex 64

# ENCRYPTION_KEY (DOIT faire 32 caractères)
openssl rand -hex 16
```

#### 3.5 Scripts de Build

**Fichier** : `package.json`

**Problème** : Migrations dans le build standard
```json
// ❌ AVANT
"build": "prisma migrate deploy && next build"
```

**Solution** : Séparation build local / Vercel
```json
// ✅ APRÈS
"build": "prisma generate && next build",
"vercel-build": "prisma generate && prisma migrate deploy && next build"
```

**Raison** : DB pas toujours accessible pendant le build local.

#### 3.6 Middleware Edge Function - Limite de Taille

**Fichiers** : `middleware.ts`, `auth.config.ts`

**Problème** :
```
Error: The Edge Function "middleware" size is 1.03 MB and your plan size limit is 1 MB.
```

**Cause** :
```typescript
// ❌ AVANT (1.03 MB - trop lourd)
import { auth } from '@/auth'  // ⚠️ Importe Prisma + bcrypt + Node.js APIs
```

`auth.ts` contient :
- ❌ `@prisma/client` (très lourd)
- ❌ `bcryptjs` (Node.js APIs incompatibles avec Edge Runtime)
- ❌ Logique d'authentification complète avec DB

**Solution** : Séparer la configuration légère pour le middleware
```typescript
// ✅ APRÈS (< 1 MB - Edge compatible)
// middleware.ts
import NextAuth from 'next-auth'
import { authConfig } from './auth.config'

export default NextAuth(authConfig).auth

// auth.config.ts - Configuration légère
import type { NextAuthConfig } from 'next-auth'
import { NextResponse } from 'next/server'

export const authConfig = {
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnAdminApi = nextUrl.pathname.startsWith('/api/admin')

      if (isOnAdminApi) {
        if (isLoggedIn) return true
        // Return JSON 401 for API routes
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }
      // Redirect for pages
      return isLoggedIn || !isOnAdmin
    }
  }
}
```

**Architecture NextAuth v5 recommandée** :
```
middleware.ts → auth.config.ts (léger, Edge compatible)
auth.ts → auth.config.ts + Prisma + bcrypt (lourd, Node.js runtime)
```

**⚠️ IMPORTANT** :
- **NE JAMAIS** importer `auth.ts` directement dans `middleware.ts`
- **NE JAMAIS** importer Prisma dans des fichiers utilisés par le middleware
- **TOUJOURS** utiliser `auth.config.ts` pour la logique de protection des routes

**Impact** :
- ✅ Middleware < 1 MB (compatible Vercel Free/Pro)
- ✅ Edge Runtime compatible
- ✅ Même fonctionnalité de protection des routes
- ✅ JSON 401 pour les API routes

---

## 4. Points d'Attention & Pièges Connus

### 4.1 Erreurs TypeScript à Éviter

#### ❌ Piège 1 : Types `any` dans les reducers

**Problème fréquent** :
```typescript
// ❌ INCORRECT
events.reduce((sum, e) => sum + e.guests.length, 0)
// Error: Parameter 'e' implicitly has an 'any' type
```

**Solution** :
```typescript
// ✅ CORRECT
events.reduce((sum: number, e: Event & { guests: Guest[] }) =>
  sum + e.guests.length,
  0
)
```

#### ❌ Piège 2 : JSON fields non typés

**Problème** :
```typescript
// ❌ INCORRECT
const config = event.saveTheDateConfig as any || {}
```

**Solution** :
```typescript
// ✅ CORRECT
interface SaveTheDateConfig {
  eventName?: string
  tagline?: string
  dateAnnouncement?: string
}

const config = (event.saveTheDateConfig as SaveTheDateConfig) || {}
```

#### ❌ Piège 3 : React Hooks dependencies

**⚠️ 15 warnings ESLint** sur les dépendances manquantes.

**Non critique** mais à corriger progressivement :
```typescript
// ⚠️ Warning
useEffect(() => {
  filterGuests()
}, [searchTerm])  // Missing: filterGuests

// ✅ Solution
useEffect(() => {
  filterGuests()
}, [searchTerm, filterGuests])

// Ou utiliser useCallback
const filterGuests = useCallback(() => {
  // ...
}, [dependencies])
```

### 4.2 Problèmes de Performance

#### Images

**⚠️ 18 warnings** : Usage de `<img>` au lieu de `<Image />`.

**Non bloquant** mais impact sur LCP (Largest Contentful Paint).

**À migrer progressivement** :
```tsx
// ⚠️ Actuel
<img src={url} alt="..." />

// ✅ Recommandé
import Image from 'next/image'
<Image src={url} alt="..." width={500} height={300} />
```

### 4.3 Prisma & Base de Données

#### ⚠️ Schéma Prisma : Points d'Attention

**1. Champs JSON non typés**

Plusieurs champs `Json?` dans le schéma :
- `Event.saveTheDateConfig`
- `Event.invitationConfig`
- `Event.rsvpConfig`
- `Event.showcaseSections`
- `Event.showcaseGallery`
- Etc.

**Problème** : Pas de validation côté DB, risque de données corrompues.

**Solution recommandée** : Créer des types Zod et valider avant insert.

**2. Arrays PostgreSQL**

Plusieurs `String[]` :
- `Event.mealOptions`
- `Guest.tags`

**⚠️ Compatible uniquement PostgreSQL** (pas SQLite, MySQL).

**3. Tokens invités**

```prisma
model Guest {
  token       String  @unique       // Token en clair
  tokenHash   String  @unique       // Hash SHA-256
  tokenExpiry DateTime?
}
```

**IMPORTANT** :
- `token` est stocké en clair (pour l'envoi email)
- `tokenHash` est utilisé pour la validation
- Utiliser **toujours** `hashToken()` de `lib/auth.ts` pour les lookups

### 4.4 Email & SMTP

#### Service Email Unifié

**⚠️ Migration en cours** : Deux systèmes coexistent.

**Nouveau** (recommandé) : `lib/email-service.ts`
- Support multi-provider (Resend, SendGrid, SMTP)
- Encryption des API keys
- Fallback automatique

**Legacy** (à migrer) : `lib/email.ts`
- SMTP uniquement
- Utilisé par 2 routes seulement

**TODO** : Migrer les dernières routes vers `email-service.ts`.

#### Webhooks Email

**⚠️ CRITIQUE** : Signatures obligatoires pour tous les providers.

**Fichiers** :
- `app/api/webhooks/email/resend/route.ts`
- `app/api/webhooks/email/sendgrid/route.ts`

**Validation** :
```typescript
// ✅ Toujours valider la signature
const signature = request.headers.get('x-webhook-signature')
if (!isValidSignature(body, signature, webhookSecret)) {
  return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
}
```

**NE JAMAIS accepter de webhooks non signés !**

---

## 5. Base de Données & Prisma

### 5.1 Schéma Complet

**9 tables** :

```
User (Comptes admin)
  └── Event (Événements)
       ├── Guest (Invités)
       │    ├── RSVP (Réponses)
       │    ├── Checkin (Check-in)
       │    ├── EmailLog (Logs emails)
       │    └── EmailTracking (Tracking)
       └── EmailLog

EmailTemplate (Templates réutilisables)
EmailIntegration (Config providers)
```

### 5.2 Relations Importantes

**Cascade Delete** :
- Supprimer un `Event` → Supprime tous ses `Guest`, `RSVP`, etc.
- Supprimer un `Guest` → Supprime son `RSVP`

**⚠️ ATTENTION** : Pas de soft delete. Suppression = définitive.

### 5.3 Migrations

**6 migrations appliquées** :

| Date | Migration | Description |
|------|-----------|-------------|
| 20250101 | init | Schéma initial (6 tables) |
| 20250107 | showcase_fields | Config showcase |
| 20250108 | communication_features | RSVP & features |
| 20250108 | email_templates | Templates email |
| 20250108 | email_integrations | Multi-provider |
| 20251109 | invitation_tracking | Tracking invitations |

**⚠️ Toutes les migrations sont idempotentes** via `IF NOT EXISTS`.

### 5.4 Seeds Disponibles

**7 scripts de seed** :

```bash
npm run db:seed                    # Seed basique (admin + 1 event)
npm run db:seed:complete           # Seed complet (templates, etc.)
npm run db:seed:demo               # Event démo avec guests
npm run db:seed:demo:wedding       # Mariage
npm run db:seed:demo:gala          # Gala
npm run db:seed:demo:workshop      # Workshop
npm run db:seed:demo:weevup-10ans  # Weevup 10 ans
```

**Plus de détails** : `prisma/README-DEMOS.md`

---

## 6. Sécurité & Authentication

### 6.1 Système d'Authentification

**2 types d'auth** :

#### Admin (JWT)

```typescript
// Pas encore implémenté
// TODO Phase 2 : Auth admin avec login/password
```

#### Invités (Magic Links)

```typescript
// Génération token
const token = generateGuestToken()  // 64 char hex
const tokenHash = hashToken(token)  // SHA-256

await prisma.guest.create({
  data: {
    token,        // Stocké en clair
    tokenHash,    // Hashé pour lookup
    tokenExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  }
})

// Validation
const guest = await validateGuestToken(token)
```

**⚠️ IMPORTANT** :
- Token en clair pour envoi email
- Lookup par `tokenHash` uniquement
- Expiration optionnelle (30 jours par défaut)

### 6.2 Encryption

**Fichier** : `lib/encryption.ts`

**Usage** : Chiffrer les API keys des intégrations email.

```typescript
import { encrypt, decrypt } from '@/lib/encryption'

// Chiffrement AES-256-GCM
const encryptedKey = encrypt(apiKey)  // Retourne { encrypted, iv, authTag }

// Déchiffrement
const apiKey = decrypt(encryptedKey, iv, authTag)
```

**⚠️ Nécessite `ENCRYPTION_KEY` (32 caractères)** dans `.env`.

### 6.3 Rate Limiting

**Fichier** : `lib/rate-limit.ts`

**Implémentation** : In-memory avec Map (⚠️ pas de persistance).

**Limites** :
```typescript
const limits = {
  'email-send': { max: 10, window: 60000 },      // 10 emails/min
  'rsvp-submit': { max: 3, window: 60000 },      // 3 RSVP/min
  'api-admin': { max: 100, window: 60000 },      // 100 req/min
}
```

**⚠️ TODO Phase 2** : Migrer vers Redis pour multi-instances.

### 6.4 Validation Zod

**Fichiers** avec validation :
- `app/api/admin/events/route.ts` (création événement)
- `app/api/admin/showcase/route.ts` (config showcase)
- `lib/env.ts` (variables d'environnement)

**Exemple** :
```typescript
const eventSchema = z.object({
  name: z.string().min(3).max(200),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  startsAt: z.string().datetime(),
  // ...
})

const validatedData = eventSchema.parse(data)
```

---

## 7. Email & Communication

### 7.1 Architecture Email

**3 providers supportés** :

1. **Resend** (recommandé)
   - API simple
   - 100 emails/jour gratuit
   - Tracking intégré
   - Webhooks

2. **SendGrid**
   - Analytics avancés
   - Plus cher
   - Webhooks

3. **SMTP** (fallback)
   - Compatible tous SMTP
   - Pas de tracking natif
   - Configuration manuelle

### 7.2 Templates Email

**3 templates HTML** :

| Template | Gradient | Usage | Fichier |
|----------|----------|-------|---------|
| Invitation | Violet | Premier envoi | `lib/email/invitations.ts` |
| Confirmation | Vert/Bleu | Après RSVP positif | `lib/email/confirmations.ts` |
| Reminder | Orange | Relance non-répondants | `lib/email/reminders.ts` |

**Variables disponibles** :
```typescript
{
  guest: { firstName, lastName, email },
  event: { name, startsAt, venueName, address },
  invitationUrl: string,
  qrCode?: string,  // Seulement confirmation
  rsvp?: { attending, plusOnes, mealChoice }
}
```

### 7.3 Envoi d'Emails

**Workflow** :

```typescript
// 1. Récupérer l'intégration active
const integration = await prisma.emailIntegration.findFirst({
  where: { isActive: true, isPrimary: true }
})

// 2. Envoyer via le service
const result = await sendEmail({
  integration,
  to: guest.email,
  subject: "Invitation",
  html: getInvitationEmailTemplate({ guest, event, invitationUrl })
})

// 3. Logger
await prisma.emailLog.create({
  data: {
    eventId,
    guestId,
    type: 'INVITATION',
    status: result.success ? 'SENT' : 'FAILED',
    sentAt: new Date(),
    providerId: result.messageId
  }
})
```

**⚠️ Rate limiting appliqué** : 10 emails/minute par défaut.

### 7.4 Tracking

**2 tables** :

1. **EmailLog** (logs détaillés)
   - Chaque email envoyé
   - Statut (PENDING, SENT, DELIVERED, OPENED, CLICKED, BOUNCED, FAILED)
   - Timestamps (sentAt, openedAt, clickedAt, bouncedAt)

2. **EmailTracking** (tracking simplifié)
   - Vue simplifiée
   - ⚠️ TODO : Migrer vers EmailLog

**Webhooks** :
- Resend : `/api/webhooks/email/resend`
- SendGrid : `/api/webhooks/email/sendgrid`

**Pixel tracking** :
- `/api/track/open/[id]` - Image 1x1 pixel
- `/api/track/click/[id]` - Redirection

---

## 8. Tests & Qualité

### 8.1 Tests E2E Playwright

**Fichiers** : `tests/e2e/*.spec.ts`

**5 tests** :
1. Navigation basique
2. Création d'événement
3. Import CSV invités
4. Formulaire RSVP
5. Envoi d'emails

**Commandes** :
```bash
npm run test:e2e           # Lancer tous les tests
npm run test:e2e:ui        # Mode UI
npm run test:e2e:headed    # Mode headed (voir le navigateur)
npm run test:e2e:debug     # Debug
```

**⚠️ Nécessite** :
- Base de données configurée
- `.env` valide

### 8.2 Linting

**ESLint** configuré avec `eslint-config-next`.

**67 warnings actuels** (non bloquants) :
- 18 warnings `<img>` vs `<Image />`
- 15 warnings React hooks dependencies
- 34 warnings types implicites

**Commande** :
```bash
npm run lint
```

### 8.3 TypeScript

**Configuration** : `tsconfig.json`

```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": false,    // ⚠️ Trop de warnings actuels
    "noUnusedParameters": false
  }
}
```

**⚠️ 67 erreurs TypeScript corrigées** lors de la phase 1.5.

**Vérification** :
```bash
npx tsc --noEmit
```

---

## 9. Déploiement & CI/CD

### 9.1 Vercel

**Configuration** :

```json
// package.json
{
  "build": "prisma generate && next build",
  "vercel-build": "prisma generate && prisma migrate deploy && next build"
}
```

**Variables d'environnement OBLIGATOIRES** :

```env
DATABASE_URL=postgresql://...
NEXT_PUBLIC_APP_URL=https://...
JWT_SECRET=...
ENCRYPTION_KEY=...
EMAIL_PROVIDER=resend
RESEND_API_KEY=...
EMAIL_FROM=...
EMAIL_FROM_NAME=...
```

**Workflow Vercel** :

1. Push sur GitHub
2. Vercel détecte le push
3. Clone le repo
4. `npm install`
5. `prisma generate` (postinstall)
6. `prisma migrate deploy` (vercel-build)
7. `next build`
8. Déploiement

**⚠️ Migrations appliquées automatiquement** lors du build.

### 9.2 Base de Données Neon

**URL actuelle** :
```
postgresql://neondb_owner:npg_XXX@ep-gentle-meadow-XXX.eu-west-2.aws.neon.tech/neondb?sslmode=require
```

**Limitations gratuit** :
- 0.5 GB storage
- 10 GB transfert/mois
- 1 projet
- 100 heures compute/mois

**Monitoring** : https://console.neon.tech

### 9.3 Rollback

**En cas d'erreur critique** :

1. **Via Vercel UI** :
   - Deployments → Sélectionner déploiement précédent
   - "Promote to Production"

2. **Via Git** :
   ```bash
   git revert HEAD
   git push origin main
   ```

3. **Migrations Prisma** :
   ⚠️ **Pas de rollback automatique !**

   Créer une migration inverse manuellement :
   ```bash
   npx prisma migrate dev --name revert_xxx
   ```

---

## 10. Roadmap & TODOs

### 10.1 Phase 1 ✅ (Complete)

- [x] Dashboard admin
- [x] Gestion événements
- [x] Gestion invités (manuel + CSV)
- [x] Formulaire RSVP (7 étapes)
- [x] Emails (3 templates)
- [x] QR codes
- [x] Check-in
- [x] Analytics
- [x] Showcase pages
- [x] Multi-provider email
- [x] Sécurité renforcée

### 10.2 Phase 1.5 🔄 (Corrections - En cours)

**Restant à faire** :

#### Code Quality (Non bloquant)

- [ ] Remplacer `<img>` par `<Image />` (18 occurrences)
- [ ] Corriger React hooks dependencies (15 warnings)
- [ ] Typer les champs JSON du schéma Prisma
- [ ] Remplacer `console.log` par système de logging
- [ ] Migrer les 2 routes restantes vers `email-service.ts`
- [ ] Supprimer `EmailTracking` (redondant avec `EmailLog`)

#### Tests

- [ ] Augmenter couverture tests E2E
- [ ] Ajouter tests unitaires (lib/)
- [ ] Tests d'intégration API

#### Documentation

- [x] Guide pré-déploiement
- [x] Guide démarrage rapide
- [x] Tutoriels complets
- [x] Documentation technique (ce fichier)
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Guide de contribution

### 10.3 Phase 2 🎯 (Planifié)

**Fonctionnalités** :

- [ ] **Billetterie & Paiements** (Stripe)
  - Types de tickets
  - Paiement en ligne
  - Remboursements

- [ ] **Check-in Mobile App**
  - React Native
  - Scan QR offline
  - Sync automatique

- [ ] **Analytics Avancés**
  - Funnel d'engagement
  - Segmentation avancée
  - Rapports personnalisés
  - Export Excel/PDF

- [ ] **Multi-langue (i18n)**
  - Support FR/EN
  - Emails multilingues
  - Showcase traduit

- [ ] **Notifications Push**
  - Web Push API
  - Rappels automatiques

- [ ] **Auth Admin Complète**
  - Login/Password
  - OAuth (Google, GitHub)
  - 2FA

- [ ] **API Publique**
  - REST API documentée
  - Webhooks sortants
  - Rate limiting par API key

### 10.4 Dettes Techniques

**⚠️ À adresser** :

1. **Rate Limiting In-Memory**
   - Problème : Pas de persistance, perdu au restart
   - Solution : Migrer vers Redis/Upstash

2. **Encryption Keys Rotation**
   - Problème : Pas de rotation automatique
   - Solution : Système de versioning des clés

3. **Email Queue**
   - Problème : Envoi synchrone, peut être lent
   - Solution : Job queue (BullMQ + Redis)

4. **Image Upload**
   - Problème : URLs externes uniquement
   - Solution : Vercel Blob Storage ou Cloudinary

5. **Logs Monitoring**
   - Problème : console.log seulement
   - Solution : Sentry ou LogRocket

---

## 🚨 Erreurs à NE JAMAIS Refaire

### 1. ❌ Utiliser `$queryRawUnsafe` avec interpolation

```typescript
// ❌ DANGEREUX
await prisma.$queryRawUnsafe(`... WHERE name = '${userInput}'`)

// ✅ TOUJOURS utiliser paramètres
await prisma.$queryRaw`... WHERE name = ${userInput}`
```

### 2. ❌ Créer plusieurs instances PrismaClient

```typescript
// ❌ INCORRECT
const prisma = new PrismaClient()

// ✅ TOUJOURS utiliser le singleton
import { prisma } from '@/lib/prisma'
```

### 3. ❌ Oublier d'await les params Next.js 15

```typescript
// ❌ INCORRECT
export async function GET(req, { params }) {
  const { id } = params  // ❌ Erreur runtime
}

// ✅ CORRECT
export async function GET(req, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params  // ✅
}
```

### 4. ❌ Stocker des secrets en clair

```typescript
// ❌ INCORRECT
await prisma.emailIntegration.create({
  data: { apiKey: resendKey }  // ❌ En clair !
})

// ✅ CORRECT
import { encrypt } from '@/lib/encryption'
const { encrypted, iv, authTag } = encrypt(resendKey)
await prisma.emailIntegration.create({
  data: { apiKey: encrypted }
})
```

### 5. ❌ Accepter webhooks sans validation signature

```typescript
// ❌ DANGEREUX
export async function POST(req) {
  const data = await req.json()
  // Process data...  ❌ Pas de validation !
}

// ✅ TOUJOURS valider
const signature = req.headers.get('x-webhook-signature')
if (!isValidSignature(body, signature, secret)) {
  return NextResponse.json({ error: 'Invalid' }, { status: 401 })
}
```

---

## 📞 Contact & Support

### Mainteneur Principal

**Développeur** : Claude (IA)
**Organisation** : Weevup
**Date de création** : Janvier 2025

### Documentation

- **Utilisateurs** : `README.md`, `TUTORIELS.md`
- **Déploiement** : `GUIDE-PRE-DEPLOIEMENT.md`
- **Développeurs** : Ce fichier (`DOCUMENTATION-TECHNIQUE.md`)

### Issues & Contributions

**GitHub** : https://github.com/Weevup/invitation/issues

**Avant d'ouvrir une issue** :
1. Lisez cette documentation
2. Vérifiez les issues existantes
3. Fournissez un exemple reproductible

---

## ✅ Checklist Avant Modification

**À vérifier AVANT de modifier le code** :

- [ ] J'ai lu ce document en entier
- [ ] Je comprends l'architecture du projet
- [ ] Je connais les erreurs à éviter (section ci-dessus)
- [ ] J'ai vérifié les points d'attention pour mon fichier
- [ ] Je vais tester en local avant de push
- [ ] Je vais run `npx tsc --noEmit` avant le commit
- [ ] J'ai vérifié que je n'ai pas cassé les migrations Prisma
- [ ] J'ai mis à jour cette documentation si nécessaire

---

## 🎯 TL;DR - Points Critiques

**Si vous ne devez retenir que 5 choses** :

1. **JWT options** : Toujours `as any` pour compatibilité versions
2. **Prisma** : Singleton de `lib/prisma.ts`, paramètres sécurisés
3. **Next.js 15** : `await params` obligatoire dans routes dynamiques
4. **Secrets** : `JWT_SECRET` et `ENCRYPTION_KEY` obligatoires en prod
5. **Webhooks** : Toujours valider les signatures

**Lire en priorité** :
1. Ce fichier (section 3 & 4)
2. `GUIDE-PRE-DEPLOIEMENT.md` (avant déploiement)
3. `README.md` (vue d'ensemble)

---

<div align="center">

**Documentation mise à jour le 10 novembre 2025**

**Version 1.0.0 - Phase 1 Complete**

🔐 **Confidentiel** - Pour usage interne uniquement

</div>
