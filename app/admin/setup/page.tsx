"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, AlertCircle, Loader2, Database, Sparkles } from "lucide-react";
import Link from "next/link";
import { WeevupLogo } from "@/components/weevup-logo";

export default function SetupPage() {
  const [setupLoading, setSetupLoading] = useState(false);
  const [seedLoading, setSeedLoading] = useState(false);
  const [setupResult, setSetupResult] = useState<any>(null);
  const [seedResult, setSeedResult] = useState<any>(null);
  const [setupError, setSetupError] = useState<string>('');
  const [seedError, setSeedError] = useState<string>('');

  const handleSetup = async () => {
    setSetupLoading(true);
    setSetupError('');
    setSetupResult(null);

    try {
      const response = await fetch('/api/admin/setup', {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        setSetupResult(data);
      } else {
        setSetupError(data.error || 'Erreur lors de l\'initialisation');
      }
    } catch (error) {
      setSetupError('Erreur de connexion');
      console.error('Setup error:', error);
    } finally {
      setSetupLoading(false);
    }
  };

  const handleSeed = async () => {
    setSeedLoading(true);
    setSeedError('');
    setSeedResult(null);

    try {
      const response = await fetch('/api/admin/seed', {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        setSeedResult(data);
      } else {
        setSeedError(data.error || 'Erreur lors du seed');
      }
    } catch (error) {
      setSeedError('Erreur de connexion');
      console.error('Seed error:', error);
    } finally {
      setSeedLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#9CD9F6] via-white to-[#9CD9F6]">
      {/* Lignes graphiques orange décoratives */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <svg className="absolute top-0 right-0 w-1/4 h-1/4" viewBox="0 0 200 200">
          <path
            d="M 0 50 Q 50 50, 50 100 T 100 150 T 150 200"
            stroke="#FF4713"
            strokeWidth="2"
            fill="none"
            opacity="0.3"
          />
        </svg>
      </div>

      {/* Header */}
      <header className="relative border-b border-[#9CD9F6]/30 bg-white/80 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <WeevupLogo className="w-10 h-10" />
              <div>
                <span className="text-xl font-bold text-[#004645]" style={{ fontFamily: "var(--font-abril)" }}>
                  WEEVUP
                </span>
                <p className="text-xs text-[#004645]/70">Configuration initiale</p>
              </div>
            </div>
            <Link href="/admin">
              <Button variant="ghost" className="text-[#004645] hover:text-[#FF4713]">
                Retour au dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="relative container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2 text-[#004645]" style={{ fontFamily: "var(--font-abril)" }}>
            Configuration de la base de données
          </h1>
          <p className="text-[#004645]/70">
            Initialisez votre base de données et créez des données de démonstration
          </p>
        </div>

        <div className="space-y-6">
          {/* Step 1: Initialize Schema */}
          <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Database className="h-6 w-6 text-[#009197]" />
                <div>
                  <CardTitle className="text-[#004645]" style={{ fontFamily: "var(--font-abril)" }}>
                    Étape 1: Initialiser le schéma
                  </CardTitle>
                  <CardDescription className="text-[#004645]/70">
                    Créer les tables dans la base de données PostgreSQL
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleSetup}
                disabled={setupLoading || !!setupResult}
                className="w-full bg-gradient-to-r from-[#004645] to-[#009197] hover:from-[#006C51] hover:to-[#009197] text-white"
              >
                {setupLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Initialisation en cours...
                  </>
                ) : setupResult ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Schéma initialisé
                  </>
                ) : (
                  'Initialiser le schéma'
                )}
              </Button>

              {setupError && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-800">Erreur</p>
                    <p className="text-sm text-red-600">{setupError}</p>
                  </div>
                </div>
              )}

              {setupResult && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-800">Succès!</p>
                    <p className="text-sm text-green-600">{setupResult.message}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Step 2: Seed Data */}
          <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Sparkles className="h-6 w-6 text-[#FF4713]" />
                <div>
                  <CardTitle className="text-[#004645]" style={{ fontFamily: "var(--font-abril)" }}>
                    Étape 2: Créer les données de démo
                  </CardTitle>
                  <CardDescription className="text-[#004645]/70">
                    Ajouter l&apos;événement &quot;10 ans de Weevup&quot; avec 10 invités de test
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleSeed}
                disabled={seedLoading || !setupResult || !!seedResult}
                className="w-full bg-gradient-to-r from-[#004645] to-[#009197] hover:from-[#006C51] hover:to-[#009197] text-white"
              >
                {seedLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Création en cours...
                  </>
                ) : seedResult ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Données créées
                  </>
                ) : (
                  'Créer les données de démo'
                )}
              </Button>

              {!setupResult && (
                <p className="mt-2 text-sm text-[#004645]/70">
                  Vous devez d&apos;abord initialiser le schéma (Étape 1)
                </p>
              )}

              {seedError && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-800">Erreur</p>
                    <p className="text-sm text-red-600">{seedError}</p>
                  </div>
                </div>
              )}

              {seedResult && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                  <div className="flex items-start gap-2 mb-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-800">Succès!</p>
                      <p className="text-sm text-green-600">{seedResult.message}</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-md p-3 space-y-2 text-sm text-[#004645]">
                    <p><strong>Événement:</strong> {seedResult.event?.name}</p>
                    <p><strong>Date:</strong> {new Date(seedResult.event?.date).toLocaleDateString('fr-FR')}</p>
                    <p><strong>Lieu:</strong> {seedResult.event?.location}</p>
                    <p><strong>Invités créés:</strong> {seedResult.guestsCreated}</p>
                    {seedResult.sampleInvitationUrl && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="font-medium mb-1">Exemple d&apos;URL d&apos;invitation:</p>
                        <code className="text-xs bg-gray-100 p-2 rounded block overflow-x-auto">
                          {seedResult.sampleInvitationUrl}
                        </code>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Completion */}
          {setupResult && seedResult && (
            <Card className="border-[#009197] bg-gradient-to-br from-[#009197]/10 to-[#9CD9F6]/10 backdrop-blur">
              <CardContent className="pt-6">
                <div className="text-center">
                  <CheckCircle className="h-12 w-12 text-[#009197] mx-auto mb-3" />
                  <h3 className="text-lg font-semibold mb-2 text-[#004645]" style={{ fontFamily: "var(--font-abril)" }}>
                    Configuration terminée!
                  </h3>
                  <p className="text-[#004645]/70 mb-4">
                    Votre application est prête à être utilisée
                  </p>
                  <Link href="/admin">
                    <Button className="bg-gradient-to-r from-[#004645] to-[#009197] hover:from-[#006C51] hover:to-[#009197] text-white">
                      Aller au dashboard
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
