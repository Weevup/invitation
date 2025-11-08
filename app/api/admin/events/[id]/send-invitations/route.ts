import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail, getInvitationEmailTemplate, getReminderEmailTemplate } from '@/lib/email'
import { formatDateTime } from '@/lib/utils'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params
    const body = await request.json()
    const { type = 'INVITE', guestIds } = body // type: INVITE or REMINDER

    // Fetch event
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        guests: {
          include: {
            rsvp: true,
          },
        },
      },
    })

    if (!event) {
      return NextResponse.json(
        { error: 'Événement introuvable' },
        { status: 404 }
      )
    }

    // Filter guests to send emails to
    let targetGuests = event.guests

    // If specific guest IDs provided, filter by them
    if (guestIds && Array.isArray(guestIds) && guestIds.length > 0) {
      targetGuests = event.guests.filter((g: typeof event.guests[0]) => guestIds.includes(g.id))
    }

    // For reminders, only send to guests who haven't responded
    if (type === 'REMINDER') {
      targetGuests = targetGuests.filter((g: typeof targetGuests[0]) => !g.rsvp || g.rsvp.attending === null)
    }

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const eventDate = formatDateTime(event.startsAt)
    const eventVenue = event.venueName && event.city
      ? `${event.venueName}, ${event.city}`
      : event.venueName || event.city || 'À préciser'
    const rsvpDeadline = event.rsvpDeadline
      ? formatDateTime(event.rsvpDeadline)
      : undefined

    // Send emails
    for (const guest of targetGuests) {
      try {
        const invitationUrl = `${baseUrl}/guest/${guest.token}`

        let emailHtml: string
        let subject: string

        if (type === 'REMINDER') {
          emailHtml = getReminderEmailTemplate({
            guestName: guest.firstName,
            eventName: event.name,
            eventDate,
            eventVenue,
            invitationUrl,
            rsvpDeadline,
          })
          subject = `⏰ Rappel : ${event.name}`
        } else {
          emailHtml = getInvitationEmailTemplate({
            guestName: guest.firstName,
            eventName: event.name,
            eventDate,
            eventVenue,
            invitationUrl,
          })
          subject = `✉️ Invitation : ${event.name}`
        }

        const result = await sendEmail({
          to: guest.email,
          subject,
          html: emailHtml,
          eventId: event.id,
          guestId: guest.id,
          type: type === 'REMINDER' ? 'REMINDER' : 'INVITE',
        })

        if (result.success) {
          results.success++

          // Update guest status
          await prisma.guest.update({
            where: { id: guest.id },
            data: {
              status: type === 'REMINDER' ? 'INVITED' : 'INVITED',
            },
          })
        } else {
          results.failed++
          results.errors.push(`${guest.email}: ${result.error}`)
        }
      } catch (error) {
        results.failed++
        results.errors.push(
          `${guest.email}: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
        )
      }
    }

    return NextResponse.json({
      success: true,
      results: {
        total: targetGuests.length,
        success: results.success,
        failed: results.failed,
        errors: results.errors,
      },
    })
  } catch (error) {
    console.error('Error sending invitations:', error)
    return NextResponse.json(
      {
        error: 'Erreur lors de l\'envoi des invitations',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
