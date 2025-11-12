"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Session {
  id: string
  title: string
  type: string
  startTime: string
  endTime: string
  duration: number
  venue: string | null
  room: string | null
  speakers: any
  color: string | null
  isPublic: boolean
}

interface ProgramTimelineProps {
  eventId: string
  sessions: Session[]
  onUpdate: () => void
}

export function ProgramTimeline({ sessions }: ProgramTimelineProps) {
  const sortedSessions = [...sessions].sort((a, b) =>
    new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  )

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (sessions.length === 0) {
    return (
      <Card className="border-[#9CD9F6]/30">
        <CardContent className="py-12 text-center">
          <p className="text-[#004645]/60">Aucune session à afficher</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-[#9CD9F6]/30">
      <CardHeader>
        <CardTitle className="text-[#004645]">Timeline du programme</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedSessions.map((session) => (
            <div
              key={session.id}
              className="p-4 rounded-lg border-l-4"
              style={{ borderLeftColor: session.color || '#009197' }}
            >
              <div className="flex items-start gap-4">
                <div className="text-center min-w-[80px]">
                  <div className="text-sm font-semibold text-[#004645]">
                    {formatTime(session.startTime)}
                  </div>
                  <div className="text-xs text-[#004645]/70">
                    {session.duration} min
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-[#004645]">{session.title}</h4>
                    {!session.isPublic && (
                      <Badge variant="outline" className="text-xs">Privée</Badge>
                    )}
                  </div>
                  <div className="flex gap-4 text-sm text-[#004645]/70">
                    {session.venue && <span>=Í {session.venue}</span>}
                    {session.room && <span>=ª {session.room}</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
