'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Users,
  Search,
  UserPlus,
  UserMinus,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle
} from 'lucide-react'
import { toast } from 'sonner'

interface Guest {
  id: string
  firstName: string
  lastName: string
  email: string
  company?: string
}

interface Participant {
  id: string
  guestId: string
  status: string
  waitlistPosition?: number
  guest: Guest
}

interface Session {
  id: string
  title: string
  capacity?: number
  participantCount: number
  availableSpots?: number
}

interface SessionParticipantsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  eventId: string
  session: Session
  onSuccess?: () => void
}

const statusLabels: Record<string, string> = {
  registered: 'Inscrit',
  confirmed: 'Confirmé',
  waitlist: 'Liste d\'attente',
  cancelled: 'Annulé',
  attended: 'Présent',
}

const statusColors: Record<string, string> = {
  registered: 'bg-blue-500',
  confirmed: 'bg-green-500',
  waitlist: 'bg-yellow-500',
  cancelled: 'bg-red-500',
  attended: 'bg-purple-500',
}

const statusIcons: Record<string, any> = {
  registered: UserPlus,
  confirmed: CheckCircle2,
  waitlist: Clock,
  cancelled: XCircle,
  attended: CheckCircle2,
}

export function SessionParticipantsDialog({
  open,
  onOpenChange,
  eventId,
  session,
  onSuccess
}: SessionParticipantsDialogProps) {
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [allGuests, setAllGuests] = useState<Guest[]>([])
  const [participants, setParticipants] = useState<Participant[]>([])
  const [selectedGuests, setSelectedGuests] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (open) {
      fetchGuests()
      fetchParticipants()
    }
  }, [open, eventId, session.id])

  const fetchGuests = async () => {
    try {
      const response = await fetch(`/api/admin/events/${eventId}/guests`)
      if (response.ok) {
        const data = await response.json()
        setAllGuests(data.guests || [])
      }
    } catch (error) {
      console.error('Error fetching guests:', error)
      toast.error('Erreur lors du chargement des invités')
    }
  }

  const fetchParticipants = async () => {
    try {
      const response = await fetch(`/api/admin/events/${eventId}/sessions/${session.id}`)
      if (response.ok) {
        const data = await response.json()
        setParticipants(data.session?.participants || [])
      }
    } catch (error) {
      console.error('Error fetching participants:', error)
    }
  }

  const handleAddParticipants = async () => {
    if (selectedGuests.size === 0) {
      toast.error('Veuillez sélectionner au moins un invité')
      return
    }

    setLoading(true)
    try {
      // Check if adding would exceed capacity
      const currentCount = participants.length
      const capacity = session.capacity
      const spotsNeeded = selectedGuests.size
      const isOverCapacity = capacity && (currentCount + spotsNeeded) > capacity

      const response = await fetch(
        `/api/admin/events/${eventId}/sessions/${session.id}/participants`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            guestIds: Array.from(selectedGuests),
            status: isOverCapacity ? 'waitlist' : 'registered',
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'ajout')
      }

      toast.success(data.message || 'Participants ajoutés avec succès')
      setSelectedGuests(new Set())
      fetchParticipants()
      if (onSuccess) onSuccess()
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de l\'ajout des participants')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveParticipant = async (participantId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir retirer ce participant ?')) {
      return
    }

    try {
      const response = await fetch(
        `/api/admin/events/${eventId}/sessions/${session.id}/participants?participantId=${participantId}`,
        { method: 'DELETE' }
      )

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erreur lors du retrait')
      }

      toast.success('Participant retiré avec succès')
      fetchParticipants()
      if (onSuccess) onSuccess()
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors du retrait du participant')
    }
  }

  const handleUpdateParticipantStatus = async (participantId: string, newStatus: string) => {
    try {
      const response = await fetch(
        `/api/admin/events/${eventId}/sessions/${session.id}/participants`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            participantId,
            status: newStatus,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la mise à jour')
      }

      toast.success('Statut mis à jour')
      fetchParticipants()
      if (onSuccess) onSuccess()
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la mise à jour')
    }
  }

  const toggleGuestSelection = (guestId: string) => {
    const newSelection = new Set(selectedGuests)
    if (newSelection.has(guestId)) {
      newSelection.delete(guestId)
    } else {
      newSelection.add(guestId)
    }
    setSelectedGuests(newSelection)
  }

  // Filter guests based on search
  const filteredGuests = allGuests.filter((guest) => {
    const searchLower = searchQuery.toLowerCase()
    return (
      guest.firstName.toLowerCase().includes(searchLower) ||
      guest.lastName.toLowerCase().includes(searchLower) ||
      guest.email.toLowerCase().includes(searchLower) ||
      guest.company?.toLowerCase().includes(searchLower)
    )
  })

  // Split guests into participants and available
  const participantGuestIds = new Set(participants.map((p) => p.guestId))
  const availableGuests = filteredGuests.filter((g) => !participantGuestIds.has(g.id))

  // Calculate stats
  const confirmedCount = participants.filter((p) => p.status === 'confirmed' || p.status === 'attended').length
  const registeredCount = participants.filter((p) => p.status === 'registered').length
  const waitlistCount = participants.filter((p) => p.status === 'waitlist').length
  const spotsRemaining = session.capacity ? Math.max(0, session.capacity - participants.length + waitlistCount) : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Gérer les participants - {session.title}
          </DialogTitle>
          <DialogDescription>
            Ajoutez ou retirez des participants pour cette session
          </DialogDescription>
        </DialogHeader>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2">
          <Card>
            <CardContent className="p-3">
              <div className="text-xs text-muted-foreground">Inscrits</div>
              <div className="text-2xl font-bold">{registeredCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <div className="text-xs text-muted-foreground">Confirmés</div>
              <div className="text-2xl font-bold">{confirmedCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <div className="text-xs text-muted-foreground">Liste d&apos;attente</div>
              <div className="text-2xl font-bold">{waitlistCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <div className="text-xs text-muted-foreground">Places restantes</div>
              <div className="text-2xl font-bold">
                {spotsRemaining !== null ? spotsRemaining : '∞'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Capacity Warning */}
        {session.capacity && participants.length >= session.capacity && (
          <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <span className="text-sm text-yellow-800">
              Session complète. Les nouveaux participants seront ajoutés à la liste d&apos;attente.
            </span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
          {/* Current Participants */}
          <div className="space-y-2 flex flex-col min-h-0">
            <h3 className="font-semibold flex items-center gap-2">
              <Users className="h-4 w-4" />
              Participants actuels ({participants.length})
            </h3>
            <ScrollArea className="flex-1 border rounded-md p-2">
              {participants.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Aucun participant</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {participants.map((participant) => {
                    const StatusIcon = statusIcons[participant.status]
                    return (
                      <Card key={participant.id} className="p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-medium">
                              {participant.guest.firstName} {participant.guest.lastName}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {participant.guest.email}
                            </div>
                            {participant.guest.company && (
                              <div className="text-xs text-muted-foreground">
                                {participant.guest.company}
                              </div>
                            )}
                            <div className="mt-1 flex items-center gap-2">
                              <Badge className={`text-xs ${statusColors[participant.status]}`}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {statusLabels[participant.status]}
                              </Badge>
                              {participant.status === 'waitlist' && participant.waitlistPosition && (
                                <span className="text-xs text-muted-foreground">
                                  Position #{participant.waitlistPosition}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            {participant.status === 'registered' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleUpdateParticipantStatus(participant.id, 'confirmed')}
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveParticipant(participant.id)}
                            >
                              <UserMinus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    )
                  })}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Available Guests */}
          <div className="space-y-2 flex flex-col min-h-0">
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Ajouter des participants ({availableGuests.length} disponibles)
              </h3>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un invité..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <ScrollArea className="flex-1 border rounded-md p-2">
              {availableGuests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">
                    {searchQuery ? 'Aucun invité trouvé' : 'Tous les invités sont déjà participants'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {availableGuests.map((guest) => (
                    <Card
                      key={guest.id}
                      className={`p-3 cursor-pointer transition-colors ${
                        selectedGuests.has(guest.id)
                          ? 'border-primary bg-primary/5'
                          : 'hover:border-primary/50'
                      }`}
                      onClick={() => toggleGuestSelection(guest.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-medium">
                            {guest.firstName} {guest.lastName}
                          </div>
                          <div className="text-xs text-muted-foreground">{guest.email}</div>
                          {guest.company && (
                            <div className="text-xs text-muted-foreground">{guest.company}</div>
                          )}
                        </div>
                        {selectedGuests.has(guest.id) && (
                          <CheckCircle2 className="h-5 w-5 text-primary" />
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
            {selectedGuests.size > 0 && (
              <Button onClick={handleAddParticipants} disabled={loading} className="w-full">
                <UserPlus className="h-4 w-4 mr-2" />
                Ajouter {selectedGuests.size} participant{selectedGuests.size > 1 ? 's' : ''}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
