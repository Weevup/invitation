"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar, Users, TrendingUp, Plus, Mail, RefreshCw,
  AlertCircle, Activity, Award, Trash2
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface Event {
  id: string;
  name: string;
  startsAt: string;
  venueName?: string;
  city?: string;
  _count: {
    guests: number;
    rsvps: number;
  };
}

interface DashboardStats {
  overview: {
    totalEvents: number;
    upcomingEvents: number;
    pastEvents: number;
    todayEvents: number;
    totalGuests: number;
    totalRsvps: number;
    responseRate: number;
    confirmedRsvps: number;
    pendingRsvps: number;
  };
  email: {
    totalSent: number;
    openRate: number;
    clickRate: number;
    activeIntegrations: number;
  };
}

export default function AdminDashboard() {
  const [events, setEvents] = useState<Event[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [initLoading, setInitLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefreshEnabled) return;

    const interval = setInterval(async () => {
      // Silent refresh - don't show loading states or toasts
      try {
        const [eventsRes, statsRes] = await Promise.all([
          fetch('/api/admin/events'),
          fetch('/api/admin/dashboard/stats')
        ]);

        if (eventsRes.ok) {
          const eventsData = await eventsRes.json();
          setEvents(eventsData);
        }

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }
      } catch (error) {
        console.error('Error in auto-refresh:', error);
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [autoRefreshEnabled]);

  const fetchData = async () => {
    try {
      const [eventsRes, statsRes] = await Promise.all([
        fetch('/api/admin/events'),
        fetch('/api/admin/dashboard/stats')
      ]);

      if (eventsRes.ok) {
        const eventsData = await eventsRes.json();
        setEvents(eventsData);
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
    toast.success('Données actualisées');
  };

  const handleInitDemo = async () => {
    setInitLoading(true);
    try {
      const response = await fetch('/api/admin/init', {
        method: 'POST',
      });
      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        fetchData();
      } else {
        toast.error(`Erreur: ${data.error}${data.details ? '\nDétails: ' + data.details : ''}`);
      }
    } catch (error) {
      console.error('Error initializing:', error);
      toast.error('Erreur de connexion');
    } finally {
      setInitLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId: string, eventName: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer l'événement "${eventName}" ?\n\nCette action supprimera également tous les invités, réponses, sessions, hébergements et transports associés. Cette action est irréversible.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/events/${eventId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Événement supprimé avec succès');
        fetchData();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Erreur de connexion');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin text-[#009197] mx-auto mb-4" />
          <p className="text-[#004645]/70">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#004645]" style={{ fontFamily: "var(--font-abril)" }}>
            Tableau de bord
          </h1>
          <p className="text-[#004645]/70 mt-1">
            Vue d&apos;ensemble de vos événements
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
            variant="outline"
            className={autoRefreshEnabled ? "border-green-500 text-green-700 bg-green-50" : "border-gray-300 text-gray-600"}
          >
            <Activity className={`h-4 w-4 mr-2 ${autoRefreshEnabled ? 'animate-pulse' : ''}`} />
            Auto-refresh {autoRefreshEnabled ? 'ON' : 'OFF'}
          </Button>
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            className="border-[#009197] text-[#009197]"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
          <Link href="/admin/events/new">
            <Button className="bg-gradient-to-r from-[#004645] to-[#009197] hover:from-[#006C51] hover:to-[#009197] text-white">
              <Plus className="h-4 w-4 mr-2" />
              Nouvel événement
            </Button>
          </Link>
        </div>
      </div>

      {/* Alerts */}
      {stats && (stats.email.activeIntegrations === 0 || stats.overview.todayEvents > 0) && (
        <div className="space-y-3">
          {stats.email.activeIntegrations === 0 && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="flex items-center gap-3 p-4">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <div className="flex-1">
                  <p className="font-medium text-yellow-900">Aucune intégration email configurée</p>
                  <p className="text-sm text-yellow-700">Configurez SendGrid, Resend ou SMTP pour envoyer des emails</p>
                </div>
                <Link href="/admin/settings/integrations">
                  <Button size="sm" variant="outline" className="border-yellow-600 text-yellow-900">
                    Configurer
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
          {stats.overview.todayEvents > 0 && (
            <Card className="border-[#009197] bg-[#009197]/5">
              <CardContent className="flex items-center gap-3 p-4">
                <Activity className="h-5 w-5 text-[#009197]" />
                <div>
                  <p className="font-medium text-[#004645]">
                    {stats.overview.todayEvents} événement{stats.overview.todayEvents > 1 ? 's' : ''} aujourd&apos;hui !
                  </p>
                  <p className="text-sm text-[#004645]/70">Vérifiez la liste des invités et les préparatifs</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Stats Grid */}
      {stats && (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#004645]">Événements</CardTitle>
              <Calendar className="h-4 w-4 text-[#009197]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#004645]" style={{ fontFamily: "var(--font-abril)" }}>
                {stats.overview.totalEvents}
              </div>
              <p className="text-xs text-[#004645]/70">
                {stats.overview.upcomingEvents} à venir • {stats.overview.pastEvents} passés
              </p>
            </CardContent>
          </Card>

          <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#004645]">Invités</CardTitle>
              <Users className="h-4 w-4 text-[#009197]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#004645]" style={{ fontFamily: "var(--font-abril)" }}>
                {stats.overview.totalGuests}
              </div>
              <p className="text-xs text-[#004645]/70">
                {stats.overview.totalRsvps} réponses • {stats.overview.pendingRsvps} en attente
              </p>
            </CardContent>
          </Card>

          <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#004645]">Taux de réponse</CardTitle>
              <TrendingUp className="h-4 w-4 text-[#FF4713]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#FF4713]" style={{ fontFamily: "var(--font-abril)" }}>
                {stats.overview.responseRate}%
              </div>
              <p className="text-xs text-[#004645]/70">
                {stats.overview.confirmedRsvps} confirmés
              </p>
            </CardContent>
          </Card>

          <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#004645]">Emails envoyés</CardTitle>
              <Mail className="h-4 w-4 text-[#009197]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#004645]" style={{ fontFamily: "var(--font-abril)" }}>
                {stats.email.totalSent}
              </div>
              <p className="text-xs text-[#004645]/70">
                {stats.email.openRate}% ouverts • {stats.email.clickRate}% cliqués
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Events List */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-[#004645]" style={{ fontFamily: "var(--font-abril)" }}>
            Mes événements
          </h2>
          {events.length > 0 && (
            <Link href="/admin/rsvp">
              <Button variant="outline" className="border-[#009197] text-[#009197]">
                Voir tous les invités
              </Button>
            </Link>
          )}
        </div>

        {events.length === 0 ? (
          <Card className="border-[#9CD9F6]/30 bg-gradient-to-br from-white via-[#9CD9F6]/5 to-white backdrop-blur">
            <CardContent className="py-16 px-8">
              <div className="max-w-2xl mx-auto text-center space-y-6">
                {/* Icon */}
                <div className="relative inline-flex">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#004645] to-[#009197] rounded-full blur-xl opacity-20 animate-pulse" />
                  <div className="relative bg-gradient-to-r from-[#004645] to-[#009197] p-6 rounded-full">
                    <Calendar className="h-16 w-16 text-white" />
                  </div>
                </div>

                {/* Title */}
                <div>
                  <h3 className="text-3xl font-bold mb-3 text-[#004645]" style={{ fontFamily: "var(--font-abril)" }}>
                    Bienvenue sur Weevup !
                  </h3>
                  <p className="text-lg text-[#004645]/70">
                    Créez votre premier événement pour commencer
                  </p>
                </div>

                {/* Steps */}
                <div className="grid md:grid-cols-3 gap-6 my-8">
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-full bg-[#009197] text-white flex items-center justify-center font-bold mx-auto">
                      1
                    </div>
                    <p className="text-sm font-medium text-[#004645]">Créez votre événement</p>
                    <p className="text-xs text-[#004645]/60">Nom, date, lieu et paramètres</p>
                  </div>
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-full bg-[#009197] text-white flex items-center justify-center font-bold mx-auto">
                      2
                    </div>
                    <p className="text-sm font-medium text-[#004645]">Invitez vos participants</p>
                    <p className="text-xs text-[#004645]/60">Envoyez des invitations personnalisées</p>
                  </div>
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-full bg-[#009197] text-white flex items-center justify-center font-bold mx-auto">
                      3
                    </div>
                    <p className="text-sm font-medium text-[#004645]">Suivez les réponses</p>
                    <p className="text-xs text-[#004645]/60">Gérez les RSVP en temps réel</p>
                  </div>
                </div>

                {/* CTA */}
                <div className="space-y-4">
                  <Link href="/admin/events/new">
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-[#004645] to-[#009197] hover:from-[#006C51] hover:to-[#009197] text-white text-lg px-8 py-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                    >
                      <Plus className="h-6 w-6 mr-2" />
                      Créer mon premier événement
                    </Button>
                  </Link>

                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-xs text-[#004645]/50 mb-2">Ou découvrez avec un exemple</p>
                    <Button
                      onClick={handleInitDemo}
                      disabled={initLoading}
                      variant="ghost"
                      size="sm"
                      className="text-[#004645]/60 hover:text-[#004645] text-sm"
                    >
                      {initLoading ? (
                        <>
                          <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
                          Initialisation...
                        </>
                      ) : (
                        <>
                          <Award className="h-3 w-3 mr-2" />
                          Charger un événement de démonstration
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <Card key={event.id} className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur hover:shadow-xl transition-all duration-300 relative">
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    handleDeleteEvent(event.id, event.name);
                  }}
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                  title="Supprimer l'événement"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <CardHeader>
                  <CardTitle className="text-[#004645] pr-8" style={{ fontFamily: "var(--font-abril)" }}>
                    {event.name}
                  </CardTitle>
                  <CardDescription>
                    <div className="flex items-center text-sm text-[#004645]/70">
                      <Calendar className="h-4 w-4 mr-1 text-[#009197]" />
                      {new Date(event.startsAt).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </div>
                    {event.venueName && (
                      <div className="text-sm mt-1 text-[#004645]/70">
                        {event.venueName}{event.city && `, ${event.city}`}
                      </div>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-[#004645]" style={{ fontFamily: "var(--font-abril)" }}>
                        {event._count.guests}
                      </div>
                      <div className="text-xs text-[#004645]/70">Invités</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-[#009197]" style={{ fontFamily: "var(--font-abril)" }}>
                        {event._count.rsvps}
                      </div>
                      <div className="text-xs text-[#004645]/70">Réponses</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-[#FF4713]" style={{ fontFamily: "var(--font-abril)" }}>
                        {event._count.guests > 0
                          ? Math.round((event._count.rsvps / event._count.guests) * 100)
                          : 0}
                        %
                      </div>
                      <div className="text-xs text-[#004645]/70">Taux</div>
                    </div>
                  </div>
                  <Link href={`/admin/events/${event.id}`}>
                    <Button className="w-full bg-gradient-to-r from-[#004645] to-[#009197] hover:from-[#006C51] hover:to-[#009197] text-white transition-all">
                      Gérer l&apos;événement
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
