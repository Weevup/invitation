# 📱 Plan d'Implémentation: Système de Notifications SMS & Push

**Priorité #1 - Impact Maximum ⭐⭐⭐⭐⭐**

---

## 🎯 OBJECTIFS

### Métriques Cibles
- **Taux d'ouverture SMS:** 98% (vs 20% email)
- **Réduction no-shows:** 30-40%
- **Engagement événements:** +100%
- **Satisfaction clients:** +50%

### Use Cases Principaux
1. **Rappels automatiques** - X jours avant événement
2. **Confirmations** - RSVP confirmé, QR code reçu
3. **Urgences** - Changements dernière minute
4. **Rappels jour J** - Check-in, début session
5. **Suivis post-événement** - Sondages, remerciements

---

## 🏗️ ARCHITECTURE

### Stack Technologique

**SMS:**
- **Provider:** Twilio (leader marché, fiable)
- **Fallback:** AWS SNS (backup si Twilio down)
- **Prix:** ~€0.04-0.08/SMS France

**Push Notifications:**
- **Web Push:** Service Workers + Push API
- **Mobile PWA:** Web Push (pas besoin app native!)
- **Provider:** Firebase Cloud Messaging (gratuit)

---

## 📊 MODÈLES PRISMA

### 1. NotificationTemplate
```prisma
model NotificationTemplate {
  id          String   @id @default(cuid())
  name        String   // "RSVP Confirmation", "Event Reminder"
  description String?

  // Template type
  type        NotificationType // SMS, PUSH, BOTH

  // Message content
  subject     String?  // For push notifications
  message     String   @db.Text

  // Variables supported: {{firstName}}, {{eventName}}, {{date}}, etc.
  variables   Json     // List of available variables

  // Timing
  triggerType TriggerType // IMMEDIATE, SCHEDULED, BEFORE_EVENT
  triggerValue Int?    // Minutes before event (if BEFORE_EVENT)

  // Settings
  isActive    Boolean  @default(true)
  isSystem    Boolean  @default(false) // Can't be deleted

  // Usage tracking
  sentCount   Int      @default(0)
  openRate    Float?   // For push notifications
  clickRate   Float?

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  notifications Notification[]
}

enum NotificationType {
  SMS
  PUSH
  BOTH
}

enum TriggerType {
  IMMEDIATE
  SCHEDULED
  BEFORE_EVENT
  AFTER_EVENT
  ON_RSVP
  ON_CHECKIN
}
```

### 2. Notification
```prisma
model Notification {
  id          String   @id @default(cuid())

  // Template used
  templateId  String?
  template    NotificationTemplate? @relation(fields: [templateId], references: [id])

  // Recipient
  guestId     String
  guest       Guest    @relation(fields: [guestId], references: [id], onDelete: Cascade)

  // Event context
  eventId     String
  event       Event    @relation(fields: [eventId], references: [id], onDelete: Cascade)

  // Message
  type        NotificationType
  subject     String?
  message     String   @db.Text

  // Delivery
  status      NotificationStatus @default(PENDING)
  scheduledFor DateTime?
  sentAt      DateTime?
  deliveredAt DateTime?
  readAt      DateTime?

  // Provider details
  provider    String?  // "twilio", "fcm"
  providerId  String?  // External ID from provider
  error       String?  @db.Text

  // Tracking
  clicked     Boolean  @default(false)
  clickedAt   DateTime?

  // Metadata
  metadata    Json?

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([guestId])
  @@index([eventId])
  @@index([status])
  @@index([scheduledFor])
}

enum NotificationStatus {
  PENDING
  SCHEDULED
  SENDING
  SENT
  DELIVERED
  READ
  FAILED
  CANCELLED
}
```

### 3. NotificationPreference
```prisma
model NotificationPreference {
  id        String   @id @default(cuid())

  guestId   String   @unique
  guest     Guest    @relation(fields: [guestId], references: [id], onDelete: Cascade)

  // Channels enabled
  smsEnabled  Boolean @default(true)
  pushEnabled Boolean @default(true)
  emailEnabled Boolean @default(true)

  // Notification types
  reminders   Boolean @default(true)
  updates     Boolean @default(true)
  marketing   Boolean @default(false)

  // Push subscription (for Web Push)
  pushSubscription Json?

  // Phone verification
  phoneVerified Boolean @default(false)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### 4. Update Guest Model
```prisma
// Add to Guest model:
phone                String?
phoneVerified        Boolean @default(false)
notifications        Notification[]
notificationPreference NotificationPreference?
```

---

## 🔧 SERVICES À CRÉER

### 1. `/lib/notification-service.ts`
```typescript
class NotificationService {
  // Send SMS via Twilio
  sendSMS(to: string, message: string): Promise<void>

  // Send push notification via FCM
  sendPush(subscription: PushSubscription, payload: object): Promise<void>

  // Send notification (auto-detect type)
  send(notification: Notification): Promise<void>

  // Bulk send
  sendBulk(notifications: Notification[]): Promise<void>

  // Schedule notification
  schedule(notification: Notification, date: Date): Promise<void>

  // Cancel scheduled notification
  cancel(notificationId: string): Promise<void>
}
```

### 2. `/lib/notification-templates.ts`
```typescript
// Pre-built templates
const SYSTEM_TEMPLATES = {
  RSVP_CONFIRMATION: {
    sms: "✅ {{firstName}}, votre présence à {{eventName}} est confirmée! RDV le {{date}}. QR code: {{qrLink}}",
    push: {
      title: "Participation confirmée!",
      body: "Merci {{firstName}}! Rendez-vous le {{date}} à {{eventName}}",
    }
  },
  EVENT_REMINDER_24H: {
    sms: "📅 Rappel: {{eventName}} demain à {{time}}! Lieu: {{location}}. À bientôt!",
    push: {
      title: "C'est demain!",
      body: "{{eventName}} commence demain à {{time}}",
    }
  },
  // ... more templates
}
```

### 3. `/lib/notification-scheduler.ts`
```typescript
// Cron job to send scheduled notifications
class NotificationScheduler {
  // Process pending notifications
  async processPending(): Promise<void>

  // Create auto-reminders for events
  async createEventReminders(eventId: string): Promise<void>

  // Process batch
  async processBatch(limit: number): Promise<void>
}
```

---

## 🎨 INTERFACES ADMIN

### 1. Page `/admin/events/[id]/notifications`

**Onglets:**
- **📊 Vue d'ensemble** - Stats, taux d'ouverture, envois récents
- **📝 Templates** - Gérer les templates de messages
- **📅 Planifiés** - Voir et gérer les notifications programmées
- **📤 Envoi manuel** - Composer et envoyer
- **⚙️ Paramètres** - Configurer les rappels auto

**Features clés:**
- Tableau de bord avec métriques en temps réel
- Composer un message et envoyer instantanément
- Planifier des envois (date/heure)
- Filtrer destinataires (status RSVP, tags, etc.)
- Prévisualisation avant envoi
- Historique complet des envois

### 2. Page `/admin/settings/notifications`

**Configuration:**
- Configurer Twilio (API key, phone number)
- Configurer Firebase (server key)
- Définir templates par défaut
- Paramètres rappels automatiques
- Budget/Limits SMS

---

## 🔌 API ROUTES

### 1. `/api/admin/events/[id]/notifications`
- `GET` - Liste des notifications
- `POST` - Envoyer notification

### 2. `/api/admin/events/[id]/notifications/[notificationId]`
- `GET` - Détails notification
- `DELETE` - Annuler notification

### 3. `/api/admin/notifications/templates`
- `GET` - Liste templates
- `POST` - Créer template
- `PUT /[id]` - Modifier template
- `DELETE /[id]` - Supprimer template

### 4. `/api/guest/notifications/subscribe` (Public)
- `POST` - S'abonner aux push notifications

### 5. `/api/cron/process-notifications`
- Cron job pour envoyer notifications programmées

---

## 📱 PUSH NOTIFICATIONS SETUP

### Service Worker `/public/sw.js`
```javascript
self.addEventListener('push', function(event) {
  const data = event.data.json()
  const options = {
    body: data.body,
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url,
      eventId: data.eventId
    }
  }

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  )
})
```

### Client Subscription
```typescript
async function subscribeUser() {
  const registration = await navigator.serviceWorker.register('/sw.js')
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: VAPID_PUBLIC_KEY
  })

  // Save to backend
  await fetch('/api/guest/notifications/subscribe', {
    method: 'POST',
    body: JSON.stringify(subscription)
  })
}
```

---

## 🚀 PLAN D'IMPLÉMENTATION (2-3 semaines)

### Semaine 1: Foundation
- [ ] Créer modèles Prisma (NotificationTemplate, Notification, etc.)
- [ ] Migration base de données
- [ ] Setup Twilio account + test SMS
- [ ] Setup Firebase + test push
- [ ] Créer NotificationService (SMS + Push)
- [ ] Tests unitaires service

### Semaine 2: Features Core
- [ ] API routes CRUD notifications
- [ ] Templates système (RSVP, reminders, etc.)
- [ ] Interface admin - Vue d'ensemble
- [ ] Interface admin - Envoi manuel
- [ ] Interface admin - Templates
- [ ] Scheduler pour rappels auto

### Semaine 3: Polish & Advanced
- [ ] Interface admin - Planification
- [ ] Dashboard analytics (taux ouverture, etc.)
- [ ] Push notifications setup (service worker)
- [ ] Page invité - Gérer préférences
- [ ] Tests E2E
- [ ] Documentation

---

## 💰 COÛTS

### SMS (Twilio)
- France: €0.08/SMS
- 1000 SMS/mois = €80/mois
- **Recommandation:** Facturer clients €0.10-0.12/SMS

### Push Notifications
- Firebase FCM: **GRATUIT** ✅
- Illimité!

### Total estimé
- Setup initial: 0€ (juste dev time)
- Variable: SMS uniquement
- **ROI:** Facturable comme option premium

---

## 🎯 TEMPLATES PAR DÉFAUT À CRÉER

### 1. RSVP & Confirmations
- ✅ Confirmation présence
- ✅ Confirmation déclin
- ✅ QR code envoyé
- ✅ Modification RSVP

### 2. Rappels Événements
- 📅 Rappel 7 jours avant
- 📅 Rappel 24h avant
- 📅 Rappel 2h avant (jour J)
- 📅 C'est maintenant! (début événement)

### 3. Logistique
- 🚗 Info transport
- 🏨 Info hébergement
- 🍽️ Rappel repas
- ✅ Check-in ouvert

### 4. Updates
- ⚠️ Changement dernière minute
- 📍 Changement lieu
- ⏰ Changement horaire
- ❌ Événement annulé

### 5. Post-Événement
- 🙏 Remerciements
- 📊 Sondage satisfaction
- 📸 Photos disponibles
- 📅 Prochain événement

---

## 🔒 SÉCURITÉ & COMPLIANCE

### RGPD
- ✅ Opt-in explicite pour SMS
- ✅ Opt-out facile (lien STOP)
- ✅ Conservation données limitée
- ✅ Gestion préférences par invité

### Vérification Téléphone
- Envoi code OTP
- Vérification avant activation SMS
- Protection anti-spam

### Rate Limiting
- Max 10 SMS/minute
- Max 100 SMS/heure
- Budget limits par événement

---

## 📊 MÉTRIQUES À TRACKER

### Performance
- Taux d'envoi (sent rate)
- Taux de livraison (delivery rate)
- Taux d'ouverture push (open rate)
- Taux de clic (click rate)
- Temps moyen de lecture

### Business
- Réduction no-shows
- Engagement événements
- Satisfaction clients (NPS)
- ROI notifications (€ facturé vs coût)

### Technique
- Latence envoi
- Erreurs provider
- Queue size
- Throughput

---

## 🎉 QUICK WINS IMMÉDIATS

### Phase 0 (1-2 jours) - MVP Test
1. Setup Twilio + envoyer 1 SMS test
2. Template "RSVP Confirmation"
3. Bouton admin "Envoyer confirmation SMS"
4. **Démo client** ✅

### Phase 1 (1 semaine) - Core
1. Tous les templates système
2. Envoi manuel complet
3. Stats basiques
4. **Production ready** ✅

### Phase 2 (2 semaines) - Complete
1. Rappels automatiques
2. Push notifications
3. Analytics avancées
4. **Feature complète** ✅

---

**Prêt à démarrer? On commence par quoi:**
1. **Setup Twilio + Premier SMS** (2h)
2. **Modèles Prisma** (1h)
3. **Service de base** (3h)
4. **Interface admin MVP** (4h)

**Ou je fais tout d'un coup?** 🚀
