# 🚀 Déploiement Vercel ULTRA-SIMPLIFIÉ (5 minutes)

## Vous avez juste 3 choses à faire :

### 1️⃣ Installez Vercel CLI (30 secondes)

Copiez-collez cette commande dans votre terminal :

```bash
npm install -g vercel
```

---

### 2️⃣ Connectez-vous à Vercel (30 secondes)

```bash
vercel login
```

→ Cliquez sur le lien qui s'affiche
→ Autorisez dans votre navigateur
→ Revenez au terminal

---

### 3️⃣ Déployez TOUT automatiquement (1 commande !)

```bash
vercel --prod
```

Le script va vous poser quelques questions **SIMPLES** :

**Question 1** : "Set up and deploy?"
→ Tapez : `Y` ✅

**Question 2** : "Which scope?"
→ Appuyez juste sur `Entrée` ✅

**Question 3** : "Link to existing project?"
→ Tapez : `N` ✅

**Question 4** : "What's your project's name?"
→ Tapez : `weevup-invitation` ✅

**Question 5** : "In which directory is your code located?"
→ Appuyez juste sur `Entrée` ✅

---

## ✅ C'est déployé !

Vercel vous donnera une URL comme :
```
https://weevup-invitation.vercel.app
```

---

## 🗄️ Pour la base de données (2 minutes de plus)

### Option A : Sans DB (juste pour voir le design)

Votre app sera en ligne MAIS les fonctionnalités (RSVP, admin) ne marcheront pas encore.
→ Parfait juste pour montrer le design !

### Option B : Avec DB Neon (gratuit)

Si vous voulez les fonctionnalités complètes :

1. Allez sur : https://console.neon.tech
2. Créez un compte (avec GitHub)
3. Créez un projet
4. **COPIEZ** la connection string qui apparaît (commence par `postgresql://`)

5. Retournez dans votre terminal et tapez :

```bash
vercel env add DATABASE_URL
```

→ Collez votre connection string Neon
→ Sélectionnez : Production, Preview, Development (avec la barre espace)
→ Appuyez sur Entrée

6. Redéployez :

```bash
vercel --prod
```

7. Initialisez la DB :

```bash
# Mettez votre connection string Neon dans .env
# Puis :
npm run db:push
npm run db:seed:weevup
```

---

## 🎉 TERMINÉ !

Votre app est en ligne sur : `https://weevup-invitation.vercel.app`

---

**Trop compliqué ?** → Choisissez l'Option 1 (version démo statique)
**Vous voulez essayer ?** → Suivez ces 3 étapes !
