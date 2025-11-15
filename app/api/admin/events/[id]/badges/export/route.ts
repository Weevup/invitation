import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin, handleAuthError } from '@/lib/auth-utils'
import { requireEventOwnership } from '@/lib/permissions'
import { generateBadgesPDF, type BadgeData } from '@/lib/badge-pdf'
import {
  type BadgeField,
  type BadgeLayout,
  BADGE_SIZES,
} from '@/lib/badge-generator'
import { createLogger } from '@/lib/logger'

const badgeExportLogger = createLogger({ module: 'badge', type: 'export' })

/**
 * GET /api/admin/events/[id]/badges/export
 * Export badges as PDF for printing
 * Query params:
 * - guestIds: Comma-separated list of guest IDs (optional, exports all if not provided)
 * - format: 'batch' | 'individual' (default: 'batch')
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

    const { searchParams } = new URL(request.url)
    const guestIdsParam = searchParams.get('guestIds')
    const format = searchParams.get('format') || 'batch'

    // Parse guest IDs
    const selectedGuestIds = guestIdsParam
      ? guestIdsParam.split(',').filter(Boolean)
      : null

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
        { error: 'Aucun design de badge configuré' },
        { status: 404 }
      )
    }

    // Build query for badges
    const badgeQuery: any = {
      badgeDesignId: badgeDesign.id,
      isReady: true,
    }

    if (selectedGuestIds && selectedGuestIds.length > 0) {
      badgeQuery.guestId = { in: selectedGuestIds }
    }

    // Get badges to export
    const badges = await prisma.badge.findMany({
      where: badgeQuery,
      include: {
        guest: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            company: true,
            jobTitle: true,
          },
        },
      },
      orderBy: [
        { guest: { lastName: 'asc' } },
        { guest: { firstName: 'asc' } },
      ],
    })

    if (badges.length === 0) {
      return NextResponse.json(
        {
          error: 'Aucun badge prêt à exporter',
          message: 'Veuillez d\'abord générer les badges',
        },
        { status: 404 }
      )
    }

    // Prepare badge data for PDF generation
    const badgeDataList: BadgeData[] = badges.map((badge) => ({
      renderedData: badge.renderedData as Record<string, any>,
      guestName: `${badge.guest.firstName} ${badge.guest.lastName}`,
    }))

    // Generate PDF
    const pdfBuffer = await generateBadgesPDF(badgeDataList, {
      size: badgeDesign.size as keyof typeof BADGE_SIZES,
      orientation: badgeDesign.orientation as 'PORTRAIT' | 'LANDSCAPE',
      layout: badgeDesign.layout as unknown as BadgeLayout,
      fields: badgeDesign.fields as unknown as BadgeField[],
      fontFamily: badgeDesign.fontFamily,
      badgesPerPage: badgeDesign.badgesPerPage,
      pageMargin: badgeDesign.pageMargin,
      badgeSpacing: badgeDesign.badgeSpacing,
    })

    // Update badge print tracking
    const badgeIds = badges.map((b) => b.id)
    await prisma.badge.updateMany({
      where: { id: { in: badgeIds } },
      data: {
        printedCount: { increment: 1 },
        lastPrintedAt: new Date(),
        printedBy: session.user.id,
      },
    })

    badgeExportLogger.info(
      {
        eventId,
        badgeCount: badges.length,
        format,
        adminId: session.user.id,
      },
      'Badges exported successfully'
    )

    // Return PDF as download
    const fileName = `badges-${event.name.replace(/[^a-z0-9]/gi, '-')}-${new Date().toISOString().split('T')[0]}.pdf`

    // Convert Buffer to Uint8Array for Response compatibility
    const uint8Array = new Uint8Array(pdfBuffer)

    return new Response(uint8Array, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    })
  } catch (error) {
    badgeExportLogger.error(
      { error, stack: error instanceof Error ? error.stack : undefined },
      'Error exporting badges'
    )

    // Return JSON error instead of throwing
    return NextResponse.json(
      {
        error: 'Erreur lors de l\'export des badges',
        message: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 }
    )
  }
}
