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
  Clock, MapPin, Bed, Activity, Zap, Shield, Code
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

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

        <Tabs defaultValue="quickstart" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="quickstart" className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              Démarrage rapide
            </TabsTrigger>
            <TabsTrigger value="features" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Fonctionnalités
            </TabsTrigger>
            <TabsTrigger value="technical" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              Documentation technique
            </TabsTrigger>
          </TabsList>

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

          {/* ONGLET 3 : Documentation technique */}
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
