import { z } from 'zod'

/**
 * Validation pour la création d'un invité
 */
export const createGuestSchema = z.object({
  firstName: z.string().min(1, 'Le prénom est requis').max(100, 'Le prénom est trop long'),
  lastName: z.string().min(1, 'Le nom est requis').max(100, 'Le nom est trop long'),
  email: z.string().email('Email invalide').max(255, 'Email trop long'),
  company: z.string().max(200, 'Nom de société trop long').optional(),
  tags: z.array(z.string()).optional(),
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
  sections: z.array(z.any()).optional(), // JSON complexe, validation plus souple
  gallery: z.array(z.any()).optional(),
  faq: z.array(z.any()).optional(),
  speakers: z.array(z.any()).optional(),
  sponsors: z.array(z.any()).optional(),
  timeline: z.array(z.any()).optional(),
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
