import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createLogger } from '@/lib/logger'

const logger = createLogger({ module: 'checkin-admin' })

// DELETE - Cancel a check-in
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; checkinId: string }> }
) {
  const { id: eventId, checkinId } = await params

  try {
    // Verify the checkin exists and belongs to this event
    const checkin = await prisma.checkin.findFirst({
      where: {
        id: checkinId,
        eventId: eventId
      },
      include: {
        guest: true
      }
    })

    if (!checkin) {
      return NextResponse.json(
        { error: 'Check-in non trouvé' },
        { status: 404 }
      )
    }

    // Delete the checkin
    await prisma.checkin.delete({
      where: { id: checkinId }
    })

    logger.info({ checkinId, guestId: checkin.guestId, eventId }, 'Check-in cancelled')

    return NextResponse.json({
      success: true,
      message: 'Check-in annulé',
      guest: checkin.guest
    })
  } catch (error) {
    logger.error({ error, checkinId, eventId }, 'Error cancelling check-in')
    return NextResponse.json(
      { error: 'Erreur lors de l\'annulation' },
      { status: 500 }
    )
  }
}
