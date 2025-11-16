# 📱 SMS Notifications - Guide de Configuration et Utilisation

## ✅ Implémentation Complétée (MVP)

Système de notifications SMS complet avec Twilio, incluant :
- ✅ Base de données avec Prisma (modèles + migration)
- ✅ Service SMS avec Twilio SDK
- ✅ API route pour envoi SMS (/api/admin/events/[id]/notifications/send-sms)
- ✅ Interface admin avec dialogue d'envoi SMS
- ✅ Templates de messages pré-définis
- ✅ Historique et tracking des notifications

---

## 🚀 Configuration Initiale

### Étape 1: Variables d'environnement

Ajoutez ces variables dans votre fichier `.env` :

```bash
# Twilio Configuration
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+33612345678  # Votre numéro Twilio (format international)
```

**Où trouver ces informations ?**
1. Créez un compte Twilio : https://www.twilio.com/try-twilio
2. Accédez à votre Console : https://console.twilio.com/
3. Copiez votre Account SID et Auth Token
4. Achetez un numéro de téléphone Twilio (environ 1€/mois)

### Étape 2: Appliquer la migration de base de données

La migration a déjà été créée dans `prisma/migrations/20251116194155_add_sms_notifications/`

```bash
# Appliquer la migration en production
npx prisma migrate deploy

# OU en développement
npx prisma migrate dev
```

Cette migration ajoute :
- Enum `NotificationType` (SMS, EMAIL, PUSH)
- Enum `NotificationStatus` (PENDING, SENDING, SENT, DELIVERED, FAILED, CANCELLED)
- Table `Notification` pour tracking complet
- Champs `phone` et `phoneVerified` à la table `Guest`

### Étape 3: Vérifier l'installation

Vérifiez que le package Twilio est installé :

```bash
npm install twilio
```

---

## 📋 Utilisation de la Fonctionnalité SMS

### Interface Admin - Envoi de SMS

1. **Accédez à la page Invités** : `/admin/events/[eventId]/guests`

2. **Filtrez vos invités** (optionnel) :
   - Par statut RSVP (Confirmés, Déclinés, En attente)
   - Par tags
   - Par secteur, fonction, taille entreprise
   - Recherche par nom/email

3. **Cliquez sur "Envoyer SMS"** :
   - Le bouton affiche automatiquement le nombre d'invités avec numéro de téléphone
   - Les invités sans numéro sont ignorés (alerte affichée)

4. **Composez votre message** :
   - Choisissez un template pré-défini OU
   - Rédigez un message personnalisé
   - Visualisez le nombre de caractères et de SMS
   - Max 1600 caractères (10 SMS concaténés)

5. **Envoyez** :
   - Résultat en temps réel
   - Statistiques d'envoi (réussis / échoués)
   - Historique sauvegardé en base de données

### Templates de Messages Disponibles

#### 1. Confirmation RSVP
```
Bonjour ! Votre présence à {event_name} est confirmée.
Rendez-vous le {event_date}. À très bientôt !
```

#### 2. Rappel événement
```
Rappel : {event_name} a lieu demain !
Consultez votre invitation pour tous les détails. À demain !
```

#### 3. Information importante
```
Information importante concernant {event_name} :
```

#### 4. Message personnalisé
Rédigez votre propre message.

---

## 🔧 Fichiers Créés

### 1. `/lib/sms-service.ts` - Service SMS
Service principal pour l'envoi de SMS via Twilio.

**Fonctions principales :**
- `sendSMS(options)` - Envoyer un SMS à un invité
- `sendBulkSMS(recipients, eventId, message)` - Envoi groupé
- `getGuestNotifications(guestId)` - Historique invité
- `getEventNotifications(eventId)` - Historique événement
- `isTwilioConfigured()` - Vérifier configuration
- `formatPhoneNumber(phone)` - Formater au format E.164

**Exemple d'utilisation :**
```typescript
import { sendSMS } from '@/lib/sms-service'

const result = await sendSMS({
  to: '+33612345678',
  message: 'Bonjour ! Votre invitation est confirmée.',
  guestId: 'guest_123',
  eventId: 'event_456',
  templateName: 'RSVP Confirmation'
})

// result = { success: true, notificationId: 'xxx', providerId: 'SMxxx' }
```

### 2. `/app/api/admin/events/[id]/notifications/send-sms/route.ts` - API Route

**POST /api/admin/events/[eventId]/notifications/send-sms**

Envoie des SMS à une liste d'invités.

**Body :**
```json
{
  "guestIds": ["guest_1", "guest_2", "guest_3"],
  "message": "Votre message SMS ici",
  "templateName": "RSVP Confirmation" // optionnel
}
```

**Réponse succès :**
```json
{
  "success": true,
  "total": 10,
  "sent": 9,
  "failed": 1,
  "message": "SMS sent to 9 guests, 1 failed"
}
```

**GET /api/admin/events/[eventId]/notifications/send-sms**

Récupère l'historique et les stats des notifications SMS.

**Réponse :**
```json
{
  "configured": true,
  "stats": {
    "total": 50,
    "sent": 48,
    "failed": 2,
    "pending": 0
  },
  "notifications": [...]
}
```

### 3. `/components/send-sms-dialog.tsx` - Interface utilisateur

Dialogue modal pour composer et envoyer des SMS.

**Props :**
```typescript
interface SendSMSDialogProps {
  eventId: string
  guestIds: string[]
  guestsWithPhone: number
  totalGuests: number
}
```

**Fonctionnalités :**
- Sélection de templates
- Compteur de caractères et SMS
- Alerte si message > 160 caractères
- Validation avant envoi
- Résultat en temps réel

### 4. Migration Prisma

**Fichier :** `prisma/migrations/20251116194155_add_sms_notifications/migration.sql`

**Changements :**
- Ajout de `NotificationType` enum
- Ajout de `NotificationStatus` enum
- Création table `Notification`
- Ajout champs `phone` et `phoneVerified` à `Guest`
- Relations avec `Event` et `Guest`

---

## 📊 Modèle de Données

### Table Notification

```prisma
model Notification {
  id          String   @id @default(cuid())

  // Relations
  guestId     String
  guest       Guest    @relation(...)
  eventId     String
  event       Event    @relation(...)

  // Message
  type        NotificationType  // SMS, EMAIL, PUSH
  message     String   @db.Text
  subject     String?

  // Tracking
  status      NotificationStatus // PENDING, SENT, DELIVERED, FAILED
  sentAt      DateTime?
  deliveredAt DateTime?
  error       String?  @db.Text

  // Provider (Twilio)
  provider    String?
  providerId  String?  // Twilio Message SID
  providerResponse Json?

  // Metadata
  templateName String?
  metadata    Json?

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### Champs ajoutés à Guest

```prisma
model Guest {
  // ...
  phone         String?  // Format E.164: +33612345678
  phoneVerified Boolean  @default(false)
  notifications Notification[] @relation("GuestNotifications")
}
```

---

## 💰 Coûts Twilio (France)

### Tarification
- **SMS sortants France :** ~0,09€ par SMS
- **Numéro de téléphone :** ~1€/mois
- **Pas de frais cachés** - payez uniquement ce que vous utilisez

### Estimation de coûts

| Invités | SMS par mois | Coût mensuel |
|---------|--------------|--------------|
| 100     | 300          | ~28€         |
| 500     | 1500         | ~136€        |
| 1000    | 3000         | ~271€        |

*Base: 3 SMS par invité (confirmation, rappel J-7, rappel J-1)*

### Optimisation des coûts
1. **Limiter aux confirmés** : Envoyez uniquement aux invités ayant confirmé
2. **SMS courts** : Restez sous 160 caractères = 1 SMS au lieu de 2
3. **Timing intelligent** : Pas de rappels si déjà check-in fait
4. **Templates réutilisables** : Evitez de personnaliser chaque message

---

## 🧪 Tests

### Test 1: Configuration Twilio

```bash
# Dans votre console Node.js ou fichier de test
node
```

```javascript
const { Twilio } = require('twilio')

const client = new Twilio(
  'ACxxxxxxxx', // Votre Account SID
  'xxxxxxxx'    // Votre Auth Token
)

client.messages
  .create({
    body: 'Test SMS depuis Weevup !',
    from: '+33612345678', // Votre numéro Twilio
    to: '+33600000000'    // Votre numéro de test
  })
  .then(message => console.log('✅ SMS envoyé:', message.sid))
  .catch(error => console.error('❌ Erreur:', error))
```

### Test 2: API Route (cURL)

```bash
curl -X POST http://localhost:3000/api/admin/events/YOUR_EVENT_ID/notifications/send-sms \
  -H "Content-Type: application/json" \
  -H "Cookie: your-auth-cookie" \
  -d '{
    "guestIds": ["guest_id_1", "guest_id_2"],
    "message": "Test SMS via API",
    "templateName": "Test"
  }'
```

### Test 3: Interface Admin

1. Créez un invité avec votre numéro de téléphone
2. Accédez à `/admin/events/[eventId]/guests`
3. Cliquez sur "Envoyer SMS"
4. Envoyez un message de test
5. Vérifiez réception sur votre téléphone
6. Vérifiez l'historique dans le dashboard

---

## 🔍 Monitoring et Logs

### Logs applicatifs

Tous les événements SMS sont loggés via Pino :

```bash
# Afficher les logs SMS
cat logs/app.log | grep "SMS"

# Logs en temps réel
tail -f logs/app.log | grep "notification"
```

### Dashboard Twilio

1. Console Twilio: https://console.twilio.com/
2. Menu "Messaging" > "Logs"
3. Voir tous les SMS envoyés, leur statut, coûts

### Requêtes base de données

```sql
-- Stats globales
SELECT
  status,
  COUNT(*) as count
FROM "Notification"
WHERE type = 'SMS'
GROUP BY status;

-- SMS échoués récents
SELECT
  n.message,
  n.error,
  n.createdAt,
  g."firstName",
  g."lastName",
  g.phone
FROM "Notification" n
JOIN "Guest" g ON g.id = n."guestId"
WHERE n.status = 'FAILED'
ORDER BY n.createdAt DESC
LIMIT 10;

-- Stats par événement
SELECT
  e.name,
  COUNT(*) as sms_count,
  SUM(CASE WHEN n.status = 'SENT' THEN 1 ELSE 0 END) as sent,
  SUM(CASE WHEN n.status = 'FAILED' THEN 1 ELSE 0 END) as failed
FROM "Notification" n
JOIN "Event" e ON e.id = n."eventId"
WHERE n.type = 'SMS'
GROUP BY e.id, e.name;
```

---

## 🛡️ Sécurité et Bonnes Pratiques

### 1. Protection des credentials Twilio

✅ **Fait automatiquement** :
- Credentials stockés dans `.env` (gitignored)
- Jamais exposés côté client
- Variables d'environnement serveur uniquement

### 2. Rate Limiting

⚠️ **À implémenter** (optionnel, pour production) :

```typescript
// Ajouter dans /lib/sms-service.ts
const RATE_LIMIT = {
  maxPerMinute: 60,  // Max 60 SMS/min
  maxPerHour: 1000,  // Max 1000 SMS/heure
}

// Implémenter avec redis ou upstash
```

### 3. Validation numéros de téléphone

✅ **Fait automatiquement** :
- Format E.164 requis (+33...)
- Validation via regex
- Formatage automatique des numéros français

### 4. RGPD et Consentement

⚠️ **À ajouter** (si nécessaire) :

```typescript
// Ajouter dans Guest model
model Guest {
  // ...
  consentSMS Boolean @default(false)
  consentSMSDate DateTime?
}

// Vérifier avant envoi
if (!guest.consentSMS) {
  logger.warn({ guestId }, 'No SMS consent')
  continue
}
```

### 5. Opt-out automatique

```typescript
// Ajouter dans message
const message = `${content}\n\nRépondez STOP pour ne plus recevoir de SMS.`

// Twilio gère automatiquement les STOP
```

---

## 🐛 Dépannage

### Problème: "Twilio credentials not configured"

**Solution :**
```bash
# Vérifier variables d'environnement
echo $TWILIO_ACCOUNT_SID
echo $TWILIO_AUTH_TOKEN
echo $TWILIO_PHONE_NUMBER

# Redémarrer l'application après modification .env
npm run dev
```

### Problème: "Invalid phone number format"

**Solution :**
- Format requis: `+33612345678` (E.164)
- Pas d'espaces, tirets ou parenthèses
- Toujours commencer par `+` et code pays

**Correction automatique :**
```typescript
import { formatPhoneNumber } from '@/lib/sms-service'

const formatted = formatPhoneNumber('06 12 34 56 78') // → +33612345678
```

### Problème: SMS non reçus

**Checklist :**
1. ✅ Vérifier solde Twilio (Console > Billing)
2. ✅ Numéro destinataire valide et actif
3. ✅ Numéro expéditeur Twilio vérifié
4. ✅ Vérifier logs Twilio (Console > Messaging > Logs)
5. ✅ Vérifier status en BDD (`SELECT * FROM "Notification" WHERE status = 'FAILED'`)

### Problème: "403 Forbidden" Twilio

**Causes possibles :**
- Auth Token invalide
- Account SID incorrect
- Compte Twilio suspendu (paiement en attente)

**Solution :**
1. Générer nouveau Auth Token (Console > API Keys)
2. Mettre à jour `.env`
3. Redémarrer application

---

## 📈 Prochaines Étapes (Améliorations Futures)

### Phase 2: Fonctionnalités Avancées

1. **Notifications Push Web**
   - Service Workers
   - Firebase Cloud Messaging
   - Notifications navigateur desktop/mobile

2. **Planification SMS**
   - Envoi programmé (J-7, J-1, J-Hour)
   - Auto-rappels pour non-répondants
   - SMS post-événement (feedback)

3. **Personnalisation avancée**
   - Variables dynamiques ({firstName}, {eventDate})
   - A/B testing messages
   - Tracking taux d'ouverture liens

4. **Analytics Dashboard**
   - Taux de livraison
   - Coûts par événement
   - ROI notifications

5. **Multi-canal**
   - Email + SMS synchronisés
   - Préférences invités (canal favori)
   - Fallback automatique (SMS si email bounce)

### Quick Wins Additionnels

- [ ] Ajouter champ "Téléphone" dans formulaire import CSV
- [ ] Bouton "Envoyer SMS" dans page détails invité
- [ ] Template "Invitation dernière minute" (J-1)
- [ ] Export liste invités avec/sans téléphone
- [ ] Statistiques SMS dans dashboard événement

---

## 📞 Support

### Documentation Twilio
- Guide démarrage: https://www.twilio.com/docs/sms/quickstart
- API Reference: https://www.twilio.com/docs/sms/api
- Pricing: https://www.twilio.com/sms/pricing

### Code & Issues
- Voir `/NOTIFICATION_SYSTEM_PLAN.md` pour architecture complète
- Logs détaillés dans `/lib/logger.ts`

---

## ✅ Checklist de Déploiement

Avant de déployer en production :

- [ ] Variables Twilio configurées dans `.env.production`
- [ ] Migration Prisma appliquée (`npx prisma migrate deploy`)
- [ ] Test SMS envoyé avec succès
- [ ] Solde Twilio suffisant (min 50€)
- [ ] Monitoring configuré (logs, alertes)
- [ ] RGPD: Consentement SMS ajouté au formulaire invités
- [ ] Rate limiting activé (optionnel)
- [ ] Backup base de données avant migration

---

**Date de création:** 16 Novembre 2025
**Version:** 1.0.0 (MVP)
**Status:** ✅ Ready for deployment (pending Prisma migration)
