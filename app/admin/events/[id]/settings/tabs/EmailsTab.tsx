"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Bell, Sparkles, Repeat, CheckCheck, Clock,
  Send, Calendar, TestTube, Edit, BarChart3, Users, Loader2, List, Settings, QrCode
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

interface EmailsTabProps {
  event: any
  onUpdate: () => void
}

interface PhaseConfig {
  id: string
  phase: number
  title: string
  description: string
  icon: any
  color: string
  bgColor: string
  borderColor: string
  scheduledDate?: Date
  status: 'not_configured' | 'configured' | 'scheduled' | 'sent'
  recipients?: number
  templateName?: string
  templateId?: string // ID of the assigned template
  isAutomatic?: boolean
  enabled: boolean // Whether this phase is enabled/active
  isMandatory?: boolean // Whether this phase can be disabled (Phase 4 is mandatory)
}

export function EmailsTab({ event, onUpdate }: EmailsTabProps) {
  const [phases, setPhases] = useState<PhaseConfig[]>([])
  const [loading, setLoading] = useState(false)
  const [availableTemplates, setAvailableTemplates] = useState<any[]>([])
  const [showTestDialog, setShowTestDialog] = useState(false)
  const [testPhaseId, setTestPhaseId] = useState<string | null>(null)
  const [testEmailAddress, setTestEmailAddress] = useState('')
  const [sendingTest, setSendingTest] = useState(false)
  const [showSendDialog, setShowSendDialog] = useState(false)
  const [sendPhaseId, setSendPhaseId] = useState<string | null>(null)
  const [sendingCampaign, setSendingCampaign] = useState(false)
  const [guestCount, setGuestCount] = useState<number>(0)
  const [showScheduleDialog, setShowScheduleDialog] = useState(false)
  const [schedulePhaseId, setSchedulePhaseId] = useState<string | null>(null)
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined)
  const [schedulingCampaign, setSchedulingCampaign] = useState(false)
  const [globalStats, setGlobalStats] = useState({
    totalSent: 0,
    openRate: '0',
    clickRate: '0',
    responseRate: '0'
  })

  useEffect(() => {
    loadPhases()
    loadAvailableTemplates()
    loadGuestCount()
    loadGlobalStats()
  }, [event])

  // Auto-detect Phase 4 confirmation templates when templates are loaded
  useEffect(() => {
    if (availableTemplates.length > 0 && phases.length > 0) {
      detectConfirmationTemplates()
    }
  }, [availableTemplates])

  const loadAvailableTemplates = async () => {
    try {
      const response = await fetch(`/api/admin/templates?eventId=${event.id}`)
      if (response.ok) {
        const templates = await response.json()
        setAvailableTemplates(templates)
      }
    } catch (error) {
      console.error('Failed to load templates:', error)
    }
  }

  const detectConfirmationTemplates = () => {
    // Find confirmation templates by slug
    const acceptedTemplate = availableTemplates.find(t => t.slug === 'confirmation-accepted' && t.isActive)
    const declinedTemplate = availableTemplates.find(t => t.slug === 'confirmation-declined' && t.isActive)

    // Update Phase 4 status based on templates existence
    setPhases(prevPhases =>
      prevPhases.map(phase => {
        if (phase.id === 'confirmation') {
          const bothTemplatesExist = acceptedTemplate && declinedTemplate
          return {
            ...phase,
            status: bothTemplatesExist ? ('configured' as const) : ('not_configured' as const),
            templateName: bothTemplatesExist
              ? `2 templates configurés`
              : phase.templateName || 'Non configuré'
          }
        }
        return phase
      })
    )
  }

  const loadPhases = () => {
    // Define all available phases with default configuration
    const defaultPhasesData: PhaseConfig[] = [
      {
        id: 'save-the-date',
        phase: 1,
        title: 'Save the Date',
        description: 'Pré-invitation pour bloquer la date (J-90 à J-60)',
        icon: Bell,
        color: '#FF4713',
        bgColor: 'from-[#FF4713]/5 to-transparent',
        borderColor: 'border-[#FF4713]/30',
        status: 'not_configured',
        enabled: false, // Optional - disabled by default
        isMandatory: false
      },
      {
        id: 'invitation',
        phase: 2,
        title: 'Invitation Officielle',
        description: 'Envoi des invitations avec lien RSVP unique (J-60 à J-30)',
        icon: Sparkles,
        color: '#009197',
        bgColor: 'from-[#009197]/5 to-transparent',
        borderColor: 'border-[#009197]/30',
        status: 'not_configured',
        enabled: true, // Important phase - enabled by default
        isMandatory: false
      },
      {
        id: 'reminder',
        phase: 3,
        title: 'Relance RSVP',
        description: 'Rappels aux invités sans réponse (J-30 à J-14)',
        icon: Repeat,
        color: '#ff9800',
        bgColor: 'from-orange-50/50 to-transparent',
        borderColor: 'border-orange-500/30',
        status: 'not_configured',
        enabled: false, // Optional - disabled by default
        isMandatory: false
      },
      {
        id: 'confirmation',
        phase: 4,
        title: 'Confirmation Automatique',
        description: '⚠️ CRITIQUE : 2 templates requis (Accepté & Refusé) - Envoi automatique après chaque RSVP. Si badge/QR code activé, le lien de téléchargement est inclus.',
        icon: CheckCheck,
        color: '#4caf50',
        bgColor: 'from-green-50/50 to-transparent',
        borderColor: 'border-green-500/30',
        status: 'not_configured',
        isAutomatic: true,
        enabled: true, // MANDATORY - always enabled
        isMandatory: true,
        templateName: 'Non configuré'
      },
      {
        id: 'practical-info',
        phase: 5,
        title: 'Infos Pratiques & Badge',
        description: 'Envoi du badge avec QR code + infos pratiques complètes aux participants confirmés (J-7 à J-3). C\'est le moment idéal pour envoyer toutes les informations finalisées : programme, badge, accès, etc.',
        icon: Users,
        color: '#673ab7',
        bgColor: 'from-purple-50/50 to-transparent',
        borderColor: 'border-purple-500/30',
        status: 'not_configured',
        enabled: true, // Enabled by default - important phase for badges
        isMandatory: false
      },
      {
        id: 'day-before',
        phase: 6,
        title: 'Rappel Jour J',
        description: 'Rappel aux participants confirmés (J-1)',
        icon: Clock,
        color: '#004645',
        bgColor: 'from-[#004645]/5 to-transparent',
        borderColor: 'border-[#004645]/30',
        status: 'not_configured',
        enabled: false, // Optional - disabled by default
        isMandatory: false
      }
    ]

    // Load saved configuration from event if exists
    let phasesData = defaultPhasesData
    if (event.emailCampaignsConfig?.phases) {
      const savedPhases = event.emailCampaignsConfig.phases
      phasesData = defaultPhasesData.map(defaultPhase => {
        const savedPhase = savedPhases.find((p: any) => p.id === defaultPhase.id)
        if (savedPhase) {
          return {
            ...defaultPhase,
            enabled: savedPhase.enabled !== undefined ? savedPhase.enabled : defaultPhase.enabled,
            status: savedPhase.status || defaultPhase.status,
            templateName: savedPhase.templateName || defaultPhase.templateName,
            templateId: savedPhase.templateId || undefined, // Load saved templateId
            scheduledDate: savedPhase.scheduledDate ? new Date(savedPhase.scheduledDate) : undefined,
            recipients: savedPhase.recipients
          }
        }
        return defaultPhase
      })
    }

    setPhases(phasesData)
  }

  const togglePhaseEnabled = async (phaseId: string, enabled: boolean) => {
    // Update local state immediately
    setPhases(prevPhases =>
      prevPhases.map(phase =>
        phase.id === phaseId ? { ...phase, enabled } : phase
      )
    )

    // Save to database
    setLoading(true)
    try {
      const updatedPhases = phases.map(phase =>
        phase.id === phaseId ? { ...phase, enabled } : phase
      )

      const phasesConfig = updatedPhases.map(phase => ({
        id: phase.id,
        phase: phase.phase,
        enabled: phase.enabled,
        status: phase.status,
        templateName: phase.templateName,
        templateId: phase.templateId, // Preserve templateId
        scheduledDate: phase.scheduledDate?.toISOString(),
        recipients: phase.recipients
      }))

      const response = await fetch(`/api/admin/events/${event.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailCampaignsConfig: {
            phases: phasesConfig
          }
        })
      })

      if (!response.ok) throw new Error('Failed to save configuration')

      toast.success(enabled ? 'Phase activée' : 'Phase désactivée')
      onUpdate() // Reload event data
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde')
      // Revert local state on error
      setPhases(prevPhases =>
        prevPhases.map(phase =>
          phase.id === phaseId ? { ...phase, enabled: !enabled } : phase
        )
      )
    } finally {
      setLoading(false)
    }
  }

  const handleOpenTestDialog = (phaseId: string) => {
    setTestPhaseId(phaseId)
    setTestEmailAddress('')
    setShowTestDialog(true)
  }

  const handleSendTestEmail = async () => {
    if (!testEmailAddress || !testPhaseId) return

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(testEmailAddress)) {
      toast.error('Adresse email invalide')
      return
    }

    const phase = phases.find(p => p.id === testPhaseId)
    if (!phase) {
      toast.error('Phase non trouvée')
      return
    }

    setSendingTest(true)
    try {
      // Special handling for Phase 4 (Confirmation) - send both emails
      if (phase.id === 'confirmation' && phase.isAutomatic) {
        const acceptedTemplate = availableTemplates.find(t => t.slug === 'confirmation-accepted' && t.isActive)
        const declinedTemplate = availableTemplates.find(t => t.slug === 'confirmation-declined' && t.isActive)

        if (!acceptedTemplate || !declinedTemplate) {
          toast.error('Les 2 templates de confirmation doivent être configurés')
          return
        }

        // Send both test emails
        const [acceptedRes, declinedRes] = await Promise.all([
          fetch(`/api/admin/events/${event.id}/test-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              templateId: acceptedTemplate.id,
              testEmail: testEmailAddress
            })
          }),
          fetch(`/api/admin/events/${event.id}/test-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              templateId: declinedTemplate.id,
              testEmail: testEmailAddress
            })
          })
        ])

        if (!acceptedRes.ok || !declinedRes.ok) {
          throw new Error('Failed to send one or both test emails')
        }

        toast.success(`2 emails de test envoyés à ${testEmailAddress} (Accepté + Refusé)`)
        setShowTestDialog(false)
      } else {
        // Regular single template phases
        if (!phase.templateId) {
          toast.error('Aucun template assigné à cette phase')
          return
        }

        const response = await fetch(`/api/admin/events/${event.id}/test-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            templateId: phase.templateId,
            testEmail: testEmailAddress
          })
        })

        if (!response.ok) throw new Error('Failed to send test email')

        toast.success(`Email de test envoyé à ${testEmailAddress}`)
        setShowTestDialog(false)
      }
    } catch (error) {
      toast.error('Erreur lors de l\'envoi de l\'email de test')
    } finally {
      setSendingTest(false)
    }
  }

  const loadGuestCount = async () => {
    try {
      const response = await fetch(`/api/admin/events/${event.id}/guests`)
      if (response.ok) {
        const guests = await response.json()
        setGuestCount(guests.length)
      }
    } catch (error) {
      console.error('Failed to load guest count:', error)
    }
  }

  const loadGlobalStats = async () => {
    try {
      // Load email analytics
      const analyticsResponse = await fetch(`/api/admin/events/${event.id}/email-analytics`)
      if (!analyticsResponse.ok) return

      const analytics = await analyticsResponse.json()

      // Load RSVP count for response rate
      const rsvpResponse = await fetch(`/api/admin/events/${event.id}/rsvp`)
      let rsvpCount = 0
      if (rsvpResponse.ok) {
        const rsvps = await rsvpResponse.json()
        rsvpCount = rsvps.filter((r: any) => r.attending !== null).length
      }

      // Calculate response rate
      const responseRate = analytics.overview.totalSent > 0
        ? ((rsvpCount / analytics.overview.totalSent) * 100).toFixed(1)
        : '0'

      setGlobalStats({
        totalSent: analytics.overview.totalSent,
        openRate: analytics.overview.openRate,
        clickRate: analytics.overview.clickRate,
        responseRate
      })
    } catch (error) {
      console.error('Failed to load global stats:', error)
    }
  }

  const handleOpenSendDialog = (phaseId: string) => {
    setSendPhaseId(phaseId)
    setShowSendDialog(true)
  }

  const handleSendCampaign = async () => {
    if (!sendPhaseId) return

    const phase = phases.find(p => p.id === sendPhaseId)
    if (!phase || !phase.templateId) {
      toast.error('Aucun template assigné à cette phase')
      return
    }

    setSendingCampaign(true)
    try {
      // Map phase ID to email type
      const typeMap: Record<string, string> = {
        'save-the-date': 'save-the-date',
        'invitation': 'invitation',
        'reminder': 'reminder',
        'practical-info': 'practical-info',
        'day-before': 'day-before'
      }

      const emailType = typeMap[phase.id] || phase.id

      const response = await fetch(`/api/admin/events/${event.id}/send-emails`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: emailType,
          templateId: phase.templateId
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to send campaign')
      }

      const result = await response.json()

      // Update phase status to 'sent'
      setPhases(prevPhases =>
        prevPhases.map(p =>
          p.id === sendPhaseId
            ? { ...p, status: 'sent' as const }
            : p
        )
      )

      // Save updated status to database
      const updatedPhases = phases.map(p =>
        p.id === sendPhaseId
          ? { ...p, status: 'sent' as const }
          : p
      )

      await fetch(`/api/admin/events/${event.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailCampaigns: updatedPhases.map(phase => ({
            id: phase.id,
            phase: phase.phase,
            enabled: phase.enabled,
            status: phase.status,
            templateName: phase.templateName,
            templateId: phase.templateId,
            scheduledDate: phase.scheduledDate?.toISOString(),
            recipients: phase.recipients
          }))
        })
      })

      toast.success(`✅ Campagne envoyée avec succès à ${result.results.success}/${result.results.total} destinataires`)
      setShowSendDialog(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de l\'envoi de la campagne')
    } finally {
      setSendingCampaign(false)
    }
  }

  const handleOpenScheduleDialog = (phaseId: string) => {
    const phase = phases.find(p => p.id === phaseId)
    setSchedulePhaseId(phaseId)
    setScheduledDate(phase?.scheduledDate || undefined)
    setShowScheduleDialog(true)
  }

  const handleScheduleCampaign = async () => {
    if (!schedulePhaseId || !scheduledDate) return

    const phase = phases.find(p => p.id === schedulePhaseId)
    if (!phase || !phase.templateId) {
      toast.error('Aucun template assigné à cette phase')
      return
    }

    setSchedulingCampaign(true)
    try {
      // Map phase ID to email type
      const typeMap: Record<string, string> = {
        'save-the-date': 'save-the-date',
        'invitation': 'invitation',
        'reminder': 'reminder',
        'practical-info': 'practical-info',
        'day-before': 'day-before'
      }

      const emailType = typeMap[phase.id] || phase.id

      const response = await fetch(`/api/admin/events/${event.id}/send-emails`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: emailType,
          templateId: phase.templateId,
          scheduleFor: scheduledDate.toISOString()
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to schedule campaign')
      }

      const result = await response.json()

      // Update phase status to 'scheduled' and save the date
      setPhases(prevPhases =>
        prevPhases.map(p =>
          p.id === schedulePhaseId
            ? { ...p, status: 'scheduled' as const, scheduledDate }
            : p
        )
      )

      // Save updated status to database
      const updatedPhases = phases.map(p =>
        p.id === schedulePhaseId
          ? { ...p, status: 'scheduled' as const, scheduledDate }
          : p
      )

      await fetch(`/api/admin/events/${event.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailCampaigns: updatedPhases.map(phase => ({
            id: phase.id,
            phase: phase.phase,
            enabled: phase.enabled,
            status: phase.status,
            templateName: phase.templateName,
            templateId: phase.templateId,
            scheduledDate: phase.scheduledDate?.toISOString(),
            recipients: phase.recipients
          }))
        })
      })

      toast.success(`✅ Campagne planifiée pour le ${result.scheduledEmail.scheduledFor ? new Date(result.scheduledEmail.scheduledFor).toLocaleString('fr-FR') : scheduledDate.toLocaleString('fr-FR')}`)
      setShowScheduleDialog(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la planification')
    } finally {
      setSchedulingCampaign(false)
    }
  }

  const assignTemplateToPhase = async (phaseId: string, templateId: string) => {
    const selectedTemplate = availableTemplates.find(t => t.id === templateId)
    if (!selectedTemplate) return

    // Update local state
    setPhases(prevPhases =>
      prevPhases.map(phase =>
        phase.id === phaseId
          ? { ...phase, templateName: selectedTemplate.name, templateId, status: 'configured' as const }
          : phase
      )
    )

    // Save to database
    setLoading(true)
    try {
      const updatedPhases = phases.map(phase =>
        phase.id === phaseId
          ? { ...phase, templateName: selectedTemplate.name, templateId, status: 'configured' as const }
          : phase
      )

      const phasesConfig = updatedPhases.map(phase => ({
        id: phase.id,
        phase: phase.phase,
        enabled: phase.enabled,
        status: phase.status,
        templateName: phase.templateName,
        templateId: phase.templateId, // Always save templateId if present
        scheduledDate: phase.scheduledDate?.toISOString(),
        recipients: phase.recipients
      }))

      const response = await fetch(`/api/admin/events/${event.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailCampaignsConfig: {
            phases: phasesConfig
          }
        })
      })

      if (!response.ok) throw new Error('Failed to save template')

      toast.success(`Template "${selectedTemplate.name}" assigné à la phase`)
      onUpdate()
    } catch (error) {
      toast.error('Erreur lors de l\'assignation du template')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (phase: PhaseConfig) => {
    switch (phase.status) {
      case 'sent':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            ✓ Envoyé
          </Badge>
        )
      case 'scheduled':
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            ⏰ Planifié
          </Badge>
        )
      case 'configured':
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
            ✓ Template créé
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="border-red-300 text-red-700">
            ⚠️ Template manquant
          </Badge>
        )
    }
  }

  const formatScheduledDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const getRelativeTime = (date: Date) => {
    return formatDistanceToNow(date, { locale: fr, addSuffix: true })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-[#009197]/30 bg-gradient-to-r from-[#009197]/5 to-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-[#004645]">Chronologie des Campagnes Email</CardTitle>
              <CardDescription className="space-y-1">
                <p>Activez uniquement les phases dont vous avez besoin et personnalisez chaque template.</p>
                <p className="text-xs">
                  💡 <strong>Phase 4 (Confirmation)</strong> est obligatoire - elle envoie automatiquement les emails après chaque réponse RSVP.
                </p>
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Link href={`/admin/events/${event.id}/my-templates`}>
                <Button className="bg-gradient-to-r from-[#004645] to-[#009197] text-white">
                  <Edit className="h-4 w-4 mr-2" />
                  Créer un Template
                </Button>
              </Link>
              <Link href={`/admin/events/${event.id}/email-analytics`}>
                <Button variant="outline" className="border-[#009197] text-[#009197]">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analytics
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Progress Indicator */}
      {(() => {
        const totalPhases = phases.length
        const enabledPhases = phases.filter(p => p.enabled).length
        const configuredPhases = phases.filter(p => p.enabled && p.status === 'configured').length
        const mandatoryPhases = phases.filter(p => p.isMandatory).length
        const mandatoryConfigured = phases.filter(p => p.isMandatory && p.status === 'configured').length
        const progressPercentage = enabledPhases > 0 ? Math.round((configuredPhases / enabledPhases) * 100) : 0
        const isReadyToSend = mandatoryConfigured === mandatoryPhases && configuredPhases === enabledPhases

        return (
          <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-white">
            <CardContent className="pt-6">
              <div className="space-y-4">
                {/* Status Badge & Stats */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">📊</div>
                    <div>
                      <h3 className="font-semibold text-[#004645]">Progression de Configuration</h3>
                      <p className="text-sm text-gray-600">
                        {configuredPhases} / {enabledPhases} phases configurées
                        {mandatoryPhases > 0 && ` • ${mandatoryConfigured}/${mandatoryPhases} obligatoires`}
                      </p>
                    </div>
                  </div>
                  {isReadyToSend ? (
                    <Badge className="bg-green-100 text-green-800 border-green-300 px-4 py-2">
                      ✅ Prêt à envoyer
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-orange-300 text-orange-700 px-4 py-2">
                      ⚠️ Configuration incomplète
                    </Badge>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Avancement global</span>
                    <span className="font-semibold text-[#004645]">{progressPercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-[#004645] to-[#009197] h-3 rounded-full transition-all duration-500"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-4 gap-3 text-xs">
                  <div className="bg-white rounded-lg p-2 border border-gray-200">
                    <div className="text-gray-500">Activées</div>
                    <div className="text-lg font-bold text-[#004645]">{enabledPhases}</div>
                  </div>
                  <div className="bg-white rounded-lg p-2 border border-gray-200">
                    <div className="text-gray-500">Configurées</div>
                    <div className="text-lg font-bold text-green-600">{configuredPhases}</div>
                  </div>
                  <div className="bg-white rounded-lg p-2 border border-gray-200">
                    <div className="text-gray-500">En attente</div>
                    <div className="text-lg font-bold text-orange-600">{enabledPhases - configuredPhases}</div>
                  </div>
                  <div className="bg-white rounded-lg p-2 border border-gray-200">
                    <div className="text-gray-500">Envoyées</div>
                    <div className="text-lg font-bold text-blue-600">{phases.filter(p => p.status === 'sent').length}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })()}

      {/* Quick Start Guide (only show if not all mandatory phases configured) */}
      {(() => {
        const mandatoryPhases = phases.filter(p => p.isMandatory)
        const mandatoryConfigured = phases.filter(p => p.isMandatory && p.status === 'configured').length
        const showGuide = mandatoryConfigured < mandatoryPhases.length ||
                         !event.rsvpDeadline ||
                         phases.filter(p => p.enabled && p.status === 'configured').length < 3

        if (!showGuide) return null

        return (
          <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-white">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">🚀</div>
                  <div>
                    <h3 className="font-semibold text-[#004645]">Guide de Démarrage Rapide</h3>
                    <p className="text-sm text-gray-600">Suivez ces étapes pour configurer votre campagne email</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Step 1: Invitation + RSVP */}
                  <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-blue-100">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                      1
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-[#004645] mb-1">Configurez l&apos;Invitation (Phase 2)</div>
                      <p className="text-sm text-gray-600 mb-2">Sélectionnez un template et configurez le formulaire RSVP avec la date limite</p>
                      {phases.find(p => p.id === 'invitation')?.status !== 'configured' && (
                        <Badge variant="outline" className="border-orange-300 text-orange-700 text-xs">
                          ⚠️ À configurer
                        </Badge>
                      )}
                      {phases.find(p => p.id === 'invitation')?.status === 'configured' && !event.rsvpDeadline && (
                        <Badge variant="outline" className="border-orange-300 text-orange-700 text-xs">
                          ⚠️ RSVP à configurer
                        </Badge>
                      )}
                      {phases.find(p => p.id === 'invitation')?.status === 'configured' && event.rsvpDeadline && (
                        <Badge className="bg-green-100 text-green-800 text-xs">
                          ✓ Configuré
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Step 2: Confirmation */}
                  <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-blue-100">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                      2
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-[#004645] mb-1">Configurez la Confirmation (Phase 4) - Obligatoire</div>
                      <p className="text-sm text-gray-600 mb-2">Créez les 2 templates : email accepté + email refusé</p>
                      {phases.find(p => p.id === 'confirmation')?.status !== 'configured' ? (
                        <Badge variant="outline" className="border-red-300 text-red-700 text-xs">
                          ⚠️ Obligatoire - À configurer
                        </Badge>
                      ) : (
                        <Badge className="bg-green-100 text-green-800 text-xs">
                          ✓ Configuré
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Step 3: Badge */}
                  <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-blue-100">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                      3
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-[#004645] mb-1">Configurez le Badge & Infos Pratiques (Phase 5)</div>
                      <p className="text-sm text-gray-600 mb-2">Personnalisez le design du badge et créez le template d&apos;infos pratiques</p>
                      {phases.find(p => p.id === 'practical-info')?.status !== 'configured' ? (
                        <Badge variant="outline" className="border-orange-300 text-orange-700 text-xs">
                          ⚠️ Recommandé
                        </Badge>
                      ) : (
                        <Badge className="bg-green-100 text-green-800 text-xs">
                          ✓ Configuré
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-900">
                  💡 <strong>Astuce :</strong> Les autres phases (Save the Date, Relance, Rappel J-1) sont optionnelles et peuvent être configurées selon vos besoins.
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })()}

      {/* Timeline of Phases */}
      <div className="space-y-4">
        {phases.map((phase) => {
          const Icon = phase.icon

          return (
            <Card
              key={phase.id}
              className={`${phase.borderColor} bg-gradient-to-r ${phase.bgColor} hover:shadow-md transition-shadow ${
                !phase.enabled ? 'opacity-60' : ''
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  {/* Left: Phase Info */}
                  <div className="flex items-start gap-4 flex-1">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: phase.color, opacity: phase.enabled ? 1 : 0.5 }}
                    >
                      <Icon className="h-6 w-6 text-white" />
                    </div>

                    <div className="flex-1 space-y-3">
                      {/* Title, Status & Toggle */}
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-lg font-bold text-[#004645]">
                          Phase {phase.phase} : {phase.title}
                        </h3>

                        {/* Enable/Disable Switch */}
                        <div className="flex items-center gap-2 ml-auto">
                          <Label htmlFor={`phase-${phase.id}-toggle`} className="text-sm text-[#004645]/70">
                            {phase.enabled ? 'Activée' : 'Désactivée'}
                          </Label>
                          <Switch
                            id={`phase-${phase.id}-toggle`}
                            checked={phase.enabled}
                            onCheckedChange={(checked) => togglePhaseEnabled(phase.id, checked)}
                            disabled={phase.isMandatory || loading}
                          />
                          {phase.isMandatory && (
                            <Badge variant="outline" className="border-red-500 text-red-700 text-xs">
                              Obligatoire
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 flex-wrap">
                        {getStatusBadge(phase)}
                        {phase.isAutomatic && (
                          <Badge className="bg-purple-100 text-purple-800">
                            ⚡ Automatique
                          </Badge>
                        )}
                        {!phase.enabled && !phase.isMandatory && (
                          <Badge variant="outline" className="border-gray-400 text-gray-600">
                            Phase inactive
                          </Badge>
                        )}
                      </div>

                      {/* Help message for unconfigured phases */}
                      {phase.enabled && phase.status === 'not_configured' && !phase.isAutomatic && (
                        <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 mt-2 space-y-3">
                          <p className="text-sm text-amber-900">
                            👉 <strong>Action requise :</strong> Sélectionnez un template existant ou créez-en un nouveau
                          </p>

                          {/* Template Selector */}
                          {availableTemplates.length > 0 && (
                            <div className="flex items-center gap-3">
                              <Label htmlFor={`template-${phase.id}`} className="text-sm font-medium text-amber-900 whitespace-nowrap">
                                Sélectionner un template :
                              </Label>
                              <Select
                                value={phase.templateId || ''}
                                onValueChange={(value) => assignTemplateToPhase(phase.id, value)}
                              >
                                <SelectTrigger id={`template-${phase.id}`} className="flex-1 bg-white">
                                  <SelectValue placeholder="Choisir un template..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {availableTemplates.map((template) => (
                                    <SelectItem key={template.id} value={template.id}>
                                      {template.name} {template.type && `(${template.type})`}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}

                          <p className="text-xs text-amber-800">
                            Ou cliquez sur <strong>&quot;Créer/Modifier Template&quot;</strong> à droite pour créer un nouveau template
                          </p>
                        </div>
                      )}

                      {/* RSVP Configuration Section (Phase 2 only) */}
                      {phase.id === 'invitation' && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-blue-900">📋 Configuration RSVP</span>
                              {event.rsvpDeadline ? (
                                <Badge className="bg-green-100 text-green-800">
                                  ✓ Configuré
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="border-orange-300 text-orange-700">
                                  ⚠️ À configurer
                                </Badge>
                              )}
                            </div>
                            <Link href={`/admin/events/${event.id}/settings?tab=rsvp`}>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                              >
                                <Settings className="h-3 w-3 mr-2" />
                                Configurer RSVP
                              </Button>
                            </Link>
                          </div>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            {event.rsvpDeadline ? (
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-blue-600" />
                                <span className="text-blue-900">
                                  <strong>Date limite :</strong>{' '}
                                  {new Date(event.rsvpDeadline).toLocaleDateString('fr-FR', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric'
                                  })}
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-orange-700">
                                <Calendar className="h-4 w-4" />
                                <span>Date limite non définie</span>
                              </div>
                            )}
                            {event.rsvpConfig && (event.rsvpConfig as any).customSteps ? (
                              <div className="flex items-center gap-2">
                                <List className="h-4 w-4 text-blue-600" />
                                <span className="text-blue-900">
                                  <strong>Étapes :</strong> {(event.rsvpConfig as any).customSteps.filter((s: any) => s.enabled).length} configurées
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-blue-700">
                                <List className="h-4 w-4" />
                                <span>Formulaire standard</span>
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-blue-800">
                            💡 L&apos;invitation contient le lien RSVP unique pour chaque invité. Configurez le formulaire et la date limite avant l&apos;envoi.
                          </p>
                        </div>
                      )}

                      {/* Badge & QR Code Section (Phase 5 only) */}
                      {phase.id === 'practical-info' && (
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <QrCode className="h-4 w-4 text-purple-600" />
                              <span className="text-sm font-semibold text-purple-900">📱 Badge & QR Code</span>
                            </div>
                            <Link href={`/admin/events/${event.id}/badges`}>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white"
                              >
                                <QrCode className="h-3 w-3 mr-2" />
                                Configurer Badges
                              </Button>
                            </Link>
                          </div>
                          <div className="space-y-2 text-xs text-purple-900">
                            <p>
                              <strong>✓ Génération automatique :</strong> Les badges avec QR code sont générés automatiquement pour tous les invités confirmés.
                            </p>
                            <p>
                              <strong>🎨 Personnalisation :</strong> Cliquez sur &quot;Configurer Badges&quot; pour choisir le design, les champs affichés, et la taille du QR code.
                            </p>
                            <p>
                              <strong>📅 Timing optimal :</strong> Cette phase (J-7 à J-3) est le moment idéal pour envoyer le badge avec toutes les infos pratiques finalisées.
                            </p>
                            <p className="text-purple-700">
                              💡 Le QR code contient le lien unique de l&apos;invité pour faciliter le check-in le jour de l&apos;événement.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Description */}
                      <p className="text-sm text-[#004645]/70">
                        {phase.description}
                      </p>

                      {/* Details */}
                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        {phase.scheduledDate && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-[#009197]" />
                            <span className="text-[#004645]">
                              {formatScheduledDate(phase.scheduledDate)}
                            </span>
                            <span className="text-[#004645]/60">
                              ({getRelativeTime(phase.scheduledDate)})
                            </span>
                          </div>
                        )}

                        {phase.recipients !== undefined && (
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-[#009197]" />
                            <span className="text-[#004645]">
                              {phase.recipients} destinataire{phase.recipients > 1 ? 's' : ''}
                            </span>
                          </div>
                        )}

                        {phase.templateName && (
                          <div className="flex items-center gap-2">
                            <span className="text-[#004645]/60">Template :</span>
                            <span className="text-[#004645] font-medium">
                              {phase.templateName}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Special info for automatic phase */}
                      {phase.isAutomatic && (
                        <div className="space-y-3">
                          <div className="bg-red-50 border border-red-300 rounded-lg p-4 mt-2">
                            <p className="text-sm font-bold text-red-900 mb-2">
                              ⚠️ CONFIGURATION OBLIGATOIRE
                            </p>
                            <p className="text-xs text-red-800 mb-3">
                              Ces emails sont envoyés <strong>automatiquement</strong> dès qu&apos;un invité répond au RSVP.
                              <strong className="block mt-1">Vous devez configurer 2 templates distincts</strong> :
                            </p>
                            <div className="space-y-2">
                              <div className="flex items-start gap-2 text-xs text-red-900">
                                <span className="font-bold">1.</span>
                                <div>
                                  <strong>Email Accepté</strong> : Envoyé quand l&apos;invité confirme sa présence
                                  <br />
                                  <span className="text-red-700">→ Doit inclure : message de remerciement et confirmation</span>
                                </div>
                              </div>
                              <div className="flex items-start gap-2 text-xs text-red-900">
                                <span className="font-bold">2.</span>
                                <div>
                                  <strong>Email Refusé</strong> : Envoyé quand l&apos;invité décline l&apos;invitation
                                  <br />
                                  <span className="text-red-700">→ Doit inclure : message de regret personnalisé</span>
                                </div>
                              </div>
                            </div>
                            <div className="mt-3 p-2 bg-red-100 rounded text-xs text-red-900">
                              <strong>⚡ Attention :</strong> Sans configuration, vos invités recevront des emails vides ou non-personnalisés !
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-col gap-2 min-w-[200px]">
                    {/* Special actions for automatic confirmation phase */}
                    {phase.isAutomatic ? (
                      <>
                        <Link href={`/admin/events/${event.id}/confirmation-email?type=accepted`}>
                          <Button
                            size="sm"
                            className="w-full bg-green-600 hover:bg-green-700 text-white"
                          >
                            <Edit className="h-3 w-3 mr-2" />
                            Email &quot;Accepté&quot;
                          </Button>
                        </Link>
                        <Link href={`/admin/events/${event.id}/confirmation-email?type=declined`}>
                          <Button
                            size="sm"
                            className="w-full bg-red-600 hover:bg-red-700 text-white"
                          >
                            <Edit className="h-3 w-3 mr-2" />
                            Email &quot;Refusé&quot;
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
                          disabled={!phase.enabled || phase.status !== 'configured'}
                          onClick={() => handleOpenTestDialog(phase.id)}
                        >
                          <TestTube className="h-3 w-3 mr-2" />
                          Tester les 2
                        </Button>
                      </>
                    ) : (
                      <>
                        {/* Template Actions for non-automatic phases */}
                        <Link href={`/admin/events/${event.id}/my-templates`}>
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full border-[#004645] text-[#004645] hover:bg-[#004645] hover:text-white"
                          >
                            <Edit className="h-3 w-3 mr-2" />
                            Créer/Modifier Template
                          </Button>
                        </Link>

                        {/* Test Email */}
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full"
                          disabled={!phase.enabled || !phase.templateId}
                          onClick={() => handleOpenTestDialog(phase.id)}
                          style={{
                            borderColor: phase.color,
                            color: phase.color
                          }}
                          onMouseEnter={(e) => {
                            if (phase.enabled && phase.templateId) {
                              e.currentTarget.style.backgroundColor = phase.color
                              e.currentTarget.style.color = 'white'
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (phase.enabled && phase.templateId) {
                              e.currentTarget.style.backgroundColor = 'transparent'
                              e.currentTarget.style.color = phase.color
                            }
                          }}
                        >
                          <TestTube className="h-3 w-3 mr-2" />
                          Tester
                        </Button>

                        {/* Send/Schedule Actions */}
                        {phase.status === 'sent' ? (
                          <Button
                            size="sm"
                            disabled
                            className="w-full bg-green-600"
                          >
                            <CheckCheck className="h-3 w-3 mr-2" />
                            Envoyé
                          </Button>
                        ) : phase.status === 'scheduled' ? (
                          <>
                            <div className="w-full bg-blue-50 border border-blue-300 rounded p-2 text-xs text-blue-900">
                              📅 Planifié pour :{' '}
                              <strong>
                                {phase.scheduledDate?.toLocaleString('fr-FR', {
                                  weekday: 'short',
                                  day: 'numeric',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </strong>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                              disabled={!phase.enabled}
                              onClick={() => handleOpenScheduleDialog(phase.id)}
                            >
                              <Calendar className="h-3 w-3 mr-2" />
                              Modifier
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              className="w-full text-white"
                              style={{ backgroundColor: phase.color }}
                              disabled={!phase.enabled || !phase.templateId}
                              onClick={() => handleOpenSendDialog(phase.id)}
                            >
                              <Send className="h-3 w-3 mr-2" />
                              Envoyer
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                              disabled={!phase.enabled || !phase.templateId}
                              onClick={() => handleOpenScheduleDialog(phase.id)}
                            >
                              <Calendar className="h-3 w-3 mr-2" />
                              Planifier
                            </Button>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Global Stats */}
      <Card className="border-[#004645]/30 bg-gradient-to-r from-[#004645]/5 to-white">
        <CardHeader>
          <CardTitle className="text-[#004645]">Statistiques Globales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-[#004645]/70 mb-1">Emails envoyés</p>
              <p className="text-3xl font-bold text-[#004645]">{globalStats.totalSent}</p>
            </div>
            <div>
              <p className="text-sm text-[#004645]/70 mb-1">Taux d&apos;ouverture</p>
              <p className="text-3xl font-bold text-green-600">{globalStats.openRate}%</p>
            </div>
            <div>
              <p className="text-sm text-[#004645]/70 mb-1">Clics</p>
              <p className="text-3xl font-bold text-[#009197]">{globalStats.clickRate}%</p>
            </div>
            <div>
              <p className="text-sm text-[#004645]/70 mb-1">Taux de réponse</p>
              <p className="text-3xl font-bold text-purple-600">{globalStats.responseRate}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Email Dialog */}
      <Dialog open={showTestDialog} onOpenChange={setShowTestDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Envoyer un email de test</DialogTitle>
            <DialogDescription>
              Entrez une adresse email pour recevoir un email de test de cette phase.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="test-email">Adresse email</Label>
              <Input
                id="test-email"
                type="email"
                placeholder="exemple@email.com"
                value={testEmailAddress}
                onChange={(e) => setTestEmailAddress(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleSendTestEmail()
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTestDialog(false)} disabled={sendingTest}>
              Annuler
            </Button>
            <Button onClick={handleSendTestEmail} disabled={sendingTest || !testEmailAddress}>
              {sendingTest && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Envoyer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Campaign Confirmation Dialog */}
      <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer l&apos;envoi de la campagne</DialogTitle>
            <DialogDescription>
              Vous êtes sur le point d&apos;envoyer cette campagne email à tous vos invités.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-amber-50 border border-amber-300 rounded-lg p-4 space-y-2">
              <p className="text-sm font-semibold text-amber-900">⚠️ Attention</p>
              <p className="text-sm text-amber-800">
                Cette action enverra immédiatement l&apos;email à <strong>{guestCount} destinataire{guestCount > 1 ? 's' : ''}</strong>.
              </p>
              <p className="text-sm text-amber-800">
                Cette action est <strong>irréversible</strong>.
              </p>
            </div>

            {/* Pre-send Checklist */}
            {sendPhaseId && (() => {
              const phase = phases.find(p => p.id === sendPhaseId)
              const checks = [
                {
                  label: 'Template configuré',
                  passed: !!phase?.templateId,
                  critical: true
                },
                {
                  label: `${guestCount} destinataire${guestCount > 1 ? 's' : ''} dans la liste`,
                  passed: guestCount > 0,
                  critical: true
                },
                {
                  label: 'RSVP configuré (si Phase 2)',
                  passed: phase?.id !== 'invitation' || !!event.rsvpDeadline,
                  critical: phase?.id === 'invitation'
                },
                {
                  label: 'Badge configuré (si Phase 5)',
                  passed: phase?.id !== 'practical-info' || true, // Always pass for now
                  critical: false
                }
              ]

              const criticalChecksFailed = checks.filter(c => c.critical && !c.passed).length > 0

              return (
                <div className="space-y-3">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm font-semibold text-blue-900 mb-3">✓ Vérification pré-envoi</p>
                    <div className="space-y-2">
                      {checks.map((check, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          {check.passed ? (
                            <CheckCheck className="h-4 w-4 text-green-600 flex-shrink-0" />
                          ) : (
                            <span className="h-4 w-4 flex-shrink-0 text-orange-600">⚠️</span>
                          )}
                          <span className={check.passed ? 'text-green-700' : 'text-orange-700'}>
                            {check.label}
                          </span>
                        </div>
                      ))}
                    </div>
                    {criticalChecksFailed && (
                      <div className="mt-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded p-2">
                        ⚠️ Certains éléments critiques ne sont pas configurés. Veuillez les corriger avant l&apos;envoi.
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-gray-700">
                      <strong>Phase :</strong> {phase?.title}
                    </p>
                    <p className="text-sm text-gray-700">
                      <strong>Template :</strong> {phase?.templateName}
                    </p>
                  </div>
                </div>
              )
            })()}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSendDialog(false)} disabled={sendingCampaign}>
              Annuler
            </Button>
            <Button
              onClick={handleSendCampaign}
              disabled={
                sendingCampaign ||
                guestCount === 0 ||
                !phases.find(p => p.id === sendPhaseId)?.templateId ||
                (sendPhaseId === 'invitation' && !event.rsvpDeadline)
              }
              className="bg-[#004645] hover:bg-[#003534]"
            >
              {sendingCampaign && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Envoyer maintenant
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Schedule Campaign Dialog */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Planifier l&apos;envoi de la campagne</DialogTitle>
            <DialogDescription>
              Choisissez la date et l&apos;heure d&apos;envoi de cette campagne.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {schedulePhaseId && (
              <div className="space-y-2 pb-4 border-b">
                <p className="text-sm text-gray-700">
                  <strong>Phase :</strong> {phases.find(p => p.id === schedulePhaseId)?.title}
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Template :</strong> {phases.find(p => p.id === schedulePhaseId)?.templateName}
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Destinataires :</strong> {guestCount} invité{guestCount > 1 ? 's' : ''}
                </p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="scheduled-date">Date et heure d&apos;envoi</Label>
              <Input
                id="scheduled-date"
                type="datetime-local"
                value={scheduledDate ? scheduledDate.toISOString().slice(0, 16) : ''}
                onChange={(e) => {
                  const date = e.target.value ? new Date(e.target.value) : undefined
                  setScheduledDate(date)
                }}
                min={new Date().toISOString().slice(0, 16)}
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                L&apos;email sera envoyé automatiquement à la date et l&apos;heure sélectionnées.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowScheduleDialog(false)} disabled={schedulingCampaign}>
              Annuler
            </Button>
            <Button
              onClick={handleScheduleCampaign}
              disabled={schedulingCampaign || !scheduledDate}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {schedulingCampaign && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Calendar className="mr-2 h-4 w-4" />
              Planifier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
