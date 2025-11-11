import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail, sendEmailWithTemplate, TemplateVariables } from '@/lib/email-service';
import {
  generateSaveTheDateEmail,
  generateInvitationEmail,
  generateReminderEmail
} from '@/lib/email-templates';
import { requireAdmin, handleAuthError } from '@/lib/auth-utils';
import { requireEventOwnership } from '@/lib/permissions';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin();
    const { id: eventId } = await params;

    // Verify admin owns this event before sending emails
    await requireEventOwnership(eventId, session.user.id);

    const body = await request.json();
    const { type, guestIds, scheduleFor, templateId } = body;

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

    // Récupère l'intégration email primaire (TOUJOURS nécessaire)
    const emailIntegration = await prisma.emailIntegration.findFirst({
      where: {
        isPrimary: true,
        isActive: true
      }
    });

    if (!emailIntegration) {
      return NextResponse.json(
        {
          error: 'Aucune intégration email active configurée',
          help: 'Veuillez configurer une intégration email (Resend, SendGrid, etc.) dans Paramètres > Intégrations'
        },
        { status: 400 }
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

        // Si un template est fourni, utilise le système de templates
        if (templateId && emailIntegration) {
          const variables: TemplateVariables = {
            'event.name': event.name,
            'event.date': new Date(event.startsAt).toLocaleDateString('fr-FR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }),
            'event.time': new Date(event.startsAt).toLocaleTimeString('fr-FR', {
              hour: '2-digit',
              minute: '2-digit'
            }),
            'event.location': event.venueName || '',
            'event.address': event.address || '',
            'event.description': event.description || '',
            'guest.firstName': guest.firstName,
            'guest.lastName': guest.lastName,
            'guest.email': guest.email,
            'rsvpLink': `${baseUrl}/guest/${guest.token}`,
            'rsvpDeadline': event.rsvpDeadline ? new Date(event.rsvpDeadline).toLocaleDateString('fr-FR') : ''
          };

          await sendEmailWithTemplate(
            templateId,
            variables,
            {
              to: guest.email,
              fromName: emailIntegration.fromName || undefined,
            },
            emailIntegration as any,
            prisma
          );
        } else if (type === 'save-the-date') {
          const config = event.saveTheDateConfig as any || {};

          const html = generateSaveTheDateEmail({
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
            guestName: `${guest.firstName} ${guest.lastName}`,
            logoUrl: config.logoImage,
            headerImage: config.headerImage,
          });

          await sendEmail(
            {
              to: guest.email,
              subject: `${config.eventName || event.name} - Save the Date`,
              html,
            },
            emailIntegration as any
          );
        } else if (type === 'invitation') {
          const invitationConfig = event.invitationConfig as any || {};

          const html = generateInvitationEmail({
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
            guestName: `${guest.firstName} ${guest.lastName}`,
            logoUrl: invitationConfig.logoUrl,
            headerImage: invitationConfig.headerImage,
          });

          await sendEmail(
            {
              to: guest.email,
              subject: `Vous êtes invité(e) - ${event.name}`,
              html,
            },
            emailIntegration as any
          );
        } else if (type === 'reminder') {
          const html = generateReminderEmail({
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
            guestName: `${guest.firstName} ${guest.lastName}`,
            qrCodeUrl: `${baseUrl}/api/qr/${guest.token}`,
            primaryColor: '#004645',
          });

          await sendEmail(
            {
              to: guest.email,
              subject: `Rappel - ${event.name}`,
              html,
            },
            emailIntegration as any
          );
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
    return handleAuthError(error);
  }
}
