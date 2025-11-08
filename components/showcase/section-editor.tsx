"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SectionConfig } from '@/lib/showcase-templates'
import { Layout, Palette, Sparkles, Settings } from 'lucide-react'

interface SectionEditorProps {
  section: SectionConfig
  onChange: (section: SectionConfig) => void
}

export function SectionEditor({ section, onChange }: SectionEditorProps) {
  const updateSection = (updates: Partial<SectionConfig>) => {
    onChange({ ...section, ...updates })
  }

  return (
    <Card className="border-[#009197]/30">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Configuration de la section
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="layout" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="layout">
              <Layout className="h-4 w-4 mr-1" />
              Layout
            </TabsTrigger>
            <TabsTrigger value="spacing">
              Espacement
            </TabsTrigger>
            <TabsTrigger value="background">
              <Palette className="h-4 w-4 mr-1" />
              Fond
            </TabsTrigger>
            <TabsTrigger value="animation">
              <Sparkles className="h-4 w-4 mr-1" />
              Animation
            </TabsTrigger>
          </TabsList>

          {/* Tab Layout */}
          <TabsContent value="layout" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Disposition</Label>
              <Select
                value={section.layout}
                onValueChange={(value: any) => updateSection({ layout: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fullwidth">Pleine largeur</SelectItem>
                  <SelectItem value="container">Container</SelectItem>
                  <SelectItem value="split">Split (2 colonnes)</SelectItem>
                  <SelectItem value="grid">Grille</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(section.layout === 'grid' || section.layout === 'split') && (
              <div className="space-y-2">
                <Label>Nombre de colonnes</Label>
                <Select
                  value={String(section.columns || 2)}
                  onValueChange={(value) => updateSection({ columns: Number(value) as 1 | 2 | 3 | 4 })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 colonne</SelectItem>
                    <SelectItem value="2">2 colonnes</SelectItem>
                    <SelectItem value="3">3 colonnes</SelectItem>
                    <SelectItem value="4">4 colonnes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>Alignement</Label>
              <Select
                value={section.alignment}
                onValueChange={(value: any) => updateSection({ alignment: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Gauche</SelectItem>
                  <SelectItem value="center">Centré</SelectItem>
                  <SelectItem value="right">Droite</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          {/* Tab Spacing */}
          <TabsContent value="spacing" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Padding supérieur</Label>
              <Select
                value={section.paddingTop}
                onValueChange={(value: any) => updateSection({ paddingTop: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucun</SelectItem>
                  <SelectItem value="sm">Petit (1rem)</SelectItem>
                  <SelectItem value="md">Moyen (2rem)</SelectItem>
                  <SelectItem value="lg">Grand (3rem)</SelectItem>
                  <SelectItem value="xl">Très grand (5rem)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Padding inférieur</Label>
              <Select
                value={section.paddingBottom}
                onValueChange={(value: any) => updateSection({ paddingBottom: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucun</SelectItem>
                  <SelectItem value="sm">Petit (1rem)</SelectItem>
                  <SelectItem value="md">Moyen (2rem)</SelectItem>
                  <SelectItem value="lg">Grand (3rem)</SelectItem>
                  <SelectItem value="xl">Très grand (5rem)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Marge supérieure</Label>
              <Select
                value={section.marginTop || 'none'}
                onValueChange={(value: any) => updateSection({ marginTop: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucune</SelectItem>
                  <SelectItem value="sm">Petite</SelectItem>
                  <SelectItem value="md">Moyenne</SelectItem>
                  <SelectItem value="lg">Grande</SelectItem>
                  <SelectItem value="xl">Très grande</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Marge inférieure</Label>
              <Select
                value={section.marginBottom || 'none'}
                onValueChange={(value: any) => updateSection({ marginBottom: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucune</SelectItem>
                  <SelectItem value="sm">Petite</SelectItem>
                  <SelectItem value="md">Moyenne</SelectItem>
                  <SelectItem value="lg">Grande</SelectItem>
                  <SelectItem value="xl">Très grande</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          {/* Tab Background */}
          <TabsContent value="background" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Couleur de fond</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={section.backgroundColor || '#ffffff'}
                  onChange={(e) => updateSection({ backgroundColor: e.target.value })}
                  className="w-16 h-10 p-1"
                />
                <Input
                  type="text"
                  value={section.backgroundColor || '#ffffff'}
                  onChange={(e) => updateSection({ backgroundColor: e.target.value })}
                  placeholder="#ffffff"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Image de fond (URL)</Label>
              <Input
                type="text"
                value={section.backgroundImage || ''}
                onChange={(e) => updateSection({ backgroundImage: e.target.value })}
                placeholder="https://..."
              />
            </div>

            {section.backgroundImage && (
              <>
                <div className="flex items-center justify-between">
                  <Label>Overlay</Label>
                  <Switch
                    checked={section.backgroundOverlay || false}
                    onCheckedChange={(checked) => updateSection({ backgroundOverlay: checked })}
                  />
                </div>

                {section.backgroundOverlay && (
                  <div className="space-y-2">
                    <Label>Opacité de l&apos;overlay ({section.overlayOpacity || 50}%)</Label>
                    <Slider
                      value={[section.overlayOpacity || 50]}
                      onValueChange={([value]) => updateSection({ overlayOpacity: value })}
                      min={0}
                      max={100}
                      step={5}
                    />
                  </div>
                )}
              </>
            )}

            <div className="space-y-2">
              <Label>Motif de fond</Label>
              <Select
                value={section.backgroundPattern || 'none'}
                onValueChange={(value: any) => updateSection({ backgroundPattern: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucun</SelectItem>
                  <SelectItem value="dots">Points</SelectItem>
                  <SelectItem value="grid">Grille</SelectItem>
                  <SelectItem value="waves">Vagues</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          {/* Tab Animation */}
          <TabsContent value="animation" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Type d&apos;animation</Label>
              <Select
                value={section.animationType}
                onValueChange={(value: any) => updateSection({ animationType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucune</SelectItem>
                  <SelectItem value="fade">Fondu</SelectItem>
                  <SelectItem value="slide">Glissement</SelectItem>
                  <SelectItem value="zoom">Zoom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {section.animationType !== 'none' && (
              <>
                <div className="space-y-2">
                  <Label>Durée</Label>
                  <Select
                    value={section.animationDuration}
                    onValueChange={(value: any) => updateSection({ animationDuration: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fast">Rapide (300ms)</SelectItem>
                      <SelectItem value="normal">Normal (500ms)</SelectItem>
                      <SelectItem value="slow">Lent (800ms)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Délai (ms)</Label>
                  <Input
                    type="number"
                    value={section.animationDelay || 0}
                    onChange={(e) => updateSection({ animationDelay: Number(e.target.value) })}
                    min={0}
                    max={2000}
                    step={100}
                  />
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
