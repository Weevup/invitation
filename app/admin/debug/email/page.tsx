"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Mail, AlertTriangle, CheckCircle, XCircle, RefreshCw, Settings,
  Clock, Send, AlertCircle, ExternalLink
} from 'lucide-react'
import Link from 'next/link'

interface EmailDebugData {
  integrations: {
    total: number
    active: any
    all: any[]
  }
  emailLogs: any[]
  envVars: any
  usingFallback: boolean
}

export default function EmailDebugPage() {
  const [data, setData] = useState<EmailDebugData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchDebugData = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/email-debug')
      if (response.ok) {
        const result = await response.json()
        setData(result)
      }
    } catch (error) {
      console.error('Error fetching debug data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDebugData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="h-8 w-8 animate-spin text-[#009197]" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="p-8">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <p className="text-red-800">Impossible de charger les données de diagnostic</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const StatusIcon = data.integrations.active ? CheckCircle : AlertTriangle

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#004645]" style={{ fontFamily: "var(--font-abril)" }}>
            Diagnostic Email
          </h1>
          <p className="text-[#004645]/70 mt-1">
            Vérifiez la configuration et l&apos;état du système d&apos;envoi d&apos;emails
          </p>
        </div>
        <Button
          onClick={fetchDebugData}
          variant="outline"
          className="border-[#009197] text-[#009197]"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualiser
        </Button>
      </div>

      {/* Status Overview */}
      <Card className={`border-2 ${data.integrations.active ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <StatusIcon className={`h-6 w-6 ${data.integrations.active ? 'text-green-600' : 'text-orange-600'}`} />
            État du système d&apos;email
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.integrations.active ? (
            <div className="space-y-2">
              <p className="text-green-800 font-semibold">✓ Configuration active détectée</p>
              <div className="bg-white p-4 rounded-lg border border-green-200">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="font-medium">Provider:</span> {data.integrations.active.provider}</div>
                  <div><span className="font-medium">Email expéditeur:</span> {data.integrations.active.fromEmail}</div>
                  <div><span className="font-medium">ID:</span> {data.integrations.active.id}</div>
                  <div><span className="font-medium">Primaire:</span> {data.integrations.active.isPrimary ? 'Oui' : 'Non'}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-orange-800 font-semibold">⚠️ Aucune intégration email configurée</p>
              <p className="text-orange-700">
                Le système utilise actuellement <strong>SMTP Ethereal</strong> (serveur de test) qui n&apos;envoie pas réellement les emails.
              </p>
              <div className="flex gap-2 mt-4">
                <Link href="/admin/settings/integrations">
                  <Button className="bg-[#FF4713] hover:bg-[#FF4713]/90 text-white">
                    <Settings className="h-4 w-4 mr-2" />
                    Configurer une intégration email
                  </Button>
                </Link>
                <a href="https://docs.claude.ai" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Documentation
                  </Button>
                </a>
              </div>
            </div>
          )}

          {data.usingFallback && (
            <div className="bg-orange-100 p-4 rounded-lg border border-orange-300 mt-4">
              <p className="text-sm text-orange-800">
                <AlertCircle className="inline h-4 w-4 mr-1" />
                <strong>Mode Fallback actif :</strong> Les emails sont envoyés via Ethereal (serveur de test).
                Les emails ne seront pas délivrés aux destinataires réels.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Integrations List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Intégrations email ({data.integrations.total})
          </CardTitle>
          <CardDescription>
            Liste de toutes les intégrations configurées
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.integrations.all.length === 0 ? (
            <div className="text-center py-8 text-[#004645]/70">
              <Mail className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>Aucune intégration configurée</p>
              <Link href="/admin/settings/integrations">
                <Button className="mt-4" variant="outline">
                  Ajouter une intégration
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {data.integrations.all.map((integration: any) => (
                <div
                  key={integration.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-[#009197]" />
                    <div>
                      <div className="font-medium">{integration.provider}</div>
                      <div className="text-sm text-[#004645]/70">{integration.fromEmail}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {integration.isActive && (
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        Active
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Email Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Derniers emails envoyés
          </CardTitle>
          <CardDescription>
            Historique des 10 derniers emails
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.emailLogs.length === 0 ? (
            <div className="text-center py-8 text-[#004645]/70">
              <Send className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>Aucun email envoyé pour le moment</p>
            </div>
          ) : (
            <div className="space-y-2">
              {data.emailLogs.map((log: any) => (
                <div
                  key={log.id}
                  className="flex items-start justify-between p-4 border rounded-lg hover:bg-[#9CD9F6]/5 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        {log.type}
                      </Badge>
                      <span className="text-sm font-medium">{log.guestName}</span>
                    </div>
                    <div className="text-sm text-[#004645]/70">
                      <div>{log.to}</div>
                      <div className="font-medium">{log.subject}</div>
                    </div>
                    {log.error && (
                      <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded">
                        {log.error}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge
                      className={
                        log.status === 'SENT'
                          ? 'bg-green-100 text-green-800 border-green-200'
                          : log.status === 'FAILED'
                          ? 'bg-red-100 text-red-800 border-red-200'
                          : 'bg-gray-100 text-gray-800 border-gray-200'
                      }
                    >
                      {log.status === 'SENT' && <CheckCircle className="h-3 w-3 mr-1" />}
                      {log.status === 'FAILED' && <XCircle className="h-3 w-3 mr-1" />}
                      {log.status === 'PENDING' && <Clock className="h-3 w-3 mr-1" />}
                      {log.status}
                    </Badge>
                    <span className="text-xs text-[#004645]/50">
                      {new Date(log.createdAt).toLocaleString('fr-FR')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Environment Variables */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Variables d&apos;environnement (Fallback SMTP)
          </CardTitle>
          <CardDescription>
            Utilisées uniquement si aucune intégration n&apos;est configurée
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {Object.entries(data.envVars).map(([key, value]) => (
              <div key={key} className="p-3 bg-gray-50 rounded-lg border">
                <div className="font-medium text-[#004645]">{key}</div>
                <div className="text-[#004645]/70 font-mono text-xs mt-1">{value as string}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
