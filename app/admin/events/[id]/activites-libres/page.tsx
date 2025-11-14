'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Users,
  Calendar,
  MapPin,
  Clock,
  ArrowRight,
  Search,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Loader2
} from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface SessionGroup {
  id: string
  name: string
  color?: string
  capacity?: number
  _count?: {
    participants: number
  }
}

interface Session {
  id: string
  title: string
  type: string
  startTime: string
  endTime: string
  venue?: string
  room?: string
  capacity?: number
  requiresGroups: boolean
  _count: {
    participants: number
  }
  groups: SessionGroup[]
}

export default function ActivitesLibresPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.id as string

  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchSessions()
  }, [eventId])

  async function fetchSessions() {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/events/${eventId}/sessions`)
      if (!response.ok) throw new Error('Failed to fetch sessions')

      const data = await response.json()
      // Filter only FREE_TIME sessions with groups/activities
      const freeTimeSessions = data.sessions.filter(
        (s: Session) => s.requiresGroups && s.type === 'FREE_TIME'
      )
      setSessions(freeTimeSessions)
    } catch (error) {
      console.error('Error fetching sessions:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredSessions = sessions.filter((session) =>
    session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.type.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getSessionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      MEAL: 'Repas',
      KEYNOTE: 'Keynote',
      CONFERENCE: 'Conférence',
      WORKSHOP: 'Activité',
      TEAMBUILDING: 'Team Building',
      BREAK: 'Pause',
      NETWORKING: 'Networking'
    }
    return labels[type] || type
  }

  const getSessionIcon = (type: string) => {
    switch (type) {
      case 'WORKSHOP': return '🛠️'
      case 'TEAMBUILDING': return '🎵'
      case 'CONFERENCE': return '📊'
      case 'KEYNOTE': return '🎤'
      default: return '📅'
    }
  }

  const getSessionStatus = (session: Session) => {
    const totalCapacity = session.groups.reduce((sum, g) => sum + (g.capacity || 0), 0)
    const totalAssigned = session.groups.reduce((sum, g) => sum + (g._count?.participants || 0), 0)
    const unassigned = session._count.participants - totalAssigned

    if (session.groups.length === 0) {
      return { status: 'empty', label: 'Aucune activité', color: 'text-gray-500', icon: AlertCircle }
    }
    if (unassigned > 0) {
      return { status: 'incomplete', label: `${unassigned} non assignés`, color: 'text-orange-600', icon: AlertTriangle }
    }
    if (totalAssigned > totalCapacity) {
      return { status: 'overcapacity', label: 'Surcharge', color: 'text-red-600', icon: AlertTriangle }
    }
    return { status: 'complete', label: 'Complet', color: 'text-green-600', icon: CheckCircle2 }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Chargement des sessions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">🌴 Gestion des activités libres</h1>
        <p className="text-muted-foreground">
          Créez et gérez les activités à choix pour vos participants (randonnée, spa, golf, etc.)
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Temps libres
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{sessions.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Activités proposées
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {sessions.reduce((sum, s) => sum + s.groups.length, 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total participants
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {sessions.reduce((sum, s) => sum + s._count.participants, 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Participants assignés
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {sessions.reduce((sum, s) =>
                sum + s.groups.reduce((gSum, g) => gSum + (g._count?.participants || 0), 0), 0
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher une session..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Sessions List */}
      {filteredSessions.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucune activité libre</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Créez une session de type &quot;Temps libre&quot; avec l&apos;option &quot;Session avec groupes&quot; activée depuis le module Programme
            </p>
            <Button onClick={() => router.push(`/admin/events/${eventId}/program`)}>
              Aller au Programme
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredSessions.map((session) => {
            const status = getSessionStatus(session)
            const StatusIcon = status.icon

            return (
              <Card key={session.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    {/* Left: Session Info */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getSessionIcon(session.type)}</span>
                        <div>
                          <h3 className="text-lg font-semibold">{session.title}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <Badge variant="outline">{getSessionTypeLabel(session.type)}</Badge>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(session.startTime), 'PPP', { locale: fr })}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {format(new Date(session.startTime), 'HH:mm', { locale: fr })} - {format(new Date(session.endTime), 'HH:mm', { locale: fr })}
                            </div>
                            {session.venue && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {session.venue} {session.room && `- ${session.room}`}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Groups Summary */}
                      <div className="flex items-center gap-2">
                        <div className={cn("flex items-center gap-1.5 text-sm font-medium", status.color)}>
                          <StatusIcon className="h-4 w-4" />
                          {status.label}
                        </div>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-sm text-muted-foreground">
                          {session.groups.length} activité{session.groups.length > 1 ? 's' : ''}
                        </span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-sm text-muted-foreground">
                          {session._count.participants} participant{session._count.participants > 1 ? 's' : ''}
                        </span>
                      </div>

                      {/* Groups Badges */}
                      {session.groups.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {session.groups.map((group) => (
                            <Badge
                              key={group.id}
                              variant="outline"
                              className="border-2"
                              style={{
                                borderColor: group.color || '#3B82F6',
                                color: group.color || '#3B82F6'
                              }}
                            >
                              <div
                                className="w-2 h-2 rounded-full mr-1.5"
                                style={{ backgroundColor: group.color || '#3B82F6' }}
                              />
                              {group.name}: {group._count?.participants || 0}
                              {group.capacity && `/${group.capacity}`}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Right: Action Button */}
                    <Button
                      onClick={() => router.push(`/admin/events/${eventId}/activites-libres/${session.id}`)}
                      className="ml-4"
                    >
                      Gérer
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
