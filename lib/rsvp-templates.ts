/**
 * RSVP Configuration Templates
 * Predefined templates for common event types
 */

export interface RSVPTemplate {
  id: string
  name: string
  description: string
  icon: string
  config: {
    allowPlusOne: boolean
    maxPlusOnes: number
    collectDietaryRestrictions: boolean
    collectMealChoice: boolean
    mealOptions: string[]
    collectAccommodation: boolean
    confirmationMessage: string
    declineMessage: string
  }
  fields?: Array<{
    id: string
    type: 'text' | 'email' | 'phone' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'number'
    label: string
    placeholder?: string
    required: boolean
    options?: string[]
    description?: string
  }>
}

export const rsvpTemplates: RSVPTemplate[] = [
  {
    id: 'simple',
    name: 'Simple',
    description: 'Configuration minimaliste - Juste présence/absence',
    icon: '✓',
    config: {
      allowPlusOne: false,
      maxPlusOnes: 0,
      collectDietaryRestrictions: false,
      collectMealChoice: false,
      mealOptions: [],
      collectAccommodation: false,
      confirmationMessage: 'Merci pour votre réponse ! Nous avons bien enregistré votre participation.',
      declineMessage: 'Nous sommes désolés que vous ne puissiez pas être des nôtres. À bientôt !'
    },
    fields: [
      {
        id: 'attending',
        type: 'radio',
        label: 'Serez-vous présent(e) ?',
        required: true,
        options: ['Oui, je serai présent(e)', 'Non, je ne pourrai pas venir']
      }
    ]
  },
  {
    id: 'corporate',
    name: 'Événement professionnel',
    description: 'Pour séminaires, conférences, team building',
    icon: '💼',
    config: {
      allowPlusOne: false,
      maxPlusOnes: 0,
      collectDietaryRestrictions: true,
      collectMealChoice: true,
      mealOptions: ['Menu Omnivore', 'Menu Végétarien', 'Menu Sans gluten'],
      collectAccommodation: true,
      confirmationMessage: 'Merci pour votre confirmation ! Vous recevrez prochainement toutes les informations pratiques par email.',
      declineMessage: 'Merci de nous avoir prévenus. Nous espérons vous voir lors d\'un prochain événement !'
    },
    fields: [
      {
        id: 'attending',
        type: 'radio',
        label: 'Confirmez-vous votre participation ?',
        required: true,
        options: ['Oui, je participe', 'Non, je ne peux pas participer']
      },
      {
        id: 'function',
        type: 'text',
        label: 'Fonction',
        placeholder: 'Votre fonction dans l\'entreprise',
        required: false
      },
      {
        id: 'interests',
        type: 'checkbox',
        label: 'Sujets qui vous intéressent',
        required: false,
        options: [
          'Innovation & Technologies',
          'Leadership & Management',
          'Marketing & Communication',
          'Ressources Humaines'
        ]
      }
    ]
  },
  {
    id: 'wedding',
    name: 'Mariage',
    description: 'Configuration complète pour un mariage',
    icon: '💑',
    config: {
      allowPlusOne: true,
      maxPlusOnes: 1,
      collectDietaryRestrictions: true,
      collectMealChoice: true,
      mealOptions: ['Menu Viande', 'Menu Poisson', 'Menu Végétarien'],
      collectAccommodation: false,
      confirmationMessage: 'Nous sommes ravis de célébrer ce jour avec vous ! Merci d\'avoir confirmé votre présence. 💕',
      declineMessage: 'Nous sommes désolés que vous ne puissiez pas être avec nous ce jour-là. Vous serez dans nos pensées ! 💝'
    },
    fields: [
      {
        id: 'attending',
        type: 'radio',
        label: 'Serez-vous des nôtres pour notre grand jour ?',
        required: true,
        options: ['Oui, avec grand plaisir !', 'Non, malheureusement']
      },
      {
        id: 'song_request',
        type: 'text',
        label: 'Suggestion de chanson pour la soirée',
        placeholder: 'Une chanson qui vous fait danser...',
        required: false,
        description: 'Aidez-nous à créer la playlist parfaite !'
      },
      {
        id: 'message',
        type: 'textarea',
        label: 'Un petit mot pour les mariés',
        placeholder: 'Vos vœux, un souvenir, une anecdote...',
        required: false
      }
    ]
  },
  {
    id: 'gala',
    name: 'Soirée de Gala',
    description: 'Pour événements formels et soirées prestigieuses',
    icon: '🎩',
    config: {
      allowPlusOne: true,
      maxPlusOnes: 1,
      collectDietaryRestrictions: true,
      collectMealChoice: true,
      mealOptions: ['Menu Prestige', 'Menu Végétarien Gourmet', 'Menu Sans allergènes'],
      collectAccommodation: true,
      confirmationMessage: 'Nous avons le plaisir de confirmer votre participation. Une invitation formelle vous sera envoyée prochainement.',
      declineMessage: 'Nous prenons note de votre absence et espérons avoir le plaisir de vous recevoir lors d\'une prochaine occasion.'
    },
    fields: [
      {
        id: 'attending',
        type: 'radio',
        label: 'Confirmez-vous votre présence à la soirée ?',
        required: true,
        options: ['Oui, je confirme ma présence', 'Non, je ne pourrai pas venir']
      },
      {
        id: 'title',
        type: 'select',
        label: 'Civilité',
        required: false,
        options: ['M.', 'Mme', 'Dr.', 'Pr.']
      },
      {
        id: 'vip_table',
        type: 'text',
        label: 'Préférence de table',
        placeholder: 'Souhaitez-vous être placé(e) près de quelqu\'un ?',
        required: false
      }
    ]
  },
  {
    id: 'party',
    name: 'Fête / Anniversaire',
    description: 'Pour célébrations festives et anniversaires',
    icon: '🎉',
    config: {
      allowPlusOne: true,
      maxPlusOnes: 2,
      collectDietaryRestrictions: true,
      collectMealChoice: false,
      mealOptions: [],
      collectAccommodation: false,
      confirmationMessage: 'Super ! On a hâte de faire la fête avec vous ! 🎊',
      declineMessage: 'Dommage que tu ne puisses pas venir... On pensera à toi ! 😢'
    },
    fields: [
      {
        id: 'attending',
        type: 'radio',
        label: 'Tu viens faire la fête ?',
        required: true,
        options: ['Ouiii ! Je serai là 🎉', 'Non, je ne peux pas venir 😢']
      },
      {
        id: 'music_style',
        type: 'checkbox',
        label: 'Tes styles de musique préférés',
        required: false,
        options: ['Pop/Rock', 'Hip-Hop/Rap', 'Électro/Dance', 'Années 80/90', 'Latino']
      },
      {
        id: 'bringing',
        type: 'text',
        label: 'Tu apportes quelque chose ?',
        placeholder: 'Boissons, gâteau, bonne humeur...',
        required: false
      }
    ]
  },
  {
    id: 'conference',
    name: 'Conférence / Webinaire',
    description: 'Pour événements éducatifs et professionnels',
    icon: '🎓',
    config: {
      allowPlusOne: false,
      maxPlusOnes: 0,
      collectDietaryRestrictions: false,
      collectMealChoice: false,
      mealOptions: [],
      collectAccommodation: false,
      confirmationMessage: 'Votre inscription est confirmée ! Vous recevrez le lien de connexion 24h avant l\'événement.',
      declineMessage: 'Merci de nous avoir informés. L\'enregistrement sera disponible après l\'événement.'
    },
    fields: [
      {
        id: 'attending',
        type: 'radio',
        label: 'Participerez-vous à la conférence ?',
        required: true,
        options: ['Oui, je m\'inscris', 'Non, pas cette fois']
      },
      {
        id: 'company',
        type: 'text',
        label: 'Entreprise',
        placeholder: 'Nom de votre entreprise',
        required: false
      },
      {
        id: 'role',
        type: 'text',
        label: 'Poste / Fonction',
        placeholder: 'Votre fonction actuelle',
        required: false
      },
      {
        id: 'expectations',
        type: 'textarea',
        label: 'Vos attentes pour cet événement',
        placeholder: 'Qu\'aimeriez-vous apprendre ou découvrir ?',
        required: false,
        description: 'Aidez-nous à adapter le contenu à vos besoins'
      }
    ]
  },
  {
    id: 'custom',
    name: 'Personnalisé',
    description: 'Partez d\'une base vierge et créez votre configuration',
    icon: '⚙️',
    config: {
      allowPlusOne: false,
      maxPlusOnes: 1,
      collectDietaryRestrictions: false,
      collectMealChoice: false,
      mealOptions: ['Menu 1', 'Menu 2'],
      collectAccommodation: false,
      confirmationMessage: 'Merci pour votre réponse !',
      declineMessage: 'Merci de nous avoir prévenus.'
    },
    fields: [
      {
        id: 'attending',
        type: 'radio',
        label: 'Serez-vous présent(e) ?',
        required: true,
        options: ['Oui', 'Non']
      }
    ]
  }
]

/**
 * Get a template by ID
 */
export function getTemplateById(id: string): RSVPTemplate | undefined {
  return rsvpTemplates.find(t => t.id === id)
}

/**
 * Get recommended templates based on event type
 */
export function getRecommendedTemplates(eventType?: string): RSVPTemplate[] {
  const typeMapping: Record<string, string[]> = {
    'wedding': ['wedding', 'gala'],
    'corporate': ['corporate', 'conference'],
    'birthday': ['party', 'simple'],
    'conference': ['conference', 'corporate'],
    'gala': ['gala', 'corporate']
  }

  if (eventType && typeMapping[eventType]) {
    const recommendedIds = typeMapping[eventType]
    return rsvpTemplates.filter(t => recommendedIds.includes(t.id))
  }

  return rsvpTemplates
}
