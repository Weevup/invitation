"use client"

import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import {
  Type,
  Image,
  QrCode,
  Building2,
  Briefcase,
  Mail,
  Calendar,
  Plus,
  Trash2,
  Move,
  Settings,
} from 'lucide-react'
import { BadgeField, BadgeFieldType, BADGE_SIZES, mmToPx, pxToMm } from '@/lib/badge-generator'
import { cn } from '@/lib/utils'

interface BadgeDesignerProps {
  size: keyof typeof BADGE_SIZES
  orientation: 'PORTRAIT' | 'LANDSCAPE'
  fields: BadgeField[]
  onFieldsChange: (fields: BadgeField[]) => void
  backgroundColor?: string
}

const FIELD_TYPE_OPTIONS: Array<{
  value: BadgeFieldType
  label: string
  icon: any
  color: string
}> = [
  { value: 'FULL_NAME', label: 'Nom complet', icon: Type, color: '#3B82F6' },
  { value: 'FIRST_NAME', label: 'Prénom', icon: Type, color: '#8B5CF6' },
  { value: 'LAST_NAME', label: 'Nom', icon: Type, color: '#6366F1' },
  { value: 'COMPANY', label: 'Entreprise', icon: Building2, color: '#10B981' },
  { value: 'JOB_TITLE', label: 'Fonction', icon: Briefcase, color: '#F59E0B' },
  { value: 'EMAIL', label: 'Email', icon: Mail, color: '#EF4444' },
  { value: 'QR_CODE', label: 'QR Code', icon: QrCode, color: '#000000' },
  { value: 'PHOTO', label: 'Photo', icon: Image, color: '#EC4899' },
  { value: 'EVENT_NAME', label: 'Nom événement', icon: Calendar, color: '#14B8A6' },
  { value: 'EVENT_DATE', label: 'Date événement', icon: Calendar, color: '#06B6D4' },
  { value: 'CUSTOM_TEXT', label: 'Texte personnalisé', icon: Type, color: '#64748B' },
]

export function BadgeDesigner({
  size,
  orientation,
  fields,
  onFieldsChange,
  backgroundColor = '#ffffff',
}: BadgeDesignerProps) {
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [draggedFieldId, setDraggedFieldId] = useState<string | null>(null)
  const canvasRef = useRef<HTMLDivElement>(null)

  const badgeSize = BADGE_SIZES[size]
  const { width, height } =
    orientation === 'LANDSCAPE'
      ? { width: badgeSize.height, height: badgeSize.width }
      : badgeSize

  // Convert mm to pixels for display (scale to fit canvas)
  const canvasWidth = 600
  const scale = canvasWidth / mmToPx(width)
  const canvasHeight = (mmToPx(height) * scale)

  const selectedField = fields.find((f) => f.id === selectedFieldId)

  // Add new field
  const handleAddField = (type: BadgeFieldType) => {
    const newField: BadgeField = {
      id: `field-${Date.now()}`,
      type,
      x: mmToPx(width) / 2,
      y: mmToPx(height) / 2,
      fontSize: type === 'QR_CODE' || type === 'PHOTO' ? undefined : 24,
      fontWeight: 'normal',
      fontStyle: 'normal',
      color: '#000000',
      textAlign: 'center',
      size: type === 'QR_CODE' || type === 'PHOTO' ? 200 : undefined,
      width: type === 'PHOTO' ? 200 : undefined,
      height: type === 'PHOTO' ? 200 : undefined,
      customText: type === 'CUSTOM_TEXT' ? 'Custom Text' : undefined,
    }

    onFieldsChange([...fields, newField])
    setSelectedFieldId(newField.id)
  }

  // Delete field
  const handleDeleteField = (id: string) => {
    onFieldsChange(fields.filter((f) => f.id !== id))
    if (selectedFieldId === id) {
      setSelectedFieldId(null)
    }
  }

  // Update field
  const handleUpdateField = (id: string, updates: Partial<BadgeField>) => {
    onFieldsChange(
      fields.map((f) => (f.id === id ? { ...f, ...updates } : f))
    )
  }

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent, fieldId: string) => {
    if (e.button !== 0) return // Left click only
    setIsDragging(true)
    setDraggedFieldId(fieldId)
    setSelectedFieldId(fieldId)
    e.preventDefault()
  }

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging || !draggedFieldId || !canvasRef.current) return

      const canvas = canvasRef.current
      const rect = canvas.getBoundingClientRect()

      // Calculate position relative to canvas
      const canvasX = e.clientX - rect.left
      const canvasY = e.clientY - rect.top

      // Convert to badge coordinates (unscale)
      const badgeX = canvasX / scale
      const badgeY = canvasY / scale

      // Update field position
      handleUpdateField(draggedFieldId, {
        x: Math.max(0, Math.min(badgeX, mmToPx(width))),
        y: Math.max(0, Math.min(badgeY, mmToPx(height))),
      })
    },
    [isDragging, draggedFieldId, scale, width, height]
  )

  const handleMouseUp = () => {
    setIsDragging(false)
    setDraggedFieldId(null)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Toolbar - Add Fields */}
      <div className="space-y-4">
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold text-[#004645] mb-3 flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Ajouter un champ
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {FIELD_TYPE_OPTIONS.map((option) => {
                const Icon = option.icon
                return (
                  <Button
                    key={option.value}
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddField(option.value)}
                    className="flex items-center justify-start gap-2 h-auto py-2"
                  >
                    <Icon className="h-4 w-4" style={{ color: option.color }} />
                    <span className="text-xs">{option.label}</span>
                  </Button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Field Properties */}
        {selectedField && (
          <Card className="border-[#009197]">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-[#004645] flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Propriétés
                </h3>
                <Button
                  variant="destructive"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleDeleteField(selectedField.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-3">
                <div>
                  <Label className="text-xs">Type</Label>
                  <Badge variant="secondary" className="mt-1">
                    {FIELD_TYPE_OPTIONS.find((o) => o.value === selectedField.type)?.label}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">X (px)</Label>
                    <Input
                      type="number"
                      value={Math.round(selectedField.x)}
                      onChange={(e) =>
                        handleUpdateField(selectedField.id, { x: Number(e.target.value) })
                      }
                      className="h-8"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Y (px)</Label>
                    <Input
                      type="number"
                      value={Math.round(selectedField.y)}
                      onChange={(e) =>
                        handleUpdateField(selectedField.id, { y: Number(e.target.value) })
                      }
                      className="h-8"
                    />
                  </div>
                </div>

                {(selectedField.type !== 'QR_CODE' && selectedField.type !== 'PHOTO') && (
                  <>
                    <div>
                      <Label className="text-xs">Taille du texte</Label>
                      <Slider
                        value={[selectedField.fontSize || 16]}
                        onValueChange={([fontSize]) =>
                          handleUpdateField(selectedField.id, { fontSize })
                        }
                        min={8}
                        max={72}
                        step={1}
                        className="mt-2"
                      />
                      <span className="text-xs text-muted-foreground">{selectedField.fontSize || 16}px</span>
                    </div>

                    <div>
                      <Label className="text-xs">Style</Label>
                      <Select
                        value={selectedField.fontWeight || 'normal'}
                        onValueChange={(fontWeight: any) =>
                          handleUpdateField(selectedField.id, { fontWeight })
                        }
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="bold">Gras</SelectItem>
                          <SelectItem value="bolder">Extra gras</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-xs">Couleur</Label>
                      <Input
                        type="color"
                        value={selectedField.color || '#000000'}
                        onChange={(e) =>
                          handleUpdateField(selectedField.id, { color: e.target.value })
                        }
                        className="h-8"
                      />
                    </div>

                    <div>
                      <Label className="text-xs">Alignement</Label>
                      <Select
                        value={selectedField.textAlign || 'center'}
                        onValueChange={(textAlign: any) =>
                          handleUpdateField(selectedField.id, { textAlign })
                        }
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="left">Gauche</SelectItem>
                          <SelectItem value="center">Centre</SelectItem>
                          <SelectItem value="right">Droite</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedField.type === 'CUSTOM_TEXT' && (
                      <div>
                        <Label className="text-xs">Texte</Label>
                        <Input
                          value={selectedField.customText || ''}
                          onChange={(e) =>
                            handleUpdateField(selectedField.id, { customText: e.target.value })
                          }
                          className="h-8"
                        />
                      </div>
                    )}
                  </>
                )}

                {(selectedField.type === 'QR_CODE' || selectedField.type === 'PHOTO') && (
                  <div>
                    <Label className="text-xs">Taille</Label>
                    <Slider
                      value={[selectedField.size || selectedField.width || 200]}
                      onValueChange={([size]) => {
                        if (selectedField.type === 'PHOTO') {
                          handleUpdateField(selectedField.id, { width: size, height: size })
                        } else {
                          handleUpdateField(selectedField.id, { size })
                        }
                      }}
                      min={50}
                      max={400}
                      step={10}
                      className="mt-2"
                    />
                    <span className="text-xs text-muted-foreground">
                      {selectedField.size || selectedField.width || 200}px
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Canvas - Badge Preview */}
      <div className="lg:col-span-2">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[#004645] flex items-center gap-2">
                <Move className="h-5 w-5" />
                Canvas - Glissez pour positionner
              </h3>
              <Badge variant="secondary">
                {fields.length} champ{fields.length > 1 ? 's' : ''}
              </Badge>
            </div>

            <div
              ref={canvasRef}
              className="relative mx-auto border-2 border-dashed border-gray-300 rounded-lg overflow-hidden"
              style={{
                width: `${canvasWidth}px`,
                height: `${canvasHeight}px`,
                backgroundColor,
              }}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {/* Grid background */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage: `
                    linear-gradient(to right, #e5e7eb 1px, transparent 1px),
                    linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
                  `,
                  backgroundSize: `${20 * scale}px ${20 * scale}px`,
                }}
              />

              {/* Render fields */}
              {fields.map((field) => {
                const isSelected = field.id === selectedFieldId
                const fieldOption = FIELD_TYPE_OPTIONS.find((o) => o.value === field.type)

                return (
                  <div
                    key={field.id}
                    className={cn(
                      'absolute cursor-move border-2 transition-colors',
                      isSelected ? 'border-[#009197] bg-[#009197]/10' : 'border-transparent hover:border-[#9CD9F6]'
                    )}
                    style={{
                      left: `${field.x * scale}px`,
                      top: `${field.y * scale}px`,
                      transform: 'translate(-50%, -50%)',
                    }}
                    onMouseDown={(e) => handleMouseDown(e, field.id)}
                  >
                    <div
                      className="p-2 text-center flex items-center justify-center gap-1"
                      style={{
                        fontSize: `${(field.fontSize || 16) * scale}px`,
                        color: field.color,
                        fontWeight: field.fontWeight,
                        minWidth: field.type === 'QR_CODE' || field.type === 'PHOTO'
                          ? `${(field.size || field.width || 200) * scale}px`
                          : 'auto',
                        minHeight: field.type === 'QR_CODE' || field.type === 'PHOTO'
                          ? `${(field.size || field.height || 200) * scale}px`
                          : 'auto',
                      }}
                    >
                      {fieldOption && <fieldOption.icon className="h-4 w-4" style={{ color: fieldOption.color }} />}
                      <span className="text-xs font-mono">{fieldOption?.label}</span>
                    </div>
                  </div>
                )
              })}
            </div>

            <p className="text-xs text-muted-foreground text-center mt-4">
              Cliquez sur un champ pour le sélectionner, puis glissez-le pour le déplacer
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
