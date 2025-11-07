"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Mail, Users, Download, Search, Send, Link as LinkIcon } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";
import { AddGuestDialog } from "@/components/add-guest-dialog";
import { ImportCSVDialog } from "@/components/import-csv-dialog";
import { SendInvitationsDialog } from "@/components/send-invitations-dialog";
import Papa from "papaparse";

interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  company?: string;
  tags: string[];
  status: string;
  token: string;
  rsvp?: {
    attending?: boolean;
    plusOnes: number;
    mealChoice?: string;
  };
}

interface EventDetails {
  id: string;
  name: string;
  startsAt: string;
  venueName?: string;
  city?: string;
  guests: Guest[];
}

export default function EventDetailsPage() {
  const params = useParams();
  const { toast } = useToast();
  const eventId = params.id as string;

  const [event, setEvent] = useState<EventDetails | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchEvent = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/events/${eventId}`);
      if (response.ok) {
        const data = await response.json();
        setEvent(data);
      }
    } catch (error) {
      console.error('Error fetching event:', error);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  const copyInvitationLink = (token: string) => {
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/guest/${token}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Lien copié",
      description: "Le lien d'invitation a été copié dans le presse-papier",
    });
  };

  const handleExportCSV = () => {
    if (!event) return;

    const csvData = event.guests.map((guest) => ({
      Prénom: guest.firstName,
      Nom: guest.lastName,
      Email: guest.email,
      Entreprise: guest.company || "",
      Tags: guest.tags.join(", "),
      Statut: guest.rsvp
        ? guest.rsvp.attending
          ? "Participe"
          : "Décline"
        : "En attente",
      "Accompagnants": guest.rsvp?.plusOnes || 0,
      "Choix repas": guest.rsvp?.mealChoice || "",
    }));

    const csv = Papa.unparse(csvData, {
      delimiter: ",",
      header: true,
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `invites-${event.name}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export réussi",
      description: `${event.guests.length} invité(s) exporté(s)`,
    });
  };

  const filteredGuests = event?.guests.filter((guest) => {
    const searchLower = search.toLowerCase();
    return (
      guest.firstName.toLowerCase().includes(searchLower) ||
      guest.lastName.toLowerCase().includes(searchLower) ||
      guest.email.toLowerCase().includes(searchLower) ||
      guest.company?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Événement introuvable</CardTitle>
            <CardDescription>
              Cet événement n&apos;existe pas ou a été supprimé
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin">
              <Button>Retour au dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const respondedGuests = event.guests.filter((g) => g.rsvp).length;
  const attendingGuests = event.guests.filter((g) => g.rsvp?.attending === true).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/admin" className="text-sm text-gray-600 hover:text-primary mb-1 block">
                ← Retour au dashboard
              </Link>
              <h1 className="text-2xl font-bold">{event.name}</h1>
              <p className="text-sm text-gray-600">
                {new Date(event.startsAt).toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={handleExportCSV}>
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </Button>
              <SendInvitationsDialog
                eventId={eventId}
                totalGuests={event.guests.length}
                pendingGuests={event.guests.filter((g) => !g.rsvp || g.rsvp.attending === null).length}
              />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total invités</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{event.guests.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Réponses</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{respondedGuests}</div>
              <p className="text-xs text-muted-foreground">
                {event.guests.length > 0
                  ? Math.round((respondedGuests / event.guests.length) * 100)
                  : 0}
                % du total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Participent</CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{attendingGuests}</div>
              <p className="text-xs text-muted-foreground">
                {respondedGuests > 0
                  ? Math.round((attendingGuests / respondedGuests) * 100)
                  : 0}
                % des réponses
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En attente</CardTitle>
              <Mail className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {event.guests.length - respondedGuests}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Guests Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Liste des invités</CardTitle>
                <CardDescription>
                  Gérez vos invités et suivez leurs réponses
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <AddGuestDialog eventId={eventId} onGuestAdded={fetchEvent} />
                <ImportCSVDialog eventId={eventId} onImportComplete={fetchEvent} />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Search */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Rechercher un invité..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr className="text-left text-sm text-gray-600">
                    <th className="pb-3 font-medium">Invité</th>
                    <th className="pb-3 font-medium">Email</th>
                    <th className="pb-3 font-medium">Entreprise</th>
                    <th className="pb-3 font-medium">Tags</th>
                    <th className="pb-3 font-medium">Statut</th>
                    <th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredGuests?.map((guest) => (
                    <tr key={guest.id} className="text-sm">
                      <td className="py-3">
                        <div>
                          <div className="font-medium">
                            {guest.firstName} {guest.lastName}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-gray-600">{guest.email}</td>
                      <td className="py-3 text-gray-600">{guest.company || '-'}</td>
                      <td className="py-3">
                        <div className="flex gap-1">
                          {guest.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="py-3">
                        {guest.rsvp ? (
                          guest.rsvp.attending ? (
                            <Badge className="bg-green-100 text-green-800">
                              ✓ Participe
                            </Badge>
                          ) : guest.rsvp.attending === false ? (
                            <Badge className="bg-red-100 text-red-800">
                              ✗ Décline
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Indécis</Badge>
                          )
                        ) : (
                          <Badge variant="outline">En attente</Badge>
                        )}
                      </td>
                      <td className="py-3">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyInvitationLink(guest.token)}
                        >
                          <LinkIcon className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
