import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin, handleAuthError } from '@/lib/auth-utils'
import { requireEventOwnership } from '@/lib/permissions'

/**
 * GET /api/admin/events/[id]
 * Récupère les détails d'un événement (avec vérification d'ownership)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin()
    const { id } = await params

    // Vérifier que l'admin est propriétaire de l'événement
    await requireEventOwnership(id, session.user.id)

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        guests: {
          include: {
            rsvp: true,
            checkins: {
              orderBy: {
                checkedInAt: 'desc',
              },
            },
          },
          orderBy: {
            lastName: 'asc',
          },
        },
      },
    })

    if (!event) {
      return NextResponse.json(
        { error: 'Événement introuvable' },
        { status: 404 }
      )
    }

    return NextResponse.json(event)
  } catch (error) {
    return handleAuthError(error)
  }
}

/**
 * PUT /api/admin/events/[id]
 * Met à jour un événement (avec vérification d'ownership)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin()
    const { id } = await params
    const body = await request.json()

    // Vérifier que l'admin est propriétaire de l'événement
    await requireEventOwnership(id, session.user.id)

    const event = await prisma.event.update({
      where: { id },
      data: body,
    })

    return NextResponse.json(event)
  } catch (error) {
    return handleAuthError(error)
  }
}

/**
 * DELETE /api/admin/events/[id]
 * Supprime un événement (avec vérification d'ownership)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin()
    const { id } = await params

    // Vérifier que l'admin est propriétaire de l'événement
    await requireEventOwnership(id, session.user.id)

    await prisma.event.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleAuthError(error)
  }
}
