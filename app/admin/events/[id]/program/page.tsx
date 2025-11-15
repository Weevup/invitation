'use client'

import { useParams } from 'next/navigation'
import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar, Clock, Users, TrendingUp, Loader2 } from 'lucide-react'
import { ProgramBuilder } from '@/components/program/program-builder'
import { ProgramTimeline } from '@/components/program/program-timeline'
import { ProgramTemplates } from '@/components/program/program-templates'
import { useToast } from '@/components/ui/use-toast'
import { createClientLogger } from '@/lib/client-logger'

const logger = createClientLogger({ component: 'ProgramPage' })


interface Session {
  id: string
  title: string
  description: string | null
  type: string
  status: string
  startTime: string
  endTime: string
  duration: number
  venue: string | null
  room: string | null
  capacity: number | null
  speakers: any
  color: string | null
  icon: string | null
  isPublic: boolean
  order: number
}

interface ProgramStats {
  totalSessions: number
  totalDuration: number
  publicSessions: number
  sessionsByType: { [key: string]: number }
}

export default function ProgramPage() {
  const params = useParams()
  const eventId = params.id as string
  const { toast } = useToast()

  const [sessions, setSessions] = useState<Session[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('builder')

  const loadSessions = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/admin/events/${eventId}/sessions`)
      if (response.ok) {
        const data = await response.json()
        setSessions(data.sessions || [])
      }
    } catch (error) {
      logger.error(error, { action: 'loadingSessions' })
    } finally {
      setIsLoading(false)
    }
  }, [eventId])

  useEffect(() => {
    loadSessions()
  }, [loadSessions])

  const calculateStats = (): ProgramStats => {
    const stats: ProgramStats = {
      totalSessions: sessions.length,
      totalDuration: 0,
      publicSessions: 0,
      sessionsByType: {}
    }

    sessions.forEach(session => {
      stats.totalDuration += session.duration || 0
      if (session.isPublic) stats.publicSessions++
      stats.sessionsByType[session.type] = (stats.sessionsByType[session.type] || 0) + 1
    })

    return stats
  }

  const handleApplyTemplate = async (template: any) => {
    if (!confirm(`Voulez-vous appliquer le template "${template.name}" ? Cela créera ${template.sessions.length} nouvelles sessions.`)) {
      return
    }

    try {
      // Get event details to determine start date
      const eventResponse = await fetch(`/api/admin/events/${eventId}`)
      if (!eventResponse.ok) {
        toast({
          title: 'Erreur',
          description: 'Impossible de récupérer les informations de l\'événement',
          variant: 'destructive'
        })
        return
      }
      const eventData = await eventResponse.json()

      // Use event start date or current date
      const baseDate = eventData.startDate ? new Date(eventData.startDate) : new Date()
      // Start at 9:00 AM
      baseDate.setHours(9, 0, 0, 0)

      let currentTime = new Date(baseDate)

      // Create sessions sequentially
      for (let i = 0; i < template.sessions.length; i++) {
        const sessionTemplate = template.sessions[i]
        const startTime = new Date(currentTime)
        const endTime = new Date(currentTime.getTime() + sessionTemplate.duration * 60000)

        const sessionData = {
          title: sessionTemplate.title,
          type: sessionTemplate.type,
          duration: sessionTemplate.duration,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          status: 'DRAFT',
          isPublic: true,
          timelineOrder: i
        }

        const response = await fetch(`/api/admin/events/${eventId}/sessions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sessionData)
        })

        if (!response.ok) {
          logger.error(new Error('Failed to create session'), { action: 'createSession', metadata: { sessionTitle: sessionTemplate.title } })
          toast({
            title: 'Erreur',
            description: `Erreur lors de la création de la session "${sessionTemplate.title}"`,
            variant: 'destructive'
          })
          break
        }

        // Move to next session start time
        currentTime = new Date(endTime)
      }

      // Reload sessions and switch to builder tab
      await loadSessions()

      toast({
        title: 'Template appliqué avec succès',
        description: `${template.sessions.length} sessions ont été créées à partir du template "${template.name}"`,
      })

      setActiveTab('builder')

    } catch (error) {
      logger.error(error, { action: 'applyingTemplate' })
      toast({
        title: 'Erreur',
        description: 'Erreur lors de l\'application du template',
        variant: 'destructive'
      })
    }
  }

  const stats = calculateStats()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#009197]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[#004645]">
          Programme de l&apos;evenement
        </h1>
        <p className="text-[#004645]/70">
          Creez et organisez toutes les sessions de votre evenement
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-[#9CD9F6]/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#004645]/70 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Sessions totales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#004645]">{stats.totalSessions}</div>
            <p className="text-xs text-[#004645]/60 mt-1">
              {stats.publicSessions} publiques
            </p>
          </CardContent>
        </Card>

        <Card className="border-[#9CD9F6]/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#004645]/70 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Duree totale
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#004645]">
              {Math.floor(stats.totalDuration / 60)}h{stats.totalDuration % 60}m
            </div>
            <p className="text-xs text-[#004645]/60 mt-1">
              Programme complet
            </p>
          </CardContent>
        </Card>

        <Card className="border-[#9CD9F6]/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#004645]/70 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Types de sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#004645]">
              {Object.keys(stats.sessionsByType).length}
            </div>
            <p className="text-xs text-[#004645]/60 mt-1">
              Varietes d&apos;activites
            </p>
          </CardContent>
        </Card>

        <Card className="border-[#9CD9F6]/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#004645]/70 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Completion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#004645]">
              {sessions.length > 0 ? '100' : '0'}%
            </div>
            <p className="text-xs text-[#004645]/60 mt-1">
              Programme configure
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="builder">Organisateur</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="builder" className="space-y-4">
          <ProgramBuilder
            eventId={eventId}
            sessions={sessions}
            onUpdate={loadSessions}
            onSessionsChange={setSessions}
          />
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <ProgramTimeline
            eventId={eventId}
            sessions={sessions}
            onUpdate={loadSessions}
          />
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <ProgramTemplates
            eventId={eventId}
            onApply={handleApplyTemplate}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
