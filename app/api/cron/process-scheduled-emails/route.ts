import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email-service'
import {
  generateSaveTheDateEmail,
  generateInvitationEmail,
  generateReminderEmail,
} from '@/lib/email-templates'

/**
 * Vercel Cron Job - Process Scheduled Emails
 * Runs every 5 minutes to send scheduled emails
 *
 * Configuration: vercel.json
 * Authentication: CRON_SECRET env variable
 */
export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification Vercel Cron
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (!cronSecret) {
      console.error('CRON_SECRET not configured')
      return NextResponse.json(
        { error: 'Cron not configured' },
        { status: 500 }
      )
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      console.error('Unauthorized cron attempt')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const now = new Date()
    console.log(`[CRON] Processing scheduled emails at ${now.toISOString()}`)

    // Récupérer les emails à envoyer
    const emailsToSend = await prisma.scheduledEmail.findMany({
      where: {
        status: 'PENDING',
        scheduledFor: {
          lte: now, // Tous les emails dont la date est passée
        },
      },
      include: {
        event: true,
      },
      take: 50, // Limiter à 50 emails par exécution
    })

    console.log(`[CRON] Found ${emailsToSend.length} emails to send`)

    if (emailsToSend.length === 0) {
      return NextResponse.json({
        success: true,
        processed: 0,
        message: 'No emails to process',
      })
    }

    // Récupérer l'intégration email
    const emailIntegration = await prisma.emailIntegration.findFirst({
      where: {
        isPrimary: true,
        isActive: true,
      },
    })

    if (!emailIntegration) {
      console.error('[CRON] No email integration configured')
      return NextResponse.json({
        success: false,
        error: 'No email integration configured',
      })
    }

    const results = []
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://invitation-black-five.vercel.app'

    // Traiter chaque email programmé
    for (const scheduled of emailsToSend) {
      try {
        console.log(`[CRON] Processing scheduled email ${scheduled.id}`)

        // Marquer comme PROCESSING
        await prisma.scheduledEmail.update({
          where: { id: scheduled.id },
          data: { status: 'PROCESSING' },
        })

        // Récupérer les invités
        const guests = await prisma.guest.findMany({
          where: {
            id: { in: scheduled.guestIds },
          },
        })

        console.log(`[CRON] Sending to ${guests.length} guests`)

        let sentCount = 0
        let failedCount = 0

        // Envoyer à chaque invité
        for (const guest of guests) {
          try {
            let html = ''

            // Générer le HTML selon le type d'email
            switch (scheduled.type) {
              case 'SAVE_THE_DATE':
                html = generateSaveTheDateEmail({
                  eventName: scheduled.event.name,
                  tagline: 'Save the Date',
                  dateAnnouncement: new Date(scheduled.event.startsAt).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  }),
                  locationHint: scheduled.event.venueName || '',
                  teaserMessage: scheduled.event.description || '',
                  primaryColor: '#004645',
                  secondaryColor: '#009197',
                  accentColor: '#FF4713',
                  backgroundColor: '#FFFFFF',
                  ctaText: 'En savoir plus',
                  ctaLink: `${baseUrl}/event/${scheduled.event.slug}`,
                  footerMessage: 'À bientôt !',
                  guestName: `${guest.firstName} ${guest.lastName}`,
                })
                break

              case 'INVITE':
                html = generateInvitationEmail({
                  eventName: scheduled.event.name,
                  welcomeMessage: `Bonjour ${guest.firstName},`,
                  description: scheduled.event.description || '',
                  date: new Date(scheduled.event.startsAt).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  }),
                  time: new Date(scheduled.event.startsAt).toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  }),
                  location: scheduled.event.venueName || '',
                  address: scheduled.event.address || '',
                  primaryColor: '#004645',
                  secondaryColor: '#009197',
                  accentColor: '#FF4713',
                  rsvpLink: `${baseUrl}/guest/${guest.token}`,
                  guestName: `${guest.firstName} ${guest.lastName}`,
                })
                break

              case 'REMINDER':
                html = generateReminderEmail({
                  eventName: scheduled.event.name,
                  date: new Date(scheduled.event.startsAt).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  }),
                  time: new Date(scheduled.event.startsAt).toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  }),
                  location: scheduled.event.venueName || '',
                  address: scheduled.event.address || '',
                  guestName: `${guest.firstName} ${guest.lastName}`,
                  qrCodeUrl: `${baseUrl}/api/qr/${guest.token}`,
                  primaryColor: '#004645',
                })
                break

              default:
                throw new Error(`Unknown email type: ${scheduled.type}`)
            }

            // Envoyer l'email
            const result = await sendEmail(
              {
                to: guest.email,
                from: emailIntegration.fromEmail ?? undefined,
                fromName: emailIntegration.fromName ?? undefined,
                subject: `${scheduled.event.name} - ${scheduled.type === 'SAVE_THE_DATE' ? 'Save the Date' : scheduled.type === 'INVITE' ? 'Invitation' : 'Rappel'}`,
                html,
              },
              emailIntegration
            )

            if (result.success) {
              sentCount++

              // Logger dans EmailLog
              await prisma.emailLog.create({
                data: {
                  eventId: scheduled.event.id,
                  guestId: guest.id,
                  type: scheduled.type,
                  status: 'SENT',
                  sentAt: new Date(),
                },
              })
            } else {
              failedCount++
              console.error(`[CRON] Failed to send to ${guest.email}:`, result.error)
            }
          } catch (guestError) {
            failedCount++
            console.error(`[CRON] Error sending to guest ${guest.id}:`, guestError)
          }
        }

        // Marquer comme SENT ou FAILED
        await prisma.scheduledEmail.update({
          where: { id: scheduled.id },
          data: {
            status: failedCount > 0 ? 'FAILED' : 'SENT',
            sentAt: new Date(),
            errorMessage: failedCount > 0 ? `Failed to send to ${failedCount} guests` : null,
          },
        })

        results.push({
          id: scheduled.id,
          success: failedCount === 0,
          sentCount,
          failedCount,
        })

        console.log(`[CRON] Completed ${scheduled.id}: ${sentCount} sent, ${failedCount} failed`)
      } catch (error) {
        console.error(`[CRON] Error processing scheduled email ${scheduled.id}:`, error)

        // Marquer comme FAILED
        await prisma.scheduledEmail.update({
          where: { id: scheduled.id },
          data: {
            status: 'FAILED',
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
          },
        })

        results.push({
          id: scheduled.id,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    console.log(`[CRON] Completed processing ${results.length} scheduled emails`)

    return NextResponse.json({
      success: true,
      processed: results.length,
      results,
    })
  } catch (error) {
    console.error('[CRON] Fatal error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
