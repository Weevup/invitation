"use client"

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function RsvpStepsRedirect() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.id as string

  useEffect(() => {
    // Redirect to the new unified Settings page, RSVP tab, Steps sub-tab
    router.replace(`/admin/events/${eventId}/settings?tab=rsvp&subtab=steps`)
  }, [eventId, router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-[#009197] mx-auto" />
        <p className="text-[#004645]">Redirection vers l'éditeur d'étapes dans la nouvelle interface...</p>
      </div>
    </div>
  )
}
