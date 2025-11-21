"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Info } from 'lucide-react'

interface GeneralTabProps {
  event: any
  onUpdate: () => void
}

export function GeneralTab({ event, onUpdate }: GeneralTabProps) {
  return (
    <Card className="border-[#9CD9F6]/30">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Info className="h-5 w-5 text-[#009197]" />
          <CardTitle className="text-[#004645]">Informations Générales</CardTitle>
        </div>
        <CardDescription>
          Détails de base, dates, lieu et capacité de l&apos;événement
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-[#004645]/70">
            Cette section sera implémentée dans la Phase 1 - étape 2.
          </p>
          <p className="text-sm text-[#004645]/70">
            Pour l&apos;instant, utilisez la page{' '}
            <a href={`/admin/events/${event.id}/edit`} className="text-[#009197] underline">
              Modifier l&apos;événement
            </a>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
