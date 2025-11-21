"use client"

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Mail, Users, Clock, Send, CheckCircle, Sparkles, Bell, Megaphone, BarChart3, ArrowRight, QrCode, UserCheck, UtensilsCrossed, XCircle, TestTube, Eye, TrendingUp
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

      {/* Timeline du cycle de l'événement */}
      <Card className="border-[#FF4713]/30 bg-gradient-to-r from-[#FF4713]/5 via-[#009197]/5 to-[#004645]/5 backdrop-blur">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Clock className="h-6 w-6 text-[#FF4713]" />
            <div>
              <CardTitle className="text-[#004645]" style={{ fontFamily: "var(--font-abril)" }}>
                Cycle de l&apos;événement
              </CardTitle>
              <CardDescription className="text-[#004645]/70">
                Save the Date → Invitation → RSVP → Confirmation
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Ligne de connexion */}
            <div className="absolute top-8 left-0 right-0 h-1 bg-gradient-to-r from-[#FF4713] via-[#009197] via-[#004645] to-green-600 opacity-20 hidden md:block" />

            <div className="grid md:grid-cols-4 gap-4 relative">
              {/* Étape 1: Save the Date */}
              <div className="text-center">
                <div className="relative mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-[#FF4713] to-[#FF6B3D] rounded-full flex items-center justify-center shadow-lg">
                  <Bell className="h-8 w-8 text-white" />
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center border-2 border-[#FF4713]">
                    <span className="text-xs font-bold text-[#FF4713]">1</span>
                  </div>
                </div>
                <h3 className="font-bold text-[#004645] mb-1">Save the Date</h3>
                <p className="text-xs text-[#004645]/60 mb-2">J-90 à J-60</p>
                <p className="text-sm text-[#004645]/70">
                  Pré-invitation pour bloquer la date
                </p>
              </div>

              {/* Étape 2: Invitation */}
              <div className="text-center">
                <div className="relative mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-[#009197] to-[#9CD9F6] rounded-full flex items-center justify-center shadow-lg">
                  <Sparkles className="h-8 w-8 text-white" />
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center border-2 border-[#009197]">
                    <span className="text-xs font-bold text-[#009197]">2</span>
                  </div>
                </div>
                <h3 className="font-bold text-[#004645] mb-1">Invitation</h3>
                <p className="text-xs text-[#004645]/60 mb-2">J-60 à J-30</p>
                <p className="text-sm text-[#004645]/70">
                  Annonce officielle avec détails
                </p>
              </div>

              {/* Étape 3: RSVP */}
              <div className="text-center">
                <div className="relative mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-[#004645] to-[#006C51] rounded-full flex items-center justify-center shadow-lg">
                  <CheckCircle className="h-8 w-8 text-white" />
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center border-2 border-[#004645]">
                    <span className="text-xs font-bold text-[#004645]">3</span>
                  </div>
                </div>
                <h3 className="font-bold text-[#004645] mb-1">RSVP</h3>
                <p className="text-xs text-[#004645]/60 mb-2">J-30 à J-14</p>
                <p className="text-sm text-[#004645]/70">
                  Confirmation de participation
                </p>
              </div>

              {/* Étape 4: Confirmation - NOUVELLE */}
              <div className="text-center">
                <div className="relative mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                  <Mail className="h-8 w-8 text-white" />
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center border-2 border-green-600">
                    <span className="text-xs font-bold text-green-600">4</span>
                  </div>
                </div>
                <h3 className="font-bold text-[#004645] mb-1">Confirmation</h3>
                <p className="text-xs text-[#004645]/60 mb-2">Automatique</p>
                <p className="text-sm text-[#004645]/70">
                  Email personnalisé selon réponse
                </p>
              </div>
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

      {/* Configuration des builders */}
      <div>
        <h2 className="text-2xl font-bold text-[#004645] mb-4" style={{ fontFamily: "var(--font-abril)" }}>
          Configuration de l&apos;événement
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          {/* Save the Date Builder */}
          <Link href={`/admin/events/${eventId}/save-the-date`}>
            <Card className="border-[#FF4713]/30 bg-white/80 backdrop-blur hover:shadow-xl transition-all duration-300 group cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-orange-50">
                    <Bell className="h-6 w-6 text-[#FF4713]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-[#004645] group-hover:text-[#FF4713] transition-colors">
                        Save the Date
                      </CardTitle>
                      <Badge variant="secondary" className="text-xs">Étape 1</Badge>
                    </div>
                    <CardDescription>
                      Créez votre pré-invitation pour annoncer la date
                    </CardDescription>
                  </div>
                  <ArrowRight className="h-5 w-5 text-[#004645]/40 group-hover:text-[#FF4713] transition-colors" />
                </div>
              </CardHeader>
            </Card>
          </Link>

          {/* Invitation Builder */}
          <Link href={`/admin/events/${eventId}/invitation`}>
            <Card className="border-[#009197]/30 bg-white/80 backdrop-blur hover:shadow-xl transition-all duration-300 group cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-teal-50">
                    <Sparkles className="h-6 w-6 text-[#009197]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-[#004645] group-hover:text-[#009197] transition-colors">
                        Invitation officielle
                      </CardTitle>
                      <Badge variant="secondary" className="text-xs">Étape 2</Badge>
                    </div>
                    <CardDescription>
                      Personnalisez l&apos;invitation avec tous les détails
                    </CardDescription>
                  </div>
                  <ArrowRight className="h-5 w-5 text-[#004645]/40 group-hover:text-[#009197] transition-colors" />
                </div>
              </CardHeader>
            </Card>
          </Link>

          {/* RSVP Builder */}
          <Link href={`/admin/events/${eventId}/rsvp-config`}>
            <Card className="border-[#004645]/30 bg-white/80 backdrop-blur hover:shadow-xl transition-all duration-300 group cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-green-50">
                    <CheckCircle className="h-6 w-6 text-[#004645]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-[#004645] group-hover:text-[#006C51] transition-colors">
                        Formulaire RSVP
                      </CardTitle>
                      <Badge variant="secondary" className="text-xs">Étape 3</Badge>
                    </div>
                    <CardDescription>
                      Créez le formulaire de confirmation de présence
                    </CardDescription>
                  </div>
                  <ArrowRight className="h-5 w-5 text-[#004645]/40 group-hover:text-[#006C51] transition-colors" />
                </div>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </div>

      {/* Gestion des communications - Mise à jour */}
      <Card className="border-[#009197]/30 bg-white/80 backdrop-blur">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-[#004645]" style={{ fontFamily: "var(--font-abril)" }}>
                Campagnes d&apos;envoi
              </CardTitle>
              <CardDescription className="text-[#004645]/70">
                Planifiez vos envois et gérez vos campagnes
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Link href={`/admin/events/${eventId}/emails`}>
                <Button variant="outline" className="border-[#009197] text-[#009197] hover:bg-[#009197] hover:text-white">
                  <Mail className="h-4 w-4 mr-2" />
                  Hub Email
                </Button>
              </Link>
              <Link href={`/admin/events/${eventId}/communications`}>
                <Button className="bg-gradient-to-r from-[#004645] to-[#009197] hover:from-[#006C51] hover:to-[#009197] text-white">
                  <Megaphone className="h-4 w-4 mr-2" />
                  Campagnes
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-[#FF4713]/5 to-transparent rounded-lg">
              <Send className="h-8 w-8 text-[#FF4713]" />
              <div>
                <p className="font-semibold text-[#004645]">Planification</p>
                <p className="text-sm text-[#004645]/70">Programmez vos envois</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-[#009197]/5 to-transparent rounded-lg">
              <Mail className="h-8 w-8 text-[#009197]" />
              <div>
                <p className="font-semibold text-[#004645]">Templates</p>
                <p className="text-sm text-[#004645]/70">Emails personnalisés</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-[#004645]/5 to-transparent rounded-lg">
              <BarChart3 className="h-8 w-8 text-[#004645]" />
              <div>
                <p className="font-semibold text-[#004645]">Analytics</p>
                <p className="text-sm text-[#004645]/70">Taux d&apos;ouverture</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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
