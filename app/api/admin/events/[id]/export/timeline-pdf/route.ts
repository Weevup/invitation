import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createLogger } from '@/lib/logger'

const exportLogger = createLogger({ module: 'export', type: 'timeline-pdf' })
import { jsPDF } from 'jspdf'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

/**
 * GET /api/admin/events/[id]/export/timeline-pdf
 * Export visual timeline to PDF
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params

    // Get event with sessions and transports
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        sessions: {
          include: {
            _count: {
              select: {
                participants: true,
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

    // Title
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(20)
    doc.setTextColor(0, 70, 69) // #004645
    doc.text('Timeline de l\'événement', pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 10

    // Event info
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(16)
    doc.setTextColor(0, 70, 69)
    doc.text(event.name, pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 8

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    const eventDate = format(new Date(event.startsAt), 'PPP', { locale: fr })
    doc.text(eventDate, pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 5

    if (event.venueName) {
      doc.text(`${event.venueName}, ${event.city}`, pageWidth / 2, yPosition, { align: 'center' })
      yPosition += 8
    } else {
      yPosition += 5
    }

    // Line separator
    doc.setDrawColor(0, 145, 151) // #009197
    doc.setLineWidth(0.5)
    doc.line(margin, yPosition, pageWidth - margin, yPosition)
    yPosition += 10

    // Build unified timeline
    const timelineItems: any[] = []

    // Add sessions
    for (const session of event.sessions) {
      timelineItems.push({
        time: new Date(session.startTime),
        endTime: new Date(session.endTime),
        type: 'session',
        title: session.title,
        subtitle: session.type,
        location: session.venue ? `${session.venue}${session.room ? ` - ${session.room}` : ''}` : null,
        details: `${session._count.participants} participant(s)${session.capacity ? ` / ${session.capacity}` : ''}`,
        color: session.color || '#004645',
      })
    }

    // Add transport arrivals
    const arrivals = event.transportBookings.filter(t => t.arrivalTime)
    for (const transport of arrivals) {
      timelineItems.push({
        time: new Date(transport.arrivalTime!),
        endTime: null,
        type: 'arrival',
        title: `Arrivée - ${transport.guest.firstName} ${transport.guest.lastName}`,
        subtitle: transport.type,
        location: (transport.arrival as any)?.city || (transport.arrival as any)?.airport || null,
        details: transport.carrier || null,
        color: '#4ECDC4',
      })
    }

    // Add transport departures
    const departures = event.transportBookings.filter(t => t.departureTime)
    for (const transport of departures) {
      timelineItems.push({
        time: new Date(transport.departureTime!),
        endTime: null,
        type: 'departure',
        title: `Départ - ${transport.guest.firstName} ${transport.guest.lastName}`,
        subtitle: transport.type,
        location: (transport.departure as any)?.city || (transport.departure as any)?.airport || null,
        details: transport.carrier || null,
        color: '#FF6B6B',
      })
    }

    // Sort by time
    timelineItems.sort((a, b) => a.time.getTime() - b.time.getTime())

    // Group by date
    const itemsByDate = new Map<string, any[]>()
    for (const item of timelineItems) {
      const dateKey = format(item.time, 'yyyy-MM-dd')
      if (!itemsByDate.has(dateKey)) {
        itemsByDate.set(dateKey, [])
      }
      itemsByDate.get(dateKey)!.push(item)
    }

    // Render timeline
    for (const [dateKey, items] of itemsByDate) {
      checkPageBreak(20)

      // Date header
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(14)
      doc.setTextColor(0, 70, 69)
      const dateLabel = format(new Date(dateKey), 'EEEE d MMMM yyyy', { locale: fr })
      doc.text(dateLabel, margin, yPosition)
      yPosition += 8

      // Timeline items for this date
      for (const item of items) {
        checkPageBreak(25)

        // Time badge
        const timeStr = format(item.time, 'HH:mm')
        const endTimeStr = item.endTime ? ` - ${format(item.endTime, 'HH:mm')}` : ''

        doc.setFillColor(0, 145, 151) // #009197
        doc.roundedRect(margin, yPosition - 4, 20, 6, 1, 1, 'F')
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(8)
        doc.setTextColor(255, 255, 255)
        doc.text(timeStr, margin + 10, yPosition, { align: 'center' })

        // Title
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(11)
        doc.setTextColor(0, 70, 69)
        const titleHeight = drawText(item.title, margin + 25, yPosition, contentWidth - 30, 11)
        yPosition += Math.max(6, titleHeight)

        // Subtitle and details
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(9)
        doc.setTextColor(100, 100, 100)
        let detailsText = item.subtitle
        if (item.location) {
          detailsText += ` • ${item.location}`
        }
        if (item.details) {
          detailsText += ` • ${item.details}`
        }
        if (endTimeStr) {
          detailsText += endTimeStr
        }
        const detailsHeight = drawText(detailsText, margin + 25, yPosition, contentWidth - 30, 9)
        yPosition += Math.max(4, detailsHeight) + 5

        // Light separator
        doc.setDrawColor(220, 220, 220)
        doc.setLineWidth(0.1)
        doc.line(margin + 25, yPosition, pageWidth - margin, yPosition)
        yPosition += 5
      }

      yPosition += 3
    }

    // Footer on last page
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    const footer = `Généré le ${format(new Date(), 'PPP à p', { locale: fr })}`
    doc.text(footer, pageWidth / 2, pageHeight - 10, { align: 'center' })

    // Generate PDF buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'))

    // Return as download
    const fileName = `timeline-${event.slug}-${format(new Date(), 'yyyy-MM-dd')}.pdf`

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    })
  } catch (error) {
    exportLogger.error({ error, stack: error instanceof Error ? error.stack : undefined }, 'Error exporting timeline PDF')
    return NextResponse.json(
      { error: 'Erreur lors de l\'export de la timeline PDF' },
      { status: 500 }
    )
  }
}
