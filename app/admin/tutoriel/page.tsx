"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  BookOpen, Calendar, Users, Mail, BarChart, Settings,
  CheckCircle, ArrowRight, Sparkles, Play, FileText,
  Database, ExternalLink, Lightbulb
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

export default function TutorielPage() {
  const [activeStep, setActiveStep] = useState<number | null>(null)

  const steps = [
    {
      id: 1,
      title: "Configurer l'envoi d'emails",
      icon: Settings,
      color: "text-[#009197]",
      description: "Configurez votre service d'envoi d'emails (Resend ou SendGrid)",
      details: [
        "Allez dans Paramètres → Configuration Email",
        "Choisissez votre provider (Resend recommandé)",
        "Ajoutez votre clé API dans le fichier .env.local",
        "Configurez l'email expéditeur vérifié",
        "Testez la configuration avec un email de test"
      ],
      link: "/admin/settings/email"
    },
    {
      id: 2,
      title: "Créer votre événement",
      icon: Calendar,
      color: "text-[#004645]",
      description: "Créez votre événement et configurez le cycle de communication",
      details: [
        "Cliquez sur 'Événements' puis 'Nouvel événement'",
        "Remplissez les informations : nom, date, lieu, description",
        "Configurez le Save the Date (étape 1 : pré-invitation)",
        "Configurez l'Invitation officielle (étape 2 : détails complets)",
        "Configurez le formulaire RSVP (étape 3 : confirmation)"
      ],
      link: "/admin"
    },
    {
      id: 3,
      title: "Ajouter vos invités",
      icon: Users,
      color: "text-[#FF4713]",
      description: "Importez votre liste d'invités par CSV ou ajout manuel",
      details: [
        "Accédez à la page de votre événement",
        "Cliquez sur 'Ajouter des invités' ou 'Importer CSV'",
        "Format CSV : Prénom, Nom, Email, Entreprise, Tags",
        "Vérifiez que tous les invités sont bien importés",
        "Chaque invité reçoit automatiquement un token unique"
      ],
      link: "/admin/guests"
    },
    {
      id: 4,
      title: "Gérer les communications",
      icon: Mail,
      color: "text-[#009197]",
      description: "Planifiez et envoyez vos communications (Save the Date, Invitation, Rappel)",
      details: [
        "Accédez à 'Gestion des communications' depuis la page événement",
        "Onglet Planification : Programmez vos envois (dates automatiques ou manuelles)",
        "Save the Date (J-90 à J-60) : Annonce teaser de la date",
        "Invitation (J-60 à J-30) : Détails complets + lien RSVP",
        "Rappel (J-7 à J-2) : Confirmation avec QR code pour le jour J"
      ],
      link: "/admin"
    },
    {
      id: 5,
      title: "Suivre les statistiques",
      icon: BarChart,
      color: "text-green-600",
      description: "Analysez les performances de vos communications",
      details: [
        "Onglet Analytics : Consultez les taux d'ouverture et de clics",
        "Suivez la conversion RSVP en temps réel",
        "Identifiez les invités qui n'ont pas répondu",
        "Activez les relances automatiques pour les non-répondants",
        "Exportez les données pour vos rapports"
      ],
      link: "/admin"
    },
    {
      id: 6,
      title: "Jour de l'événement",
      icon: CheckCircle,
      color: "text-[#004645]",
      description: "Gérez le check-in et l'accueil de vos invités",
      details: [
        "Les invités présentent leur QR code (reçu par email)",
        "Scannez les QR codes pour valider l'entrée",
        "Consultez la liste des participants confirmés",
        "Exportez la liste finale pour impression",
        "Marquez les présences pour vos statistiques post-événement"
      ],
      link: "/admin/setup"
    }
  ]

  const features = [
    {
      title: "Gestion multi-événements",
      description: "Gérez plusieurs événements en parallèle avec une interface intuitive",
      icon: Calendar
    },
    {
      title: "Invitations personnalisées",
      description: "Chaque invité reçoit un lien unique et sécurisé pour RSVP",
      icon: Mail
    },
    {
      title: "Suivi en temps réel",
      description: "Suivez les réponses de vos invités instantanément",
      icon: CheckCircle
    },
    {
      title: "Export de données",
      description: "Exportez vos listes d'invités et statistiques en CSV",
      icon: FileText
    },
    {
      title: "Statistiques détaillées",
      description: "Analysez vos événements avec des graphiques et tableaux de bord",
      icon: BarChart
    },
    {
      title: "Configuration flexible",
      description: "Personnalisez l'expérience selon vos besoins",
      icon: Database
    }
  ]

  const tips = [
    {
      title: "Initialisez avec des données de démo",
      description: "Si vous débutez, utilisez le bouton 'Créer événement démo' sur le tableau de bord pour voir comment fonctionne l'outil avec des données exemple.",
      icon: Sparkles
    },
    {
      title: "Utilisez les filtres",
      description: "Sur les pages Invités et RSVP, utilisez les filtres pour trouver rapidement les personnes par statut, événement ou nom.",
      icon: Lightbulb
    },
    {
      title: "Vérifiez régulièrement les statistiques",
      description: "Le taux de réponse et les statistiques vous aident à savoir quand envoyer des relances.",
      icon: BarChart
    }
  ]

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="h-8 w-8 text-[#009197]" />
          <h1 className="text-3xl font-bold text-[#004645]" style={{ fontFamily: "var(--font-abril)" }}>
            Guide de démarrage
          </h1>
        </div>
        <p className="text-[#004645]/70 text-lg">
          Apprenez à utiliser Weevup pour gérer vos événements et invitations en quelques étapes simples
        </p>
      </div>

      {/* Quick Start Banner */}
      <Card className="border-[#009197] bg-gradient-to-r from-[#004645] to-[#009197] text-white mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center gap-2 text-2xl mb-2">
                <Play className="h-6 w-6" />
                Démarrage rapide
              </CardTitle>
              <CardDescription className="text-white/80 text-base">
                Créez votre premier événement en moins de 5 minutes
              </CardDescription>
            </div>
            <Link href="/admin/events/new">
              <Button className="bg-white text-[#004645] hover:bg-white/90">
                <Sparkles className="h-4 w-4 mr-2" />
                Commencer maintenant
              </Button>
            </Link>
          </div>
        </CardHeader>
      </Card>

      {/* Steps */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#004645] mb-6" style={{ fontFamily: "var(--font-abril)" }}>
          Étapes pour réussir votre événement
        </h2>
        <div className="space-y-4">
          {steps.map((step, index) => (
            <Card
              key={step.id}
              className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur hover:shadow-lg transition-all cursor-pointer"
              onClick={() => setActiveStep(activeStep === step.id ? null : step.id)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`p-3 rounded-lg bg-gradient-to-br from-white to-gray-50 shadow-sm`}>
                      <step.icon className={`h-6 w-6 ${step.color}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-bold text-[#009197] bg-[#9CD9F6]/20 px-2 py-1 rounded">
                          Étape {index + 1}
                        </span>
                        <CardTitle className="text-[#004645]">{step.title}</CardTitle>
                      </div>
                      <CardDescription className="text-base">{step.description}</CardDescription>

                      {activeStep === step.id && (
                        <div className="mt-4 space-y-3">
                          <ul className="space-y-2">
                            {step.details.map((detail, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm text-[#004645]/80">
                                <CheckCircle className="h-4 w-4 text-[#009197] mt-0.5 flex-shrink-0" />
                                <span>{detail}</span>
                              </li>
                            ))}
                          </ul>
                          <Link href={step.link}>
                            <Button className="bg-gradient-to-r from-[#004645] to-[#009197] hover:from-[#006C51] hover:to-[#009197] text-white mt-2">
                              Aller à cette étape
                              <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                  <ArrowRight className={`h-5 w-5 text-[#004645]/40 transition-transform ${activeStep === step.id ? 'rotate-90' : ''}`} />
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>

      {/* Features Grid */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#004645] mb-6" style={{ fontFamily: "var(--font-abril)" }}>
          Fonctionnalités principales
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-[#004645] to-[#009197] text-white">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-[#004645] text-lg mb-2">{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>

      {/* Tips & Tricks */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#004645] mb-6" style={{ fontFamily: "var(--font-abril)" }}>
          Conseils et astuces
        </h2>
        <div className="space-y-4">
          {tips.map((tip, index) => (
            <Card key={index} className="border-[#9CD9F6]/30 bg-gradient-to-r from-[#9CD9F6]/10 to-white backdrop-blur">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <tip.icon className="h-6 w-6 text-[#FF4713] flex-shrink-0 mt-1" />
                  <div>
                    <CardTitle className="text-[#004645] text-lg mb-2">{tip.title}</CardTitle>
                    <CardDescription className="text-base">{tip.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>

      {/* Help Section */}
      <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-[#004645] flex items-center gap-2">
            <Lightbulb className="h-6 w-6 text-[#FF4713]" />
            Besoin d&apos;aide supplémentaire ?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-[#004645]/70 mb-4">
            Si vous avez des questions ou rencontrez des difficultés, n&apos;hésitez pas à :
          </p>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-[#009197]" />
              <span className="text-[#004645]">Consulter la page de configuration pour plus d&apos;options</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-[#009197]" />
              <span className="text-[#004645]">Utiliser les données de démo pour tester les fonctionnalités</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-[#009197]" />
              <span className="text-[#004645]">Explorer chaque page pour découvrir toutes les possibilités</span>
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            <Link href="/admin/setup">
              <Button variant="outline" className="border-[#009197] text-[#009197] hover:bg-[#009197] hover:text-white">
                <Settings className="h-4 w-4 mr-2" />
                Configuration
              </Button>
            </Link>
            <Link href="/admin">
              <Button className="bg-gradient-to-r from-[#004645] to-[#009197] hover:from-[#006C51] hover:to-[#009197] text-white">
                <ArrowRight className="h-4 w-4 mr-2" />
                Retour au tableau de bord
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
