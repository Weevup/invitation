import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateGuestToken, hashToken } from '@/lib/auth'
import { requireAdmin, handleAuthError } from '@/lib/auth-utils'
import { requireEventOwnership } from '@/lib/permissions'
import { createLogger } from '@/lib/logger'

const logger = createLogger({ module: 'guest', type: 'batch-import' })

/**
 * Generate automatic tags based on professional information
 */
function generateAutoTags(data: {
  companySize?: string
  jobTitle?: string
  industry?: string
}): string[] {
  const autoTags: string[] = []

  // Company size tags
  const companySizeTags: Record<string, string> = {
    'TPE': 'TPE',
    'PME': 'PME',
    'ETI': 'ETI',
    'GE': 'Grande Entreprise',
  }
  if (data.companySize && companySizeTags[data.companySize]) {
    autoTags.push(companySizeTags[data.companySize])
  }

  // VIP detection based on job title
  if (data.jobTitle) {
    const titleLower = data.jobTitle.toLowerCase()
    const vipKeywords = [
      'ceo', 'cto', 'cfo', 'coo', 'cmo',
      'président', 'directeur général', 'dg',
      'fondateur', 'founder',
      'associé', 'partner',
      'vice-président', 'vp'
    ]

    if (vipKeywords.some(keyword => titleLower.includes(keyword))) {
      autoTags.push('VIP')
      autoTags.push('Décideur')
    } else if (titleLower.includes('directeur') || titleLower.includes('director')) {
      autoTags.push('Direction')
    } else if (titleLower.includes('manager') || titleLower.includes('responsable')) {
      autoTags.push('Manager')
    }
  }

  // Industry tag (if provided)
  if (data.industry) {
    autoTags.push(data.industry)
  }

  return autoTags
}

interface GuestImportData {
  firstName: string
  lastName?: string
  email: string
  company?: string
  tags?: string[]
  jobTitle?: string
  department?: string
  companySize?: string
  industry?: string
  phone?: string
  phoneNumber?: string
  linkedinUrl?: string
  dietaryReqs?: string
  accessibility?: string
}

/**
 * POST /api/admin/events/[id]/guests/batch-import
 * Import multiple guests at once (no rate limiting)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin()
    const { id: eventId } = await params

    // Verify admin owns this event
    await requireEventOwnership(eventId, session.user.id)

    const body = await request.json()
    const { guests } = body as { guests: GuestImportData[] }

    if (!Array.isArray(guests) || guests.length === 0) {
      return NextResponse.json(
        { error: 'Le tableau d\'invités est requis et ne peut pas être vide' },
        { status: 400 }
      )
    }

    // Limit batch size to 1000 guests
    if (guests.length > 1000) {
      return NextResponse.json(
        { error: 'Maximum 1000 invités par batch' },
        { status: 400 }
      )
    }

    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    })

    if (!event) {
      return NextResponse.json(
        { error: 'Événement introuvable' },
        { status: 404 }
      )
    }

    const results = {
      success: 0,
      skipped: 0,
      errors: [] as string[],
    }

    // Get existing emails for this event to avoid duplicates
    const existingGuests = await prisma.guest.findMany({
      where: { eventId },
      select: { email: true },
    })
    const existingEmails = new Set(existingGuests.map(g => g.email.toLowerCase()))

    // Process all guests
    for (let i = 0; i < guests.length; i++) {
      const guestData = guests[i]

      try {
        // Validate required fields
        if (!guestData.firstName || !guestData.email) {
          results.errors.push(`Ligne ${i + 1}: Prénom et email sont requis`)
          continue
        }

        const email = guestData.email.trim().toLowerCase()

        // Skip if email already exists
        if (existingEmails.has(email)) {
          results.skipped++
          results.errors.push(`Ligne ${i + 1} (${email}): Email déjà existant`)
          continue
        }

        // Generate auto tags
        const autoTags = generateAutoTags({
          companySize: guestData.companySize,
          jobTitle: guestData.jobTitle,
          industry: guestData.industry,
        })

        // Merge manual tags with auto tags
        const allTags = Array.from(
          new Set([...(guestData.tags || []), ...autoTags])
        )

        // Generate invitation token
        const token = generateGuestToken()
        const hashedToken = await hashToken(token)

        // Create guest
        await prisma.guest.create({
          data: {
            eventId,
            firstName: guestData.firstName.trim(),
            lastName: guestData.lastName?.trim() || '',
            email,
            company: guestData.company?.trim() || null,
            tags: allTags,
            invitationToken: hashedToken,
            status: 'PENDING',
            // Professional information
            jobTitle: guestData.jobTitle?.trim() || null,
            department: guestData.department?.trim() || null,
            companySize: guestData.companySize?.trim() || null,
            industry: guestData.industry?.trim() || null,
            linkedinUrl: guestData.linkedinUrl?.trim() || null,
            phoneNumber: guestData.phoneNumber?.trim() || null,
            phone: guestData.phone?.trim() || null,
            // Event-specific needs
            dietaryReqs: guestData.dietaryReqs?.trim() || null,
            accessibility: guestData.accessibility?.trim() || null,
          },
        })

        // Add to existing emails set to avoid duplicates within this batch
        existingEmails.add(email)
        results.success++
      } catch (error) {
        const errorMsg = `Ligne ${i + 1} (${guestData.email}): ${error instanceof Error ? error.message : 'Erreur inconnue'}`
        logger.error({ error, guestData }, 'Failed to import guest')
        results.errors.push(errorMsg)
      }
    }

    logger.info({
      eventId,
      total: guests.length,
      success: results.success,
      skipped: results.skipped,
      errorCount: results.errors.length,
    }, 'Batch import completed')

    return NextResponse.json({
      success: true,
      results: {
        total: guests.length,
        imported: results.success,
        skipped: results.skipped,
        errors: results.errors,
      },
    })
  } catch (error) {
    logger.error({ error }, 'Batch import failed')
    return handleAuthError(error)
  }
}
