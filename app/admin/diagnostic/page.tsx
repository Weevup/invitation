'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Database,
  Mail,
  Key,
  Webhook,
  RefreshCw,
  Server,
  Users,
  Calendar,
  Activity
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface DiagnosticCheck {
  name: string
  status: 'success' | 'warning' | 'error'
  message: string
  details?: string
  fix?: string
}

interface DiagnosticData {
  database: DiagnosticCheck[]
  email: DiagnosticCheck[]
  environment: DiagnosticCheck[]
  data: DiagnosticCheck[]
  webhooks: DiagnosticCheck[]
}

export default function DiagnosticPage() {
  const [loading, setLoading] = useState(true)
  const [diagnostic, setDiagnostic] = useState<DiagnosticData | null>(null)
  const [lastCheck, setLastCheck] = useState<Date | null>(null)

  const runDiagnostic = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/diagnostic')
      const data = await response.json()
      setDiagnostic(data)
      setLastCheck(new Date())
    } catch (error) {
      console.error('Diagnostic failed:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    runDiagnostic()
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-500">OK</Badge>
      case 'warning':
        return <Badge className="bg-yellow-500">Attention</Badge>
      case 'error':
        return <Badge variant="destructive">Erreur</Badge>
      default:
        return null
    }
  }

  const getOverallStatus = () => {
    if (!diagnostic) return 'unknown'

    const allChecks = [
      ...diagnostic.database,
      ...diagnostic.email,
      ...diagnostic.environment,
      ...diagnostic.data,
      ...diagnostic.webhooks
    ]

    if (allChecks.some(check => check.status === 'error')) return 'error'
    if (allChecks.some(check => check.status === 'warning')) return 'warning'
    return 'success'
  }

  const sections = [
    {
      id: 'database',
      title: 'Base de Données',
      icon: Database,
      description: 'Connexion et intégrité des données'
    },
    {
      id: 'email',
      title: 'Intégrations Email',
      icon: Mail,
      description: 'Configuration des providers email'
    },
    {
      id: 'environment',
      title: 'Variables d\'Environnement',
      icon: Key,
      description: 'Configuration système et secrets'
    },
    {
      id: 'data',
      title: 'Données Système',
      icon: Activity,
      description: 'État des événements et invités'
    },
    {
      id: 'webhooks',
      title: 'Webhooks',
      icon: Webhook,
      description: 'Configuration des webhooks providers'
    }
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Diagnostic Système</h1>
          <p className="text-muted-foreground mt-2">
            Vérification de la santé de l&apos;application...
          </p>
        </div>
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  const overallStatus = getOverallStatus()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Diagnostic Système</h1>
          <p className="text-muted-foreground mt-2">
            État de santé de l&apos;application et recommandations
          </p>
        </div>
        <div className="flex items-center gap-4">
          {lastCheck && (
            <span className="text-sm text-muted-foreground">
              Dernière vérification : {lastCheck.toLocaleTimeString()}
            </span>
          )}
          <Button onClick={runDiagnostic} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Overall Status */}
      <Card className={
        overallStatus === 'success' ? 'border-green-500' :
        overallStatus === 'warning' ? 'border-yellow-500' :
        overallStatus === 'error' ? 'border-red-500' : ''
      }>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            État Général
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              {overallStatus === 'success' && (
                <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <AlertDescription className="text-green-900 dark:text-green-100">
                    <strong>Système opérationnel</strong>
                    <br />
                    Tous les composants fonctionnent correctement.
                  </AlertDescription>
                </Alert>
              )}
              {overallStatus === 'warning' && (
                <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  <AlertDescription className="text-yellow-900 dark:text-yellow-100">
                    <strong>Attention requise</strong>
                    <br />
                    Certains composants nécessitent votre attention.
                  </AlertDescription>
                </Alert>
              )}
              {overallStatus === 'error' && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Erreurs détectées</strong>
                    <br />
                    Des problèmes critiques nécessitent une intervention immédiate.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Diagnostic Sections */}
      {diagnostic && sections.map((section) => {
        const Icon = section.icon
        const checks = diagnostic[section.id as keyof DiagnosticData]

        if (!checks || checks.length === 0) return null

        const sectionStatus = checks.some(c => c.status === 'error') ? 'error' :
                             checks.some(c => c.status === 'warning') ? 'warning' : 'success'

        return (
          <Card key={section.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="h-5 w-5" />
                  <CardTitle>{section.title}</CardTitle>
                </div>
                {getStatusBadge(sectionStatus)}
              </div>
              <CardDescription>{section.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {checks.map((check, idx) => (
                  <div key={idx} className="flex gap-4 p-4 rounded-lg border">
                    <div className="flex-shrink-0 mt-0.5">
                      {getStatusIcon(check.status)}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="font-medium">{check.name}</div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {check.message}
                          </div>
                        </div>
                        {getStatusBadge(check.status)}
                      </div>

                      {check.details && (
                        <div className="text-sm bg-muted p-3 rounded">
                          {check.details}
                        </div>
                      )}

                      {check.fix && check.status !== 'success' && (
                        <Alert>
                          <AlertDescription className="text-sm">
                            <strong>Solution :</strong> {check.fix}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )
      })}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions Rapides</CardTitle>
          <CardDescription>
            Accès rapide aux pages de configuration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" asChild className="h-auto py-4 flex-col items-start">
              <a href="/admin/settings/integrations">
                <Mail className="h-5 w-5 mb-2" />
                <div className="text-left">
                  <div className="font-medium">Intégrations Email</div>
                  <div className="text-xs text-muted-foreground">
                    Configurer SendGrid, Resend, etc.
                  </div>
                </div>
              </a>
            </Button>

            <Button variant="outline" asChild className="h-auto py-4 flex-col items-start">
              <a href="/admin/events">
                <Calendar className="h-5 w-5 mb-2" />
                <div className="text-left">
                  <div className="font-medium">Événements</div>
                  <div className="text-xs text-muted-foreground">
                    Créer et gérer vos événements
                  </div>
                </div>
              </a>
            </Button>

            <Button variant="outline" asChild className="h-auto py-4 flex-col items-start">
              <a href="/admin/rsvp">
                <Users className="h-5 w-5 mb-2" />
                <div className="text-left">
                  <div className="font-medium">Invités & RSVP</div>
                  <div className="text-xs text-muted-foreground">
                    Gérer les invitations
                  </div>
                </div>
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
