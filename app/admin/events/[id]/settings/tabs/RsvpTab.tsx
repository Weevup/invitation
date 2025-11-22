"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Save,
  Loader2,
  CheckCircle2,
  Calendar,
  Users,
  Utensils,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Settings,
  Layout,
  Palette,
  Eye
} from 'lucide-react'
import { toast } from 'sonner'
import { RsvpStepsEditor } from '@/components/rsvp-steps-editor'
import { RsvpPreview } from '@/components/rsvp-preview'
import { RsvpThemeEditor, type RsvpTheme } from '@/components/rsvp-theme-editor'
import { RsvpTemplates } from '@/components/rsvp-templates'
import type { RsvpStep } from './rsvp-subtabs/RsvpStepsContent'

interface RsvpTabProps {
  event: any
  onUpdate: () => void
  initialSubTab?: string
}

export function RsvpTab({ event, onUpdate }: RsvpTabProps) {
  const [saving, setSaving] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [activeView, setActiveView] = useState('config')

  const [rsvpDeadline, setRsvpDeadline] = useState('')
  const [config, setConfig] = useState({
    // Champs de base
    allowPlusOnes: false,
    maxPlusOnes: 2,
    collectMealChoice: false,
    mealOptions: ['Menu Classique', 'Menu Végétarien', 'Menu Vegan'],
    collectAllergies: true,

    // Messages
    confirmationMessageAccepted: 'Merci ! Nous avons bien enregistré votre participation.',
    confirmationMessageDeclined: 'Nous sommes désolés que vous ne puissiez pas être des nôtres.',

    // Page de confirmation finale
    confirmationButtonText: 'Retour à l\'accueil',
    confirmationButtonUrl: '/',
    confirmationTitleAccepted: 'Confirmation enregistrée !',
    confirmationTextAccepted: 'Merci, votre participation est confirmée.',
    confirmationTitleDeclined: 'Réponse enregistrée',
    confirmationTextDeclined: 'Merci d\'avoir pris le temps de répondre. Nous espérons vous voir lors d\'un prochain événement !',

    // Options avancées
    enableAccessibility: false,
    enableTransport: false,
    enableLodging: false,
    enablePhotoConsent: true,

    // Étapes personnalisées et thème
    customSteps: [] as RsvpStep[],
    theme: {} as RsvpTheme
  })

  useEffect(() => {
    loadConfig()
  }, [event])

  const loadConfig = async () => {
    try {
      const response = await fetch(`/api/admin/events/${event.id}`)
      if (response.ok) {
        const data = await response.json()

        // Load deadline
        if (data.rsvpDeadline) {
          setRsvpDeadline(formatDateForInput(data.rsvpDeadline))
        }

        // Load config
        if (data.rsvpConfig) {
          setConfig(prev => ({
            ...prev,
            ...data.rsvpConfig,
            // Ensure we keep customSteps and theme if they exist
            customSteps: data.rsvpConfig.customSteps || prev.customSteps,
            theme: data.rsvpConfig.theme || prev.theme
          }))
        }
      }
    } catch (error) {
      console.error('Error loading config:', error)
    }
  }

  const formatDateForInput = (date: string | Date) => {
    const d = new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  const handleSave = async () => {
    // Validate deadline
    if (!rsvpDeadline) {
      toast.error('La date limite RSVP est obligatoire')
      return
    }

    setSaving(true)
    try {
      const response = await fetch(`/api/admin/events/${event.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rsvpDeadline: new Date(rsvpDeadline).toISOString(),
          rsvpConfig: config
        })
      })

      if (response.ok) {
        toast.success('Configuration RSVP enregistrée')
        onUpdate()
      } else {
        toast.error('Erreur lors de l\'enregistrement')
      }
    } catch (error) {
      toast.error('Impossible d\'enregistrer la configuration')
    } finally {
      setSaving(false)
    }
  }

  const addMealOption = () => {
    setConfig({
      ...config,
      mealOptions: [...config.mealOptions, `Option ${config.mealOptions.length + 1}`]
    })
  }

  const removeMealOption = (index: number) => {
    const newOptions = config.mealOptions.filter((_, i) => i !== index)
    setConfig({ ...config, mealOptions: newOptions })
  }

  const updateMealOption = (index: number, value: string) => {
    const newOptions = [...config.mealOptions]
    newOptions[index] = value
    setConfig({ ...config, mealOptions: newOptions })
  }

  const hasDeadline = !!rsvpDeadline

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-[#009197]/30 bg-gradient-to-r from-[#009197]/5 to-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-[#004645]">Formulaire RSVP</CardTitle>
              <CardDescription>
                Configuration complète : paramètres, étapes, design et aperçu
              </CardDescription>
            </div>
            {hasDeadline && (
              <Badge className="bg-green-100 text-green-800 border-green-200">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Configuré
              </Badge>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Navigation entre les vues */}
      <Tabs value={activeView} onValueChange={setActiveView} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-[#9CD9F6]/10 p-1">
          <TabsTrigger
            value="config"
            className="data-[state=active]:bg-white data-[state=active]:text-[#004645] data-[state=active]:shadow-sm"
          >
            <Settings className="h-4 w-4 mr-2" />
            Configuration
          </TabsTrigger>
          <TabsTrigger
            value="steps"
            className="data-[state=active]:bg-white data-[state=active]:text-[#004645] data-[state=active]:shadow-sm"
          >
            <Layout className="h-4 w-4 mr-2" />
            Étapes
          </TabsTrigger>
          <TabsTrigger
            value="design"
            className="data-[state=active]:bg-white data-[state=active]:text-[#004645] data-[state=active]:shadow-sm"
          >
            <Palette className="h-4 w-4 mr-2" />
            Design
          </TabsTrigger>
          <TabsTrigger
            value="preview"
            className="data-[state=active]:bg-white data-[state=active]:text-[#004645] data-[state=active]:shadow-sm"
          >
            <Eye className="h-4 w-4 mr-2" />
            Aperçu
          </TabsTrigger>
        </TabsList>

        {/* Vue Configuration */}
        <TabsContent value="config" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-[#004645]">Configuration Essentielle</CardTitle>
              <CardDescription>
                Les paramètres de base pour votre formulaire RSVP
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Date limite RSVP */}
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div className="flex-1 space-y-3">
                    <div>
                      <Label htmlFor="deadline" className="text-base font-semibold text-amber-900">
                        Date limite de réponse <span className="text-red-500">*</span>
                      </Label>
                      <p className="text-sm text-amber-700 mt-1">
                        Date à partir de laquelle les invités ne pourront plus modifier leur réponse
                      </p>
                    </div>
                    <Input
                      id="deadline"
                      type="datetime-local"
                      value={rsvpDeadline}
                      onChange={(e) => setRsvpDeadline(e.target.value)}
                      className="max-w-sm bg-white"
                      required
                    />
                    {rsvpDeadline && (
                      <p className="text-xs text-amber-600">
                        ⏰ Les invités pourront répondre jusqu&apos;au {new Date(rsvpDeadline).toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Question de participation */}
              <div className="flex items-start justify-between p-4 bg-[#009197]/5 rounded-lg border border-[#009197]/20">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Label className="text-base font-semibold">Question de participation</Label>
                    <Badge variant="secondary" className="text-xs">Toujours actif</Badge>
                  </div>
                  <p className="text-sm text-[#004645]/70">
                    Participez-vous à l&apos;événement ? (Oui/Non)
                  </p>
                </div>
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>

              {/* Accompagnants */}
              <div className="flex items-start justify-between p-4 bg-white rounded-lg border">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-[#009197]" />
                      <div>
                        <Label className="text-base font-semibold">Accompagnants (+1)</Label>
                        <p className="text-sm text-[#004645]/70 mt-1">
                          Permettre aux invités d&apos;amener des accompagnants
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={config.allowPlusOnes}
                      onCheckedChange={(checked) => setConfig({ ...config, allowPlusOnes: checked })}
                    />
                  </div>

                  {config.allowPlusOnes && (
                    <div className="pt-3 border-t ml-8">
                      <Label htmlFor="maxPlusOnes" className="text-sm">Nombre maximum par invité</Label>
                      <Input
                        id="maxPlusOnes"
                        type="number"
                        min="1"
                        max="10"
                        value={config.maxPlusOnes}
                        onChange={(e) => setConfig({ ...config, maxPlusOnes: parseInt(e.target.value) || 1 })}
                        className="w-24 mt-2"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Choix de repas */}
              <div className="flex items-start justify-between p-4 bg-white rounded-lg border">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Utensils className="h-5 w-5 text-[#009197]" />
                      <div>
                        <Label className="text-base font-semibold">Choix de repas</Label>
                        <p className="text-sm text-[#004645]/70 mt-1">
                          Proposer plusieurs menus au choix
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={config.collectMealChoice}
                      onCheckedChange={(checked) => setConfig({ ...config, collectMealChoice: checked })}
                    />
                  </div>

                  {config.collectMealChoice && (
                    <div className="pt-3 border-t ml-8 space-y-2">
                      <Label className="text-sm">Options de menu</Label>
                      {config.mealOptions.map((option, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={option}
                            onChange={(e) => updateMealOption(index, e.target.value)}
                            placeholder={`Menu ${index + 1}`}
                          />
                          {config.mealOptions.length > 1 && (
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => removeMealOption(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={addMealOption}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Ajouter une option
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Allergies */}
              <div className="flex items-start justify-between p-4 bg-white rounded-lg border">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="h-5 w-5 text-[#009197]" />
                      <div>
                        <Label className="text-base font-semibold">Allergies / Régimes alimentaires</Label>
                        <p className="text-sm text-[#004645]/70 mt-1">
                          Collecter les informations sur les allergies et restrictions alimentaires
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={config.collectAllergies}
                      onCheckedChange={(checked) => setConfig({ ...config, collectAllergies: checked })}
                    />
                  </div>
                </div>
              </div>

              {/* Messages de confirmation */}
              <div className="p-4 bg-gray-50 rounded-lg border space-y-4">
                <Label className="text-base font-semibold text-[#004645]">Messages de confirmation</Label>
                <p className="text-sm text-[#004645]/70">
                  Messages affichés après la soumission du formulaire
                </p>

                <div>
                  <Label htmlFor="confirmAccepted" className="text-sm">✅ Message pour les participants</Label>
                  <Textarea
                    id="confirmAccepted"
                    value={config.confirmationMessageAccepted}
                    onChange={(e) => setConfig({ ...config, confirmationMessageAccepted: e.target.value })}
                    rows={2}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="confirmDeclined" className="text-sm">❌ Message pour les absents</Label>
                  <Textarea
                    id="confirmDeclined"
                    value={config.confirmationMessageDeclined}
                    onChange={(e) => setConfig({ ...config, confirmationMessageDeclined: e.target.value })}
                    rows={2}
                    className="mt-2"
                  />
                </div>
              </div>

              {/* Page de confirmation finale */}
              <div className="p-4 bg-gradient-to-br from-[#9CD9F6]/10 to-[#009197]/5 rounded-lg border border-[#009197]/30 space-y-4">
                <div>
                  <Label className="text-base font-semibold text-[#004645]">🎉 Page de confirmation finale</Label>
                  <p className="text-sm text-[#004645]/70 mt-1">
                    Personnalisez la page affichée après validation du RSVP
                  </p>
                </div>

                {/* Bouton de redirection */}
                <div className="bg-white p-3 rounded-lg border space-y-3">
                  <Label className="text-sm font-semibold text-[#004645]">Bouton de redirection</Label>

                  <div>
                    <Label htmlFor="buttonText" className="text-xs">Texte du bouton</Label>
                    <Input
                      id="buttonText"
                      value={config.confirmationButtonText}
                      onChange={(e) => setConfig({ ...config, confirmationButtonText: e.target.value })}
                      placeholder="Ex: Retour à l'accueil"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="buttonUrl" className="text-xs">URL de redirection</Label>
                    <Input
                      id="buttonUrl"
                      value={config.confirmationButtonUrl}
                      onChange={(e) => setConfig({ ...config, confirmationButtonUrl: e.target.value })}
                      placeholder="Ex: / ou https://votre-site.com"
                      className="mt-1"
                    />
                    <p className="text-xs text-[#004645]/60 mt-1">
                      &quot;/&quot; pour l&apos;accueil ou une URL complète
                    </p>
                  </div>
                </div>

                {/* Messages pour acceptation */}
                <div className="bg-white p-3 rounded-lg border space-y-3">
                  <Label className="text-sm font-semibold text-green-700">✅ Participation confirmée</Label>

                  <div>
                    <Label htmlFor="titleAccepted" className="text-xs">Titre</Label>
                    <Input
                      id="titleAccepted"
                      value={config.confirmationTitleAccepted}
                      onChange={(e) => setConfig({ ...config, confirmationTitleAccepted: e.target.value })}
                      placeholder="Ex: Confirmation enregistrée !"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="textAccepted" className="text-xs">Message</Label>
                    <Textarea
                      id="textAccepted"
                      value={config.confirmationTextAccepted}
                      onChange={(e) => setConfig({ ...config, confirmationTextAccepted: e.target.value })}
                      placeholder="Ex: Merci, votre participation est confirmée."
                      rows={2}
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Messages pour refus */}
                <div className="bg-white p-3 rounded-lg border space-y-3">
                  <Label className="text-sm font-semibold text-orange-700">❌ Absence</Label>

                  <div>
                    <Label htmlFor="titleDeclined" className="text-xs">Titre</Label>
                    <Input
                      id="titleDeclined"
                      value={config.confirmationTitleDeclined}
                      onChange={(e) => setConfig({ ...config, confirmationTitleDeclined: e.target.value })}
                      placeholder="Ex: Réponse enregistrée"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="textDeclined" className="text-xs">Message</Label>
                    <Textarea
                      id="textDeclined"
                      value={config.confirmationTextDeclined}
                      onChange={(e) => setConfig({ ...config, confirmationTextDeclined: e.target.value })}
                      placeholder="Ex: Merci d'avoir pris le temps de répondre."
                      rows={2}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section Options Avancées */}
          <Card>
            <CardHeader>
              <Button
                variant="ghost"
                className="w-full flex items-center justify-between p-4 h-auto hover:bg-gray-50"
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                <div className="text-left">
                  <CardTitle className="text-lg text-[#004645]">Options Avancées</CardTitle>
                  <CardDescription>
                    Questions supplémentaires (transport, hébergement, accessibilité...)
                  </CardDescription>
                </div>
                {showAdvanced ? (
                  <ChevronUp className="h-5 w-5 text-[#004645]" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-[#004645]" />
                )}
              </Button>
            </CardHeader>

            {showAdvanced && (
              <CardContent className="space-y-4 pt-0">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 space-y-3">
                  <p className="text-sm text-blue-900">
                    💡 Ces options ajoutent des questions supplémentaires au formulaire RSVP
                  </p>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between bg-white p-3 rounded border">
                      <div>
                        <Label className="text-sm font-medium">Accessibilité</Label>
                        <p className="text-xs text-[#004645]/70">PMR, assistance particulière</p>
                      </div>
                      <Switch
                        checked={config.enableAccessibility}
                        onCheckedChange={(checked) => setConfig({ ...config, enableAccessibility: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between bg-white p-3 rounded border">
                      <div>
                        <Label className="text-sm font-medium">Transport</Label>
                        <p className="text-xs text-[#004645]/70">Navette, parking, covoiturage</p>
                      </div>
                      <Switch
                        checked={config.enableTransport}
                        onCheckedChange={(checked) => setConfig({ ...config, enableTransport: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between bg-white p-3 rounded border">
                      <div>
                        <Label className="text-sm font-medium">Hébergement</Label>
                        <p className="text-xs text-[#004645]/70">Besoins de logement</p>
                      </div>
                      <Switch
                        checked={config.enableLodging}
                        onCheckedChange={(checked) => setConfig({ ...config, enableLodging: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between bg-white p-3 rounded border">
                      <div>
                        <Label className="text-sm font-medium">Consentement photos/vidéos</Label>
                        <p className="text-xs text-[#004645]/70">Autorisation pour la prise de photos</p>
                      </div>
                      <Switch
                        checked={config.enablePhotoConsent}
                        onCheckedChange={(checked) => setConfig({ ...config, enablePhotoConsent: checked })}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        </TabsContent>

        {/* Vue Étapes personnalisées */}
        <TabsContent value="steps" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-[#004645]">Étapes du formulaire</CardTitle>
              <CardDescription>
                Personnalisez les étapes et les champs de votre formulaire RSVP
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RsvpStepsEditor
                steps={config.customSteps}
                onChange={(newSteps) => setConfig({ ...config, customSteps: newSteps })}
              />

              <div className="mt-6 pt-6 border-t">
                <h3 className="text-sm font-semibold text-[#004645] mb-3">Templates prédéfinis</h3>
                <RsvpTemplates
                  onSelectTemplate={(steps) => setConfig({ ...config, customSteps: steps })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vue Design */}
        <TabsContent value="design" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-[#004645]">Personnalisation visuelle</CardTitle>
              <CardDescription>
                Personnalisez les couleurs, polices et style de votre formulaire
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RsvpThemeEditor
                theme={config.theme}
                onChange={(newTheme) => setConfig({ ...config, theme: newTheme })}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vue Aperçu */}
        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-[#004645]">Aperçu du formulaire</CardTitle>
              <CardDescription>
                Prévisualisez votre formulaire tel qu&apos;il apparaîtra aux invités
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RsvpPreview
                steps={config.customSteps}
                theme={config.theme}
                eventName={event.name}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex items-center justify-between sticky bottom-0 bg-white p-4 border-t shadow-lg rounded-lg">
        <p className="text-sm text-[#004645]/70">
          {!hasDeadline && (
            <span className="text-amber-600 font-medium">⚠️ La date limite est obligatoire</span>
          )}
        </p>
        <Button
          onClick={handleSave}
          disabled={saving || !rsvpDeadline}
          size="lg"
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
              Enregistrer toute la configuration
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
