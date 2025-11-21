"use client"

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RsvpStepsEditor } from '@/components/rsvp-steps-editor'
import { RsvpPreview } from '@/components/rsvp-preview'
import { RsvpThemeEditor, type RsvpTheme } from '@/components/rsvp-theme-editor'
import { RsvpTemplates } from '@/components/rsvp-templates'
import { Loader2, Save, Eye, Monitor, Layout, Download, Upload, FileJson, BookOpen } from 'lucide-react'
import { toast } from 'sonner'
import { createClientLogger } from '@/lib/client-logger'

const logger = createClientLogger({ component: 'RsvpStepsPage' })

export interface RsvpStep {
  id: string
  type: 'message' | 'response' | 'plus-ones' | 'meal' | 'practical' | 'consent' | 'custom' | 'summary'
  label: string
  content?: string // HTML content for message steps
  enabled: boolean
  order: number
  customField?: {
    question: string
    placeholder: string
    required: boolean
  }
  conditional?: {
    enabled: boolean
    field: string // Field name to check (e.g., 'attending', 'plusOnes')
    operator: 'equals' | 'notEquals' | 'greaterThan' | 'lessThan' | 'contains'
    value: any // Value to compare against
  }
  texts?: {
    // For 'response' type
    responseQuestion?: string
    responseYes?: string
    responseNo?: string
    // For 'plus-ones' type
    plusOnesLabel?: string
    plusOnesNone?: string
    // For 'meal' type
    mealLabel?: string
    allergiesLabel?: string
    allergiesPlaceholder?: string
    // For 'practical' type
    practicalTitle?: string
    accessibilityLabel?: string
    accessibilityPlaceholder?: string
    transportLabel?: string
    transportPlaceholder?: string
    lodgingLabel?: string
    lodgingPlaceholder?: string
    // For 'consent' type
    consentLabel?: string
    // For 'summary' type
    summaryTitle?: string
    summaryIntro?: string
    // Common
    continueButton?: string
    backButton?: string
    submitButton?: string
  }
}

export default function RsvpStepsPage() {
  const params = useParams()
  const eventId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [steps, setSteps] = useState<RsvpStep[]>([])
  const [eventName, setEventName] = useState('')
  const [splitScreenEnabled, setSplitScreenEnabled] = useState(true)
  const [theme, setTheme] = useState<RsvpTheme>({})

  useEffect(() => {
    fetchSteps()
  }, [eventId])

  const fetchSteps = async () => {
    try {
      const response = await fetch(`/api/admin/events/${eventId}`)
      if (!response.ok) throw new Error('Failed to fetch event')

      const event = await response.json()
      setEventName(event.name)

      // Load custom steps from rsvpConfig or use default
      if (event.rsvpConfig?.customSteps) {
        setSteps(event.rsvpConfig.customSteps)
      } else {
        // Initialize with default steps
        setSteps(getDefaultSteps(event))
      }

      // Load theme from rsvpConfig
      if (event.rsvpConfig?.theme) {
        setTheme(event.rsvpConfig.theme)
      }
    } catch (error) {
      logger.error(error, { action: 'fetchSteps', metadata: { eventId } })
      toast.error('Erreur lors du chargement des étapes')
    } finally {
      setLoading(false)
    }
  }

  const getDefaultSteps = (event: any): RsvpStep[] => {
    const defaultSteps: RsvpStep[] = [
      {
        id: 'welcome',
        type: 'message',
        label: 'Bienvenue',
        content: '<h2>Bienvenue ! 👋</h2><p>Merci de prendre quelques instants pour confirmer votre participation.</p>',
        enabled: true,
        order: 0
      },
      {
        id: 'response',
        type: 'response',
        label: 'Réponse',
        enabled: true,
        order: 1
      },
      {
        id: 'plus-ones',
        type: 'plus-ones',
        label: 'Accompagnants',
        enabled: event.allowPlusOnes,
        order: 2
      },
      {
        id: 'meal',
        type: 'meal',
        label: 'Repas',
        enabled: event.requireMeal,
        order: 3
      },
      {
        id: 'practical',
        type: 'practical',
        label: 'Infos pratiques',
        enabled: event.enableTransport || event.enableLodging || event.enableAccessibility,
        order: 4
      },
      {
        id: 'consent',
        type: 'consent',
        label: 'Consentements',
        enabled: event.enablePhotoConsent,
        order: 5
      },
      {
        id: 'summary',
        type: 'summary',
        label: 'Récapitulatif',
        enabled: true,
        order: 6
      }
    ]

    return defaultSteps
  }

  const handleExportConfig = () => {
    try {
      const config = {
        steps,
        theme,
        exportedAt: new Date().toISOString(),
        eventName
      }

      const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `rsvp-config-${eventName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success('Configuration exportée avec succès')
    } catch (error) {
      logger.error(error, { action: 'exportConfig' })
      toast.error('Erreur lors de l\'export')
    }
  }

  const handleImportConfig = () => {
    try {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.json'
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const config = JSON.parse(e.target?.result as string)

            if (!config.steps || !Array.isArray(config.steps)) {
              throw new Error('Format de fichier invalide')
            }

            setSteps(config.steps)
            if (config.theme) {
              setTheme(config.theme)
            }

            toast.success('Configuration importée avec succès')
          } catch (error) {
            logger.error(error, { action: 'parseImport' })
            toast.error('Fichier de configuration invalide')
          }
        }
        reader.readAsText(file)
      }
      input.click()
    } catch (error) {
      logger.error(error, { action: 'importConfig' })
      toast.error('Erreur lors de l\'import')
    }
  }

  const handleOpenDocs = () => {
    window.open('https://github.com/Weevup/invitation/blob/main/docs/RSVP_CUSTOMIZATION_GUIDE.md', '_blank')
    toast.success('Documentation ouverte dans un nouvel onglet')
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/admin/events/${eventId}/rsvp-config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customSteps: steps, theme })
      })

      if (!response.ok) throw new Error('Failed to save steps')

      toast.success('Configuration RSVP sauvegardée avec succès')
    } catch (error) {
      logger.error(error, { action: 'saveSteps', metadata: { eventId } })
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const handleLoadTemplate = (templateSteps: RsvpStep[]) => {
    setSteps(templateSteps)
    toast.success('Modèle chargé avec succès ! Vous pouvez maintenant le personnaliser.')
  }

  const handlePreview = async () => {
    try {
      // Fetch first guest to get a token for preview
      const response = await fetch(`/api/admin/events/${eventId}/guests`)
      if (!response.ok) throw new Error('Failed to fetch guests')

      const guests = await response.json()

      if (guests.length === 0) {
        toast.error('Aucun invité disponible. Créez d\'abord un invité pour prévisualiser le formulaire RSVP.')
        return
      }

      // Use first guest's token for preview
      const firstGuest = guests[0]
      window.open(`/guest/${firstGuest.token}`, '_blank')
      toast.success('Prévisualisation ouverte avec le profil de ' + firstGuest.firstName)
    } catch (error) {
      logger.error(error, { action: 'openPreview', metadata: { eventId } })
      toast.error('Erreur lors de l\'ouverture de la prévisualisation')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#009197]" />
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#004645]" style={{ fontFamily: "var(--font-abril)" }}>
              Configuration du parcours RSVP
            </h1>
            <p className="text-[#004645]/70 mt-1">
              Personnalisez les étapes de confirmation pour {eventName}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <RsvpTemplates onSelectTemplate={handleLoadTemplate} />
            <Button
              variant="outline"
              onClick={handleOpenDocs}
              className="border-[#FF4713] text-[#FF4713] hover:bg-[#FF4713] hover:text-white"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Documentation
            </Button>
            <div className="flex gap-2 border-l pl-2">
              <Button
                variant="outline"
                onClick={handleExportConfig}
                className="border-[#004645] text-[#004645] hover:bg-[#004645] hover:text-white"
              >
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </Button>
              <Button
                variant="outline"
                onClick={handleImportConfig}
                className="border-[#004645] text-[#004645] hover:bg-[#004645] hover:text-white"
              >
                <Upload className="h-4 w-4 mr-2" />
                Importer
              </Button>
            </div>
            <div className="flex gap-2 border-l pl-2">
              <Button
                variant="outline"
                onClick={() => setSplitScreenEnabled(!splitScreenEnabled)}
                className="border-[#009197] text-[#009197] hover:bg-[#009197] hover:text-white"
              >
                <Layout className="h-4 w-4 mr-2" />
                {splitScreenEnabled ? 'Mode simple' : 'Aperçu temps réel'}
              </Button>
              <Button
                variant="outline"
                onClick={handlePreview}
                className="border-[#009197] text-[#009197] hover:bg-[#009197] hover:text-white"
              >
                <Eye className="h-4 w-4 mr-2" />
                Ouvrir dans un onglet
              </Button>
            </div>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-gradient-to-r from-[#004645] to-[#009197] hover:from-[#006C51] hover:to-[#009197] text-white"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Sauvegarder
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Info Card */}
      {splitScreenEnabled && (
        <Card className="mb-6 border-[#9CD9F6]/30 bg-white/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-[#004645] text-lg">💡 Aperçu en temps réel</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-[#004645]/70">
            <p>• Modifiez les étapes à gauche et voyez le résultat instantanément à droite</p>
            <p>• Les changements de texte, d&apos;ordre et d&apos;activation sont visibles en temps réel</p>
            <p>• Testez votre parcours sans avoir à le sauvegarder</p>
          </CardContent>
        </Card>
      )}

      {!splitScreenEnabled && (
        <Card className="mb-6 border-[#9CD9F6]/30 bg-white/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-[#004645] text-lg">💡 Comment ça marche ?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-[#004645]/70">
            <p>• <strong>Glissez-déposez</strong> les étapes pour les réorganiser</p>
            <p>• <strong>Activez/désactivez</strong> les étapes selon vos besoins</p>
            <p>• <strong>Ajoutez des messages</strong> pour guider vos invités</p>
            <p>• <strong>Créez des questions personnalisées</strong> pour collecter des informations spécifiques</p>
            <p>• Les étapes &quot;Réponse&quot; et &quot;Récapitulatif&quot; sont obligatoires</p>
          </CardContent>
        </Card>
      )}

      {/* Theme Editor */}
      <div className="mb-6">
        <RsvpThemeEditor theme={theme} onChange={setTheme} />
      </div>

      {/* Split Screen Layout */}
      {splitScreenEnabled ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#004645] flex items-center gap-2">
              <Layout className="h-5 w-5" />
              Éditeur
            </h3>
            <RsvpStepsEditor steps={steps} onChange={setSteps} />
          </div>
          <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">
            <h3 className="text-lg font-semibold text-[#004645] flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              Prévisualisation
            </h3>
            <RsvpPreview steps={steps} eventName={eventName} theme={theme} />
          </div>
        </div>
      ) : (
        <RsvpStepsEditor steps={steps} onChange={setSteps} />
      )}
    </div>
  )
}
