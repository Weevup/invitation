import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import * as XLSX from 'xlsx'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

/**
 * GET /api/admin/events/[id]/export/manifeste
 * Export comprehensive event manifeste to Excel
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params

    // Get event with all related data
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        guests: {
          include: {
            rsvp: true,
            transportBookings: {
              include: {
                manifest: true,
              },
            },
            sessionParticipations: {
              include: {
                session: true,
              },
            },
            checkins: true,
          },
        },
        sessions: {
          include: {
            participants: {
              include: {
                guest: true,
              },
            },
          },
          orderBy: {
            startTime: 'asc',
          },
        },
        transportBookings: {
          include: {
            guest: true,
            manifest: true,
          },
          orderBy: {
            departureTime: 'asc',
          },
        },
      },
    })

    if (!event) {
      return NextResponse.json(
        { error: 'Événement non trouvé' },
        { status: 404 }
      )
    }

    // Create workbook
    const workbook = XLSX.utils.book_new()

    // Sheet 1: Vue d'ensemble de l'événement
    const overviewData = [
      ['Manifeste de l\'événement'],
      [],
      ['Nom de l\'événement', event.name],
      ['Date de début', event.startsAt ? format(new Date(event.startsAt), 'PPPp', { locale: fr }) : ''],
      ['Date de fin', event.endsAt ? format(new Date(event.endsAt), 'PPPp', { locale: fr }) : ''],
      ['Lieu', event.venueName || ''],
      ['Ville', event.city || ''],
      ['Pays', event.country || ''],
      [],
      ['Statistiques'],
      ['Total invités', event.guests.length],
      ['Invités confirmés', event.guests.filter(g => g.rsvp?.attending === true).length],
      ['Total sessions', event.sessions.length],
      ['Total transports', event.transportBookings.length],
    ]
    const overviewSheet = XLSX.utils.aoa_to_sheet(overviewData)
    XLSX.utils.book_append_sheet(workbook, overviewSheet, 'Vue d\'ensemble')

    // Sheet 2: Liste des invités avec détails complets
    const guestsData = [
      [
        'Prénom',
        'Nom',
        'Email',
        'Entreprise',
        'Statut',
        'RSVP',
        'Plus Ones',
        'Check-in',
        'Sessions inscrites',
        'Transports réservés',
        'Tags',
      ],
    ]

    for (const guest of event.guests) {
      const sessionsCount = guest.sessionParticipations.filter(
        sp => sp.status === 'confirmed' || sp.status === 'registered'
      ).length
      const transportsCount = guest.transportBookings.length
      const checkedIn = guest.checkins.length > 0 ? 'Oui' : 'Non'

      guestsData.push([
        guest.firstName,
        guest.lastName,
        guest.email,
        guest.company || '',
        guest.status,
        guest.rsvp?.attending === true ? 'Confirmé' : guest.rsvp?.attending === false ? 'Décliné' : 'En attente',
        guest.rsvp?.plusOnes?.toString() || '0',
        checkedIn,
        sessionsCount.toString(),
        transportsCount.toString(),
        guest.tags.join(', '),
      ])
    }
    const guestsSheet = XLSX.utils.aoa_to_sheet(guestsData)
    XLSX.utils.book_append_sheet(workbook, guestsSheet, 'Invités')

    // Sheet 3: Sessions avec participants
    const sessionsData = [
      [
        'Titre',
        'Type',
        'Statut',
        'Date',
        'Heure début',
        'Heure fin',
        'Durée (min)',
        'Lieu',
        'Salle',
        'Capacité',
        'Inscrits',
        'Places restantes',
        'Participants',
      ],
    ]

    for (const session of event.sessions) {
      const participants = session.participants
        .filter(p => p.status === 'confirmed' || p.status === 'registered')
        .map(p => `${p.guest.firstName} ${p.guest.lastName}`)
        .join('; ')

      const availableSpots = session.capacity ? session.capacity - session.participants.length : null

      sessionsData.push([
        session.title,
        session.type,
        session.status,
        format(new Date(session.startTime), 'PP', { locale: fr }),
        format(new Date(session.startTime), 'p', { locale: fr }),
        format(new Date(session.endTime), 'p', { locale: fr }),
        session.duration.toString(),
        session.venue || '',
        session.room || '',
        session.capacity?.toString() || 'Illimitée',
        session.participants.length.toString(),
        availableSpots !== null ? availableSpots.toString() : 'N/A',
        participants,
      ])
    }
    const sessionsSheet = XLSX.utils.aoa_to_sheet(sessionsData)
    XLSX.utils.book_append_sheet(workbook, sessionsSheet, 'Sessions')

    // Sheet 4: Transports
    const transportsData = [
      [
        'Invité',
        'Email',
        'Type',
        'Statut',
        'Départ - Lieu',
        'Départ - Date/Heure',
        'Arrivée - Lieu',
        'Arrivée - Date/Heure',
        'Compagnie',
        'Référence',
        'Siège',
        'Manifeste',
        'Coût',
      ],
    ]

    for (const transport of event.transportBookings) {
      const departureData = transport.departure as any
      const arrivalData = transport.arrival as any

      transportsData.push([
        `${transport.guest.firstName} ${transport.guest.lastName}`,
        transport.guest.email,
        transport.type,
        transport.status,
        departureData?.city || departureData?.airport || departureData?.station || '',
        transport.departureTime ? format(new Date(transport.departureTime), 'PPp', { locale: fr }) : '',
        arrivalData?.city || arrivalData?.airport || arrivalData?.station || '',
        transport.arrivalTime ? format(new Date(transport.arrivalTime), 'PPp', { locale: fr }) : '',
        transport.carrier || '',
        transport.bookingRef || '',
        transport.seatNumber || '',
        transport.manifest?.name || '',
        transport.actualCost ? `${transport.actualCost} ${transport.currency}` : '',
      ])
    }
    const transportsSheet = XLSX.utils.aoa_to_sheet(transportsData)
    XLSX.utils.book_append_sheet(workbook, transportsSheet, 'Transports')

    // Sheet 5: Matrice invités x sessions
    const matrixHeaders = ['Invité', 'Email']
    const sessionTitles = event.sessions.map(s => s.title)
    matrixHeaders.push(...sessionTitles)

    const matrixData = [matrixHeaders]

    for (const guest of event.guests.filter(g => g.rsvp?.attending === true)) {
      const row = [
        `${guest.firstName} ${guest.lastName}`,
        guest.email,
      ]

      for (const session of event.sessions) {
        const participation = guest.sessionParticipations.find(
          sp => sp.sessionId === session.id
        )
        row.push(
          participation
            ? participation.status === 'confirmed' || participation.status === 'registered'
              ? '✓'
              : participation.status
            : ''
        )
      }

      matrixData.push(row)
    }
    const matrixSheet = XLSX.utils.aoa_to_sheet(matrixData)
    XLSX.utils.book_append_sheet(workbook, matrixSheet, 'Matrice Sessions')

    // Sheet 6: Timeline complète par jour
    const timelineData = [['Date', 'Heure', 'Type', 'Titre', 'Lieu', 'Participants/Invités']]

    // Combine all timeline items
    const timelineItems: any[] = []

    // Add sessions
    for (const session of event.sessions) {
      timelineItems.push({
        time: new Date(session.startTime),
        type: 'Session',
        title: session.title,
        location: session.venue ? `${session.venue}${session.room ? ` - ${session.room}` : ''}` : '',
        details: `${session.participants.length} participant(s)`,
      })
    }

    // Add transports
    for (const transport of event.transportBookings) {
      if (transport.departureTime) {
        timelineItems.push({
          time: new Date(transport.departureTime),
          type: `Transport - Départ`,
          title: `${transport.guest.firstName} ${transport.guest.lastName}`,
          location: (transport.departure as any)?.city || '',
          details: transport.type,
        })
      }
      if (transport.arrivalTime) {
        timelineItems.push({
          time: new Date(transport.arrivalTime),
          type: `Transport - Arrivée`,
          title: `${transport.guest.firstName} ${transport.guest.lastName}`,
          location: (transport.arrival as any)?.city || '',
          details: transport.type,
        })
      }
    }

    // Sort by time
    timelineItems.sort((a, b) => a.time.getTime() - b.time.getTime())

    for (const item of timelineItems) {
      timelineData.push([
        format(item.time, 'PP', { locale: fr }),
        format(item.time, 'p', { locale: fr }),
        item.type,
        item.title,
        item.location,
        item.details,
      ])
    }
    const timelineSheet = XLSX.utils.aoa_to_sheet(timelineData)
    XLSX.utils.book_append_sheet(workbook, timelineSheet, 'Timeline')

    // Generate Excel file
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

    // Return as download
    const fileName = `manifeste-${event.slug}-${format(new Date(), 'yyyy-MM-dd')}.xlsx`

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    })
  } catch (error) {
    console.error('Error exporting manifeste:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'export du manifeste' },
      { status: 500 }
    )
  }
}
