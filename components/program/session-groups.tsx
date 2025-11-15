"use client"

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Plus,
  Edit2,
  Trash2,
  Users,
  AlertCircle,
  Shuffle,
  X,
  UserCog
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { ParticipantGroupAssignment } from './participant-group-assignment'
import { createClientLogger, getUserErrorMessage } from '@/lib/client-logger'

const logger = createClientLogger({ component: 'SessionGroups' })

interface SessionGroup {
  id: string
  name: string
  description?: string
  color?: string
  capacity?: number
  order: number
  _count?: {
    participants: number
  }
}

interface SessionGroupsProps {
  sessionId: string
  eventId: string
  isOpen: boolean
  onClose: () => void
}

export function SessionGroups({ sessionId, eventId, isOpen, onClose }: SessionGroupsProps) {
  const [groups, setGroups] = useState<SessionGroup[]>([])
  const [loading, setLoading] = useState(false)
  const [editingGroup, setEditingGroup] = useState<SessionGroup | null>(null)
  const [creatingGroup, setCreatingGroup] = useState(false)
  const [showParticipantAssignment, setShowParticipantAssignment] = useState(false)
  const { toast } = useToast()

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3B82F6',
    capacity: undefined as number | undefined,
  })

  const loadGroups = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/events/${eventId}/sessions/${sessionId}/groups`)
      if (response.ok) {
        const data = await response.json()
        setGroups(data.groups || [])
      }
    } catch (error) {
      logger.error(error, { action: 'loadGroups', metadata: { sessionId, eventId } })
      toast({
        title: 'Erreur',
        description: getUserErrorMessage(error),
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [eventId, sessionId, toast])

  useEffect(() => {
    if (isOpen) {
      loadGroups()
    }
  }, [isOpen, loadGroups])

  const handleCreateGroup = async () => {
    if (!formData.name.trim()) {
      toast({
        title: 'Erreur',
        description: 'Le nom du groupe est requis',
        variant: 'destructive',
      })
      return
    }

    try {
      const response = await fetch(`/api/admin/events/${eventId}/sessions/${sessionId}/groups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          order: groups.length,
        }),
      })

      if (response.ok) {
        toast({
          title: 'Succès',
          description: 'Groupe créé avec succès',
        })
        setFormData({ name: '', description: '', color: '#3B82F6', capacity: undefined })
        setCreatingGroup(false)
        loadGroups()
      }
    } catch (error) {
      logger.error(error, { action: 'createGroup', metadata: { sessionId, eventId } })
      toast({
        title: 'Erreur',
        description: getUserErrorMessage(error),
        variant: 'destructive',
      })
    }
  }

  const handleUpdateGroup = async () => {
    if (!editingGroup || !formData.name.trim()) return

    try {
      const response = await fetch(
        `/api/admin/events/${eventId}/sessions/${sessionId}/groups/${editingGroup.id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        }
      )

      if (response.ok) {
        toast({
          title: 'Succès',
          description: 'Groupe mis à jour',
        })
        setEditingGroup(null)
        setFormData({ name: '', description: '', color: '#3B82F6', capacity: undefined })
        loadGroups()
      }
    } catch (error) {
      logger.error(error, { action: 'updateGroup', metadata: { sessionId, eventId, groupId: editingGroup.id } })
      toast({
        title: 'Erreur',
        description: getUserErrorMessage(error),
        variant: 'destructive',
      })
    }
  }

  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm('Supprimer ce groupe ? Les participants ne seront pas supprimés.')) return

    try {
      const response = await fetch(
        `/api/admin/events/${eventId}/sessions/${sessionId}/groups/${groupId}`,
        {
          method: 'DELETE',
        }
      )

      if (response.ok) {
        toast({
          title: 'Succès',
          description: 'Groupe supprimé',
        })
        loadGroups()
      }
    } catch (error) {
      logger.error(error, { action: 'deleteGroup', metadata: { sessionId, eventId, groupId } })
      toast({
        title: 'Erreur',
        description: getUserErrorMessage(error),
        variant: 'destructive',
      })
    }
  }

  const handleAutoDistribute = async () => {
    if (!confirm('Répartir automatiquement les participants dans les groupes de manière équilibrée ?')) return

    try {
      const response = await fetch(
        `/api/admin/events/${eventId}/sessions/${sessionId}/groups/auto-distribute`,
        {
          method: 'POST',
        }
      )

      if (response.ok) {
        toast({
          title: 'Succès',
          description: 'Participants répartis automatiquement',
        })
        loadGroups()
      }
    } catch (error) {
      logger.error(error, { action: 'autoDistribute', metadata: { sessionId, eventId } })
      toast({
        title: 'Erreur',
        description: getUserErrorMessage(error),
        variant: 'destructive',
      })
    }
  }

  const startEdit = (group: SessionGroup) => {
    setEditingGroup(group)
    setFormData({
      name: group.name,
      description: group.description || '',
      color: group.color || '#3B82F6',
      capacity: group.capacity,
    })
  }

  const cancelEdit = () => {
    setEditingGroup(null)
    setCreatingGroup(false)
    setFormData({ name: '', description: '', color: '#3B82F6', capacity: undefined })
  }

  if (!isOpen) return null

  const totalParticipants = groups.reduce((sum, g) => sum + (g._count?.participants || 0), 0)

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-[#004645]">Gestion des Groupes</CardTitle>
              <CardDescription>
                Créez et gérez les groupes pour cette session
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Summary */}
          <div className="flex items-center justify-between p-4 bg-[#9CD9F6]/10 rounded-lg">
            <div className="flex items-center gap-4">
              <div>
                <div className="text-2xl font-bold text-[#004645]">{groups.length}</div>
                <p className="text-xs text-[#004645]/70">Groupes créés</p>
              </div>
              <div className="h-8 w-px bg-[#009197]/30" />
              <div>
                <div className="text-2xl font-bold text-[#009197]">{totalParticipants}</div>
                <p className="text-xs text-[#004645]/70">Participants affectés</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowParticipantAssignment(true)}
                className="gap-2"
              >
                <UserCog className="h-4 w-4" />
                Affecter participants
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAutoDistribute}
                disabled={groups.length === 0}
                className="gap-2"
              >
                <Shuffle className="h-4 w-4" />
                Répartition auto
              </Button>
              <Button
                size="sm"
                onClick={() => setCreatingGroup(true)}
                className="bg-[#FF4713] hover:bg-[#FF6B3D] gap-2"
              >
                <Plus className="h-4 w-4" />
                Nouveau groupe
              </Button>
            </div>
          </div>

          {/* Create/Edit Form */}
          {(creatingGroup || editingGroup) && (
            <Card className="border-2 border-[#009197]">
              <CardHeader>
                <CardTitle className="text-sm">
                  {editingGroup ? 'Modifier le groupe' : 'Nouveau groupe'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Nom du groupe *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Groupe A, Atelier Innovation, Équipe Rouge"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Description du groupe (optionnel)"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="color">Couleur</Label>
                    <div className="flex gap-2">
                      <Input
                        id="color"
                        type="color"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        className="w-20 h-10"
                      />
                      <Input
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        placeholder="#3B82F6"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="capacity">Capacité max</Label>
                    <Input
                      id="capacity"
                      type="number"
                      value={formData.capacity || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          capacity: e.target.value ? parseInt(e.target.value) : undefined,
                        })
                      }
                      placeholder="Illimité"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={editingGroup ? handleUpdateGroup : handleCreateGroup}
                    className="bg-[#009197] hover:bg-[#006C51]"
                  >
                    {editingGroup ? 'Mettre à jour' : 'Créer'}
                  </Button>
                  <Button variant="outline" onClick={cancelEdit}>
                    Annuler
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Groups List */}
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-8 text-[#004645]/60">Chargement...</div>
            ) : groups.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 text-[#004645]/30" />
                  <p className="text-[#004645]/60 mb-4">Aucun groupe pour cette session</p>
                  <Button
                    onClick={() => setCreatingGroup(true)}
                    className="bg-[#FF4713] hover:bg-[#FF6B3D]"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Créer le premier groupe
                  </Button>
                </CardContent>
              </Card>
            ) : (
              groups.map((group) => {
                const participantCount = group._count?.participants || 0
                const isOverCapacity = group.capacity && participantCount > group.capacity

                return (
                  <Card
                    key={group.id}
                    className="border-l-4"
                    style={{ borderLeftColor: group.color || '#3B82F6' }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: group.color || '#3B82F6' }}
                          />
                          <div className="flex-1">
                            <h4 className="font-semibold text-[#004645]">{group.name}</h4>
                            {group.description && (
                              <p className="text-sm text-[#004645]/60">{group.description}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-[#009197]" />
                            <span
                              className={`font-medium ${isOverCapacity ? 'text-red-600' : 'text-[#004645]'}`}
                            >
                              {participantCount}
                              {group.capacity && ` / ${group.capacity}`}
                            </span>
                            {isOverCapacity && (
                              <Badge variant="destructive" className="text-xs">
                                Surcharge
                              </Badge>
                            )}
                          </div>

                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => startEdit(group)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteGroup(group.id)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>
      </div>

      {/* Participant Assignment Modal */}
      <ParticipantGroupAssignment
        sessionId={sessionId}
        eventId={eventId}
        isOpen={showParticipantAssignment}
        onClose={() => setShowParticipantAssignment(false)}
      />
    </>
  )
}
