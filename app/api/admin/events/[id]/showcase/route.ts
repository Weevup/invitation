import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { requireAdmin, handleAuthError } from '@/lib/auth-utils'
import { requireEventOwnership } from '@/lib/permissions'
import { createLogger } from '@/lib/logger'

const showcaseLogger = createLogger({ module: 'event', type: 'showcase' })

interface RouteContext {
  params: Promise<{
    id: string
  }>
}

// Zod schema for SectionConfig validation
const SectionConfigSchema = z.object({
  id: z.string(),
  type: z.string(),
  enabled: z.boolean(),
  order: z.number(),
  layout: z.enum(['fullwidth', 'container', 'split', 'grid']),
  columns: z.number().min(1).max(4).optional(),
  alignment: z.enum(['left', 'center', 'right']),
  paddingTop: z.enum(['none', 'sm', 'md', 'lg', 'xl']),
  paddingBottom: z.enum(['none', 'sm', 'md', 'lg', 'xl']),
  marginTop: z.enum(['none', 'sm', 'md', 'lg', 'xl']).optional(),
  marginBottom: z.enum(['none', 'sm', 'md', 'lg', 'xl']).optional(),
  backgroundColor: z.string().optional(),
  backgroundImage: z.string().optional(),
  backgroundOverlay: z.boolean().optional(),
  overlayOpacity: z.number().min(0).max(100).optional(),
  backgroundPattern: z.enum(['none', 'dots', 'grid', 'waves']).optional(),
  animationType: z.enum(['fade', 'slide', 'zoom', 'none']),
  animationDuration: z.enum(['fast', 'normal', 'slow']),
  animationDelay: z.number().min(0).optional(),
})

export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const session = await requireAdmin()
    const { id } = await context.params

    // Verify ownership before updating showcase
    await requireEventOwnership(id, session.user.id)

    const body = await request.json()

    const {
      showcaseEnabled,
      showcaseTitle,
      showcaseSubtitle,
      showcaseBannerImage,
      showcasePrimaryColor,
      showcaseSecondaryColor,
      showcaseSections,
      showcaseCustomCSS,
      showcaseGallery,
      showcaseFAQ,
      showcaseVideo,
      showcaseCountdown,
      showcaseSocialShare,
      showcaseSpeakers,
      showcaseSponsors,
      showcaseTimeline,
      showcaseSectionContents,
    } = body

    // Validate showcaseSections if provided
    let validatedSections = showcaseSections || ['hero', 'description', 'details', 'cta']

    if (showcaseSections && Array.isArray(showcaseSections)) {
      // Check if it's already SectionConfig format (objects) or legacy format (strings)
      if (showcaseSections.length > 0 && typeof showcaseSections[0] === 'object') {
        try {
          // Validate each section against the schema
          const SectionsArraySchema = z.array(SectionConfigSchema)
          validatedSections = SectionsArraySchema.parse(showcaseSections)
        } catch (validationError) {
          return NextResponse.json(
            {
              success: false,
              error: 'Format de sections invalide',
              details: validationError instanceof z.ZodError
                ? validationError.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
                : 'Validation error'
            },
            { status: 400 }
          )
        }
      }
      // Otherwise, assume it's legacy string[] format and accept it as-is
      // (it will be migrated by the frontend using migrateLegacySections)
    }

    // Update event with showcase settings
    const event = await prisma.event.update({
      where: { id },
      data: {
        showcaseEnabled: showcaseEnabled ?? false,
        showcaseTitle: showcaseTitle || null,
        showcaseSubtitle: showcaseSubtitle || null,
        showcaseBannerImage: showcaseBannerImage || null,
        showcasePrimaryColor: showcasePrimaryColor || '#004645',
        showcaseSecondaryColor: showcaseSecondaryColor || '#FF4713',
        showcaseSections: validatedSections,
        showcaseCustomCSS: showcaseCustomCSS || null,
        showcaseGallery: showcaseGallery || null,
        showcaseFAQ: showcaseFAQ || null,
        showcaseVideo: showcaseVideo || null,
        showcaseCountdown: showcaseCountdown ?? true,
        showcaseSocialShare: showcaseSocialShare ?? true,
        showcaseSpeakers: showcaseSpeakers || null,
        showcaseSponsors: showcaseSponsors || null,
        showcaseTimeline: showcaseTimeline || null,
        showcaseSectionContents: showcaseSectionContents || null,
      },
    })

    return NextResponse.json({
      success: true,
      event,
    })
  } catch (error) {
    showcaseLogger.error({ error, stack: error instanceof Error ? error.stack : undefined }, 'Error updating showcase')
    return handleAuthError(error)
  }
}
