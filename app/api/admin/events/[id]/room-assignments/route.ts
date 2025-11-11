import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const assignmentSchema = z.object({
  roomId: z.string().min(1, 'L\'ID de la chambre est requis'),
  guestId: z.string().min(1, 'L\'ID de l\'invité est requis'),
  checkInDate: z.string().min(1, 'La date d\'arrivée est requise'),
  checkOutDate: z.string().min(1, 'La date de départ est requise'),
  isPrimaryGuest: z.boolean().default(true),
  preferencesMet: z.array(z.string()).default([]),
  specialRequests: z.string().optional(),
  notes: z.string().optional(),
})

/**
 * GET /api/admin/events/[id]/room-assignments
 * List all room assignments for an event
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params
    const { searchParams } = new URL(request.url)
    const guestId = searchParams.get('guestId')
    const accommodationId = searchParams.get('accommodationId')

    // Build where clause
    const where: any = {}

    if (guestId) {
      where.guestId = guestId
    }

    if (accommodationId) {
      where.room = {
        accommodationId,
      }
    }

    // Get all assignments
    const assignments = await prisma.roomAssignment.findMany({
      where,
      include: {
        room: {
          include: {
            accommodation: {
              select: {
                id: true,
                name: true,
                address: true,
                city: true,
              },
            },
          },
        },
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
      orderBy: [
        { checkInDate: 'asc' },
        { isPrimaryGuest: 'desc' },
      ],
    })

    // Filter by eventId (via accommodation)
    const filteredAssignments = assignments.filter(
      (a) => a.room.accommodation.id !== undefined
    )

    return NextResponse.json({ assignments: filteredAssignments })
  } catch (error) {
    console.error('Error fetching room assignments:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des assignations' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/events/[id]/room-assignments
 * Create a new room assignment
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params
    const body = await request.json()

    // Validate input
    const validatedData = assignmentSchema.parse(body)

    // Check if guest exists
    const guest = await prisma.guest.findUnique({
      where: { id: validatedData.guestId },
    })

    if (!guest || guest.eventId !== eventId) {
      return NextResponse.json(
        { error: 'Invité non trouvé' },
        { status: 404 }
      )
    }

    // Check if room exists
    const room = await prisma.room.findUnique({
      where: { id: validatedData.roomId },
      include: {
        accommodation: true,
        assignments: true,
      },
    })

    if (!room) {
      return NextResponse.json(
        { error: 'Chambre non trouvée' },
        { status: 404 }
      )
    }

    if (room.accommodation.eventId !== eventId) {
      return NextResponse.json(
        { error: 'Cette chambre n\'appartient pas à cet événement' },
        { status: 400 }
      )
    }

    // Check if guest is already assigned to this room
    const existingAssignment = await prisma.roomAssignment.findUnique({
      where: {
        roomId_guestId: {
          roomId: validatedData.roomId,
          guestId: validatedData.guestId,
        },
      },
    })

    if (existingAssignment) {
      return NextResponse.json(
        { error: 'Cet invité est déjà assigné à cette chambre' },
        { status: 400 }
      )
    }

    // Check room capacity
    if (room.assignments.length >= room.maxOccupancy) {
      return NextResponse.json(
        { error: 'Cette chambre a atteint sa capacité maximale' },
        { status: 400 }
      )
    }

    // Convert dates
    const checkInDate = new Date(validatedData.checkInDate)
    const checkOutDate = new Date(validatedData.checkOutDate)

    if (checkOutDate <= checkInDate) {
      return NextResponse.json(
        { error: 'La date de départ doit être après la date d\'arrivée' },
        { status: 400 }
      )
    }

    // Calculate number of nights
    const numberOfNights = Math.ceil(
      (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
    )

    // Create assignment
    const assignment = await prisma.roomAssignment.create({
      data: {
        roomId: validatedData.roomId,
        guestId: validatedData.guestId,
        checkInDate,
        checkOutDate,
        numberOfNights,
        isPrimaryGuest: validatedData.isPrimaryGuest,
        preferencesMet: validatedData.preferencesMet,
        specialRequests: validatedData.specialRequests,
        notes: validatedData.notes,
      },
      include: {
        room: {
          include: {
            accommodation: true,
          },
        },
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

    // Update room status to ASSIGNED if it's not already
    if (room.status === 'AVAILABLE') {
      await prisma.room.update({
        where: { id: validatedData.roomId },
        data: {
          status: 'ASSIGNED',
          currentOccupancy: room.assignments.length + 1,
        },
      })
    } else {
      // Just update occupancy
      await prisma.room.update({
        where: { id: validatedData.roomId },
        data: {
          currentOccupancy: room.assignments.length + 1,
        },
      })
    }

    return NextResponse.json(
      { assignment, message: 'Assignation créée avec succès' },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Error creating room assignment:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'assignation' },
      { status: 500 }
    )
  }
}
