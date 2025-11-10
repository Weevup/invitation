'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle2, XCircle, AlertCircle, Loader2 } from 'lucide-react'

type DiagnosticResult = {
  step: string
  status: 'success' | 'error' | 'warning' | 'pending'
  message: string
  details?: string
}

export default function DiagnosticPage() {
  const [results, setResults] = useState<DiagnosticResult[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const updateResult = (index: number, result: DiagnosticResult) => {
    setResults(prev => {
      const newResults = [...prev]
      newResults[index] = result
      return newResults
    })
  }

  const runDiagnostic = async () => {
    setIsRunning(true)
    const initialResults: DiagnosticResult[] = [
      {
        step: 'Test API setup-admin',
        status: 'pending',
        message: 'Vérification de l\'API /api/setup-admin...',
      },
      {
        step: 'Test API NextAuth',
        status: 'pending',
        message: 'Vérification de l\'API NextAuth...',
      },
      {
        step: 'Test de connexion',
        status: 'pending',
        message: 'Test de connexion avec les identifiants...',
      },
    ]
    setResults(initialResults)

    // Test 1: Check if setup-admin API is accessible
    try {
      const setupResponse = await fetch('/api/setup-admin', {
        method: 'POST',
      })
      const setupData = await setupResponse.json()

      if (setupResponse.ok) {
        updateResult(0, {
          step: 'Test API setup-admin',
          status: 'success',
          message: 'Compte admin créé avec succès',
          details: `Email: ${setupData.credentials?.email} / Password: ${setupData.credentials?.password}`,
        })
      } else if (setupResponse.status === 403) {
        updateResult(0, {
          step: 'Test API setup-admin',
          status: 'warning',
          message: 'Un compte admin existe déjà',
          details: setupData.error || setupData.message,
        })
      } else {
        updateResult(0, {
          step: 'Test API setup-admin',
          status: 'error',
          message: 'Erreur lors de la création du compte',
          details: JSON.stringify(setupData, null, 2),
        })
      }
    } catch (error) {
      updateResult(0, {
        step: 'Test API setup-admin',
        status: 'error',
        message: 'Impossible de contacter l\'API',
        details: error instanceof Error ? error.message : 'Unknown error',
      })
    }

    // Test 2: Check if NextAuth API is accessible
    try {
      const csrfResponse = await fetch('/api/auth/csrf')
      if (csrfResponse.ok) {
        const csrfData = await csrfResponse.json()
        updateResult(1, {
          step: 'Test API NextAuth',
          status: 'success',
          message: 'L\'API NextAuth est fonctionnelle',
          details: `CSRF Token: ${csrfData.csrfToken?.substring(0, 20)}...`,
        })
      } else {
        updateResult(1, {
          step: 'Test API NextAuth',
          status: 'error',
          message: 'L\'API NextAuth ne répond pas correctement',
          details: `Status: ${csrfResponse.status}`,
        })
      }
    } catch (error) {
      updateResult(1, {
        step: 'Test API NextAuth',
        status: 'error',
        message: 'Impossible de contacter l\'API NextAuth',
        details: error instanceof Error ? error.message : 'Unknown error',
      })
    }

    // Test 3: Test actual login
    try {
      // First, test if we can authenticate via signIn
      const testLogin = await fetch('/api/auth/providers')

      if (testLogin.ok) {
        const providers = await testLogin.json()
        updateResult(2, {
          step: 'Test de connexion',
          status: 'success',
          message: 'L\'authentification est configurée',
          details: `Providers disponibles: ${Object.keys(providers).join(', ')}`,
        })
      } else {
        updateResult(2, {
          step: 'Test de connexion',
          status: 'error',
          message: 'Problème de configuration de l\'authentification',
        })
      }
    } catch (error) {
      updateResult(2, {
        step: 'Test de connexion',
        status: 'error',
        message: 'Erreur lors du test de connexion',
        details: error instanceof Error ? error.message : 'Unknown error',
      })
    }

    setIsRunning(false)
  }

  const getIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case 'pending':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#004645] to-[#009197] p-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Diagnostic de connexion</CardTitle>
            <CardDescription>
              Testez l'état du système d'authentification et la création du compte admin
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <AlertDescription>
                <strong>Identifiants de test :</strong>
                <br />
                Email: julien.boisard@weevup.fr
                <br />
                Mot de passe: Weevup2025!
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <Button
                onClick={runDiagnostic}
                disabled={isRunning}
                className="w-full bg-[#004645] hover:bg-[#009197]"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Diagnostic en cours...
                  </>
                ) : (
                  'Lancer le diagnostic'
                )}
              </Button>

              <Button
                onClick={() => window.location.href = '/admin/login'}
                variant="outline"
                className="w-full"
              >
                Aller à la page de connexion
              </Button>
            </div>

            {results.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Résultats :</h3>
                {results.map((result, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        {getIcon(result.status)}
                        <div className="flex-1">
                          <h4 className="font-medium">{result.step}</h4>
                          <p className="text-sm text-gray-600 mt-1">{result.message}</p>
                          {result.details && (
                            <pre className="text-xs text-gray-500 mt-2 font-mono bg-gray-100 p-2 rounded overflow-x-auto">
                              {result.details}
                            </pre>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
