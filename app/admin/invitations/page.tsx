"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import {
  Mail, Search, Filter, CheckCircle, XCircle, Clock,
  ExternalLink, Copy, Send
} from 'lucide-react'
import Link from 'next/link'

interface Guest {
  id: string
  firstName: string
  lastName: string
  email: string
  company: string | null
  token: string
  rsvp: {
    attending: boolean
    createdAt: string
  } | null
  event: {
    id: string
    name: string
    startsAt: string
  }
}

export default function InvitationsPage() {
  const [guests, setGuests] = useState<Guest[]>([])
  const [filteredGuests, setFilteredGuests] = useState<Guest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [copiedToken, setCopiedToken] = useState<string | null>(null)

  useEffect(() => {
    fetchGuests()
  }, [])

  useEffect(() => {
    filterGuests()
  }, [guests, searchTerm, statusFilter])

  const fetchGuests = async () => {
    try {
      const response = await fetch('/api/admin/guests')
      if (response.ok) {
        const data = await response.json()
        setGuests(data)
      }
    } catch (error) {
      console.error('Error fetching guests:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterGuests = () => {
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
        <h1 className="text-3xl font-bold text-[#004645]" style={{ fontFamily: "var(--font-abril)" }}>
          Gestion des invitations
        </h1>
        <p className="text-[#004645]/70 mt-1">
          Gérez et suivez toutes vos invitations
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#004645]">Total</CardTitle>
            <Mail className="h-4 w-4 text-[#009197]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#004645]" style={{ fontFamily: "var(--font-abril)" }}>
              {stats.total}
            </div>
            <p className="text-xs text-[#004645]/70">Invitations envoyées</p>
          </CardContent>
        </Card>

        <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#004645]">Confirmés</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600" style={{ fontFamily: "var(--font-abril)" }}>
              {stats.confirmed}
            </div>
            <p className="text-xs text-[#004645]/70">
              {stats.total > 0 ? Math.round((stats.confirmed / stats.total) * 100) : 0}% du total
            </p>
          </CardContent>
        </Card>

        <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#004645]">Refusés</CardTitle>
            <XCircle className="h-4 w-4 text-[#FF4713]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#FF4713]" style={{ fontFamily: "var(--font-abril)" }}>
              {stats.declined}
            </div>
            <p className="text-xs text-[#004645]/70">
              {stats.total > 0 ? Math.round((stats.declined / stats.total) * 100) : 0}% du total
            </p>
          </CardContent>
        </Card>

        <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur">
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
      </div>

      {/* Filters */}
      <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur mb-6">
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

      {/* Invitations Table */}
      <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-[#004645]">Invitations ({filteredGuests.length})</CardTitle>
          <CardDescription>Liste complète de toutes les invitations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredGuests.length === 0 ? (
              <div className="text-center py-12">
                <Mail className="h-12 w-12 text-[#009197] mx-auto mb-4 opacity-50" />
                <p className="text-[#004645]/70">Aucune invitation trouvée</p>
              </div>
            ) : (
              filteredGuests.map((guest) => (
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
                      {guest.company && (
                        <p>{guest.company}</p>
                      )}
                      <p className="text-xs">
                        Événement: {guest.event.name} •{' '}
                        {new Date(guest.event.startsAt).toLocaleDateString('fr-FR')}
                      </p>
                      {guest.rsvp && (
                        <p className="text-xs">
                          Répondu le: {new Date(guest.rsvp.createdAt).toLocaleDateString('fr-FR')}
                        </p>
                      )}
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
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
