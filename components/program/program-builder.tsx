"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, GripVertical, Edit, Trash2, Copy, Eye, EyeOff } from 'lucide-react'
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

export function ProgramBuilder({ eventId, sessions, onUpdate }: ProgramBuilderProps) {
  const [draggedSession, setDraggedSession] = useState<string | null>(null)
  const [editingSession, setEditingSession] = useState<Session | null>(null)
  const [creatingSession, setCreatingSession] = useState(false)

  const handleDragStart = (sessionId: string) => {
    setDraggedSession(sessionId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = async (e: React.DragEvent, targetSessionId: string) => {
    e.preventDefault()
    e.stopPropagation()

    if (!draggedSession || draggedSession === targetSessionId) {
      setDraggedSession(null)
      return
    }

    const draggedIndex = sessions.findIndex(s => s.id === draggedSession)
    const targetIndex = sessions.findIndex(s => s.id === targetSessionId)

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedSession(null)
      return
    }

    // Réorganiser
    const newSessions = [...sessions]
    const [removed] = newSessions.splice(draggedIndex, 1)
    newSessions.splice(targetIndex, 0, removed)

    // Sauvegarder l'ordre avec le bon champ "timelineOrder"
    try {
      for (let i = 0; i < newSessions.length; i++) {
        await fetch(`/api/admin/events/${eventId}/sessions/${newSessions[i].id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ timelineOrder: i })
        })
      }

      setDraggedSession(null)
      onUpdate()
    } catch (error) {
      console.error('Error reordering sessions:', error)
      setDraggedSession(null)
    }
  }

  const handleDelete = async (sessionId: string) => {
    if (!confirm('Supprimer cette session ?')) return

    await fetch(`/api/admin/events/${eventId}/sessions/${sessionId}`, {
      method: 'DELETE'
    })

    onUpdate()
  }

  const handleDuplicate = async (session: Session) => {
    const newSession = {
      ...session,
      id: undefined,
      title: `${session.title} (copie)`,
      status: 'DRAFT'
    }

    await fetch(`/api/admin/events/${eventId}/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSession)
    })

    onUpdate()
  }

  const handleToggleVisibility = async (session: Session) => {
    await fetch(`/api/admin/events/${eventId}/sessions/${session.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPublic: !session.isPublic })
    })

    onUpdate()
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    })
  }

  // Grouper par jour
  const sessionsByDay = sessions.reduce((acc, session) => {
    const day = formatDate(session.startTime)
    if (!acc[day]) acc[day] = []
    acc[day].push(session)
    return acc
  }, {} as Record<string, Session[]>)

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-[#004645]">Sessions du programme</h3>
            <p className="text-sm text-[#004645]/70">Glissez-déposez pour réorganiser</p>
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
            <CardHeader>
              <CardTitle className="text-[#004645] flex items-center gap-2">
                📅 {day}
                <Badge variant="outline" className="ml-2">
                  {daySessions.length} session{daySessions.length > 1 ? 's' : ''}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {daySessions.map((session) => (
                <div
                  key={session.id}
                  draggable={true}
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = 'move'
                    handleDragStart(session.id)
                  }}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, session.id)}
                  onDragEnd={() => setDraggedSession(null)}
                  className={`
                    group relative flex items-center gap-3 p-4 rounded-lg border-2 transition-all cursor-move
                    ${draggedSession === session.id
                      ? 'border-[#009197] bg-[#009197]/10 scale-105'
                      : 'border-[#9CD9F6]/30 hover:border-[#009197]/50'
                    }
                    ${!session.isPublic ? 'opacity-60' : ''}
                  `}
                  style={{
                    borderLeftWidth: '4px',
                    borderLeftColor: SESSION_COLORS[session.type] || '#6B7280'
                  }}
                >
                  <GripVertical className="h-5 w-5 text-[#004645]/30 group-hover:text-[#009197]" />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{SESSION_ICONS[session.type] || '📌'}</span>
                      <h4 className="font-semibold text-[#004645] truncate">{session.title}</h4>
                      {!session.isPublic && (
                        <Badge variant="outline" className="text-xs">Privée</Badge>
                      )}
                      {session.status === 'DRAFT' && (
                        <Badge variant="outline" className="text-xs bg-gray-100">Brouillon</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-[#004645]/70">
                      <span>⏰ {formatTime(session.startTime)} - {formatTime(session.endTime)}</span>
                      <span>⌚ {session.duration} min</span>
                      {session.venue && <span>📍 {session.venue}</span>}
                      {session.room && <span>🚪 {session.room}</span>}
                      {session.capacity && <span>👥 {session.capacity} pers.</span>}
                    </div>
                  </div>

                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => handleToggleVisibility(session)}
                      className="h-8 w-8 p-0"
                    >
                      {session.isPublic ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingSession(session)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDuplicate(session)}
                      className="h-8 w-8 p-0"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(session.id)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
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
