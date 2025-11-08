"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar, Users, CheckCircle, Clock, TrendingUp, Plus,
  Mail, Eye, MousePointer, AlertCircle, RefreshCw, Activity,
  Target, Award
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
    activeTemplates: number;
  };
  recentActivity: Array<{
    id: string;
    guestName: string;
    eventName: string;
    status: string;
    createdAt: string;
  }>;
  topEvents: Array<{
    id: string;
    name: string;
    guests: number;
    rsvps: number;
    responseRate: number;
  }>;
}

export default function AdminDashboard() {
  const [events, setEvents] = useState<Event[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [initLoading, setInitLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'DECLINED':
        return 'bg-red-100 text-red-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Clock className="h-12 w-12 animate-spin text-[#009197] mx-auto mb-4" />
          <p className="text-[#004645]/70">Chargement du dashboard...</p>
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
            Vue d&apos;ensemble de vos événements et statistiques
          </p>
        </div>
        <div className="flex gap-2">
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

      {/* Alerts Section */}
      {stats && (stats.email.activeIntegrations === 0 || stats.overview.todayEvents > 0) && (
        <div className="space-y-3">
          {stats.email.activeIntegrations === 0 && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="flex items-center gap-3 p-4">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <div className="flex-1">
                  <p className="font-medium text-yellow-900">Aucune intégration email configurée</p>
                  <p className="text-sm text-yellow-700">Configurez une intégration pour envoyer des invitations</p>
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
                  <p className="text-sm text-[#004645]/70">N&apos;oubliez pas de vérifier la liste des invités</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Main Stats Grid */}
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

      {/* Secondary Stats and Activity */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Top Events */}
        {stats && stats.topEvents.length > 0 && (
          <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-[#004645] flex items-center gap-2">
                <Award className="h-5 w-5 text-[#FF4713]" />
                Top événements
              </CardTitle>
              <CardDescription>Meilleur taux de réponse</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {stats.topEvents.map((event, index) => (
                <div key={event.id} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-sm text-[#004645]">{event.name}</p>
                    <p className="text-xs text-[#004645]/70">
                      {event.rsvps}/{event.guests} réponses
                    </p>
                  </div>
                  <Badge className="bg-[#009197] text-white">
                    {event.responseRate}%
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Recent Activity */}
        {stats && stats.recentActivity.length > 0 && (
          <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-[#004645] flex items-center gap-2">
                <Activity className="h-5 w-5 text-[#009197]" />
                Activité récente
              </CardTitle>
              <CardDescription>Dernières réponses RSVP</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {stats.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <CheckCircle className="h-4 w-4 text-[#009197] mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#004645] truncate">
                      {activity.guestName}
                    </p>
                    <p className="text-xs text-[#004645]/70 truncate">{activity.eventName}</p>
                  </div>
                  <Badge variant="outline" className={getStatusColor(activity.status)}>
                    {activity.status === 'CONFIRMED' ? 'Confirmé' :
                     activity.status === 'DECLINED' ? 'Décliné' : 'En attente'}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-[#004645] flex items-center gap-2">
              <Target className="h-5 w-5 text-[#FF4713]" />
              Actions rapides
            </CardTitle>
            <CardDescription>Gérez vos événements</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/admin/events/new" className="block">
              <Button variant="outline" className="w-full justify-start border-[#009197] text-[#009197] hover:bg-[#009197] hover:text-white">
                <Plus className="h-4 w-4 mr-2" />
                Créer un événement
              </Button>
            </Link>
            <Link href="/admin/settings/integrations" className="block">
              <Button variant="outline" className="w-full justify-start">
                <Mail className="h-4 w-4 mr-2" />
                Intégrations email
              </Button>
            </Link>
            <Link href="/admin/templates" className="block">
              <Button variant="outline" className="w-full justify-start">
                <Eye className="h-4 w-4 mr-2" />
                Templates d&apos;emails
              </Button>
            </Link>
            <Link href="/admin/diagnostic" className="block">
              <Button variant="outline" className="w-full justify-start">
                <Activity className="h-4 w-4 mr-2" />
                Diagnostic système
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Events List */}
      <div>
        <h2 className="text-2xl font-bold text-[#004645] mb-6" style={{ fontFamily: "var(--font-abril)" }}>
          Mes événements
        </h2>

        {events.length === 0 ? (
          <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur">
            <CardContent className="text-center py-12">
              <Calendar className="h-12 w-12 text-[#009197] mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-[#004645]" style={{ fontFamily: "var(--font-abril)" }}>
                Aucun événement
              </h3>
              <p className="text-[#004645]/70 mb-4">
                Créez votre premier événement ou initialisez avec des données de démo
              </p>
              <div className="flex gap-4 justify-center">
                <Button
                  onClick={handleInitDemo}
                  disabled={initLoading}
                  variant="outline"
                  className="border-[#004645] text-[#004645] hover:bg-[#004645] hover:text-white"
                >
                  {initLoading ? "Initialisation..." : "Créer événement démo"}
                </Button>
                <Link href="/admin/events/new">
                  <Button className="bg-gradient-to-r from-[#004645] to-[#009197] hover:from-[#006C51] hover:to-[#009197] text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Créer un événement
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <Card key={event.id} className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur hover:shadow-xl transition-all duration-300 group">
                <CardHeader>
                  <CardTitle className="text-[#004645]" style={{ fontFamily: "var(--font-abril)" }}>
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
