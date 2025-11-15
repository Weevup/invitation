"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Edit, Trash2, Copy, Eye, EyeOff, Clock, MapPin, Users } from 'lucide-react'
import { SessionEditor } from './session-editor'
import { Badge } from '@/components/ui/badge'

interface Session {
  id: string
  title: string
  description: string | null
  type: string
  status: string
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
  order: number
}

interface ProgramBuilderProps {
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

export function ProgramBuilder({ eventId, sessions, onUpdate }: ProgramBuilderProps) {
  const [draggedSession, setDraggedSession] = useState<Session | null>(null)
  const [editingSession, setEditingSession] = useState<Session | null>(null)
  const [creatingSession, setCreatingSession] = useState(false)
  const [dragOverTime, setDragOverTime] = useState<Date | null>(null)
  const [resizingSession, setResizingSession] = useState<{ id: string, edge: 'top' | 'bottom' } | null>(null)

  // Constants for timeline visualization
  const HOUR_HEIGHT = 80 // pixels per hour
  const MIN_SESSION_HEIGHT = 40 // minimum height for readability
  const TIME_START = 6 // 6:00 AM
  const TIME_END = 23 // 11:00 PM
  const SNAP_INTERVAL = 15 // Snap to 15 minute intervals

  // Snap time to nearest 15 minute interval
  const snapToInterval = (date: Date): Date => {
    const minutes = date.getMinutes()
    const snappedMinutes = Math.round(minutes / SNAP_INTERVAL) * SNAP_INTERVAL
    const newDate = new Date(date)
    newDate.setMinutes(snappedMinutes)
    newDate.setSeconds(0)
    newDate.setMilliseconds(0)
    return newDate
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Paris'
    })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      timeZone: 'Europe/Paris'
    })
  }

  // Calculate position and height based on time
  const getSessionPosition = (session: Session) => {
    const start = new Date(session.startTime)
    const hours = start.getHours() + start.getMinutes() / 60
    const offsetFromStart = hours - TIME_START
    const top = Math.max(0, offsetFromStart * HOUR_HEIGHT)

    // Height based on duration
    const durationHours = session.duration / 60
    const height = Math.max(MIN_SESSION_HEIGHT, durationHours * HOUR_HEIGHT)

    return { top, height }
  }

  // Convert pixel position to time
  const getTimeFromPosition = (top: number, day: Date) => {
    const hours = TIME_START + (top / HOUR_HEIGHT)
    const newTime = new Date(day)
    newTime.setHours(Math.floor(hours))
    newTime.setMinutes(Math.round((hours % 1) * 60))
    newTime.setSeconds(0)
    newTime.setMilliseconds(0)
    return snapToInterval(newTime)
  }

  const handleDragStart = (session: Session) => {
    setDraggedSession(session)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, day: string) => {
    e.preventDefault()

    // Calculate time from mouse position
    const rect = e.currentTarget.getBoundingClientRect()
    const y = e.clientY - rect.top
    const dayDate = sessions.find(s => formatDate(s.startTime) === day)
    if (dayDate) {
      const baseDate = new Date(dayDate.startTime)
      baseDate.setHours(0, 0, 0, 0)
      const newTime = getTimeFromPosition(y, baseDate)
      setDragOverTime(newTime)
    }
  }

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>, day: string) => {
    e.preventDefault()

    if (!draggedSession) return

    // Calculate new time from drop position
    const rect = e.currentTarget.getBoundingClientRect()
    const y = e.clientY - rect.top

    const dayDate = sessions.find(s => formatDate(s.startTime) === day)
    if (!dayDate) return

    const baseDate = new Date(dayDate.startTime)
    baseDate.setHours(0, 0, 0, 0)
    const newStartTime = getTimeFromPosition(y, baseDate)
    const newEndTime = new Date(newStartTime.getTime() + draggedSession.duration * 60000)

    try {
      await fetch(`/api/admin/events/${eventId}/sessions/${draggedSession.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startTime: newStartTime.toISOString(),
          endTime: newEndTime.toISOString(),
        })
      })

      setDraggedSession(null)
      setDragOverTime(null)
      onUpdate()
    } catch (error) {
      console.error('Error moving session:', error)
      setDraggedSession(null)
      setDragOverTime(null)
    }
  }

  // Handle resize
  const handleResizeStart = (e: React.MouseEvent, session: Session, edge: 'top' | 'bottom') => {
    e.stopPropagation()
    e.preventDefault()
    setResizingSession({ id: session.id, edge })
  }

  const handleResizeMove = (e: React.MouseEvent<HTMLDivElement>, day: string) => {
    if (!resizingSession) return

    const session = sessions.find(s => s.id === resizingSession.id)
    if (!session) return

    const rect = e.currentTarget.getBoundingClientRect()
    const y = e.clientY - rect.top

    const dayDate = sessions.find(s => formatDate(s.startTime) === day)
    if (!dayDate) return

    const baseDate = new Date(dayDate.startTime)
    baseDate.setHours(0, 0, 0, 0)
    const newTime = getTimeFromPosition(y, baseDate)

    if (resizingSession.edge === 'top') {
      const endTime = new Date(session.endTime)
      if (newTime < endTime) {
        setDragOverTime(newTime)
      }
    } else {
      const startTime = new Date(session.startTime)
      if (newTime > startTime) {
        setDragOverTime(newTime)
      }
    }
  }

  const handleResizeEnd = async (day: string) => {
    if (!resizingSession || !dragOverTime) {
      setResizingSession(null)
      setDragOverTime(null)
      return
    }

    const session = sessions.find(s => s.id === resizingSession.id)
    if (!session) {
      setResizingSession(null)
      setDragOverTime(null)
      return
    }

    const newStartTime = resizingSession.edge === 'top' ? dragOverTime : new Date(session.startTime)
    const newEndTime = resizingSession.edge === 'bottom' ? dragOverTime : new Date(session.endTime)
    const newDuration = Math.round((newEndTime.getTime() - newStartTime.getTime()) / 60000)

    // Minimum duration of 15 minutes
    if (newDuration < 15) {
      setResizingSession(null)
      setDragOverTime(null)
      return
    }

    try {
      await fetch(`/api/admin/events/${eventId}/sessions/${session.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startTime: newStartTime.toISOString(),
          endTime: newEndTime.toISOString(),
          duration: newDuration
        })
      })

      setResizingSession(null)
      setDragOverTime(null)
      onUpdate()
    } catch (error) {
      console.error('Error resizing session:', error)
      setResizingSession(null)
      setDragOverTime(null)
    }
  }

  const handleDelete = async (sessionId: string) => {
    if (!confirm('Supprimer cette session ?')) return

    try {
      await fetch(`/api/admin/events/${eventId}/sessions/${sessionId}`, {
        method: 'DELETE'
      })
      onUpdate()
    } catch (error) {
      console.error('Error deleting session:', error)
      alert('Erreur lors de la suppression de la session')
    }
  }

  const handleDuplicate = async (session: Session) => {
    // Only send fields that the API expects (from createSessionSchema)
    const newSession = {
      title: `${session.title} (copie)`,
      description: session.description,
      type: session.type,
      status: 'DRAFT',
      startTime: session.startTime,
      endTime: session.endTime,
      venue: session.venue,
      room: session.room,
      capacity: session.capacity,
      speakers: session.speakers,
      color: session.color,
      icon: session.icon,
      isPublic: session.isPublic,
    }

    try {
      const response = await fetch(`/api/admin/events/${eventId}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSession)
      })

      if (!response.ok) {
        const error = await response.json()
        console.error('Failed to duplicate session:', error)
        alert('Erreur lors de la duplication de la session')
        return
      }

      onUpdate()
    } catch (error) {
      console.error('Error duplicating session:', error)
      alert('Erreur lors de la duplication de la session')
    }
  }

  const handleToggleVisibility = async (session: Session) => {
    try {
      await fetch(`/api/admin/events/${eventId}/sessions/${session.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublic: !session.isPublic })
      })
      onUpdate()
    } catch (error) {
      console.error('Error toggling visibility:', error)
    }
  }

  // Grouper par jour
  const sessionsByDay = sessions.reduce((acc, session) => {
    const day = formatDate(session.startTime)
    if (!acc[day]) acc[day] = []
    acc[day].push(session)
    return acc
  }, {} as Record<string, Session[]>)

  // Generate hour markers
  const generateHourMarkers = () => {
    const markers = []
    for (let hour = TIME_START; hour <= TIME_END; hour++) {
      markers.push(hour)
    }
    return markers
  }

  const hourMarkers = generateHourMarkers()
  const totalHeight = (TIME_END - TIME_START) * HOUR_HEIGHT

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-[#004645]">Planning visuel</h3>
            <p className="text-sm text-[#004645]/70">Glissez-déposez les sessions • Redimensionnez par les bords • Snap automatique tous les 15 min</p>
          </div>
          <Button
            type="button"
            onClick={() => setCreatingSession(true)}
            className="bg-[#FF4713] hover:bg-[#FF6B3D] text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle session
          </Button>
        </div>

        {Object.entries(sessionsByDay).map(([day, daySessions]) => (
          <Card key={day} className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur">
            <CardHeader className="bg-gradient-to-r from-[#004645] to-[#009197] text-white">
              <CardTitle className="text-white flex items-center gap-2">
                📅 {day}
                <Badge variant="secondary" className="ml-2 bg-white/20 text-white border-white/30">
                  {daySessions.length} session{daySessions.length > 1 ? 's' : ''}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="flex">
                {/* Time column */}
                <div className="w-20 bg-gray-50 border-r border-gray-200 flex-shrink-0">
                  {hourMarkers.map((hour) => (
                    <div
                      key={hour}
                      className="relative border-b border-gray-200 text-xs text-gray-500 font-medium px-2 py-1"
                      style={{ height: `${HOUR_HEIGHT}px` }}
                    >
                      {hour.toString().padStart(2, '0')}:00
                      {/* 15-minute markers */}
                      <div className="absolute left-0 right-0" style={{ top: `${HOUR_HEIGHT * 0.25}px` }}>
                        <div className="h-px bg-gray-100 ml-2" />
                      </div>
                      <div className="absolute left-0 right-0" style={{ top: `${HOUR_HEIGHT * 0.5}px` }}>
                        <div className="h-px bg-gray-200 ml-2" />
                      </div>
                      <div className="absolute left-0 right-0" style={{ top: `${HOUR_HEIGHT * 0.75}px` }}>
                        <div className="h-px bg-gray-100 ml-2" />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Timeline column */}
                <div
                  className="flex-1 relative bg-white"
                  style={{ minHeight: `${totalHeight}px` }}
                  onDragOver={(e) => handleDragOver(e, day)}
                  onDrop={(e) => handleDrop(e, day)}
                  onDragLeave={() => setDragOverTime(null)}
                  onMouseMove={(e) => resizingSession && handleResizeMove(e, day)}
                  onMouseUp={() => resizingSession && handleResizeEnd(day)}
                  onMouseLeave={() => {
                    if (resizingSession) {
                      setResizingSession(null)
                      setDragOverTime(null)
                    }
                  }}
                >
                  {/* Hour grid lines */}
                  {hourMarkers.map((hour) => (
                    <div key={`grid-${hour}`}>
                      <div
                        className="absolute w-full border-b border-gray-100"
                        style={{ top: `${(hour - TIME_START) * HOUR_HEIGHT}px` }}
                      />
                      {/* 15-minute grid lines */}
                      <div
                        className="absolute w-full border-b border-dashed border-gray-50"
                        style={{ top: `${(hour - TIME_START) * HOUR_HEIGHT + HOUR_HEIGHT * 0.25}px` }}
                      />
                      <div
                        className="absolute w-full border-b border-gray-100"
                        style={{ top: `${(hour - TIME_START) * HOUR_HEIGHT + HOUR_HEIGHT * 0.5}px` }}
                      />
                      <div
                        className="absolute w-full border-b border-dashed border-gray-50"
                        style={{ top: `${(hour - TIME_START) * HOUR_HEIGHT + HOUR_HEIGHT * 0.75}px` }}
                      />
                    </div>
                  ))}

                  {/* Drag over indicator */}
                  {draggedSession && dragOverTime && formatDate(draggedSession.startTime) === day && (
                    <div
                      className="absolute w-full border-2 border-dashed border-[#009197] bg-[#009197]/5 rounded-lg pointer-events-none z-10"
                      style={{
                        top: `${getSessionPosition({ ...draggedSession, startTime: dragOverTime.toISOString() }).top}px`,
                        height: `${getSessionPosition(draggedSession).height}px`,
                        left: '8px',
                        right: '8px'
                      }}
                    >
                      <div className="absolute top-2 left-2 text-xs font-semibold text-[#009197]">
                        {formatTime(dragOverTime.toISOString())}
                      </div>
                    </div>
                  )}

                  {/* Resize indicator */}
                  {resizingSession && dragOverTime && (() => {
                    const session = sessions.find(s => s.id === resizingSession.id)
                    if (!session || formatDate(session.startTime) !== day) return null

                    const startTime = resizingSession.edge === 'top' ? dragOverTime : new Date(session.startTime)
                    const endTime = resizingSession.edge === 'bottom' ? dragOverTime : new Date(session.endTime)
                    const tempSession = {
                      ...session,
                      startTime: startTime.toISOString(),
                      endTime: endTime.toISOString(),
                      duration: Math.round((endTime.getTime() - startTime.getTime()) / 60000)
                    }

                    const { top, height } = getSessionPosition(tempSession)

                    return (
                      <div
                        className="absolute w-full border-2 border-dashed border-[#FF4713] bg-[#FF4713]/5 rounded-lg pointer-events-none z-10"
                        style={{
                          top: `${top}px`,
                          height: `${height}px`,
                          left: '8px',
                          right: '8px'
                        }}
                      >
                        <div className="absolute top-2 left-2 text-xs font-semibold text-[#FF4713]">
                          {formatTime(startTime.toISOString())} - {formatTime(endTime.toISOString())}
                          <span className="ml-2 text-[#FF4713]/70">({tempSession.duration} min)</span>
                        </div>
                      </div>
                    )
                  })()}

                  {/* Sessions */}
                  {daySessions.map((session) => {
                    const { top, height } = getSessionPosition(session)
                    const sessionColor = SESSION_COLORS[session.type] || session.color || '#009197'
                    const sessionIcon = SESSION_ICONS[session.type] || session.icon || '📌'
                    const isDragging = draggedSession?.id === session.id
                    const isResizing = resizingSession?.id === session.id

                    return (
                      <div
                        key={session.id}
                        draggable={!isResizing}
                        onDragStart={() => !isResizing && handleDragStart(session)}
                        onDragEnd={() => {
                          setDraggedSession(null)
                          setDragOverTime(null)
                        }}
                        className={`
                          absolute left-2 right-2 rounded-lg border-2 shadow-sm transition-all group
                          ${isDragging ? 'opacity-50 scale-95 shadow-lg' : 'hover:shadow-md hover:scale-[1.01]'}
                          ${isResizing ? 'opacity-75 shadow-lg' : 'cursor-move'}
                          ${!session.isPublic ? 'opacity-75' : ''}
                        `}
                        style={{
                          top: `${top}px`,
                          height: `${height}px`,
                          backgroundColor: 'white',
                          borderLeftWidth: '6px',
                          borderLeftColor: sessionColor,
                          borderColor: `${sessionColor}40`,
                          zIndex: isDragging || isResizing ? 50 : 20
                        }}
                      >
                        {/* Resize handle top */}
                        <div
                          className="absolute top-0 left-0 right-0 h-2 cursor-ns-resize hover:bg-[#FF4713]/20 transition-colors z-30 flex items-center justify-center"
                          onMouseDown={(e) => handleResizeStart(e, session, 'top')}
                        >
                          <div className="w-12 h-1 bg-gray-300 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>

                        <div className="h-full flex flex-col p-3 overflow-hidden">
                          {/* Header */}
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <span className="text-lg flex-shrink-0">{sessionIcon}</span>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-[#004645] text-sm leading-tight truncate">
                                  {session.title}
                                </h4>
                                <div className="flex items-center gap-1.5 text-xs text-[#004645]/70 mt-0.5">
                                  <Clock className="h-3 w-3" />
                                  {formatTime(session.startTime)} - {formatTime(session.endTime)}
                                  <span className="text-[#004645]/50">• {session.duration} min</span>
                                </div>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleToggleVisibility(session)
                                }}
                                className="h-6 w-6 p-0"
                                title={session.isPublic ? 'Rendre privée' : 'Rendre publique'}
                              >
                                {session.isPublic ? (
                                  <Eye className="h-3 w-3" />
                                ) : (
                                  <EyeOff className="h-3 w-3" />
                                )}
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setEditingSession(session)
                                }}
                                className="h-6 w-6 p-0"
                                title="Modifier"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDuplicate(session)
                                }}
                                className="h-6 w-6 p-0"
                                title="Dupliquer"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDelete(session.id)
                                }}
                                className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                title="Supprimer"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>

                          {/* Details (only show if enough height) */}
                          {height > 80 && (
                            <div className="flex flex-wrap gap-2 text-xs mt-1">
                              <Badge
                                variant="outline"
                                className="text-xs"
                                style={{
                                  borderColor: sessionColor,
                                  color: sessionColor,
                                  backgroundColor: `${sessionColor}10`
                                }}
                              >
                                {SESSION_TYPE_LABELS[session.type] || session.type}
                              </Badge>
                              {!session.isPublic && (
                                <Badge variant="outline" className="text-xs">🔒 Privée</Badge>
                              )}
                              {session.status === 'DRAFT' && (
                                <Badge variant="outline" className="text-xs bg-gray-100">Brouillon</Badge>
                              )}
                            </div>
                          )}

                          {/* Location and capacity (only show if enough height) */}
                          {height > 120 && (
                            <div className="flex flex-wrap gap-3 text-xs text-[#004645]/70 mt-2">
                              {session.venue && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3 text-[#009197]" />
                                  <span>{session.venue}</span>
                                  {session.room && <span className="text-[#004645]/50">• {session.room}</span>}
                                </div>
                              )}
                              {session.capacity && (
                                <div className="flex items-center gap-1">
                                  <Users className="h-3 w-3 text-[#009197]" />
                                  <span>{session.capacity} pers.</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Resize handle bottom */}
                        <div
                          className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize hover:bg-[#FF4713]/20 transition-colors z-30 flex items-center justify-center"
                          onMouseDown={(e) => handleResizeStart(e, session, 'bottom')}
                        >
                          <div className="w-12 h-1 bg-gray-300 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {sessions.length === 0 && (
          <Card className="border-[#9CD9F6]/30 border-dashed">
            <CardContent className="py-12 text-center">
              <p className="text-[#004645]/60 mb-4">Aucune session pour le moment</p>
              <Button
                type="button"
                onClick={() => setCreatingSession(true)}
                className="bg-[#FF4713] hover:bg-[#FF6B3D] text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Créer la première session
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Session Editor Dialog */}
      {(editingSession || creatingSession) && (
        <SessionEditor
          eventId={eventId}
          session={editingSession}
          onClose={() => {
            setEditingSession(null)
            setCreatingSession(false)
          }}
          onSave={() => {
            setEditingSession(null)
            setCreatingSession(false)
            onUpdate()
          }}
        />
      )}
    </>
  )
}
