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
  DialogTrigger,
} from '@/components/ui/dialog'
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
import { Plus, Loader2 } from 'lucide-react'
import { TransportType, BookingStatus } from '@prisma/client'
import { toast } from 'sonner'
import { createClientLogger, getUserErrorMessage } from '@/lib/client-logger'

const logger = createClientLogger({ component: 'TransportBookingDialog' })

interface Guest {
  id: string
  firstName: string
  lastName: string
  email: string
}

interface TransportBookingDialogProps {
  eventId: string
  onSuccess?: () => void
  trigger?: React.ReactNode
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
  { value: 'REQUESTED', label: 'Demandé' },
  { value: 'PENDING', label: 'En attente' },
  { value: 'CONFIRMED', label: 'Confirmé' },
  { value: 'BOOKED', label: 'Réservé' },
  { value: 'CANCELLED', label: 'Annulé' },
  { value: 'COMPLETED', label: 'Terminé' },
]

export function TransportBookingDialog({
  eventId,
  onSuccess,
  trigger
}: TransportBookingDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [guests, setGuests] = useState<Guest[]>([])
  const [loadingGuests, setLoadingGuests] = useState(false)

  const [formData, setFormData] = useState({
    guestId: '',
    type: 'FLIGHT' as TransportType,
    status: 'REQUESTED' as BookingStatus,

    // Departure
    departureCity: '',
    departureAirport: '',
    departureStation: '',
    departureAddress: '',
    departureDate: '',
    departureTime: '',

    // Arrival
    arrivalCity: '',
    arrivalAirport: '',
    arrivalStation: '',
    arrivalAddress: '',
    arrivalDate: '',
    arrivalTime: '',

    // Booking details
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

  // Charger la liste des invités
  const fetchGuests = useCallback(async () => {
    setLoadingGuests(true)
    try {
      const response = await fetch(`/api/admin/events/${eventId}`)
      if (response.ok) {
        const data = await response.json()
        setGuests(data.guests || [])
      }
    } catch (error) {
      logger.error(error, { action: 'fetchGuests', metadata: { eventId } })
      toast.error(getUserErrorMessage(error))
    } finally {
      setLoadingGuests(false)
    }
  }, [eventId])

  useEffect(() => {
    if (open) {
      fetchGuests()
    }
  }, [open, fetchGuests])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.guestId) {
      toast.error('Veuillez sélectionner un invité')
      return
    }

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

      const response = await fetch(`/api/admin/events/${eventId}/transport`, {
        method: 'POST',
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
        throw new Error('Failed to create booking')
      }

      toast.success('Réservation créée avec succès')
      setOpen(false)
      resetForm()
      onSuccess?.()
    } catch (error) {
      logger.error(error, { action: 'createBooking', metadata: { eventId } })
      toast.error(getUserErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      guestId: '',
      type: 'FLIGHT',
      status: 'REQUESTED',
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
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-gradient-to-r from-[#004645] to-[#009197] hover:from-[#006C51] hover:to-[#009197] text-white">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un transport
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nouvelle réservation de transport</DialogTitle>
          <DialogDescription>
            Créez une réservation individuelle pour un invité
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Sélection invité et type */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="guest">Invité *</Label>
              <Select
                value={formData.guestId}
                onValueChange={(value) => setFormData({ ...formData, guestId: value })}
                disabled={loadingGuests}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingGuests ? "Chargement..." : "Sélectionner un invité"} />
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

          {/* Départ */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-semibold text-[#004645]">📍 Départ</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="departureCity">Ville</Label>
                <Input
                  id="departureCity"
                  value={formData.departureCity}
                  onChange={(e) => setFormData({ ...formData, departureCity: e.target.value })}
                  placeholder="Paris"
                />
              </div>
              {formData.type === 'FLIGHT' && (
                <div className="space-y-2">
                  <Label htmlFor="departureAirport">Aéroport</Label>
                  <Input
                    id="departureAirport"
                    value={formData.departureAirport}
                    onChange={(e) => setFormData({ ...formData, departureAirport: e.target.value })}
                    placeholder="CDG - Charles de Gaulle"
                  />
                </div>
              )}
              {formData.type === 'TRAIN' && (
                <div className="space-y-2">
                  <Label htmlFor="departureStation">Gare</Label>
                  <Input
                    id="departureStation"
                    value={formData.departureStation}
                    onChange={(e) => setFormData({ ...formData, departureStation: e.target.value })}
                    placeholder="Gare de Lyon"
                  />
                </div>
              )}
              {(formData.type === 'TAXI' || formData.type === 'SHUTTLE') && (
                <div className="space-y-2">
                  <Label htmlFor="departureAddress">Adresse</Label>
                  <Input
                    id="departureAddress"
                    value={formData.departureAddress}
                    onChange={(e) => setFormData({ ...formData, departureAddress: e.target.value })}
                    placeholder="123 Rue de la Paix, 75001 Paris"
                  />
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="departureDate">Date</Label>
                <Input
                  id="departureDate"
                  type="date"
                  value={formData.departureDate}
                  onChange={(e) => setFormData({ ...formData, departureDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="departureTime">Heure</Label>
                <Input
                  id="departureTime"
                  type="time"
                  value={formData.departureTime}
                  onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Arrivée */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-semibold text-[#004645]">🎯 Arrivée</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="arrivalCity">Ville</Label>
                <Input
                  id="arrivalCity"
                  value={formData.arrivalCity}
                  onChange={(e) => setFormData({ ...formData, arrivalCity: e.target.value })}
                  placeholder="Nice"
                />
              </div>
              {formData.type === 'FLIGHT' && (
                <div className="space-y-2">
                  <Label htmlFor="arrivalAirport">Aéroport</Label>
                  <Input
                    id="arrivalAirport"
                    value={formData.arrivalAirport}
                    onChange={(e) => setFormData({ ...formData, arrivalAirport: e.target.value })}
                    placeholder="NCE - Nice Côte d'Azur"
                  />
                </div>
              )}
              {formData.type === 'TRAIN' && (
                <div className="space-y-2">
                  <Label htmlFor="arrivalStation">Gare</Label>
                  <Input
                    id="arrivalStation"
                    value={formData.arrivalStation}
                    onChange={(e) => setFormData({ ...formData, arrivalStation: e.target.value })}
                    placeholder="Gare de Nice-Ville"
                  />
                </div>
              )}
              {(formData.type === 'TAXI' || formData.type === 'SHUTTLE') && (
                <div className="space-y-2">
                  <Label htmlFor="arrivalAddress">Adresse</Label>
                  <Input
                    id="arrivalAddress"
                    value={formData.arrivalAddress}
                    onChange={(e) => setFormData({ ...formData, arrivalAddress: e.target.value })}
                    placeholder="Hôtel Negresco, 37 Prom. des Anglais"
                  />
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="arrivalDate">Date</Label>
                <Input
                  id="arrivalDate"
                  type="date"
                  value={formData.arrivalDate}
                  onChange={(e) => setFormData({ ...formData, arrivalDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="arrivalTime">Heure</Label>
                <Input
                  id="arrivalTime"
                  type="time"
                  value={formData.arrivalTime}
                  onChange={(e) => setFormData({ ...formData, arrivalTime: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Détails réservation */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-semibold text-[#004645]">📋 Détails de la réservation</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="carrier">Compagnie</Label>
                <Input
                  id="carrier"
                  value={formData.carrier}
                  onChange={(e) => setFormData({ ...formData, carrier: e.target.value })}
                  placeholder="Air France, SNCF, Uber..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bookingRef">Référence</Label>
                <Input
                  id="bookingRef"
                  value={formData.bookingRef}
                  onChange={(e) => setFormData({ ...formData, bookingRef: e.target.value })}
                  placeholder="ABC123"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Statut</Label>
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
              <div className="space-y-2">
                <Label htmlFor="seatNumber">Siège / Place</Label>
                <Input
                  id="seatNumber"
                  value={formData.seatNumber}
                  onChange={(e) => setFormData({ ...formData, seatNumber: e.target.value })}
                  placeholder="12A"
                />
              </div>
            </div>
          </div>

          {/* Coûts */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-semibold text-[#004645]">💰 Coûts</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="estimatedCost">Coût estimé</Label>
                <Input
                  id="estimatedCost"
                  type="number"
                  step="0.01"
                  value={formData.estimatedCost}
                  onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
                  placeholder="150.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="actualCost">Coût réel</Label>
                <Input
                  id="actualCost"
                  type="number"
                  step="0.01"
                  value={formData.actualCost}
                  onChange={(e) => setFormData({ ...formData, actualCost: e.target.value })}
                  placeholder="145.50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Devise</Label>
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
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isPaidByCompany"
                checked={formData.isPaidByCompany}
                onCheckedChange={(checked) => setFormData({ ...formData, isPaidByCompany: checked })}
              />
              <Label htmlFor="isPaidByCompany">Pris en charge par l&apos;entreprise</Label>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-4 border-t pt-4">
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (visibles par l&apos;invité)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Informations à communiquer à l'invité..."
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="internalNotes">Notes internes (privées)</Label>
              <Textarea
                id="internalNotes"
                value={formData.internalNotes}
                onChange={(e) => setFormData({ ...formData, internalNotes: e.target.value })}
                placeholder="Notes pour l'équipe logistique..."
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.guestId}
              className="bg-gradient-to-r from-[#004645] to-[#009197]"
            >
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Créer la réservation
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
