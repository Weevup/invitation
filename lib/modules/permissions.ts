/**
 * Système de permissions et validations pour les modules
 */

import { ModuleType } from '@prisma/client'
import { hasModule } from './helpers'

/**
 * Vérifie si un module est requis pour accéder à une fonctionnalité
 */
export async function requireModule(
  eventId: string,
  moduleType: ModuleType,
  errorMessage?: string
): Promise<void> {
  const hasAccess = await hasModule(eventId, moduleType)

  if (!hasAccess) {
    throw new Error(
      errorMessage || `Le module ${moduleType} n'est pas activé pour cet événement`
    )
  }
}

/**
 * Vérifie si plusieurs modules sont requis
 */
export async function requireModules(
  eventId: string,
  moduleTypes: ModuleType[],
  errorMessage?: string
): Promise<void> {
  for (const moduleType of moduleTypes) {
    await requireModule(eventId, moduleType, errorMessage)
  }
}

/**
 * Vérifie si au moins un des modules est actif
 */
export async function requireAnyModule(
  eventId: string,
  moduleTypes: ModuleType[],
  errorMessage?: string
): Promise<void> {
  const checks = await Promise.all(
    moduleTypes.map(type => hasModule(eventId, type))
  )

  const hasAny = checks.some(Boolean)

  if (!hasAny) {
    throw new Error(
      errorMessage || `Au moins un de ces modules est requis: ${moduleTypes.join(', ')}`
    )
  }
}

/**
 * Validations de configuration par module
 */
export const MODULE_CONFIG_VALIDATORS: Record<ModuleType, (config: any) => { valid: boolean; errors: string[] }> = {
  TRANSPORT: (config) => {
    const errors: string[] = []

    if (config?.defaultCurrency && !['EUR', 'USD', 'GBP', 'CHF'].includes(config.defaultCurrency)) {
      errors.push('Devise invalide')
    }

    if (config?.notificationEmails) {
      const emails = config.notificationEmails.split(',').map((e: string) => e.trim())
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

      if (!emails.every((e: string) => emailRegex.test(e))) {
        errors.push('Format d\'email invalide dans les notifications')
      }
    }

    return {
      valid: errors.length === 0,
      errors
    }
  },

  ACCOMMODATION: (config) => {
    const errors: string[] = []

    if (config?.maxNightsPerGuest && config.maxNightsPerGuest < 1) {
      errors.push('Le nombre max de nuits doit être au moins 1')
    }

    return {
      valid: errors.length === 0,
      errors
    }
  },

  PROGRAM: (config) => {
    return { valid: true, errors: [] }
  },

  BUDGET: (config) => {
    const errors: string[] = []

    if (config?.budgetAlertThreshold) {
      const threshold = Number(config.budgetAlertThreshold)
      if (threshold < 0 || threshold > 100) {
        errors.push('Le seuil d\'alerte doit être entre 0 et 100')
      }
    }

    return {
      valid: errors.length === 0,
      errors
    }
  },

  REGISTRATION_PAYMENT: (config) => {
    const errors: string[] = []

    if (config?.requirePayment && !config?.paymentProvider) {
      errors.push('Un fournisseur de paiement est requis si le paiement est obligatoire')
    }

    if (config?.defaultAmount && config.defaultAmount < 0) {
      errors.push('Le montant par défaut ne peut pas être négatif')
    }

    return {
      valid: errors.length === 0,
      errors
    }
  },

  MULTILANG: (config) => {
    const errors: string[] = []

    if (config?.enabledLanguages) {
      const languages = config.enabledLanguages.split(',').map((l: string) => l.trim())
      const validLangCodes = /^[a-z]{2}$/

      if (!languages.every((l: string) => validLangCodes.test(l))) {
        errors.push('Codes de langue invalides (utilisez des codes ISO à 2 lettres)')
      }
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }
}

/**
 * Valide la configuration d'un module
 */
export function validateModuleConfig(moduleType: ModuleType, config: any): { valid: boolean; errors: string[] } {
  const validator = MODULE_CONFIG_VALIDATORS[moduleType]

  if (!validator) {
    return { valid: true, errors: [] }
  }

  return validator(config)
}

/**
 * Dépendances entre modules (certains modules nécessitent d'autres modules)
 */
export const MODULE_DEPENDENCIES: Partial<Record<ModuleType, ModuleType[]>> = {
  // Le module PROGRAM peut bénéficier du module TRANSPORT
  // Mais ce ne sont pas des dépendances strictes pour le moment
}

/**
 * Vérifie si les dépendances d'un module sont satisfaites
 */
export async function checkModuleDependencies(
  eventId: string,
  moduleType: ModuleType
): Promise<{ satisfied: boolean; missing: ModuleType[] }> {
  const dependencies = MODULE_DEPENDENCIES[moduleType] || []

  if (dependencies.length === 0) {
    return { satisfied: true, missing: [] }
  }

  const checks = await Promise.all(
    dependencies.map(async (dep) => ({
      type: dep,
      active: await hasModule(eventId, dep)
    }))
  )

  const missing = checks
    .filter(c => !c.active)
    .map(c => c.type)

  return {
    satisfied: missing.length === 0,
    missing
  }
}
