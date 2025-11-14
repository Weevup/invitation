import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * PATCH /api/admin/events/[id]/sessions/[sessionId]/participants/[participantId]
 * Update a participant (e.g., assign to group)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; sessionId: string; participantId: string }> }
) {
  try {
    const { id: eventId, sessionId, participantId } = await params
    const body = await request.json()

    // Check if participant exists
    const existingParticipant = await prisma.sessionParticipant.findFirst({
      where: {
        id: participantId,
        sessionId,
        session: {
          eventId,
        },
      },
    })

    if (!existingParticipant) {
      return NextResponse.json(
        { error: 'Participant non trouvé' },
        { status: 404 }
      )
    }

    // If groupId is provided, verify it exists and belongs to this session
    if (body.groupId) {
      const group = await prisma.sessionGroup.findFirst({
        where: {
          id: body.groupId,
          sessionId,
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

      // Check capacity if group has one
      if (group.capacity && group._count.participants >= group.capacity) {
        // Allow if participant is already in this group (re-assignment)
        if (existingParticipant.groupId !== group.id) {
          return NextResponse.json(
            { error: 'Le groupe a atteint sa capacité maximale' },
            { status: 400 }
          )
        }
      }
    }

    // Update participant
    const participant = await prisma.sessionParticipant.update({
      where: { id: participantId },
      data: {
        groupId: body.groupId,
      },
      include: {
        guest: true,
        group: true,
      },
    })

    return NextResponse.json({
      participant,
      message: 'Participant mis à jour avec succès',
    })
  } catch (error) {
    console.error('Error updating participant:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du participant' },
      { status: 500 }
    )
  }
}
