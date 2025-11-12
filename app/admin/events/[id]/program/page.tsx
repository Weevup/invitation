"use client"

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProgramBuilder } from '@/components/program/program-builder'
import { ProgramTimeline } from '@/components/program/program-timeline'
import { ProgramTemplates } from '@/components/program/program-templates'
import { Calendar, Layout, Wand2, Download, Upload } from 'lucide-react'

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

export default function ProgramPage() {
  const params = useParams()
  const eventId = params.id as string
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [activeView, setActiveView] = useState<'builder' | 'timeline' | 'templates'>('builder')

  const fetchSessions = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/events/${eventId}/sessions`)
      if (response.ok) {
        const data = await response.json()
        setSessions(data.sessions || [])
      }
    } catch (error) {
      console.error('Error fetching sessions:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSessions()
  }, [eventId])

  const handleExport = () => {
    const dataStr = JSON.stringify(sessions, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `programme-${eventId}.json`
    link.click()
  }

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target?.result as string)
          setSessions(imported)
        } catch (error) {
          console.error('Error importing program:', error)
        }
      }
      reader.readAsText(file)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#004645]" style={{ fontFamily: "var(--font-abril)" }}>
            Programme de l&apos;événement
          </h1>
          <p className="text-[#004645]/70 mt-1">
            Créez et organisez le programme complet de votre événement
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleExport}
            className="border-[#009197] text-[#009197] hover:bg-[#009197]/10"
          >
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          <label htmlFor="import-program">
            <Button
              variant="outline"
              className="border-[#009197] text-[#009197] hover:bg-[#009197]/10"
              asChild
            >
              <span>
                <Upload className="h-4 w-4 mr-2" />
                Importer
              </span>
            </Button>
            <input
              id="import-program"
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImport}
            />
          </label>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-[#9CD9F6]/30 bg-gradient-to-br from-[#009197]/5 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#004645]/70">Sessions totales</p>
                <p className="text-2xl font-bold text-[#004645]">{sessions.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-[#009197]" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#9CD9F6]/30 bg-gradient-to-br from-[#FF4713]/5 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#004645]/70">Durée totale</p>
                <p className="text-2xl font-bold text-[#004645]">
                  {Math.floor(sessions.reduce((acc, s) => acc + s.duration, 0) / 60)}h
                </p>
              </div>
              <Layout className="h-8 w-8 text-[#FF4713]" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#9CD9F6]/30 bg-gradient-to-br from-purple-500/5 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#004645]/70">Intervenants</p>
                <p className="text-2xl font-bold text-[#004645]">
                  {sessions.filter(s => s.speakers && Array.isArray(s.speakers) && s.speakers.length > 0).length}
                </p>
              </div>
              <Wand2 className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#9CD9F6]/30 bg-gradient-to-br from-green-500/5 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#004645]/70">Publiques</p>
                <p className="text-2xl font-bold text-[#004645]">
                  {sessions.filter(s => s.isPublic).length}
                </p>
              </div>
              <Layout className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeView} onValueChange={(v) => setActiveView(v as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-[#9CD9F6]/20">
          <TabsTrigger value="builder">
            <Layout className="h-4 w-4 mr-2" />
            Constructeur
          </TabsTrigger>
          <TabsTrigger value="timeline">
            <Calendar className="h-4 w-4 mr-2" />
            Timeline
          </TabsTrigger>
          <TabsTrigger value="templates">
            <Wand2 className="h-4 w-4 mr-2" />
            Templates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="builder" className="mt-6">
          <ProgramBuilder
            eventId={eventId}
            sessions={sessions}
            onUpdate={fetchSessions}
          />
        </TabsContent>

        <TabsContent value="timeline" className="mt-6">
          <ProgramTimeline
            eventId={eventId}
            sessions={sessions}
            onUpdate={fetchSessions}
          />
        </TabsContent>

        <TabsContent value="templates" className="mt-6">
          <ProgramTemplates
            eventId={eventId}
            onApply={(template) => {
              // Appliquer le template
              fetchSessions()
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
