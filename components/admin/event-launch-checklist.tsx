"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  CheckCircle2,
  Circle,
  AlertCircle,
  ArrowRight,
  Rocket,
  Mail,
  Users,
  Settings,
  TestTube,
  Sparkles
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { createClientLogger } from '@/lib/client-logger'

const logger = createClientLogger({ component: 'EventLaunchChecklist' })

interface ChecklistItem {
  id: string
  label: string
  description: string
  status: 'completed' | 'warning' | 'pending'
  icon: any
  href?: string
  actionLabel?: string
  priority: 'critical' | 'important' | 'optional'
}

interface EventLaunchChecklistProps {
  eventId: string
  totalGuests: number
  onOpenWizard?: () => void
}

export function EventLaunchChecklist({ eventId, totalGuests, onOpenWizard }: EventLaunchChecklistProps) {
  const [checklist, setChecklist] = useState<ChecklistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isExpanded, setIsExpanded] = useState(true)

  useEffect(() => {
    async function checkEventStatus() {
      try {
        // Check email integration
        const integrationRes = await fetch('/api/admin/integrations/email')
        const integrations = await integrationRes.json()
        const hasEmailIntegration = integrations && integrations.some((i: any) => i.isActive)

        // Check if invitation template exists
        const templatesRes = await fetch(`/api/admin/templates?eventId=${eventId}&type=INVITE`)
        const templates = await templatesRes.json()
        const hasInvitationTemplate = templates && templates.length > 0

        // Check if confirmation templates exist
        const confirmTemplatesRes = await fetch(`/api/admin/templates?eventId=${eventId}`)
        const allTemplates = await confirmTemplatesRes.json()
        const hasConfirmationTemplate = allTemplates && allTemplates.some(
          (t: any) => t.type === 'CONFIRMATION' && t.isActive
        )

        // Check RSVP configuration
        const eventRes = await fetch(`/api/admin/events/${eventId}`)
        const eventData = await eventRes.json()
        const hasRsvpConfig = eventData.rsvpConfig && eventData.rsvpConfig.customSteps

        // Build checklist
        const items: ChecklistItem[] = [
          {
            id: 'event-created',
            label: 'Événement créé',
            description: 'Votre événement est configuré',
            status: 'completed',
            icon: CheckCircle2,
            priority: 'critical'
          },
          {
            id: 'guests-imported',
            label: `${totalGuests} invité${totalGuests > 1 ? 's' : ''} importé${totalGuests > 1 ? 's' : ''}`,
            description: totalGuests > 0 ? 'Liste d\'invités prête' : 'Importez vos invités',
            status: totalGuests > 0 ? 'completed' : 'warning',
            icon: Users,
            href: `/admin/events/${eventId}/guests`,
            actionLabel: 'Ajouter des invités',
            priority: 'critical'
          },
          {
            id: 'email-integration',
            label: 'Intégration email',
            description: hasEmailIntegration
              ? 'SendGrid/Resend configuré'
              : 'Configuration requise pour envoyer des emails',
            status: hasEmailIntegration ? 'completed' : 'warning',
            icon: Mail,
            href: '/admin/settings/integrations',
            actionLabel: 'Configurer',
            priority: 'critical'
          },
          {
            id: 'invitation-template',
            label: 'Template d\'invitation',
            description: hasInvitationTemplate
              ? 'Email personnalisé prêt'
              : 'Utilisera le template par défaut',
            status: hasInvitationTemplate ? 'completed' : 'pending',
            icon: Sparkles,
            href: `/admin/events/${eventId}/email-editor`,
            actionLabel: 'Créer un template',
            priority: 'important'
          },
          {
            id: 'confirmation-template',
            label: 'Email de confirmation',
            description: hasConfirmationTemplate
              ? 'Email de confirmation actif'
              : 'Configurez un email personnalisé',
            status: hasConfirmationTemplate ? 'completed' : 'pending',
            icon: CheckCircle2,
            href: `/admin/events/${eventId}/emails`,
            actionLabel: 'Configurer',
            priority: 'important'
          },
          {
            id: 'rsvp-config',
            label: 'Configuration RSVP',
            description: hasRsvpConfig
              ? 'Étapes personnalisées configurées'
              : 'RSVP standard actif',
            status: hasRsvpConfig ? 'completed' : 'pending',
            icon: Settings,
            href: `/admin/events/${eventId}/rsvp-steps`,
            actionLabel: 'Personnaliser',
            priority: 'optional'
          },
        ]

        setChecklist(items)
      } catch (error) {
        logger.error(error, { action: 'checkEventStatus', metadata: { eventId } })
      } finally {
        setLoading(false)
      }
    }

    checkEventStatus()
  }, [eventId, totalGuests])

  if (loading) {
    return null
  }

  const completedCount = checklist.filter(item => item.status === 'completed').length
  const totalCount = checklist.length
  const percentage = Math.round((completedCount / totalCount) * 100)

  const criticalPending = checklist.filter(
    item => item.priority === 'critical' && item.status !== 'completed'
  )

  const isReadyToLaunch = criticalPending.length === 0

  return (
    <Card className={cn(
      "border-2 transition-all",
      isReadyToLaunch
        ? "border-green-500/30 bg-gradient-to-br from-green-50/50 to-white"
        : "border-orange-500/30 bg-gradient-to-br from-orange-50/50 to-white"
    )}>
      <CardHeader className="cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center",
              isReadyToLaunch
                ? "bg-green-500 text-white"
                : "bg-orange-500 text-white"
            )}>
              {isReadyToLaunch ? (
                <Rocket className="h-6 w-6" />
              ) : (
                <AlertCircle className="h-6 w-6" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <CardTitle className="text-[#004645]">
                  {isReadyToLaunch ? '🎉 Prêt à lancer !' : '⚡ Préparation de votre événement'}
                </CardTitle>
                <Badge variant={isReadyToLaunch ? "default" : "secondary"} className={cn(
                  isReadyToLaunch
                    ? "bg-green-500 text-white"
                    : "bg-orange-500 text-white"
                )}>
                  {percentage}%
                </Badge>
              </div>
              <CardDescription>
                {isReadyToLaunch
                  ? `Toutes les étapes critiques sont complétées. Vous pouvez envoyer vos invitations !`
                  : `${criticalPending.length} étape${criticalPending.length > 1 ? 's' : ''} critique${criticalPending.length > 1 ? 's' : ''} restante${criticalPending.length > 1 ? 's' : ''}`
                }
              </CardDescription>
            </div>
          </div>
          <Button variant="ghost" size="sm">
            {isExpanded ? '−' : '+'}
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <Progress value={percentage} className="h-2" />
          <p className="text-xs text-[#004645]/60 mt-2">
            {completedCount} sur {totalCount} étapes complétées
          </p>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-3">
          {checklist.map((item) => {
            const Icon = item.icon
            const isCompleted = item.status === 'completed'
            const isWarning = item.status === 'warning'

            return (
              <div
                key={item.id}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg transition-all",
                  isCompleted && "bg-green-50/50",
                  isWarning && "bg-orange-50/50 border border-orange-200",
                  !isCompleted && !isWarning && "bg-gray-50/50"
                )}
              >
                <div className="mt-0.5">
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : isWarning ? (
                    <AlertCircle className="h-5 w-5 text-orange-600" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-400" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className={cn(
                      "h-4 w-4",
                      isCompleted && "text-green-600",
                      isWarning && "text-orange-600",
                      !isCompleted && !isWarning && "text-gray-500"
                    )} />
                    <p className={cn(
                      "font-medium text-sm",
                      isCompleted && "text-green-900",
                      isWarning && "text-orange-900",
                      !isCompleted && !isWarning && "text-gray-700"
                    )}>
                      {item.label}
                      {item.priority === 'critical' && !isCompleted && (
                        <Badge variant="destructive" className="ml-2 text-xs">Requis</Badge>
                      )}
                    </p>
                  </div>
                  <p className="text-xs text-[#004645]/60">
                    {item.description}
                  </p>
                </div>

                {!isCompleted && item.href && (
                  <Link href={item.href}>
                    <Button size="sm" variant="outline" className={cn(
                      isWarning && "border-orange-500 text-orange-700 hover:bg-orange-50"
                    )}>
                      {item.actionLabel || 'Configurer'}
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </Link>
                )}
              </div>
            )
          })}

          {/* CTA when not ready - Quick Setup Wizard */}
          {!isReadyToLaunch && onOpenWizard && (
            <div className="mt-6 p-4 bg-gradient-to-r from-[#004645] to-[#009197] rounded-lg text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold mb-1 flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    Configuration rapide
                  </h4>
                  <p className="text-sm text-white/90">
                    Laissez-nous vous guider étape par étape pour configurer votre événement.
                  </p>
                </div>
                <Button
                  onClick={onOpenWizard}
                  variant="secondary"
                  size="sm"
                  className="bg-white text-[#004645] hover:bg-white/90"
                >
                  Démarrer
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* CTA when ready */}
          {isReadyToLaunch && (
            <div className="mt-6 p-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold mb-1">🚀 Tout est prêt !</h4>
                  <p className="text-sm text-white/90">
                    Votre événement est configuré. Envoyez vos premières invitations.
                  </p>
                </div>
                <Link href={`/admin/events/${eventId}/communications`}>
                  <Button variant="secondary" size="sm" className="bg-white text-green-700 hover:bg-white/90">
                    Envoyer
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}
