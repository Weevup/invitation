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
  BarChart3,
  TrendingUp,
  MailOpen,
  Wand2,
  Puzzle,
  Clock3,
  Plane,
  Hotel,
  Users2,
  Database,
  Presentation,
  Trophy,
  PartyPopper,
  CreditCard,
  MessageSquare,
  LineChart,
  FileText,
  Code,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useEventModules } from '@/lib/modules/use-event-modules'
import { Toaster } from '@/components/ui/toaster'
import { createClientLogger } from '@/lib/client-logger'

const logger = createClientLogger({ component: 'Page' })


interface EventData {
  name: string
  startsAt: string
  venueName?: string
  city?: string
}

interface NavigationItem {
  label: string
  href: string
  icon: any
  exact?: boolean
}

interface NavigationSection {
  title: string
  items: NavigationItem[]
  isHeader?: boolean
  isSubGroup?: boolean
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
  const { hasModule, isLoading } = useEventModules(eventId)

  useEffect(() => {
    fetch(`/api/admin/events/${eventId}`)
      .then(res => res.json())
      .then(data => setEvent(data))
      .catch(err => logger.error(err, { action: 'fetchEvent', metadata: { eventId } }))
  }, [eventId])

  // Module-based navigation items (grouped by category)
  const programmationModules: NavigationItem[] = []
  const logistiqueModules: NavigationItem[] = []

  // Only add modules if they're loaded (not during initial loading state)
  if (!isLoading) {
    // PROGRAMMATION GROUP - Programme and related activities
    if (hasModule('PROGRAM')) {
      programmationModules.push({
        label: 'Programme',
        href: `/admin/events/${eventId}/program`,
        icon: Calendar,
      })

      // Workshops/Ateliers - Programme sub-module
      programmationModules.push({
        label: 'Ateliers',
        href: `/admin/events/${eventId}/ateliers`,
        icon: Presentation,
      })

      // Team Building - Programme sub-module
      programmationModules.push({
        label: 'Team Building',
        href: `/admin/events/${eventId}/team-building`,
        icon: Trophy,
      })

      // Activités libres - Programme sub-module
      programmationModules.push({
        label: 'Activités libres',
        href: `/admin/events/${eventId}/activites-libres`,
        icon: PartyPopper,
      })
    }

    // LOGISTIQUE GROUP
    // Transport module
    if (hasModule('TRANSPORT')) {
      logistiqueModules.push({
        label: 'Transport',
        href: `/admin/events/${eventId}/transport`,
        icon: Plane,
      })
    }

    // Accommodation module
    if (hasModule('ACCOMMODATION')) {
      logistiqueModules.push({
        label: 'Hébergement',
        href: `/admin/events/${eventId}/accommodation`,
        icon: Hotel,
      })
    }
  }

  // Navigation organized by sections for better UX
  const navigationSections: NavigationSection[] = [
    {
      title: "🎯 GESTION ÉVÉNEMENT",
      items: [
        {
          label: 'Vue d\'ensemble',
          href: `/admin/events/${eventId}`,
          icon: LayoutDashboard,
          exact: true,
        },
        {
          label: 'Configuration',
          href: `/admin/events/${eventId}/modules`,
          icon: Puzzle,
        },
        {
          label: 'Données',
          href: `/admin/events/${eventId}/data-admin`,
          icon: Database,
        },
        {
          label: 'Showcase',
          href: `/admin/events/${eventId}/showcase`,
          icon: Sparkles,
        },
        {
          label: 'Showcase HTML/CSS',
          href: `/admin/events/${eventId}/showcase-custom`,
          icon: Code,
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
          label: 'Badges',
          href: `/admin/events/${eventId}/badges`,
          icon: CreditCard,
        },
        {
          label: 'Analytics Pro',
          href: `/admin/events/${eventId}/analytics-pro`,
          icon: TrendingUp,
        },
      ],
    },
    {
      title: "📧 EMAIL & COMMUNICATIONS",
      items: [
        {
          label: 'Gestion des Emails',
          href: `/admin/events/${eventId}/settings?tab=emails`,
          icon: Settings,
        },
        {
          label: 'Hub & Analytics',
          href: `/admin/events/${eventId}/emails`,
          icon: BarChart3,
        },
        {
          label: 'Mes Templates',
          href: `/admin/events/${eventId}/my-templates`,
          icon: FileText,
        },
        {
          label: 'Configuration RSVP',
          href: `/admin/events/${eventId}/rsvp-steps`,
          icon: UserCheck,
        },
      ],
    },
    {
      title: "💬 SMS & NOTIFICATIONS",
      items: [
        {
          label: 'Templates SMS',
          href: `/admin/events/${eventId}/sms-templates`,
          icon: MessageSquare,
        },
        {
          label: 'Analytics SMS',
          href: `/admin/events/${eventId}/notifications/analytics`,
          icon: LineChart,
        },
      ],
    },
  ]

  // Add advanced modules sections with sub-groups
  if (programmationModules.length > 0 || logistiqueModules.length > 0) {
    // Add main header
    navigationSections.push({
      title: "MODULES AVANCÉS",
      items: [],
      isHeader: true,
    })

    // Add Planning Opérationnel at the top if any advanced module is active
    if (hasModule('TRANSPORT') || hasModule('ACCOMMODATION') || hasModule('PROGRAM')) {
      navigationSections.push({
        title: "📊 Vue Globale",
        items: [{
          label: 'Planning Opérationnel',
          href: `/admin/events/${eventId}/operations`,
          icon: BarChart3,
        }],
        isSubGroup: true,
      })
    }

    // Add Programmation sub-group if modules exist
    if (programmationModules.length > 0) {
      navigationSections.push({
        title: "📅 Programmation",
        items: programmationModules,
        isSubGroup: true,
      })
    }

    // Add Logistique sub-group if modules exist (without Planning Opérationnel)
    const logistiqueWithoutPlanning = logistiqueModules.filter(item => item.label !== 'Planning Opérationnel')
    if (logistiqueWithoutPlanning.length > 0) {
      navigationSections.push({
        title: "🚗 Logistique",
        items: logistiqueWithoutPlanning,
        isSubGroup: true,
      })
    }
  }

  const isActive = (item: { href: string; exact?: boolean }) => {
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
          <nav className="p-4 space-y-6">
            {navigationSections.map((section, sectionIndex) => (
              <div key={section.title}>
                {/* Section Header or Sub-group title */}
                <h3 className={cn(
                  "px-4 mb-2 text-xs font-semibold tracking-wider",
                  section.isSubGroup
                    ? "text-[#009197] ml-2" // Sub-group: turquoise, indented
                    : "text-[#004645]/50"   // Regular section: gray
                )}>
                  {section.title}
                </h3>

                {/* Section Items (skip if it's just a header) */}
                {!section.isHeader && (
                  <div className={cn(
                    "space-y-1",
                    section.isSubGroup && "ml-2" // Indent sub-group items
                  )}>
                    {section.items.map((item) => {
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
                          <Icon className={cn(
                            active ? "text-white" : "text-[#009197]",
                            section.isSubGroup ? "h-4 w-4" : "h-5 w-5" // Smaller icons for sub-groups
                          )} />
                          {item.label}
                        </Link>
                      )
                    })}
                  </div>
                )}

                {/* Divider (except for last section and sub-groups) */}
                {!section.isSubGroup && sectionIndex < navigationSections.length - 1 && (
                  <div className="mt-4 border-t border-[#9CD9F6]/30" />
                )}
              </div>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>

      {/* Toast notifications - needed for client components in this layout */}
      <Toaster />
    </div>
  )
}
