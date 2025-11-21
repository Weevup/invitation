"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Info, Mail, FileText, Palette, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { EmailsTab } from './tabs/EmailsTab'
import { GeneralTab } from './tabs/GeneralTab'
import { RsvpTab } from './tabs/RsvpTab'
import { AppearanceTab } from './tabs/AppearanceTab'
import { createClientLogger } from '@/lib/client-logger'

const logger = createClientLogger({ component: 'SettingsPage' })

export default function SettingsPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const eventId = params.id as string

  const [loading, setLoading] = useState(true)
  const [event, setEvent] = useState<any>(null)

  // Read initial tab from URL, default to 'emails'
  const initialTab = searchParams.get('tab') || 'emails'
  const [activeTab, setActiveTab] = useState(initialTab)

  // Read subtab from URL (for RSVP tab)
  const subtab = searchParams.get('subtab') || undefined

  useEffect(() => {
    loadEvent()
  }, [eventId])

  // Update activeTab when URL changes
  useEffect(() => {
    const urlTab = searchParams.get('tab')
    if (urlTab && urlTab !== activeTab) {
      setActiveTab(urlTab)
    }
  }, [searchParams])

  const loadEvent = async () => {
    try {
      const response = await fetch(`/api/admin/events/${eventId}`)
      if (response.ok) {
        const data = await response.json()
        setEvent(data)
      }
    } catch (error) {
      logger.error(error, { action: 'loadEvent' })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#009197]" />
      </div>
    )
  }

  if (!event) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-[#004645]/70">Événement non trouvé</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Link href={`/admin/events/${eventId}`}>
              <Button variant="ghost" size="icon" className="text-[#004645]">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-[#004645]" style={{ fontFamily: "var(--font-abril)" }}>
                Configuration
              </h1>
              <p className="text-[#004645]/70 mt-1">
                {event.name}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-[#9CD9F6]/10 p-1">
          <TabsTrigger
            value="general"
            className="data-[state=active]:bg-white data-[state=active]:text-[#004645] data-[state=active]:shadow-sm"
          >
            <Info className="h-4 w-4 mr-2" />
            Général
          </TabsTrigger>
          <TabsTrigger
            value="emails"
            className="data-[state=active]:bg-white data-[state=active]:text-[#004645] data-[state=active]:shadow-sm"
          >
            <Mail className="h-4 w-4 mr-2" />
            Emails
          </TabsTrigger>
          <TabsTrigger
            value="rsvp"
            className="data-[state=active]:bg-white data-[state=active]:text-[#004645] data-[state=active]:shadow-sm"
          >
            <FileText className="h-4 w-4 mr-2" />
            RSVP
          </TabsTrigger>
          <TabsTrigger
            value="appearance"
            className="data-[state=active]:bg-white data-[state=active]:text-[#004645] data-[state=active]:shadow-sm"
          >
            <Palette className="h-4 w-4 mr-2" />
            Apparence
          </TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general" className="space-y-6">
          <GeneralTab event={event} onUpdate={loadEvent} />
        </TabsContent>

        {/* Emails Tab */}
        <TabsContent value="emails" className="space-y-6">
          <EmailsTab event={event} onUpdate={loadEvent} />
        </TabsContent>

        {/* RSVP Tab */}
        <TabsContent value="rsvp" className="space-y-6">
          <RsvpTab event={event} onUpdate={loadEvent} initialSubTab={subtab} />
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="space-y-6">
          <AppearanceTab event={event} onUpdate={loadEvent} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
