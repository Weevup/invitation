import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin, handleAuthError } from '@/lib/auth-utils'
import { createLogger } from '@/lib/logger'

const logger = createLogger({ module: 'admin-guests' })

/**
 * GET /api/admin/guests
 * Returns all guests across all events owned by the admin
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireAdmin()

    // Get all events owned by the admin
    const events = await prisma.event.findMany({
      where: { adminId: session.user.id },
      select: { id: true },
    })

    const eventIds = events.map(e => e.id)

    // Get all guests for these events
    const guests = await prisma.guest.findMany({
      where: {
        eventId: { in: eventIds },
        deletedAt: null,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        company: true,
        token: true,
        lastEmailAt: true,
        rsvp: {
          select: {
            attending: true,
            createdAt: true,
            updatedAt: true,
            respondedAt: true,
          },
        },
        event: {
          select: {
            id: true,
            name: true,
            startsAt: true,
          },
        },
      },
      orderBy: [
        { event: { startsAt: 'desc' } },
        { lastName: 'asc' },
        { firstName: 'asc' },
      ],
    })

    return NextResponse.json(guests)
  } catch (error) {
    logger.error({ error }, 'Error fetching guests')
    return handleAuthError(error)
  }
}
