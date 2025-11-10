# 🚀 Guide de Pré-Déploiement Vercel

**Date** : 10 novembre 2025
**Statut** : ⚠️ À LIRE AVANT LE PROCHAIN DÉPLOIEMENT

---

## ⚠️ IMPORTANT : Corrections Appliquées

Toutes les **erreurs critiques** identifiées lors de la revue de code ont été corrigées. Ce guide vous aide à finaliser la configuration pour un déploiement réussi.

---

## 📋 Checklist Pré-Déploiement

### 1. Variables d'Environnement Vercel ✅

**CRITIQUES** - Le déploiement échouera sans ces variables :

```bash
# Base de données
DATABASE_URL="postgresql://neondb_owner:npg_XXX@ep-XXX.aws.neon.tech/neondb?sslmode=require"

# URL publique (remplacer par votre domaine Vercel)
NEXT_PUBLIC_APP_URL="https://votre-app.vercel.app"

# Sécurité JWT (générez avec: openssl rand -hex 64)
JWT_SECRET="votre-secret-jwt-64-caracteres-minimum"

# Clé de chiffrement (DOIT faire 32 caractères)
# Générez avec: openssl rand -hex 16
ENCRYPTION_KEY="32-caracteres-exactement-ici!"

# Email Provider (resend ou sendgrid)
EMAIL_PROVIDER="resend"

# Resend API Key (https://resend.com)
RESEND_API_KEY="re_votre_api_key"

# Email expéditeur (doit être vérifié chez Resend)
EMAIL_FROM="noreply@votredomaine.com"
EMAIL_FROM_NAME="Weevup Events"
```

**Comment générer les secrets** :
```bash
# JWT_SECRET (64 caractères)
openssl rand -hex 64

# ENCRYPTION_KEY (32 caractères)
openssl rand -hex 16
```

**Ajouter dans Vercel** :
1. Allez sur votre projet Vercel
2. Settings → Environment Variables
3. Ajoutez chaque variable pour "Production", "Preview", et "Development"

---

### 2. Script de Build Vercel ✅

Le script de build a été modifié pour éviter les erreurs :

**Ancien** (❌ problématique) :
```json
"build": "prisma migrate deploy && next build"
```

**Nouveau** (✅ correct) :
```json
"build": "prisma generate && next build",
"vercel-build": "prisma generate && prisma migrate deploy && next build"
```

**Configuration Vercel (optionnelle)** :

Si vous voulez utiliser `vercel-build`, créez un fichier `vercel.json` :

```json
{
  "buildCommand": "npm run vercel-build",
  "installCommand": "npm install"
}
```

---

### 3. Corrections de Sécurité Appliquées ✅

Les vulnérabilités critiques ont été corrigées :

1. **✅ Injection SQL** - `$queryRawUnsafe` → `$queryRaw` avec paramètres sécurisés
2. **✅ JWT Secret** - Validation en production, pas de valeur par défaut faible
3. **✅ ENCRYPTION_KEY** - Documentée et requise
4. **✅ Images Remote Patterns** - Liste blanche de domaines au lieu de `**`
5. **✅ Types TypeScript** - Correction de `as any` dans lib/auth.ts

---

### 4. Configuration Next.js Images ✅

Les domaines autorisés ont été restreints pour la sécurité :

```javascript
// next.config.js
images: {
  remotePatterns: [
    { protocol: 'https', hostname: 'res.cloudinary.com' },
    { protocol: 'https', hostname: 'images.unsplash.com' },
    { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
    { protocol: 'https', hostname: '*.public.blob.vercel-storage.com' },
  ],
}
```

**Si vous utilisez d'autres domaines** :
1. Identifiez les domaines d'images utilisés
2. Ajoutez-les dans `next.config.js`
3. Ne jamais utiliser `hostname: '**'` en production

---

### 5. Migrations Prisma 📊

Les migrations seront appliquées automatiquement lors du build Vercel via `vercel-build`.

**Migrations incluses** (6 au total) :
1. `20250101_init` - Schéma initial
2. `20250107_add_showcase_fields` - Showcase
3. `20250108_add_communication_and_features` - RSVP & features
4. `20250108_add_email_templates` - Templates email
5. `20250108_add_email_integrations` - Intégrations email
6. `20251109_add_invitation_tracking_fields` - Tracking invitations

**Vérifier après déploiement** :
```sql
psql 'postgresql://...' -c "SELECT migration_name FROM _prisma_migrations ORDER BY started_at;"
```

---

### 6. Configuration Email (Resend Recommandé) 📧

**Pourquoi Resend ?**
- ✅ 100 emails/jour gratuits
- ✅ Configuration simple (juste une API key)
- ✅ Tracking intégré (ouverture, clics)
- ✅ Support excellent

**Setup Resend (5 minutes)** :

1. **Créer un compte** : https://resend.com/signup
2. **Ajouter et vérifier votre domaine** :
   - DNS → Ajouter les enregistrements DNS fournis par Resend
   - Attendez la vérification (quelques minutes)
3. **Créer une API Key** :
   - Settings → API Keys → Create API Key
   - Copiez la clé (commence par `re_`)
4. **Configurer Vercel** :
   ```bash
   RESEND_API_KEY="re_votre_cle_ici"
   EMAIL_FROM="noreply@votredomaine.com"
   EMAIL_PROVIDER="resend"
   ```

**Alternative : SendGrid**
```bash
EMAIL_PROVIDER="sendgrid"
SENDGRID_API_KEY="SG.votre_cle_ici"
EMAIL_FROM="noreply@votredomaine.com"
```

---

### 7. Base de Données Neon ✅

Votre base de données Neon est déjà configurée :
```
postgresql://neondb_owner:npg_XXX@ep-gentle-meadow-XXX.eu-west-2.aws.neon.tech/neondb?sslmode=require
```

**Rien à faire** - Les migrations s'appliqueront automatiquement.

---

## 🔧 Commandes Utiles

### Tester en local
```bash
# Installer les dépendances
npm install

# Générer le client Prisma
npm run db:generate

# Appliquer les migrations
npm run db:migrate

# Lancer en dev
npm run dev
```

### Build de test
```bash
# Tester le build (doit réussir sans erreur)
npm run build

# Vérifier les erreurs TypeScript
npx tsc --noEmit
```

### Vérifier Vercel
```bash
# Installer Vercel CLI
npm i -g vercel

# Login
vercel login

# Déployer en preview
vercel

# Déployer en production
vercel --prod
```

---

## 🐛 Résolution de Problèmes

### Erreur : "Prisma Client not found"

**Solution** :
```bash
# Dans Vercel Settings → General → Build & Development Settings
Build Command: npm run vercel-build
# ou
Build Command: npm run build && npx prisma generate
```

### Erreur : "JWT_SECRET must be defined"

**Solution** : Ajouter `JWT_SECRET` dans les variables d'environnement Vercel

### Erreur : "ENCRYPTION_KEY must be 32 characters"

**Solution** : Générer et configurer ENCRYPTION_KEY :
```bash
openssl rand -hex 16  # Génère 32 caractères
```

### Erreur : "Email sending failed"

**Solutions** :
1. Vérifier que `RESEND_API_KEY` est configuré
2. Vérifier que `EMAIL_FROM` est vérifié chez Resend
3. Vérifier que `EMAIL_PROVIDER="resend"` est set

### Erreur de build Next.js

**Vérifier** :
- Toutes les variables `NEXT_PUBLIC_*` sont configurées
- `DATABASE_URL` est accessible depuis Vercel
- Pas d'erreurs TypeScript : `npx tsc --noEmit`

---

## ✅ Checklist Finale

Avant de déployer, vérifiez :

- [ ] Toutes les variables d'environnement configurées dans Vercel
- [ ] `DATABASE_URL` pointe vers Neon
- [ ] `JWT_SECRET` généré (64+ caractères)
- [ ] `ENCRYPTION_KEY` généré (32 caractères)
- [ ] `EMAIL_PROVIDER` configuré (resend ou sendgrid)
- [ ] `RESEND_API_KEY` ou `SENDGRID_API_KEY` configuré
- [ ] `EMAIL_FROM` vérifié chez le provider
- [ ] `NEXT_PUBLIC_APP_URL` configuré avec l'URL de production
- [ ] Script de build est `npm run build` ou `npm run vercel-build`
- [ ] `npm run build` réussit en local
- [ ] Commit et push sur GitHub effectués

---

## 🎯 Après le Déploiement

### 1. Vérifier le déploiement
- Visiter l'URL Vercel
- Tester la page d'accueil
- Tester `/admin`

### 2. Créer un événement de test
- Aller sur `/admin/events/new`
- Créer un événement
- Importer des guests en CSV

### 3. Tester l'envoi d'emails
- Envoyer une invitation test
- Vérifier la réception
- Tester le lien RSVP

### 4. Monitorer les logs
- Vercel Dashboard → Logs
- Vérifier qu'il n'y a pas d'erreurs

---

## 📊 Rapport de Corrections

### Erreurs Critiques Corrigées (5)

1. ✅ **Types Prisma** - Configuration du script de build corrigée
2. ✅ **ENCRYPTION_KEY** - Documentée dans .env.example
3. ✅ **Script de build** - Modifié pour Vercel
4. ✅ **SQL Injection** - Remplacé `$queryRawUnsafe` par `$queryRaw`
5. ✅ **JWT_SECRET** - Validation en production ajoutée

### Erreurs Majeures Corrigées (3)

1. ✅ **Types any** - Corrigé dans lib/auth.ts
2. ✅ **Images config** - Liste blanche de domaines
3. ✅ **SignOptions** - Typage correct dans lib/auth.ts

### Variables d'Environnement Ajoutées

1. ✅ `ENCRYPTION_KEY` - Chiffrement des secrets
2. ✅ `JWT_SECRET` - Avec instructions de génération

---

## 📞 Support

Si vous rencontrez des problèmes :

1. **Consultez les logs Vercel** : Dashboard → Logs
2. **Vérifiez les variables d'environnement** : Settings → Environment Variables
3. **Testez en local** : `npm run build` doit réussir
4. **Vérifiez la connexion DB** : Testez DATABASE_URL avec psql

---

## 🎉 Prêt pour le Déploiement !

Tous les changements sont committés. Au prochain déploiement (dans 2h), Vercel :

1. ✅ Installera les dépendances
2. ✅ Générera le client Prisma
3. ✅ Appliquera les migrations sur Neon
4. ✅ Buildra l'application Next.js
5. ✅ Déploiera en production

**Bonne chance ! 🚀**

---

**Dernière mise à jour** : 10 novembre 2025
**Version** : 1.0.0 - Prêt pour déploiement
