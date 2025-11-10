# Configuration des Variables d'Environnement Vercel

## 🔴 Erreur "Configuration" sur /admin/login

Cette erreur indique que **NextAuth** n'a pas les variables d'environnement requises.

---

## ✅ SOLUTION RAPIDE (5 minutes)

### Étape 1 : Accéder aux Variables d'Environnement Vercel

1. Allez sur [https://vercel.com](https://vercel.com)
2. Sélectionnez votre projet **invitation-wheat**
3. Cliquez sur **Settings** (⚙️)
4. Dans le menu de gauche, cliquez sur **Environment Variables**

### Étape 2 : Ajouter les Variables OBLIGATOIRES

Ajoutez ces variables **une par une** :

#### 1️⃣ AUTH_SECRET (CRITIQUE)
```
Nom: AUTH_SECRET
Valeur: (générez avec la commande ci-dessous)
Environnement: ✅ Production ✅ Preview ✅ Development
```

**Générer AUTH_SECRET** :
```bash
# Sur macOS/Linux
openssl rand -base64 64

# Exemple de valeur générée :
# KjH8DfG3LoP2QwE5RtY6UiO9PlK0MnB1VcX4ZaS7DfG8HjK9LpM2NqW3ErT5YuI6O8PlK
```

#### 2️⃣ NEXTAUTH_URL (CRITIQUE)
```
Nom: NEXTAUTH_URL
Valeur: https://invitation-wheat.vercel.app
Environnement: ✅ Production ✅ Preview ✅ Development
```

#### 3️⃣ DATABASE_URL (déjà configurée normalement)
```
Nom: DATABASE_URL
Valeur: postgresql://neondb_owner:npg_7qTIH2pMYJBW@ep-gentle-meadow-abxleko9-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require
Environnement: ✅ Production ✅ Preview ✅ Development
```

#### 4️⃣ JWT_SECRET (pour les tokens invités)
```
Nom: JWT_SECRET
Valeur: (générez avec openssl rand -base64 64)
Environnement: ✅ Production ✅ Preview ✅ Development
```

#### 5️⃣ ENCRYPTION_KEY (pour chiffrer les API keys)
```
Nom: ENCRYPTION_KEY
Valeur: (générez avec openssl rand -hex 16)
Environnement: ✅ Production ✅ Preview ✅ Development
```

**Exemple de valeur ENCRYPTION_KEY** :
```bash
openssl rand -hex 16
# Résultat (32 caractères) : a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

---

### Étape 3 : Redéployer

Après avoir ajouté toutes les variables :

1. Retournez sur l'onglet **Deployments**
2. Cliquez sur les **3 points (...)** du dernier déploiement
3. Sélectionnez **Redeploy**
4. Attendez ~2 minutes

---

## 🧪 TESTER LA CONNEXION

### Option A : Avec le compte admin par défaut (si créé via `/api/admin/init`)

1. Allez sur : `https://invitation-wheat.vercel.app/admin/login`
2. Entrez :
   - **Email** : `admin@weevup.com`
   - **Mot de passe** : `admin123`

### Option B : Créer votre compte admin principal

Une fois le redéploiement terminé, exécutez :

```bash
curl -X POST https://invitation-wheat.vercel.app/api/setup-admin
```

**Réponse attendue** :
```json
{
  "success": true,
  "message": "Compte administrateur créé avec succès",
  "user": {
    "id": "...",
    "email": "julien.boisard@weevup.fr",
    "name": "Julien Boisard",
    "role": "ADMIN"
  },
  "credentials": {
    "email": "julien.boisard@weevup.fr",
    "password": "Weevup2025!",
    "note": "Veuillez changer ce mot de passe immédiatement"
  }
}
```

Ensuite connectez-vous avec :
- **Email** : `julien.boisard@weevup.fr`
- **Mot de passe** : `Weevup2025!`

---

## 🔍 VÉRIFIER QUE TOUT FONCTIONNE

### Checklist :

- [ ] Variables d'environnement ajoutées dans Vercel
- [ ] Projet redéployé
- [ ] Page `/admin/login` affiche le formulaire (pas d'erreur "Configuration")
- [ ] Compte admin créé via API ou existant
- [ ] Connexion réussie
- [ ] Redirection vers `/admin` (dashboard)

---

## ⚠️ ERREURS COURANTES

### Erreur : "Configuration"
**Cause** : `AUTH_SECRET` manquant
**Solution** : Ajoutez la variable et redéployez

### Erreur : "Invalid credentials"
**Cause** : Mot de passe incorrect ou compte inexistant
**Solution** : Créez le compte avec `/api/setup-admin`

### Erreur : "Database connection failed"
**Cause** : `DATABASE_URL` incorrecte
**Solution** : Vérifiez la connexion Neon dans Vercel

### L'API `/api/setup-admin` retourne 403
**Cause** : Un admin existe déjà
**Solution** : Utilisez les identifiants existants ou créez via `/admin/users`

---

## 📋 LISTE COMPLÈTE DES VARIABLES (Pour référence)

Variables **OBLIGATOIRES** :
```env
DATABASE_URL=postgresql://...
AUTH_SECRET=<généré>
NEXTAUTH_URL=https://invitation-wheat.vercel.app
JWT_SECRET=<généré>
ENCRYPTION_KEY=<généré>
```

Variables **OPTIONNELLES** (pour emails) :
```env
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@weevup.com
EMAIL_FROM_NAME=Weevup Events
```

Variables **OPTIONNELLES** (pour rate limiting) :
```env
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```

---

## 🆘 BESOIN D'AIDE ?

Si le problème persiste après avoir suivi ce guide :

1. **Vérifiez les logs Vercel** :
   - Allez sur Deployments → Cliquez sur le dernier déploiement
   - Consultez l'onglet "Runtime Logs"
   - Recherchez les erreurs liées à "NextAuth" ou "AUTH_SECRET"

2. **Testez localement** :
   ```bash
   # Créez un fichier .env avec les mêmes variables
   npm run dev
   # Allez sur http://localhost:3000/admin/login
   ```

3. **Contactez-moi** avec :
   - Screenshot de l'erreur
   - Copie des variables d'environnement (masquez les valeurs sensibles)
   - Logs Vercel si disponibles
