# 🎉 Jeu de Démonstration Complet

Ce script génère un jeu de démonstration complet pour l'application Weevup Invitation Manager.

## 📋 Contenu de la Démonstration

Le script `seed-demo.ts` crée :

### 👤 Utilisateur Admin
- **Email**: admin@weevup.com
- **Rôle**: ADMIN

### 🎉 Événement: Tech Summit 2025
Un événement professionnel complet avec :
- **Date**: 15-16 Mai 2025
- **Lieu**: Palais des Congrès de Paris
- **Type**: Conférence technologique
- **Capacité**: 50 invités avec diverses réponses RSVP

#### Caractéristiques de l'événement :
- ✅ Programme détaillé sur 2 jours
- ✅ Page showcase complète avec :
  - Galerie d'images
  - Liste des speakers (4 intervenants)
  - Sponsors (4 sponsors différents niveaux)
  - FAQ (6 questions/réponses)
  - Timeline détaillée
  - Vidéo embed
- ✅ Configuration RSVP complète :
  - Deadline de réponse
  - Accompagnateurs autorisés (max 2)
  - Choix de repas (6 options)
  - Besoins spéciaux (accessibilité, transport, logement)

### 👥 50 Invités Réalistes
Distribution des statuts :
- **RESPONDED** (~70%): Invités ayant confirmé leur présence ou décliné
- **INVITED** (~20%): Invités n'ayant pas encore répondu
- **BOUNCED** (~10%): Emails en échec

Tags variés :
- VIP (10%)
- Speaker (10%)
- Sponsor (10%)
- Press (2%)
- Participant (68%)

### 🎟️ RSVPs
- **Confirmations positives** (~60%): Avec choix de repas, accompagnateurs, etc.
- **Déclins** (~10%): Réponses négatives
- **En attente** (~30%): Pas encore de réponse

Choix de repas variés :
- Standard
- Végétarien
- Vegan
- Sans gluten
- Halal
- Kosher

### ✅ Check-ins
~40% des invités confirmés ont un check-in simulé avec :
- QR Code ID
- Desk d'enregistrement (A, B, ou C)
- Timestamp réaliste (avant l'événement)
- Notes occasionnelles

### 📧 Email Templates (4 modèles)
1. **Save the Date** - Annonce initiale
   - 50 utilisations
   - Design branded Weevup

2. **Invitation Officielle** - Invitation complète avec RSVP
   - 150 utilisations
   - Toutes les informations de l'événement

3. **Rappel** - Pour les non-répondants
   - 75 utilisations
   - Urgence et deadline

4. **Confirmation** - Confirmation de participation
   - 120 utilisations
   - QR Code et détails pratiques

### 📨 Email Logs (~200+ emails)
Pour chaque invité, plusieurs emails avec statuts variés :
- **SENT**: Email envoyé avec succès
- **DELIVERED**: Email livré
- **OPENED**: Email ouvert (~80%)
- **CLICKED**: Liens cliqués (~40%)
- **BOUNCED**: Échecs de livraison (~5%)
- **FAILED**: Erreurs d'envoi (~2%)

Types d'emails :
- Save the Date (envoyé à tous)
- Invitation (envoyée à tous)
- Reminder (seulement aux non-répondants)
- Confirmation (seulement aux confirmés)

### 📊 Email Trackings (~100 entrées)
Tracking détaillé avec :
- Timestamps d'envoi, ouverture, clic
- Statuts cohérents avec les EmailLogs
- Distribution réaliste des interactions

### 🔌 Intégration Email
- **Provider**: SendGrid
- **Status**: Active et Primary
- **Configuration**:
  - From Email: noreply@weevup.com
  - From Name: Weevup Events
  - Reply To: contact@weevup.com
  - Tracking: Ouvertures et clics activés
  - Webhooks configurés
  - Limites: 10,000/jour, 300,000/mois

## 🚀 Utilisation

### Prérequis
- Node.js installé
- PostgreSQL en cours d'exécution
- Variable `DATABASE_URL` configurée dans `.env`

### Exécution

```bash
# Option 1: Via npm script (recommandé)
npm run db:seed:demo

# Option 2: Directement avec npx
npx tsx prisma/seed-demo.ts

# Option 3: Compilation puis exécution
npx tsc prisma/seed-demo.ts
node prisma/seed-demo.js
```

### ⚠️ Attention
**Ce script supprime TOUTES les données existantes avant de créer la démo !**

Il nettoie dans l'ordre :
1. EmailTracking
2. EmailLog
3. Checkin
4. RSVP
5. Guest
6. Event
7. User
8. EmailTemplate
9. EmailIntegration

## 📊 Statistiques Générées

Après exécution, vous obtiendrez :

```
👥 INVITÉS:
   Total: 50
   ✅ Confirmés: ~30
   ❌ Déclinés: ~5
   ⏳ En attente: ~15

📨 EMAILS:
   Total envoyés: ~200+
   OPENED: ~160
   DELIVERED: ~30
   CLICKED: ~80
   BOUNCED: ~10
   FAILED: ~5

🎟️ CHECK-INS:
   Total: ~12-15

📧 TEMPLATES:
   Save the Date: 50 utilisations
   Invitation: 150 utilisations
   Reminder: 75 utilisations
   Confirmation: 120 utilisations

🔌 INTÉGRATION:
   Provider: SENDGRID
   Status: Active
   Tracking: Opens ✓, Clicks ✓
```

## 🔗 Accès après génération

Une fois le seed exécuté :

- **Page showcase**: `http://localhost:3000/events/tech-summit-2025`
- **Admin dashboard**: `http://localhost:3000/admin`
- **Email admin**: `admin@weevup.com`

## 🎯 Cas d'usage

Ce jeu de données de démonstration est parfait pour :

✅ **Démonstrations clients** - Montrer toutes les fonctionnalités de la plateforme
✅ **Tests d'interface** - Tester l'UI avec des données réalistes
✅ **Développement** - Développer de nouvelles fonctionnalités avec des données cohérentes
✅ **Formation** - Former les utilisateurs sur une base réaliste
✅ **Screenshots** - Prendre des captures d'écran pour la documentation
✅ **Stress testing** - Tester les performances avec un volume significatif

## 🔄 Réinitialisation

Pour réinitialiser et regénérer la démo :

```bash
npm run db:seed:demo
```

Le script gère automatiquement le nettoyage avant de créer les nouvelles données.

## 📝 Personnalisation

Pour modifier les données de démonstration, éditez le fichier `prisma/seed-demo.ts` :

- **Ligne 14-99**: Tableau `demoGuests` - Ajoutez/modifiez les invités
- **Ligne 150**: Configuration de l'événement - Changez les détails
- **Ligne 200+**: Templates d'email - Personnalisez les templates
- **Ligne 800+**: Logique de génération - Ajustez les probabilités et distributions

## 🐛 Dépannage

### Erreur: `@prisma/client did not initialize`
```bash
npx prisma generate
npm run db:seed:demo
```

### Erreur de connexion base de données
Vérifiez votre `DATABASE_URL` dans `.env`:
```
DATABASE_URL="postgresql://user:password@localhost:5432/invitation_db"
```

### Binaires Prisma manquants (environnements offline)
```bash
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npx prisma generate
npm run db:seed:demo
```

## 📚 Fichiers associés

- `prisma/seed-demo.ts` - Script de génération
- `prisma/schema.prisma` - Schéma de base de données
- `package.json` - Configuration npm avec script `db:seed:demo`

---

**Créé avec ❤️ pour Weevup Invitation Manager**
