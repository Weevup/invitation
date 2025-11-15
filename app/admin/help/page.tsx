"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  BookOpen, Calendar, Users, Mail, BarChart, Settings,
  CheckCircle, ArrowRight, Sparkles, Play, FileText,
  Database, ExternalLink, Lightbulb, Plane, Hotel,
  AlertTriangle, TrendingUp, FileSpreadsheet, Download,
  Clock, MapPin, Bed, Activity, Zap, Shield, Code, Rocket,
  Eye, TestTube
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { ChangelogCard, changelogData } from '@/components/admin/changelog-card'

export default function HelpPage() {
  const [activeStep, setActiveStep] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#9CD9F6] via-white to-[#9CD9F6] p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-[#004645] mb-2" style={{ fontFamily: "var(--font-abril)" }}>
            Documentation & Aide
          </h1>
          <p className="text-[#004645]/70">
            Guides, fonctionnalités et ressources pour maîtriser Weevup
          </p>
        </div>

        <Tabs defaultValue="changelog" className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-8">
            <TabsTrigger value="changelog" className="flex items-center gap-2">
              <Rocket className="h-4 w-4" />
              Nouveautés
            </TabsTrigger>
            <TabsTrigger value="quickstart" className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              Démarrage rapide
            </TabsTrigger>
            <TabsTrigger value="features" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Fonctionnalités
            </TabsTrigger>
            <TabsTrigger value="monitoring" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Monitoring
            </TabsTrigger>
            <TabsTrigger value="tests" className="flex items-center gap-2">
              <TestTube className="h-4 w-4" />
              Tests
            </TabsTrigger>
            <TabsTrigger value="technical" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              Documentation technique
            </TabsTrigger>
          </TabsList>

          {/* ONGLET 0 : Nouveautés & Changelog */}
          <TabsContent value="changelog">
            <div className="space-y-6">
              <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-[#004645] flex items-center gap-2">
                    <Rocket className="h-6 w-6 text-[#FF4713]" />
                    Dernières Améliorations & Optimisations
                  </CardTitle>
                  <CardDescription>
                    Découvrez les nouvelles fonctionnalités, optimisations et améliorations récentes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {changelogData.map((item) => (
                      <ChangelogCard key={item.id} item={item} compact />
                    ))}
                  </div>

                  {changelogData.length === 0 && (
                    <div className="text-center py-12 text-[#004645]/70">
                      <Rocket className="h-12 w-12 mx-auto mb-4 text-[#009197]" />
                      <p>Aucune nouveauté pour le moment</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Guide d'utilisation des nouvelles fonctionnalités */}
              <Card className="border-[#FF4713]/30 bg-gradient-to-br from-orange-50 to-white">
                <CardHeader>
                  <CardTitle className="text-[#004645] flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-[#FF4713]" />
                    Comment profiter des nouveautés ?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Badge className="bg-[#009197] text-white">1</Badge>
                    <div>
                      <p className="font-medium text-[#004645]">Testez la prévisualisation RSVP interactive</p>
                      <p className="text-sm text-[#004645]/70 mt-1">
                        Allez dans Configuration RSVP → Cliquez sur &quot;Test interactif&quot; pour voir le parcours complet
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Badge className="bg-[#009197] text-white">2</Badge>
                    <div>
                      <p className="font-medium text-[#004645]">Utilisez les templates RSVP</p>
                      <p className="text-sm text-[#004645]/70 mt-1">
                        Cliquez sur &quot;Templates&quot; ✨ et choisissez parmi 7 configurations prédéfinies (Mariage, Corporate, etc.)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Badge className="bg-[#009197] text-white">3</Badge>
                    <div>
                      <p className="font-medium text-[#004645]">Profitez des nouveaux champs enrichis</p>
                      <p className="text-sm text-[#004645]/70 mt-1">
                        Collectez contact d&apos;urgence, taille vêtement, horaires précis d&apos;arrivée/départ, budget événement
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ONGLET 1 : Démarrage rapide (ancien tutoriel) */}
          <TabsContent value="quickstart">
            <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-[#004645] flex items-center gap-2">
                  <BookOpen className="h-6 w-6 text-[#009197]" />
                  Guide de démarrage en 6 étapes
                </CardTitle>
                <CardDescription>
                  Suivez ces étapes pour créer et gérer votre premier événement
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  {
                    id: 1,
                    title: "Configurer l'envoi d'emails",
                    icon: Settings,
                    color: "text-[#009197]",
                    description: "Configurez une ou plusieurs intégrations email (SendGrid, Resend, Mailgun, SMTP)",
                    details: [
                      "Allez dans Communication → Intégrations dans le menu",
                      "Choisissez votre provider (SendGrid, Resend, Mailgun ou SMTP custom)",
                      "Configurez les clés API et paramètres du provider",
                      "Définissez l'email expéditeur vérifié et le nom d'expédition",
                      "Activez le tracking des ouvertures et clics",
                      "Définissez une intégration comme primaire",
                      "Testez la connexion avec le bouton 'Tester la connexion'"
                    ],
                    link: "/admin/settings/integrations"
                  },
                  {
                    id: 2,
                    title: "Créer votre événement",
                    icon: Calendar,
                    color: "text-[#004645]",
                    description: "Créez votre événement et personnalisez la page showcase publique",
                    details: [
                      "Cliquez sur 'Événements' puis 'Nouvel événement'",
                      "Onglet Informations : Nom, date, lieu, description, programme",
                      "Onglet Showcase : Configurez votre page publique",
                      "  → Ajoutez speakers avec photos, bio et titre",
                      "  → Créez une timeline de la journée avec horaires",
                      "  → Ajoutez des sponsors (Platine, Or, Argent, Bronze)",
                      "  → Créez une galerie de photos",
                      "  → Ajoutez une FAQ avec questions/réponses",
                      "Onglet Configuration : Options RSVP, +1, choix de repas, deadline"
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
                      "Accédez à la page de votre événement → Onglet Invités",
                      "Cliquez sur 'Ajouter des invités' ou 'Importer CSV'",
                      "Format CSV : Prénom, Nom, Email, Entreprise, Tags",
                      "Vérifiez que tous les invités sont bien importés",
                      "Chaque invité reçoit automatiquement un token unique"
                    ],
                    link: "/admin/rsvp"
                  },
                  {
                    id: 4,
                    title: "Gérer les communications",
                    icon: Mail,
                    color: "text-[#009197]",
                    description: "Planifiez et envoyez vos communications (Save the Date, Invitation, Rappel)",
                    details: [
                      "Accédez à 'Communications' depuis la page événement",
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
                    link: "/admin/analytics"
                  },
                  {
                    id: 6,
                    title: "Jour de l'événement",
                    icon: CheckCircle,
                    color: "text-green-600",
                    description: "Gérez les arrivées et le check-in avec les QR codes",
                    details: [
                      "Mode Check-in : Scannez les QR codes à l'entrée",
                      "Consultez la liste des présents en temps réel",
                      "Marquez manuellement les invités sans QR code",
                      "Gérez les invités de dernière minute",
                      "Exportez le rapport final après l'événement"
                    ],
                    link: "/admin"
                  }
                ].map((step) => {
                  const StepIcon = step.icon
                  const isExpanded = activeStep === step.id

                  return (
                    <div
                      key={step.id}
                      className="border border-[#9CD9F6]/30 rounded-lg overflow-hidden bg-white"
                    >
                      <button
                        onClick={() => setActiveStep(isExpanded ? null : step.id)}
                        className="w-full p-6 text-left hover:bg-gray-50/50 transition-colors"
                      >
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-lg bg-gradient-to-br ${step.color === 'text-[#009197]' ? 'from-[#009197]/10 to-[#9CD9F6]/20' : step.color === 'text-[#004645]' ? 'from-[#004645]/10 to-[#009197]/20' : 'from-orange-500/10 to-red-500/20'}`}>
                            <StepIcon className={`h-6 w-6 ${step.color}`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Badge variant="outline" className="font-mono text-xs">
                                Étape {step.id}
                              </Badge>
                              <h3 className="text-lg font-semibold text-[#004645]">
                                {step.title}
                              </h3>
                              <ArrowRight className={`ml-auto h-5 w-5 text-[#004645]/40 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                            </div>
                            <p className="text-[#004645]/70">{step.description}</p>
                          </div>
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="px-6 pb-6 space-y-4 bg-gray-50/30">
                          <ul className="space-y-2 ml-16">
                            {step.details.map((detail, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm text-[#004645]/80">
                                <CheckCircle className="h-4 w-4 text-[#009197] mt-0.5 flex-shrink-0" />
                                <span>{detail}</span>
                              </li>
                            ))}
                          </ul>
                          <Link href={step.link}>
                            <Button className="ml-16 bg-gradient-to-r from-[#004645] to-[#009197] hover:from-[#006C51] hover:to-[#009197] text-white">
                              Aller à cette section
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ONGLET 2 : Fonctionnalités (ancien modules-showcase) */}
          <TabsContent value="features">
            <div className="grid gap-6 md:grid-cols-2">
              {[
                {
                  id: 'program',
                  name: 'Programme & Sessions',
                  icon: Calendar,
                  color: 'from-blue-500 to-blue-600',
                  description: 'Créez et gérez le programme complet de votre événement',
                  features: [
                    '14 types de sessions : keynote, workshop, meal, networking, etc.',
                    'Gestion des inscriptions avec capacités et listes d\'attente',
                    'Timeline visuelle sur la page publique',
                    'Export des participants par session'
                  ],
                  status: 'live'
                },
                {
                  id: 'transport',
                  name: 'Gestion des Transports',
                  icon: Plane,
                  color: 'from-purple-500 to-purple-600',
                  description: 'Coordonnez les arrivées et navettes de vos invités',
                  features: [
                    'Collecte des infos de vol/train lors du RSVP',
                    'Planification des navettes entre l\'aéroport et l\'hôtel',
                    'Vue consolidée des arrivées par jour/horaire',
                    'Export pour les prestataires de transport'
                  ],
                  status: 'live'
                },
                {
                  id: 'accommodation',
                  name: 'Hébergement',
                  icon: Hotel,
                  color: 'from-green-500 to-green-600',
                  description: 'Gérez l\'attribution des chambres et hébergements',
                  features: [
                    'Création de lieux d\'hébergement (hôtels, résidences)',
                    'Attribution automatique ou manuelle des chambres',
                    'Gestion des types de chambres et capacités',
                    'Export des listes de rooming pour les hôtels'
                  ],
                  status: 'live'
                },
                {
                  id: 'communications',
                  name: 'Communications Planifiées',
                  icon: Mail,
                  color: 'from-[#009197] to-[#004645]',
                  description: 'Programmez tous vos envois d\'emails à l\'avance',
                  features: [
                    'Save the Date, Invitation, Rappels programmables',
                    'Relances automatiques configurables (J-7, J-3, J-1)',
                    'Templates personnalisables avec variables dynamiques',
                    'Tracking des ouvertures et clics en temps réel'
                  ],
                  status: 'live'
                },
                {
                  id: 'analytics',
                  name: 'Analytics & Statistiques',
                  icon: BarChart,
                  color: 'from-orange-500 to-red-500',
                  description: 'Analyses détaillées de vos événements',
                  features: [
                    'Taux de réponse et conversion RSVP',
                    'Performances des emails (ouvertures, clics)',
                    'Répartition par catégories d\'invités',
                    'Export des données pour rapports personnalisés'
                  ],
                  status: 'live'
                },
                {
                  id: 'showcase',
                  name: 'Page Publique Showcase',
                  icon: Sparkles,
                  color: 'from-pink-500 to-rose-600',
                  description: 'Créez une landing page élégante pour votre événement',
                  features: [
                    'Design moderne et responsive',
                    'Sections : Speakers, Timeline, Sponsors, FAQ, Galerie',
                    'Personnalisation des couleurs et typographies',
                    'Formulaire RSVP intégré avec QR code'
                  ],
                  status: 'live'
                }
              ].map((module) => {
                const ModuleIcon = module.icon
                return (
                  <Card key={module.id} className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${module.color} flex items-center justify-center mb-4`}>
                        <ModuleIcon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-[#004645]">{module.name}</CardTitle>
                        <Badge className="bg-green-600 text-white">
                          {module.status === 'live' ? '✓ Disponible' : 'Bientôt'}
                        </Badge>
                      </div>
                      <CardDescription>{module.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {module.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-[#004645]/80">
                            <CheckCircle className="h-4 w-4 text-[#009197] mt-0.5 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          {/* ONGLET 4 : Monitoring & Performance */}
          <TabsContent value="monitoring">
            <div className="grid gap-6">
              {/* Sentry Error Tracking */}
              <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-[#004645] flex items-center gap-2">
                    <Shield className="h-6 w-6 text-[#FF4713]" />
                    Sentry : Monitoring des Erreurs
                  </CardTitle>
                  <CardDescription>
                    Suivi automatique des erreurs en production avec session replay
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-[#004645] mb-3 flex items-center gap-2">
                      <Zap className="h-5 w-5 text-[#009197]" />
                      Configuration
                    </h3>
                    <div className="ml-7 space-y-3">
                      <div className="flex items-start gap-2">
                        <Badge className="bg-[#009197] text-white mt-1">1</Badge>
                        <div className="flex-1">
                          <p className="text-sm text-[#004645]">
                            Créez un compte gratuit sur{' '}
                            <a href="https://sentry.io" target="_blank" rel="noopener noreferrer" className="text-[#009197] hover:underline">
                              sentry.io
                            </a>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Badge className="bg-[#009197] text-white mt-1">2</Badge>
                        <div className="flex-1">
                          <p className="text-sm text-[#004645] mb-2">
                            Ajoutez la variable d&apos;environnement dans Vercel :
                          </p>
                          <div className="bg-gray-900 rounded-lg p-3 font-mono text-sm text-gray-100">
                            <span className="text-green-400">NEXT_PUBLIC_SENTRY_DSN</span>=&quot;https://votre-dsn@sentry.io/votre-project-id&quot;
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Badge className="bg-[#009197] text-white mt-1">3</Badge>
                        <div className="flex-1">
                          <p className="text-sm text-[#004645]">
                            C&apos;est tout ! Les erreurs sont automatiquement capturées.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-[#004645] mb-3 flex items-center gap-2">
                      <Activity className="h-5 w-5 text-[#009197]" />
                      Couverture Automatique
                    </h3>
                    <ul className="space-y-2 ml-7">
                      <li className="flex items-start gap-2 text-sm text-[#004645]/80">
                        <CheckCircle className="h-4 w-4 text-[#009197] mt-0.5 flex-shrink-0" />
                        <span><strong>59 composants/pages</strong> tracés automatiquement</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm text-[#004645]/80">
                        <CheckCircle className="h-4 w-4 text-[#009197] mt-0.5 flex-shrink-0" />
                        <span><strong>Session Replay</strong> : Revoyez exactement ce qui s&apos;est passé avant un crash</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm text-[#004645]/80">
                        <CheckCircle className="h-4 w-4 text-[#009197] mt-0.5 flex-shrink-0" />
                        <span><strong>Contexte enrichi</strong> : User ID, route, browser, device</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm text-[#004645]/80">
                        <CheckCircle className="h-4 w-4 text-[#009197] mt-0.5 flex-shrink-0" />
                        <span><strong>Breadcrumbs</strong> : Historique des actions utilisateur</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-[#004645] mb-2 flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-blue-600" />
                      Alertes et Notifications
                    </h4>
                    <p className="text-sm text-[#004645]/80">
                      Configurez des alertes Slack/Email sur le dashboard Sentry pour être notifié immédiatement des erreurs critiques.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Web Vitals Performance */}
              <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-[#004645] flex items-center gap-2">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                    Web Vitals : Performance Monitoring
                  </CardTitle>
                  <CardDescription>
                    Tracking automatique des Core Web Vitals et métriques de performance
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-[#004645] mb-3">Métriques Suivies</h3>
                    <div className="grid gap-3 ml-7">
                      <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                        <Badge className="bg-green-600 text-white">LCP</Badge>
                        <div>
                          <p className="font-medium text-sm text-[#004645]">Largest Contentful Paint</p>
                          <p className="text-xs text-[#004645]/70">Temps de chargement du contenu principal (&lt; 2.5s)</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <Badge className="bg-blue-600 text-white">FID</Badge>
                        <div>
                          <p className="font-medium text-sm text-[#004645]">First Input Delay</p>
                          <p className="text-xs text-[#004645]/70">Réactivité aux interactions (&lt; 100ms)</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                        <Badge className="bg-purple-600 text-white">CLS</Badge>
                        <div>
                          <p className="font-medium text-sm text-[#004645]">Cumulative Layout Shift</p>
                          <p className="text-xs text-[#004645]/70">Stabilité visuelle (&lt; 0.1)</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                        <Badge className="bg-orange-600 text-white">FCP</Badge>
                        <div>
                          <p className="font-medium text-sm text-[#004645]">First Contentful Paint</p>
                          <p className="text-xs text-[#004645]/70">Premier élément visible (&lt; 1.8s)</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-teal-50 rounded-lg border border-teal-200">
                        <Badge className="bg-teal-600 text-white">TTFB</Badge>
                        <div>
                          <p className="font-medium text-sm text-[#004645]">Time to First Byte</p>
                          <p className="text-xs text-[#004645]/70">Temps de réponse serveur (&lt; 800ms)</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-pink-50 rounded-lg border border-pink-200">
                        <Badge className="bg-pink-600 text-white">INP</Badge>
                        <div>
                          <p className="font-medium text-sm text-[#004645]">Interaction to Next Paint</p>
                          <p className="text-xs text-[#004645]/70">Fluidité des interactions (&lt; 200ms)</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-[#004645] mb-3 flex items-center gap-2">
                      <Eye className="h-5 w-5 text-[#009197]" />
                      Visualisation
                    </h3>
                    <ul className="space-y-2 ml-7">
                      <li className="flex items-start gap-2 text-sm text-[#004645]/80">
                        <CheckCircle className="h-4 w-4 text-[#009197] mt-0.5 flex-shrink-0" />
                        <span>Dashboard Sentry : Vue consolidée de toutes les métriques</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm text-[#004645]/80">
                        <CheckCircle className="h-4 w-4 text-[#009197] mt-0.5 flex-shrink-0" />
                        <span>Vercel Analytics : Core Web Vitals par route</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm text-[#004645]/80">
                        <CheckCircle className="h-4 w-4 text-[#009197] mt-0.5 flex-shrink-0" />
                        <span>Contexte enrichi : Device, connection speed, navigation type</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <h4 className="font-semibold text-[#004645] mb-2 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      Conseils d&apos;Optimisation
                    </h4>
                    <ul className="space-y-1 text-sm text-[#004645]/80">
                      <li className="flex items-start gap-2">
                        <span className="text-amber-600">•</span>
                        <span>Utilisez Next.js Image pour optimiser automatiquement les images</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-amber-600">•</span>
                        <span>Activez le cache avec React Server Components</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-amber-600">•</span>
                        <span>Minimisez les bundles JavaScript avec dynamic imports</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Centralized Logging */}
              <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-[#004645] flex items-center gap-2">
                    <FileText className="h-6 w-6 text-[#009197]" />
                    Logging Centralisé
                  </CardTitle>
                  <CardDescription>
                    Système de logs structurés pour debugging et audit
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-[#004645] mb-3">Côté Serveur (Pino)</h3>
                    <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm text-gray-100 overflow-x-auto">
                      <pre>{`import { logger } from '@/lib/logger'

// Exemple d'utilisation
logger.info('User logged in', { userId: user.id })
logger.error('Payment failed', { error, amount })
logger.warn('Rate limit approaching', { remaining: 10 })`}</pre>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-[#004645] mb-3">Côté Client (ClientLogger)</h3>
                    <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm text-gray-100 overflow-x-auto">
                      <pre>{`import { ClientLogger } from '@/lib/client-logger'

// Exemple d'utilisation
ClientLogger.info('Page loaded', { route: '/admin' })
ClientLogger.error('Form validation failed', { errors })
ClientLogger.warn('Slow API response', { duration: 5000 })`}</pre>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-[#004645] mb-3 flex items-center gap-2">
                      <Zap className="h-5 w-5 text-[#009197]" />
                      Intégration Sentry
                    </h3>
                    <ul className="space-y-2 ml-7">
                      <li className="flex items-start gap-2 text-sm text-[#004645]/80">
                        <CheckCircle className="h-4 w-4 text-[#009197] mt-0.5 flex-shrink-0" />
                        <span>Les logs d&apos;erreur sont automatiquement envoyés à Sentry</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm text-[#004645]/80">
                        <CheckCircle className="h-4 w-4 text-[#009197] mt-0.5 flex-shrink-0" />
                        <span>Format JSON structuré pour faciliter l&apos;analyse</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm text-[#004645]/80">
                        <CheckCircle className="h-4 w-4 text-[#009197] mt-0.5 flex-shrink-0" />
                        <span>Contexte enrichi avec breadcrumbs et user data</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ONGLET 5 : Tests & Qualité */}
          <TabsContent value="tests">
            <div className="grid gap-6">
              {/* Vitest Unit Tests */}
              <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-[#004645] flex items-center gap-2">
                    <TestTube className="h-6 w-6 text-[#009197]" />
                    Vitest : Tests Unitaires
                  </CardTitle>
                  <CardDescription>
                    Framework de tests ultra-rapide pour composants et fonctions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div>
                      <p className="font-semibold text-[#004645] text-lg">15 tests</p>
                      <p className="text-sm text-[#004645]/70">100% passing</p>
                    </div>
                    <Badge className="bg-green-600 text-white text-lg px-4 py-2">
                      ✓ All Pass
                    </Badge>
                  </div>

                  <div>
                    <h3 className="font-semibold text-[#004645] mb-3 flex items-center gap-2">
                      <Code className="h-5 w-5 text-[#009197]" />
                      Commandes Disponibles
                    </h3>
                    <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm text-gray-100 space-y-2">
                      <div className="flex items-start gap-2">
                        <span className="text-blue-400">npm run</span>
                        <span className="text-green-400">test</span>
                        <span className="text-gray-400 ml-4"># Mode watch interactif</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-blue-400">npm run</span>
                        <span className="text-green-400">test:run</span>
                        <span className="text-gray-400 ml-4"># Exécution unique (CI)</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-blue-400">npm run</span>
                        <span className="text-green-400">test:ui</span>
                        <span className="text-gray-400 ml-4"># Interface graphique</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-blue-400">npm run</span>
                        <span className="text-green-400">test:coverage</span>
                        <span className="text-gray-400 ml-4"># Rapport de couverture</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-[#004645] mb-3">Tests Existants</h3>
                    <ul className="space-y-2 ml-7">
                      <li className="flex items-start gap-2 text-sm text-[#004645]/80">
                        <CheckCircle className="h-4 w-4 text-[#009197] mt-0.5 flex-shrink-0" />
                        <span><strong>ScrollReveal</strong> : Animation au défilement (5 tests)</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm text-[#004645]/80">
                        <CheckCircle className="h-4 w-4 text-[#009197] mt-0.5 flex-shrink-0" />
                        <span><strong>QRCodeGenerator</strong> : Génération de QR codes (4 tests)</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm text-[#004645]/80">
                        <CheckCircle className="h-4 w-4 text-[#009197] mt-0.5 flex-shrink-0" />
                        <span><strong>GuestBadge</strong> : Composant badge invité (3 tests)</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm text-[#004645]/80">
                        <CheckCircle className="h-4 w-4 text-[#009197] mt-0.5 flex-shrink-0" />
                        <span><strong>Utilities</strong> : Fonctions helpers et utils (3 tests)</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm text-gray-100">
                    <div className="text-gray-400 mb-2">{'//'} Exemple de test unitaire</div>
                    <pre>{`import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MyComponent } from './my-component'

describe('MyComponent', () => {
  it('should render children', () => {
    render(<MyComponent>Hello</MyComponent>)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })
})`}</pre>
                  </div>
                </CardContent>
              </Card>

              {/* Playwright E2E Tests */}
              <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-[#004645] flex items-center gap-2">
                    <Activity className="h-6 w-6 text-purple-600" />
                    Playwright : Tests End-to-End
                  </CardTitle>
                  <CardDescription>
                    Tests de parcours utilisateur complets dans un vrai navigateur
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-[#004645] mb-3 flex items-center gap-2">
                      <Code className="h-5 w-5 text-[#009197]" />
                      Commandes Disponibles
                    </h3>
                    <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm text-gray-100 space-y-2">
                      <div className="flex items-start gap-2">
                        <span className="text-blue-400">npm run</span>
                        <span className="text-green-400">test:e2e</span>
                        <span className="text-gray-400 ml-4"># Exécution headless</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-blue-400">npm run</span>
                        <span className="text-green-400">test:e2e:ui</span>
                        <span className="text-gray-400 ml-4"># Interface graphique</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-blue-400">npm run</span>
                        <span className="text-green-400">test:e2e:headed</span>
                        <span className="text-gray-400 ml-4"># Voir le navigateur</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-blue-400">npm run</span>
                        <span className="text-green-400">test:e2e:debug</span>
                        <span className="text-gray-400 ml-4"># Mode debug</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-[#004645] mb-3">Scénarios Testés</h3>
                    <ul className="space-y-2 ml-7">
                      <li className="flex items-start gap-2 text-sm text-[#004645]/80">
                        <CheckCircle className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                        <span><strong>Login Flow</strong> : Authentification et gestion de session</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm text-[#004645]/80">
                        <CheckCircle className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                        <span><strong>Event Creation</strong> : Création événement de bout en bout</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm text-[#004645]/80">
                        <CheckCircle className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                        <span><strong>RSVP Process</strong> : Parcours complet de réponse invité</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm text-[#004645]/80">
                        <CheckCircle className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                        <span><strong>Guest Management</strong> : Import CSV et gestion invités</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-semibold text-[#004645] mb-2 flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-purple-600" />
                      Multi-Browser Testing
                    </h4>
                    <p className="text-sm text-[#004645]/80">
                      Playwright teste automatiquement sur Chromium, Firefox et WebKit pour garantir la compatibilité cross-browser.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Quality Checklist */}
              <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-[#004645] flex items-center gap-2">
                    <Shield className="h-6 w-6 text-green-600" />
                    Checklist Qualité
                  </CardTitle>
                  <CardDescription>
                    Standards de qualité avant déploiement en production
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-sm text-[#004645]">All tests passing</p>
                        <p className="text-xs text-[#004645]/70">npm run test:run && npm run test:e2e</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-sm text-[#004645]">TypeScript compilation clean</p>
                        <p className="text-xs text-[#004645]/70">npm run build (zero errors)</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-sm text-[#004645]">ESLint warnings zero</p>
                        <p className="text-xs text-[#004645]/70">npm run lint (clean output)</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-sm text-[#004645]">Sentry configured</p>
                        <p className="text-xs text-[#004645]/70">NEXT_PUBLIC_SENTRY_DSN set in production</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-sm text-[#004645]">Core Web Vitals monitored</p>
                        <p className="text-xs text-[#004645]/70">Automatic tracking via lib/web-vitals.ts</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ONGLET 6 : Documentation technique */}
          <TabsContent value="technical">
            <div className="grid gap-6">
              <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-[#004645] flex items-center gap-2">
                    <Database className="h-6 w-6 text-[#009197]" />
                    Architecture & Technologies
                  </CardTitle>
                  <CardDescription>
                    Stack technique et architecture de l&apos;application
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-[#004645] mb-3 flex items-center gap-2">
                      <Zap className="h-5 w-5 text-[#009197]" />
                      Frontend
                    </h3>
                    <ul className="space-y-2 ml-7">
                      <li className="text-sm text-[#004645]/80">
                        <strong>Next.js 15.5.6</strong> - Framework React avec App Router et Server Components
                      </li>
                      <li className="text-sm text-[#004645]/80">
                        <strong>TypeScript</strong> - Typage statique pour plus de sécurité
                      </li>
                      <li className="text-sm text-[#004645]/80">
                        <strong>Tailwind CSS</strong> - Styling utility-first
                      </li>
                      <li className="text-sm text-[#004645]/80">
                        <strong>shadcn/ui</strong> - Composants UI modernes et accessibles
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold text-[#004645] mb-3 flex items-center gap-2">
                      <Database className="h-5 w-5 text-[#009197]" />
                      Backend & Database
                    </h3>
                    <ul className="space-y-2 ml-7">
                      <li className="text-sm text-[#004645]/80">
                        <strong>Prisma ORM 6.19.0</strong> - Modélisation et requêtes type-safe
                      </li>
                      <li className="text-sm text-[#004645]/80">
                        <strong>PostgreSQL (Neon)</strong> - Base de données serverless
                      </li>
                      <li className="text-sm text-[#004645]/80">
                        <strong>NextAuth.js v5</strong> - Authentification sécurisée
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold text-[#004645] mb-3 flex items-center gap-2">
                      <Mail className="h-5 w-5 text-[#009197]" />
                      Services Email
                    </h3>
                    <ul className="space-y-2 ml-7">
                      <li className="text-sm text-[#004645]/80">
                        <strong>SendGrid</strong> - Service email professionnel avec délivrabilité optimale
                      </li>
                      <li className="text-sm text-[#004645]/80">
                        <strong>Resend</strong> - Service email moderne pour développeurs
                      </li>
                      <li className="text-sm text-[#004645]/80">
                        <strong>Mailgun</strong> - Service email avec validation avancée
                      </li>
                      <li className="text-sm text-[#004645]/80">
                        <strong>SMTP Custom</strong> - Support pour tout serveur SMTP
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold text-[#004645] mb-3 flex items-center gap-2">
                      <Shield className="h-5 w-5 text-[#009197]" />
                      Sécurité
                    </h3>
                    <ul className="space-y-2 ml-7">
                      <li className="text-sm text-[#004645]/80">
                        <strong>AES-256-CBC</strong> - Chiffrement des clés API et données sensibles
                      </li>
                      <li className="text-sm text-[#004645]/80">
                        <strong>ENCRYPTION_KEY</strong> - Variable d&apos;environnement pour le chiffrement
                      </li>
                      <li className="text-sm text-[#004645]/80">
                        <strong>Role-based access</strong> - Gestion des permissions (ADMIN, GUEST)
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-[#004645] flex items-center gap-2">
                    <Settings className="h-6 w-6 text-[#009197]" />
                    Variables d&apos;environnement
                  </CardTitle>
                  <CardDescription>
                    Configuration requise pour le déploiement
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm text-gray-100">
                      <div className="space-y-2">
                        <div><span className="text-green-400">DATABASE_URL</span>=postgresql://...</div>
                        <div><span className="text-green-400">ENCRYPTION_KEY</span>={"<32+ chars>"}</div>
                        <div><span className="text-green-400">NEXTAUTH_SECRET</span>={"<random string>"}</div>
                        <div><span className="text-green-400">NEXTAUTH_URL</span>=https://your-domain.com</div>
                        <div><span className="text-green-400">CRON_SECRET</span>={"<random string>"}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 text-sm text-amber-800 bg-amber-50 p-3 rounded-lg border border-amber-200">
                      <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                      <div>
                        <strong>Important :</strong> Ne jamais commiter les fichiers .env dans Git.
                        Utilisez .env.example comme référence et configurez les variables dans votre
                        dashboard Vercel.
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-[#004645] flex items-center gap-2">
                    <ExternalLink className="h-6 w-6 text-[#009197]" />
                    Ressources externes
                  </CardTitle>
                  <CardDescription>
                    Documentation et liens utiles
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    <a
                      href="https://nextjs.org/docs"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-lg border border-[#9CD9F6]/30 hover:bg-gray-50/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-[#004645]" />
                        <div>
                          <div className="font-medium text-[#004645]">Next.js Documentation</div>
                          <div className="text-xs text-[#004645]/60">Framework React</div>
                        </div>
                      </div>
                      <ExternalLink className="h-4 w-4 text-[#004645]/40" />
                    </a>

                    <a
                      href="https://www.prisma.io/docs"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-lg border border-[#9CD9F6]/30 hover:bg-gray-50/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Database className="h-5 w-5 text-[#004645]" />
                        <div>
                          <div className="font-medium text-[#004645]">Prisma Documentation</div>
                          <div className="text-xs text-[#004645]/60">ORM TypeScript</div>
                        </div>
                      </div>
                      <ExternalLink className="h-4 w-4 text-[#004645]/40" />
                    </a>

                    <a
                      href="https://docs.sendgrid.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-lg border border-[#9CD9F6]/30 hover:bg-gray-50/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-[#004645]" />
                        <div>
                          <div className="font-medium text-[#004645]">SendGrid API</div>
                          <div className="text-xs text-[#004645]/60">Service email</div>
                        </div>
                      </div>
                      <ExternalLink className="h-4 w-4 text-[#004645]/40" />
                    </a>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
