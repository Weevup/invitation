import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { jsPDF } from 'jspdf'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { createLogger } from '@/lib/logger'

const exportLogger = createLogger({ module: 'export', type: 'participant' })

/**
 * GET /api/admin/events/[id]/export/participant/[guestId]
 * Export individual participant schedule to PDF
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; guestId: string }> }
) {
  try {
    const { id: eventId, guestId } = await params

    // Get event and guest with all related data
    const guest = await prisma.guest.findUnique({
      where: { id: guestId },
      include: {
        event: true,
        rsvp: true,
        transportBookings: {
          include: {
            manifest: true,
          },
          orderBy: {
            departureTime: 'asc',
          },
        },
        sessionParticipations: {
          where: {
            status: {
              in: ['registered', 'confirmed'],
            },
          },
          include: {
            session: true,
          },
          orderBy: {
            session: {
              startTime: 'asc',
            },
          },
        },
      },
    })

    if (!guest || guest.eventId !== eventId) {
      return NextResponse.json(
        { error: 'Invité non trouvé' },
        { status: 404 }
      )
    }

    // Create PDF
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })

    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 15
    const contentWidth = pageWidth - 2 * margin
    let yPosition = margin

    // Helper function to add new page if needed
    const checkPageBreak = (requiredSpace: number) => {
      if (yPosition + requiredSpace > pageHeight - margin) {
        doc.addPage()
        yPosition = margin
        return true
      }
      return false
    }

    // Helper function to draw text with word wrap
    const drawText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 10) => {
      doc.setFontSize(fontSize)
      const lines = doc.splitTextToSize(text, maxWidth)
      doc.text(lines, x, y)
      return lines.length * (fontSize * 0.35) // Return height used
    }

    // Header with participant name
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(20)
    doc.setTextColor(0, 70, 69) // #004645
    doc.text('Programme Personnel', pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 10

    // Participant info
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(16)
    doc.text(`${guest.firstName} ${guest.lastName}`, pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 6

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text(guest.email, pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 5

    if (guest.company) {
      doc.text(guest.company, pageWidth / 2, yPosition, { align: 'center' })
      yPosition += 8
    } else {
      yPosition += 5
    }

    // Event info
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.setTextColor(0, 70, 69)
    doc.text(guest.event.name, pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 5

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(100, 100, 100)
    const eventDateRange = guest.event.endsAt
      ? `${format(new Date(guest.event.startsAt), 'PP', { locale: fr })} - ${format(new Date(guest.event.endsAt), 'PP', { locale: fr })}`
      : format(new Date(guest.event.startsAt), 'PPP', { locale: fr })
    doc.text(eventDateRange, pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 10

    // Line separator
    doc.setDrawColor(0, 145, 151) // #009197
    doc.setLineWidth(0.5)
    doc.line(margin, yPosition, pageWidth - margin, yPosition)
    yPosition += 10

    // RSVP Status
    checkPageBreak(15)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.setTextColor(0, 70, 69)
    doc.text('Statut RSVP', margin, yPosition)
    yPosition += 6

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(60, 60, 60)
    const rsvpStatus = guest.rsvp?.attending === true
      ? '✓ Confirmé'
      : guest.rsvp?.attending === false
      ? '✗ Décliné'
      : '⚠ En attente de réponse'
    doc.text(rsvpStatus, margin + 5, yPosition)
    yPosition += 5

    if (guest.rsvp?.plusOnes && guest.rsvp.plusOnes > 0) {
      doc.text(`Accompagnants: ${guest.rsvp.plusOnes}`, margin + 5, yPosition)
      yPosition += 5
    }
    yPosition += 5

    // Transport section
    if (guest.transportBookings.length > 0) {
      checkPageBreak(20)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(12)
      doc.setTextColor(0, 70, 69)
      doc.text('Transports', margin, yPosition)
      yPosition += 8

      for (const transport of guest.transportBookings) {
        checkPageBreak(20)

        const departureData = transport.departure as any
        const arrivalData = transport.arrival as any

        // Transport type
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(10)
        doc.setTextColor(0, 70, 69)
        doc.text(`${transport.type} - ${transport.status}`, margin + 5, yPosition)
        yPosition += 5

        // Details
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(9)
        doc.setTextColor(60, 60, 60)

        if (transport.departureTime) {
          const depTime = format(new Date(transport.departureTime), 'PPp', { locale: fr })
          const depLocation = departureData?.city || departureData?.airport || departureData?.station || ''
          doc.text(`Départ: ${depTime} - ${depLocation}`, margin + 10, yPosition)
          yPosition += 4
        }

        if (transport.arrivalTime) {
          const arrTime = format(new Date(transport.arrivalTime), 'PPp', { locale: fr })
          const arrLocation = arrivalData?.city || arrivalData?.airport || arrivalData?.station || ''
          doc.text(`Arrivée: ${arrTime} - ${arrLocation}`, margin + 10, yPosition)
          yPosition += 4
        }

        if (transport.carrier) {
          doc.text(`Compagnie: ${transport.carrier}`, margin + 10, yPosition)
          yPosition += 4
        }

        if (transport.bookingRef) {
          doc.text(`Référence: ${transport.bookingRef}`, margin + 10, yPosition)
          yPosition += 4
        }

        if (transport.seatNumber) {
          doc.text(`Siège: ${transport.seatNumber}`, margin + 10, yPosition)
          yPosition += 4
        }

        if (transport.manifest) {
          doc.text(`Manifeste: ${transport.manifest.name}`, margin + 10, yPosition)
          yPosition += 4
        }

        yPosition += 3

        // Separator
        doc.setDrawColor(220, 220, 220)
        doc.setLineWidth(0.1)
        doc.line(margin + 5, yPosition, pageWidth - margin, yPosition)
        yPosition += 5
      }
    }

    // Sessions section
    if (guest.sessionParticipations.length > 0) {
      checkPageBreak(20)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(12)
      doc.setTextColor(0, 70, 69)
      doc.text('Programme des Sessions', margin, yPosition)
      yPosition += 8

      // Group sessions by date
      const sessionsByDate = new Map<string, any[]>()
      for (const participation of guest.sessionParticipations) {
        const dateKey = format(new Date(participation.session.startTime), 'yyyy-MM-dd')
        if (!sessionsByDate.has(dateKey)) {
          sessionsByDate.set(dateKey, [])
        }
        sessionsByDate.get(dateKey)!.push(participation)
      }

      // Render sessions by date
      for (const [dateKey, participations] of sessionsByDate) {
        checkPageBreak(15)

        // Date header
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(11)
        doc.setTextColor(0, 70, 69)
        const dateLabel = format(new Date(dateKey), 'EEEE d MMMM yyyy', { locale: fr })
        doc.text(dateLabel, margin + 5, yPosition)
        yPosition += 7

        for (const participation of participations) {
          const session = participation.session
          checkPageBreak(18)

          // Time
          const timeStr = format(new Date(session.startTime), 'HH:mm')
          const endTimeStr = format(new Date(session.endTime), 'HH:mm')

          doc.setFillColor(0, 145, 151) // #009197
          doc.roundedRect(margin + 10, yPosition - 4, 18, 6, 1, 1, 'F')
          doc.setFont('helvetica', 'bold')
          doc.setFontSize(8)
          doc.setTextColor(255, 255, 255)
          doc.text(timeStr, margin + 19, yPosition, { align: 'center' })

          // Title
          doc.setFont('helvetica', 'bold')
          doc.setFontSize(10)
          doc.setTextColor(0, 70, 69)
          const titleHeight = drawText(session.title, margin + 32, yPosition, contentWidth - 27, 10)
          yPosition += Math.max(5, titleHeight)

          // Details
          doc.setFont('helvetica', 'normal')
          doc.setFontSize(8)
          doc.setTextColor(100, 100, 100)
          let details = `${session.type} • ${timeStr} - ${endTimeStr}`
          if (session.venue) {
            details += ` • ${session.venue}`
            if (session.room) {
              details += ` - ${session.room}`
            }
          }
          const detailsHeight = drawText(details, margin + 32, yPosition, contentWidth - 27, 8)
          yPosition += Math.max(4, detailsHeight)

          if (session.description) {
            doc.setFontSize(8)
            doc.setTextColor(80, 80, 80)
            const descHeight = drawText(session.description, margin + 32, yPosition, contentWidth - 27, 8)
            yPosition += Math.max(4, descHeight)
          }

          yPosition += 4

          // Light separator
          doc.setDrawColor(220, 220, 220)
          doc.setLineWidth(0.1)
          doc.line(margin + 10, yPosition, pageWidth - margin, yPosition)
          yPosition += 5
        }

        yPosition += 2
      }
    }

    // Additional info
    if (guest.rsvp?.mealChoice || guest.rsvp?.allergies || guest.rsvp?.accessibilityNotes) {
      checkPageBreak(20)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(12)
      doc.setTextColor(0, 70, 69)
      doc.text('Informations Complémentaires', margin, yPosition)
      yPosition += 8

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.setTextColor(60, 60, 60)

      if (guest.rsvp.mealChoice) {
        doc.text(`Choix de repas: ${guest.rsvp.mealChoice}`, margin + 5, yPosition)
        yPosition += 5
      }

      if (guest.rsvp.allergies) {
        const allergyHeight = drawText(`Allergies: ${guest.rsvp.allergies}`, margin + 5, yPosition, contentWidth - 10, 9)
        yPosition += Math.max(5, allergyHeight + 2)
      }

      if (guest.rsvp.accessibilityNotes) {
        const accessHeight = drawText(`Accessibilité: ${guest.rsvp.accessibilityNotes}`, margin + 5, yPosition, contentWidth - 10, 9)
        yPosition += Math.max(5, accessHeight + 2)
      }
    }

    // Footer
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    const footer = `Généré le ${format(new Date(), 'PPP à p', { locale: fr })}`
    doc.text(footer, pageWidth / 2, pageHeight - 10, { align: 'center' })

    // Generate PDF buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'))

    // Return as download
    const fileName = `programme-${guest.firstName}-${guest.lastName}-${format(new Date(), 'yyyy-MM-dd')}.pdf`

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    })
  } catch (error) {
    exportLogger.error({ error, stack: error instanceof Error ? error.stack : undefined }, 'Error exporting participant schedule')
    return NextResponse.json(
      { error: 'Erreur lors de l\'export du programme participant' },
      { status: 500 }
    )
  }
}
