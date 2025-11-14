/**
 * Types pour le système modulaire Phase 2
 */

import { ModuleType, TransportType, BookingStatus, ManifestStatus } from '@prisma/client'

// Re-export Prisma enums for convenience
export { ModuleType, TransportType, BookingStatus, ManifestStatus }

// Module configuration interface
export interface ModuleConfig {
  // Configuration spécifique à chaque type de module
  [key: string]: any
}

// Transport module specific types
export interface TransportDepartureArrival {
  city?: string
  airport?: string
  station?: string
  address?: string
  date: string  // ISO date string
  time: string  // HH:mm format
}

export interface TransportManifestLocation {
  location: string
  date: string  // ISO date string
  time: string  // HH:mm format
}

// Helper types for module status
export interface ModuleStatus {
  type: ModuleType
  isActive: boolean
  config?: ModuleConfig
}

// Module info with metadata
export interface ModuleInfo {
  type: ModuleType
  name: string
  description: string
  icon: string
  category: 'logistics' | 'program' | 'financial' | 'communication'
  comingSoon?: boolean
  subFeatures?: SubFeature[]
}

// Sub-features for modules (like workshops within PROGRAM)
export interface SubFeature {
  id: string
  name: string
  description: string
  icon: string
  configKey: string // Key in module config to check if enabled
}

// All available modules
export const AVAILABLE_MODULES: ModuleInfo[] = [
  {
    type: 'TRANSPORT',
    name: 'Transport & Déplacements',
    description: 'Gérer les vols, trains, navettes et transferts',
    icon: '✈️',
    category: 'logistics'
  },
  {
    type: 'ACCOMMODATION',
    name: 'Hébergement',
    description: 'Gérer les hôtels et l\'attribution des chambres',
    icon: '🏨',
    category: 'logistics'
  },
  {
    type: 'PROGRAM',
    name: 'Programme & Sessions',
    description: 'Organiser workshops, sessions et activités',
    icon: '📅',
    category: 'program',
    subFeatures: [
      {
        id: 'workshops',
        name: 'Ateliers / Workshops',
        description: 'Organiser des ateliers thématiques en petits groupes',
        icon: '🎓',
        configKey: 'enableWorkshops'
      },
      {
        id: 'teambuilding',
        name: 'Team Building',
        description: 'Activités de cohésion d\'équipe avec répartition en groupes',
        icon: '🏆',
        configKey: 'enableTeamBuilding'
      },
      {
        id: 'freetime',
        name: 'Activités libres',
        description: 'Activités optionnelles avec choix des participants',
        icon: '🎉',
        configKey: 'enableFreeTime'
      }
    ]
  },
  {
    type: 'BUDGET',
    name: 'Gestion Budget',
    description: 'Suivre les coûts et générer des rapports',
    icon: '📊',
    category: 'financial',
    comingSoon: true
  },
  {
    type: 'REGISTRATION_PAYMENT',
    name: 'Inscription & Facturation',
    description: 'Workflow d\'inscription et facturation B2B',
    icon: '💼',
    category: 'financial',
    comingSoon: true
  },
  {
    type: 'MULTILANG',
    name: 'Multi-langue',
    description: 'Interface et emails en plusieurs langues',
    icon: '🌍',
    category: 'communication',
    comingSoon: true
  }
]

// Helper to get module info
export function getModuleInfo(type: ModuleType): ModuleInfo | undefined {
  return AVAILABLE_MODULES.find(m => m.type === type)
}

// Helper to check if module is available
export function isModuleAvailable(type: ModuleType): boolean {
  const info = getModuleInfo(type)
  return info ? !info.comingSoon : false
}

// Module categories for organization
export const MODULE_CATEGORIES = {
  logistics: {
    label: 'Logistique',
    icon: '📦',
    description: 'Transport, hébergement, accès'
  },
  program: {
    label: 'Programme',
    icon: '📅',
    description: 'Sessions, workshops, activités'
  },
  financial: {
    label: 'Financier',
    icon: '💰',
    description: 'Inscriptions, paiements, budget'
  },
  communication: {
    label: 'Communication',
    icon: '📧',
    description: 'Multi-langue, notifications'
  }
} as const

export type ModuleCategory = keyof typeof MODULE_CATEGORIES
