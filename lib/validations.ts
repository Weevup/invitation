import { z } from 'zod'

// Zod schemas for showcase data structures
export const speakerSchema = z.object({
  name: z.string(),
  title: z.string(),
  bio: z.string(),
  photo: z.string(),
  email: z.string().email().optional(),
})

export const sponsorSchema = z.object({
  name: z.string(),
  logo: z.string(),
  website: z.string().url(),
  tier: z.enum(['platinum', 'gold', 'silver', 'bronze']),
})

export const timelineItemSchema = z.object({
  time: z.string(),
  title: z.string(),
  description: z.string(),
  icon: z.string().optional(),
})

export const faqItemSchema = z.object({
  question: z.string(),
  answer: z.string(),
})

export const sectionConfigSchema = z.object({
  id: z.string(),
  enabled: z.boolean(),
  order: z.number(),
  customSettings: z.record(z.unknown()).optional(),
})

export const emergencyContactSchema = z.object({
  name: z.string(),
  phone: z.string(),
  relationship: z.string(),
})

/**
 * Validation pour la création d'un invité
 */
export const createGuestSchema = z.object({
  firstName: z.string().min(1, 'Le prénom est requis').max(100, 'Le prénom est trop long'),
  lastName: z.string().min(1, 'Le nom est requis').max(100, 'Le nom est trop long'),
  email: z.string().email('Email invalide').max(255, 'Email trop long'),
  company: z.string().max(200, 'Nom de société trop long').optional(),
  tags: z.array(z.string()).optional(),

  // Professional information
  jobTitle: z.string().max(100, 'Fonction trop longue').optional(),
  department: z.string().max(100, 'Département trop long').optional(),
  companySize: z.enum(['TPE', 'PME', 'ETI', 'GE'], {
    errorMap: () => ({ message: 'Taille d\'entreprise invalide' })
  }).optional(),
  industry: z.string().max(100, 'Secteur trop long').optional(),
  linkedinUrl: z.string().url('URL LinkedIn invalide').max(500, 'URL trop longue').optional().or(z.literal('')),
  phoneNumber: z.string().max(20, 'Numéro trop long').optional(),

  // Event-specific needs
  dietaryReqs: z.string().max(1000, 'Texte trop long').optional(),
  accessibility: z.string().max(1000, 'Texte trop long').optional(),
  adminNotes: z.string().max(2000, 'Notes trop longues').optional(),

  // Enhanced fields
  emergencyContact: emergencyContactSchema.optional(),
  tShirtSize: z.enum(['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']).optional(),
  arrivalTime: z.string().datetime().optional(),
  departureTime: z.string().datetime().optional(),
})

/**
 * Validation pour la soumission RSVP
 */
export const rsvpSubmissionSchema = z.object({
  attending: z.boolean({
    required_error: 'La réponse de présence est requise',
    invalid_type_error: 'La réponse doit être un booléen',
  }),
  plusOnes: z
    .number()
    .int('Le nombre d\'accompagnants doit être un entier')
    .min(0, 'Le nombre d\'accompagnants ne peut pas être négatif')
    .max(10, 'Trop d\'accompagnants')
    .optional()
    .default(0),
  mealChoice: z.string().max(100, 'Choix de repas trop long').optional(),
  allergies: z.string().max(1000, 'Texte des allergies trop long').optional(),
  accessibilityNotes: z.string().max(1000, 'Notes d\'accessibilité trop longues').optional(),
  transportNeeds: z.string().max(1000, 'Besoins de transport trop longs').optional(),
  lodgingNeeds: z.string().max(1000, 'Besoins d\'hébergement trop longs').optional(),
  consentPhotos: z.boolean().optional().default(false),
})

/**
 * Validation pour le check-in
 */
export const checkinSchema = z.object({
  desk: z.string().max(50, 'Nom du desk trop long').optional(),
  notes: z.string().max(500, 'Notes trop longues').optional(),
})

/**
 * Validation pour la création d'un événement
 */
export const createEventSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(200, 'Le nom est trop long'),
  slug: z
    .string()
    .min(1, 'Le slug est requis')
    .max(200, 'Le slug est trop long')
    .regex(/^[a-z0-9-]+$/, 'Le slug ne peut contenir que des lettres minuscules, chiffres et tirets'),
  description: z.string().max(5000, 'La description est trop longue').optional(),
  startsAt: z.string().datetime('Date de début invalide'),
  endsAt: z.string().datetime('Date de fin invalide').optional(),
  venueName: z.string().max(200, 'Nom du lieu trop long').optional(),
  address: z.string().max(500, 'Adresse trop longue').optional(),
  city: z.string().max(100, 'Nom de ville trop long').optional(),
  country: z.string().max(100, 'Nom de pays trop long').optional(),
  coverImage: z.string().url('URL d\'image invalide').optional(),
  dressCode: z.string().max(200, 'Code vestimentaire trop long').optional(),
  rsvpDeadline: z.string().datetime('Date limite RSVP invalide').optional(),
  maxPlusOnes: z.number().int().min(0).max(10).optional().default(0),
  allowPlusOnes: z.boolean().optional().default(false),
  requireMeal: z.boolean().optional().default(false),
  mealOptions: z.array(z.string().max(100)).optional().default([]),
})

/**
 * Validation pour la mise à jour d'un événement
 */
export const updateEventSchema = createEventSchema.partial().omit({ slug: true })

/**
 * Validation pour l'envoi d'invitations
 */
export const sendInvitationsSchema = z.object({
  type: z.enum(['INVITE', 'REMINDER'], {
    required_error: 'Le type d\'email est requis',
    invalid_type_error: 'Type d\'email invalide',
  }),
  guestIds: z.array(z.string().cuid('ID invité invalide')).optional(),
  templateId: z.string().cuid('ID template invalide').optional(),
})

/**
 * Validation pour les configurations showcase
 */
export const showcaseConfigSchema = z.object({
  enabled: z.boolean().optional(),
  title: z.string().max(200).optional(),
  subtitle: z.string().max(500).optional(),
  bannerImage: z.string().url().optional(),
  theme: z.enum(['weevup', 'elegant', 'modern', 'minimal']).optional(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Couleur hexadécimale invalide').optional(),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Couleur hexadécimale invalide').optional(),
  customCSS: z.string().max(10000).optional(),
  sections: z.array(sectionConfigSchema).optional(),
  gallery: z.array(z.string().url()).optional(),
  faq: z.array(faqItemSchema).optional(),
  speakers: z.array(speakerSchema).optional(),
  sponsors: z.array(sponsorSchema).optional(),
  timeline: z.array(timelineItemSchema).optional(),
})

/**
 * Validation pour import CSV
 */
export const importGuestsSchema = z.array(
  z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    company: z.string().optional(),
    tags: z.string().optional(), // Comma-separated tags
  })
)

/**
 * Validation pour les templates email
 */
export const emailTemplateSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(200),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/),
  description: z.string().max(1000).optional(),
  type: z.enum(['SAVE_THE_DATE', 'INVITE', 'INVITATION', 'REMINDER', 'CONFIRMATION', 'INFO', 'CUSTOM']),
  subject: z.string().min(1, 'Le sujet est requis').max(200),
  htmlContent: z.string().min(1, 'Le contenu HTML est requis'),
  textContent: z.string().optional(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  isDefault: z.boolean().optional().default(false),
  isActive: z.boolean().optional().default(true),
})

// ============================================
// Badge System Validations
// ============================================

/**
 * Badge field configuration schema
 */
export const badgeFieldSchema = z.object({
  id: z.string(),
  type: z.enum([
    'FIRST_NAME',
    'LAST_NAME',
    'FULL_NAME',
    'COMPANY',
    'JOB_TITLE',
    'EMAIL',
    'QR_CODE',
    'EVENT_NAME',
    'EVENT_DATE',
    'CUSTOM_TEXT',
    'LOGO',
    'PHOTO',
  ]),
  x: z.number().min(0, 'Position X invalide'),
  y: z.number().min(0, 'Position Y invalide'),
  width: z.number().min(0, 'Largeur invalide').optional(),
  height: z.number().min(0, 'Hauteur invalide').optional(),
  fontSize: z.number().min(8).max(72, 'Taille de police invalide').optional(),
  fontWeight: z.enum(['normal', 'bold', 'bolder', 'lighter']).optional(),
  fontStyle: z.enum(['normal', 'italic']).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Couleur invalide').optional(),
  textAlign: z.enum(['left', 'center', 'right']).optional(),
  customText: z.string().max(200, 'Texte personnalisé trop long').optional(),
  size: z.number().min(10).max(500, 'Taille invalide').optional(), // For QR codes
})

/**
 * Badge layout section schema
 */
export const badgeSectionSchema = z.object({
  type: z.enum(['header', 'body', 'footer']),
  height: z.number().min(0, 'Hauteur invalide'),
  backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Couleur invalide').optional(),
  borderColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Couleur invalide').optional(),
  borderWidth: z.number().min(0).max(20, 'Épaisseur de bordure invalide').optional(),
})

/**
 * Badge layout configuration schema
 */
export const badgeLayoutSchema = z.object({
  backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Couleur de fond invalide'),
  borderColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Couleur de bordure invalide').optional(),
  borderWidth: z.number().min(0).max(20, 'Épaisseur de bordure invalide').optional(),
  borderRadius: z.number().min(0).max(50, 'Rayon de bordure invalide').optional(),
  sections: z.array(badgeSectionSchema).optional(),
})

/**
 * Validation pour créer un template de badge
 */
export const createBadgeTemplateSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(100, 'Nom trop long'),
  description: z.string().max(500, 'Description trop longue').optional(),
  size: z.enum(['STANDARD', 'LARGE', 'LANYARD', 'A6']),
  orientation: z.enum(['PORTRAIT', 'LANDSCAPE']),
  layout: badgeLayoutSchema,
  fields: z.array(badgeFieldSchema),
  fontFamily: z.string().max(50, 'Nom de police trop long').optional(),
  isDefault: z.boolean().optional(),
})

/**
 * Validation pour créer/modifier un design de badge pour un événement
 */
export const createBadgeDesignSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(100, 'Nom trop long').optional(),
  templateId: z.string().cuid('ID de template invalide').optional(),
  size: z.enum(['STANDARD', 'LARGE', 'LANYARD', 'A6']),
  orientation: z.enum(['PORTRAIT', 'LANDSCAPE']),
  layout: badgeLayoutSchema,
  fields: z.array(badgeFieldSchema).min(1, 'Au moins un champ est requis'),
  fontFamily: z.string().max(50, 'Nom de police trop long').optional(),
  eventLogoUrl: z.string().url('URL de logo invalide').optional().or(z.literal('')),
  includeQRCode: z.boolean().optional(),
  qrCodeSize: z.number().min(50).max(200, 'Taille de QR code invalide').optional(),
  badgesPerPage: z.number().int().min(1).max(20, 'Nombre de badges par page invalide').optional(),
  pageMargin: z.number().min(0).max(50, 'Marge invalide').optional(),
  badgeSpacing: z.number().min(0).max(20, 'Espacement invalide').optional(),
})

/**
 * Validation pour générer des badges
 */
export const generateBadgesSchema = z.object({
  guestIds: z.array(z.string().cuid('ID d\'invité invalide')).min(1, 'Au moins un invité est requis'),
})

/**
 * Validation pour marquer un badge comme imprimé
 */
export const markBadgePrintedSchema = z.object({
  badgeIds: z.array(z.string().cuid('ID de badge invalide')).min(1, 'Au moins un badge est requis'),
})

/**
 * Helper pour valider et retourner une erreur formatée
 */
export function validateSchema<T>(schema: z.Schema<T>, data: unknown) {
  const result = schema.safeParse(data)

  if (!result.success) {
    const errors = result.error.errors.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    }))

    return {
      success: false as const,
      errors,
      data: null,
    }
  }

  return {
    success: true as const,
    errors: null,
    data: result.data,
  }
}
