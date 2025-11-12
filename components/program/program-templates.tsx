"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Wand2, Clock, Users } from 'lucide-react'

interface ProgramTemplatesProps {
  eventId: string
  onApply: (template: any) => void
}

const PROGRAM_TEMPLATES = [
  {
    id: 'gala',
    name: 'Soirée de Gala Premium',
    description: 'Programme complet pour une soirée prestigieuse avec cocktail, dîner et divertissement',
    icon: '🎭',
    color: '#9333EA',
    duration: '6h',
    capacity: '200+',
    sessions: [
      { type: 'ARRIVAL', title: 'Accueil VIP & Vestiaire', duration: 30, venue: 'Hall d\'entrée' },
      { type: 'NETWORKING', title: 'Cocktail de bienvenue & Photocall', duration: 60, venue: 'Salon panoramique' },
      { type: 'OTHER', title: 'Ouverture des portes de la salle', duration: 15, venue: 'Grande salle' },
      { type: 'KEYNOTE', title: 'Mot d\'accueil du Président', duration: 15, venue: 'Grande salle' },
      { type: 'MEAL', title: 'Dîner gastronomique 5 services', duration: 150, venue: 'Grande salle' },
      { type: 'KEYNOTE', title: 'Discours & Présentation de l\'année', duration: 30, venue: 'Grande salle' },
      { type: 'OTHER', title: 'Remise des trophées & Distinctions', duration: 45, venue: 'Grande salle' },
      { type: 'BREAK', title: 'Pause digestive', duration: 15, venue: 'Terrasse' },
      { type: 'OTHER', title: 'Spectacle & Divertissement', duration: 45, venue: 'Grande salle' },
      { type: 'OTHER', title: 'Soirée dansante avec DJ', duration: 120, venue: 'Piste de danse' },
      { type: 'DEPARTURE', title: 'Clôture & Départ', duration: 30, venue: 'Hall' }
    ]
  },
  {
    id: 'seminar-2days',
    name: 'Séminaire Résidentiel 2 Jours',
    description: 'Programme intensif avec formations, ateliers et team building sur deux journées complètes',
    icon: '🎯',
    color: '#0284C7',
    duration: '2 jours',
    capacity: '50-100',
    sessions: [
      // JOUR 1
      { type: 'ARRIVAL', title: 'Accueil & Check-in hébergement', duration: 60, venue: 'Réception' },
      { type: 'NETWORKING', title: 'Café d\'accueil & Networking', duration: 30, venue: 'Lounge' },
      { type: 'KEYNOTE', title: 'Plénière d\'ouverture - Vision 2025', duration: 60, venue: 'Auditorium' },
      { type: 'BREAK', title: 'Pause café & Networking', duration: 20, venue: 'Espace café' },
      { type: 'WORKSHOP', title: 'Ateliers collaboratifs en groupes', duration: 90, venue: 'Salles multiples' },
      { type: 'MEAL', title: 'Déjeuner buffet', duration: 90, venue: 'Restaurant' },
      { type: 'FREE_TIME', title: 'Temps libre / Digestion', duration: 30, venue: 'Espaces extérieurs' },
      { type: 'CONFERENCE', title: 'Présentation de la stratégie', duration: 75, venue: 'Auditorium' },
      { type: 'PANEL', title: 'Table ronde & Questions/Réponses', duration: 45, venue: 'Auditorium' },
      { type: 'BREAK', title: 'Pause rafraîchissements', duration: 15, venue: 'Terrasse' },
      { type: 'TEAMBUILDING', title: 'Activité team building outdoor', duration: 120, venue: 'Parc' },
      { type: 'FREE_TIME', title: 'Retour chambres & Préparation', duration: 60, venue: 'Chambres' },
      { type: 'MEAL', title: 'Dîner de gala', duration: 120, venue: 'Restaurant principal' },
      { type: 'OTHER', title: 'Soirée conviviale & Bar', duration: 90, venue: 'Bar lounge' },
      // JOUR 2
      { type: 'MEAL', title: 'Petit-déjeuner buffet', duration: 60, venue: 'Restaurant' },
      { type: 'WORKSHOP', title: 'Ateliers de co-création', duration: 90, venue: 'Salles multiples' },
      { type: 'BREAK', title: 'Pause café', duration: 15, venue: 'Espace café' },
      { type: 'TRAINING', title: 'Formation pratique', duration: 90, venue: 'Salle formation' },
      { type: 'MEAL', title: 'Déjeuner', duration: 75, venue: 'Restaurant' },
      { type: 'KEYNOTE', title: 'Plénière de clôture & Plan d\'action', duration: 60, venue: 'Auditorium' },
      { type: 'OTHER', title: 'Feedback & Évaluation', duration: 30, venue: 'Auditorium' },
      { type: 'DEPARTURE', title: 'Départ & Check-out', duration: 30, venue: 'Réception' }
    ]
  },
  {
    id: 'conference',
    name: 'Conférence & Convention',
    description: 'Programme professionnel avec keynotes, panels et sessions en parallèle',
    icon: '🎤',
    color: '#DC2626',
    duration: '1 jour',
    capacity: '100-500',
    sessions: [
      { type: 'ARRIVAL', title: 'Enregistrement & Remise badges', duration: 45, venue: 'Hall d\'accueil' },
      { type: 'NETWORKING', title: 'Café de bienvenue', duration: 30, venue: 'Espace exposition' },
      { type: 'KEYNOTE', title: 'Keynote d\'ouverture', duration: 60, venue: 'Grande salle' },
      { type: 'BREAK', title: 'Pause & Visite stands', duration: 30, venue: 'Espace exposition' },
      { type: 'CONFERENCE', title: 'Sessions en parallèle - Track A', duration: 60, venue: 'Salle A' },
      { type: 'CONFERENCE', title: 'Sessions en parallèle - Track B', duration: 60, venue: 'Salle B' },
      { type: 'CONFERENCE', title: 'Sessions en parallèle - Track C', duration: 60, venue: 'Salle C' },
      { type: 'MEAL', title: 'Déjeuner networking buffet', duration: 90, venue: 'Restaurant' },
      { type: 'PANEL', title: 'Table ronde d\'experts', duration: 75, venue: 'Grande salle' },
      { type: 'BREAK', title: 'Pause café & Networking', duration: 20, venue: 'Espace exposition' },
      { type: 'WORKSHOP', title: 'Ateliers pratiques au choix', duration: 90, venue: 'Salles multiples' },
      { type: 'BREAK', title: 'Pause', duration: 15, venue: 'Espace café' },
      { type: 'KEYNOTE', title: 'Keynote de clôture', duration: 45, venue: 'Grande salle' },
      { type: 'OTHER', title: 'Cocktail de networking', duration: 90, venue: 'Terrasse' },
      { type: 'DEPARTURE', title: 'Clôture', duration: 15, venue: 'Hall' }
    ]
  },
  {
    id: 'teambuilding-day',
    name: 'Journée Team Building Intensive',
    description: 'Programme dynamique axé sur la cohésion d\'équipe avec activités et challenges',
    icon: '🤝',
    color: '#059669',
    duration: '8h',
    capacity: '20-80',
    sessions: [
      { type: 'ARRIVAL', title: 'Accueil & Café de bienvenue', duration: 30, venue: 'Base camp' },
      { type: 'KEYNOTE', title: 'Briefing & Présentation de la journée', duration: 20, venue: 'Salle plénière' },
      { type: 'TEAMBUILDING', title: 'Ice-breaker & Warm-up', duration: 30, venue: 'Terrain principal' },
      { type: 'TEAMBUILDING', title: 'Constitution des équipes', duration: 15, venue: 'Terrain principal' },
      { type: 'TEAMBUILDING', title: 'Challenge 1 - Épreuve stratégie', duration: 60, venue: 'Zone A' },
      { type: 'BREAK', title: 'Pause énergétique', duration: 15, venue: 'Base camp' },
      { type: 'TEAMBUILDING', title: 'Challenge 2 - Épreuve créativité', duration: 60, venue: 'Zone B' },
      { type: 'MEAL', title: 'Déjeuner barbecue convivial', duration: 90, venue: 'Terrasse' },
      { type: 'TEAMBUILDING', title: 'Challenge 3 - Grande épreuve collective', duration: 90, venue: 'Terrain principal' },
      { type: 'BREAK', title: 'Pause rafraîchissements', duration: 15, venue: 'Base camp' },
      { type: 'TEAMBUILDING', title: 'Challenge final - Course d\'orientation', duration: 75, venue: 'Parcours extérieur' },
      { type: 'OTHER', title: 'Dépouillement & Annonce des résultats', duration: 20, venue: 'Salle plénière' },
      { type: 'OTHER', title: 'Remise des prix & Célébration', duration: 30, venue: 'Salle plénière' },
      { type: 'OTHER', title: 'Debriefing & Mot de clôture', duration: 30, venue: 'Salle plénière' },
      { type: 'NETWORKING', title: 'Pot de l\'amitié', duration: 30, venue: 'Base camp' }
    ]
  },
  {
    id: 'product-launch',
    name: 'Lancement de Produit',
    description: 'Événement corporate pour le lancement d\'un nouveau produit ou service',
    icon: '🚀',
    color: '#F59E0B',
    duration: '4h',
    capacity: '100-300',
    sessions: [
      { type: 'ARRIVAL', title: 'Accueil & Enregistrement VIP', duration: 30, venue: 'Hall' },
      { type: 'NETWORKING', title: 'Cocktail de bienvenue', duration: 45, venue: 'Lounge' },
      { type: 'OTHER', title: 'Teaser vidéo & Mise en ambiance', duration: 15, venue: 'Auditorium' },
      { type: 'KEYNOTE', title: 'Présentation du produit', duration: 45, venue: 'Auditorium' },
      { type: 'OTHER', title: 'Démonstration live', duration: 30, venue: 'Scène principale' },
      { type: 'PANEL', title: 'Interview avec l\'équipe projet', duration: 30, venue: 'Auditorium' },
      { type: 'BREAK', title: 'Pause & Découverte produit', duration: 30, venue: 'Espace showroom' },
      { type: 'WORKSHOP', title: 'Ateliers de prise en main', duration: 60, venue: 'Salles démo' },
      { type: 'OTHER', title: 'Questions/Réponses avec les experts', duration: 30, venue: 'Auditorium' },
      { type: 'NETWORKING', title: 'Cocktail dînatoire & Networking', duration: 90, venue: 'Terrasse' },
      { type: 'DEPARTURE', title: 'Remise goodies & Départ', duration: 15, venue: 'Hall' }
    ]
  },
  {
    id: 'workshop-day',
    name: 'Journée Formation & Workshops',
    description: 'Programme de formation intensive avec ateliers pratiques et études de cas',
    icon: '📚',
    color: '#8B5CF6',
    duration: '7h',
    capacity: '30-60',
    sessions: [
      { type: 'ARRIVAL', title: 'Accueil participants', duration: 15, venue: 'Salle formation' },
      { type: 'KEYNOTE', title: 'Introduction & Objectifs de la journée', duration: 30, venue: 'Salle plénière' },
      { type: 'TRAINING', title: 'Module 1 - Fondamentaux', duration: 90, venue: 'Salle formation' },
      { type: 'BREAK', title: 'Pause café', duration: 15, venue: 'Espace pause' },
      { type: 'WORKSHOP', title: 'Atelier pratique 1', duration: 75, venue: 'Salle atelier' },
      { type: 'MEAL', title: 'Déjeuner', duration: 75, venue: 'Restaurant' },
      { type: 'TRAINING', title: 'Module 2 - Techniques avancées', duration: 90, venue: 'Salle formation' },
      { type: 'BREAK', title: 'Pause', duration: 15, venue: 'Espace pause' },
      { type: 'WORKSHOP', title: 'Atelier pratique 2 - Étude de cas', duration: 90, venue: 'Salle atelier' },
      { type: 'OTHER', title: 'Synthèse & Plan d\'action personnel', duration: 30, venue: 'Salle plénière' },
      { type: 'OTHER', title: 'Remise des certificats', duration: 15, venue: 'Salle plénière' },
      { type: 'NETWORKING', title: 'Échanges & Questions libres', duration: 20, venue: 'Lounge' }
    ]
  }
]

export function ProgramTemplates({ eventId, onApply }: ProgramTemplatesProps) {
  const calculateTotalDuration = (sessions: any[]) => {
    const total = sessions.reduce((acc, s) => acc + s.duration, 0)
    const hours = Math.floor(total / 60)
    const minutes = total % 60
    return minutes > 0 ? `${hours}h${minutes}` : `${hours}h`
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-[#004645] mb-2">Templates de programme</h3>
        <p className="text-sm text-[#004645]/70">
          Utilisez un template prédéfini pour démarrer rapidement votre planning événementiel
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {PROGRAM_TEMPLATES.map((template) => (
          <Card
            key={template.id}
            className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur hover:border-[#009197] transition-all hover:shadow-lg group"
          >
            <CardHeader>
              <div className="flex items-start justify-between mb-2">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl shadow-sm transition-transform group-hover:scale-110"
                  style={{ backgroundColor: `${template.color}20` }}
                >
                  {template.icon}
                </div>
                <Badge
                  variant="outline"
                  className="text-xs font-semibold"
                  style={{
                    borderColor: template.color,
                    color: template.color,
                    backgroundColor: `${template.color}10`
                  }}
                >
                  {template.sessions.length} sessions
                </Badge>
              </div>
              <CardTitle className="text-[#004645] text-base leading-tight mb-1">
                {template.name}
              </CardTitle>
              <CardDescription className="text-xs line-clamp-2">
                {template.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Infos */}
              <div className="flex items-center gap-3 text-xs text-[#004645]/70">
                <div className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  <span className="font-medium">{template.duration}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  <span className="font-medium">{template.capacity}</span>
                </div>
              </div>

              {/* Aperçu des sessions */}
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-[#004645] uppercase tracking-wide">
                  Programme inclus :
                </p>
                <ul className="text-xs text-[#004645]/70 space-y-1">
                  {template.sessions.slice(0, 3).map((session, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-[#009197] mt-0.5">•</span>
                      <span className="flex-1">{session.title}</span>
                      <span className="text-[#004645]/50 font-medium whitespace-nowrap">
                        {session.duration}min
                      </span>
                    </li>
                  ))}
                  {template.sessions.length > 3 && (
                    <li className="text-xs italic text-[#004645]/50 pl-3">
                      + {template.sessions.length - 3} autres sessions...
                    </li>
                  )}
                </ul>
              </div>

              {/* Bouton */}
              <Button
                type="button"
                onClick={() => onApply(template)}
                className="w-full text-white transition-all"
                style={{
                  backgroundColor: template.color,
                  boxShadow: `0 4px 12px ${template.color}40`
                }}
              >
                <Wand2 className="h-4 w-4 mr-2" />
                Appliquer ce template
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-[#009197]/30 border-2 bg-gradient-to-r from-[#009197]/5 to-transparent">
        <CardContent className="py-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#009197]/10 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">💡</span>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-[#004645] mb-1">Besoin d'un template personnalisé ?</p>
              <p className="text-sm text-[#004645]/70">
                Créez votre programme manuellement ou demandez au support de vous créer un template sur mesure
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
