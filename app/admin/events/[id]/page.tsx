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

      {/* Gestion du Workflow - Contrôle des Campagnes */}
      <Card className="border-[#004645]/30 bg-gradient-to-br from-white via-[#009197]/5 to-white backdrop-blur">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-gradient-to-br from-[#004645] to-[#009197]">
                <Settings2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-[#004645]" style={{ fontFamily: "var(--font-abril)" }}>
                  Gestion du Workflow
                </CardTitle>
                <CardDescription className="text-[#004645]/70">
                  Contrôlez le timing et les relances de votre événement
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[#004645] border-[#004645]">
                {totalGuests} invités
              </Badge>
              <Link href={`/admin/events/${eventId}/edit`}>
                <Button variant="outline" size="sm" className="border-[#004645] text-[#004645] hover:bg-[#004645] hover:text-white">
                  <Edit className="h-4 w-4 mr-2" />
                  Modifier l&apos;événement
                </Button>
              </Link>
              <Link href={`/admin/events/${eventId}/rsvp-texts`}>
                <Button variant="outline" size="sm" className="border-[#009197] text-[#009197] hover:bg-[#009197] hover:text-white">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Textes RSVP
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Phase 1: Save the Date */}
          <div className="p-4 rounded-lg border border-[#FF4713]/30 bg-gradient-to-r from-[#FF4713]/5 to-transparent">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <div className="w-10 h-10 rounded-full bg-[#FF4713] flex items-center justify-center flex-shrink-0">
                  <Bell className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-[#004645]">Phase 1 : Save the Date</h3>
                    <Badge variant="secondary" className="text-xs">Optionnel</Badge>
                  </div>
                  <p className="text-sm text-[#004645]/70 mb-2">
                    Pré-invitation pour bloquer la date (J-90 à J-60)
                  </p>
                  <div className="flex items-center gap-2 text-xs text-[#004645]/60">
                    <Calendar className="h-3 w-3" />
                    <span>Recommandé 60-90 jours avant l&apos;événement</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Link href={`/admin/events/${eventId}/save-the-date`}>
                  <Button size="sm" variant="outline" className="border-[#FF4713] text-[#FF4713] hover:bg-[#FF4713] hover:text-white">
                    <Settings2 className="h-3 w-3 mr-2" />
                    Configurer
                  </Button>
                </Link>
                <Link href={`/admin/events/${eventId}/communications`}>
                  <Button size="sm" className="bg-[#FF4713] hover:bg-[#FF4713]/90 text-white">
                    <Send className="h-3 w-3 mr-2" />
                    Envoyer
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Phase 2: Invitation Officielle */}
          <div className="p-4 rounded-lg border border-[#009197]/30 bg-gradient-to-r from-[#009197]/5 to-transparent">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <div className="w-10 h-10 rounded-full bg-[#009197] flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-[#004645]">Phase 2 : Invitation Officielle</h3>
                    <Badge variant="default" className="text-xs bg-[#009197]">Critique</Badge>
                  </div>
                  <p className="text-sm text-[#004645]/70 mb-2">
                    Envoi des invitations avec lien RSVP unique (J-60 à J-30)
                  </p>
                  <div className="flex items-center gap-2 text-xs text-[#004645]/60">
                    <Calendar className="h-3 w-3" />
                    <span>Recommandé 30-60 jours avant l&apos;événement</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Link href={`/admin/events/${eventId}/emails`}>
                  <Button size="sm" variant="outline" className="border-[#009197] text-[#009197] hover:bg-[#009197] hover:text-white">
                    <TestTube className="h-3 w-3 mr-2" />
                    Tester
                  </Button>
                </Link>
                <SendInvitationsDialog
                  eventId={eventId}
                  totalGuests={totalGuests}
                  pendingGuests={totalGuests - respondedGuests}
                />
              </div>
            </div>
          </div>

          {/* Phase 3: Relances RSVP */}
          <div className="p-4 rounded-lg border border-orange-500/30 bg-gradient-to-r from-orange-50/50 to-transparent">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0">
                  <Repeat className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-[#004645]">Phase 3 : Relances RSVP</h3>
                    <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">Important</Badge>
                  </div>
                  <p className="text-sm text-[#004645]/70 mb-2">
                    Rappels aux invités sans réponse (J-30 à J-14)
                  </p>
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1 text-[#004645]/60">
                      <Users className="h-3 w-3" />
                      <span>{totalGuests - respondedGuests} sans réponse</span>
                    </div>
                    <div className="flex items-center gap-1 text-orange-600">
                      <AlertCircle className="h-3 w-3" />
                      <span>Relance recommandée</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Link href={`/admin/events/${eventId}/guests?filter=pending`}>
                  <Button size="sm" variant="outline" className="border-orange-500 text-orange-600 hover:bg-orange-500 hover:text-white">
                    <Eye className="h-3 w-3 mr-2" />
                    Voir liste
                  </Button>
                </Link>
                <Link href={`/admin/events/${eventId}/communications?type=reminder`}>
                  <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white">
                    <Send className="h-3 w-3 mr-2" />
                    Relancer
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Phase 4: Confirmation Automatique */}
          <div className="p-4 rounded-lg border border-green-500/30 bg-gradient-to-r from-green-50/50 to-transparent">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                  <CheckCheck className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-[#004645]">Phase 4 : Confirmation</h3>
                    <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">Automatique</Badge>
                  </div>
                  <p className="text-sm text-[#004645]/70 mb-2">
                    Emails conditionnels envoyés automatiquement après RSVP
                  </p>
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="h-3 w-3" />
                      <span>{attendingGuests} confirmés</span>
                    </div>
                    <div className="flex items-center gap-1 text-red-600">
                      <XCircle className="h-3 w-3" />
                      <span>{decliningGuests} déclinés</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Link href={`/admin/events/${eventId}/emails`}>
                  <Button size="sm" variant="outline" className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white">
                    <Settings2 className="h-3 w-3 mr-2" />
                    Templates
                  </Button>
                </Link>
                <Link href={`/admin/events/${eventId}/emails?tab=analytics`}>
                  <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                    <BarChart3 className="h-3 w-3 mr-2" />
                    Analytics
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Phase 5: Rappel Jour J */}
          <div className="p-4 rounded-lg border border-[#004645]/30 bg-gradient-to-r from-[#004645]/5 to-transparent">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <div className="w-10 h-10 rounded-full bg-[#004645] flex items-center justify-center flex-shrink-0">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-[#004645]">Phase 5 : Rappel Final</h3>
                    <Badge variant="secondary" className="text-xs">Optionnel</Badge>
                  </div>
                  <p className="text-sm text-[#004645]/70 mb-2">
                    Informations pratiques avant le jour J (J-3 à J-1)
                  </p>
                  <div className="flex items-center gap-2 text-xs text-[#004645]/60">
                    <Calendar className="h-3 w-3" />
                    <span>Envoi recommandé 2-3 jours avant l&apos;événement</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Link href={`/admin/events/${eventId}/emails`}>
                  <Button size="sm" variant="outline" className="border-[#004645] text-[#004645] hover:bg-[#004645] hover:text-white">
                    <Settings2 className="h-3 w-3 mr-2" />
                    Préparer
                  </Button>
                </Link>
                <Link href={`/admin/events/${eventId}/communications?type=info`}>
                  <Button size="sm" className="bg-[#004645] hover:bg-[#006C51] text-white">
                    <Send className="h-3 w-3 mr-2" />
                    Envoyer
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Actions Rapides */}
          <div className="pt-4 border-t border-[#004645]/10">
            <div className="grid md:grid-cols-3 gap-3">
              <Link href={`/admin/events/${eventId}/communications`}>
                <Button variant="outline" className="w-full">
                  <Megaphone className="h-4 w-4 mr-2" />
                  Toutes les campagnes
                </Button>
              </Link>
              <Link href={`/admin/events/${eventId}/emails`}>
                <Button variant="outline" className="w-full">
                  <Mail className="h-4 w-4 mr-2" />
                  Hub Email
                </Button>
              </Link>
              <Link href={`/admin/events/${eventId}/guests`}>
                <Button variant="outline" className="w-full">
                  <Users className="h-4 w-4 mr-2" />
                  Liste invités
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Nouveau: Email Hub - Gestion centralisée */}
      <Card className="border-[#009197]/30 bg-gradient-to-br from-[#009197]/5 to-white/80 backdrop-blur">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-gradient-to-br from-[#009197] to-[#9CD9F6]">
                <Mail className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-[#004645]" style={{ fontFamily: "var(--font-abril)" }}>
                  Hub Email
                </CardTitle>
                <CardDescription className="text-[#004645]/70">
                  Gérez tous vos emails depuis un seul endroit
                </CardDescription>
              </div>
            </div>
            <Link href={`/admin/events/${eventId}/emails`}>
              <Button className="bg-gradient-to-r from-[#009197] to-[#9CD9F6] hover:from-[#007B82] hover:to-[#009197] text-white">
                <BarChart3 className="h-4 w-4 mr-2" />
                Ouvrir le Hub
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            {/* Templates & Analytics */}
            <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-purple-50 to-transparent rounded-lg border border-purple-100">
              <Sparkles className="h-8 w-8 text-purple-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-[#004645] mb-1">Templates Visuels</p>
                <p className="text-sm text-[#004645]/70">
                  Créez des emails avec l&apos;éditeur WYSIWYG
                </p>
              </div>
            </div>

            {/* Test Emails */}
            <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-blue-50 to-transparent rounded-lg border border-blue-100">
              <TestTube className="h-8 w-8 text-blue-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-[#004645] mb-1">Test d&apos;Emails</p>
                <p className="text-sm text-[#004645]/70">
                  Prévisualisez avant d&apos;envoyer
                </p>
              </div>
            </div>

            {/* Conditional Templates */}
            <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-green-50 to-transparent rounded-lg border border-green-100">
              <CheckCircle className="h-8 w-8 text-green-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-[#004645] mb-1">Emails Conditionnels</p>
                <p className="text-sm text-[#004645]/70">
                  Différents selon acceptation/refus
                </p>
              </div>
            </div>

            {/* Analytics */}
            <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-orange-50 to-transparent rounded-lg border border-orange-100">
              <TrendingUp className="h-8 w-8 text-orange-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-[#004645] mb-1">Analytics Temps Réel</p>
                <p className="text-sm text-[#004645]/70">
                  Taux d&apos;ouverture et clics
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-4 p-4 bg-[#009197]/5 rounded-lg border border-[#009197]/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Eye className="h-5 w-5 text-[#009197]" />
                <p className="text-sm font-medium text-[#004645]">
                  Nouveauté : Prévisualisez et testez vos templates avant envoi
                </p>
              </div>
              <Link href={`/admin/events/${eventId}/emails`}>
                <Button variant="outline" size="sm" className="border-[#009197] text-[#009197] hover:bg-[#009197] hover:text-white">
                  Découvrir →
                </Button>
              </Link>
            </div>
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
