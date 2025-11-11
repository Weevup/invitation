"use client"

import { ModuleManager } from '@/components/modules/module-manager'
import { useParams } from 'next/navigation'

export default function ModulesPage() {
  const params = useParams()
  const eventId = params.id as string

  return (
    <div className="container mx-auto py-8 px-4">
      <ModuleManager eventId={eventId} />
    </div>
  )
}
