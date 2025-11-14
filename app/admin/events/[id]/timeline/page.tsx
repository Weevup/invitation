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
  const [currentDateIndex, setCurrentDateIndex] = useState(0)

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

  // Get sorted dates
  const sortedDates = Object.keys(timelineByDate).sort()

  // Group items by hour for current selected date
  const currentDate = sortedDates[currentDateIndex]
  const currentDayItems = currentDate ? timelineByDate[currentDate] : []

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

  const itemsByHour = groupByHour(currentDayItems)
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

                return (
                  <div key={hour} className="grid grid-cols-12 hover:bg-muted/20 transition-colors">
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
                      {sessions.map((session) => (
                        <div key={session.id} className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-indigo-600" />
                            <span className="font-medium">
                              {session.participantCount === session.capacity
                                ? 'Tous'
                                : `Groupe ${session.id.slice(-1)}`}{' '}
                              ({session.participantCount || 0}
                              {session.capacity && ` / ${session.capacity}`})
                            </span>
                          </div>
                          {session.location && (
                            <div className="text-sm text-muted-foreground ml-6">
                              📍 {session.location}
                            </div>
                          )}
                        </div>
                      ))}
                      {sessions.length === 0 && (
                        <div className="text-sm text-muted-foreground italic">-</div>
                      )}
                    </div>

                    {/* Logistics & Communications Column */}
                    <div className="col-span-3 p-4 space-y-2">
                      {arrivals.length > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                          <Badge variant="secondary" className="bg-teal-100 text-teal-700">
                            ✈️ {arrivals.length} arrivée{arrivals.length > 1 ? 's' : ''}
                          </Badge>
                        </div>
                      )}
                      {departures.length > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                          <Badge variant="secondary" className="bg-red-100 text-red-700">
                            ✈️ {departures.length} départ{departures.length > 1 ? 's' : ''}
                          </Badge>
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
