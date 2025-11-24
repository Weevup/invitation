import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createLogger } from '@/lib/logger'

const logger = createLogger({ module: 'unsubscribe' })

/**
 * POST /api/unsubscribe
 * Handles email unsubscribe requests
 *
 * Body: { email: string, reason?: string, token?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, reason, token } = body as { email: string; reason?: string; token?: string }

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Email invalide' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Check if already unsubscribed
    const existingUnsubscribe = await prisma.emailUnsubscribe.findUnique({
      where: { email: normalizedEmail }
    })

    if (existingUnsubscribe) {
      logger.info({ email: normalizedEmail }, 'Email already unsubscribed')
      return NextResponse.json({
        success: true,
        message: 'Vous êtes déjà désinscrit de nos emails',
        alreadyUnsubscribed: true
      })
    }

    // Find guest by email (if exists)
    let guestId: string | undefined
    if (token) {
      // Try to find guest by token first
      const guest = await prisma.guest.findUnique({
        where: { tokenHash: token },
        select: { id: true, email: true }
      })
      if (guest && guest.email.toLowerCase() === normalizedEmail) {
        guestId = guest.id
      }
    }

    // If no token provided or token didn't match, try to find by email
    if (!guestId) {
      const guest = await prisma.guest.findFirst({
        where: { email: normalizedEmail },
        select: { id: true }
      })
      if (guest) {
        guestId = guest.id
      }
    }

    // Create unsubscribe record
    await prisma.emailUnsubscribe.create({
      data: {
        email: normalizedEmail,
        guestId: guestId || null,
        reason: reason || null,
        source: token ? 'email_link' : 'manual',
        metadata: {
          userAgent: request.headers.get('user-agent') || undefined,
          referer: request.headers.get('referer') || undefined,
          ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined
        }
      }
    })

    logger.info({ email: normalizedEmail, guestId, source: token ? 'email_link' : 'manual' }, 'Email unsubscribed successfully')

    return NextResponse.json({
      success: true,
      message: 'Vous avez été désinscrit avec succès. Vous ne recevrez plus d\'emails de notre part.'
    })
  } catch (error) {
    logger.error({ error }, 'Error processing unsubscribe request')
    return NextResponse.json(
      { error: 'Une erreur est survenue lors du traitement de votre demande' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/unsubscribe?email=xxx
 * Check if an email is unsubscribed (for internal use)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { error: 'Email requis' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()

    const unsubscribe = await prisma.emailUnsubscribe.findUnique({
      where: { email: normalizedEmail },
      select: {
        email: true,
        unsubscribedAt: true,
        source: true
      }
    })

    return NextResponse.json({
      unsubscribed: !!unsubscribe,
      details: unsubscribe || null
    })
  } catch (error) {
    logger.error({ error }, 'Error checking unsubscribe status')
    return NextResponse.json(
      { error: 'Erreur lors de la vérification' },
      { status: 500 }
    )
  }
}
