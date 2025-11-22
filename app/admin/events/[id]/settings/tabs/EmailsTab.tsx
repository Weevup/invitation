"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Bell, Sparkles, Repeat, CheckCheck, Clock,
  Send, Calendar, TestTube, Edit, BarChart3, Users
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
  isAutomatic?: boolean
  enabled: boolean // Whether this phase is enabled/active
  isMandatory?: boolean // Whether this phase can be disabled (Phase 4 is mandatory)
}

export function EmailsTab({ event, onUpdate }: EmailsTabProps) {
  const [phases, setPhases] = useState<PhaseConfig[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadPhases()
  }, [event])

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
        description: 'Envoi des infos pratiques et du badge avec QR code aux participants confirmés (J-7 à J-3). Activez si le badge n\'est pas envoyé dans la confirmation.',
        icon: Users,
        color: '#673ab7',
        bgColor: 'from-purple-50/50 to-transparent',
        borderColor: 'border-purple-500/30',
        status: 'not_configured',
        enabled: false, // Optional - disabled by default
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
              <Link href={`/admin/events/${event.id}/confirmation-email`}>
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
                        <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 mt-2">
                          <p className="text-sm text-amber-900">
                            👉 <strong>Action requise :</strong> Cliquez sur <strong>&quot;Modifier Template&quot;</strong> à droite pour créer l&apos;email de cette phase
                          </p>
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
                                  <span className="text-red-700">→ Doit inclure : infos pratiques, date, lieu, QR code</span>
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
                          disabled={!phase.enabled}
                        >
                          <TestTube className="h-3 w-3 mr-2" />
                          Tester les 2
                        </Button>
                      </>
                    ) : (
                      <>
                        {/* Template Actions for non-automatic phases */}
                        <Link href={`/admin/events/${event.id}/confirmation-email?phase=${phase.id}`}>
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full border-[#004645] text-[#004645] hover:bg-[#004645] hover:text-white"
                          >
                            <Edit className="h-3 w-3 mr-2" />
                            Modifier Template
                          </Button>
                        </Link>

                        {/* Test Email */}
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full"
                          disabled={!phase.enabled}
                          style={{
                            borderColor: phase.color,
                            color: phase.color
                          }}
                          onMouseEnter={(e) => {
                            if (phase.enabled) {
                              e.currentTarget.style.backgroundColor = phase.color
                              e.currentTarget.style.color = 'white'
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (phase.enabled) {
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
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                            disabled={!phase.enabled}
                          >
                            <Calendar className="h-3 w-3 mr-2" />
                            Modifier
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            className="w-full text-white"
                            style={{ backgroundColor: phase.color }}
                            disabled={!phase.enabled}
                          >
                            <Send className="h-3 w-3 mr-2" />
                            Envoyer
                          </Button>
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
              <p className="text-3xl font-bold text-[#004645]">312</p>
            </div>
            <div>
              <p className="text-sm text-[#004645]/70 mb-1">Taux d&apos;ouverture</p>
              <p className="text-3xl font-bold text-green-600">78%</p>
            </div>
            <div>
              <p className="text-sm text-[#004645]/70 mb-1">Clics</p>
              <p className="text-3xl font-bold text-[#009197]">45%</p>
            </div>
            <div>
              <p className="text-sm text-[#004645]/70 mb-1">Taux de réponse</p>
              <p className="text-3xl font-bold text-purple-600">65%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
