"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, ExternalLink } from 'lucide-react'
import Link from 'next/link'

interface RsvpTextsSubTabProps {
  event: any
  onUpdate: () => void
}

export function RsvpTextsSubTab({ event, onUpdate }: RsvpTextsSubTabProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-[#009197]" />
          <CardTitle className="text-[#004645]">Personnalisation des Textes</CardTitle>
        </div>
        <CardDescription>
          Modifiez les 35+ textes affichés dans le formulaire RSVP
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-6 bg-[#9CD9F6]/10 rounded-lg border border-[#009197]/20 space-y-4">
          <p className="text-sm text-[#004645]">
            Personnalisez tous les textes du formulaire RSVP avec :
          </p>
          <ul className="list-disc list-inside space-y-2 text-sm text-[#004645]/70 ml-4">
            <li>11 sections organisées (Accueil, Formulaire, Étapes, Boutons, etc.)</li>
            <li>35+ champs de texte modifiables</li>
            <li>Variables dynamiques ({`{guest.firstName}`}, {`{event.name}`}, etc.)</li>
            <li>Labels, placeholders, messages et boutons</li>
            <li>Réinitialisation aux valeurs par défaut</li>
          </ul>

          <Link href={`/admin/events/${event.id}/rsvp-texts`}>
            <Button className="w-full bg-gradient-to-r from-[#004645] to-[#009197] text-white">
              <ExternalLink className="h-4 w-4 mr-2" />
              Ouvrir l&apos;éditeur de textes complet
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
