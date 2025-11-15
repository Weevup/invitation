import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin, handleAuthError } from '@/lib/auth-utils'
import { requireEventOwnership } from '@/lib/permissions'
import { adminApiRateLimit, getRateLimitIdentifier, getRateLimitHeaders, normalizeRateLimitResult } from '@/lib/rate-limit'
import { generateBadgesSchema, validateSchema } from '@/lib/validations'
import { generateBatchBadgeData } from '@/lib/badge-generator'
import { createLogger } from '@/lib/logger'

const badgeGenerateLogger = createLogger({ module: 'badge', type: 'generate' })

/**
 * POST /api/admin/events/[id]/badges/generate
 * Generate badges for selected guests
 */
export async function POST(
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
    const validation = validateSchema(generateBadgesSchema, body)
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

    const { guestIds } = validation.data

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

    // Get badge design for the event
    const badgeDesign = await prisma.badgeDesign.findUnique({
      where: { eventId },
    })

    if (!badgeDesign) {
      return NextResponse.json(
        {
          error: 'Aucun design de badge configuré pour cet événement',
          message: 'Veuillez d\'abord créer un design de badge',
        },
        { status: 400 }
      )
    }

    // Verify all guests belong to this event and have RSVP
    const guests = await prisma.guest.findMany({
      where: {
        id: { in: guestIds },
        eventId,
      },
      include: {
        rsvp: true,
      },
    })

    if (guests.length !== guestIds.length) {
      return NextResponse.json(
        { error: 'Certains invités n\'existent pas ou n\'appartiennent pas à cet événement' },
        { status: 400 }
      )
    }

    // Check for guests without RSVP
    const guestsWithoutRsvp = guests.filter((g) => !g.rsvp)
    if (guestsWithoutRsvp.length > 0) {
      return NextResponse.json(
        {
          error: 'Certains invités n\'ont pas de RSVP',
          guestsWithoutRsvp: guestsWithoutRsvp.map((g) => ({
            id: g.id,
            name: `${g.firstName} ${g.lastName}`,
          })),
        },
        { status: 400 }
      )
    }

    // Generate badge data for all guests
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const badgeDataList = await generateBatchBadgeData(
      guestIds,
      eventId,
      appUrl
    )

    // Create or update badges in database
    const createdBadges = []
    const updatedBadges = []

    for (const { guestId, renderedData } of badgeDataList) {
      const existingBadge = await prisma.badge.findUnique({
        where: { guestId },
      })

      if (existingBadge) {
        // Update existing badge
        const updated = await prisma.badge.update({
          where: { guestId },
          data: {
            renderedData,
            isReady: true,
          },
        })
        updatedBadges.push(updated)
      } else {
        // Create new badge
        const created = await prisma.badge.create({
          data: {
            guestId,
            badgeDesignId: badgeDesign.id,
            renderedData,
            isReady: true,
          },
        })
        createdBadges.push(created)
      }
    }

    badgeGenerateLogger.info(
      {
        eventId,
        created: createdBadges.length,
        updated: updatedBadges.length,
      },
      'Badges generated successfully'
    )

    return NextResponse.json({
      message: `${createdBadges.length} badge(s) créé(s), ${updatedBadges.length} badge(s) mis à jour`,
      created: createdBadges.length,
      updated: updatedBadges.length,
      total: createdBadges.length + updatedBadges.length,
    })
  } catch (error) {
    badgeGenerateLogger.error(
      { error, stack: error instanceof Error ? error.stack : undefined },
      'Error generating badges'
    )
    return handleAuthError(error)
  }
}
