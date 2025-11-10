import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin, handleAuthError } from '@/lib/auth-utils'

export async function POST() {
  try {
    // CRITICAL: Verify admin authentication before clearing database
    await requireAdmin()

    // Additional safety: Only allow in development
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        {
          success: false,
          error: 'Cette opération est désactivée en production',
        },
        { status: 403 }
      )
    }

    // Delete in correct order to respect foreign key constraints

    // 1. Delete EmailLogs (depends on Guest and Event)
    const emailLogsDeleted = await prisma.emailLog.deleteMany({})

    // 2. Delete Checkins (depends on Guest and Event)
    const checkinsDeleted = await prisma.checkin.deleteMany({})

    // 3. Delete RSVPs (depends on Guest and Event)
    const rsvpsDeleted = await prisma.rSVP.deleteMany({})

    // 4. Delete Guests (depends on Event)
    const guestsDeleted = await prisma.guest.deleteMany({})

    // 5. Delete Events (depends on User)
    const eventsDeleted = await prisma.event.deleteMany({})

    // 6. Delete Users (last)
    const usersDeleted = await prisma.user.deleteMany({})

    return NextResponse.json({
      success: true,
      message: 'Base de données vidée avec succès',
      deleted: {
        emailLogs: emailLogsDeleted.count,
        checkins: checkinsDeleted.count,
        rsvps: rsvpsDeleted.count,
        guests: guestsDeleted.count,
        events: eventsDeleted.count,
        users: usersDeleted.count,
      },
    })
  } catch (error) {
    console.error('Error clearing database:', error)
    return handleAuthError(error)
  }
}
