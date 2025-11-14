'use client'

import { Calendar, MapPin, Users, Check, Clock, AlertTriangle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { KPIs } from '@/app/api/admin/events/[id]/operations/helpers'

interface OperationsHeaderProps {
  event: {
    id: string
    name: string
    startsAt: Date
    endsAt?: Date | null
    venueName?: string | null
    city?: string | null
  }
  kpis: KPIs
}

export function OperationsHeader({ event, kpis }: OperationsHeaderProps) {
  const eventDate = new Date(event.startsAt)
  const location = event.venueName && event.city
    ? `${event.venueName}, ${event.city}`
    : event.venueName || event.city || null

  return (
    <div className="space-y-4">
      {/* Event Info */}
      <div>
        <h1 className="text-3xl font-bold">{event.name}</h1>
        <div className="flex items-center gap-4 mt-2 text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar size={16} />
            <span>{eventDate.toLocaleDateString('fr-FR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</span>
          </div>
          {location && (
            <div className="flex items-center gap-1">
              <MapPin size={16} />
              <span>{location}</span>
            </div>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Invités */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Invités</p>
                <p className="text-2xl font-bold">{kpis.totalGuests}</p>
              </div>
              <Users className="text-muted-foreground" size={20} />
            </div>
            <div className="mt-2 flex items-center gap-2 text-sm">
              <Badge variant="default" className="text-xs">
                <Check size={12} className="mr-1" />
                {kpis.confirmedGuests}
              </Badge>
              {kpis.pendingGuests > 0 && (
                <Badge variant="outline" className="text-xs">
                  <Clock size={12} className="mr-1" />
                  {kpis.pendingGuests}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Sessions */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sessions</p>
                <p className="text-2xl font-bold">{kpis.totalSessions}</p>
              </div>
              <Calendar className="text-muted-foreground" size={20} />
            </div>
            <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground flex-wrap">
              {(kpis as any).totalWorkshops > 0 && (
                <Badge variant="outline" className="text-xs">
                  🛠️ {(kpis as any).totalWorkshops}
                </Badge>
              )}
              {(kpis as any).totalTeamBuilding > 0 && (
                <Badge variant="outline" className="text-xs">
                  🤝 {(kpis as any).totalTeamBuilding}
                </Badge>
              )}
              {(kpis as any).totalFreeTime > 0 && (
                <Badge variant="outline" className="text-xs">
                  🌴 {(kpis as any).totalFreeTime}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Transport */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Transports</p>
                <p className="text-2xl font-bold">{kpis.totalTransports + kpis.totalManifests}</p>
              </div>
              <div className="text-muted-foreground text-xl">🚌</div>
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
              <span>{kpis.totalTransports} indiv.</span>
              <span>•</span>
              <span>{kpis.totalManifests} groupes</span>
            </div>
          </CardContent>
        </Card>

        {/* Hébergement */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Hébergement</p>
                <p className="text-2xl font-bold">{kpis.totalAccommodations}</p>
              </div>
              <div className="text-muted-foreground text-xl">🏨</div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">{kpis.totalRooms} chambres</p>
          </CardContent>
        </Card>

        {/* Allergies */}
        {kpis.totalAllergies > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-900">Allergies</p>
                  <p className="text-2xl font-bold text-orange-900">{kpis.totalAllergies}</p>
                </div>
                <AlertTriangle className="text-orange-600" size={20} />
              </div>
              <p className="text-xs text-orange-700 mt-2">Identifiées</p>
            </CardContent>
          </Card>
        )}

        {/* Régimes */}
        {kpis.totalDietaryRestrictions > 0 && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-900">Régimes</p>
                  <p className="text-2xl font-bold text-blue-900">{kpis.totalDietaryRestrictions}</p>
                </div>
                <div className="text-blue-600 text-xl">🌱</div>
              </div>
              <p className="text-xs text-blue-700 mt-2">Spéciaux</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
