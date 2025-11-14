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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Save, Loader2, Plus, Trash2, Users2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface SessionEditorProps {
  eventId: string
  session: any | null
  onClose: () => void
  onSave: () => void
}

const SESSION_TYPES = [
  { value: 'KEYNOTE', label: 'Discours inaugural', icon: '🎤', needsSpeakers: true, needsCapacity: true },
  { value: 'WORKSHOP', label: 'Atelier', icon: '🛠️', needsSpeakers: true, needsCapacity: true, needsMaterials: true },
  { value: 'CONFERENCE', label: 'Conférence', icon: '📊', needsSpeakers: true, needsCapacity: true },
  { value: 'TEAMBUILDING', label: 'Team Building', icon: '🤝', needsCapacity: true, needsEquipment: true },
  { value: 'MEAL', label: 'Repas', icon: '🍽️', needsCatering: true, needsCapacity: true },
  { value: 'BREAK', label: 'Pause', icon: '☕', needsCatering: true },
  { value: 'TRANSFER', label: 'Transfert', icon: '🚌', needsTransport: true },
  { value: 'ARRIVAL', label: 'Arrivée', icon: '🛬', needsTransport: true },
  { value: 'DEPARTURE', label: 'Départ', icon: '🛫', needsTransport: true },
  { value: 'FREE_TIME', label: 'Temps libre', icon: '🏖️' },
  { value: 'NETWORKING', label: 'Networking', icon: '🤝', needsCapacity: true },
  { value: 'TRAINING', label: 'Formation', icon: '📚', needsSpeakers: true, needsMaterials: true },
  { value: 'PANEL', label: 'Table ronde', icon: '💬', needsSpeakers: true, needsCapacity: true },
  { value: 'OTHER', label: 'Autre', icon: '📌' }
]

export function SessionEditor({ eventId, session, onClose, onSave }: SessionEditorProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'KEYNOTE',
    status: 'DRAFT',
    startTime: '',
    endTime: '',
    duration: 60,
    venue: '',
    room: '',
    address: '',
    capacity: null as number | null,
    minParticipants: null as number | null,
    requiresRegistration: false,
    requiresGroups: false,
    speakers: [] as any[],
    equipment: [] as string[],
    materials: '',
    catering: '',
    color: '#9333EA',
    isPublic: true,
    isHighlighted: false,
    notes: '',
    tags: [] as string[]
  })

  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [newSpeaker, setNewSpeaker] = useState({ name: '', title: '', bio: '', email: '' })
  const [newEquipment, setNewEquipment] = useState('')

  useEffect(() => {
    if (session) {
      setFormData({
        title: session.title || '',
        description: session.description || '',
        type: session.type || 'KEYNOTE',
        status: session.status || 'DRAFT',
        startTime: session.startTime ? new Date(session.startTime).toISOString().slice(0, 16) : '',
        endTime: session.endTime ? new Date(session.endTime).toISOString().slice(0, 16) : '',
        duration: session.duration || 60,
        venue: session.venue || '',
        room: session.room || '',
        address: session.address || '',
        capacity: session.capacity,
        minParticipants: session.minParticipants,
        requiresRegistration: session.requiresRegistration || false,
        requiresGroups: session.requiresGroups || false,
        speakers: session.speakers || [],
        equipment: session.equipment || [],
        materials: session.materials || '',
        catering: session.catering || '',
        color: session.color || '#9333EA',
        isPublic: session.isPublic ?? true,
        isHighlighted: session.isHighlighted || false,
        notes: session.notes || '',
        tags: session.tags || []
      })
    }
  }, [session])

  const selectedType = SESSION_TYPES.find(t => t.value === formData.type)

  const handleSave = async () => {
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
          endTime: new Date(formData.endTime).toISOString()
        })
      })

      if (response.ok) {
        onSave()
      }
    } catch (error) {
      console.error('Error saving session:', error)
    } finally {
      setSaving(false)
    }
  }

  const addSpeaker = () => {
    if (newSpeaker.name && newSpeaker.title) {
      setFormData(prev => ({
        ...prev,
        speakers: [...prev.speakers, newSpeaker]
      }))
      setNewSpeaker({ name: '', title: '', bio: '', email: '' })
    }
  }

  const removeSpeaker = (index: number) => {
    setFormData(prev => ({
      ...prev,
      speakers: prev.speakers.filter((_, i) => i !== index)
    }))
  }

  const addEquipment = () => {
    if (newEquipment) {
      setFormData(prev => ({
        ...prev,
        equipment: [...prev.equipment, newEquipment]
      }))
      setNewEquipment('')
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#004645]">
            {session ? 'Modifier la session' : 'Nouvelle session'}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-[#9CD9F6]/20">
            <TabsTrigger value="general">Général</TabsTrigger>
            <TabsTrigger value="location">Lieu</TabsTrigger>
            <TabsTrigger value="details">Détails</TabsTrigger>
            <TabsTrigger value="settings">Paramètres</TabsTrigger>
          </TabsList>

          {/* Tab: Général */}
          <TabsContent value="general" className="space-y-4 mt-4">
            <div>
              <Label htmlFor="title">Titre de la session *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Ex: Discours d'ouverture"
                className="border-[#9CD9F6]/30"
              />
            </div>

            <div>
              <Label htmlFor="type">Type de session *</Label>
              <Select value={formData.type} onValueChange={(v) => setFormData(prev => ({ ...prev, type: v }))}>
                <SelectTrigger className="border-[#9CD9F6]/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SESSION_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Description de la session..."
                className="border-[#9CD9F6]/30"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startTime">Début *</Label>
                <Input
                  id="startTime"
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                  className="border-[#9CD9F6]/30"
                />
              </div>
              <div>
                <Label htmlFor="endTime">Fin *</Label>
                <Input
                  id="endTime"
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                  className="border-[#9CD9F6]/30"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="duration">Durée (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                className="border-[#9CD9F6]/30"
              />
            </div>
          </TabsContent>

          {/* Tab: Lieu */}
          <TabsContent value="location" className="space-y-4 mt-4">
            <div>
              <Label htmlFor="venue">Lieu</Label>
              <Input
                id="venue"
                value={formData.venue}
                onChange={(e) => setFormData(prev => ({ ...prev, venue: e.target.value }))}
                placeholder="Ex: Hôtel Marriott"
                className="border-[#9CD9F6]/30"
              />
            </div>

            <div>
              <Label htmlFor="room">Salle</Label>
              <Input
                id="room"
                value={formData.room}
                onChange={(e) => setFormData(prev => ({ ...prev, room: e.target.value }))}
                placeholder="Ex: Salle Lumière"
                className="border-[#9CD9F6]/30"
              />
            </div>

            <div>
              <Label htmlFor="address">Adresse complète</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="123 Rue de la Paix, Paris"
                className="border-[#9CD9F6]/30"
              />
            </div>

            {selectedType?.needsCapacity && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="capacity">Capacité maximale</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={formData.capacity || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, capacity: parseInt(e.target.value) || null }))}
                    placeholder="100"
                    className="border-[#9CD9F6]/30"
                  />
                </div>
                <div>
                  <Label htmlFor="minParticipants">Participants minimum</Label>
                  <Input
                    id="minParticipants"
                    type="number"
                    value={formData.minParticipants || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, minParticipants: parseInt(e.target.value) || null }))}
                    placeholder="10"
                    className="border-[#9CD9F6]/30"
                  />
                </div>
              </div>
            )}
          </TabsContent>

          {/* Tab: Détails */}
          <TabsContent value="details" className="space-y-4 mt-4">
            {selectedType?.needsSpeakers && (
              <Card className="border-[#9CD9F6]/30">
                <CardContent className="pt-6">
                  <Label className="mb-3 block">Intervenants</Label>
                  <div className="space-y-3">
                    {formData.speakers.map((speaker, index) => (
                      <div key={index} className="flex items-start gap-2 p-3 bg-[#9CD9F6]/5 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-[#004645]">{speaker.name}</p>
                          <p className="text-sm text-[#004645]/70">{speaker.title}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeSpeaker(index)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <div className="space-y-2 p-3 border-2 border-dashed border-[#9CD9F6]/30 rounded-lg">
                      <Input
                        placeholder="Nom de l'intervenant"
                        value={newSpeaker.name}
                        onChange={(e) => setNewSpeaker(prev => ({ ...prev, name: e.target.value }))}
                        className="border-[#9CD9F6]/30"
                      />
                      <Input
                        placeholder="Titre/Fonction"
                        value={newSpeaker.title}
                        onChange={(e) => setNewSpeaker(prev => ({ ...prev, title: e.target.value }))}
                        className="border-[#9CD9F6]/30"
                      />
                      <Input
                        placeholder="Email (optionnel)"
                        value={newSpeaker.email}
                        onChange={(e) => setNewSpeaker(prev => ({ ...prev, email: e.target.value }))}
                        className="border-[#9CD9F6]/30"
                      />
                      <Button
                        onClick={addSpeaker}
                        variant="outline"
                        size="sm"
                        className="w-full border-[#009197] text-[#009197]"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Ajouter l&apos;intervenant
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {selectedType?.needsEquipment && (
              <Card className="border-[#9CD9F6]/30">
                <CardContent className="pt-6">
                  <Label className="mb-3 block">Équipements nécessaires</Label>
                  <div className="space-y-2">
                    {formData.equipment.map((eq, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="flex-1 p-2 bg-[#9CD9F6]/5 rounded">{eq}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setFormData(prev => ({
                            ...prev,
                            equipment: prev.equipment.filter((_, i) => i !== index)
                          }))}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <Input
                        placeholder="Ex: Projecteur, Micro, etc."
                        value={newEquipment}
                        onChange={(e) => setNewEquipment(e.target.value)}
                        className="border-[#9CD9F6]/30"
                      />
                      <Button onClick={addEquipment} variant="outline">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {selectedType?.needsMaterials && (
              <div>
                <Label htmlFor="materials">Matériel à fournir</Label>
                <Textarea
                  id="materials"
                  value={formData.materials}
                  onChange={(e) => setFormData(prev => ({ ...prev, materials: e.target.value }))}
                  placeholder="Liste du matériel nécessaire..."
                  className="border-[#9CD9F6]/30"
                />
              </div>
            )}

            {selectedType?.needsCatering && (
              <div>
                <Label htmlFor="catering">Restauration</Label>
                <Textarea
                  id="catering"
                  value={formData.catering}
                  onChange={(e) => setFormData(prev => ({ ...prev, catering: e.target.value }))}
                  placeholder="Détails de la restauration..."
                  className="border-[#9CD9F6]/30"
                />
              </div>
            )}

            <div>
              <Label htmlFor="notes">Notes internes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Notes pour l'organisation..."
                className="border-[#9CD9F6]/30"
              />
            </div>
          </TabsContent>

          {/* Tab: Paramètres */}
          <TabsContent value="settings" className="space-y-4 mt-4">
            <div className="flex items-center justify-between p-4 bg-[#9CD9F6]/5 rounded-lg">
              <div>
                <Label htmlFor="isPublic">Visible par les participants</Label>
                <p className="text-xs text-[#004645]/60">Afficher cette session dans le programme public</p>
              </div>
              <Switch
                id="isPublic"
                checked={formData.isPublic}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPublic: checked }))}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-[#9CD9F6]/5 rounded-lg">
              <div>
                <Label htmlFor="isHighlighted">Session mise en avant</Label>
                <p className="text-xs text-[#004645]/60">Mettre en évidence dans le programme</p>
              </div>
              <Switch
                id="isHighlighted"
                checked={formData.isHighlighted}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isHighlighted: checked }))}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-[#9CD9F6]/5 rounded-lg">
              <div>
                <Label htmlFor="requiresRegistration">Inscription obligatoire</Label>
                <p className="text-xs text-[#004645]/60">Les participants doivent s&apos;inscrire à cette session</p>
              </div>
              <Switch
                id="requiresRegistration"
                checked={formData.requiresRegistration}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, requiresRegistration: checked }))}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-[#FF4713]/5 rounded-lg border-2 border-[#FF4713]/20">
              <div className="flex-1">
                <Label htmlFor="requiresGroups" className="text-[#FF4713]">Nécessite des groupes</Label>
                <p className="text-xs text-[#004645]/60">Pour workshops, team building ou activités parallèles</p>
              </div>
              <div className="flex items-center gap-2">
                {session?.id && formData.requiresGroups && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/admin/events/${eventId}/groups/${session.id}`)}
                    className="border-[#FF4713] text-[#FF4713] hover:bg-[#FF4713]/10"
                  >
                    <Users2 className="h-4 w-4 mr-2" />
                    Gérer les groupes
                  </Button>
                )}
                <Switch
                  id="requiresGroups"
                  checked={formData.requiresGroups}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, requiresGroups: checked }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="status">Statut</Label>
              <Select value={formData.status} onValueChange={(v) => setFormData(prev => ({ ...prev, status: v }))}>
                <SelectTrigger className="border-[#9CD9F6]/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Brouillon</SelectItem>
                  <SelectItem value="PUBLISHED">Publié</SelectItem>
                  <SelectItem value="ONGOING">En cours</SelectItem>
                  <SelectItem value="COMPLETED">Terminé</SelectItem>
                  <SelectItem value="CANCELLED">Annulé</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="color">Couleur</Label>
              <div className="flex gap-2 items-center">
                <Input
                  id="color"
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  className="w-16 h-10 p-1 border-[#9CD9F6]/30"
                />
                <Input
                  value={formData.color}
                  onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  className="flex-1 border-[#9CD9F6]/30"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !formData.title || !formData.startTime || !formData.endTime}
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
                Sauvegarder
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
