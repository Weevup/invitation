"use client"

import { RsvpStepsContent } from './RsvpStepsContent'

interface RsvpStepsSubTabProps {
  event: any
  onUpdate: () => void
}

export function RsvpStepsSubTab({ event, onUpdate }: RsvpStepsSubTabProps) {
  return <RsvpStepsContent eventId={event.id} />
}
