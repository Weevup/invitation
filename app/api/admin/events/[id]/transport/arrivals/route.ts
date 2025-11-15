import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { createLogger } from '@/lib/logger'

const arrivalsLogger = createLogger({ module: 'transport', type: 'arrivals' })

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
          not: Prisma.JsonNull,
        },
      },
      include: {
        guest: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
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
    arrivalsLogger.error({ error, stack: error instanceof Error ? error.stack : undefined }, 'Error fetching arrivals')
    return NextResponse.json({ error: 'Failed to fetch arrivals' }, { status: 500 })
  }
}
