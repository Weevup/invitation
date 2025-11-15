import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin, handleAuthError } from '@/lib/auth-utils'
import { adminApiRateLimit, getRateLimitIdentifier, getRateLimitHeaders, normalizeRateLimitResult } from '@/lib/rate-limit'
import { createBadgeTemplateSchema, validateSchema } from '@/lib/validations'
import { getDefaultBadgeTemplates } from '@/lib/badge-generator'
import { createLogger } from '@/lib/logger'

const badgeTemplateLogger = createLogger({ module: 'badge', type: 'template' })

/**
 * GET /api/admin/badge-templates
 * Get all badge templates
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const templates = await prisma.badgeTemplate.findMany({
      where: { isActive: true },
      orderBy: [
        { isDefault: 'desc' },
        { name: 'asc' },
      ],
    })

    // If no templates exist, return default ones
    if (templates.length === 0) {
      return NextResponse.json({
        templates: getDefaultBadgeTemplates(),
        isDefault: true,
      })
    }

    return NextResponse.json({ templates })
  } catch (error) {
    badgeTemplateLogger.error(
      { error, stack: error instanceof Error ? error.stack : undefined },
      'Error fetching badge templates'
    )
    return handleAuthError(error)
  }
}

/**
 * POST /api/admin/badge-templates
 * Create a new badge template
 */
export async function POST(request: NextRequest) {
  try {
    await requireAdmin()

    // Rate limiting
    const identifier = getRateLimitIdentifier(request, 'badge-template-create')
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
    const validation = validateSchema(createBadgeTemplateSchema, body)
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
      description,
      size,
      orientation,
      layout,
      fields,
      fontFamily,
      isDefault,
    } = validation.data

    // If setting as default, unset other defaults
    if (isDefault) {
      await prisma.badgeTemplate.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      })
    }

    // Create template
    const template = await prisma.badgeTemplate.create({
      data: {
        name,
        description,
        size,
        orientation,
        layout,
        fields,
        fontFamily: fontFamily || 'Arial',
        isDefault: isDefault || false,
      },
    })

    badgeTemplateLogger.info(
      { templateId: template.id, name: template.name },
      'Badge template created successfully'
    )

    return NextResponse.json({ template }, { status: 201 })
  } catch (error) {
    badgeTemplateLogger.error(
      { error, stack: error instanceof Error ? error.stack : undefined },
      'Error creating badge template'
    )
    return handleAuthError(error)
  }
}
