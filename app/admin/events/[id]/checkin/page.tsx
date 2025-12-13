"use client"

import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  QrCode, CheckCircle2, Users, Clock, Search, X, Camera, CameraOff, UserCheck, Maximize, Smartphone, MonitorPlay, Undo2
} from 'lucide-react'
import { toast } from 'sonner'
import jsQR from 'jsqr'
import { createClientLogger } from '@/lib/client-logger'

const logger = createClientLogger({ component: 'CheckinPage' })


interface Guest {
  id: string
  firstName: string
  lastName: string
  email: string
  company?: string
  tags: string[]
  rsvp?: {
    attending?: boolean
    plusOnes: number
    qrCodeId: string
  }
  checkins?: Array<{
    id: string
    checkedInAt: string
    desk?: string
    notes?: string
  }>
}

interface CheckinStats {
  total: number
  checkedIn: number
  pending: number
  percentageCheckedIn: number
}

export default function CheckinPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.id as string

  const [guests, setGuests] = useState<Guest[]>([])
  const [stats, setStats] = useState<CheckinStats>({
    total: 0,
    checkedIn: 0,
    pending: 0,
    percentageCheckedIn: 0
  })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [scannerActive, setScannerActive] = useState(false)
  const [selectedDesk, setSelectedDesk] = useState('A')
  const [availableDesks, setAvailableDesks] = useState<string[]>(['A', 'B', 'C'])
  const [newDeskName, setNewDeskName] = useState('')
  const [showAddDesk, setShowAddDesk] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number | undefined>(undefined)

  const fetchGuests = useCallback(async () => {
    try {
      // OPTIMISÉ: Utiliser l'endpoint dédié check-in qui retourne uniquement les invités confirmés
      const response = await fetch(`/api/admin/events/${eventId}/checkin-guests`)
      if (response.ok) {
        const data = await response.json()
        setGuests(data.guests)
        setStats(data.stats) // Stats pré-calculées par l'API
      }
    } catch (error) {
      logger.error(error, { action: 'fetchingGuests' })
    } finally {
      setLoading(false)
    }
  }, [eventId])

  useEffect(() => {
    fetchGuests()
  }, [fetchGuests])

  // QR Code Scanner - Initialize camera
  const initializeCamera = useCallback(async () => {
    try {
      // First check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast.error("Votre navigateur ne supporte pas l'accès à la caméra")
        setScannerActive(false)
        return
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        // Wait for video to be ready
        await new Promise<void>((resolve, reject) => {
          if (!videoRef.current) {
            reject(new Error('Video ref not available'))
            return
          }
          videoRef.current.onloadedmetadata = () => {
            resolve()
          }
          videoRef.current.onerror = () => {
            reject(new Error('Video loading error'))
          }
        })
        await videoRef.current.play()
        scanQRCode()
      }
    } catch (error) {
      logger.error(error, { action: 'accessingCamera' })
      setScannerActive(false)
      if (error instanceof DOMException) {
        if (error.name === 'NotAllowedError') {
          toast.error("Accès à la caméra refusé. Veuillez autoriser l'accès dans les paramètres de votre navigateur.")
        } else if (error.name === 'NotFoundError') {
          toast.error("Aucune caméra trouvée sur cet appareil")
        } else {
          toast.error(`Erreur caméra: ${error.message}`)
        }
      } else {
        toast.error("Impossible d'accéder à la caméra")
      }
    }
  }, [])

  // Effect to initialize camera when scanner becomes active
  useEffect(() => {
    if (scannerActive && videoRef.current && !videoRef.current.srcObject) {
      initializeCamera()
    }
  }, [scannerActive, initializeCamera])

  const startScanner = () => {
    // Just set the state - the useEffect will handle camera initialization
    setScannerActive(true)
  }

  const stopScanner = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
      videoRef.current.srcObject = null
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }

    setScannerActive(false)
  }

  const scanQRCode = () => {
    if (!videoRef.current || !canvasRef.current) return

    const canvas = canvasRef.current
    const video = videoRef.current

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.height = video.videoHeight
      canvas.width = video.videoWidth

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const code = jsQR(imageData.data, imageData.width, imageData.height)

      if (code) {
        handleQRCodeDetected(code.data)
        return
      }
    }

    animationFrameRef.current = requestAnimationFrame(scanQRCode)
  }

  const handleQRCodeDetected = async (data: string) => {
    // Extract QR code ID from URL
    const match = data.match(/\/api\/checkin\/([^\/]+)/)
    if (!match) {
      toast.error('QR code invalide')
      return
    }

    const qrCodeId = match[1]
    await performCheckin(qrCodeId)
  }

  const performCheckin = async (qrCodeId: string, manualGuestId?: string) => {
    try {
      const response = await fetch(`/api/checkin/${qrCodeId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          desk: selectedDesk,
          eventId: eventId,
          manualGuestId
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(`✓ ${data.guest.firstName} ${data.guest.lastName} enregistré(e) !`, {
          description: `Desk ${selectedDesk} • ${new Date().toLocaleTimeString('fr-FR')}`
        })
        stopScanner()
        fetchGuests()
      } else {
        if (data.alreadyCheckedIn) {
          toast.warning(`${data.guest.firstName} ${data.guest.lastName} est déjà enregistré(e)`, {
            description: `Enregistré(e) le ${new Date(data.existingCheckin.checkedInAt).toLocaleString('fr-FR')}`
          })
        } else {
          toast.error(data.error || 'Erreur lors de l\'enregistrement')
        }
      }
    } catch (error) {
      logger.error(error, { action: 'duringCheckin' })
      toast.error('Erreur lors de l\'enregistrement')
    }
  }

  const manualCheckin = async (guest: Guest) => {
    if (!guest.rsvp?.qrCodeId) {
      toast.error('QR code non disponible pour cet invité')
      return
    }

    await performCheckin(guest.rsvp!.qrCodeId, guest.id)
  }

  useEffect(() => {
    return () => {
      stopScanner()
    }
  }, [])

  const handleAddDesk = () => {
    const deskName = newDeskName.trim().toUpperCase()
    if (deskName && !availableDesks.includes(deskName)) {
      setAvailableDesks([...availableDesks, deskName])
      setNewDeskName('')
      setShowAddDesk(false)
      toast.success(`Kiosque ${deskName} ajouté`)
    } else if (availableDesks.includes(deskName)) {
      toast.error('Ce kiosque existe déjà')
    }
  }

  const handleRemoveDesk = (desk: string) => {
    if (availableDesks.length <= 1) {
      toast.error('Vous devez avoir au moins un kiosque')
      return
    }
    setAvailableDesks(availableDesks.filter(d => d !== desk))
    if (selectedDesk === desk) {
      setSelectedDesk(availableDesks[0])
    }
    toast.success(`Kiosque ${desk} supprimé`)
  }

  const cancelCheckin = async (guest: Guest) => {
    if (!guest.checkins || guest.checkins.length === 0) return

    const checkinId = guest.checkins[0].id

    try {
      const response = await fetch(`/api/admin/events/${eventId}/checkin/${checkinId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success(`Check-in de ${guest.firstName} ${guest.lastName} annulé`)
        fetchGuests()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Erreur lors de l\'annulation')
      }
    } catch (error) {
      logger.error(error, { action: 'cancelCheckin' })
      toast.error('Erreur lors de l\'annulation')
    }
  }

  const filteredGuests = guests.filter((guest) => {
    if (!search) return true
    const searchLower = search.toLowerCase()
    return (
      (guest.firstName || '').toLowerCase().includes(searchLower) ||
      (guest.lastName || '').toLowerCase().includes(searchLower) ||
      (guest.email || '').toLowerCase().includes(searchLower)
    )
  })

  const checkedInGuests = filteredGuests.filter((g) => g.checkins && g.checkins.length > 0)
  const pendingGuests = filteredGuests.filter((g) => !g.checkins || g.checkins.length === 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <QrCode className="h-12 w-12 text-[#009197] mx-auto mb-4 animate-pulse" />
          <p className="text-[#004645]/70">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold text-[#004645] mb-2" style={{ fontFamily: "var(--font-abril)" }}>
              Check-in des invités
            </h2>
            <p className="text-[#004645]/70">
              Scannez les QR codes ou enregistrez manuellement vos invités
            </p>
          </div>
          <div className="flex flex-col items-center gap-1 px-6 py-3 bg-gradient-to-br from-[#004645] to-[#009197] rounded-lg shadow-lg">
            <span className="text-xs text-white/70 uppercase tracking-wider">Kiosque</span>
            <span className="text-4xl font-bold text-white">{selectedDesk}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => router.push(`/admin/events/${eventId}/kiosk/self-service`)}
            variant="outline"
            className="border-[#009197] text-[#009197] hover:bg-[#009197] hover:text-white"
          >
            <Smartphone className="h-4 w-4 mr-2" />
            Self-Service
          </Button>
          <Button
            onClick={() => router.push(`/admin/events/${eventId}/kiosk/display`)}
            variant="outline"
            className="border-[#004645] text-[#004645] hover:bg-[#004645] hover:text-white"
          >
            <MonitorPlay className="h-4 w-4 mr-2" />
            Affichage
          </Button>
          <Button
            onClick={() => router.push(`/admin/events/${eventId}/kiosk`)}
            className="bg-gradient-to-r from-[#FF4713] to-[#FF6B3D] hover:from-[#FF5520] hover:to-[#FF7D4A] text-white shadow-lg"
          >
            <Maximize className="h-4 w-4 mr-2" />
            Mode Kiosque
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#004645]/70">Total confirmés</p>
                <p className="text-3xl font-bold text-[#004645]">{stats.total}</p>
              </div>
              <Users className="h-8 w-8 text-[#009197]" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#004645]/70">Enregistrés</p>
                <p className="text-3xl font-bold text-green-600">{stats.checkedIn}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#004645]/70">En attente</p>
                <p className="text-3xl font-bold text-orange-600">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#004645]/70">Taux d&apos;arrivée</p>
                <p className="text-3xl font-bold text-[#004645]">{stats.percentageCheckedIn}%</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-[#009197]/20 flex items-center justify-center">
                <span className="text-[#009197] font-bold text-sm">{stats.percentageCheckedIn}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scanner */}
      <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-[#004645]" style={{ fontFamily: "var(--font-abril)" }}>
            Scanner QR Code
          </CardTitle>
          <CardDescription className="text-[#004645]/70">
            Scannez le QR code de l&apos;invité pour l&apos;enregistrer automatiquement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Desk selection */}
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-[#004645]">Kiosques disponibles :</label>
                <div className="flex flex-wrap gap-2">
                  {availableDesks.map((desk) => (
                    <div key={desk} className="relative group">
                      <Button
                        variant={selectedDesk === desk ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedDesk(desk)}
                        className={selectedDesk === desk ? 'bg-[#004645] pr-8' : 'pr-8'}
                      >
                        {desk}
                      </Button>
                      {availableDesks.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRemoveDesk(desk)
                          }}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  ))}
                  {!showAddDesk ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAddDesk(true)}
                      className="border-dashed border-[#009197] text-[#009197]"
                    >
                      + Ajouter
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="D, E, F..."
                        value={newDeskName}
                        onChange={(e) => setNewDeskName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddDesk()
                          if (e.key === 'Escape') setShowAddDesk(false)
                        }}
                        className="w-20 h-8 text-sm"
                        autoFocus
                      />
                      <Button size="sm" onClick={handleAddDesk} className="h-8 bg-[#009197]">
                        OK
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setShowAddDesk(false)
                          setNewDeskName('')
                        }}
                        className="h-8"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Scanner controls */}
            <div className="flex gap-2">
              {!scannerActive ? (
                <Button onClick={startScanner} className="bg-[#004645] hover:bg-[#009197]">
                  <Camera className="h-4 w-4 mr-2" />
                  Activer la caméra
                </Button>
              ) : (
                <Button onClick={stopScanner} variant="outline" className="border-[#FF4713] text-[#FF4713]">
                  <CameraOff className="h-4 w-4 mr-2" />
                  Désactiver la caméra
                </Button>
              )}
            </div>

            {/* Video preview - video element always rendered, container visibility controlled */}
            <div className={`relative rounded-lg overflow-hidden bg-black max-w-2xl ${scannerActive ? '' : 'h-0 overflow-hidden'}`} style={scannerActive ? { aspectRatio: '4/3' } : {}}>
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
                autoPlay
              />
              <canvas ref={canvasRef} className="hidden" />
              {scannerActive && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-64 h-64 border-4 border-[#FF4713] rounded-lg" />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Manual Checkin List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending */}
        <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-[#004645] flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600" />
              En attente d&apos;arrivée ({pendingGuests.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#009197]" />
                <Input
                  type="text"
                  placeholder="Rechercher..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 border-[#9CD9F6]/50"
                />
              </div>
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {pendingGuests.length === 0 ? (
                <p className="text-center text-[#004645]/70 py-8">
                  {search ? 'Aucun résultat' : 'Tous les invités sont enregistrés !'}
                </p>
              ) : (
                pendingGuests.map((guest) => (
                  <div
                    key={guest.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-[#9CD9F6]/30 hover:bg-[#9CD9F6]/10 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-[#004645]">
                        {guest.firstName} {guest.lastName}
                      </p>
                      <p className="text-sm text-[#004645]/70">{guest.email}</p>
                      {guest.rsvp && guest.rsvp.plusOnes > 0 && (
                        <Badge variant="secondary" className="mt-1 text-xs">
                          +{guest.rsvp.plusOnes}
                        </Badge>
                      )}
                    </div>
                    <Button
                      size="sm"
                      onClick={() => manualCheckin(guest)}
                      className="bg-[#004645] hover:bg-[#009197]"
                    >
                      <UserCheck className="h-4 w-4 mr-1" />
                      Check-in
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Checked In */}
        <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-[#004645] flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Déjà enregistrés ({checkedInGuests.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {checkedInGuests.length === 0 ? (
                <p className="text-center text-[#004645]/70 py-8">
                  Aucun invité enregistré pour le moment
                </p>
              ) : (
                checkedInGuests.map((guest) => {
                  const latestCheckin = guest.checkins![0]
                  return (
                    <div
                      key={guest.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-green-200 bg-green-50/50"
                    >
                      <div>
                        <p className="font-medium text-[#004645]">
                          {guest.firstName} {guest.lastName}
                        </p>
                        <p className="text-sm text-[#004645]/70">
                          {new Date(latestCheckin.checkedInAt).toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                          {latestCheckin.desk && ` • Desk ${latestCheckin.desk}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => cancelCheckin(guest)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          title="Annuler le check-in"
                        >
                          <Undo2 className="h-4 w-4" />
                        </Button>
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
