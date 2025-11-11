'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
  Sparkles
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

  const totalBookings = bookings.length
  const confirmedBookings = bookings.filter(b => b.status === 'BOOKED' || b.status === 'CONFIRMED').length
  const pendingBookings = bookings.filter(b => b.status === 'REQUESTED' || b.status === 'PENDING').length
  const totalCost = bookings.reduce((sum, b) => sum + (b.actualCost || b.estimatedCost || 0), 0)

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
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => {
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
