'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Calendar,
  Plane,
  Hotel,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Users,
  FileSpreadsheet,
  Download,
  Clock,
  MapPin,
  Bed,
  Activity,
} from 'lucide-react'
import Link from 'next/link'

export default function ModulesShowcasePage() {
  const modules = [
    {
      id: 'program',
      name: 'Programme & Sessions',
      icon: Calendar,
      color: 'from-blue-500 to-blue-600',
      description: 'Créez et gérez le programme complet de votre événement',
      features: [
        {
          icon: Calendar,
          title: 'Sessions personnalisables',
          description: '14 types de sessions : keynote, workshop, meal, networking, etc.',
        },
        {
          icon: Users,
          title: 'Gestion des inscriptions',
          description: 'Capacités, listes d\'attente, inscriptions obligatoires',
        },
        {
          icon: Activity,
          title: 'Timeline globale',
          description: 'Vue chronologique complète avec filtres avancés',
        },
        {
          icon: AlertTriangle,
          title: 'Détection de conflits',
          description: 'Alertes automatiques pour les chevauchements horaires',
        },
      ],
      useCases: [
        'Séminaire d\'entreprise multi-jours',
        'Conférence avec workshops parallèles',
        'Team building avec activités variées',
        'Formation avec sessions obligatoires',
      ],
      stats: [
        { label: 'Types de sessions', value: '14' },
        { label: 'Capacité gérée', value: 'Illimitée' },
        { label: 'Filtres disponibles', value: '7+' },
      ],
    },
    {
      id: 'transport',
      name: 'Transport & Logistique',
      icon: Plane,
      color: 'from-teal-500 to-teal-600',
      description: 'Centralisez tous les déplacements de vos participants',
      features: [
        {
          icon: Plane,
          title: '6 types de transport',
          description: 'Vol, train, navette, taxi, location, voiture personnelle',
        },
        {
          icon: Users,
          title: 'Navettes collectives',
          description: 'Créez des manifestes avec gestion de capacité',
        },
        {
          icon: Clock,
          title: 'Suivi temps réel',
          description: 'Statuts : demandé, confirmé, réservé, annulé',
        },
        {
          icon: AlertTriangle,
          title: 'Alertes intelligentes',
          description: 'Détection invités sans transport, confirmations manquantes',
        },
      ],
      useCases: [
        'Organisation vols internationaux',
        'Navettes aéroport-hôtel groupées',
        'Coordination arrivées multiples',
        'Suivi budget transport',
      ],
      stats: [
        { label: 'Types de transport', value: '6' },
        { label: 'Statuts de suivi', value: '6' },
        { label: 'Manifestes illimités', value: '✓' },
      ],
    },
    {
      id: 'accommodation',
      name: 'Hébergement & Rooming',
      icon: Hotel,
      color: 'from-purple-500 to-purple-600',
      description: 'Gérez les réservations et créez votre rooming list',
      features: [
        {
          icon: Hotel,
          title: 'Multi-hébergements',
          description: 'Gérez plusieurs hôtels, types de chambres et tarifs',
        },
        {
          icon: Bed,
          title: '7 types de chambres',
          description: 'Simple, double, twin, triple, suite, studio, appartement',
        },
        {
          icon: Users,
          title: 'Rooming list interactive',
          description: 'Assignation facile avec recherche et validation capacité',
        },
        {
          icon: MapPin,
          title: 'Informations complètes',
          description: 'Contact, horaires, équipements, accessibilité PMR',
        },
      ],
      useCases: [
        'Gestion multi-hôtels événement international',
        'Rooming list congrès 200+ participants',
        'Coordination check-in/check-out groupés',
        'Chambres partagées team building',
      ],
      stats: [
        { label: 'Types de chambres', value: '7' },
        { label: 'Hébergements illimités', value: '✓' },
        { label: 'Assignations flexibles', value: '✓' },
      ],
    },
  ]

  const dashboardFeatures = [
    {
      icon: Activity,
      title: 'Dashboard Planification',
      description: 'Vue d\'ensemble temps réel avec stats clés',
      color: 'text-blue-600',
    },
    {
      icon: AlertTriangle,
      title: '8 types d\'alertes',
      description: 'Détection automatique des problèmes',
      color: 'text-orange-600',
    },
    {
      icon: Download,
      title: 'Exports professionnels',
      description: 'PDF timeline, Excel manifeste, fiches participants',
      color: 'text-green-600',
    },
    {
      icon: TrendingUp,
      title: 'Analytics événement',
      description: 'Graphiques de répartition et métriques',
      color: 'text-purple-600',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#004645] to-[#009197] text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">
              Modules de Planification Événement
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Des outils professionnels pour gérer chaque aspect de votre événement.
              Programme, Transport, Hébergement - tout en un seul endroit.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/admin">
                <Button size="lg" className="bg-white text-[#004645] hover:bg-gray-100">
                  Accéder au Dashboard
                </Button>
              </Link>
              <Link href="#modules">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  Découvrir les modules
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Features */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Dashboard Centralisé</h2>
          <p className="text-xl text-muted-foreground">
            Une vue d&apos;ensemble complète pour piloter votre événement
          </p>
        </div>
        <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {dashboardFeatures.map((feature, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <feature.icon className={`h-12 w-12 mx-auto mb-3 ${feature.color}`} />
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Modules Detail */}
      <div id="modules" className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Les 3 Modules Essentiels</h2>
          <p className="text-xl text-muted-foreground">
            Chaque module s&apos;intègre parfaitement avec les autres
          </p>
        </div>

        <div className="space-y-16 max-w-7xl mx-auto">
          {modules.map((module, index) => (
            <Card key={module.id} className="overflow-hidden">
              <div className="md:flex">
                {/* Left Side - Header */}
                <div className={`md:w-1/3 bg-gradient-to-br ${module.color} text-white p-8`}>
                  <module.icon className="h-16 w-16 mb-4" />
                  <h3 className="text-3xl font-bold mb-3">{module.name}</h3>
                  <p className="text-lg opacity-90 mb-6">{module.description}</p>

                  {/* Stats */}
                  <div className="space-y-3">
                    {module.stats.map((stat, i) => (
                      <div key={i} className="flex justify-between items-center">
                        <span className="text-sm opacity-80">{stat.label}</span>
                        <span className="text-xl font-bold">{stat.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Side - Details */}
                <div className="md:w-2/3 p-8">
                  {/* Features */}
                  <div className="mb-8">
                    <h4 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      Fonctionnalités clés
                    </h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      {module.features.map((feature, i) => (
                        <div key={i} className="flex gap-3">
                          <feature.icon className="h-5 w-5 text-[#009197] flex-shrink-0 mt-1" />
                          <div>
                            <div className="font-semibold text-sm">{feature.title}</div>
                            <div className="text-xs text-muted-foreground">
                              {feature.description}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Use Cases */}
                  <div>
                    <h4 className="text-xl font-semibold mb-4">Cas d&apos;usage</h4>
                    <div className="flex flex-wrap gap-2">
                      {module.useCases.map((useCase, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {useCase}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Integration Section */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Tout est connecté</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Les modules communiquent entre eux pour une expérience fluide
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Timeline unifiée</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Sessions, arrivées/départs transports, check-in/out hébergements
                    - tout dans une seule vue chronologique
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Alertes intelligentes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Le système détecte automatiquement : conflits horaires, invités sans
                    transport/hébergement, capacités atteintes
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Exports complets</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Un seul clic pour générer : manifeste Excel 6 feuilles, timeline PDF,
                    programmes individuels participants
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Prêt à organiser votre événement ?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Activez les modules dont vous avez besoin et commencez à planifier
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/admin">
              <Button size="lg" className="bg-[#004645] hover:bg-[#009197]">
                Créer mon événement
              </Button>
            </Link>
            <Link href="/admin/modules-showcase/documentation">
              <Button size="lg" variant="outline">
                Voir la documentation
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
