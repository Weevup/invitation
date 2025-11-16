"use client"

import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Upload, Camera, X, Loader2, Check } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

interface PhotoUploadProps {
  guestId: string
  currentPhotoUrl?: string | null
  onPhotoUploaded?: (url: string) => void
  onPhotoDeleted?: () => void
}

export function PhotoUpload({
  guestId,
  currentPhotoUrl,
  onPhotoUploaded,
  onPhotoDeleted,
}: PhotoUploadProps) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(currentPhotoUrl || null)
  const [isUploading, setIsUploading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [showWebcam, setShowWebcam] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { toast } = useToast()

  // Handle file selection
  const handleFileSelect = async (file: File) => {
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Type de fichier invalide',
        description: 'Veuillez sélectionner une image (JPEG, PNG, WebP)',
        variant: 'destructive',
      })
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Fichier trop volumineux',
        description: 'La taille maximale est de 5 MB',
        variant: 'destructive',
      })
      return
    }

    await uploadPhoto(file)
  }

  // Upload photo to API
  const uploadPhoto = async (file: File) => {
    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('photo', file)

      const response = await fetch(`/api/admin/guests/${guestId}/photo`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Upload failed')
      }

      const data = await response.json()
      setPhotoUrl(data.photo.url)
      onPhotoUploaded?.(data.photo.url)

      toast({
        title: 'Photo uploadée',
        description: 'La photo a été uploadée avec succès',
      })
    } catch (error) {
      console.error('Upload error:', error)
      toast({
        title: 'Erreur d\'upload',
        description: error instanceof Error ? error.message : 'Une erreur est survenue',
        variant: 'destructive',
      })
    } finally {
      setIsUploading(false)
    }
  }

  // Delete photo
  const handleDelete = async () => {
    if (!photoUrl) return

    setIsDeleting(true)

    try {
      const response = await fetch(`/api/admin/guests/${guestId}/photo`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Delete failed')
      }

      setPhotoUrl(null)
      onPhotoDeleted?.()

      toast({
        title: 'Photo supprimée',
        description: 'La photo a été supprimée avec succès',
      })
    } catch (error) {
      console.error('Delete error:', error)
      toast({
        title: 'Erreur de suppression',
        description: error instanceof Error ? error.message : 'Une erreur est survenue',
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  // Drag & drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      await handleFileSelect(files[0])
    }
  }, [guestId])

  // Webcam handlers
  const startWebcam = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
      })
      setStream(mediaStream)
      setShowWebcam(true)

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (error) {
      console.error('Webcam error:', error)
      toast({
        title: 'Erreur webcam',
        description: 'Impossible d\'accéder à la webcam',
        variant: 'destructive',
      })
    }
  }

  const stopWebcam = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
    setShowWebcam(false)
  }

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Draw video frame to canvas
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Convert canvas to blob
    canvas.toBlob(async (blob) => {
      if (!blob) return

      const file = new File([blob], `webcam-${Date.now()}.jpg`, {
        type: 'image/jpeg',
      })

      stopWebcam()
      await uploadPhoto(file)
    }, 'image/jpeg', 0.9)
  }

  return (
    <div className="space-y-4">
      {photoUrl ? (
        // Photo preview with delete option
        <Card className="border-[#9CD9F6]/30">
          <CardContent className="p-4">
            <div className="relative aspect-square w-full max-w-xs mx-auto">
              <Image
                src={photoUrl}
                alt="Guest photo"
                fill
                className="object-cover rounded-lg"
              />
              <Button
                size="icon"
                variant="destructive"
                className="absolute top-2 right-2"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <X className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div className="flex items-center justify-center gap-2 mt-3 text-sm text-green-600">
              <Check className="h-4 w-4" />
              Photo uploadée
            </div>
          </CardContent>
        </Card>
      ) : (
        // Upload interface
        <div className="space-y-3">
          {!showWebcam ? (
            <>
              {/* File upload drop zone */}
              <Card
                className={cn(
                  'border-2 border-dashed transition-colors cursor-pointer',
                  isDragging
                    ? 'border-[#009197] bg-[#9CD9F6]/10'
                    : 'border-[#9CD9F6]/30 hover:border-[#009197]/50'
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <CardContent className="p-8 text-center">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-[#009197]" />
                  <p className="text-sm font-medium text-[#004645] mb-1">
                    Glissez-déposez une photo ici
                  </p>
                  <p className="text-xs text-[#004645]/70">
                    ou cliquez pour parcourir (JPEG, PNG, WebP - Max 5MB)
                  </p>
                  {isUploading && (
                    <div className="mt-4 flex items-center justify-center gap-2 text-[#009197]">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Upload en cours...
                    </div>
                  )}
                </CardContent>
              </Card>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFileSelect(file)
                }}
              />

              {/* Webcam button */}
              <Button
                variant="outline"
                className="w-full"
                onClick={startWebcam}
                disabled={isUploading}
              >
                <Camera className="h-4 w-4 mr-2" />
                Prendre une photo avec la webcam
              </Button>
            </>
          ) : (
            // Webcam interface
            <Card className="border-[#9CD9F6]/30">
              <CardContent className="p-4 space-y-3">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full rounded-lg"
                />
                <canvas ref={canvasRef} className="hidden" />
                <div className="flex gap-2">
                  <Button
                    onClick={capturePhoto}
                    className="flex-1 bg-gradient-to-r from-[#004645] to-[#009197]"
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Camera className="h-4 w-4 mr-2" />
                    )}
                    Capturer
                  </Button>
                  <Button variant="outline" onClick={stopWebcam}>
                    Annuler
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
