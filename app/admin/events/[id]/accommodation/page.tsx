'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Hotel, Plus, MapPin, Star, Bed, Users, ExternalLink } from 'lucide-react'
import { AccommodationDialog } from '@/components/admin/accommodation-dialog'
import { createClientLogger } from '@/lib/client-logger'

const logger = createClientLogger({ component: 'AccommodationPage' })


interface Accommodation {
  id: string
  name: string
  type: string
  address?: string
  city?: string
  starRating?: number
  isPreferred: boolean
  isActive: boolean
  totalRooms: number
  checkInTime?: string
  checkOutTime?: string
  stats: {
    totalRooms: number
    availableRooms: number
    assignedRooms: number
    totalGuests: number
  }
}

export default function AccommodationPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.id as string

  const [accommodations, setAccommodations] = useState<Accommodation[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)

  const fetchAccommodations = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/events/${eventId}/accommodations`)
      if (response.ok) {
        const data = await response.json()
        setAccommodations(data.accommodations || [])
      }
    } catch (error) {
      logger.error(error, { action: 'fetchingAccommodations' })
    } finally {
      setLoading(false)
    }
  }, [eventId])

  useEffect(() => {
    fetchAccommodations()
  }, [fetchAccommodations])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement des hébergements...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hébergements</h1>
          <p className="text-muted-foreground">
            Gérez les hôtels et l&apos;attribution des chambres
          </p>
        </div>
        <Button className="gap-2" onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          Nouvel hébergement
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hébergements</CardTitle>
            <Hotel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{accommodations.length}</div>
            <p className="text-xs text-muted-foreground">
              {accommodations.filter((a) => a.isActive).length} actifs
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chambres totales</CardTitle>
            <Bed className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {accommodations.reduce((sum, a) => sum + a.stats.totalRooms, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {accommodations.reduce((sum, a) => sum + a.stats.availableRooms, 0)} disponibles
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chambres assignées</CardTitle>
            <Bed className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {accommodations.reduce((sum, a) => sum + a.stats.assignedRooms, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round(
                (accommodations.reduce((sum, a) => sum + a.stats.assignedRooms, 0) /
                  Math.max(accommodations.reduce((sum, a) => sum + a.stats.totalRooms, 0), 1)) *
                  100
              )}
              % occupé
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Invités logés</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {accommodations.reduce((sum, a) => sum + a.stats.totalGuests, 0)}
            </div>
            <p className="text-xs text-muted-foreground">invités assignés</p>
          </CardContent>
        </Card>
      </div>

      {/* Accommodations List */}
      {accommodations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Hotel className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucun hébergement</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Commencez par ajouter un hôtel ou hébergement
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un hébergement
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {accommodations.map((accommodation) => (
            <Card
              key={accommodation.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => router.push(`/admin/events/${eventId}/accommodation/${accommodation.id}`)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg">{accommodation.name}</CardTitle>
                      {accommodation.isPreferred && (
                        <Badge variant="secondary" className="bg-blue-500/10 text-blue-700">
                          Préféré
                        </Badge>
                      )}
                      {!accommodation.isActive && (
                        <Badge variant="outline">Inactif</Badge>
                      )}
                    </div>
                    {accommodation.starRating && (
                      <div className="flex items-center gap-1 mb-2">
                        {Array.from({ length: accommodation.starRating }).map((_, i) => (
                          <Star
                            key={i}
                            className="h-3 w-3 fill-yellow-400 text-yellow-400"
                          />
                        ))}
                      </div>
                    )}
                    {(accommodation.address || accommodation.city) && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {accommodation.city}
                        {accommodation.address && `, ${accommodation.address}`}
                      </div>
                    )}
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Chambres</p>
                    <p className="font-semibold">
                      {accommodation.stats.totalRooms} total
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Disponibles</p>
                    <p className="font-semibold text-green-600">
                      {accommodation.stats.availableRooms}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Assignées</p>
                    <p className="font-semibold text-blue-600">
                      {accommodation.stats.assignedRooms}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Invités</p>
                    <p className="font-semibold">
                      {accommodation.stats.totalGuests}
                    </p>
                  </div>
                </div>
                {(accommodation.checkInTime || accommodation.checkOutTime) && (
                  <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
                    Check-in: {accommodation.checkInTime || 'N/A'} • Check-out:{' '}
                    {accommodation.checkOutTime || 'N/A'}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Accommodation Dialog */}
      <AccommodationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        eventId={eventId}
        onSuccess={fetchAccommodations}
      />
    </div>
  )
}
