'use client'

import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, Users, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function ProgramPage() {
  const params = useParams()
  const eventId = params.id as string

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Programme & Agenda</h1>
        <p className="text-muted-foreground">
          Gérez le programme complet de votre événement : sessions, timeline et participants
        </p>
      </div>

      {/* Module Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Sessions Module */}
        <Link href={`/admin/events/${eventId}/sessions`}>
          <Card className="hover:shadow-lg transition-all cursor-pointer group border-2 hover:border-primary">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <div className="p-3 rounded-lg bg-blue-50">
                  <Calendar className="h-8 w-8 text-blue-600" />
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <CardTitle className="text-2xl">Sessions & Activités</CardTitle>
              <CardDescription>
                Créez et gérez toutes les sessions de votre événement
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-start gap-2 text-sm">
                  <div className="mt-0.5">✅</div>
                  <div>
                    <strong>14 types de sessions</strong> : Keynote, Workshop, Repas, Pause, etc.
                  </div>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <div className="mt-0.5">✅</div>
                  <div>
                    <strong>Gestion des participants</strong> : Inscription, capacité, liste d&apos;attente
                  </div>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <div className="mt-0.5">✅</div>
                  <div>
                    <strong>Statuts avancés</strong> : Brouillon, Publié, En cours, Terminé
                  </div>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <div className="mt-0.5">✅</div>
                  <div>
                    <strong>Détails complets</strong> : Lieu, salle, horaires, tags
                  </div>
                </div>
              </div>

              <Button className="w-full" variant="default">
                <Users className="h-4 w-4 mr-2" />
                Gérer les sessions
              </Button>
            </CardContent>
          </Card>
        </Link>

        {/* Timeline Module */}
        <Link href={`/admin/events/${eventId}/timeline`}>
          <Card className="hover:shadow-lg transition-all cursor-pointer group border-2 hover:border-primary">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <div className="p-3 rounded-lg bg-purple-50">
                  <Clock className="h-8 w-8 text-purple-600" />
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <CardTitle className="text-2xl">Timeline Globale</CardTitle>
              <CardDescription>
                Vue chronologique unifiée de tous les événements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-start gap-2 text-sm">
                  <div className="mt-0.5">✅</div>
                  <div>
                    <strong>Vue unifiée</strong> : Sessions, transports et hébergements en un coup d&apos;œil
                  </div>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <div className="mt-0.5">✅</div>
                  <div>
                    <strong>Organisation par date</strong> : Timeline verticale groupée par jour
                  </div>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <div className="mt-0.5">✅</div>
                  <div>
                    <strong>Badges colorés</strong> : Identification rapide par type d&apos;événement
                  </div>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <div className="mt-0.5">✅</div>
                  <div>
                    <strong>Statistiques</strong> : Compteurs globaux et détails par participant
                  </div>
                </div>
              </div>

              <Button className="w-full" variant="default">
                <Clock className="h-4 w-4 mr-2" />
                Voir la timeline
              </Button>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Info Banner */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-white">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1">Vision intégrée pour une organisation optimale</h3>
              <p className="text-sm text-muted-foreground">
                Le module Programme vous permet de créer toutes vos sessions (keynotes, workshops, repas, pauses)
                et de les visualiser dans une timeline globale. Vous pouvez gérer les participants de chaque session
                avec inscription, capacité et liste d&apos;attente automatique. La timeline unifiée vous donne une vue
                d&apos;ensemble de l&apos;événement en intégrant les sessions, les transports et les hébergements.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Sessions disponibles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">14 types</div>
            <p className="text-xs text-muted-foreground mt-1">
              Keynote, Workshop, Conférence, Team Building, Repas, etc.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Fonctionnalités</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">Complètes</div>
            <p className="text-xs text-muted-foreground mt-1">
              Gestion participants, capacité, waitlist, tags, visibilité
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">Unifiée</div>
            <p className="text-xs text-muted-foreground mt-1">
              Vue globale intégrant sessions, transports et hébergements
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
