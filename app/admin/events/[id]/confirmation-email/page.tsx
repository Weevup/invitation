"use client"

import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Save, Download, Loader2, CheckCircle, XCircle } from 'lucide-react'
import { EmailEditor, EmailTemplate, PREDEFINED_TEMPLATES, blocksToHTML } from '@/components/email-editor'
import { toast } from 'sonner'
import { createClientLogger } from '@/lib/client-logger'

const logger = createClientLogger({ component: 'ConfirmationEmailEditorPage' })

type TemplateType = 'accepted' | 'declined' | null

export default function ConfirmationEmailEditorPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const eventId = params.id as string

  // Read type parameter from URL (accepted or declined)
  const typeParam = searchParams.get('type') as TemplateType

  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null)
  const [showTemplateSelector, setShowTemplateSelector] = useState(true)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [templateType, setTemplateType] = useState<TemplateType>(typeParam)

  // Save form state
  const [templateName, setTemplateName] = useState('')
  const [templateDescription, setTemplateDescription] = useState('')
  const [templateSubject, setTemplateSubject] = useState('')

  // Load existing confirmation template if exists
  useEffect(() => {
    loadExistingTemplate()
  }, [eventId, templateType])

  const loadExistingTemplate = async () => {
    setLoading(true)
    try {
      // Load specific template based on type parameter
      const slug = templateType === 'accepted'
        ? 'confirmation-accepted'
        : templateType === 'declined'
        ? 'confirmation-declined'
        : 'confirmation'

      const response = await fetch(`/api/admin/templates?eventId=${eventId}&slug=${slug}`)
      if (!response.ok) throw new Error('Failed to load templates')

      const templates = await response.json()

      if (templates && templates.length > 0) {
        const template = templates[0]

        // Try to parse blocksJson if available
        if (template.blocksJson) {
          const parsedTemplate = JSON.parse(template.blocksJson)
          setSelectedTemplate(parsedTemplate)
          setShowTemplateSelector(false)
        } else {
          // Use default template based on type
          const defaultTemplate = templateType === 'declined'
            ? PREDEFINED_TEMPLATES['confirmation-declined']
            : PREDEFINED_TEMPLATES['confirmation-accepted']
          setSelectedTemplate(defaultTemplate)
          setShowTemplateSelector(true)
        }

        // Pre-fill save form
        setTemplateName(template.name)
        setTemplateDescription(template.description || '')
        setTemplateSubject(template.subject)

        toast.success('Template de confirmation chargé')
      } else {
        // No template found, auto-select appropriate predefined template
        if (templateType === 'accepted') {
          handleSelectTemplate('confirmation-accepted')
        } else if (templateType === 'declined') {
          handleSelectTemplate('confirmation-declined')
        } else {
          setShowTemplateSelector(true)
        }
      }
    } catch (error) {
      logger.error(error, { action: 'loadExistingTemplate' })
      // Show template selector on error or auto-select if type is specified
      if (templateType === 'accepted') {
        handleSelectTemplate('confirmation-accepted')
      } else if (templateType === 'declined') {
        handleSelectTemplate('confirmation-declined')
      } else {
        setShowTemplateSelector(true)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSelectTemplate = (templateId: string) => {
    const template = PREDEFINED_TEMPLATES[templateId]
    if (template) {
      setSelectedTemplate(template)
      setShowTemplateSelector(false)

      // Set default values based on template
      if (templateId === 'confirmation-accepted') {
        setTemplateName('Email de confirmation - Présence confirmée')
        setTemplateSubject('Confirmation : {{event.name}}')
        setTemplateDescription('Email automatique envoyé quand un invité confirme sa présence')
      } else if (templateId === 'confirmation-declined') {
        setTemplateName('Email de confirmation - Absence')
        setTemplateSubject('Réponse enregistrée : {{event.name}}')
        setTemplateDescription('Email automatique envoyé quand un invité décline l\'invitation')
      }
    }
  }

  const handleOpenSaveDialog = () => {
    if (!selectedTemplate) return
    setShowSaveDialog(true)
  }

  const handleSaveTemplate = async () => {
    if (!selectedTemplate || !templateName.trim() || !templateSubject.trim()) {
      toast.error('Veuillez remplir le nom et le sujet du template')
      return
    }

    setSaving(true)
    try {
      const html = blocksToHTML(selectedTemplate)
      const blocksJson = JSON.stringify(selectedTemplate)

      // Use specific slug based on template type
      const slug = templateType === 'accepted'
        ? 'confirmation-accepted'
        : templateType === 'declined'
        ? 'confirmation-declined'
        : templateName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

      // Check if template already exists
      const existingResponse = await fetch(`/api/admin/templates?eventId=${eventId}&slug=${slug}`)
      const existingTemplates = await existingResponse.json()

      const isEditing = existingTemplates && existingTemplates.length > 0
      const url = isEditing
        ? `/api/admin/templates/${existingTemplates[0].id}`
        : '/api/admin/templates'
      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: templateName,
          slug,
          description: templateDescription || undefined,
          type: 'CONFIRMATION',
          subject: templateSubject,
          htmlContent: html,
          textContent: '', // Could be improved later
          blocksJson, // Store the editor structure
          primaryColor: selectedTemplate.globalStyles?.primaryColor || '#48bb78',
          secondaryColor: selectedTemplate.globalStyles?.secondaryColor || '#38a169',
          accentColor: '#FF4713',
          fontFamily: selectedTemplate.globalStyles?.fontFamily || 'Arial, sans-serif',
          isActive: true,
          eventId, // Link to event
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save template')
      }

      toast.success(`Template "${templateName}" ${isEditing ? 'mis à jour' : 'sauvegardé'} avec succès !`)
      setShowSaveDialog(false)

      // Reload to show updated template
      await loadExistingTemplate()
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde')
      logger.error(error, { action: 'SaveError' })
    } finally {
      setSaving(false)
    }
  }

  const handleDownloadHTML = () => {
    if (!selectedTemplate) return

    const html = blocksToHTML(selectedTemplate)
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${selectedTemplate.name}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast.success('Template téléchargé !')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-[#009197]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-3xl font-bold text-[#004645]" style={{ fontFamily: "var(--font-abril)" }}>
              Email de Confirmation RSVP
            </h2>
            {templateType === 'accepted' && (
              <Badge className="bg-green-600 text-white">
                <CheckCircle className="h-3 w-3 mr-1" />
                Présence Confirmée
              </Badge>
            )}
            {templateType === 'declined' && (
              <Badge className="bg-red-600 text-white">
                <XCircle className="h-3 w-3 mr-1" />
                Absence
              </Badge>
            )}
          </div>
          <p className="text-[#004645]/70">
            {templateType === 'accepted'
              ? 'Email automatique envoyé quand un invité confirme sa présence'
              : templateType === 'declined'
              ? 'Email automatique envoyé quand un invité décline l\'invitation'
              : 'Personnalisez l\'email envoyé automatiquement après qu\'un invité répond au RSVP'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowTemplateSelector(true)}
            className="border-[#009197] text-[#009197]"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Changer de template
          </Button>
          {selectedTemplate && (
            <>
              <Button
                variant="outline"
                onClick={handleDownloadHTML}
                className="border-[#009197] text-[#009197]"
              >
                <Download className="h-4 w-4 mr-2" />
                Télécharger HTML
              </Button>
              <Button
                onClick={handleOpenSaveDialog}
                className="bg-gradient-to-r from-[#004645] to-[#009197] hover:from-[#006C51] hover:to-[#009197] text-white"
              >
                <Save className="h-4 w-4 mr-2" />
                Sauvegarder
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Template Selector Dialog */}
      <Dialog open={showTemplateSelector} onOpenChange={setShowTemplateSelector}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Choisir un template de confirmation</DialogTitle>
            <DialogDescription>
              Sélectionnez un template de départ pour votre email de confirmation
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            {Object.entries(PREDEFINED_TEMPLATES)
              .filter(([id]) => id === 'confirmation-accepted' || id === 'confirmation-declined' || id === 'blank')
              .map(([id, template]) => (
                <Card
                  key={id}
                  className="cursor-pointer hover:shadow-lg transition-shadow border-[#9CD9F6]/30"
                  onClick={() => handleSelectTemplate(id)}
                >
                  <CardHeader>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-40 bg-gradient-to-br from-[#9CD9F6]/20 to-white rounded flex items-center justify-center text-[#004645]/50">
                      Aperçu template
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Save Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sauvegarder le template</DialogTitle>
            <DialogDescription>
              Donnez un nom à votre template de confirmation
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="name">Nom du template *</Label>
              <Input
                id="name"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Ex: Email de confirmation"
              />
            </div>
            <div>
              <Label htmlFor="subject">Sujet de l&apos;email *</Label>
              <Input
                id="subject"
                value={templateSubject}
                onChange={(e) => setTemplateSubject(e.target.value)}
                placeholder="Ex: Confirmation : {{event.name}}"
              />
              <p className="text-xs text-[#004645]/70 mt-1">
                Variables disponibles : {'{'}{'{'} event.name{'}'}{'}'}, {'{'}{'{'}guest.firstName{'}'}{'}'}
              </p>
            </div>
            <div>
              <Label htmlFor="description">Description (optionnel)</Label>
              <Input
                id="description"
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
                placeholder="Ex: Email automatique de confirmation RSVP"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleSaveTemplate}
              disabled={saving}
              className="bg-gradient-to-r from-[#004645] to-[#009197]"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sauvegarde...
                </>
              ) : (
                'Sauvegarder'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Email Editor */}
      {selectedTemplate ? (
        <EmailEditor
          initialTemplate={selectedTemplate}
          onChange={setSelectedTemplate}
        />
      ) : (
        <Card className="border-[#9CD9F6]/30">
          <CardContent className="text-center py-12">
            <p className="text-[#004645]/70 mb-4">
              Sélectionnez un template pour commencer
            </p>
            <Button
              onClick={() => setShowTemplateSelector(true)}
              className="bg-gradient-to-r from-[#004645] to-[#009197]"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Choisir un template
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Info box about variables */}
      {selectedTemplate && (
        <Card className="border-[#9CD9F6]/30 bg-[#9CD9F6]/5">
          <CardHeader>
            <CardTitle className="text-sm text-[#004645]">💡 Variables disponibles</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-[#004645]/70 space-y-2">
            <p><code className="bg-white px-2 py-1 rounded">{'{{guest.firstName}}'}</code> - Prénom de l&apos;invité</p>
            <p><code className="bg-white px-2 py-1 rounded">{'{{guest.lastName}}'}</code> - Nom de l&apos;invité</p>
            <p><code className="bg-white px-2 py-1 rounded">{'{{event.name}}'}</code> - Nom de l&apos;événement</p>
            <p><code className="bg-white px-2 py-1 rounded">{'{{event.date}}'}</code> - Date formatée de l&apos;événement</p>
            <p><code className="bg-white px-2 py-1 rounded">{'{{event.location}}'}</code> - Lieu de l&apos;événement</p>
            <p className="text-xs mt-4 italic">
              Ces variables seront automatiquement remplacées lors de l&apos;envoi de l&apos;email
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
