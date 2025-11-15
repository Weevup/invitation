import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin, handleAuthError } from '@/lib/auth-utils'
import { createLogger } from '@/lib/logger'

const dbStatusLogger = createLogger({ module: 'admin', type: 'database-status' })

interface TableStatus {
  name: string
  exists: boolean
  columnCount?: number
  missingColumns?: string[]
}

interface EnumStatus {
  name: string
  exists: boolean
}

export async function GET() {
  try {
    await requireAdmin()

    const status = {
      enums: [] as EnumStatus[],
      tables: [] as TableStatus[],
      overall: {
        allTablesExist: false,
        allEnumsExist: false,
        tablesComplete: 0,
        totalTables: 21,
        enumsComplete: 0,
        totalEnums: 5,
      }
    }

    // =====================================================
    // Vérifier les ENUMs
    // =====================================================

    const enumsToCheck = [
      'UserRole',
      'GuestStatus',
      'EmailType',
      'EmailStatus',
      'EmailProvider'
    ]

    for (const enumName of enumsToCheck) {
      try {
        const result = await prisma.$queryRaw<Array<{ exists: boolean }>>`
          SELECT EXISTS (
            SELECT 1 FROM pg_type WHERE typname = ${enumName}
          ) as exists
        `
        const exists = result[0]?.exists || false
        status.enums.push({ name: enumName, exists })
        if (exists) status.overall.enumsComplete++
      } catch {
        status.enums.push({ name: enumName, exists: false })
      }
    }

    status.overall.allEnumsExist = status.overall.enumsComplete === status.overall.totalEnums

    // =====================================================
    // Vérifier les Tables
    // =====================================================

    const tablesToCheck = [
      {
        name: 'User',
        requiredColumns: ['id', 'email', 'role', 'createdAt', 'updatedAt']
      },
      {
        name: 'Event',
        requiredColumns: ['id', 'name', 'slug', 'startsAt', 'adminId', 'showcaseEnabled',
                         'rsvpDeadline', 'maxPlusOnes', 'showcaseGallery']
      },
      {
        name: 'Guest',
        requiredColumns: ['id', 'eventId', 'firstName', 'lastName', 'email', 'token',
                         'tokenHash', 'status']
      },
      {
        name: 'RSVP',
        requiredColumns: ['id', 'eventId', 'guestId', 'attending', 'qrCodeId']
      },
      {
        name: 'Checkin',
        requiredColumns: ['id', 'eventId', 'guestId', 'qrCodeId', 'checkedInAt']
      },
      {
        name: 'EmailLog',
        requiredColumns: ['id', 'eventId', 'guestId', 'type', 'status', 'subject']
      },
      {
        name: 'EmailTracking',
        requiredColumns: ['id', 'eventId', 'guestId', 'type', 'status', 'sentAt']
      },
      {
        name: 'EmailIntegration',
        requiredColumns: ['id', 'provider', 'isActive', 'isPrimary', 'trackOpens', 'trackClicks']
      },
      {
        name: 'EmailTemplate',
        requiredColumns: ['id', 'name', 'slug', 'type', 'subject', 'htmlContent', 'primaryColor']
      },
      {
        name: 'EventModule',
        requiredColumns: ['id', 'eventId', 'moduleType', 'isActive']
      },
      {
        name: 'TransportBooking',
        requiredColumns: ['id', 'eventId', 'guestId', 'transportType', 'status']
      },
      {
        name: 'TransportManifest',
        requiredColumns: ['id', 'eventId', 'transportType', 'direction']
      },
      {
        name: 'ManifestParticipant',
        requiredColumns: ['id', 'manifestId', 'bookingId', 'guestId']
      },
      {
        name: 'Session',
        requiredColumns: ['id', 'eventId', 'title', 'type', 'startTime', 'endTime']
      },
      {
        name: 'SessionParticipant',
        requiredColumns: ['id', 'sessionId', 'guestId', 'status']
      },
      {
        name: 'TimelineEvent',
        requiredColumns: ['id', 'eventId', 'type', 'startTime']
      },
      {
        name: 'Accommodation',
        requiredColumns: ['id', 'eventId', 'name', 'type', 'totalRooms']
      },
      {
        name: 'Room',
        requiredColumns: ['id', 'accommodationId', 'roomNumber', 'type', 'capacity']
      },
      {
        name: 'RoomAssignment',
        requiredColumns: ['id', 'roomId', 'guestId', 'status']
      },
      {
        name: 'ScheduledEmail',
        requiredColumns: ['id', 'eventId', 'type', 'scheduledFor']
      },
      {
        name: 'EventRemindersConfig',
        requiredColumns: ['id', 'eventId', 'enabled']
      }
    ]

    for (const table of tablesToCheck) {
      try {
        // Vérifier si la table existe
        const tableExists = await prisma.$queryRaw<Array<{ exists: boolean }>>`
          SELECT EXISTS (
            SELECT FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_name = ${table.name}
          ) as exists
        `

        const exists = tableExists[0]?.exists || false

        if (!exists) {
          status.tables.push({
            name: table.name,
            exists: false
          })
          continue
        }

        // Vérifier les colonnes
        const columns = await prisma.$queryRaw<Array<{ column_name: string }>>`
          SELECT column_name
          FROM information_schema.columns
          WHERE table_schema = 'public'
          AND table_name = ${table.name}
        `

        const existingColumns = columns.map(col => col.column_name)
        const missingColumns = table.requiredColumns.filter(
          col => !existingColumns.includes(col)
        )

        status.tables.push({
          name: table.name,
          exists: true,
          columnCount: existingColumns.length,
          missingColumns: missingColumns.length > 0 ? missingColumns : undefined
        })

        if (missingColumns.length === 0) {
          status.overall.tablesComplete++
        }
      } catch (error) {
        dbStatusLogger.error({ error, tableName: table.name, stack: error instanceof Error ? error.stack : undefined }, `Error checking table ${table.name}`)
        status.tables.push({
          name: table.name,
          exists: false
        })
      }
    }

    status.overall.allTablesExist = status.overall.tablesComplete === status.overall.totalTables

    // =====================================================
    // Déterminer si une migration est nécessaire
    // =====================================================

    const needsMigration = !status.overall.allTablesExist ||
                          !status.overall.allEnumsExist ||
                          status.tables.some(t => t.missingColumns && t.missingColumns.length > 0)

    return NextResponse.json({
      status,
      needsMigration,
      summary: {
        message: needsMigration
          ? '⚠️ Migration nécessaire - Certaines tables ou colonnes manquent'
          : '✅ Base de données complète - Aucune migration nécessaire',
        tablesOk: `${status.overall.tablesComplete}/${status.overall.totalTables}`,
        enumsOk: `${status.overall.enumsComplete}/${status.overall.totalEnums}`,
      }
    })
  } catch (error) {
    dbStatusLogger.error({ error, stack: error instanceof Error ? error.stack : undefined }, 'Error checking database status')
    return handleAuthError(error)
  }
}
