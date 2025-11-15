'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { OperationsHeader } from './components/OperationsHeader'
import { AlertsBanner } from './components/AlertsBanner'
import { TimeSlotBlock } from './components/TimeSlotBlock'
import { BlockDetailsPanel } from './components/BlockDetailsPanel'
import type { TimeSlot, Alert, KPIs } from '@/app/api/admin/events/[id]/operations/helpers'
import type { Guest, RSVP } from '@prisma/client'
import { createClientLogger } from '@/lib/client-logger'

const logger = createClientLogger({ component: 'OperationsPage' })


interface OperationsData {
  event: {
    id: string
    name: string
    startsAt: Date
    endsAt?: Date | null
    venueName?: string | null
    city?: string | null
    description: string | null
  }
  timeSlots: TimeSlot[]
  alerts: Alert[]
  kpis: KPIs
  rawData: {
    guests: Guest[]
    rsvps: (RSVP & { guest: Guest })[]
  }
}

export default function OperationsPage() {
  const params = useParams()
  const eventId = params.id as string

  const [data, setData] = useState<OperationsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)

  const fetchOperationsData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/admin/events/${eventId}/operations`)

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Erreur lors du chargement des données')
      }

      setData(result)
    } catch (err) {
      logger.error(err, { action: 'fetchOperationsData' })
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }, [eventId])

  useEffect(() => {
    fetchOperationsData()
  }, [fetchOperationsData])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Chargement du planning opérationnel...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-3 max-w-md">
          <div className="text-red-500 text-5xl">⚠️</div>
          <h2 className="text-xl font-semibold">Erreur de chargement</h2>
          <p className="text-sm text-muted-foreground">{error}</p>
          <button
            onClick={fetchOperationsData}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 text-sm"
          >
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Aucune donnée disponible</p>
      </div>
    )
  }

  // Grouper les time slots par jour
  const slotsByDay = data.timeSlots.reduce((acc, slot) => {
    const day = slot.day
    if (!acc[day]) {
      acc[day] = []
    }
    acc[day].push(slot)
    return acc
  }, {} as Record<string, TimeSlot[]>)

  // Ordre des jours
  const dayOrder = Object.keys(slotsByDay).sort((a, b) => {
    const getDayNumber = (day: string) => {
      if (day === 'J') return 0
      if (day.startsWith('J-')) return -parseInt(day.slice(2))
      if (day.startsWith('J+')) return parseInt(day.slice(2))
      return 0
    }
    return getDayNumber(a) - getDayNumber(b)
  })

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6 pb-20">
          {/* Header with KPIs */}
          <OperationsHeader event={data.event} kpis={data.kpis} />

          {/* Quick Navigation */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <a
              href={`/admin/events/${eventId}/program`}
              className="flex items-center gap-2 p-3 border rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              <span className="text-lg">📅</span>
              <div>
                <div className="font-medium">Programme</div>
                <div className="text-xs text-muted-foreground">Sessions</div>
              </div>
            </a>
            <a
              href={`/admin/events/${eventId}/ateliers`}
              className="flex items-center gap-2 p-3 border rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              <span className="text-lg">🛠️</span>
              <div>
                <div className="font-medium">Ateliers</div>
                <div className="text-xs text-muted-foreground">Workshops</div>
              </div>
            </a>
            <a
              href={`/admin/events/${eventId}/team-building`}
              className="flex items-center gap-2 p-3 border rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              <span className="text-lg">🤝</span>
              <div>
                <div className="font-medium">Team Building</div>
                <div className="text-xs text-muted-foreground">Équipes</div>
              </div>
            </a>
            <a
              href={`/admin/events/${eventId}/activites-libres`}
              className="flex items-center gap-2 p-3 border rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              <span className="text-lg">🌴</span>
              <div>
                <div className="font-medium">Activités libres</div>
                <div className="text-xs text-muted-foreground">Choix</div>
              </div>
            </a>
            <a
              href={`/admin/events/${eventId}/transport`}
              className="flex items-center gap-2 p-3 border rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              <span className="text-lg">🚌</span>
              <div>
                <div className="font-medium">Transport</div>
                <div className="text-xs text-muted-foreground">Navettes</div>
              </div>
            </a>
            <a
              href={`/admin/events/${eventId}/accommodation`}
              className="flex items-center gap-2 p-3 border rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              <span className="text-lg">🏨</span>
              <div>
                <div className="font-medium">Hébergement</div>
                <div className="text-xs text-muted-foreground">Chambres</div>
              </div>
            </a>
          </div>

          {/* Alerts Banner */}
          <AlertsBanner alerts={data.alerts} />

          {/* Timeline by day */}
          <div className="space-y-8">
            {dayOrder.map((day) => {
              const slots = slotsByDay[day]
              const dayDate = slots[0]?.startTime

              return (
                <div key={day} className="space-y-4">
                  {/* Day header */}
                  <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-3 border-b">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-bold">
                          {day === 'J' ? `Jour J - ${day}` : day}
                        </h2>
                        {dayDate && (
                          <p className="text-sm text-muted-foreground">
                            {new Date(dayDate).toLocaleDateString('fr-FR', {
                              weekday: 'long',
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </p>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {slots.length} événement{slots.length > 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>

                  {/* Time slots for this day */}
                  <div className="space-y-3 pl-4">
                    {slots.map((slot) => (
                      <TimeSlotBlock
                        key={slot.id}
                        slot={slot}
                        onClick={() => setSelectedSlot(slot)}
                      />
                    ))}
                  </div>
                </div>
              )
            })}

            {data.timeSlots.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-lg mb-2">Aucun événement programmé</p>
                <p className="text-sm">
                  Créez des sessions, ajoutez du transport ou configurez l&apos;hébergement pour voir la timeline.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Details panel (right side) */}
      {selectedSlot && (
        <BlockDetailsPanel
          slot={selectedSlot}
          rawData={data.rawData}
          onClose={() => setSelectedSlot(null)}
        />
      )}
    </div>
  )
}
