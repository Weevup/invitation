/**
 * Badge PDF Export Service
 *
 * Generates printable PDF documents with badges
 * Supports batch printing with multiple badges per page
 */

import { jsPDF } from 'jspdf'
import { BADGE_SIZES, BadgeField, BadgeLayout, mmToPx, pxToMm } from './badge-generator'
import { createLogger } from './logger'

const pdfLogger = createLogger({ module: 'badge', type: 'pdf' })

export interface BadgeData {
  renderedData: Record<string, any>
  guestName: string
}

export interface BadgePDFOptions {
  size: keyof typeof BADGE_SIZES
  orientation: 'PORTRAIT' | 'LANDSCAPE'
  layout: BadgeLayout
  fields: BadgeField[]
  fontFamily?: string
  badgesPerPage?: number
  pageMargin?: number // mm
  badgeSpacing?: number // mm
}

/**
 * Create a new jsPDF document configured for badge printing
 */
function createPDFDocument(): jsPDF {
  return new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })
}

/**
 * Draw a single badge on the PDF
 */
async function drawBadge(
  pdf: jsPDF,
  x: number, // mm - top-left corner
  y: number, // mm - top-left corner
  badgeData: BadgeData,
  options: BadgePDFOptions
): Promise<void> {
  const badgeSize = BADGE_SIZES[options.size]
  const { width, height } =
    options.orientation === 'LANDSCAPE'
      ? { width: badgeSize.height, height: badgeSize.width }
      : badgeSize

  // Draw background
  if (options.layout.backgroundColor) {
    pdf.setFillColor(options.layout.backgroundColor)
    pdf.rect(x, y, width, height, 'F')
  }

  // Draw sections if defined
  if (options.layout.sections) {
    let currentY = y
    for (const section of options.layout.sections) {
      const sectionHeightMm = pxToMm(section.height)

      if (section.backgroundColor) {
        pdf.setFillColor(section.backgroundColor)
        pdf.rect(x, currentY, width, sectionHeightMm, 'F')
      }

      if (section.borderColor && section.borderWidth) {
        pdf.setDrawColor(section.borderColor)
        pdf.setLineWidth(section.borderWidth / 10) // Convert to mm
        pdf.rect(x, currentY, width, sectionHeightMm, 'S')
      }

      currentY += sectionHeightMm
    }
  }

  // Draw border
  if (options.layout.borderColor && options.layout.borderWidth) {
    pdf.setDrawColor(options.layout.borderColor)
    pdf.setLineWidth(options.layout.borderWidth / 10) // Convert to mm
    if (options.layout.borderRadius) {
      // jsPDF doesn't support rounded rects natively, use regular rect
      pdf.rect(x, y, width, height, 'S')
    } else {
      pdf.rect(x, y, width, height, 'S')
    }
  }

  // Set font
  const fontFamily = options.fontFamily || 'helvetica'
  pdf.setFont(fontFamily)

  // Draw fields
  for (const field of options.fields) {
    const value = badgeData.renderedData[field.type]
    if (!value) continue

    const fieldX = x + pxToMm(field.x)
    const fieldY = y + pxToMm(field.y)

    if (field.type === 'QR_CODE') {
      // Draw QR code image
      try {
        const qrSize = field.size ? pxToMm(field.size) : 20
        pdf.addImage(value, 'PNG', fieldX - qrSize / 2, fieldY, qrSize, qrSize)
      } catch (error) {
        pdfLogger.error(
          { error, field: field.type },
          'Failed to add QR code to PDF'
        )
      }
    } else if (field.type === 'LOGO' || field.type === 'PHOTO') {
      // Draw image
      try {
        if (value && value.startsWith('http')) {
          // For HTTP images, you'd need to fetch and convert to base64
          // For now, skip external images
          pdfLogger.warn(
            { field: field.type, url: value },
            'Skipping external image in PDF'
          )
        } else if (value && value.startsWith('data:image')) {
          const imgWidth = field.width ? pxToMm(field.width) : 20
          const imgHeight = field.height ? pxToMm(field.height) : 20
          pdf.addImage(value, 'PNG', fieldX, fieldY, imgWidth, imgHeight)
        }
      } catch (error) {
        pdfLogger.error(
          { error, field: field.type },
          'Failed to add image to PDF'
        )
      }
    } else {
      // Draw text
      const fontSize = field.fontSize || 12
      const fontWeight = field.fontWeight || 'normal'
      const fontStyle = field.fontStyle || 'normal'
      const color = field.color || '#000000'
      const textAlign = field.textAlign || 'left'

      // Set text properties
      pdf.setFontSize(fontSize * 0.75) // Convert px to pt (approximate)
      pdf.setTextColor(color)

      // Set font weight and style
      if (fontWeight === 'bold' && fontStyle === 'italic') {
        pdf.setFont(fontFamily, 'bolditalic')
      } else if (fontWeight === 'bold') {
        pdf.setFont(fontFamily, 'bold')
      } else if (fontStyle === 'italic') {
        pdf.setFont(fontFamily, 'italic')
      } else {
        pdf.setFont(fontFamily, 'normal')
      }

      // Calculate text position based on alignment
      let textX = fieldX
      if (textAlign === 'center') {
        const textWidth = pdf.getTextWidth(value)
        textX = fieldX - textWidth / 2
      } else if (textAlign === 'right') {
        const textWidth = pdf.getTextWidth(value)
        textX = fieldX - textWidth
      }

      // Draw text
      pdf.text(value, textX, fieldY)
    }
  }
}

/**
 * Calculate badge positions on an A4 page
 */
function calculateBadgePositions(
  badgesPerPage: number,
  badgeSize: { width: number; height: number },
  pageMargin: number,
  badgeSpacing: number
): Array<{ x: number; y: number }> {
  const A4_WIDTH = 210 // mm
  const A4_HEIGHT = 297 // mm

  const availableWidth = A4_WIDTH - 2 * pageMargin
  const availableHeight = A4_HEIGHT - 2 * pageMargin

  // Calculate how many badges fit horizontally and vertically
  const cols = Math.floor(
    (availableWidth + badgeSpacing) / (badgeSize.width + badgeSpacing)
  )
  const rows = Math.floor(
    (availableHeight + badgeSpacing) / (badgeSize.height + badgeSpacing)
  )

  const maxBadgesPerPage = cols * rows

  // Limit to requested badges per page or maximum that fits
  const actualBadgesPerPage = Math.min(badgesPerPage, maxBadgesPerPage)
  const actualCols = Math.min(cols, actualBadgesPerPage)
  const actualRows = Math.ceil(actualBadgesPerPage / actualCols)

  const positions: Array<{ x: number; y: number }> = []

  for (let row = 0; row < actualRows; row++) {
    for (let col = 0; col < actualCols; col++) {
      if (positions.length >= actualBadgesPerPage) break

      const x = pageMargin + col * (badgeSize.width + badgeSpacing)
      const y = pageMargin + row * (badgeSize.height + badgeSpacing)

      positions.push({ x, y })
    }
  }

  return positions
}

/**
 * Generate PDF with badges
 */
export async function generateBadgesPDF(
  badges: BadgeData[],
  options: BadgePDFOptions
): Promise<Buffer> {
  try {
    const pdf = createPDFDocument()
    const badgeSize = BADGE_SIZES[options.size]
    const { width, height } =
      options.orientation === 'LANDSCAPE'
        ? { width: badgeSize.height, height: badgeSize.width }
        : badgeSize

    const badgesPerPage = options.badgesPerPage || 10
    const pageMargin = options.pageMargin || 10
    const badgeSpacing = options.badgeSpacing || 5

    const positions = calculateBadgePositions(
      badgesPerPage,
      { width, height },
      pageMargin,
      badgeSpacing
    )

    let badgeIndex = 0
    let pageIndex = 0

    while (badgeIndex < badges.length) {
      if (pageIndex > 0) {
        pdf.addPage()
      }

      // Draw badges for this page
      for (let i = 0; i < positions.length && badgeIndex < badges.length; i++) {
        const position = positions[i]
        const badge = badges[badgeIndex]

        await drawBadge(pdf, position.x, position.y, badge, options)

        badgeIndex++
      }

      pageIndex++
    }

    const pdfBuffer = Buffer.from(pdf.output('arraybuffer'))

    pdfLogger.info(
      { badgeCount: badges.length, pages: pageIndex },
      'PDF generated successfully'
    )

    return pdfBuffer
  } catch (error) {
    pdfLogger.error(
      { error, badgeCount: badges.length, stack: error instanceof Error ? error.stack : undefined },
      'Failed to generate badges PDF'
    )
    throw new Error('Failed to generate PDF')
  }
}

/**
 * Generate single badge PDF (for preview)
 */
export async function generateSingleBadgePDF(
  badge: BadgeData,
  options: BadgePDFOptions
): Promise<Buffer> {
  return generateBadgesPDF([badge], {
    ...options,
    badgesPerPage: 1,
  })
}
