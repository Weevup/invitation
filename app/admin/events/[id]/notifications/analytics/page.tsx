'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  BarChart3,
  TrendingUp,
  MessageSquare,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  Users,
} from 'lucide-react'

interface NotificationStats {
  total: number
  sent: number
  delivered: number
  failed: number
  pending: number
  deliveryRate: number
  costEstimate: number
}

interface TemplateUsage {
  name: string
  category: string
  usageCount: number
  lastUsedAt: string
}

interface DailyStats {
  date: string
  sent: number
  failed: number
}

interface Analytics {
  overview: NotificationStats
  templates: TemplateUsage[]
  dailyStats: DailyStats[]
  topRecipients: Array<{
    name: string
    phone: string
    messageCount: number
  }>
}

export default function NotificationsAnalyticsPage() {
  const params = useParams()
  const eventId = params.id as string

  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [eventId])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/admin/events/${eventId}/notifications/analytics`)
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <BarChart3 className="h-12 w-12 text-[#009197] mx-auto mb-4 animate-pulse" />
          <p className="text-[#004645]/70">Chargement des analytics...</p>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-[#004645]/70">Aucune donnée disponible</p>
        </CardContent>
      </Card>
    )
  }

  const { overview, templates, dailyStats, topRecipients } = analytics

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-[#004645] mb-2" style={{ fontFamily: 'var(--font-abril)' }}>
          Analytics SMS
        </h2>
        <p className="text-[#004645]/70">
          Statistiques détaillées et métriques de performance
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sent */}
        <Card className="border-[#9CD9F6]/30">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-[#009197]" />
              SMS Envoyés
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#004645]">
              {overview.sent.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              sur {overview.total.toLocaleString()} total
            </p>
          </CardContent>
        </Card>

        {/* Delivery Rate */}
        <Card className="border-[#9CD9F6]/30">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Taux de livraison
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {overview.deliveryRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {overview.delivered.toLocaleString()} délivrés
            </p>
          </CardContent>
        </Card>

        {/* Failed */}
        <Card className="border-[#9CD9F6]/30">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-600" />
              Échecs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {overview.failed.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {overview.total > 0
                ? ((overview.failed / overview.total) * 100).toFixed(1)
                : 0}% du total
            </p>
          </CardContent>
        </Card>

        {/* Cost Estimate */}
        <Card className="border-[#9CD9F6]/30">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-[#FF4713]" />
              Coût estimé
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#FF4713]">
              {overview.costEstimate.toFixed(2)}€
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              ~0.09€ par SMS
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Stats */}
        <Card className="border-[#9CD9F6]/30">
          <CardHeader>
            <CardTitle className="text-[#004645]">Envois par jour</CardTitle>
            <CardDescription>Historique des 7 derniers jours</CardDescription>
          </CardHeader>
          <CardContent>
            {dailyStats.length > 0 ? (
              <div className="space-y-3">
                {dailyStats.map((day, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <div className="w-24 text-sm text-muted-foreground">
                      {new Date(day.date).toLocaleDateString('fr-FR', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div
                          className="bg-[#009197] h-6 rounded"
                          style={{
                            width: `${Math.max(
                              5,
                              (day.sent / Math.max(...dailyStats.map((d) => d.sent))) * 100
                            )}%`,
                          }}
                        />
                        <span className="text-sm font-medium">{day.sent}</span>
                      </div>
                      {day.failed > 0 && (
                        <div className="flex items-center gap-2 mt-1">
                          <div
                            className="bg-red-200 h-4 rounded"
                            style={{
                              width: `${Math.max(
                                5,
                                (day.failed / Math.max(...dailyStats.map((d) => d.sent))) * 100
                              )}%`,
                            }}
                          />
                          <span className="text-xs text-red-600">{day.failed} échecs</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Aucune donnée disponible
              </p>
            )}
          </CardContent>
        </Card>

        {/* Template Usage */}
        <Card className="border-[#9CD9F6]/30">
          <CardHeader>
            <CardTitle className="text-[#004645]">Templates les plus utilisés</CardTitle>
            <CardDescription>Top 5 des templates</CardDescription>
          </CardHeader>
          <CardContent>
            {templates.length > 0 ? (
              <div className="space-y-3">
                {templates.slice(0, 5).map((template, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-sm text-[#004645]">{template.name}</div>
                      <div className="text-xs text-muted-foreground">
                        <Badge variant="outline" className="text-xs">
                          {template.category}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-[#009197]">{template.usageCount}</div>
                      <div className="text-xs text-muted-foreground">utilisations</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Aucun template utilisé
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Recipients */}
      <Card className="border-[#9CD9F6]/30">
        <CardHeader>
          <CardTitle className="text-[#004645]">Top destinataires</CardTitle>
          <CardDescription>Invités ayant reçu le plus de SMS</CardDescription>
        </CardHeader>
        <CardContent>
          {topRecipients.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-[#9CD9F6]/30">
                  <tr className="text-left text-sm text-[#004645]/70">
                    <th className="pb-3 font-medium">Invité</th>
                    <th className="pb-3 font-medium">Téléphone</th>
                    <th className="pb-3 font-medium text-right">SMS reçus</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#9CD9F6]/30">
                  {topRecipients.map((recipient, idx) => (
                    <tr key={idx} className="text-sm hover:bg-[#9CD9F6]/5">
                      <td className="py-3 font-medium text-[#004645]">{recipient.name}</td>
                      <td className="py-3 text-[#004645]/70 font-mono text-xs">
                        {recipient.phone}
                      </td>
                      <td className="py-3 text-right">
                        <Badge variant="secondary" className="bg-[#009197]/10 text-[#009197]">
                          {recipient.messageCount}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Aucune donnée disponible
            </p>
          )}
        </CardContent>
      </Card>

      {/* ROI Estimate */}
      <Card className="border-[#9CD9F6]/30 bg-gradient-to-br from-[#009197]/5 to-[#004645]/5">
        <CardHeader>
          <CardTitle className="text-[#004645] flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-[#009197]" />
            Retour sur investissement estimé
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Coût total SMS</div>
              <div className="text-2xl font-bold text-[#FF4713]">
                {overview.costEstimate.toFixed(2)}€
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Taux d&apos;ouverture estimé</div>
              <div className="text-2xl font-bold text-[#009197]">98%</div>
              <div className="text-xs text-muted-foreground mt-1">
                vs 20% pour emails
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">ROI estimé</div>
              <div className="text-2xl font-bold text-green-600">3-4x</div>
              <div className="text-xs text-muted-foreground mt-1">
                Réduction no-shows de 30-40%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
