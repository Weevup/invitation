"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  ArrowUp,
  ArrowDown,
  Plus,
  Trash2,
  GripVertical,
  MessageSquare,
  CheckCircle,
  Users,
  Utensils,
  Info,
  FileCheck,
  Edit,
  HelpCircle
} from 'lucide-react'
import type { RsvpStep } from '@/app/admin/events/[id]/rsvp-steps/page'

interface RsvpStepsEditorProps {
  steps: RsvpStep[]
  onChange: (steps: RsvpStep[]) => void
}

const STEP_TYPE_INFO = {
  message: {
    icon: MessageSquare,
    label: 'Message',
    description: 'Afficher un message d\'instruction ou d\'information',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    canDelete: true
  },
  response: {
    icon: CheckCircle,
    label: 'Réponse',
    description: 'Oui/Non à la participation',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    canDelete: false
  },
  'plus-ones': {
    icon: Users,
    label: 'Accompagnants',
    description: 'Nombre d\'accompagnants',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    canDelete: true
  },
  meal: {
    icon: Utensils,
    label: 'Repas',
    description: 'Choix de menu et allergies',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    canDelete: true
  },
  practical: {
    icon: Info,
    label: 'Infos pratiques',
    description: 'Transport, hébergement, accessibilité',
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
    canDelete: true
  },
  consent: {
    icon: FileCheck,
    label: 'Consentements',
    description: 'Autorisation photos, RGPD, etc.',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    canDelete: true
  },
  custom: {
    icon: HelpCircle,
    label: 'Question personnalisée',
    description: 'Poser une question libre',
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    canDelete: true
  },
  summary: {
    icon: FileCheck,
    label: 'Récapitulatif',
    description: 'Résumé avant validation',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    canDelete: false
  }
}

export function RsvpStepsEditor({ steps, onChange }: RsvpStepsEditorProps) {
  const [editingStep, setEditingStep] = useState<RsvpStep | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [addDialogOpen, setAddDialogOpen] = useState(false)

  const moveStep = (index: number, direction: 'up' | 'down') => {
    const newSteps = [...steps]
    const targetIndex = direction === 'up' ? index - 1 : index + 1

    if (targetIndex < 0 || targetIndex >= newSteps.length) return

    // Swap
    ;[newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]]

    // Update order
    newSteps.forEach((step, idx) => {
      step.order = idx
    })

    onChange(newSteps)
  }

  const toggleStep = (index: number) => {
    const newSteps = [...steps]
    newSteps[index].enabled = !newSteps[index].enabled
    onChange(newSteps)
  }

  const deleteStep = (index: number) => {
    const newSteps = steps.filter((_, idx) => idx !== index)
    // Update order
    newSteps.forEach((step, idx) => {
      step.order = idx
    })
    onChange(newSteps)
  }

  const editStep = (step: RsvpStep) => {
    setEditingStep({ ...step })
    setDialogOpen(true)
  }

  const saveEdit = () => {
    if (!editingStep) return

    const newSteps = steps.map(s =>
      s.id === editingStep.id ? editingStep : s
    )
    onChange(newSteps)
    setDialogOpen(false)
    setEditingStep(null)
  }

  const addStep = (type: RsvpStep['type']) => {
    const newStep: RsvpStep = {
      id: `step-${Date.now()}`,
      type,
      label: STEP_TYPE_INFO[type].label,
      content: type === 'message' ? '<p>Votre message ici...</p>' : undefined,
      enabled: true,
      order: steps.length,
      customField: type === 'custom' ? {
        question: 'Votre question',
        placeholder: 'Réponse...',
        required: false
      } : undefined
    }

    onChange([...steps, newStep])
    setAddDialogOpen(false)
  }

  return (
    <div className="space-y-4">
      {/* Steps List */}
      <div className="space-y-3">
        {steps.map((step, index) => {
          const info = STEP_TYPE_INFO[step.type]
          const Icon = info.icon

          return (
            <Card
              key={step.id}
              className={`border-2 ${step.enabled ? 'border-[#9CD9F6]/30' : 'border-gray-200 opacity-60'} bg-white/80 backdrop-blur transition-all hover:shadow-md`}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  {/* Drag handle */}
                  <div className="flex flex-col gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveStep(index, 'up')}
                      disabled={index === 0}
                      className="h-6 w-6 p-0"
                    >
                      <ArrowUp className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveStep(index, 'down')}
                      disabled={index === steps.length - 1}
                      className="h-6 w-6 p-0"
                    >
                      <ArrowDown className="h-3 w-3" />
                    </Button>
                  </div>

                  {/* Icon */}
                  <div className={`p-3 rounded-lg ${info.bgColor}`}>
                    <Icon className={`h-5 w-5 ${info.color}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-[#004645]">{step.label}</h3>
                      <span className="text-xs text-[#004645]/50">#{index + 1}</span>
                    </div>
                    <p className="text-sm text-[#004645]/70">{info.description}</p>
                    {step.type === 'message' && step.content && (
                      <div className="mt-2 text-xs text-[#004645]/50 line-clamp-2">
                        <div dangerouslySetInnerHTML={{ __html: step.content }} />
                      </div>
                    )}
                    {step.type === 'custom' && step.customField && (
                      <div className="mt-2 text-sm text-[#004645]/70">
                        Question : {step.customField.question}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center space-x-2">
                      <Label htmlFor={`switch-${step.id}`} className="text-xs text-[#004645]/70">
                        {step.enabled ? 'Activé' : 'Désactivé'}
                      </Label>
                      <Switch
                        id={`switch-${step.id}`}
                        checked={step.enabled}
                        onCheckedChange={() => toggleStep(index)}
                        disabled={!info.canDelete}
                      />
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => editStep(step)}
                      className="text-[#009197] hover:text-[#004645]"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>

                    {info.canDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteStep(index)}
                        className="text-[#FF4713] hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Add Step Button */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="w-full border-dashed border-2 border-[#009197] text-[#009197] hover:bg-[#009197] hover:text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une étape
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Ajouter une étape</DialogTitle>
            <DialogDescription>
              Choisissez le type d&apos;étape à ajouter à votre parcours RSVP
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 mt-4">
            {Object.entries(STEP_TYPE_INFO).map(([type, info]) => {
              const Icon = info.icon
              if (type === 'response' || type === 'summary') return null // Can't add these

              return (
                <Card
                  key={type}
                  className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-[#009197]"
                  onClick={() => addStep(type as RsvpStep['type'])}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${info.bgColor}`}>
                        <Icon className={`h-5 w-5 ${info.color}`} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-[#004645]">{info.label}</h4>
                        <p className="text-xs text-[#004645]/70 mt-1">{info.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Step Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Modifier l&apos;étape</DialogTitle>
            <DialogDescription>
              Personnalisez le contenu et les paramètres de cette étape
            </DialogDescription>
          </DialogHeader>
          {editingStep && (
            <div className="space-y-4 mt-4">
              <div>
                <Label>Libellé de l&apos;étape</Label>
                <Input
                  value={editingStep.label}
                  onChange={(e) => setEditingStep({ ...editingStep, label: e.target.value })}
                  placeholder="Ex: Bienvenue, Informations..."
                />
              </div>

              {editingStep.type === 'message' && (
                <div>
                  <Label>Contenu HTML</Label>
                  <Textarea
                    value={editingStep.content || ''}
                    onChange={(e) => setEditingStep({ ...editingStep, content: e.target.value })}
                    rows={8}
                    className="font-mono text-sm"
                    placeholder="<h2>Titre</h2><p>Votre message...</p>"
                  />
                  <p className="text-xs text-[#004645]/70 mt-1">
                    Vous pouvez utiliser des balises HTML : &lt;h2&gt;, &lt;p&gt;, &lt;strong&gt;, &lt;em&gt;, &lt;ul&gt;, &lt;li&gt;
                  </p>
                </div>
              )}

              {editingStep.type === 'custom' && (
                <>
                  <div>
                    <Label>Question</Label>
                    <Input
                      value={editingStep.customField?.question || ''}
                      onChange={(e) => setEditingStep({
                        ...editingStep,
                        customField: {
                          ...editingStep.customField!,
                          question: e.target.value
                        }
                      })}
                      placeholder="Ex: Avez-vous des besoins particuliers ?"
                    />
                  </div>
                  <div>
                    <Label>Placeholder</Label>
                    <Input
                      value={editingStep.customField?.placeholder || ''}
                      onChange={(e) => setEditingStep({
                        ...editingStep,
                        customField: {
                          ...editingStep.customField!,
                          placeholder: e.target.value
                        }
                      })}
                      placeholder="Ex: Décrivez vos besoins..."
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="required"
                      checked={editingStep.customField?.required || false}
                      onCheckedChange={(checked) => setEditingStep({
                        ...editingStep,
                        customField: {
                          ...editingStep.customField!,
                          required: checked
                        }
                      })}
                    />
                    <Label htmlFor="required">Champ obligatoire</Label>
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Annuler
                </Button>
                <Button
                  onClick={saveEdit}
                  className="bg-gradient-to-r from-[#004645] to-[#009197] hover:from-[#006C51] hover:to-[#009197] text-white"
                >
                  Sauvegarder
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
