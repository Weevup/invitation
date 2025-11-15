import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { createLogger } from '@/lib/logger'

const sessionLogger = createLogger({ module: 'session', type: 'operations' })

// Validation schema for session update
const updateSessionSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  type: z.enum([
    'KEYNOTE',
    'WORKSHOP',
    'CONFERENCE',
    'TEAMBUILDING',
    'MEAL',
    'BREAK',
    'TRANSFER',
    'ARRIVAL',
    'DEPARTURE',
    'FREE_TIME',
    'NETWORKING',
    'TRAINING',
    'PANEL',
    'OTHER',
  ]).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ONGOING', 'COMPLETED', 'CANCELLED']).optional(),
  startTime: z.string().transform((str) => new Date(str)).optional(),
  endTime: z.string().transform((str) => new Date(str)).optional(),
  venue: z.string().optional(),
  room: z.string().optional(),
  address: z.string().optional(),
  capacity: z.number().int().positive().optional(),
  minParticipants: z.number().int().positive().optional(),
  requiresRegistration: z.boolean().optional(),
  registrationDeadline: z.string().transform((str) => new Date(str)).optional(),
  registrationsClosed: z.boolean().optional(),
  speakers: z.array(z.object({
    name: z.string(),
    title: z.string().optional(),
    bio: z.string().optional(),
    photo: z.string().optional(),
    email: z.string().email().optional(),
  })).optional(),
  equipment: z.array(z.string()).optional(),
  materials: z.string().optional(),
  catering: z.string().optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
  isPublic: z.boolean().optional(),
  isHighlighted: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
})

/**
 * GET /api/admin/events/[id]/sessions/[sessionId]
 * Get session details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; sessionId: string }> }
) {
  try {
    const { id: eventId, sessionId } = await params

    const session = await prisma.session.findFirst({
      where: {
        id: sessionId,
        eventId,
      },
      include: {
        participants: {
          include: {
            guest: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                company: true,
                tags: true,
              },
            },
          },
          orderBy: {
            registeredAt: 'asc',
          },
        },
        transports: {
          include: {
            guest: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
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

    // Calculate stats
    const stats = {
      registered: session.participants.filter((p) => p.status === 'registered').length,
      confirmed: session.participants.filter((p) => p.status === 'confirmed').length,
      waitlist: session.participants.filter((p) => p.status === 'waitlist').length,
      attended: session.participants.filter((p) => p.checkedInAt !== null).length,
      cancelled: session.participants.filter((p) => p.status === 'cancelled').length,
    }

    return NextResponse.json({
      session: {
        ...session,
        participantCount: session._count.participants,
        availableSpots: session.capacity ? session.capacity - session._count.participants : null,
        stats,
      },
    })
  } catch (error) {
    sessionLogger.error({ error, stack: error instanceof Error ? error.stack : undefined }, 'Error fetching session')
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la session' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/admin/events/[id]/sessions/[sessionId]
 * Partial update session (e.g., just order for drag and drop)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; sessionId: string }> }
) {
  try {
    const { id: eventId, sessionId } = await params
    const body = await request.json()

    // Check if session exists
    const existingSession = await prisma.session.findFirst({
      where: {
        id: sessionId,
        eventId,
      },
    })

    if (!existingSession) {
      return NextResponse.json(
        { error: 'Session non trouvée' },
        { status: 404 }
      )
    }

    // For PATCH, we allow partial updates without validation
    // This is especially useful for drag-and-drop order updates
    const session = await prisma.session.update({
      where: { id: sessionId },
      data: body,
    })

    return NextResponse.json({
      session,
      message: 'Session mise à jour avec succès',
    })
  } catch (error) {
    sessionLogger.error({ error, stack: error instanceof Error ? error.stack : undefined }, 'Error patching session')
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la session' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/admin/events/[id]/sessions/[sessionId]
 * Update session
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; sessionId: string }> }
) {
  try {
    const { id: eventId, sessionId } = await params
    const body = await request.json()

    // Validate input
    const validatedData = updateSessionSchema.parse(body)

    // Check if session exists
    const existingSession = await prisma.session.findFirst({
      where: {
        id: sessionId,
        eventId,
      },
    })

    if (!existingSession) {
      return NextResponse.json(
        { error: 'Session non trouvée' },
        { status: 404 }
      )
    }

    // Calculate new duration if times changed
    let duration = existingSession.duration
    if (validatedData.startTime && validatedData.endTime) {
      duration = Math.round(
        (validatedData.endTime.getTime() - validatedData.startTime.getTime()) /
          (1000 * 60)
      )
    } else if (validatedData.startTime) {
      duration = Math.round(
        (existingSession.endTime.getTime() - validatedData.startTime.getTime()) /
          (1000 * 60)
      )
    } else if (validatedData.endTime) {
      duration = Math.round(
        (validatedData.endTime.getTime() - existingSession.startTime.getTime()) /
          (1000 * 60)
      )
    }

    // Update session
    const session = await prisma.session.update({
      where: { id: sessionId },
      data: {
        ...validatedData,
        duration,
        speakers: validatedData.speakers as any,
      },
      include: {
        _count: {
          select: {
            participants: true,
          },
        },
      },
    })

    // Update timeline event if exists
    const timelineEvent = await prisma.timelineEvent.findFirst({
      where: { sessionId },
    })

    if (timelineEvent) {
      await prisma.timelineEvent.update({
        where: { id: timelineEvent.id },
        data: {
          startTime: validatedData.startTime || existingSession.startTime,
          endTime: validatedData.endTime || existingSession.endTime,
          title: validatedData.title || existingSession.title,
          description: validatedData.description,
          icon: validatedData.icon,
          color: validatedData.color,
          location: validatedData.venue
            ? `${validatedData.venue}${validatedData.room ? ` - ${validatedData.room}` : ''}`
            : undefined,
          isPublic: validatedData.isPublic !== undefined ? validatedData.isPublic : existingSession.isPublic,
        },
      })
    }

    return NextResponse.json({
      session: {
        ...session,
        participantCount: session._count.participants,
        availableSpots: session.capacity ? session.capacity - session._count.participants : null,
      },
      message: 'Session mise à jour avec succès',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }

    sessionLogger.error({ error, stack: error instanceof Error ? error.stack : undefined }, 'Error updating session')
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la session' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/events/[id]/sessions/[sessionId]
 * Delete session
 */
export async function DELETE(
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

    // Check if there are participants
    if (session._count.participants > 0) {
      return NextResponse.json(
        {
          error: 'Impossible de supprimer une session avec des participants inscrits',
          participantCount: session._count.participants,
        },
        { status: 400 }
      )
    }

    // Delete timeline event first
    await prisma.timelineEvent.deleteMany({
      where: { sessionId },
    })

    // Delete session
    await prisma.session.delete({
      where: { id: sessionId },
    })

    return NextResponse.json({
      message: 'Session supprimée avec succès',
    })
  } catch (error) {
    sessionLogger.error({ error, stack: error instanceof Error ? error.stack : undefined }, 'Error deleting session')
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la session' },
      { status: 500 }
    )
  }
}
