import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schema for adding participants
const addParticipantSchema = z.object({
  guestIds: z.array(z.string()).min(1, 'Au moins un invité doit être sélectionné'),
  status: z.enum(['registered', 'confirmed', 'waitlist']).default('registered'),
  notes: z.string().optional(),
})

// Validation schema for updating participant
const updateParticipantSchema = z.object({
  status: z.enum(['registered', 'confirmed', 'waitlist', 'cancelled', 'attended']).optional(),
  waitlistPosition: z.number().int().positive().optional(),
  notes: z.string().optional(),
  rating: z.number().int().min(1).max(5).optional(),
  feedback: z.string().optional(),
})

/**
 * POST /api/admin/events/[id]/sessions/[sessionId]/participants
 * Add participants to session
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; sessionId: string }> }
) {
  try {
    const { id: eventId, sessionId } = await params
    const body = await request.json()

    // Validate input
    const validatedData = addParticipantSchema.parse(body)

    // Check if session exists
    const session = await prisma.session.findFirst({
      where: {
        id: sessionId,
        eventId,
      },
      include: {
        _count: {
          select: {
            participants: true,
          },
        },
      },
    })

    if (!session) {
      return NextResponse.json(
        { error: 'Session non trouvée' },
        { status: 404 }
      )
    }

    // Check if session is full
    if (
      session.capacity &&
      session._count.participants >= session.capacity &&
      validatedData.status !== 'waitlist'
    ) {
      return NextResponse.json(
        {
          error: 'La session est complète',
          capacity: session.capacity,
          currentCount: session._count.participants,
        },
        { status: 400 }
      )
    }

    // Check if guests exist
    const guests = await prisma.guest.findMany({
      where: {
        id: { in: validatedData.guestIds },
        eventId,
      },
    })

    if (guests.length !== validatedData.guestIds.length) {
      return NextResponse.json(
        { error: 'Un ou plusieurs invités non trouvés' },
        { status: 404 }
      )
    }

    // Check for existing participants
    const existingParticipants = await prisma.sessionParticipant.findMany({
      where: {
        sessionId,
        guestId: { in: validatedData.guestIds },
      },
    })

    if (existingParticipants.length > 0) {
      return NextResponse.json(
        {
          error: 'Un ou plusieurs invités sont déjà inscrits à cette session',
          existingGuests: existingParticipants.map((p) => p.guestId),
        },
        { status: 400 }
      )
    }

    // Calculate waitlist positions if needed
    let waitlistPosition: number | undefined
    if (validatedData.status === 'waitlist') {
      const maxWaitlist = await prisma.sessionParticipant.findFirst({
        where: {
          sessionId,
          status: 'waitlist',
        },
        orderBy: {
          waitlistPosition: 'desc',
        },
        select: {
          waitlistPosition: true,
        },
      })
      waitlistPosition = (maxWaitlist?.waitlistPosition || 0) + 1
    }

    // Add participants
    const participants = await prisma.$transaction(
      validatedData.guestIds.map((guestId, index) =>
        prisma.sessionParticipant.create({
          data: {
            sessionId,
            guestId,
            status: validatedData.status,
            waitlistPosition:
              validatedData.status === 'waitlist'
                ? (waitlistPosition || 0) + index
                : undefined,
            notes: validatedData.notes,
          },
          include: {
            guest: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                company: true,
              },
            },
          },
        })
      )
    )

    return NextResponse.json(
      {
        participants,
        message: `${participants.length} participant(s) ajouté(s) avec succès`,
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error adding participants:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'ajout des participants' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/events/[id]/sessions/[sessionId]/participants
 * Remove participant from session
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; sessionId: string }> }
) {
  try {
    const { id: eventId, sessionId } = await params
    const { searchParams } = new URL(request.url)
    const participantId = searchParams.get('participantId')

    if (!participantId) {
      return NextResponse.json(
        { error: 'participantId est requis' },
        { status: 400 }
      )
    }

    // Check if participant exists
    const participant = await prisma.sessionParticipant.findFirst({
      where: {
        id: participantId,
        sessionId,
      },
      include: {
        session: {
          select: {
            eventId: true,
          },
        },
      },
    })

    if (!participant) {
      return NextResponse.json(
        { error: 'Participant non trouvé' },
        { status: 404 }
      )
    }

    if (participant.session.eventId !== eventId) {
      return NextResponse.json(
        { error: 'Participant non trouvé dans cet événement' },
        { status: 404 }
      )
    }

    // Delete participant
    await prisma.sessionParticipant.delete({
      where: { id: participantId },
    })

    // If this was a waitlist participant, reorder the waitlist
    if (participant.status === 'waitlist' && participant.waitlistPosition) {
      await prisma.sessionParticipant.updateMany({
        where: {
          sessionId,
          status: 'waitlist',
          waitlistPosition: {
            gt: participant.waitlistPosition,
          },
        },
        data: {
          waitlistPosition: {
            decrement: 1,
          },
        },
      })
    }

    return NextResponse.json({
      message: 'Participant retiré avec succès',
    })
  } catch (error) {
    console.error('Error removing participant:', error)
    return NextResponse.json(
      { error: 'Erreur lors du retrait du participant' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/admin/events/[id]/sessions/[sessionId]/participants
 * Update participant status
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; sessionId: string }> }
) {
  try {
    const { id: eventId, sessionId } = await params
    const body = await request.json()
    const participantId = body.participantId

    if (!participantId) {
      return NextResponse.json(
        { error: 'participantId est requis' },
        { status: 400 }
      )
    }

    // Validate input
    const validatedData = updateParticipantSchema.parse(body)

    // Check if participant exists
    const participant = await prisma.sessionParticipant.findFirst({
      where: {
        id: participantId,
        sessionId,
      },
      include: {
        session: {
          select: {
            eventId: true,
          },
        },
      },
    })

    if (!participant) {
      return NextResponse.json(
        { error: 'Participant non trouvé' },
        { status: 404 }
      )
    }

    if (participant.session.eventId !== eventId) {
      return NextResponse.json(
        { error: 'Participant non trouvé dans cet événement' },
        { status: 404 }
      )
    }

    // Update participant
    const updatedParticipant = await prisma.sessionParticipant.update({
      where: { id: participantId },
      data: validatedData,
      include: {
        guest: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            company: true,
          },
        },
      },
    })

    return NextResponse.json({
      participant: updatedParticipant,
      message: 'Participant mis à jour avec succès',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating participant:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du participant' },
      { status: 500 }
    )
  }
}
