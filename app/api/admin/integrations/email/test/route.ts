import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email-service'

export async function POST(request: NextRequest) {
  try {
    const { integrationId } = await request.json()

    if (!integrationId) {
      return NextResponse.json(
        { error: 'Integration ID required' },
        { status: 400 }
      )
    }

    // Get integration
    const integration = await prisma.emailIntegration.findUnique({
      where: { id: integrationId },
    })

    if (!integration) {
      return NextResponse.json(
        { error: 'Integration not found' },
        { status: 404 }
      )
    }

    // Send test email using the email service
    const testEmail = {
      to: integration.fromEmail || 'test@example.com',
      from: integration.fromEmail || 'noreply@weevup.com',
      fromName: integration.fromName || 'Weevup Events',
      subject: `Test Email - ${integration.provider}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #004645;">Test Email</h1>
          <p>Ceci est un email de test pour vérifier la configuration de votre intégration <strong>${integration.provider}</strong>.</p>
          <p>Si vous recevez cet email, votre configuration fonctionne correctement ! ✅</p>
          <hr style="border: 1px solid #9CD9F6; margin: 20px 0;" />
          <p style="color: #666; font-size: 12px;">
            Envoyé depuis Weevup Events<br/>
            ${new Date().toLocaleString('fr-FR')}
          </p>
        </div>
      `,
      text: `Test Email\n\nCeci est un email de test pour vérifier la configuration de votre intégration ${integration.provider}.\n\nSi vous recevez cet email, votre configuration fonctionne correctement !`,
    }

    const result = await sendEmail(testEmail, integration)

    if (result.success) {
      // Update lastTestedAt
      await prisma.emailIntegration.update({
        where: { id: integrationId },
        data: { lastTestedAt: new Date() },
      })

      return NextResponse.json({
        success: true,
        message: 'Email de test envoyé avec succès',
      })
    } else {
      return NextResponse.json(
        {
          error: 'Échec de l\'envoi de l\'email de test',
          details: result.error,
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error testing integration:', error)
    return NextResponse.json(
      {
        error: 'Une erreur est survenue lors du test',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
