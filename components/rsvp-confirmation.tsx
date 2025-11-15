"use client"

import { useEffect } from 'react'
import confetti from 'canvas-confetti'
import { CheckCircle, Download, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import QRCode from 'qrcode'
import { useState } from 'react'
import { createClientLogger } from '@/lib/client-logger'
import Image from 'next/image'

const logger = createClientLogger({ component: 'RSVPConfirmation' })

interface ConfirmationProps {
  attending: boolean
  guestName: string
  eventName: string
  qrCodeData?: string
}

export function RSVPConfirmation({ attending, guestName, eventName, qrCodeData }: ConfirmationProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)

  useEffect(() => {
    if (attending) {
      // Confetti animation
      const duration = 3000
      const animationEnd = Date.now() + duration
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min
      }

      const interval: ReturnType<typeof setInterval> = setInterval(function() {
        const timeLeft = animationEnd - Date.now()

        if (timeLeft <= 0) {
          return clearInterval(interval)
        }

        const particleCount = 50 * (timeLeft / duration)

        // since particles fall down, start a bit higher than random
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        })
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        })
      }, 250)

      return () => clearInterval(interval)
    }
  }, [attending])

  useEffect(() => {
    if (qrCodeData) {
      QRCode.toDataURL(qrCodeData, {
        width: 300,
        margin: 2,
        color: {
          dark: '#004645',
          light: '#FFFFFF'
        }
      })
        .then(url => setQrCodeUrl(url))
        .catch(err => logger.error(err, { action: 'generateQRCode' }))
    }
  }, [qrCodeData])

  const downloadQRCode = () => {
    if (qrCodeUrl) {
      const link = document.createElement('a')
      link.href = qrCodeUrl
      link.download = `qr-code-${eventName}.png`
      link.click()
    }
  }

  if (attending) {
    return (
      <Card className="border-2 border-[#009197] bg-gradient-to-br from-white/95 to-[#9CD9F6]/10 backdrop-blur-xl shadow-2xl overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#004645] via-[#009197] to-[#9CD9F6]" />
        <CardContent className="pt-12 pb-8 text-center">
          <div className="mb-6 relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 bg-[#009197]/20 rounded-full animate-ping" />
            </div>
            <CheckCircle className="h-24 w-24 text-[#009197] mx-auto relative animate-bounce-slow" />
          </div>

          <h2 className="text-3xl font-bold text-[#004645] mb-3" style={{ fontFamily: "var(--font-abril)" }}>
            Confirmation enregistrée !
          </h2>
          <p className="text-lg text-[#004645]/70 mb-8">
            Merci {guestName}, votre participation à <strong>{eventName}</strong> est confirmée.
          </p>

          {qrCodeUrl && (
            <div className="mb-8 p-6 bg-white rounded-xl shadow-inner">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Calendar className="h-5 w-5 text-[#004645]" />
                <p className="text-sm font-semibold text-[#004645]">Votre QR Code d&apos;accès</p>
              </div>
              <Image
                src={qrCodeUrl}
                alt="QR Code"
                width={250}
                height={250}
                className="mx-auto rounded-lg shadow-md mb-4"
              />
              <p className="text-xs text-[#004645]/60 mb-4">
                Présentez ce QR code à l&apos;entrée de l&apos;événement
              </p>
              <Button
                onClick={downloadQRCode}
                variant="outline"
                size="sm"
                className="border-[#009197] text-[#009197] hover:bg-[#009197] hover:text-white"
              >
                <Download className="h-4 w-4 mr-2" />
                Télécharger le QR Code
              </Button>
            </div>
          )}

          <div className="p-4 bg-[#9CD9F6]/20 rounded-lg border border-[#9CD9F6]">
            <p className="text-sm text-[#004645]">
              📧 Un email de confirmation avec tous les détails vous a été envoyé.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-2 border-[#FF4713]/30 bg-white/95 backdrop-blur-xl shadow-xl">
      <div className="absolute top-0 left-0 right-0 h-1 bg-[#FF4713]" />
      <CardContent className="pt-12 pb-8 text-center">
        <div className="mb-6">
          <div className="w-24 h-24 bg-[#FF4713]/10 rounded-full flex items-center justify-center mx-auto">
            <Calendar className="h-12 w-12 text-[#FF4713]" />
          </div>
        </div>

        <h2 className="text-3xl font-bold text-[#004645] mb-3" style={{ fontFamily: "var(--font-abril)" }}>
          Réponse enregistrée
        </h2>
        <p className="text-lg text-[#004645]/70 mb-6">
          Merci {guestName} d&apos;avoir pris le temps de répondre.
        </p>

        <div className="p-4 bg-[#FF4713]/10 rounded-lg border border-[#FF4713]/30">
          <p className="text-sm text-[#004645]">
            Nous espérons vous voir lors d&apos;un prochain événement !
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
