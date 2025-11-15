import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createLogger } from '@/lib/logger'

const moduleLogger = createLogger({ module: 'event', type: 'modules' })

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
    moduleLogger.error({ error, stack: error instanceof Error ? error.stack : undefined }, 'Error fetching event modules')
    return NextResponse.json(
      { error: 'Failed to fetch modules' },
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
    const { moduleType, isActive, config } = body

    if (!moduleType) {
      return NextResponse.json(
        { error: 'moduleType is required' },
        { status: 400 }
      )
    }

    // Valider la configuration si fournie
    if (config) {
      const { validateModuleConfig } = await import('@/lib/modules/permissions')
      const validation = validateModuleConfig(moduleType, config)

      if (!validation.valid) {
        return NextResponse.json(
          {
            error: 'Configuration invalide',
            details: validation.errors
          },
          { status: 400 }
        )
      }
    }

    // Upsert le module
    const eventModule = await prisma.eventModule.upsert({
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
        config: config ?? undefined
      },
      update: {
        isActive: isActive ?? undefined,
        config: config !== undefined ? config : undefined
      }
    })

    return NextResponse.json({
      success: true,
      module: {
        type: eventModule.moduleType,
        isActive: eventModule.isActive,
        config: eventModule.config
      }
    })

  } catch (error) {
    moduleLogger.error({ error, stack: error instanceof Error ? error.stack : undefined }, 'Error updating event module')
    return NextResponse.json(
      { error: 'Failed to update module' },
      { status: 500 }
    )
  }
}
