"use client"

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { Users, CheckCircle2, Clock, Sparkles, TrendingUp } from 'lucide-react'

interface Event {
  id: string
  name: string
  startsAt: string
  venueName?: string
}

interface CheckinStats {
  total: number
  checkedIn: number
  pending: number
  percentageCheckedIn: number
}

interface RecentCheckin {
  id: string
  firstName: string
  lastName: string
  company?: string
  checkedInAt: string
}

export default function DisplayPage() {
  const params = useParams()
  const eventId = params.id as string

  const [event, setEvent] = useState<Event | null>(null)
  const [stats, setStats] = useState<CheckinStats>({
    total: 0,
    checkedIn: 0,
    pending: 0,
    percentageCheckedIn: 0
  })
  const [recentCheckins, setRecentCheckins] = useState<RecentCheckin[]>([])
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [isEventStarted, setIsEventStarted] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/events/${eventId}/checkin-guests`)
      if (response.ok) {
        const data = await response.json()
        setEvent(data.event)
        setStats(data.stats)

        // Get recent checkins (last 5)
        const recent = data.guests
          .filter((g: { checkins?: { checkedInAt: string }[] }) => g.checkins && g.checkins.length > 0)
          .sort((a: { checkins: { checkedInAt: string }[] }, b: { checkins: { checkedInAt: string }[] }) =>
            new Date(b.checkins[0].checkedInAt).getTime() - new Date(a.checkins[0].checkedInAt).getTime()
          )
          .slice(0, 5)
          .map((g: { id: string; firstName: string; lastName: string; company?: string; checkins: { checkedInAt: string }[] }) => ({
            id: g.id,
            firstName: g.firstName,
            lastName: g.lastName,
            company: g.company,
            checkedInAt: g.checkins[0].checkedInAt
          }))

        setRecentCheckins(recent)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }, [eventId])

  // Fetch data on mount and refresh every 5 seconds
  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [fetchData])

  // Countdown timer
  useEffect(() => {
    if (!event?.startsAt) return

    const updateCountdown = () => {
      const now = new Date().getTime()
      const eventTime = new Date(event.startsAt).getTime()
      const distance = eventTime - now

      if (distance < 0) {
        setIsEventStarted(true)
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        return
      }

      setIsEventStarted(false)
      setCountdown({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      })
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)
    return () => clearInterval(interval)
  }, [event?.startsAt])

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#004645] via-[#006668] to-[#009197] p-4 sm:p-8 flex flex-col">
      {/* Event Name */}
      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-3xl sm:text-5xl font-bold text-white mb-2">
          {event?.name || 'Chargement...'}
        </h1>
        {event?.venueName && (
          <p className="text-white/70 text-lg sm:text-xl">{event.venueName}</p>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 max-w-6xl mx-auto w-full">

        {/* Left Column - Countdown & Stats */}
        <div className="space-y-4 sm:space-y-6">

          {/* Countdown Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="h-6 w-6 text-[#FF4713]" />
              <h2 className="text-xl font-semibold text-white">
                {isEventStarted ? "L'événement a commencé !" : "Début dans"}
              </h2>
            </div>

            {!isEventStarted ? (
              <div className="grid grid-cols-4 gap-2 sm:gap-4">
                {[
                  { value: countdown.days, label: 'Jours' },
                  { value: countdown.hours, label: 'Heures' },
                  { value: countdown.minutes, label: 'Min' },
                  { value: countdown.seconds, label: 'Sec' }
                ].map((item, i) => (
                  <div key={i} className="text-center">
                    <div className="bg-white/20 rounded-2xl p-3 sm:p-4 mb-2">
                      <span className="text-3xl sm:text-5xl font-bold text-white tabular-nums">
                        {String(item.value).padStart(2, '0')}
                      </span>
                    </div>
                    <span className="text-white/70 text-xs sm:text-sm">{item.label}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center py-8">
                <Sparkles className="h-12 w-12 text-[#FF4713] animate-pulse" />
              </div>
            )}
          </div>

          {/* Main Stats */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="h-6 w-6 text-green-400" />
              <h2 className="text-xl font-semibold text-white">Statistiques</h2>
            </div>

            {/* Progress Ring */}
            <div className="flex items-center justify-center mb-6">
              <div className="relative w-40 h-40 sm:w-48 sm:h-48">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="50%"
                    cy="50%"
                    r="45%"
                    fill="none"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="12"
                  />
                  <circle
                    cx="50%"
                    cy="50%"
                    r="45%"
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={`${stats.percentageCheckedIn * 2.83} 283`}
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl sm:text-5xl font-bold text-white">
                    {stats.percentageCheckedIn}%
                  </span>
                  <span className="text-white/70 text-sm">arrivés</span>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/10 rounded-2xl p-4 text-center">
                <Users className="h-6 w-6 text-blue-400 mx-auto mb-2" />
                <p className="text-2xl sm:text-3xl font-bold text-white">{stats.total}</p>
                <p className="text-white/70 text-xs sm:text-sm">Attendus</p>
              </div>
              <div className="bg-white/10 rounded-2xl p-4 text-center">
                <CheckCircle2 className="h-6 w-6 text-green-400 mx-auto mb-2" />
                <p className="text-2xl sm:text-3xl font-bold text-green-400">{stats.checkedIn}</p>
                <p className="text-white/70 text-xs sm:text-sm">Arrivés</p>
              </div>
              <div className="bg-white/10 rounded-2xl p-4 text-center">
                <Clock className="h-6 w-6 text-orange-400 mx-auto mb-2" />
                <p className="text-2xl sm:text-3xl font-bold text-orange-400">{stats.pending}</p>
                <p className="text-white/70 text-xs sm:text-sm">En attente</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Recent Checkins */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle2 className="h-6 w-6 text-green-400" />
            <h2 className="text-xl font-semibold text-white">Dernières arrivées</h2>
          </div>

          {recentCheckins.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-white/50">
              <Users className="h-16 w-16 mb-4 opacity-50" />
              <p className="text-lg">En attente des premiers invités...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentCheckins.map((checkin, index) => (
                <div
                  key={checkin.id}
                  className={`bg-white/10 rounded-2xl p-4 flex items-center gap-4 transition-all ${
                    index === 0 ? 'animate-in slide-in-from-top-2 ring-2 ring-green-400/50' : ''
                  }`}
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF4713] to-[#FF6B3D] flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-lg">
                      {checkin.firstName.charAt(0)}{checkin.lastName.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold truncate">
                      {checkin.firstName} {checkin.lastName}
                    </p>
                    {checkin.company && (
                      <p className="text-white/60 text-sm truncate">{checkin.company}</p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-green-400 font-medium">{formatTime(checkin.checkedInAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Live indicator */}
          <div className="mt-6 flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-white/60 text-sm">Mise à jour en direct</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center mt-6 sm:mt-8">
        <p className="text-white/40 text-xs">
          Powered by Weevup
        </p>
      </div>
    </div>
  )
}
