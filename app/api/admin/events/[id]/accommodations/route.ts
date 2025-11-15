import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { createLogger } from '@/lib/logger'

const accommodationLogger = createLogger({ module: 'accommodation', type: 'management' })

const accommodationSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  type: z.string().default('HOTEL'),
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
  amenities: z.array(z.string()).default([]),
  description: z.string().optional(),
  totalRooms: z.number().int().default(0),
  allocatedRooms: z.number().int().default(0),
  checkInTime: z.string().optional(),
  checkOutTime: z.string().optional(),
  earlyCheckIn: z.boolean().default(false),
  lateCheckOut: z.boolean().default(false),
  contractRate: z.number().optional(),
  currency: z.string().default('EUR'),
  blockStartDate: z.string().optional(),
  blockEndDate: z.string().optional(),
  bookingDeadline: z.string().optional(),
  bookingRef: z.string().optional(),
  isPreferred: z.boolean().default(false),
  notes: z.string().optional(),
  internalNotes: z.string().optional(),
})

/**
 * GET /api/admin/events/[id]/accommodations
 * List all accommodations for an event
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params

    const accommodations = await prisma.accommodation.findMany({
      where: { eventId },
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
                  },
                },
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
      orderBy: [
        { isPreferred: 'desc' },
        { isActive: 'desc' },
        { name: 'asc' },
      ],
    })

    // Calculate stats for each accommodation
    const accommodationsWithStats = accommodations.map((acc: any) => {
      const totalAssignments = acc.rooms.reduce(
        (sum: number, room: any) => sum + room.assignments.length,
        0
      )
      const availableRooms = acc.rooms.filter(
        (room: any) => room.status === 'AVAILABLE'
      ).length
      const assignedRooms = acc.rooms.filter(
        (room: any) => room.status === 'ASSIGNED'
      ).length

      return {
        ...acc,
        stats: {
          totalRooms: acc.rooms.length,
          availableRooms,
          assignedRooms,
          totalGuests: totalAssignments,
        },
      }
    })

    return NextResponse.json({ accommodations: accommodationsWithStats })
  } catch (error) {
    accommodationLogger.error({ error, stack: error instanceof Error ? error.stack : undefined }, 'Error fetching accommodations')
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des hébergements' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/events/[id]/accommodations
 * Create a new accommodation
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params
    const body = await request.json()

    // Validate input
    const validatedData = accommodationSchema.parse(body)

    // Convert date strings to Date objects
    const data: any = { ...validatedData, eventId }
    if (validatedData.blockStartDate) {
      data.blockStartDate = new Date(validatedData.blockStartDate)
    }
    if (validatedData.blockEndDate) {
      data.blockEndDate = new Date(validatedData.blockEndDate)
    }
    if (validatedData.bookingDeadline) {
      data.bookingDeadline = new Date(validatedData.bookingDeadline)
    }

    const accommodation = await prisma.accommodation.create({
      data,
      include: {
        rooms: true,
        _count: {
          select: {
            rooms: true,
          },
        },
      },
    })

    return NextResponse.json(
      { accommodation, message: 'Hébergement créé avec succès' },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }
    accommodationLogger.error({ error, stack: error instanceof Error ? error.stack : undefined }, 'Error creating accommodation')
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'hébergement' },
      { status: 500 }
    )
  }
}
