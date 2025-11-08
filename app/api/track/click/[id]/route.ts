import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const url = request.nextUrl.searchParams.get('url');
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const redirectUrl = url || baseUrl;

  try {
    const { id: trackingId } = await params;

    // trackingId format: eventId-guestId-type-timestamp
    const tracking = await prisma.emailTracking.findUnique({
      where: { id: trackingId },
    });

    if (tracking) {
      // Met à jour le statut du tracking (et aussi openedAt si pas déjà ouvert)
      await prisma.emailTracking.update({
        where: { id: trackingId },
        data: {
          status: 'clicked',
          clickedAt: new Date(),
          ...(tracking.openedAt ? {} : { openedAt: new Date() }),
        },
      });

      // Met aussi à jour EmailLog associé
      await prisma.emailLog.updateMany({
        where: {
          eventId: tracking.eventId,
          guestId: tracking.guestId,
        },
        data: {
          status: 'CLICKED',
          clickedAt: new Date(),
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

    // Redirige vers l'URL cible
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('Error tracking email click:', error);

    // Redirige quand même vers l'URL même en cas d'erreur
    return NextResponse.redirect(redirectUrl);
  }
}
