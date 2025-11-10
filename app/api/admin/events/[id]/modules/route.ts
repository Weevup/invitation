import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = params.id

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

    // Récupérer tous les modules de l'événement
    const modules = await prisma.eventModule.findMany({
      where: { eventId },
      select: {
        moduleType: true,
        isActive: true,
        config: true,
        updatedAt: true
      },
      orderBy: { moduleType: 'asc' }
    })

    // Transformer pour le format attendu par le hook
    const formattedModules = modules.map(m => ({
      type: m.moduleType,
      isActive: m.isActive,
      config: m.config,
      updatedAt: m.updatedAt
    }))

    return NextResponse.json({
      success: true,
      modules: formattedModules
    })

  } catch (error) {
    console.error('Error fetching event modules:', error)
    return NextResponse.json(
      { error: 'Failed to fetch modules' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = params.id
    const body = await request.json()
    const { moduleType, isActive, config } = body

    if (!moduleType) {
      return NextResponse.json(
        { error: 'moduleType is required' },
        { status: 400 }
      )
    }

    // Upsert le module
    const module = await prisma.eventModule.upsert({
      where: {
        eventId_moduleType: {
          eventId,
          moduleType
        }
      },
      create: {
        eventId,
        moduleType,
        isActive: isActive ?? true,
        config: config ?? null
      },
      update: {
        isActive: isActive ?? undefined,
        config: config !== undefined ? config : undefined
      }
    })

    return NextResponse.json({
      success: true,
      module: {
        type: module.moduleType,
        isActive: module.isActive,
        config: module.config
      }
    })

  } catch (error) {
    console.error('Error updating event module:', error)
    return NextResponse.json(
      { error: 'Failed to update module' },
      { status: 500 }
    )
  }
}
