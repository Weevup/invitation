"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Palette } from 'lucide-react'

interface AppearanceTabProps {
  event: any
  onUpdate: () => void
}

export function AppearanceTab({ event, onUpdate }: AppearanceTabProps) {
  return (
    <Card className="border-[#9CD9F6]/30">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Palette className="h-5 w-5 text-[#009197]" />
          <CardTitle className="text-[#004645]">Apparence & Branding</CardTitle>
        </div>
        <CardDescription>
          Thème, couleurs, logo et personnalisation visuelle
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-[#004645]/70">
            Cette section sera implémentée dans la Phase 1 - étape 4 (après RSVP).
          </p>
          <p className="text-sm text-[#004645]/70">
            Pour l&apos;instant, les paramètres de thème sont configurables dans{' '}
            <a href={`/admin/events/${event.id}/rsvp-steps`} className="text-[#009197] underline">
              Configuration du parcours RSVP
            </a>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
