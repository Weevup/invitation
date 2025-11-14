'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Calendar,
  Clock,
  MapPin,
  Plane,
  Users,
  Filter,
  Download,
  Hotel,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  Coffee,
  Utensils,
  Presentation,
  Mail,
  MessageSquare,
  UserCheck,
  AlertTriangle,
  AlertCircle,
  Info,
  X,
  Edit2,
  Eye,
  UserPlus,
} from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface TimelineItem {
  id: string
  type: string
  sessionType?: string
  transportType?: string
  title: string
  description?: string
  startTime: string
  endTime?: string
  location?: string
  color?: string
  icon?: string
  entity: string
  entityId: string
  participantCount?: number
  capacity?: number
  guest?: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  roomType?: string
  roomNumber?: string
  isParticipating?: boolean
}

interface Alert {
  id: string
  type: string
  severity: 'error' | 'warning' | 'info'
  title: string
  message: string
  count?: number
  sessionId?: string
  relatedTime?: string
  guests?: Array<{ id: string; firstName: string; lastName: string }>
}

const getSessionIcon = (sessionType?: string) => {
  switch (sessionType) {
    case 'CONFERENCE':
    case 'KEYNOTE':
      return Presentation
    case 'MEAL':
    case 'BREAKFAST':
    case 'LUNCH':
    case 'DINNER':
      return Utensils
    case 'BREAK':
    case 'COFFEE_BREAK':
      return Coffee
    default:
      return Calendar
  }
}

const getSessionColor = (sessionType?: string) => {
  switch (sessionType) {
    case 'CONFERENCE':
    case 'KEYNOTE':
      return 'bg-blue-500'
    case 'MEAL':
    case 'BREAKFAST':
    case 'LUNCH':
    case 'DINNER':
      return 'bg-orange-500'
    case 'BREAK':
    case 'COFFEE_BREAK':
      return 'bg-yellow-500'
    default:
      return 'bg-indigo-500'
  }
}

export default function TimelinePage() {
  const params = useParams()
  const eventId = params.id as string

  const [timeline, setTimeline] = useState<TimelineItem[]>([])
  const [timelineByDate, setTimelineByDate] = useState<Record<string, TimelineItem[]>>({})
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalEvents: 0,
    sessions: 0,
    transports: 0,
    accommodations: 0,
    emailsSent: 0,
    rsvpReceived: 0,
    checkins: 0,
    totalParticipants: 0,
  })
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set())
  const [currentDateIndex, setCurrentDateIndex] = useState(0)

  // Filters state
  const [filters, setFilters] = useState({
    type: 'all', // 'all', 'sessions', 'transport', 'accommodation', 'communications'
    status: 'all', // 'all', 'confirmed', 'pending', 'alert'
    showConflictsOnly: false,
  })
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchTimeline()
  }, [eventId])

  const fetchTimeline = async () => {
    try {
      setLoading(true)

      const url = `/api/admin/events/${eventId}/timeline`
      const response = await fetch(url)

      if (response.ok) {
        const data = await response.json()
        setTimeline(data.timeline || [])
        setTimelineByDate(data.timelineByDate || {})
        setStats(data.stats || {})
        setAlerts(data.alerts || [])
      }
    } catch (error) {
      console.error('Error fetching timeline:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExportTimelinePDF = () => {
    window.open(`/api/admin/events/${eventId}/export/timeline-pdf`, '_blank')
  }

  const handleExportManifeste = () => {
    window.open(`/api/admin/events/${eventId}/export/manifeste`, '_blank')
  }

  const dismissAlert = (alertId: string) => {
    setDismissedAlerts((prev) => new Set(prev).add(alertId))
  }

  const getAlertIcon = (severity: string) => {
    switch (severity) {
      case 'error':
        return AlertCircle
      case 'warning':
        return AlertTriangle
      case 'info':
        return Info
      default:
        return Info
    }
  }

  const getAlertStyles = (severity: string) => {
    switch (severity) {
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800'
      case 'warning':
        return 'bg-orange-50 border-orange-200 text-orange-800'
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800'
    }
  }

  // Filter out dismissed alerts
  const visibleAlerts = alerts.filter((alert) => !dismissedAlerts.has(alert.id))

  // Get sorted dates
  const sortedDates = Object.keys(timelineByDate).sort()

  // Group items by hour for current selected date
  const currentDate = sortedDates[currentDateIndex]
  const currentDayItems = currentDate ? timelineByDate[currentDate] : []

  // Filter items based on selected filters
  const applyFilters = (items: TimelineItem[]) => {
    let filtered = items

    // Filter by type
    if (filters.type !== 'all') {
      switch (filters.type) {
        case 'sessions':
          filtered = filtered.filter((item) => item.type === 'SESSION')
          break
        case 'transport':
          filtered = filtered.filter((item) =>
            item.type === 'TRANSPORT_ARRIVAL' || item.type === 'TRANSPORT_DEPARTURE'
          )
          break
        case 'accommodation':
          filtered = filtered.filter((item) =>
            item.type === 'HOTEL_CHECKIN' || item.type === 'HOTEL_CHECKOUT'
          )
          break
        case 'communications':
          filtered = filtered.filter((item) =>
            item.type === 'EMAIL_SENT' || item.type === 'RSVP_RECEIVED' || item.type === 'CHECKIN'
          )
          break
      }
    }

    // Filter by status (based on capacity)
    if (filters.status !== 'all') {
      switch (filters.status) {
        case 'alert':
          filtered = filtered.filter((item) =>
            (item.capacity && item.participantCount && item.participantCount > item.capacity)
          )
          break
        case 'confirmed':
          filtered = filtered.filter((item) =>
            item.participantCount && item.participantCount > 0
          )
          break
        case 'pending':
          filtered = filtered.filter((item) =>
            (!item.participantCount || item.participantCount === 0)
          )
          break
      }
    }

    // Filter conflicts only
    if (filters.showConflictsOnly) {
      filtered = filtered.filter((item) =>
        (item.capacity && item.participantCount && item.participantCount > item.capacity)
      )
    }

    return filtered
  }

  // Group items by start hour
  const groupByHour = (items: TimelineItem[]) => {
    const grouped: Record<string, TimelineItem[]> = {}
    for (const item of items) {
      const hour = format(new Date(item.startTime), 'HH:mm')
      if (!grouped[hour]) {
        grouped[hour] = []
      }
      grouped[hour].push(item)
    }
    return grouped
  }

  const filteredDayItems = applyFilters(currentDayItems)
  const itemsByHour = groupByHour(filteredDayItems)
  const sortedHours = Object.keys(itemsByHour).sort()

  // Calculate accommodation summary for the current day
  const accommodationSummary = () => {
    const checkIns = currentDayItems.filter((item) => item.type === 'HOTEL_CHECKIN')
    const checkOuts = currentDayItems.filter((item) => item.type === 'HOTEL_CHECKOUT')
    const roomTypes: Record<string, number> = {}

    ;[...checkIns, ...checkOuts].forEach((item) => {
      if (item.roomType) {
        roomTypes[item.roomType] = (roomTypes[item.roomType] || 0) + 1
      }
    })

    return { checkIns, checkOuts, roomTypes }
  }

  // Calculate logistics summary for a specific hour
  const getLogisticsSummary = (hour: string, items: TimelineItem[]) => {
    const arrivals = items.filter((item) => item.type === 'TRANSPORT_ARRIVAL')
    const departures = items.filter((item) => item.type === 'TRANSPORT_DEPARTURE')
    const emails = items.filter((item) => item.type === 'EMAIL_SENT')
    const rsvps = items.filter((item) => item.type === 'RSVP_RECEIVED')
    const checkins = items.filter((item) => item.type === 'CHECKIN')
    return { arrivals, departures, emails, rsvps, checkins }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement de la timeline...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Timeline - Hub Central</h1>
          <p className="text-muted-foreground">
            Vue d&apos;ensemble complète de tous les modules
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportTimelinePDF}>
            <Download className="h-4 w-4 mr-2" />
            Timeline PDF
          </Button>
          <Button variant="outline" onClick={handleExportManifeste}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Manifeste Excel
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Programme
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.sessions}</div>
            <p className="text-xs text-muted-foreground mt-1">Sessions programmées</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Plane className="h-4 w-4" />
              Logistique
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div>
                <div className="text-2xl font-bold">{stats.transports}</div>
                <p className="text-xs text-muted-foreground">Transports</p>
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.accommodations}</div>
                <p className="text-xs text-muted-foreground">Chambres</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Communications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div>
                <div className="text-2xl font-bold">{stats.emailsSent}</div>
                <p className="text-xs text-muted-foreground">Emails</p>
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.rsvpReceived}</div>
                <p className="text-xs text-muted-foreground">RSVP</p>
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.checkins}</div>
                <p className="text-xs text-muted-foreground">Check-ins</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Participants
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalParticipants}</div>
            <p className="text-xs text-muted-foreground mt-1">Total invités</p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Section */}
      {visibleAlerts.length > 0 && (
        <div className="space-y-3">
          {visibleAlerts.map((alert) => {
            const Icon = getAlertIcon(alert.severity)
            const styles = getAlertStyles(alert.severity)

            return (
              <Card key={alert.id} className={cn('border-l-4', styles)}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                      <div className="space-y-1">
                        <div className="font-semibold">{alert.title}</div>
                        <div className="text-sm">{alert.message}</div>
                        {alert.guests && alert.guests.length > 0 && (
                          <div className="text-xs mt-2 space-y-1">
                            {alert.guests.map((guest) => (
                              <div key={guest.id} className="flex items-center gap-2">
                                <Users className="h-3 w-3" />
                                {guest.firstName} {guest.lastName}
                              </div>
                            ))}
                            {alert.count && alert.count > alert.guests.length && (
                              <div className="text-xs italic">
                                ... et {alert.count - alert.guests.length} autre(s)
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => dismissAlert(alert.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Date Navigator */}
      {sortedDates.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDateIndex(Math.max(0, currentDateIndex - 1))}
                disabled={currentDateIndex === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="text-center">
                <h2 className="text-2xl font-bold">
                  {format(new Date(currentDate), 'EEEE d MMMM yyyy', { locale: fr })}
                </h2>
                <p className="text-sm text-muted-foreground">
                  Jour {currentDateIndex + 1} / {sortedDates.length}
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentDateIndex(Math.min(sortedDates.length - 1, currentDateIndex + 1))
                }
                disabled={currentDateIndex === sortedDates.length - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Accommodation Summary for the Day */}
      {currentDayItems.length > 0 && (
        (() => {
          const { checkIns, checkOuts, roomTypes } = accommodationSummary()
          if (checkIns.length === 0 && checkOuts.length === 0) return null

          return (
            <Card className="bg-purple-50 border-purple-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Hotel className="h-4 w-4 text-purple-600" />
                  Résumé Hébergement du jour
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-6 flex-wrap">
                  {checkIns.length > 0 && (
                    <div>
                      <div className="text-2xl font-bold text-purple-600">
                        {checkIns.length}
                      </div>
                      <p className="text-xs text-muted-foreground">Check-ins</p>
                    </div>
                  )}
                  {checkOuts.length > 0 && (
                    <div>
                      <div className="text-2xl font-bold text-purple-600">
                        {checkOuts.length}
                      </div>
                      <p className="text-xs text-muted-foreground">Check-outs</p>
                    </div>
                  )}
                  {Object.keys(roomTypes).length > 0 && (
                    <div className="flex gap-3 items-center">
                      <span className="text-sm text-muted-foreground">Types:</span>
                      {Object.entries(roomTypes).map(([type, count]) => (
                        <Badge key={type} variant="secondary">
                          {count} {type}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })()
      )}

      {/* Filter Panel */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              Filtres
              {(filters.type !== 'all' || filters.status !== 'all' || filters.showConflictsOnly) && (
                <Badge variant="secondary" className="ml-2">
                  {[
                    filters.type !== 'all' ? 1 : 0,
                    filters.status !== 'all' ? 1 : 0,
                    filters.showConflictsOnly ? 1 : 0,
                  ].reduce((a, b) => a + b, 0)}
                </Badge>
              )}
            </Button>

            {(filters.type !== 'all' || filters.status !== 'all' || filters.showConflictsOnly) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilters({ type: 'all', status: 'all', showConflictsOnly: false })}
              >
                Réinitialiser
              </Button>
            )}
          </div>

          {showFilters && (
            <div className="mt-4 space-y-4 pt-4 border-t">
              {/* Type Filters */}
              <div>
                <label className="text-sm font-medium mb-2 block">Type d&apos;élément</label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={filters.type === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilters({ ...filters, type: 'all' })}
                  >
                    Tout
                  </Button>
                  <Button
                    variant={filters.type === 'sessions' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilters({ ...filters, type: 'sessions' })}
                    className="gap-2"
                  >
                    <Calendar className="h-4 w-4" />
                    Sessions
                  </Button>
                  <Button
                    variant={filters.type === 'transport' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilters({ ...filters, type: 'transport' })}
                    className="gap-2"
                  >
                    <Plane className="h-4 w-4" />
                    Transport
                  </Button>
                  <Button
                    variant={filters.type === 'accommodation' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilters({ ...filters, type: 'accommodation' })}
                    className="gap-2"
                  >
                    <Hotel className="h-4 w-4" />
                    Hébergement
                  </Button>
                  <Button
                    variant={filters.type === 'communications' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilters({ ...filters, type: 'communications' })}
                    className="gap-2"
                  >
                    <Mail className="h-4 w-4" />
                    Communications
                  </Button>
                </div>
              </div>

              {/* Status Filters */}
              <div>
                <label className="text-sm font-medium mb-2 block">Statut</label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={filters.status === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilters({ ...filters, status: 'all' })}
                  >
                    Tout
                  </Button>
                  <Button
                    variant={filters.status === 'confirmed' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilters({ ...filters, status: 'confirmed' })}
                    className="gap-2"
                  >
                    <UserCheck className="h-4 w-4" />
                    Confirmé
                  </Button>
                  <Button
                    variant={filters.status === 'pending' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilters({ ...filters, status: 'pending' })}
                    className="gap-2"
                  >
                    <Clock className="h-4 w-4" />
                    En attente
                  </Button>
                  <Button
                    variant={filters.status === 'alert' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilters({ ...filters, status: 'alert' })}
                    className="gap-2"
                  >
                    <AlertCircle className="h-4 w-4" />
                    Alerte
                  </Button>
                </div>
              </div>

              {/* Show Conflicts Only */}
              <div className="flex items-center gap-2">
                <Button
                  variant={filters.showConflictsOnly ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilters({ ...filters, showConflictsOnly: !filters.showConflictsOnly })}
                  className="gap-2"
                >
                  <AlertTriangle className="h-4 w-4" />
                  Afficher uniquement les conflits
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Timeline Table View */}
      {sortedHours.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">Aucun événement ce jour</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            {/* Table Header */}
            <div className="grid grid-cols-12 border-b bg-muted/50 font-semibold text-sm">
              <div className="col-span-1 p-4 border-r">
                <Clock className="h-4 w-4 inline mr-2" />
                Horaire
              </div>
              <div className="col-span-4 p-4 border-r">
                <Calendar className="h-4 w-4 inline mr-2" />
                Programme
              </div>
              <div className="col-span-4 p-4 border-r">
                <Users className="h-4 w-4 inline mr-2" />
                Groupes & Participants
              </div>
              <div className="col-span-3 p-4">
                <Mail className="h-4 w-4 inline mr-2" />
                Logistique & Com
              </div>
            </div>

            {/* Table Rows */}
            <div className="divide-y">
              {sortedHours.map((hour) => {
                const items = itemsByHour[hour]
                const sessions = items.filter((item) => item.type === 'SESSION')
                const { arrivals, departures, emails, rsvps, checkins } = getLogisticsSummary(
                  hour,
                  items
                )

                // Detect conflicts in this time slot
                const hasConflict = items.some(
                  (item) =>
                    (item.capacity && item.participantCount && item.participantCount > item.capacity)
                )
                const hasWarning = items.some(
                  (item) =>
                    item.capacity &&
                    item.participantCount &&
                    item.participantCount >= item.capacity * 0.9 &&
                    item.participantCount <= item.capacity
                )

                return (
                  <div
                    key={hour}
                    className={cn(
                      'grid grid-cols-12 hover:bg-muted/20 transition-colors border-l-4',
                      hasConflict
                        ? 'border-l-red-500 bg-red-50/30'
                        : hasWarning
                          ? 'border-l-orange-400 bg-orange-50/20'
                          : 'border-l-transparent'
                    )}
                  >
                    {/* Time Column */}
                    <div className="col-span-1 p-4 border-r font-semibold text-lg">
                      {hour}
                    </div>

                    {/* Program Column */}
                    <div className="col-span-4 p-4 border-r space-y-2">
                      {sessions.map((session) => {
                        const Icon = getSessionIcon(session.sessionType)
                        const colorClass = getSessionColor(session.sessionType)

                        return (
                          <div key={session.id} className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Icon className={cn('h-4 w-4 text-white p-0.5 rounded', colorClass)} />
                              <span className="font-medium">{session.title}</span>
                            </div>
                            {session.location && (
                              <div className="text-sm text-muted-foreground flex items-center gap-1 ml-6">
                                <MapPin className="h-3 w-3" />
                                {session.location}
                              </div>
                            )}
                            {session.endTime && (
                              <div className="text-xs text-muted-foreground ml-6">
                                Jusqu&apos;à {format(new Date(session.endTime), 'HH:mm')}
                              </div>
                            )}
                          </div>
                        )
                      })}
                      {sessions.length === 0 && (
                        <div className="text-sm text-muted-foreground italic">-</div>
                      )}
                    </div>

                    {/* Groups Column */}
                    <div className="col-span-4 p-4 border-r space-y-2">
                      {sessions.map((session) => {
                        const isOverCapacity =
                          session.capacity &&
                          session.participantCount &&
                          session.participantCount > session.capacity

                        return (
                          <div key={session.id} className="space-y-1">
                            <div className="flex items-center justify-between gap-2 group">
                              <div className="flex items-center gap-2 flex-1">
                                <Users className="h-4 w-4 text-indigo-600" />
                                <span className={cn(
                                  'font-medium',
                                  isOverCapacity && 'text-red-600'
                                )}>
                                  {session.participantCount === session.capacity
                                    ? 'Tous'
                                    : `Groupe ${session.id.slice(-1)}`}{' '}
                                  ({session.participantCount || 0}
                                  {session.capacity && ` / ${session.capacity}`})
                                </span>
                                {isOverCapacity && (
                                  <Badge variant="destructive" className="text-xs">
                                    Surcharge
                                  </Badge>
                                )}
                              </div>
                              {/* Quick Actions */}
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0"
                                  title="Voir les participants"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0"
                                  title="Réassigner"
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0"
                                  title="Ajouter participants"
                                >
                                  <UserPlus className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>
                            {session.location && (
                              <div className="text-sm text-muted-foreground ml-6">
                                📍 {session.location}
                              </div>
                            )}
                          </div>
                        )
                      })}
                      {sessions.length === 0 && (
                        <div className="text-sm text-muted-foreground italic">-</div>
                      )}
                    </div>

                    {/* Logistics & Communications Column */}
                    <div className="col-span-3 p-4 space-y-2">
                      {arrivals.length > 0 && (
                        <div className="flex items-center justify-between gap-2 text-sm group">
                          <Badge variant="secondary" className="bg-teal-100 text-teal-700">
                            ✈️ {arrivals.length} arrivée{arrivals.length > 1 ? 's' : ''}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Voir détails"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                      {departures.length > 0 && (
                        <div className="flex items-center justify-between gap-2 text-sm group">
                          <Badge variant="secondary" className="bg-red-100 text-red-700">
                            ✈️ {departures.length} départ{departures.length > 1 ? 's' : ''}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Voir détails"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                      {emails.length > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                            📧 {emails.length} email{emails.length > 1 ? 's' : ''}
                          </Badge>
                        </div>
                      )}
                      {rsvps.length > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                          <Badge variant="secondary" className="bg-green-100 text-green-700">
                            📩 {rsvps.length} RSVP
                          </Badge>
                        </div>
                      )}
                      {checkins.length > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                          <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                            ✅ {checkins.length} check-in{checkins.length > 1 ? 's' : ''}
                          </Badge>
                        </div>
                      )}
                      {arrivals.length === 0 &&
                        departures.length === 0 &&
                        emails.length === 0 &&
                        rsvps.length === 0 &&
                        checkins.length === 0 && (
                          <div className="text-sm text-muted-foreground italic">-</div>
                        )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
