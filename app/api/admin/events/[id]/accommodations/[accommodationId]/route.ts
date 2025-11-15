import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { createLogger } from '@/lib/logger'

const accommodationLogger = createLogger({ module: 'accommodation', type: 'operations' })

const updateAccommodationSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').optional(),
  type: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  website: z.string().url().optional().or(z.literal('')),
  contactPerson: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  distanceFromVenue: z.number().optional(),
  starRating: z.number().int().min(1).max(5).optional(),
  amenities: z.array(z.string()).optional(),
  description: z.string().optional(),
  totalRooms: z.number().int().optional(),
  allocatedRooms: z.number().int().optional(),
  checkInTime: z.string().optional(),
  checkOutTime: z.string().optional(),
  earlyCheckIn: z.boolean().optional(),
  lateCheckOut: z.boolean().optional(),
  contractRate: z.number().optional(),
  currency: z.string().optional(),
  blockStartDate: z.string().optional(),
  blockEndDate: z.string().optional(),
  bookingDeadline: z.string().optional(),
  bookingRef: z.string().optional(),
  isActive: z.boolean().optional(),
  isPreferred: z.boolean().optional(),
  notes: z.string().optional(),
  internalNotes: z.string().optional(),
})

/**
 * GET /api/admin/events/[id]/accommodations/[accommodationId]
 * Get a single accommodation with full details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; accommodationId: string }> }
) {
  try {
    const { id: eventId, accommodationId } = await params

    const accommodation = await prisma.accommodation.findUnique({
      where: {
        id: accommodationId,
        eventId,
      },
      include: {
        rooms: {
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
        },
        _count: {
          select: {
            rooms: true,
          },
        },
      },
    })

    if (!accommodation) {
      return NextResponse.json(
        { error: 'Hébergement non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json({ accommodation })
  } catch (error) {
    accommodationLogger.error({ error, stack: error instanceof Error ? error.stack : undefined }, 'Error fetching accommodation')
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de l\'hébergement' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/admin/events/[id]/accommodations/[accommodationId]
 * Update an accommodation
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; accommodationId: string }> }
) {
  try {
    const { id: eventId, accommodationId } = await params
    const body = await request.json()

    // Validate input
    const validatedData = updateAccommodationSchema.parse(body)

    // Convert date strings to Date objects
    const data: any = { ...validatedData }
    if (validatedData.blockStartDate) {
      data.blockStartDate = new Date(validatedData.blockStartDate)
    }
    if (validatedData.blockEndDate) {
      data.blockEndDate = new Date(validatedData.blockEndDate)
    }
    if (validatedData.bookingDeadline) {
      data.bookingDeadline = new Date(validatedData.bookingDeadline)
    }

    // Check if accommodation exists and belongs to this event
    const existing = await prisma.accommodation.findUnique({
      where: {
        id: accommodationId,
        eventId,
      },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Hébergement non trouvé' },
        { status: 404 }
      )
    }

    const accommodation = await prisma.accommodation.update({
      where: { id: accommodationId },
      data,
      include: {
        rooms: {
          include: {
            _count: {
              select: {
                assignments: true,
              },
            },
          },
        },
        _count: {
          select: {
            rooms: true,
          },
        },
      },
    })

    return NextResponse.json({
      accommodation,
      message: 'Hébergement mis à jour avec succès',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }
    accommodationLogger.error({ error, stack: error instanceof Error ? error.stack : undefined }, 'Error updating accommodation')
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de l\'hébergement' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/events/[id]/accommodations/[accommodationId]
 * Delete an accommodation (only if no rooms assigned)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; accommodationId: string }> }
) {
  try {
    const { id: eventId, accommodationId } = await params

    // Check if accommodation exists and belongs to this event
    const accommodation = await prisma.accommodation.findUnique({
      where: {
        id: accommodationId,
        eventId,
      },
      include: {
        rooms: {
          include: {
            _count: {
              select: {
                assignments: true,
              },
            },
          },
        },
      },
    })

    if (!accommodation) {
      return NextResponse.json(
        { error: 'Hébergement non trouvé' },
        { status: 404 }
      )
    }

    // Check if there are any room assignments
    const hasAssignments = accommodation.rooms.some(
      (room: any) => room._count.assignments > 0
    )

    if (hasAssignments) {
      return NextResponse.json(
        {
          error:
            'Impossible de supprimer cet hébergement car des chambres sont assignées',
        },
        { status: 400 }
      )
    }

    await prisma.accommodation.delete({
      where: { id: accommodationId },
    })

    return NextResponse.json({
      message: 'Hébergement supprimé avec succès',
    })
  } catch (error) {
    accommodationLogger.error({ error, stack: error instanceof Error ? error.stack : undefined }, 'Error deleting accommodation')
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de l\'hébergement' },
      { status: 500 }
    )
  }
}
