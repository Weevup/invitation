import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schema for group creation
const createGroupSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  description: z.string().optional(),
  color: z.string().optional(),
  capacity: z.number().int().positive().optional(),
  order: z.number().int().default(0),
})

/**
 * GET /api/admin/events/[id]/sessions/[sessionId]/groups
 * Get all groups for a session
 */
export async function GET(
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
      include: {
        _count: {
          select: {
            participants: true,
          },
        },
      },
      orderBy: {
        order: 'asc',
      },
    })

    return NextResponse.json({
      groups,
      total: groups.length,
    })
  } catch (error) {
    console.error('Error fetching groups:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des groupes' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/events/[id]/sessions/[sessionId]/groups
 * Create a new group
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; sessionId: string }> }
) {
  try {
    const { id: eventId, sessionId } = await params
    const body = await request.json()

    // Validate input
    const validatedData = createGroupSchema.parse(body)

    // Check if session exists and requires groups
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

    // Create group
    const group = await prisma.sessionGroup.create({
      data: {
        sessionId,
        name: validatedData.name,
        description: validatedData.description,
        color: validatedData.color,
        capacity: validatedData.capacity,
        order: validatedData.order,
      },
      include: {
        _count: {
          select: {
            participants: true,
          },
        },
      },
    })

    return NextResponse.json(
      {
        group,
        message: 'Groupe créé avec succès',
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

    console.error('Error creating group:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création du groupe' },
      { status: 500 }
    )
  }
}
