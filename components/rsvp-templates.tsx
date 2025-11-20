"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Heart, Briefcase, PartyPopper, GraduationCap, Sparkles } from 'lucide-react'
import type { RsvpStep } from '@/app/admin/events/[id]/rsvp-steps/page'

interface RsvpTemplatesProps {
  onSelectTemplate: (steps: RsvpStep[]) => void
}

const TEMPLATES = {
  wedding: {
    name: 'Mariage',
    description: 'Configuration complète pour un mariage avec repas, +1, et infos pratiques',
    icon: Heart,
    color: '#FF69B4',
    steps: [
      {
        id: 'welcome-wedding',
        type: 'message' as const,
        label: 'Message de bienvenue',
        content: '<h2>💍 Nous nous marions !</h2><p>Chère famille, chers amis,</p><p>C\'est avec une grande joie que nous vous invitons à célébrer notre union. Merci de confirmer votre présence.</p>',
        enabled: true,
        order: 0
      },
      {
        id: 'response',
        type: 'response' as const,
        label: 'Confirmation de présence',
        enabled: true,
        order: 1
      },
      {
        id: 'plus-ones',
        type: 'plus-ones' as const,
        label: 'Accompagnants',
        enabled: true,
        order: 2,
        conditional: {
          enabled: true,
          field: 'attending',
          operator: 'equals' as const,
          value: true
        }
      },
      {
        id: 'meal',
        type: 'meal' as const,
        label: 'Préférences repas',
        enabled: true,
        order: 3,
        conditional: {
          enabled: true,
          field: 'attending',
          operator: 'equals' as const,
          value: true
        }
      },
      {
        id: 'practical',
        type: 'practical' as const,
        label: 'Informations pratiques',
        enabled: true,
        order: 4,
        conditional: {
          enabled: true,
          field: 'attending',
          operator: 'equals' as const,
          value: true
        }
      },
      {
        id: 'consent',
        type: 'consent' as const,
        label: 'Autorisation photos',
        enabled: true,
        order: 5,
        conditional: {
          enabled: true,
          field: 'attending',
          operator: 'equals' as const,
          value: true
        }
      },
      {
        id: 'summary',
        type: 'summary' as const,
        label: 'Récapitulatif',
        enabled: true,
        order: 6
      }
    ]
  },
  corporate: {
    name: 'Événement d\'entreprise',
    description: 'Séminaire, conférence, ou événement professionnel',
    icon: Briefcase,
    color: '#4A90E2',
    steps: [
      {
        id: 'welcome-corporate',
        type: 'message' as const,
        label: 'Message de bienvenue',
        content: '<h2>📊 Événement Professionnel</h2><p>Vous êtes invité à notre événement d\'entreprise. Merci de confirmer votre participation.</p>',
        enabled: true,
        order: 0
      },
      {
        id: 'response',
        type: 'response' as const,
        label: 'Confirmation de présence',
        enabled: true,
        order: 1
      },
      {
        id: 'meal',
        type: 'meal' as const,
        label: 'Préférences repas',
        enabled: true,
        order: 2,
        conditional: {
          enabled: true,
          field: 'attending',
          operator: 'equals' as const,
          value: true
        }
      },
      {
        id: 'practical',
        type: 'practical' as const,
        label: 'Transport & Hébergement',
        enabled: true,
        order: 3,
        conditional: {
          enabled: true,
          field: 'attending',
          operator: 'equals' as const,
          value: true
        }
      },
      {
        id: 'summary',
        type: 'summary' as const,
        label: 'Récapitulatif',
        enabled: true,
        order: 4
      }
    ]
  },
  party: {
    name: 'Fête / Célébration',
    description: 'Anniversaire, soirée, ou célébration informelle',
    icon: PartyPopper,
    color: '#FF6B6B',
    steps: [
      {
        id: 'welcome-party',
        type: 'message' as const,
        label: 'Invitation',
        content: '<h2>🎉 Vous êtes invité !</h2><p>Rejoignez-nous pour une soirée inoubliable. Votre présence nous ferait très plaisir !</p>',
        enabled: true,
        order: 0
      },
      {
        id: 'response',
        type: 'response' as const,
        label: 'Confirmation',
        enabled: true,
        order: 1
      },
      {
        id: 'plus-ones',
        type: 'plus-ones' as const,
        label: 'Accompagnants',
        enabled: true,
        order: 2,
        conditional: {
          enabled: true,
          field: 'attending',
          operator: 'equals' as const,
          value: true
        }
      },
      {
        id: 'custom-dietary',
        type: 'custom' as const,
        label: 'Restrictions alimentaires',
        enabled: true,
        order: 3,
        customField: {
          question: 'Avez-vous des restrictions alimentaires particulières ?',
          placeholder: 'Allergies, régime spécial...',
          required: false
        },
        conditional: {
          enabled: true,
          field: 'attending',
          operator: 'equals' as const,
          value: true
        }
      },
      {
        id: 'summary',
        type: 'summary' as const,
        label: 'Confirmation',
        enabled: true,
        order: 4
      }
    ]
  },
  conference: {
    name: 'Conférence / Formation',
    description: 'Séminaire, formation, ou conférence avec sessions',
    icon: GraduationCap,
    color: '#9C27B0',
    steps: [
      {
        id: 'welcome-conf',
        type: 'message' as const,
        label: 'Bienvenue',
        content: '<h2>🎓 Conférence</h2><p>Inscrivez-vous à notre conférence. Places limitées !</p>',
        enabled: true,
        order: 0
      },
      {
        id: 'response',
        type: 'response' as const,
        label: 'Inscription',
        enabled: true,
        order: 1
      },
      {
        id: 'meal',
        type: 'meal' as const,
        label: 'Déjeuners & Pauses',
        enabled: true,
        order: 2,
        conditional: {
          enabled: true,
          field: 'attending',
          operator: 'equals' as const,
          value: true
        }
      },
      {
        id: 'custom-workshop',
        type: 'custom' as const,
        label: 'Ateliers souhaités',
        enabled: true,
        order: 3,
        customField: {
          question: 'Quels ateliers souhaitez-vous suivre ?',
          placeholder: 'Listez les ateliers qui vous intéressent...',
          required: false
        },
        conditional: {
          enabled: true,
          field: 'attending',
          operator: 'equals' as const,
          value: true
        }
      },
      {
        id: 'practical',
        type: 'practical' as const,
        label: 'Logistique',
        enabled: true,
        order: 4,
        conditional: {
          enabled: true,
          field: 'attending',
          operator: 'equals' as const,
          value: true
        }
      },
      {
        id: 'summary',
        type: 'summary' as const,
        label: 'Récapitulatif',
        enabled: true,
        order: 5
      }
    ]
  },
  minimal: {
    name: 'Simple',
    description: 'Configuration minimale : réponse et récapitulatif uniquement',
    icon: Sparkles,
    color: '#78909C',
    steps: [
      {
        id: 'response',
        type: 'response' as const,
        label: 'Votre réponse',
        enabled: true,
        order: 0
      },
      {
        id: 'summary',
        type: 'summary' as const,
        label: 'Confirmation',
        enabled: true,
        order: 1
      }
    ]
  }
}

export function RsvpTemplates({ onSelectTemplate }: RsvpTemplatesProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="border-[#009197] text-[#009197] hover:bg-[#009197] hover:text-white"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Charger un modèle
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modèles de formulaire RSVP</DialogTitle>
          <DialogDescription>
            Gagnez du temps en chargeant une configuration prête à l&apos;emploi. Vous pourrez la personnaliser ensuite.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {Object.entries(TEMPLATES).map(([key, template]) => {
            const Icon = template.icon
            return (
              <Card
                key={key}
                className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-[#009197]"
                onClick={() => onSelectTemplate(template.steps)}
              >
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div
                      className="p-3 rounded-lg"
                      style={{ backgroundColor: `${template.color}20` }}
                    >
                      <Icon
                        className="h-6 w-6"
                        style={{ color: template.color }}
                      />
                    </div>
                    <div>
                      <CardTitle className="text-[#004645]">{template.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {template.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-[#004645]/70">
                    <strong>{template.steps.length} étapes</strong>
                    <ul className="mt-2 space-y-1 list-disc list-inside">
                      {template.steps.slice(0, 3).map(step => (
                        <li key={step.id}>{step.label}</li>
                      ))}
                      {template.steps.length > 3 && (
                        <li className="text-[#004645]/50">
                          +{template.steps.length - 3} autres...
                        </li>
                      )}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="mt-4 p-4 bg-[#9CD9F6]/10 rounded-lg border border-[#9CD9F6]/30">
          <p className="text-sm text-[#004645]/70">
            💡 <strong>Astuce :</strong> Après avoir chargé un modèle, vous pouvez le personnaliser entièrement :
            modifier les textes, ajouter/supprimer des étapes, changer les couleurs, etc.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
