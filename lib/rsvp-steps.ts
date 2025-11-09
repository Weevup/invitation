/**
 * RSVP Steps Configuration
 * Dynamically configures which steps are active based on event settings
 */

export interface StepConfig {
  id: string
  label: string
  enabled: boolean
}

export interface EventConfig {
  allowPlusOnes: boolean
  requireMeal: boolean
  enableAccessibility: boolean
  enableTransport: boolean
  enableLodging: boolean
  enablePhotoConsent: boolean
}

/**
 * Build the list of steps based on event configuration
 */
export function buildSteps(event: EventConfig, attending: boolean | null): StepConfig[] {
  const steps: StepConfig[] = [
    {
      id: 'response',
      label: 'Réponse',
      enabled: true, // Always enabled
    },
  ]

  // Only show following steps if user is attending
  if (attending) {
    steps.push({
      id: 'plus-ones',
      label: 'Accompagnants',
      enabled: event.allowPlusOnes,
    })

    steps.push({
      id: 'meal',
      label: 'Repas',
      enabled: event.requireMeal,
    })

    steps.push({
      id: 'practical',
      label: 'Infos pratiques',
      enabled: event.enableAccessibility || event.enableTransport || event.enableLodging,
    })

    steps.push({
      id: 'consent',
      label: 'Consentements',
      enabled: event.enablePhotoConsent,
    })
  }

  // Summary step always enabled
  steps.push({
    id: 'summary',
    label: 'Récapitulatif',
    enabled: true,
  })

  // Success step (not shown in progress bar during form)
  steps.push({
    id: 'success',
    label: 'Confirmation',
    enabled: true,
  })

  return steps
}

/**
 * Get the next enabled step
 */
export function getNextStep(currentStepId: string, steps: StepConfig[]): string | null {
  const enabledSteps = steps.filter(s => s.enabled)
  const currentIndex = enabledSteps.findIndex(s => s.id === currentStepId)

  if (currentIndex === -1 || currentIndex >= enabledSteps.length - 1) {
    return null
  }

  return enabledSteps[currentIndex + 1].id
}

/**
 * Get the previous enabled step
 */
export function getPreviousStep(currentStepId: string, steps: StepConfig[]): string | null {
  const enabledSteps = steps.filter(s => s.enabled)
  const currentIndex = enabledSteps.findIndex(s => s.id === currentStepId)

  if (currentIndex <= 0) {
    return null
  }

  return enabledSteps[currentIndex - 1].id
}

/**
 * Get step index in enabled steps list
 */
export function getStepIndex(stepId: string, steps: StepConfig[]): number {
  const enabledSteps = steps.filter(s => s.enabled)
  return enabledSteps.findIndex(s => s.id === stepId)
}

/**
 * Check if all required fields for a step are filled
 */
export function isStepValid(
  stepId: string,
  formData: {
    attending: boolean | null
    plusOnes: number
    mealChoice: string
    event: EventConfig
  }
): boolean {
  const { attending, plusOnes, mealChoice, event } = formData

  switch (stepId) {
    case 'response':
      return attending !== null

    case 'plus-ones':
      // Always valid - plusOnes defaults to 0
      return true

    case 'meal':
      // Only validate if meal is required AND user is attending
      if (event.requireMeal && attending) {
        return mealChoice.trim() !== ''
      }
      return true

    case 'practical':
    case 'consent':
    case 'summary':
      // These steps don't have required fields
      return true

    default:
      return true
  }
}
