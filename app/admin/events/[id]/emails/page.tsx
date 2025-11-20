"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Mail,
  Calendar,
  Send,
  CheckCircle2,
  Clock,
  BarChart3,
  Settings,
  Plus,
  Edit,
  Eye,
  Loader2,
  AlertCircle,
  TrendingUp,
  Users,
  MousePointerClick
} from 'lucide-react'
import { toast } from 'sonner'
import { createClientLogger } from '@/lib/client-logger'

const logger = createClientLogger({ component: 'EmailsHubPage' })

interface EmailTypeStatus {
  type: 'SAVE_THE_DATE' | 'INVITE' | 'CONFIRMATION' | 'REMINDER'
  label: string
  description: string
  icon: any
  color: string
  hasTemplate: boolean
  isActive: boolean
  sentCount: number
  openRate?: number
  clickRate?: number
}

export default function EmailsHubPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.id as string

  const [loading, setLoading] = useState(true)
  const [emailTypes, setEmailTypes] = useState<EmailTypeStatus[]>([])
  const [analytics, setAnalytics] = useState({
    totalSent: 0,
    totalOpened: 0,
    totalClicked: 0,
    avgOpenRate: 0,
    avgClickRate: 0
  })

  useEffect(() => {
    loadEmailStatus()
  }, [eventId])

  const loadEmailStatus = async () => {
    try {
      setLoading(true)

      // Fetch templates
      const templatesRes = await fetch(`/api/admin/templates?eventId=${eventId}`)
      const templates = templatesRes.ok ? await templatesRes.json() : []

      // Fetch email analytics
      const analyticsRes = await fetch(`/api/admin/events/${eventId}/email-analytics`)
      const analyticsData = analyticsRes.ok ? await analyticsRes.json() : null

      // Build status for each email type
      const types: EmailTypeStatus[] = [
        {
          type: 'SAVE_THE_DATE',
          label: 'Save the Date',
          description: 'Pré-annonce de l\'événement pour réserver la date',
          icon: Calendar,
          color: 'blue',
          hasTemplate: templates.some((t: any) => t.type === 'SAVE_THE_DATE'),
          isActive: templates.some((t: any) => t.type === 'SAVE_THE_DATE' && t.isActive),
          sentCount: parseInt(analyticsData?.statsByType?.SAVE_THE_DATE?.sent || '0'),
          openRate: parseFloat(analyticsData?.statsByType?.SAVE_THE_DATE?.openRate || '0'),
          clickRate: parseFloat(analyticsData?.statsByType?.SAVE_THE_DATE?.clickRate || '0'),
        },
        {
          type: 'INVITE',
          label: 'Invitation',
          description: 'Invitation officielle avec lien RSVP',
          icon: Mail,
          color: 'purple',
          hasTemplate: templates.some((t: any) => t.type === 'INVITE' || t.type === 'INVITATION'),
          isActive: templates.some((t: any) => (t.type === 'INVITE' || t.type === 'INVITATION') && t.isActive),
          sentCount: parseInt(analyticsData?.statsByType?.INVITE?.sent || analyticsData?.statsByType?.INVITATION?.sent || '0'),
          openRate: parseFloat(analyticsData?.statsByType?.INVITE?.openRate || analyticsData?.statsByType?.INVITATION?.openRate || '0'),
          clickRate: parseFloat(analyticsData?.statsByType?.INVITE?.clickRate || analyticsData?.statsByType?.INVITATION?.clickRate || '0'),
        },
        {
          type: 'CONFIRMATION',
          label: 'Confirmation RSVP',
          description: 'Email automatique après confirmation de présence',
          icon: CheckCircle2,
          color: 'green',
          hasTemplate: templates.some((t: any) => t.type === 'CONFIRMATION'),
          isActive: templates.some((t: any) => t.type === 'CONFIRMATION' && t.isActive),
          sentCount: parseInt(analyticsData?.statsByType?.CONFIRMATION?.sent || '0'),
          openRate: parseFloat(analyticsData?.statsByType?.CONFIRMATION?.openRate || '0'),
          clickRate: parseFloat(analyticsData?.statsByType?.CONFIRMATION?.clickRate || '0'),
        },
        {
          type: 'REMINDER',
          label: 'Rappel',
          description: 'Rappel avant l\'événement (J-7, J-1, etc.)',
          icon: Clock,
          color: 'orange',
          hasTemplate: templates.some((t: any) => t.type === 'REMINDER'),
          isActive: templates.some((t: any) => t.type === 'REMINDER' && t.isActive),
          sentCount: parseInt(analyticsData?.statsByType?.REMINDER?.sent || '0'),
          openRate: parseFloat(analyticsData?.statsByType?.REMINDER?.openRate || '0'),
          clickRate: parseFloat(analyticsData?.statsByType?.REMINDER?.clickRate || '0'),
        },
      ]

      setEmailTypes(types)

      // Calculate global analytics from overview
      if (analyticsData?.overview) {
        setAnalytics({
          totalSent: analyticsData.overview.totalSent || 0,
          totalOpened: analyticsData.overview.totalOpened || 0,
          totalClicked: analyticsData.overview.totalClicked || 0,
          avgOpenRate: parseFloat(analyticsData.overview.openRate || '0'),
          avgClickRate: parseFloat(analyticsData.overview.clickRate || '0'),
        })
      }

    } catch (error) {
      logger.error({ error }, 'Error loading email status')
      toast.error('Erreur lors du chargement des emails')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (emailType: EmailTypeStatus) => {
    if (!emailType.hasTemplate) {
      return <Badge variant="outline" className="bg-gray-100">Non configuré</Badge>
    }
    if (emailType.isActive) {
      return <Badge variant="default" className="bg-green-600">Actif</Badge>
    }
    return <Badge variant="secondary">Brouillon</Badge>
  }

  const navigateToEditor = (type: string) => {
    const routes: Record<string, string> = {
      'SAVE_THE_DATE': `/admin/events/${eventId}/save-the-date`,
      'INVITE': `/admin/events/${eventId}/invitation`,
      'CONFIRMATION': `/admin/events/${eventId}/confirmation-email`,
      'REMINDER': `/admin/events/${eventId}/reminders`,
    }
    router.push(routes[type] || `/admin/events/${eventId}/emails`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Gestion des Emails</h1>
        <p className="text-muted-foreground mt-2">
          Configurez et gérez tous vos emails événementiels depuis un seul endroit
        </p>
      </div>

      {/* Global Analytics */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total envoyé</CardDescription>
            <CardTitle className="text-3xl">{analytics.totalSent}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-xs text-muted-foreground">
              <Send className="h-4 w-4 mr-1" />
              Tous types confondus
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total ouvert</CardDescription>
            <CardTitle className="text-3xl">{analytics.totalOpened}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-xs text-muted-foreground">
              <Eye className="h-4 w-4 mr-1" />
              Emails lus
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total cliqué</CardDescription>
            <CardTitle className="text-3xl">{analytics.totalClicked}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-xs text-muted-foreground">
              <MousePointerClick className="h-4 w-4 mr-1" />
              Liens cliqués
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Taux d'ouverture</CardDescription>
            <CardTitle className="text-3xl">{analytics.avgOpenRate.toFixed(0)}%</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-4 w-4 mr-1" />
              Moyenne globale
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Taux de clic</CardDescription>
            <CardTitle className="text-3xl">{analytics.avgClickRate.toFixed(0)}%</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-xs text-muted-foreground">
              <MousePointerClick className="h-4 w-4 mr-1" />
              Engagement moyen
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Email Types Grid */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Tous les emails</TabsTrigger>
          <TabsTrigger value="configured">Configurés ({emailTypes.filter(t => t.hasTemplate).length})</TabsTrigger>
          <TabsTrigger value="active">Actifs ({emailTypes.filter(t => t.isActive).length})</TabsTrigger>
          <TabsTrigger value="missing">Non configurés ({emailTypes.filter(t => !t.hasTemplate).length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {emailTypes.map((emailType) => (
              <EmailTypeCard
                key={emailType.type}
                emailType={emailType}
                onEdit={() => navigateToEditor(emailType.type)}
                statusBadge={getStatusBadge(emailType)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="configured" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {emailTypes.filter(t => t.hasTemplate).map((emailType) => (
              <EmailTypeCard
                key={emailType.type}
                emailType={emailType}
                onEdit={() => navigateToEditor(emailType.type)}
                statusBadge={getStatusBadge(emailType)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {emailTypes.filter(t => t.isActive).map((emailType) => (
              <EmailTypeCard
                key={emailType.type}
                emailType={emailType}
                onEdit={() => navigateToEditor(emailType.type)}
                statusBadge={getStatusBadge(emailType)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="missing" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {emailTypes.filter(t => !t.hasTemplate).map((emailType) => (
              <EmailTypeCard
                key={emailType.type}
                emailType={emailType}
                onEdit={() => navigateToEditor(emailType.type)}
                statusBadge={getStatusBadge(emailType)}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Actions rapides
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/admin/events/${eventId}/email-analytics`)}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Voir analytics détaillées
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/admin/settings/integrations`)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Configurer intégrations
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/admin/events/${eventId}/campaigns`)}
          >
            <Send className="h-4 w-4 mr-2" />
            Campagnes d'envoi
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

function EmailTypeCard({
  emailType,
  onEdit,
  statusBadge
}: {
  emailType: EmailTypeStatus
  onEdit: () => void
  statusBadge: React.ReactNode
}) {
  const Icon = emailType.icon
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-700',
    purple: 'bg-purple-100 text-purple-700',
    green: 'bg-green-100 text-green-700',
    orange: 'bg-orange-100 text-orange-700',
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${colorClasses[emailType.color as keyof typeof colorClasses]}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg">{emailType.label}</CardTitle>
              <CardDescription className="text-sm mt-1">
                {emailType.description}
              </CardDescription>
            </div>
          </div>
          {statusBadge}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats */}
        {emailType.sentCount > 0 ? (
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div>
              <div className="text-muted-foreground text-xs">Envoyés</div>
              <div className="font-semibold">{emailType.sentCount}</div>
            </div>
            {emailType.openRate !== undefined && (
              <div>
                <div className="text-muted-foreground text-xs">Ouverture</div>
                <div className="font-semibold">{emailType.openRate.toFixed(0)}%</div>
              </div>
            )}
            {emailType.clickRate !== undefined && (
              <div>
                <div className="text-muted-foreground text-xs">Clics</div>
                <div className="font-semibold">{emailType.clickRate.toFixed(0)}%</div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Aucun email envoyé pour le moment
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={onEdit}
            variant={emailType.hasTemplate ? 'default' : 'outline'}
            size="sm"
            className="flex-1"
          >
            {emailType.hasTemplate ? (
              <>
                <Edit className="h-4 w-4 mr-2" />
                Modifier
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Créer
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
