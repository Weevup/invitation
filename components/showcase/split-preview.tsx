"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Monitor, Tablet, Smartphone, RefreshCw, ExternalLink, Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SplitPreviewProps {
  eventSlug: string
  isVisible: boolean
  onToggle: () => void
}

type DeviceType = 'desktop' | 'tablet' | 'mobile'

const deviceSizes: Record<DeviceType, { width: string; height: string }> = {
  desktop: { width: '100%', height: '100%' },
  tablet: { width: '768px', height: '1024px' },
  mobile: { width: '375px', height: '667px' },
}

export function SplitPreview({ eventSlug, isVisible, onToggle }: SplitPreviewProps) {
  const [device, setDevice] = useState<DeviceType>('desktop')
  const [refreshKey, setRefreshKey] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  const previewUrl = `${window.location.origin}/event/${eventSlug}`

  const handleRefresh = () => {
    setIsLoading(true)
    setRefreshKey(prev => prev + 1)
    setTimeout(() => setIsLoading(false), 500)
  }

  useEffect(() => {
    // Auto-refresh when visibility changes
    if (isVisible) {
      handleRefresh()
    }
  }, [isVisible])

  if (!isVisible) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={onToggle}
          size="lg"
          className="bg-[#FF4713] hover:bg-[#FF6B3D] text-white shadow-lg"
        >
          <Eye className="h-5 w-5 mr-2" />
          Aperçu en direct
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <Card className="h-full m-4 flex flex-col">
        <CardHeader className="flex-none border-b bg-white">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Aperçu en direct</CardTitle>

            <div className="flex items-center gap-2">
              {/* Device selector */}
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                <Button
                  size="sm"
                  variant={device === 'desktop' ? 'default' : 'ghost'}
                  onClick={() => setDevice('desktop')}
                  className={cn(
                    "px-2",
                    device === 'desktop' && "bg-[#004645] hover:bg-[#006C51]"
                  )}
                >
                  <Monitor className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant={device === 'tablet' ? 'default' : 'ghost'}
                  onClick={() => setDevice('tablet')}
                  className={cn(
                    "px-2",
                    device === 'tablet' && "bg-[#004645] hover:bg-[#006C51]"
                  )}
                >
                  <Tablet className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant={device === 'mobile' ? 'default' : 'ghost'}
                  onClick={() => setDevice('mobile')}
                  className={cn(
                    "px-2",
                    device === 'mobile' && "bg-[#004645] hover:bg-[#006C51]"
                  )}
                >
                  <Smartphone className="h-4 w-4" />
                </Button>
              </div>

              {/* Actions */}
              <Button
                size="sm"
                variant="outline"
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <RefreshCw className={cn("h-4 w-4 mr-1", isLoading && "animate-spin")} />
                Actualiser
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open(previewUrl, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                Ouvrir
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={onToggle}
              >
                <EyeOff className="h-4 w-4 mr-1" />
                Fermer
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 p-0 bg-gray-100 overflow-hidden">
          <div className="h-full w-full flex items-center justify-center p-6">
            {/* Preview frame */}
            <div
              className="bg-white shadow-2xl transition-all duration-300 overflow-hidden"
              style={{
                width: deviceSizes[device].width,
                height: device === 'desktop' ? '100%' : deviceSizes[device].height,
                maxWidth: '100%',
                maxHeight: '100%',
                borderRadius: device === 'desktop' ? '8px' : device === 'tablet' ? '24px' : '32px',
              }}
            >
              {isLoading ? (
                <div className="h-full flex items-center justify-center">
                  <RefreshCw className="h-8 w-8 animate-spin text-[#009197]" />
                </div>
              ) : (
                <iframe
                  key={refreshKey}
                  src={previewUrl}
                  className="w-full h-full border-0"
                  title="Preview"
                  sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                />
              )}
            </div>
          </div>

          {/* Device info */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded-full shadow-lg border text-sm text-gray-600">
            {device === 'desktop' && '💻 Desktop'}
            {device === 'tablet' && '📱 Tablet (768x1024)'}
            {device === 'mobile' && '📱 Mobile (375x667)'}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
