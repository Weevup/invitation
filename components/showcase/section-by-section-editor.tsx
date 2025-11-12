"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronRight, Settings, FileText, Image as ImageIcon, Check } from 'lucide-react'
import { SectionEditor } from './section-editor'
import { SectionContentEditor, type SectionContent } from './section-content-editor'
import { GalleryEditor } from './gallery-editor'
import { FAQEditor } from './faq-editor'
import { SpeakersEditor } from './speakers-editor'
import { SponsorsEditor } from './sponsors-editor'
import { TimelineEditor } from './timeline-editor'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { type SectionConfig } from '@/lib/showcase-templates'

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

interface SectionBySectionEditorProps {
  sectionConfigs: SectionConfig[]
  sectionContents: { [sectionId: string]: SectionContent }
  videoUrl: string
  gallery: string[]
  speakers: Speaker[]
  sponsors: Sponsor[]
  timeline: TimelineItem[]
  faq: Array<{ question: string; answer: string }>
  onSectionConfigUpdate: (sectionId: string, updates: Partial<SectionConfig>) => void
  onSectionContentUpdate: (sectionId: string, content: SectionContent) => void
  onVideoUrlChange: (url: string) => void
  onGalleryChange: (images: string[]) => void
  onSpeakersChange: (speakers: Speaker[]) => void
  onSponsorsChange: (sponsors: Sponsor[]) => void
  onTimelineChange: (timeline: TimelineItem[]) => void
  onFaqChange: (faq: Array<{ question: string; answer: string }>) => void
}

const availableSections = [
  { id: 'hero', label: '🎯 Hero', description: 'Bannière principale avec titre' },
  { id: 'countdown', label: '⏱️ Compte à rebours', description: 'Countdown avant l\'événement' },
  { id: 'video', label: '🎥 Vidéo', description: 'Vidéo YouTube/Vimeo' },
  { id: 'description', label: '📝 Description', description: 'Présentation de l\'événement' },
  { id: 'program', label: '📅 Programme', description: 'Sessions et horaires' },
  { id: 'speakers', label: '🎤 Intervenants', description: 'Liste des speakers' },
  { id: 'sponsors', label: '🤝 Sponsors', description: 'Partenaires et sponsors' },
  { id: 'timeline', label: '⏰ Timeline', description: 'Déroulé chronologique' },
  { id: 'gallery', label: '🖼️ Galerie', description: 'Photos et images' },
  { id: 'faq', label: '❓ FAQ', description: 'Questions fréquentes' },
  { id: 'cta', label: '📣 Appel à l\'action', description: 'Bouton d\'action principal' },
  { id: 'contact', label: '📞 Contact', description: 'Informations de contact' },
  { id: 'location', label: '📍 Lieu', description: 'Carte et adresse' },
]

export function SectionBySectionEditor({
  sectionConfigs,
  sectionContents,
  videoUrl,
  gallery,
  speakers,
  sponsors,
  timeline,
  faq,
  onSectionConfigUpdate,
  onSectionContentUpdate,
  onVideoUrlChange,
  onGalleryChange,
  onSpeakersChange,
  onSponsorsChange,
  onTimelineChange,
  onFaqChange,
}: SectionBySectionEditorProps) {
  const activeSections = sectionConfigs.filter(s => s.enabled)
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(
    activeSections.length > 0 ? activeSections[0].id : null
  )

  if (activeSections.length === 0) {
    return (
      <Card className="border-[#9CD9F6]/30 border-dashed">
        <CardContent className="py-12 text-center">
          <p className="text-[#004645]/60 mb-2">Aucune section active</p>
          <p className="text-sm text-[#004645]/50">
            Allez dans l&apos;onglet &quot;Sections&quot; pour activer des sections à éditer
          </p>
        </CardContent>
      </Card>
    )
  }

  const selectedSection = sectionConfigs.find(s => s.id === selectedSectionId)
  if (!selectedSection) return null

  const sectionInfo = availableSections.find(a => a.id === selectedSection.type)
  const sectionContent = sectionContents[selectedSection.id] || {}

  const hasContent = (sectionId: string) => {
    const content = sectionContents[sectionId]
    return content && (content.title || content.subtitle || content.description || content.image || content.buttons?.length)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Sidebar - Liste des sections */}
      <div className="lg:col-span-1">
        <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur sticky top-4">
          <CardHeader>
            <CardTitle className="text-sm text-[#004645]">Sections actives</CardTitle>
            <CardDescription className="text-xs">
              {activeSections.length} section{activeSections.length > 1 ? 's' : ''} à éditer
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
            {activeSections.map((section) => {
              const info = availableSections.find(a => a.id === section.type)
              const isSelected = section.id === selectedSectionId
              const isConfigured = hasContent(section.id)

              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setSelectedSectionId(section.id)}
                  className={`
                    w-full text-left px-3 py-2.5 rounded-lg transition-all
                    flex items-center justify-between gap-2
                    ${isSelected
                      ? 'bg-[#009197] text-white shadow-md'
                      : 'hover:bg-[#9CD9F6]/20 text-[#004645]'
                    }
                  `}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">
                        {info?.label || section.type}
                      </span>
                      {isConfigured && !isSelected && (
                        <Check className="h-3 w-3 text-green-600 flex-shrink-0" />
                      )}
                    </div>
                    <p className={`text-xs truncate ${isSelected ? 'text-white/80' : 'text-[#004645]/60'}`}>
                      {info?.description}
                    </p>
                  </div>
                  {isSelected && (
                    <ChevronRight className="h-4 w-4 flex-shrink-0" />
                  )}
                </button>
              )
            })}
          </CardContent>
        </Card>
      </div>

      {/* Main Editor - Configuration complète de la section sélectionnée */}
      <div className="lg:col-span-3 space-y-4">
        {/* Header de la section */}
        <Card className="border-[#009197] border-2 bg-gradient-to-r from-[#009197]/5 to-transparent">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl text-[#004645] flex items-center gap-3">
                  <span>{sectionInfo?.label || selectedSection.type}</span>
                  <Badge variant="outline" className="font-normal">
                    {selectedSection.order + 1}ème section
                  </Badge>
                </CardTitle>
                <CardDescription className="text-base mt-1">
                  {sectionInfo?.description}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Contenu personnalisé */}
        <SectionContentEditor
          sectionId={selectedSection.id}
          sectionType={selectedSection.type}
          content={sectionContent}
          onChange={(content) => onSectionContentUpdate(selectedSection.id, content)}
        />

        {/* Éditeurs spécialisés selon le type de section */}
        {selectedSection.type === 'video' && (
          <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-[#004645] flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-[#009197]" />
                Configuration Vidéo
              </CardTitle>
              <CardDescription>
                URL de la vidéo à afficher dans cette section
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Label htmlFor="video-url" className="text-[#004645]">URL de la vidéo</Label>
              <Input
                id="video-url"
                value={videoUrl}
                onChange={(e) => onVideoUrlChange(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="border-[#9CD9F6]/30"
              />
              <p className="text-xs text-[#004645]/70 mt-2">
                Formats supportés: YouTube, Vimeo, Dailymotion
              </p>
            </CardContent>
          </Card>
        )}

        {selectedSection.type === 'gallery' && (
          <GalleryEditor images={gallery} onChange={onGalleryChange} />
        )}

        {selectedSection.type === 'speakers' && (
          <SpeakersEditor speakers={speakers} onChange={onSpeakersChange} />
        )}

        {selectedSection.type === 'sponsors' && (
          <SponsorsEditor sponsors={sponsors} onChange={onSponsorsChange} />
        )}

        {selectedSection.type === 'timeline' && (
          <TimelineEditor timeline={timeline} onChange={onTimelineChange} />
        )}

        {selectedSection.type === 'faq' && (
          <FAQEditor faqs={faq} onChange={onFaqChange} />
        )}

        {/* Configuration de la section (layout, style, animation) */}
        <SectionEditor
          section={selectedSection}
          onChange={(updated) => {
            onSectionConfigUpdate(selectedSection.id, updated)
          }}
        />

        {/* Navigation */}
        <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const currentIndex = activeSections.findIndex(s => s.id === selectedSectionId)
                  if (currentIndex > 0) {
                    setSelectedSectionId(activeSections[currentIndex - 1].id)
                  }
                }}
                disabled={activeSections.findIndex(s => s.id === selectedSectionId) === 0}
                className="border-[#009197] text-[#009197]"
              >
                ← Section précédente
              </Button>

              <span className="text-sm text-[#004645]/60">
                {activeSections.findIndex(s => s.id === selectedSectionId) + 1} / {activeSections.length}
              </span>

              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const currentIndex = activeSections.findIndex(s => s.id === selectedSectionId)
                  if (currentIndex < activeSections.length - 1) {
                    setSelectedSectionId(activeSections[currentIndex + 1].id)
                  }
                }}
                disabled={activeSections.findIndex(s => s.id === selectedSectionId) === activeSections.length - 1}
                className="border-[#009197] text-[#009197]"
              >
                Section suivante →
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
