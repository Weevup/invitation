'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Calendar,
  Clock,
  MapPin,
  Plane,
  Users,
  Filter,
  Download,
  Hotel,
  X,
  Search,
  ChevronDown,
  FileSpreadsheet,
} from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface TimelineItem {
  id: string
  type: string
  sessionType?: string
  transportType?: string
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
    id: string
    firstName: string
    lastName: string
    email: string
  }
  isParticipating?: boolean
}

interface Guest {
  id: string
  firstName: string
  lastName: string
  email: string
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

  // Filter states
  const [showFilters, setShowFilters] = useState(false)
  const [selectedGuest, setSelectedGuest] = useState<string | null>(null)
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set())
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [guests, setGuests] = useState<Guest[]>([])
  const [guestSearch, setGuestSearch] = useState('')

  useEffect(() => {
    fetchGuests()
  }, [eventId])

  useEffect(() => {
    fetchTimeline()
  }, [eventId, selectedGuest, selectedTypes, startDate, endDate])

  const fetchGuests = async () => {
    try {
      const response = await fetch(`/api/admin/events/${eventId}/guests`)
      if (response.ok) {
        const data = await response.json()
        setGuests(data.guests || [])
      }
    } catch (error) {
      console.error('Error fetching guests:', error)
    }
  }

  const fetchTimeline = async () => {
    try {
      setLoading(true)

      // Build query params
      const params = new URLSearchParams()
      if (selectedGuest) params.append('guestId', selectedGuest)
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)

      const url = `/api/admin/events/${eventId}/timeline?${params.toString()}`
      const response = await fetch(url)

      if (response.ok) {
        const data = await response.json()
        let filteredTimeline = data.timeline || []

        // Client-side type filtering
        if (selectedTypes.size > 0) {
          filteredTimeline = filteredTimeline.filter((item: TimelineItem) =>
            selectedTypes.has(item.type)
          )
        }

        // Re-group by date after filtering
        const groupedByDate: Record<string, TimelineItem[]> = {}
        for (const item of filteredTimeline) {
          const date = new Date(item.startTime).toISOString().split('T')[0]
          if (!groupedByDate[date]) {
            groupedByDate[date] = []
          }
          groupedByDate[date].push(item)
        }

        setTimeline(filteredTimeline)
        setTimelineByDate(groupedByDate)
        setStats(data.stats || {})
      }
    } catch (error) {
      console.error('Error fetching timeline:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleType = (type: string) => {
    const newTypes = new Set(selectedTypes)
    if (newTypes.has(type)) {
      newTypes.delete(type)
    } else {
      newTypes.add(type)
    }
    setSelectedTypes(newTypes)
  }

  const clearFilters = () => {
    setSelectedGuest(null)
    setSelectedTypes(new Set())
    setStartDate('')
    setEndDate('')
    setGuestSearch('')
  }

  const handleExportTimelinePDF = () => {
    window.open(`/api/admin/events/${eventId}/export/timeline-pdf`, '_blank')
  }

  const handleExportManifeste = () => {
    window.open(`/api/admin/events/${eventId}/export/manifeste`, '_blank')
  }

  const hasActiveFilters = selectedGuest || selectedTypes.size > 0 || startDate || endDate

  // Filter guests based on search
  const filteredGuests = guests.filter((guest) => {
    const searchLower = guestSearch.toLowerCase()
    return (
      guest.firstName.toLowerCase().includes(searchLower) ||
      guest.lastName.toLowerCase().includes(searchLower) ||
      guest.email.toLowerCase().includes(searchLower)
    )
  })

  const selectedGuestInfo = selectedGuest
    ? guests.find((g) => g.id === selectedGuest)
    : null

  const typeOptions = [
    { value: 'SESSION', label: 'Sessions', color: 'bg-blue-500' },
    { value: 'TRANSPORT_ARRIVAL', label: 'Arrivées', color: 'bg-teal-500' },
    { value: 'TRANSPORT_DEPARTURE', label: 'Départs', color: 'bg-red-500' },
    { value: 'MEAL', label: 'Repas', color: 'bg-orange-500' },
    { value: 'BREAK', label: 'Pauses', color: 'bg-yellow-500' },
    { value: 'HOTEL_CHECKIN', label: 'Check-in', color: 'bg-purple-500' },
    { value: 'HOTEL_CHECKOUT', label: 'Check-out', color: 'bg-purple-500' },
  ]

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
            Vue chronologique complète de l&apos;événement
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={showFilters ? 'default' : 'outline'}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtres
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2">
                {(selectedGuest ? 1 : 0) + selectedTypes.size + (startDate ? 1 : 0)}
              </Badge>
            )}
          </Button>
          <Button variant="outline" onClick={handleExportTimelinePDF}>
            <Download className="h-4 w-4 mr-2" />
            Timeline PDF
          </Button>
          <Button variant="outline" onClick={handleExportManifeste}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Manifeste Excel
          </Button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Filtres de Timeline</CardTitle>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-1" />
                  Effacer tout
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Participant Filter */}
              <div className="space-y-2">
                <Label>Participant</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher un participant..."
                    value={guestSearch}
                    onChange={(e) => setGuestSearch(e.target.value)}
                    className="pl-8"
                  />
                </div>
                {selectedGuestInfo && (
                  <div className="flex items-center gap-2 p-2 bg-primary/10 rounded-md">
                    <Users className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      {selectedGuestInfo.firstName} {selectedGuestInfo.lastName}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-auto h-6 w-6 p-0"
                      onClick={() => setSelectedGuest(null)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
                {guestSearch && !selectedGuestInfo && (
                  <div className="mt-2 max-h-48 overflow-y-auto border rounded-md">
                    {filteredGuests.length === 0 ? (
                      <div className="p-4 text-sm text-center text-muted-foreground">
                        Aucun participant trouvé
                      </div>
                    ) : (
                      <div className="divide-y">
                        {filteredGuests.slice(0, 10).map((guest) => (
                          <button
                            key={guest.id}
                            className="w-full p-3 text-left hover:bg-accent transition-colors"
                            onClick={() => {
                              setSelectedGuest(guest.id)
                              setGuestSearch('')
                            }}
                          >
                            <div className="font-medium text-sm">
                              {guest.firstName} {guest.lastName}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {guest.email}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Type Filter */}
              <div className="space-y-2">
                <Label>Types d&apos;événements</Label>
                <div className="space-y-2">
                  {typeOptions.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`type-${option.value}`}
                        checked={selectedTypes.has(option.value)}
                        onCheckedChange={() => toggleType(option.value)}
                      />
                      <label
                        htmlFor={`type-${option.value}`}
                        className="flex items-center gap-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        <div className={`w-3 h-3 rounded-full ${option.color}`} />
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Date Filter */}
              <div className="space-y-2">
                <Label>Période</Label>
                <div className="space-y-2">
                  <div>
                    <Label htmlFor="start-date" className="text-xs text-muted-foreground">
                      Date de début
                    </Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="end-date" className="text-xs text-muted-foreground">
                      Date de fin
                    </Label>
                    <Input
                      id="end-date"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total événements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{timeline.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.sessions} sessions, {stats.transports} transports
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.sessions}</div>
            <p className="text-xs text-muted-foreground mt-1">Activités programmées</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Transports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.transports}</div>
            <p className="text-xs text-muted-foreground mt-1">Réservations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Participants
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalParticipants}</div>
            <p className="text-xs text-muted-foreground mt-1">Total invités</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Filtres actifs:</span>
          {selectedGuestInfo && (
            <Badge variant="secondary" className="gap-1">
              <Users className="h-3 w-3" />
              {selectedGuestInfo.firstName} {selectedGuestInfo.lastName}
              <button onClick={() => setSelectedGuest(null)} className="ml-1">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {Array.from(selectedTypes).map((type) => {
            const option = typeOptions.find((o) => o.value === type)
            return (
              <Badge key={type} variant="secondary" className="gap-1">
                <div className={`w-2 h-2 rounded-full ${option?.color}`} />
                {option?.label}
                <button onClick={() => toggleType(type)} className="ml-1">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )
          })}
          {startDate && (
            <Badge variant="secondary" className="gap-1">
              Du {format(new Date(startDate), 'd MMM', { locale: fr })}
            </Badge>
          )}
          {endDate && (
            <Badge variant="secondary" className="gap-1">
              Au {format(new Date(endDate), 'd MMM', { locale: fr })}
            </Badge>
          )}
        </div>
      )}

      {/* Timeline */}
      {Object.keys(timelineByDate).length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">
                {hasActiveFilters
                  ? 'Aucun événement ne correspond aux filtres'
                  : 'Aucun événement programmé'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {Object.entries(timelineByDate).map(([date, items]) => (
            <div key={date}>
              <h2 className="text-xl font-semibold mb-4 sticky top-0 bg-background z-10 py-2">
                {format(new Date(date), 'EEEE d MMMM yyyy', { locale: fr })}
              </h2>

              <div className="relative pl-8">
                {/* Vertical line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />

                <div className="space-y-4">
                  {items.map((item) => {
                    const Icon = getIconForType(item.type)
                    const colorClass = getColorForType(item.type)

                    return (
                      <div key={item.id} className="relative">
                        {/* Timeline dot */}
                        <div
                          className={`absolute -left-[26px] w-5 h-5 rounded-full ${colorClass} border-4 border-background z-10`}
                        />

                        <Card className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge variant="outline" className={`${colorClass} text-white`}>
                                    {getTypeLabel(item.type)}
                                  </Badge>
                                  <span className="text-sm font-medium text-muted-foreground">
                                    {format(new Date(item.startTime), 'HH:mm', { locale: fr })}
                                    {item.endTime &&
                                      ` - ${format(new Date(item.endTime), 'HH:mm', { locale: fr })}`}
                                  </span>
                                  {item.isParticipating !== undefined && (
                                    <Badge
                                      variant={item.isParticipating ? 'default' : 'secondary'}
                                      className="text-xs"
                                    >
                                      {item.isParticipating ? 'Inscrit' : 'Non inscrit'}
                                    </Badge>
                                  )}
                                </div>

                                <h3 className="font-semibold mb-1">{item.title}</h3>
                                {item.description && (
                                  <p className="text-sm text-muted-foreground mb-2">
                                    {item.description}
                                  </p>
                                )}

                                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                  {item.location && (
                                    <div className="flex items-center gap-1">
                                      <MapPin className="h-4 w-4" />
                                      {item.location}
                                    </div>
                                  )}
                                  {item.participantCount !== undefined && (
                                    <div className="flex items-center gap-1">
                                      <Users className="h-4 w-4" />
                                      {item.participantCount}
                                      {item.capacity && ` / ${item.capacity}`}
                                    </div>
                                  )}
                                  {item.guest && (
                                    <div className="flex items-center gap-1">
                                      <Users className="h-4 w-4" />
                                      {item.guest.firstName} {item.guest.lastName}
                                    </div>
                                  )}
                                </div>
                              </div>

                              <Icon className={`h-8 w-8 text-white p-1.5 rounded-md ${colorClass}`} />
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
