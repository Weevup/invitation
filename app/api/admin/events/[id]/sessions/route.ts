import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { createLogger } from '@/lib/logger'

const sessionLogger = createLogger({ module: 'session', type: 'management' })

// Validation schema for session creation
const createSessionSchema = z.object({
  title: z.string().min(1, 'Le titre est requis'),
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
  ]),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ONGOING', 'COMPLETED', 'CANCELLED']).default('DRAFT'),
  startTime: z.string().transform((str) => new Date(str)),
  endTime: z.string().transform((str) => new Date(str)),
  venue: z.string().optional(),
  room: z.string().optional(),
  address: z.string().optional(),
  capacity: z.number().int().positive().optional(),
  minParticipants: z.number().int().positive().optional(),
  requiresRegistration: z.boolean().default(false),
  registrationDeadline: z.string().transform((str) => new Date(str)).optional(),
  speakers: z.array(z.object({
    name: z.string(),
    title: z.string().optional(),
    bio: z.string().optional(),
    photo: z.string().optional(),
    email: z.string().email().optional(),
  })).optional(),
  equipment: z.array(z.string()).default([]),
  materials: z.string().optional(),
  catering: z.string().optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
  isPublic: z.boolean().default(true),
  isHighlighted: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  notes: z.string().optional(),
})

/**
 * GET /api/admin/events/[id]/sessions
 * Get all sessions for an event
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params

    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    })

    if (!event) {
      return NextResponse.json(
        { error: 'Événement non trouvé' },
        { status: 404 }
      )
    }

    // Get all sessions for the event
    const sessions = await prisma.session.findMany({
      where: { eventId },
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
              },
            },
          },
        },
        groups: {
          include: {
            _count: {
              select: {
                participants: true,
              },
            },
          },
        },
        transports: {
          select: {
            id: true,
            type: true,
            status: true,
          },
        },
        _count: {
          select: {
            participants: true,
          },
        },
      },
      orderBy: [
        { startTime: 'asc' },
        { timelineOrder: 'asc' },
      ],
    })

    // Calculate duration for each session
    const sessionsWithDuration = sessions.map((session) => {
      const duration = Math.round(
        (session.endTime.getTime() - session.startTime.getTime()) / (1000 * 60)
      )

      return {
        ...session,
        duration,
        participantCount: session._count.participants,
        availableSpots: session.capacity ? session.capacity - session._count.participants : null,
      }
    })

    return NextResponse.json({
      sessions: sessionsWithDuration,
      total: sessionsWithDuration.length,
    })
  } catch (error) {
    sessionLogger.error({ error, stack: error instanceof Error ? error.stack : undefined }, 'Error fetching sessions')
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des sessions' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/events/[id]/sessions
 * Create a new session
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params
    const body = await request.json()

    // Validate input
    const validatedData = createSessionSchema.parse(body)

    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    })

    if (!event) {
      return NextResponse.json(
        { error: 'Événement non trouvé' },
        { status: 404 }
      )
    }

    // Calculate duration in minutes
    const duration = Math.round(
      (validatedData.endTime.getTime() - validatedData.startTime.getTime()) /
        (1000 * 60)
    )

    // Get the highest timelineOrder for this event to assign the new session
    const lastSession = await prisma.session.findFirst({
      where: { eventId },
      orderBy: { timelineOrder: 'desc' },
      select: { timelineOrder: true },
    })

    // Assign timelineOrder from body if provided, otherwise increment from last
    const timelineOrder = body.timelineOrder !== undefined
      ? body.timelineOrder
      : (lastSession?.timelineOrder ?? -1) + 1

    // Create session
    const session = await prisma.session.create({
      data: {
        eventId,
        title: validatedData.title,
        description: validatedData.description,
        type: validatedData.type,
        status: validatedData.status,
        startTime: validatedData.startTime,
        endTime: validatedData.endTime,
        duration,
        venue: validatedData.venue,
        room: validatedData.room,
        address: validatedData.address,
        capacity: validatedData.capacity,
        minParticipants: validatedData.minParticipants,
        requiresRegistration: validatedData.requiresRegistration,
        registrationDeadline: validatedData.registrationDeadline,
        speakers: validatedData.speakers as any,
        equipment: validatedData.equipment,
        materials: validatedData.materials,
        catering: validatedData.catering,
        color: validatedData.color,
        icon: validatedData.icon,
        isPublic: validatedData.isPublic,
        isHighlighted: validatedData.isHighlighted,
        tags: validatedData.tags,
        notes: validatedData.notes,
        timelineOrder,
      },
      include: {
        _count: {
          select: {
            participants: true,
          },
        },
      },
    })

    // Auto-create timeline event for this session
    await prisma.timelineEvent.create({
      data: {
        eventId,
        type: validatedData.type === 'MEAL' ? 'MEAL' : validatedData.type === 'BREAK' ? 'BREAK' : 'SESSION',
        startTime: validatedData.startTime,
        endTime: validatedData.endTime,
        sessionId: session.id,
        title: validatedData.title,
        description: validatedData.description,
        icon: validatedData.icon,
        color: validatedData.color,
        location: validatedData.venue
          ? `${validatedData.venue}${validatedData.room ? ` - ${validatedData.room}` : ''}`
          : undefined,
        isPublic: validatedData.isPublic,
        isGlobalEvent: true,
      },
    })

    return NextResponse.json(
      {
        session: {
          ...session,
          participantCount: 0,
          availableSpots: session.capacity || null,
        },
        message: 'Session créée avec succès',
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

    sessionLogger.error({ error, stack: error instanceof Error ? error.stack : undefined }, 'Error creating session')
    return NextResponse.json(
      { error: 'Erreur lors de la création de la session' },
      { status: 500 }
    )
  }
}
