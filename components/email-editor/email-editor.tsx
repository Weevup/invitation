"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Plus, Eye, Code, Settings, Trash2, ChevronUp, ChevronDown,
  Type, MousePointer, Image as ImageIcon, Minus, Columns, Info, Space
} from 'lucide-react'
import {
  EmailBlock,
  EmailBlockType,
  EmailTemplate,
  DEFAULT_BLOCKS,
  blocksToHTML
} from './block-types'
import { BlockEditor } from './block-editor'

interface EmailEditorProps {
  initialTemplate?: EmailTemplate
  onChange?: (template: EmailTemplate) => void
}

const BLOCK_ICONS: Record<EmailBlockType, any> = {
  header: Type,
  text: Type,
  button: MousePointer,
  image: ImageIcon,
  divider: Minus,
  spacer: Space,
  twoColumn: Columns,
  infoBox: Info,
}

const BLOCK_LABELS: Record<EmailBlockType, string> = {
  header: 'En-tête',
  text: 'Texte',
  button: 'Bouton',
  image: 'Image',
  divider: 'Séparateur',
  spacer: 'Espace',
  twoColumn: '2 Colonnes',
  infoBox: 'Info Box',
}

export function EmailEditor({ initialTemplate, onChange }: EmailEditorProps) {
  const [template, setTemplate] = useState<EmailTemplate>(
    initialTemplate || {
      id: 'default',
      name: 'Mon Email',
      blocks: [],
      globalStyles: {
        fontFamily: 'Arial',
        primaryColor: '#004645',
        secondaryColor: '#009197',
        backgroundColor: '#F5F5F5',
        containerWidth: 600,
      },
    }
  )

  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null)
  const [previewMode, setPreviewMode] = useState<'edit' | 'preview' | 'html'>('edit')

  const updateTemplate = (updates: Partial<EmailTemplate>) => {
    const newTemplate = { ...template, ...updates }
    setTemplate(newTemplate)
    onChange?.(newTemplate)
  }

  const addBlock = (type: EmailBlockType) => {
    const defaultBlock = DEFAULT_BLOCKS[type]
    const newBlock: EmailBlock = {
      ...defaultBlock,
      id: `${type}-${Date.now()}`,
      order: template.blocks.length,
    } as EmailBlock

    updateTemplate({
      blocks: [...template.blocks, newBlock],
    })
    setSelectedBlockId(newBlock.id)
  }

  const updateBlock = (blockId: string, updates: Partial<EmailBlock>) => {
    updateTemplate({
      blocks: template.blocks.map(block =>
        block.id === blockId ? { ...block, ...updates } as EmailBlock : block
      ),
    })
  }

  const deleteBlock = (blockId: string) => {
    updateTemplate({
      blocks: template.blocks.filter(block => block.id !== blockId),
    })
    if (selectedBlockId === blockId) {
      setSelectedBlockId(null)
    }
  }

  const moveBlock = (blockId: string, direction: 'up' | 'down') => {
    const index = template.blocks.findIndex(b => b.id === blockId)
    if (index === -1) return

    const newBlocks = [...template.blocks]
    const targetIndex = direction === 'up' ? index - 1 : index + 1

    if (targetIndex < 0 || targetIndex >= newBlocks.length) return

    // Swap
    ;[newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]]

    // Update orders
    newBlocks.forEach((block, i) => {
      block.order = i
    })

    updateTemplate({ blocks: newBlocks })
  }

  const duplicateBlock = (blockId: string) => {
    const block = template.blocks.find(b => b.id === blockId)
    if (!block) return

    const newBlock: EmailBlock = {
      ...JSON.parse(JSON.stringify(block)),
      id: `${block.type}-${Date.now()}`,
      order: template.blocks.length,
    }

    updateTemplate({
      blocks: [...template.blocks, newBlock],
    })
  }

  const selectedBlock = template.blocks.find(b => b.id === selectedBlockId)

  return (
    <div className="grid grid-cols-12 gap-6 h-[calc(100vh-200px)]">
      {/* Left Panel: Block List & Add */}
      <div className="col-span-3 space-y-4 overflow-y-auto">
        <Card className="border-[#9CD9F6]/30">
          <CardHeader>
            <CardTitle className="text-sm text-[#004645]">Ajouter un Bloc</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(BLOCK_LABELS).map(([type, label]) => {
              const Icon = BLOCK_ICONS[type as EmailBlockType]
              return (
                <Button
                  key={type}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start border-[#9CD9F6]/30 hover:bg-[#9CD9F6]/10"
                  onClick={() => addBlock(type as EmailBlockType)}
                >
                  <Icon className="h-4 w-4 mr-2 text-[#009197]" />
                  {label}
                </Button>
              )
            })}
          </CardContent>
        </Card>

        <Card className="border-[#9CD9F6]/30">
          <CardHeader>
            <CardTitle className="text-sm text-[#004645]">
              Blocs ({template.blocks.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {template.blocks.length === 0 ? (
              <p className="text-sm text-[#004645]/70 text-center py-4">
                Aucun bloc. Ajoutez-en un ci-dessus.
              </p>
            ) : (
              template.blocks.map((block, index) => {
                const Icon = BLOCK_ICONS[block.type]
                const isSelected = selectedBlockId === block.id

                return (
                  <div
                    key={block.id}
                    className={`p-2 border rounded-lg cursor-pointer transition-colors ${
                      isSelected
                        ? 'border-[#009197] bg-[#9CD9F6]/10'
                        : 'border-[#9CD9F6]/30 hover:border-[#009197]/50'
                    }`}
                    onClick={() => setSelectedBlockId(block.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-[#009197]" />
                        <span className="text-sm font-medium text-[#004645]">
                          {BLOCK_LABELS[block.type]}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            moveBlock(block.id, 'up')
                          }}
                          disabled={index === 0}
                        >
                          <ChevronUp className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            moveBlock(block.id, 'down')
                          }}
                          disabled={index === template.blocks.length - 1}
                        >
                          <ChevronDown className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteBlock(block.id)
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>

        {/* Global Styles */}
        <Card className="border-[#9CD9F6]/30">
          <CardHeader>
            <CardTitle className="text-sm text-[#004645] flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Styles Globaux
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-xs text-[#004645]/70">Couleur Principale</Label>
              <Input
                type="color"
                value={template.globalStyles.primaryColor}
                onChange={(e) =>
                  updateTemplate({
                    globalStyles: { ...template.globalStyles, primaryColor: e.target.value },
                  })
                }
                className="h-8 w-full"
              />
            </div>
            <div>
              <Label className="text-xs text-[#004645]/70">Couleur Secondaire</Label>
              <Input
                type="color"
                value={template.globalStyles.secondaryColor}
                onChange={(e) =>
                  updateTemplate({
                    globalStyles: { ...template.globalStyles, secondaryColor: e.target.value },
                  })
                }
                className="h-8 w-full"
              />
            </div>
            <div>
              <Label className="text-xs text-[#004645]/70">Arrière-plan</Label>
              <Input
                type="color"
                value={template.globalStyles.backgroundColor}
                onChange={(e) =>
                  updateTemplate({
                    globalStyles: { ...template.globalStyles, backgroundColor: e.target.value },
                  })
                }
                className="h-8 w-full"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Middle Panel: Block Editor or Preview */}
      <div className="col-span-6 overflow-y-auto">
        <Card className="border-[#9CD9F6]/30 h-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-[#004645]">
                {previewMode === 'edit' && selectedBlock
                  ? `Éditer: ${BLOCK_LABELS[selectedBlock.type]}`
                  : previewMode === 'preview'
                  ? 'Aperçu Email'
                  : 'Code HTML'}
              </CardTitle>
              <Tabs value={previewMode} onValueChange={(v) => setPreviewMode(v as any)} className="w-auto">
                <TabsList className="bg-[#9CD9F6]/20">
                  <TabsTrigger value="edit">
                    <Settings className="h-4 w-4 mr-1" />
                    Éditer
                  </TabsTrigger>
                  <TabsTrigger value="preview">
                    <Eye className="h-4 w-4 mr-1" />
                    Aperçu
                  </TabsTrigger>
                  <TabsTrigger value="html">
                    <Code className="h-4 w-4 mr-1" />
                    HTML
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            {previewMode === 'edit' && selectedBlock && (
              <BlockEditor
                block={selectedBlock}
                globalStyles={template.globalStyles}
                onChange={(updates) => updateBlock(selectedBlock.id, updates)}
              />
            )}

            {previewMode === 'edit' && !selectedBlock && (
              <div className="text-center py-12 text-[#004645]/70">
                <Settings className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p className="font-medium mb-2">Aucun bloc sélectionné</p>
                <p className="text-sm">
                  Sélectionnez un bloc dans la liste de gauche ou ajoutez-en un nouveau
                </p>
              </div>
            )}

            {previewMode === 'preview' && (
              <div className="border border-[#9CD9F6]/30 rounded-lg overflow-hidden">
                <iframe
                  srcDoc={blocksToHTML(template)}
                  className="w-full h-[600px] bg-white"
                  title="Email Preview"
                />
              </div>
            )}

            {previewMode === 'html' && (
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto text-xs max-h-[600px]">
                {blocksToHTML(template)}
              </pre>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right Panel: Live Preview */}
      <div className="col-span-3 overflow-y-auto">
        <Card className="border-[#9CD9F6]/30">
          <CardHeader>
            <CardTitle className="text-sm text-[#004645]">Prévisualisation Live</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border border-[#9CD9F6]/30 rounded-lg overflow-hidden">
              <iframe
                srcDoc={blocksToHTML(template)}
                className="w-full h-[700px] bg-white scale-75 origin-top-left"
                style={{ width: '133.33%', height: '933px' }}
                title="Live Preview"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
