"use client"

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Sparkles, Save, Download, Send } from 'lucide-react'
import { EmailEditor, EmailTemplate, PREDEFINED_TEMPLATES, blocksToHTML } from '@/components/email-editor'
import { toast } from 'sonner'

export default function EmailEditorPage() {
  const params = useParams()
  const eventId = params.id as string

  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null)
  const [showTemplateSelector, setShowTemplateSelector] = useState(true)
  const [saving, setSaving] = useState(false)

  const handleSelectTemplate = (templateId: string) => {
    const template = PREDEFINED_TEMPLATES[templateId]
    if (template) {
      setSelectedTemplate(template)
      setShowTemplateSelector(false)
    }
  }

  const handleSaveTemplate = async () => {
    if (!selectedTemplate) return

    setSaving(true)
    try {
      // TODO: Save to database
      const html = blocksToHTML(selectedTemplate)
      console.log('Saving template:', selectedTemplate)
      console.log('Generated HTML:', html)

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      toast.success('Template sauvegardé avec succès !')
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde')
      console.error('Save error:', error)
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
                onClick={handleSaveTemplate}
                disabled={saving}
                className="bg-gradient-to-r from-[#004645] to-[#009197] text-white"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Sauvegarde...' : 'Sauvegarder'}
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
