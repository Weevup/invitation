"use client"

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Users, Download, Search, Link as LinkIcon, UserPlus, Upload
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { AddGuestDialog } from '@/components/add-guest-dialog'
import { ImportCSVDialog } from '@/components/import-csv-dialog'
import { SendInvitationsDialog } from '@/components/send-invitations-dialog'
import Papa from 'papaparse'

interface Guest {
  id: string
  firstName: string
  lastName: string
  email: string
  company?: string
  tags: string[]
  status: string
  token: string
  rsvp?: {
    attending?: boolean
    plusOnes: number
    mealChoice?: string
  }
}

interface EventDetails {
  id: string
  name: string
  guests: Guest[]
}

export default function GuestsPage() {
  const params = useParams()
  const { toast } = useToast()
  const eventId = params.id as string

  const [event, setEvent] = useState<EventDetails | null>(null)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchEvent = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/events/${eventId}`)
      if (response.ok) {
        const data = await response.json()
        setEvent(data)
      }
    } catch (error) {
      console.error('Error fetching event:', error)
    } finally {
      setLoading(false)
    }
  }, [eventId])

  useEffect(() => {
    fetchEvent()
  }, [fetchEvent])

  const copyInvitationLink = (token: string) => {
    const baseUrl = window.location.origin
    const link = `${baseUrl}/guest/${token}`
    navigator.clipboard.writeText(link)
    toast({
      title: 'Lien copié',
      description: "Le lien d'invitation a été copié dans le presse-papier",
    })
  }

  const handleExportCSV = () => {
    if (!event) return

    const csvData = event.guests.map((guest) => ({
      Prénom: guest.firstName,
      Nom: guest.lastName,
      Email: guest.email,
      Entreprise: guest.company || '',
      Tags: guest.tags.join(', '),
      Statut: guest.rsvp?.attending === true
        ? 'Participe'
        : guest.rsvp?.attending === false
        ? 'Décline'
        : 'En attente',
    }))

    const csv = Papa.unparse(csvData)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `invites-${event.name}.csv`
    link.click()

    toast({
      title: 'Export réussi',
      description: `${event.guests.length} invités exportés`,
    })
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

  const filteredGuests = event.guests.filter((guest) => {
    const searchLower = search.toLowerCase()
    return (
      guest.firstName.toLowerCase().includes(searchLower) ||
      guest.lastName.toLowerCase().includes(searchLower) ||
      guest.email.toLowerCase().includes(searchLower) ||
      guest.company?.toLowerCase().includes(searchLower) ||
      guest.tags.some((tag) => tag.toLowerCase().includes(searchLower))
    )
  })

  const hasGuests = event.guests.length > 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-[#004645] mb-2" style={{ fontFamily: "var(--font-abril)" }}>
            Gestion des invités
          </h2>
          <p className="text-[#004645]/70">
            {event.guests.length} invité{event.guests.length !== 1 ? 's' : ''} au total
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleExportCSV}
            disabled={!hasGuests}
            className="border-[#004645] text-[#004645] hover:bg-[#004645] hover:text-white"
          >
            <Download className="h-4 w-4 mr-2" />
            Exporter CSV
          </Button>
          <SendInvitationsDialog
            eventId={eventId}
            totalGuests={event.guests.length}
            pendingGuests={event.guests.filter((g) => !g.rsvp || g.rsvp.attending === null).length}
          />
        </div>
      </div>

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
                    <tr key={guest.id} className="text-sm hover:bg-[#9CD9F6]/5 transition-colors">
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
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyInvitationLink(guest.token)}
                          className="text-[#009197] hover:text-[#004645] hover:bg-[#9CD9F6]/20"
                        >
                          <LinkIcon className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
