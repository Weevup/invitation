# 🎓 Tutoriels Complets - Invitation Manager

Guide d'utilisation détaillé avec tous les cas d'usage.

---

## 📚 Table des Matières

1. [Créer votre Premier Événement](#1-créer-votre-premier-événement)
2. [Gérer les Invités](#2-gérer-les-invités)
3. [Envoyer des Invitations](#3-envoyer-des-invitations)
4. [Suivre les Réponses (RSVP)](#4-suivre-les-réponses-rsvp)
5. [Personnaliser la Page Showcase](#5-personnaliser-la-page-showcase)
6. [Check-in le Jour J](#6-check-in-le-jour-j)
7. [Analytics & Rapports](#7-analytics--rapports)
8. [Cas d'Usage Avancés](#8-cas-dusage-avancés)

---

## 1. Créer votre Premier Événement

### Étape 1 : Accéder au Dashboard

1. Ouvrez http://localhost:3000/admin (ou votre URL de production)
2. Vous verrez la liste des événements

### Étape 2 : Créer un Nouvel Événement

**Cliquez sur** : "Créer un événement" ou allez sur `/admin/events/new`

### Étape 3 : Remplir les Informations de Base

#### Informations Générales

```
Nom de l'événement : Soirée Annuelle Partenaires 2025
Slug : soiree-partenaires-2025
Description : Une soirée exceptionnelle pour célébrer nos partenaires
Date de début : 15/06/2025 19:00
Date de fin : 15/06/2025 23:59
```

#### Lieu

```
Nom du lieu : Le Grand Palais
Adresse : Avenue Winston Churchill
Ville : Paris
Pays : France
Code vestimentaire : Tenue de soirée
```

#### Image de Couverture

- URL d'image : `https://images.unsplash.com/photo-1511795409834-ef04bbd61622`
- Ou uploadez depuis votre ordinateur (si configuré)

### Étape 4 : Configurer le RSVP

#### Paramètres de Réponse

```
Date limite de réponse : 01/06/2025
Autoriser les accompagnants : ✅ Oui
Nombre maximum d'accompagnants : 2
```

#### Options de Repas

```
Repas requis : ✅ Oui
Options :
  - Viande
  - Poisson
  - Végétarien
  - Vegan
  - Sans gluten
```

### Étape 5 : Fonctionnalités Additionnelles

```
Transport : ✅ Oui (permettre aux invités d'indiquer leurs besoins)
Hébergement : ✅ Oui (proposer des hôtels partenaires)
Accessibilité : ✅ Oui (recueillir les besoins spécifiques)
Consentement photos : ✅ Oui (demander l'autorisation)
```

### Étape 6 : Créer l'Événement

- Cliquez sur "Créer l'événement"
- ✅ Événement créé !
- Vous êtes redirigé vers la page de gestion

---

## 2. Gérer les Invités

### Méthode A : Ajout Manuel

**Accédez à** : `/admin/events/[id]/guests`

**Cliquez sur** : "Ajouter un invité"

**Remplissez** :
```
Prénom : Marie
Nom : Dubois
Email : marie.dubois@example.com
Entreprise : TechCorp
Tags : VIP, Board Member
```

**Validez** → L'invité est créé avec un token unique !

### Méthode B : Import CSV (Recommandé)

#### Format CSV

Créez un fichier `invites.csv` :

```csv
firstName,lastName,email,company,tags
Marie,Dubois,marie@example.com,TechCorp,"VIP,Board"
Pierre,Martin,pierre@example.com,InnovCorp,Partner
Sophie,Bernard,sophie@example.com,DataCorp,"VIP,Speaker"
Thomas,Petit,thomas@example.com,CloudCorp,Guest
```

**Notes importantes** :
- Header obligatoire : `firstName,lastName,email,company,tags`
- Tags multiples : Utilisez des guillemets et séparez par des virgules
- Email unique par événement (pas de doublons)

#### Importer le CSV

1. **Allez sur** : `/admin/events/[id]/guests`
2. **Cliquez sur** : "Importer CSV"
3. **Sélectionnez** votre fichier
4. **Vérifiez** le preview
5. **Confirmez** l'import

**✅ Résultat** :
- Tous les invités sont créés
- Tokens générés automatiquement
- Statut : "PENDING"

### Méthode C : Export/Modification/Re-import

1. **Exportez** la liste actuelle (bouton "Exporter CSV")
2. **Modifiez** dans Excel/Google Sheets
3. **Ajoutez** de nouvelles lignes
4. **Re-importez** le fichier modifié

---

## 3. Envoyer des Invitations

### Étape 1 : Configuration Email

#### Option A : Resend (Recommandé)

**Configuration dans Vercel ou `.env`** :
```env
EMAIL_PROVIDER="resend"
RESEND_API_KEY="re_votre_cle_api"
EMAIL_FROM="noreply@votredomaine.com"
EMAIL_FROM_NAME="Weevup Events"
```

#### Option B : SendGrid

```env
EMAIL_PROVIDER="sendgrid"
SENDGRID_API_KEY="SG.votre_cle_api"
EMAIL_FROM="noreply@votredomaine.com"
EMAIL_FROM_NAME="Weevup Events"
```

### Étape 2 : Sélectionner les Destinataires

**Allez sur** : `/admin/events/[id]/emails`

**Filtrez** (optionnel) :
- Par statut : PENDING, INVITED, RESPONDED
- Par tags : VIP, Partner, Speaker
- Par entreprise

**Sélectionnez** :
- Tous les invités : Cochez la case en haut
- Sélection manuelle : Cochez individuellement

### Étape 3 : Choisir le Template

**3 templates disponibles** :

#### 1. Invitation (Gradient Violet)
- Utilisation : Premier envoi, inviter à l'événement
- Contenu : Détails de l'événement, lien RSVP

#### 2. Confirmation (Vert/Bleu + QR Code)
- Utilisation : Après réponse positive
- Contenu : Récapitulatif, QR code d'accès, infos pratiques

#### 3. Reminder (Orange)
- Utilisation : Relance pour non-répondants
- Contenu : Rappel de la deadline, lien RSVP

### Étape 4 : Personnaliser l'Email (Optionnel)

Avant d'envoyer, vous pouvez :
- Modifier le sujet
- Ajouter un message personnalisé
- Prévisualiser l'email

### Étape 5 : Envoyer

**Options d'envoi** :

#### Envoi Immédiat
- Cliquez sur "Envoyer maintenant"
- Confirmation : "X emails seront envoyés"
- Validez

#### Envoi Programmé (À venir)
- Sélectionnez une date/heure
- Programmez l'envoi

**✅ Résultat** :
- Emails envoyés en masse (rate limited : 10/seconde)
- Statut des invités : PENDING → INVITED
- Logs créés dans `EmailLog`
- Tracking activé (ouverture, clic)

### Étape 6 : Suivi des Emails

**Tableau de bord email** : `/admin/events/[id]/emails/tracking`

**Vous verrez** :
- ✅ Envoyés : 150
- 📖 Ouverts : 120 (80%)
- 🖱️ Cliqués : 95 (63%)
- ❌ Bounces : 2 (1.3%)
- ⏳ En attente : 3

---

## 4. Suivre les Réponses (RSVP)

### Parcours Invité (du point de vue de l'invité)

#### Étape 1 : Réception de l'Email

L'invité reçoit :
- Email d'invitation personnalisé
- Lien unique : `https://votre-app.com/guest/[TOKEN]`

#### Étape 2 : Clic sur le Lien

- Token validé automatiquement
- Accès à la page RSVP personnalisée
- Formulaire pré-rempli (nom, email)

#### Étape 3 : Formulaire RSVP (7 Étapes)

##### Étape 1 : Participation
```
🎉 Allez-vous participer ?
○ Oui, je serai présent(e)
○ Non, je ne pourrai pas venir
```

##### Étape 2 : Accompagnants (si autorisé)
```
👥 Combien d'accompagnants ?
○ Aucun (juste moi)
○ +1
○ +2
```

##### Étape 3 : Repas (si requis)
```
🍽️ Choix de repas
○ Viande
○ Poisson
● Végétarien

📝 Allergies ou régimes spéciaux ?
[Textarea]
```

##### Étape 4 : Accessibilité
```
♿ Besoins d'accessibilité
[Textarea: "J'ai besoin d'un accès PMR"]
```

##### Étape 5 : Transport & Hébergement
```
🚗 Avez-vous besoin d'informations sur le transport ?
● Oui

🏨 Avez-vous besoin d'informations sur l'hébergement ?
○ Non
```

##### Étape 6 : Consentement Photos
```
📸 Autorisez-vous la prise de photos ?
● Oui, j'autorise
○ Non, je ne souhaite pas
```

##### Étape 7 : Récapitulatif
```
✅ Récapitulatif de votre réponse

Participation : Oui
Accompagnants : +1
Repas : Végétarien (x2)
Allergies : Aucune
Accessibilité : Accès PMR nécessaire
Transport : Informations demandées
Hébergement : Non
Photos : Autorisées

[Bouton : Confirmer ma réponse]
```

#### Étape 4 : Confirmation

- Email de confirmation envoyé
- QR code d'accès inclus
- Récapitulatif complet

**L'invité peut** :
- Télécharger le récap en PDF
- Ajouter l'événement au calendrier
- Modifier sa réponse (avec le même token)

### Suivi Administrateur

**Dashboard RSVP** : `/admin/events/[id]/rsvps`

**Vue d'ensemble** :
```
📊 Statistiques
- Invités : 200
- Ont répondu : 150 (75%)
- Présents : 120 (80% des réponses)
- Absents : 30 (20% des réponses)
- En attente : 50 (25%)

👥 Accompagnants
- Total : 45
- +1 : 35
- +2 : 10

🍽️ Repas
- Viande : 60
- Poisson : 40
- Végétarien : 25
- Vegan : 10
- Sans gluten : 5
```

**Liste détaillée** :
| Nom | Statut | Réponse | +1 | Repas | Date Réponse |
|-----|--------|---------|----|----|--------------|
| Marie Dubois | ✅ RESPONDED | Présent | +2 | Végétarien | 15/05/2025 |
| Pierre Martin | ✅ RESPONDED | Absent | - | - | 16/05/2025 |
| Sophie Bernard | ⏳ INVITED | - | - | - | - |

**Actions disponibles** :
- Filtrer par statut
- Exporter en CSV/PDF
- Envoyer des relances ciblées
- Modifier manuellement une réponse

---

## 5. Personnaliser la Page Showcase

### Accès à la Configuration

**Allez sur** : `/admin/events/[id]/showcase`

### Section 1 : Informations Générales

```
✅ Page showcase activée

Titre : Soirée Annuelle Partenaires 2025
Sous-titre : Une soirée inoubliable pour célébrer ensemble

Image bannière :
[Upload] ou [URL]
```

### Section 2 : Thème & Couleurs

#### Thèmes Prédéfinis

```
● Weevup (par défaut)
○ Elegant (minimaliste blanc/noir)
○ Modern (coloré et dynamique)
○ Minimal (épuré)
```

#### Couleurs Personnalisées

```
Couleur primaire : #004645 (Bleu canard)
Couleur secondaire : #FF4713 (Orange)
Couleur d'accent : #009197 (Turquoise)
```

#### CSS Personnalisé (Avancé)

```css
/* Personnalisation avancée */
.showcase-hero {
  background: linear-gradient(135deg, #004645 0%, #009197 100%);
}

.showcase-title {
  font-family: 'Playfair Display', serif;
}
```

### Section 3 : Sections de Contenu

#### Section Hero (Bannière)

```
Type : Hero
Titre : Bienvenue à notre soirée
Description : Rejoignez-nous pour une soirée exceptionnelle
Layout : Full width
Image : [banner.jpg]
Afficher le bouton RSVP : ✅ Oui
```

#### Section Programme

```
Type : Timeline
Titre : Programme de la soirée

Timeline :
  19:00 - Accueil & Cocktail
  20:00 - Dîner
  21:30 - Discours & Remises de prix
  22:00 - DJ Set & Dancing
  23:59 - Fin de soirée

Layout : Container
Couleur de fond : #f8f9fa
```

#### Section Intervenants (Speakers)

```
Type : Speakers
Titre : Nos intervenants

Speakers :
  1. Marie Dubois
     Titre : CEO TechCorp
     Bio : Pionnière de l'innovation technologique
     Photo : [marie.jpg]

  2. Pierre Martin
     Titre : CTO InnovCorp
     Bio : Expert en intelligence artificielle
     Photo : [pierre.jpg]

Layout : Grid (3 colonnes)
```

#### Section Galerie

```
Type : Gallery
Titre : Éditions précédentes

Images :
  - [event-2023-1.jpg]
  - [event-2023-2.jpg]
  - [event-2024-1.jpg]
  - [event-2024-2.jpg]

Layout : Grid masonry
Lightbox : ✅ Oui
```

#### Section FAQ

```
Type : FAQ
Titre : Questions fréquentes

Questions :
  Q : Comment accéder au lieu ?
  R : Le Grand Palais est accessible en métro (ligne 1, station Champs-Élysées)

  Q : Y a-t-il un parking ?
  R : Oui, un parking est disponible au sous-sol (places limitées)

  Q : Quel est le code vestimentaire ?
  R : Tenue de soirée exigée

Layout : Accordion
```

#### Section Partenaires/Sponsors

```
Type : Sponsors
Titre : Nos partenaires

Sponsors :
  - Nom : TechCorp
    Logo : [techcorp-logo.svg]
    URL : https://techcorp.com
    Niveau : Platinum

  - Nom : InnovCorp
    Logo : [innovcorp-logo.svg]
    URL : https://innovcorp.com
    Niveau : Gold

Layout : Grid (4 colonnes)
Afficher les niveaux : ✅ Oui
```

### Section 4 : Fonctionnalités

```
✅ Compte à rebours (afficher les jours restants)
✅ Partage sur réseaux sociaux
✅ Bouton RSVP flottant
□ Vidéo d'introduction (YouTube/Vimeo)
```

### Section 5 : Aperçu & Publication

- **Aperçu** : Voir la page en temps réel
- **Publier** : Rendre la page accessible publiquement
- **URL** : `https://votre-app.com/event/soiree-partenaires-2025`

---

## 6. Check-in le Jour J

### Préparation (Avant l'événement)

#### Équipement Nécessaire

- Tablettes ou smartphones (iOS/Android)
- Application de scan QR code (intégrée au navigateur)
- Connexion Internet stable
- Liste de secours (CSV/PDF)

#### Configuration

**Accédez à** : `/admin/events/[id]/checkin`

**Options** :
```
✅ Check-in activé
Bureaux d'accueil :
  - Entrée Principale (Bureau A)
  - Entrée VIP (Bureau B)

Options :
✅ Scanner les QR codes
✅ Recherche manuelle par nom
✅ Badge de secours (si QR manquant)
```

### Utilisation le Jour J

#### Méthode 1 : Scan QR Code (Rapide)

1. **L'invité présente** son QR code (email de confirmation)
2. **Scannez** avec la tablette
3. **Validation** automatique :
   - ✅ Nom + Photo (si configuré)
   - ✅ Nombre d'accompagnants
   - ✅ Repas
   - ✅ Notes spéciales (accessibilité, etc.)
4. **Confirmez** : "Bienvenue [Nom] !"

**⏱️ Durée** : ~5 secondes par invité

#### Méthode 2 : Recherche Manuelle

Si l'invité n'a pas son QR code :

1. **Recherchez** par nom ou email
2. **Vérifiez** l'identité
3. **Check-in manuel**
4. **Imprimez** un badge de secours (optionnel)

**⏱️ Durée** : ~30 secondes

#### Méthode 3 : Liste Papier (Secours)

En cas de problème technique :

1. **Exportez** la liste avant l'événement (CSV/PDF)
2. **Imprimez** avec cases à cocher
3. **Cochez** manuellement
4. **Synchronisez** après l'événement

### Dashboard Check-in en Temps Réel

**Vue d'ensemble** :
```
📊 Statistiques Live

Attendus : 120
Présents : 87 (72.5%)
Absents : 33 (27.5%)
Non-répondus arrivés : 5

⏱️ Flux d'arrivée
19:00-19:30 : ████████░░ 45
19:30-20:00 : ██████░░░░ 32
20:00-20:30 : ███░░░░░░░ 10

🚪 Par bureau
Entrée Principale : 70
Entrée VIP : 17
```

**Graphique en temps réel** :
- Courbe d'arrivée
- Taux de présence par tranche horaire
- Comparaison avec événements précédents

---

## 7. Analytics & Rapports

### Dashboard Principal

**Accédez à** : `/admin/events/[id]/analytics`

### Métriques Clés

#### Taux de Réponse

```
📊 Invitations envoyées : 200
📧 Emails ouverts : 180 (90%)
🖱️ Liens cliqués : 150 (75%)
✅ Réponses reçues : 140 (70%)

⏱️ Temps moyen de réponse : 3 jours
📅 Tendance : +5% vs événement précédent
```

#### Participations

```
👥 Confirmations : 120 (85% des réponses)
👤 Accompagnants : 45 (+38% personnes)
❌ Refus : 20 (15% des réponses)
⏳ En attente : 60 (30% sans réponse)
```

#### Repas & Logistique

```
🍽️ Répartition des repas
- Viande : 60 (50%)
- Poisson : 30 (25%)
- Végétarien : 20 (17%)
- Vegan : 10 (8%)

Allergies signalées : 15
Besoins accessibilité : 5
Demandes transport : 35
Demandes hébergement : 20
```

### Rapports Exportables

#### Format CSV

**Contenu** :
- Liste complète des invités
- Réponses RSVP
- Repas & allergies
- Check-in status

**Utilisation** :
- Import dans Excel/Google Sheets
- Envoi au traiteur
- Planning des tables

#### Format PDF

**Contenu** :
- Rapport exécutif (1 page)
- Statistiques détaillées (3 pages)
- Graphiques (2 pages)

**Utilisation** :
- Présentation aux stakeholders
- Archivage
- Bilan post-événement

### Analytics Avancés

#### Segmentation

**Par tags** :
```
VIP : 20 invités → 100% réponse → 18 présents
Partners : 50 invités → 90% réponse → 40 présents
Guests : 130 invités → 60% réponse → 62 présents
```

**Par entreprise** :
```
TechCorp : 15 invités → 14 présents (93%)
InnovCorp : 12 invités → 10 présents (83%)
Autres : 93 invités → 76 présents (82%)
```

#### Comparaison Temporelle

```
📈 Évolution vs événements précédents

Taux de réponse :
2023 : 65%
2024 : 70%
2025 : 75% (+5%)

Taux de présence :
2023 : 80%
2024 : 85%
2025 : 87% (+2%)
```

---

## 8. Cas d'Usage Avancés

### Cas 1 : Événement Multi-Sessions

**Exemple** : Conférence sur 2 jours avec workshops

**Configuration** :

1. **Créez un événement parent** : "Tech Conference 2025"
2. **Configurez plusieurs sessions** :
   - Session 1 : Workshop IA (Jour 1 - 9h-12h)
   - Session 2 : Workshop Cloud (Jour 1 - 14h-17h)
   - Session 3 : Keynotes (Jour 2 - 9h-11h)

3. **RSVP par session** :
   - Permettre le choix des sessions
   - Limiter les places par session
   - Gérer les conflits horaires

**Implémentation** :
- Utiliser le champ `tags` pour les sessions
- RSVP personnalisé avec checkboxes
- Dashboard par session

### Cas 2 : Événement avec Billetterie

**Exemple** : Gala de charité avec différents niveaux de tickets

**Configuration** :

1. **Types de tickets** :
   - Standard : 50€
   - VIP : 150€
   - Table (10 places) : 1000€

2. **Intégration Stripe** (Phase 2) :
   - Paiement en ligne sécurisé
   - Confirmation automatique
   - QR code après paiement

3. **Gestion** :
   - Limiter les places par type
   - Code promo
   - Remboursements

### Cas 3 : Événement Récurrent

**Exemple** : Meetup mensuel

**Configuration** :

1. **Créez un template d'événement**
2. **Dupliquez chaque mois** :
   - Modifier la date
   - Réutiliser les invités actifs
   - Tracking des participations

3. **Analytics** :
   - Fidélité (nombre de participations)
   - Taux de récurrence
   - Invités les plus engagés

### Cas 4 : Événement Hybride (Présentiel + Virtuel)

**Exemple** : Conférence avec streaming

**Configuration** :

1. **Type de participation** :
   - Présentiel
   - Virtuel (Zoom/Teams)
   - Les deux

2. **RSVP adapté** :
   - Choix du mode
   - Lien de connexion pour virtuel
   - QR code uniquement pour présentiel

3. **Check-in** :
   - Scanner QR codes (présentiel)
   - Tracking de connexion (virtuel)

### Cas 5 : Événement avec Programme Personnalisé

**Exemple** : Summit avec ateliers à la carte

**Configuration** :

1. **Programme** :
   - 10h-11h : 3 ateliers simultanés
   - 11h-12h : 3 autres ateliers

2. **RSVP** :
   - Choisir 1 atelier par créneau
   - Limiter les places par atelier
   - Validation des choix

3. **Dashboard** :
   - Vue par atelier
   - Optimisation des salles
   - Export pour les animateurs

---

## 🎓 Bonnes Pratiques

### Communication

1. **Timing des envois** :
   - Invitation : 6-8 semaines avant
   - Relance : 3-4 semaines avant (non-répondants)
   - Confirmation : 1 semaine avant (tous)
   - Rappel : 2 jours avant (participants)

2. **Personnalisation** :
   - Utilisez le prénom dans l'objet
   - Segmentez par tags (VIP, Partner)
   - Adaptez le contenu par audience

3. **Follow-up** :
   - Remerciement post-événement
   - Questionnaire de satisfaction
   - Photos de l'événement

### Organisation

1. **Liste d'invités** :
   - Mettez à jour régulièrement
   - Gérez les doublons
   - Validez les emails

2. **RSVP** :
   - Date limite claire et visible
   - Relances automatiques
   - Faciliter les modifications

3. **Jour J** :
   - Testez le check-in la veille
   - Ayez une liste papier de secours
   - Prévoyez plusieurs bureaux d'accueil

### Technique

1. **Base de données** :
   - Sauvegardez régulièrement
   - Testez les migrations
   - Monitorer les performances

2. **Emails** :
   - Testez avant l'envoi en masse
   - Vérifiez les liens
   - Surveillez le taux de bounce

3. **Sécurité** :
   - Générez des secrets forts
   - Activez HTTPS
   - Limitez les accès admin

---

## 📞 Support

**Questions ?**
- Documentation : [README.md](README.md)
- Guide rapide : [GUIDE-DEMARRAGE-RAPIDE.md](GUIDE-DEMARRAGE-RAPIDE.md)
- Déploiement : [GUIDE-PRE-DEPLOIEMENT.md](GUIDE-PRE-DEPLOIEMENT.md)
- Issues : https://github.com/Weevup/invitation/issues

---

<div align="center">

**Fait avec ❤️ par [Weevup](https://weevup.com)**

⭐ Si ce projet vous plaît, donnez-lui une étoile sur GitHub !

</div>
