import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateGuestToken, hashToken } from '@/lib/auth'
import { adminApiRateLimit, getRateLimitIdentifier, getRateLimitHeaders, normalizeRateLimitResult } from '@/lib/rate-limit'
import { createGuestSchema, validateSchema } from '@/lib/validations'
import { requireAdmin, handleAuthError } from '@/lib/auth-utils'
import { requireEventOwnership } from '@/lib/permissions'
import { createLogger } from '@/lib/logger'

const guestManagementLogger = createLogger({ module: 'guest', type: 'management' })

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

/**
 * GET /api/admin/events/[id]/guests
 * Get all guests for an event
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params

    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    })

    if (!event) {
      return NextResponse.json(
        { error: 'Événement non trouvé' },
        { status: 404 }
      )
    }

    // Get all guests for the event
    const guests = await prisma.guest.findMany({
      where: { eventId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        company: true,
        status: true,
      },
      orderBy: [
        { lastName: 'asc' },
        { firstName: 'asc' },
      ],
    })

    return NextResponse.json({
      guests,
      total: guests.length,
    })
  } catch (error) {
    guestManagementLogger.error({ error, stack: error instanceof Error ? error.stack : undefined }, 'Error fetching guests')
    return NextResponse.json(
      { error: 'Erreur lors du chargement des invités' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin()
    const { id: eventId } = await params

    // Verify admin owns this event
    await requireEventOwnership(eventId, session.user.id)

    // Rate limiting
    const identifier = getRateLimitIdentifier(request, eventId)
    const rawResult = await adminApiRateLimit.limit(identifier)
    const rateLimitResult = normalizeRateLimitResult(rawResult)

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: 'RATE_LIMIT_EXCEEDED',
          message: 'Trop de requêtes. Veuillez ralentir.',
        },
        {
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult)
        }
      )
    }

    const body = await request.json()

    // Validate data with Zod
    const validation = validateSchema(createGuestSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'VALIDATION_ERROR',
          message: 'Les données sont invalides',
          errors: validation.errors,
        },
        { status: 400 }
      )
    }

    const {
      firstName,
      lastName,
      email,
      company,
      tags,
      // Professional information
      jobTitle,
      department,
      companySize,
      industry,
      linkedinUrl,
      phoneNumber,
      // Event-specific needs
      dietaryReqs,
      accessibility,
      adminNotes,
    } = validation.data

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

    // Check if email already exists for this event
    const existingGuest = await prisma.guest.findUnique({
      where: {
        eventId_email: {
          eventId,
          email,
        },
      },
    })

    if (existingGuest) {
      return NextResponse.json(
        { error: 'Un invité avec cet email existe déjà pour cet événement' },
        { status: 400 }
      )
    }

    // Generate token
    const token = generateGuestToken()
    const tokenHash = hashToken(token)
    const tokenExpiry = new Date()
    tokenExpiry.setDate(tokenExpiry.getDate() + 90) // 90 days validity

    // Generate automatic tags based on professional info
    const autoTags = generateAutoTags({
      companySize,
      jobTitle,
      industry,
    })

    // Combine manual tags with auto-generated tags (remove duplicates)
    const manualTags = tags || []
    const combinedTags = Array.from(new Set([...manualTags, ...autoTags]))

    // Create guest
    const guest = await prisma.guest.create({
      data: {
        eventId,
        firstName,
        lastName,
        email,
        company: company || null,
        tags: combinedTags,
        // Professional information
        jobTitle: jobTitle || null,
        department: department || null,
        companySize: companySize || null,
        industry: industry || null,
        linkedinUrl: linkedinUrl || null,
        phoneNumber: phoneNumber || null,
        // Event-specific needs
        dietaryReqs: dietaryReqs || null,
        accessibility: accessibility || null,
        adminNotes: adminNotes || null,
        // Auth
        token,
        tokenHash,
        tokenExpiry,
      },
    })

    return NextResponse.json({
      ...guest,
      invitationUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/guest/${token}`,
    }, { status: 201 })
  } catch (error) {
    guestManagementLogger.error({ error, stack: error instanceof Error ? error.stack : undefined }, 'Error creating guest')
    return handleAuthError(error)
  }
}
