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
    name: 'Soirée de Gala',
    description: 'Programme type pour une soirée de gala d\'entreprise',
    icon: '<­',
    sessions: [
      { type: 'ARRIVAL', title: 'Accueil des invités', duration: 30 },
      { type: 'NETWORKING', title: 'Cocktail de bienvenue', duration: 60 },
      { type: 'MEAL', title: 'Dîner de gala', duration: 120 },
      { type: 'KEYNOTE', title: 'Discours inaugural', duration: 30 },
      { type: 'OTHER', title: 'Remise des prix', duration: 45 },
      { type: 'OTHER', title: 'Soirée dansante', duration: 120 }
    ]
  },
  {
    id: 'seminar',
    name: 'Séminaire 2 jours',
    description: 'Programme complet pour un séminaire d\'entreprise',
    icon: '=Ú',
    sessions: [
      { type: 'ARRIVAL', title: 'Arrivée et installation', duration: 60 },
      { type: 'KEYNOTE', title: 'Session d\'ouverture', duration: 60 },
      { type: 'BREAK', title: 'Pause café', duration: 15 },
      { type: 'WORKSHOP', title: 'Atelier collaboratif', duration: 90 },
      { type: 'MEAL', title: 'Déjeuner', duration: 90 },
      { type: 'CONFERENCE', title: 'Présentation stratégie', duration: 60 },
      { type: 'TEAMBUILDING', title: 'Activité team building', duration: 120 },
      { type: 'MEAL', title: 'Dîner', duration: 120 }
    ]
  },
  {
    id: 'convention',
    name: 'Convention',
    description: 'Programme pour une convention ou congrès',
    icon: '<¤',
    sessions: [
      { type: 'ARRIVAL', title: 'Enregistrement', duration: 30 },
      { type: 'KEYNOTE', title: 'Discours d\'ouverture', duration: 45 },
      { type: 'PANEL', title: 'Table ronde', duration: 60 },
      { type: 'BREAK', title: 'Pause networking', duration: 30 },
      { type: 'WORKSHOP', title: 'Ateliers parallèles', duration: 90 },
      { type: 'MEAL', title: 'Déjeuner buffet', duration: 75 },
      { type: 'CONFERENCE', title: 'Conférences', duration: 120 }
    ]
  },
  {
    id: 'teambuilding',
    name: 'Journée Team Building',
    description: 'Programme axé sur la cohésion d\'équipe',
    icon: '>',
    sessions: [
      { type: 'ARRIVAL', title: 'Accueil', duration: 15 },
      { type: 'KEYNOTE', title: 'Briefing de la journée', duration: 15 },
      { type: 'TEAMBUILDING', title: 'Activité ice-breaker', duration: 45 },
      { type: 'TEAMBUILDING', title: 'Challenge équipe 1', duration: 90 },
      { type: 'MEAL', title: 'Déjeuner', duration: 60 },
      { type: 'TEAMBUILDING', title: 'Challenge équipe 2', duration: 90 },
      { type: 'OTHER', title: 'Débriefing et célébration', duration: 30 }
    ]
  }
]

export function ProgramTemplates({ eventId, onApply }: ProgramTemplatesProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-[#004645] mb-2">Templates de programme</h3>
        <p className="text-sm text-[#004645]/70">
          Utilisez un template prédéfini pour démarrer rapidement
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
                    <span className="text-3xl">{template.icon}</span>
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
                      <span>"</span>
                      {session.title}
                    </li>
                  ))}
                  {template.sessions.length > 4 && (
                    <li className="text-xs italic">+ {template.sessions.length - 4} autres...</li>
                  )}
                </ul>
              </div>
              <Button
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
          <p className="text-[#004645]/60 mb-2">Besoin d&apos;un template personnalisé ?</p>
          <p className="text-sm text-[#004645]/50">
            Créez votre programme manuellement ou contactez le support
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
