import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
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
 * PATCH /api/admin/events/[id]/guests/[guestId]
 * Update a guest
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; guestId: string }> }
) {
  try {
    const session = await requireAdmin()
    const { id: eventId, guestId } = await params

    // Verify admin owns this event
    await requireEventOwnership(eventId, session.user.id)

    // Rate limiting
    const identifier = getRateLimitIdentifier(request, `${eventId}-${guestId}`)
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
      adminPlusOnes,
      // Professional information
      jobTitle,
      department,
      companySize,
      industry,
      linkedinUrl,
      phoneNumber,
      phone, // SMS phone number
      // Event-specific needs
      dietaryReqs,
      accessibility,
      adminNotes,
    } = validation.data

    // Check if guest exists
    const existingGuest = await prisma.guest.findUnique({
      where: { id: guestId },
    })

    if (!existingGuest || existingGuest.eventId !== eventId) {
      return NextResponse.json(
        { error: 'Invité introuvable' },
        { status: 404 }
      )
    }

    // Check if email is being changed and if new email already exists
    if (email !== existingGuest.email) {
      const emailExists = await prisma.guest.findUnique({
        where: {
          eventId_email: {
            eventId,
            email,
          },
        },
      })

      if (emailExists && emailExists.id !== guestId) {
        return NextResponse.json(
          { error: 'Un invité avec cet email existe déjà pour cet événement' },
          { status: 400 }
        )
      }
    }

    // Generate automatic tags based on professional info
    const autoTags = generateAutoTags({
      companySize,
      jobTitle,
      industry,
    })

    // Combine manual tags with auto-generated tags (remove duplicates)
    const manualTags = tags || []
    const combinedTags = Array.from(new Set([...manualTags, ...autoTags]))

    // Update guest
    const updatedGuest = await prisma.guest.update({
      where: { id: guestId },
      data: {
        firstName,
        lastName,
        email,
        company: company || null,
        tags: combinedTags,
        adminPlusOnes: adminPlusOnes ?? 0,
        // Professional information
        jobTitle: jobTitle || null,
        department: department || null,
        companySize: companySize || null,
        industry: industry || null,
        linkedinUrl: linkedinUrl || null,
        phoneNumber: phoneNumber || null,
        phone: phone || null, // SMS phone number
        // Event-specific needs
        dietaryReqs: dietaryReqs || null,
        accessibility: accessibility || null,
        adminNotes: adminNotes || null,
      },
    })

    return NextResponse.json(updatedGuest)
  } catch (error) {
    guestManagementLogger.error({ error, stack: error instanceof Error ? error.stack : undefined }, 'Error updating guest')
    return handleAuthError(error)
  }
}

/**
 * DELETE /api/admin/events/[id]/guests/[guestId]
 * Delete a guest
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; guestId: string }> }
) {
  try {
    const session = await requireAdmin()
    const { id: eventId, guestId } = await params

    // Verify admin owns this event
    await requireEventOwnership(eventId, session.user.id)

    // Check if guest exists
    const existingGuest = await prisma.guest.findUnique({
      where: { id: guestId },
    })

    if (!existingGuest || existingGuest.eventId !== eventId) {
      return NextResponse.json(
        { error: 'Invité introuvable' },
        { status: 404 }
      )
    }

    // Delete guest (cascade will handle related records)
    await prisma.guest.delete({
      where: { id: guestId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    guestManagementLogger.error({ error, stack: error instanceof Error ? error.stack : undefined }, 'Error deleting guest')
    return handleAuthError(error)
  }
}
