"use client"

import { useEffect, useState } from 'react'
import { useParams, usePathname } from 'next/navigation'
import Link from 'next/link'
import { WeevupLogo } from '@/components/weevup-logo'
import {
  LayoutDashboard,
  Bell,
  Mail,
  UserCheck,
  Sparkles,
  Users,
  QrCode,
  Settings,
  ChevronLeft,
  Calendar,
  MapPin,
  Plane
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useEventModules } from '@/lib/modules'

interface EventData {
  name: string
  startsAt: string
  venueName?: string
  city?: string
}

export default function EventLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const params = useParams()
  const pathname = usePathname()
  const eventId = params.id as string
  const [event, setEvent] = useState<EventData | null>(null)

  // Check which modules are active
  const { hasModule } = useEventModules(eventId)

  useEffect(() => {
    fetch(`/api/admin/events/${eventId}`)
      .then(res => res.json())
      .then(data => setEvent(data))
      .catch(console.error)
  }, [eventId])

  // Base navigation items (always visible)
  const baseNavItems = [
    {
      label: 'Vue d\'ensemble',
      href: `/admin/events/${eventId}`,
      icon: LayoutDashboard,
      exact: true,
    },
    {
      label: 'Save the Date',
      href: `/admin/events/${eventId}/save-the-date`,
      icon: Bell,
    },
    {
      label: 'Invitation',
      href: `/admin/events/${eventId}/invitation`,
      icon: Mail,
    },
    {
      label: 'RSVP',
      href: `/admin/events/${eventId}/rsvp-config`,
      icon: UserCheck,
    },
    {
      label: 'Showcase',
      href: `/admin/events/${eventId}/showcase`,
      icon: Sparkles,
    },
    {
      label: 'Invités',
      href: `/admin/events/${eventId}/guests`,
      icon: Users,
    },
    {
      label: 'Check-in',
      href: `/admin/events/${eventId}/checkin`,
      icon: QrCode,
    },
    {
      label: 'Communications',
      href: `/admin/events/${eventId}/communications`,
      icon: Settings,
    },
  ]

  // Module-based navigation items (conditionally added)
  const moduleNavItems = []

  if (hasModule('PROGRAM')) {
    moduleNavItems.push({
      label: 'Programme',
      href: `/admin/events/${eventId}/program`,
      icon: Calendar,
    })
  }

  if (hasModule('TRANSPORT')) {
    moduleNavItems.push({
      label: 'Transport',
      href: `/admin/events/${eventId}/transport`,
      icon: Plane,
    })
  }

  // Combine all nav items
  const navItems = [...baseNavItems, ...moduleNavItems]

  const isActive = (item: typeof navItems[0]) => {
    if (item.exact) {
      return pathname === item.href
    }
    return pathname?.startsWith(item.href)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#9CD9F6] via-white to-[#9CD9F6]">
      {/* Lignes graphiques décoratives */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <svg className="absolute top-0 right-0 w-1/4 h-1/4" viewBox="0 0 200 200">
          <path
            d="M 0 50 Q 50 50, 50 100 T 100 150 T 150 200"
            stroke="#FF4713"
            strokeWidth="2"
            fill="none"
            opacity="0.3"
          />
        </svg>
        <svg className="absolute bottom-0 left-0 w-1/4 h-1/4" viewBox="0 0 200 200">
          <path
            d="M 200 150 Q 150 150, 150 100 T 100 50 T 50 0"
            stroke="#FF4713"
            strokeWidth="2"
            fill="none"
            opacity="0.3"
          />
        </svg>
      </div>

      {/* Header */}
      <header className="relative border-b border-[#9CD9F6]/30 bg-white/80 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <WeevupLogo className="w-10 h-10" />
              <div>
                <Link
                  href="/admin"
                  className="text-sm text-[#004645]/70 hover:text-[#FF4713] mb-1 flex items-center gap-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Retour au dashboard
                </Link>
                {event && (
                  <>
                    <h1 className="text-2xl font-bold text-[#004645]" style={{ fontFamily: "var(--font-abril)" }}>
                      {event.name}
                    </h1>
                    <div className="flex items-center gap-4 text-sm text-[#004645]/70">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-[#009197]" />
                        {new Date(event.startsAt).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                      {event.venueName && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4 text-[#009197]" />
                          {event.venueName}, {event.city}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="relative flex">
        {/* Sidebar */}
        <aside className="w-64 border-r border-[#9CD9F6]/30 bg-white/60 backdrop-blur min-h-[calc(100vh-88px)] sticky top-[88px]">
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
                    "text-sm font-medium",
                    active
                      ? "bg-gradient-to-r from-[#004645] to-[#009197] text-white shadow-lg"
                      : "text-[#004645]/70 hover:bg-[#9CD9F6]/20 hover:text-[#004645]"
                  )}
                >
                  <Icon className={cn("h-5 w-5", active ? "text-white" : "text-[#009197]")} />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
