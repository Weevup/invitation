"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Users, Search, X, Check, AlertCircle } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface SessionGroup {
  id: string
  name: string
  color?: string
  capacity?: number
  _count?: {
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

interface ParticipantGroupAssignmentProps {
  sessionId: string
  eventId: string
  isOpen: boolean
  onClose: () => void
}

export function ParticipantGroupAssignment({
  sessionId,
  eventId,
  isOpen,
  onClose,
}: ParticipantGroupAssignmentProps) {
  const [groups, setGroups] = useState<SessionGroup[]>([])
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGroup, setSelectedGroup] = useState<string>('all')
  const { toast } = useToast()

  useEffect(() => {
    if (isOpen) {
      loadData()
    }
  }, [isOpen, sessionId])

  const loadData = async () => {
    try {
      setLoading(true)

      // Load groups
      const groupsResponse = await fetch(
        `/api/admin/events/${eventId}/sessions/${sessionId}/groups`
      )
      if (groupsResponse.ok) {
        const groupsData = await groupsResponse.json()
        setGroups(groupsData.groups || [])
      }

      // Load participants
      const participantsResponse = await fetch(
        `/api/admin/events/${eventId}/sessions/${sessionId}/participants?includeGroups=true`
      )
      if (participantsResponse.ok) {
        const participantsData = await participantsResponse.json()
        setParticipants(participantsData.participants || [])
      }
    } catch (error) {
      console.error('Error loading data:', error)
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les données',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAssignToGroup = async (participantId: string, groupId: string | null) => {
    try {
      const response = await fetch(
        `/api/admin/events/${eventId}/sessions/${sessionId}/participants/${participantId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ groupId }),
        }
      )

      if (response.ok) {
        toast({
          title: 'Succès',
          description: 'Participant assigné au groupe',
        })
        loadData()
      }
    } catch (error) {
      console.error('Error assigning participant:', error)
      toast({
        title: 'Erreur',
        description: "Impossible d'assigner le participant",
        variant: 'destructive',
      })
    }
  }

  // Filter participants
  const filteredParticipants = participants.filter((p) => {
    const matchesSearch =
      searchQuery === '' ||
      `${p.guest.firstName} ${p.guest.lastName}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      p.guest.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.guest.company?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesGroup =
      selectedGroup === 'all' ||
      (selectedGroup === 'unassigned' && !p.groupId) ||
      p.groupId === selectedGroup

    return matchesSearch && matchesGroup
  })

  // Stats
  const unassignedCount = participants.filter((p) => !p.groupId).length
  const assignedCount = participants.length - unassignedCount

  if (!isOpen) return null

  const getGroupById = (groupId: string | null | undefined) => {
    if (!groupId) return null
    return groups.find((g) => g.id === groupId)
  }

  const isGroupFull = (groupId: string) => {
    const group = groups.find((g) => g.id === groupId)
    if (!group || !group.capacity) return false
    const currentCount = group._count?.participants || 0
    return currentCount >= group.capacity
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-[#004645]">
                Affectation des Participants aux Groupes
              </CardTitle>
              <p className="text-sm text-[#004645]/60 mt-1">
                {participants.length} participants • {assignedCount} assignés • {unassignedCount}{' '}
                non assignés
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Filters */}
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#004645]/40" />
                <Input
                  placeholder="Rechercher un participant..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedGroup} onValueChange={setSelectedGroup}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrer par groupe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les groupes</SelectItem>
                <SelectItem value="unassigned">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-3 w-3 text-orange-500" />
                    Non assignés ({unassignedCount})
                  </div>
                </SelectItem>
                {groups.map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: group.color || '#3B82F6' }}
                      />
                      {group.name} ({group._count?.participants || 0}
                      {group.capacity && `/${group.capacity}`})
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* No groups warning */}
          {groups.length === 0 && (
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="font-medium text-orange-900">Aucun groupe défini</p>
                    <p className="text-sm text-orange-700">
                      Créez d&apos;abord des groupes avant d&apos;assigner des participants
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Participants List */}
          {loading ? (
            <div className="text-center py-12 text-[#004645]/60">Chargement...</div>
          ) : filteredParticipants.length === 0 ? (
            <div className="text-center py-12 text-[#004645]/60">
              Aucun participant trouvé
            </div>
          ) : (
            <div className="space-y-2">
              {filteredParticipants.map((participant) => {
                const currentGroup = getGroupById(participant.groupId)

                return (
                  <Card key={participant.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3">
                            <Users className="h-4 w-4 text-[#009197] flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-[#004645] truncate">
                                {participant.guest.firstName} {participant.guest.lastName}
                              </h4>
                              <p className="text-sm text-[#004645]/60 truncate">
                                {participant.guest.email}
                                {participant.guest.company && ` • ${participant.guest.company}`}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {/* Current group badge */}
                          {currentGroup ? (
                            <Badge
                              variant="outline"
                              className="border-2"
                              style={{
                                borderColor: currentGroup.color || '#3B82F6',
                                color: currentGroup.color || '#3B82F6',
                              }}
                            >
                              <div
                                className="w-2 h-2 rounded-full mr-2"
                                style={{ backgroundColor: currentGroup.color || '#3B82F6' }}
                              />
                              {currentGroup.name}
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-orange-600">
                              Non assigné
                            </Badge>
                          )}

                          {/* Group selector */}
                          {groups.length > 0 && (
                            <Select
                              value={participant.groupId || 'unassigned'}
                              onValueChange={(value) =>
                                handleAssignToGroup(
                                  participant.id,
                                  value === 'unassigned' ? null : value
                                )
                              }
                            >
                              <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Assigner à..." />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="unassigned">
                                  <div className="flex items-center gap-2">
                                    <X className="h-3 w-3" />
                                    Retirer du groupe
                                  </div>
                                </SelectItem>
                                {groups.map((group) => {
                                  const isFull = isGroupFull(group.id)
                                  const isCurrent = participant.groupId === group.id

                                  return (
                                    <SelectItem
                                      key={group.id}
                                      value={group.id}
                                      disabled={isFull && !isCurrent}
                                    >
                                      <div className="flex items-center gap-2">
                                        <div
                                          className="w-3 h-3 rounded-full"
                                          style={{ backgroundColor: group.color || '#3B82F6' }}
                                        />
                                        {group.name}
                                        {isCurrent && <Check className="h-3 w-3 ml-1" />}
                                        {isFull && !isCurrent && (
                                          <span className="text-xs text-red-600 ml-1">
                                            (Complet)
                                          </span>
                                        )}
                                      </div>
                                    </SelectItem>
                                  )
                                })}
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
