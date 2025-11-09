# 🎭 Jeux de Démonstration - Guide Complet

Ce dossier contient plusieurs scripts de seed pour générer différents types d'événements de démonstration.

## 📋 Scripts Disponibles

### 🎯 Script Complet (Recommandé pour les démos)

```bash
npm run db:seed:demo:all
```

**Génère TOUT en un seul clic** :
- ✅ 2 utilisateurs admin (contact@weevup.com, demo@weevup.com)
- ✅ 1 intégration email SendGrid configurée
- ✅ 4 templates d'email professionnels
- ✅ **5 événements variés** :
  - Tech Summit 2025 (conférence)
  - 10 ans de Weevup (soirée anniversaire)
  - Mariage Julie & Thomas (mariage)
  - Gala de Charité (gala)
  - Workshop Leadership (formation)
- ✅ ~70 invités au total avec réponses RSVP variées
- ✅ Données réalistes et cohérentes

**Idéal pour** : Démos clients, screenshots, tests complets de la plateforme

---

### 🎉 Scripts Individuels

Chaque script peut être exécuté indépendamment pour générer un type d'événement spécifique.

#### 1️⃣ Tech Summit 2025 - Conférence Technologique

```bash
npm run db:seed:demo
```

**Contenu** :
- 📅 **Date** : 15-16 Mai 2025
- 📍 **Lieu** : Palais des Congrès de Paris
- 👥 **50 invités** : VIP, Speakers, Sponsors, Participants
- ✨ **Features** : Programme 2 jours, showcase complet, speakers, sponsors, FAQ
- 📊 **Données** : 200+ email logs, RSVPs variés, check-ins

**Type d'événement** : Conférence professionnelle
**Idéal pour** : Tester les fonctionnalités événementielles corporate

---

#### 2️⃣ 10 ans de Weevup - Soirée Anniversaire

```bash
npm run db:seed:weevup
```

**Contenu** :
- 📅 **Date** : 20 Juin 2025
- 📍 **Lieu** : Molitor Paris
- 👥 **10 invités** : Clients, Partenaires, VIP, Presse, Staff
- ✨ **Features** : Programme soirée, liens d'invitation individuels
- 📊 **Données** : 1 RSVP exemple déjà confirmé

**Type d'événement** : Soirée d'entreprise
**Idéal pour** : Tester le workflow basique d'invitations

---

#### 3️⃣ Mariage Julie & Thomas - Événement Privé

```bash
npm run db:seed:demo:wedding
```

**Contenu** :
- 📅 **Date** : 12 Juillet 2025
- 📍 **Lieu** : Château de Vaux-le-Vicomte
- 👥 **24 invités** : Famille (côté mariée/marié), Amis, Témoins
- ✨ **Features** : Showcase romantique, FAQ mariage, timeline détaillée
- 📊 **Données** : RSVPs familiaux, choix de repas, accompagnateurs
- 🎨 **Style** : Palette or et crème, thème élégant

**Type d'événement** : Mariage privé
**Idéal pour** : Tester les invitations personnelles et gestion familiale

**Tags utilisés** : Famille, Parents, Témoin, Amis, Côté mariée/marié, Enfance, Université, Travail

---

#### 4️⃣ Gala de Charité - Événement Haut de Gamme

```bash
npm run db:seed:demo:gala
```

**Contenu** :
- 📅 **Date** : 25 Septembre 2025
- 📍 **Lieu** : Hôtel de Ville de Paris
- 👥 **21 invités VIP** : Grands donateurs, Sponsors, Presse, Personnalités
- ✨ **Features** : Showcase prestige, sponsors (Platinum/Gold/Silver), FAQ fundraising
- 📊 **Données** : Menu prestige, dress code black tie
- 🎨 **Style** : Palette bleu royal, thème élégant et formel
- 💰 **Fundraising** : Calcul impact estimé à 500€/personne

**Type d'événement** : Gala caritatif
**Idéal pour** : Tester les fonctionnalités premium et sponsors

**Tags utilisés** : VIP, Grand Donateur, Sponsor, Mécène, Presse, Ambassadeur, Célébrité

---

#### 5️⃣ Workshop Leadership - Formation Professionnelle

```bash
npm run db:seed:demo:workshop
```

**Contenu** :
- 📅 **Date** : 10 Avril 2025
- 📍 **Lieu** : Station F, Paris
- 👥 **20 participants** : CEOs, CTOs, Managers, Project Managers
- ✨ **Features** : Programme de formation détaillé, speakers experts, limite de 25 places
- 📊 **Données** : Aucun accompagnateur (formation), calcul places restantes
- 🎨 **Style** : Palette verte, thème professionnel
- 📜 **Certifications** : Certificat de participation

**Type d'événement** : Workshop / Formation
**Idéal pour** : Tester les événements éducatifs avec places limitées

**Tags utilisés** : CEO, CTO, Manager, Product, Tech, Startup, Entrepreneur

---

## 🎯 Comparaison des Scripts

| Script | Événements | Invités | Complexité | Temps d'exécution | Use Case Principal |
|--------|-----------|---------|------------|-------------------|-------------------|
| **demo:all** | 5 | ~70 | ⭐⭐⭐⭐⭐ | ~30s | Démo complète client |
| **demo** (Tech Summit) | 1 | 50 | ⭐⭐⭐⭐ | ~15s | Événement corporate complet |
| **weevup** | 1 | 10 | ⭐ | ~5s | Test rapide basique |
| **demo:wedding** | 1 | 24 | ⭐⭐⭐ | ~8s | Événement privé/familial |
| **demo:gala** | 1 | 21 | ⭐⭐⭐ | ~8s | Événement premium/VIP |
| **demo:workshop** | 1 | 20 | ⭐⭐ | ~7s | Formation/éducatif |

---

## 📊 Détails Techniques

### Données Générées par Script

#### `seed-demo-all.ts`
- **Utilisateurs** : 2 admins
- **Événements** : 5
- **Invités** : ~70 (répartis sur tous les événements)
- **Templates** : 4 (Save the Date, Invitation, Reminder, Confirmation)
- **Intégration** : 1 SendGrid
- **RSVPs** : Mixte (confirmés, déclinés, en attente)

#### `seed-demo.ts` (Tech Summit)
- **Utilisateurs** : 1 admin
- **Événements** : 1
- **Invités** : 50
- **Email Logs** : ~200+
- **Email Trackings** : ~100
- **Check-ins** : ~15
- **Templates** : 4 détaillés avec HTML complet
- **Showcase** : Complet (speakers, sponsors, gallery, FAQ, timeline, video)

#### `seed-weevup.ts`
- **Utilisateurs** : 1 admin
- **Événements** : 1
- **Invités** : 10
- **RSVPs** : 1 exemple
- **Features** : Génération de tokens d'invitation + URLs

#### `seed-demo-wedding.ts`
- **Utilisateurs** : 1 admin
- **Événements** : 1 (mariage)
- **Invités** : 24
- **RSVPs** : ~18-20
- **Showcase** : Thème romantique or/crème
- **FAQ** : 6 questions spécifiques mariage

#### `seed-demo-gala.ts`
- **Utilisateurs** : 1 admin
- **Événements** : 1 (gala)
- **Invités** : 21 VIP
- **RSVPs** : ~16-18
- **Sponsors** : 4 (multi-tiers)
- **Impact** : Calcul fundraising

#### `seed-demo-workshop.ts`
- **Utilisateurs** : 1 admin
- **Événements** : 1 (formation)
- **Invités** : 20 professionnels
- **RSVPs** : ~14-16
- **Speakers** : 3 experts
- **Limite** : 25 places

---

## 🚀 Workflow Recommandé

### Pour une démo client complète :
```bash
# 1. Nettoyer et générer TOUT
npm run db:seed:demo:all

# 2. Démarrer le serveur
npm run dev

# 3. Accéder aux showcases
http://localhost:3000/events/tech-summit-2025
http://localhost:3000/events/weevup-10-ans
http://localhost:3000/events/mariage-julie-thomas
http://localhost:3000/events/gala-charite-2025
http://localhost:3000/events/workshop-leadership-2025

# 4. Accéder au dashboard admin
http://localhost:3000/admin
```

### Pour tester un type d'événement spécifique :
```bash
# Exemple : Tester uniquement le mariage
npm run db:seed:demo:wedding
npm run dev
```

### Pour développer une nouvelle fonctionnalité :
```bash
# Utiliser le script minimal pour des tests rapides
npm run db:seed:weevup
```

---

## ⚙️ Customisation

Tous les scripts utilisent la même structure :
- `generateToken()` : Génère des tokens sécurisés pour les invitations
- `hashToken()` : Hash les tokens pour la base de données
- Données réalistes avec noms français authentiques
- Tags pertinents par type d'événement
- Distribution statistique cohérente des RSVPs

### Modifier un script

Pour personnaliser les données, éditez le fichier `.ts` correspondant :

```typescript
// Exemple : Ajouter un invité au mariage
const guests = [
  // ... invités existants
  {
    firstName: 'Nouveau',
    lastName: 'Invité',
    email: 'nouveau@email.com',
    tags: ['Famille', 'Côté mariée'],
    attending: true,
    plusOnes: 1,
    meal: 'Menu Adulte (Foie gras, Boeuf, Fraisier)'
  }
]
```

---

## 🐛 Dépannage

### Erreur : `@prisma/client did not initialize`
```bash
npx prisma generate
npm run db:seed:demo:all
```

### Erreur de connexion base de données
Vérifiez votre `.env` :
```
DATABASE_URL="postgresql://user:password@localhost:5432/invitation_db"
```

### Script trop long
Si un script prend trop de temps, vérifiez :
- La connexion à votre base de données
- Les index Prisma sont bien créés
- Utilisez un script plus simple pour les tests (`weevup`)

---

## 📝 Logs et Statistiques

Chaque script affiche en fin d'exécution :
- ✅ Nombre d'événements créés
- 👥 Nombre d'invités par événement
- 📊 Statistiques RSVP (confirmés, déclinés, en attente)
- 🔗 URLs des showcases
- 📧 Statistiques emails (pour le script complet)

---

## 🎨 Types d'Événements par Secteur

| Secteur | Script Recommandé | Variante |
|---------|------------------|----------|
| **Corporate B2B** | `demo` ou `demo:workshop` | Conférence / Formation |
| **Événementiel Privé** | `demo:wedding` | Mariage / Anniversaire |
| **Associations / ONG** | `demo:gala` | Fundraising / Gala |
| **Startups / Tech** | `weevup` ou `demo` | Launch party / Summit |
| **Éducation** | `demo:workshop` | Formation / Séminaire |

---

## 📚 Fichiers Associés

- `seed-demo-all.ts` - Script master (tous les événements)
- `seed-demo.ts` - Tech Summit (événement complet)
- `seed-weevup.ts` - 10 ans Weevup (événement simple)
- `seed-demo-wedding.ts` - Mariage (événement privé)
- `seed-demo-gala.ts` - Gala (événement premium)
- `seed-demo-workshop.ts` - Workshop (événement éducatif)
- `README-DEMO.md` - Documentation du script Tech Summit
- `README-DEMOS.md` - Ce fichier (guide complet)

---

## 🔄 Mise à Jour

Pour régénérer les données de démonstration :

```bash
# Supprimer toutes les données et tout régénérer
npm run db:seed:demo:all

# Ou ajouter un nouvel événement sans toucher aux existants
# (éditer le script pour utiliser upsert au lieu de create)
```

---

## 🎯 Prochaines Étapes

Après avoir généré vos données de démo :

1. **Testez les showcases** - Visitez chaque URL d'événement
2. **Testez le dashboard admin** - Gérez les invités et RSVPs
3. **Testez les invitations** - Utilisez les tokens générés
4. **Testez les emails** - Vérifiez les templates
5. **Prenez des screenshots** - Pour la documentation

---

**Créé avec ❤️ pour Weevup Invitation Manager**

Besoin d'aide ? Consultez la documentation principale ou contactez l'équipe de développement.
