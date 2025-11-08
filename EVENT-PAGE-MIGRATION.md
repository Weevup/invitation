# Migration de la page Event pour SectionConfig

## 📋 Utilities créées

**Fichier:** `lib/showcase-utils.ts`

### Fonctions disponibles

```typescript
// 1. Obtenir les classes Tailwind pour une section
getSectionClasses(section: SectionConfig): string

// 2. Obtenir les styles inline pour une section
getSectionStyles(section: SectionConfig): React.CSSProperties

// 3. Obtenir toutes les props pour wrapper une section
getSectionWrapperProps(section: SectionConfig): {
  className: string
  style: React.CSSProperties
  hasOverlay: boolean
  overlayOpacity: number
  animationDelay: number
  animationDuration: string
}

// 4. Migrer les anciennes sections vers SectionConfig
migrateLegacySections(sections: any): SectionConfig[]

// 5. Filtrer et trier les sections activées
getActiveSections(sections: SectionConfig[]): SectionConfig[]

// 6. Générer un pattern de fond SVG
getBackgroundPattern(pattern: string, color: string): string | null
```

## 🔧 Comment adapter app/event/[slug]/page.tsx

### Étape 1: Imports

```typescript
import { migrateLegacySections, getActiveSections, getSectionWrapperProps } from '@/lib/showcase-utils'
import { type SectionConfig } from '@/lib/showcase-templates'
```

### Étape 2: Migration des sections

```typescript
// Dans getEvent() ou après avoir récupéré l'event
const rawSections = event.showcaseSections
const sectionConfigs = migrateLegacySections(rawSections)
const activeSections = getActiveSections(sectionConfigs)
```

### Étape 3: Créer un composant SectionWrapper

```typescript
interface SectionWrapperProps {
  section: SectionConfig
  children: React.ReactNode
}

function SectionWrapper({ section, children }: SectionWrapperProps) {
  const props = getSectionWrapperProps(section)

  return (
    <section
      className={`relative ${props.className}`}
      style={{
        ...props.style,
        animationDelay: `${props.animationDelay}ms`,
        animationDuration: props.animationDuration,
      }}
    >
      {/* Overlay si image de fond */}
      {props.hasOverlay && (
        <div
          className="absolute inset-0 bg-black"
          style={{ opacity: props.overlayOpacity / 100 }}
        />
      )}

      {/* Contenu */}
      <div className="relative z-10">
        {children}
      </div>
    </section>
  )
}
```

### Étape 4: Utiliser le wrapper pour chaque section

```typescript
// Avant:
{sections.includes('hero') && (
  <section className="relative overflow-hidden">
    {/* Contenu hero */}
  </section>
)}

// Après:
{activeSections.map((sectionConfig) => {
  if (sectionConfig.type === 'hero') {
    return (
      <SectionWrapper key={sectionConfig.id} section={sectionConfig}>
        {/* Contenu hero */}
      </SectionWrapper>
    )
  }
  // ... autres types de sections
  return null
})}
```

### Étape 5: Exemple complet pour Hero

```typescript
{activeSections.map((sectionConfig) => {
  if (sectionConfig.type === 'hero') {
    return (
      <SectionWrapper key={sectionConfig.id} section={sectionConfig}>
        {/* Background image (géré automatiquement par getSectionStyles) */}

        <div className="container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-8 animate-bounce-slow">
              <WeevupLogo className="w-20 h-20 mx-auto drop-shadow-2xl" />
            </div>
            <h1
              className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in drop-shadow-lg"
              style={{
                fontFamily: "var(--font-abril)",
                color: sectionConfig.backgroundImage ? '#ffffff' : primaryColor
              }}
            >
              {event.showcaseTitle || event.name}
            </h1>
            {/* ... reste du contenu */}
          </div>
        </div>
      </SectionWrapper>
    )
  }

  if (sectionConfig.type === 'description') {
    return (
      <SectionWrapper key={sectionConfig.id} section={sectionConfig}>
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6" style={{ color: primaryColor }}>
            À propos
          </h2>
          <div className="prose prose-lg max-w-none">
            {event.description}
          </div>
        </div>
      </SectionWrapper>
    )
  }

  // ... autres sections
  return null
})}
```

## 🎨 Styles CSS à ajouter

Ajouter ces animations dans `globals.css` ou dans un fichier CSS dédié:

```css
/* Animations pour les sections */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes zoomIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-fade {
  animation: fadeIn var(--animation-duration, 500ms) ease-out forwards;
}

.animate-slide {
  animation: slideIn var(--animation-duration, 500ms) ease-out forwards;
}

.animate-zoom {
  animation: zoomIn var(--animation-duration, 500ms) ease-out forwards;
}

/* Intersection Observer pour animer au scroll */
.animate-on-scroll {
  opacity: 0;
}

.animate-on-scroll.is-visible {
  opacity: 1;
}
```

## 📝 Script pour Intersection Observer

Ajouter dans un `useEffect` côté client ou dans un script:

```typescript
useEffect(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
        }
      })
    },
    { threshold: 0.1 }
  )

  document.querySelectorAll('.animate-on-scroll').forEach((el) => {
    observer.observe(el)
  })

  return () => observer.disconnect()
}, [])
```

## ✅ Checklist de migration

- [ ] Importer les utilities et types
- [ ] Créer le composant SectionWrapper
- [ ] Migrer chaque type de section (hero, description, etc.)
- [ ] Ajouter les animations CSS
- [ ] Ajouter l'Intersection Observer
- [ ] Tester avec différentes configurations
- [ ] Vérifier la responsive

## 🚀 Avantages de cette approche

1. **Flexibilité totale** - Chaque section peut avoir sa propre configuration
2. **Maintenance facile** - Les styles sont centralisés dans showcase-utils.ts
3. **Backward compatible** - Les anciennes sections string[] sont automatiquement migrées
4. **Type-safe** - TypeScript assure la cohérence
5. **Performant** - Les styles sont générés côté serveur
