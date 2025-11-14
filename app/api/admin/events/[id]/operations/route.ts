import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin, handleAuthError } from '@/lib/auth-utils'
import {
  buildTimeSlots,
  calculateAlerts,
  calculateKPIs,
  groupTransportsByTime,
  buildAccommodationEvents
} from './helpers'

/**
 * GET /api/admin/events/[id]/operations
 *
 * Récupère toutes les données pour le Planning Opérationnel :
 * - Timeline chronologique complète (sessions, transport, hébergement)
 * - Alertes globales (allergies, régimes, warnings)
 * - KPIs de l'événement
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin()
    const { id: eventId } = await params

    // Vérifier que l'événement appartient à l'admin connecté
    const event = await prisma.event.findFirst({
      where: {
        id: eventId,
        adminId: session.user.id
      },
      include: {
        _count: {
          select: {
            guests: true,
            sessions: true
          }
        }
      }
    })

    if (!event) {
      return NextResponse.json(
        { error: 'Événement non trouvé' },
        { status: 404 }
      )
    }

    // Récupérer toutes les données en parallèle
    const [
      sessions,
      guests,
      rsvps,
      transportBookings,
      transportManifests,
      manifestParticipants,
      accommodations,
      rooms,
      roomAssignments,
      timelineEvents
    ] = await Promise.all([
      // Sessions avec participants et groupes
      prisma.session.findMany({
        where: { eventId },
        include: {
          participants: {
            include: {
              guest: true,
              group: true
            }
          },
          groups: {
            include: {
              _count: {
                select: {
                  participants: true
                }
              }
            },
            orderBy: { order: 'asc' }
          }
        },
        orderBy: { startTime: 'asc' }
      }),

      // Invités
      prisma.guest.findMany({
        where: { eventId }
      }),

      // RSVPs avec infos alimentaires
      prisma.rSVP.findMany({
        where: {
          guest: { eventId }
        },
        include: {
          guest: true
        }
      }),

      // Transport - Réservations individuelles
      prisma.transportBooking.findMany({
        where: { eventId },
        include: {
          guest: true
        },
        orderBy: { departureTime: 'asc' }
      }),

      // Transport - Manifests (navettes groupées)
      prisma.transportManifest.findMany({
        where: { eventId },
        include: {
          participants: {
            include: {
              guest: true
            }
          }
        },
        orderBy: { departureTime: 'asc' }
      }),

      // Participants des manifests
      prisma.manifestParticipant.findMany({
        where: {
          manifest: { eventId }
        },
        include: {
          guest: true,
          manifest: true
        }
      }),

      // Hébergement - Accommodations
      prisma.accommodation.findMany({
        where: { eventId },
        include: {
          rooms: {
            include: {
              assignments: {
                include: {
                  guest: true
                }
              }
            }
          }
        }
      }),

      // Chambres
      prisma.room.findMany({
        where: {
          accommodation: { eventId }
        },
        include: {
          assignments: {
            include: {
              guest: true
            }
          }
        }
      }),

      // Assignations de chambres
      prisma.roomAssignment.findMany({
        where: {
          room: {
            accommodation: { eventId }
          }
        },
        include: {
          guest: true,
          room: {
            include: {
              accommodation: true
            }
          }
        },
        orderBy: { checkInDate: 'asc' }
      }),

      // Timeline events
      prisma.timelineEvent.findMany({
        where: { eventId },
        orderBy: { startTime: 'asc' }
      })
    ])

    // Construire la timeline chronologique avec tous les types de blocs
    const timeSlots = buildTimeSlots({
      sessions,
      timelineEvents,
      transportBookings,
      transportManifests,
      accommodations,
      roomAssignments,
      rsvps
    })

    // Calculer les alertes globales
    const alerts = calculateAlerts({
      rsvps,
      guests,
      sessions,
      transportBookings,
      transportManifests,
      roomAssignments
    })

    // Calculer les KPIs
    const kpis = calculateKPIs({
      event,
      guests,
      rsvps,
      sessions,
      transportBookings,
      transportManifests,
      accommodations,
      roomAssignments
    })

    return NextResponse.json({
      success: true,
      event: {
        id: event.id,
        name: event.name,
        startsAt: event.startsAt,
        endsAt: event.endsAt,
        venueName: event.venueName,
        city: event.city,
        description: event.description
      },
      timeSlots,
      alerts,
      kpis,
      // Données brutes pour le panel latéral
      rawData: {
        guests,
        rsvps,
        sessions,
        transportBookings,
        transportManifests,
        accommodations,
        roomAssignments
      }
    })

  } catch (error) {
    console.error('Operations API error:', error)
    return handleAuthError(error)
  }
}
