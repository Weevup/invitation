"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { ImageIcon, Plus, X } from 'lucide-react'
import Image from 'next/image'

interface GalleryEditorProps {
  images: string[]
  onChange: (images: string[]) => void
}

export function GalleryEditor({ images, onChange }: GalleryEditorProps) {
  const [newImageUrl, setNewImageUrl] = useState('')

  const addImage = () => {
    if (newImageUrl.trim()) {
      onChange([...images, newImageUrl.trim()])
      setNewImageUrl('')
    }
  }

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          value={newImageUrl}
          onChange={(e) => setNewImageUrl(e.target.value)}
          placeholder="URL de l'image..."
          onKeyPress={(e) => e.key === 'Enter' && addImage()}
          className="border-[#9CD9F6]/30"
        />
        <Button
          type="button"
          onClick={addImage}
          className="bg-[#009197] hover:bg-[#004645]"
        >
          <Plus className="h-4 w-4 mr-2" />
          Ajouter
        </Button>
      </div>

      {images.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((url, index) => (
            <Card key={index} className="relative group">
              <CardContent className="p-2">
                <div className="aspect-square overflow-hidden rounded bg-gray-100 relative">
                  <Image
                    src={url}
                    alt={`Gallery ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 33vw"
                  />
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeImage(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
          <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-30" />
          <p>Aucune image dans la galerie</p>
        </div>
      )}
    </div>
  )
}
