"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  CheckCircle2,
  Mail,
  Users,
  FileText,
  Rocket,
  ArrowRight,
  ArrowLeft,
  X,
  Sparkles,
  Settings,
  Upload
} from 'lucide-react'
import { toast } from 'sonner'

interface OnboardingWizardProps {
  eventId: string
  open: boolean
  onClose: () => void
  onComplete: () => void
}

interface SetupStatus {
  hasEmailIntegration: boolean
  hasGuests: boolean
  hasInviteTemplate: boolean
}

export function OnboardingWizard({ eventId, open, onClose, onComplete }: OnboardingWizardProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [setupStatus, setSetupStatus] = useState<SetupStatus>({
    hasEmailIntegration: false,
    hasGuests: false,
    hasInviteTemplate: false,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (open) {
      checkSetupStatus()
    }
  }, [open, eventId])

  const checkSetupStatus = async () => {
    try {
      setLoading(true)

      // Check email integration
      const integrationRes = await fetch('/api/admin/integrations/email')
      const integrations = await integrationRes.json()
      const hasEmailIntegration = integrations.some((i: any) => i.isActive)

      // Check guests
      const guestsRes = await fetch(`/api/admin/events/${eventId}/guests`)
      const guestsData = await guestsRes.json()
      const hasGuests = guestsData.guests?.length > 0

      // Check templates
      const templatesRes = await fetch(`/api/admin/templates?eventId=${eventId}`)
      const templates = await templatesRes.json()
      const hasInviteTemplate = templates.some(
        (t: any) => (t.type === 'INVITE' || t.type === 'INVITATION') && t.isActive
      )

      setSetupStatus({
        hasEmailIntegration,
        hasGuests,
        hasInviteTemplate,
      })
    } catch (error) {
      console.error('Error checking setup status:', error)
    } finally {
      setLoading(false)
    }
  }

  const steps = [
    {
      id: 'welcome',
      title: 'Bienvenue ! 🎉',
      description: 'Configurons votre événement en quelques étapes',
      icon: Sparkles,
    },
    {
      id: 'email',
      title: 'Configuration Email',
      description: 'Connectez votre service d\'envoi d\'emails',
      icon: Mail,
      completed: setupStatus.hasEmailIntegration,
    },
    {
      id: 'guests',
      title: 'Ajout des Invités',
      description: 'Importez ou ajoutez vos invités',
      icon: Users,
      completed: setupStatus.hasGuests,
    },
    {
      id: 'template',
      title: 'Créer une Invitation',
      description: 'Personnalisez votre email d\'invitation',
      icon: FileText,
      completed: setupStatus.hasInviteTemplate,
    },
    {
      id: 'ready',
      title: 'Prêt à Démarrer ! 🚀',
      description: 'Tout est configuré, vous pouvez envoyer vos invitations',
      icon: Rocket,
    },
  ]

  const currentStepData = steps[currentStep]
  const progress = ((currentStep + 1) / steps.length) * 100

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = () => {
    onComplete()
    onClose()
    toast.success('Configuration terminée ! Votre événement est prêt.')
  }

  const handleSkip = () => {
    onClose()
  }

  const navigateToSetup = (step: string) => {
    const routes: Record<string, string> = {
      email: '/admin/settings/integrations',
      guests: `/admin/events/${eventId}/guests`,
      template: `/admin/events/${eventId}/invitation`,
    }

    if (routes[step]) {
      router.push(routes[step])
      onClose()
    }
  }

  if (loading) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              {currentStepData.icon && <currentStepData.icon className="h-5 w-5" />}
              {currentStepData.title}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription>{currentStepData.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Étape {currentStep + 1} sur {steps.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step Content */}
          <div className="min-h-[300px]">
            {currentStep === 0 && <WelcomeStep />}
            {currentStep === 1 && (
              <EmailSetupStep
                completed={setupStatus.hasEmailIntegration}
                onSetup={() => navigateToSetup('email')}
              />
            )}
            {currentStep === 2 && (
              <GuestsSetupStep
                completed={setupStatus.hasGuests}
                onSetup={() => navigateToSetup('guests')}
              />
            )}
            {currentStep === 3 && (
              <TemplateSetupStep
                completed={setupStatus.hasInviteTemplate}
                onSetup={() => navigateToSetup('template')}
              />
            )}
            {currentStep === 4 && <ReadyStep eventId={eventId} />}
          </div>

          {/* Navigation */}
          <div className="flex justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Précédent
            </Button>

            <div className="flex gap-2">
              {currentStep < steps.length - 1 && (
                <Button variant="ghost" onClick={handleSkip}>
                  Passer
                </Button>
              )}
              <Button
                onClick={handleNext}
                className="bg-gradient-to-r from-[#004645] to-[#009197]"
              >
                {currentStep === steps.length - 1 ? 'Terminer' : 'Suivant'}
                {currentStep < steps.length - 1 && <ArrowRight className="h-4 w-4 ml-2" />}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function WelcomeStep() {
  return (
    <div className="space-y-4">
      <div className="text-center py-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#004645] to-[#009197] mb-4">
          <Sparkles className="h-8 w-8 text-white" />
        </div>
        <h3 className="text-xl font-semibold mb-2">
          Bienvenue dans Weevup !
        </h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Nous allons vous guider pour configurer votre événement en quelques minutes.
          Vous pourrez ensuite envoyer vos invitations et gérer les réponses facilement.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ce que nous allons configurer :</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <Mail className="h-5 w-5 text-[#009197] mt-0.5" />
            <div>
              <p className="font-medium">Service d'envoi d'emails</p>
              <p className="text-sm text-muted-foreground">
                Connectez SendGrid, Resend ou utilisez SMTP
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Users className="h-5 w-5 text-[#009197] mt-0.5" />
            <div>
              <p className="font-medium">Liste d'invités</p>
              <p className="text-sm text-muted-foreground">
                Importez depuis CSV ou ajoutez manuellement
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <FileText className="h-5 w-5 text-[#009197] mt-0.5" />
            <div>
              <p className="font-medium">Email d'invitation</p>
              <p className="text-sm text-muted-foreground">
                Créez un email personnalisé avec notre éditeur visuel
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function EmailSetupStep({ completed, onSetup }: { completed: boolean; onSetup: () => void }) {
  return (
    <div className="space-y-4">
      {completed ? (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
              <div>
                <p className="font-semibold text-green-900">Configuration email complète !</p>
                <p className="text-sm text-green-700">
                  Votre intégration email est active et prête à l'emploi.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Connectez votre service d'envoi d'emails</CardTitle>
            <CardDescription>
              Pour envoyer des invitations, vous devez configurer une intégration email.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-1">SendGrid</h4>
                <p className="text-sm text-muted-foreground">
                  Service d'emailing professionnel avec analytics détaillées
                </p>
              </div>
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-1">Resend</h4>
                <p className="text-sm text-muted-foreground">
                  Solution moderne et simple pour développeurs
                </p>
              </div>
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-1">SMTP Personnalisé</h4>
                <p className="text-sm text-muted-foreground">
                  Utilisez votre propre serveur SMTP
                </p>
              </div>
            </div>

            <Button onClick={onSetup} className="w-full">
              <Settings className="h-4 w-4 mr-2" />
              Configurer maintenant
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function GuestsSetupStep({ completed, onSetup }: { completed: boolean; onSetup: () => void }) {
  return (
    <div className="space-y-4">
      {completed ? (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
              <div>
                <p className="font-semibold text-green-900">Invités ajoutés !</p>
                <p className="text-sm text-green-700">
                  Vous avez déjà des invités dans votre liste.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Ajoutez vos invités</CardTitle>
            <CardDescription>
              Importez votre liste d'invités ou ajoutez-les manuellement.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="font-medium mb-1">Importer depuis CSV</p>
                <p className="text-sm text-muted-foreground">
                  Préparez un fichier avec nom, prénom, email
                </p>
              </div>
              <div className="text-center text-sm text-muted-foreground">ou</div>
              <div className="border rounded-lg p-6 text-center">
                <Users className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="font-medium mb-1">Ajouter manuellement</p>
                <p className="text-sm text-muted-foreground">
                  Saisissez les informations de chaque invité
                </p>
              </div>
            </div>

            <Button onClick={onSetup} className="w-full">
              <Users className="h-4 w-4 mr-2" />
              Gérer les invités
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function TemplateSetupStep({ completed, onSetup }: { completed: boolean; onSetup: () => void }) {
  return (
    <div className="space-y-4">
      {completed ? (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
              <div>
                <p className="font-semibold text-green-900">Template d'invitation créé !</p>
                <p className="text-sm text-green-700">
                  Votre email d'invitation est prêt à être envoyé.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Créez votre email d'invitation</CardTitle>
            <CardDescription>
              Utilisez notre éditeur visuel pour personnaliser votre invitation.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border rounded-lg p-4 bg-muted/50">
              <h4 className="font-medium mb-2">Templates prédéfinis</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Choisissez parmi nos designs professionnels et personnalisez-les à votre goût.
              </p>
              <div className="grid grid-cols-3 gap-2">
                <div className="aspect-[3/4] border-2 rounded bg-white"></div>
                <div className="aspect-[3/4] border-2 rounded bg-white"></div>
                <div className="aspect-[3/4] border-2 rounded bg-white"></div>
              </div>
            </div>

            <Button onClick={onSetup} className="w-full">
              <FileText className="h-4 w-4 mr-2" />
              Créer mon invitation
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function ReadyStep({ eventId }: { eventId: string }) {
  const router = useRouter()

  return (
    <div className="space-y-4">
      <div className="text-center py-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-green-600 mb-4">
          <Rocket className="h-8 w-8 text-white" />
        </div>
        <h3 className="text-xl font-semibold mb-2">
          Félicitations ! 🎉
        </h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Votre événement est configuré et prêt. Vous pouvez maintenant envoyer vos invitations !
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Prochaines étapes suggérées :</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => router.push(`/admin/events/${eventId}/communications`)}
          >
            <Mail className="h-4 w-4 mr-2" />
            Envoyer les invitations
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => router.push(`/admin/events/${eventId}/emails`)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Voir le Hub des Emails
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => router.push(`/admin/events/${eventId}`)}
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Voir le tableau de bord
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
