"use client"

import { RsvpTextsContent } from './RsvpTextsContent'

interface RsvpTextsSubTabProps {
  event: any
  onUpdate: () => void
}

export function RsvpTextsSubTab({ event, onUpdate }: RsvpTextsSubTabProps) {
  return <RsvpTextsContent eventId={event.id} />
}
