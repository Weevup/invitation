import { NextRequest, NextResponse } from 'next/server'
import { validateGuestToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendEmailLegacy as sendEmail, sendEmail as sendEmailDirect, renderTemplate, TemplateVariables } from '@/lib/email-service'
import { getConfirmationEmailTemplate } from '@/lib/email-templates'
import { generateQRCode, getCheckinUrl } from '@/lib/qrcode'
import { formatDateTime } from '@/lib/utils'
import { rsvpRateLimit, getRateLimitIdentifier, getRateLimitHeaders, normalizeRateLimitResult } from '@/lib/rate-limit'
import { rsvpSubmissionSchema, validateSchema } from '@/lib/validations'
import { createLogger } from '@/lib/logger'
import { safeDecrypt } from '@/lib/encryption'

const rsvpLogger = createLogger({ module: 'rsvp' })

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    // Rate limiting
    const identifier = getRateLimitIdentifier(request, token)
    const rawResult = await rsvpRateLimit.limit(identifier)
    const rateLimitResult = normalizeRateLimitResult(rawResult)

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
      customAnswers,
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
    const finalPlusOnes = plusOnes ?? 0
    if (attending && finalPlusOnes > guest.event.maxPlusOnes) {
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

    // CRITICAL: Validate that confirmation email templates are configured
    // Check for both accepted and declined templates to ensure proper configuration
    const acceptedTemplate = await prisma.emailTemplate.findFirst({
      where: {
        slug: 'confirmation-accepted',
        isActive: true,
      },
    })

    const declinedTemplate = await prisma.emailTemplate.findFirst({
      where: {
        slug: 'confirmation-declined',
        isActive: true,
      },
    })

    // If either template is missing, block the RSVP submission
    if (!acceptedTemplate || !declinedTemplate) {
      rsvpLogger.warn({
        eventId: guest.eventId,
        missingTemplates: {
          accepted: !acceptedTemplate,
          declined: !declinedTemplate
        }
      }, 'RSVP blocked: Missing confirmation email templates')

      return NextResponse.json(
        {
          error: 'EMAIL_TEMPLATES_NOT_CONFIGURED',
          message: 'La configuration des emails de confirmation n\'est pas terminée',
          suggestion: 'L\'organisateur doit configurer les templates d\'email avant que vous puissiez confirmer votre présence. Veuillez réessayer plus tard ou contacter l\'organisateur.'
        },
        { status: 503 }
      )
    }

    // Update or create RSVP
    const rsvp = await prisma.rSVP.upsert({
      where: { guestId: guest.id },
      create: {
        eventId: guest.eventId,
        guestId: guest.id,
        attending: attending ?? null,
        plusOnes: finalPlusOnes,
        mealChoice,
        allergies,
        accessibilityNotes,
        transportNeeds,
        lodgingNeeds,
        consentPhotos: consentPhotos || false,
        customAnswers: customAnswers || {},
        respondedAt: new Date(),
      },
      update: {
        attending: attending ?? null,
        plusOnes: finalPlusOnes,
        mealChoice,
        allergies,
        accessibilityNotes,
        transportNeeds,
        lodgingNeeds,
        consentPhotos: consentPhotos || false,
        customAnswers: customAnswers || {},
        respondedAt: new Date(),
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
    let badgeDownloadUrl = null
    if (attending) {
      const checkinUrl = getCheckinUrl(rsvp.qrCodeId)
      qrCodeData = await generateQRCode(checkinUrl)

      // Check if event has badge design with QR code enabled
      const badgeDesign = await prisma.badgeDesign.findUnique({
        where: { eventId: guest.eventId }
      })

      if (badgeDesign?.includeQRCode) {
        // Generate badge download URL for templates
        badgeDownloadUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/guest/${guest.token}/badge`
      }
    }

    // Build venue string (avoid "null" in output)
    let eventVenue = guest.event.venueName || ''
    if (guest.event.city) {
      eventVenue += eventVenue ? `, ${guest.event.city}` : guest.event.city
    }

    // Try to use conditional template based on response (accepted vs declined)
    // First try to find a template with specific slug for the response type
    const conditionalSlug = attending ? 'confirmation-accepted' : 'confirmation-declined'
    let customTemplate = await prisma.emailTemplate.findFirst({
      where: {
        slug: conditionalSlug,
        isActive: true,
      },
    })

    // If no conditional template, try generic CONFIRMATION template
    if (!customTemplate) {
      customTemplate = await prisma.emailTemplate.findFirst({
        where: {
          type: 'CONFIRMATION',
          isActive: true,
        },
        orderBy: [
          { isDefault: 'desc' }, // Prefer default template
          { updatedAt: 'desc' }  // Or most recent
        ]
      })
    }

    if (customTemplate) {
      // Use custom WYSIWYG template
      const variables: TemplateVariables = {
        'guest.firstName': guest.firstName,
        'guest.lastName': guest.lastName || '',
        'guest.email': guest.email,
        'event.name': guest.event.name,
        'event.date': formatDateTime(guest.event.startsAt),
        'event.time': new Date(guest.event.startsAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        'event.location': eventVenue,
        'event.address': guest.event.address || '',
        'badge.downloadUrl': badgeDownloadUrl || '', // Badge with QR code download link
        'unsubscribeUrl': `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/unsubscribe?email=${encodeURIComponent(guest.email)}&token=${guest.token}`,
      }

      const renderedHtml = renderTemplate(customTemplate.htmlContent, variables)
      const renderedSubject = renderTemplate(customTemplate.subject, variables)

      // Get active email integration
      const emailIntegration = await prisma.emailIntegration.findFirst({
        where: { isActive: true, isPrimary: true }
      })

      if (!emailIntegration) {
        throw new Error('No active email integration found')
      }

      // Send with direct sendEmail (2 arguments: data, integration)
      // Note: sendEmail will handle decryption internally, so pass encrypted values
      const emailResult = await sendEmailDirect(
        {
          to: guest.email,
          from: emailIntegration.fromEmail || 'noreply@example.com',
          fromName: emailIntegration.fromName || 'Weevup',
          subject: renderedSubject,
          html: renderedHtml,
        },
        {
          id: emailIntegration.id,
          provider: emailIntegration.provider,
          apiKey: emailIntegration.apiKey,
          apiSecret: emailIntegration.apiSecret,
          smtpHost: emailIntegration.smtpHost,
          smtpPort: emailIntegration.smtpPort,
          smtpUser: emailIntegration.smtpUser,
          smtpPass: emailIntegration.smtpPass,
          fromEmail: emailIntegration.fromEmail,
          fromName: emailIntegration.fromName,
          replyTo: emailIntegration.replyTo,
          trackOpens: emailIntegration.trackOpens,
          trackClicks: emailIntegration.trackClicks,
        }
      )

      // Log email send (manually since we're not using sendEmailLegacy)
      if (emailResult.success) {
        await prisma.emailLog.create({
          data: {
            eventId: guest.eventId,
            guestId: guest.id,
            type: 'CONFIRMATION',
            status: 'SENT',
            subject: renderedSubject,
            providerId: emailResult.messageId,
            sentAt: new Date(),
          }
        })
      }
    } else {
      // Fallback to default template
      const emailHtml = getConfirmationEmailTemplate({
        guestName: guest.firstName,
        eventName: guest.event.name,
        eventDate: formatDateTime(guest.event.startsAt),
        eventVenue,
        attending: attending || false,
        // Don't send QR code in email (base64 images are blocked by email clients)
        // QR code is shown on the confirmation page instead
        qrCodeUrl: undefined,
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
    }

    return NextResponse.json({
      success: true,
      rsvp,
      qrCode: qrCodeData,
    })
  } catch (error) {
    rsvpLogger.error({ error, stack: error instanceof Error ? error.stack : undefined }, 'Error saving RSVP')
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
