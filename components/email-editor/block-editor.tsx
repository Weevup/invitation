"use client"

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
        <Label>URL Logo (optionnel)</Label>
        <Input
          value={block.content.logoUrl || ''}
          onChange={(e) => updateContent('logoUrl', e.target.value)}
          placeholder="https://example.com/logo.png"
        />
      </div>

      <div>
        <Label>Image d&apos;arrière-plan (optionnel)</Label>
        <Input
          value={block.content.backgroundImage || ''}
          onChange={(e) => updateContent('backgroundImage', e.target.value)}
          placeholder="https://example.com/bg.jpg"
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
          placeholder="https://example.com"
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
  return (
    <div className="space-y-4">
      <div>
        <Label>URL de l&apos;image</Label>
        <Input
          value={block.content.url}
          onChange={(e) => updateContent('url', e.target.value)}
          placeholder="https://example.com/image.jpg"
        />
      </div>

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
