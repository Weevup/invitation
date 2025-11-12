import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin, handleAuthError } from '@/lib/auth-utils'
import { requireEventOwnership } from '@/lib/permissions'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin()
    const { id: eventId } = await params

    // Verify ownership
    await requireEventOwnership(eventId, session.user.id)

    // Get all email logs for this event with full details
    const emailLogs = await prisma.emailLog.findMany({
      where: {
        eventId: eventId
      },
      include: {
        guest: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          }
        }
      },
      orderBy: {
        sentAt: 'desc'
      }
    })

    // Calculate global stats
    const totalSent = emailLogs.filter(log =>
      ['SENT', 'DELIVERED', 'OPENED', 'CLICKED'].includes(log.status)
    ).length

    const totalOpened = emailLogs.filter(log => log.openedAt !== null).length
    const totalClicked = emailLogs.filter(log => log.clickedAt !== null).length
    const totalBounced = emailLogs.filter(log => log.status === 'BOUNCED').length
    const totalFailed = emailLogs.filter(log => log.status === 'FAILED').length

    const openRate = totalSent > 0 ? ((totalOpened / totalSent) * 100).toFixed(1) : '0.0'
    const clickRate = totalSent > 0 ? ((totalClicked / totalSent) * 100).toFixed(1) : '0.0'
    const clickToOpenRate = totalOpened > 0 ? ((totalClicked / totalOpened) * 100).toFixed(1) : '0.0'
    const bounceRate = totalSent > 0 ? ((totalBounced / totalSent) * 100).toFixed(1) : '0.0'

    // Stats by email type
    const statsByType: Record<string, any> = {}

    emailLogs.forEach(log => {
      const type = log.type
      if (!statsByType[type]) {
        statsByType[type] = {
          sent: 0,
          opened: 0,
          clicked: 0,
          bounced: 0,
          failed: 0,
          pending: 0,
        }
      }

      if (['SENT', 'DELIVERED', 'OPENED', 'CLICKED'].includes(log.status)) {
        statsByType[type].sent++
      }
      if (log.openedAt) statsByType[type].opened++
      if (log.clickedAt) statsByType[type].clicked++
      if (log.status === 'BOUNCED') statsByType[type].bounced++
      if (log.status === 'FAILED') statsByType[type].failed++
      if (log.status === 'PENDING') statsByType[type].pending++
    })

    // Add rates to each type
    Object.keys(statsByType).forEach(type => {
      const stats = statsByType[type]
      stats.openRate = stats.sent > 0 ? ((stats.opened / stats.sent) * 100).toFixed(1) : '0.0'
      stats.clickRate = stats.sent > 0 ? ((stats.clicked / stats.sent) * 100).toFixed(1) : '0.0'
      stats.clickToOpenRate = stats.opened > 0 ? ((stats.clicked / stats.opened) * 100).toFixed(1) : '0.0'
      stats.bounceRate = stats.sent > 0 ? ((stats.bounced / stats.sent) * 100).toFixed(1) : '0.0'
    })

    // Stats by status
    const statsByStatus = emailLogs.reduce((acc, log) => {
      acc[log.status] = (acc[log.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Timeline data (last 30 days, grouped by day)
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const timelineData = emailLogs
      .filter(log => log.sentAt && log.sentAt >= thirtyDaysAgo)
      .reduce((acc, log) => {
        if (!log.sentAt) return acc

        const date = log.sentAt.toISOString().split('T')[0]
        if (!acc[date]) {
          acc[date] = { date, sent: 0, opened: 0, clicked: 0 }
        }

        acc[date].sent++
        if (log.openedAt) acc[date].opened++
        if (log.clickedAt) acc[date].clicked++

        return acc
      }, {} as Record<string, any>)

    const timeline = Object.values(timelineData).sort((a: any, b: any) =>
      a.date.localeCompare(b.date)
    )

    // Recent emails (last 20)
    const recentEmails = emailLogs.slice(0, 20).map(log => ({
      id: log.id,
      type: log.type,
      status: log.status,
      subject: log.subject,
      guestName: `${log.guest.firstName} ${log.guest.lastName}`,
      guestEmail: log.guest.email,
      sentAt: log.sentAt,
      openedAt: log.openedAt,
      clickedAt: log.clickedAt,
      error: log.error,
    }))

    // Performance metrics
    const emailsWithOpenTime = emailLogs.filter(log => log.sentAt && log.openedAt)
    const avgTimeToOpen = emailsWithOpenTime.length > 0
      ? emailsWithOpenTime.reduce((sum, log) => {
          const timeDiff = log.openedAt!.getTime() - log.sentAt!.getTime()
          return sum + timeDiff
        }, 0) / emailsWithOpenTime.length
      : 0

    const avgHoursToOpen = avgTimeToOpen > 0 ? (avgTimeToOpen / (1000 * 60 * 60)).toFixed(1) : '0.0'

    // Errors and bounces details
    const errors = emailLogs
      .filter(log => log.status === 'FAILED' && log.error)
      .map(log => ({
        id: log.id,
        type: log.type,
        guestName: `${log.guest.firstName} ${log.guest.lastName}`,
        guestEmail: log.guest.email,
        error: log.error,
        sentAt: log.sentAt,
      }))
      .slice(0, 10)

    const bounces = emailLogs
      .filter(log => log.status === 'BOUNCED')
      .map(log => ({
        id: log.id,
        type: log.type,
        guestName: `${log.guest.firstName} ${log.guest.lastName}`,
        guestEmail: log.guest.email,
        bouncedAt: log.bouncedAt,
      }))
      .slice(0, 10)

    return NextResponse.json({
      overview: {
        totalSent,
        totalOpened,
        totalClicked,
        totalBounced,
        totalFailed,
        totalPending: emailLogs.filter(log => log.status === 'PENDING').length,
        openRate,
        clickRate,
        clickToOpenRate,
        bounceRate,
        avgHoursToOpen,
      },
      statsByType,
      statsByStatus,
      timeline,
      recentEmails,
      errors,
      bounces,
    })
  } catch (error) {
    console.error('Error fetching email analytics:', error)
    return handleAuthError(error)
  }
}
