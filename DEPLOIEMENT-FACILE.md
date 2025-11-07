# 🎯 Déploiement ULTRA-FACILE - Choisissez votre méthode

## Option 1️⃣ : Déploiement en 1 CLIC (Le plus simple !)

**Cliquez simplement sur ce bouton :**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FWeevup%2Finvitation&env=DATABASE_URL,JWT_SECRET&envDescription=Configuration%20required&project-name=weevup-invitation&repository-name=weevup-invitation)

→ Vercel va tout configurer automatiquement
→ Vous devrez juste remplir 2 champs (on vous explique quoi mettre)
→ 3 minutes et c'est en ligne !

📖 **Guide détaillé** : [DEPLOIEMENT-1-CLIC.md](./DEPLOIEMENT-1-CLIC.md)

---

## Option 2️⃣ : Depuis l'interface Vercel

**Si le bouton ne marche pas** :

1. Allez sur https://vercel.com/new
2. Connectez-vous avec GitHub
3. Importez le repository `Weevup/invitation`
4. Configurez 2 variables :
   - `DATABASE_URL` : Votre connexion Neon (ou `postgresql://demo:demo@localhost:5432/demo` pour tester)
   - `JWT_SECRET` : `weevup-10ans-super-secret-key-2025`
5. Cliquez "Deploy"

---

## Option 3️⃣ : Avec le terminal (pour les devs)

```bash
# Installer Vercel CLI
npm install -g vercel

# Se connecter
vercel login

# Déployer
vercel --prod
```

📖 **Guide détaillé** : [DEPLOIEMENT-SIMPLE.md](./DEPLOIEMENT-SIMPLE.md)

---

## 🗄️ Base de données (Optionnel mais recommandé)

### Sans base de données :
→ Vous verrez juste le design
→ Aucune fonctionnalité ne marchera

### Avec base de données Neon (gratuit) :
1. https://console.neon.tech
2. Créez un compte
3. Créez un projet
4. Copiez la connection string
5. Collez-la dans `DATABASE_URL` sur Vercel

Puis initialisez :
```bash
npm run db:push
npm run db:seed:weevup
```

---

## 🎊 Résultat

Une fois déployé :

✅ Application en ligne : `https://votre-app.vercel.app`
✅ Dashboard admin : `https://votre-app.vercel.app/admin`
✅ HTTPS automatique
✅ Déploiements automatiques depuis GitHub

---

## 💰 Coût

**€0 / mois** - Totalement gratuit avec :
- Vercel (plan Hobby gratuit)
- Neon (plan Free gratuit)

---

## ❓ Besoin d'aide ?

| Guide | Pour quoi ? |
|-------|-------------|
| [DEPLOIEMENT-1-CLIC.md](./DEPLOIEMENT-1-CLIC.md) | ⭐ Déploiement le plus simple |
| [DEPLOIEMENT-SIMPLE.md](./DEPLOIEMENT-SIMPLE.md) | Avec le terminal (CLI) |
| [DEPLOIEMENT-VERCEL.md](./DEPLOIEMENT-VERCEL.md) | Guide complet détaillé |
| [WEEVUP-QUICKSTART.md](./WEEVUP-QUICKSTART.md) | Installation locale |

---

**Prêt ?** Cliquez sur le bouton en haut ! 🚀
