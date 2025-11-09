import jsPDF from 'jspdf'
import { generateQRCode } from './qrcode'

interface BadgeGuest {
  firstName: string
  lastName: string
  email: string
  company?: string
  tags: string[]
  rsvp?: {
    qrCodeId: string
    plusOnes: number
  }
}

interface BadgeExportOptions {
  eventName: string
  eventDate: string
  guests: BadgeGuest[]
}

/**
 * Generate a PDF file with badges for all confirmed guests
 * Each badge includes name, company, tags, and QR code for check-in
 */
export async function exportBadgesPDF(options: BadgeExportOptions): Promise<void> {
  const { eventName, eventDate, guests } = options

  // A4 size in mm
  const pageWidth = 210
  const pageHeight = 297

  // Badge dimensions (2 badges per row, 3 rows per page)
  const badgeWidth = 90
  const badgeHeight = 85
  const marginX = 10
  const marginY = 15
  const spacingX = 10
  const spacingY = 12

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  })

  let badgeCount = 0
  const badgesPerPage = 6

  // Filter only guests with QR codes
  const confirmedGuests = guests.filter(g => g.rsvp?.qrCodeId)

  for (const guest of confirmedGuests) {
    if (!guest.rsvp?.qrCodeId) continue

    // Add new page if needed (except for first badge)
    if (badgeCount > 0 && badgeCount % badgesPerPage === 0) {
      doc.addPage()
    }

    // Calculate position on current page
    const pageIndex = badgeCount % badgesPerPage
    const col = pageIndex % 2 // 0 or 1
    const row = Math.floor(pageIndex / 2) // 0, 1, or 2

    const x = marginX + col * (badgeWidth + spacingX)
    const y = marginY + row * (badgeHeight + spacingY)

    // Draw badge border
    doc.setDrawColor(0, 70, 69) // #004645
    doc.setLineWidth(0.5)
    doc.roundedRect(x, y, badgeWidth, badgeHeight, 3, 3)

    // Header background
    doc.setFillColor(0, 145, 151) // #009197
    doc.roundedRect(x, y, badgeWidth, 15, 3, 3, 'F')
    doc.setFillColor(0, 145, 151)
    doc.rect(x, y + 12, badgeWidth, 3, 'F')

    // Event name
    doc.setFontSize(8)
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    const eventNameLines = doc.splitTextToSize(eventName, badgeWidth - 8)
    doc.text(eventNameLines[0], x + badgeWidth / 2, y + 6, { align: 'center' })

    // Event date
    doc.setFontSize(6)
    doc.setFont('helvetica', 'normal')
    doc.text(eventDate, x + badgeWidth / 2, y + 11, { align: 'center' })

    // Guest name
    doc.setFontSize(12)
    doc.setTextColor(0, 70, 69) // #004645
    doc.setFont('helvetica', 'bold')
    const fullName = `${guest.firstName} ${guest.lastName}`
    doc.text(fullName, x + badgeWidth / 2, y + 22, { align: 'center' })

    // Company
    if (guest.company) {
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(100, 100, 100)
      doc.text(guest.company, x + badgeWidth / 2, y + 28, { align: 'center' })
    }

    // Tags
    if (guest.tags.length > 0) {
      doc.setFontSize(7)
      doc.setFont('helvetica', 'italic')
      doc.setTextColor(0, 145, 151) // #009197
      const tagsText = guest.tags.slice(0, 2).join(' • ')
      doc.text(tagsText, x + badgeWidth / 2, y + (guest.company ? 33 : 28), { align: 'center' })
    }

    // Generate and add QR code
    try {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      const checkinUrl = `${baseUrl}/api/checkin/${guest.rsvp.qrCodeId}`
      const qrCodeDataUrl = await generateQRCode(checkinUrl)

      // Add QR code image
      const qrSize = 35
      const qrX = x + (badgeWidth - qrSize) / 2
      const qrY = y + badgeHeight - qrSize - 8

      doc.addImage(qrCodeDataUrl, 'PNG', qrX, qrY, qrSize, qrSize)

      // QR code label
      doc.setFontSize(6)
      doc.setTextColor(100, 100, 100)
      doc.text('Scan pour check-in', x + badgeWidth / 2, y + badgeHeight - 2, { align: 'center' })
    } catch (error) {
      console.error(`Error generating QR code for ${guest.firstName} ${guest.lastName}:`, error)
    }

    // Plus ones indicator
    if (guest.rsvp.plusOnes > 0) {
      doc.setFontSize(7)
      doc.setTextColor(255, 71, 19) // #FF4713
      doc.setFont('helvetica', 'bold')
      doc.text(`+${guest.rsvp.plusOnes}`, x + badgeWidth - 8, y + 22, { align: 'center' })
    }

    badgeCount++
  }

  // Save the PDF
  const fileName = `badges-${eventName.replace(/\s+/g, '-').toLowerCase()}.pdf`
  doc.save(fileName)
}
