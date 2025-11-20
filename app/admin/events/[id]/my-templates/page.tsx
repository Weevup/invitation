"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Wand2,
  Edit,
  Trash2,
  Plus,
  Mail,
  Calendar,
  Bell,
  FileText
} from 'lucide-react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface EmailTemplate {
  id: string
  name: string
  slug: string
  description?: string
  type: string
  subject: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

const templateTypeIcons: Record<string, any> = {
  'SAVE_THE_DATE': Bell,
  'INVITE': Mail,
  'REMINDER': Calendar,
  'CUSTOM': FileText,
}

const templateTypeLabels: Record<string, string> = {
  'SAVE_THE_DATE': 'Save the Date',
  'INVITE': 'Invitation',
  'REMINDER': 'Rappel',
  'CUSTOM': 'Personnalisé',
}

const templateTypeColors: Record<string, string> = {
  'SAVE_THE_DATE': 'from-[#004645] to-[#009197]',
  'INVITE': 'from-[#FF4713] to-[#FF6B3D]',
  'REMINDER': 'from-purple-500 to-pink-500',
  'CUSTOM': 'from-blue-500 to-cyan-500',
}

export default function MyTemplatesPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.id as string

  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [templateToDelete, setTemplateToDelete] = useState<EmailTemplate | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/admin/templates')
      if (!response.ok) throw new Error('Failed to fetch templates')

      const data = await response.json()
      setTemplates(data)
    } catch (error) {
      console.error('Error fetching templates:', error)
      toast.error('Erreur lors du chargement des templates')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!templateToDelete) return

    setDeleting(true)
    try {
      const response = await fetch(`/api/admin/templates/${templateToDelete.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete template')

      toast.success(`Template "${templateToDelete.name}" supprimé`)
      setDeleteDialogOpen(false)
      setTemplateToDelete(null)
      fetchTemplates()
    } catch (error) {
      console.error('Error deleting template:', error)
      toast.error('Erreur lors de la suppression')
    } finally {
      setDeleting(false)
    }
  }

  const handleEdit = (template: EmailTemplate) => {
    // TODO: Implement edit functionality
    toast.info('Fonctionnalité de modification à venir')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#004645] mx-auto mb-4"></div>
          <p className="text-[#004645]/70">Chargement des templates...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-[#004645]" style={{ fontFamily: "var(--font-abril)" }}>
            <Wand2 className="inline h-8 w-8 mr-2 text-[#009197]" />
            Mes Templates WYSIWYG
          </h2>
          <p className="text-[#004645]/70 mt-2 text-lg">
            Gérez vos templates d&apos;emails créés avec l&apos;éditeur
          </p>
        </div>
        <Button
          onClick={() => router.push(`/admin/events/${eventId}/email-editor`)}
          className="bg-gradient-to-r from-[#004645] to-[#009197]"
          size="lg"
        >
          <Plus className="h-5 w-5 mr-2" />
          Créer un template
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="border-[#9CD9F6]/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-gradient-to-br from-[#004645]/10 to-[#009197]/10">
                <FileText className="h-6 w-6 text-[#004645]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#004645]">{templates.length}</p>
                <p className="text-sm text-[#004645]/70">Templates</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-[#9CD9F6]/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-gradient-to-br from-[#004645]/10 to-[#009197]/10">
                <Bell className="h-6 w-6 text-[#004645]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#004645]">
                  {templates.filter(t => t.type === 'SAVE_THE_DATE').length}
                </p>
                <p className="text-sm text-[#004645]/70">Save the Date</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-[#9CD9F6]/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-gradient-to-br from-[#FF4713]/10 to-[#FF6B3D]/10">
                <Mail className="h-6 w-6 text-[#FF4713]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#004645]">
                  {templates.filter(t => t.type === 'INVITE').length}
                </p>
                <p className="text-sm text-[#004645]/70">Invitations</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-[#9CD9F6]/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#004645]">
                  {templates.filter(t => t.type === 'REMINDER').length}
                </p>
                <p className="text-sm text-[#004645]/70">Rappels</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Templates List */}
      {templates.length === 0 ? (
        <Card className="border-[#9CD9F6]/30">
          <CardContent className="py-12">
            <div className="text-center">
              <Wand2 className="h-16 w-16 text-[#004645]/20 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-[#004645] mb-2">
                Aucun template pour le moment
              </h3>
              <p className="text-[#004645]/70 mb-6">
                Créez votre premier template avec l&apos;éditeur WYSIWYG
              </p>
              <Button
                onClick={() => router.push(`/admin/events/${eventId}/email-editor`)}
                className="bg-gradient-to-r from-[#004645] to-[#009197]"
              >
                <Plus className="h-4 w-4 mr-2" />
                Créer mon premier template
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {templates.map((template) => {
            const Icon = templateTypeIcons[template.type] || FileText
            const typeLabel = templateTypeLabels[template.type] || template.type
            const colorClass = templateTypeColors[template.type] || 'from-gray-500 to-gray-600'

            return (
              <Card
                key={template.id}
                className="border-[#9CD9F6]/30 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className={`h-1 bg-gradient-to-r ${colorClass}`} />
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`p-3 rounded-lg bg-gradient-to-br ${colorClass} shadow-sm`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <CardTitle className="text-[#004645]">{template.name}</CardTitle>
                          <Badge variant={template.isActive ? "default" : "secondary"}>
                            {template.isActive ? 'Actif' : 'Inactif'}
                          </Badge>
                          <Badge variant="outline">{typeLabel}</Badge>
                        </div>
                        {template.description && (
                          <CardDescription className="text-sm mb-2">
                            {template.description}
                          </CardDescription>
                        )}
                        <p className="text-sm text-[#004645]/70">
                          <strong>Sujet :</strong> {template.subject}
                        </p>
                        <p className="text-xs text-[#004645]/50 mt-2">
                          Créé le {new Date(template.createdAt).toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(template)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Modifier
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setTemplateToDelete(template)
                          setDeleteDialogOpen(true)
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            )
          })}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le template ?</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer le template &quot;{templateToDelete?.name}&quot; ?
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-500 hover:bg-red-600"
            >
              {deleting ? 'Suppression...' : 'Supprimer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
