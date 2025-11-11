import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/admin/events/[id]/dashboard
 * Get dashboard overview with stats and alerts for event organizers
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params

    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        name: true,
        startsAt: true,
        endsAt: true,
      },
    })

    if (!event) {
      return NextResponse.json(
        { error: 'Événement non trouvé' },
        { status: 404 }
      )
    }

    // Parallel fetching for performance
    const [
      guests,
      sessions,
      transports,
      sessionParticipants,
      accommodations,
    ] = await Promise.all([
      // Get all guests
      prisma.guest.findMany({
        where: { eventId },
        include: {
          rsvp: true,
          transportBookings: true,
          sessionParticipations: {
            include: {
              session: true,
            },
          },
        },
      }),

      // Get all sessions
      prisma.session.findMany({
        where: { eventId },
        include: {
          participants: {
            include: {
              guest: true,
            },
          },
        },
      }),

      // Get all transports
      prisma.transportBooking.findMany({
        where: { eventId },
        include: {
          guest: true,
        },
      }),

      // Get all session participants
      prisma.sessionParticipant.count({
        where: {
          session: {
            eventId,
          },
        },
      }),

      // Get all accommodations with rooms and assignments
      prisma.accommodation.findMany({
        where: { eventId },
        include: {
          rooms: {
            include: {
              assignments: true,
            },
          },
        },
      }),
    ])

    // Calculate accommodation stats
    const totalRooms = accommodations.reduce((sum: number, acc: any) => sum + acc.rooms.length, 0)
    const assignedRooms = accommodations.reduce(
      (sum: number, acc: any) => sum + acc.rooms.filter((r: any) => r.status === 'ASSIGNED').length,
      0
    )
    const totalGuestsInRooms = accommodations.reduce(
      (sum: number, acc: any) =>
        sum + acc.rooms.reduce((roomSum: number, room: any) => roomSum + room.assignments.length, 0),
      0
    )

    // Calculate global stats
    const stats = {
      totalGuests: guests.length,
      confirmedGuests: guests.filter((g) => g.rsvp?.attending === true).length,
      totalSessions: sessions.length,
      publishedSessions: sessions.filter((s) => s.status === 'PUBLISHED').length,
      totalTransports: transports.length,
      confirmedTransports: transports.filter((t) => t.status === 'CONFIRMED' || t.status === 'BOOKED').length,
      totalSessionParticipations: sessionParticipants,
      totalAccommodations: accommodations.length,
      totalRooms,
      assignedRooms,
      totalGuestsInRooms,
    }

    // Detect alerts
    const alerts = []

    // Alert 1: Guests without transport
    const guestsWithoutTransport = guests.filter(
      (g) => g.rsvp?.attending === true && g.transportBookings.length === 0
    )
    if (guestsWithoutTransport.length > 0) {
      alerts.push({
        type: 'warning',
        category: 'transport',
        title: 'Invités sans transport',
        message: `${guestsWithoutTransport.length} invité(s) confirmé(s) n'ont pas de transport réservé`,
        count: guestsWithoutTransport.length,
        severity: 'medium',
        action: {
          label: 'Voir les invités',
          url: `/admin/events/${eventId}/guests`,
        },
      })
    }

    // Alert 2: Sessions without participants
    const sessionsWithoutParticipants = sessions.filter(
      (s) => s.status === 'PUBLISHED' && s.participants.length === 0
    )
    if (sessionsWithoutParticipants.length > 0) {
      alerts.push({
        type: 'info',
        category: 'sessions',
        title: 'Sessions sans participants',
        message: `${sessionsWithoutParticipants.length} session(s) publiée(s) n'ont aucun participant inscrit`,
        count: sessionsWithoutParticipants.length,
        severity: 'low',
        action: {
          label: 'Voir les sessions',
          url: `/admin/events/${eventId}/sessions`,
        },
      })
    }

    // Alert 3: Sessions at full capacity
    const fullSessions = sessions.filter(
      (s) => s.capacity && s.participants.length >= s.capacity
    )
    if (fullSessions.length > 0) {
      alerts.push({
        type: 'success',
        category: 'sessions',
        title: 'Sessions complètes',
        message: `${fullSessions.length} session(s) ont atteint leur capacité maximale`,
        count: fullSessions.length,
        severity: 'low',
        action: {
          label: 'Voir les sessions',
          url: `/admin/events/${eventId}/sessions`,
        },
      })
    }

    // Alert 4: Upcoming sessions (within 24h)
    const now = new Date()
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    const upcomingSessions = sessions.filter(
      (s) => {
        const sessionStart = new Date(s.startTime)
        return sessionStart > now && sessionStart <= in24h
      }
    )
    if (upcomingSessions.length > 0) {
      alerts.push({
        type: 'info',
        category: 'sessions',
        title: 'Sessions à venir (24h)',
        message: `${upcomingSessions.length} session(s) commence(nt) dans les prochaines 24 heures`,
        count: upcomingSessions.length,
        severity: 'low',
        action: {
          label: 'Voir la timeline',
          url: `/admin/events/${eventId}/timeline`,
        },
      })
    }

    // Alert 5: Transports pending confirmation
    const pendingTransports = transports.filter(
      (t) => t.status === 'PENDING' || t.status === 'REQUESTED'
    )
    if (pendingTransports.length > 0) {
      alerts.push({
        type: 'warning',
        category: 'transport',
        title: 'Transports en attente',
        message: `${pendingTransports.length} transport(s) en attente de confirmation`,
        count: pendingTransports.length,
        severity: 'medium',
        action: {
          label: 'Voir les transports',
          url: `/admin/events/${eventId}/transport`,
        },
      })
    }

    // Alert 6: Session time conflicts for guests
    const conflictingGuests = []
    for (const guest of guests) {
      const guestSessions = guest.sessionParticipations
        .filter((sp) => sp.status === 'confirmed' || sp.status === 'registered')
        .map((sp) => sp.session)
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())

      // Check for overlapping sessions
      for (let i = 0; i < guestSessions.length - 1; i++) {
        const current = guestSessions[i]
        const next = guestSessions[i + 1]

        if (new Date(current.endTime) > new Date(next.startTime)) {
          conflictingGuests.push({
            guestId: guest.id,
            guestName: `${guest.firstName} ${guest.lastName}`,
            session1: current.title,
            session2: next.title,
          })
        }
      }
    }

    if (conflictingGuests.length > 0) {
      alerts.push({
        type: 'error',
        category: 'conflicts',
        title: 'Conflits horaires détectés',
        message: `${conflictingGuests.length} participant(s) inscrit(s) à des sessions qui se chevauchent`,
        count: conflictingGuests.length,
        severity: 'high',
        details: conflictingGuests.slice(0, 5), // First 5 conflicts
        action: {
          label: 'Voir la timeline',
          url: `/admin/events/${eventId}/timeline`,
        },
      })
    }

    // Alert 7: Guests without session registrations
    const guestsWithoutSessions = guests.filter(
      (g) => g.rsvp?.attending === true && g.sessionParticipations.length === 0
    )
    if (guestsWithoutSessions.length > 0) {
      alerts.push({
        type: 'info',
        category: 'sessions',
        title: 'Invités sans sessions',
        message: `${guestsWithoutSessions.length} invité(s) confirmé(s) ne sont inscrits à aucune session`,
        count: guestsWithoutSessions.length,
        severity: 'low',
        action: {
          label: 'Voir les sessions',
          url: `/admin/events/${eventId}/sessions`,
        },
      })
    }

    // Alert 8: Guests without accommodation (if accommodations module active)
    if (accommodations.length > 0) {
      // Get all guest IDs with room assignments
      const guestsWithAccommodation = new Set(
        accommodations.flatMap((acc: any) =>
          acc.rooms.flatMap((room: any) => room.assignments.map((a: any) => a.guestId))
        )
      )

      const guestsWithoutAccommodation = guests.filter(
        (g: any) => g.rsvp?.attending === true && !guestsWithAccommodation.has(g.id)
      )

      if (guestsWithoutAccommodation.length > 0) {
        alerts.push({
          type: 'warning',
          category: 'accommodation',
          title: 'Invités sans hébergement',
          message: `${guestsWithoutAccommodation.length} invité(s) confirmé(s) n'ont pas de chambre assignée`,
          count: guestsWithoutAccommodation.length,
          severity: 'medium',
          action: {
            label: 'Gérer les hébergements',
            url: `/admin/events/${eventId}/accommodation`,
          },
        })
      }
    }

    // Sort alerts by severity (high -> medium -> low)
    const severityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 }
    alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])

    // Session capacity stats
    const sessionCapacityStats = {
      totalCapacity: sessions.reduce((sum, s) => sum + (s.capacity || 0), 0),
      totalRegistrations: sessions.reduce((sum, s) => sum + s.participants.length, 0),
      averageOccupancy: sessions.length > 0
        ? Math.round(
            sessions
              .filter((s) => s.capacity)
              .reduce((sum, s) => sum + (s.participants.length / s.capacity!) * 100, 0) /
              sessions.filter((s) => s.capacity).length
          )
        : 0,
    }

    // Transport type breakdown
    const transportByType = transports.reduce((acc, t) => {
      acc[t.type] = (acc[t.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Session type breakdown
    const sessionByType = sessions.reduce((acc, s) => {
      acc[s.type] = (acc[s.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const recentActivity = {
      newGuests: guests.filter((g) => new Date(g.createdAt) >= sevenDaysAgo).length,
      newSessions: sessions.filter((s) => new Date(s.createdAt) >= sevenDaysAgo).length,
      newTransports: transports.filter((t) => new Date(t.createdAt) >= sevenDaysAgo).length,
    }

    return NextResponse.json({
      event: {
        id: event.id,
        name: event.name,
        startsAt: event.startsAt,
        endsAt: event.endsAt,
      },
      stats,
      alerts,
      sessionCapacityStats,
      transportByType,
      sessionByType,
      recentActivity,
    })
  } catch (error) {
    console.error('Error fetching dashboard:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du dashboard' },
      { status: 500 }
    )
  }
}
