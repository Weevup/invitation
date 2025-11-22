"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, Save, Loader2, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

interface RsvpConfigurationSubTabProps {
  event: any
  onUpdate: () => void
}

export function RsvpConfigurationSubTab({ event, onUpdate }: RsvpConfigurationSubTabProps) {
  const [saving, setSaving] = useState(false)
  const [config, setConfig] = useState({
    // Question de participation (toujours active)
    allowPlusOnes: false,
    maxPlusOnes: 2,

    // Repas
    collectMealChoice: false,
    mealOptions: ['Menu Classique', 'Menu Végétarien', 'Menu Vegan'],

    // Allergies
    collectAllergies: true,

    // Informations pratiques
    enableAccessibility: false,
    enableTransport: false,
    enableLodging: false,

    // Consentements
    enablePhotoConsent: true,

    // Messages
    confirmationMessageAccepted: 'Merci ! Nous avons bien enregistré votre participation.',
    confirmationMessageDeclined: 'Nous sommes désolés que vous ne puissiez pas être des nôtres.',

    // Page de confirmation finale
    confirmationButtonText: 'Retour à l\'accueil',
    confirmationButtonUrl: '/',
    confirmationTitleAccepted: 'Confirmation enregistrée !',
    confirmationTextAccepted: 'Merci, votre participation est confirmée.',
    confirmationTitleDeclined: 'Réponse enregistrée',
    confirmationTextDeclined: 'Merci d\'avoir pris le temps de répondre. Nous espérons vous voir lors d\'un prochain événement !'
  })

  useEffect(() => {
    loadConfig()
  }, [event])

  const loadConfig = async () => {
    try {
      const response = await fetch(`/api/admin/events/${event.id}`)
      if (response.ok) {
        const data = await response.json()
        if (data.rsvpConfig) {
          setConfig(prev => ({ ...prev, ...data.rsvpConfig }))
        }
      }
    } catch (error) {
      console.error('Error loading config:', error)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/admin/events/${event.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
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

  return (
    <div className="space-y-6">
      {/* Informations collectées */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-[#004645]">Informations à collecter</CardTitle>
          <CardDescription>
            Activez les champs que vous souhaitez afficher dans le formulaire RSVP
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Question de participation (toujours active) */}
          <div className="flex items-start justify-between p-4 bg-[#009197]/5 rounded-lg border border-[#009197]/20">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Label className="text-base font-semibold">Question de participation</Label>
                <Badge variant="secondary" className="text-xs">Obligatoire</Badge>
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
                <div>
                  <Label className="text-base font-semibold">Accompagnants</Label>
                  <p className="text-sm text-[#004645]/70 mt-1">
                    Permettre aux invités d&apos;amener des accompagnants
                  </p>
                </div>
                <Switch
                  checked={config.allowPlusOnes}
                  onCheckedChange={(checked) => setConfig({ ...config, allowPlusOnes: checked })}
                />
              </div>

              {config.allowPlusOnes && (
                <div className="pt-3 border-t">
                  <Label htmlFor="maxPlusOnes" className="text-sm">Nombre maximum par invité</Label>
                  <Input
                    id="maxPlusOnes"
                    type="number"
                    min="1"
                    max="10"
                    value={config.maxPlusOnes}
                    onChange={(e) => setConfig({ ...config, maxPlusOnes: parseInt(e.target.value) })}
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
                <div>
                  <Label className="text-base font-semibold">Choix de repas</Label>
                  <p className="text-sm text-[#004645]/70 mt-1">
                    Proposer plusieurs menus au choix
                  </p>
                </div>
                <Switch
                  checked={config.collectMealChoice}
                  onCheckedChange={(checked) => setConfig({ ...config, collectMealChoice: checked })}
                />
              </div>

              {config.collectMealChoice && (
                <div className="pt-3 border-t space-y-2">
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
                <div>
                  <Label className="text-base font-semibold">Allergies / Régimes spécifiques</Label>
                  <p className="text-sm text-[#004645]/70 mt-1">
                    Collecter les informations sur les allergies alimentaires
                  </p>
                </div>
                <Switch
                  checked={config.collectAllergies}
                  onCheckedChange={(checked) => setConfig({ ...config, collectAllergies: checked })}
                />
              </div>
            </div>
          </div>

          {/* Informations pratiques */}
          <div className="p-4 bg-gray-50 rounded-lg border space-y-4">
            <Label className="text-base font-semibold text-[#004645]">Informations pratiques</Label>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm">Accessibilité</Label>
                  <p className="text-xs text-[#004645]/70">PMR, assistance particulière</p>
                </div>
                <Switch
                  checked={config.enableAccessibility}
                  onCheckedChange={(checked) => setConfig({ ...config, enableAccessibility: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm">Transport</Label>
                  <p className="text-xs text-[#004645]/70">Navette, parking</p>
                </div>
                <Switch
                  checked={config.enableTransport}
                  onCheckedChange={(checked) => setConfig({ ...config, enableTransport: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm">Hébergement</Label>
                  <p className="text-xs text-[#004645]/70">Besoins de logement</p>
                </div>
                <Switch
                  checked={config.enableLodging}
                  onCheckedChange={(checked) => setConfig({ ...config, enableLodging: checked })}
                />
              </div>
            </div>
          </div>

          {/* Consentements */}
          <div className="flex items-start justify-between p-4 bg-white rounded-lg border">
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-semibold">Consentement photos/vidéos</Label>
                  <p className="text-sm text-[#004645]/70 mt-1">
                    Demander l&apos;autorisation pour la prise de photos et vidéos
                  </p>
                </div>
                <Switch
                  checked={config.enablePhotoConsent}
                  onCheckedChange={(checked) => setConfig({ ...config, enablePhotoConsent: checked })}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Messages de confirmation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-[#004645]">Messages de confirmation</CardTitle>
          <CardDescription>
            Personnalisez les messages affichés après la soumission du formulaire
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="confirmAccepted">Message pour les participants</Label>
            <Textarea
              id="confirmAccepted"
              value={config.confirmationMessageAccepted}
              onChange={(e) => setConfig({ ...config, confirmationMessageAccepted: e.target.value })}
              rows={2}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="confirmDeclined">Message pour les absents</Label>
            <Textarea
              id="confirmDeclined"
              value={config.confirmationMessageDeclined}
              onChange={(e) => setConfig({ ...config, confirmationMessageDeclined: e.target.value })}
              rows={2}
              className="mt-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Page de confirmation finale */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-[#004645]">Page de confirmation finale</CardTitle>
          <CardDescription>
            Personnalisez la page affichée après validation du RSVP
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Button Configuration */}
          <div className="p-4 bg-[#9CD9F6]/10 rounded-lg border border-[#9CD9F6]/30 space-y-4">
            <Label className="text-base font-semibold text-[#004645]">Bouton de redirection</Label>

            <div>
              <Label htmlFor="buttonText">Texte du bouton</Label>
              <Input
                id="buttonText"
                value={config.confirmationButtonText}
                onChange={(e) => setConfig({ ...config, confirmationButtonText: e.target.value })}
                placeholder="Ex: Retour à l'accueil"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="buttonUrl">URL de redirection</Label>
              <Input
                id="buttonUrl"
                value={config.confirmationButtonUrl}
                onChange={(e) => setConfig({ ...config, confirmationButtonUrl: e.target.value })}
                placeholder="Ex: / ou https://votre-site.com"
                className="mt-2"
              />
              <p className="text-xs text-[#004645]/70 mt-1">
                Utilisez &quot;/&quot; pour la page d&apos;accueil ou une URL complète
              </p>
            </div>
          </div>

          {/* Accepted Confirmation */}
          <div className="space-y-3">
            <Label className="text-base font-semibold text-[#004645]">Message pour participation confirmée</Label>

            <div>
              <Label htmlFor="titleAccepted">Titre</Label>
              <Input
                id="titleAccepted"
                value={config.confirmationTitleAccepted}
                onChange={(e) => setConfig({ ...config, confirmationTitleAccepted: e.target.value })}
                placeholder="Ex: Confirmation enregistrée !"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="textAccepted">Message</Label>
              <Textarea
                id="textAccepted"
                value={config.confirmationTextAccepted}
                onChange={(e) => setConfig({ ...config, confirmationTextAccepted: e.target.value })}
                placeholder="Ex: Merci, votre participation est confirmée."
                rows={2}
                className="mt-2"
              />
            </div>
          </div>

          {/* Declined Confirmation */}
          <div className="space-y-3">
            <Label className="text-base font-semibold text-[#004645]">Message pour absence</Label>

            <div>
              <Label htmlFor="titleDeclined">Titre</Label>
              <Input
                id="titleDeclined"
                value={config.confirmationTitleDeclined}
                onChange={(e) => setConfig({ ...config, confirmationTitleDeclined: e.target.value })}
                placeholder="Ex: Réponse enregistrée"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="textDeclined">Message</Label>
              <Textarea
                id="textDeclined"
                value={config.confirmationTextDeclined}
                onChange={(e) => setConfig({ ...config, confirmationTextDeclined: e.target.value })}
                placeholder="Ex: Merci d'avoir pris le temps de répondre."
                rows={2}
                className="mt-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
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
              Enregistrer la configuration
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
