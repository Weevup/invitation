# Program Builder - Refactored Components

This directory contains extracted, reusable components and utilities from the program-builder.tsx component (703 lines → modular architecture).

## 📁 Structure

```
program-builder/
├── components/
│   ├── SessionCard.tsx       # Reusable session card with drag/resize
│   └── TimeGrid.tsx           # Timeline grid with hour markers
├── utils/
│   └── time-calculations.ts   # Time/position calculation utilities
├── index.ts                   # Public API exports
└── README.md                  # This file
```

## 🎯 Components

### SessionCard

Renders a single session in the timeline with drag-and-drop and resize capabilities.

**Features:**
- Drag and drop support
- Resize handles (top/bottom)
- Action buttons (edit, duplicate, delete, visibility toggle)
- Automatic color coding by session type
- Responsive hover states

**Usage:**
```tsx
import { SessionCard } from './program-builder'

<SessionCard
  session={session}
  config={timelineConfig}
  isDragging={false}
  isResizing={false}
  onDragStart={handleDragStart}
  onDragEnd={handleDragEnd}
  onEdit={handleEdit}
  onDuplicate={handleDuplicate}
  onDelete={handleDelete}
  onToggleVisibility={handleToggleVisibility}
  onResizeStart={handleResizeStart}
/>
```

### TimeGrid

Renders the timeline grid with hour markers.

**Usage:**
```tsx
import { TimeGrid, DEFAULT_TIMELINE_CONFIG } from './program-builder'

<TimeGrid config={DEFAULT_TIMELINE_CONFIG} />
```

## 🛠️ Utilities

### time-calculations.ts

Pure functions for time and position calculations.

**Functions:**

#### `snapToInterval(date: Date, interval: number): Date`
Snaps a date to the nearest time interval (e.g., 15 minutes).

```tsx
const snapped = snapToInterval(new Date(), 15)
// Returns date rounded to nearest 15-minute interval
```

#### `getSessionPosition(session, config): { top: number, height: number }`
Calculates pixel position and height of a session in the timeline.

```tsx
const { top, height } = getSessionPosition(session, config)
// Returns: { top: 240, height: 80 } for a 1h session at 9:00 AM
```

#### `getTimeFromPosition(top: number, day: Date, config): Date`
Converts a pixel position back to a time.

```tsx
const time = getTimeFromPosition(240, new Date(), config)
// Returns Date object representing 9:00 AM
```

#### `calculateEndTime(startTime: Date, durationMinutes: number): Date`
Calculates end time given start time and duration.

```tsx
const endTime = calculateEndTime(new Date('2024-01-15T09:00:00'), 60)
// Returns 2024-01-15T10:00:00
```

#### `generateTimeMarkers(config): number[]`
Generates array of hour markers for the timeline.

```tsx
const markers = generateTimeMarkers(config)
// Returns: [6, 7, 8, 9, ..., 23]
```

## 📊 Configuration

### TimelineConfig

```typescript
interface TimelineConfig {
  hourHeight: number        // Pixels per hour (default: 80)
  minSessionHeight: number  // Minimum session height (default: 40)
  timeStart: number        // Start hour (default: 6 = 6:00 AM)
  timeEnd: number          // End hour (default: 23 = 11:00 PM)
  snapInterval: number     // Snap interval in minutes (default: 15)
}
```

**Default Configuration:**
```typescript
export const DEFAULT_TIMELINE_CONFIG: TimelineConfig = {
  hourHeight: 80,
  minSessionHeight: 40,
  timeStart: 6,
  timeEnd: 23,
  snapInterval: 15,
}
```

## 🔄 Migration Guide

### Before (Monolithic)
```tsx
// program-builder.tsx (703 lines)
export function ProgramBuilder() {
  // 700+ lines of mixed logic and UI
  const getSessionPosition = (session) => { /* ... */ }
  const snapToInterval = (date) => { /* ... */ }

  return (
    <div>
      {/* Inline session rendering */}
      <div className="session-card">...</div>
    </div>
  )
}
```

### After (Modular)
```tsx
// Using extracted components
import { SessionCard, TimeGrid, getSessionPosition } from './program-builder'

export function ProgramBuilder() {
  return (
    <div>
      <TimeGrid config={config} />
      {sessions.map(session => (
        <SessionCard
          key={session.id}
          session={session}
          config={config}
          // ... handlers
        />
      ))}
    </div>
  )
}
```

## ✅ Benefits

1. **Modularity**: Each component has a single responsibility
2. **Reusability**: Components can be used in other timeline views
3. **Testability**: Pure functions are easy to unit test
4. **Maintainability**: Changes are isolated to specific files
5. **Performance**: Easier to memoize individual components

## 🚀 Next Steps

To complete the refactoring:

1. **Extract Drag & Drop Logic**: Create `useProgramDragDrop` hook
2. **Extract API Calls**: Create `useProgramSessions` hook
3. **Refactor Main Component**: Update program-builder.tsx to use these components
4. **Add Tests**: Unit tests for utilities, component tests for UI

## 📝 Notes

- All utilities are pure functions (no side effects)
- Components use TypeScript for type safety
- Follows existing design patterns from the codebase
- Compatible with current SESSION_ICONS and SESSION_COLORS constants

---

**Status**: ✅ Part 1 Complete - Reusable components extracted
**Next**: Optional - Complete migration of main program-builder.tsx
