"use client"

import { useState, useReducer, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Sparkles,
  Eye,
  Save,
  Loader2,
  CheckCircle,
  Palette,
  ExternalLink,
  MessageCircle,
  Video,
  Clock,
  Plus,
  Wand2
} from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { GalleryEditor } from '@/components/showcase/gallery-editor'
import { FAQEditor } from '@/components/showcase/faq-editor'
import { SpeakersEditor } from '@/components/showcase/speakers-editor'
import { SponsorsEditor } from '@/components/showcase/sponsors-editor'
import { TimelineEditor } from '@/components/showcase/timeline-editor'
import { TemplateSelector } from '@/components/showcase/template-selector'
import { DraggableSectionList } from '@/components/showcase/draggable-section-list'
import { SectionEditor } from '@/components/showcase/section-editor'
import { SectionContentEditor, type SectionContent, type SectionContents } from '@/components/showcase/section-content-editor'
import { SectionBySectionEditor } from '@/components/showcase/section-by-section-editor'
import { SplitPreview } from '@/components/showcase/split-preview'
import { themePresets } from '@/lib/showcase-presets'
import { type SectionConfig, type ShowcaseTemplate } from '@/lib/showcase-templates'

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
    showcaseSections: any
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
    showcaseSectionContents?: SectionContents | null
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

// Convertir les anciennes sections vers SectionConfig
function migrateToSectionConfigs(oldSections: string[] | SectionConfig[]): SectionConfig[] {
  if (!oldSections || oldSections.length === 0) {
    return []
  }

  // Si c'est déjà des SectionConfig, les retourner
  if (typeof oldSections[0] === 'object' && 'type' in oldSections[0]) {
    return oldSections as SectionConfig[]
  }

  // Sinon, créer des SectionConfig par défaut
  return (oldSections as string[]).map((sectionType, index) => ({
    id: `${sectionType}-${index}`,
    type: sectionType,
    enabled: true,
    order: index,
    layout: 'container',
    alignment: 'center',
    paddingTop: 'lg',
    paddingBottom: 'lg',
    animationType: 'fade',
    animationDuration: 'normal',
  }))
}

// Types for reducer
type ShowcaseData = {
  enabled: boolean
  title: string
  subtitle: string
  bannerImage: string
  primaryColor: string
  secondaryColor: string
  sectionConfigs: SectionConfig[]
  customCSS: string
  gallery: string[]
  faq: Array<{question: string; answer: string}>
  videoUrl: string
  countdown: boolean
  socialShare: boolean
  speakers: Speaker[]
  sponsors: Sponsor[]
  timeline: TimelineItem[]
  sectionContents: SectionContents
}

type ShowcaseAction =
  | { type: 'SET_ENABLED'; payload: boolean }
  | { type: 'SET_TITLE'; payload: string }
  | { type: 'SET_SUBTITLE'; payload: string }
  | { type: 'SET_BANNER_IMAGE'; payload: string }
  | { type: 'SET_PRIMARY_COLOR'; payload: string }
  | { type: 'SET_SECONDARY_COLOR'; payload: string }
  | { type: 'SET_SECTION_CONFIGS'; payload: SectionConfig[] }
  | { type: 'SET_CUSTOM_CSS'; payload: string }
  | { type: 'SET_GALLERY'; payload: string[] }
  | { type: 'SET_FAQ'; payload: Array<{question: string; answer: string}> }
  | { type: 'SET_VIDEO_URL'; payload: string }
  | { type: 'SET_COUNTDOWN'; payload: boolean }
  | { type: 'SET_SOCIAL_SHARE'; payload: boolean }
  | { type: 'SET_SPEAKERS'; payload: Speaker[] }
  | { type: 'SET_SPONSORS'; payload: Sponsor[] }
  | { type: 'SET_TIMELINE'; payload: TimelineItem[] }
  | { type: 'SET_SECTION_CONTENTS'; payload: SectionContents }
  | { type: 'APPLY_TEMPLATE'; payload: { sections: SectionConfig[]; primaryColor: string; secondaryColor: string } }

function showcaseReducer(state: ShowcaseData, action: ShowcaseAction): ShowcaseData {
  switch (action.type) {
    case 'SET_ENABLED':
      return { ...state, enabled: action.payload }
    case 'SET_TITLE':
      return { ...state, title: action.payload }
    case 'SET_SUBTITLE':
      return { ...state, subtitle: action.payload }
    case 'SET_BANNER_IMAGE':
      return { ...state, bannerImage: action.payload }
    case 'SET_PRIMARY_COLOR':
      return { ...state, primaryColor: action.payload }
    case 'SET_SECONDARY_COLOR':
      return { ...state, secondaryColor: action.payload }
    case 'SET_SECTION_CONFIGS':
      return { ...state, sectionConfigs: action.payload }
    case 'SET_CUSTOM_CSS':
      return { ...state, customCSS: action.payload }
    case 'SET_GALLERY':
      return { ...state, gallery: action.payload }
    case 'SET_FAQ':
      return { ...state, faq: action.payload }
    case 'SET_VIDEO_URL':
      return { ...state, videoUrl: action.payload }
    case 'SET_COUNTDOWN':
      return { ...state, countdown: action.payload }
    case 'SET_SOCIAL_SHARE':
      return { ...state, socialShare: action.payload }
    case 'SET_SPEAKERS':
      return { ...state, speakers: action.payload }
    case 'SET_SPONSORS':
      return { ...state, sponsors: action.payload }
    case 'SET_TIMELINE':
      return { ...state, timeline: action.payload }
    case 'SET_SECTION_CONTENTS':
      return { ...state, sectionContents: action.payload }
    case 'APPLY_TEMPLATE':
      return {
        ...state,
        sectionConfigs: action.payload.sections,
        primaryColor: action.payload.primaryColor,
        secondaryColor: action.payload.secondaryColor,
      }
    default:
      return state
  }
}

export function ShowcaseBuilder({ eventId, eventSlug, initialData }: ShowcaseBuilderProps) {
  // Consolidated state with useReducer
  const [data, dispatch] = useReducer(showcaseReducer, {
    enabled: initialData.showcaseEnabled,
    title: initialData.showcaseTitle || '',
    subtitle: initialData.showcaseSubtitle || '',
    bannerImage: initialData.showcaseBannerImage || '',
    primaryColor: initialData.showcasePrimaryColor,
    secondaryColor: initialData.showcaseSecondaryColor,
    sectionConfigs: migrateToSectionConfigs(initialData.showcaseSections || []),
    customCSS: initialData.showcaseCustomCSS || '',
    gallery: initialData.showcaseGallery || [],
    faq: initialData.showcaseFAQ || [],
    videoUrl: initialData.showcaseVideo || '',
    countdown: initialData.showcaseCountdown ?? true,
    socialShare: initialData.showcaseSocialShare ?? true,
    speakers: initialData.showcaseSpeakers || [],
    sponsors: initialData.showcaseSponsors || [],
    timeline: initialData.showcaseTimeline || [],
    sectionContents: initialData.showcaseSectionContents || {},
  })

  // UI States
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [showTemplateSelector, setShowTemplateSelector] = useState(false)
  const [editingSection, setEditingSection] = useState<SectionConfig | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [showAddSection, setShowAddSection] = useState(false)
  const [previewKey, setPreviewKey] = useState(0)

  // Handlers pour templates
  const handleTemplateSelect = useCallback((template: ShowcaseTemplate) => {
    dispatch({ type: 'APPLY_TEMPLATE', payload: template })
    setShowTemplateSelector(false)
  }, [])

  // Handlers pour sections
  const handleSectionsReorder = useCallback((newSections: SectionConfig[]) => {
    dispatch({ type: 'SET_SECTION_CONFIGS', payload: newSections })
  }, [])

  const handleSectionToggle = useCallback((sectionId: string) => {
    dispatch({
      type: 'SET_SECTION_CONFIGS',
      payload: data.sectionConfigs.map(s => s.id === sectionId ? { ...s, enabled: !s.enabled } : s)
    })
  }, [data.sectionConfigs])

  const handleSectionEdit = useCallback((section: SectionConfig) => {
    setEditingSection(section)
  }, [])

  const handleSectionUpdate = useCallback((updatedSection: SectionConfig) => {
    dispatch({
      type: 'SET_SECTION_CONFIGS',
      payload: data.sectionConfigs.map(s => s.id === updatedSection.id ? updatedSection : s)
    })
    setEditingSection(null)
  }, [data.sectionConfigs])

  const handleSectionDelete = useCallback((sectionId: string) => {
    dispatch({
      type: 'SET_SECTION_CONFIGS',
      payload: data.sectionConfigs.filter(s => s.id !== sectionId)
    })
  }, [data.sectionConfigs])

  const handleAddSection = useCallback((type: string) => {
    const newSection: SectionConfig = {
      id: `${type}-${Date.now()}`,
      type,
      enabled: true,
      order: data.sectionConfigs.length,
      layout: 'container',
      alignment: 'center',
      paddingTop: 'lg',
      paddingBottom: 'lg',
      animationType: 'fade',
      animationDuration: 'normal',
    }
    dispatch({
      type: 'SET_SECTION_CONFIGS',
      payload: [...data.sectionConfigs, newSection]
    })
    setShowAddSection(false)
  }, [data.sectionConfigs])

  const handleSectionContentUpdate = useCallback((sectionId: string, content: SectionContent) => {
    dispatch({
      type: 'SET_SECTION_CONTENTS',
      payload: { ...data.sectionContents, [sectionId]: content }
    })
  }, [data.sectionContents])

  const handleSectionConfigUpdate = useCallback((sectionId: string, updates: Partial<SectionConfig>) => {
    dispatch({
      type: 'SET_SECTION_CONFIGS',
      payload: data.sectionConfigs.map(section =>
        section.id === sectionId ? { ...section, ...updates } : section
      )
    })
  }, [data.sectionConfigs])

  const handleSave = useCallback(async () => {
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
          showcaseEnabled: data.enabled,
          showcaseTitle: data.title || null,
          showcaseSubtitle: data.subtitle || null,
          showcaseBannerImage: data.bannerImage || null,
          showcasePrimaryColor: data.primaryColor,
          showcaseSecondaryColor: data.secondaryColor,
          showcaseSections: data.sectionConfigs,
          showcaseCustomCSS: data.customCSS || null,
          showcaseGallery: data.gallery.length > 0 ? data.gallery : null,
          showcaseFAQ: data.faq.length > 0 ? data.faq : null,
          showcaseVideo: data.videoUrl || null,
          showcaseCountdown: data.countdown,
          showcaseSocialShare: data.socialShare,
          showcaseSpeakers: data.speakers.length > 0 ? data.speakers : null,
          showcaseSponsors: data.sponsors.length > 0 ? data.sponsors : null,
          showcaseTimeline: data.timeline.length > 0 ? data.timeline : null,
          showcaseSectionContents: Object.keys(data.sectionContents).length > 0 ? data.sectionContents : null,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save showcase settings')
      }

      setSaved(true)
      // Optimized: increment preview key without full reset
      setPreviewKey(prev => prev + 1)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError('Erreur lors de la sauvegarde')
      console.error('Save error:', err)
    } finally {
      setSaving(false)
    }
  }, [eventId, data])

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
                  Créez une page publique professionnelle pour votre événement
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {data.enabled && (
                <Button
                  variant="outline"
                  onClick={() => setShowPreview(!showPreview)}
                  className="border-[#009197] text-[#009197] hover:bg-[#009197]/10"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {showPreview ? 'Masquer' : 'Aperçu'}
                </Button>
              )}
              {data.enabled && (
                <a
                  href={showcaseUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[#009197] hover:text-[#004645] flex items-center gap-1"
                >
                  <ExternalLink className="h-4 w-4" />
                  Ouvrir
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
              checked={data.enabled}
              onCheckedChange={(value) => dispatch({ type: 'SET_ENABLED', payload: value })}
            />
          </div>
          {data.enabled && (
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
          <TabsList className="grid w-full grid-cols-4 bg-[#9CD9F6]/20 mb-6">
            <TabsTrigger value="content">📝 Contenu</TabsTrigger>
            <TabsTrigger value="sections">🎯 Sections</TabsTrigger>
            <TabsTrigger value="sectionContent">✏️ Éditer sections</TabsTrigger>
            <TabsTrigger value="theme">🎨 Thème & Style</TabsTrigger>
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
                  value={data.title}
                  onChange={(e) => dispatch({ type: 'SET_TITLE', payload: e.target.value })}
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
                  value={data.subtitle}
                  onChange={(e) => dispatch({ type: 'SET_SUBTITLE', payload: e.target.value })}
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
                  value={data.bannerImage}
                  onChange={(e) => dispatch({ type: 'SET_BANNER_IMAGE', payload: e.target.value })}
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
                <Switch id="countdown-toggle" checked={data.countdown} onCheckedChange={(value) => dispatch({ type: 'SET_COUNTDOWN', payload: value })} />
              </div>

              <div className="flex items-center justify-between p-4 bg-[#9CD9F6]/5 rounded-lg border border-[#9CD9F6]/30">
                <div>
                  <Label htmlFor="social-toggle" className="text-[#004645] cursor-pointer">Partage social</Label>
                  <p className="text-xs text-[#004645]/70">Boutons de partage Facebook, Twitter, LinkedIn</p>
                </div>
                <Switch id="social-toggle" checked={data.socialShare} onCheckedChange={(value) => dispatch({ type: 'SET_SOCIAL_SHARE', payload: value })} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Sections - VERSION AMÉLIORÉE */}
        <TabsContent value="sections" className="space-y-4">
          <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-[#004645]">Sections de la page</CardTitle>
                  <CardDescription>Glissez-déposez pour réorganiser • Configurez chaque section</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowTemplateSelector(true)}
                    className="border-[#009197] text-[#009197] hover:bg-[#009197]/10"
                  >
                    <Wand2 className="h-4 w-4 mr-2" />
                    Templates
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowAddSection(true)}
                    className="border-[#FF4713] text-[#FF4713] hover:bg-[#FF4713]/10"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <DraggableSectionList
                sections={data.sectionConfigs}
                onReorder={handleSectionsReorder}
                onToggle={handleSectionToggle}
                onEdit={handleSectionEdit}
                onDelete={handleSectionDelete}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Section Content - Édition fluide section par section */}
        <TabsContent value="sectionContent" className="space-y-4">
          <SectionBySectionEditor
            sectionConfigs={data.sectionConfigs}
            sectionContents={data.sectionContents}
            videoUrl={data.videoUrl}
            gallery={data.gallery}
            speakers={data.speakers}
            sponsors={data.sponsors}
            timeline={data.timeline}
            faq={data.faq}
            onSectionConfigUpdate={handleSectionConfigUpdate}
            onSectionContentUpdate={handleSectionContentUpdate}
            onVideoUrlChange={(value) => dispatch({ type: 'SET_VIDEO_URL', payload: value })}
            onGalleryChange={(value) => dispatch({ type: 'SET_GALLERY', payload: value })}
            onSpeakersChange={(value) => dispatch({ type: 'SET_SPEAKERS', payload: value })}
            onSponsorsChange={(value) => dispatch({ type: 'SET_SPONSORS', payload: value })}
            onTimelineChange={(value) => dispatch({ type: 'SET_TIMELINE', payload: value })}
            onFaqChange={(value) => dispatch({ type: 'SET_FAQ', payload: value })}
          />
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
                      value={data.primaryColor}
                      onChange={(e) => dispatch({ type: 'SET_PRIMARY_COLOR', payload: e.target.value })}
                      className="w-16 h-10 p-1 border-[#9CD9F6]/30"
                    />
                    <Input
                      value={data.primaryColor}
                      onChange={(e) => dispatch({ type: 'SET_PRIMARY_COLOR', payload: e.target.value })}
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
                      value={data.secondaryColor}
                      onChange={(e) => dispatch({ type: 'SET_SECONDARY_COLOR', payload: e.target.value })}
                      className="w-16 h-10 p-1 border-[#9CD9F6]/30"
                    />
                    <Input
                      value={data.secondaryColor}
                      onChange={(e) => dispatch({ type: 'SET_SECONDARY_COLOR', payload: e.target.value })}
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
                  {themePresets.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => {
                        dispatch({ type: 'SET_PRIMARY_COLOR', payload: preset.primaryColor })
                        dispatch({ type: 'SET_SECONDARY_COLOR', payload: preset.secondaryColor })
                      }}
                      className="group relative overflow-hidden rounded-lg border-2 border-[#9CD9F6]/30 hover:border-[#009197] transition-colors p-3 text-left"
                    >
                      <div
                        className="h-16 rounded-md mb-2"
                        style={{ background: preset.preview }}
                      />
                      <p className="font-medium text-sm text-[#004645]">{preset.name}</p>
                      <p className="text-xs text-[#004645]/70 line-clamp-2">{preset.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CSS Personnalisé déplacé dans Theme */}
          <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-[#004645]">CSS Personnalisé</CardTitle>
              <CardDescription>Pour les utilisateurs avancés - style global de la page</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={data.customCSS}
                onChange={(e) => dispatch({ type: 'SET_CUSTOM_CSS', payload: e.target.value })}
                placeholder=".mon-element { color: red; }"
                className="font-mono text-sm border-[#9CD9F6]/30 min-h-[200px]"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <Card className="border-[#FF4713]/30 bg-gradient-to-br from-[#FF4713]/5 to-white/80 backdrop-blur sticky bottom-4">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              {saved && (
                <p className="text-sm text-green-600 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Sauvegardé avec succès
                </p>
              )}
            </div>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#FF4713] hover:bg-[#FF6B3D] text-white"
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
                  Sauvegarder
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
      </>
      )}

      {/* Template Selector Modal */}
      <TemplateSelector
        open={showTemplateSelector}
        onSelect={handleTemplateSelect}
        onClose={() => setShowTemplateSelector(false)}
      />

      {/* Section Editor Modal */}
      {editingSection && (
        <Dialog open={!!editingSection} onOpenChange={() => setEditingSection(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Configuration de la section</DialogTitle>
            </DialogHeader>
            <SectionEditor
              section={editingSection}
              onChange={handleSectionUpdate}
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingSection(null)}>Fermer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Add Section Modal */}
      {showAddSection && (
        <Dialog open={showAddSection} onOpenChange={setShowAddSection}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter une section</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3 py-4">
              {availableSections.map((section) => (
                <Button
                  key={section.id}
                  variant="outline"
                  onClick={() => handleAddSection(section.id)}
                  className="h-auto flex-col items-start p-4 text-left"
                >
                  <span className="font-medium">{section.label}</span>
                  <span className="text-xs text-gray-500 mt-1">{section.description}</span>
                </Button>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Split Preview */}
      <SplitPreview
        key={previewKey}
        eventSlug={eventSlug}
        isVisible={showPreview}
        onToggle={() => setShowPreview(!showPreview)}
      />
    </div>
  )
}
