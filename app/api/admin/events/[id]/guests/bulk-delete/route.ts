import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-utils'
import { requireEventOwnership } from '@/lib/permissions'
import { createLogger } from '@/lib/logger'

const logger = createLogger({ module: 'guest', type: 'bulk-delete' })

/**
 * POST /api/admin/events/[id]/guests/bulk-delete
 * Delete multiple guests at once
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin()
    const { id: eventId } = await params

    // Verify admin owns this event
    await requireEventOwnership(eventId, session.user.id)

    const body = await request.json()
    const { guestIds } = body as { guestIds: string[] }

    if (!Array.isArray(guestIds) || guestIds.length === 0) {
      return NextResponse.json(
        { error: 'La liste d\'IDs invités est requise et ne peut pas être vide' },
        { status: 400 }
      )
    }

    // Limit to 100 guests at once for safety
    if (guestIds.length > 100) {
      return NextResponse.json(
        { error: 'Maximum 100 invités peuvent être supprimés à la fois' },
        { status: 400 }
      )
    }

    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    })

    if (!event) {
      return NextResponse.json(
        { error: 'Événement introuvable' },
        { status: 404 }
      )
    }

    // Delete all selected guests in a single transaction
    const result = await prisma.guest.deleteMany({
      where: {
        id: {
          in: guestIds,
        },
        eventId, // Ensure guests belong to this event
      },
    })

    logger.info({
      eventId,
      requestedCount: guestIds.length,
      deletedCount: result.count,
    }, 'Bulk delete completed')

    return NextResponse.json({
      success: true,
      deleted: result.count,
    })
  } catch (error) {
    logger.error({ error }, 'Bulk delete failed')
    return NextResponse.json(
      { error: 'Erreur lors de la suppression des invités' },
      { status: 500 }
    )
  }
}
