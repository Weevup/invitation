import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { emailService } from '@/lib/email-service';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = params.id;
    const body = await request.json();
    const { type, guestIds, scheduleFor } = body;

    // Récupère l'événement et les invités
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        guests: guestIds
          ? { where: { id: { in: guestIds } } }
          : true,
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Événement non trouvé' },
        { status: 404 }
      );
    }

    // Si c'est un envoi programmé
    if (scheduleFor) {
      // TODO: Implémenter la logique de programmation avec un job queue
      // Pour l'instant, on retourne juste un succès
      return NextResponse.json({
        success: true,
        message: `Envoi programmé pour ${new Date(scheduleFor).toLocaleString('fr-FR')}`,
        scheduledCount: event.guests.length,
      });
    }

    // Envoi immédiat
    const results = {
      sent: 0,
      failed: 0,
      errors: [] as string[],
    };

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    for (const guest of event.guests) {
      try {
        // Crée un tracking ID unique
        const trackingId = `${eventId}-${guest.id}-${type}-${Date.now()}`;

        if (type === 'save-the-date') {
          const config = event.saveTheDateConfig as any || {};

          await emailService.sendSaveTheDate({
            to: guest.email,
            toName: `${guest.firstName} ${guest.lastName}`,
            eventName: config.eventName || event.name,
            tagline: config.tagline || 'Réservez la date !',
            dateAnnouncement: config.dateAnnouncement || new Date(event.startsAt).toLocaleDateString('fr-FR'),
            locationHint: config.locationHint || event.city || '',
            teaserMessage: config.teaserMessage || 'Plus de détails à venir...',
            primaryColor: config.primaryColor || '#004645',
            secondaryColor: config.secondaryColor || '#FF4713',
            accentColor: config.accentColor || '#009197',
            backgroundColor: config.backgroundColor || '#9CD9F6',
            ctaText: config.ctaText || 'Je bloque la date',
            ctaLink: config.showInterestForm ? `${baseUrl}/event/${event.slug}` : undefined,
            footerMessage: config.footerMessage || 'Invitation officielle à venir',
            logoUrl: config.logoImage,
            headerImage: config.headerImage,
            trackingId,
          });
        } else if (type === 'invitation') {
          const invitationConfig = event.invitationConfig as any || {};

          await emailService.sendInvitation({
            to: guest.email,
            toName: `${guest.firstName} ${guest.lastName}`,
            eventName: event.name,
            welcomeMessage: invitationConfig.welcomeMessage || 'Vous êtes invité(e) à',
            description: invitationConfig.description || '',
            date: new Date(event.startsAt).toLocaleDateString('fr-FR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }),
            time: new Date(event.startsAt).toLocaleTimeString('fr-FR', {
              hour: '2-digit',
              minute: '2-digit'
            }),
            location: event.venueName || '',
            address: event.address || '',
            primaryColor: invitationConfig.primaryColor || '#004645',
            secondaryColor: invitationConfig.secondaryColor || '#009197',
            accentColor: invitationConfig.accentColor || '#FF4713',
            rsvpLink: `${baseUrl}/guest/${guest.token}`,
            logoUrl: invitationConfig.logoUrl,
            headerImage: invitationConfig.headerImage,
            trackingId,
          });
        } else if (type === 'reminder') {
          await emailService.sendReminder({
            to: guest.email,
            toName: `${guest.firstName} ${guest.lastName}`,
            eventName: event.name,
            date: new Date(event.startsAt).toLocaleDateString('fr-FR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }),
            time: new Date(event.startsAt).toLocaleTimeString('fr-FR', {
              hour: '2-digit',
              minute: '2-digit'
            }),
            location: event.venueName || '',
            address: event.address || '',
            primaryColor: '#004645',
            qrCodeUrl: `${baseUrl}/api/qr/${guest.token}`,
            trackingId,
          });
        }

        // Enregistre le tracking dans la base de données
        await prisma.emailTracking.create({
          data: {
            id: trackingId,
            eventId,
            guestId: guest.id,
            type,
            status: 'sent',
            sentAt: new Date(),
          },
        });

        results.sent++;
      } catch (error) {
        console.error(`Error sending email to ${guest.email}:`, error);
        results.failed++;
        results.errors.push(`${guest.email}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error('Error in send-emails route:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi des emails' },
      { status: 500 }
    );
  }
}
