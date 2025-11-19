"use client"

import { useState, useRef } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface ImageUploadProps {
  currentImageUrl?: string
  onImageUploaded: (url: string) => void
  onImageDeleted?: () => void
  label?: string
  aspectRatio?: 'square' | 'video' | 'portrait' | 'wide'
  maxSizeMB?: number
  className?: string
}

export function ImageUpload({
  currentImageUrl,
  onImageUploaded,
  onImageDeleted,
  label = "Image",
  aspectRatio = 'video',
  maxSizeMB = 5,
  className,
}: ImageUploadProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(currentImageUrl || null)
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Handle file selection
  const handleFileSelect = async (file: File) => {
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Type de fichier invalide. Veuillez sélectionner une image (JPEG, PNG, WebP)')
      return
    }

    // Validate file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`Fichier trop volumineux. La taille maximale est de ${maxSizeMB} MB`)
      return
    }

    await uploadImage(file)
  }

  // Upload image to API
  const uploadImage = async (file: File) => {
    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('image', file)

      const response = await fetch('/api/admin/upload-image', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        // More specific error message
        const errorMessage = data.error || data.message || 'Upload failed'
        throw new Error(errorMessage)
      }

      setImageUrl(data.url)
      onImageUploaded(data.url)

      toast.success('Image téléchargée avec succès')
    } catch (error) {
      console.error('Error uploading image:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors du téléchargement'

      // Show more helpful error messages
      if (errorMessage.includes('BLOB_')) {
        toast.error('Erreur de configuration du stockage. Vérifiez que BLOB_READ_WRITE_TOKEN est configuré dans les variables d\'environnement.')
      } else if (errorMessage.includes('Unauthorized') || errorMessage.includes('403')) {
        toast.error('Accès non autorisé. Veuillez vous reconnecter.')
      } else if (errorMessage.includes('Invalid file type')) {
        toast.error('Type de fichier invalide. Utilisez JPEG, PNG ou WebP.')
      } else if (errorMessage.includes('File too large')) {
        toast.error(`Fichier trop volumineux. Taille maximale : ${maxSizeMB}MB`)
      } else {
        toast.error(`Erreur: ${errorMessage}`)
      }
    } finally {
      setIsUploading(false)
    }
  }

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  // Handle delete
  const handleDelete = () => {
    setImageUrl(null)
    if (onImageDeleted) {
      onImageDeleted()
    }
    toast.success('Image supprimée')
  }

  const aspectRatioClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]',
    wide: 'aspect-[21/9]',
  }

  return (
    <div className={cn("space-y-2", className)}>
      {imageUrl ? (
        // Display uploaded image
        <div className="relative group">
          <div className={cn(
            "relative w-full rounded-lg overflow-hidden border border-[#9CD9F6]/30",
            aspectRatioClasses[aspectRatio]
          )}>
            <Image
              src={imageUrl}
              alt={label}
              fill
              className="object-cover"
            />
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="h-4 w-4 mr-1" />
            Supprimer
          </Button>
        </div>
      ) : (
        // Upload area
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
            isDragging
              ? "border-[#009197] bg-[#9CD9F6]/10"
              : "border-[#9CD9F6]/30 hover:border-[#9CD9F6]/50",
            aspectRatioClasses[aspectRatio]
          )}
        >
          <div className="flex flex-col items-center justify-center h-full">
            {isUploading ? (
              <>
                <Loader2 className="h-12 w-12 text-[#009197] animate-spin mb-4" />
                <p className="text-sm text-[#004645]/70">Téléchargement en cours...</p>
              </>
            ) : (
              <>
                <ImageIcon className="h-12 w-12 text-[#009197]/40 mb-4" />
                <p className="text-sm text-[#004645]/70 mb-4">
                  Glissez-déposez une image ou cliquez pour parcourir
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="border-[#009197] text-[#009197] hover:bg-[#9CD9F6]/10"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Parcourir
                </Button>
                <p className="text-xs text-[#004645]/50 mt-4">
                  JPEG, PNG, WebP • Max {maxSizeMB}MB
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFileSelect(file)
        }}
        className="hidden"
      />
    </div>
  )
}
