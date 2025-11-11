"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowRight, Loader2 } from 'lucide-react'
import { useEventModules } from '@/lib/modules'
import { AVAILABLE_MODULES } from '@/lib/modules/types'
import Link from 'next/link'

interface ModuleStatusWidgetProps {
  eventId: string
}

export function ModuleStatusWidget({ eventId }: ModuleStatusWidgetProps) {
  const { modules, isLoading, hasAnyLogistic } = useEventModules(eventId)

  if (isLoading) {
    return (
      <Card className="border-[#9CD9F6]/30">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-[#009197]" />
        </CardContent>
      </Card>
    )
  }

  const activeModules = modules.filter(m => m.isActive)
  const availableModulesCount = AVAILABLE_MODULES.filter(m => !m.comingSoon).length

  return (
    <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur hover:border-[#009197] transition-colors">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-[#004645] text-lg">Modules</CardTitle>
          <Badge variant="outline" className="text-[#009197]">
            {activeModules.length} / {availableModulesCount}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Liste des modules actifs */}
          {activeModules.length > 0 ? (
            <div className="space-y-2">
              {activeModules.slice(0, 3).map(module => {
                const info = AVAILABLE_MODULES.find(m => m.type === module.type)
                return (
                  <div
                    key={module.type}
                    className="flex items-center gap-2 text-sm"
                  >
                    <span className="text-lg">{info?.icon}</span>
                    <span className="text-[#004645]/70">{info?.name}</span>
                  </div>
                )
              })}
              {activeModules.length > 3 && (
                <p className="text-xs text-[#004645]/50">
                  +{activeModules.length - 3} autre(s)
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-[#004645]/60">
              Aucun module actif
            </p>
          )}

          {/* Bouton pour gérer les modules */}
          <Link href={`/admin/events/${eventId}/modules`}>
            <Button
              variant="outline"
              size="sm"
              className="w-full border-[#009197] text-[#009197] hover:bg-[#009197]/10 mt-4"
            >
              Gérer les modules
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
