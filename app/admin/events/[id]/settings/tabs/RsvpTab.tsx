"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
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
  Trash2
} from 'lucide-react'
import { toast } from 'sonner'

interface RsvpTabProps {
  event: any
  onUpdate: () => void
  initialSubTab?: string
}

export function RsvpTab({ event, onUpdate }: RsvpTabProps) {
  const [saving, setSaving] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)

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

    // Options avancées
    enableAccessibility: false,
    enableTransport: false,
    enableLodging: false,
    enablePhotoConsent: true,
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
          setConfig(prev => ({ ...prev, ...data.rsvpConfig }))
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
                Configuration simple du formulaire de confirmation de présence
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

      {/* Section 1 : Configuration Essentielle */}
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
        </CardContent>
      </Card>

      {/* Section 2 : Options Avancées (Collapsible) */}
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

      {/* Save Button */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#004645]/70">
          {!hasDeadline && (
            <span className="text-amber-600 font-medium">⚠️ La date limite est obligatoire</span>
          )}
        </p>
        <Button
          onClick={handleSave}
          disabled={saving || !rsvpDeadline}
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
              Enregistrer la configuration
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
