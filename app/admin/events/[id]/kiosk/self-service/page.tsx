"use client"

import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams } from 'next/navigation'
import { CheckCircle2, Camera, CameraOff, Users, Sparkles } from 'lucide-react'
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
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  const initializeCamera = useCallback(async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast.error("Caméra non supportée")
        setScannerActive(false)
        return
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
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
      toast.error("Impossible d'accéder à la caméra")
    }
  }, [])

  useEffect(() => {
    if (scannerActive && videoRef.current && !videoRef.current.srcObject) {
      initializeCamera()
    }
  }, [scannerActive, initializeCamera])

  const startScanner = () => {
    setCheckinResult(null)
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

  const handleQRCodeDetected = async (data: string) => {
    const match = data.match(/\/api\/checkin\/([^\/]+)/)
    if (!match) {
      toast.error('QR code invalide')
      animationFrameRef.current = requestAnimationFrame(scanQRCode)
      return
    }

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
        // Get plus ones info
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
        toast.error(result.error || 'Erreur lors du check-in')
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
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [checkinResult])

  // Cleanup on unmount
  useEffect(() => {
    return () => stopScanner()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#004645] via-[#009197] to-[#004645] flex flex-col">
      {/* Header */}
      <div className="text-center pt-6 pb-4 px-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">Check-in</h1>
        <p className="text-white/80 text-sm sm:text-base">{eventName}</p>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8">
        {checkinResult ? (
          // Success Screen
          <div className="w-full max-w-sm animate-in zoom-in-95 duration-300">
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
              {/* Success Header */}
              <div className={`py-8 px-6 text-center ${checkinResult.alreadyCheckedIn ? 'bg-orange-500' : 'bg-green-500'}`}>
                <div className="w-20 h-20 mx-auto bg-white/20 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-12 w-12 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">
                  {checkinResult.alreadyCheckedIn ? 'Déjà enregistré' : 'Bienvenue !'}
                </h2>
              </div>

              {/* Guest Info */}
              <div className="p-6 text-center">
                <p className="text-3xl font-bold text-[#004645] mb-2">
                  {checkinResult.guest.firstName}
                </p>
                <p className="text-xl text-[#004645]/70 mb-4">
                  {checkinResult.guest.lastName}
                </p>

                {checkinResult.guest.company && (
                  <p className="text-sm text-[#004645]/60 mb-4">
                    {checkinResult.guest.company}
                  </p>
                )}

                {/* Plus Ones */}
                {checkinResult.plusOnes && checkinResult.plusOnes > 0 && (
                  <div className="mt-4 p-4 bg-[#9CD9F6]/20 rounded-2xl">
                    <div className="flex items-center justify-center gap-2">
                      <Users className="h-6 w-6 text-[#009197]" />
                      <span className="text-lg font-semibold text-[#004645]">
                        +{checkinResult.plusOnes} accompagnant{checkinResult.plusOnes > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                )}

                {!checkinResult.alreadyCheckedIn && (
                  <div className="mt-6 flex items-center justify-center gap-2 text-green-600">
                    <Sparkles className="h-5 w-5" />
                    <span className="font-medium">Bonne soirée !</span>
                  </div>
                )}
              </div>

              {/* Progress bar for auto-dismiss */}
              <div className="h-1 bg-gray-200">
                <div className="h-full bg-[#009197] animate-shrink-width" style={{ animationDuration: '5s' }} />
              </div>
            </div>
          </div>
        ) : (
          // Scanner Screen
          <div className="w-full max-w-sm">
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-4 shadow-2xl">
              {/* Scanner Area */}
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-black">
                <video
                  ref={videoRef}
                  className={`absolute inset-0 w-full h-full object-cover ${scannerActive ? 'opacity-100' : 'opacity-0'}`}
                  playsInline
                  muted
                  autoPlay
                />
                <canvas ref={canvasRef} className="hidden" />

                {scannerActive ? (
                  <>
                    {/* Scanning overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-48 h-48 sm:w-56 sm:h-56 border-4 border-white/80 rounded-2xl relative">
                        <div className="absolute inset-0 border-4 border-[#FF4713] rounded-2xl animate-pulse" />
                        {/* Corner accents */}
                        <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-[#FF4713] rounded-tl-lg" />
                        <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-[#FF4713] rounded-tr-lg" />
                        <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-[#FF4713] rounded-bl-lg" />
                        <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-[#FF4713] rounded-br-lg" />
                      </div>
                    </div>
                    {/* Scanning line animation */}
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-0.5 bg-gradient-to-r from-transparent via-[#FF4713] to-transparent animate-scan" />
                  </>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white/70">
                      <Camera className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p>Chargement de la caméra...</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Instructions */}
              <div className="mt-4 text-center">
                <p className="text-white text-lg font-medium">
                  Scannez votre QR code
                </p>
                <p className="text-white/70 text-sm mt-1">
                  Placez le QR code dans le cadre
                </p>
              </div>

              {/* Manual toggle */}
              <button
                onClick={scannerActive ? stopScanner : startScanner}
                className="mt-4 w-full py-3 rounded-xl bg-white/20 hover:bg-white/30 transition-colors text-white font-medium flex items-center justify-center gap-2"
              >
                {scannerActive ? (
                  <>
                    <CameraOff className="h-5 w-5" />
                    Arrêter la caméra
                  </>
                ) : (
                  <>
                    <Camera className="h-5 w-5" />
                    Activer la caméra
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center pb-6 px-4">
        <p className="text-white/50 text-xs">
          Powered by Weevup
        </p>
      </div>

      {/* Custom animations */}
      <style jsx global>{`
        @keyframes shrink-width {
          from { width: 100%; }
          to { width: 0%; }
        }
        .animate-shrink-width {
          animation: shrink-width linear forwards;
        }
        @keyframes scan {
          0%, 100% { transform: translateY(-100px); opacity: 0; }
          50% { transform: translateY(100px); opacity: 1; }
        }
        .animate-scan {
          animation: scan 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
