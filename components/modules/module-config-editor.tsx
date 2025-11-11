"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Loader2, Save, CheckCircle } from 'lucide-react'
import { ModuleType } from '@/lib/modules/types'

interface ModuleConfigEditorProps {
  eventId: string
  moduleType: ModuleType
  initialConfig?: any
  onSave?: () => void
}

// Configurations spécifiques par type de module
const MODULE_CONFIG_SCHEMAS: Record<ModuleType, any> = {
  TRANSPORT: {
    title: 'Configuration Transport',
    description: 'Paramètres pour la gestion des transports',
    fields: [
      {
        key: 'allowGuestBooking',
        label: 'Permettre aux invités de réserver',
        type: 'switch',
        description: 'Les invités peuvent créer leurs propres réservations'
      },
      {
        key: 'requireApproval',
        label: 'Nécessite une approbation',
        type: 'switch',
        description: 'Les réservations doivent être approuvées par un admin'
      },
      {
        key: 'defaultCurrency',
        label: 'Devise par défaut',
        type: 'select',
        options: ['EUR', 'USD', 'GBP', 'CHF'],
        default: 'EUR'
      },
      {
        key: 'notificationEmails',
        label: 'Emails de notification',
        type: 'text',
        description: 'Emails séparés par des virgules'
      }
    ]
  },
  ACCOMMODATION: {
    title: 'Configuration Hébergement',
    description: 'Paramètres pour la gestion des hébergements',
    fields: [
      {
        key: 'allowRoomPreferences',
        label: 'Préférences de chambre',
        type: 'switch',
        description: 'Permettre aux invités de spécifier des préférences'
      },
      {
        key: 'autoAssignment',
        label: 'Attribution automatique',
        type: 'switch',
        description: 'Assigner automatiquement les chambres'
      },
      {
        key: 'maxNightsPerGuest',
        label: 'Nombre max de nuits',
        type: 'number',
        default: 7
      }
    ]
  },
  PROGRAM: {
    title: 'Configuration Programme',
    description: 'Paramètres pour la gestion du programme',
    fields: [
      {
        key: 'allowSessionRegistration',
        label: 'Inscription aux sessions',
        type: 'switch',
        description: 'Permettre aux invités de s\'inscrire aux sessions'
      },
      {
        key: 'showCapacity',
        label: 'Afficher les capacités',
        type: 'switch',
        description: 'Afficher le nombre de places disponibles'
      }
    ]
  },
  BUDGET: {
    title: 'Configuration Budget',
    description: 'Paramètres pour la gestion du budget',
    fields: [
      {
        key: 'currency',
        label: 'Devise',
        type: 'select',
        options: ['EUR', 'USD', 'GBP', 'CHF'],
        default: 'EUR'
      },
      {
        key: 'budgetAlertThreshold',
        label: 'Seuil d\'alerte (%)',
        type: 'number',
        description: 'Recevoir une alerte quand le budget atteint ce %',
        default: 80
      }
    ]
  },
  REGISTRATION_PAYMENT: {
    title: 'Configuration Inscription & Paiement',
    description: 'Paramètres pour les inscriptions et paiements',
    fields: [
      {
        key: 'requirePayment',
        label: 'Paiement requis',
        type: 'switch',
        description: 'Les invités doivent payer pour confirmer'
      },
      {
        key: 'paymentProvider',
        label: 'Fournisseur de paiement',
        type: 'select',
        options: ['Stripe', 'PayPal', 'Square'],
        default: 'Stripe'
      },
      {
        key: 'defaultAmount',
        label: 'Montant par défaut',
        type: 'number',
        default: 0
      }
    ]
  },
  MULTILANG: {
    title: 'Configuration Multi-langue',
    description: 'Paramètres pour le support multi-langues',
    fields: [
      {
        key: 'enabledLanguages',
        label: 'Langues activées',
        type: 'text',
        description: 'Codes ISO (fr,en,es,de)',
        default: 'fr,en'
      },
      {
        key: 'defaultLanguage',
        label: 'Langue par défaut',
        type: 'select',
        options: ['fr', 'en', 'es', 'de'],
        default: 'fr'
      }
    ]
  }
}

export function ModuleConfigEditor({ eventId, moduleType, initialConfig, onSave }: ModuleConfigEditorProps) {
  const schema = MODULE_CONFIG_SCHEMAS[moduleType]
  const [config, setConfig] = useState(initialConfig || {})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)

    try {
      const response = await fetch(`/api/admin/events/${eventId}/modules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleType,
          isActive: true,
          config
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save config')
      }

      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      onSave?.()
    } catch (error) {
      console.error('Error saving config:', error)
    } finally {
      setSaving(false)
    }
  }

  const updateField = (key: string, value: any) => {
    setConfig((prev: any) => ({ ...prev, [key]: value }))
  }

  if (!schema) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-[#004645]/60">
          Aucune configuration disponible pour ce module
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur">
      <CardHeader>
        <CardTitle className="text-[#004645]">{schema.title}</CardTitle>
        <CardDescription>{schema.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {schema.fields.map((field: any) => (
          <div key={field.key} className="space-y-2">
            <Label htmlFor={field.key} className="text-[#004645]">
              {field.label}
            </Label>

            {field.type === 'switch' && (
              <div className="flex items-center justify-between p-4 bg-[#9CD9F6]/5 rounded-lg border border-[#9CD9F6]/30">
                <div className="flex-1">
                  <p className="text-sm text-[#004645]/70">{field.description}</p>
                </div>
                <Switch
                  id={field.key}
                  checked={config[field.key] ?? field.default ?? false}
                  onCheckedChange={(checked) => updateField(field.key, checked)}
                />
              </div>
            )}

            {field.type === 'text' && (
              <>
                <Input
                  id={field.key}
                  value={config[field.key] ?? field.default ?? ''}
                  onChange={(e) => updateField(field.key, e.target.value)}
                  className="border-[#9CD9F6]/30"
                />
                {field.description && (
                  <p className="text-xs text-[#004645]/60">{field.description}</p>
                )}
              </>
            )}

            {field.type === 'number' && (
              <>
                <Input
                  id={field.key}
                  type="number"
                  value={config[field.key] ?? field.default ?? 0}
                  onChange={(e) => updateField(field.key, parseInt(e.target.value) || 0)}
                  className="border-[#9CD9F6]/30"
                />
                {field.description && (
                  <p className="text-xs text-[#004645]/60">{field.description}</p>
                )}
              </>
            )}

            {field.type === 'select' && (
              <>
                <select
                  id={field.key}
                  value={config[field.key] ?? field.default ?? field.options[0]}
                  onChange={(e) => updateField(field.key, e.target.value)}
                  className="w-full px-3 py-2 border border-[#9CD9F6]/30 rounded-md bg-white"
                >
                  {field.options.map((option: string) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                {field.description && (
                  <p className="text-xs text-[#004645]/60">{field.description}</p>
                )}
              </>
            )}
          </div>
        ))}

        <div className="flex items-center justify-between pt-4 border-t border-[#9CD9F6]/30">
          <div>
            {saved && (
              <p className="text-sm text-green-600 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Configuration sauvegardée
              </p>
            )}
          </div>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#FF4713] hover:bg-[#FF6B3D] text-white"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sauvegarde...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Sauvegarder
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
