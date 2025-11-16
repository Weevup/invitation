import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

/**
 * Twilio SMS Status Webhook
 * This endpoint receives delivery status updates from Twilio
 *
 * Configure in Twilio Console:
 * Messaging > Settings > Webhook for Message Status
 * URL: https://yourdomain.com/api/webhooks/twilio/sms-status
 * Method: POST
 *
 * Twilio sends these statuses:
 * - queued: Message is queued
 * - sending: Message is being sent
 * - sent: Message has been sent
 * - delivered: Message delivered to recipient
 * - undelivered: Message failed to deliver
 * - failed: Message failed
 */
export async function POST(req: NextRequest) {
  try {
    // Parse form data (Twilio sends application/x-www-form-urlencoded)
    const formData = await req.formData()

    const messageSid = formData.get('MessageSid') as string
    const messageStatus = formData.get('MessageStatus') as string
    const errorCode = formData.get('ErrorCode') as string | null
    const errorMessage = formData.get('ErrorMessage') as string | null

    if (!messageSid || !messageStatus) {
      logger.warn('Invalid webhook payload from Twilio')
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    logger.info(
      {
        messageSid,
        messageStatus,
        errorCode,
      },
      'Received Twilio SMS status webhook'
    )

    // Find notification by provider ID (Twilio Message SID)
    const notification = await prisma.notification.findFirst({
      where: {
        providerId: messageSid,
        provider: 'twilio',
      },
    })

    if (!notification) {
      logger.warn(
        {
          messageSid,
        },
        'Notification not found for Twilio Message SID'
      )

      // Return 200 to prevent Twilio from retrying
      return NextResponse.json({ message: 'Notification not found' })
    }

    // Map Twilio status to our status
    let status: string = notification.status
    let deliveredAt: Date | null = null

    switch (messageStatus.toLowerCase()) {
      case 'queued':
      case 'sending':
        status = 'SENDING'
        break

      case 'sent':
        status = 'SENT'
        break

      case 'delivered':
        status = 'DELIVERED'
        deliveredAt = new Date()
        break

      case 'undelivered':
      case 'failed':
        status = 'FAILED'
        break

      default:
        logger.warn(
          {
            messageSid,
            messageStatus,
          },
          'Unknown Twilio status'
        )
    }

    // Update notification
    await prisma.notification.update({
      where: { id: notification.id },
      data: {
        status: status as any,
        deliveredAt,
        error: errorMessage || undefined,
        providerResponse: {
          ...((notification.providerResponse as any) || {}),
          statusCallback: {
            status: messageStatus,
            errorCode,
            errorMessage,
            timestamp: new Date().toISOString(),
          },
        },
      },
    })

    logger.info(
      {
        notificationId: notification.id,
        oldStatus: notification.status,
        newStatus: status,
      },
      'Updated notification status from Twilio webhook'
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      'Error processing Twilio webhook'
    )

    // Return 200 to prevent Twilio from retrying
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 200 }
    )
  }
}

// Handle GET requests (for webhook verification)
export async function GET(req: NextRequest) {
  return NextResponse.json({
    message: 'Twilio SMS Status Webhook Endpoint',
    status: 'ready',
  })
}
