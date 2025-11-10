# 🗄️ PHASE 2 - CONCEPTION SCHÉMA DB

**Document de conception des nouvelles tables - Infrastructure Modulaire + Transport**

---

## ✅ PRINCIPES DE SÉCURITÉ

1. **Zéro modification des tables existantes** - Aucun champ modifié, aucune relation cassée
2. **Relations optionnelles** - Tout lié via EventModule, désactivable
3. **Cascade delete** - Si Event supprimé → modules automatiquement nettoyés
4. **Backward compatible** - Code existant continue de fonctionner

---

## 📊 NOUVELLES TABLES

### 1. EventModule (Pivot - Active/Désactive modules)

```prisma
model EventModule {
  id         String     @id @default(cuid())
  eventId    String
  event      Event      @relation("EventModules", fields: [eventId], references: [id], onDelete: Cascade)

  moduleType ModuleType
  isActive   Boolean    @default(true)
  config     Json?      // Configuration spécifique (ex: options transport)

  createdAt  DateTime   @default(now())
  updatedAt  DateTime   @updatedAt

  @@unique([eventId, moduleType])
  @@index([eventId])
  @@index([moduleType])
}

enum ModuleType {
  REGISTRATION_PAYMENT  // Inscription & Facturation B2B
  TRANSPORT             // Transport & Déplacements
  ACCOMMODATION         // Hébergement
  PROGRAM               // Programme & Sessions
  BUDGET                // Gestion Budget
  MULTILANG             // Multi-langue
}
```

**Pourquoi c'est sûr:**
- Relation séparée via `@relation("EventModules")` (ne touche pas Event existant)
- Unique constraint empêche doublons
- Cascade delete automatique si Event supprimé

---

### 2. TransportBooking (Réservations de transport)

```prisma
model TransportBooking {
  id        String          @id @default(cuid())
  eventId   String
  event     Event           @relation("EventTransportBookings", fields: [eventId], references: [id], onDelete: Cascade)
  guestId   String
  guest     Guest           @relation("GuestTransportBookings", fields: [guestId], references: [id], onDelete: Cascade)

  // Type de transport
  type      TransportType   // FLIGHT, TRAIN, SHUTTLE, TAXI, CAR_RENTAL
  status    BookingStatus   @default(REQUESTED)

  // Détails du voyage
  departure      Json?        // { city, airport, station, address, date, time }
  arrival        Json?        // { city, airport, station, address, date, time }
  carrier        String?      // Compagnie (Air France, SNCF, etc.)
  bookingRef     String?      // Référence réservation
  seatNumber     String?      // Numéro de siège

  // Coûts
  estimatedCost  Float?
  actualCost     Float?
  currency       String       @default("EUR")
  isPaidByCompany Boolean     @default(true)

  // Notes
  notes          String?      @db.Text
  internalNotes  String?      @db.Text  // Notes admin uniquement

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([eventId])
  @@index([guestId])
  @@index([status])
  @@index([type])
}

enum TransportType {
  FLIGHT
  TRAIN
  SHUTTLE
  TAXI
  CAR_RENTAL
  PERSONAL_CAR
}

enum BookingStatus {
  REQUESTED      // Demandé par le participant
  PENDING        // En attente validation admin
  CONFIRMED      // Confirmé
  BOOKED         // Réservation effectuée
  CANCELLED      // Annulé
  COMPLETED      // Voyage effectué
}
```

**Pourquoi c'est sûr:**
- Nouvelle table isolée
- Relations via `@relation("EventTransportBookings")` et `@relation("GuestTransportBookings")`
- Ne modifie PAS Guest ou Event
- Json pour flexibilité (departure/arrival peuvent varier selon type)

---

### 3. TransportManifest (Manifestes de navettes/vols groupés)

```prisma
model TransportManifest {
  id          String             @id @default(cuid())
  eventId     String
  event       Event              @relation("EventTransportManifests", fields: [eventId], references: [id], onDelete: Cascade)

  type        TransportType
  name        String             // Ex: "Navette Aéroport - Hôtel"
  description String?            @db.Text

  // Détails du trajet
  departure   Json               // { location, date, time }
  arrival     Json               // { location, date, time }

  // Capacité
  maxCapacity Int?
  currentCount Int              @default(0)

  // Coût
  costPerPerson Float?
  currency      String           @default("EUR")

  // Statut
  status        ManifestStatus   @default(DRAFT)

  // Participants (relation many-to-many via table pivot)
  participants  ManifestParticipant[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([eventId])
  @@index([status])
}

// Table pivot pour relation many-to-many
model ManifestParticipant {
  id          String             @id @default(cuid())
  manifestId  String
  manifest    TransportManifest  @relation(fields: [manifestId], references: [id], onDelete: Cascade)
  guestId     String
  guest       Guest              @relation("GuestManifests", fields: [guestId], references: [id], onDelete: Cascade)

  seatNumber  String?
  confirmedAt DateTime?

  createdAt DateTime @default(now())

  @@unique([manifestId, guestId])
  @@index([manifestId])
  @@index([guestId])
}

enum ManifestStatus {
  DRAFT       // Brouillon
  OPEN        // Inscriptions ouvertes
  FULL        // Complet
  CONFIRMED   // Confirmé
  DEPARTED    // Parti
  COMPLETED   // Terminé
  CANCELLED   // Annulé
}
```

**Pourquoi c'est sûr:**
- Tables complètement indépendantes
- Relation many-to-many propre via table pivot
- Ne touche pas aux modèles existants

---

## 📝 MODIFICATION MINIMALE DU SCHÉMA EXISTANT

**Dans `model Event` - AJOUTER uniquement ces 3 lignes à la fin du bloc Relations:**

```prisma
model Event {
  // ... tout le code existant reste identique ...

  // Relations (section existante)
  guests         Guest[]
  rsvps          RSVP[]
  checkins       Checkin[]
  emailLogs      EmailLog[]
  emailTrackings EmailTracking[]

  // ⬇️ AJOUTER CES 3 LIGNES UNIQUEMENT ⬇️
  modules              EventModule[]            @relation("EventModules")
  transportBookings    TransportBooking[]       @relation("EventTransportBookings")
  transportManifests   TransportManifest[]      @relation("EventTransportManifests")
  // ⬆️ FIN AJOUT ⬆️

  @@index([slug])
  @@index([adminId])
}
```

**Dans `model Guest` - AJOUTER uniquement ces 2 lignes:**

```prisma
model Guest {
  // ... tout le code existant reste identique ...

  // Relations (section existante)
  rsvp           RSVP?
  checkins       Checkin[]
  emailLogs      EmailLog[]
  emailTrackings EmailTracking[]

  // ⬇️ AJOUTER CES 2 LIGNES UNIQUEMENT ⬇️
  transportBookings TransportBooking[]    @relation("GuestTransportBookings")
  manifests         ManifestParticipant[] @relation("GuestManifests")
  // ⬆️ FIN AJOUT ⬆️

  @@unique([eventId, email])
  @@index([tokenHash])
  @@index([eventId])
}
```

---

## 🧪 PLAN DE MIGRATION

### Étape 1: Ajout progressif

```bash
# 1. Créer une branche dédiée
git checkout -b feature/infrastructure-modules

# 2. Modifier schema.prisma (ajouts uniquement)

# 3. Créer la migration
npx prisma migrate dev --name add_modular_infrastructure

# 4. Tester localement
npm run dev
# Vérifier que tout fonctionne

# 5. Si OK → commit
git add prisma/
git commit -m "feat: Ajouter infrastructure modulaire (EventModule, Transport)"
```

### Étape 2: Validation en production

```bash
# 1. Déployer sur preview Vercel d'abord
git push origin feature/infrastructure-modules
# Vercel crée automatiquement un preview

# 2. Tester sur preview

# 3. Si OK → merge vers main
```

---

## ✅ CHECKLIST DE SÉCURITÉ

Avant de créer la migration, vérifier:

- [ ] Aucune table existante modifiée (sauf ajout relations)
- [ ] Tous les champs optionnels (`?`) ou avec `@default`
- [ ] Cascade delete configuré (`onDelete: Cascade`)
- [ ] Index sur foreign keys
- [ ] Unique constraints où nécessaire
- [ ] Relations nommées explicitement (`@relation("Name")`)

---

## 🚀 PROCHAINES ÉTAPES

1. ✅ **Validation de ce design** (vous !)
2. Modifier `schema.prisma`
3. Créer la migration
4. Tester localement
5. Déployer sur preview
6. Valider en preview
7. Merge vers main

---

**Questions avant de continuer ?**

- Les nouvelles tables vous semblent correctes ?
- Besoin d'ajuster des champs ?
- Préoccupations sur la migration ?

**Une fois validé, je modifie le schema.prisma et crée la migration proprement.**
