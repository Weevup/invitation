"use client"

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RsvpFieldMap } from '@/components/rsvp-field-map'
import { RsvpSuggestions } from '@/components/rsvp-suggestions'
import {
  ArrowLeft,
  BookOpen,
  Lightbulb,
  Map,
  Code,
  Settings,
  ExternalLink,
  FileText,
  Download
} from 'lucide-react'
import Link from 'next/link'

export default function RsvpHelpPage() {
  const params = useParams()
  const eventId = params.id as string

  const quickLinks = [
    {
      title: "Guide complet de personnalisation",
      description: "Documentation exhaustive avec tous les champs et exemples",
      icon: BookOpen,
      href: "https://github.com/Weevup/invitation/blob/main/docs/RSVP_CUSTOMIZATION_GUIDE.md",
      color: "text-[#004645]",
      external: true
    },
    {
      title: "Référence rapide",
      description: "Tableau de correspondance et modifications courantes",
      icon: FileText,
      href: "https://github.com/Weevup/invitation/blob/main/docs/RSVP_QUICK_REFERENCE.md",
      color: "text-[#009197]",
      external: true
    },
    {
      title: "Configurer les étapes",
      description: "Personnaliser textes et ordre des étapes",
      icon: Settings,
      href: `/admin/events/${eventId}/rsvp-steps`,
      color: "text-[#FF4713]",
      external: false
    },
    {
      title: "Code source",
      description: "Fichier principal du formulaire RSVP invité",
      icon: Code,
      href: "https://github.com/Weevup/invitation/blob/main/app/guest/[token]/page.tsx",
      color: "text-purple-600",
      external: true
    }
  ]

  const commonModifications = [
    {
      title: "Changer le message de bienvenue",
      description: "Modifier \"Bonjour {prénom} 👋\" et \"Vous êtes invité(e) à\"",
      file: "/app/guest/[token]/page.tsx",
      lines: "309-313",
      difficulty: "Facile"
    },
    {
      title: "Changer le format de date",
      description: "Passer de format français à anglais ou autre",
      file: "/app/guest/[token]/page.tsx",
      lines: "336-346",
      difficulty: "Facile"
    },
    {
      title: "Ajouter le pays dans le lieu",
      description: "Afficher \"{venueName}, {ville}, {pays}\"",
      file: "/app/guest/[token]/page.tsx",
      lines: "348-353",
      difficulty: "Facile"
    },
    {
      title: "Personnaliser les questions",
      description: "Modifier tous les textes des étapes du formulaire",
      file: "Admin → /events/[id]/rsvp-steps",
      lines: "Interface graphique",
      difficulty: "Très facile"
    },
    {
      title: "Changer \"Votre réponse\" en \"RSVP\"",
      description: "Modifier le titre de la section formulaire",
      file: "/app/guest/[token]/page.tsx",
      lines: "368-369",
      difficulty: "Facile"
    },
    {
      title: "Activer/désactiver des étapes",
      description: "Afficher ou masquer accompagnants, repas, etc.",
      file: "Admin → Édition événement",
      lines: "Configuration RSVP",
      difficulty: "Très facile"
    }
  ]

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#004645]" style={{ fontFamily: "var(--font-abril)" }}>
            Aide à la personnalisation RSVP
          </h1>
          <p className="text-[#004645]/70 mt-1">
            Tout ce dont vous avez besoin pour personnaliser votre formulaire RSVP
          </p>
        </div>
        <Link href={`/admin/events/${eventId}/rsvp-steps`}>
          <Button variant="outline" className="border-[#004645] text-[#004645]">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à la configuration
          </Button>
        </Link>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickLinks.map((link, idx) => {
          const Icon = link.icon
          return (
            <Card
              key={idx}
              className="hover:shadow-lg transition-shadow cursor-pointer border-[#9CD9F6]/30"
              onClick={() => link.external ? window.open(link.href, '_blank') : window.location.href = link.href}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <Icon className={`h-8 w-8 ${link.color}`} />
                  {link.external && <ExternalLink className="h-4 w-4 text-gray-400" />}
                </div>
                <CardTitle className="text-lg text-[#004645] mt-2">{link.title}</CardTitle>
                <CardDescription className="text-sm">{link.description}</CardDescription>
              </CardHeader>
            </Card>
          )
        })}
      </div>

      {/* Main Content */}
      <Tabs defaultValue="map" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-[600px]">
          <TabsTrigger value="map" className="flex items-center gap-2">
            <Map className="h-4 w-4" />
            Carte des champs
          </TabsTrigger>
          <TabsTrigger value="suggestions" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Suggestions
          </TabsTrigger>
          <TabsTrigger value="common" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Modifications courantes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="map" className="space-y-4">
          <RsvpFieldMap />
        </TabsContent>

        <TabsContent value="suggestions" className="space-y-4">
          <RsvpSuggestions />
        </TabsContent>

        <TabsContent value="common" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-[#004645]">Modifications les plus courantes</CardTitle>
              <CardDescription>
                Exemples pratiques avec références de fichiers et lignes de code
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {commonModifications.map((mod, idx) => (
                  <div
                    key={idx}
                    className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-[#004645]">{mod.title}</h3>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          mod.difficulty === 'Très facile'
                            ? 'bg-green-100 text-green-700'
                            : mod.difficulty === 'Facile'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-orange-100 text-orange-700'
                        }`}
                      >
                        {mod.difficulty}
                      </span>
                    </div>
                    <p className="text-sm text-[#004645]/70 mb-3">{mod.description}</p>
                    <div className="flex items-center gap-4 text-xs text-[#004645]/60">
                      <div className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {mod.file}
                      </div>
                      <div className="flex items-center gap-1">
                        <Code className="h-3 w-3" />
                        {mod.lines}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-[#9CD9F6]/10 rounded-lg">
                <h4 className="font-semibold text-[#004645] mb-2 flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Guides téléchargeables
                </h4>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => window.open('https://github.com/Weevup/invitation/blob/main/docs/RSVP_CUSTOMIZATION_GUIDE.md', '_blank')}
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Guide complet de personnalisation (Markdown)
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => window.open('https://github.com/Weevup/invitation/blob/main/docs/RSVP_QUICK_REFERENCE.md', '_blank')}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Référence rapide (Markdown)
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Bottom CTA */}
      <Card className="bg-gradient-to-r from-[#004645] to-[#009197] text-white border-none">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2">Besoin d&apos;aide supplémentaire ?</h3>
              <p className="text-white/90 text-sm">
                Consultez la documentation complète ou contactez le support
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => window.open('https://github.com/Weevup/invitation/blob/main/docs/RSVP_CUSTOMIZATION_GUIDE.md', '_blank')}
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Documentation
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
