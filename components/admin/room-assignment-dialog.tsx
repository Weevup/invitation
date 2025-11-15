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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { Search } from 'lucide-react'
import { createClientLogger, getUserErrorMessage } from '@/lib/client-logger'

const logger = createClientLogger({ component: 'RoomAssignmentDialog' })

interface RoomAssignmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  eventId: string
  room: {
    id: string
    roomNumber: string
    type: string
    maxOccupancy: number
    currentOccupancy: number
  }
  onSuccess?: () => void
}

interface Guest {
  id: string
  firstName: string
  lastName: string
  email: string
  company?: string
}

export function RoomAssignmentDialog({
  open,
  onOpenChange,
  eventId,
  room,
  onSuccess,
}: RoomAssignmentDialogProps) {
  const [loading, setLoading] = useState(false)
  const [guests, setGuests] = useState<Guest[]>([])
  const [filteredGuests, setFilteredGuests] = useState<Guest[]>([])
  const [guestSearch, setGuestSearch] = useState('')
  const [formData, setFormData] = useState({
    guestId: '',
    checkInDate: '',
    checkOutDate: '',
    isPrimaryGuest: true,
    specialRequests: '',
    notes: '',
  })

  useEffect(() => {
    if (open) {
      fetchGuests()
    }
  }, [open, fetchGuests])

  useEffect(() => {
    if (guestSearch) {
      const search = guestSearch.toLowerCase()
      setFilteredGuests(
        guests.filter(
          (g) =>
            g.firstName.toLowerCase().includes(search) ||
            g.lastName.toLowerCase().includes(search) ||
            g.email.toLowerCase().includes(search) ||
            g.company?.toLowerCase().includes(search)
        )
      )
    } else {
      setFilteredGuests(guests)
    }
  }, [guestSearch, guests])

  const fetchGuests = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/events/${eventId}/guests`)
      if (response.ok) {
        const data = await response.json()
        setGuests(data.guests || [])
        setFilteredGuests(data.guests || [])
      }
    } catch (error) {
      logger.error(error, { action: 'fetchGuests', metadata: { eventId } })
      toast.error(getUserErrorMessage(error))
    }
  }, [eventId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!formData.guestId) {
        throw new Error('Veuillez sélectionner un invité')
      }

      if (!formData.checkInDate || !formData.checkOutDate) {
        throw new Error('Veuillez sélectionner les dates d\'arrivée et de départ')
      }

      const response = await fetch(
        `/api/admin/events/${eventId}/room-assignments`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            roomId: room.id,
            ...formData,
          }),
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erreur lors de l\'assignation')
      }

      toast.success('Invité assigné avec succès')

      // Reset form
      setFormData({
        guestId: '',
        checkInDate: '',
        checkOutDate: '',
        isPrimaryGuest: true,
        specialRequests: '',
        notes: '',
      })
      setGuestSearch('')

      onOpenChange(false)
      onSuccess?.()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const availableSpots = room.maxOccupancy - room.currentOccupancy

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assigner un invité</DialogTitle>
          <DialogDescription>
            Chambre {room.roomNumber} - {room.type} (
            {availableSpots > 0 ? (
              <>
                <span className="text-green-600 font-semibold">
                  {availableSpots} place{availableSpots > 1 ? 's' : ''} disponible
                  {availableSpots > 1 ? 's' : ''}
                </span>
              </>
            ) : (
              <span className="text-red-600 font-semibold">Complète</span>
            )}
            )
          </DialogDescription>
        </DialogHeader>

        {availableSpots === 0 ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground">
              Cette chambre a atteint sa capacité maximale.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Guest Selection */}
            <div className="space-y-3">
              <Label>Invité <span className="text-red-500">*</span></Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un invité..."
                  value={guestSearch}
                  onChange={(e) => setGuestSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              {guestSearch && filteredGuests.length > 0 && (
                <div className="border rounded-md max-h-60 overflow-y-auto">
                  {filteredGuests.slice(0, 10).map((guest) => (
                    <div
                      key={guest.id}
                      className={`p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 ${
                        formData.guestId === guest.id ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => {
                        setFormData({ ...formData, guestId: guest.id })
                        setGuestSearch(
                          `${guest.firstName} ${guest.lastName} (${guest.email})`
                        )
                      }}
                    >
                      <div className="font-medium">
                        {guest.firstName} {guest.lastName}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {guest.email}
                        {guest.company && ` • ${guest.company}`}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {formData.guestId && (
                <div className="text-sm text-green-600">
                  ✓ Invité sélectionné
                </div>
              )}
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="checkInDate">
                  Date d&apos;arrivée <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="checkInDate"
                  type="date"
                  value={formData.checkInDate}
                  onChange={(e) =>
                    setFormData({ ...formData, checkInDate: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="checkOutDate">
                  Date de départ <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="checkOutDate"
                  type="date"
                  value={formData.checkOutDate}
                  onChange={(e) =>
                    setFormData({ ...formData, checkOutDate: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            {/* Primary Guest */}
            {room.currentOccupancy > 0 && (
              <div className="flex items-center space-x-2">
                <Switch
                  id="isPrimaryGuest"
                  checked={formData.isPrimaryGuest}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isPrimaryGuest: checked })
                  }
                />
                <Label htmlFor="isPrimaryGuest">
                  Invité principal (chambre partagée)
                </Label>
              </div>
            )}

            {/* Special Requests */}
            <div>
              <Label htmlFor="specialRequests">Demandes spéciales</Label>
              <Textarea
                id="specialRequests"
                value={formData.specialRequests}
                onChange={(e) =>
                  setFormData({ ...formData, specialRequests: e.target.value })
                }
                placeholder="Lit bébé, étage élevé, allergie..."
                rows={2}
              />
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes">Notes internes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Notes pour l'équipe..."
                rows={2}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={loading || !formData.guestId}>
                {loading ? 'Assignation...' : 'Assigner l\'invité'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
