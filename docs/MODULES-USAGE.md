# 📦 Système Modulaire - Guide d'Utilisation

Guide rapide pour utiliser le système modulaire Phase 2.

---

## 🎯 Concept

Le système modulaire permet d'activer/désactiver des fonctionnalités avancées **par événement**:
- Transport & Déplacements
- Hébergement
- Programme & Sessions
- Budget
- Inscription & Facturation
- Multi-langue

**Par défaut:** Aucun module activé = Interface simple (Phase 1)
**Sur demande:** Activer modules = Fonctionnalités apparaissent

---

## 🔧 Utilisation Côté Serveur

### Vérifier si un module est actif

```typescript
import { hasModule } from '@/lib/modules'

// Dans un Server Component ou API Route
const hasTransport = await hasModule(eventId, 'TRANSPORT')

if (hasTransport) {
  // Afficher les options de transport
}
```

### Récupérer tous les modules actifs

```typescript
import { getActiveModules } from '@/lib/modules'

const modules = await getActiveModules(eventId)
// Retourne: [{ moduleType: 'TRANSPORT', config: {...}, ... }]
```

### Activer un module

```typescript
import { activateModule } from '@/lib/modules'

await activateModule(eventId, 'TRANSPORT', {
  // Config optionnelle
  defaultCurrency: 'EUR'
})
```

### Désactiver un module

```typescript
import { deactivateModule } from '@/lib/modules'

await deactivateModule(eventId, 'TRANSPORT')
```

---

## 💻 Utilisation Côté Client (React)

### Hook useEventModules

```tsx
'use client'

import { useEventModules } from '@/lib/modules'

function MyComponent({ eventId }: { eventId: string }) {
  const { modules, hasModule, hasAnyLogistic, isLoading } = useEventModules(eventId)

  if (isLoading) return <div>Chargement...</div>

  return (
    <div>
      {hasModule('TRANSPORT') && (
        <TransportSection />
      )}

      {hasAnyLogistic && (
        <LogisticsMenu />
      )}
    </div>
  )
}
```

### Composant ModuleSelector

Pour afficher le sélecteur de modules dans un formulaire:

```tsx
import { ModuleSelector } from '@/components/admin/module-selector'

<ModuleSelector
  eventId={eventId}
  activeModules={['TRANSPORT']}
  onChange={(modules) => {
    console.log('Modules actifs:', modules)
  }}
/>
```

---

## 🗄️ Base de Données

### Structure EventModule

```typescript
{
  id: string
  eventId: string
  moduleType: 'TRANSPORT' | 'ACCOMMODATION' | 'PROGRAM' | 'BUDGET' | 'REGISTRATION_PAYMENT' | 'MULTILANG'
  isActive: boolean
  config?: {
    // Configuration spécifique au module
    [key: string]: any
  }
  createdAt: DateTime
  updatedAt: DateTime
}
```

### Unique Constraint

Un seul module de chaque type par événement:
```prisma
@@unique([eventId, moduleType])
```

---

## 🎨 UI Patterns

### Sections Conditionnelles

```tsx
import { hasModule } from '@/lib/modules'

// Dans un Server Component
const event = await prisma.event.findUnique({ where: { id } })
const showTransport = await hasModule(event.id, 'TRANSPORT')

return (
  <div>
    {/* Toujours affiché */}
    <GuestList />

    {/* Conditionnel */}
    {showTransport && (
      <TransportDashboard />
    )}
  </div>
)
```

### Sidebar Dynamique

```tsx
// components/admin/sidebar.tsx
const { hasModule, hasAnyLogistic } = useEventModules(eventId)

<Sidebar>
  <SidebarLink href="/admin">Dashboard</SidebarLink>
  <SidebarLink href="/admin/events">Événements</SidebarLink>

  {hasAnyLogistic && (
    <SidebarSection title="Logistique">
      {hasModule('TRANSPORT') && (
        <SidebarLink href="/admin/transport">Transport</SidebarLink>
      )}
      {hasModule('ACCOMMODATION') && (
        <SidebarLink href="/admin/accommodation">Hébergement</SidebarLink>
      )}
    </SidebarSection>
  )}
</Sidebar>
```

---

## 📊 Modules Disponibles

| Module | Type | Catégorie | Statut |
|--------|------|-----------|--------|
| ✈️ Transport | `TRANSPORT` | Logistique | ✅ Disponible |
| 🏨 Hébergement | `ACCOMMODATION` | Logistique | 🔜 Bientôt |
| 📅 Programme | `PROGRAM` | Programme | 🔜 Bientôt |
| 📊 Budget | `BUDGET` | Financier | 🔜 Bientôt |
| 💼 Inscription | `REGISTRATION_PAYMENT` | Financier | 🔜 Bientôt |
| 🌍 Multi-langue | `MULTILANG` | Communication | 🔜 Bientôt |

---

## 🚀 Ajouter un Nouveau Module

### 1. Ajouter le type dans Prisma

```prisma
enum ModuleType {
  // ... existants
  MY_NEW_MODULE
}
```

### 2. Ajouter dans les types TypeScript

```typescript
// lib/modules/types.ts
export const AVAILABLE_MODULES: ModuleInfo[] = [
  // ... existants
  {
    type: 'MY_NEW_MODULE',
    name: 'Mon Nouveau Module',
    description: 'Description du module',
    icon: '🎯',
    category: 'logistics'
  }
]
```

### 3. Créer les composants UI

```tsx
// components/admin/my-module/...
```

### 4. Ajouter les routes API si nécessaire

```typescript
// app/api/admin/my-module/route.ts
```

---

## ✅ Best Practices

1. **Toujours vérifier** si un module est actif avant d'afficher son UI
2. **Progressive disclosure**: Ne montrer que ce qui est utilisé
3. **Fallback gracieux**: Si module désactivé, ne pas crasher
4. **Loading states**: Utiliser `isLoading` du hook
5. **Erreur handling**: Gérer les erreurs d'API proprement

---

## 🐛 Debugging

### Vérifier les modules actifs dans la console

```typescript
const modules = await prisma.eventModule.findMany({
  where: { eventId: 'xxx' }
})
console.log('Active modules:', modules)
```

### Logs API

```bash
# Vérifier les logs Vercel
# Deployments → Runtime Logs
# Cherchez "modules" dans les logs
```

---

**Documentation mise à jour:** Novembre 2024
