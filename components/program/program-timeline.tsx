"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, MapPin, Users, User, Calendar } from 'lucide-react'

interface Session {
  id: string
  title: string
  description: string | null
  type: string
  startTime: string
  endTime: string
  duration: number
  venue: string | null
  room: string | null
  capacity: number | null
  speakers: any
  color: string | null
  icon: string | null
  isPublic: boolean
}

interface ProgramTimelineProps {
  eventId: string
  sessions: Session[]
  onUpdate: () => void
}

// Icônes par type de session
const SESSION_ICONS: Record<string, string> = {
  KEYNOTE: '🎤',
  WORKSHOP: '🛠️',
  CONFERENCE: '📊',
  TEAMBUILDING: '🤝',
  MEAL: '🍽️',
  BREAK: '☕',
  TRANSFER: '🚌',
  ARRIVAL: '🛬',
  DEPARTURE: '🛫',
  FREE_TIME: '🏖️',
  NETWORKING: '🤝',
  TRAINING: '📚',
  PANEL: '💬',
  OTHER: '📌'
}

// Couleurs par type
const SESSION_COLORS: Record<string, string> = {
  KEYNOTE: '#9333EA',
  WORKSHOP: '#059669',
  CONFERENCE: '#0284C7',
  TEAMBUILDING: '#DC2626',
  MEAL: '#F59E0B',
  BREAK: '#8B5CF6',
  TRANSFER: '#6366F1',
  ARRIVAL: '#10B981',
  DEPARTURE: '#EF4444',
  FREE_TIME: '#14B8A6',
  NETWORKING: '#F97316',
  TRAINING: '#3B82F6',
  PANEL: '#EC4899',
  OTHER: '#6B7280'
}

// Labels pour les types
const SESSION_TYPE_LABELS: Record<string, string> = {
  KEYNOTE: 'Keynote',
  WORKSHOP: 'Atelier',
  CONFERENCE: 'Conférence',
  TEAMBUILDING: 'Team Building',
  MEAL: 'Repas',
  BREAK: 'Pause',
  TRANSFER: 'Transfert',
  ARRIVAL: 'Arrivée',
  DEPARTURE: 'Départ',
  FREE_TIME: 'Temps libre',
  NETWORKING: 'Networking',
  TRAINING: 'Formation',
  PANEL: 'Table ronde',
  OTHER: 'Autre'
}

export function ProgramTimeline({ sessions }: ProgramTimelineProps) {
  const sortedSessions = [...sessions].sort((a, b) =>
    new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  )

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const formatShortDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    })
  }

  // Grouper par jour
  const sessionsByDay = sortedSessions.reduce((acc, session) => {
    const day = formatShortDate(session.startTime)
    if (!acc[day]) acc[day] = []
    acc[day].push(session)
    return acc
  }, {} as Record<string, Session[]>)

  if (sessions.length === 0) {
    return (
      <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur">
        <CardContent className="py-12 text-center">
          <Calendar className="h-12 w-12 text-[#004645]/30 mx-auto mb-4" />
          <p className="text-[#004645]/60 font-medium">Aucune session à afficher</p>
          <p className="text-sm text-[#004645]/40 mt-2">Créez votre première session pour commencer</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      {Object.entries(sessionsByDay).map(([day, daySessions], dayIndex) => (
        <Card key={day} className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-[#004645] to-[#009197] text-white">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-3">
                <Calendar className="h-5 w-5" />
                {formatDate(daySessions[0].startTime)}
              </CardTitle>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                {daySessions.length} session{daySessions.length > 1 ? 's' : ''}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="relative">
              {/* Ligne de timeline verticale */}
              <div className="absolute left-[56px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#009197] via-[#9CD9F6] to-[#009197]" />

              <div className="space-y-0">
                {daySessions.map((session, index) => {
                  const sessionColor = SESSION_COLORS[session.type] || session.color || '#009197'
                  const sessionIcon = SESSION_ICONS[session.type] || session.icon || '📌'

                  return (
                    <div key={session.id} className="relative group">
                      {/* Point sur la timeline */}
                      <div
                        className="absolute left-[48px] top-6 w-4 h-4 rounded-full border-4 border-white shadow-lg z-10 transition-transform group-hover:scale-125"
                        style={{ backgroundColor: sessionColor }}
                      />

                      {/* Contenu de la session */}
                      <div className="flex gap-6 pb-6">
                        {/* Heure */}
                        <div className="text-right min-w-[80px] pt-4">
                          <div className="text-lg font-bold text-[#004645]">
                            {formatTime(session.startTime)}
                          </div>
                          <div className="text-xs text-[#004645]/60 font-medium">
                            {formatTime(session.endTime)}
                          </div>
                        </div>

                        {/* Carte de session */}
                        <div className="flex-1 ml-4">
                          <div
                            className="p-5 rounded-xl border-2 shadow-sm transition-all group-hover:shadow-lg group-hover:scale-[1.02] bg-white"
                            style={{
                              borderColor: `${sessionColor}40`,
                              borderLeftWidth: '6px',
                              borderLeftColor: sessionColor
                            }}
                          >
                            {/* En-tête */}
                            <div className="flex items-start justify-between gap-4 mb-3">
                              <div className="flex items-center gap-3 flex-1">
                                <span className="text-3xl">{sessionIcon}</span>
                                <div className="flex-1">
                                  <h4 className="font-bold text-[#004645] text-lg leading-tight mb-1">
                                    {session.title}
                                  </h4>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <Badge
                                      variant="outline"
                                      className="text-xs font-semibold"
                                      style={{
                                        borderColor: sessionColor,
                                        color: sessionColor,
                                        backgroundColor: `${sessionColor}10`
                                      }}
                                    >
                                      {SESSION_TYPE_LABELS[session.type] || session.type}
                                    </Badge>
                                    {!session.isPublic && (
                                      <Badge variant="outline" className="text-xs bg-gray-50">
                                        🔒 Privée
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 text-sm font-semibold px-3 py-1.5 rounded-full bg-[#9CD9F6]/20 text-[#004645]">
                                <Clock className="h-3.5 w-3.5" />
                                {session.duration} min
                              </div>
                            </div>

                            {/* Description */}
                            {session.description && (
                              <p className="text-sm text-[#004645]/70 mb-3 line-clamp-2">
                                {session.description}
                              </p>
                            )}

                            {/* Détails */}
                            <div className="flex flex-wrap gap-4 text-sm">
                              {session.venue && (
                                <div className="flex items-center gap-1.5 text-[#004645]/70">
                                  <MapPin className="h-3.5 w-3.5 text-[#009197]" />
                                  <span className="font-medium">{session.venue}</span>
                                  {session.room && (
                                    <span className="text-[#004645]/50">• {session.room}</span>
                                  )}
                                </div>
                              )}
                              {session.capacity && (
                                <div className="flex items-center gap-1.5 text-[#004645]/70">
                                  <Users className="h-3.5 w-3.5 text-[#009197]" />
                                  <span>{session.capacity} places</span>
                                </div>
                              )}
                              {session.speakers && Array.isArray(session.speakers) && session.speakers.length > 0 && (
                                <div className="flex items-center gap-1.5 text-[#004645]/70">
                                  <User className="h-3.5 w-3.5 text-[#009197]" />
                                  <span className="font-medium">
                                    {session.speakers.map((s: any) => s.name || s).join(', ')}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
