"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function DiagnosticPage() {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/status');
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error('Error fetching status:', error);
      setStatus({ error: 'Impossible de récupérer le statut' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Mail className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">Diagnostic</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button onClick={fetchStatus} disabled={loading} variant="outline">
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Actualiser
              </Button>
              <Link href="/admin">
                <Button variant="ghost">Retour au dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Diagnostic du système</h1>
          <p className="text-gray-600">
            Vérifiez l&apos;état de votre application et de la base de données
          </p>
        </div>

        {loading && !status ? (
          <Card>
            <CardContent className="text-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
              <p className="text-gray-600">Vérification en cours...</p>
            </CardContent>
          </Card>
        ) : status?.error ? (
          <Card className="border-red-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <XCircle className="h-6 w-6 text-red-500 mt-1" />
                <div>
                  <p className="font-semibold text-red-800">Erreur</p>
                  <p className="text-red-600">{status.error}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Database Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {status?.database?.connected ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  Base de données
                </CardTitle>
                <CardDescription>
                  État de la connexion PostgreSQL
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Connexion:</span>
                    <span className={status?.database?.connected ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                      {status?.database?.connected ? '✓ Connectée' : '✗ Déconnectée'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">URL DATABASE_URL:</span>
                    <span className="font-medium">{status?.database?.url}</span>
                  </div>
                </div>

                {status?.errors?.length > 0 && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="font-medium text-red-800 mb-2">Erreurs détectées:</p>
                    {status.errors.map((err: any, idx: number) => (
                      <div key={idx} className="text-sm text-red-600 mb-1">
                        <strong>{err.type}:</strong> {err.message}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tables Status */}
            {status?.database?.connected && (
              <Card>
                <CardHeader>
                  <CardTitle>Tables de données</CardTitle>
                  <CardDescription>
                    Nombre d&apos;enregistrements dans chaque table
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Utilisateurs (Users):</span>
                      <span className="text-2xl font-bold">{status?.tables?.users || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Événements (Events):</span>
                      <span className="text-2xl font-bold">{status?.tables?.events || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Invités (Guests):</span>
                      <span className="text-2xl font-bold">{status?.tables?.guests || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recommendations */}
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-900">Recommandations</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-blue-800 space-y-2">
                {!status?.database?.connected ? (
                  <>
                    <p>⚠️ La base de données n&apos;est pas connectée. Vérifiez:</p>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      <li>La variable DATABASE_URL est configurée dans Vercel</li>
                      <li>La base de données Neon est active</li>
                      <li>Les tables ont été créées (via /admin/setup)</li>
                    </ul>
                  </>
                ) : status?.tables?.events === 0 ? (
                  <>
                    <p>✓ Base de données connectée!</p>
                    <p>💡 Vous pouvez maintenant créer un événement de démo depuis le dashboard</p>
                  </>
                ) : (
                  <>
                    <p>✓ Tout fonctionne correctement!</p>
                    <p>Vous avez {status?.tables?.events} événement(s) et {status?.tables?.guests} invité(s)</p>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="flex gap-4">
              <Link href="/admin" className="flex-1">
                <Button className="w-full">Aller au dashboard</Button>
              </Link>
              {status?.database?.connected && status?.tables?.events === 0 && (
                <Link href="/admin/setup" className="flex-1">
                  <Button variant="outline" className="w-full">
                    Initialiser les tables
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}

        {status && (
          <div className="mt-6 p-3 bg-gray-100 rounded-md">
            <p className="text-xs text-gray-500 mb-1">Dernière vérification:</p>
            <p className="text-xs text-gray-600 font-mono">{status.timestamp}</p>
          </div>
        )}
      </div>
    </div>
  );
}
