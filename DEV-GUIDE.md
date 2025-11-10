# Guide du Développeur - Invitation Manager

Guide complet pour développer et maintenir l'application.

## 📋 Table des Matières

1. [Setup Initial](#setup-initial)
2. [Architecture](#architecture)
3. [Authentification NextAuth](#authentification-nextauth)
4. [Base de Données](#base-de-données)
5. [Développement Local](#développement-local)
6. [Tests & Debug](#tests--debug)
7. [Déploiement](#déploiement)
8. [Bonnes Pratiques](#bonnes-pratiques)

---

## Setup Initial

### Prérequis

- Node.js 18+
- PostgreSQL 14+ (ou compte Neon)
- Git
- Un éditeur (VS Code recommandé)

### Installation Rapide

```bash
# Cloner
git clone <repo>
cd invitation

# Installer
npm install

# Configuration
cp .env.example .env.local
# Éditer .env.local avec vos valeurs

# DB Setup
npx prisma db push
npx prisma generate

# Créer l'admin (voir section DB)

# Lancer
npm run dev
```

---

## Architecture

### Structure des Dossiers

```
invitation/
├── app/                          # Next.js 15 App Router
│   ├── admin/                    # Pages admin (protégées)
│   │   ├── layout.tsx           # Layout avec auth check
│   │   ├── page.tsx             # Dashboard
│   │   ├── events/              # Gestion événements
│   │   └── guests/              # Gestion invités
│   ├── auth/
│   │   └── admin/
│   │       └── page.tsx         # Page de login
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts     # NextAuth handlers
│   │   ├── admin/               # APIs protégées
│   │   └── guest/               # APIs publiques
│   └── layout.tsx               # Root layout
│
├── auth.ts                       # Config NextAuth principale
├── auth.config.ts               # Config NextAuth (Edge)
├── middleware.ts                # Protection routes
│
├── components/
│   ├── ui/                      # shadcn/ui
│   ├── admin/                   # Composants admin
│   └── guest/                   # Composants invités
│
├── lib/
│   ├── prisma.ts                # Client Prisma
│   └── ...                      # Utilitaires
│
└── prisma/
    ├── schema.prisma            # Schéma DB
    └── migrations/              # Migrations
```

### Stack Technique Actuelle

- **Framework**: Next.js 15 (App Router)
- **Authentification**: NextAuth v5
- **Base de données**: PostgreSQL (Prisma ORM)
- **UI**: React + Tailwind + shadcn/ui
- **Déploiement**: Vercel
- **Runtime**: Node.js (pour bcrypt)

---

## Authentification NextAuth

### Architecture NextAuth v5

#### Fichiers Principaux

**1. `/auth.ts`** - Configuration principale
```typescript
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { authConfig } from './auth.config'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

// Fonction de récupération utilisateur
async function getUser(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      password: true,
      role: true,
      isActive: true,
      loginAttempts: true,
      lockedUntil: true,
    },
  })
  return user
}

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        // Validation + bcrypt.compare
        // Gestion des tentatives + verrouillage
        // Return user object ou null
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Ajouter role au token
    },
    async session({ session, token }) {
      // Ajouter id + role à la session
    },
  },
})
```

**2. `/auth.config.ts`** - Config Edge-compatible
```typescript
import type { NextAuthConfig } from 'next-auth'

export const authConfig = {
  pages: {
    signIn: '/auth/admin',  // ⚠️ Chemin de login
  },
  callbacks: {
    authorized() {
      return true  // Géré par middleware
    },
  },
  providers: [],
} satisfies NextAuthConfig
```

**3. `/app/api/auth/[...nextauth]/route.ts`** - Route handlers
```typescript
import { handlers } from '@/auth'

// ⚠️ IMPORTANT: bcrypt nécessite Node.js runtime
export const runtime = 'nodejs'

export const { GET, POST } = handlers
```

**4. `/middleware.ts`** - Protection des routes
```typescript
export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Routes publiques
  const publicPaths = [
    '/auth/admin',
    '/api/auth',
    // ...
  ]

  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // Vérifier session
  const sessionCookieName = process.env.NODE_ENV === 'production'
    ? '__Secure-authjs.session-token'
    : 'authjs.session-token'

  const hasSession = request.cookies.has(sessionCookieName)

  // Protéger /admin et /api/admin
  if (!hasSession) {
    // Redirection ou 401
  }

  return NextResponse.next()
}
```

### Utilisation dans les Composants

#### Composants Serveur
```typescript
import { auth } from '@/auth'

export default async function AdminPage() {
  const session = await auth()

  if (!session) {
    redirect('/auth/admin')
  }

  return <div>Bonjour {session.user.email}</div>
}
```

#### Composants Client
```typescript
'use client'
import { signIn, signOut } from 'next-auth/react'
import { useSession } from 'next-auth/react'

export function LoginButton() {
  const { data: session } = useSession()

  if (session) {
    return (
      <button onClick={() => signOut()}>
        Se déconnecter
      </button>
    )
  }

  return (
    <button onClick={() => signIn('credentials')}>
      Se connecter
    </button>
  )
}
```

### Points d'Attention NextAuth

#### ⚠️ Runtime: Node.js Requis

**Pourquoi**: bcrypt n'est pas compatible avec Edge Runtime

**Solution**:
```typescript
// Dans /app/api/auth/[...nextauth]/route.ts
export const runtime = 'nodejs'  // ← OBLIGATOIRE
```

#### ⚠️ Variables d'Environnement

**Requises:**
```env
# Production
AUTH_SECRET="secret-32-chars-minimum"
NEXTAUTH_SECRET="secret-32-chars-minimum"  # Compatibilité
NEXTAUTH_URL="https://votre-app.vercel.app"  # ⚠️ AVEC https://
NEXT_PUBLIC_APP_URL="https://votre-app.vercel.app"

# Développement
AUTH_SECRET="dev-secret"
NEXTAUTH_SECRET="dev-secret"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

**Générer AUTH_SECRET:**
```bash
openssl rand -base64 32
```

#### ⚠️ Cookies de Session

**Production**: `__Secure-authjs.session-token`
**Développement**: `authjs.session-token`

Le middleware doit gérer les deux.

### Gestion des Erreurs

#### CredentialsSignin

**Causes:**
- Mot de passe incorrect
- Hash bcrypt invalide
- Compte verrouillé
- Utilisateur inexistant

**Debug:**
```typescript
// Dans auth.ts authorize()
console.log('User found:', !!user)
console.log('Password match:', passwordsMatch)
console.log('Is active:', user.isActive)
console.log('Is locked:', user.lockedUntil && new Date(user.lockedUntil) > new Date())
```

#### Invalid URL

**Cause**: `NEXTAUTH_URL` sans protocole

**❌ Incorrect**: `invitation-app.vercel.app`
**✅ Correct**: `https://invitation-app.vercel.app`

---

## Base de Données

### Schéma Principal

#### Model User (Admins)

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?  // Optionnel
  password  String   // Hash bcrypt
  role      UserRole @default(ADMIN)

  // Sécurité
  isActive      Boolean   @default(true)
  lastLoginAt   DateTime?
  loginAttempts Int       @default(0)
  lockedUntil   DateTime?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  adminEvents Event[] @relation("AdminEvents")
}
```

#### Model Event

```prisma
model Event {
  id          String    @id @default(cuid())
  name        String
  slug        String    @unique
  startsAt    DateTime
  endsAt      DateTime?
  // ... autres champs

  adminId String
  admin   User   @relation("AdminEvents", fields: [adminId], references: [id])

  guests         Guest[]
  rsvps          RSVP[]
  // ...
}
```

### Commandes Prisma

#### Développement

```bash
# Synchroniser le schéma avec la DB (sans migration)
npx prisma db push

# Générer le client Prisma
npx prisma generate

# Ouvrir Prisma Studio (GUI)
npx prisma studio

# Réinitialiser la DB (⚠️ Destructif)
npx prisma migrate reset
```

#### Production

```bash
# Créer une migration
npx prisma migrate dev --name nom_migration

# Appliquer les migrations en prod
npx prisma migrate deploy
```

### Créer le Compte Admin

#### Méthode 1: Script SQL (Recommandé)

Exécutez dans le SQL Editor de Neon:

```sql
-- Générer un nouveau compte admin
INSERT INTO "User" ("id", "email", "password", "role", "isActive", "loginAttempts", "createdAt", "updatedAt")
VALUES (
    'admin-' || gen_random_uuid()::text,
    'contact@weevup.com',
    '$2a$10$ErMGbXQmM2InouKGluEnY.6pgjh59BvPMWRxvo6HCVACh11PwAo2e',
    'ADMIN',
    true,
    0,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT ("email")
DO UPDATE SET
  password = EXCLUDED.password,
  "isActive" = true,
  "loginAttempts" = 0,
  "lockedUntil" = NULL;
```

**Credentials:** `contact@weevup.com` / `admin123`

#### Méthode 2: API check-and-fix

```bash
# En local
curl http://localhost:3000/api/admin/check-and-fix

# En production
curl https://votre-app.vercel.app/api/admin/check-and-fix
```

Cette API:
- Crée le compte admin s'il n'existe pas
- Déverrouille les comptes bloqués
- Réinitialise les tentatives de connexion

#### Méthode 3: Générer un nouveau hash

```bash
# Générer un hash pour un nouveau mot de passe
node -e "console.log(require('bcryptjs').hashSync('votre_mot_de_passe', 10))"
```

Puis insérez-le dans la DB avec le SQL ci-dessus.

---

## Développement Local

### Workflow Quotidien

```bash
# 1. Démarrer
npm run dev

# 2. Tester les changements
# http://localhost:3000

# 3. Vérifier le code
npm run lint

# 4. Build local (facultatif)
npm run build && npm start
```

### Hot Reload

Next.js 15 hot reload automatiquement:
- ✅ Composants React
- ✅ Pages
- ✅ API Routes
- ❌ middleware.ts (redémarrage requis)
- ❌ Variables d'environnement (redémarrage requis)

### Variables d'Environnement

#### Fichiers

- `.env.local` - Développement local (git-ignored)
- `.env.example` - Template (committé)

#### Ordre de priorité

1. `.env.local`
2. `.env.development` (si existe)
3. `.env`

#### Accès dans le Code

```typescript
// Serveur uniquement
process.env.DATABASE_URL

// Client (préfixe NEXT_PUBLIC_)
process.env.NEXT_PUBLIC_APP_URL
```

---

## Tests & Debug

### APIs de Diagnostic

#### 1. Check Database & Admin

```bash
GET /api/admin/check-and-fix
```

**Réponse:**
```json
{
  "success": true,
  "fixes": [
    "✅ Connexion à la base de données OK",
    "✅ Compte admin existe: contact@weevup.com",
    "📊 Statistiques: 1 utilisateur(s), 2 événement(s)"
  ],
  "credentials": {
    "email": "contact@weevup.com",
    "password": "admin123"
  }
}
```

#### 2. Check Environment Variables

```bash
GET /api/check-env
```

**Affiche:**
- Quelles variables sont définies
- Quelles URLs ont le bon format
- Recommandations de configuration

#### 3. Test Database Connection

```bash
GET /api/test-db
```

**Teste:**
- Connexion Prisma
- Existence du compte admin
- Requêtes basiques

#### 4. Check NextAuth

```bash
GET /api/auth/providers
```

**Devrait retourner:**
```json
{
  "credentials": {
    "id": "credentials",
    "name": "Credentials",
    "type": "credentials"
  }
}
```

#### 5. Test Authentication

```bash
POST /api/test-auth
Content-Type: application/json

{
  "email": "contact@weevup.com",
  "password": "admin123"
}
```

**Retourne:**
- `passwordMatch`: true/false
- Détails du user
- État du verrouillage

### Logs Vercel

#### Accéder aux logs

1. Vercel Dashboard
2. Deployments
3. Cliquez sur le déploiement
4. Onglet **"Runtime Logs"** ou **"Functions"**

#### Filtrer les logs

- Logs en temps réel pendant que vous testez
- Recherchez par chemin API ou erreur
- Copiez le stack trace complet pour debug

### Debug NextAuth

```typescript
// Dans auth.ts
export const { auth, signIn, signOut, handlers } = NextAuth({
  debug: process.env.NODE_ENV === 'development',  // Active les logs détaillés
  // ...
})
```

**Active les logs:**
- Session callbacks
- JWT creation
- Erreurs d'autorisation

---

## Déploiement

### Configuration Vercel

#### 1. Variables d'Environnement

**Settings → Environment Variables**

**Requises:**
```env
DATABASE_URL=postgresql://...
AUTH_SECRET=...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://votre-app.vercel.app
NEXT_PUBLIC_APP_URL=https://votre-app.vercel.app
```

**⚠️ Checklist:**
- [ ] NEXTAUTH_URL commence par `https://`
- [ ] NEXT_PUBLIC_APP_URL commence par `https://`
- [ ] AUTH_SECRET a 32+ caractères
- [ ] DATABASE_URL contient `?sslmode=require`

#### 2. Build Command

**Le fichier `vercel.json` définit:**
```json
{
  "buildCommand": "npx prisma db push --accept-data-loss && prisma generate && next build"
}
```

**Ce qui se passe:**
1. `prisma db push` - Synchronise le schéma avec la DB
2. `prisma generate` - Génère le client Prisma
3. `next build` - Build Next.js

**⚠️ Important:** Ne modifiez PAS manuellement la Build Command dans Vercel Settings (utilise déjà vercel.json)

#### 3. Déploiement

```bash
# Automatique sur git push
git push origin main

# OU via CLI Vercel
vercel --prod
```

### Workflow de Déploiement

1. **Développez localement**
   ```bash
   git checkout -b feature/ma-feature
   # Développement...
   npm run lint
   npm run build  # Test local
   ```

2. **Commit & Push**
   ```bash
   git add .
   git commit -m "feat: description"
   git push origin feature/ma-feature
   ```

3. **Preview Deployment**
   - Vercel crée automatiquement un preview
   - Testez sur l'URL de preview

4. **Merge vers Main**
   ```bash
   git checkout main
   git merge feature/ma-feature
   git push origin main
   ```

5. **Production Deployment**
   - Automatique après push sur main
   - Testez les 3 URLs de diagnostic

### Post-Déploiement

**Checklist obligatoire:**

```bash
# 1. DB & Admin OK?
curl https://votre-app.vercel.app/api/admin/check-and-fix

# 2. NextAuth OK?
curl https://votre-app.vercel.app/api/auth/providers

# 3. Login OK?
# Testez manuellement: https://votre-app.vercel.app/auth/admin
```

---

## Bonnes Pratiques

### Code

#### TypeScript

```typescript
// ✅ Bon: Types explicites
interface LoginCredentials {
  email: string
  password: string
}

async function login(credentials: LoginCredentials): Promise<User | null> {
  // ...
}

// ❌ Mauvais: any
async function login(credentials: any): Promise<any> {
  // ...
}
```

#### Composants

```typescript
// ✅ Bon: Props typées, JSDoc
interface ButtonProps {
  /** Texte du bouton */
  label: string
  /** Fonction appelée au clic */
  onClick: () => void
  /** Style du bouton */
  variant?: 'primary' | 'secondary'
}

export function Button({ label, onClick, variant = 'primary' }: ButtonProps) {
  // ...
}
```

#### API Routes

```typescript
// ✅ Bon: Gestion d'erreurs + types
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validation
    if (!body.email) {
      return NextResponse.json(
        { error: 'Email requis' },
        { status: 400 }
      )
    }

    // Logique...
    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
```

### Base de Données

#### Migrations

```bash
# ✅ Créer une migration (dev)
npx prisma migrate dev --name add_user_avatar

# ✅ Appliquer en prod
npx prisma migrate deploy

# ❌ Ne PAS utiliser db push en prod
# (pas de rollback possible)
```

#### Requêtes

```typescript
// ✅ Bon: Select explicite
const user = await prisma.user.findUnique({
  where: { email },
  select: {
    id: true,
    email: true,
    role: true,
  }
})

// ❌ Mauvais: Select * (tous les champs)
const user = await prisma.user.findUnique({
  where: { email }
})
```

### Sécurité

#### Secrets

```typescript
// ✅ Bon: Vérifier au démarrage
if (!process.env.AUTH_SECRET) {
  throw new Error('AUTH_SECRET must be defined')
}

// ✅ Bon: Ne jamais logger les secrets
console.log('User email:', user.email)  // OK
console.log('User password:', user.password)  // ❌ JAMAIS

// ✅ Bon: Hasher les mots de passe
const hashedPassword = await bcrypt.hash(password, 10)

// ❌ Mauvais: Stocker en clair
user.password = password  // JAMAIS
```

#### Validation

```typescript
// ✅ Bon: Valider les inputs
import { z } from 'zod'

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
})

const result = LoginSchema.safeParse(body)
if (!result.success) {
  return NextResponse.json(
    { error: result.error },
    { status: 400 }
  )
}
```

### Git

#### Commits

```bash
# Format: type(scope): description

# ✅ Bon
feat(auth): add password reset functionality
fix(admin): correct event listing pagination
docs(readme): update deployment instructions

# ❌ Mauvais
fix bug
update code
WIP
```

**Types:**
- `feat`: Nouvelle fonctionnalité
- `fix`: Correction de bug
- `docs`: Documentation
- `style`: Formatage
- `refactor`: Refactoring
- `test`: Tests
- `chore`: Maintenance

#### Branches

```bash
# Format: type/description-courte

# Exemples
feature/email-templates
fix/login-redirect-loop
docs/setup-guide
refactor/auth-logic
```

---

## Ressources

### Documentation Officielle

- **Next.js 15**: https://nextjs.org/docs
- **NextAuth v5**: https://authjs.dev
- **Prisma**: https://www.prisma.io/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **shadcn/ui**: https://ui.shadcn.com

### Documentation Projet

- [README.md](./README.md) - Vue d'ensemble
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Dépannage
- [VERCEL-ENV-CHECKLIST.md](./VERCEL-ENV-CHECKLIST.md) - Checklist Vercel

### Outils Utiles

- **Prisma Studio**: `npx prisma studio` - GUI pour la DB
- **Vercel CLI**: `npm i -g vercel` - Déploiement CLI
- **VS Code Extensions**:
  - Prisma (Prisma.prisma)
  - Tailwind CSS IntelliSense
  - ESLint

---

**Dernière mise à jour:** Novembre 2024
**Version:** 1.0.0
