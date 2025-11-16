import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { formatPhoneNumber } from '@/lib/sms-service'

/**
 * Add a phone number to opt-out list
 */
export async function addOptOut(data: {
  phone: string
  guestId?: string
  reason?: string
  source?: 'sms_reply' | 'manual' | 'api'
}) {
  // Normalize phone number
  const normalizedPhone = formatPhoneNumber(data.phone)

  // Check if already opted out
  const existing = await prisma.sMSOptOut.findUnique({
    where: { phone: normalizedPhone },
  })

  if (existing) {
    logger.info(
      {
        phone: normalizedPhone,
      },
      'Phone already opted out'
    )
    return existing
  }

  // Create opt-out
  const optOut = await prisma.sMSOptOut.create({
    data: {
      phone: normalizedPhone,
      guestId: data.guestId,
      reason: data.reason || 'User request',
      source: data.source || 'manual',
    },
  })

  logger.info(
    {
      phone: normalizedPhone,
      source: data.source,
    },
    'Phone number added to opt-out list'
  )

  return optOut
}

/**
 * Remove a phone number from opt-out list
 */
export async function removeOptOut(phone: string) {
  const normalizedPhone = formatPhoneNumber(phone)

  await prisma.sMSOptOut.delete({
    where: { phone: normalizedPhone },
  })

  logger.info(
    {
      phone: normalizedPhone,
    },
    'Phone number removed from opt-out list'
  )
}

/**
 * Check if a phone number has opted out
 */
export async function isOptedOut(phone: string): Promise<boolean> {
  const normalizedPhone = formatPhoneNumber(phone)

  const optOut = await prisma.sMSOptOut.findUnique({
    where: { phone: normalizedPhone },
  })

  return !!optOut
}

/**
 * Get all opt-outs
 */
export async function getAllOptOuts() {
  return prisma.sMSOptOut.findMany({
    include: {
      guest: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
    orderBy: {
      optedOutAt: 'desc',
    },
  })
}

/**
 * Get opt-outs for specific event
 */
export async function getEventOptOuts(eventId: string) {
  const optOuts = await prisma.sMSOptOut.findMany({
    where: {
      guest: {
        eventId,
      },
    },
    include: {
      guest: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
          eventId: true,
        },
      },
    },
    orderBy: {
      optedOutAt: 'desc',
    },
  })

  return optOuts
}

/**
 * Process "STOP" reply from Twilio webhook
 * This is automatically handled by Twilio, but we can also process it
 */
export async function processStopReply(data: {
  phone: string
  messageSid: string
  body: string
}) {
  const normalizedPhone = formatPhoneNumber(data.phone)

  // Check if message is a STOP command
  const stopKeywords = ['STOP', 'UNSUBSCRIBE', 'CANCEL', 'END', 'QUIT']
  const messageUpper = data.body.trim().toUpperCase()

  if (stopKeywords.includes(messageUpper)) {
    // Find guest by phone
    const guest = await prisma.guest.findFirst({
      where: {
        phone: normalizedPhone,
      },
    })

    await addOptOut({
      phone: normalizedPhone,
      guestId: guest?.id,
      reason: `STOP command via SMS: "${data.body}"`,
      source: 'sms_reply',
    })

    logger.info(
      {
        phone: normalizedPhone,
        message: data.body,
      },
      'Processed STOP command from SMS'
    )

    return true
  }

  return false
}

/**
 * Batch opt-out for multiple phone numbers
 */
export async function batchOptOut(phones: string[], reason?: string) {
  const results = {
    success: 0,
    failed: 0,
    alreadyOptedOut: 0,
  }

  for (const phone of phones) {
    try {
      const normalizedPhone = formatPhoneNumber(phone)

      // Check if already opted out
      const existing = await prisma.sMSOptOut.findUnique({
        where: { phone: normalizedPhone },
      })

      if (existing) {
        results.alreadyOptedOut++
        continue
      }

      await addOptOut({
        phone: normalizedPhone,
        reason: reason || 'Batch opt-out',
        source: 'manual',
      })

      results.success++
    } catch (error) {
      logger.error(
        {
          phone,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        'Failed to opt-out phone number'
      )
      results.failed++
    }
  }

  logger.info(results, 'Batch opt-out completed')

  return results
}

/**
 * Get opt-out stats
 */
export async function getOptOutStats() {
  const total = await prisma.sMSOptOut.count()

  const bySource = await prisma.sMSOptOut.groupBy({
    by: ['source'],
    _count: true,
  })

  const last30Days = await prisma.sMSOptOut.count({
    where: {
      optedOutAt: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
    },
  })

  return {
    total,
    bySource: bySource.reduce((acc, item) => {
      acc[item.source] = item._count
      return acc
    }, {} as Record<string, number>),
    last30Days,
  }
}
