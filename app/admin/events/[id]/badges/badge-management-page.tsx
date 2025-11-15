'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { BadgeList } from '@/components/admin/badge-list'
import {
  CreditCard,
  Settings,
  Users,
  Sparkles,
  AlertCircle,
  CheckCircle,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface BadgeManagementPageProps {
  event: {
    id: string
    name: string
    slug: string
  }
  badgeDesign: any
  guests: any[]
  badges: any[]
  badgeStats: {
    total: number
    ready: number
    issued: number
    printed: number
  }
}

export function BadgeManagementPage({
  event,
  badgeDesign: initialBadgeDesign,
  guests: initialGuests,
  badges: initialBadges,
  badgeStats: initialBadgeStats,
}: BadgeManagementPageProps) {
  const router = useRouter()
  const [badgeDesign, setBadgeDesign] = useState(initialBadgeDesign)
  const [guests, setGuests] = useState(initialGuests)
  const [badges, setBadges] = useState(initialBadges)
  const [badgeStats, setBadgeStats] = useState(initialBadgeStats)
  const [selectedGuestIds, setSelectedGuestIds] = useState<Set<string>>(new Set())
  const [generating, setGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const eligibleGuestIds = guests
        .filter((g) => !g.badge)
        .map((g) => g.id)
      setSelectedGuestIds(new Set(eligibleGuestIds))
    } else {
      setSelectedGuestIds(new Set())
    }
  }

  const handleSelectGuest = (guestId: string, checked: boolean) => {
    const newSelected = new Set(selectedGuestIds)
    if (checked) {
      newSelected.add(guestId)
    } else {
      newSelected.delete(guestId)
    }
    setSelectedGuestIds(newSelected)
  }

  const handleGenerateBadges = async () => {
    if (selectedGuestIds.size === 0) {
      toast.error('Veuillez sélectionner au moins un invité')
      return
    }

    if (!badgeDesign) {
      toast.error('Veuillez d\'abord configurer le design des badges')
      setActiveTab('design')
      return
    }

    setGenerating(true)

    try {
      const response = await fetch(
        `/api/admin/events/${event.id}/badges/generate`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            guestIds: Array.from(selectedGuestIds),
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Erreur lors de la génération')
      }

      toast.success(data.message || `${data.total} badge(s) généré(s)`)

      // Refresh data
      router.refresh()
      setSelectedGuestIds(new Set())
    } catch (error) {
      console.error('Generation error:', error)
      toast.error(
        error instanceof Error ? error.message : 'Erreur lors de la génération'
      )
    } finally {
      setGenerating(false)
    }
  }

  const handleSetupDesign = () => {
    // For now, use default design
    // In future, this would open a design editor
    toast.info('Le designer de badges sera disponible prochainement')
    setActiveTab('design')
  }

  const eligibleGuests = guests.filter((g) => !g.badge)
  const guestsWithBadges = guests.filter((g) => g.badge)
  const allEligibleSelected =
    eligibleGuests.length > 0 && selectedGuestIds.size === eligibleGuests.length

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Badges</h1>
          <p className="text-muted-foreground mt-1">
            Générez et imprimez les badges pour {event.name}
          </p>
        </div>
        <Badge variant="outline" className="text-base px-4 py-2">
          <CreditCard className="h-4 w-4 mr-2" />
          {guests.length} invités avec RSVP
        </Badge>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">
            <Sparkles className="h-4 w-4 mr-2" />
            Vue d&apos;ensemble
          </TabsTrigger>
          <TabsTrigger value="generate">
            <Users className="h-4 w-4 mr-2" />
            Générer
          </TabsTrigger>
          <TabsTrigger value="design">
            <Settings className="h-4 w-4 mr-2" />
            Design
            {!badgeDesign && (
              <Badge variant="destructive" className="ml-2 h-5 px-1">!</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {!badgeDesign ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Aucun design de badge configuré.
                <Button
                  variant="link"
                  className="px-2"
                  onClick={handleSetupDesign}
                >
                  Configurer maintenant
                </Button>
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Design de badge configuré: {badgeDesign.name} ({badgeDesign.size},{' '}
                {badgeDesign.orientation === 'PORTRAIT' ? 'Portrait' : 'Paysage'})
              </AlertDescription>
            </Alert>
          )}

          {badges.length > 0 ? (
            <BadgeList
              eventId={event.id}
              badges={badges}
              stats={badgeStats}
              onRefresh={() => router.refresh()}
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Aucun badge généré</CardTitle>
                <CardDescription>
                  Commencez par générer des badges pour vos invités dans l&apos;onglet &quot;Générer&quot;
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </TabsContent>

        {/* Generate Tab */}
        <TabsContent value="generate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Générer les badges</CardTitle>
              <CardDescription>
                Sélectionnez les invités pour lesquels générer des badges
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!badgeDesign && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Veuillez d&apos;abord configurer le design des badges dans l&apos;onglet &quot;Design&quot;
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="select-all-generate"
                    checked={allEligibleSelected}
                    onCheckedChange={handleSelectAll}
                    disabled={eligibleGuests.length === 0 || !badgeDesign}
                  />
                  <Label htmlFor="select-all-generate" className="cursor-pointer">
                    {selectedGuestIds.size > 0
                      ? `${selectedGuestIds.size} sélectionné(s)`
                      : 'Tout sélectionner'}
                  </Label>
                </div>

                <Button
                  onClick={handleGenerateBadges}
                  disabled={selectedGuestIds.size === 0 || generating || !badgeDesign}
                >
                  {generating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Génération...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Générer ({selectedGuestIds.size})
                    </>
                  )}
                </Button>
              </div>

              <div className="border rounded-lg divide-y">
                {eligibleGuests.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    Tous les invités ont déjà un badge généré
                  </div>
                ) : (
                  eligibleGuests.map((guest) => (
                    <div key={guest.id} className="flex items-center gap-3 p-4">
                      <Checkbox
                        id={`guest-${guest.id}`}
                        checked={selectedGuestIds.has(guest.id)}
                        onCheckedChange={(checked) =>
                          handleSelectGuest(guest.id, checked as boolean)
                        }
                        disabled={!badgeDesign}
                      />
                      <Label
                        htmlFor={`guest-${guest.id}`}
                        className="flex-1 cursor-pointer"
                      >
                        <div className="font-medium">
                          {guest.firstName} {guest.lastName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {guest.company} • {guest.email}
                        </div>
                      </Label>
                      <Badge variant="secondary">{guest.status}</Badge>
                    </div>
                  ))
                )}
              </div>

              {guestsWithBadges.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  {guestsWithBadges.length} invité(s) ont déjà un badge généré
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Design Tab */}
        <TabsContent value="design" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuration du design</CardTitle>
              <CardDescription>
                Personnalisez l&apos;apparence des badges pour cet événement
              </CardDescription>
            </CardHeader>
            <CardContent>
              {badgeDesign ? (
                <div className="space-y-4">
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Design actuel: <strong>{badgeDesign.name}</strong>
                      <br />
                      Taille: {badgeDesign.size}, Orientation:{' '}
                      {badgeDesign.orientation === 'PORTRAIT' ? 'Portrait' : 'Paysage'}
                      <br />
                      QR Code: {badgeDesign.includeQRCode ? 'Oui' : 'Non'}
                    </AlertDescription>
                  </Alert>

                  <div className="text-sm text-muted-foreground">
                    Le designer de badges visuel sera disponible dans une prochaine version.
                    <br />
                    Pour l&apos;instant, un design par défaut est utilisé automatiquement.
                  </div>
                </div>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Aucun design configuré. Un design par défaut sera utilisé automatiquement
                    lors de la génération des badges.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
