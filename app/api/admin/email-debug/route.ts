import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin, handleAuthError } from '@/lib/auth-utils'

/**
 * GET /api/admin/email-debug
 * Diagnostic du système d'email pour debugging
 */
export async function GET() {
  try {
    await requireAdmin()

    // Vérifier les intégrations email
    const integrations = await prisma.emailIntegration.findMany()
    const activeIntegration = await prisma.emailIntegration.findFirst({
      where: { isActive: true }
    })

    // Vérifier les derniers emails logs
    const recentEmailLogs = await prisma.emailLog.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        guest: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    })

    // Vérifier les variables d'environnement
    const envVars = {
      SMTP_HOST: process.env.SMTP_HOST || 'not set',
      SMTP_PORT: process.env.SMTP_PORT || 'not set',
      SMTP_USER: process.env.SMTP_USER ? '✓ set' : '✗ not set',
      SMTP_PASSWORD: process.env.SMTP_PASSWORD ? '✓ set' : '✗ not set',
      EMAIL_FROM: process.env.EMAIL_FROM || 'not set',
      EMAIL_FROM_NAME: process.env.EMAIL_FROM_NAME || 'not set',
    }

    return NextResponse.json({
      integrations: {
        total: integrations.length,
        active: activeIntegration ? {
          id: activeIntegration.id,
          provider: activeIntegration.provider,
          fromEmail: activeIntegration.fromEmail,
          isActive: activeIntegration.isActive,
          isPrimary: activeIntegration.isPrimary
        } : null,
        all: integrations.map(i => ({
          id: i.id,
          provider: i.provider,
          isActive: i.isActive,
          fromEmail: i.fromEmail
        }))
      },
      emailLogs: recentEmailLogs.map(log => ({
        id: log.id,
        type: log.type,
        status: log.status,
        to: log.guest?.email,
        guestName: `${log.guest?.firstName} ${log.guest?.lastName}`,
        subject: log.subject,
        sentAt: log.sentAt,
        error: log.error,
        createdAt: log.createdAt
      })),
      envVars,
      usingFallback: !activeIntegration
    })
  } catch (error) {
    return handleAuthError(error)
  }
}
