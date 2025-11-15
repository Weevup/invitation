import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, handleAuthError } from '@/lib/auth-utils';
import { createLogger } from '@/lib/logger';

const statsLogger = createLogger({ module: 'email', type: 'stats' });
import { requireEventOwnership } from '@/lib/permissions';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin();
    const { id: eventId } = await params;

    // Verify ownership
    await requireEventOwnership(eventId, session.user.id);

    // Get all email logs for this event
    const emailLogs = await prisma.emailLog.findMany({
      where: {
        eventId: eventId
      },
      select: {
        type: true,
        status: true,
        sentAt: true,
        openedAt: true,
        clickedAt: true
      }
    });

    // Get RSVP count
    const rsvpCount = await prisma.rSVP.count({
      where: {
        guest: {
          eventId: eventId
        },
        attending: {
          not: null
        }
      }
    });

    // Calculate stats by email type
    const stats = {
      saveTheDate: {
        sent: 0,
        opened: 0,
        clicked: 0
      },
      invitation: {
        sent: 0,
        opened: 0,
        clicked: 0,
        rsvpReceived: rsvpCount
      },
      reminder: {
        sent: 0,
        opened: 0
      }
    };

    emailLogs.forEach(log => {
      const isSent = log.status === 'SENT' || log.status === 'DELIVERED' || log.status === 'OPENED' || log.status === 'CLICKED';
      const isOpened = log.status === 'OPENED' || log.status === 'CLICKED';
      const isClicked = log.status === 'CLICKED';

      if (log.type === 'SAVE_THE_DATE') {
        if (isSent) stats.saveTheDate.sent++;
        if (isOpened) stats.saveTheDate.opened++;
        if (isClicked) stats.saveTheDate.clicked++;
      } else if (log.type === 'INVITE' || log.type === 'INVITATION') {
        if (isSent) stats.invitation.sent++;
        if (isOpened) stats.invitation.opened++;
        if (isClicked) stats.invitation.clicked++;
      } else if (log.type === 'REMINDER') {
        if (isSent) stats.reminder.sent++;
        if (isOpened) stats.reminder.opened++;
      }
    });

    return NextResponse.json(stats);
  } catch (error) {
    statsLogger.error({ error, stack: error instanceof Error ? error.stack : undefined }, 'Error fetching email stats');
    return handleAuthError(error);
  }
}
