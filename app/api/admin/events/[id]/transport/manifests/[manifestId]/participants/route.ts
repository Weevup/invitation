import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createLogger } from '@/lib/logger'

const participantLogger = createLogger({ module: 'transport', type: 'participants' })

export const runtime = 'nodejs'

// POST - Ajouter un invité au manifeste
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; manifestId: string }> }
) {
  try {
    const { id: eventId, manifestId } = await params
    const body = await request.json()

    const { guestId, seatNumber } = body

    if (!guestId) {
      return NextResponse.json(
        { error: 'Guest ID is required' },
        { status: 400 }
      )
    }

    // Vérifier que le manifeste existe et appartient à cet événement
    const manifest = await prisma.transportManifest.findFirst({
      where: {
        id: manifestId,
        eventId
      },
      include: {
        participants: true
      }
    })

    if (!manifest) {
      return NextResponse.json(
        { error: 'Manifest not found' },
        { status: 404 }
      )
    }

    // Vérifier que l'invité existe et appartient à cet événement
    const guest = await prisma.guest.findFirst({
      where: {
        id: guestId,
        eventId
      }
    })

    if (!guest) {
      return NextResponse.json(
        { error: 'Guest not found' },
        { status: 404 }
      )
    }

    // Vérifier que l'invité n'est pas déjà dans ce manifeste
    const existingParticipant = manifest.participants.find(
      (p: any) => p.guestId === guestId
    )

    if (existingParticipant) {
      return NextResponse.json(
        { error: 'Guest is already in this manifest' },
        { status: 400 }
      )
    }

    // Vérifier la capacité
    if (manifest.maxCapacity && manifest.participants.length >= manifest.maxCapacity) {
      return NextResponse.json(
        {
          error: 'Manifest is full',
          currentCount: manifest.participants.length,
          maxCapacity: manifest.maxCapacity
        },
        { status: 400 }
      )
    }

    // Vérifier si le numéro de siège est déjà pris
    if (seatNumber) {
      const seatTaken = manifest.participants.find(
        (p: any) => p.seatNumber === seatNumber
      )
      if (seatTaken) {
        return NextResponse.json(
          { error: `Seat ${seatNumber} is already taken` },
          { status: 400 }
        )
      }
    }

    // Ajouter le participant
    const participant = await prisma.manifestParticipant.create({
      data: {
        manifestId,
        guestId,
        seatNumber: seatNumber || undefined
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

    // Mettre à jour le compteur du manifeste
    await prisma.transportManifest.update({
      where: { id: manifestId },
      data: {
        currentCount: manifest.participants.length + 1,
        // Passer le statut à FULL si la capacité est atteinte
        ...(manifest.maxCapacity && manifest.participants.length + 1 >= manifest.maxCapacity && {
          status: 'FULL'
        })
      }
    })

    return NextResponse.json({
      success: true,
      participant
    })

  } catch (error) {
    participantLogger.error({ error, stack: error instanceof Error ? error.stack : undefined }, 'Error adding participant to manifest')
    return NextResponse.json(
      { error: 'Failed to add participant to manifest' },
      { status: 500 }
    )
  }
}

// DELETE - Retirer un invité du manifeste
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; manifestId: string }> }
) {
  try {
    const { id: eventId, manifestId } = await params
    const { searchParams } = new URL(request.url)
    const participantId = searchParams.get('participantId')
    const guestId = searchParams.get('guestId')

    if (!participantId && !guestId) {
      return NextResponse.json(
        { error: 'Either participantId or guestId is required' },
        { status: 400 }
      )
    }

    // Vérifier que le manifeste existe et appartient à cet événement
    const manifest = await prisma.transportManifest.findFirst({
      where: {
        id: manifestId,
        eventId
      },
      include: {
        participants: true
      }
    })

    if (!manifest) {
      return NextResponse.json(
        { error: 'Manifest not found' },
        { status: 404 }
      )
    }

    // Trouver le participant à supprimer
    let participantToDelete
    if (participantId) {
      participantToDelete = await prisma.manifestParticipant.findFirst({
        where: {
          id: participantId,
          manifestId
        }
      })
    } else if (guestId) {
      participantToDelete = await prisma.manifestParticipant.findFirst({
        where: {
          guestId,
          manifestId
        }
      })
    }

    if (!participantToDelete) {
      return NextResponse.json(
        { error: 'Participant not found in this manifest' },
        { status: 404 }
      )
    }

    // Supprimer le participant
    await prisma.manifestParticipant.delete({
      where: {
        id: participantToDelete.id
      }
    })

    // Mettre à jour le compteur du manifeste
    const newCount = manifest.participants.length - 1
    await prisma.transportManifest.update({
      where: { id: manifestId },
      data: {
        currentCount: newCount,
        // Si le manifeste était FULL, le repasser à OPEN
        ...(manifest.status === 'FULL' && {
          status: 'OPEN'
        })
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Participant removed from manifest'
    })

  } catch (error) {
    participantLogger.error({ error, stack: error instanceof Error ? error.stack : undefined }, 'Error removing participant from manifest')
    return NextResponse.json(
      { error: 'Failed to remove participant from manifest' },
      { status: 500 }
    )
  }
}
