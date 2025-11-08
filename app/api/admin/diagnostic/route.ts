import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface DiagnosticCheck {
  name: string
  status: 'success' | 'warning' | 'error'
  message: string
  details?: string
  fix?: string
}

interface EmailIntegrationSelect {
  id: string
  provider: string
  isActive: boolean
  isPrimary: boolean
  fromEmail: string | null
  webhookUrl: string | null
  trackOpens: boolean
  trackClicks: boolean
}

interface EventSelect {
  id: string
  name: string
  startsAt: Date
  _count: {
    guests: number
  }
}

interface WebhookIntegrationSelect {
  provider: string
  webhookUrl: string | null
  webhookSecret: string | null
}

export async function GET() {
  const checks: {
    database: DiagnosticCheck[]
    email: DiagnosticCheck[]
    environment: DiagnosticCheck[]
    data: DiagnosticCheck[]
    webhooks: DiagnosticCheck[]
  } = {
    database: [],
    email: [],
    environment: [],
    data: [],
    webhooks: []
  }

  // 1. Database Checks
  try {
    await prisma.$queryRaw`SELECT 1`
    checks.database.push({
      name: 'Connexion PostgreSQL',
      status: 'success',
      message: 'La base de données est connectée et répond correctement'
    })

    // Check tables
    const [users, events, guests, emailIntegrations] = await Promise.all([
      prisma.user.count(),
      prisma.event.count(),
      prisma.guest.count(),
      prisma.emailIntegration.count()
    ])

    checks.database.push({
      name: 'Tables de données',
      status: 'success',
      message: `${users} utilisateur(s), ${events} événement(s), ${guests} invité(s)`,
      details: `EmailIntegrations: ${emailIntegrations}`
    })

  } catch (error) {
    checks.database.push({
      name: 'Connexion PostgreSQL',
      status: 'error',
      message: 'Impossible de se connecter à la base de données',
      details: error instanceof Error ? error.message : String(error),
      fix: 'Vérifiez la variable DATABASE_URL dans vos variables d\'environnement'
    })
  }

  // 2. Email Integration Checks
  try {
    const integrations: EmailIntegrationSelect[] = await prisma.emailIntegration.findMany({
      select: {
        id: true,
        provider: true,
        isActive: true,
        isPrimary: true,
        fromEmail: true,
        webhookUrl: true,
        trackOpens: true,
        trackClicks: true
      }
    }) as EmailIntegrationSelect[]

    if (integrations.length === 0) {
      checks.email.push({
        name: 'Intégrations Email',
        status: 'warning',
        message: 'Aucune intégration email configurée',
        fix: 'Allez dans Paramètres → Intégrations pour configurer SendGrid, Resend, Mailgun ou SMTP'
      })
    } else {
      const activeIntegrations = integrations.filter((i) => i.isActive)
      const primaryIntegration = integrations.find((i) => i.isPrimary)

      if (activeIntegrations.length === 0) {
        checks.email.push({
          name: 'Intégrations Email',
          status: 'warning',
          message: `${integrations.length} intégration(s) configurée(s) mais aucune n'est active`,
          fix: 'Activez au moins une intégration dans Paramètres → Intégrations'
        })
      } else if (!primaryIntegration) {
        checks.email.push({
          name: 'Intégrations Email',
          status: 'warning',
          message: `${activeIntegrations.length} intégration(s) active(s) mais aucune n'est définie comme primaire`,
          details: `Providers actifs : ${activeIntegrations.map(i => i.provider).join(', ')}`,
          fix: 'Définissez une intégration comme primaire pour l\'envoi d\'emails'
        })
      } else {
        checks.email.push({
          name: 'Intégrations Email',
          status: 'success',
          message: `Intégration primaire : ${primaryIntegration.provider}`,
          details: `${activeIntegrations.length} intégration(s) active(s) : ${activeIntegrations.map(i => i.provider).join(', ')}`
        })

        // Check from email
        if (!primaryIntegration.fromEmail) {
          checks.email.push({
            name: 'Email d\'expédition',
            status: 'warning',
            message: 'Aucun email d\'expédition configuré',
            fix: 'Configurez l\'email d\'expédition dans l\'intégration primaire'
          })
        } else {
          checks.email.push({
            name: 'Email d\'expédition',
            status: 'success',
            message: `From Email : ${primaryIntegration.fromEmail}`
          })
        }

        // Check tracking
        if (primaryIntegration.trackOpens && primaryIntegration.trackClicks) {
          checks.email.push({
            name: 'Tracking des emails',
            status: 'success',
            message: 'Tracking des ouvertures et clics activé'
          })
        } else {
          checks.email.push({
            name: 'Tracking des emails',
            status: 'warning',
            message: 'Tracking partiellement activé',
            details: `Ouvertures : ${primaryIntegration.trackOpens ? 'Oui' : 'Non'}, Clics : ${primaryIntegration.trackClicks ? 'Oui' : 'Non'}`,
            fix: 'Activez le tracking complet pour suivre les performances'
          })
        }
      }
    }
  } catch (error) {
    checks.email.push({
      name: 'Intégrations Email',
      status: 'error',
      message: 'Erreur lors de la vérification des intégrations',
      details: error instanceof Error ? error.message : String(error)
    })
  }

  // 3. Environment Variables Checks
  const criticalEnvVars = [
    { name: 'DATABASE_URL', key: 'DATABASE_URL' },
    { name: 'NEXTAUTH_SECRET', key: 'NEXTAUTH_SECRET' },
    { name: 'NEXT_PUBLIC_BASE_URL', key: 'NEXT_PUBLIC_BASE_URL' },
  ]

  const optionalEnvVars = [
    { name: 'ENCRYPTION_KEY', key: 'ENCRYPTION_KEY' },
    { name: 'ENCRYPTION_IV', key: 'ENCRYPTION_IV' },
  ]

  criticalEnvVars.forEach(({ name, key }) => {
    if (process.env[key]) {
      checks.environment.push({
        name,
        status: 'success',
        message: 'Variable configurée'
      })
    } else {
      checks.environment.push({
        name,
        status: 'error',
        message: 'Variable manquante',
        fix: `Configurez ${key} dans vos variables d'environnement`
      })
    }
  })

  optionalEnvVars.forEach(({ name, key }) => {
    if (process.env[key]) {
      checks.environment.push({
        name,
        status: 'success',
        message: 'Variable configurée (encryption activée)'
      })
    } else {
      checks.environment.push({
        name,
        status: 'warning',
        message: 'Variable non configurée',
        details: 'Les API keys ne seront pas encryptées en base de données',
        fix: `Configurez ${key} pour activer l'encryption des credentials`
      })
    }
  })

  // 4. Data System Checks
  try {
    const events: EventSelect[] = await prisma.event.findMany({
      select: {
        id: true,
        name: true,
        startsAt: true,
        _count: {
          select: {
            guests: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    }) as EventSelect[]

    if (events.length === 0) {
      checks.data.push({
        name: 'Événements',
        status: 'warning',
        message: 'Aucun événement créé',
        fix: 'Créez votre premier événement dans la section Événements'
      })
    } else {
      const upcomingEvents = events.filter(e => new Date(e.startsAt) > new Date())
      checks.data.push({
        name: 'Événements',
        status: 'success',
        message: `${events.length} événement(s) total, ${upcomingEvents.length} à venir`,
        details: events.map(e => `${e.name} (${e._count.guests} invités)`).join(', ')
      })
    }

    // Check guests with RSVP
    const guestsWithRSVP = await prisma.guest.groupBy({
      by: ['status'],
      _count: true
    })

    const totalGuests = guestsWithRSVP.reduce((sum, g) => sum + g._count._all, 0)
    if (totalGuests > 0) {
      const statusBreakdown = guestsWithRSVP.map(g => `${g.status}: ${g._count._all}`).join(', ')
      checks.data.push({
        name: 'RSVP',
        status: 'success',
        message: `${totalGuests} invité(s) total`,
        details: statusBreakdown
      })
    } else {
      checks.data.push({
        name: 'RSVP',
        status: 'warning',
        message: 'Aucun invité créé',
        fix: 'Importez vos invités via CSV ou créez-les manuellement'
      })
    }

    // Check email logs
    const emailLogs = await prisma.emailLog.count()
    const deliveredEmails = await prisma.emailLog.count({
      where: { deliveredAt: { not: null } }
    })
    const openedEmails = await prisma.emailLog.count({
      where: { openedAt: { not: null } }
    })

    if (emailLogs > 0) {
      const deliveryRate = ((deliveredEmails / emailLogs) * 100).toFixed(1)
      const openRate = deliveredEmails > 0 ? ((openedEmails / deliveredEmails) * 100).toFixed(1) : '0'

      checks.data.push({
        name: 'Performance des Emails',
        status: 'success',
        message: `${emailLogs} email(s) envoyé(s)`,
        details: `Taux de livraison : ${deliveryRate}%, Taux d'ouverture : ${openRate}%`
      })
    } else {
      checks.data.push({
        name: 'Performance des Emails',
        status: 'warning',
        message: 'Aucun email envoyé',
        details: 'Les statistiques apparaîtront après l\'envoi de vos premières invitations'
      })
    }
  } catch (error) {
    checks.data.push({
      name: 'Données Système',
      status: 'error',
      message: 'Erreur lors de la vérification des données',
      details: error instanceof Error ? error.message : String(error)
    })
  }

  // 5. Webhooks Checks
  try {
    const integrations: WebhookIntegrationSelect[] = await prisma.emailIntegration.findMany({
      where: { isActive: true },
      select: {
        provider: true,
        webhookUrl: true,
        webhookSecret: true
      }
    }) as WebhookIntegrationSelect[]

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

    integrations.forEach((integration: WebhookIntegrationSelect) => {
      const expectedWebhookUrl = `${baseUrl}/api/webhooks/email/${integration.provider.toLowerCase()}`

      if (!integration.webhookUrl) {
        checks.webhooks.push({
          name: `Webhook ${integration.provider}`,
          status: 'warning',
          message: 'URL de webhook non configurée',
          details: `URL attendue : ${expectedWebhookUrl}`,
          fix: `Configurez l'URL de webhook dans ${integration.provider} dashboard`
        })
      } else if (integration.webhookUrl !== expectedWebhookUrl) {
        checks.webhooks.push({
          name: `Webhook ${integration.provider}`,
          status: 'warning',
          message: 'URL de webhook différente de l\'URL standard',
          details: `Configurée : ${integration.webhookUrl}\nAttendue : ${expectedWebhookUrl}`
        })
      } else {
        checks.webhooks.push({
          name: `Webhook ${integration.provider}`,
          status: 'success',
          message: 'URL de webhook correctement configurée',
          details: integration.webhookUrl
        })
      }

      // Check webhook secret for providers that need it
      if (['RESEND', 'MAILGUN'].includes(integration.provider)) {
        if (!integration.webhookSecret) {
          checks.webhooks.push({
            name: `Webhook Secret ${integration.provider}`,
            status: 'warning',
            message: 'Secret de webhook manquant',
            fix: `Configurez le secret de webhook pour ${integration.provider} pour la vérification de signature`
          })
        } else {
          checks.webhooks.push({
            name: `Webhook Secret ${integration.provider}`,
            status: 'success',
            message: 'Secret de webhook configuré'
          })
        }
      }
    })

    if (integrations.length === 0) {
      checks.webhooks.push({
        name: 'Webhooks',
        status: 'warning',
        message: 'Aucune intégration active pour configurer les webhooks',
        fix: 'Activez une intégration email pour configurer les webhooks'
      })
    }
  } catch (error) {
    checks.webhooks.push({
      name: 'Webhooks',
      status: 'error',
      message: 'Erreur lors de la vérification des webhooks',
      details: error instanceof Error ? error.message : String(error)
    })
  }

  return NextResponse.json(checks)
}
