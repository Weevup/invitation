# 🚀 Déployer l'application Weevup sur Vercel

## Pourquoi Vercel ?

- ✅ Gratuit pour les projets personnels
- ✅ Déploiement automatique depuis GitHub
- ✅ Base de données PostgreSQL incluse (via Neon)
- ✅ HTTPS automatique
- ✅ Créé par l'équipe de Next.js

## 📋 Prérequis

- Compte GitHub (déjà fait ✓)
- Compte Vercel (gratuit)

## 🎯 Déploiement en 5 étapes

### Étape 1 : Créer un compte Vercel

1. Allez sur https://vercel.com
2. Cliquez sur "Sign Up"
3. Choisissez "Continue with GitHub"
4. Autorisez l'accès à vos repositories

### Étape 2 : Connecter votre repository

1. Une fois connecté, cliquez sur **"Add New..."** → **"Project"**
2. Trouvez et sélectionnez le repository `Weevup/invitation`
3. Cliquez sur **"Import"**

### Étape 3 : Configurer le projet

**Framework Preset** : Next.js (détecté automatiquement)

**Build Settings** : Laissez par défaut
- Build Command: `next build`
- Output Directory: `.next`

**Root Directory** : `.` (racine)

Ne cliquez PAS encore sur "Deploy" !

### Étape 4 : Configurer les variables d'environnement

Cliquez sur **"Environment Variables"** et ajoutez :

#### Variables essentielles :

```env
# 1. Base de données (on va la créer juste après)
DATABASE_URL=postgresql://...  [À CONFIGURER À L'ÉTAPE 5]

# 2. URL de l'application (sera fournie par Vercel)
NEXT_PUBLIC_APP_URL=https://votre-app.vercel.app  [À METTRE À JOUR APRÈS]

# 3. Secret JWT (générez-en un unique !)
JWT_SECRET=votre-secret-jwt-ultra-securise-changez-moi

# 4. Configuration email (pour l'instant, on peut skip)
EMAIL_FROM=noreply@invitation-manager.com
EMAIL_FROM_NAME=Invitation Manager Weevup

# 5. SMTP (optionnel pour démo - utilisez Ethereal ou laissez vide)
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
SMTP_SECURE=false

# 6. Node environment
NODE_ENV=production
```

**Important** : Ne déployez pas encore ! On doit d'abord créer la base de données.

### Étape 5 : Créer la base de données PostgreSQL

#### Option A : Neon (Recommandé - Gratuit)

1. Allez sur https://neon.tech
2. Créez un compte (gratuit)
3. Cliquez sur **"Create a project"**
4. Nommez-le : `weevup-invitation`
5. Région : Choisissez la plus proche (ex: Frankfurt)
6. Cliquez sur **"Create project"**

7. **Copiez la Connection String** qui apparaît :
   ```
   postgresql://user:password@ep-xxx.eu-central-1.aws.neon.tech/weevup?sslmode=require
   ```

8. Retournez sur Vercel, et **mettez à jour la variable `DATABASE_URL`** avec cette connexion

#### Option B : Supabase (Alternative gratuite)

1. Allez sur https://supabase.com
2. Créez un projet
3. Récupérez la connection string dans Settings → Database
4. Ajoutez-la comme `DATABASE_URL` dans Vercel

### Étape 6 : Déployer !

1. Vérifiez que toutes les variables d'environnement sont configurées
2. Cliquez sur **"Deploy"**
3. ⏳ Attendez 2-3 minutes...
4. 🎉 Votre app est en ligne !

### Étape 7 : Initialiser la base de données

Une fois le déploiement terminé :

1. Notez l'URL de votre app : `https://votre-app.vercel.app`
2. Mettez à jour la variable `NEXT_PUBLIC_APP_URL` dans Vercel avec cette URL
3. Redéployez (Settings → Redeploy)

Maintenant, initialisez la base de données localement avec la connexion Vercel :

```bash
# Dans votre terminal local
# Copiez la DATABASE_URL de Vercel dans votre .env local temporairement

# Générer le client Prisma
npx prisma generate

# Créer les tables
npx prisma db push

# Charger les données Weevup
npm run db:seed:weevup
```

**Note** : Les liens d'invitation générés utiliseront votre URL Vercel !

### Étape 8 : Tester votre démo

1. Visitez `https://votre-app.vercel.app`
2. Testez le dashboard admin : `https://votre-app.vercel.app/admin`
3. Utilisez un lien d'invitation généré pour tester le parcours invité

---

## 🔄 Déploiements automatiques

Maintenant, **à chaque push sur votre branche GitHub**, Vercel :
- ✅ Détecte les changements
- ✅ Rebuild automatiquement
- ✅ Déploie la nouvelle version
- ✅ Garde l'ancienne version en cas de problème

---

## 📧 Configurer les emails en production

### Option 1 : Resend (Recommandé)

1. Créez un compte sur https://resend.com (gratuit jusqu'à 3000 emails/mois)
2. Obtenez votre API key
3. Dans Vercel, ajoutez la variable :
   ```
   RESEND_API_KEY=re_votre_cle_ici
   ```
4. Redéployez

### Option 2 : SendGrid

1. https://sendgrid.com (100 emails/jour gratuit)
2. API Key → Variable Vercel
3. Code déjà compatible

---

## 🎨 Personnaliser le domaine (Optionnel)

Vous voulez un domaine personnalisé type `invitations.weevup.com` ?

1. Dans Vercel, allez dans **Settings → Domains**
2. Ajoutez votre domaine
3. Configurez les DNS selon les instructions Vercel

---

## 🔍 Monitorer votre application

**Dashboard Vercel** : https://vercel.com/dashboard
- 📊 Analytics : Visites, performance
- 📈 Logs : Erreurs et requêtes
- 🔄 Déploiements : Historique

**Prisma Studio (pour la DB)** :
```bash
# En local, connectez-vous à la DB de production
npx prisma studio
```

---

## ⚡ Commandes utiles

```bash
# Redéployer manuellement
vercel --prod

# Voir les logs en temps réel
vercel logs

# Ouvrir le projet dans Vercel
vercel open
```

---

## 🐛 Dépannage

### "Application Error" après déploiement

**Cause** : Base de données pas initialisée

**Solution** :
```bash
# Avec la DATABASE_URL de Vercel dans votre .env local
npx prisma db push
npm run db:seed:weevup
```

### Variables d'environnement non prises en compte

**Solution** : Redéployez après avoir modifié les variables
- Settings → Redeploy

### Erreur de connexion DB

**Vérifiez** :
- ✅ DATABASE_URL est correcte
- ✅ Le format inclut `?sslmode=require` pour Neon
- ✅ La DB est bien créée

---

## 📱 Partager votre démo

Une fois déployé, vous pouvez partager :

**URL publique** : `https://votre-app.vercel.app`
**Dashboard admin** : `https://votre-app.vercel.app/admin`
**Exemple d'invitation** : Utilisez un lien généré par le seed

---

## 💰 Coûts

**Gratuit pour toujours si :**
- ✅ Moins de 100 GB de bande passante/mois
- ✅ Moins de 6000 minutes de build/mois
- ✅ Base de données Neon gratuite (3 GB)

Pour Weevup, largement suffisant pour tester et même utiliser en production ! 🎉

---

## 🎯 Alternative rapide : Déploiement en 1 clic

Si vous préférez tout automatiser, j'ai préparé un fichier de configuration Vercel.

Il suffit de cliquer sur ce bouton après avoir pushé votre code :

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Weevup/invitation)

---

## ✅ Checklist de déploiement

- [ ] Compte Vercel créé
- [ ] Repository connecté
- [ ] Base de données Neon/Supabase créée
- [ ] Variables d'environnement configurées
- [ ] Première version déployée
- [ ] Database initialisée (prisma db push + seed)
- [ ] URL mise à jour dans NEXT_PUBLIC_APP_URL
- [ ] Test de la démo fonctionnel
- [ ] (Optionnel) Emails configurés avec Resend
- [ ] (Optionnel) Domaine personnalisé ajouté

---

**Besoin d'aide ?** La documentation Vercel est excellente : https://vercel.com/docs

Bon déploiement ! 🚀
