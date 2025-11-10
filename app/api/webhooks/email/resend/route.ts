/**
 * Webhook endpoint for Resend email events
 * https://resend.com/docs/dashboard/webhooks/event-types
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

type ResendEvent = {
  type: 'email.sent' | 'email.delivered' | 'email.delivery_delayed' | 'email.complained' | 'email.bounced' | 'email.opened' | 'email.clicked'
  created_at: string
  data: {
    created_at: string
    email_id: string
    from: string
    to: string[]
    subject: string
    click?: {
      ipAddress: string
      link: string
      timestamp: string
      userAgent: string
    }
  }
}

/**
 * Verify Resend webhook signature
 */
function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const hmac = crypto.createHmac('sha256', secret)
  hmac.update(payload)
  const expectedSignature = hmac.digest('hex')
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const event: ResendEvent = JSON.parse(body)

    // REQUIRED: Verify webhook signature for security
    const signature = request.headers.get('svix-signature') || request.headers.get('resend-signature')
    const webhookSecret = process.env.RESEND_WEBHOOK_SECRET

    // Webhook verification is mandatory in production
    if (process.env.NODE_ENV === 'production' && !webhookSecret) {
      console.error('RESEND_WEBHOOK_SECRET must be configured in production')
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
    }

    // Verify signature if configured
    if (webhookSecret) {
      if (!signature) {
        return NextResponse.json({ error: 'Missing signature header' }, { status: 401 })
      }
      const isValid = verifyWebhookSignature(body, signature, webhookSecret)
      if (!isValid) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    } else if (process.env.NODE_ENV !== 'development') {
      // In non-dev environments without key, log warning but allow (for staging)
      console.warn('⚠️  Resend webhook signature verification is disabled - configure RESEND_WEBHOOK_SECRET')
    }

    const { type, data } = event
    const emailId = data.email_id
    const recipient = data.to[0]

    // Find the email log by provider ID
    const emailLog = await prisma.emailLog.findFirst({
      where: {
        providerId: emailId,
        guest: {
          email: recipient,
        },
      },
      include: {
        guest: true,
      },
    })

    if (!emailLog) {
      console.warn(`Email log not found for Resend email ${emailId}`)
      return NextResponse.json({ received: true })
    }

    // Update email log based on event type
    const updates: any = {}

    switch (type) {
      case 'email.sent':
        updates.status = 'SENT'
        updates.sentAt = new Date(data.created_at)
        break

      case 'email.delivered':
        updates.status = 'DELIVERED'
        if (!updates.sentAt) {
          updates.sentAt = new Date(data.created_at)
        }
        break

      case 'email.opened':
        updates.status = 'OPENED'
        updates.openedAt = new Date(data.created_at)

        // Update EmailTracking
        await prisma.emailTracking.updateMany({
          where: {
            guestId: emailLog.guestId,
            eventId: emailLog.eventId,
          },
          data: {
            status: 'opened',
            openedAt: new Date(data.created_at),
          },
        })
        break

      case 'email.clicked':
        updates.status = 'CLICKED'
        updates.clickedAt = new Date(data.created_at)

        // Update EmailTracking
        await prisma.emailTracking.updateMany({
          where: {
            guestId: emailLog.guestId,
            eventId: emailLog.eventId,
          },
          data: {
            status: 'clicked',
            clickedAt: new Date(data.created_at),
          },
        })
        break

      case 'email.bounced':
        updates.status = 'BOUNCED'
        updates.bouncedAt = new Date(data.created_at)
        updates.error = 'Email bounced'

        // Update guest status
        await prisma.guest.update({
          where: { id: emailLog.guestId },
          data: { status: 'BOUNCED' },
        })
        break

      case 'email.complained':
        updates.status = 'FAILED'
        updates.error = 'Spam complaint'
        break

      case 'email.delivery_delayed':
        // Just log, don't change status
        console.log(`Email delivery delayed for ${emailId}`)
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
      where: { provider: 'RESEND', isActive: true },
    })

    if (integration) {
      await prisma.emailIntegration.update({
        where: { id: integration.id },
        data: { lastUsedAt: new Date() },
      })
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Resend webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
