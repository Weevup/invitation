import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { sendSMS } from '@/lib/sms-service'
import {
  renderTemplate,
  buildTemplateVariables,
  incrementTemplateUsage,
} from '@/lib/sms-template-service'
import type { ScheduledSMS, SMSCampaign } from '@prisma/client'

/**
 * Create a scheduled SMS for a specific guest
 */
export async function createScheduledSMS(data: {
  guestId: string
  eventId: string
  campaignId?: string
  message: string
  templateName?: string
  scheduledFor: Date
  maxRetries?: number
}) {
  const scheduledSMS = await prisma.scheduledSMS.create({
    data: {
      guestId: data.guestId,
      eventId: data.eventId,
      campaignId: data.campaignId,
      message: data.message,
      templateName: data.templateName,
      scheduledFor: data.scheduledFor,
      maxRetries: data.maxRetries || 0,
      status: 'PENDING',
    },
  })

  logger.info(
    {
      scheduledSMSId: scheduledSMS.id,
      guestId: data.guestId,
      scheduledFor: data.scheduledFor,
    },
    'Scheduled SMS created'
  )

  return scheduledSMS
}

/**
 * Create a campaign with multiple scheduled SMS
 */
export async function createSMSCampaign(data: {
  eventId: string
  name: string
  description?: string
  templateId?: string
  message?: string
  targetType: 'all' | 'confirmed' | 'pending' | 'tags' | 'manual'
  targetTags?: string[]
  guestIds?: string[]
  scheduledFor?: Date
}) {
  const campaign = await prisma.sMSCampaign.create({
    data: {
      eventId: data.eventId,
      name: data.name,
      description: data.description,
      templateId: data.templateId,
      message: data.message,
      targetType: data.targetType,
      targetTags: data.targetTags || [],
      guestIds: data.guestIds || [],
      scheduledFor: data.scheduledFor,
      status: data.scheduledFor ? 'SCHEDULED' : 'DRAFT',
    },
  })

  logger.info(
    {
      campaignId: campaign.id,
      eventId: data.eventId,
      name: data.name,
    },
    'SMS campaign created'
  )

  return campaign
}

/**
 * Get guests for a campaign based on targeting
 */
export async function getCampaignGuests(campaign: SMSCampaign) {
  const whereClause: any = {
    eventId: campaign.eventId,
    phone: { not: null }, // Only guests with phone numbers
  }

  switch (campaign.targetType) {
    case 'all':
      // All guests with phone
      break

    case 'confirmed':
      // Guests who confirmed attendance
      whereClause.rsvp = {
        attending: true,
      }
      break

    case 'pending':
      // Guests who haven't responded
      whereClause.rsvp = null
      break

    case 'tags':
      // Guests with specific tags
      if (campaign.targetTags.length > 0) {
        whereClause.tags = {
          hasSome: campaign.targetTags,
        }
      }
      break

    case 'manual':
      // Specific guest IDs
      if (campaign.guestIds.length > 0) {
        whereClause.id = {
          in: campaign.guestIds,
        }
      }
      break
  }

  const guests = await prisma.guest.findMany({
    where: whereClause,
    include: {
      rsvp: true,
    },
  })

  return guests
}

/**
 * Schedule SMS for a campaign
 */
export async function scheduleCampaignSMS(campaignId: string) {
  const campaign = await prisma.sMSCampaign.findUnique({
    where: { id: campaignId },
    include: {
      template: true,
      event: true,
    },
  })

  if (!campaign) {
    throw new Error('Campaign not found')
  }

  if (!campaign.scheduledFor) {
    throw new Error('Campaign has no scheduled date')
  }

  // Get target guests
  const guests = await getCampaignGuests(campaign)

  if (guests.length === 0) {
    throw new Error('No guests match campaign criteria')
  }

  // Get template or message
  let messageTemplate = campaign.message

  if (campaign.template) {
    messageTemplate = campaign.template.message
  }

  if (!messageTemplate) {
    throw new Error('Campaign has no message or template')
  }

  // Create scheduled SMS for each guest
  const scheduledSMSPromises = guests.map(async (guest) => {
    // Build variables and render message
    const variables = buildTemplateVariables(guest, campaign.event)
    const renderedMessage = renderTemplate(messageTemplate!, variables)

    return createScheduledSMS({
      guestId: guest.id,
      eventId: campaign.eventId,
      campaignId: campaign.id,
      message: renderedMessage,
      templateName: campaign.template?.name,
      scheduledFor: campaign.scheduledFor!,
      maxRetries: 2,
    })
  })

  const scheduledSMSList = await Promise.all(scheduledSMSPromises)

  // Update campaign status
  await prisma.sMSCampaign.update({
    where: { id: campaign.id },
    data: {
      status: 'SCHEDULED',
    },
  })

  logger.info(
    {
      campaignId: campaign.id,
      scheduledCount: scheduledSMSList.length,
    },
    'Campaign SMS scheduled'
  )

  return scheduledSMSList
}

/**
 * Process pending scheduled SMS (to be called by cron job)
 */
export async function processPendingSMS() {
  const now = new Date()

  // Find all pending SMS that are scheduled for now or earlier
  const pendingSMS = await prisma.scheduledSMS.findMany({
    where: {
      status: 'PENDING',
      scheduledFor: {
        lte: now,
      },
    },
    include: {
      guest: true,
      event: true,
    },
    take: 100, // Process in batches
  })

  logger.info(
    {
      count: pendingSMS.length,
    },
    'Processing pending scheduled SMS'
  )

  for (const sms of pendingSMS) {
    try {
      // Update status to SENDING
      await prisma.scheduledSMS.update({
        where: { id: sms.id },
        data: { status: 'SENDING' },
      })

      // Check opt-out
      const optedOut = await prisma.sMSOptOut.findUnique({
        where: { phone: sms.guest.phone! },
      })

      if (optedOut) {
        logger.warn(
          {
            scheduledSMSId: sms.id,
            guestId: sms.guestId,
            phone: sms.guest.phone,
          },
          'Guest has opted out, skipping SMS'
        )

        await prisma.scheduledSMS.update({
          where: { id: sms.id },
          data: {
            status: 'CANCELLED',
            error: 'Guest opted out',
          },
        })

        continue
      }

      // Send SMS
      const result = await sendSMS({
        to: sms.guest.phone!,
        message: sms.message,
        guestId: sms.guestId,
        eventId: sms.eventId,
        templateName: sms.templateName || undefined,
      })

      if (result.success) {
        // Update status to SENT
        await prisma.scheduledSMS.update({
          where: { id: sms.id },
          data: {
            status: 'SENT',
            sentAt: new Date(),
            notificationId: result.notificationId,
          },
        })

        // Update campaign stats if part of campaign
        if (sms.campaignId) {
          await prisma.sMSCampaign.update({
            where: { id: sms.campaignId },
            data: {
              sentCount: { increment: 1 },
            },
          })
        }
      } else {
        // SMS failed
        const shouldRetry = sms.retryCount < sms.maxRetries

        await prisma.scheduledSMS.update({
          where: { id: sms.id },
          data: {
            status: shouldRetry ? 'PENDING' : 'FAILED',
            retryCount: { increment: 1 },
            error: result.error,
            scheduledFor: shouldRetry
              ? new Date(Date.now() + 5 * 60 * 1000) // Retry in 5 minutes
              : sms.scheduledFor,
          },
        })

        // Update campaign stats if failed permanently
        if (!shouldRetry && sms.campaignId) {
          await prisma.sMSCampaign.update({
            where: { id: sms.campaignId },
            data: {
              failedCount: { increment: 1 },
            },
          })
        }
      }
    } catch (error) {
      logger.error(
        {
          scheduledSMSId: sms.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        'Error processing scheduled SMS'
      )

      await prisma.scheduledSMS.update({
        where: { id: sms.id },
        data: {
          status: 'FAILED',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      })
    }
  }

  logger.info(
    {
      processed: pendingSMS.length,
    },
    'Finished processing pending scheduled SMS'
  )

  return pendingSMS.length
}

/**
 * Create auto-reminder for event (J-7, J-1)
 */
export async function createAutoReminders(eventId: string) {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      guests: {
        where: {
          phone: { not: null },
          rsvp: {
            attending: true,
          },
        },
        include: {
          rsvp: true,
        },
      },
    },
  })

  if (!event) {
    throw new Error('Event not found')
  }

  const eventDate = new Date(event.startsAt)
  const sevenDaysBefore = new Date(eventDate.getTime() - 7 * 24 * 60 * 60 * 1000)
  const oneDayBefore = new Date(eventDate.getTime() - 1 * 24 * 60 * 60 * 1000)

  // Create J-7 campaign
  const j7Campaign = await createSMSCampaign({
    eventId,
    name: `Rappel J-7 - ${event.name}`,
    description: 'Rappel automatique 7 jours avant l\'événement',
    message: 'Bonjour {firstName} ! Rappel : {eventName} dans 7 jours, le {eventDate} à {eventTime}. Nous avons hâte de vous voir !',
    targetType: 'confirmed',
    scheduledFor: sevenDaysBefore,
  })

  await scheduleCampaignSMS(j7Campaign.id)

  // Create J-1 campaign
  const j1Campaign = await createSMSCampaign({
    eventId,
    name: `Rappel J-1 - ${event.name}`,
    description: 'Rappel automatique la veille de l\'événement',
    message: 'Bonjour {firstName} ! C\'est demain ! {eventName} vous attend le {eventDate} à {eventTime} à {venueName}. À très vite !',
    targetType: 'confirmed',
    scheduledFor: oneDayBefore,
  })

  await scheduleCampaignSMS(j1Campaign.id)

  logger.info(
    {
      eventId,
      j7CampaignId: j7Campaign.id,
      j1CampaignId: j1Campaign.id,
    },
    'Auto-reminders created'
  )

  return {
    j7Campaign,
    j1Campaign,
  }
}

/**
 * Get campaign statistics
 */
export async function getCampaignStats(campaignId: string) {
  const campaign = await prisma.sMSCampaign.findUnique({
    where: { id: campaignId },
    include: {
      scheduledSMS: {
        select: {
          status: true,
        },
      },
    },
  })

  if (!campaign) {
    throw new Error('Campaign not found')
  }

  const total = campaign.scheduledSMS.length
  const sent = campaign.scheduledSMS.filter((s) => s.status === 'SENT').length
  const pending = campaign.scheduledSMS.filter((s) => s.status === 'PENDING').length
  const failed = campaign.scheduledSMS.filter((s) => s.status === 'FAILED').length

  return {
    total,
    sent,
    pending,
    failed,
    sentRate: total > 0 ? (sent / total) * 100 : 0,
  }
}

/**
 * Cancel a scheduled SMS or campaign
 */
export async function cancelScheduledSMS(scheduledSMSId: string) {
  await prisma.scheduledSMS.update({
    where: { id: scheduledSMSId },
    data: {
      status: 'CANCELLED',
    },
  })

  logger.info({ scheduledSMSId }, 'Scheduled SMS cancelled')
}

export async function cancelCampaign(campaignId: string) {
  // Update campaign status
  await prisma.sMSCampaign.update({
    where: { id: campaignId },
    data: {
      status: 'CANCELLED',
    },
  })

  // Cancel all pending scheduled SMS
  await prisma.scheduledSMS.updateMany({
    where: {
      campaignId,
      status: { in: ['PENDING', 'SCHEDULED'] },
    },
    data: {
      status: 'CANCELLED',
    },
  })

  logger.info({ campaignId }, 'Campaign cancelled')
}
