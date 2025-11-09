# 📜 Scripts de Gestion de Base de Données

Ce dossier contient des scripts utilitaires pour gérer la base de données PostgreSQL avec Prisma.

## 📁 Scripts Disponibles

### `setup-database.sh`
Script bash interactif pour configurer complètement la base de données.

**Usage:**
```bash
./scripts/setup-database.sh
```

**Ce qu'il fait:**
1. ✅ Vérifie que DATABASE_URL est configuré
2. 📦 Génère le client Prisma
3. 🚀 Synchronise le schéma avec la base de données
4. 🌱 (Optionnel) Charge les données de seed

**Quand l'utiliser:**
- Configuration initiale d'un nouvel environnement
- Après avoir cloné le projet
- Pour réinitialiser une base de développement

---

### `sync-database.ts`
Script TypeScript pour appliquer toutes les migrations SQL manuellement.

**Usage:**
```bash
npm run db:sync
# ou
npx tsx scripts/sync-database.ts
```

**Ce qu'il fait:**
1. 📋 Liste toutes les migrations SQL dans `prisma/migrations/`
2. 🔄 Les applique dans l'ordre chronologique
3. ✨ Affiche un rapport détaillé

**Quand l'utiliser:**
- Quand `prisma migrate deploy` ne fonctionne pas
- Pour déboguer des problèmes de migration
- En environnement restreint (pas d'accès aux binaires Prisma)

---

## 🚀 Commandes NPM Rapides

Ajoutées dans `package.json`:

```bash
# Configuration complète (interactive)
npm run db:setup

# Synchronisation manuelle des migrations
npm run db:sync

# Générer le client Prisma seulement
npm run db:generate

# Synchroniser le schéma (équivalent à prisma db push)
npm run db:push

# Appliquer les migrations en production
npm run db:migrate

# Ouvrir Prisma Studio (interface graphique)
npm run db:studio
```

## 🔧 Scénarios d'Usage

### Scénario 1: Premier Setup Local

```bash
# 1. Cloner le repo
git clone https://github.com/Weevup/invitation.git
cd invitation

# 2. Installer les dépendances
npm install

# 3. Configurer .env avec DATABASE_URL
cp .env.example .env
# Éditer .env et ajouter DATABASE_URL

# 4. Setup automatique
./scripts/setup-database.sh
```

### Scénario 2: Synchroniser Base de Production depuis Local

```bash
# 1. Récupérer DATABASE_URL depuis Vercel
# Dashboard → Settings → Environment Variables → DATABASE_URL

# 2. L'ajouter temporairement dans .env
echo "DATABASE_URL=postgresql://..." >> .env

# 3. Synchroniser
npm run db:push

# 4. (Optionnel) Charger les données
npm run db:seed:weevup

# 5. Supprimer DATABASE_URL du .env local
# (ou le remplacer par votre DB locale)
```

### Scénario 3: Débogage Migration

```bash
# Si vous avez des erreurs avec prisma migrate
npm run db:sync

# Cela appliquera les migrations une par une
# et vous montrera exactement où ça bloque
```

### Scénario 4: Reset Complet (DEV ONLY!)

```bash
# ⚠️ ATTENTION: Cela supprime TOUTES les données

# Option A: Avec Prisma
npx prisma migrate reset

# Option B: Manuel
npx prisma db push --force-reset
npm run db:seed:demo
```

## 🐛 Résolution de Problèmes

### Erreur: "DATABASE_URL not found"

```bash
# Vérifier que .env existe et contient DATABASE_URL
cat .env | grep DATABASE_URL

# Si vide, l'ajouter:
echo "DATABASE_URL=postgresql://..." >> .env
```

### Erreur: "Prisma engines checksum 403"

```bash
# Contourner la vérification du checksum
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npm run db:push
```

### Erreur: "Cannot find module @prisma/client"

```bash
# Régénérer le client
npm run db:generate
```

### Erreur: "Table already exists"

C'est normal ! Les scripts utilisent `CREATE TABLE IF NOT EXISTS`, donc ils ne font rien si la table existe déjà.

## 📚 Documentation Complète

Pour plus de détails, consultez:
- [DATABASE-SYNC.md](../DATABASE-SYNC.md) - Guide complet de synchronisation
- [DEPLOIEMENT-VERCEL.md](../DEPLOIEMENT-VERCEL.md) - Déploiement en production

## 🔐 Sécurité

**Ne committez JAMAIS:**
- `.env` avec des vraies credentials
- Fichiers contenant DATABASE_URL

**Toujours:**
- ✅ Utiliser `.env.local` pour le développement
- ✅ Vérifier `.gitignore` contient `.env*`
- ✅ Utiliser des variables d'environnement en production
