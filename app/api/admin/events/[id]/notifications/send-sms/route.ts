import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-utils'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { sendBulkSMS, isTwilioConfigured, formatPhoneNumber } from '@/lib/sms-service'

interface SendSMSBody {
  guestIds: string[] // Array of guest IDs to send SMS to
  message: string // SMS message content
  templateName?: string // Optional template name
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate admin
    await requireAdmin()

    const { id: eventId } = await params

    // Check if Twilio is configured
    if (!isTwilioConfigured()) {
      return NextResponse.json(
        {
          error: 'SMS service not configured',
          message: 'Twilio credentials are missing. Please configure TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER environment variables.',
        },
        { status: 503 }
      )
    }

    // Parse request body
    const body: SendSMSBody = await req.json()
    const { guestIds, message, templateName } = body

    // Validate inputs
    if (!guestIds || !Array.isArray(guestIds) || guestIds.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request', message: 'guestIds must be a non-empty array' },
        { status: 400 }
      )
    }

    if (!message || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Invalid request', message: 'message is required' },
        { status: 400 }
      )
    }

    if (message.length > 1600) {
      return NextResponse.json(
        { error: 'Invalid request', message: 'Message too long (max 1600 characters)' },
        { status: 400 }
      )
    }

    // Verify event exists and admin has access
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        name: true,
        adminId: true,
      },
    })

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    logger.info(
      {
        eventId,
        eventName: event.name,
        guestCount: guestIds.length,
        messageLength: message.length,
      },
      'Starting SMS send for event'
    )

    // Fetch guests with phone numbers
    const guests = await prisma.guest.findMany({
      where: {
        id: { in: guestIds },
        eventId,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phone: true,
        phoneNumber: true, // Legacy field
      },
    })

    if (guests.length === 0) {
      return NextResponse.json(
        { error: 'No guests found' },
        { status: 404 }
      )
    }

    // Filter guests with valid phone numbers and format them
    const recipients = guests
      .map((guest) => {
        // Use 'phone' field first, fallback to 'phoneNumber'
        const rawPhone = guest.phone || guest.phoneNumber
        if (!rawPhone) {
          logger.warn(
            { guestId: guest.id, name: `${guest.firstName} ${guest.lastName}` },
            'Guest has no phone number'
          )
          return null
        }

        try {
          const formattedPhone = formatPhoneNumber(rawPhone)
          return {
            guestId: guest.id,
            phone: formattedPhone,
            name: `${guest.firstName} ${guest.lastName}`,
          }
        } catch (error) {
          logger.warn(
            {
              guestId: guest.id,
              name: `${guest.firstName} ${guest.lastName}`,
              phone: rawPhone,
            },
            'Invalid phone number format'
          )
          return null
        }
      })
      .filter((r): r is NonNullable<typeof r> => r !== null)

    if (recipients.length === 0) {
      return NextResponse.json(
        {
          error: 'No valid phone numbers',
          message: 'None of the selected guests have valid phone numbers',
        },
        { status: 400 }
      )
    }

    logger.info(
      {
        eventId,
        totalGuests: guests.length,
        validRecipients: recipients.length,
      },
      'Filtered recipients with valid phone numbers'
    )

    // Send SMS to all recipients
    const result = await sendBulkSMS(recipients, eventId, message, templateName)

    logger.info(
      {
        eventId,
        total: result.total,
        sent: result.sent,
        failed: result.failed,
      },
      'Bulk SMS send completed'
    )

    return NextResponse.json({
      success: true,
      total: result.total,
      sent: result.sent,
      failed: result.failed,
      message: `SMS sent to ${result.sent} guests${result.failed > 0 ? `, ${result.failed} failed` : ''}`,
    })
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      'Error sending SMS'
    )

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Failed to send SMS',
      },
      { status: 500 }
    )
  }
}

// GET endpoint to check SMS service status and get notification history
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate admin
    await requireAdmin()

    const { id: eventId } = await params

    // Verify event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        name: true,
      },
    })

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    // Get notification history
    const notifications = await prisma.notification.findMany({
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
      take: 100, // Limit to last 100 notifications
    })

    // Calculate stats
    const stats = {
      total: notifications.length,
      sent: notifications.filter((n) => n.status === 'SENT' || n.status === 'DELIVERED').length,
      failed: notifications.filter((n) => n.status === 'FAILED').length,
      pending: notifications.filter((n) => n.status === 'PENDING' || n.status === 'SENDING').length,
    }

    return NextResponse.json({
      configured: isTwilioConfigured(),
      stats,
      notifications: notifications.map((n) => ({
        id: n.id,
        guest: {
          name: `${n.guest.firstName} ${n.guest.lastName}`,
          phone: n.guest.phone,
        },
        message: n.message,
        status: n.status,
        templateName: n.templateName,
        sentAt: n.sentAt,
        deliveredAt: n.deliveredAt,
        error: n.error,
        createdAt: n.createdAt,
      })),
    })
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      'Error fetching SMS notifications'
    )

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Failed to fetch notifications',
      },
      { status: 500 }
    )
  }
}
