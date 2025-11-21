"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Calendar,
  MapPin,
  User,
  Users,
  Utensils,
  Accessibility,
  Car,
  Hotel,
  Camera,
  CheckSquare,
  ArrowRight,
  ExternalLink
} from 'lucide-react'

interface RsvpFieldMapProps {
  onNavigateToField?: (fieldId: string) => void
}

export function RsvpFieldMap({ onNavigateToField }: RsvpFieldMapProps) {
  const sections = [
    {
      title: "En-tête d'accueil",
      icon: User,
      color: "text-[#004645]",
      fields: [
        { id: 'header-greeting', label: 'Bonjour {prénom} 👋', location: 'page.tsx:309', editable: 'Code' },
        { id: 'header-subtitle', label: 'Vous êtes invité(e) à', location: 'page.tsx:312', editable: 'Code' }
      ]
    },
    {
      title: "Informations de l'événement",
      icon: Calendar,
      color: "text-[#009197]",
      fields: [
        { id: 'event-name', label: 'Nom de l\'événement', location: 'Event.name', editable: 'Admin' },
        { id: 'event-date', label: 'Date et heure', location: 'Event.startsAt', editable: 'Admin' },
        { id: 'event-venue', label: 'Lieu', location: 'Event.venueName + city', editable: 'Admin' },
        { id: 'event-description', label: 'Description', location: 'Event.description', editable: 'Admin' }
      ]
    },
    {
      title: "Formulaire de réponse",
      icon: CheckSquare,
      color: "text-[#FF4713]",
      fields: [
        { id: 'form-title', label: 'Titre "Votre réponse"', location: 'page.tsx:368', editable: 'Code' },
        { id: 'form-deadline', label: 'Message deadline', location: 'page.tsx:372', editable: 'Code' },
        { id: 'form-deadline-date', label: 'Date limite', location: 'Event.rsvpDeadline', editable: 'Admin' }
      ]
    },
    {
      title: "Étapes du formulaire",
      icon: ArrowRight,
      color: "text-[#009197]",
      fields: [
        { id: 'step-response', label: 'Étape "Réponse"', location: 'rsvpConfig.customSteps', editable: 'RSVP Steps' },
        { id: 'step-plusones', label: 'Étape "Accompagnants"', location: 'rsvpConfig.customSteps', editable: 'RSVP Steps' },
        { id: 'step-meal', label: 'Étape "Repas"', location: 'rsvpConfig.customSteps', editable: 'RSVP Steps' },
        { id: 'step-practical', label: 'Étape "Infos pratiques"', location: 'rsvpConfig.customSteps', editable: 'RSVP Steps' },
        { id: 'step-consent', label: 'Étape "Consentements"', location: 'rsvpConfig.customSteps', editable: 'RSVP Steps' },
        { id: 'step-summary', label: 'Étape "Récapitulatif"', location: 'rsvpConfig.customSteps', editable: 'RSVP Steps' }
      ]
    }
  ]

  const getEditableColor = (editable: string) => {
    switch (editable) {
      case 'Admin':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'RSVP Steps':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'Code':
        return 'bg-orange-100 text-orange-800 border-orange-300'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card className="border-[#009197]/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-[#004645]">Carte des champs RSVP</CardTitle>
            <CardDescription>
              Vue d'ensemble de tous les champs personnalisables et où les modifier
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open('/docs/RSVP_QUICK_REFERENCE.md', '_blank')}
            className="border-[#009197] text-[#009197]"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Guide rapide
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {sections.map((section, idx) => {
            const Icon = section.icon
            return (
              <div key={idx} className="space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <Icon className={`h-5 w-5 ${section.color}`} />
                  <h3 className="font-semibold text-[#004645]">{section.title}</h3>
                  <Badge variant="outline" className="ml-auto">
                    {section.fields.length} champs
                  </Badge>
                </div>
                <div className="grid gap-2">
                  {section.fields.map((field, fieldIdx) => (
                    <div
                      key={fieldIdx}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-sm text-[#004645]">
                          {field.label}
                        </div>
                        <div className="text-xs text-[#004645]/60 mt-1">
                          📍 {field.location}
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={`${getEditableColor(field.editable)} text-xs`}
                      >
                        {field.editable}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 pt-6 border-t">
          <h4 className="text-sm font-semibold text-[#004645] mb-3">Légende</h4>
          <div className="grid grid-cols-3 gap-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                Admin
              </Badge>
              <span className="text-xs text-[#004645]/70">Via interface admin</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                RSVP Steps
              </Badge>
              <span className="text-xs text-[#004645]/70">Via /rsvp-steps</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
                Code
              </Badge>
              <span className="text-xs text-[#004645]/70">Modifier le code</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 p-4 bg-[#9CD9F6]/10 rounded-lg">
          <h4 className="text-sm font-semibold text-[#004645] mb-3">Actions rapides</h4>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              className="justify-start"
              onClick={() => window.location.href = '/admin/events'}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Éditer l'événement
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="justify-start"
              onClick={() => window.location.reload()}
            >
              <CheckSquare className="h-4 w-4 mr-2" />
              Configurer RSVP
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
