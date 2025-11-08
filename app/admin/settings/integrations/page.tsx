"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Mail, Check, AlertCircle, Send, Settings, Zap, Shield, BarChart3, ExternalLink
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface EmailIntegration {
  id: string
  provider: 'SENDGRID' | 'RESEND' | 'MAILGUN' | 'SMTP'
  isActive: boolean
  isPrimary: boolean
  apiKey?: string
  apiSecret?: string
  smtpHost?: string
  smtpPort?: number
  smtpUser?: string
  smtpPass?: string
  fromEmail?: string
  fromName?: string
  replyTo?: string
  trackOpens: boolean
  trackClicks: boolean
  dailyLimit?: number
  monthlyLimit?: number
  lastTestedAt?: string
  lastUsedAt?: string
}

const providers = [
  {
    id: 'SENDGRID',
    name: 'SendGrid',
    icon: Mail,
    description: 'Service email professionnel de Twilio avec délivrabilité optimale',
    color: '#1A82E2',
    docsUrl: 'https://docs.sendgrid.com/api-reference/how-to-use-the-sendgrid-v3-api/authentication',
    features: ['API REST', 'Webhooks', 'Analytics', 'Templates'],
  },
  {
    id: 'RESEND',
    name: 'Resend',
    icon: Zap,
    description: 'Service email moderne pour développeurs avec excellente délivrabilité',
    color: '#000000',
    docsUrl: 'https://resend.com/docs/introduction',
    features: ['API simple', 'React emails', 'Analytics', 'Webhooks'],
  },
  {
    id: 'MAILGUN',
    name: 'Mailgun',
    icon: Send,
    description: 'Service email puissant avec validation et routage avancés',
    color: '#F06543',
    docsUrl: 'https://documentation.mailgun.com/en/latest/api-intro.html',
    features: ['API REST', 'Validation emails', 'Routing', 'Analytics'],
  },
  {
    id: 'SMTP',
    name: 'SMTP Custom',
    icon: Settings,
    description: 'Configurez votre propre serveur SMTP',
    color: '#6B7280',
    docsUrl: null,
    features: ['Flexible', 'Contrôle total', 'Auto-hébergé'],
  },
]

export default function IntegrationsPage() {
  const { toast } = useToast()
  const [integrations, setIntegrations] = useState<EmailIntegration[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState<string | null>(null)

  useEffect(() => {
    fetchIntegrations()
  }, [])

  const fetchIntegrations = async () => {
    try {
      const response = await fetch('/api/admin/integrations/email')
      if (response.ok) {
        const data = await response.json()
        setIntegrations(data)
      }
    } catch (error) {
      console.error('Error fetching integrations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (provider: string, config: Partial<EmailIntegration>) => {
    setSaving(true)
    try {
      const response = await fetch('/api/admin/integrations/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, ...config }),
      })

      if (response.ok) {
        toast({
          title: 'Configuration enregistrée',
          description: 'L\'intégration a été configurée avec succès',
        })
        fetchIntegrations()
      } else {
        const error = await response.json()
        toast({
          title: 'Erreur',
          description: error.message || 'Impossible de sauvegarder la configuration',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleTest = async (integrationId: string) => {
    setTesting(integrationId)
    try {
      const response = await fetch(`/api/admin/integrations/email/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ integrationId }),
      })

      if (response.ok) {
        toast({
          title: 'Test réussi',
          description: 'Un email de test a été envoyé avec succès',
        })
        fetchIntegrations()
      } else {
        const error = await response.json()
        toast({
          title: 'Test échoué',
          description: error.message || 'Impossible d\'envoyer l\'email de test',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors du test',
        variant: 'destructive',
      })
    } finally {
      setTesting(null)
    }
  }

  const getIntegration = (provider: string) => {
    return integrations.find(i => i.provider === provider)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Mail className="h-12 w-12 text-[#009197] mx-auto mb-4 animate-pulse" />
          <p className="text-[#004645]/70">Chargement des intégrations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#9CD9F6] via-white to-[#9CD9F6] p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-[#004645] mb-2" style={{ fontFamily: "var(--font-abril)" }}>
            Intégrations Email
          </h1>
          <p className="text-[#004645]/70">
            Configurez vos services d'envoi d'emails et gérez vos intégrations
          </p>
        </div>

        {/* Active Integration Card */}
        {integrations.some(i => i.isPrimary) && (
          <Card className="border-green-500/30 bg-green-50/50 backdrop-blur">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-100">
                    <Check className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-[#004645]">Intégration active</CardTitle>
                    <CardDescription>
                      {providers.find(p => p.id === integrations.find(i => i.isPrimary)?.provider)?.name} est configuré comme provider principal
                    </CardDescription>
                  </div>
                </div>
                <Badge className="bg-green-600">Actif</Badge>
              </div>
            </CardHeader>
          </Card>
        )}

        {/* Warning if no active integration */}
        {!integrations.some(i => i.isPrimary) && (
          <Card className="border-orange-500/30 bg-orange-50/50 backdrop-blur">
            <CardHeader>
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                <div>
                  <CardTitle className="text-[#004645]">Aucune intégration active</CardTitle>
                  <CardDescription>
                    Configurez au moins un provider d'email pour pouvoir envoyer des invitations
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        )}

        {/* Providers Tabs */}
        <Tabs defaultValue="SENDGRID" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            {providers.map(provider => (
              <TabsTrigger key={provider.id} value={provider.id} className="flex items-center gap-2">
                <provider.icon className="h-4 w-4" />
                {provider.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {providers.map(provider => (
            <TabsContent key={provider.id} value={provider.id}>
              <ProviderConfig
                provider={provider}
                integration={getIntegration(provider.id)}
                onSave={handleSave}
                onTest={handleTest}
                saving={saving}
                testing={testing === getIntegration(provider.id)?.id}
              />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  )
}

interface ProviderConfigProps {
  provider: typeof providers[0]
  integration?: EmailIntegration
  onSave: (provider: string, config: Partial<EmailIntegration>) => Promise<void>
  onTest: (integrationId: string) => Promise<void>
  saving: boolean
  testing: boolean
}

function ProviderConfig({ provider, integration, onSave, onTest, saving, testing }: ProviderConfigProps) {
  const [config, setConfig] = useState<Partial<EmailIntegration>>(integration || {})

  useEffect(() => {
    if (integration) {
      setConfig(integration)
    }
  }, [integration])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(provider.id, config)
  }

  return (
    <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg" style={{ backgroundColor: `${provider.color}20` }}>
              <provider.icon className="h-6 w-6" style={{ color: provider.color }} />
            </div>
            <div>
              <CardTitle className="text-[#004645]">{provider.name}</CardTitle>
              <CardDescription>{provider.description}</CardDescription>
            </div>
          </div>
          {provider.docsUrl && (
            <a
              href={provider.docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-[#009197] hover:text-[#004645]"
            >
              Documentation
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Features */}
          <div className="flex flex-wrap gap-2">
            {provider.features.map(feature => (
              <Badge key={feature} variant="secondary" className="bg-[#9CD9F6]/20">
                {feature}
              </Badge>
            ))}
          </div>

          {/* Configuration fields based on provider */}
          {provider.id === 'SMTP' ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtpHost">Host SMTP</Label>
                  <Input
                    id="smtpHost"
                    value={config.smtpHost || ''}
                    onChange={(e) => setConfig({ ...config, smtpHost: e.target.value })}
                    placeholder="smtp.example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPort">Port</Label>
                  <Input
                    id="smtpPort"
                    type="number"
                    value={config.smtpPort || 587}
                    onChange={(e) => setConfig({ ...config, smtpPort: parseInt(e.target.value) })}
                    placeholder="587"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtpUser">Utilisateur</Label>
                  <Input
                    id="smtpUser"
                    value={config.smtpUser || ''}
                    onChange={(e) => setConfig({ ...config, smtpUser: e.target.value })}
                    placeholder="user@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPass">Mot de passe</Label>
                  <Input
                    id="smtpPass"
                    type="password"
                    value={config.smtpPass || ''}
                    onChange={(e) => setConfig({ ...config, smtpPass: e.target.value })}
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  value={config.apiKey || ''}
                  onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                  placeholder={`Votre clé API ${provider.name}`}
                />
              </div>
              {provider.id === 'MAILGUN' && (
                <div className="space-y-2">
                  <Label htmlFor="apiSecret">Domain</Label>
                  <Input
                    id="apiSecret"
                    value={config.apiSecret || ''}
                    onChange={(e) => setConfig({ ...config, apiSecret: e.target.value })}
                    placeholder="mg.example.com"
                  />
                </div>
              )}
            </div>
          )}

          {/* Sender configuration */}
          <div className="pt-4 border-t border-[#9CD9F6]/30">
            <h3 className="font-semibold text-[#004645] mb-4">Configuration de l'expéditeur</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fromEmail">Email expéditeur</Label>
                <Input
                  id="fromEmail"
                  type="email"
                  value={config.fromEmail || ''}
                  onChange={(e) => setConfig({ ...config, fromEmail: e.target.value })}
                  placeholder="noreply@weevup.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fromName">Nom expéditeur</Label>
                <Input
                  id="fromName"
                  value={config.fromName || ''}
                  onChange={(e) => setConfig({ ...config, fromName: e.target.value })}
                  placeholder="Weevup Events"
                />
              </div>
            </div>
            <div className="space-y-2 mt-4">
              <Label htmlFor="replyTo">Email de réponse (optionnel)</Label>
              <Input
                id="replyTo"
                type="email"
                value={config.replyTo || ''}
                onChange={(e) => setConfig({ ...config, replyTo: e.target.value })}
                placeholder="contact@weevup.com"
              />
            </div>
          </div>

          {/* Tracking & Features */}
          <div className="pt-4 border-t border-[#9CD9F6]/30">
            <h3 className="font-semibold text-[#004645] mb-4">Tracking & Fonctionnalités</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Tracking d'ouverture</Label>
                  <p className="text-sm text-[#004645]/70">Suivre quand les emails sont ouverts</p>
                </div>
                <Switch
                  checked={config.trackOpens ?? true}
                  onCheckedChange={(checked) => setConfig({ ...config, trackOpens: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Tracking de clics</Label>
                  <p className="text-sm text-[#004645]/70">Suivre les clics sur les liens</p>
                </div>
                <Switch
                  checked={config.trackClicks ?? true}
                  onCheckedChange={(checked) => setConfig({ ...config, trackClicks: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Définir comme provider principal</Label>
                  <p className="text-sm text-[#004645]/70">Utiliser par défaut pour tous les envois</p>
                </div>
                <Switch
                  checked={config.isPrimary ?? false}
                  onCheckedChange={(checked) => setConfig({ ...config, isPrimary: checked })}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-[#9CD9F6]/30">
            <Button
              type="submit"
              disabled={saving}
              className="bg-gradient-to-r from-[#004645] to-[#009197] hover:from-[#006C51] hover:to-[#009197] text-white"
            >
              <Shield className="h-4 w-4 mr-2" />
              {saving ? 'Enregistrement...' : 'Enregistrer la configuration'}
            </Button>

            {integration && (
              <Button
                type="button"
                variant="outline"
                onClick={() => onTest(integration.id)}
                disabled={testing}
                className="border-[#009197] text-[#009197] hover:bg-[#009197] hover:text-white"
              >
                <Send className="h-4 w-4 mr-2" />
                {testing ? 'Test en cours...' : 'Tester la connexion'}
              </Button>
            )}
          </div>

          {/* Status info */}
          {integration && (
            <div className="pt-4 border-t border-[#9CD9F6]/30">
              <div className="grid grid-cols-3 gap-4 text-sm">
                {integration.lastTestedAt && (
                  <div>
                    <p className="text-[#004645]/70">Dernier test</p>
                    <p className="font-semibold text-[#004645]">
                      {new Date(integration.lastTestedAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                )}
                {integration.lastUsedAt && (
                  <div>
                    <p className="text-[#004645]/70">Dernière utilisation</p>
                    <p className="font-semibold text-[#004645]">
                      {new Date(integration.lastUsedAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                )}
                {integration.isActive && (
                  <div>
                    <p className="text-[#004645]/70">Statut</p>
                    <Badge className="bg-green-600">Actif</Badge>
                  </div>
                )}
              </div>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
