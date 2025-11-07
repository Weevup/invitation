"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Sparkles,
  Eye,
  Save,
  Loader2,
  CheckCircle,
  Palette,
  Layout,
  ExternalLink,
  Image as ImageIcon,
  MessageCircle,
  Video,
  Clock
} from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { GalleryEditor } from '@/components/showcase/gallery-editor'
import { FAQEditor } from '@/components/showcase/faq-editor'
import { SpeakersEditor } from '@/components/showcase/speakers-editor'
import { SponsorsEditor } from '@/components/showcase/sponsors-editor'
import { TimelineEditor } from '@/components/showcase/timeline-editor'
import { themePresets } from '@/lib/showcase-presets'

interface Speaker {
  name: string
  title: string
  bio: string
  photo: string
}

interface Sponsor {
  name: string
  logo: string
  website: string
  tier: 'platinum' | 'gold' | 'silver' | 'bronze'
}

interface TimelineItem {
  time: string
  title: string
  description: string
}

interface ShowcaseBuilderProps {
  eventId: string
  eventSlug: string
  initialData: {
    showcaseEnabled: boolean
    showcaseTitle: string | null
    showcaseSubtitle: string | null
    showcaseBannerImage: string | null
    showcaseTheme: string
    showcaseSections: string[] | null
    showcasePrimaryColor: string
    showcaseSecondaryColor: string
    showcaseCustomCSS: string | null
    showcaseGallery?: string[] | null
    showcaseFAQ?: Array<{question: string; answer: string}> | null
    showcaseVideo?: string | null
    showcaseCountdown?: boolean
    showcaseSocialShare?: boolean
    showcaseSpeakers?: Speaker[] | null
    showcaseSponsors?: Sponsor[] | null
    showcaseTimeline?: TimelineItem[] | null
  }
}

const availableSections = [
  { id: 'hero', label: '🎯 Hero', description: 'Bannière principale avec titre' },
  { id: 'countdown', label: '⏱️ Compte à rebours', description: 'Countdown avant l\'événement' },
  { id: 'video', label: '🎥 Vidéo', description: 'Vidéo YouTube/Vimeo' },
  { id: 'description', label: '📝 Description', description: 'Présentation de l\'événement' },
  { id: 'program', label: '📅 Programme', description: 'Programme détaillé' },
  { id: 'details', label: '📍 Détails', description: 'Lieu, date, participants' },
  { id: 'speakers', label: '🎤 Speakers', description: 'Intervenants et conférenciers' },
  { id: 'sponsors', label: '🤝 Sponsors', description: 'Partenaires et sponsors' },
  { id: 'timeline', label: '🕐 Timeline', description: 'Déroulé de l\'événement' },
  { id: 'gallery', label: '🖼️ Galerie', description: 'Galerie d\'images' },
  { id: 'faq', label: '❓ FAQ', description: 'Questions fréquentes' },
  { id: 'cta', label: '✨ Appel à l\'action', description: 'Call-to-action final' },
]

export function ShowcaseBuilder({ eventId, eventSlug, initialData }: ShowcaseBuilderProps) {
  const [enabled, setEnabled] = useState(initialData.showcaseEnabled)
  const [title, setTitle] = useState(initialData.showcaseTitle || '')
  const [subtitle, setSubtitle] = useState(initialData.showcaseSubtitle || '')
  const [bannerImage, setBannerImage] = useState(initialData.showcaseBannerImage || '')
  const [primaryColor, setPrimaryColor] = useState(initialData.showcasePrimaryColor)
  const [secondaryColor, setSecondaryColor] = useState(initialData.showcaseSecondaryColor)
  const [sections, setSections] = useState<string[]>(
    initialData.showcaseSections || ['hero', 'countdown', 'description', 'details', 'cta']
  )
  const [customCSS, setCustomCSS] = useState(initialData.showcaseCustomCSS || '')

  // Nouveaux champs Phase 2
  const [gallery, setGallery] = useState<string[]>(initialData.showcaseGallery || [])
  const [faq, setFaq] = useState<Array<{question: string; answer: string}>>(initialData.showcaseFAQ || [])
  const [videoUrl, setVideoUrl] = useState(initialData.showcaseVideo || '')
  const [countdown, setCountdown] = useState(initialData.showcaseCountdown ?? true)
  const [socialShare, setSocialShare] = useState(initialData.showcaseSocialShare ?? true)

  // Nouveaux champs Phase 3
  const [speakers, setSpeakers] = useState<Speaker[]>(initialData.showcaseSpeakers || [])
  const [sponsors, setSponsors] = useState<Sponsor[]>(initialData.showcaseSponsors || [])
  const [timeline, setTimeline] = useState<TimelineItem[]>(initialData.showcaseTimeline || [])

  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const handleSectionToggle = (sectionId: string) => {
    setSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(s => s !== sectionId)
        : [...prev, sectionId]
    )
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setSaved(false)

    try {
      const response = await fetch(`/api/admin/events/${eventId}/showcase`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          showcaseEnabled: enabled,
          showcaseTitle: title || null,
          showcaseSubtitle: subtitle || null,
          showcaseBannerImage: bannerImage || null,
          showcasePrimaryColor: primaryColor,
          showcaseSecondaryColor: secondaryColor,
          showcaseSections: sections,
          showcaseCustomCSS: customCSS || null,
          showcaseGallery: gallery.length > 0 ? gallery : null,
          showcaseFAQ: faq.length > 0 ? faq : null,
          showcaseVideo: videoUrl || null,
          showcaseCountdown: countdown,
          showcaseSocialShare: socialShare,
          showcaseSpeakers: speakers.length > 0 ? speakers : null,
          showcaseSponsors: sponsors.length > 0 ? sponsors : null,
          showcaseTimeline: timeline.length > 0 ? timeline : null,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save showcase settings')
      }

      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError('Erreur lors de la sauvegarde')
      console.error('Save error:', err)
    } finally {
      setSaving(false)
    }
  }

  const showcaseUrl = `${window.location.origin}/event/${eventSlug}`

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-[#FF4713]/30 bg-gradient-to-br from-[#FF4713]/5 to-white/80 backdrop-blur">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="h-6 w-6 text-[#FF4713]" />
              <div>
                <CardTitle className="text-[#004645]" style={{ fontFamily: "var(--font-abril)" }}>
                  Page Vitrine
                </CardTitle>
                <CardDescription className="text-[#004645]/70">
                  Créez une page publique pour votre événement
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {enabled && (
                <a
                  href={showcaseUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[#009197] hover:text-[#004645] flex items-center gap-1"
                >
                  <Eye className="h-4 w-4" />
                  Voir la page
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-white/80 rounded-lg border border-[#9CD9F6]/30">
            <div>
              <p className="font-medium text-[#004645]">Activer la page vitrine</p>
              <p className="text-sm text-[#004645]/70">
                Rendre la page accessible au public
              </p>
            </div>
            <Switch
              checked={enabled}
              onCheckedChange={setEnabled}
            />
          </div>
          {enabled && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>URL publique:</strong>{' '}
                <a
                  href={showcaseUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-green-600"
                >
                  {showcaseUrl}
                </a>
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Builder avec Tabs */}
      {enabled && (
        <>
        <Tabs defaultValue="content" className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-[#9CD9F6]/20 mb-6">
            <TabsTrigger value="content">📝 Contenu</TabsTrigger>
            <TabsTrigger value="sections">🎯 Sections</TabsTrigger>
            <TabsTrigger value="theme">🎨 Thème</TabsTrigger>
            <TabsTrigger value="media">🎬 Média</TabsTrigger>
            <TabsTrigger value="advanced">⚙️ Avancé</TabsTrigger>
          </TabsList>

          {/* Tab: Contenu */}
          <TabsContent value="content" className="space-y-4">
            <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-[#004645]">Contenu Principal</CardTitle>
                <CardDescription>Personnalisez le titre et la bannière</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
              <div>
                <Label htmlFor="showcase-title" className="text-[#004645]">
                  Titre personnalisé
                </Label>
                <Input
                  id="showcase-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Laissez vide pour utiliser le nom de l'événement"
                  className="border-[#9CD9F6]/30"
                />
              </div>

              <div>
                <Label htmlFor="showcase-subtitle" className="text-[#004645]">
                  Sous-titre
                </Label>
                <Input
                  id="showcase-subtitle"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Un sous-titre accrocheur..."
                  className="border-[#9CD9F6]/30"
                />
              </div>

              <div>
                <Label htmlFor="banner-image" className="text-[#004645]">
                  Image de bannière (URL)
                </Label>
                <Input
                  id="banner-image"
                  value={bannerImage}
                  onChange={(e) => setBannerImage(e.target.value)}
                  placeholder="https://exemple.com/image.jpg"
                  className="border-[#9CD9F6]/30"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-[#9CD9F6]/5 rounded-lg border border-[#9CD9F6]/30">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-[#FF4713]" />
                  <div>
                    <Label htmlFor="countdown-toggle" className="text-[#004645] cursor-pointer">Compte à rebours</Label>
                    <p className="text-xs text-[#004645]/70">Afficher le compte à rebours avant l&apos;événement</p>
                  </div>
                </div>
                <Switch id="countdown-toggle" checked={countdown} onCheckedChange={setCountdown} />
              </div>

              <div className="flex items-center justify-between p-4 bg-[#9CD9F6]/5 rounded-lg border border-[#9CD9F6]/30">
                <div>
                  <Label htmlFor="social-toggle" className="text-[#004645] cursor-pointer">Partage social</Label>
                  <p className="text-xs text-[#004645]/70">Boutons de partage Facebook, Twitter, LinkedIn</p>
                </div>
                <Switch id="social-toggle" checked={socialShare} onCheckedChange={setSocialShare} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Sections */}
        <TabsContent value="sections" className="space-y-4">
          <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-[#004645]">Sections de la page</CardTitle>
              <CardDescription>Choisissez les sections à afficher sur la page vitrine</CardDescription>
            </CardHeader>
            <CardContent>
              <div>
                <Label className="text-[#004645] mb-3 block">Sections disponibles</Label>
                <div className="space-y-2">
                  {availableSections.map((section) => (
                    <div
                      key={section.id}
                      className="flex items-start space-x-3 p-3 rounded-lg border border-[#9CD9F6]/30 hover:bg-[#9CD9F6]/5 transition-colors"
                    >
                      <Checkbox
                        id={`section-${section.id}`}
                        checked={sections.includes(section.id)}
                        onCheckedChange={() => handleSectionToggle(section.id)}
                      />
                      <div className="flex-1">
                        <label
                          htmlFor={`section-${section.id}`}
                          className="text-sm font-medium text-[#004645] cursor-pointer"
                        >
                          {section.label}
                        </label>
                        <p className="text-xs text-[#004645]/70">{section.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Theme */}
        <TabsContent value="theme" className="space-y-4">
          <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Palette className="h-5 w-5 text-[#009197]" />
                <div>
                  <CardTitle className="text-[#004645]">Couleurs</CardTitle>
                  <CardDescription>Personnalisez les couleurs de votre page vitrine</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="primary-color" className="text-[#004645]">
                    Couleur principale
                  </Label>
                  <div className="flex gap-2 items-center mt-1">
                    <Input
                      id="primary-color"
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-16 h-10 p-1 border-[#9CD9F6]/30"
                    />
                    <Input
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      placeholder="#004645"
                      className="flex-1 border-[#9CD9F6]/30"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="secondary-color" className="text-[#004645]">
                    Couleur secondaire
                  </Label>
                  <div className="flex gap-2 items-center mt-1">
                    <Input
                      id="secondary-color"
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="w-16 h-10 p-1 border-[#9CD9F6]/30"
                    />
                    <Input
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      placeholder="#FF4713"
                      className="flex-1 border-[#9CD9F6]/30"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-[#004645] mb-3 block">Thèmes prédéfinis</Label>
                <p className="text-xs text-[#004645]/70 mb-4">Sélectionnez un thème pour appliquer instantanément un style professionnel</p>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {themePresets.map((preset) => {
                    const isActive = preset.primaryColor === primaryColor && preset.secondaryColor === secondaryColor
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          setPrimaryColor(preset.primaryColor)
                          setSecondaryColor(preset.secondaryColor)
                        }}
                        className={`group relative overflow-hidden rounded-lg border-2 transition-all hover:scale-105 ${
                          isActive
                            ? 'border-[#009197] shadow-lg'
                            : 'border-gray-200 hover:border-[#9CD9F6]'
                        }`}
                      >
                        {/* Preview gradient */}
                        <div
                          className="h-20 w-full"
                          style={{ background: preset.preview }}
                        />

                        {/* Theme info */}
                        <div className="p-2 bg-white">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-xs font-semibold text-gray-900">{preset.name}</p>
                            {isActive && (
                              <CheckCircle className="h-4 w-4 text-[#009197]" />
                            )}
                          </div>
                          <p className="text-[10px] text-gray-500 line-clamp-2">{preset.description}</p>
                        </div>

                        {/* Hover overlay */}
                        {!isActive && (
                          <div className="absolute inset-0 bg-[#009197]/0 group-hover:bg-[#009197]/5 transition-colors pointer-events-none" />
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Média */}
        <TabsContent value="media" className="space-y-4">
          <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Video className="h-5 w-5 text-[#FF4713]" />
                <div>
                  <CardTitle className="text-[#004645]">Vidéo</CardTitle>
                  <CardDescription>Intégrez une vidéo YouTube ou Vimeo</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Label htmlFor="video-url" className="text-[#004645]">
                URL de la vidéo
              </Label>
              <Input
                id="video-url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="border-[#9CD9F6]/30"
              />
              <p className="text-xs text-[#004645]/70 mt-2">
                Formats supportés: YouTube, Vimeo
              </p>
            </CardContent>
          </Card>

          <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur">
            <CardHeader>
              <div className="flex items-center gap-3">
                <ImageIcon className="h-5 w-5 text-[#009197]" />
                <div>
                  <CardTitle className="text-[#004645]">Galerie d&apos;images</CardTitle>
                  <CardDescription>Ajoutez des photos pour créer une galerie</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <GalleryEditor images={gallery} onChange={setGallery} />
            </CardContent>
          </Card>

          <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur">
            <CardHeader>
              <div className="flex items-center gap-3">
                <MessageCircle className="h-5 w-5 text-[#FF4713]" />
                <div>
                  <CardTitle className="text-[#004645]">FAQ</CardTitle>
                  <CardDescription>Questions et réponses fréquentes</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <FAQEditor faqs={faq} onChange={setFaq} />
            </CardContent>
          </Card>

          <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-[#009197]" />
                <div>
                  <CardTitle className="text-[#004645]">Timeline de l&apos;événement</CardTitle>
                  <CardDescription>Déroulé heure par heure</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <TimelineEditor timeline={timeline} onChange={setTimeline} />
            </CardContent>
          </Card>

          <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-[#FF4713]" />
                <div>
                  <CardTitle className="text-[#004645]">Speakers & Intervenants</CardTitle>
                  <CardDescription>Présentez vos speakers</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <SpeakersEditor speakers={speakers} onChange={setSpeakers} />
            </CardContent>
          </Card>

          <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-[#004645]" />
                <div>
                  <CardTitle className="text-[#004645]">Sponsors & Partenaires</CardTitle>
                  <CardDescription>Mettez en avant vos sponsors</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <SponsorsEditor sponsors={sponsors} onChange={setSponsors} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Advanced */}
        <TabsContent value="advanced" className="space-y-4">
          <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-[#004645]">CSS Personnalisé</CardTitle>
              <CardDescription className="text-[#004645]/70">
                Pour les utilisateurs avancés - ajoutez votre propre CSS
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={customCSS}
                onChange={(e) => setCustomCSS(e.target.value)}
                placeholder="/* Votre CSS personnalisé ici */
.custom-class {
  /* styles */
}"
                className="font-mono text-sm min-h-[200px] border-[#9CD9F6]/30"
              />
              <p className="text-xs text-[#004645]/70 mt-2">
                ⚠️ Attention: un CSS invalide peut casser l&apos;affichage de votre page
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button - Outside tabs but inside enabled block */}
      <div className="flex items-center justify-between gap-4 mt-6">
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
        {saved && (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span>Modifications enregistrées</span>
          </div>
        )}
        <div className="flex gap-2 ml-auto">
          <a href={showcaseUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="border-[#009197] text-[#009197] hover:bg-[#009197]/10">
              <Eye className="h-4 w-4 mr-2" />
              Prévisualiser
            </Button>
          </a>
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
                Enregistrer
              </>
            )}
          </Button>
        </div>
      </div>
      </>
      )}
    </div>
  )
}
