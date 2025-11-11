'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, MapPin, Users, Tag, X } from 'lucide-react'
import { toast } from 'sonner'

interface SessionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  eventId: string
  session?: any
  onSuccess?: () => void
}

const sessionTypes = [
  { value: 'KEYNOTE', label: 'Keynote', color: 'bg-purple-500' },
  { value: 'WORKSHOP', label: 'Workshop', color: 'bg-blue-500' },
  { value: 'CONFERENCE', label: 'Conférence', color: 'bg-indigo-500' },
  { value: 'TEAMBUILDING', label: 'Teambuilding', color: 'bg-green-500' },
  { value: 'MEAL', label: 'Repas', color: 'bg-orange-500' },
  { value: 'BREAK', label: 'Pause', color: 'bg-yellow-500' },
  { value: 'TRANSFER', label: 'Transfert', color: 'bg-gray-500' },
  { value: 'ARRIVAL', label: 'Arrivée', color: 'bg-teal-500' },
  { value: 'DEPARTURE', label: 'Départ', color: 'bg-red-500' },
  { value: 'FREE_TIME', label: 'Temps libre', color: 'bg-cyan-500' },
  { value: 'NETWORKING', label: 'Networking', color: 'bg-pink-500' },
  { value: 'TRAINING', label: 'Formation', color: 'bg-emerald-500' },
  { value: 'PANEL', label: 'Panel', color: 'bg-violet-500' },
  { value: 'OTHER', label: 'Autre', color: 'bg-slate-500' },
]

const sessionStatuses = [
  { value: 'DRAFT', label: 'Brouillon' },
  { value: 'PUBLISHED', label: 'Publié' },
  { value: 'ONGOING', label: 'En cours' },
  { value: 'COMPLETED', label: 'Terminé' },
  { value: 'CANCELLED', label: 'Annulé' },
]

export function SessionDialog({ open, onOpenChange, eventId, session, onSuccess }: SessionDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'WORKSHOP',
    status: 'DRAFT',
    startTime: '',
    endTime: '',
    venue: '',
    room: '',
    capacity: '',
    minParticipants: '',
    requiresRegistration: false,
    registrationDeadline: '',
    isPublic: true,
    isHighlighted: false,
    color: '',
    icon: '',
    tags: [] as string[],
    notes: '',
  })
  const [newTag, setNewTag] = useState('')

  useEffect(() => {
    if (session) {
      setFormData({
        title: session.title || '',
        description: session.description || '',
        type: session.type || 'WORKSHOP',
        status: session.status || 'DRAFT',
        startTime: session.startTime ? new Date(session.startTime).toISOString().slice(0, 16) : '',
        endTime: session.endTime ? new Date(session.endTime).toISOString().slice(0, 16) : '',
        venue: session.venue || '',
        room: session.room || '',
        capacity: session.capacity?.toString() || '',
        minParticipants: session.minParticipants?.toString() || '',
        requiresRegistration: session.requiresRegistration || false,
        registrationDeadline: session.registrationDeadline
          ? new Date(session.registrationDeadline).toISOString().slice(0, 16)
          : '',
        isPublic: session.isPublic !== undefined ? session.isPublic : true,
        isHighlighted: session.isHighlighted || false,
        color: session.color || '',
        icon: session.icon || '',
        tags: session.tags || [],
        notes: session.notes || '',
      })
    } else {
      // Reset form for new session
      setFormData({
        title: '',
        description: '',
        type: 'WORKSHOP',
        status: 'DRAFT',
        startTime: '',
        endTime: '',
        venue: '',
        room: '',
        capacity: '',
        minParticipants: '',
        requiresRegistration: false,
        registrationDeadline: '',
        isPublic: true,
        isHighlighted: false,
        color: '',
        icon: '',
        tags: [],
        notes: '',
      })
    }
  }, [session, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload = {
        title: formData.title,
        description: formData.description || undefined,
        type: formData.type,
        status: formData.status,
        startTime: formData.startTime,
        endTime: formData.endTime,
        venue: formData.venue || undefined,
        room: formData.room || undefined,
        capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
        minParticipants: formData.minParticipants ? parseInt(formData.minParticipants) : undefined,
        requiresRegistration: formData.requiresRegistration,
        registrationDeadline: formData.registrationDeadline || undefined,
        isPublic: formData.isPublic,
        isHighlighted: formData.isHighlighted,
        color: formData.color || undefined,
        icon: formData.icon || undefined,
        tags: formData.tags,
        notes: formData.notes || undefined,
      }

      const url = session
        ? `/api/admin/events/${eventId}/sessions/${session.id}`
        : `/api/admin/events/${eventId}/sessions`

      const method = session ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la sauvegarde')
      }

      toast.success(session ? 'Session mise à jour' : 'Session créée')
      onOpenChange(false)
      if (onSuccess) onSuccess()
    } catch (error: any) {
      toast.error(error.message || 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, newTag.trim()] })
      setNewTag('')
    }
  }

  const removeTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter((t) => t !== tag) })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{session ? 'Modifier la session' : 'Créer une session'}</DialogTitle>
          <DialogDescription>
            {session
              ? 'Modifiez les détails de la session'
              : 'Créez une nouvelle session pour votre événement'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Titre *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ex: Workshop Leadership"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Décrivez le contenu de la session..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Type *</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sessionTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${type.color}`} />
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status">Statut</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sessionStatuses.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div className="space-y-4">
            <Label className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Horaires *
            </Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startTime" className="text-sm text-muted-foreground">
                  Début
                </Label>
                <Input
                  id="startTime"
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="endTime" className="text-sm text-muted-foreground">
                  Fin
                </Label>
                <Input
                  id="endTime"
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <Label className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Lieu
            </Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="venue" className="text-sm text-muted-foreground">
                  Venue
                </Label>
                <Input
                  id="venue"
                  value={formData.venue}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  placeholder="Ex: Hôtel Marriott"
                />
              </div>

              <div>
                <Label htmlFor="room" className="text-sm text-muted-foreground">
                  Salle
                </Label>
                <Input
                  id="room"
                  value={formData.room}
                  onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                  placeholder="Ex: Salle Lumière"
                />
              </div>
            </div>
          </div>

          {/* Capacity */}
          <div className="space-y-4">
            <Label className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Capacité
            </Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="capacity" className="text-sm text-muted-foreground">
                  Capacité maximale
                </Label>
                <Input
                  id="capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  placeholder="Ex: 30"
                  min="1"
                />
              </div>

              <div>
                <Label htmlFor="minParticipants" className="text-sm text-muted-foreground">
                  Minimum participants
                </Label>
                <Input
                  id="minParticipants"
                  type="number"
                  value={formData.minParticipants}
                  onChange={(e) => setFormData({ ...formData, minParticipants: e.target.value })}
                  placeholder="Ex: 5"
                  min="1"
                />
              </div>
            </div>
          </div>

          {/* Registration */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="requiresRegistration">Inscription requise</Label>
              <Switch
                id="requiresRegistration"
                checked={formData.requiresRegistration}
                onCheckedChange={(checked) => setFormData({ ...formData, requiresRegistration: checked })}
              />
            </div>

            {formData.requiresRegistration && (
              <div>
                <Label htmlFor="registrationDeadline">Date limite d&apos;inscription</Label>
                <Input
                  id="registrationDeadline"
                  type="datetime-local"
                  value={formData.registrationDeadline}
                  onChange={(e) => setFormData({ ...formData, registrationDeadline: e.target.value })}
                />
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="space-y-4">
            <Label className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Tags
            </Label>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Ajouter un tag"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addTag()
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={addTag}>
                Ajouter
              </Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="ml-1">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Visibility */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="isPublic">Visible par les participants</Label>
              <Switch
                id="isPublic"
                checked={formData.isPublic}
                onCheckedChange={(checked) => setFormData({ ...formData, isPublic: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="isHighlighted">Mettre en avant</Label>
              <Switch
                id="isHighlighted"
                checked={formData.isHighlighted}
                onCheckedChange={(checked) => setFormData({ ...formData, isHighlighted: checked })}
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes internes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Notes pour les organisateurs..."
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Enregistrement...' : session ? 'Mettre à jour' : 'Créer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
