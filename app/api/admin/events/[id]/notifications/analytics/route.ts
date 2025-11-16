import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-utils'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id: eventId } = await params

    // Get all notifications for this event
    const notifications = await prisma.notification.findMany({
      where: {
        eventId,
        type: 'SMS',
      },
      include: {
        guest: {
          select: {
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Calculate overview stats
    const total = notifications.length
    const sent = notifications.filter(
      (n) => n.status === 'SENT' || n.status === 'DELIVERED'
    ).length
    const delivered = notifications.filter((n) => n.status === 'DELIVERED').length
    const failed = notifications.filter((n) => n.status === 'FAILED').length
    const pending = notifications.filter(
      (n) => n.status === 'PENDING' || n.status === 'SENDING'
    ).length

    const deliveryRate = sent > 0 ? (delivered / sent) * 100 : 0
    const costEstimate = sent * 0.09 // 0.09€ per SMS

    // Get template usage stats
    const templateUsage = await prisma.sMSTemplate.findMany({
      where: {
        OR: [{ eventId }, { eventId: null }],
        usageCount: { gt: 0 },
      },
      select: {
        name: true,
        category: true,
        usageCount: true,
        lastUsedAt: true,
      },
      orderBy: {
        usageCount: 'desc',
      },
      take: 10,
    })

    // Calculate daily stats for last 7 days
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const recentNotifications = notifications.filter(
      (n) => new Date(n.createdAt) >= sevenDaysAgo
    )

    const dailyStatsMap = new Map<string, { sent: number; failed: number }>()

    for (let i = 0; i < 7; i++) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateKey = date.toISOString().split('T')[0]
      dailyStatsMap.set(dateKey, { sent: 0, failed: 0 })
    }

    recentNotifications.forEach((notification) => {
      const dateKey = new Date(notification.createdAt).toISOString().split('T')[0]
      const stats = dailyStatsMap.get(dateKey)

      if (stats) {
        if (notification.status === 'SENT' || notification.status === 'DELIVERED') {
          stats.sent++
        }
        if (notification.status === 'FAILED') {
          stats.failed++
        }
      }
    })

    const dailyStats = Array.from(dailyStatsMap.entries())
      .map(([date, stats]) => ({
        date,
        sent: stats.sent,
        failed: stats.failed,
      }))
      .reverse()

    // Get top recipients
    const recipientCounts = new Map<
      string,
      { name: string; phone: string; count: number }
    >()

    notifications.forEach((notification) => {
      const key = notification.guestId
      const existing = recipientCounts.get(key)

      if (existing) {
        existing.count++
      } else {
        recipientCounts.set(key, {
          name: `${notification.guest.firstName} ${notification.guest.lastName}`,
          phone: notification.guest.phone || '',
          count: 1,
        })
      }
    })

    const topRecipients = Array.from(recipientCounts.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map((r) => ({
        name: r.name,
        phone: r.phone,
        messageCount: r.count,
      }))

    return NextResponse.json({
      overview: {
        total,
        sent,
        delivered,
        failed,
        pending,
        deliveryRate,
        costEstimate,
      },
      templates: templateUsage.map((t) => ({
        name: t.name,
        category: t.category,
        usageCount: t.usageCount,
        lastUsedAt: t.lastUsedAt?.toISOString() || null,
      })),
      dailyStats,
      topRecipients,
    })
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      'Error fetching SMS analytics'
    )

    return NextResponse.json(
      {
        error: 'Internal server error',
        message:
          error instanceof Error ? error.message : 'Failed to fetch analytics',
      },
      { status: 500 }
    )
  }
}
