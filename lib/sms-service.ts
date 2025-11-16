import { Twilio } from 'twilio'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import type { NotificationType, NotificationStatus } from '@prisma/client'

// Twilio configuration from environment variables
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER

// Initialize Twilio client (lazy initialization)
let twilioClient: Twilio | null = null

function getTwilioClient(): Twilio {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
    throw new Error('Twilio credentials not configured. Please set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER environment variables.')
  }

  if (!twilioClient) {
    twilioClient = new Twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
  }

  return twilioClient
}

export interface SendSMSOptions {
  to: string // Phone number in international format (+33612345678)
  message: string // SMS message content (max 160 chars for single SMS, 1600 for concatenated)
  guestId: string // Guest ID for tracking
  eventId: string // Event ID for tracking
  templateName?: string // Optional template name for categorization
  metadata?: Record<string, any> // Optional metadata
}

export interface SMSResult {
  success: boolean
  notificationId: string
  providerId?: string
  error?: string
}

/**
 * Send an SMS via Twilio and log to database
 */
export async function sendSMS(options: SendSMSOptions): Promise<SMSResult> {
  const { to, message, guestId, eventId, templateName, metadata } = options

  // Validate phone number format (basic validation)
  if (!to.startsWith('+')) {
    logger.warn({ guestId, to }, 'Invalid phone number format (missing + prefix)')
    throw new Error('Phone number must be in international format (e.g., +33612345678)')
  }

  // Create notification record in database (PENDING state)
  const notification = await prisma.notification.create({
    data: {
      guestId,
      eventId,
      type: 'SMS' as NotificationType,
      message,
      status: 'PENDING' as NotificationStatus,
      provider: 'twilio',
      templateName,
      metadata: metadata || {},
    },
  })

  logger.info(
    {
      notificationId: notification.id,
      guestId,
      eventId,
      templateName,
    },
    'SMS notification created'
  )

  try {
    // Get Twilio client
    const client = getTwilioClient()

    // Send SMS via Twilio
    const twilioMessage = await client.messages.create({
      body: message,
      from: TWILIO_PHONE_NUMBER,
      to: to,
    })

    logger.info(
      {
        notificationId: notification.id,
        twilioSid: twilioMessage.sid,
        status: twilioMessage.status,
      },
      'SMS sent via Twilio'
    )

    // Update notification record with success
    await prisma.notification.update({
      where: { id: notification.id },
      data: {
        status: 'SENT' as NotificationStatus,
        sentAt: new Date(),
        providerId: twilioMessage.sid,
        providerResponse: twilioMessage as any,
      },
    })

    return {
      success: true,
      notificationId: notification.id,
      providerId: twilioMessage.sid,
    }
  } catch (error) {
    // Log error
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    logger.error(
      {
        notificationId: notification.id,
        guestId,
        error: errorMessage,
      },
      'Failed to send SMS via Twilio'
    )

    // Update notification record with failure
    await prisma.notification.update({
      where: { id: notification.id },
      data: {
        status: 'FAILED' as NotificationStatus,
        error: errorMessage,
      },
    })

    return {
      success: false,
      notificationId: notification.id,
      error: errorMessage,
    }
  }
}

/**
 * Send SMS to multiple recipients (bulk send)
 */
export async function sendBulkSMS(
  recipients: Array<{
    guestId: string
    phone: string
  }>,
  eventId: string,
  message: string,
  templateName?: string
): Promise<{
  total: number
  sent: number
  failed: number
  results: SMSResult[]
}> {
  logger.info(
    {
      eventId,
      recipientCount: recipients.length,
      templateName,
    },
    'Starting bulk SMS send'
  )

  const results: SMSResult[] = []
  let sent = 0
  let failed = 0

  // Send SMS to each recipient sequentially (to avoid rate limits)
  for (const recipient of recipients) {
    try {
      const result = await sendSMS({
        to: recipient.phone,
        message,
        guestId: recipient.guestId,
        eventId,
        templateName,
      })

      results.push(result)

      if (result.success) {
        sent++
      } else {
        failed++
      }

      // Add small delay between sends to respect rate limits (adjust as needed)
      await new Promise((resolve) => setTimeout(resolve, 100))
    } catch (error) {
      logger.error(
        {
          guestId: recipient.guestId,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        'Failed to send SMS to recipient'
      )

      results.push({
        success: false,
        notificationId: '',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      failed++
    }
  }

  logger.info(
    {
      eventId,
      total: recipients.length,
      sent,
      failed,
    },
    'Bulk SMS send completed'
  )

  return {
    total: recipients.length,
    sent,
    failed,
    results,
  }
}

/**
 * Get SMS notification history for a guest
 */
export async function getGuestNotifications(guestId: string) {
  return prisma.notification.findMany({
    where: {
      guestId,
      type: 'SMS',
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
}

/**
 * Get SMS notification history for an event
 */
export async function getEventNotifications(eventId: string) {
  return prisma.notification.findMany({
    where: {
      eventId,
      type: 'SMS',
    },
    include: {
      guest: {
        select: {
          firstName: true,
          lastName: true,
          phone: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
}

/**
 * Check if Twilio is configured
 */
export function isTwilioConfigured(): boolean {
  return !!(TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_PHONE_NUMBER)
}

/**
 * Validate phone number format (basic)
 */
export function isValidPhoneNumber(phone: string): boolean {
  // Basic validation: must start with + and contain only digits and + - () spaces
  const phoneRegex = /^\+[1-9]\d{1,14}$/
  return phoneRegex.test(phone.replace(/[\s\-()]/g, ''))
}

/**
 * Format phone number to E.164 format (+33612345678)
 */
export function formatPhoneNumber(phone: string, defaultCountryCode: string = '+33'): string {
  // Remove all non-digit characters except +
  let cleaned = phone.replace(/[^\d+]/g, '')

  // If doesn't start with +, add default country code
  if (!cleaned.startsWith('+')) {
    // Remove leading 0 if present (French format)
    if (cleaned.startsWith('0')) {
      cleaned = cleaned.substring(1)
    }
    cleaned = defaultCountryCode + cleaned
  }

  return cleaned
}
