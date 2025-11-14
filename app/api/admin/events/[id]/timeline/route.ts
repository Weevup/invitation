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

    // Get email logs (communications sent)
    const emailLogs = await prisma.emailLog.findMany({
      where: {
        eventId,
        status: 'SENT', // Only successfully sent emails
        ...(guestId ? { guestId } : {}),
        ...(startDate && endDate
          ? {
              sentAt: {
                gte: new Date(startDate),
                lte: new Date(endDate),
              },
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
      },
      orderBy: {
        sentAt: 'asc',
      },
    })

    // Get RSVP responses
    const rsvps = await prisma.rSVP.findMany({
      where: {
        eventId,
        ...(guestId ? { guestId } : {}),
        ...(startDate && endDate
          ? {
              createdAt: {
                gte: new Date(startDate),
                lte: new Date(endDate),
              },
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
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    // Get check-ins (day of event)
    const checkins = await prisma.checkin.findMany({
      where: {
        eventId,
        ...(guestId ? { guestId } : {}),
        ...(startDate && endDate
          ? {
              checkedInAt: {
                gte: new Date(startDate),
                lte: new Date(endDate),
              },
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
      },
      orderBy: {
        checkedInAt: 'asc',
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

    // Add email communications to timeline
    for (const emailLog of emailLogs) {
      if (emailLog.sentAt) {
        const emailTypeLabels: Record<string, string> = {
          SAVE_THE_DATE: 'Save the Date',
          INVITE: 'Invitation',
          INVITATION: 'Invitation',
          REMINDER: 'Rappel',
          CONFIRMATION: 'Confirmation',
          INFO: 'Information',
          CUSTOM: 'Email personnalisé',
        }

        unifiedTimeline.push({
          id: `email-${emailLog.id}`,
          type: 'EMAIL_SENT',
          emailType: emailLog.type,
          title: `📧 ${emailTypeLabels[emailLog.type] || emailLog.type} envoyé - ${emailLog.guest.firstName} ${emailLog.guest.lastName}`,
          description: emailLog.subject,
          startTime: emailLog.sentAt,
          endTime: emailLog.sentAt,
          guest: emailLog.guest,
          openedAt: emailLog.openedAt,
          clickedAt: emailLog.clickedAt,
          color: '#3B82F6',
          icon: 'mail',
          entity: 'email',
          entityId: emailLog.id,
        })
      }
    }

    // Add RSVP responses to timeline
    for (const rsvp of rsvps) {
      const status = rsvp.attending === true ? 'accepté' : rsvp.attending === false ? 'décliné' : 'en attente'
      const icon = rsvp.attending === true ? '✅' : rsvp.attending === false ? '❌' : '❓'

      unifiedTimeline.push({
        id: `rsvp-${rsvp.id}`,
        type: 'RSVP_RECEIVED',
        title: `📩 RSVP ${status} - ${rsvp.guest.firstName} ${rsvp.guest.lastName}`,
        description: rsvp.attending
          ? `Présence confirmée${rsvp.plusOnes > 0 ? ` (+${rsvp.plusOnes})` : ''}`
          : 'Absence confirmée',
        startTime: rsvp.createdAt,
        endTime: rsvp.createdAt,
        guest: rsvp.guest,
        attending: rsvp.attending,
        plusOnes: rsvp.plusOnes,
        color: rsvp.attending === true ? '#10B981' : rsvp.attending === false ? '#EF4444' : '#6B7280',
        icon: 'message-square',
        entity: 'rsvp',
        entityId: rsvp.id,
      })
    }

    // Add check-ins to timeline
    for (const checkin of checkins) {
      unifiedTimeline.push({
        id: `checkin-${checkin.id}`,
        type: 'CHECKIN',
        title: `✅ Check-in - ${checkin.guest.firstName} ${checkin.guest.lastName}`,
        description: checkin.desk ? `Kiosque ${checkin.desk}` : 'Check-in confirmé',
        startTime: checkin.checkedInAt,
        endTime: checkin.checkedInAt,
        guest: checkin.guest,
        desk: checkin.desk,
        color: '#10B981',
        icon: 'user-check',
        entity: 'checkin',
        entityId: checkin.id,
      })
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
      emailsSent: emailLogs.length,
      rsvpReceived: rsvps.length,
      checkins: checkins.length,
      totalParticipants: await prisma.guest.count({ where: { eventId } }),
    }

    // Detect conflicts and generate alerts
    const alerts = []

    // 1. Sessions over capacity
    for (const session of sessions) {
      const participantCount = session._count.participants
      if (session.capacity && participantCount > session.capacity) {
        alerts.push({
          id: `overcapacity-${session.id}`,
          type: 'OVERCAPACITY',
          severity: 'error',
          title: 'Capacité dépassée',
          message: `${session.title} : ${participantCount} inscrits pour ${session.capacity} places`,
          sessionId: session.id,
          relatedTime: session.startTime,
        })
      } else if (session.capacity && participantCount / session.capacity > 0.9) {
        alerts.push({
          id: `nearcapacity-${session.id}`,
          type: 'NEAR_CAPACITY',
          severity: 'warning',
          title: 'Capacité bientôt atteinte',
          message: `${session.title} : ${participantCount} inscrits sur ${session.capacity} places (${Math.round((participantCount / session.capacity) * 100)}%)`,
          sessionId: session.id,
          relatedTime: session.startTime,
        })
      }
    }

    // 2. Guests with RSVP but no accommodation
    const guestsWithRSVP = await prisma.guest.findMany({
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
      },
    })

    const guestsWithAccommodation = new Set(
      roomAssignments.map((assignment) => assignment.guestId)
    )

    const guestsWithoutAccommodation = guestsWithRSVP.filter(
      (guest) => !guestsWithAccommodation.has(guest.id)
    )

    if (guestsWithoutAccommodation.length > 0) {
      alerts.push({
        id: 'missing-accommodation',
        type: 'MISSING_ACCOMMODATION',
        severity: 'warning',
        title: 'Invités sans hébergement',
        message: `${guestsWithoutAccommodation.length} invité(s) confirmé(s) sans chambre assignée`,
        count: guestsWithoutAccommodation.length,
        guests: guestsWithoutAccommodation.slice(0, 5), // First 5 for preview
      })
    }

    // 3. Guests with RSVP but no transport
    const guestsWithTransport = new Set(transports.map((t) => t.guestId))

    const guestsWithoutTransport = guestsWithRSVP.filter(
      (guest) => !guestsWithTransport.has(guest.id)
    )

    if (guestsWithoutTransport.length > 0) {
      alerts.push({
        id: 'missing-transport',
        type: 'MISSING_TRANSPORT',
        severity: 'info',
        title: 'Invités sans transport',
        message: `${guestsWithoutTransport.length} invité(s) confirmé(s) sans réservation de transport`,
        count: guestsWithoutTransport.length,
        guests: guestsWithoutTransport.slice(0, 5),
      })
    }

    // 4. Check dietary restrictions alerts
    const guestsWithAllergies = await prisma.guest.count({
      where: {
        eventId,
        rsvp: {
          attending: true,
          allergies: {
            not: null,
          },
        },
      },
    })

    if (guestsWithAllergies > 0) {
      alerts.push({
        id: 'dietary-restrictions',
        type: 'DIETARY_RESTRICTIONS',
        severity: 'info',
        title: 'Restrictions alimentaires',
        message: `${guestsWithAllergies} invité(s) avec des allergies ou restrictions`,
        count: guestsWithAllergies,
      })
    }

    // Sort alerts by severity (error > warning > info)
    const severityOrder: Record<string, number> = { error: 0, warning: 1, info: 2 }
    alerts.sort((a, b) => (severityOrder[a.severity] || 999) - (severityOrder[b.severity] || 999))

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
      alerts,
    })
  } catch (error) {
    console.error('Error fetching timeline:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la timeline' },
      { status: 500 }
    )
  }
}
