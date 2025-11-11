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
} from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface TimelineItem {
  id: string
  type: string
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
    firstName: string
    lastName: string
  }
}

const getIconForType = (type: string) => {
  switch (type) {
    case 'SESSION':
    case 'MEAL':
    case 'BREAK':
      return Calendar
    case 'TRANSPORT_ARRIVAL':
    case 'TRANSPORT_DEPARTURE':
      return Plane
    case 'HOTEL_CHECKIN':
    case 'HOTEL_CHECKOUT':
      return Hotel
    default:
      return Clock
  }
}

const getColorForType = (type: string) => {
  switch (type) {
    case 'SESSION':
      return 'bg-blue-500'
    case 'MEAL':
      return 'bg-orange-500'
    case 'BREAK':
      return 'bg-yellow-500'
    case 'TRANSPORT_ARRIVAL':
      return 'bg-teal-500'
    case 'TRANSPORT_DEPARTURE':
      return 'bg-red-500'
    case 'HOTEL_CHECKIN':
    case 'HOTEL_CHECKOUT':
      return 'bg-purple-500'
    default:
      return 'bg-gray-500'
  }
}

const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    SESSION: 'Session',
    MEAL: 'Repas',
    BREAK: 'Pause',
    TRANSPORT_ARRIVAL: 'Arrivée',
    TRANSPORT_DEPARTURE: 'Départ',
    HOTEL_CHECKIN: 'Check-in hôtel',
    HOTEL_CHECKOUT: 'Check-out hôtel',
  }
  return labels[type] || type
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
    totalParticipants: 0,
  })

  useEffect(() => {
    fetchTimeline()
  }, [eventId])

  const fetchTimeline = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/events/${eventId}/timeline`)
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
          <h1 className="text-3xl font-bold tracking-tight">Timeline Globale</h1>
          <p className="text-muted-foreground">
            Vue chronologique complète de l'événement
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filtres
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Événements</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEvents}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.sessions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transports</CardTitle>
            <Plane className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.transports}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Participants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalParticipants}</div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline by Date */}
      <div className="space-y-8">
        {Object.entries(timelineByDate).length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucun événement dans la timeline</h3>
              <p className="text-muted-foreground text-center">
                Créez des sessions ou ajoutez des transports pour voir la timeline
              </p>
            </CardContent>
          </Card>
        ) : (
          Object.entries(timelineByDate)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, items]) => (
              <div key={date}>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {format(new Date(date), 'EEEE d MMMM yyyy', { locale: fr })}
                </h2>

                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />

                  <div className="space-y-4">
                    {items
                      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                      .map((item) => {
                        const Icon = getIconForType(item.type)
                        const colorClass = item.color || getColorForType(item.type)

                        return (
                          <div key={item.id} className="relative pl-16">
                            {/* Timeline dot */}
                            <div className={`absolute left-4 w-5 h-5 rounded-full ${colorClass} border-4 border-background`} />

                            <Card className="hover:shadow-md transition-shadow">
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <Badge className={colorClass}>{getTypeLabel(item.type)}</Badge>
                                      <span className="text-sm font-medium text-muted-foreground">
                                        {format(new Date(item.startTime), 'HH:mm')}
                                        {item.endTime && ` - ${format(new Date(item.endTime), 'HH:mm')}`}
                                      </span>
                                    </div>

                                    <h3 className="font-semibold mb-1">{item.title}</h3>

                                    {item.description && (
                                      <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                                    )}

                                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                      {item.location && (
                                        <div className="flex items-center gap-1">
                                          <MapPin className="h-3 w-3" />
                                          {item.location}
                                        </div>
                                      )}

                                      {item.participantCount !== undefined && (
                                        <div className="flex items-center gap-1">
                                          <Users className="h-3 w-3" />
                                          {item.participantCount}
                                          {item.capacity && ` / ${item.capacity}`}
                                        </div>
                                      )}

                                      {item.guest && (
                                        <div className="flex items-center gap-1">
                                          <Users className="h-3 w-3" />
                                          {item.guest.firstName} {item.guest.lastName}
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  <Icon className="h-5 w-5 text-muted-foreground ml-4" />
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        )
                      })}
                  </div>
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  )
}
