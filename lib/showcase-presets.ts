// Presets de thèmes pour la page vitrine

export interface ThemePreset {
  id: string
  name: string
  description: string
  primaryColor: string
  secondaryColor: string
  fontFamily: string
  preview: string
}

export const themePresets: ThemePreset[] = [
  {
    id: 'weevup',
    name: 'Weevup Classic',
    description: 'Thème signature Weevup avec vert profond et orange accent',
    primaryColor: '#004645',
    secondaryColor: '#FF4713',
    fontFamily: 'Abril Fatface',
    preview: 'linear-gradient(135deg, #004645 0%, #009197 50%, #FF4713 100%)'
  },
  {
    id: 'elegant',
    name: 'Élégance',
    description: 'Noir et or pour une touche de luxe',
    primaryColor: '#1a1a1a',
    secondaryColor: '#d4af37',
    fontFamily: 'Playfair Display',
    preview: 'linear-gradient(135deg, #1a1a1a 0%, #3d3d3d 50%, #d4af37 100%)'
  },
  {
    id: 'modern',
    name: 'Moderne',
    description: 'Bleu dynamique et violet tech',
    primaryColor: '#2563eb',
    secondaryColor: '#8b5cf6',
    fontFamily: 'Inter',
    preview: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 50%, #8b5cf6 100%)'
  },
  {
    id: 'minimal',
    name: 'Minimaliste',
    description: 'Gris épuré et accent coloré',
    primaryColor: '#374151',
    secondaryColor: '#10b981',
    fontFamily: 'system-ui',
    preview: 'linear-gradient(135deg, #374151 0%, #6b7280 50%, #10b981 100%)'
  },
  {
    id: 'sunset',
    name: 'Coucher de soleil',
    description: 'Dégradé chaud et accueillant',
    primaryColor: '#dc2626',
    secondaryColor: '#f59e0b',
    fontFamily: 'Poppins',
    preview: 'linear-gradient(135deg, #dc2626 0%, #f97316 50%, #f59e0b 100%)'
  },
  {
    id: 'ocean',
    name: 'Océan',
    description: 'Bleu profond et turquoise',
    primaryColor: '#0c4a6e',
    secondaryColor: '#06b6d4',
    fontFamily: 'Montserrat',
    preview: 'linear-gradient(135deg, #0c4a6e 0%, #0369a1 50%, #06b6d4 100%)'
  },
  {
    id: 'forest',
    name: 'Forêt',
    description: 'Vert nature et terreux',
    primaryColor: '#14532d',
    secondaryColor: '#84cc16',
    fontFamily: 'Lora',
    preview: 'linear-gradient(135deg, #14532d 0%, #166534 50%, #84cc16 100%)'
  },
  {
    id: 'royal',
    name: 'Royal',
    description: 'Violet impérial et or',
    primaryColor: '#581c87',
    secondaryColor: '#eab308',
    fontFamily: 'Merriweather',
    preview: 'linear-gradient(135deg, #581c87 0%, #7c3aed 50%, #eab308 100%)'
  }
]
