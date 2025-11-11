'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Loader2, Edit2, Trash2, X } from 'lucide-react'
import { TransportType, BookingStatus } from '@prisma/client'
import { toast } from 'sonner'

interface TransportBooking {
  id: string
  type: TransportType
  status: BookingStatus
  departure: any
  arrival: any
  carrier?: string
  bookingRef?: string
  seatNumber?: string
  estimatedCost?: number
  actualCost?: number
  currency: string
  isPaidByCompany: boolean
  notes?: string
  internalNotes?: string
  guest: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
}

interface Guest {
  id: string
  firstName: string
  lastName: string
  email: string
}

interface TransportBookingDetailsDialogProps {
  eventId: string
  bookingId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

const TRANSPORT_TYPES = [
  { value: 'FLIGHT', label: 'Vol ✈️' },
  { value: 'TRAIN', label: 'Train 🚂' },
  { value: 'SHUTTLE', label: 'Navette 🚌' },
  { value: 'TAXI', label: 'Taxi 🚕' },
  { value: 'CAR_RENTAL', label: 'Location de voiture 🚗' },
  { value: 'PERSONAL_CAR', label: 'Véhicule personnel 🚙' },
]

const BOOKING_STATUSES = [
  { value: 'REQUESTED', label: 'Demandé', color: 'bg-gray-100 text-gray-800' },
  { value: 'PENDING', label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'CONFIRMED', label: 'Confirmé', color: 'bg-blue-100 text-blue-800' },
  { value: 'BOOKED', label: 'Réservé', color: 'bg-green-100 text-green-800' },
  { value: 'CANCELLED', label: 'Annulé', color: 'bg-red-100 text-red-800' },
  { value: 'COMPLETED', label: 'Terminé', color: 'bg-purple-100 text-purple-800' },
]

export function TransportBookingDetailsDialog({
  eventId,
  bookingId,
  open,
  onOpenChange,
  onSuccess
}: TransportBookingDetailsDialogProps) {
  const [booking, setBooking] = useState<TransportBooking | null>(null)
  const [guests, setGuests] = useState<Guest[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const [formData, setFormData] = useState({
    guestId: '',
    type: 'FLIGHT' as TransportType,
    status: 'REQUESTED' as BookingStatus,
    departureCity: '',
    departureAirport: '',
    departureStation: '',
    departureAddress: '',
    departureDate: '',
    departureTime: '',
    arrivalCity: '',
    arrivalAirport: '',
    arrivalStation: '',
    arrivalAddress: '',
    arrivalDate: '',
    arrivalTime: '',
    carrier: '',
    bookingRef: '',
    seatNumber: '',
    estimatedCost: '',
    actualCost: '',
    currency: 'EUR',
    isPaidByCompany: true,
    notes: '',
    internalNotes: '',
  })

  const fetchBooking = useCallback(async () => {
    setLoadingData(true)
    try {
      const response = await fetch(`/api/admin/events/${eventId}/transport/${bookingId}`)
      if (response.ok) {
        const data = await response.json()
        const b = data.booking
        setBooking(b)

        // Pré-remplir le formulaire
        setFormData({
          guestId: b.guest.id,
          type: b.type,
          status: b.status,
          departureCity: b.departure?.city || '',
          departureAirport: b.departure?.airport || '',
          departureStation: b.departure?.station || '',
          departureAddress: b.departure?.address || '',
          departureDate: b.departure?.date || '',
          departureTime: b.departure?.time || '',
          arrivalCity: b.arrival?.city || '',
          arrivalAirport: b.arrival?.airport || '',
          arrivalStation: b.arrival?.station || '',
          arrivalAddress: b.arrival?.address || '',
          arrivalDate: b.arrival?.date || '',
          arrivalTime: b.arrival?.time || '',
          carrier: b.carrier || '',
          bookingRef: b.bookingRef || '',
          seatNumber: b.seatNumber || '',
          estimatedCost: b.estimatedCost?.toString() || '',
          actualCost: b.actualCost?.toString() || '',
          currency: b.currency,
          isPaidByCompany: b.isPaidByCompany,
          notes: b.notes || '',
          internalNotes: b.internalNotes || '',
        })
      } else {
        toast.error('Erreur lors du chargement de la réservation')
        onOpenChange(false)
      }
    } catch (error) {
      console.error('Error fetching booking:', error)
      toast.error('Erreur lors du chargement de la réservation')
      onOpenChange(false)
    } finally {
      setLoadingData(false)
    }
  }, [eventId, bookingId, onOpenChange])

  const fetchGuests = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/events/${eventId}`)
      if (response.ok) {
        const data = await response.json()
        setGuests(data.guests || [])
      }
    } catch (error) {
      console.error('Error fetching guests:', error)
    }
  }, [eventId])

  useEffect(() => {
    if (open) {
      fetchBooking()
      fetchGuests()
    }
  }, [open, fetchBooking, fetchGuests])

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const departure = {
        city: formData.departureCity || undefined,
        airport: formData.departureAirport || undefined,
        station: formData.departureStation || undefined,
        address: formData.departureAddress || undefined,
        date: formData.departureDate || undefined,
        time: formData.departureTime || undefined,
      }

      const arrival = {
        city: formData.arrivalCity || undefined,
        airport: formData.arrivalAirport || undefined,
        station: formData.arrivalStation || undefined,
        address: formData.arrivalAddress || undefined,
        date: formData.arrivalDate || undefined,
        time: formData.arrivalTime || undefined,
      }

      const response = await fetch(`/api/admin/events/${eventId}/transport/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestId: formData.guestId,
          type: formData.type,
          status: formData.status,
          departure: Object.values(departure).some(v => v) ? departure : undefined,
          arrival: Object.values(arrival).some(v => v) ? arrival : undefined,
          carrier: formData.carrier || undefined,
          bookingRef: formData.bookingRef || undefined,
          seatNumber: formData.seatNumber || undefined,
          estimatedCost: formData.estimatedCost ? parseFloat(formData.estimatedCost) : undefined,
          actualCost: formData.actualCost ? parseFloat(formData.actualCost) : undefined,
          currency: formData.currency,
          isPaidByCompany: formData.isPaidByCompany,
          notes: formData.notes || undefined,
          internalNotes: formData.internalNotes || undefined,
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update booking')
      }

      toast.success('Réservation mise à jour avec succès')
      setIsEditing(false)
      fetchBooking() // Rafraîchir les données
      onSuccess?.()
    } catch (error) {
      console.error('Error updating booking:', error)
      toast.error('Erreur lors de la mise à jour')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/events/${eventId}/transport/${bookingId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete booking')
      }

      toast.success('Réservation supprimée avec succès')
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error('Error deleting booking:', error)
      toast.error('Erreur lors de la suppression')
    } finally {
      setLoading(false)
      setShowDeleteDialog(false)
    }
  }

  if (loadingData) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#009197]" />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (!booking) return null

  const statusInfo = BOOKING_STATUSES.find(s => s.value === booking.status)

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div>
                <DialogTitle>
                  {isEditing ? 'Modifier la réservation' : 'Détails de la réservation'}
                </DialogTitle>
                <DialogDescription>
                  {booking.guest.firstName} {booking.guest.lastName}
                </DialogDescription>
              </div>
              <div className="flex gap-2">
                {!isEditing && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit2 className="h-4 w-4 mr-1" />
                      Modifier
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => setShowDeleteDialog(true)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Supprimer
                    </Button>
                  </>
                )}
                {isEditing && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsEditing(false)
                      fetchBooking() // Reset form
                    }}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Annuler
                  </Button>
                )}
              </div>
            </div>
          </DialogHeader>

          {!isEditing ? (
            // Mode lecture seule
            <div className="space-y-6">
              {/* Statut et Type */}
              <div className="flex items-center gap-3">
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo?.color}`}>
                  {statusInfo?.label}
                </div>
                <div className="text-sm text-muted-foreground">
                  {TRANSPORT_TYPES.find(t => t.value === booking.type)?.label}
                </div>
              </div>

              {/* Départ */}
              {booking.departure && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-[#004645] mb-3">📍 Départ</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {booking.departure.city && (
                      <div>
                        <p className="text-muted-foreground">Ville</p>
                        <p className="font-medium">{booking.departure.city}</p>
                      </div>
                    )}
                    {booking.departure.airport && (
                      <div>
                        <p className="text-muted-foreground">Aéroport</p>
                        <p className="font-medium">{booking.departure.airport}</p>
                      </div>
                    )}
                    {booking.departure.station && (
                      <div>
                        <p className="text-muted-foreground">Gare</p>
                        <p className="font-medium">{booking.departure.station}</p>
                      </div>
                    )}
                    {booking.departure.address && (
                      <div className="col-span-2">
                        <p className="text-muted-foreground">Adresse</p>
                        <p className="font-medium">{booking.departure.address}</p>
                      </div>
                    )}
                    {booking.departure.date && (
                      <div>
                        <p className="text-muted-foreground">Date</p>
                        <p className="font-medium">
                          {new Date(booking.departure.date).toLocaleDateString('fr-FR')}
                          {booking.departure.time && ` à ${booking.departure.time}`}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Arrivée */}
              {booking.arrival && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-[#004645] mb-3">🎯 Arrivée</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {booking.arrival.city && (
                      <div>
                        <p className="text-muted-foreground">Ville</p>
                        <p className="font-medium">{booking.arrival.city}</p>
                      </div>
                    )}
                    {booking.arrival.airport && (
                      <div>
                        <p className="text-muted-foreground">Aéroport</p>
                        <p className="font-medium">{booking.arrival.airport}</p>
                      </div>
                    )}
                    {booking.arrival.station && (
                      <div>
                        <p className="text-muted-foreground">Gare</p>
                        <p className="font-medium">{booking.arrival.station}</p>
                      </div>
                    )}
                    {booking.arrival.address && (
                      <div className="col-span-2">
                        <p className="text-muted-foreground">Adresse</p>
                        <p className="font-medium">{booking.arrival.address}</p>
                      </div>
                    )}
                    {booking.arrival.date && (
                      <div>
                        <p className="text-muted-foreground">Date</p>
                        <p className="font-medium">
                          {new Date(booking.arrival.date).toLocaleDateString('fr-FR')}
                          {booking.arrival.time && ` à ${booking.arrival.time}`}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Détails réservation */}
              <div className="border-t pt-4">
                <h3 className="font-semibold text-[#004645] mb-3">📋 Détails</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {booking.carrier && (
                    <div>
                      <p className="text-muted-foreground">Compagnie</p>
                      <p className="font-medium">{booking.carrier}</p>
                    </div>
                  )}
                  {booking.bookingRef && (
                    <div>
                      <p className="text-muted-foreground">Référence</p>
                      <p className="font-medium">{booking.bookingRef}</p>
                    </div>
                  )}
                  {booking.seatNumber && (
                    <div>
                      <p className="text-muted-foreground">Siège / Place</p>
                      <p className="font-medium">{booking.seatNumber}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Coûts */}
              {(booking.estimatedCost || booking.actualCost) && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-[#004645] mb-3">💰 Coûts</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {booking.estimatedCost && (
                      <div>
                        <p className="text-muted-foreground">Coût estimé</p>
                        <p className="font-medium">{booking.estimatedCost.toFixed(2)} {booking.currency}</p>
                      </div>
                    )}
                    {booking.actualCost && (
                      <div>
                        <p className="text-muted-foreground">Coût réel</p>
                        <p className="font-medium">{booking.actualCost.toFixed(2)} {booking.currency}</p>
                      </div>
                    )}
                    <div className="col-span-2">
                      <p className="text-muted-foreground">Prise en charge</p>
                      <p className="font-medium">
                        {booking.isPaidByCompany ? '✅ Par l\'entreprise' : '❌ Par l\'invité'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Notes */}
              {(booking.notes || booking.internalNotes) && (
                <div className="border-t pt-4 space-y-3">
                  {booking.notes && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Notes</p>
                      <p className="text-sm bg-muted p-3 rounded">{booking.notes}</p>
                    </div>
                  )}
                  {booking.internalNotes && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Notes internes</p>
                      <p className="text-sm bg-yellow-50 p-3 rounded">{booking.internalNotes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            // Mode édition (réutilise le formulaire)
            <form onSubmit={handleUpdate} className="space-y-6">
              {/* Même formulaire que TransportBookingDialog */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="guest">Invité *</Label>
                  <Select
                    value={formData.guestId}
                    onValueChange={(value) => setFormData({ ...formData, guestId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un invité" />
                    </SelectTrigger>
                    <SelectContent>
                      {guests.map((guest) => (
                        <SelectItem key={guest.id} value={guest.id}>
                          {guest.firstName} {guest.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Type de transport *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value as TransportType })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TRANSPORT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Statut */}
              <div className="space-y-2">
                <Label htmlFor="status">Statut *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as BookingStatus })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BOOKING_STATUSES.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Départ (formulaire simplifié) */}
              <div className="space-y-4 border-t pt-4">
                <h3 className="font-semibold text-[#004645]">📍 Départ</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="Ville"
                    value={formData.departureCity}
                    onChange={(e) => setFormData({ ...formData, departureCity: e.target.value })}
                  />
                  {formData.type === 'FLIGHT' && (
                    <Input
                      placeholder="Aéroport"
                      value={formData.departureAirport}
                      onChange={(e) => setFormData({ ...formData, departureAirport: e.target.value })}
                    />
                  )}
                  {formData.type === 'TRAIN' && (
                    <Input
                      placeholder="Gare"
                      value={formData.departureStation}
                      onChange={(e) => setFormData({ ...formData, departureStation: e.target.value })}
                    />
                  )}
                  <Input
                    type="date"
                    value={formData.departureDate}
                    onChange={(e) => setFormData({ ...formData, departureDate: e.target.value })}
                  />
                  <Input
                    type="time"
                    value={formData.departureTime}
                    onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })}
                  />
                </div>
              </div>

              {/* Arrivée */}
              <div className="space-y-4 border-t pt-4">
                <h3 className="font-semibold text-[#004645]">🎯 Arrivée</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="Ville"
                    value={formData.arrivalCity}
                    onChange={(e) => setFormData({ ...formData, arrivalCity: e.target.value })}
                  />
                  {formData.type === 'FLIGHT' && (
                    <Input
                      placeholder="Aéroport"
                      value={formData.arrivalAirport}
                      onChange={(e) => setFormData({ ...formData, arrivalAirport: e.target.value })}
                    />
                  )}
                  {formData.type === 'TRAIN' && (
                    <Input
                      placeholder="Gare"
                      value={formData.arrivalStation}
                      onChange={(e) => setFormData({ ...formData, arrivalStation: e.target.value })}
                    />
                  )}
                  <Input
                    type="date"
                    value={formData.arrivalDate}
                    onChange={(e) => setFormData({ ...formData, arrivalDate: e.target.value })}
                  />
                  <Input
                    type="time"
                    value={formData.arrivalTime}
                    onChange={(e) => setFormData({ ...formData, arrivalTime: e.target.value })}
                  />
                </div>
              </div>

              {/* Détails */}
              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="Compagnie"
                  value={formData.carrier}
                  onChange={(e) => setFormData({ ...formData, carrier: e.target.value })}
                />
                <Input
                  placeholder="Référence"
                  value={formData.bookingRef}
                  onChange={(e) => setFormData({ ...formData, bookingRef: e.target.value })}
                />
              </div>

              {/* Coûts */}
              <div className="grid grid-cols-3 gap-4">
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Coût estimé"
                  value={formData.estimatedCost}
                  onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
                />
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Coût réel"
                  value={formData.actualCost}
                  onChange={(e) => setFormData({ ...formData, actualCost: e.target.value })}
                />
                <Select
                  value={formData.currency}
                  onValueChange={(value) => setFormData({ ...formData, currency: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EUR">EUR €</SelectItem>
                    <SelectItem value="USD">USD $</SelectItem>
                    <SelectItem value="GBP">GBP £</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Notes */}
              <Textarea
                placeholder="Notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
              />
              <Textarea
                placeholder="Notes internes"
                value={formData.internalNotes}
                onChange={(e) => setFormData({ ...formData, internalNotes: e.target.value })}
                rows={2}
              />

              <DialogFooter>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-[#004645] to-[#009197]"
                >
                  {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Enregistrer
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmation de suppression */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cette réservation de transport pour{' '}
              <strong>
                {booking?.guest.firstName} {booking?.guest.lastName}
              </strong>
              ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
