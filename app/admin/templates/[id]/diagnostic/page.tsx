"use client"

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Image as ImageIcon,
  FileText,
  Info,
  RefreshCw,
  ArrowLeft
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

interface DiagnosticData {
  templateId: string
  templateName: string
  hasBlocksJson: boolean
  totalBlocks: number
  imageBlocksCount: number
  hasImages: boolean
  imageStats: Array<{
    blockId: string
    blockType: string
    url: string
    isDataUrl: boolean
    isAbsoluteUrl: boolean
    isRelativeUrl: boolean
    length: number
    estimatedSize: string
  }>
  htmlImagesCount: number
  htmlImages: string[]
  htmlContentLength: number
  lastUsedAt: string | null
  usageCount: number
  isActive: boolean
}

export default function TemplateDiagnosticPage() {
  const params = useParams()
  const templateId = params.id as string

  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<DiagnosticData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadDiagnostic = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/templates/${templateId}/debug`)

      if (!response.ok) {
        throw new Error('Impossible de charger les données de diagnostic')
      }

      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      toast.error('Erreur lors du chargement du diagnostic')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDiagnostic()
  }, [templateId])

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-[#009197]" />
            <p className="text-[#004645]">Analyse du template en cours...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error || 'Données non disponibles'}</AlertDescription>
        </Alert>
      </div>
    )
  }

  const imageIssues = data.imageStats.filter(img => img.isRelativeUrl)
  const largeImages = data.imageStats.filter(img => {
    const sizeMB = img.length / (1024 * 1024)
    return sizeMB > 1
  })
  const hasIssues = imageIssues.length > 0 || largeImages.length > 0

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#004645]">Diagnostic du Template</h1>
          <p className="text-[#004645]/60 mt-1">{data.templateName}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadDiagnostic}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Rafraîchir
          </Button>
          <Link href={`/admin/events`}>
            <Button variant="ghost">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </Link>
        </div>
      </div>

      {/* Status Overview */}
      <Card className={hasIssues ? "border-orange-300 bg-orange-50/50" : "border-green-300 bg-green-50/50"}>
        <CardHeader>
          <div className="flex items-center gap-3">
            {hasIssues ? (
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            ) : (
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            )}
            <div>
              <CardTitle className={hasIssues ? "text-orange-900" : "text-green-900"}>
                {hasIssues ? 'Problèmes détectés' : 'Template OK'}
              </CardTitle>
              <CardDescription>
                {hasIssues
                  ? 'Des problèmes ont été détectés qui pourraient empêcher l\'affichage des images'
                  : 'Aucun problème majeur détecté avec ce template'
                }
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* General Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Informations Générales
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-[#004645]/60">ID du template :</span>
            <code className="text-xs bg-gray-100 px-2 py-1 rounded">{data.templateId}</code>
          </div>
          <div className="flex justify-between">
            <span className="text-[#004645]/60">Blocks JSON :</span>
            <Badge variant={data.hasBlocksJson ? "default" : "secondary"}>
              {data.hasBlocksJson ? 'Disponible' : 'Non disponible'}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-[#004645]/60">Nombre de blocks :</span>
            <span className="font-medium">{data.totalBlocks}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#004645]/60">Taille HTML :</span>
            <span className="font-medium">{Math.round(data.htmlContentLength / 1024)} KB</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#004645]/60">Utilisé :</span>
            <span className="font-medium">{data.usageCount} fois</span>
          </div>
        </CardContent>
      </Card>

      {/* Images Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Analyse des Images
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-[#004645]">{data.imageBlocksCount}</div>
              <div className="text-sm text-[#004645]/60">Blocks d'images</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-[#004645]">{data.htmlImagesCount}</div>
              <div className="text-sm text-[#004645]/60">Images dans HTML</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-[#004645]">{data.imageStats.length}</div>
              <div className="text-sm text-[#004645]/60">Total URLs d'images</div>
            </div>
          </div>

          {/* Image Issues */}
          {imageIssues.length > 0 && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>{imageIssues.length} image(s) avec URLs relatives détectée(s)</strong>
                <p className="mt-2 text-sm">
                  Les URLs relatives ne fonctionnent pas dans les emails. Les images doivent utiliser des URLs absolues (https://) ou être converties en base64.
                </p>
              </AlertDescription>
            </Alert>
          )}

          {largeImages.length > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>{largeImages.length} image(s) volumineuse(s) détectée(s)</strong>
                <p className="mt-2 text-sm">
                  Les images base64 de plus de 1MB peuvent causer des problèmes avec certains clients email.
                </p>
              </AlertDescription>
            </Alert>
          )}

          {/* Detailed Image Stats */}
          {data.imageStats.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold text-[#004645] mb-3">Détails des images :</h4>
              {data.imageStats.map((img, idx) => (
                <div key={idx} className="p-3 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <Badge variant="outline" className="mb-2">{img.blockType}</Badge>
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded block break-all">
                        {img.url}
                      </code>
                    </div>
                    <div className="ml-3 text-right">
                      <div className="text-sm font-medium">{img.estimatedSize}</div>
                      {img.isDataUrl && <Badge variant="default" className="mt-1">Base64</Badge>}
                      {img.isAbsoluteUrl && <Badge variant="default" className="mt-1">Absolue</Badge>}
                      {img.isRelativeUrl && <Badge variant="destructive" className="mt-1">Relative</Badge>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {data.imageStats.length === 0 && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Aucune image détectée dans ce template. Si vous avez ajouté des images, assurez-vous d'avoir sauvegardé le template.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Recommendations */}
      {hasIssues && (
        <Card className="border-[#009197]">
          <CardHeader>
            <CardTitle className="text-[#004645]">Recommandations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-[#009197] mt-0.5" />
              <div>
                <p className="font-medium text-[#004645]">Utilisez des images optimisées</p>
                <p className="text-sm text-[#004645]/60">Compressez vos images avant de les uploader (max 500KB recommandé)</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-[#009197] mt-0.5" />
              <div>
                <p className="font-medium text-[#004645]">Vérifiez le format</p>
                <p className="text-sm text-[#004645]/60">Les images sont automatiquement converties en base64. Évitez les images trop grandes.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-[#009197] mt-0.5" />
              <div>
                <p className="font-medium text-[#004645]">Testez avant d'envoyer</p>
                <p className="text-sm text-[#004645]/60">Utilisez la fonction "Email de test" pour vérifier que les images s'affichent correctement</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
