"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Shield, CheckCircle, XCircle, AlertTriangle, RefreshCw,
  Key, Info, Copy, Check
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

interface EncryptionStatus {
  isEncrypted?: boolean
  canDecrypt?: boolean
  keyFormat?: string
  startsWithSG?: boolean
  keyLength?: number
  hasSpaces?: boolean
  hasNewlines?: boolean
  error?: string
  rawKeyPreview?: string
  hasApiKey?: boolean
}

interface IntegrationDiagnostic {
  id: string
  provider: string
  isActive: boolean
  isPrimary: boolean
  fromEmail: string | null
  encryptionStatus: EncryptionStatus
  createdAt: string
  updatedAt: string
}

interface DiagnosticData {
  integrations: IntegrationDiagnostic[]
  encryptionKeySet: boolean
  timestamp: string
}

export default function EmailIntegrationDebugPage() {
  const [data, setData] = useState<DiagnosticData | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/integrations/email/debug')
      if (response.ok) {
        const result = await response.json()
        setData(result)
      }
    } catch (error) {
      console.error('Error fetching debug data:', error)
      toast.error('Erreur lors du chargement des diagnostics')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopied(label)
    toast.success('Copié dans le presse-papier')
    setTimeout(() => setCopied(null), 2000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="h-8 w-8 animate-spin text-[#009197]" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="p-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>
            Impossible de charger les données de diagnostic
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#004645]" style={{ fontFamily: "var(--font-abril)" }}>
            Diagnostic Intégrations Email
          </h1>
          <p className="text-[#004645]/70 mt-1">
            Vérification du chiffrement et déchiffrement des clés API
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/settings/integrations">
            <Button variant="outline" className="border-[#009197] text-[#009197]">
              Retour aux intégrations
            </Button>
          </Link>
          <Button onClick={fetchData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Encryption Key Status */}
      <Card className={`border-2 ${data.encryptionKeySet ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className={`h-5 w-5 ${data.encryptionKeySet ? 'text-green-600' : 'text-red-600'}`} />
            Clé de chiffrement (ENCRYPTION_KEY)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.encryptionKeySet ? (
            <div className="space-y-2">
              <p className="text-green-800 font-semibold">✓ ENCRYPTION_KEY est définie</p>
              <p className="text-sm text-green-700">
                La clé de chiffrement est configurée dans les variables d&apos;environnement.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-red-800 font-semibold">✗ ENCRYPTION_KEY n&apos;est PAS définie</p>
              <p className="text-sm text-red-700">
                ATTENTION : En production, vous devez définir ENCRYPTION_KEY dans vos variables d&apos;environnement.
              </p>
              <code className="block bg-red-100 p-2 rounded text-xs mt-2">
                Générer une clé : openssl rand -hex 32
              </code>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Integrations Diagnostics */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-[#004645]">
          Intégrations ({data.integrations.length})
        </h2>

        {data.integrations.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Key className="h-12 w-12 mx-auto mb-3 text-[#004645]/30" />
              <p className="text-[#004645]/70">Aucune intégration email configurée</p>
              <Link href="/admin/settings/integrations">
                <Button className="mt-4">Ajouter une intégration</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          data.integrations.map((integration) => {
            const hasIssue = integration.encryptionStatus.error ||
                           !integration.encryptionStatus.canDecrypt ||
                           integration.encryptionStatus.hasSpaces ||
                           integration.encryptionStatus.hasNewlines ||
                           (integration.provider === 'SENDGRID' && !integration.encryptionStatus.startsWithSG)

            return (
              <Card
                key={integration.id}
                className={`border-2 ${
                  hasIssue
                    ? 'border-red-200 bg-red-50'
                    : integration.encryptionStatus.canDecrypt
                    ? 'border-green-200 bg-green-50'
                    : 'border-gray-200'
                }`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      {integration.encryptionStatus.canDecrypt && !hasIssue ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : hasIssue ? (
                        <XCircle className="h-5 w-5 text-red-600" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-orange-600" />
                      )}
                      {integration.provider}
                    </CardTitle>
                    <div className="flex gap-2">
                      {integration.isActive && (
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          Active
                        </Badge>
                      )}
                      {integration.isPrimary && (
                        <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                          Primaire
                        </Badge>
                      )}
                    </div>
                  </div>
                  {integration.fromEmail && (
                    <CardDescription>Email expéditeur : {integration.fromEmail}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* API Key Status */}
                  {integration.encryptionStatus.hasApiKey === false ? (
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertTitle>Aucune clé API</AlertTitle>
                      <AlertDescription>
                        Cette intégration n&apos;a pas de clé API configurée
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="p-3 bg-white rounded border">
                          <div className="font-medium text-[#004645] mb-1">Chiffrée</div>
                          <div className="flex items-center gap-2">
                            {integration.encryptionStatus.isEncrypted ? (
                              <>
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span className="text-green-700">Oui</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="h-4 w-4 text-red-600" />
                                <span className="text-red-700">Non</span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="p-3 bg-white rounded border">
                          <div className="font-medium text-[#004645] mb-1">Déchiffrable</div>
                          <div className="flex items-center gap-2">
                            {integration.encryptionStatus.canDecrypt ? (
                              <>
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span className="text-green-700">Oui</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="h-4 w-4 text-red-600" />
                                <span className="text-red-700">Non</span>
                              </>
                            )}
                          </div>
                        </div>

                        {integration.encryptionStatus.keyLength !== undefined && (
                          <div className="p-3 bg-white rounded border">
                            <div className="font-medium text-[#004645] mb-1">Longueur clé</div>
                            <div className="text-[#004645]/70">
                              {integration.encryptionStatus.keyLength} caractères
                            </div>
                          </div>
                        )}

                        {integration.provider === 'SENDGRID' && (
                          <div className="p-3 bg-white rounded border">
                            <div className="font-medium text-[#004645] mb-1">Format SendGrid</div>
                            <div className="flex items-center gap-2">
                              {integration.encryptionStatus.startsWithSG ? (
                                <>
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                  <span className="text-green-700">Valide (SG.xxx)</span>
                                </>
                              ) : (
                                <>
                                  <XCircle className="h-4 w-4 text-red-600" />
                                  <span className="text-red-700">Invalide</span>
                                </>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Key Preview */}
                      {integration.encryptionStatus.keyFormat && (
                        <div className="p-3 bg-white rounded border">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-medium text-[#004645]">Aperçu clé déchiffrée</div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(integration.encryptionStatus.keyFormat!, integration.id)}
                            >
                              {copied === integration.id ? (
                                <Check className="h-4 w-4 text-green-600" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          <code className="text-xs font-mono">{integration.encryptionStatus.keyFormat}</code>
                        </div>
                      )}

                      {/* Issues */}
                      {(integration.encryptionStatus.hasSpaces || integration.encryptionStatus.hasNewlines) && (
                        <Alert variant="destructive">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertTitle>Problème détecté</AlertTitle>
                          <AlertDescription className="space-y-1">
                            {integration.encryptionStatus.hasSpaces && (
                              <div>• La clé contient des espaces</div>
                            )}
                            {integration.encryptionStatus.hasNewlines && (
                              <div>• La clé contient des retours à la ligne</div>
                            )}
                            <div className="mt-2 font-semibold">
                              Solution : Copiez-collez à nouveau la clé API en vous assurant qu&apos;elle ne contient que des caractères alphanumériques et points.
                            </div>
                          </AlertDescription>
                        </Alert>
                      )}

                      {integration.encryptionStatus.error && (
                        <Alert variant="destructive">
                          <XCircle className="h-4 w-4" />
                          <AlertTitle>Erreur de déchiffrement</AlertTitle>
                          <AlertDescription>
                            <div>{integration.encryptionStatus.error}</div>
                            {integration.encryptionStatus.rawKeyPreview && (
                              <code className="block mt-2 text-xs bg-red-100 p-2 rounded">
                                {integration.encryptionStatus.rawKeyPreview}
                              </code>
                            )}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="text-xs text-[#004645]/50 pt-2 border-t">
                    <div>Créée : {new Date(integration.createdAt).toLocaleString('fr-FR')}</div>
                    <div>Modifiée : {new Date(integration.updatedAt).toLocaleString('fr-FR')}</div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Recommendations */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-800 flex items-center gap-2">
            <Info className="h-5 w-5" />
            Recommandations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-blue-800">
          <div>✓ La clé API SendGrid doit commencer par <code className="bg-blue-100 px-1 rounded">SG.</code></div>
          <div>✓ Pas d&apos;espaces avant/après la clé lors du copier-coller</div>
          <div>✓ Pas de retours à la ligne dans la clé</div>
          <div>✓ La clé doit faire environ 69-72 caractères</div>
          <div>✓ ENCRYPTION_KEY doit être identique entre tous les déploiements</div>
        </CardContent>
      </Card>
    </div>
  )
}
