'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'

export default function SetupPage() {
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'exists' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const [credentials, setCredentials] = useState<{ email: string; password: string } | null>(null)

  useEffect(() => {
    async function setupAdmin() {
      try {
        const response = await fetch('/api/setup-admin', {
          method: 'POST',
        })
        const data = await response.json()

        if (response.ok) {
          setStatus('success')
          setMessage('Compte admin créé avec succès')
          setCredentials(data.credentials)
        } else if (response.status === 403) {
          setStatus('exists')
          setMessage('Un compte admin existe déjà')
          setCredentials({ email: 'julien.boisard@weevup.fr', password: 'Weevup2025!' })
        } else {
          setStatus('error')
          setMessage(data.error || 'Erreur inconnue')
        }
      } catch (error) {
        setStatus('error')
        setMessage(error instanceof Error ? error.message : 'Erreur de connexion')
      }
    }

    setupAdmin()
  }, [])

  const goToLogin = () => {
    router.push('/admin/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#004645] to-[#009197] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Configuration du compte administrateur</CardTitle>
          <CardDescription>
            Création automatique du compte admin
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === 'loading' && (
            <div className="flex items-center gap-3 text-blue-600">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Création du compte en cours...</span>
            </div>
          )}

          {status === 'success' && (
            <>
              <Alert className="border-green-500 bg-green-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {message}
                </AlertDescription>
              </Alert>

              {credentials && (
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <p className="font-semibold">Identifiants de connexion :</p>
                  <p className="font-mono text-sm">
                    <strong>Email :</strong> {credentials.email}
                  </p>
                  <p className="font-mono text-sm">
                    <strong>Mot de passe :</strong> {credentials.password}
                  </p>
                  <p className="text-xs text-gray-600 mt-2">
                    Veuillez noter ces identifiants ou les copier maintenant
                  </p>
                </div>
              )}

              <Button onClick={goToLogin} className="w-full bg-[#004645] hover:bg-[#009197]">
                Aller à la page de connexion
              </Button>
            </>
          )}

          {status === 'exists' && (
            <>
              <Alert className="border-yellow-500 bg-yellow-50">
                <AlertDescription className="text-yellow-800">
                  {message}
                </AlertDescription>
              </Alert>

              {credentials && (
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <p className="font-semibold">Identifiants de connexion :</p>
                  <p className="font-mono text-sm">
                    <strong>Email :</strong> {credentials.email}
                  </p>
                  <p className="font-mono text-sm">
                    <strong>Mot de passe :</strong> {credentials.password}
                  </p>
                </div>
              )}

              <Button onClick={goToLogin} className="w-full bg-[#004645] hover:bg-[#009197]">
                Aller à la page de connexion
              </Button>
            </>
          )}

          {status === 'error' && (
            <>
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  {message}
                </AlertDescription>
              </Alert>

              <Button onClick={() => window.location.reload()} variant="outline" className="w-full">
                Réessayer
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
