# Guide du Système de Modules

## 📦 Vue d'ensemble

Le système de modules permet d'activer/désactiver des fonctionnalités avancées pour chaque événement. Chaque module peut avoir sa propre configuration.

## 🎯 Modules Disponibles

### 1. **Transport & Déplacements** ✈️
Gérer les vols, trains, navettes et transferts des participants.

**Fonctionnalités:**
- Réservations de transport (vols, trains, navettes)
- Manifestes de transport avec capacité
- Gestion des départs/arrivées
- Calcul des coûts

**Configuration:**
- `allowGuestBooking`: Permettre aux invités de réserver
- `requireApproval`: Nécessite une approbation admin
- `defaultCurrency`: Devise par défaut (EUR, USD, GBP, CHF)
- `notificationEmails`: Emails de notification

### 2. **Hébergement** 🏨
Gérer les hôtels et l'attribution des chambres.

**Fonctionnalités:**
- Gestion des hébergements
- Attribution des chambres
- Types de chambres (simple, double, suite)
- Check-in/check-out

**Configuration:**
- `allowRoomPreferences`: Permettre les préférences
- `autoAssignment`: Attribution automatique
- `maxNightsPerGuest`: Nombre max de nuits

### 3. **Programme & Sessions** 📅
Organiser workshops, sessions et activités.

**Fonctionnalités:**
- Sessions programmées
- Inscription aux sessions
- Gestion de la capacité
- Timeline de l'événement

**Configuration:**
- `allowSessionRegistration`: Inscription aux sessions
- `showCapacity`: Afficher les places disponibles

### 4. **Gestion Budget** 📊
Suivre les coûts et générer des rapports.

**Configuration:**
- `currency`: Devise
- `budgetAlertThreshold`: Seuil d'alerte (%)

### 5. **Inscription & Facturation** 💼
Workflow d'inscription et facturation B2B.

**Configuration:**
- `requirePayment`: Paiement requis
- `paymentProvider`: Fournisseur (Stripe, PayPal, Square)
- `defaultAmount`: Montant par défaut

### 6. **Multi-langue** 🌍
Interface et emails en plusieurs langues.

**Configuration:**
- `enabledLanguages`: Langues activées (fr,en,es,de)
- `defaultLanguage`: Langue par défaut

## 🚀 Utilisation

### Activer un module

```typescript
import { ModuleManager } from '@/components/modules'

// Dans une page
<ModuleManager eventId={eventId} />
```

### Vérifier si un module est actif (côté client)

```typescript
import { useEventModules } from '@/lib/modules'

function MyComponent({ eventId }: { eventId: string }) {
  const { hasModule, hasAnyLogistic } = useEventModules(eventId)

  if (hasModule('TRANSPORT')) {
    // Afficher les fonctionnalités de transport
  }

  if (hasAnyLogistic) {
    // Au moins un module logistique est actif
  }
}
```

### Vérifier si un module est actif (côté serveur)

```typescript
import { hasModule, requireModule } from '@/lib/modules/helpers'

// Vérifier si actif
const isActive = await hasModule(eventId, 'TRANSPORT')

// Exiger qu'un module soit actif (lance une erreur si pas actif)
await requireModule(eventId, 'TRANSPORT')
```

### Configurer un module

```typescript
import { ModuleConfigEditor } from '@/components/modules'

<ModuleConfigEditor
  eventId={eventId}
  moduleType="TRANSPORT"
  initialConfig={currentConfig}
  onSave={() => console.log('Saved!')}
/>
```

### Afficher le statut des modules sur le dashboard

```typescript
import { ModuleStatusWidget } from '@/components/modules'

<ModuleStatusWidget eventId={eventId} />
```

## 🔒 Permissions et Validations

### Protéger une route API

```typescript
import { requireModule } from '@/lib/modules/permissions'

export async function POST(request: Request) {
  // S'assurer que le module TRANSPORT est actif
  await requireModule(eventId, 'TRANSPORT')

  // Votre code ici
}
```

### Valider une configuration

```typescript
import { validateModuleConfig } from '@/lib/modules/permissions'

const validation = validateModuleConfig('TRANSPORT', {
  defaultCurrency: 'EUR',
  notificationEmails: 'admin@example.com'
})

if (!validation.valid) {
  console.error('Errors:', validation.errors)
}
```

## 📁 Structure des Fichiers

```
lib/modules/
├── types.ts              # Types et enums
├── helpers.ts            # Fonctions serveur (hasModule, activateModule, etc.)
├── use-event-modules.ts  # Hook React client
├── permissions.ts        # Validations et permissions
└── index.ts              # Exports centralisés

components/modules/
├── module-manager.tsx           # Interface complète de gestion
├── module-status-widget.tsx     # Widget pour le dashboard
├── module-config-editor.tsx     # Éditeur de configuration
└── index.ts                     # Exports centralisés

app/admin/events/[id]/modules/
└── page.tsx              # Page de gestion des modules

app/api/admin/events/[id]/modules/
└── route.ts              # API GET/POST pour les modules
```

## 🎨 Interface Utilisateur

### Page de gestion
Accessible via `/admin/events/[id]/modules`

**Fonctionnalités:**
- Vue par catégorie (Logistique, Programme, Financier, Communication)
- Toggle on/off pour chaque module
- Badges de statut (Actif, Bientôt disponible)
- Statistiques des modules actifs

### Widget Dashboard
Affiche un résumé des modules actifs avec lien vers la page de gestion.

### Éditeur de Configuration
Interface dynamique adaptée à chaque type de module avec:
- Switches pour les options booléennes
- Inputs pour les valeurs textuelles/numériques
- Selects pour les choix prédéfinis
- Validation en temps réel

## 🔄 API

### GET `/api/admin/events/[id]/modules`
Récupère tous les modules d'un événement.

**Réponse:**
```json
{
  "success": true,
  "modules": [
    {
      "type": "TRANSPORT",
      "isActive": true,
      "config": { "defaultCurrency": "EUR" },
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### POST `/api/admin/events/[id]/modules`
Active/désactive ou configure un module.

**Body:**
```json
{
  "moduleType": "TRANSPORT",
  "isActive": true,
  "config": {
    "allowGuestBooking": true,
    "defaultCurrency": "EUR"
  }
}
```

**Réponse:**
```json
{
  "success": true,
  "module": {
    "type": "TRANSPORT",
    "isActive": true,
    "config": { ... }
  }
}
```

## 🛠️ Développement

### Ajouter un nouveau module

1. **Ajouter l'enum** dans `prisma/schema.prisma`:
```prisma
enum ModuleType {
  // ...
  NEW_MODULE
}
```

2. **Ajouter la définition** dans `lib/modules/types.ts`:
```typescript
export const AVAILABLE_MODULES: ModuleInfo[] = [
  // ...
  {
    type: 'NEW_MODULE',
    name: 'Nom du Module',
    description: 'Description',
    icon: '🔥',
    category: 'logistics',
    comingSoon: false
  }
]
```

3. **Ajouter la configuration** dans `components/modules/module-config-editor.tsx`:
```typescript
const MODULE_CONFIG_SCHEMAS = {
  // ...
  NEW_MODULE: {
    title: 'Configuration...',
    fields: [...]
  }
}
```

4. **Ajouter le validateur** dans `lib/modules/permissions.ts`:
```typescript
export const MODULE_CONFIG_VALIDATORS = {
  // ...
  NEW_MODULE: (config) => ({
    valid: true,
    errors: []
  })
}
```

5. **Migrer la base de données**:
```bash
npx prisma migrate dev
```

## 📊 Bonnes Pratiques

1. **Toujours vérifier** si un module est actif avant d'accéder à ses fonctionnalités
2. **Valider** les configurations avant de les sauvegarder
3. **Documenter** les nouvelles configurations dans ce guide
4. **Tester** les dépendances entre modules
5. **Gérer les erreurs** gracieusement si un module requis n'est pas actif

## 🐛 Dépannage

### Module ne s'active pas
- Vérifier les logs serveur pour les erreurs de validation
- S'assurer que les dépendances sont satisfaites
- Vérifier les permissions de l'utilisateur

### Configuration non sauvegardée
- Vérifier le format de la configuration
- Consulter la console pour les erreurs de validation
- Vérifier que l'API retourne bien `success: true`

### Module ne s'affiche pas
- Vérifier que `comingSoon` est à `false`
- Rafraîchir la page après modification de la base de données
- Vérifier que le hook `useEventModules` charge bien les données
