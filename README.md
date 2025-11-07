# 🎉 Invitation Manager

Une webapp moderne et élégante de gestion d'invitations pour vos événements professionnels.

## ✨ Fonctionnalités

### Pour les organisateurs
- 📅 **Création d'événements** : Paramétrez tous les détails de votre événement
- 👥 **Gestion des invités** : Import CSV, tags, statuts en temps réel
- 📧 **Emails automatisés** : Templates personnalisables, envoi groupé, suivi des ouvertures
- 📊 **Dashboard analytique** : Taux de réponse, statistiques, exports
- 🎫 **QR Codes** : Génération automatique pour le check-in

### Pour les invités
- 🔐 **Authentification sécurisée** : Lien personnel unique (magic link)
- 📝 **Formulaire RSVP complet** : Participation, accompagnants, repas, allergies, accessibilité
- ✉️ **Confirmations** : Email avec QR code d'accès
- ✏️ **Modification** : Possibilité de modifier sa réponse jusqu'à la deadline

## 🛠️ Stack technique

- **Frontend** : Next.js 15 (App Router), React 19, TypeScript
- **Styling** : Tailwind CSS, shadcn/ui, Framer Motion
- **Backend** : Next.js API Routes
- **Base de données** : Prisma + PostgreSQL
- **Authentification** : JWT + Magic Links
- **Emails** : Nodemailer (SMTP)
- **QR Codes** : qrcode

## 📋 Prérequis

- Node.js 18+ et npm
- PostgreSQL 14+
- (Optionnel) Docker pour PostgreSQL

## 🚀 Installation

### 1. Cloner le repository

```bash
git clone <your-repo-url>
cd invitation
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer la base de données

#### Option A : PostgreSQL local

Assurez-vous que PostgreSQL est installé et en cours d'exécution.

```bash
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

### 4. Configurer les variables d'environnement

Copiez le fichier `.env.example` vers `.env` et configurez les variables :

```bash
cp .env.example .env
```

Éditez `.env` avec vos paramètres :

```env
# Base de données
DATABASE_URL="postgresql://user:password@localhost:5432/invitation_manager?schema=public"

# URL de l'application
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Secret JWT (générez-en un unique pour la production)
JWT_SECRET="votre-secret-jwt-super-securise"

# Configuration email
EMAIL_FROM="noreply@invitation-manager.com"
EMAIL_FROM_NAME="Invitation Manager"

# SMTP (pour les emails)
SMTP_HOST="smtp.ethereal.email"
SMTP_PORT="587"
SMTP_USER=""
SMTP_PASSWORD=""
SMTP_SECURE="false"
```

#### Configuration des emails

**Pour le développement** : Utilisez [Ethereal Email](https://ethereal.email/) (emails de test)

1. Visitez https://ethereal.email/
2. Créez un compte de test gratuit
3. Copiez les identifiants SMTP dans votre `.env`

**Pour la production** : Utilisez un vrai fournisseur d'emails

- **Resend** (recommandé) : Ajoutez `RESEND_API_KEY="re_xxx"`
- **SendGrid** : Ajoutez `SENDGRID_API_KEY="SG.xxx"`
- **Gmail SMTP** : Configurez SMTP avec un mot de passe d'application

### 5. Initialiser la base de données

```bash
# Générer le client Prisma
npm run db:generate

# Appliquer le schéma à la base de données
npm run db:push

# (Optionnel) Charger les données de démo
npm run db:seed
```

Le seed crée :
- 1 compte admin (`admin@invitation-manager.com`)
- 1 événement de démo ("Soirée Partenaires 2026")
- 10 invités de test avec leurs tokens
- 1 RSVP exemple

**Note** : Les tokens d'invitation sont affichés dans la console après le seed. Copiez-les pour tester !

### 6. Lancer l'application

```bash
npm run dev
```

L'application est accessible sur http://localhost:3000

## 📱 Utilisation

### Accès aux pages

- **Page d'accueil** : http://localhost:3000
- **Admin Dashboard** : http://localhost:3000/admin
- **Invitation invité** : http://localhost:3000/guest/[TOKEN]

### Tester avec les données de démo

Après avoir exécuté `npm run db:seed`, vous pouvez :

1. **Accéder au dashboard admin**
   - Allez sur http://localhost:3000/admin
   - Vous verrez l'événement "Soirée Partenaires 2026"

2. **Tester le parcours invité**
   - Prenez un token affiché dans la console lors du seed
   - Ouvrez http://localhost:3000/guest/[TOKEN]
   - Remplissez le formulaire RSVP

3. **Voir les réponses**
   - Retournez sur le dashboard admin
   - Cliquez sur "Gérer l'événement"
   - Consultez la liste des invités et leurs réponses

## 🗄️ Structure du projet

```
invitation/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── guest/        # Authentification invité
│   │   ├── rsvp/         # Gestion des réponses
│   │   └── admin/        # API admin
│   ├── admin/            # Pages admin
│   ├── guest/            # Pages invité (RSVP)
│   ├── layout.tsx        # Layout principal
│   ├── page.tsx          # Page d'accueil
│   └── globals.css       # Styles globaux
├── components/
│   └── ui/               # Composants shadcn/ui
├── lib/
│   ├── auth.ts           # Authentification & tokens
│   ├── email.ts          # Envoi d'emails & templates
│   ├── prisma.ts         # Client Prisma
│   ├── qrcode.ts         # Génération QR codes
│   └── utils.ts          # Utilitaires
├── prisma/
│   ├── schema.prisma     # Schéma de base de données
│   └── seed.ts           # Données de démo
├── .env.example          # Variables d'environnement exemple
├── package.json
└── README.md
```

## 🎨 Personnalisation

### Thème et couleurs

Éditez `app/globals.css` pour personnaliser les couleurs :

```css
:root {
  --primary: 262.1 83.3% 57.8%; /* Violet par défaut */
  /* ... autres variables ... */
}
```

### Templates d'emails

Les templates sont dans `lib/email.ts`. Personnalisez :
- `getInvitationEmailTemplate()` : Email d'invitation
- `getConfirmationEmailTemplate()` : Email de confirmation

## 🔧 Commandes utiles

```bash
# Développement
npm run dev                 # Lancer le serveur de dev

# Base de données
npm run db:generate         # Générer le client Prisma
npm run db:push            # Appliquer le schéma
npm run db:studio          # Ouvrir Prisma Studio (GUI)
npm run db:seed            # Charger les données de démo

# Production
npm run build              # Build de production
npm start                  # Démarrer en production

# Autres
npm run lint               # Linter le code
```

## 📊 Prisma Studio

Pour visualiser et gérer vos données avec une interface graphique :

```bash
npm run db:studio
```

Ouvre http://localhost:5555 avec une interface pour explorer :
- Les événements
- Les invités
- Les RSVP
- Les logs d'emails
- etc.

## 🚢 Déploiement

### Vercel (recommandé)

1. Push votre code sur GitHub
2. Connectez-vous à [Vercel](https://vercel.com)
3. Importez votre repository
4. Configurez les variables d'environnement
5. Déployez !

**Important** : Utilisez une base de données PostgreSQL hébergée (Neon, Supabase, PlanetScale, etc.)

### Variables d'environnement en production

N'oubliez pas de configurer :
- `DATABASE_URL` : URL de votre base de données
- `NEXT_PUBLIC_APP_URL` : URL publique de votre app
- `JWT_SECRET` : Secret unique et sécurisé
- Configuration email (Resend, SendGrid, etc.)

## 🔐 Sécurité

- ✅ Tokens JWT signés et expirables
- ✅ Tokens d'invitation hashés en base
- ✅ Rate limiting (à implémenter en production)
- ✅ Validation des données (Zod)
- ✅ HTTPS obligatoire en production
- ✅ Variables d'environnement sécurisées

## 🐛 Dépannage

### Erreur de connexion à la base de données

```bash
# Vérifiez que PostgreSQL est démarré
pg_isready

# Vérifiez votre DATABASE_URL dans .env
# Format : postgresql://USER:PASSWORD@HOST:PORT/DATABASE
```

### Erreur Prisma

```bash
# Régénérez le client Prisma
npm run db:generate

# Réinitialisez la base de données
npm run db:push
```

### Emails non envoyés

- Vérifiez vos identifiants SMTP dans `.env`
- Pour le dev, utilisez Ethereal Email
- Consultez la console pour les erreurs
- Vérifiez les logs dans la table `EmailLog`

## 🎯 Roadmap / TODO

- [ ] Ajout du support i18n (FR/EN) avec next-intl
- [ ] Import CSV des invités
- [ ] Export Excel des réponses
- [ ] Personnalisation des templates emails (UI)
- [ ] Création d'événements via UI admin
- [ ] Rappels automatiques avant deadline
- [ ] Authentification admin complète
- [ ] Rate limiting des API
- [ ] Tests unitaires et E2E
- [ ] Mode sombre

## 📄 Licence

MIT

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

---

Fait avec ❤️ pour simplifier la gestion d'événements
