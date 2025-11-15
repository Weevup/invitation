"use client"

import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import Image from 'next/image'
import {
  User,
  Mail,
  Building2,
  Tag,
  UserCheck,
  Users,
  UtensilsCrossed,
  AlertTriangle,
  Bus,
  Hotel,
  Accessibility,
  Camera,
  QrCode,
  Download,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  MapPin,
} from 'lucide-react'
import { generateQRCode } from '@/lib/qrcode'

interface GuestDetailsModalProps {
  guest: {
    id: string
    firstName: string
    lastName: string
    email: string
    company?: string
    tags: string[]
    status: string
    token: string
    rsvp?: {
      attending?: boolean
      plusOnes: number
      mealChoice?: string
      allergies?: string
      accessibilityNotes?: string
      transportNeeds?: string
      lodgingNeeds?: string
      consentPhotos: boolean
      createdAt: string
      qrCodeId: string
    }
    checkins?: Array<{
      checkedInAt: string
      desk?: string
      notes?: string
    }>
  }
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function GuestDetailsModal({ guest, open, onOpenChange }: GuestDetailsModalProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && guest.rsvp?.qrCodeId) {
      generateQRCodeImage()
    }
  }, [open, guest.rsvp?.qrCodeId])

  const generateQRCodeImage = async () => {
    if (!guest.rsvp?.qrCodeId) return

    setLoading(true)
    try {
      const baseUrl = window.location.origin
      const checkinUrl = `${baseUrl}/api/checkin/${guest.rsvp.qrCodeId}`
      const qrUrl = await generateQRCode(checkinUrl)
      setQrCodeUrl(qrUrl)
    } catch (error) {
      console.error('Error generating QR code:', error)
    } finally {
      setLoading(false)
    }
  }

  const downloadQRCode = () => {
    if (!qrCodeUrl) return

    const link = document.createElement('a')
    link.href = qrCodeUrl
    link.download = `qrcode-${guest.firstName}-${guest.lastName}.png`
    link.click()
  }

  const hasCheckedIn = guest.checkins && guest.checkins.length > 0
  const latestCheckin = hasCheckedIn ? guest.checkins![0] : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <User className="h-6 w-6 text-[#009197]" />
            {guest.firstName} {guest.lastName}
          </DialogTitle>
          <DialogDescription>
            Détails complets de l&apos;invité et de sa réponse
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informations de base */}
          <section>
            <h3 className="text-lg font-semibold mb-3 text-[#004645]">Informations de contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-[#009197] mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{guest.email}</p>
                </div>
              </div>
              {guest.company && (
                <div className="flex items-start gap-3">
                  <Building2 className="h-5 w-5 text-[#009197] mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Entreprise</p>
                    <p className="font-medium">{guest.company}</p>
                  </div>
                </div>
              )}
            </div>
            {guest.tags.length > 0 && (
              <div className="flex items-start gap-3 mt-4">
                <Tag className="h-5 w-5 text-[#009197] mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500 mb-2">Tags</p>
                  <div className="flex gap-2 flex-wrap">
                    {guest.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="bg-[#9CD9F6]/20 text-[#004645]">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </section>

          <Separator />

          {/* Statut RSVP */}
          <section>
            <h3 className="text-lg font-semibold mb-3 text-[#004645]">Réponse RSVP</h3>

            {!guest.rsvp ? (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-center gap-3">
                <HelpCircle className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="font-medium text-orange-900">En attente de réponse</p>
                  <p className="text-sm text-orange-700">L&apos;invité n&apos;a pas encore confirmé sa présence</p>
                </div>
              </div>
            ) : (
              <>
                <div className={`rounded-lg p-4 flex items-center gap-3 mb-4 ${
                  guest.rsvp.attending === true
                    ? 'bg-green-50 border border-green-200'
                    : guest.rsvp.attending === false
                    ? 'bg-red-50 border border-red-200'
                    : 'bg-gray-50 border border-gray-200'
                }`}>
                  {guest.rsvp.attending === true ? (
                    <>
                      <CheckCircle2 className="h-6 w-6 text-green-600" />
                      <div>
                        <p className="font-semibold text-green-900">Participe à l&apos;événement</p>
                        <p className="text-sm text-green-700">
                          Confirmé le {new Date(guest.rsvp.createdAt).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </>
                  ) : guest.rsvp.attending === false ? (
                    <>
                      <XCircle className="h-6 w-6 text-red-600" />
                      <div>
                        <p className="font-semibold text-red-900">Ne participera pas</p>
                        <p className="text-sm text-red-700">
                          Décliné le {new Date(guest.rsvp.createdAt).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <HelpCircle className="h-6 w-6 text-gray-600" />
                      <div>
                        <p className="font-semibold text-gray-900">Réponse indécise</p>
                        <p className="text-sm text-gray-700">L&apos;invité hésite encore</p>
                      </div>
                    </>
                  )}
                </div>

                {guest.rsvp.attending && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Accompagnants */}
                    <div className="flex items-start gap-3">
                      <Users className="h-5 w-5 text-[#009197] mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Accompagnants</p>
                        <p className="font-medium">
                          {guest.rsvp.plusOnes > 0 ? `${guest.rsvp.plusOnes} personne(s)` : 'Aucun'}
                        </p>
                      </div>
                    </div>

                    {/* Repas */}
                    {guest.rsvp.mealChoice && (
                      <div className="flex items-start gap-3">
                        <UtensilsCrossed className="h-5 w-5 text-[#009197] mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">Choix de repas</p>
                          <p className="font-medium">{guest.rsvp.mealChoice}</p>
                        </div>
                      </div>
                    )}

                    {/* Allergies */}
                    {guest.rsvp.allergies && (
                      <div className="flex items-start gap-3 md:col-span-2">
                        <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">Allergies / Restrictions alimentaires</p>
                          <p className="font-medium text-orange-900">{guest.rsvp.allergies}</p>
                        </div>
                      </div>
                    )}

                    {/* Transport */}
                    {guest.rsvp.transportNeeds && (
                      <div className="flex items-start gap-3 md:col-span-2">
                        <Bus className="h-5 w-5 text-[#009197] mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">Besoins en transport</p>
                          <p className="font-medium">{guest.rsvp.transportNeeds}</p>
                        </div>
                      </div>
                    )}

                    {/* Hébergement */}
                    {guest.rsvp.lodgingNeeds && (
                      <div className="flex items-start gap-3 md:col-span-2">
                        <Hotel className="h-5 w-5 text-[#009197] mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">Besoins en hébergement</p>
                          <p className="font-medium">{guest.rsvp.lodgingNeeds}</p>
                        </div>
                      </div>
                    )}

                    {/* Accessibilité */}
                    {guest.rsvp.accessibilityNotes && (
                      <div className="flex items-start gap-3 md:col-span-2">
                        <Accessibility className="h-5 w-5 text-[#009197] mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">Besoins d&apos;accessibilité</p>
                          <p className="font-medium">{guest.rsvp.accessibilityNotes}</p>
                        </div>
                      </div>
                    )}

                    {/* Consentement photos */}
                    <div className="flex items-start gap-3">
                      <Camera className="h-5 w-5 text-[#009197] mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Consentement photos</p>
                        <p className="font-medium">
                          {guest.rsvp.consentPhotos ? '✓ Accepté' : '✗ Refusé'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </section>

          {/* QR Code */}
          {guest.rsvp?.attending && guest.rsvp.qrCodeId && (
            <>
              <Separator />
              <section>
                <h3 className="text-lg font-semibold mb-3 text-[#004645]">QR Code d&apos;accès</h3>
                <div className="bg-gray-50 rounded-lg p-6 flex flex-col items-center gap-4">
                  {loading ? (
                    <div className="w-64 h-64 bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
                      <QrCode className="h-12 w-12 text-gray-400" />
                    </div>
                  ) : qrCodeUrl ? (
                    <>
                      <Image
                        src={qrCodeUrl}
                        alt="QR Code"
                        width={256}
                        height={256}
                        className="w-64 h-64 border-4 border-white shadow-lg rounded-lg"
                      />
                      <p className="text-sm text-gray-600 text-center">
                        À présenter à l&apos;entrée de l&apos;événement
                      </p>
                      <Button onClick={downloadQRCode} variant="outline" className="gap-2">
                        <Download className="h-4 w-4" />
                        Télécharger le QR code
                      </Button>
                    </>
                  ) : (
                    <p className="text-sm text-gray-500">Impossible de générer le QR code</p>
                  )}
                </div>
              </section>
            </>
          )}

          {/* Check-in Status */}
          {guest.rsvp?.attending && (
            <>
              <Separator />
              <section>
                <h3 className="text-lg font-semibold mb-3 text-[#004645]">Statut d&apos;enregistrement</h3>
                {hasCheckedIn ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <p className="font-semibold text-green-900">Invité enregistré</p>
                    </div>
                    <div className="ml-8 space-y-1 text-sm text-green-700">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>
                          Arrivé le {new Date(latestCheckin!.checkedInAt).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      {latestCheckin!.desk && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>Desk {latestCheckin!.desk}</span>
                        </div>
                      )}
                      {latestCheckin!.notes && (
                        <p className="mt-2 italic">{latestCheckin!.notes}</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
                    <UserCheck className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-blue-900">En attente d&apos;arrivée</p>
                      <p className="text-sm text-blue-700">L&apos;invité n&apos;est pas encore enregistré à l&apos;événement</p>
                    </div>
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
