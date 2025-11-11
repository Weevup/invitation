"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Loader2,
  Database,
  Sparkles,
  Trash2,
  RefreshCw,
  Mail,
  Key,
  Webhook,
  Server,
  Users,
  Calendar,
  Activity,
  XCircle,
  Settings,
  FileText
} from "lucide-react";
import Link from "next/link";
import { WeevupLogo } from "@/components/weevup-logo";
import { toast } from "sonner";

interface DiagnosticCheck {
  name: string
  status: 'success' | 'warning' | 'error'
  message: string
  details?: string
  fix?: string
}

interface DiagnosticData {
  database: DiagnosticCheck[]
  email: DiagnosticCheck[]
  environment: DiagnosticCheck[]
  data: DiagnosticCheck[]
  webhooks: DiagnosticCheck[]
}

export default function SystemPage() {
  // États pour la configuration
  const [seedLoading, setSeedLoading] = useState(false);
  const [clearLoading, setClearLoading] = useState(false);
  const [migrateLoading, setMigrateLoading] = useState(false);
  const [seedResult, setSeedResult] = useState<any>(null);
  const [clearResult, setClearResult] = useState<any>(null);
  const [migrateResult, setMigrateResult] = useState<any>(null);
  const [seedError, setSeedError] = useState<string>('');
  const [clearError, setClearError] = useState<string>('');
  const [migrateError, setMigrateError] = useState<string>('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // États pour la BDD
  const [dbStatus, setDbStatus] = useState<any>(null);
  const [dbStatusLoading, setDbStatusLoading] = useState(true);
  const [lastDbCheck, setLastDbCheck] = useState<Date | null>(null);

  // États pour le diagnostic
  const [diagnostic, setDiagnostic] = useState<DiagnosticData | null>(null);
  const [diagnosticLoading, setDiagnosticLoading] = useState(false);
  const [lastDiagnostic, setLastDiagnostic] = useState<Date | null>(null);

  useEffect(() => {
    fetchDatabaseStatus();
    runDiagnostic();
  }, []);

  const fetchDatabaseStatus = async () => {
    setDbStatusLoading(true);
    try {
      // Add timestamp to prevent caching
      const response = await fetch(`/api/admin/database-status?t=${Date.now()}`, {
        cache: 'no-store'
      });
      if (response.ok) {
        const data = await response.json();
        setDbStatus(data);
        setLastDbCheck(new Date());
      }
    } catch (error) {
      console.error('Error fetching database status:', error);
      toast.error('Erreur lors de la vérification de la base de données');
    } finally {
      setDbStatusLoading(false);
    }
  };

  const runDiagnostic = async () => {
    setDiagnosticLoading(true);
    try {
      // Add timestamp to prevent caching
      const response = await fetch(`/api/admin/diagnostic?t=${Date.now()}`, {
        cache: 'no-store'
      });
      if (response.ok) {
        const data = await response.json();
        setDiagnostic(data);
        setLastDiagnostic(new Date());
      }
    } catch (error) {
      console.error('Diagnostic failed:', error);
      toast.error('Erreur lors du diagnostic');
    } finally {
      setDiagnosticLoading(false);
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
        toast.success('Migration appliquée avec succès');
        await fetchDatabaseStatus();
        await runDiagnostic();
      } else {
        setMigrateError(data.error || 'Erreur lors de la migration');
        toast.error('Erreur lors de la migration');
      }
    } catch (error) {
      setMigrateError('Erreur de connexion');
      toast.error('Erreur de connexion');
    } finally {
      setMigrateLoading(false);
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
        toast.success('Données de démo créées avec succès');
        await runDiagnostic();
      } else {
        setSeedError(data.error || 'Erreur lors du seed');
        toast.error('Erreur lors de la création des données');
      }
    } catch (error) {
      setSeedError('Erreur de connexion');
      toast.error('Erreur de connexion');
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
        setSeedResult(null);
        toast.success('Base de données vidée avec succès');
        await fetchDatabaseStatus();
        await runDiagnostic();
      } else {
        setClearError(data.error || 'Erreur lors de la suppression');
        toast.error('Erreur lors de la suppression');
      }
    } catch (error) {
      setClearError('Erreur de connexion');
      toast.error('Erreur de connexion');
    } finally {
      setClearLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return null
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-500">OK</Badge>
      case 'warning':
        return <Badge className="bg-yellow-500">Attention</Badge>
      case 'error':
        return <Badge variant="destructive">Erreur</Badge>
      default:
        return null
    }
  };

  const getOverallStatus = () => {
    if (!diagnostic) return 'unknown'

    const allChecks = [
      ...diagnostic.database,
      ...diagnostic.email,
      ...diagnostic.environment,
      ...diagnostic.data,
      ...diagnostic.webhooks
    ]

    if (allChecks.some(check => check.status === 'error')) return 'error'
    if (allChecks.some(check => check.status === 'warning')) return 'warning'
    return 'success'
  };

  const diagnosticSections = [
    {
      id: 'database',
      title: 'Base de Données',
      icon: Database,
      description: 'Connexion et intégrité des données'
    },
    {
      id: 'email',
      title: 'Intégrations Email',
      icon: Mail,
      description: 'Configuration des providers email'
    },
    {
      id: 'environment',
      title: 'Variables d\'Environnement',
      icon: Key,
      description: 'Configuration système et secrets'
    },
    {
      id: 'data',
      title: 'Données Système',
      icon: Activity,
      description: 'État des événements et invités'
    },
    {
      id: 'webhooks',
      title: 'Webhooks',
      icon: Webhook,
      description: 'Configuration des webhooks providers'
    }
  ];

  const overallStatus = diagnostic ? getOverallStatus() : 'unknown';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Settings className="h-8 w-8" />
            Configuration & Diagnostic
          </h1>
          <p className="text-muted-foreground mt-2">
            État de santé du système, configuration de la base de données et actions de maintenance
          </p>
        </div>
        <div className="flex items-center gap-2">
          {(lastDbCheck || lastDiagnostic) && (
            <div className="text-xs text-muted-foreground mr-2">
              Dernière mise à jour : {(lastDbCheck && lastDiagnostic ?
                (lastDbCheck > lastDiagnostic ? lastDbCheck : lastDiagnostic) :
                (lastDbCheck || lastDiagnostic))?.toLocaleTimeString('fr-FR')}
            </div>
          )}
          <Button
            variant="outline"
            onClick={async () => {
              await Promise.all([
                fetchDatabaseStatus(),
                runDiagnostic()
              ]);
              toast.success('Données actualisées avec succès');
            }}
            disabled={dbStatusLoading || diagnosticLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${(dbStatusLoading || diagnosticLoading) ? 'animate-spin' : ''}`} />
            Actualiser Tout
          </Button>
        </div>
      </div>

      {/* Overall Status Card */}
      <Card className={
        overallStatus === 'success' ? 'border-green-500' :
        overallStatus === 'warning' ? 'border-yellow-500' :
        overallStatus === 'error' ? 'border-red-500' : ''
      }>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            État Général du Système
          </CardTitle>
        </CardHeader>
        <CardContent>
          {diagnosticLoading ? (
            <div className="flex items-center gap-2 py-4">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-muted-foreground">Vérification en cours...</span>
            </div>
          ) : (
            <>
              {overallStatus === 'success' && (
                <Alert className="border-green-500 bg-green-50">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <AlertDescription className="text-green-900">
                    <strong>✅ Système opérationnel</strong>
                    <br />
                    Tous les composants fonctionnent correctement.
                    {lastDiagnostic && (
                      <span className="text-xs block mt-1">
                        Dernière vérification : {lastDiagnostic.toLocaleTimeString()}
                      </span>
                    )}
                  </AlertDescription>
                </Alert>
              )}
              {overallStatus === 'warning' && (
                <Alert className="border-yellow-500 bg-yellow-50">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  <AlertDescription className="text-yellow-900">
                    <strong>⚠️ Attention requise</strong>
                    <br />
                    Certains composants nécessitent votre attention.
                  </AlertDescription>
                </Alert>
              )}
              {overallStatus === 'error' && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>❌ Erreurs détectées</strong>
                    <br />
                    Des problèmes critiques nécessitent une intervention immédiate.
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Tabs pour Configuration et Diagnostic */}
      <Tabs defaultValue="configuration" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="configuration">
            <Database className="h-4 w-4 mr-2" />
            Configuration
          </TabsTrigger>
          <TabsTrigger value="diagnostic">
            <Activity className="h-4 w-4 mr-2" />
            Diagnostic Complet
          </TabsTrigger>
          <TabsTrigger value="actions">
            <Settings className="h-4 w-4 mr-2" />
            Actions Rapides
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: Configuration */}
        <TabsContent value="configuration" className="space-y-6">
          {/* État de la BDD */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                État de la Base de Données
              </CardTitle>
              <CardDescription>
                Vérification automatique de toutes les tables et colonnes
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                      {lastDbCheck && (
                        <p className="text-xs text-green-500 mt-1">
                          Dernière vérification : {lastDbCheck.toLocaleTimeString('fr-FR')}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={fetchDatabaseStatus}
                      disabled={dbStatusLoading}
                      className="text-green-600 hover:text-green-700 hover:bg-green-100"
                    >
                      <RefreshCw className={`h-4 w-4 ${dbStatusLoading ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>

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
                      {lastDbCheck && (
                        <p className="text-xs text-orange-500 mt-1">
                          Dernière vérification : {lastDbCheck.toLocaleTimeString('fr-FR')}
                        </p>
                      )}
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
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Seed Data */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Données de Démonstration
              </CardTitle>
              <CardDescription>
                Créer 5 événements de démonstration variés avec invités et RSVPs
              </CardDescription>
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
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Créer les données de démo
                  </>
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
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <Trash2 className="h-5 w-5" />
                Zone de Danger
              </CardTitle>
              <CardDescription>
                Supprimez toutes les données de la base de données (irréversible)
              </CardDescription>
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
        </TabsContent>

        {/* TAB 2: Diagnostic */}
        <TabsContent value="diagnostic" className="space-y-6">
          {diagnosticLoading ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Analyse du système en cours...</p>
                </div>
              </CardContent>
            </Card>
          ) : diagnostic ? (
            diagnosticSections.map((section) => {
              const Icon = section.icon
              const checks = diagnostic[section.id as keyof DiagnosticData]

              if (!checks || checks.length === 0) return null

              const sectionStatus = checks.some(c => c.status === 'error') ? 'error' :
                                   checks.some(c => c.status === 'warning') ? 'warning' : 'success'

              return (
                <Card key={section.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="h-5 w-5" />
                        <CardTitle>{section.title}</CardTitle>
                      </div>
                      {getStatusBadge(sectionStatus)}
                    </div>
                    <CardDescription>{section.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {checks.map((check, idx) => (
                        <div key={idx} className="flex gap-4 p-4 rounded-lg border">
                          <div className="flex-shrink-0 mt-0.5">
                            {getStatusIcon(check.status)}
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="font-medium">{check.name}</div>
                                <div className="text-sm text-muted-foreground mt-1">
                                  {check.message}
                                </div>
                              </div>
                              {getStatusBadge(check.status)}
                            </div>

                            {check.details && (
                              <div className="text-sm bg-muted p-3 rounded">
                                {check.details}
                              </div>
                            )}

                            {check.fix && check.status !== 'success' && (
                              <Alert>
                                <AlertDescription className="text-sm">
                                  <strong>Solution :</strong> {check.fix}
                                </AlertDescription>
                              </Alert>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
            })
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground">Aucune donnée de diagnostic disponible</p>
                <Button onClick={runDiagnostic} className="mt-4">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Lancer le diagnostic
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* TAB 3: Actions Rapides */}
        <TabsContent value="actions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Accès Rapide aux Configurations</CardTitle>
              <CardDescription>
                Raccourcis vers les pages de configuration principales
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" asChild className="h-auto py-6 flex-col items-start">
                  <Link href="/admin/settings/integrations">
                    <Mail className="h-6 w-6 mb-2" />
                    <div className="text-left">
                      <div className="font-medium">Intégrations Email</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Configurer Resend, SendGrid, etc.
                      </div>
                    </div>
                  </Link>
                </Button>

                <Button variant="outline" asChild className="h-auto py-6 flex-col items-start">
                  <Link href="/admin/templates">
                    <FileText className="h-6 w-6 mb-2" />
                    <div className="text-left">
                      <div className="font-medium">Templates d&apos;Email</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Créer et gérer vos templates
                      </div>
                    </div>
                  </Link>
                </Button>

                <Button variant="outline" asChild className="h-auto py-6 flex-col items-start">
                  <Link href="/admin/events">
                    <Calendar className="h-6 w-6 mb-2" />
                    <div className="text-left">
                      <div className="font-medium">Événements</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Créer et gérer vos événements
                      </div>
                    </div>
                  </Link>
                </Button>

                <Button variant="outline" asChild className="h-auto py-6 flex-col items-start">
                  <Link href="/admin/guests">
                    <Users className="h-6 w-6 mb-2" />
                    <div className="text-left">
                      <div className="font-medium">Invités</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Gérer tous les invités
                      </div>
                    </div>
                  </Link>
                </Button>

                <Button variant="outline" asChild className="h-auto py-6 flex-col items-start">
                  <Link href="/admin/rsvp">
                    <CheckCircle className="h-6 w-6 mb-2" />
                    <div className="text-left">
                      <div className="font-medium">RSVP</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Suivre les confirmations
                      </div>
                    </div>
                  </Link>
                </Button>

                <Button variant="outline" asChild className="h-auto py-6 flex-col items-start">
                  <Link href="/admin/analytics">
                    <Activity className="h-6 w-6 mb-2" />
                    <div className="text-left">
                      <div className="font-medium">Analytics</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Statistiques et rapports
                      </div>
                    </div>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Documentation</CardTitle>
              <CardDescription>
                Guides et ressources pour configurer votre application
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Link href="/admin/tutoriel" className="block p-4 rounded-lg border hover:bg-muted transition">
                  <div className="font-medium">📚 Tutoriel Complet</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Guide pas à pas pour démarrer avec l&apos;application
                  </div>
                </Link>

                <Link href="/admin/documentation" className="block p-4 rounded-lg border hover:bg-muted transition">
                  <div className="font-medium">📖 Documentation</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Documentation complète de toutes les fonctionnalités
                  </div>
                </Link>

                <a
                  href="/GUIDE-CONFIGURATION-EMAIL.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 rounded-lg border hover:bg-muted transition"
                >
                  <div className="font-medium">📧 Guide Email</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Configuration détaillée de Resend et templates
                  </div>
                </a>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
