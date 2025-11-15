import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createLogger } from '@/lib/logger'

const manifestLogger = createLogger({ module: 'transport', type: 'manifests' })

export const runtime = 'nodejs'

// GET - Récupérer tous les manifestes d'un événement
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params

    const manifests = await prisma.transportManifest.findMany({
      where: {
        eventId
      },
      include: {
        participants: {
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
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Calculer le nombre de participants pour chaque manifeste
    const manifestsWithCount = manifests.map((manifest: any) => ({
      ...manifest,
      currentCount: manifest.participants.length
    }))

    return NextResponse.json({
      success: true,
      manifests: manifestsWithCount
    })

  } catch (error) {
    manifestLogger.error({ error, stack: error instanceof Error ? error.stack : undefined }, 'Error fetching transport manifests')
    return NextResponse.json(
      { error: 'Failed to fetch transport manifests' },
      { status: 500 }
    )
  }
}

// POST - Créer un nouveau manifeste
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params
    const body = await request.json()

    const {
      type,
      name,
      description,
      departure,
      arrival,
      maxCapacity,
      costPerPerson,
      currency,
      status
    } = body

    // Validation des champs requis
    if (!type || !name) {
      return NextResponse.json(
        { error: 'Type and name are required' },
        { status: 400 }
      )
    }

    if (!departure || !departure.date || !departure.time) {
      return NextResponse.json(
        { error: 'Departure date and time are required' },
        { status: 400 }
      )
    }

    if (!arrival || !arrival.date || !arrival.time) {
      return NextResponse.json(
        { error: 'Arrival date and time are required' },
        { status: 400 }
      )
    }

    if (!maxCapacity || maxCapacity < 1) {
      return NextResponse.json(
        { error: 'Max capacity must be at least 1' },
        { status: 400 }
      )
    }

    // Créer le manifeste
    const manifest = await prisma.transportManifest.create({
      data: {
        eventId,
        type,
        name,
        description: description || undefined,
        departure,
        arrival,
        maxCapacity: parseInt(maxCapacity),
        currentCount: 0,
        costPerPerson: costPerPerson ? parseFloat(costPerPerson) : undefined,
        currency: currency || 'EUR',
        status: status || 'DRAFT'
      },
      include: {
        participants: {
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
        }
      }
    })

    return NextResponse.json({
      success: true,
      manifest
    })

  } catch (error) {
    manifestLogger.error({ error, stack: error instanceof Error ? error.stack : undefined }, 'Error creating transport manifest')
    return NextResponse.json(
      { error: 'Failed to create transport manifest' },
      { status: 500 }
    )
  }
}
