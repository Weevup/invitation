import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createLogger } from '@/lib/logger'

const transportLogger = createLogger({ module: 'transport', type: 'operations' })

export const runtime = 'nodejs'

// GET - Récupérer une réservation spécifique
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; bookingId: string }> }
) {
  try {
    const { id: eventId, bookingId } = await params

    const booking = await prisma.transportBooking.findFirst({
      where: {
        id: bookingId,
        eventId
      },
      include: {
        guest: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      booking
    })

  } catch (error) {
    transportLogger.error({ error, stack: error instanceof Error ? error.stack : undefined }, 'Error fetching transport booking')
    return NextResponse.json(
      { error: 'Failed to fetch transport booking' },
      { status: 500 }
    )
  }
}

// PUT - Mettre à jour une réservation
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; bookingId: string }> }
) {
  try {
    const { id: eventId, bookingId } = await params
    const body = await request.json()

    const {
      guestId,
      type,
      status,
      departure,
      arrival,
      carrier,
      bookingRef,
      seatNumber,
      estimatedCost,
      actualCost,
      currency,
      isPaidByCompany,
      notes,
      internalNotes
    } = body

    // Vérifier que la réservation existe et appartient à cet événement
    const existingBooking = await prisma.transportBooking.findFirst({
      where: {
        id: bookingId,
        eventId
      }
    })

    if (!existingBooking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Mettre à jour la réservation
    const booking = await prisma.transportBooking.update({
      where: { id: bookingId },
      data: {
        ...(guestId !== undefined && { guestId }),
        ...(type !== undefined && { type }),
        ...(status !== undefined && { status }),
        ...(departure !== undefined && { departure }),
        ...(arrival !== undefined && { arrival }),
        ...(carrier !== undefined && { carrier: carrier || null }),
        ...(bookingRef !== undefined && { bookingRef: bookingRef || null }),
        ...(seatNumber !== undefined && { seatNumber: seatNumber || null }),
        ...(estimatedCost !== undefined && {
          estimatedCost: estimatedCost ? parseFloat(estimatedCost) : null
        }),
        ...(actualCost !== undefined && {
          actualCost: actualCost ? parseFloat(actualCost) : null
        }),
        ...(currency !== undefined && { currency }),
        ...(isPaidByCompany !== undefined && { isPaidByCompany }),
        ...(notes !== undefined && { notes: notes || null }),
        ...(internalNotes !== undefined && { internalNotes: internalNotes || null })
      },
      include: {
        guest: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      booking
    })

  } catch (error) {
    transportLogger.error({ error, stack: error instanceof Error ? error.stack : undefined }, 'Error updating transport booking')
    return NextResponse.json(
      { error: 'Failed to update transport booking' },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer une réservation
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; bookingId: string }> }
) {
  try {
    const { id: eventId, bookingId } = await params

    // Vérifier que la réservation existe et appartient à cet événement
    const existingBooking = await prisma.transportBooking.findFirst({
      where: {
        id: bookingId,
        eventId
      }
    })

    if (!existingBooking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Supprimer la réservation
    await prisma.transportBooking.delete({
      where: { id: bookingId }
    })

    return NextResponse.json({
      success: true,
      message: 'Booking deleted successfully'
    })

  } catch (error) {
    transportLogger.error({ error, stack: error instanceof Error ? error.stack : undefined }, 'Error deleting transport booking')
    return NextResponse.json(
      { error: 'Failed to delete transport booking' },
      { status: 500 }
    )
  }
}
