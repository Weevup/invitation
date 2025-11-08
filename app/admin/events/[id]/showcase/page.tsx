"use client"

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { ShowcaseBuilder } from '@/components/showcase-builder'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Sparkles } from 'lucide-react'

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

  useEffect(() => {
    fetch(`/api/admin/events/${eventId}`)
      .then(res => res.json())
      .then(data => {
        setEvent(data)
        setLoading(false)
      })
      .catch(error => {
        console.error('Error fetching event:', error)
        setLoading(false)
      })
  }, [eventId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Sparkles className="h-12 w-12 text-[#009197] mx-auto mb-4 animate-pulse" />
          <p className="text-[#004645]/70">Chargement...</p>
        </div>
      </div>
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
