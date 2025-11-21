"use client"

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Upload, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { createClientLogger } from '@/lib/client-logger'
import {
  EmailBlock,
  HeaderBlock,
  TextBlock,
  ButtonBlock,
  ImageBlock,
  DividerBlock,
  SpacerBlock,
  TwoColumnBlock,
  InfoBoxBlock,
  EmailTemplate
} from './block-types'

const logger = createClientLogger({ component: 'BlockEditor' })

interface BlockEditorProps {
  block: EmailBlock
  globalStyles: EmailTemplate['globalStyles']
  onChange: (updates: Partial<EmailBlock>) => void
}

export function BlockEditor({ block, globalStyles, onChange }: BlockEditorProps) {
  const updateContent = (key: string, value: any) => {
    onChange({
      content: {
        ...block.content,
        [key]: value,
      },
    } as any)
  }

  switch (block.type) {
    case 'header':
      return <HeaderBlockEditor block={block} updateContent={updateContent} />
    case 'text':
      return <TextBlockEditor block={block} updateContent={updateContent} />
    case 'button':
      return <ButtonBlockEditor block={block} updateContent={updateContent} />
    case 'image':
      return <ImageBlockEditor block={block} updateContent={updateContent} />
    case 'divider':
      return <DividerBlockEditor block={block} updateContent={updateContent} />
    case 'spacer':
      return <SpacerBlockEditor block={block} updateContent={updateContent} />
    case 'twoColumn':
      return <TwoColumnBlockEditor block={block} updateContent={updateContent} />
    case 'infoBox':
      return <InfoBoxBlockEditor block={block} updateContent={updateContent} />
    default:
      return <div>Type de bloc non supporté</div>
  }
}

function HeaderBlockEditor({
  block,
  updateContent,
}: {
  block: HeaderBlock
  updateContent: (key: string, value: any) => void
}) {
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingBg, setUploadingBg] = useState(false)

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image valide')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('L\'image est trop grande (max 5MB)')
      return
    }

    setUploadingLogo(true)

    try {
      const formData = new FormData()
      formData.append('image', file)

      const response = await fetch('/api/admin/upload-image', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Échec de l\'upload')
      }

      const data = await response.json()
      updateContent('logoUrl', data.url)
      toast.success('Logo téléchargé avec succès')
    } catch (error) {
      logger.error(error, { action: 'uploadLogo' })
      toast.error(error instanceof Error ? error.message : 'Erreur lors de l\'upload')
    } finally {
      setUploadingLogo(false)
    }
  }

  const handleBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image valide')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('L\'image est trop grande (max 5MB)')
      return
    }

    setUploadingBg(true)

    try {
      const formData = new FormData()
      formData.append('image', file)

      const response = await fetch('/api/admin/upload-image', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Échec de l\'upload')
      }

      const data = await response.json()
      updateContent('backgroundImage', data.url)
      toast.success('Image de fond téléchargée avec succès')
    } catch (error) {
      logger.error(error, { action: 'uploadBackground' })
      toast.error(error instanceof Error ? error.message : 'Erreur lors de l\'upload')
    } finally {
      setUploadingBg(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <Label>Titre</Label>
        <Input
          value={block.content.title}
          onChange={(e) => updateContent('title', e.target.value)}
          placeholder="Titre de l'en-tête"
        />
      </div>

      <div>
        <Label>Sous-titre (optionnel)</Label>
        <Input
          value={block.content.subtitle || ''}
          onChange={(e) => updateContent('subtitle', e.target.value)}
          placeholder="Sous-titre"
        />
      </div>

      <div>
        <Label>Logo (optionnel)</Label>
        <div className="flex gap-2">
          <Input
            value={block.content.logoUrl || ''}
            onChange={(e) => updateContent('logoUrl', e.target.value)}
            placeholder="https://example.com/logo.png ou uploadez"
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById('logo-upload-input')?.click()}
            disabled={uploadingLogo}
          >
            {uploadingLogo ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
          </Button>
          <input
            id="logo-upload-input"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleLogoUpload}
          />
        </div>
      </div>

      <div>
        <Label>Image d&apos;arrière-plan (optionnel)</Label>
        <div className="flex gap-2">
          <Input
            value={block.content.backgroundImage || ''}
            onChange={(e) => updateContent('backgroundImage', e.target.value)}
            placeholder="https://example.com/bg.jpg ou uploadez"
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById('bg-upload-input')?.click()}
            disabled={uploadingBg}
          >
            {uploadingBg ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
          </Button>
          <input
            id="bg-upload-input"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleBgUpload}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Couleur de fond</Label>
          <Input
            type="color"
            value={block.content.backgroundColor}
            onChange={(e) => updateContent('backgroundColor', e.target.value)}
          />
        </div>
        <div>
          <Label>Couleur du texte</Label>
          <Input
            type="color"
            value={block.content.textColor}
            onChange={(e) => updateContent('textColor', e.target.value)}
          />
        </div>
      </div>

      <div>
        <Label>Alignement</Label>
        <Select value={block.content.align} onValueChange={(v) => updateContent('align', v)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="left">Gauche</SelectItem>
            <SelectItem value="center">Centre</SelectItem>
            <SelectItem value="right">Droite</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

function TextBlockEditor({
  block,
  updateContent,
}: {
  block: TextBlock
  updateContent: (key: string, value: any) => void
}) {
  return (
    <div className="space-y-4">
      <div>
        <Label>Contenu HTML</Label>
        <Textarea
          value={block.content.html}
          onChange={(e) => updateContent('html', e.target.value)}
          rows={8}
          className="font-mono text-sm"
          placeholder="<p>Votre texte ici...</p>"
        />
        <p className="text-xs text-[#004645]/70 mt-1">
          Vous pouvez utiliser des balises HTML: &lt;p&gt;, &lt;strong&gt;, &lt;em&gt;, &lt;br&gt;
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Taille de police</Label>
          <Select value={block.content.fontSize} onValueChange={(v) => updateContent('fontSize', v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="small">Petit</SelectItem>
              <SelectItem value="medium">Moyen</SelectItem>
              <SelectItem value="large">Grand</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Padding</Label>
          <Select value={block.content.padding} onValueChange={(v) => updateContent('padding', v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Aucun</SelectItem>
              <SelectItem value="small">Petit</SelectItem>
              <SelectItem value="medium">Moyen</SelectItem>
              <SelectItem value="large">Grand</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Couleur</Label>
          <Input
            type="color"
            value={block.content.color}
            onChange={(e) => updateContent('color', e.target.value)}
          />
        </div>
        <div>
          <Label>Alignement</Label>
          <Select value={block.content.align} onValueChange={(v) => updateContent('align', v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="left">Gauche</SelectItem>
              <SelectItem value="center">Centre</SelectItem>
              <SelectItem value="right">Droite</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}

function ButtonBlockEditor({
  block,
  updateContent,
}: {
  block: ButtonBlock
  updateContent: (key: string, value: any) => void
}) {
  return (
    <div className="space-y-4">
      <div>
        <Label>Texte du bouton</Label>
        <Input
          value={block.content.text}
          onChange={(e) => updateContent('text', e.target.value)}
          placeholder="Cliquez ici"
        />
      </div>

      <div>
        <Label>URL de destination</Label>
        <Input
          value={block.content.url}
          onChange={(e) => updateContent('url', e.target.value)}
          placeholder="https://example.com ou {{rsvpLink}}"
        />
        <div className="mt-2 space-y-2">
          <p className="text-xs font-semibold text-[#004645]">💡 Liens dynamiques :</p>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs h-7"
              onClick={() => updateContent('url', '{{rsvpLink}}')}
            >
              Lien RSVP
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs h-7"
              onClick={() => updateContent('url', '{{showcaseLink}}')}
            >
              Page événement
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs h-7"
              onClick={() => updateContent('url', '{{unsubscribeLink}}')}
            >
              Désinscription
            </Button>
          </div>
          <p className="text-xs text-[#004645]/70 italic">
            Ces variables seront automatiquement remplacées par les liens personnalisés lors de l&apos;envoi
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Couleur de fond</Label>
          <Input
            type="color"
            value={block.content.backgroundColor}
            onChange={(e) => updateContent('backgroundColor', e.target.value)}
          />
        </div>
        <div>
          <Label>Couleur du texte</Label>
          <Input
            type="color"
            value={block.content.textColor}
            onChange={(e) => updateContent('textColor', e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label>Taille</Label>
          <Select value={block.content.size} onValueChange={(v) => updateContent('size', v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="small">Petit</SelectItem>
              <SelectItem value="medium">Moyen</SelectItem>
              <SelectItem value="large">Grand</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Bords</Label>
          <Select value={block.content.borderRadius} onValueChange={(v) => updateContent('borderRadius', v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="square">Carré</SelectItem>
              <SelectItem value="rounded">Arrondi</SelectItem>
              <SelectItem value="pill">Pilule</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Alignement</Label>
          <Select value={block.content.align} onValueChange={(v) => updateContent('align', v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="left">Gauche</SelectItem>
              <SelectItem value="center">Centre</SelectItem>
              <SelectItem value="right">Droite</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}

function ImageBlockEditor({
  block,
  updateContent,
}: {
  block: ImageBlock
  updateContent: (key: string, value: any) => void
}) {
  const [uploading, setUploading] = useState(false)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image valide')
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('L\'image est trop grande (max 5MB)')
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('image', file)

      const response = await fetch('/api/admin/upload-image', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Échec de l\'upload')
      }

      const data = await response.json()
      updateContent('url', data.url)
      toast.success('Image téléchargée avec succès')
    } catch (error) {
      logger.error(error, { action: 'uploadImage' })
      toast.error(error instanceof Error ? error.message : 'Erreur lors de l\'upload')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <Label>Image</Label>
        <div className="flex gap-2">
          <Input
            value={block.content.url}
            onChange={(e) => updateContent('url', e.target.value)}
            placeholder="https://example.com/image.jpg ou uploadez une image"
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById('image-upload-input')?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
          </Button>
          <input
            id="image-upload-input"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
        </div>
        <p className="text-xs text-[#004645]/70 mt-1">
          Collez une URL ou cliquez sur le bouton pour uploader une image (max 5MB)
        </p>
      </div>

      {block.content.url && (
        <div className="border rounded-lg p-2 bg-gray-50">
          <img
            src={block.content.url}
            alt="Preview"
            className="max-h-32 mx-auto"
            onError={(e) => {
              e.currentTarget.src = ''
              e.currentTarget.alt = 'Erreur de chargement'
            }}
          />
        </div>
      )}

      <div>
        <Label>Texte alternatif</Label>
        <Input
          value={block.content.alt}
          onChange={(e) => updateContent('alt', e.target.value)}
          placeholder="Description de l'image"
        />
      </div>

      <div>
        <Label>Lien (optionnel)</Label>
        <Input
          value={block.content.link || ''}
          onChange={(e) => updateContent('link', e.target.value)}
          placeholder="https://example.com"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Largeur</Label>
          <Select value={block.content.width} onValueChange={(v) => updateContent('width', v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="small">Petit (200px)</SelectItem>
              <SelectItem value="medium">Moyen (400px)</SelectItem>
              <SelectItem value="full">Pleine largeur</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Alignement</Label>
          <Select value={block.content.align} onValueChange={(v) => updateContent('align', v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="left">Gauche</SelectItem>
              <SelectItem value="center">Centre</SelectItem>
              <SelectItem value="right">Droite</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}

function DividerBlockEditor({
  block,
  updateContent,
}: {
  block: DividerBlock
  updateContent: (key: string, value: any) => void
}) {
  return (
    <div className="space-y-4">
      <div>
        <Label>Couleur</Label>
        <Input
          type="color"
          value={block.content.color}
          onChange={(e) => updateContent('color', e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Épaisseur</Label>
          <Select value={block.content.thickness} onValueChange={(v) => updateContent('thickness', v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="thin">Fin</SelectItem>
              <SelectItem value="medium">Moyen</SelectItem>
              <SelectItem value="thick">Épais</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Style</Label>
          <Select value={block.content.style} onValueChange={(v) => updateContent('style', v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="solid">Solide</SelectItem>
              <SelectItem value="dashed">Tirets</SelectItem>
              <SelectItem value="dotted">Points</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}

function SpacerBlockEditor({
  block,
  updateContent,
}: {
  block: SpacerBlock
  updateContent: (key: string, value: any) => void
}) {
  return (
    <div className="space-y-4">
      <div>
        <Label>Hauteur</Label>
        <Select value={block.content.height} onValueChange={(v) => updateContent('height', v)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="small">Petit (10px)</SelectItem>
            <SelectItem value="medium">Moyen (20px)</SelectItem>
            <SelectItem value="large">Grand (40px)</SelectItem>
            <SelectItem value="xlarge">Très grand (60px)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

function TwoColumnBlockEditor({
  block,
  updateContent,
}: {
  block: TwoColumnBlock
  updateContent: (key: string, value: any) => void
}) {
  return (
    <div className="space-y-4">
      <div>
        <Label>Colonne Gauche (HTML)</Label>
        <Textarea
          value={block.content.leftColumn}
          onChange={(e) => updateContent('leftColumn', e.target.value)}
          rows={4}
          className="font-mono text-sm"
        />
      </div>

      <div>
        <Label>Colonne Droite (HTML)</Label>
        <Textarea
          value={block.content.rightColumn}
          onChange={(e) => updateContent('rightColumn', e.target.value)}
          rows={4}
          className="font-mono text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Répartition</Label>
          <Select
            value={`${block.content.leftWidth}`}
            onValueChange={(v) => {
              const left = parseInt(v)
              const right = 100 - left
              updateContent('leftWidth', left)
              updateContent('rightWidth', right)
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="33">33% / 67%</SelectItem>
              <SelectItem value="50">50% / 50%</SelectItem>
              <SelectItem value="66">66% / 33%</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Espacement</Label>
          <Select value={block.content.gap} onValueChange={(v) => updateContent('gap', v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="small">Petit</SelectItem>
              <SelectItem value="medium">Moyen</SelectItem>
              <SelectItem value="large">Grand</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}

function InfoBoxBlockEditor({
  block,
  updateContent,
}: {
  block: InfoBoxBlock
  updateContent: (key: string, value: any) => void
}) {
  return (
    <div className="space-y-4">
      <div>
        <Label>Icône (emoji)</Label>
        <Input
          value={block.content.icon}
          onChange={(e) => updateContent('icon', e.target.value)}
          placeholder="📅"
          maxLength={2}
        />
      </div>

      <div>
        <Label>Titre</Label>
        <Input
          value={block.content.title}
          onChange={(e) => updateContent('title', e.target.value)}
          placeholder="Information importante"
        />
      </div>

      <div>
        <Label>Description</Label>
        <Textarea
          value={block.content.description}
          onChange={(e) => updateContent('description', e.target.value)}
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Couleur de fond</Label>
          <Input
            type="color"
            value={block.content.backgroundColor}
            onChange={(e) => updateContent('backgroundColor', e.target.value)}
          />
        </div>
        <div>
          <Label>Couleur de bordure</Label>
          <Input
            type="color"
            value={block.content.borderColor}
            onChange={(e) => updateContent('borderColor', e.target.value)}
          />
        </div>
      </div>
    </div>
  )
}
