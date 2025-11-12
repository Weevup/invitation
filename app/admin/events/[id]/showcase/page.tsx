"use client"

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { ShowcaseBuilder } from '@/components/showcase-builder'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ShowcaseSkeleton } from '@/components/ui/showcase-skeleton'
import { Button } from '@/components/ui/button'
import { Sparkles, AlertCircle, RefreshCw } from 'lucide-react'

interface EventData {
  id: string
  slug: string
  showcaseEnabled: boolean
  showcaseTitle: string | null
  showcaseSubtitle: string | null
  showcaseBannerImage: string | null
  showcaseTheme: string
  showcaseSections: any
  showcasePrimaryColor: string
  showcaseSecondaryColor: string
  showcaseCustomCSS: string | null
}

export default function ShowcasePage() {
  const params = useParams()
  const eventId = params.id as string
  const [event, setEvent] = useState<EventData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadEvent = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/events/${eventId}/showcase-data`)
      if (!res.ok) {
        throw new Error(`Erreur ${res.status}: ${res.statusText}`)
      }
      const data = await res.json()
      setEvent(data)
    } catch (err) {
      console.error('Error fetching event:', err)
      setError(err instanceof Error ? err.message : 'Une erreur est survenue lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEvent()
  }, [eventId])

  if (loading) {
    return <ShowcaseSkeleton />
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <AlertCircle className="h-6 w-6 text-red-600" />
            <div>
              <CardTitle className="text-red-900">Erreur de chargement</CardTitle>
              <CardDescription className="text-red-700">{error}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Button
            onClick={loadEvent}
            variant="outline"
            className="border-red-300 text-red-700 hover:bg-red-100"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Réessayer
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!event) {
    return (
      <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur">
        <CardContent className="pt-6">
          <p className="text-center text-[#004645]/70">Événement non trouvé</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-[#004645] mb-2" style={{ fontFamily: "var(--font-abril)" }}>
          Page de présentation publique
        </h2>
        <p className="text-[#004645]/70">
          Créez une page vitrine professionnelle pour votre événement avec templates, sections personnalisables et aperçu en temps réel
        </p>
      </div>

      <ShowcaseBuilder
        eventId={eventId}
        eventSlug={event.slug}
        initialData={{
          showcaseEnabled: event.showcaseEnabled,
          showcaseTitle: event.showcaseTitle,
          showcaseSubtitle: event.showcaseSubtitle,
          showcaseBannerImage: event.showcaseBannerImage,
          showcaseTheme: event.showcaseTheme,
          showcaseSections: event.showcaseSections,
          showcasePrimaryColor: event.showcasePrimaryColor,
          showcaseSecondaryColor: event.showcaseSecondaryColor,
          showcaseCustomCSS: event.showcaseCustomCSS,
        }}
      />
    </div>
  )
}
