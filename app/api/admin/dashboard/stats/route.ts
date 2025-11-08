import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Fetch all events with counts
    const events = await prisma.event.findMany({
      include: {
        _count: {
          select: {
            guests: true,
            rsvps: true
          }
        }
      }
    })

    const now = new Date()
    const upcomingEvents = events.filter(e => new Date(e.startsAt) > now)
    const pastEvents = events.filter(e => new Date(e.startsAt) <= now)
    const todayEvents = events.filter(e => {
      const eventDate = new Date(e.startsAt)
      return eventDate.toDateString() === now.toDateString()
    })

    // Fetch recent RSVPs
    const recentRsvps = await prisma.rSVP.findMany({
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

    // Fetch email stats
    const emailStats = await prisma.emailTracking.groupBy({
      by: ['status'],
      _count: {
        _all: true
      }
    })

    const totalEmails = emailStats.reduce((sum, stat) => sum + stat._count._all, 0)
    const openedEmails = emailStats.find(s => s.status === 'opened')?._count._all || 0
    const clickedEmails = emailStats.find(s => s.status === 'clicked')?._count._all || 0

    // Calculate totals
    const totalGuests = events.reduce((sum, e) => sum + e._count.guests, 0)
    const totalRsvps = events.reduce((sum, e) => sum + e._count.rsvps, 0)
    const responseRate = totalGuests > 0 ? Math.round((totalRsvps / totalGuests) * 100) : 0
    const openRate = totalEmails > 0 ? Math.round((openedEmails / totalEmails) * 100) : 0
    const clickRate = totalEmails > 0 ? Math.round((clickedEmails / totalEmails) * 100) : 0

    // Get confirmed vs pending RSVPs
    const confirmedRsvps = await prisma.rSVP.count({
      where: { attending: true }
    })
    const pendingRsvps = await prisma.guest.count({
      where: {
        rsvp: null
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
      recentActivity: recentRsvps.map(rsvp => ({
        id: rsvp.id,
        guestName: `${rsvp.guest.firstName} ${rsvp.guest.lastName}`,
        eventName: rsvp.event.name,
        attending: rsvp.attending,
        createdAt: rsvp.createdAt
      })),
      topEvents: events
        .sort((a, b) => b._count.rsvps - a._count.rsvps)
        .slice(0, 3)
        .map(e => ({
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
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}
