import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createLogger } from '@/lib/logger'

const dashboardLogger = createLogger({ module: 'admin', type: 'dashboard' })
import { requireAdmin, handleAuthError } from '@/lib/auth-utils'
import { getEventFilter } from '@/lib/permissions'

export async function GET() {
  try {
    const session = await requireAdmin()

    // Fetch only current admin's events with counts
    const events = await prisma.event.findMany({
      where: getEventFilter(session.user.id),
      include: {
        _count: {
          select: {
            guests: true,
            rsvps: true
          }
        }
      }
    })

    type EventWithCount = typeof events[number]

    const now = new Date()
    const upcomingEvents = events.filter((e: EventWithCount) => new Date(e.startsAt) > now)
    const pastEvents = events.filter((e: EventWithCount) => new Date(e.startsAt) <= now)
    const todayEvents = events.filter((e: EventWithCount) => {
      const eventDate = new Date(e.startsAt)
      return eventDate.toDateString() === now.toDateString()
    })

    // Fetch recent RSVPs (only from current admin's events)
    const recentRsvps = await prisma.rSVP.findMany({
      where: {
        event: {
          adminId: session.user.id
        }
      },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        guest: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        event: {
          select: {
            name: true
          }
        }
      }
    })

    // Fetch email stats (only from current admin's events)
    const emailStats = await prisma.emailTracking.groupBy({
      by: ['status'],
      where: {
        event: {
          adminId: session.user.id
        }
      },
      _count: {
        _all: true
      }
    })

    type EmailStat = typeof emailStats[number]

    const totalEmails = emailStats.reduce((sum: number, stat: EmailStat) => sum + stat._count._all, 0)
    const openedEmails = emailStats.find((s: EmailStat) => s.status === 'opened')?._count._all || 0
    const clickedEmails = emailStats.find((s: EmailStat) => s.status === 'clicked')?._count._all || 0

    // Calculate totals
    const totalGuests = events.reduce((sum: number, e: EventWithCount) => sum + e._count.guests, 0)
    const totalRsvps = events.reduce((sum: number, e: EventWithCount) => sum + e._count.rsvps, 0)
    const responseRate = totalGuests > 0 ? Math.round((totalRsvps / totalGuests) * 100) : 0
    const openRate = totalEmails > 0 ? Math.round((openedEmails / totalEmails) * 100) : 0
    const clickRate = totalEmails > 0 ? Math.round((clickedEmails / totalEmails) * 100) : 0

    // Get confirmed vs pending RSVPs (only from current admin's events)
    const confirmedRsvps = await prisma.rSVP.count({
      where: {
        attending: true,
        event: {
          adminId: session.user.id
        }
      }
    })
    const pendingRsvps = await prisma.guest.count({
      where: {
        rsvp: null,
        event: {
          adminId: session.user.id
        }
      }
    })

    // Check for integrations
    const emailIntegrations = await prisma.emailIntegration.count({
      where: { isActive: true }
    })

    // Get templates
    const emailTemplates = await prisma.emailTemplate.count({
      where: { isActive: true }
    })

    return NextResponse.json({
      overview: {
        totalEvents: events.length,
        upcomingEvents: upcomingEvents.length,
        pastEvents: pastEvents.length,
        todayEvents: todayEvents.length,
        totalGuests,
        totalRsvps,
        responseRate,
        confirmedRsvps,
        pendingRsvps
      },
      email: {
        totalSent: totalEmails,
        openRate,
        clickRate,
        activeIntegrations: emailIntegrations,
        activeTemplates: emailTemplates
      },
      recentActivity: recentRsvps.map((rsvp: typeof recentRsvps[number]) => ({
        id: rsvp.id,
        guestName: `${rsvp.guest.firstName} ${rsvp.guest.lastName}`,
        eventName: rsvp.event.name,
        attending: rsvp.attending,
        createdAt: rsvp.createdAt
      })),
      topEvents: events
        .sort((a: EventWithCount, b: EventWithCount) => b._count.rsvps - a._count.rsvps)
        .slice(0, 3)
        .map((e: EventWithCount) => ({
          id: e.id,
          name: e.name,
          guests: e._count.guests,
          rsvps: e._count.rsvps,
          responseRate: e._count.guests > 0
            ? Math.round((e._count.rsvps / e._count.guests) * 100)
            : 0
        }))
    })
  } catch (error) {
    dashboardLogger.error({ error, stack: error instanceof Error ? error.stack : undefined }, 'Error fetching dashboard stats')
    return handleAuthError(error)
  }
}
