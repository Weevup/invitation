import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin, handleAuthError } from '@/lib/auth-utils'
import { getEventFilter } from '@/lib/permissions'

/**
 * GET /api/admin/events
 * Liste tous les événements de l'administrateur connecté
 */
export async function GET() {
  try {
    const session = await requireAdmin()

    // Filtrer les événements par propriétaire
    const events = await prisma.event.findMany({
      where: getEventFilter(session.user.id),
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            guests: true,
            rsvps: true,
          },
        },
      },
    })

    return NextResponse.json(events)
  } catch (error) {
    return handleAuthError(error)
  }
}

/**
 * POST /api/admin/events
 * Crée un nouvel événement pour l'administrateur connecté
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin()
    const body = await request.json()

    // Generate slug from name
    const slug = body.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      + '-' + Date.now()

    const event = await prisma.event.create({
      data: {
        name: body.name,
        slug: slug,
        description: body.description,
        startsAt: new Date(body.date),
        venueName: body.location || body.venueName,
        address: body.address,
        city: body.city,
        adminId: session.user.id,
        // RSVP Configuration (from template)
        allowPlusOnes: body.allowPlusOnes ?? false,
        maxPlusOnes: body.maxPlusOnes ?? 0,
        requireMeal: body.requireMeal ?? false,
        mealOptions: body.mealOptions ?? [],
        enableTransport: body.enableTransport ?? false,
        enableLodging: body.enableLodging ?? false,
        enableAccessibility: body.enableAccessibility ?? true,
        enablePhotoConsent: body.enablePhotoConsent ?? true,
      },
    })

    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    return handleAuthError(error)
  }
}
