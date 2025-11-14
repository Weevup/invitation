import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/admin/events/[id]/sessions/[sessionId]/groups/auto-distribute
 * Automatically distribute participants evenly across groups
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; sessionId: string }> }
) {
  try {
    const { id: eventId, sessionId } = await params

    // Check if session exists
    const session = await prisma.session.findFirst({
      where: {
        id: sessionId,
        eventId,
      },
    })

    if (!session) {
      return NextResponse.json(
        { error: 'Session non trouvée' },
        { status: 404 }
      )
    }

    // Get all groups for this session
    const groups = await prisma.sessionGroup.findMany({
      where: { sessionId },
      orderBy: { order: 'asc' },
    })

    if (groups.length === 0) {
      return NextResponse.json(
        { error: 'Aucun groupe défini pour cette session' },
        { status: 400 }
      )
    }

    // Get all participants for this session
    const participants = await prisma.sessionParticipant.findMany({
      where: { sessionId },
    })

    if (participants.length === 0) {
      return NextResponse.json(
        { message: 'Aucun participant à répartir' },
        { status: 200 }
      )
    }

    // Reset all groupId to null first
    await prisma.sessionParticipant.updateMany({
      where: { sessionId },
      data: { groupId: null },
    })

    // Distribute participants evenly
    let currentGroupIndex = 0

    for (const participant of participants) {
      const group = groups[currentGroupIndex]

      // Check if group has capacity and is not full
      if (group.capacity) {
        const currentCount = await prisma.sessionParticipant.count({
          where: {
            sessionId,
            groupId: group.id,
          },
        })

        // Skip to next group if current is full
        if (currentCount >= group.capacity) {
          currentGroupIndex = (currentGroupIndex + 1) % groups.length
          const nextGroup = groups[currentGroupIndex]

          await prisma.sessionParticipant.update({
            where: { id: participant.id },
            data: { groupId: nextGroup.id },
          })
        } else {
          await prisma.sessionParticipant.update({
            where: { id: participant.id },
            data: { groupId: group.id },
          })
        }
      } else {
        // No capacity limit, just round-robin
        await prisma.sessionParticipant.update({
          where: { id: participant.id },
          data: { groupId: group.id },
        })
      }

      // Move to next group for next participant (round-robin)
      currentGroupIndex = (currentGroupIndex + 1) % groups.length
    }

    // Get updated groups with participant counts
    const updatedGroups = await prisma.sessionGroup.findMany({
      where: { sessionId },
      include: {
        _count: {
          select: {
            participants: true,
          },
        },
      },
      orderBy: { order: 'asc' },
    })

    return NextResponse.json({
      message: 'Participants répartis automatiquement',
      groups: updatedGroups,
      totalDistributed: participants.length,
    })
  } catch (error) {
    console.error('Error auto-distributing participants:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la répartition automatique' },
      { status: 500 }
    )
  }
}
