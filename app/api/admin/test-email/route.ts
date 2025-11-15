import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email/resend'
import { requireAdmin, handleAuthError } from '@/lib/auth-utils'
import { createLogger } from '@/lib/logger'

const testEmailLogger = createLogger({ module: 'admin', type: 'test-email' })

/**
 * POST /api/admin/test-email
 * Test email sending with Resend
 */
export async function POST(request: NextRequest) {
  try {
    await requireAdmin()

    const body = await request.json()
    const { email, to = email, subject = 'Test Email from Weevup' } = body

    const recipientEmail = to || email
    if (!recipientEmail) {
      return NextResponse.json(
        { error: 'Recipient email is required' },
        { status: 400 }
      )
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        {
          error: 'RESEND_API_KEY is not configured',
          help: 'Add RESEND_API_KEY to your .env file'
        },
        { status: 500 }
      )
    }

    // Simple test email
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #004645 0%, #009197 100%);
            color: white;
            padding: 30px;
            border-radius: 8px;
            text-align: center;
            margin-bottom: 20px;
          }
          .content {
            padding: 20px;
            background: #f9f9f9;
            border-radius: 8px;
          }
          .success {
            color: #059669;
            font-weight: bold;
          }
          code {
            background: #e5e5e5;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: monospace;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>✅ Test Email Réussi !</h1>
          <p>Weevup Email System</p>
        </div>
        <div class="content">
          <p class="success">🎉 Félicitations ! Resend fonctionne parfaitement.</p>

          <p>Si vous recevez cet email, cela signifie que :</p>
          <ul>
            <li>✓ Votre clé API Resend est correctement configurée</li>
            <li>✓ Le service d'envoi d'emails est opérationnel</li>
            <li>✓ Vous êtes prêt à envoyer des invitations</li>
          </ul>

          <p><strong>Configuration actuelle :</strong></p>
          <ul>
            <li>Provider: <code>Resend</code></li>
            <li>From: <code>${process.env.EMAIL_FROM || 'noreply@weevup.com'}</code></li>
            <li>Name: <code>${process.env.EMAIL_FROM_NAME || 'Weevup Events'}</code></li>
          </ul>

          <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 14px; color: #666;">
            Ceci est un email de test envoyé depuis votre application Weevup.
          </p>
        </div>
      </body>
      </html>
    `

    const result = await sendEmail({
      to: recipientEmail,
      subject,
      html,
      text: 'Test email from Weevup - Resend is working!'
    })

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Email de test envoyé avec succès !',
        messageId: result.messageId,
        to: recipientEmail,
        provider: 'Resend',
        help: 'Vérifiez votre boîte de réception (et les spams si nécessaire)'
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          help: 'Vérifiez votre RESEND_API_KEY dans .env'
        },
        { status: 500 }
      )
    }
  } catch (error) {
    testEmailLogger.error({ error, stack: error instanceof Error ? error.stack : undefined }, 'Error in test-email API')
    return handleAuthError(error)
  }
}
