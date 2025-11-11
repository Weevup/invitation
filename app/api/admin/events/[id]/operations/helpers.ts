import type {
  Session,
  SessionParticipant,
  Guest,
  RSVP,
  TransportBooking,
  TransportManifest,
  ManifestParticipant,
  Accommodation,
  Room,
  RoomAssignment,
  TimelineEvent,
  Event
} from '@prisma/client'

// Types étendu avec relations
type SessionWithParticipants = Session & {
  participants: (SessionParticipant & { guest: Guest })[]
}

type TransportManifestWithParticipants = TransportManifest & {
  participants: (ManifestParticipant & { guest: Guest })[]
}

type RoomAssignmentWithGuest = RoomAssignment & {
  guest: Guest
  room: Room & { accommodation: Accommodation }
}

type RSVPWithGuest = RSVP & {
  guest: Guest
}

// Types des time slots
export type TimeSlotType =
  | 'session'
  | 'transport'
  | 'accommodation'
  | 'free_time'

export interface TimeSlot {
  id: string
  type: TimeSlotType
  subType?: string // 'checkin', 'checkout', 'arrival', 'departure'
  startTime: Date
  endTime?: Date
  day: string // 'J-1', 'J', 'J+1'
  title: string
  location?: string
  participants: Guest[]
  capacity?: number
  warnings: Warning[]

  // Session spécifique
  sessionType?: string
  catering?: string | null
  equipment?: string[]
  speakers?: any
  isHighlighted?: boolean

  // Transport spécifique
  transportType?: string
  route?: string
  manifest?: any

  // Hébergement spécifique
  accommodations?: any[]
  rooms?: any[]
}

export interface Warning {
  id: string
  type: 'allergy' | 'dietary' | 'accessibility' | 'capacity' | 'missing_rsvp' | 'transport' | 'accommodation'
  severity: 'info' | 'warning' | 'critical'
  message: string
  details?: string[]
  guestIds?: string[]
}

export interface Alert extends Warning {
  sessionId?: string
  count?: number
}

export interface KPIs {
  totalGuests: number
  confirmedGuests: number
  pendingGuests: number
  totalSessions: number
  totalTransports: number
  totalManifests: number
  totalAccommodations: number
  totalRooms: number
  totalAllergies: number
  totalDietaryRestrictions: number
  totalWarnings: number
}

/**
 * Construit la timeline chronologique complète avec tous les types de blocs
 */
export function buildTimeSlots({
  sessions,
  timelineEvents,
  transportBookings,
  transportManifests,
  accommodations,
  roomAssignments,
  rsvps
}: {
  sessions: SessionWithParticipants[]
  timelineEvents: TimelineEvent[]
  transportBookings: (TransportBooking & { guest: Guest })[]
  transportManifests: TransportManifestWithParticipants[]
  accommodations: any[]
  roomAssignments: RoomAssignmentWithGuest[]
  rsvps: RSVPWithGuest[]
}): TimeSlot[] {
  const slots: TimeSlot[] = []

  // 1. Ajouter les sessions
  sessions.forEach(session => {
    const sessionParticipants = session.participants.map(p => p.guest)
    const sessionWarnings = calculateSessionWarnings(session, rsvps)

    slots.push({
      id: `session-${session.id}`,
      type: 'session',
      subType: session.type,
      sessionType: session.type,
      startTime: session.startTime,
      endTime: session.endTime,
      day: calculateDay(session.startTime, sessions[0]?.startTime || new Date()),
      title: session.title,
      location: session.venue && session.room ? `${session.venue} - ${session.room}` : session.venue || undefined,
      participants: sessionParticipants,
      capacity: session.capacity || undefined,
      catering: session.catering,
      equipment: session.equipment,
      speakers: session.speakers,
      isHighlighted: session.isHighlighted,
      warnings: sessionWarnings
    })
  })

  // 2. Ajouter les transports groupés
  const transportGroups = groupTransportsByTime(transportBookings, transportManifests)
  transportGroups.forEach(group => {
    slots.push({
      id: group.id,
      type: 'transport',
      subType: group.subType,
      transportType: group.type,
      startTime: group.startTime,
      endTime: group.endTime,
      day: calculateDay(group.startTime, sessions[0]?.startTime || new Date()),
      title: group.title,
      location: group.route,
      route: group.route,
      participants: group.participants,
      manifest: group.manifest,
      warnings: group.warnings
    })
  })

  // 3. Ajouter les événements d'hébergement (check-in/check-out)
  const accommodationEvents = buildAccommodationEvents(accommodations, roomAssignments)
  accommodationEvents.forEach(event => {
    slots.push({
      id: event.id,
      type: 'accommodation',
      subType: event.subType,
      startTime: event.startTime,
      endTime: event.endTime,
      day: calculateDay(event.startTime, sessions[0]?.startTime || new Date()),
      title: event.title,
      location: event.location,
      participants: event.participants,
      accommodations: event.accommodations,
      rooms: event.rooms,
      warnings: event.warnings
    })
  })

  // 4. Identifier les temps libres entre les sessions
  const freeTimeSlots = identifyFreeTime(slots.filter(s => s.type === 'session'))
  slots.push(...freeTimeSlots)

  // 5. Trier chronologiquement
  return slots.sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
}

/**
 * Calcule le jour relatif (J-1, J, J+1, etc.)
 */
function calculateDay(date: Date, eventMainDate: Date): string {
  const diff = Math.floor((date.getTime() - eventMainDate.getTime()) / (1000 * 60 * 60 * 24))

  if (diff < -1) return `J${diff}`
  if (diff === -1) return 'J-1'
  if (diff === 0) return 'J'
  if (diff === 1) return 'J+1'
  return `J+${diff}`
}

/**
 * Calcule les warnings pour une session (allergies, régimes, capacité)
 */
function calculateSessionWarnings(
  session: SessionWithParticipants,
  rsvps: RSVPWithGuest[]
): Warning[] {
  const warnings: Warning[] = []

  // Vérifier si c'est une session repas
  const isMealSession = session.type === 'MEAL' || session.catering

  if (isMealSession) {
    // Collecter les allergies des participants
    const participantGuestIds = session.participants.map(p => p.guestId)
    const participantRSVPs = rsvps.filter(r => participantGuestIds.includes(r.guestId))

    const allergies: { guest: Guest; allergy: string }[] = []
    const dietaryRestrictions: { guest: Guest; restriction: string }[] = []

    participantRSVPs.forEach(rsvp => {
      if (rsvp.dietaryRestrictions && Array.isArray(rsvp.dietaryRestrictions)) {
        rsvp.dietaryRestrictions.forEach((restriction: string) => {
          if (restriction.toLowerCase().includes('allergi')) {
            allergies.push({ guest: rsvp.guest, allergy: restriction })
          } else {
            dietaryRestrictions.push({ guest: rsvp.guest, restriction })
          }
        })
      }
    })

    if (allergies.length > 0) {
      warnings.push({
        id: `allergy-${session.id}`,
        type: 'allergy',
        severity: 'critical',
        message: `${allergies.length} allergie(s) identifiée(s)`,
        details: allergies.map(a => `${a.guest.firstName} ${a.guest.lastName}: ${a.allergy}`),
        guestIds: allergies.map(a => a.guest.id)
      })
    }

    if (dietaryRestrictions.length > 0) {
      warnings.push({
        id: `dietary-${session.id}`,
        type: 'dietary',
        severity: 'warning',
        message: `${dietaryRestrictions.length} régime(s) spécial(aux)`,
        details: dietaryRestrictions.map(d => `${d.guest.firstName} ${d.guest.lastName}: ${d.restriction}`),
        guestIds: dietaryRestrictions.map(d => d.guest.id)
      })
    }
  }

  // Vérifier la capacité
  if (session.capacity && session.participants.length > session.capacity) {
    warnings.push({
      id: `capacity-${session.id}`,
      type: 'capacity',
      severity: 'critical',
      message: `Capacité dépassée (${session.participants.length}/${session.capacity})`
    })
  }

  return warnings
}

/**
 * Groupe les transports par horaire et type
 */
export function groupTransportsByTime(
  transportBookings: (TransportBooking & { guest: Guest })[],
  transportManifests: TransportManifestWithParticipants[]
): any[] {
  const groups: any[] = []

  // Ajouter les manifests (transports groupés)
  transportManifests.forEach(manifest => {
    groups.push({
      id: `manifest-${manifest.id}`,
      type: manifest.type,
      subType: manifest.direction === 'ARRIVAL' ? 'arrival' : 'departure',
      startTime: manifest.departureTime,
      endTime: manifest.arrivalTime || undefined,
      title: `${getTransportTypeLabel(manifest.type)} - ${manifest.route}`,
      route: manifest.route,
      participants: manifest.participants.map(p => p.guest),
      manifest: {
        id: manifest.id,
        type: manifest.type,
        direction: manifest.direction,
        route: manifest.route,
        departureTime: manifest.departureTime,
        arrivalTime: manifest.arrivalTime,
        capacity: manifest.capacity,
        currentCount: manifest.currentCount,
        driverName: manifest.driverName,
        driverPhone: manifest.driverPhone,
        vehicleInfo: manifest.vehicleInfo,
        notes: manifest.notes
      },
      warnings: []
    })
  })

  // Grouper les réservations individuelles par horaire similaire
  const individualBookings = transportBookings.filter(b => !b.manifestId)
  const bookingGroups = new Map<string, typeof individualBookings>()

  individualBookings.forEach(booking => {
    // Créer une clé basée sur l'heure arrondie à 30 minutes
    const roundedTime = new Date(booking.departureTime)
    roundedTime.setMinutes(Math.floor(roundedTime.getMinutes() / 30) * 30)
    const key = `${booking.type}-${roundedTime.toISOString()}`

    if (!bookingGroups.has(key)) {
      bookingGroups.set(key, [])
    }
    bookingGroups.get(key)!.push(booking)
  })

  bookingGroups.forEach((bookings, key) => {
    const firstBooking = bookings[0]
    groups.push({
      id: `transport-group-${key}`,
      type: firstBooking.type,
      subType: firstBooking.direction === 'ARRIVAL' ? 'arrival' : 'departure',
      startTime: firstBooking.departureTime,
      endTime: firstBooking.arrivalTime || undefined,
      title: `${getTransportTypeLabel(firstBooking.type)} - Arrivées individuelles`,
      route: `${firstBooking.origin} → ${firstBooking.destination}`,
      participants: bookings.map(b => b.guest),
      manifest: null,
      warnings: []
    })
  })

  return groups
}

function getTransportTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    FLIGHT: '✈️ Vol',
    TRAIN: '🚂 Train',
    BUS: '🚌 Bus',
    SHUTTLE: '🚌 Navette',
    CAR: '🚗 Voiture',
    TAXI: '🚕 Taxi',
    OTHER: '🚙 Autre'
  }
  return labels[type] || type
}

/**
 * Construit les événements d'hébergement (check-in/check-out)
 */
export function buildAccommodationEvents(
  accommodations: any[],
  roomAssignments: RoomAssignmentWithGuest[]
): any[] {
  const events: any[] = []

  if (roomAssignments.length === 0) return events

  // Grouper les assignations par date de check-in
  const checkInGroups = new Map<string, RoomAssignmentWithGuest[]>()
  const checkOutGroups = new Map<string, RoomAssignmentWithGuest[]>()

  roomAssignments.forEach(assignment => {
    const checkInKey = assignment.checkInDate.toISOString().split('T')[0]
    const checkOutKey = assignment.checkOutDate.toISOString().split('T')[0]

    if (!checkInGroups.has(checkInKey)) {
      checkInGroups.set(checkInKey, [])
    }
    checkInGroups.get(checkInKey)!.push(assignment)

    if (!checkOutGroups.has(checkOutKey)) {
      checkOutGroups.set(checkOutKey, [])
    }
    checkOutGroups.get(checkOutKey)!.push(assignment)
  })

  // Créer les événements de check-in
  checkInGroups.forEach((assignments, dateKey) => {
    const date = new Date(dateKey)
    const startTime = new Date(date)
    startTime.setHours(14, 0, 0, 0) // 14:00 par défaut

    const endTime = new Date(date)
    endTime.setHours(20, 0, 0, 0) // 20:00 par défaut

    // Grouper par hôtel
    const byHotel = new Map<string, RoomAssignmentWithGuest[]>()
    assignments.forEach(a => {
      const hotelId = a.room.accommodation.id
      if (!byHotel.has(hotelId)) {
        byHotel.set(hotelId, [])
      }
      byHotel.get(hotelId)!.push(a)
    })

    const accommodationsList = Array.from(byHotel.entries()).map(([hotelId, assigns]) => ({
      id: hotelId,
      name: assigns[0].room.accommodation.name,
      guestCount: assigns.length,
      roomCount: assigns.length,
      rooms: assigns.map(a => a.room.roomNumber)
    }))

    events.push({
      id: `checkin-${dateKey}`,
      subType: 'checkin',
      startTime,
      endTime,
      title: '🏨 Check-in Hôtels',
      location: accommodationsList.map(a => a.name).join(', '),
      participants: assignments.map(a => a.guest),
      accommodations: accommodationsList,
      rooms: assignments.map(a => ({
        roomNumber: a.room.roomNumber,
        accommodation: a.room.accommodation.name,
        guest: a.guest
      })),
      warnings: []
    })
  })

  // Créer les événements de check-out
  checkOutGroups.forEach((assignments, dateKey) => {
    const date = new Date(dateKey)
    const startTime = new Date(date)
    startTime.setHours(8, 0, 0, 0) // 08:00 par défaut

    const endTime = new Date(date)
    endTime.setHours(12, 0, 0, 0) // 12:00 par défaut

    // Grouper par hôtel
    const byHotel = new Map<string, RoomAssignmentWithGuest[]>()
    assignments.forEach(a => {
      const hotelId = a.room.accommodation.id
      if (!byHotel.has(hotelId)) {
        byHotel.set(hotelId, [])
      }
      byHotel.get(hotelId)!.push(a)
    })

    const accommodationsList = Array.from(byHotel.entries()).map(([hotelId, assigns]) => ({
      id: hotelId,
      name: assigns[0].room.accommodation.name,
      guestCount: assigns.length,
      roomCount: assigns.length
    }))

    events.push({
      id: `checkout-${dateKey}`,
      subType: 'checkout',
      startTime,
      endTime,
      title: '🧳 Check-out Hôtels',
      location: accommodationsList.map(a => a.name).join(', '),
      participants: assignments.map(a => a.guest),
      accommodations: accommodationsList,
      rooms: assignments.map(a => ({
        roomNumber: a.room.roomNumber,
        accommodation: a.room.accommodation.name,
        guest: a.guest
      })),
      warnings: []
    })
  })

  return events
}

/**
 * Identifie les temps libres entre les sessions
 */
function identifyFreeTime(sessionSlots: TimeSlot[]): TimeSlot[] {
  const freeTimeSlots: TimeSlot[] = []

  // Trier par heure de début
  const sorted = [...sessionSlots].sort((a, b) => a.startTime.getTime() - b.startTime.getTime())

  for (let i = 0; i < sorted.length - 1; i++) {
    const current = sorted[i]
    const next = sorted[i + 1]

    if (!current.endTime) continue

    const gapMinutes = (next.startTime.getTime() - current.endTime.getTime()) / 1000 / 60

    // Si l'écart est supérieur à 30 minutes, c'est du temps libre
    if (gapMinutes >= 30) {
      freeTimeSlots.push({
        id: `free-${i}`,
        type: 'free_time',
        startTime: current.endTime,
        endTime: next.startTime,
        day: current.day,
        title: `⏰ Temps libre (${Math.floor(gapMinutes / 60)}h${Math.floor(gapMinutes % 60).toString().padStart(2, '0')})`,
        participants: [],
        warnings: []
      })
    }
  }

  return freeTimeSlots
}

/**
 * Calcule toutes les alertes globales
 */
export function calculateAlerts({
  rsvps,
  guests,
  sessions,
  transportBookings,
  transportManifests,
  roomAssignments
}: {
  rsvps: RSVPWithGuest[]
  guests: Guest[]
  sessions: SessionWithParticipants[]
  transportBookings: any[]
  transportManifests: any[]
  roomAssignments: any[]
}): Alert[] {
  const alerts: Alert[] = []

  // 1. Compter les allergies totales
  const allAllergies = rsvps.flatMap(r => {
    if (!r.dietaryRestrictions || !Array.isArray(r.dietaryRestrictions)) return []
    return r.dietaryRestrictions
      .filter((d: string) => d.toLowerCase().includes('allergi'))
      .map((allergy: string) => ({ guest: r.guest, allergy }))
  })

  if (allAllergies.length > 0) {
    alerts.push({
      id: 'global-allergies',
      type: 'allergy',
      severity: 'critical',
      message: `${allAllergies.length} allergie(s) alimentaire(s) identifiée(s)`,
      count: allAllergies.length,
      details: allAllergies.map((a: any) => `${a.guest.firstName} ${a.guest.lastName}: ${a.allergy}`)
    })
  }

  // 2. Compter les régimes spéciaux
  const allDietaryRestrictions = rsvps.flatMap(r => {
    if (!r.dietaryRestrictions || !Array.isArray(r.dietaryRestrictions)) return []
    return r.dietaryRestrictions
      .filter((d: string) => !d.toLowerCase().includes('allergi'))
      .map((restriction: string) => ({ guest: r.guest, restriction }))
  })

  if (allDietaryRestrictions.length > 0) {
    alerts.push({
      id: 'global-dietary',
      type: 'dietary',
      severity: 'warning',
      message: `${allDietaryRestrictions.length} régime(s) alimentaire(s) spécial(aux)`,
      count: allDietaryRestrictions.length,
      details: allDietaryRestrictions.map((d: any) => `${d.guest.firstName} ${d.guest.lastName}: ${d.restriction}`)
    })
  }

  // 3. Invités sans RSVP
  const guestsWithoutRSVP = guests.filter(g => !rsvps.some(r => r.guestId === g.id))
  if (guestsWithoutRSVP.length > 0) {
    alerts.push({
      id: 'missing-rsvp',
      type: 'missing_rsvp',
      severity: 'warning',
      message: `${guestsWithoutRSVP.length} invité(s) sans réponse RSVP`,
      count: guestsWithoutRSVP.length,
      guestIds: guestsWithoutRSVP.map(g => g.id)
    })
  }

  // 4. Chambres PMR
  const pmrAssignments = roomAssignments.filter((a: any) => a.room.isAccessible)
  if (pmrAssignments.length > 0) {
    alerts.push({
      id: 'pmr-rooms',
      type: 'accessibility',
      severity: 'info',
      message: `${pmrAssignments.length} chambre(s) PMR réservée(s)`,
      count: pmrAssignments.length
    })
  }

  return alerts
}

/**
 * Calcule les KPIs de l'événement
 */
export function calculateKPIs({
  event,
  guests,
  rsvps,
  sessions,
  transportBookings,
  transportManifests,
  accommodations,
  roomAssignments
}: {
  event: Event & { _count: { guests: number; sessions: number } }
  guests: Guest[]
  rsvps: RSVPWithGuest[]
  sessions: SessionWithParticipants[]
  transportBookings: any[]
  transportManifests: any[]
  accommodations: any[]
  roomAssignments: any[]
}): KPIs {
  const confirmedRSVPs = rsvps.filter(r => r.status === 'CONFIRMED')
  const pendingRSVPs = rsvps.filter(r => r.status === 'PENDING')

  const allAllergies = rsvps.flatMap(r => {
    if (!r.dietaryRestrictions || !Array.isArray(r.dietaryRestrictions)) return []
    return r.dietaryRestrictions.filter((d: string) => d.toLowerCase().includes('allergi'))
  })

  const allDietaryRestrictions = rsvps.flatMap(r => {
    if (!r.dietaryRestrictions || !Array.isArray(r.dietaryRestrictions)) return []
    return r.dietaryRestrictions.filter((d: string) => !d.toLowerCase().includes('allergi'))
  })

  return {
    totalGuests: guests.length,
    confirmedGuests: confirmedRSVPs.length,
    pendingGuests: pendingRSVPs.length,
    totalSessions: sessions.length,
    totalTransports: transportBookings.length,
    totalManifests: transportManifests.length,
    totalAccommodations: accommodations.length,
    totalRooms: roomAssignments.length,
    totalAllergies: allAllergies.length,
    totalDietaryRestrictions: allDietaryRestrictions.length,
    totalWarnings: allAllergies.length + allDietaryRestrictions.length
  }
}
