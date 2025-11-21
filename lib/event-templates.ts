/**
 * Event Templates - Predefined configurations by event type
 * Quick Win #2: Make onboarding easier with smart presets
 */

export type EventType =
  | 'corporate'
  | 'wedding'
  | 'gala'
  | 'workshop'
  | 'festival'
  | 'dinner'
  | 'conference'
  | 'custom'

export interface EventTemplateConfig {
  // Basic info
  id: EventType
  name: string
  description: string
  icon: string
  color: string

  // RSVP Configuration
  rsvpConfig: {
    allowPlusOnes: boolean
    maxPlusOnes: number
    requireMeal: boolean
    mealOptions: string[]
    enableTransport: boolean
    enableLodging: boolean
    enableAccessibility: boolean
    enablePhotoConsent: boolean
  }

  // Visual Theme
  theme: {
    primaryColor: string
    secondaryColor: string
    accentColor: string
    fontFamily: string
  }

  // Custom texts for RSVP
  customTexts?: {
    welcomeGreeting?: string
    welcomeSubtitle?: string
    formTitle?: string
    responseQuestion?: string
    responseYes?: string
    responseNo?: string
  }

  // Suggested content
  suggestions?: {
    dressCode?: string
    emailSubject?: string
  }
}

export const EVENT_TEMPLATES: Record<EventType, EventTemplateConfig> = {
  corporate: {
    id: 'corporate',
    name: 'Événement Corporate',
    description: 'Conférence, séminaire, réunion d\'entreprise',
    icon: '💼',
    color: '#1e40af',
    rsvpConfig: {
      allowPlusOnes: false,
      maxPlusOnes: 0,
      requireMeal: true,
      mealOptions: ['Menu standard', 'Végétarien', 'Sans gluten', 'Halal'],
      enableTransport: true,
      enableLodging: true,
      enableAccessibility: true,
      enablePhotoConsent: true
    },
    theme: {
      primaryColor: '#1e40af',
      secondaryColor: '#3b82f6',
      accentColor: '#ef4444',
      fontFamily: 'Inter, Arial, sans-serif'
    },
    customTexts: {
      welcomeGreeting: 'Bonjour {{guest.firstName}}',
      welcomeSubtitle: 'Vous êtes invité(e) à participer à',
      formTitle: 'Confirmation de participation',
      responseQuestion: 'Merci de confirmer votre participation',
      responseYes: '✓ Je confirme ma participation',
      responseNo: '✗ Je ne pourrai pas participer'
    },
    suggestions: {
      dressCode: 'Tenue professionnelle',
      emailSubject: 'Invitation : {{event.name}}'
    }
  },

  wedding: {
    id: 'wedding',
    name: 'Mariage',
    description: 'Cérémonie et réception de mariage',
    icon: '💍',
    color: '#ec4899',
    rsvpConfig: {
      allowPlusOnes: true,
      maxPlusOnes: 1,
      requireMeal: true,
      mealOptions: ['Menu Viande', 'Menu Poisson', 'Menu Végétarien', 'Menu Enfant'],
      enableTransport: true,
      enableLodging: true,
      enableAccessibility: true,
      enablePhotoConsent: true
    },
    theme: {
      primaryColor: '#ec4899',
      secondaryColor: '#f9a8d4',
      accentColor: '#fbbf24',
      fontFamily: 'Georgia, serif'
    },
    customTexts: {
      welcomeGreeting: 'Cher(e) {{guest.firstName}} 💕',
      welcomeSubtitle: 'Nous avons la joie de vous convier à notre mariage',
      formTitle: 'Votre présence',
      responseQuestion: 'Serez-vous des nôtres pour célébrer ce jour unique ?',
      responseYes: '✓ Avec grand plaisir !',
      responseNo: '✗ Nous regrettons de ne pouvoir être présents'
    },
    suggestions: {
      dressCode: 'Tenue de cérémonie',
      emailSubject: '💕 Save the Date - {{event.name}}'
    }
  },

  gala: {
    id: 'gala',
    name: 'Gala / Soirée',
    description: 'Soirée de gala, anniversaire, célébration',
    icon: '🎉',
    color: '#8b5cf6',
    rsvpConfig: {
      allowPlusOnes: true,
      maxPlusOnes: 1,
      requireMeal: true,
      mealOptions: ['Menu Gastronomique', 'Menu Végétarien', 'Menu Végan'],
      enableTransport: true,
      enableLodging: false,
      enableAccessibility: true,
      enablePhotoConsent: true
    },
    theme: {
      primaryColor: '#8b5cf6',
      secondaryColor: '#a78bfa',
      accentColor: '#fbbf24',
      fontFamily: 'Playfair Display, Georgia, serif'
    },
    customTexts: {
      welcomeGreeting: 'Bonjour {{guest.firstName}} ✨',
      welcomeSubtitle: 'Vous êtes cordialement invité(e) à',
      formTitle: 'Votre réponse',
      responseQuestion: 'Nous ferez-vous l\'honneur de votre présence ?',
      responseYes: '✓ J\'accepte avec plaisir',
      responseNo: '✗ Je ne pourrai malheureusement pas venir'
    },
    suggestions: {
      dressCode: 'Tenue de soirée',
      emailSubject: '🎉 Invitation exclusive - {{event.name}}'
    }
  },

  workshop: {
    id: 'workshop',
    name: 'Workshop / Formation',
    description: 'Atelier, formation, session de travail',
    icon: '🏋️',
    color: '#059669',
    rsvpConfig: {
      allowPlusOnes: false,
      maxPlusOnes: 0,
      requireMeal: true,
      mealOptions: ['Déjeuner inclus', 'Végétarien', 'Sans gluten'],
      enableTransport: true,
      enableLodging: false,
      enableAccessibility: true,
      enablePhotoConsent: false
    },
    theme: {
      primaryColor: '#059669',
      secondaryColor: '#10b981',
      accentColor: '#f59e0b',
      fontFamily: 'Inter, Arial, sans-serif'
    },
    customTexts: {
      welcomeGreeting: 'Bonjour {{guest.firstName}}',
      welcomeSubtitle: 'Inscription à',
      formTitle: 'Confirmation d\'inscription',
      responseQuestion: 'Confirmez-vous votre inscription ?',
      responseYes: '✓ Je m\'inscris',
      responseNo: '✗ Je ne peux pas participer'
    },
    suggestions: {
      dressCode: 'Tenue décontractée',
      emailSubject: 'Inscription - {{event.name}}'
    }
  },

  festival: {
    id: 'festival',
    name: 'Festival / Concert',
    description: 'Festival, concert, événement culturel',
    icon: '🎭',
    color: '#dc2626',
    rsvpConfig: {
      allowPlusOnes: true,
      maxPlusOnes: 3,
      requireMeal: false,
      mealOptions: [],
      enableTransport: true,
      enableLodging: true,
      enableAccessibility: true,
      enablePhotoConsent: true
    },
    theme: {
      primaryColor: '#dc2626',
      secondaryColor: '#f87171',
      accentColor: '#fbbf24',
      fontFamily: 'Montserrat, Arial, sans-serif'
    },
    customTexts: {
      welcomeGreeting: 'Hey {{guest.firstName}} ! 🎸',
      welcomeSubtitle: 'Tu es invité(e) à',
      formTitle: 'Ta réponse',
      responseQuestion: 'Tu viens faire la fête ?',
      responseYes: '✓ Carrément !',
      responseNo: '✗ Pas dispo cette fois'
    },
    suggestions: {
      dressCode: 'Tenue libre / Festive',
      emailSubject: '🎭 {{event.name}} - Réserve ta place !'
    }
  },

  dinner: {
    id: 'dinner',
    name: 'Dîner privé',
    description: 'Dîner, repas entre amis ou famille',
    icon: '🍽️',
    color: '#ea580c',
    rsvpConfig: {
      allowPlusOnes: true,
      maxPlusOnes: 1,
      requireMeal: true,
      mealOptions: ['Omnivore', 'Végétarien', 'Végan', 'Pescetarien'],
      enableTransport: false,
      enableLodging: false,
      enableAccessibility: false,
      enablePhotoConsent: false
    },
    theme: {
      primaryColor: '#ea580c',
      secondaryColor: '#fb923c',
      accentColor: '#84cc16',
      fontFamily: 'Lora, Georgia, serif'
    },
    customTexts: {
      welcomeGreeting: 'Cher(e) {{guest.firstName}} 🍷',
      welcomeSubtitle: 'Vous êtes invité(e) à',
      formTitle: 'Votre réponse',
      responseQuestion: 'Serez-vous des nôtres ?',
      responseYes: '✓ Avec plaisir',
      responseNo: '✗ Je ne pourrai pas venir'
    },
    suggestions: {
      dressCode: 'Tenue confortable',
      emailSubject: '🍽️ Invitation à dîner - {{event.name}}'
    }
  },

  conference: {
    id: 'conference',
    name: 'Conférence',
    description: 'Conférence, keynote, présentation',
    icon: '🎤',
    color: '#0891b2',
    rsvpConfig: {
      allowPlusOnes: false,
      maxPlusOnes: 0,
      requireMeal: false,
      mealOptions: [],
      enableTransport: true,
      enableLodging: true,
      enableAccessibility: true,
      enablePhotoConsent: true
    },
    theme: {
      primaryColor: '#0891b2',
      secondaryColor: '#22d3ee',
      accentColor: '#f97316',
      fontFamily: 'Inter, Arial, sans-serif'
    },
    customTexts: {
      welcomeGreeting: 'Bonjour {{guest.firstName}}',
      welcomeSubtitle: 'Vous êtes invité(e) à assister à',
      formTitle: 'Inscription',
      responseQuestion: 'Confirmez-vous votre participation ?',
      responseYes: '✓ Je confirme',
      responseNo: '✗ Je ne peux pas participer'
    },
    suggestions: {
      dressCode: 'Business casual',
      emailSubject: 'Invitation - {{event.name}}'
    }
  },

  custom: {
    id: 'custom',
    name: 'Personnalisé',
    description: 'Configuration sur mesure',
    icon: '⚙️',
    color: '#6b7280',
    rsvpConfig: {
      allowPlusOnes: true,
      maxPlusOnes: 1,
      requireMeal: true,
      mealOptions: ['Option 1', 'Option 2', 'Option 3'],
      enableTransport: false,
      enableLodging: false,
      enableAccessibility: false,
      enablePhotoConsent: false
    },
    theme: {
      primaryColor: '#004645',
      secondaryColor: '#009197',
      accentColor: '#FF4713',
      fontFamily: 'Arial, sans-serif'
    },
    customTexts: {
      welcomeGreeting: 'Bonjour {{guest.firstName}} 👋',
      welcomeSubtitle: 'Vous êtes invité(e) à',
      formTitle: 'Votre réponse',
      responseQuestion: 'Participez-vous à l\'événement ?',
      responseYes: '✓ J\'accepte avec plaisir',
      responseNo: '✗ Je ne peux malheureusement pas venir'
    },
    suggestions: {
      dressCode: '',
      emailSubject: 'Invitation - {{event.name}}'
    }
  }
}

/**
 * Get template by type
 */
export function getEventTemplate(type: EventType): EventTemplateConfig {
  return EVENT_TEMPLATES[type] || EVENT_TEMPLATES.custom
}

/**
 * Get all templates as array
 */
export function getAllEventTemplates(): EventTemplateConfig[] {
  return Object.values(EVENT_TEMPLATES)
}

/**
 * Get popular templates (exclude custom)
 */
export function getPopularEventTemplates(): EventTemplateConfig[] {
  return getAllEventTemplates().filter(t => t.id !== 'custom')
}
