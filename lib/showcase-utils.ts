/**
 * Utilities pour générer les styles dynamiques des sections showcase
 */

import { type SectionConfig } from './showcase-templates'

const paddingMap = {
  none: '0',
  sm: '1rem',
  md: '2rem',
  lg: '3rem',
  xl: '5rem',
}

const marginMap = {
  none: '0',
  sm: '0.5rem',
  md: '1rem',
  lg: '2rem',
  xl: '4rem',
}

/**
 * Génère les classes Tailwind pour une section
 */
export function getSectionClasses(section: SectionConfig): string {
  const classes: string[] = []

  // Layout
  if (section.layout === 'fullwidth') {
    classes.push('w-full')
  } else if (section.layout === 'container') {
    classes.push('container mx-auto px-4')
  } else if (section.layout === 'split') {
    classes.push('container mx-auto px-4 grid md:grid-cols-2 gap-8')
  } else if (section.layout === 'grid') {
    const cols = section.columns || 2
    classes.push(`container mx-auto px-4 grid md:grid-cols-${cols} gap-6`)
  }

  // Alignment
  if (section.alignment === 'center') {
    classes.push('text-center')
  } else if (section.alignment === 'right') {
    classes.push('text-right')
  }

  // Animation
  if (section.animationType && section.animationType !== 'none') {
    classes.push('animate-on-scroll')
    classes.push(`animate-${section.animationType}`)
  }

  return classes.join(' ')
}

/**
 * Génère les styles inline pour une section
 */
export function getSectionStyles(section: SectionConfig): React.CSSProperties {
  const styles: React.CSSProperties = {}

  // Padding
  if (section.paddingTop) {
    styles.paddingTop = paddingMap[section.paddingTop]
  }
  if (section.paddingBottom) {
    styles.paddingBottom = paddingMap[section.paddingBottom]
  }

  // Margin
  if (section.marginTop) {
    styles.marginTop = marginMap[section.marginTop]
  }
  if (section.marginBottom) {
    styles.marginBottom = marginMap[section.marginBottom]
  }

  // Background
  if (section.backgroundColor) {
    styles.backgroundColor = section.backgroundColor
  }

  if (section.backgroundImage) {
    styles.backgroundImage = `url(${section.backgroundImage})`
    styles.backgroundSize = 'cover'
    styles.backgroundPosition = 'center'
  }

  return styles
}

/**
 * Obtient le délai d'animation en millisecondes
 */
export function getAnimationDelay(section: SectionConfig): number {
  return section.animationDelay || 0
}

/**
 * Obtient la durée d'animation en CSS
 */
export function getAnimationDuration(section: SectionConfig): string {
  const durationMap = {
    fast: '300ms',
    normal: '500ms',
    slow: '800ms',
  }
  return durationMap[section.animationDuration] || '500ms'
}

/**
 * Génère le pattern de fond SVG
 */
export function getBackgroundPattern(pattern?: string, color?: string): string | null {
  if (!pattern || pattern === 'none') return null

  const fillColor = color || '#000000'
  const opacity = '0.05'

  if (pattern === 'dots') {
    return `data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='2' fill='${fillColor}' opacity='${opacity}'/%3E%3C/svg%3E`
  }

  if (pattern === 'grid') {
    return `data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0z' fill='none'/%3E%3Cpath d='M0 0h40M0 0v40' stroke='${fillColor}' stroke-width='1' opacity='${opacity}'/%3E%3C/svg%3E`
  }

  if (pattern === 'waves') {
    return `data:image/svg+xml,%3Csvg width='100' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 10 Q25 0, 50 10 T100 10' stroke='${fillColor}' stroke-width='2' fill='none' opacity='${opacity}'/%3E%3C/svg%3E`
  }

  return null
}

/**
 * Wrapper de section avec tous les styles appliqués
 */
export interface SectionWrapperProps {
  section: SectionConfig
  children: React.ReactNode
}

export function getSectionWrapperProps(section: SectionConfig) {
  const styles = getSectionStyles(section)
  const classes = getSectionClasses(section)

  // Ajouter le pattern de fond si configuré
  if (section.backgroundPattern && section.backgroundPattern !== 'none') {
    const pattern = getBackgroundPattern(section.backgroundPattern, section.backgroundColor)
    if (pattern) {
      styles.backgroundImage = `url(${pattern})${section.backgroundImage ? `, ${styles.backgroundImage}` : ''}`
    }
  }

  // Overlay si configuré
  const hasOverlay = section.backgroundOverlay && section.backgroundImage

  return {
    className: classes,
    style: styles,
    hasOverlay,
    overlayOpacity: section.overlayOpacity || 50,
    animationDelay: getAnimationDelay(section),
    animationDuration: getAnimationDuration(section),
  }
}

/**
 * Convertit les anciennes sections (string[]) vers SectionConfig[]
 */
export function migrateLegacySections(sections: any): SectionConfig[] {
  // Vérifier si sections est null, undefined ou pas un tableau
  if (!sections || !Array.isArray(sections) || sections.length === 0) {
    return []
  }

  // Si c'est déjà des SectionConfig
  if (typeof sections[0] === 'object' && sections[0] !== null && 'type' in sections[0]) {
    return sections as SectionConfig[]
  }

  // Convertir depuis string[]
  return (sections as string[]).map((type, index) => ({
    id: `${type}-${index}`,
    type,
    enabled: true,
    order: index,
    layout: 'container',
    alignment: 'center',
    paddingTop: 'lg',
    paddingBottom: 'lg',
    animationType: 'fade',
    animationDuration: 'normal',
  }))
}

/**
 * Filtre et trie les sections activées
 */
export function getActiveSections(sections: SectionConfig[]): SectionConfig[] {
  return sections
    .filter(s => s.enabled)
    .sort((a, b) => a.order - b.order)
}
