import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin, handleAuthError } from '@/lib/auth-utils'
import { requireEventOwnership } from '@/lib/permissions'

/**
 * GET /api/admin/events/[id]/checkin-guests
 * Récupère uniquement les invités confirmés pour le check-in (OPTIMISÉ)
 *
 * Retourne seulement les champs nécessaires pour le check-in:
 * - ID, nom, prénom, email
 * - Status RSVP (confirmé uniquement)
 * - Check-ins existants
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin()
    const { id: eventId } = await params

    // Vérifier que l'admin est propriétaire de l'événement
    await requireEventOwnership(eventId, session.user.id)

    // Charger le nom de l'événement en parallèle
    const [event, guests] = await Promise.all([
      prisma.event.findUnique({
        where: { id: eventId },
        select: { id: true, name: true },
      }),
      // Charger uniquement les invités confirmés avec les champs nécessaires
      prisma.guest.findMany({
      where: {
        eventId,
        rsvp: {
          attending: true,
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        company: true,
        rsvp: {
          select: {
            attending: true,
            plusOnes: true,
            mealChoice: true,
          },
        },
        checkins: {
          select: {
            id: true,
            checkedInAt: true,
          },
          orderBy: {
            checkedInAt: 'desc',
          },
        },
      },
      orderBy: [
        { lastName: 'asc' },
        { firstName: 'asc' },
      ],
    }),
    ])

    if (!event) {
      return NextResponse.json(
        { error: 'Événement introuvable' },
        { status: 404 }
      )
    }

    // Calculer les stats
    const checkedInCount = guests.filter(g => g.checkins && g.checkins.length > 0).length

    return NextResponse.json({
      event: {
        id: event.id,
        name: event.name,
      },
      guests,
      stats: {
        total: guests.length,
        checkedIn: checkedInCount,
        pending: guests.length - checkedInCount,
        percentageCheckedIn: guests.length > 0
          ? Math.round((checkedInCount / guests.length) * 100)
          : 0,
      },
    })
  } catch (error) {
    return handleAuthError(error)
  }
}
