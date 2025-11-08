import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Retourne un pixel transparent 1x1
  const pixel = Buffer.from(
    'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
    'base64'
  );

  try {
    const { id: trackingId } = await params;

    // trackingId format: eventId-guestId-type-timestamp
    const tracking = await prisma.emailTracking.findUnique({
      where: { id: trackingId },
    });

    if (tracking && !tracking.openedAt) {
      // Met à jour le statut du tracking
      await prisma.emailTracking.update({
        where: { id: trackingId },
        data: {
          status: 'opened',
          openedAt: new Date(),
        },
      });

      // Met aussi à jour EmailLog associé
      await prisma.emailLog.updateMany({
        where: {
          eventId: tracking.eventId,
          guestId: tracking.guestId,
          openedAt: null,
        },
        data: {
          status: 'OPENED',
          openedAt: new Date(),
        },
      });

      // Met à jour le statut du guest si nécessaire
      await prisma.guest.updateMany({
        where: {
          id: tracking.guestId,
          status: 'INVITED',
        },
        data: {
          status: 'RESPONDED',
        },
      });
    }

    return new NextResponse(pixel, {
      headers: {
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Error tracking email open:', error);

    // Retourne quand même un pixel même en cas d'erreur
    return new NextResponse(pixel, {
      headers: {
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  }
}
