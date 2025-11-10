import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateGuestToken, hashToken } from '@/lib/auth'
import { adminApiRateLimit, getRateLimitIdentifier, getRateLimitHeaders, normalizeRateLimitResult } from '@/lib/rate-limit'
import { createGuestSchema, validateSchema } from '@/lib/validations'
import { requireAdmin, handleAuthError } from '@/lib/auth-utils'
import { requireEventOwnership } from '@/lib/permissions'

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

    const { firstName, lastName, email, company, tags } = validation.data

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

    // Create guest
    const guest = await prisma.guest.create({
      data: {
        eventId,
        firstName,
        lastName,
        email,
        company: company || null,
        tags: tags || [],
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
    console.error('Error creating guest:', error)
    return handleAuthError(error)
  }
}
