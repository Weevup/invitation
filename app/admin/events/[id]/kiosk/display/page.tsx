"use client"

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { Users, CheckCircle2, Clock } from 'lucide-react'

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

interface Guest {
  id: string
  firstName: string
  lastName: string
}

interface AnimatedGuest {
  id: string
  initials: string
  x: number
  y: number
  targetX: number
  targetY: number
  speed: number
  color: string
  zone: 'pool' | 'lounge-left' | 'lounge-right' | 'terrace'
}

// Define zones where guests can be
const ZONES = {
  'pool': { x: 15, y: 30, width: 70, height: 45 },
  'lounge-left': { x: 2, y: 25, width: 10, height: 55 },
  'lounge-right': { x: 88, y: 25, width: 10, height: 55 },
  'terrace': { x: 20, y: 80, width: 60, height: 15 },
}

const GUEST_COLORS = [
  '#FF4713', '#FF6B3D', '#009197', '#004645', '#E91E63',
  '#9C27B0', '#3F51B5', '#03A9F4', '#4CAF50', '#FFC107'
]

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
  const [guests, setGuests] = useState<Guest[]>([])
  const [animatedGuests, setAnimatedGuests] = useState<AnimatedGuest[]>([])
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [isEventStarted, setIsEventStarted] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/events/${eventId}/checkin-guests`)
      if (response.ok) {
        const data = await response.json()
        setEvent(data.event)
        setStats(data.stats)

        // Get checked-in guests
        const checkedIn = data.guests
          .filter((g: { checkins?: unknown[] }) => g.checkins && g.checkins.length > 0)
          .map((g: { id: string; firstName: string; lastName: string }) => ({
            id: g.id,
            firstName: g.firstName,
            lastName: g.lastName,
          }))

        setGuests(checkedIn)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }, [eventId])

  // Initialize and update animated guests
  useEffect(() => {
    const newAnimatedGuests: AnimatedGuest[] = guests.map((guest, index) => {
      // Check if guest already exists in animated list
      const existing = animatedGuests.find(ag => ag.id === guest.id)
      if (existing) return existing

      // Assign zone based on index distribution
      const zones = Object.keys(ZONES) as Array<keyof typeof ZONES>
      const zone = zones[index % zones.length]
      const zoneData = ZONES[zone]

      const x = zoneData.x + Math.random() * zoneData.width
      const y = zoneData.y + Math.random() * zoneData.height

      return {
        id: guest.id,
        initials: `${guest.firstName.charAt(0)}${guest.lastName.charAt(0)}`,
        x,
        y,
        targetX: x,
        targetY: y,
        speed: 0.3 + Math.random() * 0.5,
        color: GUEST_COLORS[index % GUEST_COLORS.length],
        zone
      }
    })

    setAnimatedGuests(newAnimatedGuests)
  }, [guests])

  // Animation loop for guest movement
  useEffect(() => {
    const moveGuests = () => {
      setAnimatedGuests(prev => prev.map(guest => {
        // Calculate distance to target
        const dx = guest.targetX - guest.x
        const dy = guest.targetY - guest.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        // If close to target, pick new target
        if (distance < 1) {
          const zoneData = ZONES[guest.zone]
          return {
            ...guest,
            targetX: zoneData.x + Math.random() * zoneData.width,
            targetY: zoneData.y + Math.random() * zoneData.height,
          }
        }

        // Move towards target
        return {
          ...guest,
          x: guest.x + (dx / distance) * guest.speed,
          y: guest.y + (dy / distance) * guest.speed,
        }
      }))
    }

    const interval = setInterval(moveGuests, 50)
    return () => clearInterval(interval)
  }, [])

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

  return (
    <div className="fixed inset-0 bg-[#1a1a2e] flex flex-col overflow-hidden">
      {/* Header with event name */}
      <div className="flex-shrink-0 bg-gradient-to-b from-black/50 to-transparent p-4 z-10">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              {event?.name || 'Chargement...'}
            </h1>
            <p className="text-white/60 text-sm">Piscine Molitor • Vue en direct</p>
          </div>

          {/* Countdown */}
          {!isEventStarted && (
            <div className="flex items-center gap-2 bg-black/30 rounded-xl px-4 py-2">
              <Clock className="h-5 w-5 text-[#FF4713]" />
              <span className="text-white font-mono text-lg">
                {String(countdown.hours).padStart(2, '0')}:
                {String(countdown.minutes).padStart(2, '0')}:
                {String(countdown.seconds).padStart(2, '0')}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main visualization area */}
      <div className="flex-1 relative">
        {/* Molitor Pool SVG - Top down view */}
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="xMidYMid slice"
        >
          {/* Background - Molitor yellow/ochre walls */}
          <rect x="0" y="0" width="100" height="100" fill="#1a1a2e" />

          {/* Pool structure - Art Deco style */}
          {/* Main pool area background */}
          <rect x="10" y="20" width="80" height="60" fill="#C4A962" rx="2" />

          {/* Gallery/Cabins - Left side */}
          <rect x="0" y="20" width="12" height="60" fill="#B8963E" />
          {[...Array(8)].map((_, i) => (
            <g key={`cabin-left-${i}`}>
              <rect x="1" y={22 + i * 7} width="10" height="6" fill="#2C5F6E" rx="0.5" />
              <rect x="2" y={23 + i * 7} width="3" height="4" fill="#87CEEB" opacity="0.3" />
            </g>
          ))}

          {/* Gallery/Cabins - Right side */}
          <rect x="88" y="20" width="12" height="60" fill="#B8963E" />
          {[...Array(8)].map((_, i) => (
            <g key={`cabin-right-${i}`}>
              <rect x="89" y={22 + i * 7} width="10" height="6" fill="#2C5F6E" rx="0.5" />
              <rect x="95" y={23 + i * 7} width="3" height="4" fill="#87CEEB" opacity="0.3" />
            </g>
          ))}

          {/* Upper gallery */}
          <rect x="10" y="20" width="80" height="8" fill="#B8963E" />
          <rect x="40" y="20" width="20" height="8" fill="#2C5F6E" />

          {/* The Pool - Main basin */}
          <rect x="14" y="28" width="72" height="48" fill="#006994" rx="1" />

          {/* Pool water effect - lanes */}
          {[...Array(6)].map((_, i) => (
            <line
              key={`lane-${i}`}
              x1={14 + (i + 1) * 12}
              y1="29"
              x2={14 + (i + 1) * 12}
              y2="75"
              stroke="#004d6e"
              strokeWidth="0.3"
              strokeDasharray="2,2"
            />
          ))}

          {/* Water ripple effect */}
          <ellipse cx="50" cy="52" rx="30" ry="15" fill="#0088aa" opacity="0.3">
            <animate attributeName="rx" values="28;32;28" dur="3s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.2;0.4;0.2" dur="3s" repeatCount="indefinite" />
          </ellipse>

          {/* Pool edge/border */}
          <rect x="14" y="28" width="72" height="48" fill="none" stroke="#87CEEB" strokeWidth="0.5" rx="1" />

          {/* Terrace/Lounge area at bottom */}
          <rect x="14" y="78" width="72" height="18" fill="#3D3D5C" rx="1" />

          {/* Lounge chairs on terrace */}
          {[...Array(6)].map((_, i) => (
            <g key={`chair-${i}`}>
              <rect x={20 + i * 11} y="82" width="6" height="10" fill="#8B7355" rx="0.5" />
              <ellipse cx={23 + i * 11} cy="80" rx="2" ry="1" fill="#8B7355" />
            </g>
          ))}

          {/* Plants/decoration */}
          <circle cx="16" cy="82" r="2" fill="#228B22" />
          <circle cx="84" cy="82" r="2" fill="#228B22" />

          {/* Glass roof lines */}
          {[...Array(12)].map((_, i) => (
            <line
              key={`roof-${i}`}
              x1={5 + i * 8}
              y1="15"
              x2={5 + i * 8}
              y2="85"
              stroke="#4a90a4"
              strokeWidth="0.2"
              opacity="0.3"
            />
          ))}

          {/* Animated guests */}
          {animatedGuests.map((guest) => (
            <g key={guest.id} style={{ transition: 'transform 0.05s linear' }}>
              {/* Guest shadow */}
              <ellipse
                cx={guest.x}
                cy={guest.y + 1}
                rx="1.5"
                ry="0.5"
                fill="rgba(0,0,0,0.3)"
              />
              {/* Guest body */}
              <circle
                cx={guest.x}
                cy={guest.y}
                r="1.8"
                fill={guest.color}
                stroke="white"
                strokeWidth="0.3"
              />
              {/* Guest initials */}
              <text
                x={guest.x}
                y={guest.y + 0.5}
                textAnchor="middle"
                fontSize="1.2"
                fill="white"
                fontWeight="bold"
              >
                {guest.initials}
              </text>
            </g>
          ))}
        </svg>

        {/* Stats overlay */}
        <div className="absolute bottom-4 left-4 right-4 flex justify-center gap-4 z-10">
          <div className="bg-black/60 backdrop-blur-md rounded-2xl px-6 py-4 flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-3xl font-bold text-white">{stats.checkedIn}</p>
                <p className="text-white/60 text-xs">Arrivés</p>
              </div>
            </div>

            <div className="w-px h-12 bg-white/20" />

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-3xl font-bold text-white">{stats.total}</p>
                <p className="text-white/60 text-xs">Attendus</p>
              </div>
            </div>

            <div className="w-px h-12 bg-white/20" />

            <div className="text-center">
              <p className="text-3xl font-bold text-[#FF4713]">{stats.percentageCheckedIn}%</p>
              <p className="text-white/60 text-xs">Taux de présence</p>
            </div>
          </div>
        </div>

        {/* Live indicator */}
        <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/40 rounded-full px-3 py-1.5 z-10">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-white/80 text-xs font-medium">LIVE</span>
        </div>
      </div>
    </div>
  )
}
