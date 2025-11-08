/**
 * Webhook endpoint for Mailgun email events
 * https://documentation.mailgun.com/en/latest/api-events.html
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

type MailgunEvent = {
  signature: {
    timestamp: string
    token: string
    signature: string
  }
  'event-data': {
    event: 'accepted' | 'delivered' | 'failed' | 'opened' | 'clicked' | 'unsubscribed' | 'complained'
    timestamp: number
    message: {
      headers: {
        'message-id': string
      }
    }
    recipient: string
    'client-info'?: {
      'client-os': string
      'device-type': string
      'client-name': string
      'user-agent': string
    }
    url?: string // For click events
    'delivery-status'?: {
      message: string
      code: number
    }
  }
}

/**
 * Verify Mailgun webhook signature
 * https://documentation.mailgun.com/en/latest/user_manual.html#webhooks
 */
function verifyMailgunSignature(
  timestamp: string,
  token: string,
  signature: string,
  signingKey: string
): boolean {
  const encodedToken = crypto
    .createHmac('sha256', signingKey)
    .update(timestamp.concat(token))
    .digest('hex')

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(encodedToken)
  )
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as MailgunEvent

    // Verify webhook signature
    const webhookSigningKey = process.env.MAILGUN_WEBHOOK_SIGNING_KEY

    if (webhookSigningKey) {
      const { timestamp, token, signature } = body.signature
      const isValid = verifyMailgunSignature(timestamp, token, signature, webhookSigningKey)

      if (!isValid) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    }

    const eventData = body['event-data']
    const messageId = eventData.message.headers['message-id']
    const recipient = eventData.recipient
    const eventType = eventData.event

    // Find the email log by provider ID
    const emailLog = await prisma.emailLog.findFirst({
      where: {
        providerId: messageId,
        guest: {
          email: recipient,
        },
      },
      include: {
        guest: true,
      },
    })

    if (!emailLog) {
      console.warn(`Email log not found for Mailgun message ${messageId}`)
      return NextResponse.json({ received: true })
    }

    // Update email log based on event type
    const updates: any = {}

    switch (eventType) {
      case 'accepted':
        updates.status = 'SENT'
        updates.sentAt = new Date(eventData.timestamp * 1000)
        break

      case 'delivered':
        updates.status = 'DELIVERED'
        if (!updates.sentAt) {
          updates.sentAt = new Date(eventData.timestamp * 1000)
        }
        break

      case 'opened':
        updates.status = 'OPENED'
        updates.openedAt = new Date(eventData.timestamp * 1000)

        // Update EmailTracking
        await prisma.emailTracking.updateMany({
          where: {
            guestId: emailLog.guestId,
            eventId: emailLog.eventId,
          },
          data: {
            status: 'opened',
            openedAt: new Date(eventData.timestamp * 1000),
          },
        })
        break

      case 'clicked':
        updates.status = 'CLICKED'
        updates.clickedAt = new Date(eventData.timestamp * 1000)

        // Update EmailTracking
        await prisma.emailTracking.updateMany({
          where: {
            guestId: emailLog.guestId,
            eventId: emailLog.eventId,
          },
          data: {
            status: 'clicked',
            clickedAt: new Date(eventData.timestamp * 1000),
          },
        })
        break

      case 'failed':
        updates.status = 'BOUNCED'
        updates.bouncedAt = new Date(eventData.timestamp * 1000)

        if (eventData['delivery-status']) {
          updates.error = `Failed: ${eventData['delivery-status'].message} (${eventData['delivery-status'].code})`
        } else {
          updates.error = 'Email failed'
        }

        // Update guest status
        await prisma.guest.update({
          where: { id: emailLog.guestId },
          data: { status: 'BOUNCED' },
        })
        break

      case 'complained':
        updates.status = 'FAILED'
        updates.error = 'Spam complaint'
        break

      case 'unsubscribed':
        // Could track unsubscribes separately
        console.log(`Unsubscribe for ${recipient}`)
        break
    }

    // Apply updates
    if (Object.keys(updates).length > 0) {
      await prisma.emailLog.update({
        where: { id: emailLog.id },
        data: updates,
      })
    }

    // Update integration last used timestamp
    const integration = await prisma.emailIntegration.findFirst({
      where: { provider: 'MAILGUN', isActive: true },
    })

    if (integration) {
      await prisma.emailIntegration.update({
        where: { id: integration.id },
        data: { lastUsedAt: new Date() },
      })
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Mailgun webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
