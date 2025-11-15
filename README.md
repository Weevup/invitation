# 🎉 Invitation Manager

Une webapp moderne et élégante de gestion d'invitations pour vos événements professionnels.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Weevup/invitation)

> 🚀 **Déploiement rapide** : [Guide Vercel (5 min)](DEPLOIEMENT-VERCEL.md) | ⚠️ **Pré-déploiement** : [Checklist Vercel](GUIDE-PRE-DEPLOIEMENT.md)

---

## 🎯 Démarrage Rapide

**Envie d'essayer en 5 minutes ?** → [Guide de Démarrage Rapide](GUIDE-DEMARRAGE-RAPIDE.md)

**Prêt à déployer ?** → [Checklist Pré-Déploiement](GUIDE-PRE-DEPLOIEMENT.md)

---

## ✨ Fonctionnalités

### Pour les organisateurs 🎯

- 📅 **Création d'événements** : Configurez tous les détails (date, lieu, dress code, etc.)
- 👥 **Gestion des invités** : Import CSV, ajout manuel, tags, filtres, statuts en temps réel
- 📧 **Emails automatisés** :
  - 3 templates professionnels (invitation, confirmation, reminder)
  - Envoi groupé avec rate limiting
  - Tracking (envoi, ouverture, clic)
  - Multi-provider (Resend, SendGrid, SMTP)
- 📊 **Dashboard analytique** :
  - Taux de réponse en temps réel
  - Statistiques par événement
  - Exports CSV/PDF
- 📈 **Monitoring de production** :
  - Error tracking avec Sentry (session replay)
  - Core Web Vitals (LCP, FID, CLS, etc.)
  - Logging centralisé (Pino + Client Logger)
- 🎫 **QR Codes** : Génération automatique pour le check-in
- 🎨 **Page showcase** : Page publique personnalisable pour chaque événement
- 🔒 **Sécurité** : Encryption AES-256, tokens SHA-256, rate limiting

### Pour les invités 💌

- 🔐 **Authentification sécurisée** : Lien personnel unique (magic link)
- 📝 **Formulaire RSVP complet** :
  - Participation (Oui/Non)
  - Accompagnants (+1, +2, etc.)
  - Choix de repas + allergies
  - Besoins d'accessibilité
  - Transport & hébergement
  - Consentement photos
- ✉️ **Confirmations** : Email avec récapitulatif et QR code d'accès
- ✏️ **Modification** : Possibilité de modifier sa réponse jusqu'à la deadline

---

## 🛠️ Stack Technique

### Frontend
- **Next.js 15** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS** + **shadcn/ui** (Radix UI)
- **Framer Motion** (animations)
- **Recharts** (analytics)

### Backend
- **Next.js API Routes**
- **Prisma 6.0** (ORM)
- **PostgreSQL** (Neon en production)
- **Zod** (validation)

### Email & Communication
- **Resend** (recommandé) ou **SendGrid**
- **Nodemailer** (fallback SMTP)
- Templates HTML professionnels

### Sécurité
- **JWT** (authentification)
- **Crypto** (encryption AES-256-GCM)
- **bcryptjs** (hashing)
- **Rate limiting** sur toutes les routes sensibles

### Monitoring & Performance
- **Sentry** (error tracking & session replay)
- **Web Vitals** (Core Web Vitals monitoring)
- **Pino** (structured server logging)
- **Client Logger** (centralized client-side logging)

### Testing & Quality
- **Vitest** (unit tests - 15 tests, 100% passing)
- **Playwright** (E2E tests)
- **React Testing Library** (component testing)
- **TypeScript** (strict mode)
- **ESLint** (zero warnings)

---

## 📋 Prérequis

- **Node.js 18+** et npm
- **PostgreSQL 14+** (ou compte Neon gratuit)
- (Optionnel) Docker pour PostgreSQL local

---

## 🚀 Installation Locale

### 1. Cloner le repository

```bash
git clone https://github.com/Weevup/invitation.git
cd invitation
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer les variables d'environnement

```bash
cp .env.example .env
```

**Éditez `.env` avec vos paramètres** :

```env
# Base de données PostgreSQL
DATABASE_URL="postgresql://user:password@localhost:5432/invitation_manager"

# URL publique de l'application
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Secrets (générez avec: openssl rand -hex 64)
JWT_SECRET="votre-secret-jwt-64-caracteres"
ENCRYPTION_KEY="votre-cle-32-caracteres-exact"

# Email Provider (resend recommandé)
EMAIL_PROVIDER="resend"
RESEND_API_KEY="re_your_api_key"
EMAIL_FROM="noreply@votredomaine.com"
EMAIL_FROM_NAME="Weevup Events"
```

**Générer les secrets** :
```bash
# JWT_SECRET (64 caractères)
openssl rand -hex 64

# ENCRYPTION_KEY (32 caractères)
openssl rand -hex 16
```

**Configuration Email (Resend recommandé)** :

1. Créez un compte gratuit : https://resend.com/signup
2. Ajoutez et vérifiez votre domaine
3. Créez une API Key
4. Ajoutez dans `.env` :
   ```env
   EMAIL_PROVIDER="resend"
   RESEND_API_KEY="re_votre_cle"
   EMAIL_FROM="noreply@votredomaine.com"
   ```

Voir aussi : [Configuration détaillée](GUIDE-PRE-DEPLOIEMENT.md#6-configuration-email-resend-recommandé-)

### 4. Configurer la base de données

#### Option A : PostgreSQL local

```bash
# Installer PostgreSQL (macOS)
brew install postgresql@14
brew services start postgresql@14

# Créer la base de données
createdb invitation_manager
```

#### Option B : PostgreSQL avec Docker

```bash
docker run --name invitation-postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=invitation_manager \
  -p 5432:5432 \
  -d postgres:14
```

#### Option C : Neon (Cloud gratuit)

1. Créez un compte : https://neon.tech
2. Créez un projet PostgreSQL
3. Copiez la `DATABASE_URL` dans `.env`

### 5. Initialiser la base de données

```bash
# Générer le client Prisma
npm run db:generate

# Appliquer les migrations
npm run db:migrate

# (Optionnel) Charger les données de démo
npm run db:seed
```

Le seed crée :
- 1 compte admin (`admin@invitation-manager.com`)
- 1 événement de démo ("Soirée Partenaires 2026")
- 10 invités de test avec leurs tokens
- Plusieurs RSVP exemples

**Note** : Les tokens d'invitation sont affichés dans la console. Copiez-les pour tester !

### 6. Lancer l'application

```bash
npm run dev
```

L'application est accessible sur **http://localhost:3000**

---

## 🚢 Déploiement en Production

### Déployer sur Vercel (Recommandé)

**⚠️ IMPORTANT** : Lisez le [Guide Pré-Déploiement](GUIDE-PRE-DEPLOIEMENT.md) avant de déployer !

**Étapes rapides** :

1. **Fork le repository** sur GitHub
2. **Cliquez sur** : [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Weevup/invitation)
3. **Configurez les variables d'environnement** (voir [Checklist](GUIDE-PRE-DEPLOIEMENT.md))
4. **Déployez** !

**Temps estimé** : 10-15 minutes
**Coût** : Gratuit (avec limites généreuses)

**Inclus dans Vercel** :
- ✅ Hébergement Next.js
- ✅ Base de données PostgreSQL (Neon)
- ✅ HTTPS automatique
- ✅ Déploiements automatiques
- ✅ Variables d'environnement sécurisées
- ✅ Preview deployments

**Guides complets** :
- [Guide Pré-Déploiement (LIRE EN PREMIER)](GUIDE-PRE-DEPLOIEMENT.md)
- [Guide Vercel Détaillé](DEPLOIEMENT-VERCEL.md)
- [Pourquoi pas GitHub Pages ?](POURQUOI-PAS-GITHUB-PAGES.md)

---

## 📱 Utilisation

### Accès aux pages

- **Page d'accueil** : http://localhost:3000
- **Admin Dashboard** : http://localhost:3000/admin
- **Créer un événement** : http://localhost:3000/admin/events/new
- **Page RSVP invité** : http://localhost:3000/guest/[TOKEN]
- **Showcase événement** : http://localhost:3000/event/[SLUG]

### Workflow typique

1. **Créer un événement**
   - Allez sur `/admin/events/new`
   - Remplissez les détails
   - Configurez RSVP (deadline, +1, repas)
   - Personnalisez la page showcase

2. **Importer les invités**
   - Format CSV : `firstName,lastName,email,company,tags`
   - Import manuel ou upload CSV
   - Les tokens sont générés automatiquement

3. **Envoyer les invitations**
   - Sélectionnez les invités
   - Envoyez en masse ou individuellement
   - Tracking automatique

4. **Suivre les réponses**
   - Dashboard en temps réel
   - Statistiques et analytics
   - Export CSV/PDF

5. **Check-in le jour J**
   - Scanner les QR codes
   - Validation instantanée

---

## 📚 Documentation

### Guides

- 🚀 [**Démarrage Rapide (5 min)**](GUIDE-DEMARRAGE-RAPIDE.md) - Essayez l'app en local
- ⚠️ [**Pré-Déploiement Vercel**](GUIDE-PRE-DEPLOIEMENT.md) - Checklist avant déploiement
- 🎓 [**Tutoriels Complets**](TUTORIELS.md) - Guide d'utilisation détaillé
- 🚀 [**Guide Vercel**](DEPLOIEMENT-VERCEL.md) - Déploiement pas à pas

### Rapports & Status

- ✅ [**Rapport Phase 1**](RAPPORT-PHASE-1-FINAL.md) - État complet du projet
- 🔧 [**Guide Finalisation**](GUIDE-FINALISATION.md) - Migration base de données
- ✅ [**Vérification**](VERIFICATION-REPORT.md) - Tests et validation

### Techniques

- 📊 [**Schema Prisma**](prisma/schema.prisma) - Modèle de données
- 📈 [**Monitoring & Tests**](GUIDE-MONITORING-TESTS.md) - Sentry, Web Vitals, Vitest
- 🧪 [**Tests E2E**](tests/README.md) - Tests Playwright
- 🌱 [**Seeds & Démos**](prisma/README-DEMOS.md) - Données de démo

---

## 🔧 Scripts NPM

### Développement
```bash
npm run dev              # Lancer en mode dev
npm run build            # Build de production
npm start                # Lancer le build
npm run lint             # Linter le code
```

### Base de données
```bash
npm run db:generate      # Générer le client Prisma
npm run db:migrate       # Appliquer les migrations
npm run db:push          # Pusher le schema (dev)
npm run db:studio        # Ouvrir Prisma Studio
npm run db:seed          # Seed données de base
npm run db:seed:demo     # Seed événement démo
```

### Tests
```bash
# Tests unitaires (Vitest)
npm test                 # Lancer les tests unitaires (watch mode)
npm run test:run         # Lancer une fois (CI)
npm run test:ui          # Interface visuelle
npm run test:coverage    # Rapport de coverage

# Tests E2E (Playwright)
npm run test:e2e         # Tests E2E Playwright
npm run test:e2e:ui      # Tests en mode UI
npm run test:e2e:debug   # Debug tests
```

---

## 🏗️ Structure du Projet

```
invitation/
├── app/                      # Application Next.js 15 (App Router)
│   ├── admin/               # Dashboard admin
│   │   ├── events/          # Gestion événements
│   │   ├── setup/           # Configuration initiale
│   │   └── system/          # Système & DB status
│   ├── guest/[token]/       # Page RSVP invités
│   ├── event/[slug]/        # Page showcase publique
│   └── api/                 # Routes API
│       ├── admin/           # API admin
│       └── guest/           # API invités
│
├── components/              # Composants React
│   ├── ui/                 # shadcn/ui components
│   ├── admin/              # Composants admin
│   ├── guest/              # Composants invités
│   └── showcase/           # Composants showcase
│
├── lib/                     # Utilitaires & config
│   ├── prisma.ts           # Client Prisma
│   ├── auth.ts             # Authentification JWT
│   ├── encryption.ts       # Encryption AES-256
│   ├── email-service.ts    # Service email unifié
│   ├── rate-limit.ts       # Rate limiting
│   └── env.ts              # Validation environnement
│
├── prisma/                  # Prisma ORM
│   ├── schema.prisma       # Schéma de la DB
│   ├── migrations/         # Migrations (6)
│   └── seed*.ts            # Scripts de seed
│
├── scripts/                 # Scripts utilitaires
│   ├── apply-all-migrations.sql
│   ├── check-db-status.sql
│   └── setup-database.sh
│
├── tests/                   # Tests E2E Playwright
│
└── public/                  # Assets statiques
```

---

## 🔐 Sécurité

### Mesures Implémentées

- ✅ **Encryption** : AES-256-GCM pour les secrets (API keys)
- ✅ **Hashing** : SHA-256 pour les tokens invités
- ✅ **JWT** : Authentification sécurisée avec expiration
- ✅ **Rate Limiting** : Protection contre le spam et brute force
- ✅ **SQL Injection** : Requêtes préparées avec Prisma
- ✅ **XSS Protection** : Sanitisation avec DOMPurify
- ✅ **CSRF Protection** : Validation des origines
- ✅ **Webhooks** : Signatures HMAC pour tous les providers
- ✅ **Images** : Liste blanche de domaines autorisés

### Variables Sensibles

**Ne JAMAIS committer** :
- `.env` (dans `.gitignore`)
- Clés API (Resend, SendGrid)
- DATABASE_URL avec credentials
- JWT_SECRET et ENCRYPTION_KEY

**En production** :
- Générez des secrets forts (64+ caractères)
- Utilisez les variables d'environnement Vercel
- Activez HTTPS (automatique sur Vercel)
- Configurez les webhooks avec signatures

---

## 🧪 Tests

### Tests Unitaires avec Vitest

```bash
# Mode watch (re-run automatique)
npm test

# Lancer une fois (CI)
npm run test:run

# Interface UI visuelle
npm run test:ui

# Avec coverage
npm run test:coverage
```

**Tests inclus** :
- ✅ Client Logger (11 tests)
- ✅ Scroll Reveal Component (4 tests)
- ✅ 100% passing (15/15)

**Voir le guide complet** : [GUIDE-MONITORING-TESTS.md](GUIDE-MONITORING-TESTS.md)

### Tests E2E avec Playwright

```bash
# Lancer les tests
npm run test:e2e

# Mode UI interactif
npm run test:e2e:ui

# Mode debug
npm run test:e2e:debug

# Générer un rapport
npm run test:e2e:report
```

**Tests inclus** :
- ✅ Navigation et pages
- ✅ Création d'événement
- ✅ Import CSV invités
- ✅ Formulaire RSVP
- ✅ Envoi d'emails

**Voir la documentation** : [tests/README.md](tests/README.md)

---

## 🐛 Résolution de Problèmes

### Erreur : "Prisma Client not found"

**Solution** :
```bash
npm run db:generate
```

### Erreur : "JWT_SECRET must be defined"

**Solution** : Ajoutez `JWT_SECRET` dans `.env` (voir `.env.example`)

### Erreur : "Email sending failed"

**Vérifiez** :
- `EMAIL_PROVIDER` est défini (resend ou sendgrid)
- `RESEND_API_KEY` ou `SENDGRID_API_KEY` est configuré
- `EMAIL_FROM` est vérifié chez le provider

### Erreur de build

**Vérifiez** :
```bash
# Test build local
npm run build

# Vérifier TypeScript
npx tsc --noEmit
```

### Base de données ne se connecte pas

**Vérifiez** :
- `DATABASE_URL` est correcte dans `.env`
- PostgreSQL est lancé (si local)
- Les migrations sont appliquées : `npm run db:migrate`

---

## 📈 Roadmap

### Phase 1 ✅ (Complète)
- ✅ Gestion événements & invités
- ✅ Formulaire RSVP complet
- ✅ Emails automatisés (3 templates)
- ✅ QR Codes & check-in
- ✅ Dashboard analytics
- ✅ Sécurité renforcée
- ✅ Multi-provider email

### Phase 2 🔄 (En cours)
- 🔄 Billetterie & paiements (Stripe)
- 🔄 Check-in mobile app
- 🔄 Analytics avancés
- 🔄 Multi-langue (i18n)
- 🔄 Notifications push
- 🔄 Export PDF personnalisé

### Phase 3 📅 (Prévu)
- 📅 Intégrations tierces (Eventbrite, Mailchimp)
- 📅 API publique
- 📅 Webhooks sortants
- 📅 Templates email builder
- 📅 A/B testing emails

---

## 🤝 Contribution

Les contributions sont les bienvenues !

1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'feat: Add AmazingFeature'`)
4. Pushez sur la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

---

## 📄 Licence

Ce projet est sous licence MIT - voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

## 🙏 Remerciements

- [Next.js](https://nextjs.org/) - Framework React
- [Prisma](https://www.prisma.io/) - ORM TypeScript
- [shadcn/ui](https://ui.shadcn.com/) - Composants UI
- [Radix UI](https://www.radix-ui.com/) - Primitives accessibles
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Resend](https://resend.com/) - Email API
- [Vercel](https://vercel.com/) - Hébergement
- [Neon](https://neon.tech/) - PostgreSQL serverless

---

## 📞 Support & Contact

- **Documentation** : Voir les guides dans ce repository
- **Issues** : [GitHub Issues](https://github.com/Weevup/invitation/issues)
- **Email** : contact@weevup.com

---

<div align="center">

**Fait avec ❤️ par [Weevup](https://weevup.com)**

⭐ Si ce projet vous plaît, donnez-lui une étoile sur GitHub !

</div>
