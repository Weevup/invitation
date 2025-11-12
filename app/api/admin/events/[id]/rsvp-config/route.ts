import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, handleAuthError } from '@/lib/auth-utils';
import { requireEventOwnership } from '@/lib/permissions';

// GET - Récupérer la configuration RSVP
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin();
    const { id: eventId } = await params;

    // Verify ownership
    await requireEventOwnership(eventId, session.user.id);

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        rsvpConfig: true,
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Événement non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json(event.rsvpConfig || {});
  } catch (error) {
    return handleAuthError(error);
  }
}

// POST - Sauvegarder la configuration RSVP
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin();
    const { id: eventId } = await params;

    // Verify ownership before updating config
    await requireEventOwnership(eventId, session.user.id);

    const config = await request.json();

    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: {
        rsvpConfig: config,
      },
    });

    return NextResponse.json({
      success: true,
      config: updatedEvent.rsvpConfig,
    });
  } catch (error) {
    return handleAuthError(error);
  }
}
