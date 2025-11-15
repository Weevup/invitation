import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Clock, Edit, Copy, Trash2, Eye, EyeOff, MapPin, Users } from 'lucide-react'
import { formatTime, SESSION_COLORS, SESSION_ICONS, SESSION_TYPE_LABELS } from '@/lib/program/constants'
import { getSessionPosition, TimelineConfig } from '../utils/time-calculations'

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

interface SessionCardProps {
  session: Session
  config: TimelineConfig
  isDragging: boolean
  isResizing: boolean
  onDragStart: (session: Session) => void
  onDragEnd: () => void
  onEdit: (session: Session) => void
  onDuplicate: (session: Session) => void
  onDelete: (sessionId: string) => void
  onToggleVisibility: (session: Session) => void
  onResizeStart: (e: React.MouseEvent, session: Session, edge: 'top' | 'bottom') => void
}

export function SessionCard({
  session,
  config,
  isDragging,
  isResizing,
  onDragStart,
  onDragEnd,
  onEdit,
  onDuplicate,
  onDelete,
  onToggleVisibility,
  onResizeStart,
}: SessionCardProps) {
  const { top, height } = getSessionPosition(session, config)
  const sessionColor = SESSION_COLORS[session.type] || session.color || '#009197'
  const sessionIcon = SESSION_ICONS[session.type] || session.icon || '📌'

  return (
    <div
      draggable={!isResizing}
      onDragStart={() => !isResizing && onDragStart(session)}
      onDragEnd={onDragEnd}
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
        onMouseDown={(e) => onResizeStart(e, session, 'top')}
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
                onToggleVisibility(session)
              }}
              className="h-6 w-6 p-0"
              title={session.isPublic ? 'Rendre privée' : 'Rendre publique'}
            >
              {session.isPublic ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation()
                onEdit(session)
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
                onDuplicate(session)
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
                onDelete(session.id)
              }}
              className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
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
        onMouseDown={(e) => onResizeStart(e, session, 'bottom')}
      >
        <div className="w-12 h-1 bg-gray-300 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  )
}
