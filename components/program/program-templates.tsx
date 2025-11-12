"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Wand2 } from 'lucide-react'

interface ProgramTemplatesProps {
  eventId: string
  onApply: (template: any) => void
}

const PROGRAM_TEMPLATES = [
  {
    id: 'gala',
    name: 'Soiree de Gala',
    description: 'Programme type pour une soiree de gala',
    icon: 'Gala',
    sessions: [
      { type: 'ARRIVAL', title: 'Accueil des invites', duration: 30 },
      { type: 'NETWORKING', title: 'Cocktail de bienvenue', duration: 60 },
      { type: 'MEAL', title: 'Diner de gala', duration: 120 },
      { type: 'KEYNOTE', title: 'Discours inaugural', duration: 30 },
      { type: 'OTHER', title: 'Remise des prix', duration: 45 },
      { type: 'OTHER', title: 'Soiree dansante', duration: 120 }
    ]
  },
  {
    id: 'seminar',
    name: 'Seminaire 2 jours',
    description: 'Programme complet pour un seminaire',
    icon: 'Seminaire',
    sessions: [
      { type: 'ARRIVAL', title: 'Arrivee et installation', duration: 60 },
      { type: 'KEYNOTE', title: 'Session ouverture', duration: 60 },
      { type: 'BREAK', title: 'Pause cafe', duration: 15 },
      { type: 'WORKSHOP', title: 'Atelier collaboratif', duration: 90 },
      { type: 'MEAL', title: 'Dejeuner', duration: 90 },
      { type: 'CONFERENCE', title: 'Presentation strategie', duration: 60 },
      { type: 'TEAMBUILDING', title: 'Activite team building', duration: 120 },
      { type: 'MEAL', title: 'Diner', duration: 120 }
    ]
  },
  {
    id: 'convention',
    name: 'Convention',
    description: 'Programme pour une convention ou congres',
    icon: 'Convention',
    sessions: [
      { type: 'ARRIVAL', title: 'Enregistrement', duration: 30 },
      { type: 'KEYNOTE', title: 'Discours ouverture', duration: 45 },
      { type: 'PANEL', title: 'Table ronde', duration: 60 },
      { type: 'BREAK', title: 'Pause networking', duration: 30 },
      { type: 'WORKSHOP', title: 'Ateliers paralleles', duration: 90 },
      { type: 'MEAL', title: 'Dejeuner buffet', duration: 75 },
      { type: 'CONFERENCE', title: 'Conferences', duration: 120 }
    ]
  },
  {
    id: 'teambuilding',
    name: 'Journee Team Building',
    description: 'Programme axe sur la cohesion equipe',
    icon: 'Team',
    sessions: [
      { type: 'ARRIVAL', title: 'Accueil', duration: 15 },
      { type: 'KEYNOTE', title: 'Briefing de la journee', duration: 15 },
      { type: 'TEAMBUILDING', title: 'Activite ice-breaker', duration: 45 },
      { type: 'TEAMBUILDING', title: 'Challenge equipe 1', duration: 90 },
      { type: 'MEAL', title: 'Dejeuner', duration: 60 },
      { type: 'TEAMBUILDING', title: 'Challenge equipe 2', duration: 90 },
      { type: 'OTHER', title: 'Debriefing et celebration', duration: 30 }
    ]
  }
]

export function ProgramTemplates({ eventId, onApply }: ProgramTemplatesProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-[#004645] mb-2">Templates de programme</h3>
        <p className="text-sm text-[#004645]/70">
          Utilisez un template predefini pour demarrer rapidement
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PROGRAM_TEMPLATES.map((template) => (
          <Card
            key={template.id}
            className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur hover:border-[#009197] transition-colors"
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-[#004645] flex items-center gap-2">
                    <span className="text-lg font-bold">{template.icon}</span>
                    {template.name}
                  </CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                <p className="text-sm font-medium text-[#004645]">
                  Inclut {template.sessions.length} sessions:
                </p>
                <ul className="text-sm text-[#004645]/70 space-y-1">
                  {template.sessions.slice(0, 4).map((session, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span>-</span>
                      {session.title}
                    </li>
                  ))}
                  {template.sessions.length > 4 && (
                    <li className="text-xs italic">+ {template.sessions.length - 4} autres...</li>
                  )}
                </ul>
              </div>
              <Button
                type="button"
                onClick={() => onApply(template)}
                className="w-full bg-[#FF4713] hover:bg-[#FF6B3D] text-white"
              >
                <Wand2 className="h-4 w-4 mr-2" />
                Utiliser ce template
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-[#9CD9F6]/30 border-dashed">
        <CardContent className="py-8 text-center">
          <p className="text-[#004645]/60 mb-2">Besoin d&apos;un template personnalise ?</p>
          <p className="text-sm text-[#004645]/50">
            Creez votre programme manuellement ou contactez le support
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
