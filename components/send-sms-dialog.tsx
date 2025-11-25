'use client'

import { useState, useEffect } from 'react'
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

interface SMSTemplate {
  id: string
  name: string
  description?: string
  message: string
  category?: string
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
  const [selectedTemplate, setSelectedTemplate] = useState<keyof typeof SMS_TEMPLATES | string>('custom')
  const [dbTemplates, setDbTemplates] = useState<SMSTemplate[]>([])
  const [loadingTemplates, setLoadingTemplates] = useState(false)
  const [sendResult, setSendResult] = useState<{
    success: boolean
    sent: number
    failed: number
    message: string
  } | null>(null)

  const messageLength = message.length
  const smsCount = Math.ceil(messageLength / 160)
  const remainingChars = messageLength > 0 ? 160 - (messageLength % 160) : 160

  // Fetch templates from database when dialog opens
  useEffect(() => {
    if (open && dbTemplates.length === 0) {
      fetchTemplates()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const fetchTemplates = async () => {
    setLoadingTemplates(true)
    try {
      const response = await fetch(`/api/admin/events/${eventId}/sms-templates`)
      if (response.ok) {
        const data = await response.json()
        setDbTemplates(data.templates || [])
      }
    } catch (error) {
      console.error('Error fetching SMS templates:', error)
      toast.error('Erreur lors du chargement des templates SMS')
    } finally {
      setLoadingTemplates(false)
    }
  }

  const handleSelectTemplate = (templateKey: keyof typeof SMS_TEMPLATES | string) => {
    setSelectedTemplate(templateKey)

    // Check if it's a hardcoded template
    if (templateKey in SMS_TEMPLATES) {
      setMessage(SMS_TEMPLATES[templateKey as keyof typeof SMS_TEMPLATES].message)
    } else {
      // It's a database template
      const dbTemplate = dbTemplates.find(t => t.id === templateKey)
      if (dbTemplate) {
        setMessage(dbTemplate.message)
      }
    }
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
      // Get template name for logging/tracking
      let templateName: string | undefined
      if (selectedTemplate !== 'custom') {
        if (selectedTemplate in SMS_TEMPLATES) {
          // Hardcoded template
          templateName = SMS_TEMPLATES[selectedTemplate as keyof typeof SMS_TEMPLATES].name
        } else {
          // Database template
          const dbTemplate = dbTemplates.find(t => t.id === selectedTemplate)
          templateName = dbTemplate?.name
        }
      }

      const response = await fetch(`/api/admin/events/${eventId}/notifications/send-sms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          guestIds,
          message,
          templateName,
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
            {loadingTemplates ? (
              <div className="flex items-center justify-center p-4 text-sm text-[#004645]/70">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Chargement des templates...
              </div>
            ) : (
              <div className="space-y-3">
                {/* Database templates */}
                {dbTemplates.length > 0 && (
                  <div>
                    <div className="text-xs font-medium text-[#004645]/70 mb-2">Vos templates personnalisés</div>
                    <div className="flex gap-2 flex-wrap">
                      {dbTemplates.map((template) => (
                        <Button
                          key={template.id}
                          variant={selectedTemplate === template.id ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleSelectTemplate(template.id)}
                          className={
                            selectedTemplate === template.id
                              ? 'bg-[#009197] hover:bg-[#004645]'
                              : 'border-[#9CD9F6]/50'
                          }
                        >
                          {template.name}
                          {template.description && (
                            <span className="ml-1 text-xs opacity-70">• {template.description}</span>
                          )}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Hardcoded templates */}
                <div>
                  <div className="text-xs font-medium text-[#004645]/70 mb-2">Templates par défaut</div>
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
              </div>
            )}
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
