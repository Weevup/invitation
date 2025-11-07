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
  Users, Search, Upload, Download, Plus, Edit, Trash2,
  CheckCircle, XCircle, Clock, Filter
} from 'lucide-react'
import Link from 'next/link'

interface Guest {
  id: string
  firstName: string
  lastName: string
  email: string
  company: string | null
  rsvp: {
    attending: boolean
  } | null
  event: {
    id: string
    name: string
  }
}

export default function GuestsPage() {
  const [guests, setGuests] = useState<Guest[]>([])
  const [filteredGuests, setFilteredGuests] = useState<Guest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [eventFilter, setEventFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [events, setEvents] = useState<Array<{ id: string; name: string }>>([])

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    filterGuests()
  }, [guests, searchTerm, eventFilter, statusFilter])

  const fetchData = async () => {
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
      console.error('Error fetching data:', error)
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
  }

  const handleExportCSV = () => {
    let csv = 'Prénom,Nom,Email,Entreprise,Événement,Statut\n'

    filteredGuests.forEach(guest => {
      const status = !guest.rsvp ? 'En attente' : guest.rsvp.attending ? 'Confirmé' : 'Refusé'
      csv += `${guest.firstName},${guest.lastName},${guest.email},${guest.company || ''},${guest.event.name},${status}\n`
    })

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `invites-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#004645]" style={{ fontFamily: "var(--font-abril)" }}>
              Gestion des invités
            </h1>
            <p className="text-[#004645]/70 mt-1">
              Gérez votre liste d&apos;invités
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
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un invité
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur">
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
              {stats.total > 0 ? Math.round((stats.confirmed / stats.total) * 100) : 0}%
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
              {stats.total > 0 ? Math.round((stats.declined / stats.total) * 100) : 0}%
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
          <CardTitle className="text-[#004645]">Invités ({filteredGuests.length})</CardTitle>
          <CardDescription>Liste complète de tous les invités</CardDescription>
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
                          <Button variant="ghost" size="sm" className="text-[#009197] hover:text-[#004645]">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-[#FF4713] hover:text-red-700">
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
    </div>
  )
}
