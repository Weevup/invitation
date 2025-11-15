import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createLogger } from '@/lib/logger';

const trackingLogger = createLogger({ module: 'tracking', type: 'click' });

/**
 * Validate that the redirect URL is safe and belongs to our domain
 */
function isValidRedirectUrl(url: string | null): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  // If no URL provided, use base URL
  if (!url) {
    return baseUrl;
  }

  try {
    const parsed = new URL(url);
    const baseUrlParsed = new URL(baseUrl);

    // Only allow redirects to:
    // 1. Same origin as NEXT_PUBLIC_APP_URL
    // 2. Localhost (for development)
    const allowedHosts = [
      baseUrlParsed.hostname,
      'localhost',
      '127.0.0.1',
    ];

    if (allowedHosts.includes(parsed.hostname)) {
      return url;
    }

    // Invalid URL, fallback to base
    trackingLogger.warn({ hostname: parsed.hostname, url }, 'Rejected redirect to untrusted host');
    return baseUrl;
  } catch (error) {
    // Invalid URL format, fallback to base
    trackingLogger.warn({ url, error }, 'Invalid redirect URL format');
    return baseUrl;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const url = request.nextUrl.searchParams.get('url');
  const redirectUrl = isValidRedirectUrl(url);

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
    trackingLogger.error({ error, stack: error instanceof Error ? error.stack : undefined, url: redirectUrl }, 'Error tracking email click');

    // Redirige quand même vers l'URL même en cas d'erreur
    return NextResponse.redirect(redirectUrl);
  }
}
