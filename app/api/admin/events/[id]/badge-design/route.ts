import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin, handleAuthError } from '@/lib/auth-utils'
import { requireEventOwnership } from '@/lib/permissions'
import { adminApiRateLimit, getRateLimitIdentifier, getRateLimitHeaders, normalizeRateLimitResult } from '@/lib/rate-limit'
import { createBadgeDesignSchema, validateSchema } from '@/lib/validations'
import { getDefaultBadgeTemplates } from '@/lib/badge-generator'
import { createLogger } from '@/lib/logger'

const badgeDesignLogger = createLogger({ module: 'badge', type: 'design' })

/**
 * GET /api/admin/events/[id]/badge-design
 * Get badge design for an event
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin()
    const { id: eventId } = await params

    // Verify admin owns this event
    await requireEventOwnership(eventId, session.user.id)

    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, name: true },
    })

    if (!event) {
      return NextResponse.json(
        { error: 'Événement non trouvé' },
        { status: 404 }
      )
    }

    // Get badge design
    const badgeDesign = await prisma.badgeDesign.findUnique({
      where: { eventId },
      include: {
        template: true,
      },
    })

    // If no design exists, return default template
    if (!badgeDesign) {
      const defaultTemplates = getDefaultBadgeTemplates()
      const defaultTemplate = defaultTemplates.find((t) => t.isDefault)

      if (defaultTemplate) {
        return NextResponse.json({
          badgeDesign: {
            eventId,
            name: 'Default Badge',
            size: defaultTemplate.size,
            orientation: defaultTemplate.orientation,
            layout: defaultTemplate.layout,
            fields: defaultTemplate.fields,
            fontFamily: defaultTemplate.fontFamily,
            includeQRCode: true,
            qrCodeSize: 80,
            badgesPerPage: 10,
            pageMargin: 10,
            badgeSpacing: 5,
          },
          isDefault: true,
        })
      }
    }

    return NextResponse.json({ badgeDesign })
  } catch (error) {
    badgeDesignLogger.error(
      { error, stack: error instanceof Error ? error.stack : undefined },
      'Error fetching badge design'
    )
    return handleAuthError(error)
  }
}

/**
 * PUT /api/admin/events/[id]/badge-design
 * Create or update badge design for an event
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin()
    const { id: eventId } = await params

    // Verify admin owns this event
    await requireEventOwnership(eventId, session.user.id)

    // Rate limiting
    const identifier = getRateLimitIdentifier(request, eventId)
    const rawResult = await adminApiRateLimit.limit(identifier)
    const rateLimitResult = normalizeRateLimitResult(rawResult)

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: 'RATE_LIMIT_EXCEEDED',
          message: 'Trop de requêtes. Veuillez ralentir.',
        },
        {
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      )
    }

    const body = await request.json()

    // Validate data with Zod
    const validation = validateSchema(createBadgeDesignSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'VALIDATION_ERROR',
          message: 'Les données sont invalides',
          errors: validation.errors,
        },
        { status: 400 }
      )
    }

    const {
      name,
      templateId,
      size,
      orientation,
      layout,
      fields,
      fontFamily,
      eventLogoUrl,
      includeQRCode,
      qrCodeSize,
      badgesPerPage,
      pageMargin,
      badgeSpacing,
    } = validation.data

    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    })

    if (!event) {
      return NextResponse.json(
        { error: 'Événement introuvable' },
        { status: 404 }
      )
    }

    // Verify template exists if provided
    if (templateId) {
      const template = await prisma.badgeTemplate.findUnique({
        where: { id: templateId },
      })

      if (!template) {
        return NextResponse.json(
          { error: 'Template de badge introuvable' },
          { status: 404 }
        )
      }
    }

    // Upsert badge design
    const badgeDesign = await prisma.badgeDesign.upsert({
      where: { eventId },
      update: {
        name: name || 'Event Badge',
        templateId: templateId || null,
        size,
        orientation,
        layout,
        fields,
        fontFamily: fontFamily || 'Arial',
        eventLogoUrl: eventLogoUrl || null,
        includeQRCode: includeQRCode !== undefined ? includeQRCode : true,
        qrCodeSize: qrCodeSize || 80,
        badgesPerPage: badgesPerPage || 10,
        pageMargin: pageMargin || 10,
        badgeSpacing: badgeSpacing || 5,
      },
      create: {
        eventId,
        name: name || 'Event Badge',
        templateId: templateId || null,
        size,
        orientation,
        layout,
        fields,
        fontFamily: fontFamily || 'Arial',
        eventLogoUrl: eventLogoUrl || null,
        includeQRCode: includeQRCode !== undefined ? includeQRCode : true,
        qrCodeSize: qrCodeSize || 80,
        badgesPerPage: badgesPerPage || 10,
        pageMargin: pageMargin || 10,
        badgeSpacing: badgeSpacing || 5,
      },
      include: {
        template: true,
      },
    })

    badgeDesignLogger.info(
      { eventId, badgeDesignId: badgeDesign.id },
      'Badge design saved successfully'
    )

    return NextResponse.json({ badgeDesign })
  } catch (error) {
    badgeDesignLogger.error(
      { error, stack: error instanceof Error ? error.stack : undefined },
      'Error saving badge design'
    )
    return handleAuthError(error)
  }
}
