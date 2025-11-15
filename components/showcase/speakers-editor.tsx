"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Plus, X, User } from 'lucide-react'
import Image from 'next/image'

interface Speaker {
  name: string
  title: string
  bio: string
  photo: string
}

interface SpeakersEditorProps {
  speakers: Speaker[]
  onChange: (speakers: Speaker[]) => void
}

export function SpeakersEditor({ speakers, onChange }: SpeakersEditorProps) {
  const [newSpeaker, setNewSpeaker] = useState<Speaker>({
    name: '',
    title: '',
    bio: '',
    photo: '',
  })

  const handleAdd = () => {
    if (newSpeaker.name && newSpeaker.title) {
      onChange([...speakers, newSpeaker])
      setNewSpeaker({ name: '', title: '', bio: '', photo: '' })
    }
  }

  const handleRemove = (index: number) => {
    onChange(speakers.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      {/* Add New Speaker Form */}
      <Card className="p-4 border-[#9CD9F6]/30 bg-[#9CD9F6]/5">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="speaker-name" className="text-[#004645] text-xs">
                Nom complet
              </Label>
              <Input
                id="speaker-name"
                value={newSpeaker.name}
                onChange={(e) => setNewSpeaker({ ...newSpeaker, name: e.target.value })}
                placeholder="Jean Dupont"
                className="border-[#9CD9F6]/30"
              />
            </div>
            <div>
              <Label htmlFor="speaker-title" className="text-[#004645] text-xs">
                Titre/Fonction
              </Label>
              <Input
                id="speaker-title"
                value={newSpeaker.title}
                onChange={(e) => setNewSpeaker({ ...newSpeaker, title: e.target.value })}
                placeholder="CEO & Fondateur"
                className="border-[#9CD9F6]/30"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="speaker-photo" className="text-[#004645] text-xs">
              Photo (URL)
            </Label>
            <Input
              id="speaker-photo"
              value={newSpeaker.photo}
              onChange={(e) => setNewSpeaker({ ...newSpeaker, photo: e.target.value })}
              placeholder="https://exemple.com/photo.jpg"
              className="border-[#9CD9F6]/30"
            />
          </div>
          <div>
            <Label htmlFor="speaker-bio" className="text-[#004645] text-xs">
              Biographie
            </Label>
            <Textarea
              id="speaker-bio"
              value={newSpeaker.bio}
              onChange={(e) => setNewSpeaker({ ...newSpeaker, bio: e.target.value })}
              placeholder="Courte biographie du speaker..."
              className="border-[#9CD9F6]/30 min-h-[80px]"
            />
          </div>
          <Button
            type="button"
            onClick={handleAdd}
            className="w-full bg-[#009197] hover:bg-[#007b85] text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter le speaker
          </Button>
        </div>
      </Card>

      {/* Speakers List */}
      {speakers.length > 0 ? (
        <div className="space-y-3">
          <Label className="text-[#004645]">Speakers ajoutés ({speakers.length})</Label>
          {speakers.map((speaker, index) => (
            <Card
              key={index}
              className="p-4 border-[#9CD9F6]/30 hover:shadow-md transition-shadow"
            >
              <div className="flex gap-4">
                {speaker.photo ? (
                  <div className="w-16 h-16 rounded-full overflow-hidden relative flex-shrink-0">
                    <Image
                      src={speaker.photo}
                      alt={speaker.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-full bg-[#9CD9F6]/20 flex items-center justify-center">
                    <User className="h-8 w-8 text-[#009197]" />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-[#004645]">{speaker.name}</h4>
                      <p className="text-sm text-[#009197]">{speaker.title}</p>
                      {speaker.bio && (
                        <p className="text-xs text-[#004645]/70 mt-1 line-clamp-2">
                          {speaker.bio}
                        </p>
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
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 border-2 border-dashed border-[#9CD9F6]/30 rounded-lg">
          <User className="h-12 w-12 text-[#9CD9F6] mx-auto mb-2" />
          <p className="text-sm text-[#004645]/70">Aucun speaker ajouté</p>
        </div>
      )}
    </div>
  )
}
