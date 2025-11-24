"use client"

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Users, Download, Search, Link as LinkIcon, UserPlus, Upload, Eye, Filter, CreditCard, CheckSquare, Square, X, RefreshCw, Edit, Trash2
} from 'lucide-react'
import { toast } from 'sonner'
import { AddGuestDialog } from '@/components/add-guest-dialog'
import { EditGuestDialog } from '@/components/edit-guest-dialog'
import { DeleteGuestDialog } from '@/components/delete-guest-dialog'
import { ImportCSVDialog } from '@/components/import-csv-dialog'
import { SendInvitationsDialog } from '@/components/send-invitations-dialog'
import { SendSMSDialog } from '@/components/send-sms-dialog'
import { GuestDetailsModal } from '@/components/guest-details-modal'
import Papa from 'papaparse'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createClientLogger } from '@/lib/client-logger'

const logger = createClientLogger({ component: 'GuestsPage' })

interface Guest {
  id: string
  firstName: string
  lastName: string
  email: string
  company?: string
  tags: string[]
  status: string
  token: string
  // Professional information
  jobTitle?: string
  department?: string
  companySize?: string
  industry?: string
  phoneNumber?: string
  phone?: string
  linkedinUrl?: string
  // Event needs
  dietaryReqs?: string
  accessibility?: string
  adminNotes?: string
  rsvp?: {
    attending?: boolean
    plusOnes: number
    mealChoice?: string
    allergies?: string
    accessibilityNotes?: string
    transportNeeds?: string
    lodgingNeeds?: string
    consentPhotos: boolean
    createdAt: string
    qrCodeId: string
  }
  checkins?: Array<{
    checkedInAt: string
    desk?: string
    notes?: string
  }>
}

interface EventDetails {
  id: string
  name: string
  guests: Guest[]
}

export default function GuestsPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.id as string

  const [event, setEvent] = useState<EventDetails | null>(null)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null)
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deletingGuest, setDeletingGuest] = useState<Guest | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [tagFilter, setTagFilter] = useState<string>('all')
  // Professional filters
  const [companySizeFilter, setCompanySizeFilter] = useState<string>('all')
  const [industryFilter, setIndustryFilter] = useState<string>('all')
  const [jobTitleFilter, setJobTitleFilter] = useState<string>('all')
  // Selection state
  const [selectedGuestIds, setSelectedGuestIds] = useState<Set<string>>(new Set())

  const fetchEvent = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setRefreshing(true)
    }
    try {
      // Charger l'événement avec tous les invités (mode legacy nécessaire pour cette page)
      const response = await fetch(`/api/admin/events/${eventId}?includeGuests=true`)
      if (response.ok) {
        const data = await response.json()
        setEvent(data)
        if (isManualRefresh) {
          toast.success('Liste des invités actualisée')
        }
      }
    } catch (error) {
      logger.error(error, { action: 'fetchingEvent' })
      if (isManualRefresh) {
        toast.error('Erreur lors de l\'actualisation')
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [eventId])

  const handleManualRefresh = () => {
    fetchEvent(true)
  }

  useEffect(() => {
    fetchEvent()

    // Auto-refresh every 30 seconds to get latest RSVP updates
    const interval = setInterval(() => {
      fetchEvent()
    }, 30000)

    return () => clearInterval(interval)
  }, [fetchEvent])

  const copyInvitationLink = (token: string) => {
    const baseUrl = window.location.origin
    const link = `${baseUrl}/guest/${token}`
    navigator.clipboard.writeText(link)
    toast.success("Le lien d'invitation a été copié dans le presse-papier")
  }

  const handleExportParticipantPDF = (guestId: string) => {
    window.open(`/api/admin/events/${eventId}/export/participant/${guestId}`, '_blank')
  }

  const handleExportCSV = () => {
    if (!event) return

    const csvData = event.guests.map((guest) => ({
      Prénom: guest.firstName,
      Nom: guest.lastName || '',
      Email: guest.email,
      Entreprise: guest.company || '',
      Tags: guest.tags.join(', '),
      // Informations professionnelles
      'Fonction/Poste': guest.jobTitle || '',
      Département: guest.department || '',
      'Taille Entreprise': guest.companySize || '',
      Secteur: guest.industry || '',
      'Téléphone Fixe': guest.phoneNumber || '',
      'Téléphone Mobile (SMS)': guest.phone || '',
      LinkedIn: guest.linkedinUrl || '',
      // Besoins événementiels
      'Restrictions Alimentaires': guest.dietaryReqs || '',
      Accessibilité: guest.accessibility || '',
      // RSVP
      Statut: guest.rsvp?.attending === true
        ? 'Participe'
        : guest.rsvp?.attending === false
        ? 'Décline'
        : 'En attente',
      Accompagnants: guest.rsvp?.plusOnes || 0,
      'Choix Menu': guest.rsvp?.mealChoice || '',
    }))

    const csv = Papa.unparse(csvData)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `invites-${event.name}.csv`
    link.click()

    toast.success(`${event.guests.length} invités exportés`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Users className="h-12 w-12 text-[#009197] mx-auto mb-4 animate-pulse" />
          <p className="text-[#004645]/70">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur">
        <CardContent className="pt-6">
          <p className="text-center text-[#004645]/70">Événement non trouvé</p>
        </CardContent>
      </Card>
    )
  }

  // Get all unique tags
  const allTags = Array.from(new Set(event.guests.flatMap((g) => g.tags)))

  // Get all unique professional fields
  const allIndustries = Array.from(new Set(event.guests.map((g) => g.industry).filter(Boolean))) as string[]
  const allJobTitles = Array.from(new Set(event.guests.map((g) => g.jobTitle).filter(Boolean))) as string[]

  const filteredGuests = event.guests.filter((guest) => {
    const searchLower = search.toLowerCase()
    const matchesSearch =
      guest.firstName.toLowerCase().includes(searchLower) ||
      guest.lastName.toLowerCase().includes(searchLower) ||
      guest.email.toLowerCase().includes(searchLower) ||
      guest.company?.toLowerCase().includes(searchLower) ||
      guest.jobTitle?.toLowerCase().includes(searchLower) ||
      guest.industry?.toLowerCase().includes(searchLower) ||
      guest.tags.some((tag) => tag.toLowerCase().includes(searchLower))

    // Status filter
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'confirmed' && guest.rsvp?.attending === true) ||
      (statusFilter === 'declined' && guest.rsvp?.attending === false) ||
      (statusFilter === 'pending' && !guest.rsvp)

    // Tag filter
    const matchesTag =
      tagFilter === 'all' || guest.tags.includes(tagFilter)

    // Professional filters
    const matchesCompanySize =
      companySizeFilter === 'all' || guest.companySize === companySizeFilter

    const matchesIndustry =
      industryFilter === 'all' || guest.industry === industryFilter

    const matchesJobTitle =
      jobTitleFilter === 'all' || guest.jobTitle === jobTitleFilter

    return matchesSearch && matchesStatus && matchesTag && matchesCompanySize && matchesIndustry && matchesJobTitle
  })

  const hasGuests = event.guests.length > 0

  // Count guests with phone numbers (use phone or phoneNumber field)
  const guestsWithPhone = filteredGuests.filter(
    (g) => g.phone || g.phoneNumber
  ).length

  // Selection handlers
  const toggleSelectAll = () => {
    if (selectedGuestIds.size === filteredGuests.length) {
      setSelectedGuestIds(new Set())
    } else {
      setSelectedGuestIds(new Set(filteredGuests.map(g => g.id)))
    }
  }

  const toggleSelectGuest = (guestId: string) => {
    const newSelection = new Set(selectedGuestIds)
    if (newSelection.has(guestId)) {
      newSelection.delete(guestId)
    } else {
      newSelection.add(guestId)
    }
    setSelectedGuestIds(newSelection)
  }

  const clearSelection = () => {
    setSelectedGuestIds(new Set())
  }

  const handleBulkDelete = async () => {
    if (selectedGuestIds.size === 0) return

    const confirmMessage = `Êtes-vous sûr de vouloir supprimer ${selectedGuestIds.size} invité${selectedGuestIds.size > 1 ? 's' : ''} ? Cette action est irréversible.`

    if (!window.confirm(confirmMessage)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/events/${eventId}/guests/bulk-delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          guestIds: Array.from(selectedGuestIds),
        }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        toast.success(`${result.deleted} invité${result.deleted > 1 ? 's' : ''} supprimé${result.deleted > 1 ? 's' : ''} avec succès`)
        clearSelection()
        fetchEvent()
      } else {
        throw new Error(result.error || 'Erreur lors de la suppression')
      }
    } catch (error) {
      logger.error(error, { action: 'bulkDelete' })
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la suppression des invités')
    }
  }

  const isAllSelected = filteredGuests.length > 0 && selectedGuestIds.size === filteredGuests.length

  return (
    <div className="space-y-6">
      {/* Guest Details Modal */}
      {selectedGuest && (
        <GuestDetailsModal
          guest={selectedGuest}
          open={!!selectedGuest}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedGuest(null)
              // Refresh data when closing modal in case guest status changed
              fetchEvent()
            }
          }}
        />
      )}

      {/* Edit Guest Dialog */}
      {editingGuest && (
        <EditGuestDialog
          eventId={eventId}
          guest={editingGuest}
          open={editDialogOpen}
          onOpenChange={(open) => {
            setEditDialogOpen(open)
            if (!open) {
              setEditingGuest(null)
            }
          }}
          onGuestUpdated={() => {
            fetchEvent()
            toast.success('Invité mis à jour')
          }}
        />
      )}

      {/* Delete Guest Dialog */}
      {deletingGuest && (
        <DeleteGuestDialog
          eventId={eventId}
          guest={deletingGuest}
          open={deleteDialogOpen}
          onOpenChange={(open) => {
            setDeleteDialogOpen(open)
            if (!open) {
              setDeletingGuest(null)
            }
          }}
          onGuestDeleted={() => {
            fetchEvent()
          }}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-[#004645] mb-2" style={{ fontFamily: "var(--font-abril)" }}>
            Gestion des invités
          </h2>
          <p className="text-[#004645]/70">
            {event.guests.length} invité{event.guests.length !== 1 ? 's' : ''} au total
            <span className="text-xs ml-2 text-[#009197]">• Actualisation auto toutes les 30s</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="border-[#9CD9F6] text-[#009197] hover:bg-[#009197] hover:text-white"
            title="Actualiser la liste des invités"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
          <Button
            variant="outline"
            onClick={handleExportCSV}
            disabled={!hasGuests}
            className="border-[#004645] text-[#004645] hover:bg-[#004645] hover:text-white"
          >
            <Download className="h-4 w-4 mr-2" />
            Exporter CSV
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push(`/admin/events/${eventId}/badges`)}
            disabled={!hasGuests}
            className="border-[#009197] text-[#009197] hover:bg-[#009197] hover:text-white"
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Gérer les badges
          </Button>
          <SendSMSDialog
            eventId={eventId}
            guestIds={filteredGuests.map((g) => g.id)}
            guestsWithPhone={guestsWithPhone}
            totalGuests={filteredGuests.length}
          />
          <SendInvitationsDialog
            eventId={eventId}
            totalGuests={event.guests.length}
            pendingGuests={event.guests.filter((g) => !g.rsvp || g.rsvp.attending === null).length}
          />
        </div>
      </div>

      {/* Filtres avancés */}
      {hasGuests && (
        <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-[#009197]" />
                <span className="text-sm font-medium text-[#004645]">Filtres :</span>
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px] border-[#9CD9F6]/50">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="confirmed">✓ Confirmés</SelectItem>
                  <SelectItem value="declined">✗ Déclinés</SelectItem>
                  <SelectItem value="pending">⏳ En attente</SelectItem>
                </SelectContent>
              </Select>

              <Select value={tagFilter} onValueChange={setTagFilter}>
                <SelectTrigger className="w-[180px] border-[#9CD9F6]/50">
                  <SelectValue placeholder="Tag" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les tags</SelectItem>
                  {allTags.map((tag) => (
                    <SelectItem key={tag} value={tag}>
                      {tag}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={companySizeFilter} onValueChange={setCompanySizeFilter}>
                <SelectTrigger className="w-[200px] border-[#9CD9F6]/50">
                  <SelectValue placeholder="Taille entreprise" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes tailles</SelectItem>
                  <SelectItem value="TPE">🏪 TPE (1-10)</SelectItem>
                  <SelectItem value="PME">🏢 PME (11-250)</SelectItem>
                  <SelectItem value="ETI">🏭 ETI (251-5000)</SelectItem>
                  <SelectItem value="GE">🏛️ Grande Ent. (5000+)</SelectItem>
                </SelectContent>
              </Select>

              <Select value={industryFilter} onValueChange={setIndustryFilter}>
                <SelectTrigger className="w-[180px] border-[#9CD9F6]/50">
                  <SelectValue placeholder="Secteur" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous secteurs</SelectItem>
                  {allIndustries.map((industry) => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={jobTitleFilter} onValueChange={setJobTitleFilter}>
                <SelectTrigger className="w-[180px] border-[#9CD9F6]/50">
                  <SelectValue placeholder="Fonction" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes fonctions</SelectItem>
                  {allJobTitles.map((jobTitle) => (
                    <SelectItem key={jobTitle} value={jobTitle}>
                      {jobTitle}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {(statusFilter !== 'all' || tagFilter !== 'all' || companySizeFilter !== 'all' || industryFilter !== 'all' || jobTitleFilter !== 'all') && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setStatusFilter('all')
                    setTagFilter('all')
                    setCompanySizeFilter('all')
                    setIndustryFilter('all')
                    setJobTitleFilter('all')
                  }}
                  className="text-[#FF4713]"
                >
                  Réinitialiser
                </Button>
              )}

              <div className="ml-auto text-sm text-[#004645]/70">
                {filteredGuests.length} invité{filteredGuests.length !== 1 ? 's' : ''}
                {filteredGuests.length !== event.guests.length && ` sur ${event.guests.length}`}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Selection Filters */}
      {hasGuests && (
        <Card className="border-[#009197]/30 bg-gradient-to-r from-[#009197]/5 to-transparent">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-sm font-medium text-[#004645]">Sélection rapide :</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const nonInvitedIds = filteredGuests
                    .filter(g => g.status !== 'INVITED' && !g.rsvp)
                    .map(g => g.id)
                  setSelectedGuestIds(new Set(nonInvitedIds))
                }}
                className="border-[#009197] text-[#009197] hover:bg-[#009197] hover:text-white"
              >
                Nouveaux invités ({filteredGuests.filter(g => g.status !== 'INVITED' && !g.rsvp).length})
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const noResponseIds = filteredGuests
                    .filter(g => !g.rsvp || g.rsvp.attending === null)
                    .map(g => g.id)
                  setSelectedGuestIds(new Set(noResponseIds))
                }}
                className="border-[#FF4713] text-[#FF4713] hover:bg-[#FF4713] hover:text-white"
              >
                Sans réponse ({filteredGuests.filter(g => !g.rsvp || g.rsvp.attending === null).length})
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const confirmedIds = filteredGuests
                    .filter(g => g.rsvp?.attending === true)
                    .map(g => g.id)
                  setSelectedGuestIds(new Set(confirmedIds))
                }}
                className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
              >
                Confirmés ({filteredGuests.filter(g => g.rsvp?.attending === true).length})
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedGuestIds(new Set(filteredGuests.map(g => g.id)))}
                className="border-[#004645] text-[#004645] hover:bg-[#004645] hover:text-white"
              >
                Tous les filtrés ({filteredGuests.length})
              </Button>
              {selectedGuestIds.size > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSelection}
                  className="text-[#FF4713] hover:bg-[#FF4713]/10"
                >
                  <X className="h-4 w-4 mr-1" />
                  Désélectionner tout
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Guests Table */}
      <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-[#004645]" style={{ fontFamily: "var(--font-abril)" }}>
                Liste des invités
              </CardTitle>
              <CardDescription className="text-[#004645]/70">
                Gérez vos invités et suivez leurs réponses en temps réel
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <AddGuestDialog eventId={eventId} onGuestAdded={fetchEvent} />
              <ImportCSVDialog eventId={eventId} onImportComplete={fetchEvent} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
          {hasGuests && (
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#009197]" />
                <Input
                  type="text"
                  placeholder="Rechercher un invité..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 border-[#9CD9F6]/50 focus:border-[#009197] text-[#004645]"
                />
              </div>
            </div>
          )}

          {/* Table or Empty State */}
          {!hasGuests ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-[#009197] mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-[#004645]" style={{ fontFamily: "var(--font-abril)" }}>
                Aucun invité pour le moment
              </h3>
              <p className="text-[#004645]/70 mb-6">
                Commencez par ajouter vos premiers invités manuellement ou via un import CSV
              </p>
              <div className="flex gap-3 justify-center">
                <AddGuestDialog eventId={eventId} onGuestAdded={fetchEvent} />
                <ImportCSVDialog eventId={eventId} onImportComplete={fetchEvent} />
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-[#9CD9F6]/30">
                  <tr className="text-left text-sm text-[#004645]/70">
                    <th className="pb-3 font-medium w-12">
                      <button
                        onClick={toggleSelectAll}
                        className="p-1 hover:bg-[#9CD9F6]/20 rounded transition-colors"
                        title={isAllSelected ? "Tout désélectionner" : "Tout sélectionner"}
                      >
                        {isAllSelected ? (
                          <CheckSquare className="h-5 w-5 text-[#009197]" />
                        ) : (
                          <Square className="h-5 w-5 text-[#004645]/40" />
                        )}
                      </button>
                    </th>
                    <th className="pb-3 font-medium">Invité</th>
                    <th className="pb-3 font-medium">Email</th>
                    <th className="pb-3 font-medium">Entreprise</th>
                    <th className="pb-3 font-medium">Tags</th>
                    <th className="pb-3 font-medium">Statut</th>
                    <th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#9CD9F6]/30">
                  {filteredGuests?.map((guest) => (
                    <tr
                      key={guest.id}
                      className={`text-sm transition-colors ${
                        selectedGuestIds.has(guest.id)
                          ? 'bg-[#9CD9F6]/10'
                          : 'hover:bg-[#9CD9F6]/5'
                      }`}
                    >
                      <td className="py-3">
                        <button
                          onClick={() => toggleSelectGuest(guest.id)}
                          className="p-1 hover:bg-[#9CD9F6]/20 rounded transition-colors"
                        >
                          {selectedGuestIds.has(guest.id) ? (
                            <CheckSquare className="h-5 w-5 text-[#009197]" />
                          ) : (
                            <Square className="h-5 w-5 text-[#004645]/40" />
                          )}
                        </button>
                      </td>
                      <td className="py-3">
                        <div className="font-medium text-[#004645]">
                          {guest.firstName} {guest.lastName}
                        </div>
                      </td>
                      <td className="py-3 text-[#004645]/70">{guest.email}</td>
                      <td className="py-3 text-[#004645]/70">{guest.company || '-'}</td>
                      <td className="py-3">
                        <div className="flex gap-1 flex-wrap">
                          {guest.tags.map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="text-xs bg-[#9CD9F6]/20 text-[#004645] border-[#9CD9F6]/30"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="py-3">
                        {guest.rsvp ? (
                          guest.rsvp.attending ? (
                            <Badge className="bg-green-100 text-green-800 border-green-200">
                              ✓ Participe
                            </Badge>
                          ) : guest.rsvp.attending === false ? (
                            <Badge className="bg-red-100 text-red-800 border-red-200">
                              ✗ Décline
                            </Badge>
                          ) : (
                            <Badge className="bg-gray-100 text-gray-800 border-gray-200">
                              Indécis
                            </Badge>
                          )
                        ) : (
                          <Badge className="bg-[#FF4713]/10 text-[#FF4713] border-[#FF4713]/30">
                            En attente
                          </Badge>
                        )}
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedGuest(guest)}
                            className="text-[#004645] hover:text-[#009197] hover:bg-[#9CD9F6]/20"
                            title="Voir les détails"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingGuest(guest)
                              setEditDialogOpen(true)
                            }}
                            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                            title="Modifier l'invité"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyInvitationLink(guest.token)}
                            className="text-[#009197] hover:text-[#004645] hover:bg-[#9CD9F6]/20"
                            title="Copier le lien d'invitation"
                          >
                            <LinkIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleExportParticipantPDF(guest.id)}
                            className="text-[#004645] hover:text-[#FF4713] hover:bg-[#9CD9F6]/20"
                            title="Exporter le programme PDF"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setDeletingGuest(guest)
                              setDeleteDialogOpen(true)
                            }}
                            className="text-red-600 hover:text-red-800 hover:bg-red-50"
                            title="Supprimer l'invité"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Floating Selection Action Bar */}
      {selectedGuestIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <Card className="border-[#009197] shadow-2xl bg-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <CheckSquare className="h-5 w-5 text-[#009197]" />
                  <span className="font-medium text-[#004645]">
                    {selectedGuestIds.size} invité{selectedGuestIds.size > 1 ? 's' : ''} sélectionné{selectedGuestIds.size > 1 ? 's' : ''}
                  </span>
                </div>
                <div className="h-6 w-px bg-[#9CD9F6]" />
                <SendInvitationsDialog
                  eventId={eventId}
                  totalGuests={event.guests.length}
                  pendingGuests={event.guests.filter((g) => !g.rsvp || g.rsvp.attending === null).length}
                  selectedGuestIds={Array.from(selectedGuestIds)}
                  onComplete={clearSelection}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBulkDelete}
                  className="text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Supprimer
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSelection}
                  className="text-gray-600 hover:bg-gray-100"
                >
                  <X className="h-4 w-4 mr-1" />
                  Annuler
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
