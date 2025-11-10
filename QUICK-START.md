# Quick Start - Développement

Guide ultra-rapide pour démarrer le développement en 5 minutes.

## ⚡ Setup en 5 Minutes

### 1. Clone & Install (1 min)

```bash
git clone <repo>
cd invitation
npm install
```

### 2. Base de Données (2 min)

**Option A - Neon (Recommandé)**
1. Compte gratuit: https://neon.tech
2. Créer un projet PostgreSQL
3. Copier la `DATABASE_URL`

**Option B - Local**
```bash
# macOS
brew install postgresql@14
brew services start postgresql@14
createdb invitation_manager
```

### 3. Configuration (1 min)

```bash
# Créer .env.local
cat > .env.local << 'EOF'
DATABASE_URL="postgresql://..." # Votre URL Neon ou local
AUTH_SECRET="dev-secret-minimum-32-caracteres-random"
NEXTAUTH_SECRET="dev-secret-minimum-32-caracteres-random"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
EOF
```

### 4. DB Setup (30 sec)

```bash
npx prisma db push
```

### 5. Créer Admin (30 sec)

```bash
# Démarrez l'app
npm run dev

# Dans un autre terminal ou navigateur:
curl http://localhost:3000/api/admin/check-and-fix
```

**Credentials créés:**
- Email: `contact@weevup.com`
- Password: `admin123`

### 6. Test (10 sec)

Ouvrez: http://localhost:3000/auth/admin

**Connectez-vous avec les credentials ci-dessus** ✅

---

## 🚀 Workflow Développement

### Démarrer

```bash
npm run dev  # http://localhost:3000
```

### Modifier la DB

```bash
# 1. Éditez prisma/schema.prisma
# 2. Synchronisez:
npx prisma db push
# 3. Redémarrez l'app
```

### Déboguer

**APIs utiles:**
- http://localhost:3000/api/admin/check-and-fix - DB status
- http://localhost:3000/api/check-env - Env vars
- http://localhost:3000/api/auth/providers - NextAuth status

**Logs:**
- Console du terminal (serveur)
- DevTools → Console (client)

### Commit

```bash
git add .
git commit -m "feat: description"
git push
```

---

## 📁 Où Développer?

### Ajouter une Page Admin

```
app/admin/ma-page/
├── page.tsx         # Votre composant
└── loading.tsx      # (optionnel) Loading state
```

### Ajouter une API

```
app/api/admin/mon-api/
└── route.ts         # GET, POST, etc.
```

### Ajouter un Composant

```
components/
├── admin/           # Composants admin
│   └── mon-composant.tsx
└── ui/              # shadcn/ui components
```

---

## 🔥 Commandes Essentielles

```bash
# Développement
npm run dev          # Démarrer en dev
npm run build        # Build production (test local)
npm run lint         # Vérifier le code

# Base de données
npx prisma studio    # GUI pour explorer la DB
npx prisma db push   # Synchro schéma → DB
npx prisma generate  # Regénérer le client Prisma

# Debug
npm run dev -- --turbo  # Mode turbo (plus rapide)
```

---

## ⚠️ Problèmes Courants

### Erreur: "Prisma Client not found"

```bash
npx prisma generate
```

### Erreur: "Port 3000 already in use"

```bash
# Trouver le processus
lsof -ti:3000

# Tuer le processus
kill -9 $(lsof -ti:3000)

# OU utiliser un autre port
npm run dev -- -p 3001
```

### Page blanche après modif

```bash
# Hard refresh
Cmd+Shift+R (Mac) ou Ctrl+Shift+R (Windows/Linux)

# OU redémarrez l'app
```

### Changement de middleware.ts non pris en compte

```bash
# Redémarrage requis pour middleware.ts et .env
Ctrl+C
npm run dev
```

---

## 📚 Documentation Complète

- **[DEV-GUIDE.md](./DEV-GUIDE.md)** - Guide du développeur complet
- **[README.md](./README.md)** - Vue d'ensemble du projet
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Guide de dépannage détaillé
- **[VERCEL-ENV-CHECKLIST.md](./VERCEL-ENV-CHECKLIST.md)** - Checklist pour Vercel

---

## 🎯 Prochaines Étapes

1. **Explorez l'app** - Créez un événement, des invités
2. **Lisez le code** - Commencez par `/app/admin/page.tsx`
3. **Consultez [DEV-GUIDE.md](./DEV-GUIDE.md)** - Architecture détaillée
4. **Développez!** 🚀

---

**Besoin d'aide?** Consultez [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) ou les logs Vercel.
