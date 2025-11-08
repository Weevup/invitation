"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { showcaseTemplates, ShowcaseTemplate } from '@/lib/showcase-templates'
import { Sparkles, Check, Building2, Music, Code2, Heart, Rocket } from 'lucide-react'

interface TemplateSelectorProps {
  onSelect: (template: ShowcaseTemplate) => void
  onClose: () => void
  open: boolean
}

const categoryIcons = {
  corporate: Building2,
  event: Music,
  tech: Code2,
  charity: Heart,
  product: Rocket,
}

const categoryLabels = {
  corporate: 'Corporate',
  event: 'Événement',
  tech: 'Tech',
  charity: 'Charité',
  product: 'Produit',
}

export function TemplateSelector({ onSelect, onClose, open }: TemplateSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<ShowcaseTemplate | null>(null)

  const filteredTemplates = selectedCategory
    ? showcaseTemplates.filter(t => t.category === selectedCategory)
    : showcaseTemplates

  const handleSelect = () => {
    if (selectedTemplate) {
      onSelect(selectedTemplate)
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="h-6 w-6 text-[#FF4713]" />
            Choisir un template
          </DialogTitle>
          <DialogDescription>
            Démarrez rapidement avec un template professionnel prêt à l&apos;emploi
          </DialogDescription>
        </DialogHeader>

        {/* Filtres par catégorie */}
        <div className="flex flex-wrap gap-2 my-4">
          <Button
            variant={selectedCategory === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(null)}
            className={selectedCategory === null ? 'bg-[#004645] hover:bg-[#006C51]' : ''}
          >
            Tous
          </Button>
          {Object.entries(categoryLabels).map(([key, label]) => {
            const Icon = categoryIcons[key as keyof typeof categoryIcons]
            return (
              <Button
                key={key}
                variant={selectedCategory === key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(key)}
                className={selectedCategory === key ? 'bg-[#004645] hover:bg-[#006C51]' : ''}
              >
                <Icon className="h-4 w-4 mr-1" />
                {label}
              </Button>
            )
          })}
        </div>

        {/* Grille de templates */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((template) => {
            const CategoryIcon = categoryIcons[template.category]
            const isSelected = selectedTemplate?.id === template.id

            return (
              <Card
                key={template.id}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  isSelected ? 'ring-2 ring-[#FF4713] shadow-lg' : ''
                }`}
                onClick={() => setSelectedTemplate(template)}
              >
                <CardHeader className="p-4">
                  {/* Preview */}
                  <div
                    className="h-32 rounded-lg mb-3 relative overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, ${template.primaryColor} 0%, ${template.secondaryColor} 100%)`,
                    }}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2 bg-white rounded-full p-1">
                        <Check className="h-5 w-5 text-[#FF4713]" />
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <CategoryIcon className="h-12 w-12 text-white/30" />
                    </div>
                  </div>

                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <CardTitle className="text-lg text-[#004645]">
                        {template.name}
                      </CardTitle>
                      <CardDescription className="text-sm mt-1">
                        {template.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-4 pt-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="text-xs">
                      <CategoryIcon className="h-3 w-3 mr-1" />
                      {categoryLabels[template.category]}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {template.sections.length} sections
                    </Badge>
                  </div>

                  {/* Exemple de contenu */}
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg text-xs">
                    <p className="font-medium text-[#004645]">{template.sampleContent.title}</p>
                    <p className="text-gray-600 mt-1 text-xs">{template.sampleContent.subtitle}</p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center mt-6 pt-4 border-t">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Annuler
          </Button>
          <Button
            onClick={handleSelect}
            disabled={!selectedTemplate}
            className="bg-[#FF4713] hover:bg-[#FF6B3D] text-white"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Utiliser ce template
          </Button>
        </div>

        {/* Aperçu détaillé du template sélectionné */}
        {selectedTemplate && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-[#004645] mb-2">
              Ce template inclut :
            </h4>
            <ul className="grid md:grid-cols-2 gap-2 text-sm">
              {selectedTemplate.sections.map((section) => (
                <li key={section.id} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#009197]" />
                  <span className="capitalize">{section.type.replace('-', ' ')}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
