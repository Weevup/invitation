import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { createLogger } from '@/lib/logger'

const roomLogger = createLogger({ module: 'accommodation', type: 'rooms' })

const roomSchema = z.object({
  roomNumber: z.string().min(1, 'Le numéro de chambre est requis'),
  floor: z.number().int().optional(),
  type: z.enum(['SINGLE', 'DOUBLE', 'TWIN', 'TRIPLE', 'SUITE', 'STUDIO', 'APARTMENT']),
  maxOccupancy: z.number().int().min(1).default(1),
  bedConfiguration: z.string().optional(),
  view: z.string().optional(),
  isAccessible: z.boolean().default(false),
  isSmokingAllowed: z.boolean().default(false),
  amenities: z.array(z.string()).default([]),
  ratePerNight: z.number().optional(),
  currency: z.string().default('EUR'),
  availableFrom: z.string().optional(),
  availableUntil: z.string().optional(),
  notes: z.string().optional(),
})

/**
 * GET /api/admin/events/[id]/accommodations/[accommodationId]/rooms
 * List all rooms for an accommodation
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; accommodationId: string }> }
) {
  try {
    const { accommodationId } = await params

    const rooms = await prisma.room.findMany({
      where: { accommodationId },
      include: {
        assignments: {
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
          orderBy: {
            isPrimaryGuest: 'desc',
          },
        },
        _count: {
          select: {
            assignments: true,
          },
        },
      },
      orderBy: {
        roomNumber: 'asc',
      },
    })

    return NextResponse.json({ rooms })
  } catch (error) {
    roomLogger.error({ error, stack: error instanceof Error ? error.stack : undefined }, 'Error fetching rooms')
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des chambres' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/events/[id]/accommodations/[accommodationId]/rooms
 * Create a new room
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; accommodationId: string }> }
) {
  try {
    const { accommodationId } = await params
    const body = await request.json()

    // Validate input
    const validatedData = roomSchema.parse(body)

    // Check if room number already exists for this accommodation
    const existing = await prisma.room.findUnique({
      where: {
        accommodationId_roomNumber: {
          accommodationId,
          roomNumber: validatedData.roomNumber,
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Ce numéro de chambre existe déjà pour cet hébergement' },
        { status: 400 }
      )
    }

    // Convert date strings to Date objects
    const data: any = { ...validatedData, accommodationId }
    if (validatedData.availableFrom) {
      data.availableFrom = new Date(validatedData.availableFrom)
    }
    if (validatedData.availableUntil) {
      data.availableUntil = new Date(validatedData.availableUntil)
    }

    const room = await prisma.room.create({
      data,
      include: {
        assignments: {
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
      },
    })

    return NextResponse.json(
      { room, message: 'Chambre créée avec succès' },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }
    roomLogger.error({ error, stack: error instanceof Error ? error.stack : undefined }, 'Error creating room')
    return NextResponse.json(
      { error: 'Erreur lors de la création de la chambre' },
      { status: 500 }
    )
  }
}
