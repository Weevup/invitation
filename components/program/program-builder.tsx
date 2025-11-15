"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { SessionEditor } from './session-editor'
import { SessionCard } from './program-builder/components/SessionCard'
import { TimeGrid } from './program-builder/components/TimeGrid'
import { Badge } from '@/components/ui/badge'
import { formatTime, formatDate } from '@/lib/program/constants'
import {
  DEFAULT_TIMELINE_CONFIG,
  snapToInterval,
  getSessionPosition,
  getTimeFromPosition,
  generateTimeMarkers,
  type TimelineConfig,
} from './program-builder/utils/time-calculations'

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
  onSessionsChange?: (sessions: Session[]) => void
}

export function ProgramBuilder({ eventId, sessions, onUpdate, onSessionsChange }: ProgramBuilderProps) {
  const [draggedSession, setDraggedSession] = useState<Session | null>(null)
  const [editingSession, setEditingSession] = useState<Session | null>(null)
  const [creatingSession, setCreatingSession] = useState(false)
  const [dragOverTime, setDragOverTime] = useState<Date | null>(null)
  const [resizingSession, setResizingSession] = useState<{ id: string, edge: 'top' | 'bottom' } | null>(null)

  // Use timeline configuration
  const config: TimelineConfig = DEFAULT_TIMELINE_CONFIG

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
      const newTime = getTimeFromPosition(y, baseDate, config)
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
    const newStartTime = getTimeFromPosition(y, baseDate, config)
    const newEndTime = new Date(newStartTime.getTime() + draggedSession.duration * 60000)

    // Optimistic update
    if (onSessionsChange) {
      const updatedSessions = sessions.map(s =>
        s.id === draggedSession.id
          ? { ...s, startTime: newStartTime.toISOString(), endTime: newEndTime.toISOString() }
          : s
      )
      onSessionsChange(updatedSessions)
    }

    setDraggedSession(null)
    setDragOverTime(null)

    try {
      await fetch(`/api/admin/events/${eventId}/sessions/${draggedSession.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startTime: newStartTime.toISOString(),
          endTime: newEndTime.toISOString(),
        })
      })
    } catch (error) {
      console.error('Error moving session:', error)
      // Revert on error
      onUpdate()
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
    const newTime = getTimeFromPosition(y, baseDate, config)

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

    // Optimistic update
    if (onSessionsChange) {
      const updatedSessions = sessions.map(s =>
        s.id === session.id
          ? { ...s, startTime: newStartTime.toISOString(), endTime: newEndTime.toISOString(), duration: newDuration }
          : s
      )
      onSessionsChange(updatedSessions)
    }

    setResizingSession(null)
    setDragOverTime(null)

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
    } catch (error) {
      console.error('Error resizing session:', error)
      // Revert on error
      onUpdate()
    }
  }

  const handleDelete = async (sessionId: string) => {
    if (!confirm('Supprimer cette session ?')) return

    // Optimistic update
    if (onSessionsChange) {
      const updatedSessions = sessions.filter(s => s.id !== sessionId)
      onSessionsChange(updatedSessions)
    }

    try {
      await fetch(`/api/admin/events/${eventId}/sessions/${sessionId}`, {
        method: 'DELETE'
      })
    } catch (error) {
      console.error('Error deleting session:', error)
      alert('Erreur lors de la suppression de la session')
      // Revert on error
      onUpdate()
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
    // Optimistic update
    if (onSessionsChange) {
      const updatedSessions = sessions.map(s =>
        s.id === session.id
          ? { ...s, isPublic: !s.isPublic }
          : s
      )
      onSessionsChange(updatedSessions)
    }

    try {
      await fetch(`/api/admin/events/${eventId}/sessions/${session.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublic: !session.isPublic })
      })
    } catch (error) {
      console.error('Error toggling visibility:', error)
      // Revert on error
      onUpdate()
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
  const hourMarkers = generateTimeMarkers(config)
  const totalHeight = (config.timeEnd - config.timeStart) * config.hourHeight

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
                      style={{ height: `${config.hourHeight}px` }}
                    >
                      {hour.toString().padStart(2, '0')}:00
                      {/* 15-minute markers */}
                      <div className="absolute left-0 right-0" style={{ top: `${config.hourHeight * 0.25}px` }}>
                        <div className="h-px bg-gray-100 ml-2" />
                      </div>
                      <div className="absolute left-0 right-0" style={{ top: `${config.hourHeight * 0.5}px` }}>
                        <div className="h-px bg-gray-200 ml-2" />
                      </div>
                      <div className="absolute left-0 right-0" style={{ top: `${config.hourHeight * 0.75}px` }}>
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
                        style={{ top: `${(hour - config.timeStart) * config.hourHeight}px` }}
                      />
                      {/* 15-minute grid lines */}
                      <div
                        className="absolute w-full border-b border-dashed border-gray-50"
                        style={{ top: `${(hour - config.timeStart) * config.hourHeight + config.hourHeight * 0.25}px` }}
                      />
                      <div
                        className="absolute w-full border-b border-gray-100"
                        style={{ top: `${(hour - config.timeStart) * config.hourHeight + config.hourHeight * 0.5}px` }}
                      />
                      <div
                        className="absolute w-full border-b border-dashed border-gray-50"
                        style={{ top: `${(hour - config.timeStart) * config.hourHeight + config.hourHeight * 0.75}px` }}
                      />
                    </div>
                  ))}

                  {/* Drag over indicator */}
                  {draggedSession && dragOverTime && formatDate(draggedSession.startTime) === day && (
                    <div
                      className="absolute w-full border-2 border-dashed border-[#009197] bg-[#009197]/5 rounded-lg pointer-events-none z-10"
                      style={{
                        top: `${getSessionPosition({ ...draggedSession, startTime: dragOverTime.toISOString() }, config).top}px`,
                        height: `${getSessionPosition(draggedSession, config).height}px`,
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

                    const { top, height } = getSessionPosition(tempSession, config)

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
                    const isDragging = draggedSession?.id === session.id
                    const isResizing = resizingSession?.id === session.id

                    return (
                      <SessionCard
                        key={session.id}
                        session={session}
                        config={config}
                        isDragging={isDragging}
                        isResizing={isResizing}
                        onDragStart={handleDragStart}
                        onDragEnd={() => {
                          setDraggedSession(null)
                          setDragOverTime(null)
                        }}
                        onEdit={setEditingSession}
                        onDuplicate={handleDuplicate}
                        onDelete={handleDelete}
                        onToggleVisibility={handleToggleVisibility}
                        onResizeStart={handleResizeStart}
                      />
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
