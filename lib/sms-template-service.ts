import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import type { SMSTemplate, Event, Guest } from '@prisma/client'

/**
 * Variables disponibles pour personnalisation des templates
 */
export interface TemplateVariables {
  // Guest variables
  firstName?: string
  lastName?: string
  fullName?: string
  email?: string
  company?: string
  jobTitle?: string

  // Event variables
  eventName?: string
  eventDate?: string
  eventTime?: string
  venueName?: string
  venueAddress?: string

  // RSVP variables
  rsvpDeadline?: string
  rsvpLink?: string

  // Custom variables
  [key: string]: string | undefined
}

/**
 * Default templates to seed the database
 */
export const DEFAULT_SMS_TEMPLATES = [
  {
    name: 'Confirmation RSVP',
    description: 'Confirmation d\'inscription à l\'événement',
    category: 'rsvp',
    message: 'Bonjour {firstName} ! Votre présence à {eventName} le {eventDate} est confirmée. Rendez-vous à {venueName}. À bientôt !',
    variables: ['firstName', 'eventName', 'eventDate', 'venueName'],
    isDefault: true,
  },
  {
    name: 'Rappel J-7',
    description: 'Rappel 7 jours avant l\'événement',
    category: 'reminder',
    message: 'Bonjour {firstName} ! Rappel : {eventName} dans 7 jours, le {eventDate} à {eventTime}. Nous avons hâte de vous voir !',
    variables: ['firstName', 'eventName', 'eventDate', 'eventTime'],
    isDefault: true,
  },
  {
    name: 'Rappel J-1',
    description: 'Rappel la veille de l\'événement',
    category: 'reminder',
    message: 'Bonjour {firstName} ! C\'est demain ! {eventName} vous attend le {eventDate} à {eventTime} à {venueName}. À très vite !',
    variables: ['firstName', 'eventName', 'eventDate', 'eventTime', 'venueName'],
    isDefault: true,
  },
  {
    name: 'Information importante',
    description: 'Message d\'information générale',
    category: 'info',
    message: 'Bonjour {firstName}, information importante concernant {eventName} : ',
    variables: ['firstName', 'eventName'],
    isDefault: true,
  },
  {
    name: 'Invitation dernière minute',
    description: 'Invitation pour personnes ajoutées tard',
    category: 'rsvp',
    message: '{firstName}, vous êtes invité(e) à {eventName} le {eventDate} ! Confirmez votre présence : {rsvpLink}',
    variables: ['firstName', 'eventName', 'eventDate', 'rsvpLink'],
    isDefault: false,
  },
  {
    name: 'Merci de votre présence',
    description: 'Remerciement post-événement',
    category: 'info',
    message: 'Merci {firstName} pour votre présence à {eventName} ! Nous espérons vous revoir bientôt.',
    variables: ['firstName', 'eventName'],
    isDefault: false,
  },
]

/**
 * Render template with variables
 */
export function renderTemplate(template: string, variables: TemplateVariables): string {
  let rendered = template

  // Replace all {variableName} with actual values
  Object.entries(variables).forEach(([key, value]) => {
    if (value !== undefined) {
      const regex = new RegExp(`\\{${key}\\}`, 'g')
      rendered = rendered.replace(regex, value)
    }
  })

  return rendered
}

/**
 * Extract variables from template string
 */
export function extractVariables(template: string): string[] {
  const regex = /\{([a-zA-Z0-9_]+)\}/g
  const matches = template.matchAll(regex)
  const variables = new Set<string>()

  for (const match of matches) {
    variables.add(match[1])
  }

  return Array.from(variables)
}

/**
 * Build variables from guest and event data
 */
export function buildTemplateVariables(
  guest: Guest,
  event: Event,
  customVariables?: Record<string, string>
): TemplateVariables {
  // Format date
  const eventDate = new Date(event.startsAt).toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const eventTime = new Date(event.startsAt).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  })

  const rsvpDeadline = event.rsvpDeadline
    ? new Date(event.rsvpDeadline).toLocaleDateString('fr-FR')
    : undefined

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.weevup.com'
  const rsvpLink = `${baseUrl}/guest/${guest.token}`

  return {
    // Guest variables
    firstName: guest.firstName,
    lastName: guest.lastName,
    fullName: `${guest.firstName} ${guest.lastName}`,
    email: guest.email,
    company: guest.company || undefined,
    jobTitle: guest.jobTitle || undefined,

    // Event variables
    eventName: event.name,
    eventDate,
    eventTime,
    venueName: event.venueName || undefined,
    venueAddress: event.address || undefined,

    // RSVP variables
    rsvpDeadline,
    rsvpLink,

    // Custom variables
    ...customVariables,
  }
}

/**
 * Get all templates for an event (event-specific + global)
 */
export async function getEventTemplates(eventId: string) {
  const templates = await prisma.sMSTemplate.findMany({
    where: {
      OR: [
        { eventId }, // Event-specific templates
        { eventId: null }, // Global templates
      ],
      isActive: true,
    },
    orderBy: [
      { isDefault: 'desc' },
      { category: 'asc' },
      { usageCount: 'desc' },
    ],
  })

  return templates
}

/**
 * Get template by ID
 */
export async function getTemplateById(templateId: string) {
  return prisma.sMSTemplate.findUnique({
    where: { id: templateId },
  })
}

/**
 * Create a new template
 */
export async function createTemplate(data: {
  name: string
  description?: string
  category?: string
  message: string
  eventId?: string
  isDefault?: boolean
}) {
  // Extract variables from message
  const variables = extractVariables(data.message)

  const template = await prisma.sMSTemplate.create({
    data: {
      name: data.name,
      description: data.description,
      category: data.category || 'custom',
      message: data.message,
      variables,
      eventId: data.eventId,
      isDefault: data.isDefault || false,
    },
  })

  logger.info(
    {
      templateId: template.id,
      name: template.name,
      eventId: data.eventId,
    },
    'SMS template created'
  )

  return template
}

/**
 * Update a template
 */
export async function updateTemplate(
  templateId: string,
  data: {
    name?: string
    description?: string
    category?: string
    message?: string
    isActive?: boolean
    isDefault?: boolean
  }
) {
  // If message is updated, re-extract variables
  let updateData: any = { ...data }

  if (data.message) {
    updateData.variables = extractVariables(data.message)
  }

  const template = await prisma.sMSTemplate.update({
    where: { id: templateId },
    data: updateData,
  })

  logger.info(
    {
      templateId: template.id,
      name: template.name,
    },
    'SMS template updated'
  )

  return template
}

/**
 * Delete a template
 */
export async function deleteTemplate(templateId: string) {
  await prisma.sMSTemplate.delete({
    where: { id: templateId },
  })

  logger.info({ templateId }, 'SMS template deleted')
}

/**
 * Increment usage count for a template
 */
export async function incrementTemplateUsage(templateId: string) {
  await prisma.sMSTemplate.update({
    where: { id: templateId },
    data: {
      usageCount: { increment: 1 },
      lastUsedAt: new Date(),
    },
  })
}

/**
 * Seed default templates (run once on first setup)
 */
export async function seedDefaultTemplates() {
  logger.info('Seeding default SMS templates')

  for (const templateData of DEFAULT_SMS_TEMPLATES) {
    // Check if template already exists
    const existing = await prisma.sMSTemplate.findFirst({
      where: {
        name: templateData.name,
        eventId: null, // Only global templates
      },
    })

    if (!existing) {
      await createTemplate({
        name: templateData.name,
        description: templateData.description,
        category: templateData.category,
        message: templateData.message,
        isDefault: templateData.isDefault,
      })

      logger.info({ name: templateData.name }, 'Default template seeded')
    }
  }

  logger.info('Default SMS templates seeded successfully')
}
