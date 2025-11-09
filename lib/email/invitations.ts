import { Event, Guest, EmailType } from '@prisma/client'
import { sendEmail, sendBatchEmails } from './resend'
import { getRenderedTemplate } from './templates'
import { prisma } from '@/lib/prisma'

/**
 * Send invitation email to a single guest
 */
export async function sendInvitation(
  event: Event,
  guest: Guest,
  emailType: EmailType = 'INVITE'
) {
  try {
    // Get rendered template
    const { subject, html, text } = await getRenderedTemplate(
      emailType,
      event,
      guest
    )

    // Send email
    const result = await sendEmail({
      to: guest.email,
      subject,
      html,
      text
    })

    if (result.success) {
      // Update guest record
      await prisma.guest.update({
        where: { id: guest.id },
        data: {
          invitationSentAt: new Date(),
          invitationEmailId: result.messageId || undefined
        }
      })
    }

    return result
  } catch (error) {
    console.error('Error sending invitation:', error)
    return {
      success: false,
      messageId: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Send invitations to multiple guests
 */
export async function sendBulkInvitations(
  eventId: string,
  guestIds?: string[],
  emailType: EmailType = 'INVITE'
) {
  try {
    // Get event
    const event = await prisma.event.findUnique({
      where: { id: eventId }
    })

    if (!event) {
      throw new Error('Event not found')
    }

    // Get guests
    const guests = await prisma.guest.findMany({
      where: {
        eventId,
        ...(guestIds ? { id: { in: guestIds } } : {}),
        // Only send to guests who haven't received an invitation yet
        invitationSentAt: null
      }
    })

    if (guests.length === 0) {
      return {
        success: true,
        total: 0,
        sent: 0,
        failed: 0,
        message: 'No guests to send invitations to'
      }
    }

    // Send emails in batch
    const results = await Promise.allSettled(
      guests.map(guest => sendInvitation(event, guest, emailType))
    )

    const sent = results.filter(
      r => r.status === 'fulfilled' && r.value.success
    ).length
    const failed = results.length - sent

    return {
      success: true,
      total: results.length,
      sent,
      failed,
      details: results
    }
  } catch (error) {
    console.error('Error sending bulk invitations:', error)
    return {
      success: false,
      total: 0,
      sent: 0,
      failed: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Send reminder email to guests who haven't responded
 */
export async function sendReminders(eventId: string) {
  const event = await prisma.event.findUnique({
    where: { id: eventId }
  })

  if (!event) {
    throw new Error('Event not found')
  }

  // Get guests who received invitation but haven't responded
  const guests = await prisma.guest.findMany({
    where: {
      eventId,
      invitationSentAt: { not: null },
      rsvpStatus: 'PENDING'
    }
  })

  const results = await Promise.allSettled(
    guests.map(guest => sendInvitation(event, guest, 'REMINDER'))
  )

  const sent = results.filter(
    r => r.status === 'fulfilled' && r.value.success
  ).length

  return {
    total: results.length,
    sent,
    failed: results.length - sent
  }
}

/**
 * Send confirmation email after RSVP
 */
export async function sendConfirmation(
  eventId: string,
  guestId: string
) {
  const event = await prisma.event.findUnique({
    where: { id: eventId }
  })

  const guest = await prisma.guest.findUnique({
    where: { id: guestId }
  })

  if (!event || !guest) {
    throw new Error('Event or guest not found')
  }

  return sendInvitation(event, guest, 'CONFIRMATION')
}
