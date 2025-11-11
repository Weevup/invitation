'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  Users,
  Calendar,
  Plane,
  TrendingUp,
  ArrowRight,
  Activity,
  Clock,
  MapPin,
  Download,
  FileSpreadsheet,
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface Alert {
  type: 'error' | 'warning' | 'success' | 'info'
  category: string
  title: string
  message: string
  count: number
  severity: 'high' | 'medium' | 'low'
  details?: any[]
  action?: {
    label: string
    url: string
  }
}

interface DashboardData {
  event: {
    id: string
    name: string
    startsAt: string
    endsAt: string
  }
  stats: {
    totalGuests: number
    confirmedGuests: number
    totalSessions: number
    publishedSessions: number
    totalTransports: number
    confirmedTransports: number
    totalSessionParticipations: number
  }
  alerts: Alert[]
  sessionCapacityStats: {
    totalCapacity: number
    totalRegistrations: number
    averageOccupancy: number
  }
  transportByType: Record<string, number>
  sessionByType: Record<string, number>
  recentActivity: {
    newGuests: number
    newSessions: number
    newTransports: number
  }
}

const alertIcons = {
  error: AlertCircle,
  warning: AlertTriangle,
  success: CheckCircle2,
  info: Info,
}

const alertColors = {
  error: 'border-red-200 bg-red-50',
  warning: 'border-yellow-200 bg-yellow-50',
  success: 'border-green-200 bg-green-50',
  info: 'border-blue-200 bg-blue-50',
}

const alertIconColors = {
  error: 'text-red-600',
  warning: 'text-yellow-600',
  success: 'text-green-600',
  info: 'text-blue-600',
}

const transportTypeLabels: Record<string, string> = {
  FLIGHT: 'Vol',
  TRAIN: 'Train',
  SHUTTLE: 'Navette',
  TAXI: 'Taxi',
  CAR_RENTAL: 'Location',
  PERSONAL_CAR: 'Voiture perso',
}

const sessionTypeLabels: Record<string, string> = {
  KEYNOTE: 'Keynote',
  WORKSHOP: 'Workshop',
  CONFERENCE: 'Conférence',
  TEAMBUILDING: 'Team Building',
  MEAL: 'Repas',
  BREAK: 'Pause',
  NETWORKING: 'Networking',
  OTHER: 'Autre',
}

export default function DashboardPage() {
  const params = useParams()
  const eventId = params.id as string

  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboard()
  }, [eventId])

  const fetchDashboard = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/events/${eventId}/dashboard`)
      if (response.ok) {
        const dashboardData = await response.json()
        setData(dashboardData)
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExportManifeste = () => {
    window.open(`/api/admin/events/${eventId}/export/manifeste`, '_blank')
  }

  const handleExportTimelinePDF = () => {
    window.open(`/api/admin/events/${eventId}/export/timeline-pdf`, '_blank')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement du dashboard...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Impossible de charger le dashboard</p>
      </div>
    )
  }

  const highPriorityAlerts = data.alerts.filter((a) => a.severity === 'high')
  const otherAlerts = data.alerts.filter((a) => a.severity !== 'high')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Planification</h1>
          <p className="text-muted-foreground">
            Vue d&apos;ensemble de l&apos;organisation - {data.event.name}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {format(new Date(data.event.startsAt), 'd MMMM yyyy', { locale: fr })} -{' '}
            {format(new Date(data.event.endsAt), 'd MMMM yyyy', { locale: fr })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleExportTimelinePDF}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Timeline PDF
          </Button>
          <Button
            onClick={handleExportManifeste}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Manifeste Excel
          </Button>
        </div>
      </div>

      {/* High Priority Alerts */}
      {highPriorityAlerts.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            Alertes Critiques
          </h2>
          {highPriorityAlerts.map((alert, index) => {
            const Icon = alertIcons[alert.type]
            return (
              <Card key={index} className={`${alertColors[alert.type]} border-2`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Icon className={`h-5 w-5 mt-0.5 ${alertIconColors[alert.type]}`} />
                    <div className="flex-1">
                      <h3 className="font-semibold">{alert.title}</h3>
                      <p className="text-sm mt-1">{alert.message}</p>
                      {alert.details && alert.details.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {alert.details.map((detail, i) => (
                            <div key={i} className="text-xs bg-white/50 p-2 rounded">
                              <strong>{detail.guestName}</strong>: {detail.session1} ↔ {detail.session2}
                            </div>
                          ))}
                          {data.alerts.find((a) => a.details)!.count > 5 && (
                            <p className="text-xs text-muted-foreground">
                              Et {data.alerts.find((a) => a.details)!.count - 5} autre(s)...
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                    {alert.action && (
                      <Link href={alert.action.url}>
                        <Button size="sm" variant="outline">
                          {alert.action.label}
                          <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Participants */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Participants
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.stats.confirmedGuests}</div>
            <p className="text-xs text-muted-foreground mt-1">
              sur {data.stats.totalGuests} invités
            </p>
            <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500"
                style={{
                  width: `${(data.stats.confirmedGuests / data.stats.totalGuests) * 100}%`,
                }}
              />
            </div>
            {data.recentActivity.newGuests > 0 && (
              <Badge variant="secondary" className="mt-2 text-xs">
                <TrendingUp className="h-3 w-3 mr-1" />
                +{data.recentActivity.newGuests} cette semaine
              </Badge>
            )}
          </CardContent>
        </Card>

        {/* Sessions */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Sessions</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.stats.publishedSessions}</div>
            <p className="text-xs text-muted-foreground mt-1">
              sur {data.stats.totalSessions} créées
            </p>
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Taux d&apos;occupation</span>
                <span className="font-semibold">{data.sessionCapacityStats.averageOccupancy}%</span>
              </div>
              <div className="mt-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500"
                  style={{ width: `${data.sessionCapacityStats.averageOccupancy}%` }}
                />
              </div>
            </div>
            {data.recentActivity.newSessions > 0 && (
              <Badge variant="secondary" className="mt-2 text-xs">
                <TrendingUp className="h-3 w-3 mr-1" />
                +{data.recentActivity.newSessions} cette semaine
              </Badge>
            )}
          </CardContent>
        </Card>

        {/* Transports */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Transports
              </CardTitle>
              <Plane className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.stats.confirmedTransports}</div>
            <p className="text-xs text-muted-foreground mt-1">
              sur {data.stats.totalTransports} réservations
            </p>
            <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-500"
                style={{
                  width: `${(data.stats.confirmedTransports / data.stats.totalTransports) * 100}%`,
                }}
              />
            </div>
            {data.recentActivity.newTransports > 0 && (
              <Badge variant="secondary" className="mt-2 text-xs">
                <TrendingUp className="h-3 w-3 mr-1" />
                +{data.recentActivity.newTransports} cette semaine
              </Badge>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Breakdown Row */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Sessions by Type */}
        {Object.keys(data.sessionByType).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Sessions par type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(data.sessionByType)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 6)
                  .map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        <span className="text-sm">{sessionTypeLabels[type] || type}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 bg-gray-200 rounded-full w-24 overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{
                              width: `${(count / data.stats.totalSessions) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-semibold w-8 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Transports by Type */}
        {Object.keys(data.transportByType).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Transports par type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(data.transportByType)
                  .sort(([, a], [, b]) => b - a)
                  .map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-purple-500" />
                        <span className="text-sm">{transportTypeLabels[type] || type}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 bg-gray-200 rounded-full w-24 overflow-hidden">
                          <div
                            className="h-full bg-purple-500 rounded-full"
                            style={{
                              width: `${(count / data.stats.totalTransports) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-semibold w-8 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Other Alerts */}
      {otherAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Notifications & Informations
            </CardTitle>
            <CardDescription>Alertes et recommandations pour optimiser l&apos;événement</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {otherAlerts.map((alert, index) => {
              const Icon = alertIcons[alert.type]
              return (
                <div
                  key={index}
                  className={`flex items-start gap-3 p-3 rounded-md border ${alertColors[alert.type]}`}
                >
                  <Icon className={`h-5 w-5 mt-0.5 ${alertIconColors[alert.type]}`} />
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{alert.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
                  </div>
                  {alert.action && (
                    <Link href={alert.action.url}>
                      <Button size="sm" variant="ghost">
                        {alert.action.label}
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </Link>
                  )}
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions Rapides</CardTitle>
          <CardDescription>Accédez rapidement aux fonctionnalités principales</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-3">
            <Link href={`/admin/events/${eventId}/sessions`}>
              <Button variant="outline" className="w-full justify-start gap-2">
                <Calendar className="h-4 w-4" />
                Gérer les sessions
              </Button>
            </Link>
            <Link href={`/admin/events/${eventId}/timeline`}>
              <Button variant="outline" className="w-full justify-start gap-2">
                <Clock className="h-4 w-4" />
                Voir la timeline
              </Button>
            </Link>
            <Link href={`/admin/events/${eventId}/transport`}>
              <Button variant="outline" className="w-full justify-start gap-2">
                <Plane className="h-4 w-4" />
                Transports
              </Button>
            </Link>
            <Link href={`/admin/events/${eventId}/guests`}>
              <Button variant="outline" className="w-full justify-start gap-2">
                <Users className="h-4 w-4" />
                Invités
              </Button>
            </Link>
            <Link href={`/admin/events/${eventId}`}>
              <Button variant="outline" className="w-full justify-start gap-2">
                <Activity className="h-4 w-4" />
                Vue d&apos;ensemble
              </Button>
            </Link>
            <Link href={`/admin/events/${eventId}/program`}>
              <Button variant="outline" className="w-full justify-start gap-2">
                <MapPin className="h-4 w-4" />
                Programme
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* No alerts state */}
      {data.alerts.length === 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="text-center py-6">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-600" />
              <h3 className="font-semibold text-lg mb-2">Tout est en ordre !</h3>
              <p className="text-sm text-muted-foreground">
                Aucune alerte détectée. L&apos;événement est bien organisé.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
