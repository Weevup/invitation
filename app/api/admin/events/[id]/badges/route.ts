import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin, handleAuthError } from '@/lib/auth-utils'
import { requireEventOwnership } from '@/lib/permissions'
import { createLogger } from '@/lib/logger'

const badgeListLogger = createLogger({ module: 'badge', type: 'list' })

/**
 * GET /api/admin/events/[id]/badges
 * Get all badges for an event
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin()
    const { id: eventId } = await params

    // Verify admin owns this event
    await requireEventOwnership(eventId, session.user.id)

    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, name: true },
    })

    if (!event) {
      return NextResponse.json(
        { error: 'Événement non trouvé' },
        { status: 404 }
      )
    }

    // Get badge design for the event
    const badgeDesign = await prisma.badgeDesign.findUnique({
      where: { eventId },
    })

    if (!badgeDesign) {
      return NextResponse.json(
        {
          badges: [],
          total: 0,
          message: 'Aucun design de badge configuré pour cet événement',
        },
        { status: 200 }
      )
    }

    // Get all badges for the event
    const badges = await prisma.badge.findMany({
      where: { badgeDesignId: badgeDesign.id },
      include: {
        guest: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            company: true,
            jobTitle: true,
            status: true,
          },
        },
      },
      orderBy: [
        { isReady: 'desc' },
        { createdAt: 'desc' },
      ],
    })

    // Calculate stats
    const stats = {
      total: badges.length,
      ready: badges.filter((b) => b.isReady).length,
      issued: badges.filter((b) => b.isIssued).length,
      printed: badges.filter((b) => b.printedCount > 0).length,
    }

    badgeListLogger.info(
      { eventId, stats },
      'Badges fetched successfully'
    )

    return NextResponse.json({
      badges,
      stats,
      badgeDesign: {
        id: badgeDesign.id,
        name: badgeDesign.name,
        size: badgeDesign.size,
        orientation: badgeDesign.orientation,
      },
    })
  } catch (error) {
    badgeListLogger.error(
      { error, stack: error instanceof Error ? error.stack : undefined },
      'Error fetching badges'
    )
    return handleAuthError(error)
  }
}

/**
 * DELETE /api/admin/events/[id]/badges
 * Delete all badges for an event (reset)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin()
    const { id: eventId } = await params

    // Verify admin owns this event
    await requireEventOwnership(eventId, session.user.id)

    // Get badge design for the event
    const badgeDesign = await prisma.badgeDesign.findUnique({
      where: { eventId },
    })

    if (!badgeDesign) {
      return NextResponse.json(
        { error: 'Aucun design de badge configuré' },
        { status: 404 }
      )
    }

    // Delete all badges
    const result = await prisma.badge.deleteMany({
      where: { badgeDesignId: badgeDesign.id },
    })

    badgeListLogger.info(
      { eventId, deletedCount: result.count },
      'Badges deleted successfully'
    )

    return NextResponse.json({
      message: `${result.count} badge(s) supprimé(s)`,
      deletedCount: result.count,
    })
  } catch (error) {
    badgeListLogger.error(
      { error, stack: error instanceof Error ? error.stack : undefined },
      'Error deleting badges'
    )
    return handleAuthError(error)
  }
}
