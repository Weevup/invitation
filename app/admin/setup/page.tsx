"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, AlertCircle, Loader2, Database, Sparkles, Trash2, AlertTriangle, RefreshCw } from "lucide-react";
import Link from "next/link";
import { WeevupLogo } from "@/components/weevup-logo";

export default function SetupPage() {
  const [setupLoading, setSetupLoading] = useState(false);
  const [seedLoading, setSeedLoading] = useState(false);
  const [clearLoading, setClearLoading] = useState(false);
  const [migrateLoading, setMigrateLoading] = useState(false);
  const [setupResult, setSetupResult] = useState<any>(null);
  const [seedResult, setSeedResult] = useState<any>(null);
  const [clearResult, setClearResult] = useState<any>(null);
  const [migrateResult, setMigrateResult] = useState<any>(null);
  const [setupError, setSetupError] = useState<string>('');
  const [seedError, setSeedError] = useState<string>('');
  const [clearError, setClearError] = useState<string>('');
  const [migrateError, setMigrateError] = useState<string>('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // État de la base de données
  const [dbStatus, setDbStatus] = useState<any>(null);
  const [dbStatusLoading, setDbStatusLoading] = useState(true);

  // Charger le statut de la BDD au montage et après migration
  useEffect(() => {
    fetchDatabaseStatus();
  }, []);

  const fetchDatabaseStatus = async () => {
    setDbStatusLoading(true);
    try {
      const response = await fetch('/api/admin/database-status');
      if (response.ok) {
        const data = await response.json();
        setDbStatus(data);
      }
    } catch (error) {
      console.error('Error fetching database status:', error);
    } finally {
      setDbStatusLoading(false);
    }
  };

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

  const handleClearDatabase = async () => {
    setClearLoading(true);
    setClearError('');
    setClearResult(null);
    setShowClearConfirm(false);

    try {
      const response = await fetch('/api/admin/clear-database', {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        setClearResult(data);
        // Reset other states
        setSetupResult(null);
        setSeedResult(null);
      } else {
        setClearError(data.error || 'Erreur lors de la suppression');
      }
    } catch (error) {
      setClearError('Erreur de connexion');
      console.error('Clear database error:', error);
    } finally {
      setClearLoading(false);
    }
  };

  const handleMigrate = async () => {
    setMigrateLoading(true);
    setMigrateError('');
    setMigrateResult(null);

    try {
      const response = await fetch('/api/admin/migrate', {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        setMigrateResult(data);
        // Rafraîchir le statut de la BDD après migration réussie
        await fetchDatabaseStatus();
      } else {
        setMigrateError(data.error || 'Erreur lors de la migration');
      }
    } catch (error) {
      setMigrateError('Erreur de connexion');
      console.error('Migration error:', error);
    } finally {
      setMigrateLoading(false);
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
                    Étape 1: Base de données
                  </CardTitle>
                  <CardDescription className="text-[#004645]/70">
                    La base de données est automatiquement initialisée lors du déploiement
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* État de la base de données en temps réel */}
              {dbStatusLoading ? (
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-md flex items-center gap-2">
                  <Loader2 className="h-5 w-5 text-gray-500 animate-spin" />
                  <p className="text-sm text-gray-600">Vérification de l&apos;état de la base de données...</p>
                </div>
              ) : dbStatus && !dbStatus.needsMigration ? (
                <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                  <div className="flex items-start gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium text-green-800">✅ Base de données complète</p>
                      <p className="text-sm text-green-600 mt-1">
                        Toutes les tables et colonnes sont présentes ({dbStatus.summary.tablesOk} tables, {dbStatus.summary.enumsOk} ENUMs)
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={fetchDatabaseStatus}
                      className="text-green-600 hover:text-green-700 hover:bg-green-100"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Détails des tables */}
                  <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                    {dbStatus.status.tables.map((table: any) => (
                      <div key={table.name} className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span className="text-green-700">{table.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : dbStatus ? (
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-md">
                  <div className="flex items-start gap-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium text-orange-800">⚠️ Migration nécessaire</p>
                      <p className="text-sm text-orange-600 mt-1">
                        {dbStatus.summary.message}
                      </p>
                      <p className="text-xs text-orange-600 mt-1">
                        Tables: {dbStatus.summary.tablesOk} • ENUMs: {dbStatus.summary.enumsOk}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={fetchDatabaseStatus}
                      className="text-orange-600 hover:text-orange-700 hover:bg-orange-100"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Détails des tables manquantes ou incomplètes */}
                  <div className="mt-3 space-y-2">
                    {dbStatus.status.tables.filter((t: any) => !t.exists || t.missingColumns).map((table: any) => (
                      <div key={table.name} className="flex items-start gap-2 text-xs bg-white rounded p-2">
                        {table.exists ? (
                          <>
                            <AlertCircle className="h-3 w-3 text-orange-500 mt-0.5 flex-shrink-0" />
                            <div>
                              <span className="font-medium text-orange-800">{table.name}</span>
                              <span className="text-orange-600"> - Colonnes manquantes: </span>
                              <span className="text-orange-700">{table.missingColumns.join(', ')}</span>
                            </div>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-3 w-3 text-red-500 mt-0.5 flex-shrink-0" />
                            <span className="font-medium text-red-800">{table.name} - Table absente</span>
                          </>
                        )}
                      </div>
                    ))}

                    {dbStatus.status.enums.filter((e: any) => !e.exists).length > 0 && (
                      <div className="flex items-start gap-2 text-xs bg-white rounded p-2">
                        <AlertCircle className="h-3 w-3 text-red-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-medium text-red-800">ENUMs manquants: </span>
                          <span className="text-red-700">
                            {dbStatus.status.enums.filter((e: any) => !e.exists).map((e: any) => e.name).join(', ')}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : null}

              {/* Bouton de migration */}
              {dbStatus?.needsMigration && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-blue-800 mb-3">
                    <strong>🔧 Action requise :</strong> Cliquez sur le bouton ci-dessous pour créer automatiquement les tables et colonnes manquantes.
                  </p>
                  <Button
                    onClick={handleMigrate}
                    disabled={migrateLoading || !!migrateResult}
                    variant="outline"
                    className="w-full border-blue-300 text-blue-700 hover:bg-blue-100"
                  >
                    {migrateLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Application de la migration...
                      </>
                    ) : migrateResult ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Migration appliquée
                      </>
                    ) : (
                      <>
                        <Database className="h-4 w-4 mr-2" />
                        Appliquer la migration
                      </>
                    )}
                  </Button>
                </div>
              )}

              {migrateError && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-800">Erreur</p>
                    <p className="text-sm text-red-600">{migrateError}</p>
                  </div>
                </div>
              )}

              {migrateResult && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-800">Succès!</p>
                    <p className="text-sm text-green-600">{migrateResult.message}</p>
                    <p className="text-xs text-green-600 mt-1">Vous pouvez maintenant créer les données de démo (Étape 2)</p>
                  </div>
                </div>
              )}

              <p className="mt-4 text-sm text-[#004645]/70">
                💡 La configuration de la base de données se fait via le script <code className="bg-[#9CD9F6]/20 px-1 py-0.5 rounded">prisma migrate deploy</code> qui s&apos;exécute automatiquement lors du build.
              </p>

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
                    Créer 5 événements de démonstration variés (Tech Summit, 10 ans Weevup, Mariage, Gala, Workshop)
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleSeed}
                disabled={seedLoading || !!seedResult}
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

                  <div className="bg-white rounded-md p-4 space-y-3 text-sm text-[#004645]">
                    <p className="font-bold text-base mb-2">
                      📊 {seedResult.totalEventsCreated || 5} événements créés • {seedResult.totalGuestsCreated || 25} invités
                    </p>

                    {seedResult.events && (
                      <div className="space-y-2">
                        <p className="font-medium">🎉 Événements de démonstration:</p>
                        <div className="space-y-2">
                          {seedResult.events.map((event: any, idx: number) => (
                            <div key={idx} className="pl-3 border-l-2 border-[#9CD9F6]">
                              <p className="font-medium text-[#004645]">{event.name}</p>
                              <p className="text-xs text-[#004645]/70">
                                📅 {event.date} • 📍 {event.location}
                              </p>
                              {event.showcaseUrl && (
                                <a
                                  href={event.showcaseUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-[#FF4713] hover:underline"
                                >
                                  🔗 Voir la showcase
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {seedResult.admins && (
                      <div className="pt-2 border-t">
                        <p className="font-medium mb-1">👤 Comptes admin créés:</p>
                        {seedResult.admins.map((admin: any, idx: number) => (
                          <p key={idx} className="text-xs text-[#004645]/70">
                            • {admin.email} ({admin.role})
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Completion */}
          {seedResult && (
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

          {/* Clear Database - Danger Zone */}
          <Card className="border-red-300 bg-gradient-to-br from-red-50/50 to-white/80 backdrop-blur">
            <CardHeader>
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-6 w-6 text-red-500" />
                <div>
                  <CardTitle className="text-[#004645]" style={{ fontFamily: "var(--font-abril)" }}>
                    Zone de danger
                  </CardTitle>
                  <CardDescription className="text-[#004645]/70">
                    Supprimez toutes les données de la base de données
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-red-50 border border-red-200 rounded-md mb-4">
                <p className="text-sm text-red-800">
                  <strong>⚠️ Attention :</strong> Cette action supprimera définitivement tous les événements, invités, réponses et emails de la base de données. Cette action est irréversible !
                </p>
              </div>

              {!showClearConfirm ? (
                <Button
                  onClick={() => setShowClearConfirm(true)}
                  variant="outline"
                  className="w-full border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Vider la base de données
                </Button>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-[#004645]">
                    Êtes-vous sûr de vouloir supprimer toutes les données ?
                  </p>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleClearDatabase}
                      disabled={clearLoading}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                    >
                      {clearLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Suppression...
                        </>
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Oui, supprimer tout
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => setShowClearConfirm(false)}
                      disabled={clearLoading}
                      variant="outline"
                      className="flex-1"
                    >
                      Annuler
                    </Button>
                  </div>
                </div>
              )}

              {clearError && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-800">Erreur</p>
                    <p className="text-sm text-red-600">{clearError}</p>
                  </div>
                </div>
              )}

              {clearResult && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                  <div className="flex items-start gap-2 mb-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-800">Succès!</p>
                      <p className="text-sm text-green-600">{clearResult.message}</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-md p-3 space-y-1 text-sm text-[#004645]">
                    <p><strong>Supprimés:</strong></p>
                    <ul className="ml-4 list-disc">
                      <li>{clearResult.deleted?.events} événement(s)</li>
                      <li>{clearResult.deleted?.guests} invité(s)</li>
                      <li>{clearResult.deleted?.rsvps} réponse(s)</li>
                      <li>{clearResult.deleted?.checkins} enregistrement(s)</li>
                      <li>{clearResult.deleted?.emailLogs} email(s)</li>
                      <li>{clearResult.deleted?.users} utilisateur(s)</li>
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
