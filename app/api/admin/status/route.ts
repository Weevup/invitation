import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin, handleAuthError } from '@/lib/auth-utils'

export async function GET() {
  try {
    await requireAdmin()

    const status: any = {
    timestamp: new Date().toISOString(),
    database: {
      connected: false,
      url: process.env.DATABASE_URL ? '✓ Configurée' : '✗ Non configurée',
    },
    tables: {
      users: 0,
      events: 0,
      guests: 0,
    },
    errors: [],
  }

  // Test database connection
  try {
    await prisma.$connect()
    status.database.connected = true

    // Count records
    const [userCount, eventCount, guestCount] = await Promise.all([
      prisma.user.count(),
      prisma.event.count(),
      prisma.guest.count(),
    ])

    status.tables.users = userCount
    status.tables.events = eventCount
    status.tables.guests = guestCount
  } catch (error) {
    status.database.connected = false
    status.errors.push({
      type: 'database',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  } finally {
    await prisma.$disconnect()
  }

    return NextResponse.json(status)
  } catch (error) {
    return handleAuthError(error)
  }
}
