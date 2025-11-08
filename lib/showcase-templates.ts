/**
 * Templates complets pour la page vitrine
 * Chaque template contient une configuration complète prête à l'emploi
 */

export interface SectionConfig {
  id: string
  type: string
  enabled: boolean
  order: number

  // Layout
  layout: 'fullwidth' | 'container' | 'split' | 'grid'
  columns?: 1 | 2 | 3 | 4
  alignment: 'left' | 'center' | 'right'

  // Spacing
  paddingTop: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  paddingBottom: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  marginTop?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  marginBottom?: 'none' | 'sm' | 'md' | 'lg' | 'xl'

  // Background
  backgroundColor?: string
  backgroundImage?: string
  backgroundOverlay?: boolean
  overlayOpacity?: number
  backgroundPattern?: 'none' | 'dots' | 'grid' | 'waves'

  // Animation
  animationType: 'fade' | 'slide' | 'zoom' | 'none'
  animationDuration: 'fast' | 'normal' | 'slow'
  animationDelay?: number

  // Content specific
  content?: any
}

export interface ShowcaseTemplate {
  id: string
  name: string
  description: string
  category: 'corporate' | 'event' | 'tech' | 'charity' | 'product'
  preview: string

  // Configuration globale
  theme: string
  primaryColor: string
  secondaryColor: string

  // Sections configurées
  sections: SectionConfig[]

  // Contenu exemple
  sampleContent: {
    title: string
    subtitle: string
    description: string
    features?: string[]
  }
}

export const showcaseTemplates: ShowcaseTemplate[] = [
  {
    id: 'corporate-event',
    name: 'Événement Corporate',
    description: 'Professionnel et élégant pour événements d\'entreprise',
    category: 'corporate',
    preview: '/templates/corporate.jpg',
    theme: 'elegant',
    primaryColor: '#1a1a1a',
    secondaryColor: '#d4af37',
    sections: [
      {
        id: 'hero-1',
        type: 'hero',
        enabled: true,
        order: 0,
        layout: 'fullwidth',
        alignment: 'center',
        paddingTop: 'xl',
        paddingBottom: 'xl',
        backgroundColor: '#1a1a1a',
        backgroundOverlay: true,
        overlayOpacity: 60,
        animationType: 'fade',
        animationDuration: 'slow',
      },
      {
        id: 'countdown-1',
        type: 'countdown',
        enabled: true,
        order: 1,
        layout: 'container',
        alignment: 'center',
        paddingTop: 'lg',
        paddingBottom: 'lg',
        backgroundColor: '#ffffff',
        animationType: 'zoom',
        animationDuration: 'normal',
      },
      {
        id: 'timeline-1',
        type: 'timeline',
        enabled: true,
        order: 2,
        layout: 'container',
        alignment: 'left',
        paddingTop: 'lg',
        paddingBottom: 'lg',
        animationType: 'slide',
        animationDuration: 'normal',
      },
      {
        id: 'speakers-1',
        type: 'speakers',
        enabled: true,
        order: 3,
        layout: 'container',
        columns: 3,
        alignment: 'center',
        paddingTop: 'xl',
        paddingBottom: 'xl',
        backgroundColor: '#f9fafb',
        animationType: 'fade',
        animationDuration: 'normal',
      },
      {
        id: 'sponsors-1',
        type: 'sponsors',
        enabled: true,
        order: 4,
        layout: 'container',
        columns: 4,
        alignment: 'center',
        paddingTop: 'lg',
        paddingBottom: 'lg',
        animationType: 'fade',
        animationDuration: 'fast',
      },
      {
        id: 'faq-1',
        type: 'faq',
        enabled: true,
        order: 5,
        layout: 'container',
        alignment: 'left',
        paddingTop: 'lg',
        paddingBottom: 'lg',
        animationType: 'slide',
        animationDuration: 'normal',
      },
      {
        id: 'cta-1',
        type: 'cta',
        enabled: true,
        order: 6,
        layout: 'fullwidth',
        alignment: 'center',
        paddingTop: 'xl',
        paddingBottom: 'xl',
        backgroundColor: '#d4af37',
        animationType: 'zoom',
        animationDuration: 'normal',
      },
    ],
    sampleContent: {
      title: 'Votre Événement Corporate',
      subtitle: 'Une expérience professionnelle inoubliable',
      description: 'Rejoignez-nous pour une journée de networking, conférences et innovation.',
    },
  },
  {
    id: 'festival-concert',
    name: 'Festival / Concert',
    description: 'Énergique et coloré pour événements musicaux',
    category: 'event',
    preview: '/templates/festival.jpg',
    theme: 'sunset',
    primaryColor: '#dc2626',
    secondaryColor: '#f59e0b',
    sections: [
      {
        id: 'hero-1',
        type: 'hero',
        enabled: true,
        order: 0,
        layout: 'fullwidth',
        alignment: 'center',
        paddingTop: 'xl',
        paddingBottom: 'xl',
        backgroundPattern: 'waves',
        backgroundOverlay: true,
        overlayOpacity: 40,
        animationType: 'zoom',
        animationDuration: 'fast',
      },
      {
        id: 'video-1',
        type: 'video',
        enabled: true,
        order: 1,
        layout: 'container',
        alignment: 'center',
        paddingTop: 'xl',
        paddingBottom: 'xl',
        backgroundColor: '#000000',
        animationType: 'fade',
        animationDuration: 'normal',
      },
      {
        id: 'speakers-1', // Lineup
        type: 'speakers',
        enabled: true,
        order: 2,
        layout: 'container',
        columns: 4,
        alignment: 'center',
        paddingTop: 'xl',
        paddingBottom: 'xl',
        animationType: 'slide',
        animationDuration: 'normal',
      },
      {
        id: 'gallery-1',
        type: 'gallery',
        enabled: true,
        order: 3,
        layout: 'fullwidth',
        columns: 3,
        alignment: 'center',
        paddingTop: 'lg',
        paddingBottom: 'lg',
        animationType: 'zoom',
        animationDuration: 'fast',
      },
      {
        id: 'details-1',
        type: 'details',
        enabled: true,
        order: 4,
        layout: 'container',
        alignment: 'center',
        paddingTop: 'lg',
        paddingBottom: 'lg',
        backgroundColor: '#f9fafb',
        animationType: 'fade',
        animationDuration: 'normal',
      },
      {
        id: 'cta-1',
        type: 'cta',
        enabled: true,
        order: 5,
        layout: 'fullwidth',
        alignment: 'center',
        paddingTop: 'xl',
        paddingBottom: 'xl',
        backgroundColor: '#dc2626',
        animationType: 'zoom',
        animationDuration: 'fast',
      },
    ],
    sampleContent: {
      title: 'Festival Été 2025',
      subtitle: '3 jours de musique et de festivités',
      description: 'Les plus grands artistes réunis pour un festival exceptionnel.',
    },
  },
  {
    id: 'tech-conference',
    name: 'Conférence Tech',
    description: 'Moderne et innovant pour événements technologiques',
    category: 'tech',
    preview: '/templates/tech.jpg',
    theme: 'modern',
    primaryColor: '#2563eb',
    secondaryColor: '#8b5cf6',
    sections: [
      {
        id: 'hero-1',
        type: 'hero',
        enabled: true,
        order: 0,
        layout: 'fullwidth',
        alignment: 'center',
        paddingTop: 'xl',
        paddingBottom: 'xl',
        backgroundPattern: 'grid',
        animationType: 'fade',
        animationDuration: 'normal',
      },
      {
        id: 'countdown-1',
        type: 'countdown',
        enabled: true,
        order: 1,
        layout: 'container',
        alignment: 'center',
        paddingTop: 'lg',
        paddingBottom: 'lg',
        animationType: 'zoom',
        animationDuration: 'fast',
      },
      {
        id: 'speakers-1',
        type: 'speakers',
        enabled: true,
        order: 2,
        layout: 'container',
        columns: 3,
        alignment: 'center',
        paddingTop: 'xl',
        paddingBottom: 'xl',
        backgroundColor: '#f9fafb',
        animationType: 'slide',
        animationDuration: 'normal',
      },
      {
        id: 'program-1',
        type: 'program',
        enabled: true,
        order: 3,
        layout: 'container',
        alignment: 'left',
        paddingTop: 'lg',
        paddingBottom: 'lg',
        animationType: 'fade',
        animationDuration: 'normal',
      },
      {
        id: 'sponsors-1',
        type: 'sponsors',
        enabled: true,
        order: 4,
        layout: 'container',
        columns: 4,
        alignment: 'center',
        paddingTop: 'lg',
        paddingBottom: 'lg',
        backgroundColor: '#ffffff',
        animationType: 'fade',
        animationDuration: 'fast',
      },
      {
        id: 'faq-1',
        type: 'faq',
        enabled: true,
        order: 5,
        layout: 'container',
        alignment: 'left',
        paddingTop: 'lg',
        paddingBottom: 'lg',
        animationType: 'slide',
        animationDuration: 'normal',
      },
      {
        id: 'cta-1',
        type: 'cta',
        enabled: true,
        order: 6,
        layout: 'fullwidth',
        alignment: 'center',
        paddingTop: 'xl',
        paddingBottom: 'xl',
        backgroundColor: '#2563eb',
        animationType: 'zoom',
        animationDuration: 'normal',
      },
    ],
    sampleContent: {
      title: 'TechConf 2025',
      subtitle: 'L\'avenir de la technologie',
      description: 'Découvrez les dernières innovations et tendances tech avec les meilleurs experts.',
      features: ['IA & Machine Learning', 'Cloud & DevOps', 'Cybersécurité', 'Web3'],
    },
  },
  {
    id: 'charity-gala',
    name: 'Gala de Charité',
    description: 'Élégant et émotionnel pour événements caritatifs',
    category: 'charity',
    preview: '/templates/charity.jpg',
    theme: 'royal',
    primaryColor: '#581c87',
    secondaryColor: '#eab308',
    sections: [
      {
        id: 'hero-1',
        type: 'hero',
        enabled: true,
        order: 0,
        layout: 'fullwidth',
        alignment: 'center',
        paddingTop: 'xl',
        paddingBottom: 'xl',
        backgroundOverlay: true,
        overlayOpacity: 50,
        animationType: 'fade',
        animationDuration: 'slow',
      },
      {
        id: 'description-1',
        type: 'description',
        enabled: true,
        order: 1,
        layout: 'container',
        alignment: 'center',
        paddingTop: 'xl',
        paddingBottom: 'xl',
        animationType: 'fade',
        animationDuration: 'normal',
      },
      {
        id: 'video-1', // Témoignages
        type: 'video',
        enabled: true,
        order: 2,
        layout: 'container',
        alignment: 'center',
        paddingTop: 'lg',
        paddingBottom: 'lg',
        backgroundColor: '#f9fafb',
        animationType: 'slide',
        animationDuration: 'normal',
      },
      {
        id: 'sponsors-1', // Partenaires
        type: 'sponsors',
        enabled: true,
        order: 3,
        layout: 'container',
        columns: 4,
        alignment: 'center',
        paddingTop: 'xl',
        paddingBottom: 'xl',
        animationType: 'fade',
        animationDuration: 'normal',
      },
      {
        id: 'timeline-1', // Programme de la soirée
        type: 'timeline',
        enabled: true,
        order: 4,
        layout: 'container',
        alignment: 'left',
        paddingTop: 'lg',
        paddingBottom: 'lg',
        animationType: 'slide',
        animationDuration: 'normal',
      },
      {
        id: 'cta-1', // Faire un don
        type: 'cta',
        enabled: true,
        order: 5,
        layout: 'fullwidth',
        alignment: 'center',
        paddingTop: 'xl',
        paddingBottom: 'xl',
        backgroundColor: '#581c87',
        animationType: 'zoom',
        animationDuration: 'normal',
      },
    ],
    sampleContent: {
      title: 'Gala de Bienfaisance',
      subtitle: 'Ensemble pour une noble cause',
      description: 'Une soirée d\'exception pour soutenir notre mission et faire la différence.',
    },
  },
  {
    id: 'product-launch',
    name: 'Lancement Produit',
    description: 'Impactant et marketing pour lancements de produits',
    category: 'product',
    preview: '/templates/product.jpg',
    theme: 'ocean',
    primaryColor: '#0c4a6e',
    secondaryColor: '#06b6d4',
    sections: [
      {
        id: 'hero-1',
        type: 'hero',
        enabled: true,
        order: 0,
        layout: 'fullwidth',
        alignment: 'center',
        paddingTop: 'xl',
        paddingBottom: 'xl',
        backgroundPattern: 'dots',
        animationType: 'zoom',
        animationDuration: 'fast',
      },
      {
        id: 'video-1', // Teaser
        type: 'video',
        enabled: true,
        order: 1,
        layout: 'container',
        alignment: 'center',
        paddingTop: 'xl',
        paddingBottom: 'xl',
        backgroundColor: '#000000',
        animationType: 'fade',
        animationDuration: 'normal',
      },
      {
        id: 'description-1', // Features
        type: 'description',
        enabled: true,
        order: 2,
        layout: 'split',
        alignment: 'left',
        paddingTop: 'lg',
        paddingBottom: 'lg',
        animationType: 'slide',
        animationDuration: 'normal',
      },
      {
        id: 'timeline-1', // Roadmap
        type: 'timeline',
        enabled: true,
        order: 3,
        layout: 'container',
        alignment: 'center',
        paddingTop: 'xl',
        paddingBottom: 'xl',
        backgroundColor: '#f9fafb',
        animationType: 'fade',
        animationDuration: 'normal',
      },
      {
        id: 'gallery-1', // Visuels produit
        type: 'gallery',
        enabled: true,
        order: 4,
        layout: 'container',
        columns: 3,
        alignment: 'center',
        paddingTop: 'lg',
        paddingBottom: 'lg',
        animationType: 'zoom',
        animationDuration: 'fast',
      },
      {
        id: 'cta-1', // Réserver / Acheter
        type: 'cta',
        enabled: true,
        order: 5,
        layout: 'fullwidth',
        alignment: 'center',
        paddingTop: 'xl',
        paddingBottom: 'xl',
        backgroundColor: '#06b6d4',
        animationType: 'zoom',
        animationDuration: 'normal',
      },
    ],
    sampleContent: {
      title: 'Découvrez Notre Innovation',
      subtitle: 'Le futur commence aujourd\'hui',
      description: 'Une révolution dans votre quotidien. Soyez parmi les premiers à découvrir notre nouveau produit.',
      features: ['Design révolutionnaire', 'Technologie avancée', 'Éco-responsable', 'Made in France'],
    },
  },
]

/**
 * Récupère un template par son ID
 */
export function getTemplate(templateId: string): ShowcaseTemplate | undefined {
  return showcaseTemplates.find(t => t.id === templateId)
}

/**
 * Récupère les templates par catégorie
 */
export function getTemplatesByCategory(category: string): ShowcaseTemplate[] {
  return showcaseTemplates.filter(t => t.category === category)
}
