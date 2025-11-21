"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
}

export function EmailsTab({ event, onUpdate }: EmailsTabProps) {
  const [phases, setPhases] = useState<PhaseConfig[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadPhases()
  }, [event])

  const loadPhases = () => {
    // TODO: Charger la config réelle depuis la DB
    const phasesData: PhaseConfig[] = [
      {
        id: 'save-the-date',
        phase: 1,
        title: 'Save the Date',
        description: 'Pré-invitation pour bloquer la date (J-90 à J-60)',
        icon: Bell,
        color: '#FF4713',
        bgColor: 'from-[#FF4713]/5 to-transparent',
        borderColor: 'border-[#FF4713]/30',
        status: 'configured',
        recipients: 150,
        templateName: 'Save the Date Élégant',
        scheduledDate: new Date('2025-03-25T10:00:00')
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
        status: 'sent',
        recipients: 150,
        templateName: 'Invitation Corporate'
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
        status: 'scheduled',
        recipients: 42,
        templateName: 'Rappel RSVP',
        scheduledDate: new Date('2025-06-01T14:00:00')
      },
      {
        id: 'confirmation',
        phase: 4,
        title: 'Confirmation',
        description: 'Emails conditionnels envoyés automatiquement après RSVP',
        icon: CheckCheck,
        color: '#4caf50',
        bgColor: 'from-green-50/50 to-transparent',
        borderColor: 'border-green-500/30',
        status: 'configured',
        isAutomatic: true,
        templateName: 'Confirmation présence / absence'
      },
      {
        id: 'day-before',
        phase: 5,
        title: 'Rappel Jour J',
        description: 'Rappel aux participants confirmés (J-1)',
        icon: Clock,
        color: '#004645',
        bgColor: 'from-[#004645]/5 to-transparent',
        borderColor: 'border-[#004645]/30',
        status: 'configured',
        recipients: 87,
        templateName: 'Rappel dernier moment',
        scheduledDate: new Date('2025-06-14T09:00:00')
      }
    ]

    setPhases(phasesData)
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
            ⚙️ Configuré
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="border-red-300 text-red-700">
            ⚠️ À configurer
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
              <CardDescription>
                Gérez les 5 phases de communication de votre événement au même endroit
              </CardDescription>
            </div>
            <Link href={`/admin/events/${event.id}/email-analytics`}>
              <Button variant="outline" className="border-[#009197] text-[#009197]">
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </Button>
            </Link>
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
              className={`${phase.borderColor} bg-gradient-to-r ${phase.bgColor} hover:shadow-md transition-shadow`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  {/* Left: Phase Info */}
                  <div className="flex items-start gap-4 flex-1">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: phase.color }}
                    >
                      <Icon className="h-6 w-6 text-white" />
                    </div>

                    <div className="flex-1 space-y-3">
                      {/* Title & Status */}
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-bold text-[#004645]">
                          Phase {phase.phase} : {phase.title}
                        </h3>
                        {getStatusBadge(phase)}
                        {phase.isAutomatic && (
                          <Badge className="bg-purple-100 text-purple-800">
                            ⚡ Automatique
                          </Badge>
                        )}
                      </div>

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
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mt-2">
                          <p className="text-xs text-purple-900">
                            <strong>Envoi automatique :</strong> Dès qu&apos;un invité répond au RSVP,
                            un email de confirmation lui est envoyé automatiquement selon sa réponse
                            (présent ou absent).
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-col gap-2 min-w-[140px]">
                    <Link href={`/admin/events/${event.id}/emails?phase=${phase.id}`}>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full border-[#004645] text-[#004645] hover:bg-[#004645] hover:text-white"
                      >
                        <Edit className="h-3 w-3 mr-2" />
                        Éditer
                      </Button>
                    </Link>

                    {!phase.isAutomatic && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full"
                          style={{
                            borderColor: phase.color,
                            color: phase.color
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = phase.color
                            e.currentTarget.style.color = 'white'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent'
                            e.currentTarget.style.color = phase.color
                          }}
                        >
                          <TestTube className="h-3 w-3 mr-2" />
                          Tester
                        </Button>

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
                          >
                            <Calendar className="h-3 w-3 mr-2" />
                            Modifier
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            className="w-full text-white"
                            style={{ backgroundColor: phase.color }}
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
