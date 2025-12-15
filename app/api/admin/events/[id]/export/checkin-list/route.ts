import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin, handleAuthError } from '@/lib/auth-utils'
import { requireEventOwnership } from '@/lib/permissions'
import { jsPDF } from 'jspdf'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { createLogger } from '@/lib/logger'

const logger = createLogger({ module: 'export', type: 'checkin-list' })

/**
 * GET /api/admin/events/[id]/export/checkin-list
 * Export a PDF checklist for event entrance
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin()
    const { id: eventId } = await params
    await requireEventOwnership(eventId, session.user.id)

    const { searchParams } = new URL(request.url)
    const filter = searchParams.get('filter') || 'confirmed' // 'confirmed' | 'all'

    // Get event with guests
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        guests: {
          where: filter === 'confirmed' ? {
            rsvp: { attending: true }
          } : {},
          include: {
            rsvp: true,
            checkins: {
              orderBy: { checkedInAt: 'desc' },
              take: 1
            }
          },
          orderBy: [
            { lastName: 'asc' },
            { firstName: 'asc' }
          ]
        }
      }
    })

    if (!event) {
      return NextResponse.json({ error: 'Événement non trouvé' }, { status: 404 })
    }

    // Create PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    const pageWidth = 210
    const pageHeight = 297
    const margin = 15
    const contentWidth = pageWidth - (margin * 2)

    // Colors
    const primaryColor = '#004645'
    const accentColor = '#009197'
    const lightGray = '#f3f4f6'
    const darkGray = '#374151'

    let currentY = margin

    // ============ HEADER ============
    // Background header band
    pdf.setFillColor(primaryColor)
    pdf.rect(0, 0, pageWidth, 45, 'F')

    // Event name
    pdf.setTextColor('#ffffff')
    pdf.setFontSize(22)
    pdf.setFont('helvetica', 'bold')
    pdf.text(event.name, margin, 20)

    // Event details line
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    const eventDate = event.startsAt
      ? format(new Date(event.startsAt), "EEEE d MMMM yyyy 'à' HH'h'mm", { locale: fr })
      : 'Date non définie'
    const eventLocation = [event.venueName, event.city].filter(Boolean).join(' - ') || 'Lieu non défini'
    pdf.text(`${eventDate}  •  ${eventLocation}`, margin, 28)

    // Stats box
    const confirmedCount = event.guests.filter(g => g.rsvp?.attending === true).length
    const totalPlusOnes = event.guests.reduce((sum, g) => sum + (g.rsvp?.plusOnes || 0) + (g.adminPlusOnes || 0), 0)
    const totalPersons = confirmedCount + totalPlusOnes
    const checkedInCount = event.guests.filter(g => g.checkins && g.checkins.length > 0).length

    pdf.setFillColor('#ffffff')
    pdf.roundedRect(pageWidth - margin - 55, 8, 52, 30, 3, 3, 'F')
    pdf.setTextColor(primaryColor)
    pdf.setFontSize(8)
    pdf.text('ATTENDUS', pageWidth - margin - 50, 15)
    pdf.setFontSize(18)
    pdf.setFont('helvetica', 'bold')
    pdf.text(`${totalPersons}`, pageWidth - margin - 50, 25)
    pdf.setFontSize(8)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(accentColor)
    pdf.text(`${confirmedCount} invités + ${totalPlusOnes} accomp.`, pageWidth - margin - 50, 32)

    currentY = 55

    // ============ SUBTITLE ============
    pdf.setTextColor(darkGray)
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'bold')
    pdf.text(`Liste de contrôle d'entrée`, margin, currentY)

    pdf.setFontSize(9)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor('#6b7280')
    pdf.text(`Générée le ${format(new Date(), "d MMMM yyyy 'à' HH:mm", { locale: fr })}`, margin, currentY + 6)

    currentY += 15

    // ============ TABLE HEADER ============
    const colWidths = {
      checkbox: 8,
      name: 55,
      company: 45,
      plusOnes: 18,
      status: 25,
      notes: contentWidth - 8 - 55 - 45 - 18 - 25
    }

    const drawTableHeader = (y: number) => {
      pdf.setFillColor(primaryColor)
      pdf.rect(margin, y, contentWidth, 8, 'F')

      pdf.setTextColor('#ffffff')
      pdf.setFontSize(8)
      pdf.setFont('helvetica', 'bold')

      let x = margin + 2
      pdf.text('✓', x + 2, y + 5.5)
      x += colWidths.checkbox
      pdf.text('NOM', x, y + 5.5)
      x += colWidths.name
      pdf.text('ENTREPRISE', x, y + 5.5)
      x += colWidths.company
      pdf.text('+1', x + 4, y + 5.5)
      x += colWidths.plusOnes
      pdf.text('STATUT', x, y + 5.5)
      x += colWidths.status
      pdf.text('NOTES', x, y + 5.5)

      return y + 8
    }

    currentY = drawTableHeader(currentY)

    // ============ TABLE ROWS ============
    const rowHeight = 9
    let rowIndex = 0
    let pageNumber = 1

    const drawRow = (guest: typeof event.guests[0], y: number, isAlternate: boolean) => {
      // Alternate row background
      if (isAlternate) {
        pdf.setFillColor(lightGray)
        pdf.rect(margin, y, contentWidth, rowHeight, 'F')
      }

      // Row border
      pdf.setDrawColor('#e5e7eb')
      pdf.setLineWidth(0.1)
      pdf.line(margin, y + rowHeight, margin + contentWidth, y + rowHeight)

      // Checkbox
      pdf.setDrawColor(accentColor)
      pdf.setLineWidth(0.3)
      const isCheckedIn = guest.checkins && guest.checkins.length > 0
      if (isCheckedIn) {
        pdf.setFillColor(accentColor)
        pdf.rect(margin + 2, y + 2, 5, 5, 'FD')
        pdf.setTextColor('#ffffff')
        pdf.setFontSize(8)
        pdf.text('✓', margin + 3.2, y + 5.8)
      } else {
        pdf.rect(margin + 2, y + 2, 5, 5, 'D')
      }

      let x = margin + colWidths.checkbox + 2

      // Name
      pdf.setTextColor(primaryColor)
      pdf.setFontSize(9)
      pdf.setFont('helvetica', 'bold')
      const fullName = `${guest.firstName} ${guest.lastName || ''}`.trim()
      const truncatedName = fullName.length > 28 ? fullName.substring(0, 26) + '...' : fullName
      pdf.text(truncatedName, x, y + 6)
      x += colWidths.name

      // Company
      pdf.setTextColor(darkGray)
      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(8)
      const company = guest.company || '-'
      const truncatedCompany = company.length > 22 ? company.substring(0, 20) + '...' : company
      pdf.text(truncatedCompany, x, y + 6)
      x += colWidths.company

      // Plus ones
      const plusOnes = (guest.rsvp?.plusOnes || 0) + (guest.adminPlusOnes || 0)
      if (plusOnes > 0) {
        pdf.setFillColor(accentColor)
        pdf.roundedRect(x + 2, y + 2, 12, 5, 1, 1, 'F')
        pdf.setTextColor('#ffffff')
        pdf.setFontSize(7)
        pdf.setFont('helvetica', 'bold')
        pdf.text(`+${plusOnes}`, x + 5.5, y + 5.5)
      }
      x += colWidths.plusOnes

      // Status
      pdf.setFontSize(7)
      if (isCheckedIn) {
        pdf.setTextColor('#059669')
        pdf.text('ARRIVÉ', x, y + 6)
      } else if (guest.rsvp?.attending === true) {
        pdf.setTextColor(accentColor)
        pdf.text('CONFIRMÉ', x, y + 6)
      } else if (guest.rsvp?.attending === false) {
        pdf.setTextColor('#dc2626')
        pdf.text('DÉCLINÉ', x, y + 6)
      } else {
        pdf.setTextColor('#9ca3af')
        pdf.text('EN ATTENTE', x, y + 6)
      }
      x += colWidths.status

      // Notes area (empty for manual notes)
      pdf.setDrawColor('#d1d5db')
      pdf.setLineWidth(0.1)
      pdf.line(x, y + rowHeight - 2, x + colWidths.notes - 5, y + rowHeight - 2)

      return y + rowHeight
    }

    // Draw all guests
    for (const guest of event.guests) {
      // Check if we need a new page
      if (currentY + rowHeight > pageHeight - 20) {
        // Footer for current page
        pdf.setTextColor('#9ca3af')
        pdf.setFontSize(8)
        pdf.text(`Page ${pageNumber}`, pageWidth / 2, pageHeight - 10, { align: 'center' })

        // New page
        pdf.addPage()
        pageNumber++
        currentY = margin

        // Mini header on new page
        pdf.setFillColor(primaryColor)
        pdf.rect(0, 0, pageWidth, 15, 'F')
        pdf.setTextColor('#ffffff')
        pdf.setFontSize(10)
        pdf.setFont('helvetica', 'bold')
        pdf.text(`${event.name} - Liste d'entrée (suite)`, margin, 10)

        currentY = 20
        currentY = drawTableHeader(currentY)
      }

      currentY = drawRow(guest, currentY, rowIndex % 2 === 1)
      rowIndex++
    }

    // ============ FOOTER ============
    // Summary box at bottom
    currentY += 10
    if (currentY < pageHeight - 40) {
      pdf.setFillColor(lightGray)
      pdf.roundedRect(margin, currentY, contentWidth, 20, 2, 2, 'F')

      pdf.setTextColor(primaryColor)
      pdf.setFontSize(9)
      pdf.setFont('helvetica', 'bold')
      pdf.text('RÉCAPITULATIF', margin + 5, currentY + 7)

      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(8)
      pdf.setTextColor(darkGray)
      pdf.text(`Total invités: ${event.guests.length}`, margin + 5, currentY + 14)
      pdf.text(`Confirmés: ${confirmedCount}`, margin + 50, currentY + 14)
      pdf.text(`Accompagnants: ${totalPlusOnes}`, margin + 90, currentY + 14)
      pdf.text(`Déjà arrivés: ${checkedInCount}`, margin + 135, currentY + 14)
    }

    // Page number footer
    pdf.setTextColor('#9ca3af')
    pdf.setFontSize(8)
    pdf.text(`Page ${pageNumber}`, pageWidth / 2, pageHeight - 10, { align: 'center' })

    // Generate PDF buffer
    const pdfBuffer = Buffer.from(pdf.output('arraybuffer'))

    // Filename
    const fileName = `liste-entree-${event.name.replace(/[^a-z0-9]/gi, '-')}-${format(new Date(), 'yyyy-MM-dd')}.pdf`

    logger.info({ eventId, guestCount: event.guests.length, filter }, 'Check-in list PDF exported')

    return new Response(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': pdfBuffer.length.toString()
      }
    })
  } catch (error) {
    logger.error({ error }, 'Error exporting check-in list PDF')
    return handleAuthError(error)
  }
}
