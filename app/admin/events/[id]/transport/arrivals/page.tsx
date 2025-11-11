'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Plane,
  Train,
  Bus,
  Car,
  Clock,
  MapPin,
  User,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Search,
  ArrowLeft,
} from 'lucide-react'
import Link from 'next/link'
import { format, isToday, isTomorrow, parseISO, isPast, isFuture } from 'date-fns'
import { fr } from 'date-fns/locale'

interface TransportArrival {
  id: string
  type: string
  status: string
  arrival: {
    city?: string
    airport?: string
    station?: string
    address?: string
    date?: string
    time?: string
  } | null
  departure: {
    city?: string
    date?: string
    time?: string
  } | null
  carrier?: string
  bookingRef?: string
  guest: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  manifestId?: string
  manifest?: {
    name: string
    currentCount: number
    maxCapacity: number | null
  } | null
}

const transportIcons: Record<string, any> = {
  FLIGHT: Plane,
  TRAIN: Train,
  SHUTTLE: Bus,
  TAXI: Car,
  CAR_RENTAL: Car,
  PERSONAL_CAR: Car,
}

const transportLabels: Record<string, string> = {
  FLIGHT: 'Vol',
  TRAIN: 'Train',
  SHUTTLE: 'Navette',
  TAXI: 'Taxi',
  CAR_RENTAL: 'Location',
  PERSONAL_CAR: 'Véhicule perso',
}

const statusColors: Record<string, string> = {
  REQUESTED: 'bg-gray-100 text-gray-700 border-gray-300',
  PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  CONFIRMED: 'bg-blue-100 text-blue-700 border-blue-300',
  BOOKED: 'bg-green-100 text-green-700 border-green-300',
  CANCELLED: 'bg-red-100 text-red-700 border-red-300',
  COMPLETED: 'bg-purple-100 text-purple-700 border-purple-300',
}

const statusLabels: Record<string, string> = {
  REQUESTED: 'Demandé',
  PENDING: 'En attente',
  CONFIRMED: 'Confirmé',
  BOOKED: 'Réservé',
  CANCELLED: 'Annulé',
  COMPLETED: 'Terminé',
}

export default function TransportArrivalsPage() {
  const params = useParams()
  const eventId = params?.id as string

  const [arrivals, setArrivals] = useState<TransportArrival[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterPeriod, setFilterPeriod] = useState<'all' | 'today' | 'tomorrow' | 'upcoming'>('upcoming')

  useEffect(() => {
    if (eventId) {
      fetchArrivals()
    }
  }, [eventId])

  const fetchArrivals = async () => {
    try {
      const response = await fetch(`/api/admin/events/${eventId}/transport/arrivals`)
      if (response.ok) {
        const data = await response.json()
        setArrivals(data)
      }
    } catch (error) {
      console.error('Error fetching arrivals:', error)
    } finally {
      setLoading(false)
    }
  }

  const getArrivalDateTime = (arrival: TransportArrival) => {
    if (!arrival.arrival?.date) return null
    const dateStr = arrival.arrival.date
    const timeStr = arrival.arrival.time || '00:00'
    return parseISO(`${dateStr}T${timeStr}`)
  }

  const filteredArrivals = arrivals
    .filter((arrival) => {
      // Search filter
      const searchLower = searchQuery.toLowerCase()
      const matchesSearch =
        !searchQuery ||
        arrival.guest.firstName.toLowerCase().includes(searchLower) ||
        arrival.guest.lastName.toLowerCase().includes(searchLower) ||
        arrival.guest.email.toLowerCase().includes(searchLower) ||
        arrival.arrival?.city?.toLowerCase().includes(searchLower) ||
        arrival.bookingRef?.toLowerCase().includes(searchLower)

      if (!matchesSearch) return false

      // Period filter
      const arrivalDate = getArrivalDateTime(arrival)
      if (!arrivalDate) return false

      switch (filterPeriod) {
        case 'today':
          return isToday(arrivalDate)
        case 'tomorrow':
          return isTomorrow(arrivalDate)
        case 'upcoming':
          return isFuture(arrivalDate) || isToday(arrivalDate)
        default:
          return true
      }
    })
    .sort((a, b) => {
      const dateA = getArrivalDateTime(a)
      const dateB = getArrivalDateTime(b)
      if (!dateA || !dateB) return 0
      return dateA.getTime() - dateB.getTime()
    })

  const todayCount = arrivals.filter((a) => {
    const date = getArrivalDateTime(a)
    return date && isToday(date)
  }).length

  const tomorrowCount = arrivals.filter((a) => {
    const date = getArrivalDateTime(a)
    return date && isTomorrow(date)
  }).length

  const upcomingCount = arrivals.filter((a) => {
    const date = getArrivalDateTime(a)
    return date && (isFuture(date) || isToday(date))
  }).length

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Clock className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href={`/admin/events/${eventId}/transport`}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Retour aux transports
        </Link>
        <h1 className="text-3xl font-bold">Arrivées à venir</h1>
        <p className="text-muted-foreground mt-2">
          Suivez les arrivées de vos participants en temps réel
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total arrivées
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{arrivals.length}</div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all ${
            filterPeriod === 'today' ? 'ring-2 ring-primary' : ''
          }`}
          onClick={() => setFilterPeriod('today')}
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Aujourd&apos;hui
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{todayCount}</div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all ${
            filterPeriod === 'tomorrow' ? 'ring-2 ring-primary' : ''
          }`}
          onClick={() => setFilterPeriod('tomorrow')}
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Demain
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{tomorrowCount}</div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all ${
            filterPeriod === 'upcoming' ? 'ring-2 ring-primary' : ''
          }`}
          onClick={() => setFilterPeriod('upcoming')}
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              À venir
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-600">{upcomingCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom, email, ville, référence..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant={filterPeriod === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterPeriod('all')}
            >
              Toutes
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Arrivals List */}
      <div className="space-y-4">
        {filteredArrivals.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aucune arrivée trouvée pour cette période</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredArrivals.map((arrival) => {
            const arrivalDate = getArrivalDateTime(arrival)
            const Icon = transportIcons[arrival.type] || Car
            const isArrived = arrivalDate && isPast(arrivalDate)

            return (
              <Card key={arrival.id} className={isArrived ? 'opacity-60' : ''}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="rounded-lg bg-primary/10 p-3">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>

                    {/* Main Info */}
                    <div className="flex-1 space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg">
                              {arrival.guest.firstName} {arrival.guest.lastName}
                            </h3>
                            {isArrived && (
                              <Badge className="bg-purple-100 text-purple-700 border-purple-300">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Arrivé
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{arrival.guest.email}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge className={statusColors[arrival.status]}>
                            {statusLabels[arrival.status]}
                          </Badge>
                          <Badge variant="outline">{transportLabels[arrival.type]}</Badge>
                        </div>
                      </div>

                      {/* Transport Details */}
                      <div className="grid md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                        {/* Departure */}
                        <div className="space-y-2">
                          <p className="text-xs font-semibold text-muted-foreground uppercase">
                            Départ
                          </p>
                          {arrival.departure?.city && (
                            <div className="flex items-center gap-2 text-sm">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span>{arrival.departure.city}</span>
                            </div>
                          )}
                          {arrival.departure?.date && (
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>
                                {format(parseISO(arrival.departure.date), 'dd MMM yyyy', {
                                  locale: fr,
                                })}
                                {arrival.departure.time && ` à ${arrival.departure.time}`}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Arrival */}
                        <div className="space-y-2">
                          <p className="text-xs font-semibold text-teal-600 uppercase">
                            Arrivée
                          </p>
                          {(arrival.arrival?.city ||
                            arrival.arrival?.airport ||
                            arrival.arrival?.station) && (
                            <div className="flex items-center gap-2 text-sm font-semibold">
                              <MapPin className="h-4 w-4 text-teal-600" />
                              <span>
                                {arrival.arrival?.city ||
                                  arrival.arrival?.airport ||
                                  arrival.arrival?.station}
                              </span>
                            </div>
                          )}
                          {arrivalDate && (
                            <div className="flex items-center gap-2 text-sm font-semibold">
                              <Clock className="h-4 w-4 text-teal-600" />
                              <span>
                                {isToday(arrivalDate) && "Aujourd'hui "}
                                {isTomorrow(arrivalDate) && 'Demain '}
                                {format(arrivalDate, 'dd MMM yyyy à HH:mm', { locale: fr })}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Additional Info */}
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        {arrival.carrier && (
                          <div>
                            <span className="font-semibold">Compagnie:</span> {arrival.carrier}
                          </div>
                        )}
                        {arrival.bookingRef && (
                          <div>
                            <span className="font-semibold">Réf:</span> {arrival.bookingRef}
                          </div>
                        )}
                        {arrival.manifest && (
                          <div className="flex items-center gap-1">
                            <Bus className="h-4 w-4" />
                            <span className="font-semibold">Navette:</span> {arrival.manifest.name}{' '}
                            ({arrival.manifest.currentCount}
                            {arrival.manifest.maxCapacity && `/${arrival.manifest.maxCapacity}`})
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
