"use client"

import { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import { Area } from 'react-easy-crop'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  Loader2,
  RotateCw,
  Square,
  RectangleVertical,
  RectangleHorizontal,
  CreditCard,
  Maximize2,
} from 'lucide-react'
import { processImage, formatFileSize, ASPECT_RATIO_PRESETS } from '@/lib/image-utils'
import { cn } from '@/lib/utils'

interface PhotoCropModalProps {
  open: boolean
  onClose: () => void
  imageSrc: string
  onCropComplete: (blob: Blob, previewUrl: string) => void
  originalFileName?: string
  originalFileSize?: number
}

export function PhotoCropModal({
  open,
  onClose,
  imageSrc,
  onCropComplete,
  originalFileName,
  originalFileSize,
}: PhotoCropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedAspect, setSelectedAspect] = useState<number>(1) // Default to square
  const [processedSize, setProcessedSize] = useState<number | null>(null)

  const onCropChange = useCallback((crop: { x: number; y: number }) => {
    setCrop(crop)
  }, [])

  const onZoomChange = useCallback((zoom: number) => {
    setZoom(zoom)
  }, [])

  const onCropCompleteCallback = useCallback(
    (croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels)
    },
    []
  )

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360)
  }

  const handleAspectChange = (aspect: number) => {
    setSelectedAspect(aspect)
  }

  const handleSave = async () => {
    if (!croppedAreaPixels) return

    setIsProcessing(true)

    try {
      const { blob, previewUrl, size } = await processImage(
        imageSrc,
        croppedAreaPixels,
        rotation,
        1200, // Max dimension
        0.9 // Quality
      )

      setProcessedSize(size)
      onCropComplete(blob, previewUrl)
      onClose()
    } catch (error) {
      console.error('Error processing image:', error)
      alert('Erreur lors du traitement de l\'image')
    } finally {
      setIsProcessing(false)
    }
  }

  const aspectRatioOptions = [
    {
      icon: Square,
      label: ASPECT_RATIO_PRESETS.SQUARE.label,
      value: ASPECT_RATIO_PRESETS.SQUARE.value,
      key: 'SQUARE',
    },
    {
      icon: RectangleVertical,
      label: ASPECT_RATIO_PRESETS.PORTRAIT.label,
      value: ASPECT_RATIO_PRESETS.PORTRAIT.value,
      key: 'PORTRAIT',
    },
    {
      icon: RectangleHorizontal,
      label: ASPECT_RATIO_PRESETS.LANDSCAPE.label,
      value: ASPECT_RATIO_PRESETS.LANDSCAPE.value,
      key: 'LANDSCAPE',
    },
    {
      icon: CreditCard,
      label: ASPECT_RATIO_PRESETS.BADGE_STANDARD.label,
      value: ASPECT_RATIO_PRESETS.BADGE_STANDARD.value,
      key: 'BADGE_STANDARD',
    },
    {
      icon: Maximize2,
      label: ASPECT_RATIO_PRESETS.BADGE_LANYARD.label,
      value: ASPECT_RATIO_PRESETS.BADGE_LANYARD.value,
      key: 'BADGE_LANYARD',
    },
  ]

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Recadrer la photo</DialogTitle>
          <DialogDescription>
            Ajustez la zone de recadrage, le zoom et la rotation de votre photo
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="crop" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="crop">Recadrage</TabsTrigger>
            <TabsTrigger value="presets">Formats prédéfinis</TabsTrigger>
          </TabsList>

          <TabsContent value="crop" className="space-y-4">
            {/* Cropper Area */}
            <div className="relative w-full h-[400px] bg-gray-100 rounded-lg overflow-hidden">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                rotation={rotation}
                aspect={selectedAspect}
                onCropChange={onCropChange}
                onZoomChange={onZoomChange}
                onCropComplete={onCropCompleteCallback}
                style={{
                  containerStyle: {
                    borderRadius: '0.5rem',
                  },
                }}
              />
            </div>

            {/* Controls */}
            <div className="space-y-4">
              {/* Zoom Control */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Zoom</Label>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(zoom * 100)}%
                  </span>
                </div>
                <Slider
                  value={[zoom]}
                  onValueChange={([value]) => setZoom(value)}
                  min={1}
                  max={3}
                  step={0.1}
                  className="w-full"
                />
              </div>

              {/* Rotation Control */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Rotation</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{rotation}°</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRotate}
                    >
                      <RotateCw className="h-4 w-4 mr-1" />
                      90°
                    </Button>
                  </div>
                </div>
                <Slider
                  value={[rotation]}
                  onValueChange={([value]) => setRotation(value)}
                  min={0}
                  max={360}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>

            {/* File Info */}
            {originalFileName && (
              <div className="flex items-center justify-between text-sm text-muted-foreground p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Fichier:</span>
                  <span>{originalFileName}</span>
                </div>
                {originalFileSize && (
                  <Badge variant="secondary">
                    {formatFileSize(originalFileSize)}
                  </Badge>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="presets" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {aspectRatioOptions.map((option) => {
                const Icon = option.icon
                const isSelected = selectedAspect === option.value

                return (
                  <button
                    key={option.key}
                    onClick={() => handleAspectChange(option.value)}
                    className={cn(
                      'flex flex-col items-center justify-center gap-3 p-4 rounded-lg border-2 transition-all',
                      isSelected
                        ? 'border-[#009197] bg-[#9CD9F6]/10'
                        : 'border-gray-200 hover:border-[#009197]/50'
                    )}
                  >
                    <Icon
                      className={cn(
                        'h-8 w-8',
                        isSelected ? 'text-[#009197]' : 'text-gray-400'
                      )}
                    />
                    <span
                      className={cn(
                        'text-sm font-medium text-center',
                        isSelected ? 'text-[#004645]' : 'text-gray-600'
                      )}
                    >
                      {option.label}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Preview */}
            <div className="relative w-full h-[300px] bg-gray-100 rounded-lg overflow-hidden">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                rotation={rotation}
                aspect={selectedAspect}
                onCropChange={onCropChange}
                onZoomChange={onZoomChange}
                onCropComplete={onCropCompleteCallback}
                style={{
                  containerStyle: {
                    borderRadius: '0.5rem',
                  },
                }}
              />
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            L&apos;image sera optimisée automatiquement (max 1200px, qualité 90%)
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} disabled={isProcessing}>
              Annuler
            </Button>
            <Button
              onClick={handleSave}
              disabled={isProcessing || !croppedAreaPixels}
              className="bg-gradient-to-r from-[#004645] to-[#009197]"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Traitement...
                </>
              ) : (
                'Valider'
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
