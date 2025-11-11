'use client'

import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Utensils,
  Wrench,
  AlertTriangle,
  Bus,
  Hotel,
  Coffee
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { TimeSlot } from '@/app/api/admin/events/[id]/operations/helpers'

interface TimeSlotBlockProps {
  slot: TimeSlot
  onClick: () => void
}

export function TimeSlotBlock({ slot, onClick }: TimeSlotBlockProps) {
  const icon = getIconForSlot(slot)
  const color = getColorForSlot(slot)
  const bgColor = getBgColorForSlot(slot)

  return (
    <Card
      className={cn(
        "cursor-pointer hover:shadow-md transition-all duration-200 border-l-4",
        color,
        bgColor,
        slot.warnings.length > 0 && "ring-2 ring-orange-200"
      )}
      onClick={onClick}
    >
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className="text-2xl">{icon}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-base">{slot.title}</h3>
                {slot.isHighlighted && (
                  <Badge variant="default" className="text-xs">
                    ⭐ Featured
                  </Badge>
                )}
                {slot.type === 'session' && slot.subType && (
                  <Badge variant="outline" className="text-xs">
                    {getSessionTypeLabel(slot.subType)}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <Clock size={14} />
                <span>
                  {formatTime(slot.startTime)}
                  {slot.endTime && ` - ${formatTime(slot.endTime)}`}
                  {slot.endTime && ` (${getDuration(slot.startTime, slot.endTime)})`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Location */}
        {slot.location && (
          <div className="flex items-center gap-2 text-sm">
            <MapPin size={14} className="text-muted-foreground" />
            <span className="text-muted-foreground">{slot.location}</span>
          </div>
        )}

        {/* Participants & Capacity */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5">
            <Users size={16} className="text-muted-foreground" />
            <span className="font-medium">{slot.participants.length}</span>
            {slot.capacity && (
              <>
                <span className="text-muted-foreground">/</span>
                <span className="text-muted-foreground">{slot.capacity}</span>
              </>
            )}
            <span className="text-muted-foreground text-xs">participants</span>
          </div>

          {slot.capacity && (
            <div className="flex-1 max-w-32">
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    slot.participants.length / slot.capacity > 0.9
                      ? "bg-red-500"
                      : slot.participants.length / slot.capacity > 0.7
                      ? "bg-orange-500"
                      : "bg-green-500"
                  )}
                  style={{
                    width: `${Math.min((slot.participants.length / slot.capacity) * 100, 100)}%`
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Session-specific: Catering */}
        {slot.type === 'session' && slot.catering && (
          <div className="flex items-start gap-2 text-sm">
            <Utensils size={14} className="text-muted-foreground mt-0.5" />
            <span className="text-muted-foreground">{slot.catering}</span>
          </div>
        )}

        {/* Session-specific: Equipment */}
        {slot.type === 'session' && slot.equipment && slot.equipment.length > 0 && (
          <div className="flex items-start gap-2 text-sm">
            <Wrench size={14} className="text-muted-foreground mt-0.5" />
            <span className="text-muted-foreground">
              {slot.equipment.slice(0, 3).join(', ')}
              {slot.equipment.length > 3 && ` +${slot.equipment.length - 3}`}
            </span>
          </div>
        )}

        {/* Transport-specific: Manifest info */}
        {slot.type === 'transport' && slot.manifest && (
          <div className="flex items-center gap-2 text-sm">
            <Badge variant="secondary" className="text-xs">
              Manifest #{slot.manifest.id.slice(-6)}
            </Badge>
            {slot.manifest.driverName && (
              <span className="text-muted-foreground text-xs">
                Chauffeur: {slot.manifest.driverName}
              </span>
            )}
          </div>
        )}

        {/* Accommodation-specific: Hotels */}
        {slot.type === 'accommodation' && slot.accommodations && slot.accommodations.length > 0 && (
          <div className="grid grid-cols-2 gap-2 text-sm">
            {slot.accommodations.map((acc: any) => (
              <div key={acc.id} className="flex items-center gap-2">
                <Hotel size={14} className="text-muted-foreground" />
                <div>
                  <div className="font-medium text-xs">{acc.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {acc.guestCount} pax • {acc.roomCount} ch.
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Warnings */}
        {slot.warnings.length > 0 && (
          <div className="space-y-1 pt-2 border-t">
            <div className="flex items-center gap-1.5 text-sm font-medium text-orange-700">
              <AlertTriangle size={14} />
              <span>Alertes ({slot.warnings.length})</span>
            </div>
            {slot.warnings.slice(0, 2).map((warning) => (
              <div key={warning.id} className="text-xs text-orange-600 ml-5">
                • {warning.message}
              </div>
            ))}
            {slot.warnings.length > 2 && (
              <div className="text-xs text-orange-500 ml-5">
                ... et {slot.warnings.length - 2} autre(s) - Cliquer pour voir
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function getIconForSlot(slot: TimeSlot): string {
  if (slot.type === 'session') {
    switch (slot.subType) {
      case 'MEAL':
        return '🍽️'
      case 'KEYNOTE':
        return '🎤'
      case 'CONFERENCE':
        return '📊'
      case 'WORKSHOP':
        return '🛠️'
      case 'TEAMBUILDING':
        return '🎵'
      case 'BREAK':
        return '☕'
      default:
        return '📅'
    }
  }

  if (slot.type === 'transport') {
    return slot.subType === 'arrival' ? '✈️' : '🚌'
  }

  if (slot.type === 'accommodation') {
    return slot.subType === 'checkin' ? '🏨' : '🧳'
  }

  if (slot.type === 'free_time') {
    return '⏰'
  }

  return '📅'
}

function getColorForSlot(slot: TimeSlot): string {
  if (slot.type === 'session') {
    if (slot.isHighlighted) return 'border-l-indigo-500'
    switch (slot.subType) {
      case 'MEAL':
        return 'border-l-green-500'
      case 'KEYNOTE':
        return 'border-l-blue-500'
      case 'CONFERENCE':
        return 'border-l-purple-500'
      case 'WORKSHOP':
        return 'border-l-orange-500'
      case 'TEAMBUILDING':
        return 'border-l-pink-500'
      case 'BREAK':
        return 'border-l-gray-400'
      default:
        return 'border-l-gray-500'
    }
  }

  if (slot.type === 'transport') {
    return 'border-l-cyan-500'
  }

  if (slot.type === 'accommodation') {
    return 'border-l-teal-500'
  }

  if (slot.type === 'free_time') {
    return 'border-l-gray-300'
  }

  return 'border-l-gray-500'
}

function getBgColorForSlot(slot: TimeSlot): string {
  if (slot.type === 'free_time') {
    return 'bg-gray-50'
  }

  if (slot.warnings.length > 0) {
    return 'bg-orange-50'
  }

  return 'bg-white'
}

function getSessionTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    MEAL: 'Repas',
    KEYNOTE: 'Keynote',
    CONFERENCE: 'Conférence',
    WORKSHOP: 'Atelier',
    TEAMBUILDING: 'Team Building',
    BREAK: 'Pause',
    NETWORKING: 'Networking'
  }
  return labels[type] || type
}

function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

function getDuration(start: Date, end: Date): string {
  const diff = new Date(end).getTime() - new Date(start).getTime()
  const minutes = Math.floor(diff / 1000 / 60)
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (hours === 0) {
    return `${minutes}min`
  }

  if (remainingMinutes === 0) {
    return `${hours}h`
  }

  return `${hours}h${remainingMinutes.toString().padStart(2, '0')}`
}
