"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  MousePointerClick,
  Sparkles,
  Filter,
  X,
  TestTube
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
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
  const [timelineData, setTimelineData] = useState<any[]>([])
  const [dateRange, setDateRange] = useState<'7' | '30' | '90' | 'all'>('30')
  const [previewTemplate, setPreviewTemplate] = useState<any>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [showTestDialog, setShowTestDialog] = useState(false)
  const [testEmailAddress, setTestEmailAddress] = useState('')
  const [testEmailType, setTestEmailType] = useState('')
  const [sendingTest, setSendingTest] = useState(false)
  const [insights, setInsights] = useState({
    bestPerformingType: '',
    worstPerformingType: '',
    avgHoursToOpen: 0,
    trendDirection: 'stable' as 'up' | 'down' | 'stable'
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

      // Set timeline data
      if (analyticsData?.timeline) {
        setTimelineData(analyticsData.timeline)
      }

      // Calculate insights
      if (analyticsData?.statsByType && analyticsData?.overview) {
        const typesWithData = Object.entries(analyticsData.statsByType)
          .filter(([_, stats]: [string, any]) => stats.sent > 0)
          .map(([type, stats]: [string, any]) => ({
            type,
            openRate: parseFloat(stats.openRate || '0')
          }))
          .sort((a, b) => b.openRate - a.openRate)

        setInsights({
          bestPerformingType: typesWithData[0]?.type || '',
          worstPerformingType: typesWithData[typesWithData.length - 1]?.type || '',
          avgHoursToOpen: parseFloat(analyticsData.overview.avgHoursToOpen || '0'),
          trendDirection: calculateTrend(analyticsData.timeline)
        })
      }

    } catch (error) {
      logger.error({ error: error instanceof Error ? error.message : String(error) }, 'Error loading email status')
      toast.error('Erreur lors du chargement des emails')
    } finally {
      setLoading(false)
    }
  }

  const calculateTrend = (timeline: any[]) => {
    if (!timeline || timeline.length < 2) return 'stable'
    const recent = timeline.slice(-7) // Last 7 days
    const older = timeline.slice(-14, -7) // Previous 7 days
    const recentAvg = recent.reduce((sum, d) => sum + d.sent, 0) / recent.length
    const olderAvg = older.reduce((sum, d) => sum + d.sent, 0) / older.length
    if (recentAvg > olderAvg * 1.1) return 'up'
    if (recentAvg < olderAvg * 0.9) return 'down'
    return 'stable'
  }

  const handlePreviewTemplate = async (type: string) => {
    try {
      const res = await fetch(`/api/admin/templates?eventId=${eventId}&type=${type}`)
      const templates = await res.json()
      if (templates.length > 0) {
        setPreviewTemplate(templates[0])
        setShowPreview(true)
      } else {
        toast.info('Aucun template à prévisualiser')
      }
    } catch (error) {
      toast.error('Erreur lors du chargement du template')
    }
  }

  const handleOpenTestDialog = (type: string) => {
    setTestEmailType(type)
    setShowTestDialog(true)
  }

  const handleSendTestEmail = async () => {
    if (!testEmailAddress || !testEmailType) {
      toast.error('Veuillez saisir une adresse email')
      return
    }

    setSendingTest(true)
    try {
      const res = await fetch(`/api/admin/events/${eventId}/test-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testEmail: testEmailAddress,
          templateType: testEmailType
        })
      })

      const data = await res.json()

      if (res.ok) {
        toast.success(`Email de test envoyé à ${testEmailAddress} !`)
        setShowTestDialog(false)
        setTestEmailAddress('')
      } else {
        toast.error(data.error || 'Erreur lors de l\'envoi')
      }
    } catch (error) {
      toast.error('Erreur lors de l\'envoi du test')
    } finally {
      setSendingTest(false)
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Emails</h1>
          <p className="text-muted-foreground mt-2">
            Configurez et gérez tous vos emails événementiels depuis un seul endroit
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={(v: any) => setDateRange(v)}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 derniers jours</SelectItem>
              <SelectItem value="30">30 derniers jours</SelectItem>
              <SelectItem value="90">90 derniers jours</SelectItem>
              <SelectItem value="all">Tout l'historique</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Performance Insights */}
      {(insights.bestPerformingType || insights.avgHoursToOpen > 0) && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Meilleure performance</CardDescription>
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-yellow-500" />
                {insights.bestPerformingType || 'N/A'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Type d'email avec le meilleur taux d'ouverture</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Temps d'ouverture moyen</CardDescription>
              <CardTitle className="text-lg">{insights.avgHoursToOpen.toFixed(1)}h</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Délai moyen entre envoi et ouverture</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Tendance</CardDescription>
              <CardTitle className="text-lg flex items-center gap-2">
                {insights.trendDirection === 'up' && <TrendingUp className="h-5 w-5 text-green-500" />}
                {insights.trendDirection === 'down' && <TrendingUp className="h-5 w-5 text-red-500 rotate-180" />}
                {insights.trendDirection === 'stable' && <span className="text-orange-500">→</span>}
                {insights.trendDirection === 'up' ? 'En hausse' : insights.trendDirection === 'down' ? 'En baisse' : 'Stable'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Évolution des envois (7 derniers jours)</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Timeline Chart */}
      {timelineData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Évolution des Emails</CardTitle>
            <CardDescription>Envois, ouvertures et clics au fil du temps</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => new Date(date).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })}
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(date) => new Date(date).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                />
                <Legend />
                <Line type="monotone" dataKey="sent" stroke="#8884d8" name="Envoyés" strokeWidth={2} />
                <Line type="monotone" dataKey="opened" stroke="#82ca9d" name="Ouverts" strokeWidth={2} />
                <Line type="monotone" dataKey="clicked" stroke="#ffc658" name="Cliqués" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

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
                onPreview={() => handlePreviewTemplate(emailType.type)}
                onTest={() => handleOpenTestDialog(emailType.type)}
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
                onPreview={() => handlePreviewTemplate(emailType.type)}
                onTest={() => handleOpenTestDialog(emailType.type)}
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
                onPreview={() => handlePreviewTemplate(emailType.type)}
                onTest={() => handleOpenTestDialog(emailType.type)}
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
                onPreview={() => handlePreviewTemplate(emailType.type)}
                onTest={() => handleOpenTestDialog(emailType.type)}
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

      {/* Preview Modal */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Prévisualisation du Template
            </DialogTitle>
            <DialogDescription>
              {previewTemplate?.name || 'Template Email'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {previewTemplate && (
              <>
                <div className="border rounded-lg p-4 bg-muted/50">
                  <p className="text-sm font-semibold mb-2">Sujet :</p>
                  <p className="text-sm">{previewTemplate.subject}</p>
                </div>
                <div className="border rounded-lg overflow-hidden">
                  <div
                    className="p-6"
                    dangerouslySetInnerHTML={{ __html: previewTemplate.htmlContent || '' }}
                    style={{
                      fontFamily: previewTemplate.fontFamily || 'Arial, sans-serif',
                      backgroundColor: '#ffffff'
                    }}
                  />
                </div>
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <span>Type: {previewTemplate.type}</span>
                  <span>Dernière modification: {new Date(previewTemplate.updatedAt).toLocaleDateString('fr-FR')}</span>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Test Email Dialog */}
      <Dialog open={showTestDialog} onOpenChange={setShowTestDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TestTube className="h-5 w-5" />
              Envoyer un Email de Test
            </DialogTitle>
            <DialogDescription>
              Type: {testEmailType}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="testEmail">Adresse email</Label>
              <Input
                id="testEmail"
                type="email"
                placeholder="test@example.com"
                value={testEmailAddress}
                onChange={(e) => setTestEmailAddress(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && testEmailAddress) {
                    handleSendTestEmail()
                  }
                }}
              />
              <p className="text-xs text-muted-foreground mt-2">
                L'email contiendra des données de test pour prévisualiser le rendu
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowTestDialog(false)
                setTestEmailAddress('')
              }}
            >
              Annuler
            </Button>
            <Button
              onClick={handleSendTestEmail}
              disabled={sendingTest || !testEmailAddress}
            >
              {sendingTest ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Envoi...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Envoyer
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function EmailTypeCard({
  emailType,
  onEdit,
  onPreview,
  onTest,
  statusBadge
}: {
  emailType: EmailTypeStatus
  onEdit: () => void
  onPreview?: () => void
  onTest?: () => void
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
          {emailType.hasTemplate && onPreview && (
            <Button
              onClick={onPreview}
              variant="outline"
              size="sm"
              title="Prévisualiser"
            >
              <Eye className="h-4 w-4" />
            </Button>
          )}
          {emailType.hasTemplate && onTest && (
            <Button
              onClick={onTest}
              variant="outline"
              size="sm"
              title="Envoyer un test"
            >
              <TestTube className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
