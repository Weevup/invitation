'use client'

import { useState, useEffect } from 'react'
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
import { toast } from 'sonner'
import { Plus, Bus } from 'lucide-react'
import { TransportType } from '@prisma/client'

interface TransportManifestDialogProps {
  eventId: string
  onSuccess?: () => void
  trigger?: React.ReactNode
}

export function TransportManifestDialog({
  eventId,
  onSuccess,
  trigger
}: TransportManifestDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    type: 'SHUTTLE' as TransportType,
    name: '',
    description: '',
    // Departure
    departureCity: '',
    departureAddress: '',
    departureDate: '',
    departureTime: '',
    // Arrival
    arrivalCity: '',
    arrivalAddress: '',
    arrivalDate: '',
    arrivalTime: '',
    // Details
    maxCapacity: '20',
    costPerPerson: '',
    currency: 'EUR',
    status: 'DRAFT'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/admin/events/${eventId}/transport/manifests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: formData.type,
          name: formData.name,
          description: formData.description,
          departure: {
            city: formData.departureCity,
            address: formData.departureAddress,
            date: formData.departureDate,
            time: formData.departureTime
          },
          arrival: {
            city: formData.arrivalCity,
            address: formData.arrivalAddress,
            date: formData.arrivalDate,
            time: formData.arrivalTime
          },
          maxCapacity: formData.maxCapacity,
          costPerPerson: formData.costPerPerson,
          currency: formData.currency,
          status: formData.status
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create manifest')
      }

      toast.success('Manifeste créé avec succès')
      setOpen(false)

      // Reset form
      setFormData({
        type: 'SHUTTLE',
        name: '',
        description: '',
        departureCity: '',
        departureAddress: '',
        departureDate: '',
        departureTime: '',
        arrivalCity: '',
        arrivalAddress: '',
        arrivalDate: '',
        arrivalTime: '',
        maxCapacity: '20',
        costPerPerson: '',
        currency: 'EUR',
        status: 'DRAFT'
      })

      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error('Error creating manifest:', error)
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la création')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-[#009197] hover:bg-[#007d82] text-white">
            <Plus className="h-4 w-4 mr-2" />
            Nouveau manifeste
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#004645]">Créer un manifeste de transport</DialogTitle>
          <DialogDescription>
            Créez une navette ou un bus pour regrouper plusieurs invités
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations générales */}
          <div className="space-y-4">
            <h3 className="font-semibold text-[#004645] border-b pb-2">📋 Informations générales</h3>

            <div className="grid grid-cols-2 gap-4">
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
                    <SelectItem value="SHUTTLE">🚌 Navette</SelectItem>
                    <SelectItem value="TRAIN">🚂 Train</SelectItem>
                    <SelectItem value="FLIGHT">✈️ Vol groupé</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Nom du manifeste *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Navette Aéroport - Hôtel"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Informations complémentaires..."
                rows={2}
              />
            </div>
          </div>

          {/* Départ */}
          <div className="space-y-4">
            <h3 className="font-semibold text-[#004645] border-b pb-2">📍 Départ</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="departureCity">Ville *</Label>
                <Input
                  id="departureCity"
                  value={formData.departureCity}
                  onChange={(e) => setFormData({ ...formData, departureCity: e.target.value })}
                  placeholder="Paris"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="departureAddress">Adresse</Label>
                <Input
                  id="departureAddress"
                  value={formData.departureAddress}
                  onChange={(e) => setFormData({ ...formData, departureAddress: e.target.value })}
                  placeholder="Lieu de rassemblement"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="departureDate">Date *</Label>
                <Input
                  id="departureDate"
                  type="date"
                  value={formData.departureDate}
                  onChange={(e) => setFormData({ ...formData, departureDate: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="departureTime">Heure *</Label>
                <Input
                  id="departureTime"
                  type="time"
                  value={formData.departureTime}
                  onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>

          {/* Arrivée */}
          <div className="space-y-4">
            <h3 className="font-semibold text-[#004645] border-b pb-2">🎯 Arrivée</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="arrivalCity">Ville *</Label>
                <Input
                  id="arrivalCity"
                  value={formData.arrivalCity}
                  onChange={(e) => setFormData({ ...formData, arrivalCity: e.target.value })}
                  placeholder="Lyon"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="arrivalAddress">Adresse</Label>
                <Input
                  id="arrivalAddress"
                  value={formData.arrivalAddress}
                  onChange={(e) => setFormData({ ...formData, arrivalAddress: e.target.value })}
                  placeholder="Destination"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="arrivalDate">Date *</Label>
                <Input
                  id="arrivalDate"
                  type="date"
                  value={formData.arrivalDate}
                  onChange={(e) => setFormData({ ...formData, arrivalDate: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="arrivalTime">Heure *</Label>
                <Input
                  id="arrivalTime"
                  type="time"
                  value={formData.arrivalTime}
                  onChange={(e) => setFormData({ ...formData, arrivalTime: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>

          {/* Capacité et tarifs */}
          <div className="space-y-4">
            <h3 className="font-semibold text-[#004645] border-b pb-2">💰 Capacité et tarifs</h3>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxCapacity">Capacité max *</Label>
                <Input
                  id="maxCapacity"
                  type="number"
                  min="1"
                  value={formData.maxCapacity}
                  onChange={(e) => setFormData({ ...formData, maxCapacity: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="costPerPerson">Coût par personne</Label>
                <Input
                  id="costPerPerson"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.costPerPerson}
                  onChange={(e) => setFormData({ ...formData, costPerPerson: e.target.value })}
                  placeholder="0.00"
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
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Statut initial</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Brouillon</SelectItem>
                  <SelectItem value="OPEN">Ouvert aux inscriptions</SelectItem>
                </SelectContent>
              </Select>
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
              disabled={loading}
              className="bg-[#009197] hover:bg-[#007d82] text-white"
            >
              {loading ? 'Création...' : 'Créer le manifeste'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
