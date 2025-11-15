import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin, handleAuthError } from '@/lib/auth-utils'
import { requireEventOwnership } from '@/lib/permissions'
import { getCachedEvent, getCachedEventStats, invalidateEventCache } from '@/lib/cache'

/**
 * GET /api/admin/events/[id]
 * Récupère les détails d'un événement avec stats agrégées (OPTIMISÉ)
 *
 * Query params:
 *   - includeGuests=true : Charge tous les invités (déconseillé pour les gros événements)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin()
    const { id } = await params

    // Vérifier que l'admin est propriétaire de l'événement
    await requireEventOwnership(id, session.user.id)

    const { searchParams } = new URL(request.url)
    const includeGuests = searchParams.get('includeGuests') === 'true'

    // OPTIMISATION: Charger uniquement les stats par défaut + CACHE
    if (!includeGuests) {
      const [event, stats] = await Promise.all([
        // 1. Données de base de l'événement (CACHED 5 min)
        getCachedEvent(id, () =>
          prisma.event.findUnique({
            where: { id },
            select: {
              id: true,
              name: true,
              slug: true,
              description: true,
              startsAt: true,
              endsAt: true,
              venueName: true,
              address: true,
              city: true,
              country: true,
              createdAt: true,
              updatedAt: true,
              adminId: true,
              // Counts optimisés
              _count: {
                select: {
                  guests: true,
                  rsvps: true,
                },
              },
            },
          })
        ),
        // 2. Statistiques agrégées (parallèle + CACHED 5 min)
        getCachedEventStats(id, () =>
          Promise.all([
            // Invités ayant répondu
            prisma.rSVP.count({
              where: {
                eventId: id,
                attending: { not: null },
              },
            }),
            // Invités confirmés
            prisma.rSVP.count({
              where: {
                eventId: id,
                attending: true,
              },
            }),
            // Invités déclinés
            prisma.rSVP.count({
              where: {
                eventId: id,
                attending: false,
              },
            }),
            // Invités check-in
            prisma.guest.count({
              where: {
                eventId: id,
                checkins: {
                  some: {},
                },
              },
            }),
            // Total +1s
            prisma.rSVP.aggregate({
              where: {
                eventId: id,
                attending: true,
              },
              _sum: {
                plusOnes: true,
              },
            }),
          ])
        ),
      ])

      if (!event) {
        return NextResponse.json(
          { error: 'Événement introuvable' },
          { status: 404 }
        )
      }

      const [respondedCount, attendingCount, decliningCount, checkedInCount, plusOnesSum] = stats

      // Retourner les données optimisées
      return NextResponse.json({
        ...event,
        stats: {
          totalGuests: event._count.guests,
          totalRsvps: event._count.rsvps,
          respondedGuests: respondedCount,
          attendingGuests: attendingCount,
          decliningGuests: decliningCount,
          checkedInGuests: checkedInCount,
          totalPlusOnes: plusOnesSum._sum.plusOnes || 0,
          totalExpected: attendingCount + (plusOnesSum._sum.plusOnes || 0),
        },
      })
    }

    // Mode legacy: charger tous les invités (déconseillé)
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        guests: {
          include: {
            rsvp: true,
            checkins: {
              orderBy: {
                checkedInAt: 'desc',
              },
            },
          },
          orderBy: {
            lastName: 'asc',
          },
        },
      },
    })

    if (!event) {
      return NextResponse.json(
        { error: 'Événement introuvable' },
        { status: 404 }
      )
    }

    return NextResponse.json(event)
  } catch (error) {
    return handleAuthError(error)
  }
}

/**
 * PUT /api/admin/events/[id]
 * Met à jour un événement (avec vérification d'ownership)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin()
    const { id } = await params
    const body = await request.json()

    // Vérifier que l'admin est propriétaire de l'événement
    await requireEventOwnership(id, session.user.id)

    const event = await prisma.event.update({
      where: { id },
      data: body,
    })

    // Invalider le cache après mise à jour
    await invalidateEventCache(id)

    return NextResponse.json(event)
  } catch (error) {
    return handleAuthError(error)
  }
}

/**
 * DELETE /api/admin/events/[id]
 * Supprime un événement (avec vérification d'ownership)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin()
    const { id } = await params

    // Vérifier que l'admin est propriétaire de l'événement
    await requireEventOwnership(id, session.user.id)

    await prisma.event.delete({
      where: { id },
    })

    // Invalider le cache après suppression
    await invalidateEventCache(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleAuthError(error)
  }
}
