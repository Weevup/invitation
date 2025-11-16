'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { MessageSquare, Send, Loader2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'

interface SendSMSDialogProps {
  eventId: string
  guestIds: string[] // Array of guest IDs to send SMS to
  guestsWithPhone: number // Count of guests with valid phone numbers
  totalGuests: number // Total count of selected guests
}

const SMS_TEMPLATES = {
  rsvp_confirmation: {
    name: 'Confirmation RSVP',
    message: 'Bonjour ! Votre présence à {event_name} est confirmée. Rendez-vous le {event_date}. À très bientôt !',
  },
  reminder: {
    name: 'Rappel événement',
    message: 'Rappel : {event_name} a lieu demain ! Consultez votre invitation pour tous les détails. À demain !',
  },
  info_update: {
    name: 'Information importante',
    message: 'Information importante concernant {event_name} : ',
  },
  custom: {
    name: 'Message personnalisé',
    message: '',
  },
}

export function SendSMSDialog({
  eventId,
  guestIds,
  guestsWithPhone,
  totalGuests,
}: SendSMSDialogProps) {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<keyof typeof SMS_TEMPLATES>('custom')
  const [sendResult, setSendResult] = useState<{
    success: boolean
    sent: number
    failed: number
    message: string
  } | null>(null)

  const messageLength = message.length
  const smsCount = Math.ceil(messageLength / 160)
  const remainingChars = messageLength > 0 ? 160 - (messageLength % 160) : 160

  const handleSelectTemplate = (templateKey: keyof typeof SMS_TEMPLATES) => {
    setSelectedTemplate(templateKey)
    setMessage(SMS_TEMPLATES[templateKey].message)
  }

  const handleSend = async () => {
    if (!message.trim()) {
      toast.error('Veuillez saisir un message')
      return
    }

    if (guestIds.length === 0) {
      toast.error('Aucun invité sélectionné')
      return
    }

    if (guestsWithPhone === 0) {
      toast.error('Aucun invité avec numéro de téléphone')
      return
    }

    setSending(true)
    setSendResult(null)

    try {
      const response = await fetch(`/api/admin/events/${eventId}/notifications/send-sms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          guestIds,
          message,
          templateName: selectedTemplate !== 'custom' ? SMS_TEMPLATES[selectedTemplate].name : undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Erreur lors de l\'envoi des SMS')
      }

      setSendResult({
        success: true,
        sent: data.sent,
        failed: data.failed,
        message: data.message,
      })

      toast.success(`${data.sent} SMS envoyés avec succès !`)

      // Reset form after 3 seconds
      setTimeout(() => {
        setMessage('')
        setSelectedTemplate('custom')
        setSendResult(null)
        setOpen(false)
      }, 3000)
    } catch (error) {
      console.error('Send SMS error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de l\'envoi des SMS'

      setSendResult({
        success: false,
        sent: 0,
        failed: guestsWithPhone,
        message: errorMessage,
      })

      toast.error(errorMessage)
    } finally {
      setSending(false)
    }
  }

  const guestsWithoutPhone = totalGuests - guestsWithPhone

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          disabled={guestIds.length === 0 || guestsWithPhone === 0}
          className="border-[#009197] text-[#009197] hover:bg-[#009197] hover:text-white"
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Envoyer SMS
          {guestsWithPhone > 0 && (
            <Badge variant="secondary" className="ml-2">
              {guestsWithPhone}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-[#004645]">Envoyer des SMS</DialogTitle>
          <DialogDescription>
            Envoyez un SMS aux invités sélectionnés ayant un numéro de téléphone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Recipients Info */}
          <Alert>
            <MessageSquare className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                <div>
                  <strong>{guestsWithPhone}</strong> invité{guestsWithPhone !== 1 ? 's' : ''} recevra
                  {guestsWithPhone !== 1 ? 'ont' : ''} ce SMS
                </div>
                {guestsWithoutPhone > 0 && (
                  <div className="text-amber-600">
                    <strong>{guestsWithoutPhone}</strong> invité{guestsWithoutPhone !== 1 ? 's' : ''} sans numéro de téléphone
                    {guestsWithoutPhone !== 1 ? 's' : ''} sera{guestsWithoutPhone !== 1 ? 'ont' : ''} ignoré
                    {guestsWithoutPhone !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>

          {/* Template Selection */}
          <div>
            <label className="text-sm font-medium text-[#004645] mb-2 block">
              Modèles de message
            </label>
            <div className="flex gap-2 flex-wrap">
              {Object.entries(SMS_TEMPLATES).map(([key, template]) => (
                <Button
                  key={key}
                  variant={selectedTemplate === key ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleSelectTemplate(key as keyof typeof SMS_TEMPLATES)}
                  className={
                    selectedTemplate === key
                      ? 'bg-[#009197] hover:bg-[#004645]'
                      : 'border-[#9CD9F6]/50'
                  }
                >
                  {template.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Message Input */}
          <div>
            <label className="text-sm font-medium text-[#004645] mb-2 block">
              Message SMS
            </label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Saisissez votre message..."
              rows={5}
              maxLength={1600}
              className="border-[#9CD9F6]/50 focus:border-[#009197] resize-none"
            />
            <div className="flex justify-between mt-2 text-xs text-[#004645]/70">
              <span>
                {messageLength} / 1600 caractères
              </span>
              <span>
                {smsCount} SMS{smsCount > 1 ? ' (concaténés)' : ''} • {remainingChars} caractères restants
              </span>
            </div>
          </div>

          {/* Info Alerts */}
          {messageLength > 160 && (
            <Alert className="border-amber-200 bg-amber-50">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                Votre message dépasse 160 caractères et sera envoyé en {smsCount} SMS concaténés.
              </AlertDescription>
            </Alert>
          )}

          {/* Send Result */}
          {sendResult && (
            <Alert className={sendResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
              {sendResult.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className={sendResult.success ? 'text-green-800' : 'text-red-800'}>
                <div className="space-y-1">
                  <div><strong>{sendResult.message}</strong></div>
                  {sendResult.failed > 0 && (
                    <div className="text-sm">
                      {sendResult.sent} réussi{sendResult.sent > 1 ? 's' : ''}, {sendResult.failed} échoué{sendResult.failed > 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={sending}
          >
            Annuler
          </Button>
          <Button
            onClick={handleSend}
            disabled={sending || !message.trim() || guestsWithPhone === 0}
            className="bg-[#009197] hover:bg-[#004645]"
          >
            {sending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Envoi en cours...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Envoyer {guestsWithPhone > 0 && `(${guestsWithPhone})`}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
