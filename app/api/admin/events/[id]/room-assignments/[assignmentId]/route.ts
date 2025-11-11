import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * DELETE /api/admin/events/[id]/room-assignments/[assignmentId]
 * Delete a room assignment
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; assignmentId: string }> }
) {
  try {
    const { id: eventId, assignmentId } = await params

    // Get the assignment with room info
    const assignment = await prisma.roomAssignment.findUnique({
      where: { id: assignmentId },
      include: {
        room: {
          include: {
            accommodation: true,
            assignments: true,
          },
        },
      },
    })

    if (!assignment) {
      return NextResponse.json(
        { error: 'Assignation non trouvée' },
        { status: 404 }
      )
    }

    // Verify it belongs to this event
    if (assignment.room.accommodation.eventId !== eventId) {
      return NextResponse.json(
        { error: 'Cette assignation n\'appartient pas à cet événement' },
        { status: 400 }
      )
    }

    // Delete the assignment
    await prisma.roomAssignment.delete({
      where: { id: assignmentId },
    })

    // Update room occupancy
    const remainingAssignments = assignment.room.assignments.filter(
      (a) => a.id !== assignmentId
    ).length

    // If no more assignments, set room back to AVAILABLE
    if (remainingAssignments === 0) {
      await prisma.room.update({
        where: { id: assignment.roomId },
        data: {
          status: 'AVAILABLE',
          currentOccupancy: 0,
        },
      })
    } else {
      // Just update occupancy
      await prisma.room.update({
        where: { id: assignment.roomId },
        data: {
          currentOccupancy: remainingAssignments,
        },
      })
    }

    return NextResponse.json({
      message: 'Assignation supprimée avec succès',
    })
  } catch (error) {
    console.error('Error deleting room assignment:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de l\'assignation' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/admin/events/[id]/room-assignments/[assignmentId]
 * Update a room assignment
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; assignmentId: string }> }
) {
  try {
    const { id: eventId, assignmentId } = await params
    const body = await request.json()

    // Get the assignment
    const assignment = await prisma.roomAssignment.findUnique({
      where: { id: assignmentId },
      include: {
        room: {
          include: {
            accommodation: true,
          },
        },
      },
    })

    if (!assignment) {
      return NextResponse.json(
        { error: 'Assignation non trouvée' },
        { status: 404 }
      )
    }

    // Verify it belongs to this event
    if (assignment.room.accommodation.eventId !== eventId) {
      return NextResponse.json(
        { error: 'Cette assignation n\'appartient pas à cet événement' },
        { status: 400 }
      )
    }

    // Update fields
    const updateData: any = {}

    if (body.checkInDate) {
      updateData.checkInDate = new Date(body.checkInDate)
    }
    if (body.checkOutDate) {
      updateData.checkOutDate = new Date(body.checkOutDate)
    }
    if (body.isConfirmed !== undefined) {
      updateData.isConfirmed = body.isConfirmed
      if (body.isConfirmed && !assignment.confirmedAt) {
        updateData.confirmedAt = new Date()
      }
    }
    if (body.isPaid !== undefined) {
      updateData.isPaid = body.isPaid
    }
    if (body.paidAmount !== undefined) {
      updateData.paidAmount = body.paidAmount
    }
    if (body.specialRequests !== undefined) {
      updateData.specialRequests = body.specialRequests
    }
    if (body.notes !== undefined) {
      updateData.notes = body.notes
    }
    if (body.preferencesMet !== undefined) {
      updateData.preferencesMet = body.preferencesMet
    }

    // Recalculate number of nights if dates changed
    if (updateData.checkInDate || updateData.checkOutDate) {
      const checkIn = updateData.checkInDate || assignment.checkInDate
      const checkOut = updateData.checkOutDate || assignment.checkOutDate

      if (checkOut <= checkIn) {
        return NextResponse.json(
          { error: 'La date de départ doit être après la date d\'arrivée' },
          { status: 400 }
        )
      }

      updateData.numberOfNights = Math.ceil(
        (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
      )
    }

    const updated = await prisma.roomAssignment.update({
      where: { id: assignmentId },
      data: updateData,
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

    return NextResponse.json({
      assignment: updated,
      message: 'Assignation mise à jour avec succès',
    })
  } catch (error) {
    console.error('Error updating room assignment:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de l\'assignation' },
      { status: 500 }
    )
  }
}
