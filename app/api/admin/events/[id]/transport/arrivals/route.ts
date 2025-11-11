import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params

    // Fetch all transport bookings with arrival information
    const arrivals = await prisma.transportBooking.findMany({
      where: {
        eventId,
        arrival: {
          not: null,
        },
      },
      include: {
        guest: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        manifest: {
          select: {
            name: true,
            currentCount: true,
            maxCapacity: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(arrivals)
  } catch (error) {
    console.error('Error fetching arrivals:', error)
    return NextResponse.json({ error: 'Failed to fetch arrivals' }, { status: 500 })
  }
}
