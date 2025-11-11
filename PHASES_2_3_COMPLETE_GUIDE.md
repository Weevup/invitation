# 🎯 Phases 2 & 3 - Guide Complet

## ✅ Phase 1 Recap (Déjà fait)

- ✅ Fix SendGrid avec ENCRYPTION_KEY permanente
- ✅ Nettoyage code legacy (ancien système email)
- ✅ Seeds production-safe (préserve les admins)
- ✅ Documentation rappels dans Communications

---

## 🎨 Phase 2 - Navigation UX (TERMINÉE)

### Ce qui a été fait

**Navigation réorganisée en 3 sections logiques :**

```
┌─────────────────────────┐
│ GESTION ÉVÉNEMENT       │  ← Section 1
├─────────────────────────┤
│ 📊 Vue d'ensemble       │
│ ✨ Showcase             │
│ 👥 Invités              │
│ ✓  Check-in             │
│                         │
├─────────────────────────┤
│ EMAIL & COMMUNICATIONS  │  ← Section 2
├─────────────────────────┤
│ 🔔 Save the Date        │
│ 💌 Invitation           │
│ ✅ RSVP                 │
│ 📨 Envoi & Suivi        │  ← Renommé de "Communications"
│                         │
├─────────────────────────┤
│ MODULES AVANCÉS         │  ← Section 3 (conditionnelle)
├─────────────────────────┤
│ 📈 Dashboard Planif.    │
│ 📅 Programme            │
│ ✈️  Transport           │
│ 🏨 Hébergement          │
└─────────────────────────┘
```

**Avantages :**
- ✅ Groupement visuel clair des fonctionnalités liées
- ✅ "Envoi & Suivi" plus explicite que "Communications"
- ✅ Séparateurs visuels entre sections
- ✅ Aucun breaking change (toutes les URLs identiques)
- ✅ Meilleure lisibilité pour les utilisateurs

**Fichier modifié :** `/app/admin/events/[id]/layout.tsx`

---

## 🚀 Phase 3 - Scheduled Emails (EN COURS)

### Infrastructure Database (TERMINÉE)

**Nouveaux modèles Prisma créés :**

#### 1. `ScheduledEmail` - Queue d'emails programmés

```prisma
model ScheduledEmail {
  id           String               @id @default(cuid())
  eventId      String
  type         EmailType            // SAVE_THE_DATE, INVITE, REMINDER, FOLLOW_UP
  guestIds     String[]             // Array of guest IDs to send to
  scheduledFor DateTime             // Quand envoyer
  status       ScheduledEmailStatus @default(PENDING)
  templateId   String?              // Optional template
  sentAt       DateTime?
  errorMessage String?

  event        Event @relation("EventScheduledEmails", fields: [eventId], references: [id])
}

enum ScheduledEmailStatus {
  PENDING      // En attente
  PROCESSING   // En cours d'envoi
  SENT         // Envoyé avec succès
  FAILED       // Échec
  CANCELLED    // Annulé par l'utilisateur
}
```

#### 2. `EventRemindersConfig` - Config auto-reminders par événement

```prisma
model EventRemindersConfig {
  id                 String  @id @default(cuid())
  eventId            String  @unique
  enabled            Boolean @default(false)

  // Follow-up pour non-répondants
  followUpEnabled    Boolean @default(false)
  followUpDays       Int?    // Jours après invitation

  // Rappel avant événement pour confirmés
  preEventEnabled    Boolean @default(false)
  preEventDays       Int?    // Jours avant événement

  event Event @relation("EventRemindersConfig", fields: [eventId], references: [id])
}
```

**Relations ajoutées au modèle Event :**
```prisma
model Event {
  // ... champs existants ...

  // Phase 3
  scheduledEmails   ScheduledEmail[]      @relation("EventScheduledEmails")
  remindersConfig   EventRemindersConfig? @relation("EventRemindersConfig")
}
```

---

### APIs à créer (EN COURS)

#### 1. API Schedule Emails - `PUT /api/admin/events/[id]/send-emails`

**Modifier l'API existante pour :**
- ✅ Envoi immédiat (déjà fonctionnel)
- ⏰ **NOUVEAU** : Sauvegarder en base si `scheduleFor` fourni

```typescript
// Au lieu de retourner un faux succès
if (scheduleFor) {
  // AVANT (Phase 1):
  return NextResponse.json({
    success: true,
    message: `Envoi programmé pour ${date}`,
    scheduledCount: event.guests.length,
  });

  // APRÈS (Phase 3):
  const scheduled = await prisma.scheduledEmail.create({
    data: {
      eventId,
      type,
      guestIds: guestIds || event.guests.map(g => g.id),
      scheduledFor: new Date(scheduleFor),
      templateId,
      status: 'PENDING',
    },
  });

  return NextResponse.json({
    success: true,
    scheduledEmail: scheduled,
    message: `Email programmé pour le ${formatted}`,
  });
}
```

#### 2. API Reminders Config - `POST/GET /api/admin/events/[id]/reminders-config`

**Nouvelle API pour :**
- GET : Récupérer la config actuelle
- POST : Sauvegarder/mettre à jour la config

```typescript
// GET
export async function GET(request, { params }) {
  const { id } = await params;

  const config = await prisma.eventRemindersConfig.findUnique({
    where: { eventId: id },
  });

  return NextResponse.json(config || {
    enabled: false,
    followUpEnabled: false,
    preEventEnabled: false,
  });
}

// POST
export async function POST(request, { params }) {
  const { id } = await params;
  const body = await request.json();

  const config = await prisma.eventRemindersConfig.upsert({
    where: { eventId: id },
    update: body,
    create: { eventId: id, ...body },
  });

  return NextResponse.json(config);
}
```

#### 3. Vercel Cron Job - `/api/cron/process-scheduled-emails`

**Job qui s'exécute toutes les 5 minutes :**

```typescript
// app/api/cron/process-scheduled-emails/route.ts
export async function GET(request: NextRequest) {
  // Vérifier le secret Vercel Cron
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Trouver les emails à envoyer
  const now = new Date();
  const emailsToSend = await prisma.scheduledEmail.findMany({
    where: {
      status: 'PENDING',
      scheduledFor: { lte: now }, // <= maintenant
    },
    include: {
      event: true,
    },
  });

  const results = [];

  for (const scheduled of emailsToSend) {
    try {
      // Marquer comme PROCESSING
      await prisma.scheduledEmail.update({
        where: { id: scheduled.id },
        data: { status: 'PROCESSING' },
      });

      // Récupérer les invités
      const guests = await prisma.guest.findMany({
        where: { id: { in: scheduled.guestIds } },
      });

      // Récupérer l'intégration email
      const integration = await prisma.emailIntegration.findFirst({
        where: { isPrimary: true, isActive: true },
      });

      if (!integration) {
        throw new Error('No email integration configured');
      }

      // Envoyer les emails
      for (const guest of guests) {
        await sendEmail({
          to: guest.email,
          // ... données email ...
        }, integration);
      }

      // Marquer comme SENT
      await prisma.scheduledEmail.update({
        where: { id: scheduled.id },
        data: {
          status: 'SENT',
          sentAt: new Date(),
        },
      });

      results.push({ id: scheduled.id, success: true });
    } catch (error) {
      // Marquer comme FAILED
      await prisma.scheduledEmail.update({
        where: { id: scheduled.id },
        data: {
          status: 'FAILED',
          errorMessage: error.message,
        },
      });

      results.push({ id: scheduled.id, success: false, error: error.message });
    }
  }

  return NextResponse.json({
    processed: results.length,
    results,
  });
}
```

---

### Configuration Vercel Cron

**Créer `vercel.json` à la racine :**

```json
{
  "crons": [
    {
      "path": "/api/cron/process-scheduled-emails",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

**Variables d'environnement Vercel :**
```bash
CRON_SECRET="votre-secret-aleatoire-complexe"
```

**Générer le secret :**
```bash
openssl rand -base64 32
```

---

### Modifications UI à faire

#### Communications Page - Wire up les boutons

**Actuellement :** Les boutons "Envoyer maintenant" / "Programmer" ne font rien

**À faire :** Modifier `/app/admin/events/[id]/communications/page.tsx`

```typescript
const handleScheduleSaveTheDate = async () => {
  const response = await fetch(`/api/admin/events/${eventId}/send-emails`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'save-the-date',
      scheduleFor: saveTheDateSchedule, // Date choisie
      guestIds: [], // Tous les invités
    }),
  });

  if (response.ok) {
    toast.success('Save the Date programmé !');
  }
};

// Similaire pour Invitation et Reminder
```

#### Settings Tab - Sauvegarder auto-reminders

```typescript
const handleSaveReminders = async () => {
  const response = await fetch(`/api/admin/events/${eventId}/reminders-config`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(autoReminders),
  });

  if (response.ok) {
    toast.success('Paramètres sauvegardés !');
  }
};
```

---

## 🎯 Récapitulatif Complet

### ✅ Ce qui fonctionne MAINTENANT

1. **Navigation améliorée** - Sections visuelles claires
2. **Envois d'emails immédiats** - Save the Date, Invitation, Rappels
3. **SendGrid/Resend configuré** - Via interface /admin/settings/integrations
4. **Seeds production-safe** - npm run db:seed:production

### ⏳ Ce qui est EN COURS (Phase 3)

1. **Modèles Prisma** - ✅ Créés, en attente du rebuild Vercel
2. **APIs scheduling** - 🔨 À finaliser
3. **Vercel Cron** - 📝 À créer
4. **UI wiring** - 🔌 À connecter

### 📋 Prochaines étapes

1. **Attendre rebuild Vercel** avec nouveaux modèles Prisma
2. **Créer les APIs** pour scheduling et reminders config
3. **Créer le Vercel Cron** job
4. **Wire up la Communications** page aux APIs
5. **Tester** en production

---

## 🐛 Debugging

### Si les emails programmés ne s'envoient pas

```bash
# Vérifier les logs Vercel
vercel logs --follow

# Vérifier manuellement la queue
npx prisma studio
# → ScheduledEmail table → Filtrer par status: PENDING
```

### Si le cron ne tourne pas

1. Vérifier `vercel.json` est commité
2. Vérifier `CRON_SECRET` dans Vercel env vars
3. Vérifier les logs dans Vercel Dashboard → Cron Jobs

---

## 📚 Documentation additionnelle

- [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)
- [Prisma Relations](https://www.prisma.io/docs/concepts/components/prisma-schema/relations)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)

