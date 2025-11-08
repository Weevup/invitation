import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Récupérer la configuration Save the Date
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        saveTheDateConfig: true,
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Événement non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json(event.saveTheDateConfig || {});
  } catch (error) {
    console.error('Error fetching Save the Date config:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la configuration' },
      { status: 500 }
    );
  }
}

// POST - Sauvegarder la configuration Save the Date
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;
    const config = await request.json();

    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: {
        saveTheDateConfig: config,
      },
    });

    return NextResponse.json({
      success: true,
      config: updatedEvent.saveTheDateConfig,
    });
  } catch (error) {
    console.error('Error saving Save the Date config:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la sauvegarde de la configuration' },
      { status: 500 }
    );
  }
}
