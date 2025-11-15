'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Plus,
  Edit2,
  Trash2,
  Users,
  AlertCircle,
  Shuffle,
  ArrowLeft,
  UserCog,
  Loader2,
  Calendar,
  Clock,
  MapPin,
  Search,
} from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

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

interface Session {
  id: string
  title: string
  type: string
  startTime: string
  endTime: string
  venue?: string
  room?: string
  capacity?: number
  _count: {
    participants: number
  }
}

interface Participant {
  id: string
  guestId: string
  groupId?: string | null
  guest: {
    id: string
    firstName: string
    lastName: string
    email: string
    company?: string
  }
}

interface SessionDetailPageProps {
  sessionType: 'ateliers' | 'team-building' | 'activites-libres'
  labels: {
    groupSingular: string
    groupPlural: string
    newGroup: string
    createGroup: string
    editGroup: string
    deleteGroupConfirm: string
    assignToGroup: string
    removeFromGroup: string
    noGroupsTab: string
  }
}

export default function SessionDetailPage({ sessionType, labels }: SessionDetailPageProps) {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const eventId = params.id as string
  const sessionId = params.sessionId as string

  const [session, setSession] = useState<Session | null>(null)
  const [groups, setGroups] = useState<SessionGroup[]>([])
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('groups')

  const [editingGroup, setEditingGroup] = useState<SessionGroup | null>(null)
  const [creatingGroup, setCreatingGroup] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3B82F6',
    capacity: undefined as number | undefined
  })

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>('all')

  // Routes API pour les groupes et participants
  const groupsApi = `/api/admin/events/${eventId}/sessions/${sessionId}/groups`
  const participantsApi = `/api/admin/events/${eventId}/sessions/${sessionId}/participants`

  useEffect(() => {
    loadData()
  }, [eventId, sessionId])

  async function loadData() {
    try {
      setLoading(true)
      await Promise.all([
        fetchSession(),
        fetchGroups(),
        fetchParticipants()
      ])
    } finally {
      setLoading(false)
    }
  }

  const fetchSession = useCallback(async () => {
    const response = await fetch(`/api/admin/events/${eventId}/sessions/${sessionId}`)
    if (!response.ok) throw new Error('Failed to fetch session')
    const data = await response.json()
    setSession(data.session)
  }, [eventId, sessionId])

  const fetchGroups = useCallback(async () => {
    const response = await fetch(groupsApi)
    if (!response.ok) throw new Error('Failed to fetch groups')
    const data = await response.json()
    setGroups(data.groups || [])
  }, [groupsApi])

  const fetchParticipants = useCallback(async () => {
    const response = await fetch(participantsApi)
    if (!response.ok) throw new Error('Failed to fetch participants')
    const data = await response.json()
    setParticipants(data.participants || [])
  }, [participantsApi])

  const handleCreateGroup = useCallback(async () => {
    try {
      const response = await fetch(groupsApi, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          order: groups.length
        })
      })

      if (!response.ok) throw new Error('Failed to create group')

      toast({
        title: `${labels.groupSingular} créé`,
        description: `${labels.groupSingular} "${formData.name}" a été créé avec succès`
      })

      await fetchGroups()
      setCreatingGroup(false)
      setFormData({ name: '', description: '', color: '#3B82F6', capacity: undefined })
    } catch {
      toast({
        title: 'Erreur',
        description: `Impossible de créer ${labels.groupSingular.toLowerCase()}`,
        variant: 'destructive'
      })
    }
  }, [groupsApi, formData, groups.length, labels, toast, fetchGroups])

  const handleUpdateGroup = useCallback(async () => {
    if (!editingGroup) return

    try {
      const response = await fetch(
        `${groupsApi}/${editingGroup.id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        }
      )

      if (!response.ok) throw new Error('Failed to update group')

      toast({
        title: `${labels.groupSingular} mis à jour`,
        description: `${labels.groupSingular} "${formData.name}" a été mis à jour`
      })

      await fetchGroups()
      setEditingGroup(null)
      setFormData({ name: '', description: '', color: '#3B82F6', capacity: undefined })
    } catch {
      toast({
        title: 'Erreur',
        description: `Impossible de mettre à jour ${labels.groupSingular.toLowerCase()}`,
        variant: 'destructive'
      })
    }
  }, [editingGroup, groupsApi, formData, labels, toast, fetchGroups])

  const handleDeleteGroup = useCallback(async (groupId: string) => {
    if (!confirm(labels.deleteGroupConfirm)) return

    try {
      const response = await fetch(
        `${groupsApi}/${groupId}`,
        { method: 'DELETE' }
      )

      if (!response.ok) throw new Error('Failed to delete group')

      toast({
        title: `${labels.groupSingular} supprimé`,
        description: `${labels.groupSingular} a été supprimé avec succès`
      })

      await Promise.all([fetchGroups(), fetchParticipants()])
    } catch {
      toast({
        title: 'Erreur',
        description: `Impossible de supprimer ${labels.groupSingular.toLowerCase()}`,
        variant: 'destructive'
      })
    }
  }, [labels, groupsApi, toast, fetchGroups, fetchParticipants])

  const handleAutoDistribute = useCallback(async () => {
    if (groups.length === 0) {
      toast({
        title: `Aucun ${labels.groupSingular.toLowerCase()}`,
        description: `Créez d'abord des ${labels.groupPlural.toLowerCase()} avant de répartir les participants`,
        variant: 'destructive'
      })
      return
    }

    try {
      const response = await fetch(
        `${groupsApi}/auto-distribute`,
        { method: 'POST' }
      )

      if (!response.ok) throw new Error('Failed to auto-distribute')

      toast({
        title: 'Répartition effectuée',
        description: 'Les participants ont été répartis automatiquement'
      })

      await Promise.all([fetchGroups(), fetchParticipants()])
    } catch {
      toast({
        title: 'Erreur',
        description: 'Impossible de répartir les participants',
        variant: 'destructive'
      })
    }
  }, [groups.length, labels, groupsApi, toast, fetchGroups, fetchParticipants])

  const handleAssignToGroup = useCallback(async (participantId: string, groupId: string | null) => {
    try {
      const response = await fetch(
        `/api/admin/events/${eventId}/sessions/${sessionId}/participants/${participantId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ groupId })
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to assign participant')
      }

      toast({
        title: 'Assignation mise à jour',
        description: `Le participant a été assigné au ${labels.groupSingular.toLowerCase()}`
      })

      await Promise.all([fetchGroups(), fetchParticipants()])
    } catch (error) {
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Impossible d\'assigner le participant',
        variant: 'destructive'
      })
    }
  }, [eventId, sessionId, labels, toast, fetchGroups, fetchParticipants])

  // Memoize expensive filtering to avoid recalculation on every render
  const filteredParticipants = useMemo(() => {
    return participants.filter((p) => {
      const matchesSearch =
        p.guest.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.guest.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.guest.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.guest.company && p.guest.company.toLowerCase().includes(searchQuery.toLowerCase()))

      if (selectedGroupFilter === 'all') return matchesSearch
      if (selectedGroupFilter === 'unassigned') return matchesSearch && !p.groupId
      return matchesSearch && p.groupId === selectedGroupFilter
    })
  }, [participants, searchQuery, selectedGroupFilter])

  // Memoize participant counts to avoid recalculation
  const totalAssigned = useMemo(() => participants.filter(p => p.groupId).length, [participants])
  const totalUnassigned = useMemo(() => participants.filter(p => !p.groupId).length, [participants])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Session introuvable</h3>
            <Button onClick={() => router.push(`/admin/events/${eventId}/${sessionType}`)}>
              Retour
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/admin/events/${eventId}/${sessionType}`)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{session.title}</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {format(new Date(session.startTime), 'PPP', { locale: fr })}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {format(new Date(session.startTime), 'HH:mm')} - {format(new Date(session.endTime), 'HH:mm')}
              </div>
              {session.venue && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {session.venue} {session.room && `- ${session.room}`}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">{labels.groupPlural}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{groups.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Participants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{session._count.participants}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Assignés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{totalAssigned}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Non assignés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{totalUnassigned}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="groups">
            <Users className="h-4 w-4 mr-2" />
            {labels.groupPlural}
          </TabsTrigger>
          <TabsTrigger value="participants">
            <UserCog className="h-4 w-4 mr-2" />
            Affectation
          </TabsTrigger>
        </TabsList>

        {/* Groups Tab */}
        <TabsContent value="groups" className="space-y-4">
          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button onClick={handleAutoDistribute} variant="outline">
                <Shuffle className="h-4 w-4 mr-2" />
                Répartition auto
              </Button>
            </div>
            <Button onClick={() => setCreatingGroup(true)}>
              <Plus className="h-4 w-4 mr-2" />
              {labels.newGroup}
            </Button>
          </div>

          {/* Create/Edit Group Form */}
          {(creatingGroup || editingGroup) && (
            <Card>
              <CardHeader>
                <CardTitle>{editingGroup ? labels.editGroup : labels.createGroup}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom du {labels.groupSingular.toLowerCase()} *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder={`${labels.groupSingular} A`}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="capacity">Capacité maximale</Label>
                    <Input
                      id="capacity"
                      type="number"
                      value={formData.capacity || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, capacity: e.target.value ? parseInt(e.target.value) : undefined }))}
                      placeholder="10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description (optionnel)</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder={`Description du ${labels.groupSingular.toLowerCase()}`}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="color">Couleur</Label>
                  <div className="flex items-center gap-2">
                    <input
                      id="color"
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                      className="h-10 w-20 rounded border cursor-pointer"
                    />
                    <span className="text-sm text-muted-foreground">{formData.color}</span>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCreatingGroup(false)
                      setEditingGroup(null)
                      setFormData({ name: '', description: '', color: '#3B82F6', capacity: undefined })
                    }}
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={editingGroup ? handleUpdateGroup : handleCreateGroup}
                    disabled={!formData.name}
                  >
                    {editingGroup ? 'Mettre à jour' : 'Créer'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Groups List */}
          {groups.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Aucun {labels.groupSingular.toLowerCase()} créé</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Créez des {labels.groupPlural.toLowerCase()} pour organiser vos participants
                </p>
                <Button onClick={() => setCreatingGroup(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Créer un {labels.groupSingular.toLowerCase()}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groups.map((group) => {
                const participantCount = group._count?.participants || 0
                const isOverCapacity = group.capacity && participantCount > group.capacity
                const fillRate = group.capacity ? (participantCount / group.capacity) * 100 : 0

                return (
                  <Card
                    key={group.id}
                    className="border-l-4"
                    style={{ borderLeftColor: group.color || '#3B82F6' }}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: group.color || '#3B82F6' }}
                          />
                          <CardTitle className="text-lg">{group.name}</CardTitle>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => {
                              setEditingGroup(group)
                              setFormData({
                                name: group.name,
                                description: group.description || '',
                                color: group.color || '#3B82F6',
                                capacity: group.capacity
                              })
                            }}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => handleDeleteGroup(group.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      {group.description && (
                        <CardDescription>{group.description}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Participants</span>
                        <span className={cn(
                          "text-lg font-semibold",
                          isOverCapacity && "text-red-600"
                        )}>
                          {participantCount}
                          {group.capacity && `/${group.capacity}`}
                        </span>
                      </div>

                      {group.capacity && (
                        <div className="space-y-1">
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all",
                                fillRate > 100 ? "bg-red-500" :
                                fillRate > 90 ? "bg-orange-500" :
                                fillRate > 70 ? "bg-yellow-500" :
                                "bg-green-500"
                              )}
                              style={{ width: `${Math.min(fillRate, 100)}%` }}
                            />
                          </div>
                          {isOverCapacity && (
                            <p className="text-xs text-red-600">⚠️ Capacité dépassée</p>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        {/* Participants Tab */}
        <TabsContent value="participants" className="space-y-4">
          {groups.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <AlertCircle className="h-12 w-12 mx-auto text-orange-600 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Aucun {labels.groupSingular.toLowerCase()} défini</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Créez d&apos;abord des {labels.groupPlural.toLowerCase()} dans l&apos;onglet &quot;{labels.groupPlural}&quot;
                </p>
                <Button onClick={() => setActiveTab('groups')}>
                  Aller aux {labels.groupPlural.toLowerCase()}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Filters */}
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher un participant..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedGroupFilter} onValueChange={setSelectedGroupFilter}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les participants</SelectItem>
                    <SelectItem value="unassigned">Non assignés</SelectItem>
                    {groups.map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Participants List */}
              <div className="space-y-2">
                {filteredParticipants.map((participant) => {
                  const currentGroup = groups.find(g => g.id === participant.groupId)

                  return (
                    <Card key={participant.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-medium">
                              {participant.guest.firstName} {participant.guest.lastName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {participant.guest.email}
                              {participant.guest.company && ` • ${participant.guest.company}`}
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            {currentGroup && (
                              <Badge
                                variant="outline"
                                className="border-2"
                                style={{
                                  borderColor: currentGroup.color || '#3B82F6',
                                  color: currentGroup.color || '#3B82F6'
                                }}
                              >
                                <div
                                  className="w-2 h-2 rounded-full mr-1.5"
                                  style={{ backgroundColor: currentGroup.color || '#3B82F6' }}
                                />
                                {currentGroup.name}
                              </Badge>
                            )}

                            <Select
                              value={participant.groupId || 'none'}
                              onValueChange={(value) =>
                                handleAssignToGroup(participant.id, value === 'none' ? null : value)
                              }
                            >
                              <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder={labels.assignToGroup} />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">
                                  {participant.groupId ? labels.removeFromGroup : `Aucun ${labels.groupSingular.toLowerCase()}`}
                                </SelectItem>
                                {groups.map((group) => {
                                  const isFull = !!(group.capacity &&
                                    (group._count?.participants || 0) >= group.capacity &&
                                    group.id !== participant.groupId)

                                  return (
                                    <SelectItem
                                      key={group.id}
                                      value={group.id}
                                      disabled={isFull}
                                    >
                                      <div className="flex items-center gap-2">
                                        <div
                                          className="w-2 h-2 rounded-full"
                                          style={{ backgroundColor: group.color || '#3B82F6' }}
                                        />
                                        {group.name}
                                        {group.capacity && ` (${group._count?.participants || 0}/${group.capacity})`}
                                        {isFull && ' - Complet'}
                                      </div>
                                    </SelectItem>
                                  )
                                })}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}

                {filteredParticipants.length === 0 && (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-sm text-muted-foreground">
                        Aucun participant trouvé
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
