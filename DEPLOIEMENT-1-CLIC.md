[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FWeevup%2Finvitation&env=DATABASE_URL,JWT_SECRET&envDescription=Configuration%20required%20for%20the%20invitation%20app&envLink=https%3A%2F%2Fgithub.com%2FWeevup%2Finvitation%2Fblob%2Fmain%2FDEPLOIEMENT-SIMPLE.md&project-name=weevup-invitation&repository-name=weevup-invitation)

# 🎉 Déploiement Weevup en 1 CLIC

## 🚀 Étape 1 : Cliquez sur le bouton ci-dessus

Le bouton "Deploy with Vercel" va :
- ✅ Créer automatiquement le projet sur Vercel
- ✅ Configurer tout automatiquement
- ✅ Vous demander juste 2 informations

---

## 📝 Étape 2 : Remplissez les 2 champs demandés

Vercel va vous demander 2 variables :

### 1. `DATABASE_URL`

**Option SANS base de données (démo design uniquement)** :
```
postgresql://demo:demo@localhost:5432/demo
```
⚠️ Les fonctionnalités ne marcheront pas, mais vous verrez le design

**Option AVEC base de données (application complète)** :

a) Ouvrez un nouvel onglet : https://console.neon.tech
b) Créez un compte (gratuit, avec GitHub)
c) Créez un projet nommé `weevup-invitation`
d) **COPIEZ** immédiatement la grande string qui apparaît (commence par `postgresql://`)
e) **COLLEZ-LA** dans le champ `DATABASE_URL` sur Vercel

### 2. `JWT_SECRET`

N'importe quelle chaîne de caractères longue et aléatoire.

**Copiez-collez ça** (j'en ai généré un pour vous) :
```
wv10ans2025-ultra-secret-jwt-key-molitor-paris-celebration-weevup-anniversary
```

---

## ✅ Étape 3 : Cliquez sur "Deploy"

Vercel va :
- Installer toutes les dépendances
- Builder l'application
- La mettre en ligne
- Vous donner une URL comme : `https://weevup-invitation.vercel.app`

**Durée** : 2-3 minutes ⏱️

---

## 🗄️ Étape 4 (optionnelle) : Initialiser la base de données

**Si vous avez mis une vraie DB Neon à l'étape 2**, initialisez-la :

### Depuis votre terminal local :

```bash
# 1. Mettez votre connection string Neon dans .env
# (la même que vous avez mise sur Vercel)

# 2. Créez les tables
npm run db:push

# 3. Chargez l'événement Weevup
npm run db:seed:weevup
```

Les liens d'invitation seront affichés - **copiez-les** !

---

## 🎊 C'EST TERMINÉ !

Votre application est en ligne ! 🎉

Allez sur : `https://votre-projet.vercel.app`

- **Page d'accueil** : `/`
- **Dashboard admin** : `/admin`
- **Invitation test** : `/guest/[TOKEN]` (utilisez un token du seed)

---

## 💡 Si le bouton "Deploy" ne marche pas

1. Allez sur : https://vercel.com/new
2. Cliquez sur "Import Git Repository"
3. Sélectionnez votre repo `Weevup/invitation`
4. Configurez les 2 variables d'environnement :
   - `DATABASE_URL` : (votre string Neon ou la démo)
   - `JWT_SECRET` : (la chaîne ci-dessus)
5. Cliquez sur "Deploy"

---

## ❓ Questions

**Q : Ça coûte combien ?**
R : €0 - Totalement gratuit (Vercel + Neon en version gratuite)

**Q : La base de données est obligatoire ?**
R : Non, mais sans DB vous n'aurez que le design visuel, pas les fonctionnalités

**Q : Comment ajouter mes vrais invités ?**
R : Suivez le guide [AJOUTER-VOS-INVITES.md](./AJOUTER-VOS-INVITES.md)

**Q : Comment configurer les emails ?**
R : Suivez [DEPLOIEMENT-VERCEL.md](./DEPLOIEMENT-VERCEL.md) section emails

---

**Besoin d'aide ?** Tous les guides sont dans le dossier du projet ! 😊
