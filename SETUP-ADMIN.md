# Configuration du Compte Administrateur

## Création du Compte Admin Principal

Pour créer le compte administrateur `julien.boisard@weevup.fr`, vous avez **3 options** :

### Option 1 : Script Node.js (Recommandé)

Exécutez le script de création dans votre environnement local ou sur Vercel :

```bash
npx tsx scripts/create-admin-user.ts
```

**Identifiants créés** :
- **Email** : `julien.boisard@weevup.fr`
- **Mot de passe** : `Weevup2025!`

⚠️ **IMPORTANT** : Changez ce mot de passe immédiatement après la première connexion !

---

### Option 2 : API Setup (Déploiement initial uniquement)

Cette API ne fonctionne que s'il n'y a **aucun** administrateur dans la base de données.

**Requête cURL** :
```bash
curl -X POST https://votre-domaine.vercel.app/api/admin/setup-user
```

**Réponse** :
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

---

### Option 3 : Interface Admin (Si un admin existe déjà)

Si vous avez déjà un compte administrateur actif :

1. Connectez-vous à `/admin/login`
2. Accédez à `/admin/users`
3. Cliquez sur **"Nouvel Utilisateur"**
4. Remplissez le formulaire :
   - Email : `julien.boisard@weevup.fr`
   - Nom : `Julien Boisard`
   - Mot de passe : Choisissez un mot de passe sécurisé
   - Rôle : `Administrateur`
   - Compte actif : ✅

---

## Connexion Admin

Une fois le compte créé :

1. Accédez à : `https://votre-domaine.vercel.app/admin/login`
2. Entrez les identifiants :
   - Email : `julien.boisard@weevup.fr`
   - Mot de passe : `Weevup2025!` (ou celui que vous avez défini)
3. **Changez immédiatement le mot de passe** via `/admin/users`

---

## Gestion des Utilisateurs

Une fois connecté, vous pouvez gérer tous les comptes depuis `/admin/users` :

### Fonctionnalités disponibles :
- ✅ **Créer** de nouveaux utilisateurs (Admin ou Guest)
- ✏️ **Modifier** les informations d'un utilisateur
- 🔒 **Activer/Désactiver** des comptes
- 🔑 **Réinitialiser** les mots de passe
- 🗑️ **Supprimer** des utilisateurs (sauf le dernier admin actif)

### Statistiques affichées :
- Total d'utilisateurs
- Nombre d'administrateurs
- Comptes actifs
- Comptes verrouillés (après 5 tentatives échouées)

### Filtres disponibles :
- 🔍 Recherche par nom ou email
- 👥 Filtrer par rôle (Admin / Guest)
- ✅ Filtrer par statut (Actif / Inactif / Verrouillé)

---

## Sécurité

### Protection des comptes :
- ✅ Mot de passe hashé avec bcrypt (10 rounds)
- ✅ Verrouillage automatique après 5 tentatives échouées (15 minutes)
- ✅ Validation des emails et mots de passe (minimum 8 caractères)
- ✅ Impossible de supprimer le dernier administrateur actif

### Routes protégées :
- Toutes les routes `/admin/*` et `/api/admin/*` nécessitent une authentification
- Le middleware NextAuth vérifie automatiquement les sessions
- Les API retournent un JSON 401 pour les requêtes non autorisées

---

## Dépannage

### Problème : "Impossible de se connecter"

1. Vérifiez que le compte existe :
```bash
# Connectez-vous à votre base de données Neon
psql "postgresql://neondb_owner:...@ep-gentle-meadow-abxleko9-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require"

# Vérifiez les utilisateurs
SELECT email, name, role, "isActive" FROM "User";
```

2. Réinitialisez le mot de passe si nécessaire via l'interface admin

### Problème : "Compte verrouillé"

Le compte est automatiquement verrouillé après 5 tentatives de connexion échouées.

**Solution** :
1. Connectez-vous avec un autre compte admin
2. Accédez à `/admin/users`
3. Modifiez l'utilisateur et cochez "Compte actif"
4. Le compteur de tentatives sera réinitialisé

### Problème : "API setup-user retourne 403"

Cette API ne fonctionne que s'il n'y a **aucun** administrateur dans la base.

**Solution** : Utilisez l'interface admin `/admin/users` pour créer de nouveaux comptes.

---

## Variables d'Environnement Requises

Assurez-vous que ces variables sont définies dans Vercel :

```env
# Base de données
DATABASE_URL="postgresql://..."

# Authentication (NextAuth)
AUTH_SECRET="votre-secret-genere-aleatoirement"
NEXTAUTH_URL="https://votre-domaine.vercel.app"

# JWT & Encryption
JWT_SECRET="votre-secret-jwt-64-caracteres"
ENCRYPTION_KEY="32-caracteres-exactement"
```

Générez les secrets avec :
```bash
# AUTH_SECRET et JWT_SECRET
openssl rand -base64 64

# ENCRYPTION_KEY (doit faire exactement 32 caractères)
openssl rand -hex 16
```
