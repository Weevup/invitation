'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Plane,
  Train,
  Bus,
  Car,
  Plus,
  ArrowRight,
  Calendar,
  MapPin,
  DollarSign,
  Sparkles,
  Search,
  Filter,
  X
} from 'lucide-react'
import { TransportType, BookingStatus } from '@prisma/client'
import { TransportBookingDialog } from '@/components/admin/transport-booking-dialog'
import { TransportBookingDetailsDialog } from '@/components/admin/transport-booking-details-dialog'

interface TransportBooking {
  id: string
  type: TransportType
  status: BookingStatus
  departure: {
    city?: string
    airport?: string
    station?: string
    address?: string
    date?: string
    time?: string
  } | null
  arrival: {
    city?: string
    airport?: string
    station?: string
    address?: string
    date?: string
    time?: string
  } | null
  carrier?: string
  bookingRef?: string
  seatNumber?: string
  estimatedCost?: number
  actualCost?: number
  currency: string
  guest: {
    firstName: string
    lastName: string
    email: string
  }
}

const transportIcons = {
  FLIGHT: Plane,
  TRAIN: Train,
  SHUTTLE: Bus,
  TAXI: Car,
  CAR_RENTAL: Car,
  PERSONAL_CAR: Car,
}

const transportLabels = {
  FLIGHT: 'Vol',
  TRAIN: 'Train',
  SHUTTLE: 'Navette',
  TAXI: 'Taxi',
  CAR_RENTAL: 'Location',
  PERSONAL_CAR: 'Véhicule personnel',
}

const statusColors = {
  REQUESTED: 'bg-gray-100 text-gray-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  BOOKED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
  COMPLETED: 'bg-purple-100 text-purple-800',
}

const statusLabels = {
  REQUESTED: 'Demandé',
  PENDING: 'En attente',
  CONFIRMED: 'Confirmé',
  BOOKED: 'Réservé',
  CANCELLED: 'Annulé',
  COMPLETED: 'Terminé',
}

export default function TransportPage() {
  const params = useParams()
  const eventId = params.id as string

  const [bookings, setBookings] = useState<TransportBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)

  // Filtres
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<TransportType | 'ALL'>('ALL')
  const [filterStatus, setFilterStatus] = useState<BookingStatus | 'ALL'>('ALL')
  const [filterCity, setFilterCity] = useState('ALL')

  const fetchBookings = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/events/${eventId}/transport`)
      if (!response.ok) {
        throw new Error('Failed to fetch transport bookings')
      }
      const data = await response.json()
      setBookings(data.bookings || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [eventId])

  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  // Filtrer les réservations
  const filteredBookings = bookings.filter((booking) => {
    // Recherche par nom
    if (searchQuery) {
      const fullName = `${booking.guest.firstName} ${booking.guest.lastName}`.toLowerCase()
      if (!fullName.includes(searchQuery.toLowerCase())) {
        return false
      }
    }

    // Filtre par type
    if (filterType !== 'ALL' && booking.type !== filterType) {
      return false
    }

    // Filtre par statut
    if (filterStatus !== 'ALL' && booking.status !== filterStatus) {
      return false
    }

    // Filtre par ville
    if (filterCity !== 'ALL') {
      const departureCity = booking.departure?.city?.toLowerCase()
      if (departureCity !== filterCity.toLowerCase()) {
        return false
      }
    }

    return true
  })

  // Extraire les villes uniques pour le filtre
  const uniqueCities = Array.from(
    new Set(
      bookings
        .map(b => b.departure?.city)
        .filter(Boolean)
    )
  ).sort()

  // Réinitialiser les filtres
  const resetFilters = () => {
    setSearchQuery('')
    setFilterType('ALL')
    setFilterStatus('ALL')
    setFilterCity('ALL')
  }

  const hasActiveFilters = searchQuery || filterType !== 'ALL' || filterStatus !== 'ALL' || filterCity !== 'ALL'

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Sparkles className="h-12 w-12 text-[#009197] mx-auto mb-4 animate-pulse" />
          <p className="text-[#004645]/70">Chargement des transports...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <p className="text-center text-red-800">{error}</p>
        </CardContent>
      </Card>
    )
  }

  const totalBookings = filteredBookings.length
  const confirmedBookings = filteredBookings.filter(b => b.status === 'BOOKED' || b.status === 'CONFIRMED').length
  const pendingBookings = filteredBookings.filter(b => b.status === 'REQUESTED' || b.status === 'PENDING').length
  const totalCost = filteredBookings.reduce((sum, b) => sum + (b.actualCost || b.estimatedCost || 0), 0)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#004645]" style={{ fontFamily: "var(--font-abril)" }}>
            Transport & Déplacements
          </h1>
          <p className="text-[#004645]/70 mt-2">
            Gérez les réservations de transport pour vos invités
          </p>
        </div>
        <TransportBookingDialog eventId={eventId} onSuccess={fetchBookings} />
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#004645]">Total</CardTitle>
            <Bus className="h-4 w-4 text-[#009197]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#004645]" style={{ fontFamily: "var(--font-abril)" }}>
              {totalBookings}
            </div>
            <p className="text-xs text-[#004645]/70">réservations</p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50/80 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#004645]">Confirmées</CardTitle>
            <ArrowRight className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600" style={{ fontFamily: "var(--font-abril)" }}>
              {confirmedBookings}
            </div>
            <p className="text-xs text-[#004645]/70">réservées/confirmées</p>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50/80 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#004645]">En attente</CardTitle>
            <Calendar className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600" style={{ fontFamily: "var(--font-abril)" }}>
              {pendingBookings}
            </div>
            <p className="text-xs text-[#004645]/70">à traiter</p>
          </CardContent>
        </Card>

        <Card className="border-[#FF4713]/30 bg-[#FF4713]/5 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#004645]">Coût total</CardTitle>
            <DollarSign className="h-4 w-4 text-[#FF4713]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#FF4713]" style={{ fontFamily: "var(--font-abril)" }}>
              {totalCost.toFixed(0)} €
            </div>
            <p className="text-xs text-[#004645]/70">estimé/réel</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      {bookings.length > 0 && (
        <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-[#009197]" />
                <CardTitle className="text-[#004645]">Filtres</CardTitle>
              </div>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                  className="text-[#FF4713] hover:text-[#FF4713] hover:bg-[#FF4713]/10"
                >
                  <X className="h-4 w-4 mr-1" />
                  Réinitialiser
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Recherche */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un invité..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Filtre Type */}
              <Select
                value={filterType}
                onValueChange={(value) => setFilterType(value as TransportType | 'ALL')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Type de transport" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tous les types</SelectItem>
                  <SelectItem value="FLIGHT">✈️ Vol</SelectItem>
                  <SelectItem value="TRAIN">🚂 Train</SelectItem>
                  <SelectItem value="SHUTTLE">🚌 Navette</SelectItem>
                  <SelectItem value="TAXI">🚕 Taxi</SelectItem>
                  <SelectItem value="CAR_RENTAL">🚗 Location</SelectItem>
                  <SelectItem value="PERSONAL_CAR">🚙 Véhicule personnel</SelectItem>
                </SelectContent>
              </Select>

              {/* Filtre Statut */}
              <Select
                value={filterStatus}
                onValueChange={(value) => setFilterStatus(value as BookingStatus | 'ALL')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tous les statuts</SelectItem>
                  <SelectItem value="REQUESTED">Demandé</SelectItem>
                  <SelectItem value="PENDING">En attente</SelectItem>
                  <SelectItem value="CONFIRMED">Confirmé</SelectItem>
                  <SelectItem value="BOOKED">Réservé</SelectItem>
                  <SelectItem value="CANCELLED">Annulé</SelectItem>
                  <SelectItem value="COMPLETED">Terminé</SelectItem>
                </SelectContent>
              </Select>

              {/* Filtre Ville */}
              <Select
                value={filterCity}
                onValueChange={setFilterCity}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Ville de départ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Toutes les villes</SelectItem>
                  {uniqueCities.map((city) => (
                    <SelectItem key={city} value={city!}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Résumé des filtres actifs */}
            {hasActiveFilters && (
              <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-medium text-[#004645]">
                  {filteredBookings.length} résultat{filteredBookings.length > 1 ? 's' : ''}
                </span>
                {totalBookings < bookings.length && (
                  <span>sur {bookings.length} au total</span>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Bookings List */}
      <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-[#004645]">Réservations</CardTitle>
          <CardDescription>Liste de toutes les réservations de transport</CardDescription>
        </CardHeader>
        <CardContent>
          {bookings.length === 0 ? (
            <div className="text-center py-12">
              <Bus className="h-12 w-12 text-[#009197]/30 mx-auto mb-4" />
              <p className="text-[#004645]/70 mb-4">Aucune réservation de transport</p>
              <TransportBookingDialog
                eventId={eventId}
                onSuccess={fetchBookings}
                trigger={
                  <Button variant="outline" className="border-[#004645] text-[#004645]">
                    <Plus className="h-4 w-4 mr-2" />
                    Créer la première réservation
                  </Button>
                }
              />
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-12">
              <Filter className="h-12 w-12 text-[#009197]/30 mx-auto mb-4" />
              <p className="text-[#004645]/70 mb-2">Aucune réservation ne correspond aux filtres</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="text-[#009197]"
              >
                Réinitialiser les filtres
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((booking) => {
                const Icon = transportIcons[booking.type]
                return (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between p-4 border border-[#9CD9F6]/30 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="p-3 rounded-lg bg-[#009197]/10">
                        <Icon className="h-6 w-6 text-[#009197]" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-[#004645]">
                            {booking.guest.firstName} {booking.guest.lastName}
                          </h3>
                          <Badge variant="secondary" className="text-xs">
                            {transportLabels[booking.type]}
                          </Badge>
                          <Badge className={statusColors[booking.status]}>
                            {statusLabels[booking.status]}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-[#004645]/70">
                          {booking.departure && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {booking.departure.city || booking.departure.airport || booking.departure.station || 'Départ'}
                            </div>
                          )}
                          {booking.departure && booking.arrival && (
                            <ArrowRight className="h-3 w-3" />
                          )}
                          {booking.arrival && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {booking.arrival.city || booking.arrival.airport || booking.arrival.station || 'Arrivée'}
                            </div>
                          )}
                          {booking.carrier && (
                            <span className="text-[#009197]">{booking.carrier}</span>
                          )}
                        </div>
                        {booking.bookingRef && (
                          <p className="text-xs text-[#004645]/50 mt-1">Réf: {booking.bookingRef}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {(booking.actualCost || booking.estimatedCost) && (
                        <div className="text-right">
                          <p className="font-semibold text-[#004645]">
                            {(booking.actualCost || booking.estimatedCost)?.toFixed(2)} {booking.currency}
                          </p>
                          <p className="text-xs text-[#004645]/50">
                            {booking.actualCost ? 'Réel' : 'Estimé'}
                          </p>
                        </div>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[#009197]"
                        onClick={() => {
                          setSelectedBookingId(booking.id)
                          setDetailsDialogOpen(true)
                        }}
                      >
                        Détails
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de détails/édition */}
      {selectedBookingId && (
        <TransportBookingDetailsDialog
          eventId={eventId}
          bookingId={selectedBookingId}
          open={detailsDialogOpen}
          onOpenChange={setDetailsDialogOpen}
          onSuccess={fetchBookings}
        />
      )}
    </div>
  )
}
