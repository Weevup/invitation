# Guide de Test Complet - Invitation Manager

Ce guide vous permet de tester l'application de bout en bout avec des données de démo réalistes.

## 🚀 Démarrage Rapide

### 1. Initialiser la base de données

```bash
# Appliquer les migrations
npm run db:migrate

# Générer le client Prisma
npm run db:generate

# Charger les données de démo complètes
npm run db:seed:complete
```

### 2. Lancer l'application

```bash
npm run dev
```

L'application sera disponible sur `http://localhost:3000`

## 📋 Parcours de Test Complet

### A. Parcours Administrateur

#### 1. Accès à l'interface admin
- **URL**: `http://localhost:3000/admin`
- **Compte**: `admin@weevup.com` (créé automatiquement)

**Ce que vous devriez voir:**
- Dashboard avec statistiques de l'événement "Tech Summit 2025"
- 15 invités au total
- 7 confirmations (+ 5 accompagnants = 12 participants)
- 2 refus
- 6 en attente de réponse
- Taux de réponse de 60%

#### 2. Gérer l'événement
- Cliquez sur "Tech Summit 2025"
- Explorez les onglets de la sidebar:
  - **Vue d'ensemble**: Timeline, stats, configuration
  - **Save the Date**: Configuration du teaser
  - **Invitation**: Personnalisation de l'email d'invitation
  - **RSVP**: Configuration du formulaire
  - **Showcase**: Page vitrine publique
  - **Invités**: Liste et gestion des invités
  - **Communications**: Hub d'envoi d'emails

#### 3. Vérifier les invités
**URL**: `/admin/events/[id]/guests`

**Statuts à vérifier:**
- ✅ **7 confirmés** (Sophie Martin, Alexandre Dubois, Camille Bernard, etc.)
  - Certains avec accompagnants
  - Préférences repas variées (Végétarien, Végan, Sans gluten, Halal)
  - Demandes spéciales (transport, accessibilité)

- ❌ **2 refus** (Pierre Leblanc, Emma Fontaine)

- ⏳ **6 en attente** (Nicolas Durand, Amélie Lefebvre, etc.)
  - Liens d'invitation actifs

#### 4. Explorer le Showcase
**URL**: `/admin/events/[id]/showcase`

**Fonctionnalités à tester:**
- Sélection de thème (8 thèmes disponibles, actuellement: "Midnight")
- Sections activées:
  - Hero avec image de couverture
  - Countdown timer
  - Description de l'événement
  - 4 speakers avec photos et bios
  - Timeline de la journée (8 étapes)
  - Galerie de 6 photos
  - 6 sponsors (Platinum, Gold, Silver)
  - FAQ (6 questions/réponses)
  - Détails pratiques
  - CTA d'inscription

**Aperçu en direct:** Cliquez sur "Preview" pour voir la page publique

#### 5. Analyser les emails
**URL**: `/admin/events/[id]/communications`

**Logs d'emails créés:**
- **Save the Date**: Envoyé le 1er juillet 2025
  - 7 ouvertures
- **Invitations**: Envoyées le 1er août 2025
  - 7 ouvertures
  - 7 clics (pour les confirmés)
- **Confirmations**: Envoyées après chaque RSVP
  - 7 confirmations envoyées

#### 6. Suivre les RSVPs
**URL**: `/admin/rsvp`

**Données à vérifier:**
- Liste complète des réponses
- Filtrage par statut (Confirmé/Refusé/En attente)
- Détails:
  - Choix de repas
  - Allergies et restrictions alimentaires
  - Besoins en transport
  - Besoins d'accessibilité
  - Nombre d'accompagnants

#### 7. Exporter les données
- **CSV des invités**: Bouton "Export CSV" sur la page invités
- **Liste des confirmations**: Pour organisation jour J
- **Détails repas**: Pour le traiteur

---

### B. Parcours Invité

#### 1. Tester avec un invité en attente

**Exemple de lien** (généré lors du seed):
```
http://localhost:3000/guest/[TOKEN]
```

**Invités en attente avec lien actif:**
- Nicolas Durand (nicolas.durand@startup.co)
- Amélie Lefebvre (amelie.lefebvre@media.fr)
- David Mercier (david.mercier@invest.com)
- Isabelle Simon (isabelle.simon@agency.com)
- Julien Laurent (julien.laurent@freelance.fr)
- Claire Roux (claire.roux@univ.fr)

**Le script de seed affiche les liens directs** - copiez-en un pour tester.

#### 2. Parcours du formulaire RSVP (7 étapes)

**Étape 1: Participation**
- Question: "Serez-vous des nôtres ?"
- Options: Oui / Non
- Ambiance accueillante avec logo et détails de l'événement

**Étape 2: Accompagnants** (si Oui)
- Combien d'accompagnants ? (0 à 2)
- Pour chaque accompagnant:
  - Prénom
  - Nom
  - Email (optionnel)

**Étape 3: Choix du repas**
- Options:
  - Menu Omnivore
  - Menu Végétarien
  - Menu Végan
  - Menu Sans gluten
  - Menu Halal
  - Menu Casher
- Champ allergies/restrictions

**Étape 4: Préférences diverses**
- **Transport**: Besoin d'aide pour le transport ?
- **Hébergement**: Besoin d'aide pour l'hébergement ?
- **Accessibilité**: Besoins spécifiques PMR ?

**Étape 5: Consentements**
- Photos: Autorisation de prise de photos pendant l'événement
- Checkbox obligatoire

**Étape 6: Récapitulatif**
- Revue de toutes les informations
- Possibilité de revenir en arrière pour modifier
- Bouton de confirmation final

**Étape 7: Confirmation**
- Message de succès avec confettis 🎊
- **QR Code généré automatiquement**
- Instructions pour le jour J
- Email de confirmation envoyé

#### 3. Modifier sa réponse

**Fonctionnalité:**
- Retourner sur le même lien `/guest/[TOKEN]`
- Le formulaire se pré-remplit avec les réponses précédentes
- Possibilité de modifier jusqu'à la deadline (1er septembre)

---

### C. Parcours Page Publique (Showcase)

#### 1. Accéder à la page vitrine
**URL**: `http://localhost:3000/event/tech-summit-2025`

**Cette page est publique** - accessible à tous sans authentification.

#### 2. Sections à vérifier

**Hero Section:**
- Image de couverture fullscreen
- Titre: "Tech Summit 2025"
- Sous-titre: "L'événement tech de l'année"
- Date et lieu bien visibles
- CTA "Je m'inscris"

**Countdown Timer:**
- Compte à rebours en temps réel jusqu'au 15 septembre 2025
- Jours / Heures / Minutes / Secondes

**Description:**
- Texte riche avec émojis
- Programme détaillé
- Mise en forme attractive

**Speakers (4 personnes):**
- Photos (avatars générés)
- Nom, rôle, bio
- Liens LinkedIn/Twitter

**Timeline (8 étapes):**
- Horaire de 9h00 à 17h30
- Chaque étape avec titre et description
- Affichage chronologique élégant

**Galerie:**
- 6 photos en grille
- Lightbox au clic
- Images haute qualité (Unsplash)

**Sponsors:**
- 3 tiers: Platinum (2), Gold (2), Silver (2)
- Logos avec liens
- Organisation par niveau

**FAQ:**
- 6 questions fréquentes
- Accordéon interactif
- Réponses détaillées

**Détails:**
- Carte du lieu
- Adresse complète
- Informations pratiques
- Dress code

**CTA Final:**
- Bouton d'inscription
- Redirection vers formulaire RSVP

#### 3. Tester les 8 thèmes

Dans l'éditeur showcase (`/admin/events/[id]/showcase`), changez le thème:

1. **Modern** (default) - Design épuré et moderne
2. **Elegant** - Sophistiqué avec serif fonts
3. **Bold** - Couleurs vives et contrastes
4. **Minimal** - Ultra minimaliste
5. **Creative** - Artistique et original
6. **Professional** - Corporate et sérieux
7. **Playful** - Fun et dynamique
8. **Midnight** - Sombre et élégant

---

### D. Parcours Check-in (Jour J)

#### 1. Accéder à l'interface check-in
**URL**: `/admin/events/[id]/checkin` (à créer si besoin)

#### 2. Scanner les QR codes
- Chaque participant confirmé a un QR code
- Format: `TECH2025-[ID]`
- Scanner avec appareil mobile ou webcam

#### 3. Vérifier les check-ins
- 7 QR codes générés pour les confirmés
- Statut: Pas encore check-in (avant l'événement)

---

## 🎯 Scénarios de Test Avancés

### Scénario 1: Invité VIP avec +2
**Invité**: Alexandre Dubois (alex.dubois@aifund.com)
- Statut: ✅ Confirmé
- Accompagnants: 2
- Repas: Menu Omnivore
- Particularité: Intolérance au lactose

**Test**:
1. Vérifier dans `/admin/rsvp` que les 2 accompagnants sont comptés
2. Vérifier que la restriction alimentaire est notée
3. Export CSV doit inclure cette info

### Scénario 2: Invité avec accessibilité
**Invité**: Camille Bernard (camille.bernard@startup.io)
- Statut: ✅ Confirmé
- Repas: Menu Végan
- Particularités:
  - Végan
  - Besoin transport
  - Besoin accessibilité PMR

**Test**:
1. Vérifier que les 3 besoins sont enregistrés
2. Export doit permettre d'identifier les besoins spéciaux
3. Planification transport et accessibilité facilitée

### Scénario 3: Invité qui décline
**Invité**: Pierre Leblanc
- Statut: ❌ Refusé

**Test**:
1. Le refus est bien comptabilisé dans les stats
2. Pas de QR code généré
3. Pas d'email de confirmation envoyé

### Scénario 4: Invité en attente de relance
**Invité**: Amélie Lefebvre (presse)
- Statut: ⏳ En attente

**Test**:
1. Envoyer un email de relance (feature à implémenter)
2. Tracking du nouveau lien
3. Délai avant deadline visible

---

## 📊 Métriques à Valider

### Dashboard Admin
- ✅ Nombre total d'invités: **15**
- ✅ Confirmations: **7** (46.7%)
- ✅ Refus: **2** (13.3%)
- ✅ En attente: **6** (40%)
- ✅ Taux de réponse: **60%**
- ✅ Total participants (avec +1): **12**

### Emails
- ✅ Save the Date envoyés: **9** (ceux qui ont répondu)
- ✅ Invitations envoyées: **9**
- ✅ Confirmations envoyées: **7**
- ✅ Taux d'ouverture: **100%** (tous les répondants)
- ✅ Taux de clic: **77.8%** (7/9 confirmés)

### Repas
- Menu Omnivore: 2
- Menu Végétarien: 2
- Menu Végan: 1
- Menu Sans gluten: 1
- Menu Halal: 1

### Besoins spéciaux
- Transport: 4 personnes
- Accessibilité: 1 personne
- Allergies/restrictions: 3 personnes

---

## 🔧 Configuration Requise

### Variables d'environnement (.env)

```env
# Base de données
DATABASE_URL="postgresql://..."

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Email (optionnel pour tests)
EMAIL_PROVIDER="resend"
RESEND_API_KEY="re_..."
EMAIL_FROM="noreply@example.com"
EMAIL_FROM_NAME="Weevup Events"

# Encryption pour les clés API
ENCRYPTION_KEY="your-32-character-encryption-key-here"
```

### Base de données PostgreSQL

```bash
# Avec Docker
docker run --name postgres-invitation \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=invitation \
  -p 5432:5432 \
  -d postgres:16

# Puis dans .env
DATABASE_URL="postgresql://postgres:password@localhost:5432/invitation"
```

---

## ✅ Checklist de Validation

### Fonctionnalités Core
- [ ] Création d'événement
- [ ] Import CSV d'invités
- [ ] Ajout manuel d'invités
- [ ] Configuration RSVP
- [ ] Formulaire RSVP 7 étapes
- [ ] QR codes générés
- [ ] Emails envoyés (si configuré)
- [ ] Tracking ouvertures/clics
- [ ] Showcase public avec 8 thèmes
- [ ] Export CSV
- [ ] Dashboard analytics

### Parcours Complet Invité
- [ ] Réception email invitation
- [ ] Clic sur lien personnalisé
- [ ] Formulaire multi-étapes
- [ ] Choix accompagnants
- [ ] Sélection repas
- [ ] Préférences accessibilité
- [ ] Confirmation avec QR code
- [ ] Possibilité de modifier

### Admin
- [ ] Vue d'ensemble événement
- [ ] Liste invités avec filtres
- [ ] Suivi RSVPs temps réel
- [ ] Logs emails
- [ ] Configuration showcase
- [ ] Export données

### Page Publique
- [ ] Showcase accessible sans auth
- [ ] Tous les thèmes fonctionnels
- [ ] Countdown timer
- [ ] Sections configurables
- [ ] Responsive mobile

---

## 🐛 Problèmes Connus & Solutions

### Emails ne s'envoient pas
**Solution**: Vérifiez que `EMAIL_PROVIDER` et les clés API sont configurées dans `.env`

### QR codes ne s'affichent pas
**Solution**: Vérifiez que la librairie `qrcode` est installée: `npm install qrcode`

### Erreur de migration Prisma
**Solution**:
```bash
npx prisma migrate reset
npm run db:migrate
npm run db:seed:complete
```

### Token expiré
**Solution**: Les tokens du seed expirent le 30 septembre 2025. Ajustez dans `seed-complete.ts` si nécessaire.

---

## 📝 Notes

- Les données de démo sont **idempotentes**: vous pouvez relancer le seed sans créer de doublons
- Les tokens d'invités sont **hashés** en base pour la sécurité
- Les emails ne sont **pas réellement envoyés** sans configuration provider
- Le **showcase est public** - pas besoin d'authentification

---

## 🎓 Pour Aller Plus Loin

### Fonctionnalités à Tester Ensuite
1. Envoi d'emails de relance
2. Bulk edit d'invités
3. Templates d'emails personnalisés
4. Webhooks email providers
5. Analytics avancées
6. Multi-événements
7. Permissions utilisateurs
8. Plan de table

### Améliorations Possibles
- Dark mode
- Export PDF des RSVPs
- Import depuis Eventbrite/Google Forms
- Notifications push admin
- Mobile app pour check-in
- Sondages post-événement

---

**Bon test! 🚀**

Pour toute question: `contact@weevup.com`
