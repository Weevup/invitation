import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const trackingId = params.id;
    const url = request.nextUrl.searchParams.get('url');

    if (!url) {
      return NextResponse.json({ error: 'URL parameter missing' }, { status: 400 });
    }

    // Met à jour le statut du tracking
    await prisma.emailTracking.update({
      where: { id: trackingId },
      data: {
        status: 'clicked',
        clickedAt: new Date(),
      },
    });

    // Redirige vers l'URL cible
    return NextResponse.redirect(url);
  } catch (error) {
    console.error('Error tracking email click:', error);

    // Redirige quand même vers l'URL même en cas d'erreur
    const url = request.nextUrl.searchParams.get('url');
    if (url) {
      return NextResponse.redirect(url);
    }

    return NextResponse.json({ error: 'Tracking error' }, { status: 500 });
  }
}
