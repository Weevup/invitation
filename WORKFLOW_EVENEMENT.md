# 🎯 Workflow Complet de Gestion d'Événement
## De la création à l'arrivée le Jour J

---

## 📊 Vue d'ensemble

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     CYCLE COMPLET D'UN ÉVÉNEMENT                        │
│                                                                         │
│  Phase 1          Phase 2         Phase 3        Phase 4      Phase 5  │
│  SETUP      →    INVITATION   →    RSVP     →  CONFIRMATION → JOUR J   │
│  J-90/J-60       J-60/J-30        J-30/J-14     Automatique   Jour J    │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 PHASE 1 : SETUP & CONFIGURATION
**Période : J-90 à J-60**

### Étape 1.1 : Création de l'Événement
- [ ] **Créer l'événement**
  - Nom, description, lieu
  - Date et heure (début/fin)
  - Ville, pays, adresse
  - Image de couverture
  - Code vestimentaire

**Page** : `/admin/events/new`

---

### Étape 1.2 : Configuration Email (OBLIGATOIRE)
- [ ] **Intégrer un service email**
  - Choisir : SendGrid ou Resend
  - Configurer API Key
  - Définir email expéditeur
  - Activer tracking (ouvertures/clics)

**Page** : `/admin/settings/integrations`
**Status** : ⚠️ Critique - Bloque l'envoi d'emails

---

### Étape 1.3 : Ajout des Invités
- [ ] **Option A : Ajout manuel**
  - Prénom (obligatoire)
  - Nom (optionnel)
  - Email (obligatoire)
  - Entreprise, fonction, secteur
  - Taille entreprise (optionnel)
  - Tags : VIP, Presse, Sponsor...

- [ ] **Option B : Import CSV**
  - Format : firstName, lastName, email, company, tags
  - Upload fichier
  - Validation automatique
  - Détection doublons

**Page** : `/admin/events/[id]` (vue d'ensemble)
**Composants** : `AddGuestDialog`, `ImportCSVDialog`

---

### Étape 1.4 : Configuration des Templates Email
- [ ] **Hub Email - Configuration complète**

  **A. Save the Date (optionnel)**
  - Builder visuel WYSIWYG
  - Personnalisation couleurs, logo
  - Variables dynamiques : `{{guest.firstName}}`, `{{event.name}}`
  - Test avant envoi

  **B. Email d'Invitation (important)**
  - Template personnalisé ou défaut
  - Sujet, contenu HTML
  - Lien RSVP unique : `{{rsvpLink}}`
  - QR Code optionnel

  **C. Emails de Confirmation (automatiques)**
  - **Confirmation-accepted** : Email si accepte
  - **Confirmation-declined** : Email si refuse
  - Fallback : CONFIRMATION générique

  **D. Email de Rappel (optionnel)**
  - Pour invités sans réponse
  - X jours avant deadline

**Page** : `/admin/events/[id]/emails` (Hub Email centralisé)
**Fonctionnalités** :
- ✅ Éditeur WYSIWYG
- ✅ Preview temps réel
- ✅ Test email avec données fictives
- ✅ Analytics (taux ouverture, clics)
- ✅ Gestion des templates par type

---

### Étape 1.5 : Configuration RSVP (optionnel)
- [ ] **Formulaire RSVP personnalisé**
  - Activer/désactiver accompagnants
  - Nombre max de +1
  - Questions personnalisées
  - Choix de repas
  - Restrictions alimentaires
  - Besoins accessibilité

**Page** : `/admin/events/[id]/rsvp-config`

---

## 📧 PHASE 2 : INVITATION
**Période : J-60 à J-30**

### Étape 2.1 : Save the Date (Optionnel)
- [ ] **Envoi pré-invitation**
  - Sélection : tous les invités ou segmentation
  - Template : Save the Date
  - But : Bloquer la date dans les agendas

**Page** : `/admin/events/[id]/communications`
**Type** : `SAVE_THE_DATE`

---

### Étape 2.2 : Envoi Invitation Officielle
- [ ] **Campaign d'invitation**
  - Sélection invités (tous ou filtrage)
  - Template : Invitation
  - Chaque invité reçoit lien RSVP unique
  - Token sécurisé : `/rsvp/{token}`

**Page** : `/admin/events/[id]` → Dialog "Envoyer invitations"
**API** : `POST /api/admin/events/[id]/send-invitations`

**Email envoyé contient** :
- Détails événement
- Lien RSVP personnalisé
- QR Code (optionnel)
- Date limite réponse

---

### Étape 2.3 : Suivi des Envois
- [ ] **Analytics en temps réel**
  - Emails envoyés
  - Taux d'ouverture
  - Taux de clics
  - Timeline des ouvertures
  - Meilleur type d'email

**Page** : `/admin/events/[id]/emails` → Onglet Analytics

---

## ✅ PHASE 3 : RÉPONSES RSVP
**Période : J-30 à J-14**

### Étape 3.1 : Les Invités Répondent
**Workflow Invité** :
1. Invité clique sur lien RSVP dans email
2. Arrive sur page : `/rsvp/{token}`
3. Voit les détails de l'événement
4. Remplit le formulaire RSVP :
   - ✅ Je participe / ❌ Je ne peux pas
   - Nombre d'accompagnants
   - Choix de repas
   - Restrictions alimentaires
   - Questions personnalisées
5. Soumet la réponse

**Page invité** : `/rsvp/{token}`

---

### Étape 3.2 : Email de Confirmation Automatique
**Déclenchement automatique** après soumission RSVP :

**Si ACCEPTE** :
- API cherche template `slug: 'confirmation-accepted'`
- Sinon fallback vers `type: 'CONFIRMATION'`
- Variables remplacées : `{{guest.firstName}}`, `{{event.date}}`, etc.
- Email envoyé avec :
  - ✅ Confirmation de présence
  - Détails événement
  - QR Code pour check-in
  - Informations pratiques

**Si REFUSE** :
- API cherche template `slug: 'confirmation-declined'`
- Sinon fallback vers `type: 'CONFIRMATION'`
- Email envoyé avec :
  - 💜 Message personnalisé de remerciement
  - Regret de ne pas les voir
  - Invitation future (optionnel)

**Code** : `/app/api/rsvp/[token]/route.ts:171-194`

---

### Étape 3.3 : Suivi des Réponses (Admin)
- [ ] **Dashboard temps réel**
  - Total invités
  - Réponses reçues (%)
  - Confirmés (acceptés)
  - Déclinés
  - Sans réponse
  - Total attendus (invités + accompagnants)

**Page** : `/admin/events/[id]` → Statistiques

**Détails invités** :
- [ ] **Liste complète**
  - Filtres : Accepté, Décliné, En attente
  - Export CSV
  - Actions individuelles
  - Historique emails

**Page** : `/admin/events/[id]/guests`

---

### Étape 3.4 : Relances (Optionnel)
- [ ] **Rappel aux non-répondants**
  - Filtrer invités "Sans réponse"
  - Template : REMINDER
  - Envoi ciblé
  - Deadline RSVP rappelée

**Page** : `/admin/events/[id]/communications`
**Type** : `REMINDER`

---

## 🎫 PHASE 4 : PRÉPARATION JOUR J
**Période : J-14 à J-1**

### Étape 4.1 : Génération des Badges
- [ ] **Créer les badges**
  - Design personnalisé
  - Champs : Nom, Entreprise, Fonction
  - QR Code unique par invité
  - Export PDF pour impression

**Page** : `/admin/events/[id]/badges`

---

### Étape 4.2 : Configuration Check-in
- [ ] **Préparer le check-in**
  - Vérifier QR codes actifs
  - Configurer desks/points d'accueil
  - Tester scanner

**Page** : `/admin/events/[id]/checkin`

---

### Étape 4.3 : Dernières Communications
- [ ] **Email de rappel final (optionnel)**
  - Détails pratiques
  - Heure d'arrivée
  - Parking, transports
  - Contacts d'urgence

**Type** : `INFO` ou `CUSTOM`

---

## 🎉 PHASE 5 : JOUR J - CHECK-IN
**Le jour de l'événement**

### Étape 5.1 : Accueil des Invités

**Option A : Scanner QR Code**
1. Invité arrive avec QR code (email ou badge)
2. Staff scanne QR code
3. Système vérifie et enregistre
4. ✅ Check-in confirmé
5. Statistiques mises à jour en temps réel

**Option B : Recherche manuelle**
1. Staff cherche invité par nom/email
2. Clic sur "Check-in"
3. ✅ Enregistré

**Page** : `/admin/events/[id]/checkin`
**Features** :
- Scanner QR intégré
- Recherche rapide
- Historique check-ins
- Statistiques live

---

### Étape 5.2 : Suivi en Temps Réel
- [ ] **Dashboard Jour J**
  - Total attendus
  - Enregistrés (%)
  - En attente
  - Retardataires
  - Graphique timeline arrivées

**Page** : `/admin/events/[id]` → Section "Jour de l'événement"

---

## 📊 RÉCAPITULATIF DES RÔLES

### 🎯 Admin (Organisateur)
```
1. Crée événement               → /admin/events/new
2. Configure emails             → /admin/settings/integrations
3. Ajoute invités               → /admin/events/[id] (AddGuestDialog)
4. Configure templates          → /admin/events/[id]/emails
5. Envoie invitations           → /admin/events/[id] (SendInvitationsDialog)
6. Suit les réponses            → /admin/events/[id]/guests
7. Génère badges                → /admin/events/[id]/badges
8. Check-in le jour J           → /admin/events/[id]/checkin
```

### 👤 Invité
```
1. Reçoit email invitation      → Boîte mail
2. Clique lien RSVP             → /rsvp/{token}
3. Remplit formulaire RSVP      → Soumet réponse
4. Reçoit email confirmation    → Automatique (accept/decline)
5. Arrive le jour J             → Présente QR code
6. Est enregistré               → Check-in
```

---

## 🔄 FLUX AUTOMATIQUES

### Email de Confirmation (Automatique)
```
Invité soumet RSVP
    ↓
API: /api/rsvp/[token]
    ↓
If attending = true:
    ↓
    Cherche template 'confirmation-accepted'
    OU fallback 'CONFIRMATION'
    ↓
    Remplace variables {{guest.*}}, {{event.*}}
    ↓
    Envoie email avec QR code

If attending = false:
    ↓
    Cherche template 'confirmation-declined'
    OU fallback 'CONFIRMATION'
    ↓
    Remplace variables
    ↓
    Envoie email de remerciement
```

### Auto-tagging (Automatique)
```
Invité créé avec infos pro
    ↓
API: /api/admin/events/[id]/guests
    ↓
Fonction generateAutoTags()
    ↓
Détecte:
- companySize → Tag "TPE", "PME", "ETI", "GE"
- jobTitle (CEO, CTO...) → Tag "VIP", "Décideur"
- jobTitle (Directeur...) → Tag "Direction"
- jobTitle (Manager...) → Tag "Manager"
- industry → Tag secteur
    ↓
Tags automatiques ajoutés
```

---

## 🛠️ PAGES PRINCIPALES

| Page | URL | Rôle |
|------|-----|------|
| **Vue d'ensemble événement** | `/admin/events/[id]` | Dashboard principal, checklist, stats |
| **Hub Email** | `/admin/events/[id]/emails` | Gestion centralisée emails, analytics |
| **Liste invités** | `/admin/events/[id]/guests` | Gestion invités, filtres, export |
| **Communications** | `/admin/events/[id]/communications` | Campagnes d'envoi, planification |
| **Configuration RSVP** | `/admin/events/[id]/rsvp-config` | Formulaire RSVP personnalisé |
| **Badges** | `/admin/events/[id]/badges` | Génération, design, export |
| **Check-in** | `/admin/events/[id]/checkin` | Scanner QR, enregistrement |
| **RSVP Invité** | `/rsvp/{token}` | Formulaire réponse invité |

---

## 📈 ANALYTICS & SUIVI

### Métriques Email (Hub Email)
- ✅ Envoyés
- 📧 Taux d'ouverture (%)
- 🖱️ Taux de clics (%)
- 📊 Timeline ouvertures (graphique)
- 🏆 Meilleur type d'email
- ⏱️ Temps moyen d'ouverture
- 📉 Bounces

### Métriques Événement (Vue d'ensemble)
- 👥 Total invités
- 💬 Réponses (%)
- ✅ Confirmés
- ❌ Déclinés
- 👨‍👩‍👧 Attendus (invités + accompagnants)
- 🎫 Check-in (%)
- ⏳ En attente

---

## 🎨 CHECKLIST DE LANCEMENT

**Affichage automatique** sur `/admin/events/[id]`

### Étapes Critiques (⚠️ Bloquantes)
- [ ] Événement créé
- [ ] Invités importés (>0)
- [ ] Intégration email configurée

### Étapes Importantes (🟡 Recommandées)
- [ ] Template invitation créé
- [ ] Email confirmation configuré

### Étapes Optionnelles (🟢 Bonus)
- [ ] Configuration RSVP personnalisée
- [ ] Badge design créé

**Indicateur** : Barre de progression affichée en haut de page

---

## 🎯 WORKFLOW IDÉAL (BEST PRACTICES)

### Timeline Recommandée

```
J-90    : Créer événement + Ajouter invités
J-75    : Configurer emails (intégration + templates)
J-60    : 📧 Envoyer Save the Date
J-45    : 📧 Envoyer Invitations officielles
J-30    : Deadline RSVP ouverte
J-21    : 📧 Relance non-répondants
J-14    : Deadline RSVP fermée
J-7     : Générer badges + Préparer check-in
J-3     : 📧 Email rappel final (détails pratiques)
Jour J  : ✅ Check-in avec QR codes
J+1     : 📊 Analyser statistiques & feedback
```

---

## 🔐 SÉCURITÉ & TOKENS

### Token RSVP
- **Format** : UUID sécurisé (cuid)
- **Hashage** : SHA-256
- **Usage** : Un token par invité, lien unique
- **Validation** : Vérifié côté serveur avant affichage formulaire
- **Expiration** : Optionnel (deadline RSVP)

### QR Codes
- **Contenu** : Token invité ou ID badge
- **Format** : Standard QR (Level M)
- **Usage** : Check-in jour J
- **Scan** : Caméra mobile ou scanner dédié

---

## 📦 RÉSUMÉ DES FONCTIONNALITÉS

### ✅ Fonctionnalités Actuelles

**Gestion Invités**
- ✅ Ajout manuel avec formulaire complet
- ✅ Import CSV
- ✅ Auto-tagging intelligent
- ✅ Filtres et recherche
- ✅ Export données

**Email Management**
- ✅ Hub Email centralisé
- ✅ Éditeur WYSIWYG pour templates
- ✅ Preview temps réel
- ✅ Test email avec données fictives
- ✅ Templates conditionnels (accept/decline)
- ✅ Variables dynamiques
- ✅ Analytics détaillées
- ✅ Timeline des ouvertures
- ✅ Envois programmés

**RSVP**
- ✅ Formulaire personnalisable
- ✅ Accompagnants (+1)
- ✅ Choix repas
- ✅ Questions custom
- ✅ Confirmation automatique
- ✅ Emails conditionnels

**Check-in**
- ✅ Scanner QR code
- ✅ Recherche manuelle
- ✅ Stats temps réel
- ✅ Historique check-ins

**Badges**
- ✅ Designer visuel
- ✅ QR codes intégrés
- ✅ Export PDF
- ✅ Impression batch

**Wizard d'Onboarding**
- ✅ Guide 5 étapes
- ✅ Vérification statut
- ✅ Routing direct

---

## 🚀 CONCLUSION

Ce workflow couvre **l'intégralité du cycle de vie** d'un événement :

1. ⚙️ **SETUP** : Configuration complète (J-90 → J-60)
2. 📧 **INVITATION** : Communication ciblée (J-60 → J-30)
3. ✅ **RSVP** : Collecte réponses (J-30 → J-14)
4. ✉️ **CONFIRMATION** : Emails automatiques selon réponse
5. 🎉 **JOUR J** : Check-in fluide avec QR codes

**Points forts** :
- 🎨 Interface intuitive
- ⚡ Automatisations intelligentes
- 📊 Analytics temps réel
- 🔄 Workflow guidé
- 🎯 Personnalisation poussée

**Prochaines améliorations possibles** :
- A/B testing emails
- Segmentation avancée
- SMS notifications
- Intégration calendrier
- Feedback post-événement
