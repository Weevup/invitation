import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/admin/events/[id]/timeline
 * Get complete timeline for an event (sessions + transports + accommodations)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const type = searchParams.get('type') // Filter by type
    const guestId = searchParams.get('guestId') // Filter for specific guest

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

    // Build where clause
    const where: any = { eventId }

    if (startDate && endDate) {
      where.startTime = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      }
    }

    if (type) {
      where.type = type
    }

    if (guestId) {
      where.OR = [
        { isGlobalEvent: true },
        { affectedGuestIds: { has: guestId } },
      ]
    }

    // Get all timeline events (auto-generated + custom)
    const timelineEvents = await prisma.timelineEvent.findMany({
      where,
      orderBy: [
        { startTime: 'asc' },
        { order: 'asc' },
      ],
    })

    // Get all sessions with participants count
    const sessions = await prisma.session.findMany({
      where: {
        eventId,
        ...(startDate && endDate
          ? {
              startTime: {
                gte: new Date(startDate),
                lte: new Date(endDate),
              },
            }
          : {}),
      },
      include: {
        _count: {
          select: {
            participants: true,
          },
        },
        participants: guestId
          ? {
              where: { guestId },
              select: {
                id: true,
                status: true,
              },
            }
          : false,
      },
      orderBy: {
        startTime: 'asc',
      },
    })

    // Get all transport bookings
    const transports = await prisma.transportBooking.findMany({
      where: {
        eventId,
        ...(guestId ? { guestId } : {}),
        ...(startDate && endDate
          ? {
              OR: [
                {
                  departureTime: {
                    gte: new Date(startDate),
                    lte: new Date(endDate),
                  },
                },
                {
                  arrivalTime: {
                    gte: new Date(startDate),
                    lte: new Date(endDate),
                  },
                },
              ],
            }
          : {}),
      },
      include: {
        guest: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        manifest: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
      orderBy: {
        departureTime: 'asc',
      },
    })

    // Get all room assignments (for accommodation timeline)
    const roomAssignments = await prisma.roomAssignment.findMany({
      where: {
        room: {
          accommodation: {
            eventId,
          },
        },
        ...(guestId ? { guestId } : {}),
        ...(startDate && endDate
          ? {
              OR: [
                {
                  checkInDate: {
                    gte: new Date(startDate),
                    lte: new Date(endDate),
                  },
                },
                {
                  checkOutDate: {
                    gte: new Date(startDate),
                    lte: new Date(endDate),
                  },
                },
              ],
            }
          : {}),
      },
      include: {
        guest: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        room: {
          select: {
            id: true,
            roomNumber: true,
            type: true,
            accommodation: {
              select: {
                id: true,
                name: true,
                address: true,
              },
            },
          },
        },
      },
      orderBy: {
        checkInDate: 'asc',
      },
    })

    // Build unified timeline
    const unifiedTimeline = []

    // Add sessions to timeline
    for (const session of sessions) {
      const isParticipating = guestId
        ? (session.participants as any[]).length > 0
        : undefined

      unifiedTimeline.push({
        id: session.id,
        type: 'SESSION',
        sessionType: session.type,
        status: session.status,
        title: session.title,
        description: session.description,
        startTime: session.startTime,
        endTime: session.endTime,
        duration: session.duration,
        location: session.venue
          ? `${session.venue}${session.room ? ` - ${session.room}` : ''}`
          : null,
        venue: session.venue,
        room: session.room,
        capacity: session.capacity,
        participantCount: session._count.participants,
        availableSpots: session.capacity
          ? session.capacity - session._count.participants
          : null,
        isPublic: session.isPublic,
        isHighlighted: session.isHighlighted,
        color: session.color,
        icon: session.icon,
        isParticipating,
        entity: 'session',
        entityId: session.id,
      })
    }

    // Add transports to timeline
    for (const transport of transports) {
      // Add departure event
      if (transport.departureTime) {
        const departureData = transport.departure as any
        unifiedTimeline.push({
          id: `transport-departure-${transport.id}`,
          type: 'TRANSPORT_DEPARTURE',
          transportType: transport.type,
          status: transport.status,
          title: `Départ ${transport.type.toLowerCase()} - ${transport.guest.firstName} ${transport.guest.lastName}`,
          description: `${departureData?.city || 'Départ'} → ${(transport.arrival as any)?.city || 'Arrivée'}`,
          startTime: transport.departureTime,
          endTime: transport.arrivalTime,
          location: departureData?.city || departureData?.airport || departureData?.station,
          carrier: transport.carrier,
          bookingRef: transport.bookingRef,
          guest: transport.guest,
          manifest: transport.manifest,
          color: '#FF6B6B',
          icon: 'plane-departure',
          entity: 'transport',
          entityId: transport.id,
        })
      }

      // Add arrival event
      if (transport.arrivalTime) {
        const arrivalData = transport.arrival as any
        unifiedTimeline.push({
          id: `transport-arrival-${transport.id}`,
          type: 'TRANSPORT_ARRIVAL',
          transportType: transport.type,
          status: transport.status,
          title: `Arrivée ${transport.type.toLowerCase()} - ${transport.guest.firstName} ${transport.guest.lastName}`,
          description: `${(transport.departure as any)?.city || 'Départ'} → ${arrivalData?.city || 'Arrivée'}`,
          startTime: transport.arrivalTime,
          endTime: transport.arrivalTime,
          location: arrivalData?.city || arrivalData?.airport || arrivalData?.station,
          carrier: transport.carrier,
          bookingRef: transport.bookingRef,
          guest: transport.guest,
          manifest: transport.manifest,
          color: '#4ECDC4',
          icon: 'plane-landing',
          entity: 'transport',
          entityId: transport.id,
        })
      }
    }

    // Add accommodation check-ins/check-outs to timeline
    for (const assignment of roomAssignments) {
      // Add check-in event
      if (assignment.checkInDate) {
        unifiedTimeline.push({
          id: `accommodation-checkin-${assignment.id}`,
          type: 'HOTEL_CHECKIN',
          title: `Check-in ${assignment.room.accommodation.name} - ${assignment.guest.firstName} ${assignment.guest.lastName}`,
          description: `Chambre ${assignment.room.roomNumber || assignment.room.type}`,
          startTime: assignment.checkInDate,
          endTime: assignment.checkInDate,
          location: assignment.room.accommodation.name,
          guest: assignment.guest,
          roomType: assignment.room.type,
          roomNumber: assignment.room.roomNumber,
          color: '#9B59B6',
          icon: 'hotel',
          entity: 'accommodation',
          entityId: assignment.id,
        })
      }

      // Add check-out event
      if (assignment.checkOutDate) {
        unifiedTimeline.push({
          id: `accommodation-checkout-${assignment.id}`,
          type: 'HOTEL_CHECKOUT',
          title: `Check-out ${assignment.room.accommodation.name} - ${assignment.guest.firstName} ${assignment.guest.lastName}`,
          description: `Chambre ${assignment.room.roomNumber || assignment.room.type}`,
          startTime: assignment.checkOutDate,
          endTime: assignment.checkOutDate,
          location: assignment.room.accommodation.name,
          guest: assignment.guest,
          roomType: assignment.room.type,
          roomNumber: assignment.room.roomNumber,
          color: '#9B59B6',
          icon: 'hotel',
          entity: 'accommodation',
          entityId: assignment.id,
        })
      }
    }

    // Add custom timeline events
    for (const event of timelineEvents) {
      // Skip if already added from session
      if (event.sessionId) continue

      unifiedTimeline.push({
        id: event.id,
        type: event.type,
        title: event.title,
        description: event.description,
        startTime: event.startTime,
        endTime: event.endTime,
        allDay: event.allDay,
        location: event.location,
        color: event.color,
        icon: event.icon,
        priority: event.priority,
        isPublic: event.isPublic,
        isGlobalEvent: event.isGlobalEvent,
        entity: 'timeline_event',
        entityId: event.id,
      })
    }

    // Sort by startTime
    unifiedTimeline.sort((a, b) => {
      return new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    })

    // Group by date
    const groupedByDate: Record<string, any[]> = {}
    for (const item of unifiedTimeline) {
      const date = new Date(item.startTime).toISOString().split('T')[0]
      if (!groupedByDate[date]) {
        groupedByDate[date] = []
      }
      groupedByDate[date].push(item)
    }

    // Calculate stats
    const stats = {
      totalEvents: unifiedTimeline.length,
      sessions: sessions.length,
      transports: transports.length,
      accommodations: roomAssignments.length,
      totalParticipants: await prisma.guest.count({ where: { eventId } }),
    }

    return NextResponse.json({
      event: {
        id: event.id,
        name: event.name,
        startsAt: event.startsAt,
        endsAt: event.endsAt,
      },
      timeline: unifiedTimeline,
      timelineByDate: groupedByDate,
      stats,
    })
  } catch (error) {
    console.error('Error fetching timeline:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la timeline' },
      { status: 500 }
    )
  }
}
