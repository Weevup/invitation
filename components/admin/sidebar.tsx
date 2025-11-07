"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Calendar,
  Users,
  Mail,
  Sparkles,
  Settings,
  Database,
  Home,
  BarChart
} from 'lucide-react'
import { WeevupLogo } from '@/components/weevup-logo'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Tableau de bord', href: '/admin', icon: LayoutDashboard },
  { name: 'Événements', href: '/admin/events', icon: Calendar },
  { name: 'Invités', href: '/admin/guests', icon: Users },
  { name: 'Invitations', href: '/admin/invitations', icon: Mail },
  { name: 'Statistiques', href: '/admin/analytics', icon: BarChart },
  { name: 'Configuration', href: '/admin/setup', icon: Database },
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
      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href ||
                          (item.href !== '/admin' && pathname.startsWith(item.href))

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-white/10 text-white shadow-lg"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/10 p-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
        >
          <Home className="h-4 w-4" />
          Retour au site
        </Link>
      </div>
    </div>
  )
}
