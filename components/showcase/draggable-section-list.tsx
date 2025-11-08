"use client"

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SectionConfig } from '@/lib/showcase-templates'
import { GripVertical, Eye, EyeOff, Settings2, Trash2 } from 'lucide-react'

interface DraggableSectionListProps {
  sections: SectionConfig[]
  onReorder: (sections: SectionConfig[]) => void
  onToggle: (sectionId: string) => void
  onEdit: (section: SectionConfig) => void
  onDelete: (sectionId: string) => void
}

export function DraggableSectionList({
  sections,
  onReorder,
  onToggle,
  onEdit,
  onDelete,
}: DraggableSectionListProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()

    if (draggedIndex === null || draggedIndex === index) return

    const newSections = [...sections]
    const draggedSection = newSections[draggedIndex]
    newSections.splice(draggedIndex, 1)
    newSections.splice(index, 0, draggedSection)

    // Update order
    const reorderedSections = newSections.map((section, idx) => ({
      ...section,
      order: idx,
    }))

    setDraggedIndex(index)
    onReorder(reorderedSections)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  const sectionTypeLabels: Record<string, string> = {
    hero: '🎯 Hero',
    countdown: '⏱️ Compte à rebours',
    video: '🎥 Vidéo',
    description: '📝 Description',
    program: '📅 Programme',
    details: '📍 Détails',
    speakers: '🎤 Speakers',
    sponsors: '🤝 Sponsors',
    timeline: '🕐 Timeline',
    gallery: '🖼️ Galerie',
    faq: '❓ FAQ',
    cta: '✨ Appel à l\'action',
  }

  const sortedSections = [...sections].sort((a, b) => a.order - b.order)

  return (
    <div className="space-y-2">
      {sortedSections.map((section, index) => (
        <Card
          key={section.id}
          draggable
          onDragStart={(e) => handleDragStart(e, index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragEnd={handleDragEnd}
          className={`
            cursor-move transition-all
            ${draggedIndex === index ? 'opacity-50 scale-95' : ''}
            ${section.enabled ? 'bg-white' : 'bg-gray-50'}
            hover:shadow-md
          `}
        >
          <CardContent className="p-3">
            <div className="flex items-center gap-3">
              {/* Drag handle */}
              <div className="cursor-grab active:cursor-grabbing text-gray-400">
                <GripVertical className="h-5 w-5" />
              </div>

              {/* Section info */}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">
                    {sectionTypeLabels[section.type] || section.type}
                  </span>
                  <span className="text-xs text-gray-500">
                    ({section.layout})
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {section.paddingTop !== 'none' && `Padding: ${section.paddingTop}`}
                  {section.backgroundColor && ` • Fond: ${section.backgroundColor}`}
                  {section.animationType !== 'none' && ` • Animation: ${section.animationType}`}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onToggle(section.id)}
                  title={section.enabled ? 'Masquer' : 'Afficher'}
                >
                  {section.enabled ? (
                    <Eye className="h-4 w-4 text-[#009197]" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  )}
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onEdit(section)}
                  title="Configurer"
                >
                  <Settings2 className="h-4 w-4 text-[#004645]" />
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onDelete(section.id)}
                  title="Supprimer"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {sortedSections.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>Aucune section. Ajoutez-en une pour commencer.</p>
        </div>
      )}
    </div>
  )
}
