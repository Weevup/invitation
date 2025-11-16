'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  getDefaultBadgeTemplates,
  getTemplatesByCategory,
  getTemplateCategories,
  type BadgeTemplate,
  type BadgeTemplateCategory,
} from '@/lib/badge-generator'
import {
  Briefcase,
  Calendar,
  Crown,
  CreditCard,
  Check,
  Loader2,
  CheckCircle,
  Info,
} from 'lucide-react'
import { toast } from 'sonner'

const categoryIcons = {
  corporate: Briefcase,
  event: Calendar,
  vip: Crown,
}

interface BadgeTemplateGalleryProps {
  eventId: string
  currentDesign?: {
    name: string
    size: string
    orientation: string
  } | null
  onSave?: () => void
}

export function BadgeTemplateGallery({
  eventId,
  currentDesign,
  onSave,
}: BadgeTemplateGalleryProps) {
  const [saving, setSaving] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<BadgeTemplateCategory>('corporate')

  const categories = getTemplateCategories()
  const allTemplates = getDefaultBadgeTemplates()

  const handleApplyTemplate = async (template: BadgeTemplate) => {
    setSaving(true)

    try {
      const response = await fetch(`/api/admin/events/${eventId}/badge-design`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: template.name,
          size: template.size,
          orientation: template.orientation,
          layout: template.layout,
          fields: template.fields,
          fontFamily: template.fontFamily || 'Inter',
          includeQRCode: true,
          qrCodeSize: 80,
          badgesPerPage: 10,
          pageMargin: 10,
          badgeSpacing: 5,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Erreur lors de la sauvegarde')
      }

      toast.success(`Template "${template.name}" appliqué avec succès!`)
      onSave?.()
    } catch (error) {
      console.error('Apply template error:', error)
      toast.error(
        error instanceof Error ? error.message : 'Erreur lors de l\'application du template'
      )
    } finally {
      setSaving(false)
    }
  }

  const isCurrentTemplate = (template: BadgeTemplate) => {
    return currentDesign?.name === template.name
  }

  return (
    <div className="space-y-6">
      {/* Current Design Info */}
      {currentDesign && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>Design actuel:</strong> {currentDesign.name} ({currentDesign.size},{' '}
            {currentDesign.orientation === 'PORTRAIT' ? 'Portrait' : 'Paysage'})
          </AlertDescription>
        </Alert>
      )}

      {/* Help Text */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Cliquez sur un template pour l&apos;appliquer immédiatement à vos badges.
          Les badges déjà générés ne seront pas modifiés.
        </AlertDescription>
      </Alert>

      {/* Category Filters */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={selectedCategory === null ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedCategory(null as any)}
        >
          Tous les templates ({allTemplates.length})
        </Button>
        {categories.map((category) => {
          const Icon = categoryIcons[category.id]
          return (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
            >
              <Icon className="h-4 w-4 mr-2" />
              {category.name} ({category.count})
            </Button>
          )
        })}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(selectedCategory === null ? allTemplates : getTemplatesByCategory(selectedCategory)).map(
          (template) => {
            const isCurrent = isCurrentTemplate(template)
            const Icon = categoryIcons[template.category]

            return (
              <Card
                key={template.name}
                className={`relative overflow-hidden transition-all hover:shadow-lg ${
                  isCurrent ? 'ring-2 ring-primary shadow-lg' : ''
                }`}
              >
                {isCurrent && (
                  <div className="absolute top-4 right-4 z-10">
                    <Badge className="bg-primary">
                      <Check className="h-3 w-3 mr-1" />
                      Actuel
                    </Badge>
                  </div>
                )}

                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-muted">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <CardDescription className="text-xs mt-1">
                        {template.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Visual Preview */}
                  <div
                    className={`relative border-2 rounded-lg p-6 bg-gradient-to-br ${
                      template.layout.backgroundColor === '#1a1a1a' ||
                      template.layout.backgroundColor === '#1e293b'
                        ? 'from-gray-800 to-gray-900 border-gray-700'
                        : 'from-white to-gray-50 border-gray-200'
                    }`}
                    style={{
                      aspectRatio: template.orientation === 'PORTRAIT' ? '5/7' : '7/5',
                    }}
                  >
                    <div className="h-full flex flex-col items-center justify-center gap-3">
                      <CreditCard
                        className={`h-12 w-12 ${
                          template.layout.backgroundColor === '#1a1a1a' ||
                          template.layout.backgroundColor === '#1e293b'
                            ? 'text-gray-400'
                            : 'text-gray-300'
                        }`}
                      />
                      <div
                        className={`text-sm font-medium ${
                          template.layout.backgroundColor === '#1a1a1a' ||
                          template.layout.backgroundColor === '#1e293b'
                            ? 'text-gray-300'
                            : 'text-gray-500'
                        }`}
                      >
                        {template.fields.length} champs
                      </div>
                    </div>

                    {/* Category badge */}
                    <div className="absolute bottom-2 left-2">
                      <Badge variant="outline" className="text-xs bg-white/90 backdrop-blur">
                        {template.category}
                      </Badge>
                    </div>
                  </div>

                  {/* Template Info */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <div className="text-muted-foreground">Taille</div>
                      <div className="font-medium">{template.size}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Orientation</div>
                      <div className="font-medium">
                        {template.orientation === 'PORTRAIT' ? 'Portrait' : 'Paysage'}
                      </div>
                    </div>
                  </div>

                  {/* Apply Button */}
                  <Button
                    className="w-full"
                    variant={isCurrent ? 'outline' : 'default'}
                    disabled={saving || isCurrent}
                    onClick={() => handleApplyTemplate(template)}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Application...
                      </>
                    ) : isCurrent ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Appliqué
                      </>
                    ) : (
                      'Appliquer ce template'
                    )}
                  </Button>
                </CardContent>
              </Card>
            )
          }
        )}
      </div>
    </div>
  )
}
