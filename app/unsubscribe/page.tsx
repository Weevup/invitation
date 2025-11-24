'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { CheckCircle, Mail, Loader2 } from 'lucide-react'

function UnsubscribeForm() {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [alreadyUnsubscribed, setAlreadyUnsubscribed] = useState(false)

  // Pre-fill email from URL params if available
  useEffect(() => {
    const emailParam = searchParams.get('email')
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam))
    }
  }, [searchParams])

  const handleUnsubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const token = searchParams.get('token')
      const response = await fetch('/api/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          reason: reason.trim() || undefined,
          token: token || undefined
        })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        if (data.alreadyUnsubscribed) {
          setAlreadyUnsubscribed(true)
        }
      } else {
        setError(data.error || 'Une erreur est survenue')
      }
    } catch (err) {
      setError('Impossible de se connecter au serveur')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-green-200">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">
              {alreadyUnsubscribed ? 'Déjà désinscrit' : 'Désinscription réussie'}
            </CardTitle>
            <CardDescription className="mt-2">
              {alreadyUnsubscribed
                ? 'Vous êtes déjà désinscrit de nos emails.'
                : 'Vous ne recevrez plus d\'emails de notre part.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center text-sm text-muted-foreground">
            <p>
              Si vous changez d&apos;avis, vous pouvez contacter l&apos;organisateur de l&apos;événement pour vous réabonner.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
            <Mail className="h-8 w-8 text-orange-600" />
          </div>
          <CardTitle className="text-2xl">Se désinscrire</CardTitle>
          <CardDescription className="mt-2">
            Vous ne recevrez plus d&apos;emails de notre part
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUnsubscribe} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Adresse email</Label>
              <Input
                id="email"
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">
                Raison (optionnel)
              </Label>
              <Textarea
                id="reason"
                placeholder="Pourquoi vous désabonnez-vous ?"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={loading}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                Cela nous aide à améliorer nos communications
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-orange-600 hover:bg-orange-700"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Traitement...
                </>
              ) : (
                'Me désinscrire'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
              <Mail className="h-8 w-8 text-orange-600" />
            </div>
            <CardTitle className="text-2xl">Chargement...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    }>
      <UnsubscribeForm />
    </Suspense>
  )
}
