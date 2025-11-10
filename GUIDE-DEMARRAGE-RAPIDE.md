# 🚀 Guide de Démarrage Rapide (5 minutes)

**Objectif** : Essayez l'Invitation Manager en local en 5 minutes chrono !

---

## ⏱️ Prérequis (1 min)

Vérifiez que vous avez :
- ✅ **Node.js 18+** : `node --version`
- ✅ **npm** : `npm --version`
- ✅ **Git** : `git --version`

**Pas installé ?**
- Node.js : https://nodejs.org/
- Git : https://git-scm.com/

---

## 📦 Installation (2 min)

### 1. Cloner et installer

```bash
# Cloner le repository
git clone https://github.com/Weevup/invitation.git
cd invitation

# Installer les dépendances (2 min)
npm install
```

### 2. Configuration minimale

```bash
# Copier le fichier d'environnement
cp .env.example .env
```

**C'est tout !** Pour un test rapide, les valeurs par défaut suffisent.

---

## 🗄️ Base de Données (1 min)

### Option A : SQLite (RAPIDE - Test uniquement)

**⚡ Le plus rapide pour tester** :

```bash
# Modifier .env
# Remplacez DATABASE_URL par:
# DATABASE_URL="file:./dev.db"
```

**⚠️ Limitation** : SQLite ne supporte pas toutes les fonctionnalités (arrays, JSON, etc.)

### Option B : Neon (Recommandé - Cloud gratuit)

**5 minutes de setup, gratuit, en production** :

1. Créez un compte : https://neon.tech
2. Créez un projet PostgreSQL
3. Copiez la `DATABASE_URL`
4. Collez dans `.env`

```env
DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/dbname?sslmode=require"
```

### Option C : Docker PostgreSQL (Local)

```bash
# Lancer PostgreSQL en 30 secondes
docker run --name invitation-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=invitation \
  -p 5432:5432 \
  -d postgres:14

# Mettre à jour .env
DATABASE_URL="postgresql://postgres:password@localhost:5432/invitation"
```

---

## 🛠️ Initialisation (1 min)

```bash
# Générer le client Prisma
npm run db:generate

# Appliquer les migrations
npm run db:migrate

# Charger les données de démo
npm run db:seed
```

**✅ Résultat** : Vous aurez :
- 1 compte admin
- 1 événement de démo ("Soirée Partenaires 2026")
- 10 invités de test
- Plusieurs RSVP exemples

**📋 Notez** : Les tokens invités sont affichés dans la console !

---

## 🎯 Lancement (30 sec)

```bash
# Lancer l'application
npm run dev
```

**🎉 C'est prêt !**
- Application : http://localhost:3000
- Admin : http://localhost:3000/admin

---

## 🧪 Tester l'Application

### 1. Dashboard Admin (1 min)

Allez sur http://localhost:3000/admin

**Vous verrez** :
- L'événement de démo
- 10 invités
- Statistiques en temps réel
- Graphiques de réponses

**Testez** :
- Cliquez sur l'événement
- Voyez la liste des invités
- Consultez les statistiques

### 2. Parcours Invité (2 min)

**Récupérez un token** :
- Dans la console (après le seed)
- Ou copiez depuis `/admin/events/[id]/guests`

**Visitez** : http://localhost:3000/guest/[TOKEN]

**Remplissez le formulaire RSVP** :
1. Je participe : Oui/Non
2. Accompagnants : +1
3. Repas : Végétarien
4. Allergies : (optionnel)
5. Accessibilité : (optionnel)
6. Consentement photos : Oui
7. Confirmation : Voir le récap

**✅ Email de confirmation envoyé** (visible dans les logs)

### 3. Créer un Événement (3 min)

**Allez sur** : http://localhost:3000/admin/events/new

**Remplissez** :
- Nom : "Test Event"
- Slug : "test-event"
- Date : (choisissez une date)
- Lieu : "Paris"

**Configurez RSVP** :
- Deadline : Dans 1 mois
- Autoriser +1 : Oui
- Max +1 : 2
- Repas : Oui
- Options : Végétarien, Vegan, Sans gluten

**Créez** → L'événement est créé !

### 4. Importer des Invités (2 min)

**Créez un fichier CSV** `invites.csv` :
```csv
firstName,lastName,email,company,tags
Alice,Martin,alice@example.com,Weevup,VIP
Bob,Dupont,bob@example.com,TechCorp,Partner
```

**Importez** :
1. Allez sur `/admin/events/[id]/guests`
2. Cliquez "Import CSV"
3. Uploadez le fichier
4. Les invités sont créés avec tokens !

---

## 📧 Tester les Emails (Optionnel)

### Option 1 : Ethereal (Email de test - Gratuit)

1. Visitez : https://ethereal.email/
2. Créez un compte test (1 clic)
3. Copiez les credentials SMTP

**Ajoutez dans `.env`** :
```env
SMTP_HOST="smtp.ethereal.email"
SMTP_PORT="587"
SMTP_USER="votre.user@ethereal.email"
SMTP_PASSWORD="votre-password"
SMTP_SECURE="false"
```

4. Redémarrez : `npm run dev`
5. Envoyez une invitation test
6. Consultez sur Ethereal : Les emails y apparaissent !

### Option 2 : Resend (Production - 100 emails/jour gratuits)

1. Créez un compte : https://resend.com/signup
2. Ajoutez votre domaine (ou utilisez le sandbox)
3. Créez une API Key

**Ajoutez dans `.env`** :
```env
EMAIL_PROVIDER="resend"
RESEND_API_KEY="re_votre_cle"
EMAIL_FROM="onboarding@resend.dev"
```

4. Redémarrez et testez !

---

## 🎨 Parcourir l'Application

### Pages Admin

- **Dashboard** : http://localhost:3000/admin
  - Vue d'ensemble des événements
  - Statistiques globales

- **Événements** : http://localhost:3000/admin/events/[id]
  - Gestion des invités
  - Envoi d'emails
  - Analytics

- **Créer** : http://localhost:3000/admin/events/new
  - Formulaire complet
  - Configuration RSVP

- **Système** : http://localhost:3000/admin/system
  - Status de la base de données
  - Diagnostics

### Pages Publiques

- **Accueil** : http://localhost:3000
  - Landing page

- **Showcase** : http://localhost:3000/event/[slug]
  - Page publique de l'événement
  - Personnalisable (thème, couleurs, sections)

- **RSVP** : http://localhost:3000/guest/[token]
  - Formulaire invité personnalisé
  - 7 étapes

---

## 🔧 Commandes Utiles

### Développement
```bash
npm run dev              # Lancer en dev
npm run build            # Builder l'app
npm start                # Lancer le build
```

### Base de données
```bash
npm run db:generate      # Générer Prisma Client
npm run db:migrate       # Appliquer migrations
npm run db:push          # Push schema (dev)
npm run db:studio        # Ouvrir Prisma Studio (GUI)
npm run db:seed          # Seed données de base
npm run db:seed:demo     # Seed événement complet
```

### Prisma Studio (GUI Base de données)
```bash
npm run db:studio
```
Ouvre sur http://localhost:5555 - Interface graphique pour explorer les données !

---

## 🐛 Problèmes Courants

### Erreur : "Prisma Client not found"

```bash
npm run db:generate
```

### Erreur : "Cannot connect to database"

**Vérifiez** :
- PostgreSQL est lancé (si Docker : `docker ps`)
- `DATABASE_URL` est correct dans `.env`
- Testez la connexion :
  ```bash
  psql "postgresql://user:pass@host:5432/db"
  ```

### Erreur : "Port 3000 already in use"

**Changez le port** :
```bash
PORT=3001 npm run dev
```

### Emails ne s'envoient pas

**Vérifiez** :
- Credentials SMTP dans `.env`
- Ethereal est configuré
- Regardez les logs de la console

---

## 📚 Prochaines Étapes

Maintenant que vous avez testé en local :

1. **Explorez les fonctionnalités** :
   - Créez plusieurs événements
   - Testez le parcours complet RSVP
   - Essayez les différents templates email

2. **Lisez la documentation complète** :
   - [README.md](README.md) - Guide complet
   - [TUTORIELS.md](TUTORIELS.md) - Tous les cas d'usage
   - [GUIDE-PRE-DEPLOIEMENT.md](GUIDE-PRE-DEPLOIEMENT.md) - Déployer en prod

3. **Déployez en production** :
   - [DEPLOIEMENT-VERCEL.md](DEPLOIEMENT-VERCEL.md) - Guide Vercel
   - [GUIDE-PRE-DEPLOIEMENT.md](GUIDE-PRE-DEPLOIEMENT.md) - Checklist

4. **Personnalisez** :
   - Modifiez les templates email
   - Personnalisez les couleurs
   - Ajoutez votre logo

---

## ⏱️ Récap Chrono

| Étape | Temps | Commandes |
|-------|-------|-----------|
| Clone & Install | 2 min | `git clone` + `npm install` |
| Config `.env` | 30 sec | `cp .env.example .env` |
| Setup DB | 1 min | `npm run db:generate` + `db:migrate` + `db:seed` |
| Lancement | 30 sec | `npm run dev` |
| **TOTAL** | **~5 min** | ✅ Application fonctionnelle ! |

---

## 🎉 Félicitations !

Vous avez une application d'invitation complète qui tourne en local !

**Prêt pour la production ?** → [Guide Pré-Déploiement](GUIDE-PRE-DEPLOIEMENT.md)

**Questions ?** → [README.md](README.md) ou [Issues GitHub](https://github.com/Weevup/invitation/issues)

---

<div align="center">

**Fait avec ❤️ par [Weevup](https://weevup.com)**

⭐ Si ce projet vous plaît, donnez-lui une étoile sur GitHub !

</div>
