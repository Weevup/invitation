"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Calendar,
  Users,
  Settings,
  Home,
  BarChart,
  BookOpen,
  CheckSquare,
  Plug,
  FileText,
  Activity,
  Mail,
  LogOut,
  Shield
} from 'lucide-react'
import { WeevupLogo } from '@/components/weevup-logo'
import { cn } from '@/lib/utils'
import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'

interface NavSection {
  title: string
  items: NavItem[]
}

interface NavItem {
  name: string
  href: string
  icon: any
  description?: string
}

const navigationSections: NavSection[] = [
  {
    title: "Vue d'ensemble",
    items: [
      {
        name: 'Tableau de bord',
        href: '/admin',
        icon: LayoutDashboard,
        description: 'Vue globale de vos événements'
      },
    ]
  },
  {
    title: "Gestion des événements",
    items: [
      {
        name: 'Événements',
        href: '/admin/events',
        icon: Calendar,
        description: 'Créer et gérer vos événements'
      },
      {
        name: 'Invités & RSVP',
        href: '/admin/rsvp',
        icon: CheckSquare,
        description: 'Gérer invités et réponses'
      },
    ]
  },
  {
    title: "Analyse & Configuration",
    items: [
      {
        name: 'Statistiques',
        href: '/admin/analytics',
        icon: BarChart,
        description: 'Analyses détaillées'
      },
      {
        name: 'Utilisateurs',
        href: '/admin/users',
        icon: Shield,
        description: 'Gestion des comptes admin'
      },
      {
        name: 'Système & Diagnostic',
        href: '/admin/system',
        icon: Settings,
        description: 'Configuration et santé du système'
      },
      {
        name: 'Templates Emails',
        href: '/admin/templates',
        icon: Mail,
        description: 'Personnaliser les emails'
      },
      {
        name: 'Intégrations',
        href: '/admin/settings/integrations',
        icon: Plug,
        description: 'Configuration des emails'
      },
    ]
  },
  {
    title: "Aide",
    items: [
      {
        name: 'Guide de démarrage',
        href: '/admin/tutoriel',
        icon: BookOpen,
        description: 'Apprendre à utiliser l\'outil'
      },
      {
        name: 'Documentation',
        href: '/admin/documentation',
        icon: FileText,
        description: 'Documentation technique complète'
      },
    ]
  }
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-screen w-64 flex-col fixed left-0 top-0 bg-gradient-to-b from-[#004645] to-[#003834] text-white">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-6 border-b border-white/10">
        <WeevupLogo className="w-8 h-8 text-white" />
        <div>
          <h1 className="font-bold text-lg" style={{ fontFamily: "var(--font-abril)" }}>
            WEEVUP
          </h1>
          <p className="text-xs text-white/60">Admin</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        {navigationSections.map((section, sectionIdx) => (
          <div key={section.title} className={sectionIdx > 0 ? 'mt-6' : ''}>
            {/* Section Title */}
            <h3 className="px-3 mb-2 text-xs font-semibold text-white/40 uppercase tracking-wider">
              {section.title}
            </h3>

            {/* Section Items */}
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href ||
                                (item.href !== '/admin' && pathname.startsWith(item.href))

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all group",
                      isActive
                        ? "bg-white/10 text-white shadow-lg"
                        : "text-white/70 hover:bg-white/5 hover:text-white"
                    )}
                    title={item.description}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="truncate">{item.name}</div>
                      {item.description && !isActive && (
                        <div className="text-xs text-white/40 truncate opacity-0 group-hover:opacity-100 transition-opacity">
                          {item.description}
                        </div>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/10 p-4 space-y-2">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
        >
          <Home className="h-4 w-4" />
          Retour au site
        </Link>
        <Button
          onClick={() => signOut({ callbackUrl: '/admin/login' })}
          variant="ghost"
          className="w-full justify-start gap-2 text-sm text-white/60 hover:text-white hover:bg-white/5"
        >
          <LogOut className="h-4 w-4" />
          Déconnexion
        </Button>
      </div>
    </div>
  )
}
