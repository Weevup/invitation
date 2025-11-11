import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

// GET - Récupérer un manifeste spécifique
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; manifestId: string }> }
) {
  try {
    const { id: eventId, manifestId } = await params

    const manifest = await prisma.transportManifest.findFirst({
      where: {
        id: manifestId,
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
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    })

    if (!manifest) {
      return NextResponse.json(
        { error: 'Manifest not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      manifest: {
        ...manifest,
        currentCount: manifest.participants.length
      }
    })

  } catch (error) {
    console.error('Error fetching transport manifest:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transport manifest' },
      { status: 500 }
    )
  }
}

// PUT - Mettre à jour un manifeste
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; manifestId: string }> }
) {
  try {
    const { id: eventId, manifestId } = await params
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

    // Vérifier que le manifeste existe et appartient à cet événement
    const existingManifest = await prisma.transportManifest.findFirst({
      where: {
        id: manifestId,
        eventId
      },
      include: {
        participants: true
      }
    })

    if (!existingManifest) {
      return NextResponse.json(
        { error: 'Manifest not found' },
        { status: 404 }
      )
    }

    // Vérifier que la nouvelle capacité max est suffisante
    if (maxCapacity !== undefined) {
      const currentParticipantCount = existingManifest.participants.length
      if (parseInt(maxCapacity) < currentParticipantCount) {
        return NextResponse.json(
          {
            error: `Cannot reduce capacity below current participant count (${currentParticipantCount})`
          },
          { status: 400 }
        )
      }
    }

    // Mettre à jour le manifeste
    const manifest = await prisma.transportManifest.update({
      where: { id: manifestId },
      data: {
        ...(type !== undefined && { type }),
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description: description || undefined }),
        ...(departure !== undefined && { departure }),
        ...(arrival !== undefined && { arrival }),
        ...(maxCapacity !== undefined && { maxCapacity: parseInt(maxCapacity) }),
        ...(costPerPerson !== undefined && {
          costPerPerson: costPerPerson ? parseFloat(costPerPerson) : undefined
        }),
        ...(currency !== undefined && { currency }),
        ...(status !== undefined && { status })
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
      manifest: {
        ...manifest,
        currentCount: manifest.participants.length
      }
    })

  } catch (error) {
    console.error('Error updating transport manifest:', error)
    return NextResponse.json(
      { error: 'Failed to update transport manifest' },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer un manifeste
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; manifestId: string }> }
) {
  try {
    const { id: eventId, manifestId } = await params
    const { searchParams } = new URL(request.url)
    const force = searchParams.get('force') === 'true'

    // Vérifier que le manifeste existe et appartient à cet événement
    const existingManifest = await prisma.transportManifest.findFirst({
      where: {
        id: manifestId,
        eventId
      },
      include: {
        participants: true
      }
    })

    if (!existingManifest) {
      return NextResponse.json(
        { error: 'Manifest not found' },
        { status: 404 }
      )
    }

    // Vérifier s'il y a des participants
    if (existingManifest.participants.length > 0 && !force) {
      return NextResponse.json(
        {
          error: 'Cannot delete manifest with participants. Use force=true to delete anyway.',
          participantCount: existingManifest.participants.length
        },
        { status: 400 }
      )
    }

    // Si force=true, supprimer d'abord tous les participants
    if (force && existingManifest.participants.length > 0) {
      await prisma.manifestParticipant.deleteMany({
        where: {
          manifestId
        }
      })
    }

    // Supprimer le manifeste
    await prisma.transportManifest.delete({
      where: { id: manifestId }
    })

    return NextResponse.json({
      success: true,
      message: 'Manifest deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting transport manifest:', error)
    return NextResponse.json(
      { error: 'Failed to delete transport manifest' },
      { status: 500 }
    )
  }
}
