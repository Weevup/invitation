"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, CheckCircle, Clock, TrendingUp, Plus, Sparkles } from "lucide-react";
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

export default function AdminDashboard() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [initLoading, setInitLoading] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/admin/events');
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
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
        fetchEvents(); // Reload events
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

  const totalGuests = events.reduce((acc, e) => acc + e._count.guests, 0);
  const totalRsvps = events.reduce((acc, e) => acc + e._count.rsvps, 0);
  const responseRate = totalGuests > 0 ? Math.round((totalRsvps / totalGuests) * 100) : 0;

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#004645]" style={{ fontFamily: "var(--font-abril)" }}>
              Tableau de bord
            </h1>
            <p className="text-[#004645]/70 mt-1">
              Vue d&apos;ensemble de vos événements et statistiques
            </p>
          </div>
          <Link href="/admin/events/new">
            <Button className="bg-gradient-to-r from-[#004645] to-[#009197] hover:from-[#006C51] hover:to-[#009197] text-white">
              <Plus className="h-4 w-4 mr-2" />
              Nouvel événement
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#004645]">Événements</CardTitle>
              <Calendar className="h-4 w-4 text-[#009197]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#004645]" style={{ fontFamily: "var(--font-abril)" }}>
                {events.length}
              </div>
              <p className="text-xs text-[#004645]/70">Total</p>
            </CardContent>
          </Card>

          <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#004645]">Invités</CardTitle>
              <Users className="h-4 w-4 text-[#009197]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#004645]" style={{ fontFamily: "var(--font-abril)" }}>
                {totalGuests}
              </div>
              <p className="text-xs text-[#004645]/70">Total</p>
            </CardContent>
          </Card>

          <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#004645]">Réponses</CardTitle>
              <CheckCircle className="h-4 w-4 text-[#009197]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#004645]" style={{ fontFamily: "var(--font-abril)" }}>
                {totalRsvps}
              </div>
              <p className="text-xs text-[#004645]/70">Total</p>
            </CardContent>
          </Card>

          <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#004645]">Taux réponse</CardTitle>
              <TrendingUp className="h-4 w-4 text-[#FF4713]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#FF4713]" style={{ fontFamily: "var(--font-abril)" }}>
                {responseRate}%
              </div>
              <p className="text-xs text-[#004645]/70">Moyenne</p>
            </CardContent>
          </Card>
        </div>

        {/* Events List */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[#004645]" style={{ fontFamily: "var(--font-abril)" }}>
            Mes événements
          </h2>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <Clock className="h-8 w-8 animate-spin text-[#009197] mx-auto mb-2" />
            <p className="text-[#004645]/70">Chargement...</p>
          </div>
        ) : events.length === 0 ? (
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
  );
}
