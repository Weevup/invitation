import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { encrypt, decrypt } from '@/lib/encryption'

const EmailIntegrationSchema = z.object({
  provider: z.enum(['SENDGRID', 'RESEND', 'MAILGUN', 'SMTP']),
  apiKey: z.string().optional(),
  apiSecret: z.string().optional(),
  smtpHost: z.string().optional(),
  smtpPort: z.number().optional(),
  smtpUser: z.string().optional(),
  smtpPass: z.string().optional(),
  fromEmail: z.string().email().optional(),
  fromName: z.string().optional(),
  replyTo: z.string().email().optional(),
  trackOpens: z.boolean().default(true),
  trackClicks: z.boolean().default(true),
  isPrimary: z.boolean().default(false),
})

// GET - List all integrations
export async function GET() {
  try {
    const integrations = await prisma.emailIntegration.findMany({
      orderBy: [
        { isPrimary: 'desc' },
        { isActive: 'desc' },
        { createdAt: 'desc' },
      ],
    })

    // Decrypt sensitive fields for display (masked)
    const safeIntegrations = integrations.map((integration: typeof integrations[number]) => ({
      ...integration,
      apiKey: integration.apiKey ? '••••••••' + integration.apiKey.slice(-4) : undefined,
      apiSecret: integration.apiSecret ? '••••••••' : undefined,
      smtpPass: integration.smtpPass ? '••••••••' : undefined,
      webhookSecret: integration.webhookSecret ? '••••••••' : undefined,
    }))

    return NextResponse.json(safeIntegrations)
  } catch (error) {
    console.error('Error fetching integrations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch integrations' },
      { status: 500 }
    )
  }
}

// POST - Create or update an integration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = EmailIntegrationSchema.parse(body)

    // Encrypt sensitive fields
    const encryptedData: any = {
      provider: validated.provider,
      fromEmail: validated.fromEmail,
      fromName: validated.fromName,
      replyTo: validated.replyTo,
      trackOpens: validated.trackOpens,
      trackClicks: validated.trackClicks,
      isPrimary: validated.isPrimary,
      isActive: true,
    }

    // Encrypt API keys and secrets
    if (validated.apiKey) {
      encryptedData.apiKey = encrypt(validated.apiKey)
    }
    if (validated.apiSecret) {
      encryptedData.apiSecret = encrypt(validated.apiSecret)
    }
    if (validated.smtpHost) {
      encryptedData.smtpHost = validated.smtpHost
      encryptedData.smtpPort = validated.smtpPort
      encryptedData.smtpUser = validated.smtpUser
    }
    if (validated.smtpPass) {
      encryptedData.smtpPass = encrypt(validated.smtpPass)
    }

    // If setting as primary, unset other primaries
    if (validated.isPrimary) {
      await prisma.emailIntegration.updateMany({
        where: { isPrimary: true },
        data: { isPrimary: false },
      })
    }

    // Check if integration already exists for this provider
    const existing = await prisma.emailIntegration.findFirst({
      where: { provider: validated.provider },
    })

    let integration
    if (existing) {
      // Update existing
      integration = await prisma.emailIntegration.update({
        where: { id: existing.id },
        data: encryptedData,
      })
    } else {
      // Create new
      integration = await prisma.emailIntegration.create({
        data: encryptedData,
      })
    }

    return NextResponse.json({
      success: true,
      integration: {
        ...integration,
        apiKey: integration.apiKey ? '••••••••' : undefined,
        apiSecret: integration.apiSecret ? '••••••••' : undefined,
        smtpPass: integration.smtpPass ? '••••••••' : undefined,
      },
    })
  } catch (error) {
    console.error('Error saving integration:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to save integration' },
      { status: 500 }
    )
  }
}

// DELETE - Remove an integration
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Integration ID required' },
        { status: 400 }
      )
    }

    await prisma.emailIntegration.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting integration:', error)
    return NextResponse.json(
      { error: 'Failed to delete integration' },
      { status: 500 }
    )
  }
}
