"use client"

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Sparkles, Save, Download, Send } from 'lucide-react'
import { EmailEditor, EmailTemplate, PREDEFINED_TEMPLATES, blocksToHTML } from '@/components/email-editor'
import { toast } from 'sonner'
import { createClientLogger } from '@/lib/client-logger'

const logger = createClientLogger({ component: 'EmailEditorPage' })


export default function EmailEditorPage() {
  const params = useParams()
  const eventId = params.id as string

  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null)
  const [showTemplateSelector, setShowTemplateSelector] = useState(true)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [saving, setSaving] = useState(false)

  // Save form state
  const [templateName, setTemplateName] = useState('')
  const [templateDescription, setTemplateDescription] = useState('')
  const [templateSubject, setTemplateSubject] = useState('')
  const [templateType, setTemplateType] = useState('INVITE')

  const handleSelectTemplate = (templateId: string) => {
    const template = PREDEFINED_TEMPLATES[templateId]
    if (template) {
      setSelectedTemplate(template)
      setShowTemplateSelector(false)
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

      // Generate unique slug from name
      const slug = templateName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

      const response = await fetch('/api/admin/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: templateName,
          slug,
          description: templateDescription || undefined,
          type: templateType,
          subject: templateSubject,
          htmlContent: html,
          textContent: '', // Could be improved later
          primaryColor: selectedTemplate.globalStyles?.primaryColor || '#004645',
          secondaryColor: selectedTemplate.globalStyles?.secondaryColor || '#009197',
          accentColor: '#FF4713',
          fontFamily: selectedTemplate.globalStyles?.fontFamily || 'Arial, sans-serif',
          isActive: true,
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save template')
      }

      const savedTemplate = await response.json()
      toast.success(`Template "${templateName}" sauvegardé avec succès !`)

      // Reset form
      setShowSaveDialog(false)
      setTemplateName('')
      setTemplateDescription('')
      setTemplateSubject('')
      setTemplateType('INVITE')
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-[#004645] mb-2" style={{ fontFamily: "var(--font-abril)" }}>
            Éditeur d&apos;Emails WYSIWYG
          </h2>
          <p className="text-[#004645]/70">
            Créez des emails professionnels avec un éditeur visuel drag & drop
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
                className="bg-gradient-to-r from-[#004645] to-[#009197] text-white"
              >
                <Save className="h-4 w-4 mr-2" />
                Sauvegarder le template
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Info Card */}
      <Card className="border-[#FF4713]/30 bg-gradient-to-r from-[#FF4713]/5 to-transparent">
        <CardHeader>
          <CardTitle className="text-[#004645] flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#FF4713]" />
            Fonctionnalités de l&apos;éditeur WYSIWYG
          </CardTitle>
          <CardDescription className="text-[#004645]/70">
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li><strong>8 types de blocs</strong>: En-tête, Texte, Bouton, Image, Séparateur, Espace, 2 Colonnes, Info Box</li>
              <li><strong>Drag & Drop</strong>: Réorganisez vos blocs avec les flèches haut/bas</li>
              <li><strong>Preview en temps réel</strong>: Voyez vos modifications instantanément</li>
              <li><strong>Variables dynamiques</strong>: Utilisez {`{{guestName}}`}, {`{{eventDate}}`}, etc.</li>
              <li><strong>Templates prédéfinis</strong>: Invitation, Save the Date, Rappel, Moderne</li>
              <li><strong>Export HTML</strong>: Compatible avec tous les clients emails</li>
            </ul>
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Template Selector Dialog */}
      <Dialog open={showTemplateSelector} onOpenChange={setShowTemplateSelector}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Choisir un template</DialogTitle>
            <DialogDescription>
              Sélectionnez un template prédéfini ou partez de zéro
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            {Object.values(PREDEFINED_TEMPLATES).map((template) => (
              <button
                key={template.id}
                onClick={() => handleSelectTemplate(template.id)}
                className="group p-4 border-2 border-[#9CD9F6]/30 rounded-lg hover:border-[#009197] transition-colors text-left"
              >
                <h3 className="font-semibold text-[#004645] mb-2">{template.name}</h3>
                <p className="text-sm text-[#004645]/70">
                  {template.blocks.length === 0
                    ? 'Commencez avec une page vide'
                    : `${template.blocks.length} blocs pré-configurés`}
                </p>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Save Template Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Sauvegarder le template</DialogTitle>
            <DialogDescription>
              Enregistrez ce template pour le réutiliser dans vos campagnes
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="template-name">Nom du template *</Label>
              <Input
                id="template-name"
                placeholder="Ex: Invitation Élégante"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="template-subject">Sujet de l&apos;email *</Label>
              <Input
                id="template-subject"
                placeholder="Ex: Vous êtes invité(e) à notre événement"
                value={templateSubject}
                onChange={(e) => setTemplateSubject(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="template-type">Type d&apos;email</Label>
              <Select value={templateType} onValueChange={setTemplateType}>
                <SelectTrigger id="template-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INVITE">Invitation</SelectItem>
                  <SelectItem value="REMINDER">Rappel</SelectItem>
                  <SelectItem value="CONFIRMATION">Confirmation</SelectItem>
                  <SelectItem value="SAVE_THE_DATE">Save the Date</SelectItem>
                  <SelectItem value="THANK_YOU">Remerciement</SelectItem>
                  <SelectItem value="UPDATE">Mise à jour</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="template-description">Description (optionnel)</Label>
              <Textarea
                id="template-description"
                placeholder="Décrivez l'usage de ce template..."
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSaveDialog(false)}
              disabled={saving}
            >
              Annuler
            </Button>
            <Button
              onClick={handleSaveTemplate}
              disabled={saving || !templateName.trim() || !templateSubject.trim()}
              className="bg-gradient-to-r from-[#004645] to-[#009197] text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Sauvegarde...' : 'Sauvegarder'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Editor */}
      {selectedTemplate ? (
        <EmailEditor
          initialTemplate={selectedTemplate}
          onChange={(template) => setSelectedTemplate(template)}
        />
      ) : (
        <Card className="border-[#9CD9F6]/30">
          <CardContent className="pt-12 pb-12 text-center">
            <Sparkles className="h-16 w-16 mx-auto mb-4 text-[#009197] opacity-30" />
            <h3 className="text-xl font-semibold text-[#004645] mb-2">
              Aucun template sélectionné
            </h3>
            <p className="text-[#004645]/70 mb-6">
              Choisissez un template prédéfini pour commencer
            </p>
            <Button
              onClick={() => setShowTemplateSelector(true)}
              className="bg-gradient-to-r from-[#004645] to-[#009197] text-white"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Choisir un template
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
