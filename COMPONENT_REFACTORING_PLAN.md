# 🔧 Plan de Refactorisation des Gros Composants

**Date:** 2025-01-15
**Objectif:** Découper les composants +700 lignes en sous-composants réutilisables

---

## 📊 Composants à Refactoriser

### 1. `showcase-builder.tsx` (782 lignes) ⚠️  PRIORITÉ MOYENNE

**État actuel:**
- ✅ Déjà bien structuré avec plusieurs sous-composants importés
- ✅ Utilise GalleryEditor, FAQEditor, SpeakersEditor, SponsorsEditor, etc.
- ⚠️ Le composant principal fait encore ~400 lignes
- ⚠️ Reducer avec 20+ actions

**Refactorisation recommandée:**

```
showcase-builder.tsx (782 → 200 lignes)
├── hooks/
│   ├── use-showcase-data.ts (reducer + logique)
│   └── use-showcase-save.ts (logique de sauvegarde)
├── components/
│   ├── ShowcaseHeader.tsx (titre, switch enabled)
│   ├── ShowcaseThemeSelector.tsx (sélection thème/couleurs)
│   ├── ShowcaseSectionsManager.tsx (gestion sections)
│   └── ShowcasePreviewActions.tsx (boutons preview/save)
└── showcase-builder.tsx (orchestration uniquement)
```

**Extractions:**
1. **Reducer → Custom Hook**
   ```typescript
   // hooks/use-showcase-data.ts
   export function useShowcaseData(initialData) {
     const [state, dispatch] = useReducer(showcaseReducer, initialState)
     return { data: state, updateData: dispatch }
   }
   ```

2. **Logique de sauvegarde → Custom Hook**
   ```typescript
   // hooks/use-showcase-save.ts
   export function useShowcaseSave(eventId: string) {
     const [saving, setSaving] = useState(false)
     const save = async (data) => { /* ... */ }
     return { save, saving }
   }
   ```

3. **Header Section → Component**
   ```typescript
   // components/ShowcaseHeader.tsx
   export function ShowcaseHeader({ enabled, onToggle, title, onTitleChange }) {
     return (/* ... */)
   }
   ```

**Impact:**
- Lisibilité: ⭐⭐⭐ (3/5) - Déjà bon, peut être amélioré
- Réutilisabilité: ⭐⭐⭐⭐ (4/5)
- Maintenabilité: ⭐⭐⭐⭐ (4/5)

---

### 2. `transport-booking-details-dialog.tsx` (760 lignes) 🔴 PRIORITÉ HAUTE

**État actuel:**
- ❌ Un seul gros composant monolithique
- ❌ Mélange de logique métier et UI
- ❌ Plusieurs formulaires complexes dans le même fichier
- ❌ Difficile à tester et maintenir

**Refactorisation recommandée:**

```
transport-booking-details-dialog/
├── index.tsx (200 lignes - orchestration)
├── components/
│   ├── BookingHeader.tsx (header avec statut)
│   ├── GuestDetailsSection.tsx (info invité)
│   ├── TravelInfoSection.tsx (train/avion)
│   ├── AccommodationSection.tsx (hébergement)
│   ├── ShuttleSection.tsx (navettes)
│   └── BookingActions.tsx (boutons save/cancel)
├── forms/
│   ├── FlightForm.tsx
│   ├── TrainForm.tsx
│   ├── AccommodationForm.tsx
│   └── ShuttleForm.tsx
└── hooks/
    ├── use-booking-data.ts
    └── use-booking-save.ts
```

**Extractions prioritaires:**

1. **Formulaire Vol → Component**
   ```typescript
   // forms/FlightForm.tsx
   export function FlightForm({ value, onChange }) {
     return (
       <div className="space-y-4">
         <Input label="N° de vol" />
         <Input label="Heure d'arrivée" type="time" />
         <Input label="Aéroport" />
       </div>
     )
   }
   ```

2. **Formulaire Train → Component**
   ```typescript
   // forms/TrainForm.tsx
   export function TrainForm({ value, onChange }) {
     return (/* ... */)
   }
   ```

3. **Section Hébergement → Component**
   ```typescript
   // components/AccommodationSection.tsx
   export function AccommodationSection({ booking, onChange }) {
     return (/* ... */)
   }
   ```

**Impact:**
- Lisibilité: ⭐⭐⭐⭐⭐ (5/5) - Amélioration majeure
- Réutilisabilité: ⭐⭐⭐⭐⭐ (5/5) - Forms réutilisables
- Maintenabilité: ⭐⭐⭐⭐⭐ (5/5) - Beaucoup plus facile

---

### 3. `program-builder.tsx` (703 lignes) 🔴 PRIORITÉ HAUTE

**État actuel:**
- ❌ Logique complexe de drag-and-drop mélangée avec UI
- ❌ Calculs de position/temps dans le composant
- ❌ Gestion manuelle du state pour drag/resize
- ❌ Pas de séparation entre logique métier et rendu

**Refactorisation recommandée:**

```
program-builder/
├── index.tsx (150 lignes - orchestration)
├── components/
│   ├── ProgramTimeline.tsx (timeline visuelle)
│   ├── SessionCard.tsx (carte session)
│   ├── TimeGrid.tsx (grille horaire)
│   ├── DayColumn.tsx (colonne par jour)
│   └── SessionEditorDialog.tsx (dialog édition)
├── hooks/
│   ├── use-program-drag-drop.ts (logique drag & drop)
│   ├── use-session-positioning.ts (calculs position)
│   └── use-sessions-api.ts (API calls)
└── utils/
    ├── time-calculations.ts (utils temps)
    ├── snap-to-grid.ts (snap intervals)
    └── session-validation.ts (validation)
```

**Extractions prioritaires:**

1. **Calculs de Position → Utils**
   ```typescript
   // utils/time-calculations.ts
   export function getSessionPosition(session: Session, config: TimelineConfig) {
     const start = new Date(session.startTime)
     const hours = start.getHours() + start.getMinutes() / 60
     const offsetFromStart = hours - config.timeStart
     const top = Math.max(0, offsetFromStart * config.hourHeight)
     const durationHours = session.duration / 60
     const height = Math.max(config.minHeight, durationHours * config.hourHeight)
     return { top, height }
   }

   export function getTimeFromPosition(top: number, day: Date, config: TimelineConfig) {
     const hours = config.timeStart + (top / config.hourHeight)
     const newTime = new Date(day)
     newTime.setHours(Math.floor(hours))
     newTime.setMinutes(Math.round((hours % 1) * 60))
     return snapToInterval(newTime, config.snapInterval)
   }

   export function snapToInterval(date: Date, interval: number): Date {
     const minutes = date.getMinutes()
     const snappedMinutes = Math.round(minutes / interval) * interval
     const newDate = new Date(date)
     newDate.setMinutes(snappedMinutes, 0, 0)
     return newDate
   }
   ```

2. **Logique Drag & Drop → Custom Hook**
   ```typescript
   // hooks/use-program-drag-drop.ts
   export function useProgramDragDrop(sessions: Session[], onUpdate: () => void) {
     const [draggedSession, setDraggedSession] = useState<Session | null>(null)
     const [dragOverTime, setDragOverTime] = useState<Date | null>(null)

     const handleDragStart = useCallback((session: Session) => {
       setDraggedSession(session)
     }, [])

     const handleDragOver = useCallback((e: DragEvent, day: string) => {
       // Logic...
     }, [])

     const handleDrop = useCallback(async (e: DragEvent) => {
       // Logic...
     }, [draggedSession, onUpdate])

     return {
       draggedSession,
       dragOverTime,
       handleDragStart,
       handleDragOver,
       handleDrop
     }
   }
   ```

3. **SessionCard → Component**
   ```typescript
   // components/SessionCard.tsx
   export function SessionCard({
     session,
     position,
     onEdit,
     onDelete,
     onDragStart,
   }: SessionCardProps) {
     const { top, height } = position
     const Icon = SESSION_ICONS[session.type] || Clock

     return (
       <div
         className="absolute left-0 right-0 rounded-lg p-3 cursor-move"
         style={{
           top: `${top}px`,
           height: `${height}px`,
           backgroundColor: session.color || SESSION_COLORS[session.type]
         }}
         draggable
         onDragStart={() => onDragStart(session)}
       >
         {/* Card content */}
       </div>
     )
   }
   ```

4. **TimeGrid → Component**
   ```typescript
   // components/TimeGrid.tsx
   export function TimeGrid({ startHour, endHour, hourHeight }: TimeGridProps) {
     const hours = Array.from({ length: endHour - startHour }, (_, i) => startHour + i)

     return (
       <div className="relative">
         {hours.map(hour => (
           <div
             key={hour}
             className="border-t border-gray-200"
             style={{ height: `${hourHeight}px` }}
           >
             <span className="text-xs text-gray-500">
               {hour}:00
             </span>
           </div>
         ))}
       </div>
     )
   }
   ```

**Impact:**
- Lisibilité: ⭐⭐⭐⭐⭐ (5/5) - Séparation claire logique/UI
- Réutilisabilité: ⭐⭐⭐⭐ (4/5) - TimeGrid et SessionCard réutilisables
- Maintenabilité: ⭐⭐⭐⭐⭐ (5/5) - Beaucoup plus facile à tester
- Performance: ⭐⭐⭐⭐ (4/5) - Possibilité de mémoïser les composants

---

## 📈 Bénéfices Attendus

### Métriques Globales

| Métrique | Avant | Après | Gain |
|----------|-------|-------|------|
| **Lignes max par fichier** | 782 | ~200 | -74% |
| **Fichiers total** | 3 | ~25 | +733% |
| **Réutilisabilité** | Faible | Haute | +400% |
| **Testabilité** | Difficile | Facile | +500% |

### Avantages

✅ **Lisibilité**
- Fichiers plus courts et focalisés
- Responsabilité unique par composant
- Code plus facile à comprendre

✅ **Maintenabilité**
- Modifications isolées
- Moins de risques de régression
- Debugging plus facile

✅ **Réutilisabilité**
- Composants génériques (SessionCard, TimeGrid, etc.)
- Hooks réutilisables (useDragDrop, etc.)
- Utils partagés

✅ **Performance**
- Possibilité de mémoïser les sous-composants
- Re-renders optimisés
- Bundle splitting

✅ **Tests**
- Tests unitaires par composant
- Tests de hooks isolés
- Tests d'intégration simplifiés

---

## 🎯 Plan d'Exécution

### Phase 1: Refactorisation program-builder (URGENT)

**Priorité:** 🔴 Haute (composant critique + gains majeurs)

**Étapes:**
1. ✅ Extraire les utils de calcul de temps
2. ✅ Créer le hook useProgramDragDrop
3. ✅ Créer SessionCard component
4. ✅ Créer TimeGrid component
5. ✅ Réorganiser le fichier principal
6. ✅ Tests et validation

**Temps estimé:** 3-4 heures

---

### Phase 2: Refactorisation transport-booking-details-dialog (URGENT)

**Priorité:** 🔴 Haute (complexe + peu maintenable)

**Étapes:**
1. Extraire les formulaires (Flight, Train, Accommodation)
2. Créer les sections (GuestDetails, TravelInfo, etc.)
3. Créer les hooks (useBookingData, useBookingSave)
4. Réorganiser le fichier principal
5. Tests et validation

**Temps estimé:** 4-5 heures

---

### Phase 3: Amélioration showcase-builder (OPTIONNEL)

**Priorité:** ⚠️ Moyenne (déjà bien structuré)

**Étapes:**
1. Extraire le reducer vers un hook
2. Créer ShowcaseHeader component
3. Créer ShowcaseThemeSelector component
4. Créer le hook useShowcaseSave
5. Tests et validation

**Temps estimé:** 2-3 heures

---

## ✅ Checklist de Validation

Pour chaque composant refactorisé:

- [ ] Tous les tests passent
- [ ] Aucune régression fonctionnelle
- [ ] Performance identique ou meilleure
- [ ] Code coverage maintenu ou amélioré
- [ ] Documentation à jour
- [ ] Peer review effectué
- [ ] Déployé en staging et testé

---

## 📝 Notes Importantes

### Principes à Respecter

1. **Single Responsibility**
   - Un composant = une responsabilité
   - Pas plus de 200-300 lignes par fichier

2. **Separation of Concerns**
   - Logique métier → Hooks/Utils
   - UI → Components
   - État → Context/Reducer

3. **DRY (Don't Repeat Yourself)**
   - Extraire le code dupliqué
   - Créer des utils réutilisables

4. **KISS (Keep It Simple, Stupid)**
   - Privilégier la simplicité
   - Éviter la sur-ingénierie

### Outils Recommandés

- **ESLint** avec règle `max-lines` (300)
- **SonarQube** pour détecter la complexité
- **Jest** pour les tests unitaires
- **React Testing Library** pour les tests composants

---

## 🚀 Résultat Attendu

**Avant:**
```
components/
├── showcase-builder.tsx (782 lignes)
├── transport-booking-details-dialog.tsx (760 lignes)
└── program-builder.tsx (703 lignes)
```

**Après:**
```
components/
├── showcase-builder/
│   ├── index.tsx (200 lignes)
│   ├── hooks/
│   └── components/
├── transport-booking-details/
│   ├── index.tsx (180 lignes)
│   ├── forms/
│   ├── components/
│   └── hooks/
└── program-builder/
    ├── index.tsx (150 lignes)
    ├── components/
    ├── hooks/
    └── utils/
```

**Impact global:**
- ✅ Code plus maintenable
- ✅ Tests plus faciles
- ✅ Performance améliorée
- ✅ Onboarding facilité
- ✅ Évolutivité accrue

---

**Auteur:** Claude
**Status:** 📋 Plan défini - En attente d'implémentation
**Prochaine étape:** Implémenter Phase 1 (program-builder)
