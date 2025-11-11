'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import {
  Users,
  MapPin,
  Calendar,
  DollarSign,
  UserPlus,
  UserMinus,
  AlertTriangle,
  Bus,
  Plane,
  Train
} from 'lucide-react'

interface Guest {
  id: string
  firstName: string
  lastName: string
  email: string
}

interface Participant {
  id: string
  seatNumber?: string | null
  confirmedAt?: Date | null
  guest: Guest
}

interface TransportManifest {
  id: string
  type: string
  name: string
  description?: string | null
  departure: any
  arrival: any
  maxCapacity: number
  currentCount: number
  costPerPerson?: number | null
  currency: string
  status: string
  participants: Participant[]
}

interface TransportManifestDetailsDialogProps {
  eventId: string
  manifestId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

const statusColors = {
  DRAFT: 'bg-gray-100 text-gray-800',
  OPEN: 'bg-blue-100 text-blue-800',
  FULL: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-green-100 text-green-800',
  DEPARTED: 'bg-purple-100 text-purple-800',
  COMPLETED: 'bg-purple-100 text-purple-800',
  CANCELLED: 'bg-red-100 text-red-800',
}

const statusLabels = {
  DRAFT: 'Brouillon',
  OPEN: 'Ouvert',
  FULL: 'Complet',
  CONFIRMED: 'Confirmé',
  DEPARTED: 'Parti',
  COMPLETED: 'Terminé',
  CANCELLED: 'Annulé',
}

const typeIcons = {
  SHUTTLE: Bus,
  TRAIN: Train,
  FLIGHT: Plane,
}

export function TransportManifestDetailsDialog({
  eventId,
  manifestId,
  open,
  onOpenChange,
  onSuccess
}: TransportManifestDetailsDialogProps) {
  const [manifest, setManifest] = useState<TransportManifest | null>(null)
  const [loading, setLoading] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showRemoveDialog, setShowRemoveDialog] = useState(false)
  const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(null)

  // Pour ajouter un participant
  const [availableGuests, setAvailableGuests] = useState<Guest[]>([])
  const [selectedGuestId, setSelectedGuestId] = useState('')
  const [seatNumber, setSeatNumber] = useState('')

  const fetchManifest = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/events/${eventId}/transport/manifests/${manifestId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch manifest')
      }
      const data = await response.json()
      setManifest(data.manifest)
    } catch (error) {
      console.error('Error fetching manifest:', error)
      toast.error('Erreur lors du chargement du manifeste')
    } finally {
      setLoading(false)
    }
  }, [eventId, manifestId])

  const fetchAvailableGuests = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/events/${eventId}/guests`)
      if (!response.ok) {
        throw new Error('Failed to fetch guests')
      }
      const data = await response.json()
      setAvailableGuests(data.guests || [])
    } catch (error) {
      console.error('Error fetching guests:', error)
    }
  }, [eventId])

  useEffect(() => {
    if (open && manifestId) {
      fetchManifest()
      fetchAvailableGuests()
    }
  }, [open, manifestId, fetchManifest, fetchAvailableGuests])

  const handleAddParticipant = async () => {
    if (!selectedGuestId) {
      toast.error('Veuillez sélectionner un invité')
      return
    }

    try {
      const response = await fetch(
        `/api/admin/events/${eventId}/transport/manifests/${manifestId}/participants`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            guestId: selectedGuestId,
            seatNumber: seatNumber || undefined
          })
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to add participant')
      }

      toast.success('Participant ajouté au manifeste')
      setShowAddDialog(false)
      setSelectedGuestId('')
      setSeatNumber('')
      fetchManifest()
      if (onSuccess) onSuccess()
    } catch (error) {
      console.error('Error adding participant:', error)
      toast.error(error instanceof Error ? error.message : 'Erreur lors de l\'ajout')
    }
  }

  const handleRemoveParticipant = async () => {
    if (!selectedParticipantId) return

    try {
      const response = await fetch(
        `/api/admin/events/${eventId}/transport/manifests/${manifestId}/participants?participantId=${selectedParticipantId}`,
        {
          method: 'DELETE'
        }
      )

      if (!response.ok) {
        throw new Error('Failed to remove participant')
      }

      toast.success('Participant retiré du manifeste')
      setShowRemoveDialog(false)
      setSelectedParticipantId(null)
      fetchManifest()
      if (onSuccess) onSuccess()
    } catch (error) {
      console.error('Error removing participant:', error)
      toast.error('Erreur lors de la suppression')
    }
  }

  if (!manifest) {
    return null
  }

  const Icon = typeIcons[manifest.type as keyof typeof typeIcons] || Bus
  const participantIds = new Set(manifest.participants.map(p => p.guest.id))
  const guestsNotInManifest = availableGuests.filter(g => !participantIds.has(g.id))
  const isFull = manifest.currentCount >= manifest.maxCapacity

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#009197]/10">
                  <Icon className="h-6 w-6 text-[#009197]" />
                </div>
                <div>
                  <DialogTitle className="text-[#004645]">{manifest.name}</DialogTitle>
                  {manifest.description && (
                    <DialogDescription>{manifest.description}</DialogDescription>
                  )}
                </div>
              </div>
              <Badge className={statusColors[manifest.status as keyof typeof statusColors]}>
                {statusLabels[manifest.status as keyof typeof statusLabels]}
              </Badge>
            </div>
          </DialogHeader>

          <div className="space-y-6">
            {/* Stats rapides */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="border-[#9CD9F6]/30">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-[#009197]" />
                    <div>
                      <p className="text-sm text-muted-foreground">Participants</p>
                      <p className="text-2xl font-bold text-[#004645]">
                        {manifest.currentCount}/{manifest.maxCapacity}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-[#9CD9F6]/30">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-[#009197]" />
                    <div>
                      <p className="text-sm text-muted-foreground">Trajet</p>
                      <p className="text-sm font-semibold text-[#004645]">
                        {manifest.departure?.city || 'N/A'} → {manifest.arrival?.city || 'N/A'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-[#9CD9F6]/30">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-[#FF4713]" />
                    <div>
                      <p className="text-sm text-muted-foreground">Coût/pers.</p>
                      <p className="text-lg font-bold text-[#FF4713]">
                        {manifest.costPerPerson ? `${manifest.costPerPerson} ${manifest.currency}` : 'Gratuit'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Détails du trajet */}
            <div className="grid grid-cols-2 gap-6">
              {/* Départ */}
              <div className="space-y-2">
                <h3 className="font-semibold text-[#004645] flex items-center gap-2">
                  📍 Départ
                </h3>
                <div className="text-sm space-y-1 pl-6">
                  {manifest.departure?.city && (
                    <p><strong>Ville:</strong> {manifest.departure.city}</p>
                  )}
                  {manifest.departure?.address && (
                    <p><strong>Adresse:</strong> {manifest.departure.address}</p>
                  )}
                  {manifest.departure?.date && (
                    <p className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(manifest.departure.date).toLocaleDateString('fr-FR')} à {manifest.departure.time}
                    </p>
                  )}
                </div>
              </div>

              {/* Arrivée */}
              <div className="space-y-2">
                <h3 className="font-semibold text-[#004645] flex items-center gap-2">
                  🎯 Arrivée
                </h3>
                <div className="text-sm space-y-1 pl-6">
                  {manifest.arrival?.city && (
                    <p><strong>Ville:</strong> {manifest.arrival.city}</p>
                  )}
                  {manifest.arrival?.address && (
                    <p><strong>Adresse:</strong> {manifest.arrival.address}</p>
                  )}
                  {manifest.arrival?.date && (
                    <p className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(manifest.arrival.date).toLocaleDateString('fr-FR')} à {manifest.arrival.time}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Liste des participants */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-[#004645] flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Liste des participants ({manifest.participants.length})
                </h3>
                <Button
                  size="sm"
                  onClick={() => setShowAddDialog(true)}
                  disabled={isFull}
                  className="bg-[#009197] hover:bg-[#007d82] text-white"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Ajouter
                </Button>
              </div>

              {isFull && (
                <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                  <AlertTriangle className="h-4 w-4" />
                  Le manifeste est complet
                </div>
              )}

              {manifest.participants.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-2 opacity-30" />
                  <p>Aucun participant pour le moment</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {manifest.participants.map((participant, index) => (
                    <div
                      key={participant.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#009197]/10 flex items-center justify-center text-sm font-semibold text-[#009197]">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-[#004645]">
                            {participant.guest.firstName} {participant.guest.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">{participant.guest.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {participant.seatNumber && (
                          <Badge variant="secondary" className="text-xs">
                            Siège {participant.seatNumber}
                          </Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedParticipantId(participant.id)
                            setShowRemoveDialog(true)
                          }}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <UserMinus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog pour ajouter un participant */}
      <AlertDialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ajouter un participant</AlertDialogTitle>
            <AlertDialogDescription>
              Sélectionnez un invité à ajouter au manifeste
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Invité</label>
              <Select value={selectedGuestId} onValueChange={setSelectedGuestId}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un invité..." />
                </SelectTrigger>
                <SelectContent>
                  {guestsNotInManifest.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground text-center">
                      Tous les invités sont déjà dans ce manifeste
                    </div>
                  ) : (
                    guestsNotInManifest.map((guest) => (
                      <SelectItem key={guest.id} value={guest.id}>
                        {guest.firstName} {guest.lastName}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Numéro de siège (optionnel)</label>
              <input
                type="text"
                value={seatNumber}
                onChange={(e) => setSeatNumber(e.target.value)}
                placeholder="Ex: A12"
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAddParticipant}
              className="bg-[#009197] hover:bg-[#007d82]"
            >
              Ajouter
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog pour retirer un participant */}
      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Retirer le participant</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir retirer ce participant du manifeste ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveParticipant}
              className="bg-red-600 hover:bg-red-700"
            >
              Retirer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
