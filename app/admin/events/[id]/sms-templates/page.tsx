'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MessageSquare, Plus, Edit, Trash2, Eye, Copy } from 'lucide-react'
import { toast } from 'sonner'

interface SMSTemplate {
  id: string
  name: string
  description?: string
  category: string
  message: string
  variables: string[]
  usageCount: number
  isActive: boolean
  isDefault: boolean
  eventId?: string
  createdAt: string
  updatedAt: string
}

const CATEGORIES = [
  { value: 'rsvp', label: 'Confirmation RSVP' },
  { value: 'reminder', label: 'Rappels' },
  { value: 'info', label: 'Informations' },
  { value: 'custom', label: 'Personnalisé' },
]

const AVAILABLE_VARIABLES = [
  { name: '{firstName}', description: 'Prénom de l\'invité' },
  { name: '{lastName}', description: 'Nom de l\'invité' },
  { name: '{fullName}', description: 'Nom complet' },
  { name: '{company}', description: 'Entreprise' },
  { name: '{jobTitle}', description: 'Fonction' },
  { name: '{eventName}', description: 'Nom de l\'événement' },
  { name: '{eventDate}', description: 'Date de l\'événement' },
  { name: '{eventTime}', description: 'Heure de l\'événement' },
  { name: '{venueName}', description: 'Nom du lieu' },
  { name: '{venueAddress}', description: 'Adresse du lieu' },
  { name: '{rsvpLink}', description: 'Lien de confirmation' },
  { name: '{rsvpDeadline}', description: 'Date limite RSVP' },
]

export default function SMSTemplatesPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.id as string

  const [templates, setTemplates] = useState<SMSTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<SMSTemplate | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewTemplate, setPreviewTemplate] = useState<SMSTemplate | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'custom',
    message: '',
    isDefault: false,
  })

  useEffect(() => {
    fetchTemplates()
  }, [eventId])

  const fetchTemplates = async () => {
    try {
      const response = await fetch(`/api/admin/events/${eventId}/sms-templates`)
      if (response.ok) {
        const data = await response.json()
        setTemplates(data.templates)
      }
    } catch (error) {
      console.error('Error fetching templates:', error)
      toast.error('Erreur lors du chargement des templates')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    try {
      const response = await fetch(`/api/admin/events/${eventId}/sms-templates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success('Template créé avec succès')
        setDialogOpen(false)
        resetForm()
        fetchTemplates()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Erreur lors de la création')
      }
    } catch (error) {
      console.error('Error creating template:', error)
      toast.error('Erreur lors de la création')
    }
  }

  const handleUpdate = async () => {
    if (!editingTemplate) return

    try {
      const response = await fetch(
        `/api/admin/events/${eventId}/sms-templates/${editingTemplate.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        }
      )

      if (response.ok) {
        toast.success('Template mis à jour avec succès')
        setDialogOpen(false)
        setEditingTemplate(null)
        resetForm()
        fetchTemplates()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Erreur lors de la mise à jour')
      }
    } catch (error) {
      console.error('Error updating template:', error)
      toast.error('Erreur lors de la mise à jour')
    }
  }

  const handleDelete = async (templateId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce template ?')) return

    try {
      const response = await fetch(
        `/api/admin/events/${eventId}/sms-templates/${templateId}`,
        {
          method: 'DELETE',
        }
      )

      if (response.ok) {
        toast.success('Template supprimé avec succès')
        fetchTemplates()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Error deleting template:', error)
      toast.error('Erreur lors de la suppression')
    }
  }

  const handleEdit = (template: SMSTemplate) => {
    setEditingTemplate(template)
    setFormData({
      name: template.name,
      description: template.description || '',
      category: template.category,
      message: template.message,
      isDefault: template.isDefault,
    })
    setDialogOpen(true)
  }

  const handleDuplicate = (template: SMSTemplate) => {
    setFormData({
      name: `${template.name} (copie)`,
      description: template.description || '',
      category: template.category,
      message: template.message,
      isDefault: false,
    })
    setDialogOpen(true)
  }

  const handlePreview = (template: SMSTemplate) => {
    setPreviewTemplate(template)
    setPreviewOpen(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: 'custom',
      message: '',
      isDefault: false,
    })
  }

  const insertVariable = (variable: string) => {
    setFormData({
      ...formData,
      message: formData.message + variable,
    })
  }

  const renderPreview = (message: string) => {
    // Replace variables with example values
    return message
      .replace(/{firstName}/g, 'Sophie')
      .replace(/{lastName}/g, 'Martin')
      .replace(/{fullName}/g, 'Sophie Martin')
      .replace(/{company}/g, 'Tech Solutions')
      .replace(/{jobTitle}/g, 'CEO')
      .replace(/{eventName}/g, 'Gala 2025')
      .replace(/{eventDate}/g, 'vendredi 20 juin 2025')
      .replace(/{eventTime}/g, '19:00')
      .replace(/{venueName}/g, 'Palais des Congrès')
      .replace(/{venueAddress}/g, '2 Place de la Porte Maillot, Paris')
      .replace(/{rsvpLink}/g, 'https://app.weevup.com/guest/abc123')
      .replace(/{rsvpDeadline}/g, '15 juin 2025')
  }

  const messageLength = formData.message.length
  const smsCount = Math.ceil(messageLength / 160)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <MessageSquare className="h-12 w-12 text-[#009197] mx-auto mb-4 animate-pulse" />
          <p className="text-[#004645]/70">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-[#004645] mb-2" style={{ fontFamily: 'var(--font-abril)' }}>
            Templates SMS
          </h2>
          <p className="text-[#004645]/70">
            Créez et gérez vos templates de messages réutilisables
          </p>
        </div>
        <Button onClick={() => { resetForm(); setEditingTemplate(null); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau template
        </Button>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <Card key={template.id} className="border-[#9CD9F6]/30 hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg text-[#004645] flex items-center gap-2">
                    {template.name}
                    {template.isDefault && (
                      <Badge variant="secondary" className="text-xs">Par défaut</Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    <Badge variant="outline" className="text-xs">
                      {CATEGORIES.find(c => c.value === template.category)?.label || template.category}
                    </Badge>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[#004645]/70 mb-4 line-clamp-3">
                {template.message}
              </p>

              <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                <span>{template.usageCount} utilisations</span>
                <span>{template.message.length} caractères</span>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePreview(template)}
                  className="flex-1"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Aperçu
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(template)}
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDuplicate(template)}
                >
                  <Copy className="h-3 w-3" />
                </Button>
                {!template.isDefault && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(template.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? 'Modifier le template' : 'Nouveau template'}
            </DialogTitle>
            <DialogDescription>
              Créez un template réutilisable avec des variables dynamiques
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom du template</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Rappel J-7"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Catégorie</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optionnel)</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brève description du template"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="message">Message</Label>
                <div className="text-xs text-muted-foreground">
                  {messageLength} / 1600 caractères • {smsCount} SMS
                </div>
              </div>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Bonjour {firstName}, votre invitation pour {eventName}..."
                rows={6}
                maxLength={1600}
              />
            </div>

            {/* Variables Panel */}
            <div className="space-y-2">
              <Label>Variables disponibles</Label>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-3 bg-gray-50 rounded-md">
                {AVAILABLE_VARIABLES.map((variable) => (
                  <Button
                    key={variable.name}
                    variant="ghost"
                    size="sm"
                    onClick={() => insertVariable(variable.name)}
                    className="justify-start text-xs h-auto py-2"
                  >
                    <span className="font-mono text-[#009197]">{variable.name}</span>
                    <span className="ml-2 text-muted-foreground">{variable.description}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Preview */}
            {formData.message && (
              <div className="space-y-2">
                <Label>Aperçu (avec exemples)</Label>
                <div className="p-3 bg-[#9CD9F6]/10 border border-[#9CD9F6]/30 rounded-md">
                  <p className="text-sm text-[#004645]">
                    {renderPreview(formData.message)}
                  </p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setDialogOpen(false); setEditingTemplate(null); }}>
              Annuler
            </Button>
            <Button onClick={editingTemplate ? handleUpdate : handleCreate}>
              {editingTemplate ? 'Mettre à jour' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aperçu : {previewTemplate?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-xs text-muted-foreground">Message original</Label>
              <p className="text-sm mt-1">{previewTemplate?.message}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Rendu (exemple)</Label>
              <div className="p-3 bg-[#9CD9F6]/10 border border-[#9CD9F6]/30 rounded-md mt-1">
                <p className="text-sm">{previewTemplate && renderPreview(previewTemplate.message)}</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
