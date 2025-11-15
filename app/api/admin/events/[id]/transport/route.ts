import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createLogger } from '@/lib/logger'

const transportLogger = createLogger({ module: 'transport', type: 'bookings' })

export const runtime = 'nodejs'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params

    // Vérifier que l'événement existe
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true }
    })

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    // Récupérer toutes les réservations de transport
    const bookings = await prisma.transportBooking.findMany({
      where: { eventId },
      include: {
        guest: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      bookings
    })

  } catch (error) {
    transportLogger.error({ error, stack: error instanceof Error ? error.stack : undefined }, 'Error fetching transport bookings')
    return NextResponse.json(
      { error: 'Failed to fetch transport bookings' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params
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

    // Validation
    if (!guestId || !type) {
      return NextResponse.json(
        { error: 'guestId and type are required' },
        { status: 400 }
      )
    }

    // Créer la réservation
    const booking = await prisma.transportBooking.create({
      data: {
        eventId,
        guestId,
        type,
        status: status || 'REQUESTED',
        departure: departure || null,
        arrival: arrival || null,
        carrier: carrier || null,
        bookingRef: bookingRef || null,
        seatNumber: seatNumber || null,
        estimatedCost: estimatedCost ? parseFloat(estimatedCost) : null,
        actualCost: actualCost ? parseFloat(actualCost) : null,
        currency: currency || 'EUR',
        isPaidByCompany: isPaidByCompany ?? true,
        notes: notes || null,
        internalNotes: internalNotes || null
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
    transportLogger.error({ error, stack: error instanceof Error ? error.stack : undefined }, 'Error creating transport booking')
    return NextResponse.json(
      { error: 'Failed to create transport booking' },
      { status: 500 }
    )
  }
}
