"use client"

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Users, Mail, Eye, Settings, Plus, ExternalLink, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface Event {
  id: string
  name: string
  slug: string
  startsAt: string
  endsAt?: string
  venueName?: string
  city?: string
  showcaseEnabled: boolean
  _count: {
    guests: number
    rsvps: number
  }
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/admin/events')
      if (response.ok) {
        const data = await response.json()
        setEvents(data)
      }
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#009197] mx-auto mb-4" />
          <p className="text-[#004645]/70">Chargement des événements...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#004645]" style={{ fontFamily: "var(--font-abril)" }}>
              Événements
            </h1>
            <p className="text-[#004645]/70 mt-1">
              Gérez tous vos événements et leurs paramètres
            </p>
          </div>
          <Link href="/admin/events/new">
            <Button className="bg-gradient-to-r from-[#004645] to-[#009197] hover:from-[#006C51] hover:to-[#009197] text-white shadow-lg">
              <Plus className="h-4 w-4 mr-2" />
              Créer un événement
            </Button>
          </Link>
        </div>
      </div>

      {/* Empty State */}
      {events.length === 0 ? (
        <Card className="border-2 border-dashed border-[#9CD9F6] bg-[#9CD9F6]/5">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Calendar className="h-16 w-16 text-[#009197] mb-4" />
            <h3 className="text-xl font-bold text-[#004645] mb-2">Aucun événement</h3>
            <p className="text-[#004645]/70 mb-6 text-center max-w-md">
              Commencez par créer votre premier événement pour envoyer des invitations et gérer vos invités.
            </p>
            <Link href="/admin/events/new">
              <Button className="bg-gradient-to-r from-[#004645] to-[#009197] text-white">
                <Plus className="h-4 w-4 mr-2" />
                Créer mon premier événement
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        /* Events Grid */
        <div className="grid gap-6">
          {events.map((event) => {
            const responseRate = event._count.guests > 0
              ? Math.round((event._count.rsvps / event._count.guests) * 100)
              : 0

            return (
              <Card
                key={event.id}
                className="border-2 border-[#9CD9F6]/30 bg-white/80 backdrop-blur hover:shadow-xl transition-all duration-300 hover:border-[#009197]/50"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-2xl text-[#004645]" style={{ fontFamily: "var(--font-abril)" }}>
                          {event.name}
                        </CardTitle>
                        {event.showcaseEnabled && (
                          <div className="flex items-center gap-1 px-2 py-1 bg-[#009197]/10 text-[#009197] rounded-full text-xs font-medium">
                            <Sparkles className="h-3 w-3" />
                            Vitrine active
                          </div>
                        )}
                      </div>
                      <CardDescription className="flex flex-wrap items-center gap-4 text-base">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>{format(new Date(event.startsAt), 'EEEE d MMMM yyyy', { locale: fr })}</span>
                        </div>
                        {event.venueName && (
                          <div className="flex items-center gap-2">
                            <span>📍</span>
                            <span>{event.venueName}{event.city ? `, ${event.city}` : ''}</span>
                          </div>
                        )}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      {event.showcaseEnabled && (
                        <Link href={`/event/${event.slug}`} target="_blank">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-[#9CD9F6] text-[#009197] hover:bg-[#9CD9F6]/10"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Vitrine
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </Button>
                        </Link>
                      )}
                      <Link href={`/admin/events/${event.id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-[#004645] text-[#004645] hover:bg-[#004645] hover:text-white"
                        >
                          <Settings className="h-4 w-4 mr-1" />
                          Gérer
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-[#004645]/5 rounded-lg">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <Users className="h-4 w-4 text-[#004645]" />
                        <span className="text-xs font-medium text-[#004645]/70">Invités</span>
                      </div>
                      <div className="text-2xl font-bold text-[#004645]">{event._count.guests}</div>
                    </div>
                    <div className="text-center p-4 bg-[#009197]/5 rounded-lg">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <Mail className="h-4 w-4 text-[#009197]" />
                        <span className="text-xs font-medium text-[#009197]/70">Réponses</span>
                      </div>
                      <div className="text-2xl font-bold text-[#009197]">{event._count.rsvps}</div>
                    </div>
                    <div className="text-center p-4 bg-[#FF4713]/5 rounded-lg">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <span className="text-xs font-medium text-[#FF4713]/70">Taux</span>
                      </div>
                      <div className="text-2xl font-bold text-[#FF4713]">{responseRate}%</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
