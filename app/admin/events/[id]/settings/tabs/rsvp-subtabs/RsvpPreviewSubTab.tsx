"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Eye, ExternalLink, Smartphone, Monitor } from 'lucide-react'
import { useState } from 'react'

interface RsvpPreviewSubTabProps {
  event: any
}

export function RsvpPreviewSubTab({ event }: RsvpPreviewSubTabProps) {
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop')

  const previewUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/guest/preview-${event.id}`

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-[#009197]" />
              <div>
                <CardTitle className="text-[#004645]">Aperçu du Formulaire RSVP</CardTitle>
                <CardDescription>
                  Prévisualisez le formulaire tel que vos invités le verront
                </CardDescription>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant={viewMode === 'desktop' ? 'default' : 'outline'}
                onClick={() => setViewMode('desktop')}
                className={viewMode === 'desktop' ? 'bg-[#009197]' : ''}
              >
                <Monitor className="h-4 w-4 mr-2" />
                Desktop
              </Button>
              <Button
                size="sm"
                variant={viewMode === 'mobile' ? 'default' : 'outline'}
                onClick={() => setViewMode('mobile')}
                className={viewMode === 'mobile' ? 'bg-[#009197]' : ''}
              >
                <Smartphone className="h-4 w-4 mr-2" />
                Mobile
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center space-y-4 p-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <Eye className="h-12 w-12 text-gray-400" />
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">
                L&apos;aperçu interactif sera disponible prochainement
              </p>
              <p className="text-xs text-gray-500">
                En attendant, vous pouvez tester le formulaire réel en créant un invité de test
              </p>
            </div>

            <a
              href={`/admin/events/${event.id}/guests`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline">
                <ExternalLink className="h-4 w-4 mr-2" />
                Gérer les invités
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-[#004645]">Aperçu en temps réel</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-[#004645]/70">
              L&apos;aperçu interactif intégré permettra de tester le formulaire directement dans cette page avec toutes vos personnalisations.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-[#004645]">Test multi-appareils</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-[#004645]/70">
              Prévisualisez l&apos;affichage sur différents types d&apos;appareils (Desktop, Tablet, Mobile) pour garantir une expérience optimale.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
