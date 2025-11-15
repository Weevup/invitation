/**
 * Badge Generator Service
 *
 * Generates badges with QR codes, custom layouts, and fields
 * Supports batch PDF export for printing
 */

import QRCode from 'qrcode'
import { prisma } from './prisma'
import { createLogger } from './logger'

const badgeLogger = createLogger({ module: 'badge', type: 'generator' })

// Badge size configurations in millimeters
export const BADGE_SIZES = {
  STANDARD: { width: 85.6, height: 54 }, // Credit card size
  LARGE: { width: 100, height: 70 },
  LANYARD: { width: 100, height: 150 },
  A6: { width: 105, height: 148 },
} as const

// Convert mm to pixels at 300 DPI (print quality)
const MM_TO_PX = 11.811 // 300 DPI

export function mmToPx(mm: number): number {
  return Math.round(mm * MM_TO_PX)
}

export function pxToMm(px: number): number {
  return px / MM_TO_PX
}

/**
 * Badge field type definition
 */
export type BadgeFieldType =
  | 'FIRST_NAME'
  | 'LAST_NAME'
  | 'FULL_NAME'
  | 'COMPANY'
  | 'JOB_TITLE'
  | 'EMAIL'
  | 'QR_CODE'
  | 'EVENT_NAME'
  | 'EVENT_DATE'
  | 'CUSTOM_TEXT'
  | 'LOGO'
  | 'PHOTO'

export interface BadgeField {
  id: string
  type: BadgeFieldType
  x: number // pixels
  y: number // pixels
  width?: number
  height?: number
  fontSize?: number
  fontWeight?: 'normal' | 'bold' | 'bolder' | 'lighter'
  fontStyle?: 'normal' | 'italic'
  color?: string
  textAlign?: 'left' | 'center' | 'right'
  customText?: string
  size?: number // For QR codes and images
}

export interface BadgeSection {
  type: 'header' | 'body' | 'footer'
  height: number // pixels
  backgroundColor?: string
  borderColor?: string
  borderWidth?: number
}

export interface BadgeLayout {
  backgroundColor: string
  borderColor?: string
  borderWidth?: number
  borderRadius?: number
  sections?: BadgeSection[]
}

export interface BadgeDesignConfig {
  size: keyof typeof BADGE_SIZES
  orientation: 'PORTRAIT' | 'LANDSCAPE'
  layout: BadgeLayout
  fields: BadgeField[]
  fontFamily?: string
  eventLogoUrl?: string
  includeQRCode?: boolean
  qrCodeSize?: number
}

export interface GuestBadgeData {
  id: string
  firstName: string
  lastName: string
  email: string
  company?: string | null
  jobTitle?: string | null
  qrCodeId: string
  eventName: string
  eventDate: Date
  photoUrl?: string | null
}

/**
 * Generate QR code as base64 data URL
 */
export async function generateQRCodeDataURL(
  text: string,
  size: number = 200
): Promise<string> {
  try {
    const dataURL = await QRCode.toDataURL(text, {
      width: size,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    })
    return dataURL
  } catch (error) {
    badgeLogger.error(
      { error, text: text.substring(0, 20) },
      'Failed to generate QR code'
    )
    throw new Error('QR code generation failed')
  }
}

/**
 * Resolve field value for a guest
 */
export function resolveFieldValue(
  field: BadgeField,
  guestData: GuestBadgeData,
  qrCodeDataURL?: string
): string | null {
  switch (field.type) {
    case 'FIRST_NAME':
      return guestData.firstName

    case 'LAST_NAME':
      return guestData.lastName

    case 'FULL_NAME':
      return `${guestData.firstName} ${guestData.lastName}`

    case 'COMPANY':
      return guestData.company || ''

    case 'JOB_TITLE':
      return guestData.jobTitle || ''

    case 'EMAIL':
      return guestData.email

    case 'QR_CODE':
      return qrCodeDataURL || null

    case 'EVENT_NAME':
      return guestData.eventName

    case 'EVENT_DATE':
      return guestData.eventDate.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })

    case 'CUSTOM_TEXT':
      return field.customText || ''

    case 'LOGO':
      // Returns URL, actual rendering handled by PDF generator
      return field.customText || '' // URL stored in customText

    case 'PHOTO':
      return guestData.photoUrl || null

    default:
      return ''
  }
}

/**
 * Generate badge data for a single guest
 */
export async function generateBadgeData(
  guestId: string,
  badgeDesign: BadgeDesignConfig,
  appUrl: string
): Promise<Record<string, any>> {
  try {
    // Fetch guest with RSVP and event data
    const guest = await prisma.guest.findUnique({
      where: { id: guestId },
      include: {
        event: {
          select: {
            id: true,
            name: true,
            startsAt: true,
          },
        },
        rsvp: {
          select: {
            qrCodeId: true,
          },
        },
      },
    })

    if (!guest) {
      throw new Error(`Guest ${guestId} not found`)
    }

    if (!guest.rsvp) {
      throw new Error(`Guest ${guestId} has no RSVP`)
    }

    const guestData: GuestBadgeData = {
      id: guest.id,
      firstName: guest.firstName,
      lastName: guest.lastName,
      email: guest.email,
      company: guest.company,
      jobTitle: guest.jobTitle,
      qrCodeId: guest.rsvp.qrCodeId,
      eventName: guest.event.name,
      eventDate: guest.event.startsAt,
      photoUrl: null, // TODO: Add photo support
    }

    // Generate QR code if needed
    let qrCodeDataURL: string | undefined
    if (badgeDesign.includeQRCode) {
      const qrCodeUrl = `${appUrl}/api/checkin/${guestData.qrCodeId}`
      qrCodeDataURL = await generateQRCodeDataURL(
        qrCodeUrl,
        badgeDesign.qrCodeSize || 200
      )
    }

    // Resolve all field values
    const renderedData: Record<string, any> = {}

    for (const field of badgeDesign.fields) {
      const value = resolveFieldValue(field, guestData, qrCodeDataURL)
      if (value !== null) {
        renderedData[field.type] = value
      }
    }

    badgeLogger.info(
      { guestId, eventId: guest.event.id },
      'Badge data generated successfully'
    )

    return renderedData
  } catch (error) {
    badgeLogger.error(
      { error, guestId, stack: error instanceof Error ? error.stack : undefined },
      'Failed to generate badge data'
    )
    throw error
  }
}

/**
 * Generate badges for multiple guests
 */
export async function generateBatchBadgeData(
  guestIds: string[],
  eventId: string,
  appUrl: string
): Promise<Array<{ guestId: string; renderedData: Record<string, any> }>> {
  try {
    // Fetch badge design for event
    const badgeDesign = await prisma.badgeDesign.findUnique({
      where: { eventId },
    })

    if (!badgeDesign) {
      throw new Error(`No badge design found for event ${eventId}`)
    }

    const designConfig: BadgeDesignConfig = {
      size: badgeDesign.size as keyof typeof BADGE_SIZES,
      orientation: badgeDesign.orientation as 'PORTRAIT' | 'LANDSCAPE',
      layout: badgeDesign.layout as unknown as BadgeLayout,
      fields: badgeDesign.fields as unknown as BadgeField[],
      fontFamily: badgeDesign.fontFamily,
      eventLogoUrl: badgeDesign.eventLogoUrl || undefined,
      includeQRCode: badgeDesign.includeQRCode,
      qrCodeSize: badgeDesign.qrCodeSize,
    }

    const results: Array<{
      guestId: string
      renderedData: Record<string, any>
    }> = []

    for (const guestId of guestIds) {
      const renderedData = await generateBadgeData(
        guestId,
        designConfig,
        appUrl
      )
      results.push({ guestId, renderedData })
    }

    badgeLogger.info(
      { eventId, count: guestIds.length },
      'Batch badge data generated successfully'
    )

    return results
  } catch (error) {
    badgeLogger.error(
      { error, eventId, stack: error instanceof Error ? error.stack : undefined },
      'Failed to generate batch badge data'
    )
    throw error
  }
}

/**
 * Get default badge templates
 */
export function getDefaultBadgeTemplates() {
  return [
    {
      name: 'Corporate Standard',
      description: 'Professional badge with company name and QR code',
      size: 'STANDARD' as const,
      orientation: 'PORTRAIT' as const,
      layout: {
        backgroundColor: '#ffffff',
        borderColor: '#004645',
        borderWidth: 2,
        sections: [
          {
            type: 'header' as const,
            height: 150,
            backgroundColor: '#004645',
          },
          {
            type: 'body' as const,
            height: 350,
          },
          {
            type: 'footer' as const,
            height: 100,
            backgroundColor: '#f5f5f5',
          },
        ],
      },
      fields: [
        {
          id: '1',
          type: 'FULL_NAME' as const,
          x: 426, // Center of 85.6mm width
          y: 250,
          fontSize: 28,
          fontWeight: 'bold' as const,
          color: '#333333',
          textAlign: 'center' as const,
        },
        {
          id: '2',
          type: 'COMPANY' as const,
          x: 426,
          y: 290,
          fontSize: 18,
          color: '#666666',
          textAlign: 'center' as const,
        },
        {
          id: '3',
          type: 'JOB_TITLE' as const,
          x: 426,
          y: 320,
          fontSize: 14,
          color: '#999999',
          textAlign: 'center' as const,
        },
        {
          id: '4',
          type: 'QR_CODE' as const,
          x: 326,
          y: 380,
          size: 200,
        },
      ],
      fontFamily: 'Arial',
      isDefault: true,
    },
    {
      name: 'VIP Badge',
      description: 'Elegant badge for VIP guests',
      size: 'LARGE' as const,
      orientation: 'PORTRAIT' as const,
      layout: {
        backgroundColor: '#1a1a1a',
        borderColor: '#FFD700',
        borderWidth: 3,
      },
      fields: [
        {
          id: '1',
          type: 'CUSTOM_TEXT' as const,
          x: 590,
          y: 100,
          fontSize: 20,
          fontWeight: 'bold' as const,
          color: '#FFD700',
          textAlign: 'center' as const,
          customText: 'VIP',
        },
        {
          id: '2',
          type: 'FULL_NAME' as const,
          x: 590,
          y: 350,
          fontSize: 32,
          fontWeight: 'bold' as const,
          color: '#ffffff',
          textAlign: 'center' as const,
        },
        {
          id: '3',
          type: 'COMPANY' as const,
          x: 590,
          y: 400,
          fontSize: 20,
          color: '#cccccc',
          textAlign: 'center' as const,
        },
        {
          id: '4',
          type: 'QR_CODE' as const,
          x: 490,
          y: 500,
          size: 200,
        },
      ],
      fontFamily: 'Georgia',
      isDefault: false,
    },
    {
      name: 'Simple Lanyard',
      description: 'Vertical badge for lanyard holders',
      size: 'LANYARD' as const,
      orientation: 'PORTRAIT' as const,
      layout: {
        backgroundColor: '#ffffff',
        borderColor: '#004645',
        borderWidth: 2,
      },
      fields: [
        {
          id: '1',
          type: 'FULL_NAME' as const,
          x: 590,
          y: 300,
          fontSize: 36,
          fontWeight: 'bold' as const,
          color: '#004645',
          textAlign: 'center' as const,
        },
        {
          id: '2',
          type: 'COMPANY' as const,
          x: 590,
          y: 360,
          fontSize: 24,
          color: '#666666',
          textAlign: 'center' as const,
        },
        {
          id: '3',
          type: 'JOB_TITLE' as const,
          x: 590,
          y: 410,
          fontSize: 20,
          color: '#999999',
          textAlign: 'center' as const,
        },
        {
          id: '4',
          type: 'QR_CODE' as const,
          x: 390,
          y: 950,
          size: 400,
        },
        {
          id: '5',
          type: 'EVENT_NAME' as const,
          x: 590,
          y: 1500,
          fontSize: 28,
          fontWeight: 'bold' as const,
          color: '#004645',
          textAlign: 'center' as const,
        },
      ],
      fontFamily: 'Arial',
      isDefault: false,
    },
  ]
}
