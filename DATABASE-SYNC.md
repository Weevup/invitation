# 🔄 Synchronisation de la Base de Données

Ce guide vous aide à synchroniser votre base de données avec le schéma Prisma.

## 📋 Contexte

Le projet utilise **Prisma** comme ORM. Pour que l'interface de configuration Resend fonctionne, toutes les tables doivent exister dans la base de données, notamment :

- `User`
- `Event`
- `Guest`
- `RSVP`
- `Checkin`
- `EmailLog`
- `EmailTracking`
- **`EmailIntegration`** ⭐ (nécessaire pour l'interface de configuration)
- `EmailTemplate`

## 🎯 Option 1 : Script Automatique (Recommandé)

### En local :

```bash
# S'assurer que DATABASE_URL est défini dans .env
./scripts/setup-database.sh
```

### Pour Vercel (en ligne) :

**Méthode A : Depuis votre machine locale**

1. Copiez votre `DATABASE_URL` depuis Vercel Dashboard → Settings → Environment Variables
2. Ajoutez-la temporairement dans votre `.env` local
3. Exécutez :

```bash
npx prisma db push
```

**Méthode B : Via l'interface Vercel**

Malheureusement, Vercel n'exécute pas automatiquement les migrations. Vous devez :

1. Soit utiliser la Méthode A ci-dessus
2. Soit utiliser un service de CI/CD pour automatiser les migrations au déploiement

## 🔧 Option 2 : Commandes Manuelles

### 1. Générer le client Prisma

```bash
npx prisma generate
```

### 2. Synchroniser le schéma

```bash
npx prisma db push
```

Cette commande va :
- ✅ Créer toutes les tables manquantes
- ✅ Ajouter les colonnes manquantes aux tables existantes
- ✅ Ne pas supprimer de données existantes

### 3. (Optionnel) Charger des données de test

```bash
npm run db:seed:weevup
```

## 🗂️ Option 3 : Script TypeScript Avancé

Si vous avez des problèmes avec `prisma db push`, utilisez le script personnalisé :

```bash
npx tsx scripts/sync-database.ts
```

Ce script applique manuellement chaque migration SQL dans l'ordre.

## ✅ Vérifier que ça a fonctionné

### Méthode 1 : Prisma Studio

```bash
npx prisma studio
```

Ouvrez http://localhost:5555 et vérifiez que toutes les tables existent.

### Méthode 2 : Interface Web

1. Démarrez votre application : `npm run dev`
2. Allez sur http://localhost:3000/admin/settings/integrations
3. Essayez de configurer Resend
4. Si ça fonctionne sans erreur → ✅ La BDD est synchronisée !

## 🐛 Résolution des Problèmes

### Erreur : "Table EmailIntegration doesn't exist"

```bash
# Forcer la synchronisation
npx prisma db push --accept-data-loss
```

⚠️ **Attention** : `--accept-data-loss` peut supprimer des données. Utilisez uniquement en développement.

### Erreur : "Prisma engines checksum 403"

C'est une erreur réseau. Contournez-la :

```bash
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npx prisma generate
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npx prisma db push
```

### Erreur : "Cannot find module @prisma/client"

```bash
npm install
npx prisma generate
```

## 📊 État Actuel des Migrations

Les migrations suivantes existent :

| Migration | Description | Statut |
|-----------|-------------|--------|
| `20250101_init` | Tables de base (User, Event, Guest, etc.) | ✅ Créée |
| `20250107_add_showcase_fields` | Champs showcase pour Event | ✅ Existe |
| `20250108_add_communication_and_features` | EmailTracking | ✅ Existe |
| `20250108_add_email_integrations` | Table EmailIntegration | ✅ Existe |
| `20250108_add_email_templates` | Table EmailTemplate | ✅ Existe |

## 🔐 Sécurité

**Ne committez JAMAIS** votre fichier `.env` avec les vraies credentials !

Le `.gitignore` doit contenir :
```
.env
.env.local
.env*.local
```

## 💡 Alternative : Variables d'Environnement

Si vous ne voulez pas utiliser la table `EmailIntegration`, vous pouvez configurer Resend directement via les variables d'environnement :

```env
RESEND_API_KEY=re_xxx
EMAIL_FROM=julien@weevup.fr
EMAIL_FROM_NAME=Weevup
```

Dans ce cas, l'interface web d'intégrations ne fonctionnera pas, mais l'envoi d'emails fonctionnera quand même via `lib/email/resend.ts`.

## 📞 Besoin d'Aide ?

Si vous rencontrez des problèmes :

1. Vérifiez que `DATABASE_URL` est correctement défini
2. Vérifiez que vous avez accès réseau à la base de données
3. Essayez `npx prisma studio` pour voir si la connexion fonctionne
4. Consultez les logs d'erreur complets
