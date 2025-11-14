'use client'

import {
  X,
  Download,
  Mail,
  Phone,
  MapPin,
  Users,
  Clock,
  Utensils,
  Wrench,
  AlertTriangle,
  User,
  Hotel,
  FileText
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { cn } from '@/lib/utils'
import type { TimeSlot, Warning } from '@/app/api/admin/events/[id]/operations/helpers'
import type { Guest, RSVP } from '@prisma/client'

interface BlockDetailsPanelProps {
  slot: TimeSlot
  rawData: {
    guests: Guest[]
    rsvps: (RSVP & { guest: Guest })[]
  }
  onClose: () => void
}

export function BlockDetailsPanel({ slot, rawData, onClose }: BlockDetailsPanelProps) {
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  return (
    <div className="w-[420px] border-l bg-white flex flex-col h-full">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b p-4 flex items-start justify-between z-10">
        <div className="flex-1 pr-4">
          <h3 className="font-semibold text-lg leading-tight">{slot.title}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {formatDate(slot.startTime)}
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0">
          <X size={18} />
        </Button>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Timing */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Clock size={16} className="text-muted-foreground" />
              <h4 className="font-medium text-sm">Horaires</h4>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Début</span>
                <span className="font-medium">{formatTime(slot.startTime)}</span>
              </div>
              {slot.endTime && (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fin</span>
                    <span className="font-medium">{formatTime(slot.endTime)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Durée</span>
                    <span className="font-medium">
                      {getDuration(slot.startTime, slot.endTime)}
                    </span>
                  </div>
                </>
              )}
            </div>
          </section>

          <Separator />

          {/* Location */}
          {slot.location && (
            <>
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <MapPin size={16} className="text-muted-foreground" />
                  <h4 className="font-medium text-sm">Lieu</h4>
                </div>
                <p className="text-sm">{slot.location}</p>
              </section>
              <Separator />
            </>
          )}

          {/* Participants */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-muted-foreground" />
                <h4 className="font-medium text-sm">
                  Participants ({slot.participants.length}
                  {slot.capacity && `/${slot.capacity}`})
                </h4>
              </div>
              <Button variant="outline" size="sm" className="h-7 text-xs">
                <Download size={12} className="mr-1" />
                Exporter
              </Button>
            </div>

            {slot.capacity && (
              <div className="mb-3">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Taux de remplissage</span>
                  <span>{Math.round((slot.participants.length / slot.capacity) * 100)}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      slot.participants.length / slot.capacity > 0.9
                        ? "bg-red-500"
                        : slot.participants.length / slot.capacity > 0.7
                        ? "bg-orange-500"
                        : "bg-green-500"
                    )}
                    style={{
                      width: `${Math.min((slot.participants.length / slot.capacity) * 100, 100)}%`
                    }}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {slot.participants.map((guest) => {
                const rsvp = rawData.rsvps.find(r => r.guestId === guest.id)
                const allergyText = rsvp?.allergies?.trim()
                const hasAllergy = allergyText && allergyText.toLowerCase().includes('allergi')
                const hasDietary = allergyText && !allergyText.toLowerCase().includes('allergi')

                return (
                  <div
                    key={guest.id}
                    className="flex items-start justify-between p-2 rounded-lg hover:bg-gray-50 text-sm"
                  >
                    <div className="flex items-start gap-2 flex-1">
                      <User size={14} className="text-muted-foreground mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium">
                          {guest.firstName} {guest.lastName}
                        </div>
                        {allergyText && (
                          <div className="text-xs mt-1">
                            <div
                              className={cn(
                                "flex items-center gap-1",
                                hasAllergy ? "text-red-600" : "text-orange-600"
                              )}
                            >
                              <AlertTriangle size={10} />
                              <span>{allergyText}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {hasAllergy && (
                        <Badge variant="destructive" className="text-[10px] h-4 px-1">
                          Allergie
                        </Badge>
                      )}
                      {hasDietary && (
                        <Badge variant="secondary" className="text-[10px] h-4 px-1">
                          Régime
                        </Badge>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          {/* Warnings */}
          {slot.warnings.length > 0 && (
            <>
              <Separator />
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle size={16} className="text-orange-600" />
                  <h4 className="font-medium text-sm text-orange-900">
                    Alertes ({slot.warnings.length})
                  </h4>
                </div>
                <div className="space-y-2">
                  {slot.warnings.map((warning) => (
                    <Alert
                      key={warning.id}
                      className={cn(
                        "text-sm",
                        warning.severity === 'critical' ? "border-red-200 bg-red-50" :
                        warning.severity === 'warning' ? "border-orange-200 bg-orange-50" :
                        "border-blue-200 bg-blue-50"
                      )}
                    >
                      <AlertTriangle className={cn(
                        "h-4 w-4",
                        warning.severity === 'critical' ? "text-red-600" :
                        warning.severity === 'warning' ? "text-orange-600" :
                        "text-blue-600"
                      )} />
                      <AlertDescription className={cn(
                        warning.severity === 'critical' ? "text-red-900" :
                        warning.severity === 'warning' ? "text-orange-900" :
                        "text-blue-900"
                      )}>
                        <div className="font-medium mb-1">{warning.message}</div>
                        {warning.details && warning.details.length > 0 && (
                          <div className="text-xs space-y-0.5 mt-1 opacity-90">
                            {warning.details.map((detail, i) => (
                              <div key={i}>• {detail}</div>
                            ))}
                          </div>
                        )}
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </section>
            </>
          )}

          {/* Session-specific: Catering */}
          {slot.type === 'session' && slot.catering && (
            <>
              <Separator />
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Utensils size={16} className="text-muted-foreground" />
                  <h4 className="font-medium text-sm">Catering</h4>
                </div>
                <p className="text-sm">{slot.catering}</p>
              </section>
            </>
          )}

          {/* Session-specific: Equipment */}
          {slot.type === 'session' && slot.equipment && slot.equipment.length > 0 && (
            <>
              <Separator />
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Wrench size={16} className="text-muted-foreground" />
                  <h4 className="font-medium text-sm">Équipement</h4>
                </div>
                <ul className="text-sm space-y-1">
                  {slot.equipment.map((item, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="text-muted-foreground">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            </>
          )}

          {/* Session-specific: Groups */}
          {slot.type === 'session' && slot.requiresGroups && slot.groups && slot.groups.length > 0 && (
            <>
              <Separator />
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Users size={16} className="text-muted-foreground" />
                  <h4 className="font-medium text-sm">Groupes ({slot.groups.length})</h4>
                </div>
                <div className="space-y-2">
                  {slot.groups.map((group) => {
                    const participantCount = group._count?.participants || 0
                    const isOverCapacity = group.capacity && participantCount > group.capacity
                    const fillRate = group.capacity ? (participantCount / group.capacity) * 100 : 0

                    return (
                      <div
                        key={group.id}
                        className="p-3 border rounded-lg"
                        style={{ borderLeftWidth: '4px', borderLeftColor: group.color || '#3B82F6' }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: group.color || '#3B82F6' }}
                            />
                            <span className="font-medium">{group.name}</span>
                          </div>
                          <span className={cn(
                            "text-sm font-medium",
                            isOverCapacity ? "text-red-600" : "text-muted-foreground"
                          )}>
                            {participantCount}
                            {group.capacity && `/${group.capacity}`}
                          </span>
                        </div>

                        {group.description && (
                          <p className="text-xs text-muted-foreground mb-2">{group.description}</p>
                        )}

                        {group.capacity && (
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Taux de remplissage</span>
                              <span>{Math.round(fillRate)}%</span>
                            </div>
                            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={cn(
                                  "h-full rounded-full transition-all",
                                  fillRate > 100 ? "bg-red-500" :
                                  fillRate > 90 ? "bg-orange-500" :
                                  fillRate > 70 ? "bg-yellow-500" :
                                  "bg-green-500"
                                )}
                                style={{ width: `${Math.min(fillRate, 100)}%` }}
                              />
                            </div>
                            {isOverCapacity && (
                              <p className="text-xs text-red-600 mt-1">⚠️ Capacité dépassée</p>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </section>
            </>
          )}

          {/* Transport-specific: Manifest */}
          {slot.type === 'transport' && slot.manifest && (
            <>
              <Separator />
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <FileText size={16} className="text-muted-foreground" />
                  <h4 className="font-medium text-sm">Informations transport</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type</span>
                    <span className="font-medium">{slot.manifest.type}</span>
                  </div>
                  {slot.manifest.route && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Trajet</span>
                      <span className="font-medium text-xs">{slot.manifest.route}</span>
                    </div>
                  )}
                  {slot.manifest.driverName && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Chauffeur</span>
                      <span className="font-medium">{slot.manifest.driverName}</span>
                    </div>
                  )}
                  {slot.manifest.driverPhone && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Téléphone</span>
                      <a
                        href={`tel:${slot.manifest.driverPhone}`}
                        className="font-medium text-blue-600 hover:underline"
                      >
                        {slot.manifest.driverPhone}
                      </a>
                    </div>
                  )}
                  {slot.manifest.vehicleInfo && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Véhicule</span>
                      <span className="font-medium">{slot.manifest.vehicleInfo}</span>
                    </div>
                  )}
                </div>
              </section>
            </>
          )}

          {/* Accommodation-specific: Hotels */}
          {slot.type === 'accommodation' && slot.accommodations && slot.accommodations.length > 0 && (
            <>
              <Separator />
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Hotel size={16} className="text-muted-foreground" />
                  <h4 className="font-medium text-sm">Hôtels ({slot.accommodations.length})</h4>
                </div>
                <div className="space-y-3">
                  {slot.accommodations.map((acc: any) => (
                    <div key={acc.id} className="p-3 border rounded-lg">
                      <div className="font-medium">{acc.name}</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {acc.guestCount} participant(s) • {acc.roomCount} chambre(s)
                      </div>
                      {acc.rooms && acc.rooms.length > 0 && (
                        <div className="text-xs text-muted-foreground mt-2">
                          Chambres: {acc.rooms.join(', ')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}
        </div>
      </ScrollArea>

      {/* Actions */}
      <div className="border-t p-4 space-y-2">
        {slot.type === 'session' && (slot.subType === 'MEAL' || slot.catering) && (
          <Button variant="outline" className="w-full justify-start" size="sm">
            <Download size={14} className="mr-2" />
            Exporter fiche technique traiteur
          </Button>
        )}

        {slot.type === 'transport' && slot.manifest && (
          <>
            <Button variant="outline" className="w-full justify-start" size="sm">
              <Download size={14} className="mr-2" />
              Télécharger manifest PDF
            </Button>
            {slot.manifest.driverPhone && (
              <Button variant="outline" className="w-full justify-start" size="sm">
                <Phone size={14} className="mr-2" />
                Appeler le chauffeur
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function getDuration(start: Date, end: Date): string {
  const diff = new Date(end).getTime() - new Date(start).getTime()
  const minutes = Math.floor(diff / 1000 / 60)
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (hours === 0) {
    return `${minutes} minutes`
  }

  if (remainingMinutes === 0) {
    return `${hours} heure${hours > 1 ? 's' : ''}`
  }

  return `${hours}h${remainingMinutes.toString().padStart(2, '0')}`
}
