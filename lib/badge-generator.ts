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

// Export types for use in other components
export type BadgeSize = keyof typeof BADGE_SIZES
export type BadgeOrientation = 'PORTRAIT' | 'LANDSCAPE'

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
  size: BadgeSize
  orientation: BadgeOrientation
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
  lastName: string | null
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
      return guestData.lastName || ''

    case 'FULL_NAME':
      return guestData.lastName ? `${guestData.firstName} ${guestData.lastName}` : guestData.firstName

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
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        company: true,
        jobTitle: true,
        photoUrl: true,
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
      photoUrl: guest.photoUrl,
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
 * Badge template category type
 */
export type BadgeTemplateCategory = 'corporate' | 'event' | 'vip'

/**
 * Badge template type with category
 */
export interface BadgeTemplate {
  name: string
  description: string
  category: BadgeTemplateCategory
  size: BadgeSize
  orientation: BadgeOrientation
  layout: BadgeLayout
  fields: BadgeField[]
  fontFamily?: string
  isDefault?: boolean
}

/**
 * Get default badge templates organized by category
 */
export function getDefaultBadgeTemplates(): BadgeTemplate[] {
  return [
    // ============================================
    // CORPORATE TEMPLATES
    // ============================================
    {
      name: 'Corporate Standard',
      description: 'Professional badge with company name and QR code',
      category: 'corporate',
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
          x: 426,
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
      name: 'Modern Tech',
      description: 'Clean minimalist design for tech events',
      category: 'corporate',
      size: 'STANDARD' as const,
      orientation: 'PORTRAIT' as const,
      layout: {
        backgroundColor: '#0A0E27',
        borderColor: '#00D9FF',
        borderWidth: 1,
      },
      fields: [
        {
          id: '1',
          type: 'FULL_NAME' as const,
          x: 426,
          y: 200,
          fontSize: 32,
          fontWeight: 'bold' as const,
          color: '#FFFFFF',
          textAlign: 'center' as const,
        },
        {
          id: '2',
          type: 'JOB_TITLE' as const,
          x: 426,
          y: 250,
          fontSize: 16,
          color: '#00D9FF',
          textAlign: 'center' as const,
        },
        {
          id: '3',
          type: 'COMPANY' as const,
          x: 426,
          y: 280,
          fontSize: 14,
          color: '#A0A0A0',
          textAlign: 'center' as const,
        },
        {
          id: '4',
          type: 'QR_CODE' as const,
          x: 326,
          y: 350,
          size: 180,
        },
      ],
      fontFamily: 'Helvetica',
      isDefault: false,
    },
    {
      name: 'Executive',
      description: 'Elegant design for C-level executives',
      category: 'corporate',
      size: 'LARGE' as const,
      orientation: 'LANDSCAPE' as const,
      layout: {
        backgroundColor: '#2C3E50',
        borderColor: '#C0C0C0',
        borderWidth: 2,
        sections: [
          {
            type: 'header' as const,
            height: 180,
            backgroundColor: '#34495E',
          },
        ],
      },
      fields: [
        {
          id: '1',
          type: 'PHOTO' as const,
          x: 100,
          y: 250,
          width: 200,
          height: 200,
        },
        {
          id: '2',
          type: 'FULL_NAME' as const,
          x: 700,
          y: 280,
          fontSize: 36,
          fontWeight: 'bold' as const,
          color: '#ECF0F1',
          textAlign: 'center' as const,
        },
        {
          id: '3',
          type: 'JOB_TITLE' as const,
          x: 700,
          y: 340,
          fontSize: 20,
          color: '#BDC3C7',
          textAlign: 'center' as const,
        },
        {
          id: '4',
          type: 'COMPANY' as const,
          x: 700,
          y: 380,
          fontSize: 18,
          color: '#95A5A6',
          textAlign: 'center' as const,
        },
        {
          id: '5',
          type: 'QR_CODE' as const,
          x: 950,
          y: 280,
          size: 150,
        },
      ],
      fontFamily: 'Georgia',
      isDefault: false,
    },

    // ============================================
    // EVENT TEMPLATES
    // ============================================
    {
      name: 'Conference Speaker',
      description: 'Distinctive badge for conference speakers',
      category: 'event',
      size: 'LANYARD' as const,
      orientation: 'PORTRAIT' as const,
      layout: {
        backgroundColor: '#ffffff',
        borderColor: '#E74C3C',
        borderWidth: 3,
        sections: [
          {
            type: 'header' as const,
            height: 200,
            backgroundColor: '#E74C3C',
          },
        ],
      },
      fields: [
        {
          id: '1',
          type: 'CUSTOM_TEXT' as const,
          x: 590,
          y: 80,
          fontSize: 32,
          fontWeight: 'bold' as const,
          color: '#FFFFFF',
          textAlign: 'center' as const,
          customText: 'SPEAKER',
        },
        {
          id: '2',
          type: 'PHOTO' as const,
          x: 390,
          y: 280,
          width: 400,
          height: 400,
        },
        {
          id: '3',
          type: 'FULL_NAME' as const,
          x: 590,
          y: 750,
          fontSize: 40,
          fontWeight: 'bold' as const,
          color: '#2C3E50',
          textAlign: 'center' as const,
        },
        {
          id: '4',
          type: 'JOB_TITLE' as const,
          x: 590,
          y: 820,
          fontSize: 24,
          color: '#7F8C8D',
          textAlign: 'center' as const,
        },
        {
          id: '5',
          type: 'COMPANY' as const,
          x: 590,
          y: 860,
          fontSize: 20,
          color: '#95A5A6',
          textAlign: 'center' as const,
        },
        {
          id: '6',
          type: 'EVENT_NAME' as const,
          x: 590,
          y: 1400,
          fontSize: 28,
          fontWeight: 'bold' as const,
          color: '#E74C3C',
          textAlign: 'center' as const,
        },
        {
          id: '7',
          type: 'QR_CODE' as const,
          x: 390,
          y: 1000,
          size: 380,
        },
      ],
      fontFamily: 'Helvetica',
      isDefault: false,
    },
    {
      name: 'Festival Pass',
      description: 'Vibrant design for festivals and music events',
      category: 'event',
      size: 'LANYARD' as const,
      orientation: 'PORTRAIT' as const,
      layout: {
        backgroundColor: '#FF6B6B',
        borderColor: '#FFA500',
        borderWidth: 4,
      },
      fields: [
        {
          id: '1',
          type: 'EVENT_NAME' as const,
          x: 590,
          y: 150,
          fontSize: 44,
          fontWeight: 'bold' as const,
          color: '#FFFFFF',
          textAlign: 'center' as const,
        },
        {
          id: '2',
          type: 'CUSTOM_TEXT' as const,
          x: 590,
          y: 220,
          fontSize: 28,
          color: '#FFEB3B',
          textAlign: 'center' as const,
          customText: '2025',
        },
        {
          id: '3',
          type: 'FULL_NAME' as const,
          x: 590,
          y: 600,
          fontSize: 48,
          fontWeight: 'bold' as const,
          color: '#FFFFFF',
          textAlign: 'center' as const,
        },
        {
          id: '4',
          type: 'CUSTOM_TEXT' as const,
          x: 590,
          y: 680,
          fontSize: 24,
          fontWeight: 'bold' as const,
          color: '#FFEB3B',
          textAlign: 'center' as const,
          customText: 'GENERAL ADMISSION',
        },
        {
          id: '5',
          type: 'QR_CODE' as const,
          x: 390,
          y: 900,
          size: 400,
        },
        {
          id: '6',
          type: 'EVENT_DATE' as const,
          x: 590,
          y: 1400,
          fontSize: 24,
          color: '#FFFFFF',
          textAlign: 'center' as const,
        },
      ],
      fontFamily: 'Arial',
      isDefault: false,
    },
    {
      name: 'Workshop Attendee',
      description: 'Practical badge for workshop and training sessions',
      category: 'event',
      size: 'STANDARD' as const,
      orientation: 'LANDSCAPE' as const,
      layout: {
        backgroundColor: '#FFFFFF',
        borderColor: '#3498DB',
        borderWidth: 2,
        sections: [
          {
            type: 'header' as const,
            height: 120,
            backgroundColor: '#3498DB',
          },
        ],
      },
      fields: [
        {
          id: '1',
          type: 'CUSTOM_TEXT' as const,
          x: 415,
          y: 50,
          fontSize: 24,
          fontWeight: 'bold' as const,
          color: '#FFFFFF',
          textAlign: 'center' as const,
          customText: 'WORKSHOP',
        },
        {
          id: '2',
          type: 'FULL_NAME' as const,
          x: 415,
          y: 200,
          fontSize: 28,
          fontWeight: 'bold' as const,
          color: '#2C3E50',
          textAlign: 'center' as const,
        },
        {
          id: '3',
          type: 'COMPANY' as const,
          x: 415,
          y: 245,
          fontSize: 16,
          color: '#7F8C8D',
          textAlign: 'center' as const,
        },
        {
          id: '4',
          type: 'QR_CODE' as const,
          x: 315,
          y: 300,
          size: 200,
        },
      ],
      fontFamily: 'Arial',
      isDefault: false,
    },
    {
      name: 'Simple Lanyard',
      description: 'Vertical badge for lanyard holders',
      category: 'event',
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

    // ============================================
    // VIP / PREMIUM TEMPLATES
    // ============================================
    {
      name: 'VIP Badge',
      description: 'Elegant badge for VIP guests',
      category: 'vip',
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
      name: 'Platinum Member',
      description: 'Premium badge for platinum tier members',
      category: 'vip',
      size: 'LARGE' as const,
      orientation: 'PORTRAIT' as const,
      layout: {
        backgroundColor: '#E8E8E8',
        borderColor: '#C0C0C0',
        borderWidth: 3,
        sections: [
          {
            type: 'header' as const,
            height: 200,
            backgroundColor: '#4A4A4A',
          },
        ],
      },
      fields: [
        {
          id: '1',
          type: 'CUSTOM_TEXT' as const,
          x: 590,
          y: 80,
          fontSize: 28,
          fontWeight: 'bold' as const,
          color: '#C0C0C0',
          textAlign: 'center' as const,
          customText: 'PLATINUM',
        },
        {
          id: '2',
          type: 'PHOTO' as const,
          x: 390,
          y: 250,
          width: 400,
          height: 400,
        },
        {
          id: '3',
          type: 'FULL_NAME' as const,
          x: 590,
          y: 700,
          fontSize: 36,
          fontWeight: 'bold' as const,
          color: '#2C2C2C',
          textAlign: 'center' as const,
        },
        {
          id: '4',
          type: 'COMPANY' as const,
          x: 590,
          y: 760,
          fontSize: 22,
          color: '#5A5A5A',
          textAlign: 'center' as const,
        },
        {
          id: '5',
          type: 'QR_CODE' as const,
          x: 490,
          y: 860,
          size: 200,
        },
      ],
      fontFamily: 'Georgia',
      isDefault: false,
    },
    {
      name: 'Press & Media',
      description: 'Professional badge for press and media personnel',
      category: 'vip',
      size: 'STANDARD' as const,
      orientation: 'LANDSCAPE' as const,
      layout: {
        backgroundColor: '#FFFFFF',
        borderColor: '#FF5722',
        borderWidth: 3,
        sections: [
          {
            type: 'header' as const,
            height: 100,
            backgroundColor: '#FF5722',
          },
        ],
      },
      fields: [
        {
          id: '1',
          type: 'CUSTOM_TEXT' as const,
          x: 415,
          y: 40,
          fontSize: 28,
          fontWeight: 'bold' as const,
          color: '#FFFFFF',
          textAlign: 'center' as const,
          customText: 'PRESS',
        },
        {
          id: '2',
          type: 'PHOTO' as const,
          x: 80,
          y: 150,
          width: 180,
          height: 180,
        },
        {
          id: '3',
          type: 'FULL_NAME' as const,
          x: 550,
          y: 180,
          fontSize: 30,
          fontWeight: 'bold' as const,
          color: '#2C3E50',
          textAlign: 'center' as const,
        },
        {
          id: '4',
          type: 'COMPANY' as const,
          x: 550,
          y: 230,
          fontSize: 18,
          color: '#FF5722',
          textAlign: 'center' as const,
        },
        {
          id: '5',
          type: 'QR_CODE' as const,
          x: 650,
          y: 180,
          size: 140,
        },
      ],
      fontFamily: 'Helvetica',
      isDefault: false,
    },
  ]
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: BadgeTemplateCategory): BadgeTemplate[] {
  return getDefaultBadgeTemplates().filter((t) => t.category === category)
}

/**
 * Get template categories with metadata
 */
export function getTemplateCategories() {
  return [
    {
      id: 'corporate' as const,
      name: 'Corporate',
      description: 'Professional badges for business events',
      icon: 'Briefcase',
      count: getTemplatesByCategory('corporate').length,
    },
    {
      id: 'event' as const,
      name: 'Events',
      description: 'Badges for conferences, workshops, and festivals',
      icon: 'Calendar',
      count: getTemplatesByCategory('event').length,
    },
    {
      id: 'vip' as const,
      name: 'VIP & Premium',
      description: 'Exclusive badges for VIP guests and media',
      icon: 'Star',
      count: getTemplatesByCategory('vip').length,
    },
  ]
}
