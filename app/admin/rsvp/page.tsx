"use client"

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Users, Search, Upload, Download, Plus, Edit, Trash2,
  CheckCircle, XCircle, Clock, Filter, Mail, Copy, ExternalLink,
  Send, UserPlus, TrendingUp, QrCode
} from 'lucide-react'
import { SendConvocationsDialog } from '@/components/send-convocations-dialog'
import Link from 'next/link'
import { createClientLogger } from '@/lib/client-logger'

const logger = createClientLogger({ component: 'RsvpPage' })


interface Guest {
  id: string
  firstName: string
  lastName: string
  email: string
  company: string | null
  token: string
  lastEmailAt?: string | null
  rsvp: {
    attending: boolean
    createdAt: string
    updatedAt?: string
    message?: string
    respondedAt?: string
  } | null
  event: {
    id: string
    name: string
    startsAt: string
  }
}

export default function RSVPManagementPage() {
  const [guests, setGuests] = useState<Guest[]>([])
  const [filteredGuests, setFilteredGuests] = useState<Guest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [eventFilter, setEventFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [events, setEvents] = useState<Array<{ id: string; name: string }>>([])
  const [copiedToken, setCopiedToken] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [convocationDialogOpen, setConvocationDialogOpen] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const [guestsRes, eventsRes] = await Promise.all([
        fetch('/api/admin/guests'),
        fetch('/api/admin/events'),
      ])

      if (guestsRes.ok) {
        const guestsData = await guestsRes.json()
        setGuests(guestsData)
      }

      if (eventsRes.ok) {
        const eventsData = await eventsRes.json()
        setEvents(eventsData)
      }
    } catch (error) {
      logger.error(error, { action: 'fetchingData' })
    } finally {
      setLoading(false)
    }
  }, [])

  const filterGuests = useCallback(() => {
    let filtered = guests

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        g =>
          g.firstName.toLowerCase().includes(term) ||
          g.lastName.toLowerCase().includes(term) ||
          g.email.toLowerCase().includes(term) ||
          (g.company && g.company.toLowerCase().includes(term))
      )
    }

    // Event filter
    if (eventFilter !== 'all') {
      filtered = filtered.filter(g => g.event.id === eventFilter)
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(g => {
        if (statusFilter === 'confirmed') return g.rsvp?.attending === true
        if (statusFilter === 'declined') return g.rsvp?.attending === false
        if (statusFilter === 'pending') return !g.rsvp
        return true
      })
    }

    setFilteredGuests(filtered)
  }, [guests, searchTerm, eventFilter, statusFilter])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    filterGuests()
  }, [filterGuests])

  const handleExportCSV = () => {
    let csv = 'Prénom,Nom,Email,Entreprise,Événement,Statut,Date de réponse\n'

    filteredGuests.forEach(guest => {
      const status = !guest.rsvp ? 'En attente' : guest.rsvp.attending ? 'Confirmé' : 'Refusé'
      const responseDate = guest.rsvp?.createdAt
        ? new Date(guest.rsvp.createdAt).toLocaleDateString('fr-FR')
        : 'N/A'
      csv += `${guest.firstName},${guest.lastName || ''},${guest.email},${guest.company || ''},${guest.event.name},${status},${responseDate}\n`
    })

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `invites-rsvp-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  const copyInvitationLink = (token: string) => {
    const url = `${window.location.origin}/guest/${token}`
    navigator.clipboard.writeText(url)
    setCopiedToken(token)
    setTimeout(() => setCopiedToken(null), 2000)
  }

  const getStatusBadge = (guest: Guest) => {
    if (!guest.rsvp) {
      return <Badge variant="outline" className="border-[#9CD9F6] text-[#009197]">
        <Clock className="h-3 w-3 mr-1" />
        En attente
      </Badge>
    }
    if (guest.rsvp.attending) {
      return <Badge variant="outline" className="border-green-600 text-green-600">
        <CheckCircle className="h-3 w-3 mr-1" />
        Confirmé
      </Badge>
    }
    return <Badge variant="outline" className="border-[#FF4713] text-[#FF4713]">
      <XCircle className="h-3 w-3 mr-1" />
      Refusé
    </Badge>
  }

  const stats = {
    total: guests.length,
    confirmed: guests.filter(g => g.rsvp?.attending === true).length,
    declined: guests.filter(g => g.rsvp?.attending === false).length,
    pending: guests.filter(g => !g.rsvp).length,
  }

  const responseRate = stats.total > 0 ? Math.round(((stats.confirmed + stats.declined) / stats.total) * 100) : 0
  const confirmationRate = stats.total > 0 ? Math.round((stats.confirmed / stats.total) * 100) : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Clock className="h-8 w-8 animate-spin text-[#009197]" />
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#004645]" style={{ fontFamily: "var(--font-abril)" }}>
              Invités & RSVP
            </h1>
            <p className="text-[#004645]/70 mt-1">
              Gérez vos invités et suivez leurs réponses en temps réel
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleExportCSV}
              className="border-[#009197] text-[#009197] hover:bg-[#009197] hover:text-white"
            >
              <Download className="h-4 w-4 mr-2" />
              Exporter CSV
            </Button>
            <Button className="bg-gradient-to-r from-[#004645] to-[#009197] hover:from-[#006C51] hover:to-[#009197] text-white">
              <UserPlus className="h-4 w-4 mr-2" />
              Ajouter des invités
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-6 gap-4 mb-8">
        <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#004645]">Total</CardTitle>
            <Users className="h-4 w-4 text-[#009197]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#004645]" style={{ fontFamily: "var(--font-abril)" }}>
              {stats.total}
            </div>
            <p className="text-xs text-[#004645]/70">Invités</p>
          </CardContent>
        </Card>

        <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#004645]">Confirmés</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600" style={{ fontFamily: "var(--font-abril)" }}>
              {stats.confirmed}
            </div>
            <p className="text-xs text-[#004645]/70">
              {confirmationRate}% du total
            </p>
          </CardContent>
        </Card>

        <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#004645]">Refusés</CardTitle>
            <XCircle className="h-4 w-4 text-[#FF4713]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#FF4713]" style={{ fontFamily: "var(--font-abril)" }}>
              {stats.declined}
            </div>
            <p className="text-xs text-[#004645]/70">
              {stats.total > 0 ? Math.round((stats.declined / stats.total) * 100) : 0}%
            </p>
          </CardContent>
        </Card>

        <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#004645]">En attente</CardTitle>
            <Clock className="h-4 w-4 text-[#009197]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#009197]" style={{ fontFamily: "var(--font-abril)" }}>
              {stats.pending}
            </div>
            <p className="text-xs text-[#004645]/70">Sans réponse</p>
          </CardContent>
        </Card>

        <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#004645]">Taux réponse</CardTitle>
            <TrendingUp className="h-4 w-4 text-[#009197]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#009197]" style={{ fontFamily: "var(--font-abril)" }}>
              {responseRate}%
            </div>
            <p className="text-xs text-[#004645]/70">Ont répondu</p>
          </CardContent>
        </Card>

        <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#004645]">Taux confirmation</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600" style={{ fontFamily: "var(--font-abril)" }}>
              {confirmationRate}%
            </div>
            <p className="text-xs text-[#004645]/70">Participent</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-white border border-[#9CD9F6]/30">
          <TabsTrigger value="overview" className="data-[state=active]:bg-[#004645] data-[state=active]:text-white">
            <Users className="h-4 w-4 mr-2" />
            Vue d&apos;ensemble
          </TabsTrigger>
          <TabsTrigger value="invitations" className="data-[state=active]:bg-[#004645] data-[state=active]:text-white">
            <Mail className="h-4 w-4 mr-2" />
            Invitations
          </TabsTrigger>
          <TabsTrigger value="responses" className="data-[state=active]:bg-[#004645] data-[state=active]:text-white">
            <CheckCircle className="h-4 w-4 mr-2" />
            Réponses RSVP
          </TabsTrigger>
          <TabsTrigger value="convocations" className="data-[state=active]:bg-[#004645] data-[state=active]:text-white">
            <QrCode className="h-4 w-4 mr-2" />
            Convocations
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Filters */}
          <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-[#004645] flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtres
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-[#004645]/50" />
                    <Input
                      placeholder="Rechercher par nom, email ou entreprise..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-[#9CD9F6]/30"
                    />
                  </div>
                </div>
                <Select value={eventFilter} onValueChange={setEventFilter}>
                  <SelectTrigger className="w-[200px] border-[#9CD9F6]/30">
                    <SelectValue placeholder="Événement" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les événements</SelectItem>
                    {events.map(event => (
                      <SelectItem key={event.id} value={event.id}>
                        {event.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[200px] border-[#9CD9F6]/30">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="confirmed">Confirmés</SelectItem>
                    <SelectItem value="declined">Refusés</SelectItem>
                    <SelectItem value="pending">En attente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Guests Table */}
          <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-[#004645]">Liste des invités ({filteredGuests.length})</CardTitle>
              <CardDescription>Tous vos invités avec leur statut RSVP</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredGuests.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-[#009197] mx-auto mb-4 opacity-50" />
                  <p className="text-[#004645]/70">Aucun invité trouvé</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-[#9CD9F6]/30">
                      <tr>
                        <th className="text-left py-3 px-4 text-sm font-medium text-[#004645]">Nom</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-[#004645]">Email</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-[#004645]">Entreprise</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-[#004645]">Événement</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-[#004645]">Statut</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-[#004645]">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredGuests.map((guest) => (
                        <tr key={guest.id} className="border-b border-[#9CD9F6]/20 hover:bg-[#9CD9F6]/5">
                          <td className="py-3 px-4 text-sm text-[#004645]">
                            {guest.firstName} {guest.lastName}
                          </td>
                          <td className="py-3 px-4 text-sm text-[#004645]/70">
                            {guest.email}
                          </td>
                          <td className="py-3 px-4 text-sm text-[#004645]/70">
                            {guest.company || '-'}
                          </td>
                          <td className="py-3 px-4 text-sm text-[#004645]/70">
                            {guest.event.name}
                          </td>
                          <td className="py-3 px-4">
                            {getStatusBadge(guest)}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyInvitationLink(guest.token)}
                                className="text-[#009197] hover:text-[#004645]"
                                title="Copier le lien d'invitation"
                              >
                                {copiedToken === guest.token ? (
                                  <CheckCircle className="h-4 w-4" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </Button>
                              <Button variant="ghost" size="sm" className="text-[#004645] hover:text-[#009197]">
                                <Edit className="h-4 w-4" />
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
        </TabsContent>

        {/* Invitations Tab */}
        <TabsContent value="invitations" className="space-y-6">
          <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-[#004645] flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Gestion des invitations
              </CardTitle>
              <CardDescription>
                Gérez les liens d&apos;invitation et envoyez des rappels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {filteredGuests.map((guest) => (
                <div
                  key={guest.id}
                  className="flex items-center justify-between p-4 border border-[#9CD9F6]/30 rounded-lg hover:bg-[#9CD9F6]/5 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-[#004645]">
                        {guest.firstName} {guest.lastName}
                      </h3>
                      {getStatusBadge(guest)}
                    </div>
                    <div className="text-sm text-[#004645]/70 space-y-1">
                      <p className="flex items-center gap-2">
                        <Mail className="h-3 w-3" />
                        {guest.email}
                      </p>
                      {guest.company && <p>{guest.company}</p>}
                      <p className="text-xs">
                        Événement: {guest.event.name} •{' '}
                        {new Date(guest.event.startsAt).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyInvitationLink(guest.token)}
                      className="border-[#009197] text-[#009197] hover:bg-[#009197] hover:text-white"
                    >
                      {copiedToken === guest.token ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Copié
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-1" />
                          Copier lien
                        </>
                      )}
                    </Button>
                    <a
                      href={`${window.location.origin}/guest/${guest.token}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-[#004645] text-[#004645] hover:bg-[#004645] hover:text-white"
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Voir
                      </Button>
                    </a>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* RSVP Responses Tab */}
        <TabsContent value="responses" className="space-y-6">
          <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-[#004645] flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Réponses RSVP détaillées
              </CardTitle>
              <CardDescription>
                Consultez toutes les réponses reçues avec leurs détails
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {guests.filter(g => g.rsvp).length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="h-12 w-12 text-[#009197] mx-auto mb-4 opacity-50" />
                  <p className="text-[#004645]/70">Aucune réponse reçue pour le moment</p>
                </div>
              ) : (
                guests
                  .filter(g => g.rsvp)
                  .sort((a, b) => {
                    const dateA = a.rsvp?.createdAt ? new Date(a.rsvp.createdAt).getTime() : 0
                    const dateB = b.rsvp?.createdAt ? new Date(b.rsvp.createdAt).getTime() : 0
                    return dateB - dateA
                  })
                  .map((guest) => (
                    <div
                      key={guest.id}
                      className="p-4 border border-[#9CD9F6]/30 rounded-lg hover:bg-[#9CD9F6]/5 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-[#004645] text-lg">
                            {guest.firstName} {guest.lastName}
                          </h3>
                          <p className="text-sm text-[#004645]/70">{guest.email}</p>
                        </div>
                        {getStatusBadge(guest)}
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-[#004645]/70">
                          <Clock className="h-4 w-4" />
                          <span>
                            Répondu le{' '}
                            {guest.rsvp?.createdAt && new Date(guest.rsvp.createdAt).toLocaleDateString('fr-FR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        {guest.rsvp?.message && (
                          <div className="mt-2 p-3 bg-[#9CD9F6]/10 rounded border border-[#9CD9F6]/30">
                            <p className="text-sm text-[#004645]">
                              <strong>Message:</strong> {guest.rsvp.message}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Convocations Tab */}
        <TabsContent value="convocations" className="space-y-6">
          <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-[#004645] flex items-center gap-2">
                    <QrCode className="h-5 w-5" />
                    Envoi des convocations avec QR Code
                  </CardTitle>
                  <CardDescription>
                    Envoyez les convocations finales aux invites confirmes avec leur QR code d&apos;acces
                  </CardDescription>
                </div>
                <Button
                  onClick={() => setConvocationDialogOpen(true)}
                  disabled={stats.confirmed === 0}
                  className="bg-gradient-to-r from-[#004645] to-[#009197] hover:from-[#006C51] hover:to-[#009197] text-white"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Envoyer les convocations
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Stats for convocations */}
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-800">Invites confirmes</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600" style={{ fontFamily: "var(--font-abril)" }}>
                    {stats.confirmed}
                  </p>
                  <p className="text-sm text-green-700">Prets a recevoir leur convocation</p>
                </div>

                <div className="p-4 bg-[#9CD9F6]/20 border border-[#9CD9F6] rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <QrCode className="h-5 w-5 text-[#009197]" />
                    <span className="font-medium text-[#004645]">QR Codes generes</span>
                  </div>
                  <p className="text-2xl font-bold text-[#009197]" style={{ fontFamily: "var(--font-abril)" }}>
                    {stats.confirmed}
                  </p>
                  <p className="text-sm text-[#004645]/70">Un par invite confirme</p>
                </div>

                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-5 w-5 text-yellow-600" />
                    <span className="font-medium text-yellow-800">En attente</span>
                  </div>
                  <p className="text-2xl font-bold text-yellow-600" style={{ fontFamily: "var(--font-abril)" }}>
                    {stats.pending}
                  </p>
                  <p className="text-sm text-yellow-700">N&apos;ont pas encore repondu</p>
                </div>
              </div>

              {/* Info box */}
              <div className="bg-[#9CD9F6]/10 border border-[#9CD9F6]/30 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-[#004645] mb-2">Comment ca marche ?</h4>
                <ol className="text-sm text-[#004645]/80 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="bg-[#009197] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0">1</span>
                    <span>Selectionnez les invites confirmes auxquels envoyer la convocation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-[#009197] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0">2</span>
                    <span>Chaque invite recoit un email avec les informations de l&apos;evenement et son QR code personnel</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-[#009197] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0">3</span>
                    <span>Le jour J, les invites presentent leur QR code pour un check-in rapide</span>
                  </li>
                </ol>
              </div>

              {/* Confirmed guests list */}
              <div>
                <h4 className="font-medium text-[#004645] mb-3">
                  Invites confirmes ({guests.filter(g => g.rsvp?.attending === true).length})
                </h4>
                {guests.filter(g => g.rsvp?.attending === true).length === 0 ? (
                  <div className="text-center py-8 border border-dashed border-[#9CD9F6]/50 rounded-lg">
                    <Users className="h-12 w-12 text-[#009197] mx-auto mb-3 opacity-30" />
                    <p className="text-[#004645]/70">Aucun invite confirme pour le moment</p>
                    <p className="text-sm text-[#004645]/50 mt-1">
                      Les invites doivent d&apos;abord confirmer leur presence via le formulaire RSVP
                    </p>
                  </div>
                ) : (
                  <div className="border border-[#9CD9F6]/30 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-[#9CD9F6]/10">
                        <tr>
                          <th className="text-left py-3 px-4 text-sm font-medium text-[#004645]">Nom</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-[#004645]">Email</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-[#004645]">Evenement</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-[#004645]">Date confirmation</th>
                          <th className="text-center py-3 px-4 text-sm font-medium text-[#004645]">QR Code</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#9CD9F6]/20">
                        {guests
                          .filter(g => g.rsvp?.attending === true)
                          .map((guest) => (
                            <tr key={guest.id} className="hover:bg-[#9CD9F6]/5">
                              <td className="py-3 px-4">
                                <span className="font-medium text-[#004645]">
                                  {guest.firstName} {guest.lastName}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-sm text-[#004645]/70">
                                {guest.email}
                              </td>
                              <td className="py-3 px-4 text-sm text-[#004645]/70">
                                {guest.event.name}
                              </td>
                              <td className="py-3 px-4 text-sm text-[#004645]/70">
                                {guest.rsvp?.createdAt && new Date(guest.rsvp.createdAt).toLocaleDateString('fr-FR', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </td>
                              <td className="py-3 px-4 text-center">
                                <Badge variant="outline" className="border-green-600 text-green-600">
                                  <QrCode className="h-3 w-3 mr-1" />
                                  Pret
                                </Badge>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Convocation Dialog */}
      <SendConvocationsDialog
        eventId={eventFilter !== 'all' ? eventFilter : (events[0]?.id || '')}
        confirmedGuests={guests.filter(g => g.rsvp?.attending === true && (eventFilter === 'all' || g.event.id === eventFilter))}
        open={convocationDialogOpen}
        onOpenChange={setConvocationDialogOpen}
        onComplete={fetchData}
      />
    </div>
  )
}
