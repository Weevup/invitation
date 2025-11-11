import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin, handleAuthError } from '@/lib/auth-utils'
import { requireEventOwnership } from '@/lib/permissions'

/**
 * GET /api/admin/events/[id]/reminders-config
 * Récupère la configuration des auto-reminders pour un événement
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin()
    const { id: eventId } = await params

    await requireEventOwnership(eventId, session.user.id)

    const config = await prisma.eventRemindersConfig.findUnique({
      where: { eventId },
    })

    // Retourner les valeurs par défaut si pas de config
    if (!config) {
      return NextResponse.json({
        enabled: false,
        followUpEnabled: false,
        followUpDays: 7,
        preEventEnabled: false,
        preEventDays: 3,
      })
    }

    return NextResponse.json(config)
  } catch (error) {
    return handleAuthError(error)
  }
}

/**
 * POST /api/admin/events/[id]/reminders-config
 * Sauvegarde ou met à jour la configuration des auto-reminders
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin()
    const { id: eventId } = await params

    await requireEventOwnership(eventId, session.user.id)

    const body = await request.json()
    const {
      enabled,
      followUpEnabled,
      followUpDays,
      preEventEnabled,
      preEventDays,
    } = body

    // Validation basique
    if (followUpEnabled && (!followUpDays || followUpDays < 1)) {
      return NextResponse.json(
        { error: 'followUpDays doit être supérieur à 0' },
        { status: 400 }
      )
    }

    if (preEventEnabled && (!preEventDays || preEventDays < 1)) {
      return NextResponse.json(
        { error: 'preEventDays doit être supérieur à 0' },
        { status: 400 }
      )
    }

    // Upsert la configuration
    const config = await prisma.eventRemindersConfig.upsert({
      where: { eventId },
      update: {
        enabled,
        followUpEnabled,
        followUpDays: followUpEnabled ? followUpDays : null,
        preEventEnabled,
        preEventDays: preEventEnabled ? preEventDays : null,
      },
      create: {
        eventId,
        enabled,
        followUpEnabled,
        followUpDays: followUpEnabled ? followUpDays : null,
        preEventEnabled,
        preEventDays: preEventEnabled ? preEventDays : null,
      },
    })

    return NextResponse.json({
      success: true,
      config,
      message: 'Configuration des rappels sauvegardée',
    })
  } catch (error) {
    console.error('Error saving reminders config:', error)
    return handleAuthError(error)
  }
}
