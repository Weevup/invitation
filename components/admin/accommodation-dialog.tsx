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
import { toast } from 'sonner'

interface AccommodationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  eventId: string
  accommodation?: any
  onSuccess?: () => void
}

const ACCOMMODATION_TYPES = [
  { value: 'HOTEL', label: 'Hôtel' },
  { value: 'APARTMENT', label: 'Appartement' },
  { value: 'HOSTEL', label: 'Auberge' },
  { value: 'RESORT', label: 'Resort' },
  { value: 'VILLA', label: 'Villa' },
  { value: 'OTHER', label: 'Autre' },
]

export function AccommodationDialog({
  open,
  onOpenChange,
  eventId,
  accommodation,
  onSuccess,
}: AccommodationDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: accommodation?.name || '',
    type: accommodation?.type || 'HOTEL',
    address: accommodation?.address || '',
    city: accommodation?.city || '',
    country: accommodation?.country || '',
    postalCode: accommodation?.postalCode || '',
    phone: accommodation?.phone || '',
    email: accommodation?.email || '',
    website: accommodation?.website || '',
    contactPerson: accommodation?.contactPerson || '',
    starRating: accommodation?.starRating || '',
    totalRooms: accommodation?.totalRooms || '',
    allocatedRooms: accommodation?.allocatedRooms || '',
    checkInTime: accommodation?.checkInTime || '14:00',
    checkOutTime: accommodation?.checkOutTime || '11:00',
    earlyCheckIn: accommodation?.earlyCheckIn || false,
    lateCheckOut: accommodation?.lateCheckOut || false,
    contractRate: accommodation?.contractRate || '',
    currency: accommodation?.currency || 'EUR',
    isPreferred: accommodation?.isPreferred || false,
    description: accommodation?.description || '',
    notes: accommodation?.notes || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Convert string numbers to actual numbers
      const data: any = { ...formData }
      if (data.starRating) data.starRating = parseInt(data.starRating)
      if (data.totalRooms) data.totalRooms = parseInt(data.totalRooms)
      if (data.allocatedRooms) data.allocatedRooms = parseInt(data.allocatedRooms)
      if (data.contractRate) data.contractRate = parseFloat(data.contractRate)

      const url = accommodation
        ? `/api/admin/events/${eventId}/accommodations/${accommodation.id}`
        : `/api/admin/events/${eventId}/accommodations`

      const method = accommodation ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erreur lors de la sauvegarde')
      }

      toast.success(
        accommodation
          ? 'Hébergement mis à jour avec succès'
          : 'Hébergement créé avec succès'
      )
      onOpenChange(false)
      onSuccess?.()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {accommodation ? 'Modifier l\'hébergement' : 'Nouvel hébergement'}
          </DialogTitle>
          <DialogDescription>
            {accommodation
              ? 'Modifiez les informations de l\'hébergement'
              : 'Ajoutez un nouvel hébergement pour votre événement'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Informations de base</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="name">
                  Nom de l&apos;hébergement <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Hôtel Marriott"
                  required
                />
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
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
                    {ACCOMMODATION_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="starRating">Étoiles</Label>
                <Select
                  value={formData.starRating.toString()}
                  onValueChange={(value) =>
                    setFormData({ ...formData, starRating: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Non classé</SelectItem>
                    <SelectItem value="1">1 étoile</SelectItem>
                    <SelectItem value="2">2 étoiles</SelectItem>
                    <SelectItem value="3">3 étoiles</SelectItem>
                    <SelectItem value="4">4 étoiles</SelectItem>
                    <SelectItem value="5">5 étoiles</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Adresse</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="address">Adresse</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  placeholder="123 Rue de la Paix"
                />
              </div>
              <div>
                <Label htmlFor="city">Ville</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  placeholder="Paris"
                />
              </div>
              <div>
                <Label htmlFor="postalCode">Code postal</Label>
                <Input
                  id="postalCode"
                  value={formData.postalCode}
                  onChange={(e) =>
                    setFormData({ ...formData, postalCode: e.target.value })
                  }
                  placeholder="75001"
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="country">Pays</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) =>
                    setFormData({ ...formData, country: e.target.value })
                  }
                  placeholder="France"
                />
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Contact</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="+33 1 23 45 67 89"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="contact@hotel.com"
                />
              </div>
              <div>
                <Label htmlFor="website">Site web</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) =>
                    setFormData({ ...formData, website: e.target.value })
                  }
                  placeholder="https://hotel.com"
                />
              </div>
              <div>
                <Label htmlFor="contactPerson">Personne de contact</Label>
                <Input
                  id="contactPerson"
                  value={formData.contactPerson}
                  onChange={(e) =>
                    setFormData({ ...formData, contactPerson: e.target.value })
                  }
                  placeholder="Jean Dupont"
                />
              </div>
            </div>
          </div>

          {/* Capacity & Check-in/out */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Capacité et horaires</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="totalRooms">Chambres totales</Label>
                <Input
                  id="totalRooms"
                  type="number"
                  min="0"
                  value={formData.totalRooms}
                  onChange={(e) =>
                    setFormData({ ...formData, totalRooms: e.target.value })
                  }
                  placeholder="50"
                />
              </div>
              <div>
                <Label htmlFor="allocatedRooms">Chambres allouées</Label>
                <Input
                  id="allocatedRooms"
                  type="number"
                  min="0"
                  value={formData.allocatedRooms}
                  onChange={(e) =>
                    setFormData({ ...formData, allocatedRooms: e.target.value })
                  }
                  placeholder="20"
                />
              </div>
              <div>
                <Label htmlFor="checkInTime">Heure check-in</Label>
                <Input
                  id="checkInTime"
                  type="time"
                  value={formData.checkInTime}
                  onChange={(e) =>
                    setFormData({ ...formData, checkInTime: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="checkOutTime">Heure check-out</Label>
                <Input
                  id="checkOutTime"
                  type="time"
                  value={formData.checkOutTime}
                  onChange={(e) =>
                    setFormData({ ...formData, checkOutTime: e.target.value })
                  }
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="earlyCheckIn"
                  checked={formData.earlyCheckIn}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, earlyCheckIn: checked })
                  }
                />
                <Label htmlFor="earlyCheckIn">Early check-in disponible</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="lateCheckOut"
                  checked={formData.lateCheckOut}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, lateCheckOut: checked })
                  }
                />
                <Label htmlFor="lateCheckOut">Late check-out disponible</Label>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Tarification</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <Label htmlFor="contractRate">Tarif négocié (par nuit)</Label>
                <Input
                  id="contractRate"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.contractRate}
                  onChange={(e) =>
                    setFormData({ ...formData, contractRate: e.target.value })
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
          </div>

          {/* Description & Notes */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Description de l'hébergement, équipements, etc."
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="notes">Notes internes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Notes pour l'équipe organisatrice"
                rows={2}
              />
            </div>
          </div>

          {/* Preferences */}
          <div className="flex items-center space-x-2">
            <Switch
              id="isPreferred"
              checked={formData.isPreferred}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, isPreferred: checked })
              }
            />
            <Label htmlFor="isPreferred" className="font-semibold">
              Hébergement préféré / officiel
            </Label>
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
              {loading ? 'Enregistrement...' : accommodation ? 'Mettre à jour' : 'Créer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
