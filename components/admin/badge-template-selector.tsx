'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  Palette,
} from 'lucide-react'

const categoryIcons = {
  corporate: Briefcase,
  event: Calendar,
  vip: Crown,
}

interface BadgeTemplateSelectorProps {
  onSelectTemplate: (template: BadgeTemplate) => void
  selectedTemplateId?: string
}

export function BadgeTemplateSelector({
  onSelectTemplate,
  selectedTemplateId,
}: BadgeTemplateSelectorProps) {
  const [activeCategory, setActiveCategory] = useState<BadgeTemplateCategory>('corporate')
  const categories = getTemplateCategories()
  const templates = getTemplatesByCategory(activeCategory)

  return (
    <div className="space-y-6">
      {/* Category Tabs */}
      <Tabs value={activeCategory} onValueChange={(v) => setActiveCategory(v as BadgeTemplateCategory)}>
        <TabsList className="grid w-full grid-cols-3">
          {categories.map((category) => {
            const Icon = categoryIcons[category.id]
            return (
              <TabsTrigger key={category.id} value={category.id}>
                <Icon className="h-4 w-4 mr-2" />
                {category.name}
                <Badge variant="secondary" className="ml-2">
                  {category.count}
                </Badge>
              </TabsTrigger>
            )
          })}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category.id} value={category.id} className="space-y-4">
            <div className="text-sm text-muted-foreground">
              {category.description}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getTemplatesByCategory(category.id).map((template) => {
                const isSelected = selectedTemplateId === template.name
                return (
                  <Card
                    key={template.name}
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      isSelected ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => onSelectTemplate(template)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base flex items-center gap-2">
                            {template.name}
                            {template.isDefault && (
                              <Badge variant="outline" className="text-xs">
                                Défaut
                              </Badge>
                            )}
                          </CardTitle>
                          <CardDescription className="text-xs mt-1">
                            {template.description}
                          </CardDescription>
                        </div>
                        {isSelected && (
                          <Check className="h-5 w-5 text-primary" />
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {/* Template Preview */}
                        <div
                          className={`border rounded-lg p-4 bg-gradient-to-br ${
                            template.layout.backgroundColor === '#1a1a1a' ||
                            template.layout.backgroundColor === '#1e293b'
                              ? 'from-gray-800 to-gray-900'
                              : 'from-white to-gray-50'
                          }`}
                          style={{
                            aspectRatio:
                              template.orientation === 'PORTRAIT' ? '2/3' : '3/2',
                          }}
                        >
                          <div className="h-full flex flex-col items-center justify-center gap-2">
                            <CreditCard
                              className={`h-8 w-8 ${
                                template.layout.backgroundColor === '#1a1a1a' ||
                                template.layout.backgroundColor === '#1e293b'
                                  ? 'text-gray-400'
                                  : 'text-gray-400'
                              }`}
                            />
                            <div
                              className={`text-xs font-medium ${
                                template.layout.backgroundColor === '#1a1a1a' ||
                                template.layout.backgroundColor === '#1e293b'
                                  ? 'text-gray-300'
                                  : 'text-gray-600'
                              }`}
                            >
                              {template.size}
                            </div>
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
                              {template.orientation === 'PORTRAIT'
                                ? 'Portrait'
                                : 'Paysage'}
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Champs</div>
                            <div className="font-medium">{template.fields.length}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Police</div>
                            <div className="font-medium truncate">
                              {template.fontFamily || 'Inter'}
                            </div>
                          </div>
                        </div>

                        <Button
                          variant={isSelected ? 'default' : 'outline'}
                          size="sm"
                          className="w-full"
                          onClick={(e) => {
                            e.stopPropagation()
                            onSelectTemplate(template)
                          }}
                        >
                          {isSelected ? (
                            <>
                              <Check className="h-4 w-4 mr-2" />
                              Sélectionné
                            </>
                          ) : (
                            <>
                              <Palette className="h-4 w-4 mr-2" />
                              Utiliser ce template
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
