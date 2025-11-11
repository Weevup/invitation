'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  Plus,
  Hotel,
  MapPin,
  Phone,
  Mail,
  Globe,
  Star,
  Edit,
  Bed,
  Users,
  UserPlus,
  X,
} from 'lucide-react'
import Link from 'next/link'
import { RoomDialog } from '@/components/admin/room-dialog'
import { RoomAssignmentDialog } from '@/components/admin/room-assignment-dialog'
import { AccommodationDialog } from '@/components/admin/accommodation-dialog'
import { toast } from 'sonner'

interface Room {
  id: string
  roomNumber: string
  floor?: number
  type: string
  status: string
  maxOccupancy: number
  currentOccupancy: number
  bedConfiguration?: string
  view?: string
  isAccessible: boolean
  assignments: {
    id: string
    guest: {
      id: string
      firstName: string
      lastName: string
      email: string
      company?: string
    }
    checkInDate: string
    checkOutDate: string
    isPrimaryGuest: boolean
    isConfirmed: boolean
  }[]
}

interface Accommodation {
  id: string
  name: string
  type: string
  address?: string
  city?: string
  country?: string
  phone?: string
  email?: string
  website?: string
  starRating?: number
  description?: string
  totalRooms: number
  allocatedRooms: number
  checkInTime?: string
  checkOutTime?: string
  isPreferred: boolean
  isActive: boolean
  rooms: Room[]
}

const ROOM_TYPE_LABELS: Record<string, string> = {
  SINGLE: 'Simple',
  DOUBLE: 'Double',
  TWIN: 'Twin',
  TRIPLE: 'Triple',
  SUITE: 'Suite',
  STUDIO: 'Studio',
  APARTMENT: 'Appartement',
}

const ROOM_STATUS_COLORS: Record<string, string> = {
  AVAILABLE: 'bg-green-100 text-green-700 border-green-300',
  ASSIGNED: 'bg-blue-100 text-blue-700 border-blue-300',
  BLOCKED: 'bg-gray-100 text-gray-700 border-gray-300',
  MAINTENANCE: 'bg-red-100 text-red-700 border-red-300',
}

export default function AccommodationDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.id as string
  const accommodationId = params.accommodationId as string

  const [accommodation, setAccommodation] = useState<Accommodation | null>(null)
  const [loading, setLoading] = useState(true)
  const [roomDialogOpen, setRoomDialogOpen] = useState(false)
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)

  useEffect(() => {
    fetchAccommodation()
  }, [accommodationId])

  const fetchAccommodation = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `/api/admin/events/${eventId}/accommodations/${accommodationId}`
      )
      if (response.ok) {
        const data = await response.json()
        setAccommodation(data.accommodation)
      }
    } catch (error) {
      console.error('Error fetching accommodation:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenAssignment = (room: Room) => {
    setSelectedRoom(room)
    setAssignmentDialogOpen(true)
  }

  const handleDeleteAssignment = async (assignmentId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette assignation ?')) {
      return
    }

    try {
      const response = await fetch(
        `/api/admin/events/${eventId}/room-assignments/${assignmentId}`,
        { method: 'DELETE' }
      )

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression')
      }

      toast.success('Assignation supprimée')
      fetchAccommodation()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!accommodation) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Hébergement non trouvé</p>
      </div>
    )
  }

  const totalGuests = accommodation.rooms.reduce(
    (sum, room) => sum + room.assignments.length,
    0
  )
  const availableRooms = accommodation.rooms.filter(
    (r) => r.status === 'AVAILABLE'
  ).length
  const occupancyRate =
    accommodation.rooms.length > 0
      ? Math.round(
          (accommodation.rooms.filter((r) => r.status === 'ASSIGNED').length /
            accommodation.rooms.length) *
            100
        )
      : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href={`/admin/events/${eventId}/accommodation`}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Retour aux hébergements
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold tracking-tight">
                {accommodation.name}
              </h1>
              {accommodation.isPreferred && (
                <Badge variant="secondary" className="bg-blue-500/10 text-blue-700">
                  Préféré
                </Badge>
              )}
              {!accommodation.isActive && <Badge variant="outline">Inactif</Badge>}
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {accommodation.starRating && (
                <div className="flex items-center gap-1">
                  {Array.from({ length: accommodation.starRating }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-3 w-3 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
              )}
              {accommodation.city && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {accommodation.city}
                  {accommodation.address && `, ${accommodation.address}`}
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setEditDialogOpen(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Modifier
            </Button>
            <Button onClick={() => setRoomDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter des chambres
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chambres totales</CardTitle>
            <Bed className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{accommodation.rooms.length}</div>
            <p className="text-xs text-muted-foreground">
              {availableRooms} disponibles
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux d&apos;occupation</CardTitle>
            <Hotel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{occupancyRate}%</div>
            <p className="text-xs text-muted-foreground">
              {accommodation.rooms.filter((r) => r.status === 'ASSIGNED').length}{' '}
              chambres assignées
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Invités logés</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalGuests}</div>
            <p className="text-xs text-muted-foreground">assignations actives</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Check-in/out</CardTitle>
            <Hotel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold">
              {accommodation.checkInTime || 'N/A'} / {accommodation.checkOutTime || 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">Horaires standard</p>
          </CardContent>
        </Card>
      </div>

      {/* Contact Information */}
      {(accommodation.phone || accommodation.email || accommodation.website) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Informations de contact</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {accommodation.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={`tel:${accommodation.phone}`}
                    className="text-sm hover:underline"
                  >
                    {accommodation.phone}
                  </a>
                </div>
              )}
              {accommodation.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={`mailto:${accommodation.email}`}
                    className="text-sm hover:underline"
                  >
                    {accommodation.email}
                  </a>
                </div>
              )}
              {accommodation.website && (
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={accommodation.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm hover:underline"
                  >
                    Site web
                  </a>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rooming List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Rooming List</CardTitle>
        </CardHeader>
        <CardContent>
          {accommodation.rooms.length === 0 ? (
            <div className="text-center py-12">
              <Bed className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucune chambre</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Commencez par ajouter des chambres
              </p>
              <Button onClick={() => setRoomDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter des chambres
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {accommodation.rooms
                .sort((a, b) => {
                  // Sort by status (AVAILABLE first), then room number
                  if (a.status !== b.status) {
                    const statusOrder = ['AVAILABLE', 'ASSIGNED', 'BLOCKED', 'MAINTENANCE']
                    return statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status)
                  }
                  return a.roomNumber.localeCompare(b.roomNumber)
                })
                .map((room) => (
                  <div
                    key={room.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold">Chambre {room.roomNumber}</h4>
                          <Badge className={ROOM_STATUS_COLORS[room.status]}>
                            {room.status}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {ROOM_TYPE_LABELS[room.type]} • Max {room.maxOccupancy}{' '}
                            pers.
                          </span>
                        </div>
                        {(room.bedConfiguration || room.view || room.isAccessible) && (
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            {room.bedConfiguration && <span>{room.bedConfiguration}</span>}
                            {room.view && <span>{room.view}</span>}
                            {room.isAccessible && <span>♿ Accessible</span>}
                          </div>
                        )}
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleOpenAssignment(room)}
                        disabled={room.currentOccupancy >= room.maxOccupancy}
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Assigner
                      </Button>
                    </div>

                    {/* Assignments */}
                    {room.assignments.length > 0 && (
                      <div className="mt-3 pt-3 border-t space-y-2">
                        {room.assignments.map((assignment) => (
                          <div
                            key={assignment.id}
                            className="flex items-center justify-between bg-blue-50 rounded p-2"
                          >
                            <div className="flex-1">
                              <div className="font-medium text-sm">
                                {assignment.guest.firstName} {assignment.guest.lastName}
                                {assignment.isPrimaryGuest && (
                                  <Badge variant="outline" className="ml-2">
                                    Principal
                                  </Badge>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {assignment.guest.email}
                                {assignment.guest.company &&
                                  ` • ${assignment.guest.company}`}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {new Date(assignment.checkInDate).toLocaleDateString('fr-FR')} →{' '}
                                {new Date(assignment.checkOutDate).toLocaleDateString('fr-FR')}
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteAssignment(assignment.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <RoomDialog
        open={roomDialogOpen}
        onOpenChange={setRoomDialogOpen}
        eventId={eventId}
        accommodationId={accommodationId}
        onSuccess={fetchAccommodation}
      />

      {selectedRoom && (
        <RoomAssignmentDialog
          open={assignmentDialogOpen}
          onOpenChange={setAssignmentDialogOpen}
          eventId={eventId}
          room={selectedRoom}
          onSuccess={fetchAccommodation}
        />
      )}

      <AccommodationDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        eventId={eventId}
        accommodation={accommodation}
        onSuccess={fetchAccommodation}
      />
    </div>
  )
}
