"use client"

import { useState } from 'react'
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

export function ShowcaseBuilder({ eventId, eventSlug, initialData }: ShowcaseBuilderProps) {
  const [enabled, setEnabled] = useState(initialData.showcaseEnabled)
  const [title, setTitle] = useState(initialData.showcaseTitle || '')
  const [subtitle, setSubtitle] = useState(initialData.showcaseSubtitle || '')
  const [bannerImage, setBannerImage] = useState(initialData.showcaseBannerImage || '')
  const [primaryColor, setPrimaryColor] = useState(initialData.showcasePrimaryColor)
  const [secondaryColor, setSecondaryColor] = useState(initialData.showcaseSecondaryColor)

  // Nouveau système de sections avec SectionConfig
  const [sectionConfigs, setSectionConfigs] = useState<SectionConfig[]>(
    migrateToSectionConfigs(initialData.showcaseSections || [])
  )

  const [customCSS, setCustomCSS] = useState(initialData.showcaseCustomCSS || '')

  // Contenu multimédia
  const [gallery, setGallery] = useState<string[]>(initialData.showcaseGallery || [])
  const [faq, setFaq] = useState<Array<{question: string; answer: string}>>(initialData.showcaseFAQ || [])
  const [videoUrl, setVideoUrl] = useState(initialData.showcaseVideo || '')
  const [countdown, setCountdown] = useState(initialData.showcaseCountdown ?? true)
  const [socialShare, setSocialShare] = useState(initialData.showcaseSocialShare ?? true)

  // Contenu avancé
  const [speakers, setSpeakers] = useState<Speaker[]>(initialData.showcaseSpeakers || [])
  const [sponsors, setSponsors] = useState<Sponsor[]>(initialData.showcaseSponsors || [])
  const [timeline, setTimeline] = useState<TimelineItem[]>(initialData.showcaseTimeline || [])

  // Contenus personnalisés par section
  const [sectionContents, setSectionContents] = useState<SectionContents>(initialData.showcaseSectionContents || {})

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
  const handleTemplateSelect = (template: ShowcaseTemplate) => {
    setSectionConfigs(template.sections)
    setPrimaryColor(template.primaryColor)
    setSecondaryColor(template.secondaryColor)
    setShowTemplateSelector(false)
  }

  // Handlers pour sections
  const handleSectionsReorder = (newSections: SectionConfig[]) => {
    setSectionConfigs(newSections)
  }

  const handleSectionToggle = (sectionId: string) => {
    setSectionConfigs(prev =>
      prev.map(s => s.id === sectionId ? { ...s, enabled: !s.enabled } : s)
    )
  }

  const handleSectionEdit = (section: SectionConfig) => {
    setEditingSection(section)
  }

  const handleSectionUpdate = (updatedSection: SectionConfig) => {
    setSectionConfigs(prev =>
      prev.map(s => s.id === updatedSection.id ? updatedSection : s)
    )
    setEditingSection(null)
  }

  const handleSectionDelete = (sectionId: string) => {
    setSectionConfigs(prev => prev.filter(s => s.id !== sectionId))
  }

  const handleAddSection = (type: string) => {
    const newSection: SectionConfig = {
      id: `${type}-${Date.now()}`,
      type,
      enabled: true,
      order: sectionConfigs.length,
      layout: 'container',
      alignment: 'center',
      paddingTop: 'lg',
      paddingBottom: 'lg',
      animationType: 'fade',
      animationDuration: 'normal',
    }
    setSectionConfigs(prev => [...prev, newSection])
    setShowAddSection(false)
  }

  const handleSectionContentUpdate = (sectionId: string, content: SectionContent) => {
    setSectionContents(prev => ({
      ...prev,
      [sectionId]: content
    }))
  }

  const handleSectionConfigUpdate = (sectionId: string, updates: Partial<SectionConfig>) => {
    setSectionConfigs(prev => prev.map(section =>
      section.id === sectionId ? { ...section, ...updates } : section
    ))
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
          showcaseSections: sectionConfigs,
          showcaseCustomCSS: customCSS || null,
          showcaseGallery: gallery.length > 0 ? gallery : null,
          showcaseFAQ: faq.length > 0 ? faq : null,
          showcaseVideo: videoUrl || null,
          showcaseCountdown: countdown,
          showcaseSocialShare: socialShare,
          showcaseSpeakers: speakers.length > 0 ? speakers : null,
          showcaseSponsors: sponsors.length > 0 ? sponsors : null,
          showcaseTimeline: timeline.length > 0 ? timeline : null,
          showcaseSectionContents: Object.keys(sectionContents).length > 0 ? sectionContents : null,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save showcase settings')
      }

      setSaved(true)
      // Refresh preview after save
      setPreviewKey(prev => prev + 1)
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
                  Créez une page publique professionnelle pour votre événement
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {enabled && (
                <Button
                  variant="outline"
                  onClick={() => setShowPreview(!showPreview)}
                  className="border-[#009197] text-[#009197] hover:bg-[#009197]/10"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {showPreview ? 'Masquer' : 'Aperçu'}
                </Button>
              )}
              {enabled && (
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
                sections={sectionConfigs}
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
            sectionConfigs={sectionConfigs}
            sectionContents={sectionContents}
            videoUrl={videoUrl}
            gallery={gallery}
            speakers={speakers}
            sponsors={sponsors}
            timeline={timeline}
            faq={faq}
            onSectionConfigUpdate={handleSectionConfigUpdate}
            onSectionContentUpdate={handleSectionContentUpdate}
            onVideoUrlChange={setVideoUrl}
            onGalleryChange={setGallery}
            onSpeakersChange={setSpeakers}
            onSponsorsChange={setSponsors}
            onTimelineChange={setTimeline}
            onFaqChange={setFaq}
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
                  {themePresets.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => {
                        setPrimaryColor(preset.primaryColor)
                        setSecondaryColor(preset.secondaryColor)
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
                value={customCSS}
                onChange={(e) => setCustomCSS(e.target.value)}
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
