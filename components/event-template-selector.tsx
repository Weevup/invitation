"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Check, Info, Sparkles, X } from 'lucide-react'
import { getPopularEventTemplates, type EventTemplateConfig, type EventType } from '@/lib/event-templates'
import { cn } from '@/lib/utils'

interface EventTemplateSelectorProps {
  onSelectTemplate: (template: EventTemplateConfig) => void
  selectedTemplateId?: EventType
  trigger?: React.ReactNode
}

export function EventTemplateSelector({
  onSelectTemplate,
  selectedTemplateId,
  trigger
}: EventTemplateSelectorProps) {
  const [open, setOpen] = useState(false)
  const [previewTemplate, setPreviewTemplate] = useState<EventTemplateConfig | null>(null)
  const templates = getPopularEventTemplates()

  const handleSelect = (template: EventTemplateConfig) => {
    onSelectTemplate(template)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-gradient-to-r from-[#004645] to-[#009197] text-white">
            <Sparkles className="h-4 w-4 mr-2" />
            Choisir un modèle
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-[#004645]">
            Choisissez un type d'événement
          </DialogTitle>
          <DialogDescription>
            Chaque modèle configure automatiquement les options RSVP, les textes et le thème visuel adaptés à votre événement
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {templates.map((template) => (
            <Card
              key={template.id}
              className={cn(
                "cursor-pointer transition-all hover:shadow-lg hover:scale-105",
                selectedTemplateId === template.id && "ring-2 ring-offset-2",
                "relative overflow-hidden"
              )}
              style={{
                borderColor: template.color,
                ...(selectedTemplateId === template.id && { ringColor: template.color })
              }}
              onClick={() => setPreviewTemplate(template)}
            >
              {selectedTemplateId === template.id && (
                <div className="absolute top-2 right-2 z-10">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: template.color }}
                  >
                    <Check className="h-4 w-4 text-white" />
                  </div>
                </div>
              )}

              <div
                className="h-3 w-full absolute top-0 left-0"
                style={{ backgroundColor: template.color }}
              />

              <CardHeader className="pt-6">
                <div className="text-4xl mb-2">{template.icon}</div>
                <CardTitle className="text-lg">{template.name}</CardTitle>
                <CardDescription className="text-sm">
                  {template.description}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    className="flex-1"
                    style={{ backgroundColor: template.color }}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleSelect(template)
                    }}
                  >
                    <Check className="h-3 w-3 mr-1" />
                    Choisir
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation()
                      setPreviewTemplate(template)
                    }}
                  >
                    <Info className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Preview Dialog */}
        {previewTemplate && (
          <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className="text-5xl">{previewTemplate.icon}</div>
                  <div>
                    <DialogTitle className="text-2xl">{previewTemplate.name}</DialogTitle>
                    <DialogDescription>{previewTemplate.description}</DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                {/* Configuration RSVP */}
                <div>
                  <h4 className="font-semibold text-[#004645] mb-2 flex items-center gap-2">
                    ✅ Configuration RSVP
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      {previewTemplate.rsvpConfig.allowPlusOnes ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-gray-400" />
                      )}
                      <span>Accompagnants ({previewTemplate.rsvpConfig.maxPlusOnes} max)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {previewTemplate.rsvpConfig.requireMeal ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-gray-400" />
                      )}
                      <span>Choix de repas</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {previewTemplate.rsvpConfig.enableTransport ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-gray-400" />
                      )}
                      <span>Transport</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {previewTemplate.rsvpConfig.enableLodging ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-gray-400" />
                      )}
                      <span>Hébergement</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {previewTemplate.rsvpConfig.enableAccessibility ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-gray-400" />
                      )}
                      <span>Accessibilité</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {previewTemplate.rsvpConfig.enablePhotoConsent ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-gray-400" />
                      )}
                      <span>Consentement photos</span>
                    </div>
                  </div>
                </div>

                {/* Options de repas */}
                {previewTemplate.rsvpConfig.mealOptions.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-[#004645] mb-2 flex items-center gap-2">
                      🍽️ Options de repas
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {previewTemplate.rsvpConfig.mealOptions.map((option, idx) => (
                        <Badge key={idx} variant="outline">
                          {option}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Thème */}
                <div>
                  <h4 className="font-semibold text-[#004645] mb-2 flex items-center gap-2">
                    🎨 Thème visuel
                  </h4>
                  <div className="flex gap-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded border"
                        style={{ backgroundColor: previewTemplate.theme.primaryColor }}
                      />
                      <span className="text-xs">Principale</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded border"
                        style={{ backgroundColor: previewTemplate.theme.secondaryColor }}
                      />
                      <span className="text-xs">Secondaire</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded border"
                        style={{ backgroundColor: previewTemplate.theme.accentColor }}
                      />
                      <span className="text-xs">Accent</span>
                    </div>
                  </div>
                </div>

                {/* Textes personnalisés */}
                {previewTemplate.customTexts && (
                  <div>
                    <h4 className="font-semibold text-[#004645] mb-2 flex items-center gap-2">
                      💬 Exemples de textes
                    </h4>
                    <div className="space-y-2 text-sm bg-gray-50 p-3 rounded-lg">
                      <p className="italic text-[#004645]">
                        "{previewTemplate.customTexts.welcomeGreeting}"
                      </p>
                      <p className="italic text-[#004645]/70">
                        "{previewTemplate.customTexts.responseQuestion}"
                      </p>
                      <p className="italic text-green-700">
                        "{previewTemplate.customTexts.responseYes}"
                      </p>
                    </div>
                  </div>
                )}

                {/* Suggestions */}
                {previewTemplate.suggestions && (
                  <div className="p-3 bg-[#9CD9F6]/10 rounded-lg">
                    <h4 className="font-semibold text-[#004645] mb-2">💡 Suggestions</h4>
                    <div className="text-sm space-y-1">
                      {previewTemplate.suggestions.dressCode && (
                        <p><strong>Dress code :</strong> {previewTemplate.suggestions.dressCode}</p>
                      )}
                      {previewTemplate.suggestions.emailSubject && (
                        <p><strong>Sujet email :</strong> {previewTemplate.suggestions.emailSubject}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-4">
                <Button
                  className="flex-1"
                  style={{ backgroundColor: previewTemplate.color }}
                  onClick={() => {
                    handleSelect(previewTemplate)
                    setPreviewTemplate(null)
                  }}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Choisir ce modèle
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setPreviewTemplate(null)}
                >
                  Fermer
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  )
}

/**
 * Compact version for inline use
 */
export function EventTemplateQuickSelector({
  onSelectTemplate,
  selectedTemplateId
}: EventTemplateSelectorProps) {
  const templates = getPopularEventTemplates()

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {templates.map((template) => (
        <button
          key={template.id}
          onClick={() => onSelectTemplate(template)}
          className={cn(
            "p-4 rounded-lg border-2 transition-all hover:shadow-md",
            selectedTemplateId === template.id
              ? "shadow-lg scale-105"
              : "hover:scale-105"
          )}
          style={{
            borderColor: selectedTemplateId === template.id ? template.color : '#e5e7eb',
            backgroundColor: selectedTemplateId === template.id ? `${template.color}10` : 'white'
          }}
        >
          <div className="text-3xl mb-2">{template.icon}</div>
          <div className="text-sm font-semibold text-[#004645]">{template.name}</div>
        </button>
      ))}
    </div>
  )
}
