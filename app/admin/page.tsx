"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, Mail, CheckCircle, Clock, TrendingUp } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Mail className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">Admin Dashboard</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost">Retour accueil</Button>
              </Link>
              <Button>Créer un événement</Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Événements</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{events.length}</div>
                <p className="text-xs text-muted-foreground">Total</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Invités</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {events.reduce((acc, e) => acc + e._count.guests, 0)}
                </div>
                <p className="text-xs text-muted-foreground">Total</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Réponses</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {events.reduce((acc, e) => acc + e._count.rsvps, 0)}
                </div>
                <p className="text-xs text-muted-foreground">Total</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taux réponse</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {events.length > 0
                    ? Math.round(
                        (events.reduce((acc, e) => acc + e._count.rsvps, 0) /
                          events.reduce((acc, e) => acc + e._count.guests, 0)) *
                          100
                      )
                    : 0}
                  %
                </div>
                <p className="text-xs text-muted-foreground">Moyenne</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Events List */}
        <div className="mb-4">
          <h2 className="text-2xl font-bold mb-4">Mes événements</h2>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <Clock className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
            <p className="text-gray-600">Chargement...</p>
          </div>
        ) : events.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucun événement</h3>
              <p className="text-gray-600 mb-4">
                Créez votre premier événement pour commencer
              </p>
              <Button>Créer un événement</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle>{event.name}</CardTitle>
                    <CardDescription>
                      <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(event.startsAt).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </div>
                      {event.venueName && (
                        <div className="flex items-center text-sm mt-1">
                          {event.venueName}, {event.city}
                        </div>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{event._count.guests}</div>
                        <div className="text-xs text-gray-600">Invités</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{event._count.rsvps}</div>
                        <div className="text-xs text-gray-600">Réponses</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">
                          {event._count.guests > 0
                            ? Math.round((event._count.rsvps / event._count.guests) * 100)
                            : 0}
                          %
                        </div>
                        <div className="text-xs text-gray-600">Taux</div>
                      </div>
                    </div>
                    <Link href={`/admin/events/${event.id}`}>
                      <Button className="w-full" variant="outline">
                        Gérer l&apos;événement
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
