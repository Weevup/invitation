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
import { createClientLogger } from '@/lib/client-logger'

const logger = createClientLogger({ component: 'KioskPage' })


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
  const [activeTab, setActiveTab] = useState<'scanner' | 'search'>('scanner')

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
      logger.error(error, { action: 'fetchingGuests' })
    }
  }, [eventId])

  useEffect(() => {
    fetchGuests()
    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchGuests, 10000)
    return () => clearInterval(interval)
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
      const response = await fetch(`/api/checkin/${qrCodeId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ desk: selectedDesk }),
      })

      if (response.ok) {
        const result = await response.json()
        toast.success(`${result.guest.firstName} ${result.guest.lastName} enregistré(e) !`, {
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
      logger.error(error, { action: 'CheckinError' })
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
      (guest.firstName || '').toLowerCase().includes(searchLower) ||
      (guest.lastName || '').toLowerCase().includes(searchLower) ||
      (guest.email || '').toLowerCase().includes(searchLower) ||
      (guest.company || '').toLowerCase().includes(searchLower)
    )
  })

  const isCheckedIn = (guest: Guest) => guest.checkins && guest.checkins.length > 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#004645] via-[#009197] to-[#004645] p-2 sm:p-4 md:p-8">
      {/* Header - Mobile optimized */}
      <div className="max-w-7xl mx-auto mb-3 sm:mb-6">
        {/* Top bar with actions */}
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Kiosk badge - compact on mobile */}
            <button
              onClick={() => setShowDeskSelector(!showDeskSelector)}
              className="flex items-center sm:flex-col gap-1 sm:gap-0 px-3 sm:px-6 py-2 sm:py-3 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-lg sm:rounded-xl shadow-xl transition-all cursor-pointer border border-white/30"
            >
              <span className="hidden sm:block text-xs text-white/90 uppercase tracking-wider font-semibold">Kiosque</span>
              <span className="text-2xl sm:text-4xl font-bold text-white">{selectedDesk}</span>
            </button>
            {/* Title - hidden on small screens */}
            <div className="hidden md:block">
              <h1 className="text-xl lg:text-3xl font-bold text-white">Mode Kiosque</h1>
              <p className="text-white/80 text-sm lg:text-base truncate max-w-[200px] lg:max-w-none">{eventName}</p>
            </div>
          </div>

          {/* Action buttons - icon only on mobile */}
          <div className="flex gap-1 sm:gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchGuests}
              className="bg-white/10 hover:bg-white/20 text-white border-white/30 h-9 w-9 sm:h-10 sm:w-10 p-0"
            >
              <RefreshCw className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleFullscreen}
              className="bg-white/10 hover:bg-white/20 text-white border-white/30 h-9 w-9 sm:h-10 sm:w-10 p-0"
            >
              {isFullscreen ? <Minimize className="h-4 w-4 sm:h-5 sm:w-5" /> : <Maximize className="h-4 w-4 sm:h-5 sm:w-5" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exitKiosk}
              className="bg-white/10 hover:bg-white/20 text-white border-white/30 h-9 sm:h-10 px-2 sm:px-3"
            >
              <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline ml-2">Quitter</span>
            </Button>
          </div>
        </div>

        {/* Stats - 2x2 on mobile, 4 columns on desktop */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
          <Card className="bg-white/95 backdrop-blur border-0 shadow-xl">
            <CardContent className="p-3 sm:pt-6 sm:pb-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-0.5 sm:mb-1">Total</p>
                  <p className="text-xl sm:text-3xl font-bold text-[#004645]">{stats.total}</p>
                </div>
                <Users className="h-8 w-8 sm:h-12 sm:w-12 text-[#009197] opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur border-0 shadow-xl">
            <CardContent className="p-3 sm:pt-6 sm:pb-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-0.5 sm:mb-1">Présents</p>
                  <p className="text-xl sm:text-3xl font-bold text-green-600">{stats.checkedIn}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 sm:h-12 sm:w-12 text-green-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur border-0 shadow-xl">
            <CardContent className="p-3 sm:pt-6 sm:pb-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-0.5 sm:mb-1">Attente</p>
                  <p className="text-xl sm:text-3xl font-bold text-orange-600">{stats.pending}</p>
                </div>
                <Clock className="h-8 w-8 sm:h-12 sm:w-12 text-orange-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur border-0 shadow-xl">
            <CardContent className="p-3 sm:pt-6 sm:pb-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-0.5 sm:mb-1">Taux</p>
                  <p className="text-xl sm:text-3xl font-bold text-[#FF4713]">{stats.percentageCheckedIn}%</p>
                </div>
                <UserCheck className="h-8 w-8 sm:h-12 sm:w-12 text-[#FF4713] opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Desk Selector Popup */}
      {showDeskSelector && (
        <div className="max-w-7xl mx-auto mb-3 sm:mb-6 animate-in slide-in-from-top">
          <Card className="bg-white border-0 shadow-2xl">
            <CardContent className="p-4 sm:py-6">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="text-lg sm:text-2xl font-bold text-[#004645]">Sélectionner un kiosque</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeskSelector(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-3">
                {availableDesks.map((desk) => (
                  <Button
                    key={desk}
                    onClick={() => {
                      setSelectedDesk(desk)
                      setShowDeskSelector(false)
                      toast.success(`Kiosque ${desk} sélectionné`)
                    }}
                    variant={selectedDesk === desk ? 'default' : 'outline'}
                    className={`h-14 sm:h-20 text-xl sm:text-2xl font-bold ${
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

      {/* Last Checkin Notification - Compact on mobile */}
      {lastCheckin && (
        <div className="max-w-7xl mx-auto mb-3 sm:mb-6 animate-in slide-in-from-top">
          <Card className="bg-green-500 border-0 shadow-2xl">
            <CardContent className="py-3 sm:py-4 px-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <CheckCircle2 className="h-8 w-8 sm:h-12 sm:w-12 text-white flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-lg sm:text-2xl truncate">
                    {lastCheckin.firstName} {lastCheckin.lastName}
                  </p>
                  <p className="text-white/90 text-sm sm:text-base truncate">{lastCheckin.company || lastCheckin.email}</p>
                </div>
                <Badge className="bg-white text-green-600 text-sm sm:text-lg px-2 sm:px-4 py-1 sm:py-2 flex-shrink-0">
                  <span className="hidden sm:inline">Enregistré</span> ✓
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Mobile Tab Switcher - Only visible on small screens */}
      <div className="lg:hidden max-w-7xl mx-auto mb-3">
        <div className="flex bg-white/20 backdrop-blur rounded-lg p-1">
          <button
            onClick={() => setActiveTab('scanner')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-all ${
              activeTab === 'scanner'
                ? 'bg-white text-[#004645] shadow'
                : 'text-white/90 hover:text-white'
            }`}
          >
            <QrCode className="h-4 w-4" />
            Scanner
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-all ${
              activeTab === 'search'
                ? 'bg-white text-[#004645] shadow'
                : 'text-white/90 hover:text-white'
            }`}
          >
            <Search className="h-4 w-4" />
            Recherche
          </button>
        </div>
      </div>

      {/* Main Content - Tabs on mobile, side by side on desktop */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6">
          {/* QR Code Scanner */}
          <Card className={`bg-white/95 backdrop-blur border-0 shadow-2xl ${activeTab !== 'scanner' ? 'hidden lg:block' : ''}`}>
            <CardContent className="p-3 sm:pt-6 sm:px-6 sm:pb-6">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h2 className="text-lg sm:text-2xl font-bold text-[#004645] flex items-center gap-2">
                  <QrCode className="h-5 w-5 sm:h-6 sm:w-6" />
                  <span className="hidden sm:inline">Scanner</span> QR Code
                </h2>
                <Button
                  size="default"
                  onClick={scannerActive ? stopScanner : startScanner}
                  className={`h-10 sm:h-11 ${scannerActive
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-gradient-to-r from-[#004645] to-[#009197]"
                  }`}
                >
                  {scannerActive ? (
                    <>
                      <CameraOff className="h-4 w-4 sm:h-5 sm:w-5 sm:mr-2" />
                      <span className="hidden sm:inline">Arrêter</span>
                    </>
                  ) : (
                    <>
                      <Camera className="h-4 w-4 sm:h-5 sm:w-5 sm:mr-2" />
                      <span className="hidden sm:inline">Démarrer</span>
                    </>
                  )}
                </Button>
              </div>

              <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '4/3' }}>
                {/* Video element - using absolute positioning so it's always in DOM but layered */}
                <video
                  ref={videoRef}
                  className={`absolute inset-0 w-full h-full object-cover ${scannerActive ? 'z-10' : 'z-0 opacity-0'}`}
                  playsInline
                  muted
                  autoPlay
                />
                <canvas ref={canvasRef} className="hidden" />
                {scannerActive ? (
                  <>
                    <div className="absolute inset-0 border-4 border-green-500 animate-pulse pointer-events-none z-20" />
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 sm:w-64 sm:h-64 border-4 border-white/50 pointer-events-none z-20" />
                  </>
                ) : (
                  <div className="relative flex items-center justify-center h-full min-h-[200px] sm:min-h-[300px] z-10">
                    <div className="text-center text-white/70 px-4">
                      <Camera className="h-16 w-16 sm:h-24 sm:w-24 mx-auto mb-3 sm:mb-4 opacity-50" />
                      <p className="text-sm sm:text-lg">Appuyez sur le bouton pour activer la caméra</p>
                    </div>
                  </div>
                )}
              </div>

              <p className="text-xs sm:text-sm text-gray-600 mt-3 sm:mt-4 text-center">
                Pointez la caméra vers le QR code
              </p>
            </CardContent>
          </Card>

          {/* Manual Search */}
          <Card className={`bg-white/95 backdrop-blur border-0 shadow-2xl ${activeTab !== 'search' ? 'hidden lg:block' : ''}`}>
            <CardContent className="p-3 sm:pt-6 sm:px-6 sm:pb-6">
              <h2 className="text-lg sm:text-2xl font-bold text-[#004645] flex items-center gap-2 mb-3 sm:mb-4">
                <Search className="h-5 w-5 sm:h-6 sm:w-6" />
                Recherche Manuelle
              </h2>

              <div className="relative mb-3 sm:mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Nom, prénom, email..."
                  className="pl-9 sm:pl-10 pr-9 sm:pr-10 h-11 sm:h-14 text-base sm:text-lg border-[#9CD9F6]/50 focus:border-[#009197]"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>
                )}
              </div>

              <div className="space-y-2 max-h-[350px] sm:max-h-[500px] overflow-y-auto">
                {search && filteredGuests.length === 0 && (
                  <p className="text-center text-gray-500 py-6 sm:py-8 text-sm sm:text-base">Aucun invité trouvé</p>
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
                      <CardContent className="py-3 sm:py-4 px-3 sm:px-6">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-base sm:text-lg text-[#004645] truncate">
                              {guest.firstName} {guest.lastName}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-600 truncate">
                              {guest.company || guest.email}
                            </p>
                            {guest.tags && guest.tags.length > 0 && (
                              <div className="flex gap-1 mt-1 overflow-hidden">
                                {guest.tags.slice(0, 2).map((tag) => (
                                  <Badge key={tag} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                          {checkedIn ? (
                            <Badge className="bg-green-500 text-white px-2 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-lg flex-shrink-0">
                              <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 sm:mr-2" />
                              <span className="hidden sm:inline">Présent</span>
                            </Badge>
                          ) : (
                            <Button size="sm" className="bg-gradient-to-r from-[#004645] to-[#009197] h-9 sm:h-11 px-3 sm:px-4 flex-shrink-0">
                              <UserCheck className="h-4 w-4 sm:h-5 sm:w-5 sm:mr-2" />
                              <span className="hidden sm:inline">Enregistrer</span>
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              {!search && (
                <p className="text-center text-gray-500 py-8 sm:py-12 text-sm sm:text-base">
                  Commencez à taper pour rechercher un invité
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
