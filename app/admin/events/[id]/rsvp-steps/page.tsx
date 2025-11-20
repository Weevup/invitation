"use client"

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RsvpStepsEditor } from '@/components/rsvp-steps-editor'
import { Loader2, Save, Eye } from 'lucide-react'
import { toast } from 'sonner'

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
}

export default function RsvpStepsPage() {
  const params = useParams()
  const eventId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [steps, setSteps] = useState<RsvpStep[]>([])
  const [eventName, setEventName] = useState('')

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
    } catch (error) {
      console.error('Error fetching steps:', error)
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

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/admin/events/${eventId}/rsvp-config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customSteps: steps })
      })

      if (!response.ok) throw new Error('Failed to save steps')

      toast.success('Configuration RSVP sauvegardée avec succès')
    } catch (error) {
      console.error('Error saving steps:', error)
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
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
      console.error('Error opening preview:', error)
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
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handlePreview}
              className="border-[#009197] text-[#009197] hover:bg-[#009197] hover:text-white"
            >
              <Eye className="h-4 w-4 mr-2" />
              Prévisualiser
            </Button>
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

      {/* Steps Editor */}
      <RsvpStepsEditor steps={steps} onChange={setSteps} />
    </div>
  )
}
