'use client'

import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Wand2, Bell, Mail, ArrowRight, Sparkles, FileText, Send } from 'lucide-react'

export default function TemplatesPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.id as string

  const templates = [
    {
      id: 'wysiwyg',
      title: 'Éditeur WYSIWYG',
      description: 'Créez des emails personnalisés avec l\'éditeur drag & drop. Ajoutez des blocs (titres, textes, boutons, images) et personnalisez le design en temps réel.',
      icon: Wand2,
      color: 'from-purple-500 to-pink-500',
      href: `/admin/events/${eventId}/email-editor`,
      features: ['Éditeur visuel drag & drop', 'Preview en temps réel', '8 types de blocs', '5 templates prédéfinis', 'Export HTML'],
    },
    {
      id: 'save-the-date',
      title: 'Save the Date',
      description: 'Créez et personnalisez votre email Save the Date pour annoncer votre événement à l\'avance. Design professionnel et moderne.',
      icon: Bell,
      color: 'from-[#004645] to-[#009197]',
      href: `/admin/events/${eventId}/save-the-date`,
      features: ['Template dédié Save the Date', 'Personnalisation complète', 'Aperçu en temps réel', 'Intégration automatique détails événement'],
    },
    {
      id: 'invitation',
      title: 'Invitation Officielle',
      description: 'Créez votre email d\'invitation officielle avec tous les détails de l\'événement, programme, lieu et informations pratiques.',
      icon: Mail,
      color: 'from-[#FF4713] to-[#FF6B3D]',
      href: `/admin/events/${eventId}/invitation`,
      features: ['Template dédié Invitation', 'Intégration programme', 'Informations pratiques', 'RSVP intégré', 'QR codes invités'],
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-[#004645]" style={{ fontFamily: "var(--font-abril)" }}>
          <Sparkles className="inline h-8 w-8 mr-2 text-[#009197]" />
          Templates & Emails
        </h2>
        <p className="text-[#004645]/70 mt-2 text-lg">
          Créez et personnalisez vos emails d&apos;événement avec nos outils professionnels
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-[#9CD9F6]/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#004645]">3</p>
                <p className="text-sm text-[#004645]/70">Types de templates</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-[#9CD9F6]/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-gradient-to-br from-[#009197]/10 to-[#004645]/10">
                <Wand2 className="h-6 w-6 text-[#009197]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#004645]">8</p>
                <p className="text-sm text-[#004645]/70">Blocs disponibles</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-[#9CD9F6]/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-gradient-to-br from-[#FF4713]/10 to-[#FF6B3D]/10">
                <Send className="h-6 w-6 text-[#FF4713]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#004645]">100%</p>
                <p className="text-sm text-[#004645]/70">Personnalisable</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Template Cards */}
      <div className="grid grid-cols-1 gap-6">
        {templates.map((template) => {
          const Icon = template.icon
          return (
            <Card
              key={template.id}
              className="border-[#9CD9F6]/30 shadow-lg hover:shadow-xl transition-shadow overflow-hidden group"
            >
              <div className={`h-2 bg-gradient-to-r ${template.color}`} />
              <CardHeader className="bg-gradient-to-r from-[#004645]/5 to-[#009197]/5">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`p-4 rounded-xl bg-gradient-to-br ${template.color} shadow-lg`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-[#004645] text-2xl flex items-center gap-2">
                        {template.title}
                      </CardTitle>
                      <CardDescription className="mt-2 text-base">
                        {template.description}
                      </CardDescription>
                    </div>
                  </div>
                  <Button
                    onClick={() => router.push(template.href)}
                    className={`bg-gradient-to-r ${template.color} hover:opacity-90 transition-opacity`}
                    size="lg"
                  >
                    Ouvrir
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex flex-wrap gap-2">
                  {template.features.map((feature, idx) => (
                    <div
                      key={idx}
                      className="px-3 py-1.5 rounded-full bg-[#9CD9F6]/20 text-sm text-[#004645] font-medium"
                    >
                      {feature}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Help Card */}
      <Card className="border-[#9CD9F6]/30 bg-gradient-to-r from-[#004645]/5 to-[#009197]/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-[#009197]/10">
              <Sparkles className="h-6 w-6 text-[#009197]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#004645] mb-2">
                Comment choisir le bon template ?
              </h3>
              <ul className="space-y-2 text-[#004645]/70">
                <li className="flex items-start gap-2">
                  <span className="text-[#009197] mt-1">•</span>
                  <span><strong>Éditeur WYSIWYG</strong> : Pour créer des emails 100% personnalisés avec une liberté totale</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#009197] mt-1">•</span>
                  <span><strong>Save the Date</strong> : Pour annoncer votre événement en avance (3-6 mois avant)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#009197] mt-1">•</span>
                  <span><strong>Invitation Officielle</strong> : Pour envoyer l&apos;invitation complète avec tous les détails</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
