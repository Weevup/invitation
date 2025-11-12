'use client'

import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar, Clock, Users, TrendingUp, Loader2 } from 'lucide-react'
import { ProgramBuilder } from '@/components/program/program-builder'
import { ProgramTimeline } from '@/components/program/program-timeline'
import { ProgramTemplates } from '@/components/program/program-templates'

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

  const [sessions, setSessions] = useState<Session[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('builder')

  useEffect(() => {
    loadSessions()
  }, [eventId])

  const loadSessions = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/admin/events/${eventId}/sessions`)
      if (response.ok) {
        const data = await response.json()
        setSessions(data)
      }
    } catch (error) {
      console.error('Error loading sessions:', error)
    } finally {
      setIsLoading(false)
    }
  }

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
    // TODO: Implement template application
    console.log('Applying template:', template)
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
