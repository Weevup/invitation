'use client'

import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Database,
  Calendar,
  Plane,
  Hotel,
  Users,
  MapPin,
  Tag,
  List
} from 'lucide-react'

export default function DataAdminPage() {
  const params = useParams()
  const eventId = params.id as string

  const dataCategories = [
    {
      title: 'Types de Sessions',
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      items: [
        'KEYNOTE - Keynote',
        'WORKSHOP - Atelier',
        'CONFERENCE - Conférence',
        'PANEL - Table ronde',
        'TRAINING - Formation',
        'TEAMBUILDING - Team Building',
        'NETWORKING - Networking',
        'MEAL - Repas',
        'BREAK - Pause',
        'TRANSFER - Transfert',
        'ARRIVAL - Arrivée',
        'DEPARTURE - Départ',
        'FREE_TIME - Temps libre',
        'OTHER - Autre'
      ],
      description: 'Types de sessions disponibles dans le module Programme'
    },
    {
      title: 'Types de Transport',
      icon: Plane,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      items: [
        'FLIGHT - Vol',
        'TRAIN - Train',
        'BUS - Bus',
        'CAR - Voiture',
        'TAXI - Taxi',
        'SHUTTLE - Navette',
        'OTHER - Autre'
      ],
      description: 'Types de transport disponibles dans le module Transport'
    },
    {
      title: 'Types d\'Hébergement',
      icon: Hotel,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      items: [
        'HOTEL - Hôtel',
        'RESORT - Resort',
        'APARTMENT - Appartement',
        'VILLA - Villa',
        'HOSTEL - Auberge',
        'GUESTHOUSE - Maison d\'hôtes',
        'OTHER - Autre'
      ],
      description: 'Types d\'hébergement disponibles dans le module Hébergement'
    },
    {
      title: 'Types de Chambres',
      icon: Hotel,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      items: [
        'SINGLE - Chambre simple',
        'DOUBLE - Chambre double',
        'TWIN - Chambre twin',
        'TRIPLE - Chambre triple',
        'QUAD - Chambre quadruple',
        'SUITE - Suite',
        'STUDIO - Studio',
        'APARTMENT - Appartement',
        'DORM - Dortoir'
      ],
      description: 'Types de chambres disponibles pour les hébergements'
    },
    {
      title: 'Modules Logistique',
      icon: Users,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      items: [
        'Ateliers (WORKSHOP) - Gestion des ateliers et workshops',
        'Team Building (TEAMBUILDING) - Gestion des équipes team building',
        'Activités libres (FREE_TIME) - Gestion des activités à choix',
        'Transport - Gestion des moyens de transport',
        'Hébergement - Gestion des hébergements et chambres'
      ],
      description: 'Modules spécialisés de logistique événementielle'
    },
    {
      title: 'Statuts d\'Événement',
      icon: Tag,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      items: [
        'DRAFT - Brouillon',
        'PUBLISHED - Publié',
        'ONGOING - En cours',
        'COMPLETED - Terminé',
        'CANCELLED - Annulé'
      ],
      description: 'États possibles pour un événement'
    }
  ]

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Administration des Données</h1>
        <p className="text-muted-foreground">
          Vue d&apos;ensemble des types et listes configurables de l&apos;application
        </p>
      </div>

      {/* Info Banner */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Database className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900 mb-1">
                Informations système
              </p>
              <p className="text-sm text-blue-700">
                Ces données sont définies au niveau du schéma de la base de données (Prisma).
                Pour ajouter ou modifier des types, il faut mettre à jour le fichier <code className="bg-blue-100 px-1 rounded">prisma/schema.prisma</code> et exécuter une migration.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Categories Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {dataCategories.map((category) => {
          const IconComponent = category.icon
          return (
            <Card key={category.title} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${category.bgColor}`}>
                    <IconComponent className={`h-5 w-5 ${category.color}`} />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{category.title}</CardTitle>
                    <CardDescription className="text-xs">
                      {category.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="secondary">
                      {category.items.length} {category.items.length > 1 ? 'types' : 'type'}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    {category.items.map((item, index) => (
                      <div
                        key={index}
                        className="text-sm py-1.5 px-2 rounded hover:bg-muted transition-colors"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Architecture Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <List className="h-5 w-5" />
            Architecture des Modules
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2 text-sm">Programme (Sessions simples)</h3>
            <p className="text-sm text-muted-foreground">
              Sessions informatives : Keynote, Conférence, Panel, Formation, Repas, Pause, Arrivée, Départ, etc.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2 text-sm">Logistique (Modules spécialisés)</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• <strong>Transport</strong> : Gestion des vols, trains, bus, etc.</li>
              <li>• <strong>Hébergement</strong> : Gestion des hôtels et chambres</li>
              <li>• <strong>Ateliers</strong> : Sessions WORKSHOP avec groupes</li>
              <li>• <strong>Team Building</strong> : Sessions TEAMBUILDING avec équipes</li>
              <li>• <strong>Activités libres</strong> : Sessions FREE_TIME avec choix d&apos;activités</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2 text-sm">Planning Opérationnel</h3>
            <p className="text-sm text-muted-foreground">
              Vue synthétique fusionnant TOUTES les données : sessions, transport, hébergement, et groupes.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
