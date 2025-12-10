"use client"

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Mail, Users, Clock, Send, CheckCircle, Sparkles, Bell, Megaphone, BarChart3, ArrowRight, QrCode, UserCheck, UtensilsCrossed, XCircle, TestTube, Eye, TrendingUp, Calendar, PlayCircle, AlertCircle, CheckCheck, Settings2, Repeat, Edit
} from 'lucide-react'
import Link from 'next/link'
import { AddGuestDialog } from '@/components/add-guest-dialog'
import { ImportCSVDialog } from '@/components/import-csv-dialog'
import { SendInvitationsDialog } from '@/components/send-invitations-dialog'
import { ModuleSelector } from '@/components/admin/module-selector'
import { EventLaunchChecklist } from '@/components/admin/event-launch-checklist'
import { OnboardingWizard } from '@/components/admin/onboarding-wizard'
import { createClientLogger } from '@/lib/client-logger'

const logger = createClientLogger({ component: 'Page' })


interface EventStats {
  totalGuests: number
  totalRsvps: number
  respondedGuests: number
  attendingGuests: number
  decliningGuests: number
  checkedInGuests: number
  totalPlusOnes: number
  totalExpected: number
}

interface EventDetails {
  id: string
  name: string
  stats: EventStats
}

export default function EventOverviewPage() {
  const params = useParams()
  const eventId = params.id as string

  const [event, setEvent] = useState<EventDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [showWizard, setShowWizard] = useState(false)

  const fetchEvent = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/events/${eventId}`)
      if (response.ok) {
        const data = await response.json()
        setEvent(data)
      }
    } catch (error) {
      logger.error(error, { action: 'fetchingEvent' })
    } finally {
      setLoading(false)
    }
  }, [eventId])

  useEffect(() => {
    fetchEvent()
  }, [fetchEvent])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Sparkles className="h-12 w-12 text-[#009197] mx-auto mb-4 animate-pulse" />
          <p className="text-[#004645]/70">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur">
        <CardContent className="pt-6">
          <p className="text-center text-[#004645]/70">Événement non trouvé</p>
        </CardContent>
      </Card>
    )
  }

  // OPTIMISÉ: Utiliser les stats pré-calculées de l'API au lieu de filtrer manuellement
  const {
    totalGuests,
    respondedGuests,
    attendingGuests,
    decliningGuests,
    checkedInGuests,
    totalPlusOnes,
    totalExpected,
  } = event.stats

  return (
    <div className="space-y-8">
      {/* Launch Checklist - Phase 1 Quick Win */}
      <EventLaunchChecklist
        eventId={eventId}
        totalGuests={totalGuests}
        onOpenWizard={() => setShowWizard(true)}
      />

      {/* Campagnes d'Emails - Vue Compacte */}
      <Card className="border-[#004645]/30 bg-gradient-to-br from-white via-[#009197]/5 to-white backdrop-blur">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-gradient-to-br from-[#004645] to-[#009197]">
                <Mail className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-[#004645]" style={{ fontFamily: "var(--font-abril)" }}>
                  Campagnes d&apos;Emails
                </CardTitle>
                <CardDescription className="text-[#004645]/70">
                  Gérez vos 5 phases de communication
                </CardDescription>
              </div>
            </div>
            <Link href={`/admin/events/${eventId}/settings?tab=emails`}>
              <Button className="bg-gradient-to-r from-[#004645] to-[#009197] hover:from-[#006C51] hover:to-[#009197] text-white">
                <Settings2 className="h-4 w-4 mr-2" />
                ⚙️ Configuration Complète
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-3">
            {/* Phase 1: Save the Date */}
            <div className="p-3 rounded-lg border border-[#FF4713]/30 bg-[#FF4713]/5 text-center">
              <Bell className="h-5 w-5 text-[#FF4713] mx-auto mb-2" />
              <p className="text-xs font-medium text-[#004645] mb-1">Save the Date</p>
              <Badge variant="secondary" className="text-[10px]">Optionnel</Badge>
            </div>

            {/* Phase 2: Invitation */}
            <div className="p-3 rounded-lg border border-[#009197]/30 bg-[#009197]/5 text-center">
              <Sparkles className="h-5 w-5 text-[#009197] mx-auto mb-2" />
              <p className="text-xs font-medium text-[#004645] mb-1">Invitation</p>
              <Badge className="text-[10px] bg-[#009197]">Critique</Badge>
            </div>

            {/* Phase 3: Relance */}
            <div className="p-3 rounded-lg border border-orange-500/30 bg-orange-50/50 text-center">
              <Repeat className="h-5 w-5 text-orange-500 mx-auto mb-2" />
              <p className="text-xs font-medium text-[#004645] mb-1">Relances</p>
              <Badge variant="secondary" className="text-[10px] bg-orange-100 text-orange-800">
                {totalGuests - respondedGuests} en attente
              </Badge>
            </div>

            {/* Phase 4: Confirmation */}
            <div className="p-3 rounded-lg border border-green-500/30 bg-green-50/50 text-center">
              <CheckCheck className="h-5 w-5 text-green-600 mx-auto mb-2" />
              <p className="text-xs font-medium text-[#004645] mb-1">Confirmation</p>
              <Badge variant="secondary" className="text-[10px] bg-green-100 text-green-800">Auto</Badge>
            </div>

            {/* Phase 5: Rappel J-1 */}
            <div className="p-3 rounded-lg border border-blue-500/30 bg-blue-50/50 text-center">
              <Clock className="h-5 w-5 text-blue-600 mx-auto mb-2" />
              <p className="text-xs font-medium text-[#004645] mb-1">Rappel J-1</p>
              <Badge variant="secondary" className="text-[10px] bg-blue-100 text-blue-800">Final</Badge>
            </div>
          </div>

          {/* Actions Rapides */}
          <div className="flex gap-2 mt-4 pt-4 border-t border-[#9CD9F6]/30">
            <SendInvitationsDialog
              eventId={eventId}
              totalGuests={totalGuests}
              pendingGuests={totalGuests - respondedGuests}
              confirmedGuests={attendingGuests}
            />
            <Link href={`/admin/events/${eventId}/communications?type=reminder`}>
              <Button size="sm" variant="outline" className="border-orange-500 text-orange-600 hover:bg-orange-500 hover:text-white">
                <Repeat className="h-3 w-3 mr-2" />
                Relancer ({totalGuests - respondedGuests})
              </Button>
            </Link>
            <Link href={`/admin/events/${eventId}/emails`}>
              <Button size="sm" variant="outline" className="border-[#009197] text-[#009197] hover:bg-[#009197] hover:text-white">
                <TestTube className="h-3 w-3 mr-2" />
                Tester un email
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
      {/* Stats - Row 1: Invitations */}
      <div>
        <h2 className="text-xl font-bold text-[#004645] mb-4" style={{ fontFamily: "var(--font-abril)" }}>
          Statistiques d&apos;invitations
        </h2>
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#004645]">Total invités</CardTitle>
              <Users className="h-4 w-4 text-[#009197]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#004645]" style={{ fontFamily: "var(--font-abril)" }}>
                {totalGuests}
              </div>
              <Link href={`/admin/events/${eventId}/guests`}>
                <Button variant="link" size="sm" className="text-xs text-[#009197] p-0 h-auto mt-1">
                  Voir la liste →
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#004645]">Réponses</CardTitle>
              <Mail className="h-4 w-4 text-[#009197]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#004645]" style={{ fontFamily: "var(--font-avril)" }}>
                {respondedGuests}
              </div>
              <p className="text-xs text-[#004645]/70">
                {totalGuests > 0
                  ? Math.round((respondedGuests / totalGuests) * 100)
                  : 0}
                % du total
              </p>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50/80 backdrop-blur hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#004645]">Confirmés</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600" style={{ fontFamily: "var(--font-abril)" }}>
                {attendingGuests}
              </div>
              <p className="text-xs text-[#004645]/70">
                {respondedGuests > 0
                  ? Math.round((attendingGuests / respondedGuests) * 100)
                  : 0}
                % des réponses
              </p>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-red-50/80 backdrop-blur hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#004645]">Déclinés</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600" style={{ fontFamily: "var(--font-abril)" }}>
                {decliningGuests}
              </div>
              <p className="text-xs text-[#004645]/70">
                {respondedGuests > 0
                  ? Math.round((decliningGuests / respondedGuests) * 100)
                  : 0}
                % des réponses
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Stats - Row 2: Event Day */}
      <div>
        <h2 className="text-xl font-bold text-[#004645] mb-4" style={{ fontFamily: "var(--font-abril)" }}>
          Jour de l&apos;événement
        </h2>
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="border-[#009197]/30 bg-[#009197]/5 backdrop-blur hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#004645]">Attendus</CardTitle>
              <Users className="h-4 w-4 text-[#009197]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#009197]" style={{ fontFamily: "var(--font-abril)" }}>
                {totalExpected}
              </div>
              <p className="text-xs text-[#004645]/70">
                {attendingGuests} invités + {totalPlusOnes} accompagnants
              </p>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50/80 backdrop-blur hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#004645]">Enregistrés</CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600" style={{ fontFamily: "var(--font-abril)" }}>
                {checkedInGuests}
              </div>
              <p className="text-xs text-[#004645]/70">
                {attendingGuests > 0
                  ? Math.round((checkedInGuests / attendingGuests) * 100)
                  : 0}
                % des confirmés
              </p>
              <Link href={`/admin/events/${eventId}/checkin`}>
                <Button variant="link" size="sm" className="text-xs text-green-600 p-0 h-auto mt-1">
                  Voir check-in →
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-orange-50/80 backdrop-blur hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#004645]">En attente</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600" style={{ fontFamily: "var(--font-abril)" }}>
                {attendingGuests - checkedInGuests}
              </div>
              <p className="text-xs text-[#004645]/70">
                Confirmés non enregistrés
              </p>
            </CardContent>
          </Card>

          <Card className="border-[#FF4713]/30 bg-[#FF4713]/5 backdrop-blur hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#004645]">Sans réponse</CardTitle>
              <Mail className="h-4 w-4 text-[#FF4713]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#FF4713]" style={{ fontFamily: "var(--font-abril)" }}>
                {totalGuests - respondedGuests}
              </div>
              <p className="text-xs text-[#004645]/70">
                {totalGuests > 0
                  ? Math.round(((totalGuests - respondedGuests) / totalGuests) * 100)
                  : 0}
                % du total
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Guide rapide - Étapes numérotées */}
      <Card className="border-[#FF4713]/30 bg-gradient-to-br from-[#FF4713]/5 to-white/80 backdrop-blur">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-[#FF4713]" />
            <div>
              <CardTitle className="text-[#004645]" style={{ fontFamily: "var(--font-abril)" }}>
                Guide rapide
              </CardTitle>
              <CardDescription className="text-[#004645]/70">
                Suivez ces 5 étapes pour gérer votre événement
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Étape 1 */}
            <div className="relative">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 bg-gradient-to-br from-[#004645] to-[#009197] text-white w-10 h-10 rounded-full flex items-center justify-center font-bold" style={{ fontFamily: "var(--font-abril)" }}>
                  1
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-[#004645] mb-2">Ajoutez des invités</h3>
                  <p className="text-sm text-[#004645]/70 mb-3">
                    Créez votre liste d&apos;invités ou importez un CSV
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    <AddGuestDialog eventId={eventId} onGuestAdded={fetchEvent} />
                    <ImportCSVDialog eventId={eventId} onImportComplete={fetchEvent} />
                  </div>
                </div>
              </div>
            </div>

            {/* Étape 2 - NOUVELLE: Configuration Email */}
            <div className="relative">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 bg-gradient-to-br from-purple-600 to-purple-400 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold" style={{ fontFamily: "var(--font-abril)" }}>
                  2
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-[#004645] mb-2">Configurez vos emails</h3>
                  <p className="text-sm text-[#004645]/70 mb-3">
                    Créez et testez vos templates d&apos;email
                  </p>
                  <Link href={`/admin/events/${eventId}/emails`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white"
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Hub Email
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Étape 3 */}
            <div className="relative">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 bg-gradient-to-br from-[#004645] to-[#009197] text-white w-10 h-10 rounded-full flex items-center justify-center font-bold" style={{ fontFamily: "var(--font-abril)" }}>
                  3
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-[#004645] mb-2">Envoyez les invitations</h3>
                  <p className="text-sm text-[#004645]/70 mb-3">
                    Envoyez des emails à vos invités avec leur lien RSVP
                  </p>
                  <SendInvitationsDialog
                    eventId={eventId}
                    totalGuests={totalGuests}
                    pendingGuests={totalGuests - respondedGuests}
                    confirmedGuests={attendingGuests}
                  />
                </div>
              </div>
            </div>

            {/* Étape 4 */}
            <div className="relative">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 bg-gradient-to-br from-green-600 to-emerald-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold" style={{ fontFamily: "var(--font-abril)" }}>
                  4
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-[#004645] mb-2">Suivez les réponses</h3>
                  <p className="text-sm text-[#004645]/70 mb-3">
                    Consultez les réponses et analytics en temps réel
                  </p>
                  <Link href={`/admin/events/${eventId}/guests`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Voir invités
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Étape 5 */}
            <div className="relative">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 bg-gradient-to-br from-[#009197] to-[#9CD9F6] text-white w-10 h-10 rounded-full flex items-center justify-center font-bold" style={{ fontFamily: "var(--font-abril)" }}>
                  5
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-[#004645] mb-2">Check-in le jour J</h3>
                  <p className="text-sm text-[#004645]/70 mb-3">
                    Enregistrez les arrivées avec QR code
                  </p>
                  <Link href={`/admin/events/${eventId}/checkin`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-[#009197] text-[#009197] hover:bg-[#009197] hover:text-white"
                    >
                      <QrCode className="h-4 w-4 mr-2" />
                      Check-in
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Onboarding Wizard */}
      <OnboardingWizard
        eventId={eventId}
        open={showWizard}
        onClose={() => setShowWizard(false)}
        onComplete={() => {
          setShowWizard(false)
          fetchEvent() // Refresh event data after wizard completion
        }}
      />
    </div>
  )
}
