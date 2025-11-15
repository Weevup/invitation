"use client"

import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  QrCode, CheckCircle2, Users, Clock, Search, X, Camera, CameraOff,
  UserCheck, Maximize, Minimize, LogOut, RefreshCw
} from 'lucide-react'
import { toast } from 'sonner'
import jsQR from 'jsqr'

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
  }>
}

interface CheckinStats {
  total: number
  checkedIn: number
  pending: number
  percentageCheckedIn: number
}

export default function KioskModePage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.id as string

  const [guests, setGuests] = useState<Guest[]>([])
  const [eventName, setEventName] = useState('')
  const [stats, setStats] = useState<CheckinStats>({
    total: 0,
    checkedIn: 0,
    pending: 0,
    percentageCheckedIn: 0
  })
  const [search, setSearch] = useState('')
  const [scannerActive, setScannerActive] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [lastCheckin, setLastCheckin] = useState<Guest | null>(null)
  const [selectedDesk, setSelectedDesk] = useState('A')
  const [availableDesks, setAvailableDesks] = useState<string[]>(['A', 'B', 'C'])
  const [showDeskSelector, setShowDeskSelector] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number | undefined>(undefined)

  const fetchGuests = useCallback(async () => {
    try {
      // OPTIMISÉ: Utiliser l'endpoint dédié check-in
      const response = await fetch(`/api/admin/events/${eventId}/checkin-guests`)
      if (response.ok) {
        const data = await response.json()
        setEventName(data.event.name)
        setGuests(data.guests)
        setStats(data.stats) // Stats pré-calculées par l'API
      }
    } catch (error) {
      console.error('Error fetching guests:', error)
    }
  }, [eventId])

  useEffect(() => {
    fetchGuests()
    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchGuests, 10000)
    return () => clearInterval(interval)
  }, [fetchGuests])

  // QR Code Scanner
  const startScanner = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: 1280, height: 720 }
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
        setScannerActive(true)
        scanQRCode()
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
      toast.error("Impossible d'accéder à la caméra")
    }
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
    const match = data.match(/\/api\/checkin\/([^\/]+)/)
    if (!match) {
      toast.error('QR code invalide')
      return
    }

    const qrCodeId = match[1]
    await performCheckin(qrCodeId)
  }

  const performCheckin = async (qrCodeId: string) => {
    try {
      const response = await fetch(`/api/admin/events/${eventId}/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrCodeId, desk: selectedDesk }),
      })

      if (response.ok) {
        const result = await response.json()
        toast.success(`✅ ${result.guest.firstName} ${result.guest.lastName} enregistré(e) !`, {
          duration: 3000,
        })

        // Show last checkin
        setLastCheckin(result.guest)
        setTimeout(() => setLastCheckin(null), 5000)

        // Refresh guests
        await fetchGuests()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erreur lors du check-in')
      }
    } catch (error) {
      console.error('Checkin error:', error)
      toast.error('Erreur de connexion')
    }
  }

  const handleManualCheckin = async (guestId: string) => {
    const guest = guests.find(g => g.id === guestId)
    if (!guest?.rsvp?.qrCodeId) {
      toast.error('QR code non trouvé pour cet invité')
      return
    }

    await performCheckin(guest.rsvp.qrCodeId)
    setSearch('')
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const exitKiosk = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen()
    }
    router.push(`/admin/events/${eventId}/checkin`)
  }

  // Filter guests by search
  const filteredGuests = guests.filter(guest => {
    if (!search) return false
    const searchLower = search.toLowerCase()
    return (
      guest.firstName.toLowerCase().includes(searchLower) ||
      guest.lastName.toLowerCase().includes(searchLower) ||
      guest.email.toLowerCase().includes(searchLower) ||
      (guest.company && guest.company.toLowerCase().includes(searchLower))
    )
  })

  const isCheckedIn = (guest: Guest) => guest.checkins && guest.checkins.length > 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#004645] via-[#009197] to-[#004645] p-4 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">Mode Kiosque - Check-in</h1>
              <p className="text-white/80 text-lg">{eventName}</p>
            </div>
            <button
              onClick={() => setShowDeskSelector(!showDeskSelector)}
              className="flex flex-col items-center gap-1 px-8 py-4 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl shadow-2xl transition-all cursor-pointer border-2 border-white/30"
            >
              <span className="text-sm text-white/90 uppercase tracking-wider font-semibold">Kiosque</span>
              <span className="text-5xl font-bold text-white">{selectedDesk}</span>
            </button>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="lg"
              onClick={fetchGuests}
              className="bg-white/10 hover:bg-white/20 text-white border-white/30"
            >
              <RefreshCw className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={toggleFullscreen}
              className="bg-white/10 hover:bg-white/20 text-white border-white/30"
            >
              {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={exitKiosk}
              className="bg-white/10 hover:bg-white/20 text-white border-white/30"
            >
              <LogOut className="h-5 w-5 mr-2" />
              Quitter
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white/95 backdrop-blur border-0 shadow-2xl">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Invités</p>
                  <p className="text-3xl font-bold text-[#004645]">{stats.total}</p>
                </div>
                <Users className="h-12 w-12 text-[#009197] opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur border-0 shadow-2xl">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Présents</p>
                  <p className="text-3xl font-bold text-green-600">{stats.checkedIn}</p>
                </div>
                <CheckCircle2 className="h-12 w-12 text-green-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur border-0 shadow-2xl">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">En Attente</p>
                  <p className="text-3xl font-bold text-orange-600">{stats.pending}</p>
                </div>
                <Clock className="h-12 w-12 text-orange-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur border-0 shadow-2xl">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Taux</p>
                  <p className="text-3xl font-bold text-[#FF4713]">{stats.percentageCheckedIn}%</p>
                </div>
                <UserCheck className="h-12 w-12 text-[#FF4713] opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Desk Selector Popup */}
      {showDeskSelector && (
        <div className="max-w-7xl mx-auto mb-6 animate-in slide-in-from-top">
          <Card className="bg-white border-0 shadow-2xl">
            <CardContent className="py-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-[#004645]">Sélectionner un kiosque</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeskSelector(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                {availableDesks.map((desk) => (
                  <Button
                    key={desk}
                    onClick={() => {
                      setSelectedDesk(desk)
                      setShowDeskSelector(false)
                      toast.success(`Kiosque ${desk} sélectionné`)
                    }}
                    variant={selectedDesk === desk ? 'default' : 'outline'}
                    size="lg"
                    className={`h-20 text-2xl font-bold ${
                      selectedDesk === desk
                        ? 'bg-gradient-to-br from-[#004645] to-[#009197]'
                        : 'hover:bg-[#9CD9F6]/20'
                    }`}
                  >
                    {desk}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Last Checkin Notification */}
      {lastCheckin && (
        <div className="max-w-7xl mx-auto mb-6 animate-in slide-in-from-top">
          <Card className="bg-green-500 border-0 shadow-2xl">
            <CardContent className="py-4">
              <div className="flex items-center gap-4">
                <CheckCircle2 className="h-12 w-12 text-white" />
                <div className="flex-1">
                  <p className="text-white font-bold text-2xl">
                    {lastCheckin.firstName} {lastCheckin.lastName}
                  </p>
                  <p className="text-white/90">{lastCheckin.company || lastCheckin.email}</p>
                </div>
                <Badge className="bg-white text-green-600 text-lg px-4 py-2">Enregistré ✓</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* QR Code Scanner */}
        <Card className="bg-white/95 backdrop-blur border-0 shadow-2xl">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-[#004645] flex items-center gap-2">
                <QrCode className="h-6 w-6" />
                Scanner QR Code
              </h2>
              <Button
                size="lg"
                onClick={scannerActive ? stopScanner : startScanner}
                className={scannerActive
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-gradient-to-r from-[#004645] to-[#009197]"
                }
              >
                {scannerActive ? (
                  <>
                    <CameraOff className="h-5 w-5 mr-2" />
                    Arrêter
                  </>
                ) : (
                  <>
                    <Camera className="h-5 w-5 mr-2" />
                    Démarrer
                  </>
                )}
              </Button>
            </div>

            <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
              {scannerActive ? (
                <>
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    playsInline
                    muted
                  />
                  <canvas ref={canvasRef} className="hidden" />
                  <div className="absolute inset-0 border-4 border-green-500 animate-pulse pointer-events-none" />
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-4 border-white/50 pointer-events-none" />
                </>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-white/70">
                    <Camera className="h-24 w-24 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">Cliquez sur &quot;Démarrer&quot; pour activer la caméra</p>
                  </div>
                </div>
              )}
            </div>

            <p className="text-sm text-gray-600 mt-4 text-center">
              Pointez la caméra vers le QR code de l&apos;invité
            </p>
          </CardContent>
        </Card>

        {/* Manual Search */}
        <Card className="bg-white/95 backdrop-blur border-0 shadow-2xl">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold text-[#004645] flex items-center gap-2 mb-4">
              <Search className="h-6 w-6" />
              Recherche Manuelle
            </h2>

            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Nom, prénom, email, entreprise..."
                className="pl-10 pr-10 h-14 text-lg border-[#9CD9F6]/50 focus:border-[#009197]"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {search && filteredGuests.length === 0 && (
                <p className="text-center text-gray-500 py-8">Aucun invité trouvé</p>
              )}

              {filteredGuests.map((guest) => {
                const checkedIn = isCheckedIn(guest)

                return (
                  <Card
                    key={guest.id}
                    className={`transition-all cursor-pointer ${
                      checkedIn
                        ? 'bg-green-50 border-green-200'
                        : 'bg-white hover:bg-[#9CD9F6]/10 border-[#9CD9F6]/30'
                    }`}
                    onClick={() => !checkedIn && handleManualCheckin(guest.id)}
                  >
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-bold text-lg text-[#004645]">
                            {guest.firstName} {guest.lastName}
                          </p>
                          <p className="text-sm text-gray-600">
                            {guest.company || guest.email}
                          </p>
                          {guest.tags.length > 0 && (
                            <div className="flex gap-1 mt-1">
                              {guest.tags.slice(0, 3).map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        {checkedIn ? (
                          <Badge className="bg-green-500 text-white px-4 py-2 text-lg">
                            <CheckCircle2 className="h-5 w-5 mr-2" />
                            Présent
                          </Badge>
                        ) : (
                          <Button size="lg" className="bg-gradient-to-r from-[#004645] to-[#009197]">
                            <UserCheck className="h-5 w-5 mr-2" />
                            Enregistrer
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {!search && (
              <p className="text-center text-gray-500 py-12">
                Commencez à taper pour rechercher un invité
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
