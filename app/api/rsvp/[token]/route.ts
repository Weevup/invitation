import { NextRequest, NextResponse } from 'next/server'
import { validateGuestToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendEmail, getConfirmationEmailTemplate } from '@/lib/email'
import { generateQRCode, getCheckinUrl } from '@/lib/qrcode'
import { formatDateTime } from '@/lib/utils'
import { rsvpRateLimit, getRateLimitIdentifier, getRateLimitHeaders } from '@/lib/rate-limit'
import { rsvpSubmissionSchema, validateSchema } from '@/lib/validations'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    // Rate limiting
    const identifier = getRateLimitIdentifier(request, token)
    const rateLimitResult = await rsvpRateLimit.limit(identifier)

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: 'RATE_LIMIT_EXCEEDED',
          message: 'Trop de tentatives. Veuillez réessayer dans quelques minutes.',
          suggestion: `Vous pourrez réessayer après ${rateLimitResult.reset.toLocaleTimeString('fr-FR')}`
        },
        {
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult)
        }
      )
    }

    const guest = await validateGuestToken(token)

    if (!guest) {
      return NextResponse.json(
        {
          error: 'INVALID_TOKEN',
          message: 'Lien d\'invitation invalide ou expiré',
          suggestion: 'Contactez l\'organisateur pour recevoir un nouveau lien d\'invitation.'
        },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Validate data with Zod
    const validation = validateSchema(rsvpSubmissionSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'VALIDATION_ERROR',
          message: 'Les données soumises sont invalides',
          errors: validation.errors,
        },
        { status: 400 }
      )
    }

    const {
      attending,
      plusOnes,
      mealChoice,
      allergies,
      accessibilityNotes,
      transportNeeds,
      lodgingNeeds,
      consentPhotos,
    } = validation.data

    // Check if deadline passed
    if (guest.event.rsvpDeadline && new Date(guest.event.rsvpDeadline) < new Date()) {
      const deadlineDate = new Date(guest.event.rsvpDeadline).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
      return NextResponse.json(
        {
          error: 'DEADLINE_PASSED',
          message: `La date limite de confirmation était le ${deadlineDate}`,
          suggestion: 'Contactez l\'organisateur pour confirmer votre présence malgré le délai dépassé.'
        },
        { status: 400 }
      )
    }

    // Validate plusOnes limit
    if (attending && plusOnes > guest.event.maxPlusOnes) {
      return NextResponse.json(
        {
          error: 'TOO_MANY_PLUS_ONES',
          message: `Vous ne pouvez inviter que ${guest.event.maxPlusOnes} accompagnant(s) maximum`,
          suggestion: `Veuillez réduire le nombre d\'accompagnants à ${guest.event.maxPlusOnes} ou moins.`
        },
        { status: 400 }
      )
    }

    // Validate meal choice if required
    if (attending && guest.event.requireMeal && !mealChoice) {
      return NextResponse.json(
        {
          error: 'MEAL_REQUIRED',
          message: 'Le choix du menu est obligatoire',
          suggestion: 'Veuillez sélectionner un menu parmi les options proposées.'
        },
        { status: 400 }
      )
    }

    // Update or create RSVP
    const rsvp = await prisma.rSVP.upsert({
      where: { guestId: guest.id },
      create: {
        eventId: guest.eventId,
        guestId: guest.id,
        attending: attending ?? null,
        plusOnes: plusOnes || 0,
        mealChoice,
        allergies,
        accessibilityNotes,
        transportNeeds,
        lodgingNeeds,
        consentPhotos: consentPhotos || false,
      },
      update: {
        attending: attending ?? null,
        plusOnes: plusOnes || 0,
        mealChoice,
        allergies,
        accessibilityNotes,
        transportNeeds,
        lodgingNeeds,
        consentPhotos: consentPhotos || false,
        updatedAt: new Date(),
      },
    })

    // Update guest status
    await prisma.guest.update({
      where: { id: guest.id },
      data: { status: 'RESPONDED' },
    })

    // Generate QR code if attending
    let qrCodeData = null
    if (attending) {
      const checkinUrl = getCheckinUrl(rsvp.qrCodeId)
      qrCodeData = await generateQRCode(checkinUrl)
    }

    // Send confirmation email
    const emailHtml = getConfirmationEmailTemplate({
      guestName: guest.firstName,
      eventName: guest.event.name,
      eventDate: formatDateTime(guest.event.startsAt),
      eventVenue: `${guest.event.venueName}, ${guest.event.city}`,
      attending: attending || false,
      qrCodeUrl: qrCodeData || undefined,
    })

    await sendEmail({
      to: guest.email,
      subject: attending
        ? `Confirmation : ${guest.event.name}`
        : `Réponse enregistrée : ${guest.event.name}`,
      html: emailHtml,
      eventId: guest.eventId,
      guestId: guest.id,
      type: 'CONFIRMATION',
    })

    return NextResponse.json({
      success: true,
      rsvp,
      qrCode: qrCodeData,
    })
  } catch (error) {
    console.error('Error saving RSVP:', error)
    return NextResponse.json(
      {
        error: 'SERVER_ERROR',
        message: 'Une erreur est survenue lors de l\'enregistrement de votre réponse',
        suggestion: 'Veuillez réessayer dans quelques instants. Si le problème persiste, contactez l\'organisateur.'
      },
      { status: 500 }
    )
  }
}
