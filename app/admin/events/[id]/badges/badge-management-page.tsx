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
import { PhotoUpload } from '@/components/admin/photo-upload'
import { BadgeTemplateGallery } from '@/components/admin/badge-template-gallery'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  CreditCard,
  Settings,
  Users,
  Sparkles,
  AlertCircle,
  CheckCircle,
  Loader2,
  Camera,
  Check,
  X,
  Palette,
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
          <TabsTrigger value="photos">
            <Camera className="h-4 w-4 mr-2" />
            Photos
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 flex items-center justify-between">
              <span>
                <strong>Template actuel:</strong> {badgeDesign?.name || 'Par défaut'} ({badgeDesign?.size || 'STANDARD'},{' '}
                {badgeDesign?.orientation === 'PORTRAIT' ? 'Portrait' : 'Paysage'})
              </span>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Palette className="h-4 w-4 mr-2" />
                    Changer de template
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Choisir un template de badge</DialogTitle>
                    <DialogDescription>
                      Sélectionnez un template professionnel. Les badges déjà générés ne seront pas modifiés.
                    </DialogDescription>
                  </DialogHeader>
                  <BadgeTemplateGallery
                    eventId={event.id}
                    currentDesign={badgeDesign}
                    onSave={() => {
                      router.refresh()
                    }}
                  />
                </DialogContent>
              </Dialog>
            </AlertDescription>
          </Alert>

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
                Sélectionnez les invités pour lesquels générer des badges. Template: <strong>{badgeDesign?.name || 'Par défaut'}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="select-all-generate"
                    checked={allEligibleSelected}
                    onCheckedChange={handleSelectAll}
                    disabled={eligibleGuests.length === 0}
                  />
                  <Label htmlFor="select-all-generate" className="cursor-pointer">
                    {selectedGuestIds.size > 0
                      ? `${selectedGuestIds.size} sélectionné(s)`
                      : 'Tout sélectionner'}
                  </Label>
                </div>

                <Button
                  onClick={handleGenerateBadges}
                  disabled={selectedGuestIds.size === 0 || generating}
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

        {/* Photos Tab */}
        <TabsContent value="photos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gérer les photos des invités</CardTitle>
              <CardDescription>
                Uploadez des photos pour les invités afin de les afficher sur leurs badges
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {guests.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Aucun invité avec RSVP confirmé. Seuls les invités ayant confirmé leur présence peuvent avoir une photo.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {guests.map((guest: any) => (
                      <Card key={guest.id} className="border-[#9CD9F6]/30">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base flex items-center justify-between">
                            <span>
                              {guest.firstName} {guest.lastName}
                            </span>
                            {guest.photoUrl && (
                              <Badge variant="secondary" className="bg-green-100 text-green-800">
                                <Check className="h-3 w-3 mr-1" />
                                Photo
                              </Badge>
                            )}
                            {!guest.photoUrl && (
                              <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                                <X className="h-3 w-3 mr-1" />
                                Aucune
                              </Badge>
                            )}
                          </CardTitle>
                          <CardDescription className="text-xs">
                            {guest.company && <span>{guest.company} • </span>}
                            {guest.email}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <PhotoUpload
                            guestId={guest.id}
                            currentPhotoUrl={guest.photoUrl}
                            onPhotoUploaded={() => {
                              toast.success('Photo uploadée avec succès')
                              router.refresh()
                            }}
                            onPhotoDeleted={() => {
                              toast.success('Photo supprimée')
                              router.refresh()
                            }}
                          />
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        <Check className="h-3 w-3" />
                      </Badge>
                      {guests.filter((g: any) => g.photoUrl).length} avec photo
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                        <X className="h-3 w-3" />
                      </Badge>
                      {guests.filter((g: any) => !g.photoUrl).length} sans photo
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
