/**
 * Webhook endpoint for SendGrid email events
 * https://docs.sendgrid.com/for-developers/tracking-events/event
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import { createLogger } from '@/lib/logger'

const webhookLogger = createLogger({ module: 'webhook', provider: 'sendgrid' })

// SendGrid event types
type SendGridEvent = {
  email: string
  timestamp: number
  'smtp-id'?: string
  event: 'processed' | 'delivered' | 'open' | 'click' | 'bounce' | 'dropped' | 'deferred' | 'spam_report' | 'unsubscribe'
  sg_message_id?: string
  url?: string // For click events
  sg_event_id: string
}

/**
 * Verify SendGrid webhook signature
 */
function verifySignature(
  payload: string,
  signature: string,
  timestamp: string,
  publicKey: string
): boolean {
  try {
    const verifier = crypto.createVerify('RSA-SHA256')
    const data = timestamp + payload
    verifier.update(data)
    return verifier.verify(publicKey, signature, 'base64')
  } catch (error) {
    webhookLogger.error({ error }, 'Signature verification error')
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const events: SendGridEvent[] = JSON.parse(body)

    // REQUIRED: Verify webhook signature for security
    const signature = request.headers.get('x-twilio-email-event-webhook-signature')
    const timestamp = request.headers.get('x-twilio-email-event-webhook-timestamp')
    const webhookPublicKey = process.env.SENDGRID_WEBHOOK_PUBLIC_KEY

    // Webhook verification is mandatory in production
    if (process.env.NODE_ENV === 'production' && !webhookPublicKey) {
      webhookLogger.error({ env: process.env.NODE_ENV }, 'SENDGRID_WEBHOOK_PUBLIC_KEY must be configured in production')
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
    }

    // Verify signature if configured
    if (webhookPublicKey) {
      if (!signature || !timestamp) {
        return NextResponse.json({ error: 'Missing signature headers' }, { status: 401 })
      }
      if (!verifySignature(body, signature, timestamp, webhookPublicKey)) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    } else if (process.env.NODE_ENV !== 'development') {
      // In non-dev environments without key, log warning but allow (for staging)
      webhookLogger.warn({ env: process.env.NODE_ENV }, 'SendGrid webhook signature verification is disabled - configure SENDGRID_WEBHOOK_PUBLIC_KEY')
    }

    // Process each event
    for (const event of events) {
      const { email: guestEmail, event: eventType, sg_message_id, url } = event

      // Find the email log by provider ID (sg_message_id)
      const emailLog = await prisma.emailLog.findFirst({
        where: {
          providerId: sg_message_id,
          guest: {
            email: guestEmail,
          },
        },
        include: {
          guest: true,
        },
      })

      if (!emailLog) {
        webhookLogger.warn({ messageId: sg_message_id, guestEmail, eventType }, 'Email log not found for SendGrid message')
        continue
      }

      // Update email log based on event type
      const updates: any = {}

      switch (eventType) {
        case 'delivered':
          updates.status = 'DELIVERED'
          updates.sentAt = new Date(event.timestamp * 1000)
          break

        case 'open':
          updates.status = 'OPENED'
          updates.openedAt = new Date(event.timestamp * 1000)

          // Also update EmailTracking if exists
          await prisma.emailTracking.updateMany({
            where: {
              guestId: emailLog.guestId,
              eventId: emailLog.eventId,
            },
            data: {
              status: 'opened',
              openedAt: new Date(event.timestamp * 1000),
            },
          })
          break

        case 'click':
          updates.status = 'CLICKED'
          updates.clickedAt = new Date(event.timestamp * 1000)

          // Update EmailTracking
          await prisma.emailTracking.updateMany({
            where: {
              guestId: emailLog.guestId,
              eventId: emailLog.eventId,
            },
            data: {
              status: 'clicked',
              clickedAt: new Date(event.timestamp * 1000),
            },
          })
          break

        case 'bounce':
        case 'dropped':
          updates.status = 'BOUNCED'
          updates.bouncedAt = new Date(event.timestamp * 1000)
          updates.error = `Email ${eventType}`

          // Update guest status
          await prisma.guest.update({
            where: { id: emailLog.guestId },
            data: { status: 'BOUNCED' },
          })
          break

        case 'spam_report':
          updates.status = 'FAILED'
          updates.error = 'Marked as spam'
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
        where: { provider: 'SENDGRID', isActive: true },
      })

      if (integration) {
        await prisma.emailIntegration.update({
          where: { id: integration.id },
          data: { lastUsedAt: new Date() },
        })
      }
    }

    return NextResponse.json({ received: true, processed: events.length })
  } catch (error) {
    webhookLogger.error({ error, stack: error instanceof Error ? error.stack : undefined }, 'SendGrid webhook processing failed')
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
