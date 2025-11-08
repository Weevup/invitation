"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Mail, Send, Settings, CheckCircle, XCircle, AlertTriangle,
  ExternalLink, Copy, Check
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";

export default function EmailSettingsPage() {
  const { toast } = useToast();
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [testEmail, setTestEmail] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const handleTestEmail = async () => {
    if (!testEmail) {
      toast({
        title: "Email requis",
        description: "Veuillez entrer une adresse email pour le test",
        variant: "destructive",
      });
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const response = await fetch('/api/admin/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmail }),
      });

      const data = await response.json();

      setTestResult(data);

      if (data.success) {
        toast({
          title: "Test réussi !",
          description: data.message,
        });
      } else {
        toast({
          title: "Test échoué",
          description: data.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: "Erreur de connexion au serveur",
      });
      toast({
        title: "Erreur",
        description: "Impossible de se connecter au serveur",
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
    toast({
      title: "Copié !",
      description: `${label} copié dans le presse-papier`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#9CD9F6] via-white to-[#9CD9F6] py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin">
            <Button variant="ghost" size="sm" className="mb-4">
              ← Retour au dashboard
            </Button>
          </Link>

          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-lg bg-[#009197]/10">
              <Mail className="h-8 w-8 text-[#009197]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#004645]" style={{ fontFamily: "var(--font-abril)" }}>
                Configuration Email
              </h1>
              <p className="text-[#004645]/70">
                Configurez votre service d&apos;envoi d&apos;emails (Resend ou SendGrid)
              </p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="setup" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="setup">Configuration</TabsTrigger>
            <TabsTrigger value="test">Test</TabsTrigger>
            <TabsTrigger value="docs">Documentation</TabsTrigger>
          </TabsList>

          {/* Setup Tab */}
          <TabsContent value="setup" className="space-y-6">
            {/* Provider Selection */}
            <Card className="border-[#009197]/30">
              <CardHeader>
                <CardTitle className="text-[#004645]">Choix du provider</CardTitle>
                <CardDescription>
                  Sélectionnez votre service d&apos;envoi d&apos;emails préféré
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Resend */}
                  <Card className="border-2 border-[#009197] bg-[#009197]/5">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Resend</CardTitle>
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          Recommandé
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-[#004645]/70">
                        Service moderne et simple, parfait pour les développeurs
                      </p>
                      <ul className="text-sm space-y-2">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          Configuration simple
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          100 emails/jour gratuits
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          Tracking intégré
                        </li>
                      </ul>
                      <Button
                        className="w-full bg-[#009197] hover:bg-[#006C51]"
                        onClick={() => window.open('https://resend.com', '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Créer un compte
                      </Button>
                    </CardContent>
                  </Card>

                  {/* SendGrid */}
                  <Card className="border-[#9CD9F6]/30">
                    <CardHeader>
                      <CardTitle className="text-lg">SendGrid</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-[#004645]/70">
                        Solution entreprise avec analytics avancés
                      </p>
                      <ul className="text-sm space-y-2">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          Analytics détaillés
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          100 emails/jour gratuits
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          Support A/B testing
                        </li>
                      </ul>
                      <Button
                        variant="outline"
                        className="w-full border-[#004645] text-[#004645]"
                        onClick={() => window.open('https://sendgrid.com', '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Créer un compte
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>

            {/* Configuration Variables */}
            <Card className="border-[#FF4713]/30">
              <CardHeader>
                <CardTitle className="text-[#004645]">Variables d&apos;environnement</CardTitle>
                <CardDescription>
                  Ajoutez ces variables dans votre fichier <code className="bg-gray-100 px-2 py-1 rounded">.env.local</code>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Email Provider */}
                <div className="space-y-2">
                  <Label>Provider (resend ou sendgrid)</Label>
                  <div className="flex gap-2">
                    <Input
                      value="EMAIL_PROVIDER=resend"
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard('EMAIL_PROVIDER=resend', 'EMAIL_PROVIDER')}
                    >
                      {copied === 'EMAIL_PROVIDER' ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* API Key */}
                <div className="space-y-2">
                  <Label>Clé API</Label>
                  <div className="flex gap-2">
                    <Input
                      value="RESEND_API_KEY=re_..."
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard('RESEND_API_KEY=', 'RESEND_API_KEY')}
                    >
                      {copied === 'RESEND_API_KEY' ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-[#004645]/60">
                    Pour SendGrid, utilisez <code className="bg-gray-100 px-1 rounded">SENDGRID_API_KEY</code>
                  </p>
                </div>

                {/* From Email */}
                <div className="space-y-2">
                  <Label>Email expéditeur (vérifié)</Label>
                  <div className="flex gap-2">
                    <Input
                      value="EMAIL_FROM=noreply@votredomaine.com"
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard('EMAIL_FROM=', 'EMAIL_FROM')}
                    >
                      {copied === 'EMAIL_FROM' ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* From Name */}
                <div className="space-y-2">
                  <Label>Nom expéditeur</Label>
                  <div className="flex gap-2">
                    <Input
                      value="EMAIL_FROM_NAME=Weevup"
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard('EMAIL_FROM_NAME=Weevup', 'EMAIL_FROM_NAME')}
                    >
                      {copied === 'EMAIL_FROM_NAME' ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div className="text-sm text-yellow-800">
                      <p className="font-semibold mb-1">Important :</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>L&apos;email expéditeur doit être vérifié dans votre provider</li>
                        <li>Redémarrez votre serveur après avoir modifié le .env</li>
                        <li>Ne commitez jamais votre fichier .env dans Git</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Test Tab */}
          <TabsContent value="test" className="space-y-6">
            <Card className="border-[#009197]/30">
              <CardHeader>
                <CardTitle className="text-[#004645]">Tester la configuration</CardTitle>
                <CardDescription>
                  Envoyez un email de test pour vérifier que tout fonctionne
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="test-email">Email de test</Label>
                  <Input
                    id="test-email"
                    type="email"
                    placeholder="votre@email.com"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                  />
                </div>

                <Button
                  onClick={handleTestEmail}
                  disabled={testing || !testEmail}
                  className="w-full bg-gradient-to-r from-[#004645] to-[#009197] hover:from-[#006C51] hover:to-[#009197] text-white"
                >
                  {testing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Envoyer un email de test
                    </>
                  )}
                </Button>

                {testResult && (
                  <div
                    className={`p-4 rounded-lg border ${
                      testResult.success
                        ? 'bg-green-50 border-green-200'
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {testResult.success ? (
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p
                          className={`font-semibold ${
                            testResult.success ? 'text-green-800' : 'text-red-800'
                          }`}
                        >
                          {testResult.success ? 'Test réussi !' : 'Test échoué'}
                        </p>
                        <p
                          className={`text-sm mt-1 ${
                            testResult.success ? 'text-green-700' : 'text-red-700'
                          }`}
                        >
                          {testResult.message}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Docs Tab */}
          <TabsContent value="docs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-[#004645]">Guide de configuration</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none">
                <h3 className="text-[#004645] font-bold">1. Créer un compte Resend (Recommandé)</h3>
                <ol className="list-decimal list-inside space-y-2 text-[#004645]/80">
                  <li>Allez sur <a href="https://resend.com" target="_blank" rel="noopener noreferrer" className="text-[#009197] hover:underline">resend.com</a></li>
                  <li>Créez un compte gratuit</li>
                  <li>Vérifiez votre domaine ou utilisez le domaine de test</li>
                  <li>Créez une clé API dans Settings → API Keys</li>
                  <li>Copiez la clé (format: <code className="bg-gray-100 px-1 rounded">re_...</code>)</li>
                </ol>

                <h3 className="text-[#004645] font-bold mt-6">2. Configurer les variables d&apos;environnement</h3>
                <p className="text-[#004645]/80">
                  Créez un fichier <code className="bg-gray-100 px-1 rounded">.env.local</code> à la racine de votre projet :
                </p>
                <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
{`EMAIL_PROVIDER=resend
RESEND_API_KEY=re_votre_cle_api
EMAIL_FROM=noreply@votredomaine.com
EMAIL_FROM_NAME=Weevup
NEXT_PUBLIC_APP_URL=https://votredomaine.com`}
                </pre>

                <h3 className="text-[#004645] font-bold mt-6">3. Vérifier votre domaine</h3>
                <ol className="list-decimal list-inside space-y-2 text-[#004645]/80">
                  <li>Dans Resend, allez dans Domains</li>
                  <li>Ajoutez votre domaine</li>
                  <li>Configurez les enregistrements DNS (SPF, DKIM, DMARC)</li>
                  <li>Attendez la vérification (peut prendre quelques minutes)</li>
                </ol>

                <h3 className="text-[#004645] font-bold mt-6">4. Tester la configuration</h3>
                <p className="text-[#004645]/80">
                  Utilisez l&apos;onglet &quot;Test&quot; pour envoyer un email de test et vérifier que tout fonctionne.
                </p>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                  <p className="text-sm text-blue-800">
                    <strong>Astuce :</strong> En développement, vous pouvez utiliser le domaine de test de Resend
                    sans vérification. Les emails seront envoyés normalement mais marqués comme test.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
