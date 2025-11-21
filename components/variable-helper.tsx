"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Copy, Check, Search, Variable } from 'lucide-react'
import { toast } from 'sonner'

interface VariableHelperProps {
  title?: string
  description?: string
}

interface VariableCategory {
  name: string
  icon: string
  variables: Array<{
    name: string
    example: string
    description: string
  }>
}

export function VariableHelper({ title, description }: VariableHelperProps) {
  const [copiedVar, setCopiedVar] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const copyVariable = (variable: string) => {
    navigator.clipboard.writeText(`{{${variable}}}`)
    setCopiedVar(variable)
    toast.success(`{{${variable}}} copié !`)
    setTimeout(() => setCopiedVar(null), 2000)
  }

  const variables: VariableCategory[] = [
    {
      name: "Informations de l'événement",
      icon: "📅",
      variables: [
        { name: 'event.name', example: 'Les 10 ans de Weevup', description: 'Nom de l\'événement' },
        { name: 'event.slug', example: 'les-10-ans-weevup', description: 'Identifiant URL' },
        { name: 'event.description', example: 'Célébration des 10 ans...', description: 'Description complète' },
        { name: 'event.program', example: '18h: Accueil, 19h: Dîner...', description: 'Programme détaillé' },
        { name: 'event.dressCode', example: 'Tenue de soirée', description: 'Code vestimentaire' },
        { name: 'event.capacity', example: '200', description: 'Capacité maximale' },
        { name: 'event.hashtag', example: '#Weevup10ans', description: 'Hashtag réseaux sociaux' }
      ]
    },
    {
      name: "Dates et heures",
      icon: "🕐",
      variables: [
        { name: 'event.date', example: '15 décembre 2025', description: 'Date complète (format long)' },
        { name: 'event.date.short', example: '15 déc. 2025', description: 'Date abrégée' },
        { name: 'event.date.iso', example: '2025-12-15', description: 'Format ISO (YYYY-MM-DD)' },
        { name: 'event.date.long', example: 'lundi 15 décembre 2025', description: 'Date avec jour de la semaine' },
        { name: 'event.dayOfWeek', example: 'lundi', description: 'Jour de la semaine uniquement' },
        { name: 'event.time', example: '20:00', description: 'Heure (HH:MM)' },
        { name: 'event.startsAt', example: '2025-12-15T20:00:00Z', description: 'Date/heure début (ISO)' },
        { name: 'event.endsAt', example: '2025-12-16T02:00:00Z', description: 'Date/heure fin (ISO)' },
        { name: 'event.rsvpDeadline', example: '1er décembre 2025', description: 'Date limite RSVP' }
      ]
    },
    {
      name: "Lieu",
      icon: "📍",
      variables: [
        { name: 'event.location', example: 'Molitor Paris', description: 'Nom du lieu' },
        { name: 'event.venueName', example: 'Molitor Paris', description: 'Nom du lieu (alias)' },
        { name: 'event.address', example: '2 Av. de la Porte Molitor', description: 'Adresse postale' },
        { name: 'event.city', example: 'Paris', description: 'Ville' },
        { name: 'event.country', example: 'France', description: 'Pays' },
        { name: 'event.fullAddress', example: '2 Av. de la Porte Molitor, Paris, France', description: 'Adresse complète' }
      ]
    },
    {
      name: "Invité",
      icon: "👤",
      variables: [
        { name: 'guest.firstName', example: 'Marie', description: 'Prénom' },
        { name: 'guest.lastName', example: 'Dupont', description: 'Nom de famille' },
        { name: 'guest.fullName', example: 'Marie Dupont', description: 'Nom complet' },
        { name: 'guest.email', example: 'marie@example.com', description: 'Email' },
        { name: 'guest.company', example: 'Weevup', description: 'Entreprise' },
        { name: 'guest.jobTitle', example: 'Directrice Marketing', description: 'Poste' },
        { name: 'guest.phone', example: '+33 6 12 34 56 78', description: 'Téléphone' }
      ]
    },
    {
      name: "Configuration RSVP",
      icon: "✅",
      variables: [
        { name: 'event.maxPlusOnes', example: '2', description: 'Nombre max d\'accompagnants' }
      ]
    },
    {
      name: "Liens",
      icon: "🔗",
      variables: [
        { name: 'rsvpLink', example: 'https://...guest/abc123', description: 'Lien RSVP personnalisé' },
        { name: 'showcaseLink', example: 'https://...events/mon-event', description: 'Page publique événement' },
        { name: 'unsubscribeLink', example: 'https://...unsubscribe/abc123', description: 'Lien de désinscription' },
        { name: 'calendarLink', example: 'https://...calendar/...', description: 'Ajout au calendrier' },
        { name: 'directionsLink', example: 'https://maps.google.com/...', description: 'Itinéraire Google Maps' }
      ]
    },
    {
      name: "Styles et couleurs",
      icon: "🎨",
      variables: [
        { name: 'primaryColor', example: '#004645', description: 'Couleur principale' },
        { name: 'secondaryColor', example: '#009197', description: 'Couleur secondaire' },
        { name: 'accentColor', example: '#FF4713', description: 'Couleur d\'accent' },
        { name: 'fontFamily', example: 'Arial, sans-serif', description: 'Police de caractères' }
      ]
    },
    {
      name: "Organisateur",
      icon: "🏢",
      variables: [
        { name: 'event.organizerName', example: 'Weevup', description: 'Nom de l\'organisateur' }
      ]
    }
  ]

  const filteredVariables = variables.map(category => ({
    ...category,
    variables: category.variables.filter(v =>
      search === '' ||
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.description.toLowerCase().includes(search.toLowerCase()) ||
      v.example.toLowerCase().includes(search.toLowerCase())
    )
  })).filter(category => category.variables.length > 0)

  return (
    <Card className="border-[#009197]/30">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Variable className="h-5 w-5 text-[#009197]" />
          <div className="flex-1">
            <CardTitle className="text-[#004645]">
              {title || 'Variables disponibles'}
            </CardTitle>
            <CardDescription>
              {description || 'Utilisez ces variables dans vos textes avec la syntaxe {{variable}}'}
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-lg px-3 py-1">
            {variables.reduce((acc, cat) => acc + cat.variables.length, 0)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher une variable..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Variables by category */}
        <div className="space-y-6">
          {filteredVariables.map((category, idx) => (
            <div key={idx} className="space-y-2">
              <h4 className="text-sm font-semibold text-[#004645] flex items-center gap-2 pb-2 border-b">
                <span className="text-lg">{category.icon}</span>
                {category.name}
                <Badge variant="outline" className="ml-auto text-xs">
                  {category.variables.length}
                </Badge>
              </h4>
              <div className="grid gap-2">
                {category.variables.map((variable, vIdx) => (
                  <div
                    key={vIdx}
                    className="group flex items-start justify-between gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <code className="text-sm font-mono text-[#009197] font-semibold">
                          {`{{${variable.name}}}`}
                        </code>
                        {copiedVar === variable.name && (
                          <Check className="h-3 w-3 text-green-600" />
                        )}
                      </div>
                      <p className="text-xs text-[#004645]/70 mb-1">
                        {variable.description}
                      </p>
                      <p className="text-xs text-[#004645]/50 italic">
                        Ex: {variable.example}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyVariable(variable.name)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {copiedVar === variable.name ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {filteredVariables.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            Aucune variable trouvée pour &quot;{search}&quot;
          </div>
        )}

        {/* Usage note */}
        <div className="mt-6 p-4 bg-[#9CD9F6]/10 rounded-lg">
          <h5 className="text-sm font-semibold text-[#004645] mb-2">💡 Comment utiliser</h5>
          <div className="text-xs text-[#004645]/70 space-y-1">
            <p>• Cliquez sur une variable pour la copier dans le presse-papiers</p>
            <p>• Collez-la dans n&apos;importe quel champ de texte (emails, RSVP, etc.)</p>
            <p>• Elle sera automatiquement remplacée par la valeur réelle</p>
            <p className="mt-2 italic">
              Exemple : &quot;Bonjour {`{{guest.firstName}}`}, rendez-vous le {`{{event.date}}`} !&quot;
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
