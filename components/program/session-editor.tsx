"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Save, Loader2, Users2, AlertCircle } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface SessionEditorProps {
  eventId: string
  session: any | null
  onClose: () => void
  onSave: () => void
}

const SESSION_TYPES = [
  { value: 'KEYNOTE', label: 'Keynote', icon: '🎤' },
  { value: 'WORKSHOP', label: 'Atelier', icon: '🛠️' },
  { value: 'CONFERENCE', label: 'Conférence', icon: '📊' },
  { value: 'TEAMBUILDING', label: 'Team Building', icon: '🤝' },
  { value: 'MEAL', label: 'Repas', icon: '🍽️' },
  { value: 'BREAK', label: 'Pause', icon: '☕' },
  { value: 'NETWORKING', label: 'Networking', icon: '🤝' },
]

export function SessionEditor({ eventId, session, onClose, onSave }: SessionEditorProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'CONFERENCE',
    startTime: '',
    endTime: '',
    venue: '',
    room: '',
    capacity: undefined as number | undefined,
    requiresGroups: false,
  })

  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (session) {
      setFormData({
        title: session.title || '',
        description: session.description || '',
        type: session.type || 'CONFERENCE',
        startTime: session.startTime ? new Date(session.startTime).toISOString().slice(0, 16) : '',
        endTime: session.endTime ? new Date(session.endTime).toISOString().slice(0, 16) : '',
        venue: session.venue || '',
        room: session.room || '',
        capacity: session.capacity || undefined,
        requiresGroups: session.requiresGroups || false,
      })
    }
  }, [session])

  const handleSave = async () => {
    // Validation
    if (!formData.title || !formData.startTime || !formData.endTime) {
      toast({
        title: 'Champs requis manquants',
        description: 'Veuillez remplir le titre, la date de début et la date de fin',
        variant: 'destructive'
      })
      return
    }

    setSaving(true)

    try {
      const url = session
        ? `/api/admin/events/${eventId}/sessions/${session.id}`
        : `/api/admin/events/${eventId}/sessions`

      const response = await fetch(url, {
        method: session ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          startTime: new Date(formData.startTime).toISOString(),
          endTime: new Date(formData.endTime).toISOString(),
          // Calculate duration in minutes
          duration: Math.round((new Date(formData.endTime).getTime() - new Date(formData.startTime).getTime()) / 60000)
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erreur lors de la sauvegarde')
      }

      toast({
        title: 'Session sauvegardée',
        description: `La session "${formData.title}" a été ${session ? 'mise à jour' : 'créée'} avec succès`
      })

      onSave()
      onClose()
    } catch (error) {
      console.error('Error saving session:', error)
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Impossible de sauvegarder la session',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  const selectedType = SESSION_TYPES.find(t => t.value === formData.type)

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#004645] text-2xl">
            {session ? '✏️ Modifier la session' : '➕ Nouvelle session'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Type de session */}
          <div className="space-y-2">
            <Label htmlFor="type" className="text-base font-semibold">Type de session *</Label>
            <Select value={formData.type} onValueChange={(v) => setFormData(prev => ({ ...prev, type: v }))}>
              <SelectTrigger className="border-[#9CD9F6]/30 h-12 text-base">
                <SelectValue>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{selectedType?.icon}</span>
                    <span>{selectedType?.label}</span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {SESSION_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{type.icon}</span>
                      <span>{type.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Titre */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-base font-semibold">Titre *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Ex: Keynote d'ouverture, Atelier innovation..."
              className="border-[#9CD9F6]/30 h-12 text-base"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-base font-semibold">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Décrivez brièvement cette session..."
              className="border-[#9CD9F6]/30 min-h-[100px]"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime" className="text-base font-semibold">Début *</Label>
              <Input
                id="startTime"
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                className="border-[#9CD9F6]/30 h-12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime" className="text-base font-semibold">Fin *</Label>
              <Input
                id="endTime"
                type="datetime-local"
                value={formData.endTime}
                onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                className="border-[#9CD9F6]/30 h-12"
              />
            </div>
          </div>

          {/* Lieu */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="venue" className="text-base font-semibold">Lieu</Label>
              <Input
                id="venue"
                value={formData.venue}
                onChange={(e) => setFormData(prev => ({ ...prev, venue: e.target.value }))}
                placeholder="Ex: Hôtel Marriott"
                className="border-[#9CD9F6]/30 h-12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="room" className="text-base font-semibold">Salle</Label>
              <Input
                id="room"
                value={formData.room}
                onChange={(e) => setFormData(prev => ({ ...prev, room: e.target.value }))}
                placeholder="Ex: Salle Lumière"
                className="border-[#9CD9F6]/30 h-12"
              />
            </div>
          </div>

          {/* Capacité */}
          <div className="space-y-2">
            <Label htmlFor="capacity" className="text-base font-semibold">Capacité maximale</Label>
            <Input
              id="capacity"
              type="number"
              value={formData.capacity || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                capacity: e.target.value ? parseInt(e.target.value) : undefined
              }))}
              placeholder="Ex: 50"
              className="border-[#9CD9F6]/30 h-12"
            />
          </div>

          {/* Groupes */}
          <div className="p-4 bg-[#FF4713]/5 rounded-lg border-2 border-[#FF4713]/20 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Users2 className="h-5 w-5 text-[#FF4713]" />
                  <Label htmlFor="requiresGroups" className="text-[#FF4713] text-base font-semibold cursor-pointer">
                    Session avec groupes
                  </Label>
                </div>
                <p className="text-xs text-[#004645]/60 mt-1">
                  Pour ateliers, team building ou activités en petits groupes
                </p>
              </div>
              <Switch
                id="requiresGroups"
                checked={formData.requiresGroups}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, requiresGroups: checked }))}
                className="data-[state=checked]:bg-[#FF4713]"
              />
            </div>

            {formData.requiresGroups && session?.id && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => router.push(`/admin/events/${eventId}/groups/${session.id}`)}
                className="w-full border-[#FF4713] text-[#FF4713] hover:bg-[#FF4713]/10"
              >
                <Users2 className="h-4 w-4 mr-2" />
                Gérer les groupes de cette session
              </Button>
            )}

            {formData.requiresGroups && !session?.id && (
              <div className="flex items-start gap-2 text-xs text-[#FF4713]">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>Sauvegardez d&apos;abord la session pour pouvoir créer des groupes</span>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={saving}
          >
            Annuler
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="bg-[#FF4713] hover:bg-[#FF6B3D] text-white"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sauvegarde...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {session ? 'Mettre à jour' : 'Créer la session'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
