"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Plus, X, Clock } from 'lucide-react'

interface TimelineItem {
  time: string
  title: string
  description: string
}

interface TimelineEditorProps {
  timeline: TimelineItem[]
  onChange: (timeline: TimelineItem[]) => void
}

export function TimelineEditor({ timeline, onChange }: TimelineEditorProps) {
  const [newItem, setNewItem] = useState<TimelineItem>({
    time: '',
    title: '',
    description: '',
  })

  const handleAdd = () => {
    if (newItem.time && newItem.title) {
      onChange([...timeline, newItem])
      setNewItem({ time: '', title: '', description: '' })
    }
  }

  const handleRemove = (index: number) => {
    onChange(timeline.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      {/* Add New Timeline Item Form */}
      <Card className="p-4 border-[#9CD9F6]/30 bg-[#9CD9F6]/5">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="timeline-time" className="text-[#004645] text-xs">
                Heure
              </Label>
              <Input
                id="timeline-time"
                type="time"
                value={newItem.time}
                onChange={(e) => setNewItem({ ...newItem, time: e.target.value })}
                className="border-[#9CD9F6]/30"
              />
            </div>
            <div>
              <Label htmlFor="timeline-title" className="text-[#004645] text-xs">
                Titre
              </Label>
              <Input
                id="timeline-title"
                value={newItem.title}
                onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                placeholder="Accueil des invités"
                className="border-[#9CD9F6]/30"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="timeline-description" className="text-[#004645] text-xs">
              Description (optionnel)
            </Label>
            <Textarea
              id="timeline-description"
              value={newItem.description}
              onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
              placeholder="Détails sur cette étape..."
              className="border-[#9CD9F6]/30 min-h-[60px]"
            />
          </div>
          <Button
            type="button"
            onClick={handleAdd}
            className="w-full bg-[#009197] hover:bg-[#007b85] text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter à la timeline
          </Button>
        </div>
      </Card>

      {/* Timeline Items List */}
      {timeline.length > 0 ? (
        <div className="space-y-3">
          <Label className="text-[#004645]">Timeline ({timeline.length} étapes)</Label>
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-[#9CD9F6]" />

            {timeline
              .sort((a, b) => a.time.localeCompare(b.time))
              .map((item, index) => (
                <Card
                  key={index}
                  className="p-4 border-[#9CD9F6]/30 hover:shadow-md transition-shadow ml-16 relative"
                >
                  {/* Timeline dot */}
                  <div className="absolute -left-[34px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#009197] border-4 border-white" />

                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <Clock className="h-4 w-4 text-[#FF4713]" />
                        <span className="font-semibold text-[#FF4713]">{item.time}</span>
                      </div>
                      <h4 className="font-semibold text-[#004645] mb-1">{item.title}</h4>
                      {item.description && (
                        <p className="text-sm text-[#004645]/70">{item.description}</p>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemove(index)}
                      className="text-[#FF4713] hover:text-red-700 hover:bg-[#FF4713]/10"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 border-2 border-dashed border-[#9CD9F6]/30 rounded-lg">
          <Clock className="h-12 w-12 text-[#9CD9F6] mx-auto mb-2" />
          <p className="text-sm text-[#004645]/70">Aucune étape ajoutée</p>
        </div>
      )}
    </div>
  )
}
