"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText } from 'lucide-react'

interface RsvpTabProps {
  event: any
  onUpdate: () => void
}

export function RsvpTab({ event, onUpdate }: RsvpTabProps) {
  return (
    <Card className="border-[#9CD9F6]/30">
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-[#009197]" />
          <CardTitle className="text-[#004645]">Formulaire RSVP</CardTitle>
        </div>
        <CardDescription>
          Configuration unifiée : champs, étapes et textes en un seul endroit
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-[#004645]/70">
            Cette section sera implémentée dans la Phase 1 - étape 3 (après l&apos;onglet Emails).
          </p>
          <p className="text-sm text-[#004645]/70">
            Pour l&apos;instant, utilisez les pages existantes :
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-[#004645]/70">
            <li>
              <a href={`/admin/events/${event.id}/rsvp-config`} className="text-[#009197] underline">
                Configuration des champs
              </a>
            </li>
            <li>
              <a href={`/admin/events/${event.id}/rsvp-steps`} className="text-[#009197] underline">
                Organisation des étapes
              </a>
            </li>
            <li>
              <a href={`/admin/events/${event.id}/rsvp-texts`} className="text-[#009197] underline">
                Personnalisation des textes
              </a>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
