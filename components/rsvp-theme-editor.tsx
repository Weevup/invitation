"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Paintbrush, Type, Layout, RefreshCw } from 'lucide-react'

export interface RsvpTheme {
  primaryColor?: string
  secondaryColor?: string
  backgroundColor?: string
  textColor?: string
  buttonRadius?: string
  fontFamily?: string
  borderWidth?: string
  accentColor?: string
}

interface RsvpThemeEditorProps {
  theme: RsvpTheme
  onChange: (theme: RsvpTheme) => void
}

const DEFAULT_THEME: RsvpTheme = {
  primaryColor: '#004645',
  secondaryColor: '#009197',
  backgroundColor: '#ffffff',
  textColor: '#333333',
  buttonRadius: '0.5rem',
  fontFamily: 'Inter',
  borderWidth: '1px',
  accentColor: '#9CD9F6'
}

const PRESET_THEMES = {
  weevup: {
    name: 'Weevup',
    primaryColor: '#004645',
    secondaryColor: '#009197',
    backgroundColor: '#ffffff',
    textColor: '#333333',
    buttonRadius: '0.5rem',
    fontFamily: 'Inter',
    borderWidth: '1px',
    accentColor: '#9CD9F6'
  },
  elegant: {
    name: 'Élégant',
    primaryColor: '#1a1a1a',
    secondaryColor: '#d4af37',
    backgroundColor: '#fafafa',
    textColor: '#2c2c2c',
    buttonRadius: '0.25rem',
    fontFamily: 'Georgia',
    borderWidth: '2px',
    accentColor: '#e8e8e8'
  },
  modern: {
    name: 'Moderne',
    primaryColor: '#667eea',
    secondaryColor: '#764ba2',
    backgroundColor: '#f8f9fa',
    textColor: '#212529',
    buttonRadius: '1rem',
    fontFamily: 'Inter',
    borderWidth: '0px',
    accentColor: '#a8b3ff'
  },
  minimal: {
    name: 'Minimal',
    primaryColor: '#000000',
    secondaryColor: '#666666',
    backgroundColor: '#ffffff',
    textColor: '#000000',
    buttonRadius: '0',
    fontFamily: 'Arial',
    borderWidth: '1px',
    accentColor: '#f0f0f0'
  },
  nature: {
    name: 'Nature',
    primaryColor: '#2d5016',
    secondaryColor: '#7cb342',
    backgroundColor: '#f1f8e9',
    textColor: '#1b5e20',
    buttonRadius: '0.75rem',
    fontFamily: 'Inter',
    borderWidth: '2px',
    accentColor: '#c5e1a5'
  },
  ocean: {
    name: 'Océan',
    primaryColor: '#006064',
    secondaryColor: '#0097a7',
    backgroundColor: '#e0f7fa',
    textColor: '#004d40',
    buttonRadius: '0.5rem',
    fontFamily: 'Inter',
    borderWidth: '1px',
    accentColor: '#80deea'
  }
}

export function RsvpThemeEditor({ theme, onChange }: RsvpThemeEditorProps) {
  const currentTheme = { ...DEFAULT_THEME, ...theme }

  const applyPreset = (presetKey: keyof typeof PRESET_THEMES) => {
    const preset = PRESET_THEMES[presetKey]
    const { name, ...themeValues } = preset
    onChange(themeValues)
  }

  const resetToDefault = () => {
    onChange(DEFAULT_THEME)
  }

  return (
    <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-[#004645] flex items-center gap-2">
            <Paintbrush className="h-5 w-5" />
            Personnalisation du thème
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={resetToDefault}
            className="text-[#004645] border-[#9CD9F6]"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Réinitialiser
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="presets" className="space-y-4">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="presets">Thèmes prédéfinis</TabsTrigger>
            <TabsTrigger value="colors">Couleurs</TabsTrigger>
            <TabsTrigger value="typography">Typographie</TabsTrigger>
          </TabsList>

          {/* Preset Themes */}
          <TabsContent value="presets" className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(PRESET_THEMES).map(([key, preset]) => (
                <button
                  key={key}
                  onClick={() => applyPreset(key as keyof typeof PRESET_THEMES)}
                  className="group relative overflow-hidden rounded-lg border-2 hover:border-[#009197] transition-all p-3 text-left"
                  style={{
                    backgroundColor: preset.backgroundColor,
                    borderColor: preset.accentColor
                  }}
                >
                  <div className="space-y-2">
                    <div className="font-semibold" style={{ color: preset.textColor }}>
                      {preset.name}
                    </div>
                    <div className="flex gap-1">
                      <div
                        className="w-6 h-6 rounded"
                        style={{ backgroundColor: preset.primaryColor }}
                      />
                      <div
                        className="w-6 h-6 rounded"
                        style={{ backgroundColor: preset.secondaryColor }}
                      />
                      <div
                        className="w-6 h-6 rounded border"
                        style={{ backgroundColor: preset.accentColor }}
                      />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </TabsContent>

          {/* Colors Tab */}
          <TabsContent value="colors" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Couleur primaire</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={currentTheme.primaryColor}
                    onChange={(e) => onChange({ ...currentTheme, primaryColor: e.target.value })}
                    className="w-16 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={currentTheme.primaryColor}
                    onChange={(e) => onChange({ ...currentTheme, primaryColor: e.target.value })}
                    placeholder="#004645"
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Couleur secondaire</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={currentTheme.secondaryColor}
                    onChange={(e) => onChange({ ...currentTheme, secondaryColor: e.target.value })}
                    className="w-16 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={currentTheme.secondaryColor}
                    onChange={(e) => onChange({ ...currentTheme, secondaryColor: e.target.value })}
                    placeholder="#009197"
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Couleur d&apos;accentuation</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={currentTheme.accentColor}
                    onChange={(e) => onChange({ ...currentTheme, accentColor: e.target.value })}
                    className="w-16 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={currentTheme.accentColor}
                    onChange={(e) => onChange({ ...currentTheme, accentColor: e.target.value })}
                    placeholder="#9CD9F6"
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Couleur de fond</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={currentTheme.backgroundColor}
                    onChange={(e) => onChange({ ...currentTheme, backgroundColor: e.target.value })}
                    className="w-16 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={currentTheme.backgroundColor}
                    onChange={(e) => onChange({ ...currentTheme, backgroundColor: e.target.value })}
                    placeholder="#ffffff"
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Couleur du texte</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={currentTheme.textColor}
                    onChange={(e) => onChange({ ...currentTheme, textColor: e.target.value })}
                    className="w-16 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={currentTheme.textColor}
                    onChange={(e) => onChange({ ...currentTheme, textColor: e.target.value })}
                    placeholder="#333333"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Typography Tab */}
          <TabsContent value="typography" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Police de caractères</Label>
                <Select
                  value={currentTheme.fontFamily}
                  onValueChange={(value) => onChange({ ...currentTheme, fontFamily: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Inter">Inter (Sans-serif moderne)</SelectItem>
                    <SelectItem value="Arial">Arial (Sans-serif classique)</SelectItem>
                    <SelectItem value="Georgia">Georgia (Serif élégant)</SelectItem>
                    <SelectItem value="Helvetica">Helvetica (Sans-serif)</SelectItem>
                    <SelectItem value="Times New Roman">Times New Roman (Serif)</SelectItem>
                    <SelectItem value="Verdana">Verdana (Sans-serif)</SelectItem>
                    <SelectItem value="Courier New">Courier New (Monospace)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Arrondi des boutons</Label>
                <Select
                  value={currentTheme.buttonRadius}
                  onValueChange={(value) => onChange({ ...currentTheme, buttonRadius: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Aucun (carré)</SelectItem>
                    <SelectItem value="0.25rem">Léger (4px)</SelectItem>
                    <SelectItem value="0.5rem">Moyen (8px)</SelectItem>
                    <SelectItem value="0.75rem">Arrondi (12px)</SelectItem>
                    <SelectItem value="1rem">Très arrondi (16px)</SelectItem>
                    <SelectItem value="9999px">Pilule</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Épaisseur des bordures</Label>
                <Select
                  value={currentTheme.borderWidth}
                  onValueChange={(value) => onChange({ ...currentTheme, borderWidth: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0px">Aucune</SelectItem>
                    <SelectItem value="1px">Fine (1px)</SelectItem>
                    <SelectItem value="2px">Moyenne (2px)</SelectItem>
                    <SelectItem value="3px">Épaisse (3px)</SelectItem>
                    <SelectItem value="4px">Très épaisse (4px)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Preview Box */}
            <div className="mt-6 p-6 border-2 rounded-lg" style={{
              backgroundColor: currentTheme.backgroundColor,
              borderColor: currentTheme.accentColor,
              color: currentTheme.textColor,
              fontFamily: currentTheme.fontFamily
            }}>
              <h3 className="text-lg font-semibold mb-3" style={{ color: currentTheme.primaryColor }}>
                Aperçu du style
              </h3>
              <p className="mb-4" style={{ color: currentTheme.textColor }}>
                Ceci est un exemple de texte avec le thème personnalisé.
              </p>
              <button
                className="px-4 py-2 text-white transition-all hover:opacity-90"
                style={{
                  backgroundColor: currentTheme.primaryColor,
                  borderRadius: currentTheme.buttonRadius,
                  border: `${currentTheme.borderWidth} solid ${currentTheme.primaryColor}`
                }}
              >
                Bouton d&apos;exemple
              </button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
