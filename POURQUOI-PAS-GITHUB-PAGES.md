# ⚠️ Pourquoi pas GitHub Pages ?

## TL;DR

**GitHub Pages ne fonctionne PAS pour cette application** car c'est une application full-stack qui nécessite un serveur backend et une base de données.

👉 **Solution recommandée : [Vercel](DEPLOIEMENT-VERCEL.md)** (gratuit, 5 minutes de setup)

---

## 🔍 Explication technique

### Ce qu'est GitHub Pages

GitHub Pages est un hébergement **statique uniquement** :
- ✅ Fichiers HTML
- ✅ CSS
- ✅ JavaScript
- ✅ Images

C'est parfait pour :
- Sites vitrine
- Portfolios
- Documentation
- Landing pages simples

### Ce qu'est votre application

Votre Invitation Manager est une **application full-stack** :

| Composant | Requis | GitHub Pages |
|-----------|--------|--------------|
| Frontend React/Next.js | ✅ | ✅ Possible (avec export statique) |
| API Routes (backend) | ✅ | ❌ **Impossible** |
| Base de données PostgreSQL | ✅ | ❌ **Impossible** |
| Variables d'environnement | ✅ | ❌ **Impossible** |
| Génération QR codes | ✅ | ❌ **Impossible** (côté serveur) |
| Envoi d'emails | ✅ | ❌ **Impossible** |
| Authentification JWT | ✅ | ❌ **Impossible** |

### Pourquoi c'est impossible ?

**1. Pas de serveur Node.js**
```typescript
// Ces API routes NE PEUVENT PAS tourner sur GitHub Pages
// app/api/guest/[token]/route.ts
export async function GET(request: NextRequest) {
  const guest = await prisma.guest.findUnique(...) // ❌ Pas de Prisma
  return NextResponse.json(guest) // ❌ Pas de serveur
}
```

**2. Pas de base de données**
```typescript
// Prisma nécessite PostgreSQL
const prisma = new PrismaClient() // ❌ Impossible sur GitHub Pages
```

**3. Pas de secrets sécurisés**
```env
JWT_SECRET=xxx    # ❌ Pas de variables d'environnement sécurisées
DATABASE_URL=xxx  # ❌ Exposé publiquement si on tente
```

---

## ✅ Solutions adaptées

### Option 1 : Vercel (Recommandé) 🥇

**Pourquoi ?**
- Créé par l'équipe de Next.js
- **Gratuit** pour projets personnels
- Déploiement en 5 minutes
- Base de données PostgreSQL incluse (Neon)
- HTTPS automatique
- Déploiements automatiques depuis GitHub

**Comment ?**
👉 Suivez le guide : [DEPLOIEMENT-VERCEL.md](DEPLOIEMENT-VERCEL.md)

**Coût :** €0 (gratuit pour toujours avec les limites généreuses)

---

### Option 2 : Netlify 🥈

**Avantages :**
- Interface simple
- Gratuit
- Bon pour Next.js

**Limitations :**
- Fonctions serverless limitées sur le plan gratuit
- Base de données séparée nécessaire

**Comment ?**
1. Connectez votre repo GitHub
2. Netlify détecte Next.js automatiquement
3. Ajoutez une DB externe (Neon/Supabase)
4. Configurez les variables d'environnement
5. Déployez

---

### Option 3 : Railway 🥉

**Avantages :**
- Base de données PostgreSQL intégrée
- Très simple
- $5/mois de crédit gratuit

**Comment ?**
1. Créez un compte sur https://railway.app
2. "New Project" → Depuis GitHub
3. Ajoutez PostgreSQL (1 clic)
4. Les variables d'environnement se configurent automatiquement
5. Déployez

---

### Option 4 : Render

**Avantages :**
- Gratuit pour commencer
- PostgreSQL inclus

**Inconvénients :**
- Plus lent à démarrer (serveur s'endort)

---

## 📊 Comparaison rapide

| Solution | Prix | Setup | Performance | DB incluse |
|----------|------|-------|-------------|------------|
| **Vercel** | Gratuit | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Via Neon |
| Netlify | Gratuit | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Non (externe) |
| Railway | $5 crédit | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ✅ Oui |
| Render | Gratuit | ⭐⭐⭐ | ⭐⭐⭐ | ✅ Oui |
| GitHub Pages | Gratuit | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ❌ Impossible |

---

## 🎯 Notre recommandation pour Weevup

### Pour une démo rapide (aujourd'hui) :
👉 **Vercel** avec base de données Neon
- Temps : 5-10 minutes
- Coût : €0
- URL : `weevup-invitation.vercel.app`

### Pour la production (votre vrai événement) :
👉 **Vercel** ou **Railway**
- Ajouter un domaine personnalisé (optionnel)
- Configurer Resend pour les emails
- Monitoring inclus

---

## 🚀 Déployer maintenant

**Étape 1 :** Lisez le guide [DEPLOIEMENT-VERCEL.md](DEPLOIEMENT-VERCEL.md)

**Étape 2 :** Créez votre compte Vercel (gratuit)

**Étape 3 :** Cliquez sur ce bouton :

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Weevup/invitation)

**Étape 4 :** Suivez les instructions du guide

**Temps total :** 5-10 minutes ⏱️

---

## ❓ FAQ

**Q : Pourquoi ne pas convertir en site statique ?**
R : On perdrait toutes les fonctionnalités principales (RSVP, emails, QR codes, dashboard admin). Ce ne serait plus qu'une page vitrine.

**Q : GitHub Pages est-il vraiment gratuit ?**
R : Oui, mais limité au statique. Vercel est aussi gratuit pour des applications full-stack !

**Q : Puis-je utiliser mon propre serveur ?**
R : Oui ! Dockerisez l'app et déployez sur votre VPS. Mais Vercel est plus simple et gratuit.

**Q : Et si je veux juste montrer le design ?**
R : Dans ce cas, vous pouvez faire des captures d'écran ou enregistrer une vidéo démo. Mais le mieux reste de déployer sur Vercel pour une vraie démo interactive.

---

## 📚 Ressources

- [Guide de déploiement Vercel](DEPLOIEMENT-VERCEL.md) ⭐
- [Guide de démarrage rapide](WEEVUP-QUICKSTART.md)
- [Documentation Next.js Deployment](https://nextjs.org/docs/deployment)

---

**Prêt à déployer ?** Commencez avec [DEPLOIEMENT-VERCEL.md](DEPLOIEMENT-VERCEL.md) ! 🚀
