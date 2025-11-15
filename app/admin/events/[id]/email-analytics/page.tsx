"use client"

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
import { createClientLogger } from '@/lib/client-logger'

const logger = createClientLogger({ component: 'EmailAnalyticsPage' })

  Mail, MailOpen, MousePointerClick, AlertCircle, TrendingUp,
  Clock, XCircle, CheckCircle, Timer, BarChart3, RefreshCw
} from 'lucide-react'

interface EmailAnalytics {
  overview: {
    totalSent: number
    totalOpened: number
    totalClicked: number
    totalBounced: number
    totalFailed: number
    totalPending: number
    openRate: string
    clickRate: string
    clickToOpenRate: string
    bounceRate: string
    avgHoursToOpen: string
  }
  statsByType: Record<string, {
    sent: number
    opened: number
    clicked: number
    bounced: number
    failed: number
    pending: number
    openRate: string
    clickRate: string
    clickToOpenRate: string
    bounceRate: string
  }>
  statsByStatus: Record<string, number>
  timeline: Array<{
    date: string
    sent: number
    opened: number
    clicked: number
  }>
  recentEmails: Array<{
    id: string
    type: string
    status: string
    subject: string
    guestName: string
    guestEmail: string
    sentAt: string | null
    openedAt: string | null
    clickedAt: string | null
    error: string | null
  }>
  errors: Array<{
    id: string
    type: string
    guestName: string
    guestEmail: string
    error: string
    sentAt: string | null
  }>
  bounces: Array<{
    id: string
    type: string
    guestName: string
    guestEmail: string
    bouncedAt: string | null
  }>
}

const EMAIL_TYPE_LABELS: Record<string, string> = {
  SAVE_THE_DATE: 'Save the Date',
  INVITE: 'Invitation',
  INVITATION: 'Invitation',
  REMINDER: 'Rappel',
  CONFIRMATION: 'Confirmation',
  INFO: 'Information',
  CUSTOM: 'Personnalisé',
  FOLLOW_UP: 'Suivi',
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'En attente',
  SENT: 'Envoyé',
  DELIVERED: 'Délivré',
  OPENED: 'Ouvert',
  CLICKED: 'Cliqué',
  BOUNCED: 'Rebond',
  FAILED: 'Échec',
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-gray-100 text-gray-800',
  SENT: 'bg-blue-100 text-blue-800',
  DELIVERED: 'bg-green-100 text-green-800',
  OPENED: 'bg-purple-100 text-purple-800',
  CLICKED: 'bg-pink-100 text-pink-800',
  BOUNCED: 'bg-orange-100 text-orange-800',
  FAILED: 'bg-red-100 text-red-800',
}

export default function EmailAnalyticsPage() {
  const params = useParams()
  const eventId = params.id as string

  const [data, setData] = useState<EmailAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/admin/events/${eventId}/email-analytics`)
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}`)
      }
      const result = await response.json()
      setData(result)
    } catch (err) {
      logger.error(err, { action: 'fetchEmailAnalytics' })
      setError(err instanceof Error ? err.message : 'Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }, [eventId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-[#004645]" style={{ fontFamily: "var(--font-abril)" }}>
            Analytics Emails
          </h2>
        </div>
        <Card>
          <CardContent className="pt-6 text-center text-[#004645]/70">
            Chargement des statistiques...
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-[#004645]" style={{ fontFamily: "var(--font-abril)" }}>
            Analytics Emails
          </h2>
        </div>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-800">{error || 'Erreur de chargement'}</p>
            <Button onClick={fetchData} className="mt-4" variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Réessayer
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-[#004645] mb-2" style={{ fontFamily: "var(--font-abril)" }}>
            Analytics Emails
          </h2>
          <p className="text-[#004645]/70">
            Statistiques détaillées sur vos envois d&apos;emails
          </p>
        </div>
        <Button onClick={fetchData} variant="outline" className="border-[#009197] text-[#009197]">
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualiser
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-[#009197]/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#004645]">Emails Envoyés</CardTitle>
            <Mail className="h-4 w-4 text-[#009197]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#004645]">{data.overview.totalSent}</div>
            <p className="text-xs text-[#004645]/70 mt-1">
              {data.overview.totalPending} en attente
            </p>
          </CardContent>
        </Card>

        <Card className="border-purple-500/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#004645]">Taux d&apos;ouverture</CardTitle>
            <MailOpen className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#004645]">{data.overview.openRate}%</div>
            <p className="text-xs text-[#004645]/70 mt-1">
              {data.overview.totalOpened} emails ouverts
            </p>
          </CardContent>
        </Card>

        <Card className="border-pink-500/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#004645]">Taux de clic</CardTitle>
            <MousePointerClick className="h-4 w-4 text-pink-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#004645]">{data.overview.clickRate}%</div>
            <p className="text-xs text-[#004645]/70 mt-1">
              {data.overview.totalClicked} clics
            </p>
          </CardContent>
        </Card>

        <Card className="border-orange-500/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#004645]">Problèmes</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#004645]">
              {data.overview.totalBounced + data.overview.totalFailed}
            </div>
            <p className="text-xs text-[#004645]/70 mt-1">
              {data.overview.totalBounced} rebonds, {data.overview.totalFailed} échecs
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card className="border-[#9CD9F6]/30">
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-[#009197]" />
            <CardTitle className="text-[#004645]">Métriques de Performance</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-3 p-4 bg-[#9CD9F6]/10 rounded-lg">
              <Clock className="h-8 w-8 text-[#009197]" />
              <div>
                <p className="text-sm text-[#004645]/70">Temps moyen d&apos;ouverture</p>
                <p className="text-xl font-bold text-[#004645]">{data.overview.avgHoursToOpen}h</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
              <BarChart3 className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm text-[#004645]/70">Click-to-Open Rate</p>
                <p className="text-xl font-bold text-[#004645]">{data.overview.clickToOpenRate}%</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-lg">
              <XCircle className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-sm text-[#004645]/70">Taux de rebond</p>
                <p className="text-xl font-bold text-[#004645]">{data.overview.bounceRate}%</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats by Type */}
      <Card className="border-[#9CD9F6]/30">
        <CardHeader>
          <CardTitle className="text-[#004645]">Performance par Type d&apos;Email</CardTitle>
          <CardDescription>Statistiques détaillées pour chaque type de campagne</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(data.statsByType).map(([type, stats]) => (
              <div key={type} className="border border-[#9CD9F6]/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-[#004645]">{EMAIL_TYPE_LABELS[type] || type}</h3>
                  <Badge className="bg-[#009197] text-white">{stats.sent} envoyés</Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                  <div>
                    <p className="text-[#004645]/70">Ouverture</p>
                    <p className="font-semibold text-[#004645]">{stats.openRate}%</p>
                    <p className="text-xs text-[#004645]/60">{stats.opened} ouverts</p>
                  </div>
                  <div>
                    <p className="text-[#004645]/70">Clic</p>
                    <p className="font-semibold text-[#004645]">{stats.clickRate}%</p>
                    <p className="text-xs text-[#004645]/60">{stats.clicked} clics</p>
                  </div>
                  <div>
                    <p className="text-[#004645]/70">Click-to-Open</p>
                    <p className="font-semibold text-[#004645]">{stats.clickToOpenRate}%</p>
                  </div>
                  <div>
                    <p className="text-[#004645]/70">Rebonds</p>
                    <p className="font-semibold text-orange-600">{stats.bounced}</p>
                  </div>
                  <div>
                    <p className="text-[#004645]/70">Échecs</p>
                    <p className="font-semibold text-red-600">{stats.failed}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      {data.timeline.length > 0 && (
        <Card className="border-[#9CD9F6]/30">
          <CardHeader>
            <CardTitle className="text-[#004645]">Timeline des 30 derniers jours</CardTitle>
            <CardDescription>Évolution des envois, ouvertures et clics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.timeline.map((day) => (
                <div key={day.date} className="flex items-center gap-4 p-3 bg-[#9CD9F6]/5 rounded-lg">
                  <div className="w-24 text-sm font-medium text-[#004645]">
                    {new Date(day.date).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })}
                  </div>
                  <div className="flex-1 grid grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-[#009197]" />
                      <span className="text-[#004645]/70">Envoyés:</span>
                      <span className="font-semibold text-[#004645]">{day.sent}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MailOpen className="h-4 w-4 text-purple-600" />
                      <span className="text-[#004645]/70">Ouverts:</span>
                      <span className="font-semibold text-[#004645]">{day.opened}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MousePointerClick className="h-4 w-4 text-pink-600" />
                      <span className="text-[#004645]/70">Cliqués:</span>
                      <span className="font-semibold text-[#004645]">{day.clicked}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Emails */}
      <Card className="border-[#9CD9F6]/30">
        <CardHeader>
          <CardTitle className="text-[#004645]">Emails Récents</CardTitle>
          <CardDescription>Les 20 derniers emails envoyés</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.recentEmails.map((email) => (
              <div key={email.id} className="flex items-center justify-between p-3 border border-[#9CD9F6]/30 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <Badge variant="outline" className="text-xs">
                      {EMAIL_TYPE_LABELS[email.type] || email.type}
                    </Badge>
                    <Badge className={`text-xs ${STATUS_COLORS[email.status]}`}>
                      {STATUS_LABELS[email.status] || email.status}
                    </Badge>
                  </div>
                  <p className="font-medium text-[#004645]">{email.subject}</p>
                  <p className="text-sm text-[#004645]/70">
                    {email.guestName} ({email.guestEmail})
                  </p>
                </div>
                <div className="text-right text-sm">
                  {email.sentAt && (
                    <p className="text-[#004645]/70">
                      {new Date(email.sentAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-1 justify-end">
                    {email.openedAt && <CheckCircle className="h-4 w-4 text-green-600" />}
                    {email.clickedAt && <MousePointerClick className="h-4 w-4 text-pink-600" />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Errors and Bounces */}
      {(data.errors.length > 0 || data.bounces.length > 0) && (
        <div className="grid gap-6 md:grid-cols-2">
          {data.errors.length > 0 && (
            <Card className="border-red-200 bg-red-50/50">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-600" />
                  <CardTitle className="text-red-900">Erreurs d&apos;Envoi</CardTitle>
                </div>
                <CardDescription className="text-red-700">
                  {data.errors.length} emails en échec
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.errors.map((err) => (
                    <div key={err.id} className="p-3 bg-white rounded-lg border border-red-200">
                      <p className="font-medium text-[#004645] mb-1">
                        {err.guestName} ({err.guestEmail})
                      </p>
                      <p className="text-sm text-red-700">{err.error}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {data.bounces.length > 0 && (
            <Card className="border-orange-200 bg-orange-50/50">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                  <CardTitle className="text-orange-900">Rebonds</CardTitle>
                </div>
                <CardDescription className="text-orange-700">
                  {data.bounces.length} emails rebondis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.bounces.map((bounce) => (
                    <div key={bounce.id} className="p-3 bg-white rounded-lg border border-orange-200">
                      <p className="font-medium text-[#004645] mb-1">
                        {bounce.guestName} ({bounce.guestEmail})
                      </p>
                      <p className="text-sm text-orange-700">
                        Type: {EMAIL_TYPE_LABELS[bounce.type] || bounce.type}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
