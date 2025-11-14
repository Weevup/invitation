'use client'

import { useState } from 'react'
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
import { useToast } from '@/components/ui/use-toast'

interface RoomDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  eventId: string
  accommodationId: string
  onSuccess?: () => void
}

const ROOM_TYPES = [
  { value: 'SINGLE', label: 'Simple (1 pers.)' },
  { value: 'DOUBLE', label: 'Double (2 pers.)' },
  { value: 'TWIN', label: 'Twin (2 lits simples)' },
  { value: 'TRIPLE', label: 'Triple (3 pers.)' },
  { value: 'SUITE', label: 'Suite' },
  { value: 'STUDIO', label: 'Studio' },
  { value: 'APARTMENT', label: 'Appartement' },
]

export function RoomDialog({
  open,
  onOpenChange,
  eventId,
  accommodationId,
  onSuccess,
}: RoomDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    roomNumber: '',
    floor: '',
    type: 'DOUBLE',
    maxOccupancy: '2',
    bedConfiguration: '',
    view: '',
    isAccessible: false,
    isSmokingAllowed: false,
    ratePerNight: '',
    currency: 'EUR',
    notes: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.roomNumber || formData.roomNumber.trim() === '') {
      toast({
        title: 'Champ requis manquant',
        description: 'Le numéro de chambre est requis',
        variant: 'destructive'
      })
      return
    }

    if (!formData.maxOccupancy || parseInt(formData.maxOccupancy) < 1) {
      toast({
        title: 'Capacité invalide',
        description: 'La capacité maximale doit être au moins 1',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)

    try {
      // Convert string numbers to actual numbers
      const data: any = { ...formData }
      if (data.floor) data.floor = parseInt(data.floor)
      if (data.maxOccupancy) data.maxOccupancy = parseInt(data.maxOccupancy)
      if (data.ratePerNight) data.ratePerNight = parseFloat(data.ratePerNight)

      const response = await fetch(
        `/api/admin/events/${eventId}/accommodations/${accommodationId}/rooms`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erreur lors de la création')
      }

      toast({
        title: 'Chambre créée',
        description: `La chambre ${formData.roomNumber} a été créée avec succès`
      })

      // Reset form
      setFormData({
        roomNumber: '',
        floor: '',
        type: 'DOUBLE',
        maxOccupancy: '2',
        bedConfiguration: '',
        view: '',
        isAccessible: false,
        isSmokingAllowed: false,
        ratePerNight: '',
        currency: 'EUR',
        notes: '',
      })

      onSuccess?.()
    } catch (error: any) {
      console.error('Error creating room:', error)
      toast({
        title: 'Erreur',
        description: error.message || 'Une erreur est survenue lors de la création',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ajouter une chambre</DialogTitle>
          <DialogDescription>
            Créez une nouvelle chambre pour cet hébergement
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="roomNumber">
                N° de chambre <span className="text-red-500">*</span>
              </Label>
              <Input
                id="roomNumber"
                value={formData.roomNumber}
                onChange={(e) =>
                  setFormData({ ...formData, roomNumber: e.target.value })
                }
                placeholder="101, Suite 5, etc."
                required
              />
            </div>
            <div>
              <Label htmlFor="floor">Étage</Label>
              <Input
                id="floor"
                type="number"
                value={formData.floor}
                onChange={(e) =>
                  setFormData({ ...formData, floor: e.target.value })
                }
                placeholder="1, 2, 3..."
              />
            </div>
            <div>
              <Label htmlFor="type">
                Type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROOM_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="maxOccupancy">
                Capacité max <span className="text-red-500">*</span>
              </Label>
              <Input
                id="maxOccupancy"
                type="number"
                min="1"
                value={formData.maxOccupancy}
                onChange={(e) =>
                  setFormData({ ...formData, maxOccupancy: e.target.value })
                }
                required
              />
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bedConfiguration">Configuration lits</Label>
              <Input
                id="bedConfiguration"
                value={formData.bedConfiguration}
                onChange={(e) =>
                  setFormData({ ...formData, bedConfiguration: e.target.value })
                }
                placeholder="1 lit King, 2 lits simples..."
              />
            </div>
            <div>
              <Label htmlFor="view">Vue</Label>
              <Input
                id="view"
                value={formData.view}
                onChange={(e) =>
                  setFormData({ ...formData, view: e.target.value })
                }
                placeholder="Vue mer, jardin..."
              />
            </div>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <Label htmlFor="ratePerNight">Tarif par nuit</Label>
              <Input
                id="ratePerNight"
                type="number"
                step="0.01"
                min="0"
                value={formData.ratePerNight}
                onChange={(e) =>
                  setFormData({ ...formData, ratePerNight: e.target.value })
                }
                placeholder="120.00"
              />
            </div>
            <div>
              <Label htmlFor="currency">Devise</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) =>
                  setFormData({ ...formData, currency: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                  <SelectItem value="CHF">CHF</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Accessibility */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Switch
                id="isAccessible"
                checked={formData.isAccessible}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isAccessible: checked })
                }
              />
              <Label htmlFor="isAccessible">Chambre accessible (PMR)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isSmokingAllowed"
                checked={formData.isSmokingAllowed}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isSmokingAllowed: checked })
                }
              />
              <Label htmlFor="isSmokingAllowed">Fumeurs autorisés</Label>
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="Notes sur la chambre..."
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
            <Button type="submit" disabled={loading}>
              {loading ? 'Création...' : 'Créer la chambre'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
