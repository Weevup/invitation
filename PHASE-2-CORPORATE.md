# 🏢 PHASE 2 : ÉVÉNEMENTS CORPORATE & LOGISTIQUE
**Version adaptée pour séminaires d'entreprise et événements internationaux**

---

## 🎯 VOS BESOINS IDENTIFIÉS

- ✅ Séminaires internationaux (multi-pays, multi-langues)
- ✅ Gestion transport & déplacements (avion, train, transferts)
- ✅ Organisation workshops & teambuilding
- ✅ Inscription avec paiement (facturation B2B)
- ✅ Planification logistique complète
- ✅ Gestion des hébergements
- ✅ Suivi budgétaire

---

## 📊 PHASE 2.1 : INSCRIPTION & PAIEMENT B2B (2 semaines)

### Modèle de données

```prisma
enum RegistrationType {
  INDIVIDUAL    // Inscription individuelle
  COMPANY       // Entreprise (facturation globale)
  SPONSORED     // Pris en charge par sponsor
  FREE          // Gratuit (VIP, speakers, etc.)
}

enum RegistrationStatus {
  DRAFT         // Brouillon
  PENDING       // En attente validation
  CONFIRMED     // Confirmé
  PAID          // Payé
  CANCELLED     // Annulé
  WAITLIST      // Liste d'attente
}

model Registration {
  id              String             @id @default(cuid())
  eventId         String
  event           Event              @relation(fields: [eventId], references: [id])
  guestId         String
  guest           Guest              @relation(fields: [guestId], references: [id])

  // Type d'inscription
  type            RegistrationType   @default(INDIVIDUAL)
  status          RegistrationStatus @default(PENDING)

  // Tarification
  basePrice       Decimal            @db.Decimal(10, 2)
  discountCode    String?
  discount        Decimal            @default(0) @db.Decimal(10, 2)
  totalPrice      Decimal            @db.Decimal(10, 2)
  currency        String             @default("EUR")

  // Facturation B2B
  companyName     String?
  vatNumber       String?            // N° TVA intracommunautaire
  purchaseOrder   String?            // Bon de commande
  billingAddress  String?
  billingContact  String?
  billingEmail    String?

  // Paiement
  paymentMethod   String?            // "invoice", "card", "transfer"
  paymentStatus   String?            // "pending", "paid", "overdue"
  paidAt          DateTime?
  invoiceNumber   String?
  invoiceUrl      String?
  paymentDueDate  DateTime?

  // Validation
  approvedBy      String?            // ID du validateur
  approvedAt      DateTime?
  rejectionReason String?

  // Besoins spécifiques
  dietaryReqs     String?            // Régime alimentaire
  allergies       String[]           // Allergies
  accessibility   String?            // Besoins accessibilité
  specialRequests String?            // Demandes spéciales

  // Relations
  travelBooking   TravelBooking?
  accommodations  Accommodation[]
  sessions        SessionRegistration[]

  createdAt       DateTime           @default(now())
  updatedAt       DateTime           @updatedAt
}
```

### Fonctionnalités

**Interface Admin** :
- Validation des inscriptions (workflow approbation)
- Gestion des tarifs (grilles par entreprise, early bird)
- Génération factures PDF automatique
- Suivi paiements (relances automatiques)
- Export comptable (CSV, Excel)
- Codes promo & réductions

**Interface Inscription** :
- Formulaire multi-étapes (infos perso → entreprise → facturation → besoins)
- Pré-remplissage pour retours (si déjà inscrit à autre événement)
- Upload de documents (ordre de mission, justificatifs)
- Confirmation par email avec PDF récapitulatif

---

## ✈️ PHASE 2.2 : TRANSPORT & DÉPLACEMENTS (2 semaines)

### Modèle de données

```prisma
enum TravelMode {
  FLIGHT
  TRAIN
  BUS
  CAR
  TAXI
  SHUTTLE
  OTHER
}

enum TravelStatus {
  REQUESTED     // Demandé
  QUOTED        // Devisé
  BOOKED        // Réservé
  CONFIRMED     // Confirmé
  CANCELLED     // Annulé
  COMPLETED     // Effectué
}

model TravelBooking {
  id              String         @id @default(cuid())
  registrationId  String         @unique
  registration    Registration   @relation(fields: [registrationId], references: [id])

  // Voyage aller
  outboundMode    TravelMode?
  outboundDate    DateTime?
  outboundTime    String?        // Format "HH:MM"
  outboundFrom    String?        // Ville/aéroport départ
  outboundTo      String?        // Ville/aéroport arrivée
  outboundDetails Json?          // { flight: "AF1234", seat: "12A", terminal: "2E" }

  // Voyage retour
  returnMode      TravelMode?
  returnDate      DateTime?
  returnTime      String?
  returnFrom      String?
  returnTo        String?
  returnDetails   Json?

  // Statut et coût
  status          TravelStatus   @default(REQUESTED)
  totalCost       Decimal?       @db.Decimal(10, 2)
  bookedBy        String?        // ID du gestionnaire
  bookedAt        DateTime?

  // Documents
  ticketUrl       String?        // PDF du billet
  bookingRef      String?        // Référence de réservation

  // Transfers
  transfers       Transfer[]

  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt
}

model Transfer {
  id              String         @id @default(cuid())
  travelBookingId String
  travelBooking   TravelBooking  @relation(fields: [travelBookingId], references: [id])

  type            String         // "airport_to_hotel", "hotel_to_venue", "venue_to_hotel"
  date            DateTime
  time            String
  from            String
  to              String
  mode            TravelMode     @default(TAXI)

  status          TravelStatus   @default(REQUESTED)
  cost            Decimal?       @db.Decimal(10, 2)

  driverName      String?
  driverPhone     String?
  vehicleInfo     String?        // "Mercedes Classe E - ABC-123"

  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt
}
```

### Fonctionnalités

**Interface Admin** :
- Tableau de bord transport (vue globale arrivées/départs)
- Gestion des réservations (groupées par jour/ville)
- Planning navettes (optimisation des transferts)
- Export manifeste passagers (pour prestataires)
- Suivi coûts transport en temps réel
- Alertes (vols retardés via API)

**Interface Participant** :
- Saisie préférences transport
- Upload billets (si réservé soi-même)
- Demande transfert aéroport
- Notifications SMS/email (rappels départ)
- Accès infos transport en temps réel

---

## 🏨 PHASE 2.3 : HÉBERGEMENT (1 semaine)

### Modèle de données

```prisma
enum RoomType {
  SINGLE
  DOUBLE
  TWIN
  SUITE
  SHARED
}

model Accommodation {
  id             String       @id @default(cuid())
  registrationId String
  registration   Registration @relation(fields: [registrationId], references: [id])

  hotelName      String
  hotelAddress   String?
  hotelPhone     String?
  hotelEmail     String?

  roomType       RoomType
  checkIn        DateTime
  checkOut       DateTime
  nights         Int

  roomNumber     String?
  bookingRef     String?

  pricePerNight  Decimal      @db.Decimal(10, 2)
  totalPrice     Decimal      @db.Decimal(10, 2)

  specialRequests String?     // "Étage élevé, lit king size"

  confirmedAt    DateTime?

  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt

  @@index([checkIn, checkOut])
}

model Hotel {
  id          String   @id @default(cuid())
  eventId     String
  event       Event    @relation(fields: [eventId], references: [id])

  name        String
  address     String
  city        String
  country     String
  phone       String?
  email       String?
  website     String?

  stars       Int?     // 1-5

  // Contrat
  isOfficial  Boolean  @default(false) // Hôtel officiel événement
  roomsBlocked Int?    // Chambres bloquées
  roomsBooked  Int      @default(0)
  rateNegotiated Decimal? @db.Decimal(10, 2)

  // Localisation
  distanceToVenue Float? // km
  latitude    Float?
  longitude   Float?

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### Fonctionnalités

**Interface Admin** :
- Gestion hôtels partenaires (contrats, allotements)
- Rooming list (attribution chambres)
- Tableau occupancy en temps réel
- Export pour hôtels (liste arrivées/départs par jour)
- Suivi paiements hôtels

**Interface Participant** :
- Sélection hôtel (carte interactive)
- Demande de roommate (partage chambre)
- Préférences chambre
- Confirmation réservation par email

---

## 📅 PHASE 2.4 : WORKSHOP & SESSIONS (1.5 semaines)

### Modèle de données

```prisma
enum SessionType {
  WORKSHOP
  CONFERENCE
  KEYNOTE
  TEAMBUILDING
  NETWORKING
  TRAINING
  PANEL
  OTHER
}

model Session {
  id              String       @id @default(cuid())
  eventId         String
  event           Event        @relation(fields: [eventId], references: [id])

  title           String
  description     String?      @db.Text
  type            SessionType

  // Planning
  date            DateTime
  startTime       String       // "09:00"
  endTime         String       // "12:00"
  duration        Int          // minutes

  // Lieu
  venue           String?      // "Salle Molière"
  room            String?      // "A-101"
  location        String?      // "Bâtiment principal"

  // Capacité
  capacity        Int?
  minParticipants Int?
  maxParticipants Int?

  // Intervenants
  speakers        Json?        // [{ name, title, bio, photo }]

  // Logistique
  equipment       String[]     // ["Projecteur", "Micro", "Paperboard"]
  materials       String?      // Matériel nécessaire

  // Inscription
  requiresRegistration Boolean  @default(false)
  registrationDeadline DateTime?
  registrationsClosed  Boolean  @default(false)

  // Relations
  registrations   SessionRegistration[]

  isActive        Boolean      @default(true)
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt

  @@index([eventId, date])
}

model SessionRegistration {
  id             String       @id @default(cuid())
  sessionId      String
  session        Session      @relation(fields: [sessionId], references: [id])
  registrationId String
  registration   Registration @relation(fields: [registrationId], references: [id])

  // Statut
  status         String       @default("confirmed") // confirmed, waitlist, cancelled
  waitlistPosition Int?

  // Check-in
  checkedInAt    DateTime?

  // Feedback (post-session)
  rating         Int?         // 1-5
  feedback       String?

  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt

  @@unique([sessionId, registrationId])
}
```

### Fonctionnalités

**Interface Admin** :
- Planning visuel (drag & drop sessions)
- Gestion capacités salles
- Vue conflits (participants inscrits à 2 sessions simultanées)
- Export badges avec QR code (check-in session)
- Feuilles d'émargement
- Analytics par session (taux remplissage, satisfaction)

**Interface Participant** :
- Catalogue sessions interactif
- Inscription workshops (avec contraintes)
- Agenda personnalisé (export iCal, Google Calendar)
- Notifications rappels 1h avant
- Check-in QR code
- Formulaire feedback post-session

---

## 📊 PHASE 2.5 : BUDGET & REPORTING (1 semaine)

### Modèle de données

```prisma
enum ExpenseCategory {
  VENUE
  CATERING
  TRANSPORT
  ACCOMMODATION
  EQUIPMENT
  MARKETING
  STAFF
  ENTERTAINMENT
  SPEAKERS
  OTHER
}

model Budget {
  id           String          @id @default(cuid())
  eventId      String
  event        Event           @relation(fields: [eventId], references: [id])

  category     ExpenseCategory
  name         String          // "Traiteur dîner gala"
  description  String?

  budgeted     Decimal         @db.Decimal(10, 2)
  actual       Decimal         @default(0) @db.Decimal(10, 2)
  invoiced     Decimal         @default(0) @db.Decimal(10, 2)
  paid         Decimal         @default(0) @db.Decimal(10, 2)

  currency     String          @default("EUR")

  supplier     String?
  poNumber     String?         // Purchase Order
  invoiceUrl   String?

  notes        String?

  createdAt    DateTime        @default(now())
  updatedAt    DateTime        @updatedAt

  @@index([eventId, category])
}
```

### Fonctionnalités

**Dashboard Budget** :
- Vue d'ensemble : Budgété vs Réel vs Invoicé
- Graphiques par catégorie
- Alertes dépassement
- Projection coûts (basé sur inscriptions)
- Export comptable

**Reporting** :
- Rapport exécutif (PDF) : résumé financier, stats participants
- Rapport détaillé : ligne par ligne
- Comparaison événements (historique)
- ROI calculator

---

## 🌍 PHASE 2.6 : MULTI-LANGUE & INTERNATIONAL (3 jours)

### Fonctionnalités

**i18n complet** :
- Interface en FR, EN, ES, DE, IT
- Emails multilingues (détection langue participant)
- Templates adaptés par pays
- Format dates/heures localisé
- Devises multiples avec conversion

**Timezone management** :
- Tous les horaires en timezone événement
- Affichage timezone participant
- Rappels adaptés au fuseau horaire

---

## 📱 PHASE 2.7 : MOBILE APP (BONUS - 2 semaines)

### Progressive Web App (PWA)

**Fonctionnalités offline** :
- Mon agenda personnel
- Infos pratiques (plan, contacts)
- QR code check-in

**Fonctionnalités online** :
- Chat participants (networking)
- Annonces live
- Sondages en temps réel
- Notifications push

---

## 📦 LIVRAISON PAR SPRINTS

### Sprint 1 (2 semaines) : INSCRIPTION & FACTURATION
- Modèle Registration complet
- Formulaire inscription multi-étapes
- Workflow validation
- Génération factures PDF
- Interface admin inscriptions

**ROI** : Automatisation du processus d'inscription

### Sprint 2 (2 semaines) : TRANSPORT
- Modèle TravelBooking + Transfer
- Formulaire besoins transport
- Dashboard transport admin
- Planning navettes
- Export manifestes

**ROI** : Économies sur organisation transport

### Sprint 3 (1 semaine) : HÉBERGEMENT
- Modèle Accommodation + Hotel
- Gestion hôtels partenaires
- Rooming list
- Attribution chambres

**ROI** : Optimisation allotements hôtels

### Sprint 4 (1.5 semaines) : WORKSHOPS & SESSIONS
- Modèle Session + SessionRegistration
- Planning interactif
- Inscription workshops
- Check-in QR code

**ROI** : Meilleure expérience participant

### Sprint 5 (1 semaine) : BUDGET & REPORTING
- Modèle Budget
- Dashboard financier
- Rapports automatisés

**ROI** : Visibilité coûts en temps réel

---

## 🎯 PRIORISATION RECOMMANDÉE

Pour un **MVP en 4 semaines** :

**Semaines 1-2** :
- ✅ Inscription & Facturation B2B (Sprint 1)

**Semaine 3** :
- ✅ Transport (version simplifiée)
- ✅ Hébergement (version simplifiée)

**Semaine 4** :
- ✅ Workshops & Sessions
- ✅ Budget (dashboard basique)

---

## 💰 COMPARAISON SOLUTIONS EXISTANTES

| Fonctionnalité | Votre système | Eventbrite | Cvent | Bizzabo |
|----------------|---------------|------------|-------|---------|
| Coût/événement | **Gratuit** | 3.5% + €0.99 | $7,000+/an | $5,000+/an |
| Transport | ✅ Intégré | ❌ | ✅ | ⚠️ Module séparé |
| Hébergement | ✅ Intégré | ❌ | ✅ | ⚠️ Module séparé |
| Budget | ✅ Intégré | ❌ | ✅ | ✅ |
| Workshops | ✅ Intégré | ⚠️ Limité | ✅ | ✅ |
| Facturation B2B | ✅ | ⚠️ Basique | ✅ | ✅ |
| Personnalisation | ✅ 100% | ❌ Limité | ⚠️ Moyen | ⚠️ Moyen |
| RGPD | ✅ Vos serveurs | ⚠️ USA | ⚠️ USA | ⚠️ USA |

**Économies estimées** : €10,000 - €50,000 / an selon volume événements

---

## 🚀 PRÊT À DÉMARRER ?

Dès que vous êtes connecté à l'admin, on peut commencer par :

1. **Sprint 1 : Inscription & Facturation** (le plus critique)
2. Ou **Sprint 4 : Workshops** si vous avez un événement imminent

**Quelle fonctionnalité est la plus urgente pour vous ?**
