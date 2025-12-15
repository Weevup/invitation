"use client"

import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams } from 'next/navigation'
import { CheckCircle2, Camera, Users, Sparkles, AlertCircle, Search, X, UserPlus, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'
import jsQR from 'jsqr'

interface Guest {
  id: string
  firstName: string
  lastName: string
  email: string
  company?: string
  adminPlusOnes?: number
  checkins?: { id: string }[]
  rsvp?: {
    id: string
    qrCodeId: string
    plusOnes?: number
  }
}

interface CheckinResult {
  success: boolean
  guest: Guest
  plusOnes?: number
  adminPlusOnes?: number
  alreadyCheckedIn?: boolean
}

export default function SelfServiceKioskPage() {
  const params = useParams()
  const eventId = params.id as string

  const [eventName, setEventName] = useState('')
  const [scannerActive, setScannerActive] = useState(false)
  const [checkinResult, setCheckinResult] = useState<CheckinResult | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)

  // Search state
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [guests, setGuests] = useState<Guest[]>([])
  const [filteredGuests, setFilteredGuests] = useState<Guest[]>([])
  const [isLoadingGuests, setIsLoadingGuests] = useState(false)

  // Add guest state
  const [showAddGuest, setShowAddGuest] = useState(false)
  const [newGuest, setNewGuest] = useState({ firstName: '', lastName: '', email: '', company: '' })
  const [isAddingGuest, setIsAddingGuest] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number | undefined>(undefined)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Fetch event info
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`/api/admin/events/${eventId}`)
        if (response.ok) {
          const data = await response.json()
          setEventName(data.name)
        }
      } catch (error) {
        console.error('Error fetching event:', error)
      }
    }
    fetchEvent()
  }, [eventId])

  // Fetch guests for search (all guests, not just confirmed)
  const fetchGuests = useCallback(async () => {
    if (guests.length > 0) return // Already loaded

    setIsLoadingGuests(true)
    try {
      // Use full guests endpoint to include guests without RSVP
      const response = await fetch(`/api/admin/events/${eventId}?includeGuests=true`)
      if (response.ok) {
        const data = await response.json()
        setGuests(data.guests || [])
      }
    } catch (error) {
      console.error('Error fetching guests:', error)
    } finally {
      setIsLoadingGuests(false)
    }
  }, [eventId, guests.length])

  // Filter guests based on search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredGuests([])
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = guests.filter(guest => {
      const firstName = (guest.firstName || '').toLowerCase()
      const lastName = (guest.lastName || '').toLowerCase()
      const email = (guest.email || '').toLowerCase()
      const company = (guest.company || '').toLowerCase()
      const fullName = `${firstName} ${lastName}`

      return fullName.includes(query) ||
             firstName.includes(query) ||
             lastName.includes(query) ||
             email.includes(query) ||
             company.includes(query)
    }).slice(0, 10) // Limit to 10 results for performance

    setFilteredGuests(filtered)
  }, [searchQuery, guests])

  // Auto-start scanner on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      startScanner()
    }, 300)
    return () => clearTimeout(timer)
  }, [])

  const initializeCamera = useCallback(async () => {
    try {
      setCameraError(null)

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError("Caméra non supportée sur cet appareil")
        setScannerActive(false)
        return
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await new Promise<void>((resolve, reject) => {
          if (!videoRef.current) {
            reject(new Error('Video ref not available'))
            return
          }
          videoRef.current.onloadedmetadata = () => resolve()
          videoRef.current.onerror = () => reject(new Error('Video loading error'))
        })
        await videoRef.current.play()
        scanQRCode()
      }
    } catch (error) {
      console.error('Camera error:', error)
      setScannerActive(false)
      if (error instanceof DOMException) {
        if (error.name === 'NotAllowedError') {
          setCameraError("Autorisez l'accès à la caméra dans les réglages")
        } else if (error.name === 'NotFoundError') {
          setCameraError("Aucune caméra trouvée")
        } else {
          setCameraError("Erreur caméra")
        }
      } else {
        setCameraError("Impossible d'accéder à la caméra")
      }
    }
  }, [])

  useEffect(() => {
    if (scannerActive && videoRef.current && !videoRef.current.srcObject) {
      initializeCamera()
    }
  }, [scannerActive, initializeCamera])

  const startScanner = () => {
    setCheckinResult(null)
    setCameraError(null)
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
    if (!videoRef.current || !canvasRef.current || isProcessing) return

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

  const vibrate = () => {
    if (navigator.vibrate) {
      navigator.vibrate(200)
    }
  }

  const handleQRCodeDetected = async (data: string) => {
    const match = data.match(/\/api\/checkin\/([^\/]+)/)
    if (!match) {
      toast.error('QR code invalide')
      animationFrameRef.current = requestAnimationFrame(scanQRCode)
      return
    }

    vibrate()
    const qrCodeId = match[1]
    setIsProcessing(true)
    stopScanner()

    try {
      const response = await fetch(`/api/checkin/${qrCodeId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ desk: 'Self-Service' }),
      })

      const result = await response.json()

      if (response.ok) {
        const verifyResponse = await fetch(`/api/checkin/${qrCodeId}`)
        const verifyData = await verifyResponse.json()

        setCheckinResult({
          success: true,
          guest: result.guest,
          plusOnes: verifyData.rsvp?.plusOnes || 0,
          adminPlusOnes: verifyData.guest?.adminPlusOnes || 0
        })
      } else if (result.alreadyCheckedIn) {
        setCheckinResult({
          success: true,
          guest: result.guest,
          alreadyCheckedIn: true
        })
      } else {
        toast.error(result.error || 'Erreur')
        setTimeout(startScanner, 2000)
      }
    } catch (error) {
      console.error('Checkin error:', error)
      toast.error('Erreur de connexion')
      setTimeout(startScanner, 2000)
    } finally {
      setIsProcessing(false)
    }
  }

  // Manual check-in from search
  const handleManualCheckin = async (guest: Guest) => {
    vibrate()
    setIsProcessing(true)
    setShowSearch(false)
    stopScanner()

    try {
      let response
      let result

      // If guest has QR code, use the standard checkin endpoint
      if (guest.rsvp?.qrCodeId) {
        response = await fetch(`/api/checkin/${guest.rsvp.qrCodeId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ desk: 'Self-Service (Manual)' }),
        })
        result = await response.json()
      } else {
        // No QR code - use manual checkin endpoint (creates RSVP if needed)
        response = await fetch(`/api/admin/events/${eventId}/checkin/manual`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            guestId: guest.id,
            desk: 'Self-Service (Manual - No QR)'
          }),
        })
        result = await response.json()
      }

      if (response.ok) {
        setCheckinResult({
          success: true,
          guest: result.guest,
          plusOnes: guest.rsvp?.plusOnes || 0,
          adminPlusOnes: guest.adminPlusOnes || 0
        })
        // Refresh guest list to get updated data
        setGuests([])
      } else if (result.alreadyCheckedIn) {
        setCheckinResult({
          success: true,
          guest: result.guest,
          alreadyCheckedIn: true
        })
      } else {
        toast.error(result.error || 'Erreur')
        setTimeout(startScanner, 2000)
      }
    } catch (error) {
      console.error('Checkin error:', error)
      toast.error('Erreur de connexion')
      setTimeout(startScanner, 2000)
    } finally {
      setIsProcessing(false)
      setSearchQuery('')
    }
  }

  // Add new guest and check-in
  const handleAddGuest = async () => {
    if (!newGuest.firstName.trim() || !newGuest.lastName.trim()) {
      toast.error('Prénom et nom requis')
      return
    }

    setIsAddingGuest(true)
    vibrate()

    try {
      // First, create the guest
      const createResponse = await fetch(`/api/admin/events/${eventId}/guests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: newGuest.firstName.trim(),
          lastName: newGuest.lastName.trim(),
          email: newGuest.email.trim() || `walkin-${Date.now()}@event.local`,
          company: newGuest.company.trim() || undefined,
          status: 'CONFIRMED'
        }),
      })

      if (!createResponse.ok) {
        const error = await createResponse.json()
        throw new Error(error.error || 'Erreur création')
      }

      const createdGuest = await createResponse.json()

      // Then check-in if guest has RSVP with QR code
      if (createdGuest.rsvp?.qrCodeId) {
        const checkinResponse = await fetch(`/api/checkin/${createdGuest.rsvp.qrCodeId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ desk: 'Self-Service (Walk-in)' }),
        })

        if (checkinResponse.ok) {
          setShowAddGuest(false)
          setShowSearch(false)
          stopScanner()

          setCheckinResult({
            success: true,
            guest: createdGuest,
            plusOnes: 0
          })

          // Refresh guest list
          setGuests([])
        }
      } else {
        toast.success(`${newGuest.firstName} ${newGuest.lastName} ajouté`)
        setShowAddGuest(false)
        setGuests([])
      }

      setNewGuest({ firstName: '', lastName: '', email: '', company: '' })
    } catch (error) {
      console.error('Add guest error:', error)
      toast.error('Erreur lors de l\'ajout')
    } finally {
      setIsAddingGuest(false)
    }
  }

  // Open search panel
  const openSearch = () => {
    fetchGuests()
    setShowSearch(true)
    setSearchQuery('')
    setTimeout(() => searchInputRef.current?.focus(), 100)
  }

  // Auto restart after showing result
  useEffect(() => {
    if (checkinResult) {
      const timer = setTimeout(() => {
        setCheckinResult(null)
        startScanner()
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [checkinResult])

  // Cleanup on unmount
  useEffect(() => {
    return () => stopScanner()
  }, [])

  return (
    <div className="fixed inset-0 bg-[#004645] flex flex-col overflow-hidden">
      {/* Safe area padding for iPhone notch */}
      <div className="flex-shrink-0 h-[env(safe-area-inset-top)]" />

      {/* Minimal Header */}
      <div className="flex-shrink-0 text-center py-3 px-4">
        <p className="text-white/90 text-sm font-medium truncate">{eventName || 'Check-in'}</p>
      </div>

      {/* Main Scanner Area - Takes all available space */}
      <div className="flex-1 flex flex-col min-h-0">
        {checkinResult ? (
          // Success Screen - Full screen takeover
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="w-full max-w-sm animate-in zoom-in-95 duration-200">
              <div className={`rounded-3xl shadow-2xl overflow-hidden ${
                checkinResult.alreadyCheckedIn ? 'bg-orange-500' : 'bg-green-500'
              }`}>
                {/* Success Icon */}
                <div className="pt-10 pb-6 text-center">
                  <div className="w-24 h-24 mx-auto bg-white/20 rounded-full flex items-center justify-center mb-4 animate-in zoom-in duration-300">
                    <CheckCircle2 className="h-14 w-14 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">
                    {checkinResult.alreadyCheckedIn ? 'Déjà enregistré' : 'Bienvenue !'}
                  </h2>
                </div>

                {/* Guest Info - White card */}
                <div className="bg-white p-6 text-center">
                  <p className="text-4xl font-bold text-[#004645]">
                    {checkinResult.guest.firstName}
                  </p>
                  <p className="text-2xl text-[#004645]/70 mt-1">
                    {checkinResult.guest.lastName}
                  </p>

                  {checkinResult.guest.company && (
                    <p className="text-base text-[#004645]/50 mt-2">
                      {checkinResult.guest.company}
                    </p>
                  )}

                  {/* Plus Ones - VERY Prominent display */}
                  {(() => {
                    const totalPlusOnes = (checkinResult.plusOnes || 0) + (checkinResult.adminPlusOnes || 0)
                    const totalPersons = 1 + totalPlusOnes
                    if (totalPlusOnes <= 0) return null
                    return (
                      <div className="mt-6">
                        {/* Big orange banner for +1 */}
                        <div className="p-5 bg-gradient-to-r from-[#FF4713] to-[#e53e00] rounded-2xl shadow-lg">
                          <div className="flex items-center justify-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center animate-pulse">
                              <Users className="h-9 w-9 text-white" />
                            </div>
                            <div className="text-left">
                              <p className="text-5xl font-black text-white">
                                +{totalPlusOnes}
                              </p>
                              <p className="text-base text-white/80 font-medium">
                                accompagnant{totalPlusOnes > 1 ? 's' : ''}
                              </p>
                            </div>
                          </div>
                        </div>
                        {/* Total persons count */}
                        <div className="mt-3 p-3 bg-[#004645]/10 rounded-xl">
                          <p className="text-center text-lg font-bold text-[#004645]">
                            👥 {totalPersons} personne{totalPersons > 1 ? 's' : ''} au total
                          </p>
                        </div>
                      </div>
                    )
                  })()}

                  {!checkinResult.alreadyCheckedIn && (
                    <div className="mt-6 flex items-center justify-center gap-2 text-green-600">
                      <Sparkles className="h-5 w-5" />
                      <span className="font-semibold text-lg">Bonne soirée !</span>
                    </div>
                  )}
                </div>

                {/* Progress bar */}
                <div className="h-1.5 bg-black/10">
                  <div
                    className="h-full bg-white/50 transition-all duration-100 ease-linear"
                    style={{
                      animation: 'shrink-width 4s linear forwards'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Scanner View
          <div className="flex-1 flex flex-col">
            {/* Video fills most of the screen */}
            <div className="flex-1 relative bg-black">
              <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-cover"
                playsInline
                muted
                autoPlay
              />
              <canvas ref={canvasRef} className="hidden" />

              {/* Scan overlay */}
              {scannerActive && !cameraError && (
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* Darkened corners */}
                  <div className="absolute inset-0 bg-black/40" style={{
                    maskImage: 'radial-gradient(circle at center, transparent 35%, black 35%)',
                    WebkitMaskImage: 'radial-gradient(circle at center, transparent 35%, black 35%)'
                  }} />

                  {/* Scan frame */}
                  <div className="w-64 h-64 relative">
                    {/* Animated border */}
                    <div className="absolute inset-0 border-4 border-white/30 rounded-3xl" />

                    {/* Corners */}
                    <div className="absolute -top-1 -left-1 w-12 h-12 border-t-4 border-l-4 border-[#FF4713] rounded-tl-2xl" />
                    <div className="absolute -top-1 -right-1 w-12 h-12 border-t-4 border-r-4 border-[#FF4713] rounded-tr-2xl" />
                    <div className="absolute -bottom-1 -left-1 w-12 h-12 border-b-4 border-l-4 border-[#FF4713] rounded-bl-2xl" />
                    <div className="absolute -bottom-1 -right-1 w-12 h-12 border-b-4 border-r-4 border-[#FF4713] rounded-br-2xl" />

                    {/* Scanning line */}
                    <div className="absolute inset-x-4 top-1/2 h-0.5 bg-[#FF4713] shadow-lg shadow-[#FF4713]/50 animate-scan-line" />
                  </div>
                </div>
              )}

              {/* Camera error state */}
              {cameraError && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#004645]">
                  <div className="text-center p-6">
                    <AlertCircle className="h-16 w-16 text-[#FF4713] mx-auto mb-4" />
                    <p className="text-white text-lg font-medium mb-4">{cameraError}</p>
                    <button
                      onClick={startScanner}
                      className="px-6 py-3 bg-[#FF4713] text-white rounded-full font-semibold"
                    >
                      Réessayer
                    </button>
                  </div>
                </div>
              )}

              {/* Loading state */}
              {!scannerActive && !cameraError && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#004645]">
                  <div className="text-center">
                    <Camera className="h-16 w-16 text-white/50 mx-auto mb-4 animate-pulse" />
                    <p className="text-white/70">Activation de la caméra...</p>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom bar with search button */}
            <div className="flex-shrink-0 bg-[#004645] py-4 px-4">
              <p className="text-white text-lg font-semibold text-center mb-3">
                Présentez votre QR code
              </p>
              <button
                onClick={openSearch}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors"
              >
                <Search className="h-5 w-5" />
                <span>Pas de QR code ? Rechercher</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Safe area padding for iPhone home indicator */}
      <div className="flex-shrink-0 h-[env(safe-area-inset-bottom)] bg-[#004645]" />

      {/* Search Modal */}
      {showSearch && (
        <div className="fixed inset-0 z-50 flex flex-col bg-[#004645]">
          <div className="flex-shrink-0 h-[env(safe-area-inset-top)]" />

          {/* Search Header */}
          <div className="flex-shrink-0 p-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setShowSearch(false)
                  setSearchQuery('')
                  startScanner()
                }}
                className="p-2 -ml-2 text-white/70 hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Nom, prénom, email..."
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#FF4713]"
                  autoFocus
                />
              </div>
            </div>
          </div>

          {/* Search Results */}
          <div className="flex-1 overflow-y-auto">
            {isLoadingGuests ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin h-8 w-8 border-2 border-white/30 border-t-white rounded-full" />
              </div>
            ) : searchQuery.trim() === '' ? (
              <div className="text-center py-12 px-4">
                <Search className="h-12 w-12 text-white/30 mx-auto mb-3" />
                <p className="text-white/50">Tapez pour rechercher un invité</p>
              </div>
            ) : filteredGuests.length === 0 ? (
              <div className="text-center py-12 px-4">
                <p className="text-white/50 mb-6">Aucun résultat pour &ldquo;{searchQuery}&rdquo;</p>
                <button
                  onClick={() => setShowAddGuest(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#FF4713] text-white rounded-xl font-semibold"
                >
                  <UserPlus className="h-5 w-5" />
                  Ajouter cette personne
                </button>
              </div>
            ) : (
              <div className="p-4 space-y-2">
                {filteredGuests.map((guest) => {
                  const isCheckedIn = guest.checkins && guest.checkins.length > 0
                  const totalPlusOnes = (guest.rsvp?.plusOnes || 0) + (guest.adminPlusOnes || 0)
                  const totalPersons = 1 + totalPlusOnes
                  return (
                    <button
                      key={guest.id}
                      onClick={() => handleManualCheckin(guest)}
                      disabled={isProcessing}
                      className={`w-full p-4 rounded-xl text-left transition-colors ${
                        isCheckedIn
                          ? 'bg-orange-500/20 border border-orange-500/30'
                          : 'bg-white/10 hover:bg-white/20 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-white font-semibold text-lg truncate">
                              {guest.firstName} {guest.lastName}
                            </p>
                            {/* Plus Ones Badge - Prominent display */}
                            {totalPlusOnes > 0 && (
                              <span className="flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-1 bg-[#FF4713] text-white text-sm font-bold rounded-full">
                                <Users className="h-3.5 w-3.5" />
                                +{totalPlusOnes}
                              </span>
                            )}
                          </div>
                          {guest.company && (
                            <p className="text-white/50 text-sm truncate">{guest.company}</p>
                          )}
                          {/* Total persons indicator */}
                          {totalPlusOnes > 0 && (
                            <p className="text-[#FF4713]/80 text-xs mt-1 font-medium">
                              {totalPersons} personne{totalPersons > 1 ? 's' : ''} au total
                            </p>
                          )}
                        </div>
                        <div className="flex-shrink-0 flex items-center gap-2">
                          {isCheckedIn ? (
                            <span className="px-3 py-1 bg-orange-500/30 text-orange-200 text-xs rounded-full">
                              Déjà arrivé
                            </span>
                          ) : (
                            <ChevronDown className="h-5 w-5 text-white/30 rotate-[-90deg]" />
                          )}
                        </div>
                      </div>
                    </button>
                  )
                })}

                {/* Add new guest button at bottom of results */}
                <button
                  onClick={() => setShowAddGuest(true)}
                  className="w-full p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-dashed border-white/20 text-white/70 hover:text-white transition-colors flex items-center justify-center gap-2"
                >
                  <UserPlus className="h-5 w-5" />
                  <span>Ajouter un nouvel invité</span>
                </button>
              </div>
            )}
          </div>

          <div className="flex-shrink-0 h-[env(safe-area-inset-bottom)]" />
        </div>
      )}

      {/* Add Guest Modal */}
      {showAddGuest && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-bold text-gray-900">Nouvel invité</h3>
              <button
                onClick={() => {
                  setShowAddGuest(false)
                  setNewGuest({ firstName: '', lastName: '', email: '', company: '' })
                }}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prénom *
                  </label>
                  <input
                    type="text"
                    value={newGuest.firstName}
                    onChange={(e) => setNewGuest({ ...newGuest, firstName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004645]"
                    placeholder="Jean"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom *
                  </label>
                  <input
                    type="text"
                    value={newGuest.lastName}
                    onChange={(e) => setNewGuest({ ...newGuest, lastName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004645]"
                    placeholder="Dupont"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={newGuest.email}
                  onChange={(e) => setNewGuest({ ...newGuest, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004645]"
                  placeholder="jean.dupont@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Société
                </label>
                <input
                  type="text"
                  value={newGuest.company}
                  onChange={(e) => setNewGuest({ ...newGuest, company: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004645]"
                  placeholder="Entreprise"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 bg-gray-50 flex gap-3">
              <button
                onClick={() => {
                  setShowAddGuest(false)
                  setNewGuest({ firstName: '', lastName: '', email: '', company: '' })
                }}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-100"
              >
                Annuler
              </button>
              <button
                onClick={handleAddGuest}
                disabled={isAddingGuest || !newGuest.firstName.trim() || !newGuest.lastName.trim()}
                className="flex-1 px-4 py-3 bg-[#004645] text-white rounded-xl font-medium hover:bg-[#003635] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isAddingGuest ? (
                  <div className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full" />
                ) : (
                  <>
                    <UserPlus className="h-5 w-5" />
                    Ajouter & Check-in
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes shrink-width {
          from { width: 100%; }
          to { width: 0%; }
        }
        @keyframes scan-line {
          0%, 100% {
            transform: translateY(-60px);
            opacity: 0.5;
          }
          50% {
            transform: translateY(60px);
            opacity: 1;
          }
        }
        .animate-scan-line {
          animation: scan-line 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
