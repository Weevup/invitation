'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BadgeTemplateSelector } from '@/components/admin/badge-template-selector'
import { BadgeDesigner } from '@/components/admin/badge-designer'
import {
  type BadgeTemplate,
  type BadgeSize,
  type BadgeOrientation,
  type BadgeField,
  type BadgeLayout,
  BADGE_SIZES,
} from '@/lib/badge-generator'
import {
  Palette,
  Wand2,
  Save,
  CheckCircle,
  Loader2,
  Layout,
} from 'lucide-react'
import { toast } from 'sonner'

interface BadgeConfigProps {
  eventId: string
  currentDesign?: {
    id: string
    name: string
    size: BadgeSize
    orientation: BadgeOrientation
    layout: BadgeLayout
    fields: BadgeField[]
  } | null
  onSave?: () => void
}

export function BadgeConfig({ eventId, currentDesign, onSave }: BadgeConfigProps) {
  const [step, setStep] = useState<'template' | 'customize'>('template')
  const [selectedTemplate, setSelectedTemplate] = useState<BadgeTemplate | null>(null)
  const [customizing, setCustomizing] = useState(false)
  const [saving, setSaving] = useState(false)

  // Design state
  const [size, setSize] = useState<BadgeSize>(
    currentDesign?.size || 'STANDARD'
  )
  const [orientation, setOrientation] = useState<BadgeOrientation>(
    currentDesign?.orientation || 'PORTRAIT'
  )
  const [fields, setFields] = useState<BadgeField[]>(currentDesign?.fields || [])
  const [layout, setLayout] = useState<BadgeLayout>(
    currentDesign?.layout || {
      backgroundColor: '#ffffff',
      borderColor: '#004645',
      borderWidth: 2,
    }
  )

  const handleSelectTemplate = (template: BadgeTemplate) => {
    setSelectedTemplate(template)
    setSize(template.size)
    setOrientation(template.orientation)
    setFields(template.fields)
    setLayout(template.layout)
  }

  const handleCustomize = () => {
    if (!selectedTemplate) {
      toast.error('Veuillez sélectionner un template')
      return
    }
    setCustomizing(true)
    setStep('customize')
  }

  const handleSaveDesign = async () => {
    if (!selectedTemplate) {
      toast.error('Aucun template sélectionné')
      return
    }

    setSaving(true)

    try {
      const response = await fetch(`/api/admin/events/${eventId}/badge-design`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: selectedTemplate.name,
          size,
          orientation,
          layout,
          fields,
          fontFamily: selectedTemplate.fontFamily || 'Inter',
          includeQRCode: true,
          qrCodeSize: 80,
          badgesPerPage: 10,
          pageMargin: 10,
          badgeSpacing: 5,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Erreur lors de la sauvegarde')
      }

      toast.success('Design de badge sauvegardé avec succès')
      onSave?.()
    } catch (error) {
      console.error('Save error:', error)
      toast.error(
        error instanceof Error ? error.message : 'Erreur lors de la sauvegarde'
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <div className="flex items-center gap-4">
        <div
          className={`flex items-center gap-2 ${
            step === 'template' ? 'text-primary' : 'text-muted-foreground'
          }`}
        >
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
              step === 'template'
                ? 'border-primary bg-primary text-primary-foreground'
                : selectedTemplate
                ? 'border-green-500 bg-green-500 text-white'
                : 'border-muted-foreground'
            }`}
          >
            {selectedTemplate && step !== 'template' ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              '1'
            )}
          </div>
          <span className="font-medium">Choisir un template</span>
        </div>

        <div className="h-px flex-1 bg-border" />

        <div
          className={`flex items-center gap-2 ${
            step === 'customize' ? 'text-primary' : 'text-muted-foreground'
          }`}
        >
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
              step === 'customize'
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-muted-foreground'
            }`}
          >
            2
          </div>
          <span className="font-medium">Personnaliser</span>
        </div>
      </div>

      {/* Template Selection */}
      {step === 'template' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Choisissez un template de badge
            </CardTitle>
            <CardDescription>
              Sélectionnez un template professionnel parmi nos catégories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BadgeTemplateSelector
              onSelectTemplate={handleSelectTemplate}
              selectedTemplateId={selectedTemplate?.name}
            />

            {selectedTemplate && (
              <div className="mt-6 flex items-center justify-between pt-6 border-t">
                <Alert className="flex-1 mr-4">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Template sélectionné: <strong>{selectedTemplate.name}</strong>
                  </AlertDescription>
                </Alert>

                <Button onClick={handleCustomize} size="lg">
                  <Wand2 className="h-4 w-4 mr-2" />
                  Personnaliser
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Customization */}
      {step === 'customize' && selectedTemplate && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Wand2 className="h-5 w-5" />
                    Designer visuel drag & drop
                  </CardTitle>
                  <CardDescription>
                    Template: {selectedTemplate.name} - Positionnez et personnalisez
                    les champs de votre badge
                  </CardDescription>
                </div>
                <Button variant="outline" onClick={() => setStep('template')}>
                  <Layout className="h-4 w-4 mr-2" />
                  Changer de template
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Size and Orientation Controls */}
              <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/50">
                <div className="space-y-2">
                  <Label>Taille du badge</Label>
                  <Select
                    value={size}
                    onValueChange={(value) => setSize(value as BadgeSize)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(BADGE_SIZES).map((sizeKey) => (
                        <SelectItem key={sizeKey} value={sizeKey}>
                          {sizeKey}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Orientation</Label>
                  <Select
                    value={orientation}
                    onValueChange={(value) =>
                      setOrientation(value as BadgeOrientation)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PORTRAIT">Portrait</SelectItem>
                      <SelectItem value="LANDSCAPE">Paysage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Badge Designer */}
              <BadgeDesigner
                size={size}
                orientation={orientation}
                fields={fields}
                onFieldsChange={setFields}
                backgroundColor={layout.backgroundColor}
              />

              {/* Save Button */}
              <div className="flex justify-end pt-4 border-t">
                <Button
                  onClick={handleSaveDesign}
                  disabled={saving}
                  size="lg"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sauvegarde...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Sauvegarder le design
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
