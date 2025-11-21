"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { List, ExternalLink } from 'lucide-react'
import Link from 'next/link'

interface RsvpStepsSubTabProps {
  event: any
  onUpdate: () => void
}

export function RsvpStepsSubTab({ event, onUpdate }: RsvpStepsSubTabProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <List className="h-5 w-5 text-[#009197]" />
          <CardTitle className="text-[#004645]">Organisation des Étapes</CardTitle>
        </div>
        <CardDescription>
          Configurez l&apos;ordre et la logique des étapes du formulaire RSVP
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-6 bg-[#9CD9F6]/10 rounded-lg border border-[#009197]/20 space-y-4">
          <p className="text-sm text-[#004645]">
            L&apos;éditeur d&apos;étapes complet est disponible sur la page dédiée avec :
          </p>
          <ul className="list-disc list-inside space-y-2 text-sm text-[#004645]/70 ml-4">
            <li>Drag & drop pour réorganiser les étapes</li>
            <li>Logique conditionnelle avancée</li>
            <li>Étapes personnalisées avec champs dynamiques</li>
            <li>Aperçu en temps réel</li>
            <li>Templates prêts à l&apos;emploi</li>
          </ul>

          <Link href={`/admin/events/${event.id}/rsvp-steps`}>
            <Button className="w-full bg-gradient-to-r from-[#004645] to-[#009197] text-white">
              <ExternalLink className="h-4 w-4 mr-2" />
              Ouvrir l&apos;éditeur d&apos;étapes complet
            </Button>
          </Link>
        </div>

        <div className="text-xs text-[#004645]/60 italic">
          💡 Cette fonctionnalité sera intégrée directement dans cet onglet dans une prochaine mise à jour
        </div>
      </CardContent>
    </Card>
  )
}
