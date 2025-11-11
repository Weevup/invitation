'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  Plus,
  Edit,
  Trash2,
  Sparkles,
  Filter,
  Download,
} from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface Session {
  id: string
  title: string
  description?: string
  type: string
  status: string
  startTime: string
  endTime: string
  duration: number
  venue?: string
  room?: string
  capacity?: number
  participantCount: number
  availableSpots?: number
  isPublic: boolean
  isHighlighted: boolean
  color?: string
  icon?: string
  tags: string[]
}

const sessionTypeLabels: Record<string, string> = {
  KEYNOTE: 'Keynote',
  WORKSHOP: 'Workshop',
  CONFERENCE: 'Conférence',
  TEAMBUILDING: 'Teambuilding',
  MEAL: 'Repas',
  BREAK: 'Pause',
  TRANSFER: 'Transfert',
  ARRIVAL: 'Arrivée',
  DEPARTURE: 'Départ',
  FREE_TIME: 'Temps libre',
  NETWORKING: 'Networking',
  TRAINING: 'Formation',
  PANEL: 'Panel',
  OTHER: 'Autre',
}

const sessionTypeColors: Record<string, string> = {
  KEYNOTE: 'bg-purple-500',
  WORKSHOP: 'bg-blue-500',
  CONFERENCE: 'bg-indigo-500',
  TEAMBUILDING: 'bg-green-500',
  MEAL: 'bg-orange-500',
  BREAK: 'bg-yellow-500',
  TRANSFER: 'bg-gray-500',
  ARRIVAL: 'bg-teal-500',
  DEPARTURE: 'bg-red-500',
  FREE_TIME: 'bg-cyan-500',
  NETWORKING: 'bg-pink-500',
  TRAINING: 'bg-emerald-500',
  PANEL: 'bg-violet-500',
  OTHER: 'bg-slate-500',
}

const statusLabels: Record<string, string> = {
  DRAFT: 'Brouillon',
  PUBLISHED: 'Publié',
  ONGOING: 'En cours',
  COMPLETED: 'Terminé',
  CANCELLED: 'Annulé',
}

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-500',
  PUBLISHED: 'bg-green-500',
  ONGOING: 'bg-blue-500',
  COMPLETED: 'bg-purple-500',
  CANCELLED: 'bg-red-500',
}

export default function SessionsPage() {
  const params = useParams()
  const eventId = params.id as string

  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState<string>('ALL')
  const [filterStatus, setFilterStatus] = useState<string>('ALL')

  useEffect(() => {
    fetchSessions()
  }, [eventId])

  const fetchSessions = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/events/${eventId}/sessions`)
      if (response.ok) {
        const data = await response.json()
        setSessions(data.sessions || [])
      }
    } catch (error) {
      console.error('Error fetching sessions:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredSessions = sessions.filter((session) => {
    if (filterType !== 'ALL' && session.type !== filterType) return false
    if (filterStatus !== 'ALL' && session.status !== filterStatus) return false
    return true
  })

  // Group sessions by date
  const sessionsByDate = filteredSessions.reduce((acc, session) => {
    const date = format(new Date(session.startTime), 'yyyy-MM-dd')
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(session)
    return acc
  }, {} as Record<string, Session[]>)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement des sessions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Programme & Sessions</h1>
          <p className="text-muted-foreground">
            Gérez le programme complet de votre événement
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle session
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessions.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Workshops</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sessions.filter((s) => s.type === 'WORKSHOP').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Participants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sessions.reduce((acc, s) => acc + s.participantCount, 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Durée totale</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(sessions.reduce((acc, s) => acc + s.duration, 0) / 60)}h
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filterType === 'ALL' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('ALL')}
            >
              Tous
            </Button>
            {Object.entries(sessionTypeLabels).map(([type, label]) => (
              <Button
                key={type}
                variant={filterType === type ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType(type)}
              >
                {label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sessions List */}
      <div className="space-y-6">
        {Object.entries(sessionsByDate).length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucune session</h3>
              <p className="text-muted-foreground text-center mb-4">
                Commencez par créer votre première session
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Créer une session
              </Button>
            </CardContent>
          </Card>
        ) : (
          Object.entries(sessionsByDate).map(([date, dateSessions]) => (
            <div key={date}>
              <h2 className="text-xl font-semibold mb-4">
                {format(new Date(date), 'EEEE d MMMM yyyy', { locale: fr })}
              </h2>
              <div className="grid gap-4">
                {dateSessions.map((session) => (
                  <Card key={session.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={sessionTypeColors[session.type]}>
                              {sessionTypeLabels[session.type]}
                            </Badge>
                            <Badge variant="outline" className={statusColors[session.status]}>
                              {statusLabels[session.status]}
                            </Badge>
                            {session.isHighlighted && (
                              <Badge variant="outline" className="bg-yellow-100">
                                <Sparkles className="h-3 w-3 mr-1" />
                                Featured
                              </Badge>
                            )}
                          </div>

                          <h3 className="text-lg font-semibold mb-1">{session.title}</h3>
                          {session.description && (
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                              {session.description}
                            </p>
                          )}

                          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {format(new Date(session.startTime), 'HH:mm')} -{' '}
                              {format(new Date(session.endTime), 'HH:mm')}
                              <span className="ml-1">({session.duration} min)</span>
                            </div>

                            {session.venue && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {session.venue}
                                {session.room && ` - ${session.room}`}
                              </div>
                            )}

                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {session.participantCount}
                              {session.capacity && ` / ${session.capacity}`}
                              {session.availableSpots !== null && (
                                <span className="text-xs">
                                  ({session.availableSpots} places restantes)
                                </span>
                              )}
                            </div>
                          </div>

                          {session.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-3">
                              {session.tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2 ml-4">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
