import { ModuleType } from '@prisma/client'
import { useEffect, useState } from 'react'

export type ModuleCategory = 'logistics' | 'finance' | 'content' | 'settings'

export interface Module {
  type: ModuleType
  name: string
  description: string
  icon: string
  category: ModuleCategory
  comingSoon?: boolean
}

export const MODULE_CATEGORIES: Record<ModuleCategory, {
  label: string
  description: string
  icon: string
}> = {
  content: {
    label: 'Programme & Contenu',
    description: 'Gérez le programme, les sessions et la timeline de l\'événement',
    icon: '📅'
  },
  logistics: {
    label: 'Logistique & Opérations',
    description: 'Transport, hébergement et coordination sur place',
    icon: '🚗'
  },
  finance: {
    label: 'Finance & Inscriptions',
    description: 'Gestion des inscriptions, paiements et budget',
    icon: '💰'
  },
  settings: {
    label: 'Configuration',
    description: 'Paramètres avancés de l\'événement',
    icon: '⚙️'
  }
}

export const AVAILABLE_MODULES: Module[] = [
  {
    type: 'PROGRAM',
    name: 'Agenda & Sessions',
    description: 'Créez le programme de l\'événement, gérez les sessions, workshops et la timeline globale',
    icon: '📅',
    category: 'content'
  },
  {
    type: 'TRANSPORT',
    name: 'Transport',
    description: 'Organisez les vols, navettes et transferts pour les participants',
    icon: '✈️',
    category: 'logistics'
  },
  {
    type: 'ACCOMMODATION',
    name: 'Hébergement',
    description: 'Gérez les réservations d\'hôtel et l\'attribution des chambres',
    icon: '🏨',
    category: 'logistics',
    comingSoon: true
  },
  {
    type: 'REGISTRATION_PAYMENT',
    name: 'Inscription & Facturation',
    description: 'Système d\'inscription en ligne avec paiements et factures',
    icon: '💳',
    category: 'finance',
    comingSoon: true
  },
  {
    type: 'BUDGET',
    name: 'Budget',
    description: 'Suivi des dépenses et du budget événementiel',
    icon: '💰',
    category: 'finance',
    comingSoon: true
  },
  {
    type: 'MULTILANG',
    name: 'Multi-langue',
    description: 'Invitations et communications en plusieurs langues',
    icon: '🌍',
    category: 'settings',
    comingSoon: true
  }
]

/**
 * Hook to check which modules are active for an event
 */
export function useEventModules(eventId: string) {
  const [activeModules, setActiveModules] = useState<Set<ModuleType>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const response = await fetch(`/api/admin/events/${eventId}/modules`)
        if (response.ok) {
          const data = await response.json()
          const active = data.modules
            .filter((m: any) => m.isActive)
            .map((m: any) => m.type)
          setActiveModules(new Set(active))
        }
      } catch (error) {
        console.error('Failed to fetch modules:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchModules()
  }, [eventId])

  const hasModule = (moduleType: ModuleType) => {
    return activeModules.has(moduleType)
  }

  return {
    activeModules: Array.from(activeModules),
    hasModule,
    loading
  }
}
