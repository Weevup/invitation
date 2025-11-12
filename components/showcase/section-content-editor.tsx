"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Plus, Trash2, FileText } from 'lucide-react'
import { Switch } from '@/components/ui/switch'

export interface ButtonConfig {
  text: string
  link: string
  style: 'primary' | 'secondary' | 'outline'
}

export interface SectionContent {
  title?: string
  subtitle?: string
  description?: string
  image?: string
  buttons?: ButtonConfig[]
  customHTML?: string
}

export interface SectionContents {
  [sectionId: string]: SectionContent
}

interface SectionContentEditorProps {
  sectionId: string
  sectionType: string
  content: SectionContent
  onChange: (content: SectionContent) => void
}

export function SectionContentEditor({ sectionId, sectionType, content, onChange }: SectionContentEditorProps) {
  const updateContent = (updates: Partial<SectionContent>) => {
    onChange({ ...content, ...updates })
  }

  const addButton = () => {
    const buttons = content.buttons || []
    buttons.push({ text: 'Nouveau bouton', link: '#', style: 'primary' })
    updateContent({ buttons })
  }

  const updateButton = (index: number, updates: Partial<ButtonConfig>) => {
    const buttons = [...(content.buttons || [])]
    buttons[index] = { ...buttons[index], ...updates }
    updateContent({ buttons })
  }

  const removeButton = (index: number) => {
    const buttons = content.buttons?.filter((_, i) => i !== index) || []
    updateContent({ buttons })
  }

  // Skip content editor for sections that have their own specialized editors
  const skipContentEditor = ['gallery', 'faq', 'speakers', 'sponsors', 'timeline', 'program', 'countdown']
  if (skipContentEditor.includes(sectionType)) {
    return null
  }

  return (
    <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur">
      <CardHeader>
        <CardTitle className="text-[#004645] flex items-center gap-2">
          <FileText className="h-5 w-5 text-[#009197]" />
          Contenu de la section
        </CardTitle>
        <CardDescription>
          Personnalisez le texte et les éléments de cette section
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Titre */}
        <div className="space-y-2">
          <Label htmlFor={`${sectionId}-title`} className="text-[#004645]">
            Titre personnalisé
          </Label>
          <Input
            id={`${sectionId}-title`}
            value={content.title || ''}
            onChange={(e) => updateContent({ title: e.target.value })}
            placeholder="Laissez vide pour utiliser le titre par défaut"
            className="border-[#9CD9F6]/30"
          />
          <p className="text-xs text-[#004645]/60">
            Titre principal affiché dans cette section
          </p>
        </div>

        {/* Sous-titre */}
        <div className="space-y-2">
          <Label htmlFor={`${sectionId}-subtitle`} className="text-[#004645]">
            Sous-titre
          </Label>
          <Input
            id={`${sectionId}-subtitle`}
            value={content.subtitle || ''}
            onChange={(e) => updateContent({ subtitle: e.target.value })}
            placeholder="Un sous-titre accrocheur..."
            className="border-[#9CD9F6]/30"
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor={`${sectionId}-description`} className="text-[#004645]">
            Description / Contenu
          </Label>
          <Textarea
            id={`${sectionId}-description`}
            value={content.description || ''}
            onChange={(e) => updateContent({ description: e.target.value })}
            placeholder="Décrivez cette section..."
            className="border-[#9CD9F6]/30 min-h-[120px]"
          />
          <p className="text-xs text-[#004645]/60">
            Supporte le Markdown de base et les sauts de ligne
          </p>
        </div>

        {/* Image */}
        <div className="space-y-2">
          <Label htmlFor={`${sectionId}-image`} className="text-[#004645]">
            Image (URL)
          </Label>
          <Input
            id={`${sectionId}-image`}
            value={content.image || ''}
            onChange={(e) => updateContent({ image: e.target.value })}
            placeholder="https://exemple.com/image.jpg"
            className="border-[#9CD9F6]/30"
          />
          {content.image && (
            <div className="mt-2">
              <img
                src={content.image}
                alt="Preview"
                className="max-w-xs rounded-lg border border-[#9CD9F6]/30"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            </div>
          )}
        </div>

        {/* Boutons CTA */}
        <div className="space-y-3 pt-4 border-t border-[#9CD9F6]/30">
          <div className="flex items-center justify-between">
            <Label className="text-[#004645]">Boutons d&apos;action</Label>
            <Button
              size="sm"
              variant="outline"
              onClick={addButton}
              className="border-[#009197] text-[#009197] hover:bg-[#009197]/10"
            >
              <Plus className="h-4 w-4 mr-1" />
              Ajouter
            </Button>
          </div>

          {content.buttons?.map((button, index) => (
            <Card key={index} className="border-[#9CD9F6]/20">
              <CardContent className="pt-4 space-y-3">
                <div className="flex items-start gap-2">
                  <div className="flex-1 space-y-3">
                    <div>
                      <Label className="text-xs">Texte du bouton</Label>
                      <Input
                        value={button.text}
                        onChange={(e) => updateButton(index, { text: e.target.value })}
                        placeholder="En savoir plus"
                        className="border-[#9CD9F6]/30"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Lien</Label>
                      <Input
                        value={button.link}
                        onChange={(e) => updateButton(index, { link: e.target.value })}
                        placeholder="https://..."
                        className="border-[#9CD9F6]/30"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Style</Label>
                      <select
                        value={button.style}
                        onChange={(e) => updateButton(index, { style: e.target.value as any })}
                        className="w-full h-10 px-3 rounded-md border border-[#9CD9F6]/30 bg-white"
                      >
                        <option value="primary">Principal (rempli)</option>
                        <option value="secondary">Secondaire</option>
                        <option value="outline">Contour</option>
                      </select>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeButton(index)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {(!content.buttons || content.buttons.length === 0) && (
            <p className="text-sm text-[#004645]/60 text-center py-4">
              Aucun bouton. Cliquez sur &quot;Ajouter&quot; pour créer un appel à l&apos;action.
            </p>
          )}
        </div>

        {/* HTML personnalisé (avancé) */}
        <details className="space-y-2 pt-4 border-t border-[#9CD9F6]/30">
          <summary className="cursor-pointer text-sm font-medium text-[#004645] hover:text-[#009197]">
            HTML personnalisé (avancé)
          </summary>
          <Textarea
            value={content.customHTML || ''}
            onChange={(e) => updateContent({ customHTML: e.target.value })}
            placeholder="<div>HTML personnalisé...</div>"
            className="border-[#9CD9F6]/30 font-mono text-sm min-h-[100px] mt-2"
          />
          <p className="text-xs text-[#004645]/60">
            Utilisez du HTML personnalisé pour un contrôle total. Sera affiché après le contenu principal.
          </p>
        </details>
      </CardContent>
    </Card>
  )
}
