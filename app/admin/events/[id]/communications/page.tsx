"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft, Bell, Sparkles, CheckCircle, Send, Calendar,
  Clock, Users, Mail, TrendingUp, BarChart3, Settings, Save, Info
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";

interface CommunicationStats {
  saveTheDate: {
    sent: number;
    opened: number;
    clicked: number;
    scheduledFor?: string;
  };
  invitation: {
    sent: number;
    opened: number;
    clicked: number;
    rsvpReceived: number;
    scheduledFor?: string;
  };
  reminder: {
    sent: number;
    opened: number;
    scheduledFor?: string;
  };
}

export default function CommunicationsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const eventId = params.id as string;

  const [stats, setStats] = useState<CommunicationStats>({
    saveTheDate: { sent: 0, opened: 0, clicked: 0 },
    invitation: { sent: 0, opened: 0, clicked: 0, rsvpReceived: 0 },
    reminder: { sent: 0, opened: 0 },
  });

  const [scheduleDates, setScheduleDates] = useState({
    saveTheDate: "",
    invitation: "",
    reminder: "",
  });

  const [autoReminders, setAutoReminders] = useState({
    enabled: false,
    followUpEnabled: false,
    followUpDays: 7,
    preEventEnabled: false,
    preEventDays: 3,
  });

  // Charger la config des auto-reminders au montage
  useEffect(() => {
    fetch(`/api/admin/events/${eventId}/reminders-config`)
      .then(res => res.json())
      .then(data => setAutoReminders(data))
      .catch(console.error);
  }, [eventId]);

  // Charger les statistiques d'emails
  const loadStats = async () => {
    try {
      const response = await fetch(`/api/admin/events/${eventId}/email-stats`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error loading email stats:', error);
    }
  };

  useEffect(() => {
    if (eventId) {
      loadStats();
    }
  }, [eventId]);

  const handleScheduleSend = async (type: "saveTheDate" | "invitation" | "reminder") => {
    const date = scheduleDates[type];
    if (!date) {
      toast({
        title: "Date requise",
        description: "Veuillez sélectionner une date d&apos;envoi",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`/api/admin/events/${eventId}/send-emails`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: type === "saveTheDate" ? "save-the-date" : type,
          scheduleFor: date,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "✅ Envoi programmé",
          description: data.message,
        });
        // Refresh stats
        await loadStats();
      } else {
        toast({
          title: "Erreur",
          description: data.error || "Impossible de programmer l'envoi",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue",
        variant: "destructive",
      });
    }
  };

  const handleSendNow = async (type: "saveTheDate" | "invitation" | "reminder") => {
    try {
      const response = await fetch(`/api/admin/events/${eventId}/send-emails`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: type === "saveTheDate" ? "save-the-date" : type,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "✅ Envoi réussi",
          description: `${data.sent} email(s) envoyé(s)`,
        });
        // Refresh stats
        await loadStats();
      } else {
        toast({
          title: "Erreur",
          description: data.error || "Impossible d'envoyer les emails",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue",
        variant: "destructive",
      });
    }
  };

  const handleSaveReminders = async () => {
    try {
      const response = await fetch(`/api/admin/events/${eventId}/reminders-config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(autoReminders),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "✅ Sauvegardé",
          description: "Configuration des rappels mise à jour",
        });
      } else {
        toast({
          title: "Erreur",
          description: data.error || "Impossible de sauvegarder",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue",
        variant: "destructive",
      });
    }
  };

  const calculateRate = (count: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((count / total) * 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#9CD9F6] via-white to-[#9CD9F6] py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <Link href={`/admin/events/${eventId}`}>
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour à l&apos;événement
            </Button>
          </Link>

          <h1 className="text-3xl font-bold text-[#004645] mb-2" style={{ fontFamily: "var(--font-abril)" }}>
            Campagnes d&apos;emails
          </h1>
          <p className="text-[#004645]/70 text-lg">
            Planifiez et envoyez vos emails : Save the Date, Invitations et Rappels
          </p>
        </div>

        {/* Guide du processus d'envoi */}
        <Card className="mb-8 border-[#009197]/30 bg-gradient-to-br from-[#9CD9F6]/10 to-white/80">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#009197]/10">
                <Info className="h-6 w-6 text-[#009197]" />
              </div>
              <div>
                <CardTitle className="text-[#004645]">Comment ça marche ?</CardTitle>
                <CardDescription>Suivez ce processus en 3 étapes pour vos envois</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              {/* Étape 1 */}
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-[#FF4713] to-[#FF6B3D] text-white flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-bold text-[#004645] mb-2">Créez votre template</h3>
                  <p className="text-sm text-[#004645]/70 mb-3">
                    Allez dans <strong>Templates</strong> pour créer ou modifier vos emails (Save the Date, Invitation, ou email personnalisé avec l&apos;éditeur WYSIWYG)
                  </p>
                  <Link href={`/admin/events/${eventId}/templates`}>
                    <Button size="sm" variant="outline" className="border-[#009197] text-[#009197]">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Aller aux Templates
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Étape 2 */}
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-[#009197] to-[#004645] text-white flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-bold text-[#004645] mb-2">Choisissez le type d&apos;email</h3>
                  <p className="text-sm text-[#004645]/70 mb-2">
                    Sélectionnez parmi les 3 types ci-dessous selon votre calendrier :
                  </p>
                  <ul className="text-xs text-[#004645]/70 space-y-1">
                    <li>• <strong>Save the Date</strong> : J-90 à J-60</li>
                    <li>• <strong>Invitation</strong> : J-60 à J-30</li>
                    <li>• <strong>Rappel</strong> : J-7 à J-2</li>
                  </ul>
                </div>
              </div>

              {/* Étape 3 */}
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-[#004645] to-[#006C51] text-white flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-bold text-[#004645] mb-2">Programmez ou envoyez</h3>
                  <p className="text-sm text-[#004645]/70 mb-2">
                    Pour chaque type d&apos;email ci-dessous, vous pouvez :
                  </p>
                  <ul className="text-xs text-[#004645]/70 space-y-1">
                    <li>• <strong>Programmer</strong> : envoi automatique à une date précise</li>
                    <li>• <strong>Envoyer maintenant</strong> : envoi immédiat à tous les invités</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timeline Overview */}
        <Card className="mb-8 border-[#FF4713]/30 bg-gradient-to-r from-[#FF4713]/5 via-[#009197]/5 to-[#004645]/5">
          <CardHeader>
            <CardTitle className="text-[#004645]">Vue d&apos;ensemble du cycle</CardTitle>
            <CardDescription>Progression des communications de votre événement</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {/* Save the Date */}
              <div className="text-center p-4 bg-white/80 rounded-lg">
                <div className="w-12 h-12 bg-gradient-to-br from-[#FF4713] to-[#FF6B3D] rounded-full flex items-center justify-center mx-auto mb-3">
                  <Bell className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-bold text-[#004645] mb-1">Save the Date</h3>
                <Badge variant={stats.saveTheDate.sent > 0 ? "default" : "secondary"}>
                  {stats.saveTheDate.sent > 0 ? "Envoyé" : "Non envoyé"}
                </Badge>
                <div className="mt-3 text-sm text-[#004645]/70">
                  {stats.saveTheDate.sent} envoyés
                </div>
              </div>

              {/* Invitation */}
              <div className="text-center p-4 bg-white/80 rounded-lg">
                <div className="w-12 h-12 bg-gradient-to-br from-[#009197] to-[#9CD9F6] rounded-full flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-bold text-[#004645] mb-1">Invitation</h3>
                <Badge variant={stats.invitation.sent > 0 ? "default" : "secondary"}>
                  {stats.invitation.sent > 0 ? "Envoyé" : "Non envoyé"}
                </Badge>
                <div className="mt-3 text-sm text-[#004645]/70">
                  {stats.invitation.rsvpReceived} réponses RSVP
                </div>
              </div>

              {/* Reminder */}
              <div className="text-center p-4 bg-white/80 rounded-lg">
                <div className="w-12 h-12 bg-gradient-to-br from-[#004645] to-[#006C51] rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-bold text-[#004645] mb-1">Rappel</h3>
                <Badge variant={stats.reminder.sent > 0 ? "default" : "secondary"}>
                  {stats.reminder.sent > 0 ? "Envoyé" : "Non envoyé"}
                </Badge>
                <div className="mt-3 text-sm text-[#004645]/70">
                  {stats.reminder.sent} envoyés
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="schedule" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="schedule">Planification</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Paramètres</TabsTrigger>
          </TabsList>

          {/* Planification Tab */}
          <TabsContent value="schedule" className="space-y-4">
            {/* Save the Date */}
            <Card className="border-[#FF4713]/30">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-orange-50">
                      <Bell className="h-5 w-5 text-[#FF4713]" />
                    </div>
                    <div>
                      <CardTitle className="text-[#004645]">Save the Date</CardTitle>
                      <CardDescription>Pré-invitation (J-90 à J-60)</CardDescription>
                    </div>
                  </div>
                  <Badge>Étape 1</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 mb-4 p-3 bg-[#FF4713]/5 rounded-lg">
                  <Info className="h-4 w-4 text-[#FF4713]" />
                  <p className="text-sm text-[#004645]/70">
                    Créez ou modifiez votre Save the Date avant d&apos;envoyer
                  </p>
                  <Link href={`/admin/events/${eventId}/save-the-date`} className="ml-auto">
                    <Button size="sm" variant="outline" className="border-[#FF4713] text-[#FF4713]">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Éditer le template
                    </Button>
                  </Link>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="saveTheDate-date">Date d&apos;envoi programmée</Label>
                    <Input
                      id="saveTheDate-date"
                      type="datetime-local"
                      value={scheduleDates.saveTheDate}
                      onChange={(e) => setScheduleDates({ ...scheduleDates, saveTheDate: e.target.value })}
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <Button
                      onClick={() => handleScheduleSend("saveTheDate")}
                      className="bg-[#FF4713] hover:bg-[#FF6B3D]"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Programmer
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleSendNow("saveTheDate")}
                      className="border-[#FF4713] text-[#FF4713]"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Envoyer maintenant
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Invitation */}
            <Card className="border-[#009197]/30">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-teal-50">
                      <Sparkles className="h-5 w-5 text-[#009197]" />
                    </div>
                    <div>
                      <CardTitle className="text-[#004645]">Invitation officielle</CardTitle>
                      <CardDescription>Avec lien RSVP (J-60 à J-30)</CardDescription>
                    </div>
                  </div>
                  <Badge>Étape 2</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 mb-4 p-3 bg-[#009197]/5 rounded-lg">
                  <Info className="h-4 w-4 text-[#009197]" />
                  <p className="text-sm text-[#004645]/70">
                    Créez ou modifiez votre Invitation avant d&apos;envoyer
                  </p>
                  <Link href={`/admin/events/${eventId}/invitation`} className="ml-auto">
                    <Button size="sm" variant="outline" className="border-[#009197] text-[#009197]">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Éditer le template
                    </Button>
                  </Link>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="invitation-date">Date d&apos;envoi programmée</Label>
                    <Input
                      id="invitation-date"
                      type="datetime-local"
                      value={scheduleDates.invitation}
                      onChange={(e) => setScheduleDates({ ...scheduleDates, invitation: e.target.value })}
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <Button
                      onClick={() => handleScheduleSend("invitation")}
                      className="bg-[#009197] hover:bg-[#006C51]"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Programmer
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleSendNow("invitation")}
                      className="border-[#009197] text-[#009197]"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Envoyer maintenant
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reminder */}
            <Card className="border-[#004645]/30">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-50">
                      <CheckCircle className="h-5 w-5 text-[#004645]" />
                    </div>
                    <div>
                      <CardTitle className="text-[#004645]">Rappel</CardTitle>
                      <CardDescription>Avant l&apos;événement (J-7 à J-2)</CardDescription>
                    </div>
                  </div>
                  <Badge>Étape 3</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 mb-4 p-3 bg-[#004645]/5 rounded-lg">
                  <Info className="h-4 w-4 text-[#004645]" />
                  <p className="text-sm text-[#004645]/70">
                    Créez un email de rappel personnalisé avec l&apos;éditeur WYSIWYG
                  </p>
                  <Link href={`/admin/events/${eventId}/email-editor`} className="ml-auto">
                    <Button size="sm" variant="outline" className="border-[#004645] text-[#004645]">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Créer un rappel
                    </Button>
                  </Link>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="reminder-date">Date d&apos;envoi programmée</Label>
                    <Input
                      id="reminder-date"
                      type="datetime-local"
                      value={scheduleDates.reminder}
                      onChange={(e) => setScheduleDates({ ...scheduleDates, reminder: e.target.value })}
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <Button
                      onClick={() => handleScheduleSend("reminder")}
                      className="bg-[#004645] hover:bg-[#006C51]"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Programmer
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleSendNow("reminder")}
                      className="border-[#004645] text-[#004645]"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Envoyer maintenant
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              {/* Save the Date Analytics */}
              <Card className="border-[#FF4713]/30">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-[#FF4713]" />
                    <CardTitle className="text-sm">Save the Date</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#004645]/70">Envoyés</span>
                    <span className="font-bold text-[#004645]">{stats.saveTheDate.sent}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#004645]/70">Ouverts</span>
                    <span className="font-bold text-green-600">
                      {stats.saveTheDate.opened} ({calculateRate(stats.saveTheDate.opened, stats.saveTheDate.sent)}%)
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#004645]/70">Clics</span>
                    <span className="font-bold text-blue-600">
                      {stats.saveTheDate.clicked} ({calculateRate(stats.saveTheDate.clicked, stats.saveTheDate.sent)}%)
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Invitation Analytics */}
              <Card className="border-[#009197]/30">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-[#009197]" />
                    <CardTitle className="text-sm">Invitation</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#004645]/70">Envoyés</span>
                    <span className="font-bold text-[#004645]">{stats.invitation.sent}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#004645]/70">Ouverts</span>
                    <span className="font-bold text-green-600">
                      {stats.invitation.opened} ({calculateRate(stats.invitation.opened, stats.invitation.sent)}%)
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#004645]/70">RSVP reçus</span>
                    <span className="font-bold text-purple-600">
                      {stats.invitation.rsvpReceived} ({calculateRate(stats.invitation.rsvpReceived, stats.invitation.sent)}%)
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Reminder Analytics */}
              <Card className="border-[#004645]/30">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-[#004645]" />
                    <CardTitle className="text-sm">Rappel</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#004645]/70">Envoyés</span>
                    <span className="font-bold text-[#004645]">{stats.reminder.sent}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#004645]/70">Ouverts</span>
                    <span className="font-bold text-green-600">
                      {stats.reminder.opened} ({calculateRate(stats.reminder.opened, stats.reminder.sent)}%)
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Chart */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-[#009197]" />
                  <CardTitle>Performance globale</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Taux d&apos;ouverture moyen</span>
                      <span className="text-sm font-bold text-green-600">
                        {calculateRate(
                          stats.saveTheDate.opened + stats.invitation.opened + stats.reminder.opened,
                          stats.saveTheDate.sent + stats.invitation.sent + stats.reminder.sent
                        )}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{
                          width: `${calculateRate(
                            stats.saveTheDate.opened + stats.invitation.opened + stats.reminder.opened,
                            stats.saveTheDate.sent + stats.invitation.sent + stats.reminder.sent
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Taux de conversion RSVP</span>
                      <span className="text-sm font-bold text-purple-600">
                        {calculateRate(stats.invitation.rsvpReceived, stats.invitation.sent)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full"
                        style={{
                          width: `${calculateRate(stats.invitation.rsvpReceived, stats.invitation.sent)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            {/* Info Alert - Scheduled Emails Coming Soon */}
            <Card className="border-blue-200 bg-blue-50/50">
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <h3 className="font-semibold text-blue-900">
                      📅 Envois programmés et rappels automatiques
                    </h3>
                    <div className="text-sm text-blue-800 space-y-2">
                      <p>
                        <strong>Envois immédiats :</strong> Vous pouvez envoyer des rappels <strong>maintenant</strong> via le bouton &quot;Envoyer des invitations&quot; sur la page Invités ou Vue d&apos;ensemble.
                      </p>
                      <p>
                        <strong>Envois programmés :</strong> La planification d&apos;emails pour une date future nécessite une infrastructure de job queue (Vercel Cron, Upstash QStash, etc.) qui sera ajoutée prochainement.
                      </p>
                      <p className="pt-2">
                        En attendant, pour envoyer des rappels à vos invités :
                      </p>
                      <ol className="list-decimal list-inside space-y-1 ml-2">
                        <li>Allez sur <strong>Invités</strong></li>
                        <li>Cliquez sur <strong>&quot;Envoyer des invitations&quot;</strong></li>
                        <li>Sélectionnez <strong>&quot;Rappel&quot;</strong> comme type d&apos;email</li>
                        <li>Choisissez vos invités et envoyez immédiatement</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-[#004645]" />
                  <CardTitle>Relances automatiques (À venir)</CardTitle>
                </div>
                <CardDescription>
                  Configurez l&apos;envoi automatique de relances pour les non-répondants
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-[#9CD9F6]/10 rounded-lg">
                  <div>
                    <Label htmlFor="auto-reminders">Activer les relances automatiques</Label>
                    <p className="text-xs text-[#004645]/60 mt-1">
                      Envoyer automatiquement des rappels aux invités n&apos;ayant pas répondu
                    </p>
                  </div>
                  <input
                    id="auto-reminders"
                    type="checkbox"
                    checked={autoReminders.enabled}
                    onChange={(e) => setAutoReminders({ ...autoReminders, enabled: e.target.checked })}
                    className="w-12 h-6"
                  />
                </div>

                {autoReminders.enabled && (
                  <>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <div className="flex-1">
                          <Label htmlFor="follow-up-enabled">Relance pour non-répondants</Label>
                          <p className="text-xs text-[#004645]/60 mt-1">
                            Envoyer automatiquement une relance aux invités n&apos;ayant pas répondu
                          </p>
                        </div>
                        <input
                          id="follow-up-enabled"
                          type="checkbox"
                          checked={autoReminders.followUpEnabled}
                          onChange={(e) => setAutoReminders({ ...autoReminders, followUpEnabled: e.target.checked })}
                          className="w-10 h-5"
                        />
                      </div>

                      {autoReminders.followUpEnabled && (
                        <div className="ml-4">
                          <Label htmlFor="follow-up-days">Jours après l&apos;invitation</Label>
                          <Input
                            id="follow-up-days"
                            type="number"
                            value={autoReminders.followUpDays}
                            onChange={(e) =>
                              setAutoReminders({ ...autoReminders, followUpDays: parseInt(e.target.value) })
                            }
                            min="1"
                            max="30"
                          />
                          <p className="text-xs text-[#004645]/60 mt-1">
                            Envoyer la relance {autoReminders.followUpDays} jour(s) après l&apos;invitation
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <div className="flex-1">
                          <Label htmlFor="pre-event-enabled">Rappel avant événement</Label>
                          <p className="text-xs text-[#004645]/60 mt-1">
                            Envoyer un rappel aux participants confirmés avant l&apos;événement
                          </p>
                        </div>
                        <input
                          id="pre-event-enabled"
                          type="checkbox"
                          checked={autoReminders.preEventEnabled}
                          onChange={(e) => setAutoReminders({ ...autoReminders, preEventEnabled: e.target.checked })}
                          className="w-10 h-5"
                        />
                      </div>

                      {autoReminders.preEventEnabled && (
                        <div className="ml-4">
                          <Label htmlFor="pre-event-days">Jours avant l&apos;événement</Label>
                          <Input
                            id="pre-event-days"
                            type="number"
                            value={autoReminders.preEventDays}
                            onChange={(e) =>
                              setAutoReminders({ ...autoReminders, preEventDays: parseInt(e.target.value) })
                            }
                            min="1"
                            max="14"
                          />
                          <p className="text-xs text-[#004645]/60 mt-1">
                            Envoyer un rappel {autoReminders.preEventDays} jour(s) avant l&apos;événement
                          </p>
                        </div>
                      )}
                    </div>

                    <Button onClick={handleSaveReminders} className="bg-[#004645] hover:bg-[#006C51]">
                      <Save className="h-4 w-4 mr-2" />
                      Enregistrer les paramètres
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
