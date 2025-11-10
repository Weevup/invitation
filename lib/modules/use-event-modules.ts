/**
 * Hook React pour gérer les modules d'un événement
 */

'use client'

import { useState, useEffect } from 'react'
import { ModuleType } from '@prisma/client'
import { ModuleStatus } from './types'

interface UseEventModulesReturn {
  modules: ModuleStatus[]
  hasModule: (type: ModuleType) => boolean
  hasAnyLogistic: boolean
  isLoading: boolean
  error: Error | null
  refresh: () => Promise<void>
}

export function useEventModules(eventId: string): UseEventModulesReturn {
  const [modules, setModules] = useState<ModuleStatus[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchModules = async () => {
    if (!eventId) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/events/${eventId}/modules`)

      if (!response.ok) {
        throw new Error('Failed to fetch modules')
      }

      const data = await response.json()
      setModules(data.modules || [])
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchModules()
  }, [eventId])

  const hasModule = (type: ModuleType): boolean => {
    return modules.some(m => m.type === type && m.isActive)
  }

  const hasAnyLogistic = modules.some(
    m => (m.type === 'TRANSPORT' || m.type === 'ACCOMMODATION') && m.isActive
  )

  return {
    modules,
    hasModule,
    hasAnyLogistic,
    isLoading,
    error,
    refresh: fetchModules
  }
}
