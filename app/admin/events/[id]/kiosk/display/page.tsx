"use client"

import { useEffect, useState, useCallback } from 'react'
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
  skinTone: string
  zone: 'pool' | 'lounge-left' | 'lounge-right' | 'terrace'
  isWalking: boolean
  direction: 'left' | 'right'
}

// Isometric zones (adjusted for isometric projection)
const ZONES = {
  'pool': { x: 35, y: 35, width: 30, height: 25 },
  'lounge-left': { x: 10, y: 25, width: 20, height: 35 },
  'lounge-right': { x: 70, y: 25, width: 20, height: 35 },
  'terrace': { x: 25, y: 65, width: 50, height: 15 },
}

const GUEST_COLORS = [
  '#FF6B9D', '#C084FC', '#60A5FA', '#34D399', '#FBBF24',
  '#F87171', '#A78BFA', '#38BDF8', '#4ADE80', '#FB923C'
]

const SKIN_TONES = ['#FFDFC4', '#F0C8A0', '#D4A574', '#8D5524', '#5C3836']

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
  const [time, setTime] = useState(0)

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/events/${eventId}/checkin-guests`)
      if (response.ok) {
        const data = await response.json()
        setEvent(data.event)
        setStats(data.stats)

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

  // Initialize animated guests
  useEffect(() => {
    const newAnimatedGuests: AnimatedGuest[] = guests.map((guest, index) => {
      const existing = animatedGuests.find(ag => ag.id === guest.id)
      if (existing) return existing

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
        speed: 0.15 + Math.random() * 0.2,
        color: GUEST_COLORS[index % GUEST_COLORS.length],
        skinTone: SKIN_TONES[index % SKIN_TONES.length],
        zone,
        isWalking: false,
        direction: Math.random() > 0.5 ? 'left' : 'right'
      }
    })

    setAnimatedGuests(newAnimatedGuests)
  }, [guests])

  // Animation loop
  useEffect(() => {
    const moveGuests = () => {
      setTime(t => t + 1)
      setAnimatedGuests(prev => prev.map(guest => {
        const dx = guest.targetX - guest.x
        const dy = guest.targetY - guest.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < 0.5) {
          const zoneData = ZONES[guest.zone]
          // Small chance to change zones
          const zones = Object.keys(ZONES) as Array<keyof typeof ZONES>
          const newZone = Math.random() > 0.9 ? zones[Math.floor(Math.random() * zones.length)] : guest.zone
          const newZoneData = ZONES[newZone]

          return {
            ...guest,
            targetX: newZoneData.x + Math.random() * newZoneData.width,
            targetY: newZoneData.y + Math.random() * newZoneData.height,
            isWalking: false,
            zone: newZone
          }
        }

        return {
          ...guest,
          x: guest.x + (dx / distance) * guest.speed,
          y: guest.y + (dy / distance) * guest.speed,
          isWalking: true,
          direction: dx > 0 ? 'right' : 'left'
        }
      }))
    }

    const interval = setInterval(moveGuests, 50)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [fetchData])

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

  // Cute character component
  const Character = ({ guest }: { guest: AnimatedGuest }) => {
    const bobOffset = guest.isWalking ? Math.sin(time * 0.3) * 0.5 : 0
    const scale = guest.direction === 'left' ? -1 : 1

    return (
      <g transform={`translate(${guest.x}, ${guest.y + bobOffset})`}>
        {/* Shadow */}
        <ellipse cx="0" cy="3" rx="2.5" ry="1" fill="rgba(0,0,0,0.2)" />

        {/* Body */}
        <ellipse cx="0" cy="0" rx="2" ry="2.5" fill={guest.color} />

        {/* Head */}
        <circle cx="0" cy="-3" r="2" fill={guest.skinTone} />

        {/* Hair */}
        <ellipse cx="0" cy="-4" rx="2.2" ry="1.2" fill={guest.color} />

        {/* Eyes */}
        <g transform={`scale(${scale}, 1)`}>
          <circle cx="-0.6" cy="-3" r="0.4" fill="#333" />
          <circle cx="0.6" cy="-3" r="0.4" fill="#333" />
          {/* Blush */}
          <ellipse cx="-1.2" cy="-2.5" rx="0.4" ry="0.2" fill="#FFB6C1" opacity="0.6" />
          <ellipse cx="1.2" cy="-2.5" rx="0.4" ry="0.2" fill="#FFB6C1" opacity="0.6" />
        </g>

        {/* Cute smile */}
        <path d="M -0.5 -2.3 Q 0 -1.8 0.5 -2.3" stroke="#333" strokeWidth="0.3" fill="none" />
      </g>
    )
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-[#87CEEB] via-[#B0E0E6] to-[#E0F7FF] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 bg-white/80 backdrop-blur-md border-b border-white/50 p-4 z-20">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#FF6B9D] to-[#C084FC] bg-clip-text text-transparent">
              {event?.name || 'Chargement...'}
            </h1>
            <p className="text-gray-500 text-sm">Piscine Molitor • Live</p>
          </div>

          {!isEventStarted && (
            <div className="flex items-center gap-2 bg-gradient-to-r from-[#FF6B9D] to-[#C084FC] rounded-2xl px-5 py-2 shadow-lg">
              <Clock className="h-5 w-5 text-white" />
              <span className="text-white font-bold font-mono text-xl">
                {String(countdown.hours).padStart(2, '0')}:
                {String(countdown.minutes).padStart(2, '0')}:
                {String(countdown.seconds).padStart(2, '0')}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main visualization */}
      <div className="flex-1 relative overflow-hidden">
        {/* Animated clouds */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute bg-white rounded-full opacity-80"
              style={{
                width: `${80 + i * 40}px`,
                height: `${40 + i * 20}px`,
                top: `${5 + i * 8}%`,
                left: `${(time * 0.02 + i * 25) % 120 - 20}%`,
                filter: 'blur(2px)'
              }}
            />
          ))}
        </div>

        {/* Isometric Pool Scene */}
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="xMidYMid meet"
          style={{ transform: 'rotateX(60deg) rotateZ(-45deg) scale(1.2)', transformOrigin: 'center center' }}
        >
          <defs>
            {/* Water gradient */}
            <linearGradient id="waterGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#40E0D0" />
              <stop offset="50%" stopColor="#00CED1" />
              <stop offset="100%" stopColor="#48D1CC" />
            </linearGradient>

            {/* Pool tile pattern */}
            <pattern id="tiles" width="5" height="5" patternUnits="userSpaceOnUse">
              <rect width="5" height="5" fill="#F0F8FF" />
              <rect width="4.8" height="4.8" x="0.1" y="0.1" fill="#E6F3FF" rx="0.2" />
            </pattern>

            {/* Pink tile pattern for deck */}
            <pattern id="pinkTiles" width="4" height="4" patternUnits="userSpaceOnUse">
              <rect width="4" height="4" fill="#FFE4EC" />
              <rect width="3.8" height="3.8" x="0.1" y="0.1" fill="#FFD4E5" rx="0.1" />
            </pattern>

            {/* Shadow filter */}
            <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="1" dy="1" stdDeviation="1" floodOpacity="0.3" />
            </filter>
          </defs>

          {/* Ground/Deck */}
          <rect x="5" y="5" width="90" height="90" fill="url(#pinkTiles)" rx="3" />

          {/* Pool border */}
          <rect x="30" y="25" width="40" height="45" fill="#E8E8E8" rx="2" filter="url(#shadow)" />

          {/* Pool water */}
          <rect x="32" y="27" width="36" height="41" fill="url(#waterGradient)" rx="1">
            <animate attributeName="opacity" values="0.9;1;0.9" dur="2s" repeatCount="indefinite" />
          </rect>

          {/* Pool lane lines */}
          {[...Array(5)].map((_, i) => (
            <line
              key={`lane-${i}`}
              x1={32 + (i + 1) * 6}
              y1="28"
              x2={32 + (i + 1) * 6}
              y2="67"
              stroke="#00BFFF"
              strokeWidth="0.3"
              strokeDasharray="2,1"
              opacity="0.5"
            />
          ))}

          {/* Water reflections */}
          {[...Array(3)].map((_, i) => (
            <ellipse
              key={`reflection-${i}`}
              cx={40 + i * 12}
              cy={40 + i * 8}
              rx="8"
              ry="3"
              fill="white"
              opacity="0.3"
            >
              <animate attributeName="opacity" values="0.2;0.4;0.2" dur={`${2 + i}s`} repeatCount="indefinite" />
            </ellipse>
          ))}

          {/* Decorative plants */}
          {[[8, 15], [85, 15], [8, 80], [85, 80]].map(([x, y], i) => (
            <g key={`plant-${i}`} transform={`translate(${x}, ${y})`}>
              <ellipse cx="0" cy="2" rx="3" ry="1" fill="#8B4513" />
              <ellipse cx="0" cy="0" rx="4" ry="3" fill="#228B22" />
              <ellipse cx="-1" cy="-1" rx="2" ry="2" fill="#32CD32" />
              <ellipse cx="1" cy="0" rx="2" ry="2" fill="#3CB371" />
            </g>
          ))}

          {/* Lounge chairs - Left */}
          {[...Array(3)].map((_, i) => (
            <g key={`chair-left-${i}`} transform={`translate(15, ${30 + i * 12})`}>
              <rect x="-4" y="-2" width="8" height="6" fill="#FF69B4" rx="1" filter="url(#shadow)" />
              <rect x="-3" y="-1" width="6" height="4" fill="#FFB6C1" rx="0.5" />
              <ellipse cx="0" cy="-3" rx="3" ry="1" fill="#FF69B4" />
            </g>
          ))}

          {/* Lounge chairs - Right */}
          {[...Array(3)].map((_, i) => (
            <g key={`chair-right-${i}`} transform={`translate(85, ${30 + i * 12})`}>
              <rect x="-4" y="-2" width="8" height="6" fill="#87CEEB" rx="1" filter="url(#shadow)" />
              <rect x="-3" y="-1" width="6" height="4" fill="#B0E0E6" rx="0.5" />
              <ellipse cx="0" cy="-3" rx="3" ry="1" fill="#87CEEB" />
            </g>
          ))}

          {/* Umbrella */}
          <g transform="translate(20, 75)">
            <line x1="0" y1="0" x2="0" y2="-8" stroke="#8B4513" strokeWidth="0.8" />
            <ellipse cx="0" cy="-8" rx="6" ry="2" fill="#FF6B9D" />
            <ellipse cx="0" cy="-8.5" rx="5" ry="1.5" fill="#FF8FAB" />
          </g>

          <g transform="translate(80, 75)">
            <line x1="0" y1="0" x2="0" y2="-8" stroke="#8B4513" strokeWidth="0.8" />
            <ellipse cx="0" cy="-8" rx="6" ry="2" fill="#C084FC" />
            <ellipse cx="0" cy="-8.5" rx="5" ry="1.5" fill="#D4A5FF" />
          </g>

          {/* Animated guests */}
          {animatedGuests.map((guest) => (
            <Character key={guest.id} guest={guest} />
          ))}
        </svg>

        {/* Stats panel */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
          <div className="bg-white/90 backdrop-blur-md rounded-3xl px-8 py-5 shadow-2xl border border-white/50 flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg">
                <CheckCircle2 className="h-7 w-7 text-white" />
              </div>
              <div>
                <p className="text-4xl font-bold text-gray-800">{stats.checkedIn}</p>
                <p className="text-gray-500 text-sm font-medium">Arrivés</p>
              </div>
            </div>

            <div className="w-px h-16 bg-gray-200" />

            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-lg">
                <Users className="h-7 w-7 text-white" />
              </div>
              <div>
                <p className="text-4xl font-bold text-gray-800">{stats.total}</p>
                <p className="text-gray-500 text-sm font-medium">Attendus</p>
              </div>
            </div>

            <div className="w-px h-16 bg-gray-200" />

            <div className="text-center">
              <p className="text-4xl font-bold bg-gradient-to-r from-[#FF6B9D] to-[#C084FC] bg-clip-text text-transparent">
                {stats.percentageCheckedIn}%
              </p>
              <p className="text-gray-500 text-sm font-medium">Présence</p>
            </div>
          </div>
        </div>

        {/* Live badge */}
        <div className="absolute top-4 right-4 flex items-center gap-2 bg-white/90 backdrop-blur-md rounded-full px-4 py-2 shadow-lg z-10">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          <span className="text-gray-700 text-sm font-bold">EN DIRECT</span>
        </div>

        {/* Guest count bubble */}
        {animatedGuests.length > 0 && (
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md rounded-2xl px-4 py-2 shadow-lg z-10">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {animatedGuests.slice(0, 4).map((g, i) => (
                  <div
                    key={g.id}
                    className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: g.color, zIndex: 4 - i }}
                  >
                    {g.initials}
                  </div>
                ))}
                {animatedGuests.length > 4 && (
                  <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-gray-600 text-xs font-bold">
                    +{animatedGuests.length - 4}
                  </div>
                )}
              </div>
              <span className="text-gray-600 text-sm">sur place</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
