"use client"

import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams } from 'next/navigation'
import { CheckCircle2, Camera, Users, Sparkles, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import jsQR from 'jsqr'

interface Guest {
  id: string
  firstName: string
  lastName: string
  email: string
  company?: string
}

interface CheckinResult {
  success: boolean
  guest: Guest
  plusOnes?: number
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

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number | undefined>(undefined)

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
          plusOnes: verifyData.rsvp?.plusOnes || 0
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

                  {/* Plus Ones - Prominent display */}
                  {checkinResult.plusOnes !== undefined && checkinResult.plusOnes > 0 && (
                    <div className="mt-6 p-5 bg-gradient-to-r from-[#009197]/10 to-[#004645]/10 rounded-2xl">
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-[#009197] flex items-center justify-center">
                          <Users className="h-6 w-6 text-white" />
                        </div>
                        <div className="text-left">
                          <p className="text-3xl font-bold text-[#004645]">
                            +{checkinResult.plusOnes}
                          </p>
                          <p className="text-sm text-[#004645]/60">
                            accompagnant{checkinResult.plusOnes > 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

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

            {/* Bottom instruction bar */}
            <div className="flex-shrink-0 bg-[#004645] py-5 px-4 text-center">
              <p className="text-white text-lg font-semibold">
                Présentez votre QR code
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Safe area padding for iPhone home indicator */}
      <div className="flex-shrink-0 h-[env(safe-area-inset-bottom)] bg-[#004645]" />

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
