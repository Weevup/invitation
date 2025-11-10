/**
 * Helpers pour le système modulaire
 */

import { prisma } from '@/lib/prisma'
import { ModuleType } from '@prisma/client'
import { ModuleConfig } from './types'

/**
 * Vérifie si un module est actif pour un événement
 */
export async function hasModule(
  eventId: string,
  moduleType: ModuleType
): Promise<boolean> {
  const eventModule = await prisma.eventModule.findUnique({
    where: {
      eventId_moduleType: {
        eventId,
        moduleType
      }
    },
    select: { isActive: true }
  })

  return eventModule?.isActive ?? false
}

/**
 * Vérifie si l'événement a au moins un module logistique actif
 */
export async function hasAnyLogisticModule(eventId: string): Promise<boolean> {
  const logisticModules: ModuleType[] = ['TRANSPORT', 'ACCOMMODATION']

  const modules = await prisma.eventModule.findMany({
    where: {
      eventId,
      moduleType: { in: logisticModules },
      isActive: true
    }
  })

  return modules.length > 0
}

/**
 * Récupère tous les modules actifs pour un événement
 */
export async function getActiveModules(eventId: string) {
  return await prisma.eventModule.findMany({
    where: {
      eventId,
      isActive: true
    },
    select: {
      moduleType: true,
      config: true,
      updatedAt: true
    }
  })
}

/**
 * Active un module pour un événement
 */
export async function activateModule(
  eventId: string,
  moduleType: ModuleType,
  config?: ModuleConfig
) {
  return await prisma.eventModule.upsert({
    where: {
      eventId_moduleType: {
        eventId,
        moduleType
      }
    },
    create: {
      eventId,
      moduleType,
      isActive: true,
      config: config ?? undefined
    },
    update: {
      isActive: true,
      config: config ?? undefined
    }
  })
}

/**
 * Désactive un module pour un événement
 */
export async function deactivateModule(
  eventId: string,
  moduleType: ModuleType
) {
  return await prisma.eventModule.updateMany({
    where: {
      eventId,
      moduleType
    },
    data: {
      isActive: false
    }
  })
}

/**
 * Met à jour la configuration d'un module
 */
export async function updateModuleConfig(
  eventId: string,
  moduleType: ModuleType,
  config: ModuleConfig
) {
  return await prisma.eventModule.update({
    where: {
      eventId_moduleType: {
        eventId,
        moduleType
      }
    },
    data: {
      config
    }
  })
}

/**
 * Toggle un module (active/désactive)
 */
export async function toggleModule(
  eventId: string,
  moduleType: ModuleType
): Promise<boolean> {
  const eventModule = await prisma.eventModule.findUnique({
    where: {
      eventId_moduleType: {
        eventId,
        moduleType
      }
    }
  })

  const newState = !(eventModule?.isActive ?? false)

  await prisma.eventModule.upsert({
    where: {
      eventId_moduleType: {
        eventId,
        moduleType
      }
    },
    create: {
      eventId,
      moduleType,
      isActive: newState
    },
    update: {
      isActive: newState
    }
  })

  return newState
}
