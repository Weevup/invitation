"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Settings, List, FileText, Eye } from 'lucide-react'
import { RsvpConfigurationSubTab } from './rsvp-subtabs/RsvpConfigurationSubTab'
import { RsvpStepsSubTab } from './rsvp-subtabs/RsvpStepsSubTab'
import { RsvpTextsSubTab } from './rsvp-subtabs/RsvpTextsSubTab'
import { RsvpPreviewSubTab } from './rsvp-subtabs/RsvpPreviewSubTab'

interface RsvpTabProps {
  event: any
  onUpdate: () => void
}

export function RsvpTab({ event, onUpdate }: RsvpTabProps) {
  const [activeSubTab, setActiveSubTab] = useState('configuration')

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-[#009197]/30 bg-gradient-to-r from-[#009197]/5 to-white">
        <CardHeader>
          <CardTitle className="text-[#004645]">Formulaire RSVP</CardTitle>
          <CardDescription>
            Configuration complète : champs, étapes, textes et aperçu en un seul endroit
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Sub-tabs */}
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-[#9CD9F6]/10 p-1">
          <TabsTrigger
            value="configuration"
            className="data-[state=active]:bg-white data-[state=active]:text-[#004645] data-[state=active]:shadow-sm"
          >
            <Settings className="h-4 w-4 mr-2" />
            Configuration
          </TabsTrigger>
          <TabsTrigger
            value="steps"
            className="data-[state=active]:bg-white data-[state=active]:text-[#004645] data-[state=active]:shadow-sm"
          >
            <List className="h-4 w-4 mr-2" />
            Étapes
          </TabsTrigger>
          <TabsTrigger
            value="texts"
            className="data-[state=active]:bg-white data-[state=active]:text-[#004645] data-[state=active]:shadow-sm"
          >
            <FileText className="h-4 w-4 mr-2" />
            Textes
          </TabsTrigger>
          <TabsTrigger
            value="preview"
            className="data-[state=active]:bg-white data-[state=active]:text-[#004645] data-[state=active]:shadow-sm"
          >
            <Eye className="h-4 w-4 mr-2" />
            Aperçu
          </TabsTrigger>
        </TabsList>

        {/* Configuration Sub-tab */}
        <TabsContent value="configuration" className="space-y-6">
          <RsvpConfigurationSubTab event={event} onUpdate={onUpdate} />
        </TabsContent>

        {/* Steps Sub-tab */}
        <TabsContent value="steps" className="space-y-6">
          <RsvpStepsSubTab event={event} onUpdate={onUpdate} />
        </TabsContent>

        {/* Texts Sub-tab */}
        <TabsContent value="texts" className="space-y-6">
          <RsvpTextsSubTab event={event} onUpdate={onUpdate} />
        </TabsContent>

        {/* Preview Sub-tab */}
        <TabsContent value="preview" className="space-y-6">
          <RsvpPreviewSubTab event={event} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
