'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Mail,
  Plus,
  Edit,
  Trash2,
  Eye,
  Copy,
  Save,
  X,
  Palette,
  Code,
  FileText,
  CheckCircle,
  AlertCircle,
  Download,
  QrCode
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'
import { EmailPreviewModal } from '@/components/email-preview-modal'
import { createClientLogger } from '@/lib/client-logger'

const logger = createClientLogger({ component: 'TemplatesPage' })

interface EmailTemplate {
  id: string
  name: string
  slug: string
  description?: string
  type: string
  subject: string
  htmlContent: string
  textContent?: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  fontFamily: string
  isDefault: boolean
  isActive: boolean
  previewImage?: string
  usageCount: number
  lastUsedAt?: string | null
  createdAt: string
  updatedAt: string
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null)
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null)
  const [showEditor, setShowEditor] = useState(false)
  const [saving, setSaving] = useState(false)
  const [installingDefault, setInstallingDefault] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    type: 'INVITE',
    subject: '',
    htmlContent: '',
    textContent: '',
    primaryColor: '#004645',
    secondaryColor: '#009197',
    accentColor: '#FF4713',
    fontFamily: 'Arial, sans-serif'
  })

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/admin/templates')
      const data = await response.json()
      setTemplates(data)
    } catch (error) {
      logger.error(error, { action: 'fetchTemplates' })
      toast.error('Erreur lors du chargement des templates')
    } finally {
      setLoading(false)
    }
  }

  const handleInstallDefaultTemplate = async () => {
    setInstallingDefault(true)
    try {
      const response = await fetch('/api/admin/seed-final-template', {
        method: 'POST'
      })

      if (response.ok) {
        await fetchTemplates()
        toast.success('Template "Confirmation & Accès" installé avec succès')
      } else {
        const data = await response.json()
        toast.error(data.error || 'Erreur lors de l\'installation')
      }
    } catch (error) {
      logger.error(error, { action: 'installDefaultTemplate' })
      toast.error('Erreur lors de l\'installation du template')
    } finally {
      setInstallingDefault(false)
    }
  }

  const handleCreate = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      type: 'INVITE',
      subject: '',
      htmlContent: getDefaultTemplate(),
      textContent: '',
      primaryColor: '#004645',
      secondaryColor: '#009197',
      accentColor: '#FF4713',
      fontFamily: 'Arial, sans-serif'
    })
    setEditingTemplate(null)
    setShowEditor(true)
  }

  const handleEdit = (template: EmailTemplate) => {
    setFormData({
      name: template.name,
      slug: template.slug,
      description: template.description || '',
      type: template.type,
      subject: template.subject,
      htmlContent: template.htmlContent,
      textContent: template.textContent || '',
      primaryColor: template.primaryColor,
      secondaryColor: template.secondaryColor,
      accentColor: template.accentColor,
      fontFamily: template.fontFamily
    })
    setEditingTemplate(template)
    setShowEditor(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const url = editingTemplate
        ? `/api/admin/templates/${editingTemplate.id}`
        : '/api/admin/templates'

      const method = editingTemplate ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        await fetchTemplates()
        setShowEditor(false)
        setEditingTemplate(null)
        toast.success(
          editingTemplate
            ? 'Template mis à jour avec succès'
            : 'Template créé avec succès'
        )
      } else {
        const data = await response.json()
        toast.error(data.error || 'Erreur lors de la sauvegarde')
      }
    } catch (error) {
      logger.error(error, { action: 'saveTemplate' })
      toast.error('Erreur lors de la sauvegarde du template')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce template ?')) return

    try {
      const response = await fetch(`/api/admin/templates/${id}`, { method: 'DELETE' })
      if (response.ok) {
        await fetchTemplates()
        toast.success('Template supprimé avec succès')
      } else {
        const data = await response.json()
        toast.error(data.error || 'Erreur lors de la suppression')
      }
    } catch (error) {
      logger.error(error, { action: 'deleteTemplate' })
      toast.error('Erreur lors de la suppression du template')
    }
  }

  const handleDuplicate = async (template: EmailTemplate) => {
    setFormData({
      name: `${template.name} (Copie)`,
      slug: `${template.slug}-copy`,
      description: template.description || '',
      type: template.type,
      subject: template.subject,
      htmlContent: template.htmlContent,
      textContent: template.textContent || '',
      primaryColor: template.primaryColor,
      secondaryColor: template.secondaryColor,
      accentColor: template.accentColor,
      fontFamily: template.fontFamily
    })
    setEditingTemplate(null)
    setShowEditor(true)
  }

  const getDefaultTemplate = () => {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: {{fontFamily}};
      background-color: #f5f5f5;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background: linear-gradient(135deg, {{primaryColor}} 0%, {{secondaryColor}} 100%);
      color: #ffffff;
      padding: 40px 20px;
      text-align: center;
    }
    .content {
      padding: 40px 20px;
      color: #333333;
    }
    .button {
      display: inline-block;
      background-color: {{accentColor}};
      color: #ffffff;
      padding: 12px 30px;
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
    }
    .footer {
      background-color: #f9f9f9;
      padding: 20px;
      text-align: center;
      color: #666666;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>{{event.name}}</h1>
      <p>{{event.date}} • {{event.location}}</p>
    </div>

    <div class="content">
      <h2>Bonjour {{guest.firstName}},</h2>

      <p>Nous avons le plaisir de vous inviter à participer à notre événement.</p>

      <p style="text-align: center;">
        <a href="{{rsvpLink}}" class="button">Confirmer ma présence</a>
      </p>

      <p>À très bientôt !</p>
    </div>

    <div class="footer">
      <p>&copy; {{event.organizerName}}. Tous droits réservés.</p>
    </div>
  </div>
</body>
</html>`
  }

  const availableVariables = [
    { name: 'event.name', description: 'Nom de l\'événement' },
    { name: 'event.date', description: 'Date de l\'événement' },
    { name: 'event.time', description: 'Heure de l\'événement' },
    { name: 'event.location', description: 'Lieu de l\'événement' },
    { name: 'event.address', description: 'Adresse complète' },
    { name: 'event.description', description: 'Description de l\'événement' },
    { name: 'event.organizerName', description: 'Nom de l\'organisateur' },
    { name: 'guest.firstName', description: 'Prénom de l\'invité' },
    { name: 'guest.lastName', description: 'Nom de l\'invité' },
    { name: 'guest.email', description: 'Email de l\'invité' },
    { name: 'rsvpLink', description: 'Lien de confirmation RSVP' },
    { name: 'primaryColor', description: 'Couleur primaire' },
    { name: 'secondaryColor', description: 'Couleur secondaire' },
    { name: 'accentColor', description: 'Couleur accent' },
    { name: 'fontFamily', description: 'Police de caractères' }
  ]

  const typeLabels: Record<string, string> = {
    SAVE_THE_DATE: 'Save the Date',
    INVITE: 'Invitation',
    INVITATION: 'Invitation',
    REMINDER: 'Rappel',
    CONFIRMATION: 'Confirmation',
    INFO: 'Information',
    CUSTOM: 'Personnalisé'
  }

  if (loading) {
    return <div className="flex items-center justify-center py-12">Chargement...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Templates d&apos;Emails</h1>
          <p className="text-muted-foreground mt-2">
            Créez et personnalisez vos templates d&apos;emails pour les invitations, rappels et confirmations
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleInstallDefaultTemplate} disabled={installingDefault}>
            <QrCode className="h-4 w-4 mr-2" />
            {installingDefault ? 'Installation...' : 'Installer template QR Code'}
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau Template
          </Button>
        </div>
      </div>

      {/* Templates Grid */}
      {templates.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucun template</h3>
            <p className="text-muted-foreground mb-4">
              Commencez par créer votre premier template d&apos;email
            </p>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Créer un template
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <Card key={template.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {template.name}
                      {template.isDefault && (
                        <Badge variant="secondary" className="text-xs">Par défaut</Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {template.description || 'Aucune description'}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <Badge>{typeLabels[template.type] || template.type}</Badge>
                  <Badge variant="outline">{template.usageCount} utilisations</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium mb-1">Sujet :</p>
                    <p className="text-sm text-muted-foreground truncate">{template.subject}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div
                        className="w-4 h-4 rounded-full border"
                        style={{ backgroundColor: template.primaryColor }}
                        title={template.primaryColor}
                      />
                      <div
                        className="w-4 h-4 rounded-full border"
                        style={{ backgroundColor: template.secondaryColor }}
                        title={template.secondaryColor}
                      />
                      <div
                        className="w-4 h-4 rounded-full border"
                        style={{ backgroundColor: template.accentColor }}
                        title={template.accentColor}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">{template.fontFamily}</span>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPreviewTemplate(template)}
                      className="flex-1"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Voir
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(template)}
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Modifier
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDuplicate(template)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    {!template.isDefault && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(template.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Editor Dialog */}
      <Dialog open={showEditor} onOpenChange={setShowEditor}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? 'Modifier le template' : 'Nouveau template'}
            </DialogTitle>
            <DialogDescription>
              Créez un template d&apos;email personnalisé avec vos couleurs et votre contenu
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Editor */}
            <div className="space-y-4">
              <div>
                <Label>Nom du template</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Mon template d'invitation"
                />
              </div>

              <div>
                <Label>Slug (identifiant unique)</Label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                  placeholder="mon-template-invitation"
                />
              </div>

              <div>
                <Label>Type</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SAVE_THE_DATE">Save the Date</SelectItem>
                    <SelectItem value="INVITE">Invitation</SelectItem>
                    <SelectItem value="INVITATION">Invitation (alt)</SelectItem>
                    <SelectItem value="REMINDER">Rappel</SelectItem>
                    <SelectItem value="CONFIRMATION">Confirmation</SelectItem>
                    <SelectItem value="INFO">Information</SelectItem>
                    <SelectItem value="CUSTOM">Personnalisé</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Description (optionnel)</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Template pour les invitations Save the Date"
                />
              </div>

              <div>
                <Label>Sujet de l&apos;email</Label>
                <Input
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Vous êtes invité à {{event.name}}"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label>Couleur primaire</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={formData.primaryColor}
                      onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      type="text"
                      value={formData.primaryColor}
                      onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <Label>Couleur secondaire</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={formData.secondaryColor}
                      onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      type="text"
                      value={formData.secondaryColor}
                      onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <Label>Couleur accent</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={formData.accentColor}
                      onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      type="text"
                      value={formData.accentColor}
                      onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label>Contenu HTML</Label>
                <Textarea
                  value={formData.htmlContent}
                  onChange={(e) => setFormData({ ...formData, htmlContent: e.target.value })}
                  placeholder="<html>...</html>"
                  className="font-mono text-xs"
                  rows={15}
                />
              </div>

              <Alert>
                <Code className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  <strong>Variables disponibles :</strong> {availableVariables.map(v => `{{${v.name}}}`).join(', ')}
                </AlertDescription>
              </Alert>
            </div>

            {/* Right: Variables & Preview */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Variables disponibles
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs space-y-2 max-h-[300px] overflow-y-auto">
                  {availableVariables.map((variable) => (
                    <div key={variable.name} className="flex justify-between items-start gap-2 p-2 rounded hover:bg-muted">
                      <div className="flex-1">
                        <code className="bg-muted px-1 py-0.5 rounded">{`{{${variable.name}}}`}</code>
                        <p className="text-muted-foreground mt-1">{variable.description}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2"
                        onClick={() => {
                          navigator.clipboard.writeText(`{{${variable.name}}}`)
                        }}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Aperçu (avec données de test)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border rounded p-2 bg-gray-50 max-h-[400px] overflow-y-auto">
                    <iframe
                      srcDoc={formData.htmlContent
                        .replace(/\{\{fontFamily\}\}/g, formData.fontFamily)
                        .replace(/\{\{primaryColor\}\}/g, formData.primaryColor)
                        .replace(/\{\{secondaryColor\}\}/g, formData.secondaryColor)
                        .replace(/\{\{accentColor\}\}/g, formData.accentColor)
                        .replace(/\{\{event\.name\}\}/g, 'Tech Summit 2025')
                        .replace(/\{\{event\.date\}\}/g, '15 septembre 2025')
                        .replace(/\{\{event\.time\}\}/g, '9h00')
                        .replace(/\{\{event\.location\}\}/g, 'Station F, Paris')
                        .replace(/\{\{event\.address\}\}/g, '5 Parvis Alan Turing, 75013 Paris')
                        .replace(/\{\{event\.organizerName\}\}/g, 'Weevup')
                        .replace(/\{\{guest\.firstName\}\}/g, 'Jean')
                        .replace(/\{\{guest\.lastName\}\}/g, 'Dupont')
                        .replace(/\{\{guest\.email\}\}/g, 'jean.dupont@example.com')
                        .replace(/\{\{rsvpLink\}\}/g, '#')}
                      className="w-full h-[400px] border-0"
                      title="Preview"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setShowEditor(false)}>
              <X className="h-4 w-4 mr-2" />
              Annuler
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog - Enhanced with variable editing */}
      {previewTemplate && (
        <EmailPreviewModal
          open={!!previewTemplate}
          onOpenChange={(open) => !open && setPreviewTemplate(null)}
          template={{
            name: previewTemplate.name,
            subject: previewTemplate.subject,
            htmlContent: previewTemplate.htmlContent,
          }}
          defaultVariables={{
            fontFamily: previewTemplate.fontFamily,
            primaryColor: previewTemplate.primaryColor,
            secondaryColor: previewTemplate.secondaryColor,
            accentColor: previewTemplate.accentColor,
          }}
        />
      )}
    </div>
  )
}
