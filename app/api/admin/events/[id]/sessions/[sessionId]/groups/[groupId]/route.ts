import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createLogger } from '@/lib/logger'

const groupLogger = createLogger({ module: 'session', type: 'group-operations' })

/**
 * PATCH /api/admin/events/[id]/sessions/[sessionId]/groups/[groupId]
 * Update a group
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; sessionId: string; groupId: string }> }
) {
  try {
    const { id: eventId, sessionId, groupId } = await params
    const body = await request.json()

    // Check if group exists
    const existingGroup = await prisma.sessionGroup.findFirst({
      where: {
        id: groupId,
        sessionId,
        session: {
          eventId,
        },
      },
    })

    if (!existingGroup) {
      return NextResponse.json(
        { error: 'Groupe non trouvé' },
        { status: 404 }
      )
    }

    // Update group
    const group = await prisma.sessionGroup.update({
      where: { id: groupId },
      data: body,
      include: {
        _count: {
          select: {
            participants: true,
          },
        },
      },
    })

    return NextResponse.json({
      group,
      message: 'Groupe mis à jour avec succès',
    })
  } catch (error) {
    groupLogger.error({ error, stack: error instanceof Error ? error.stack : undefined }, 'Error updating group')
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du groupe' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/events/[id]/sessions/[sessionId]/groups/[groupId]
 * Delete a group
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; sessionId: string; groupId: string }> }
) {
  try {
    const { id: eventId, sessionId, groupId } = await params

    // Check if group exists
    const group = await prisma.sessionGroup.findFirst({
      where: {
        id: groupId,
        sessionId,
        session: {
          eventId,
        },
      },
      include: {
        _count: {
          select: {
            participants: true,
          },
        },
      },
    })

    if (!group) {
      return NextResponse.json(
        { error: 'Groupe non trouvé' },
        { status: 404 }
      )
    }

    // Delete group (participants will have groupId set to null due to SetNull)
    await prisma.sessionGroup.delete({
      where: { id: groupId },
    })

    return NextResponse.json({
      message: 'Groupe supprimé avec succès',
    })
  } catch (error) {
    groupLogger.error({ error, stack: error instanceof Error ? error.stack : undefined }, 'Error deleting group')
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du groupe' },
      { status: 500 }
    )
  }
}
