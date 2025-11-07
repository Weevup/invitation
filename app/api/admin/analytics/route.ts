import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Get all events with their RSVPs
    const events = await prisma.event.findMany({
      include: {
        rsvps: {
          select: {
            attending: true,
            createdAt: true,
            guest: {
              select: {
                company: true,
              },
            },
          },
        },
        guests: true,
      },
    })

    // Calculate overall stats
    const totalEvents = events.length
    const totalGuests = events.reduce((sum, e) => sum + e.guests.length, 0)
    const totalRsvps = events.reduce((sum, e) => sum + e.rsvps.length, 0)
    const totalAttending = events.reduce(
      (sum, e) => sum + e.rsvps.filter(r => r.attending).length,
      0
    )
    const totalDeclined = totalRsvps - totalAttending

    // Response rate over time (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const responseTimeline = []
    for (let i = 29; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)

      const nextDate = new Date(date)
      nextDate.setDate(nextDate.getDate() + 1)

      const responsesOnDay = events.reduce((count, event) => {
        return count + event.rsvps.filter(rsvp => {
          const rsvpDate = new Date(rsvp.createdAt)
          return rsvpDate >= date && rsvpDate < nextDate
        }).length
      }, 0)

      responseTimeline.push({
        date: date.toISOString().split('T')[0],
        responses: responsesOnDay,
      })
    }

    // Event breakdown
    const eventStats = events.map(event => ({
      name: event.name,
      guests: event.guests.length,
      responses: event.rsvps.length,
      attending: event.rsvps.filter(r => r.attending).length,
      declined: event.rsvps.filter(r => !r.attending).length,
      responseRate: event.guests.length > 0
        ? Math.round((event.rsvps.length / event.guests.length) * 100)
        : 0,
    }))

    // Response breakdown (attending vs declined)
    const responseBreakdown = [
      { name: 'Confirmés', value: totalAttending, fill: '#009197' },
      { name: 'Déclinés', value: totalDeclined, fill: '#FF4713' },
      { name: 'En attente', value: totalGuests - totalRsvps, fill: '#9CD9F6' },
    ]

    // Company breakdown (top 10)
    const companyMap = new Map<string, number>()
    events.forEach(event => {
      event.rsvps.forEach(rsvp => {
        if (rsvp.guest.company && rsvp.attending) {
          const count = companyMap.get(rsvp.guest.company) || 0
          companyMap.set(rsvp.guest.company, count + 1)
        }
      })
    })

    const topCompanies = Array.from(companyMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, value]) => ({ name, value }))

    return NextResponse.json({
      overview: {
        totalEvents,
        totalGuests,
        totalRsvps,
        totalAttending,
        totalDeclined,
        responseRate: totalGuests > 0 ? Math.round((totalRsvps / totalGuests) * 100) : 0,
        attendanceRate: totalRsvps > 0 ? Math.round((totalAttending / totalRsvps) * 100) : 0,
      },
      responseTimeline,
      eventStats,
      responseBreakdown,
      topCompanies,
    })
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
