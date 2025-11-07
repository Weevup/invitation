"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Mail, Users, Download, Search, Send, Link as LinkIcon,
  Calendar, MapPin, CheckCircle, Clock, UserPlus, Upload,
  ArrowRight, Sparkles
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";
import { AddGuestDialog } from "@/components/add-guest-dialog";
import { ImportCSVDialog } from "@/components/import-csv-dialog";
import { SendInvitationsDialog } from "@/components/send-invitations-dialog";
import { WeevupLogo } from "@/components/weevup-logo";
import { ShowcaseBuilder } from "@/components/showcase-builder";
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
  slug: string;
  startsAt: string;
  venueName?: string;
  city?: string;
  guests: Guest[];
  showcaseEnabled: boolean;
  showcaseTitle: string | null;
  showcaseSubtitle: string | null;
  showcaseBannerImage: string | null;
  showcaseTheme: string;
  showcaseSections: any;
  showcasePrimaryColor: string;
  showcaseSecondaryColor: string;
  showcaseCustomCSS: string | null;
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
      <div className="min-h-screen bg-gradient-to-br from-[#9CD9F6] via-white to-[#9CD9F6] flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#009197] border-t-transparent mx-auto mb-4" />
          <p className="text-[#004645]/70">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#9CD9F6] via-white to-[#9CD9F6] flex items-center justify-center">
        <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-[#004645]" style={{ fontFamily: "var(--font-abril)" }}>
              Événement introuvable
            </CardTitle>
            <CardDescription className="text-[#004645]/70">
              Cet événement n&apos;existe pas ou a été supprimé
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin">
              <Button className="bg-gradient-to-r from-[#004645] to-[#009197] hover:from-[#006C51] hover:to-[#009197] text-white">
                Retour au dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const respondedGuests = event.guests.filter((g) => g.rsvp).length;
  const attendingGuests = event.guests.filter((g) => g.rsvp?.attending === true).length;
  const hasGuests = event.guests.length > 0;

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
        <svg className="absolute bottom-0 left-0 w-1/4 h-1/4" viewBox="0 0 200 200">
          <path
            d="M 200 150 Q 150 150, 150 100 T 100 50 T 50 0"
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
                <Link href="/admin" className="text-sm text-[#004645]/70 hover:text-[#FF4713] mb-1 block">
                  ← Retour au dashboard
                </Link>
                <h1 className="text-2xl font-bold text-[#004645]" style={{ fontFamily: "var(--font-abril)" }}>
                  {event.name}
                </h1>
                <div className="flex items-center gap-4 text-sm text-[#004645]/70">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-[#009197]" />
                    {new Date(event.startsAt).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                  {event.venueName && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-[#009197]" />
                      {event.venueName}, {event.city}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={handleExportCSV}
                className="border-[#004645] text-[#004645] hover:bg-[#004645] hover:text-white"
              >
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

      <div className="relative container mx-auto px-4 py-8">
        {/* Guide rapide - Étapes numérotées */}
        <Card className="mb-8 border-[#FF4713]/30 bg-gradient-to-br from-[#FF4713]/5 to-white/80 backdrop-blur">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Sparkles className="h-6 w-6 text-[#FF4713]" />
              <div>
                <CardTitle className="text-[#004645]" style={{ fontFamily: "var(--font-abril)" }}>
                  Guide rapide
                </CardTitle>
                <CardDescription className="text-[#004645]/70">
                  Suivez ces 3 étapes pour gérer votre événement
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              {/* Étape 1 */}
              <div className="relative">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 bg-gradient-to-br from-[#004645] to-[#009197] text-white w-10 h-10 rounded-full flex items-center justify-center font-bold" style={{ fontFamily: "var(--font-abril)" }}>
                    1
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-[#004645] mb-2">Ajoutez des invités</h3>
                    <p className="text-sm text-[#004645]/70 mb-3">
                      Créez votre liste d&apos;invités manuellement ou importez un fichier CSV
                    </p>
                    <div className="flex gap-2">
                      <AddGuestDialog eventId={eventId} onGuestAdded={fetchEvent} />
                      <ImportCSVDialog eventId={eventId} onImportComplete={fetchEvent} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Étape 2 */}
              <div className="relative">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 bg-gradient-to-br from-[#004645] to-[#009197] text-white w-10 h-10 rounded-full flex items-center justify-center font-bold" style={{ fontFamily: "var(--font-abril)" }}>
                    2
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-[#004645] mb-2">Envoyez les invitations</h3>
                    <p className="text-sm text-[#004645]/70 mb-3">
                      Envoyez des emails personnalisés à vos invités avec leur lien unique
                    </p>
                    <SendInvitationsDialog
                      eventId={eventId}
                      totalGuests={event.guests.length}
                      pendingGuests={event.guests.filter((g) => !g.rsvp || g.rsvp.attending === null).length}
                    />
                  </div>
                </div>
              </div>

              {/* Étape 3 */}
              <div className="relative">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 bg-gradient-to-br from-[#004645] to-[#009197] text-white w-10 h-10 rounded-full flex items-center justify-center font-bold" style={{ fontFamily: "var(--font-abril)" }}>
                    3
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-[#004645] mb-2">Suivez les réponses</h3>
                    <p className="text-sm text-[#004645]/70 mb-3">
                      Consultez les réponses en temps réel et exportez vos données
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExportCSV}
                      className="border-[#004645] text-[#004645] hover:bg-[#004645] hover:text-white"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Exporter CSV
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#004645]">Total invités</CardTitle>
              <Users className="h-4 w-4 text-[#009197]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#004645]" style={{ fontFamily: "var(--font-abril)" }}>
                {event.guests.length}
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#004645]">Réponses</CardTitle>
              <Mail className="h-4 w-4 text-[#009197]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#004645]" style={{ fontFamily: "var(--font-abril)" }}>
                {respondedGuests}
              </div>
              <p className="text-xs text-[#004645]/70">
                {event.guests.length > 0
                  ? Math.round((respondedGuests / event.guests.length) * 100)
                  : 0}
                % du total
              </p>
            </CardContent>
          </Card>

          <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#004645]">Participent</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600" style={{ fontFamily: "var(--font-abril)" }}>
                {attendingGuests}
              </div>
              <p className="text-xs text-[#004645]/70">
                {respondedGuests > 0
                  ? Math.round((attendingGuests / respondedGuests) * 100)
                  : 0}
                % des réponses
              </p>
            </CardContent>
          </Card>

          <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#004645]">En attente</CardTitle>
              <Clock className="h-4 w-4 text-[#FF4713]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#FF4713]" style={{ fontFamily: "var(--font-abril)" }}>
                {event.guests.length - respondedGuests}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Showcase Builder - Phase 2 */}
        <div className="mb-8">
          <ShowcaseBuilder
            eventId={eventId}
            eventSlug={event.slug}
            initialData={{
              showcaseEnabled: event.showcaseEnabled,
              showcaseTitle: event.showcaseTitle,
              showcaseSubtitle: event.showcaseSubtitle,
              showcaseBannerImage: event.showcaseBannerImage,
              showcaseTheme: event.showcaseTheme,
              showcaseSections: event.showcaseSections,
              showcasePrimaryColor: event.showcasePrimaryColor,
              showcaseSecondaryColor: event.showcaseSecondaryColor,
              showcaseCustomCSS: event.showcaseCustomCSS,
            }}
          />
        </div>

        {/* Guests Table */}
        <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-[#004645]" style={{ fontFamily: "var(--font-abril)" }}>
                  Liste des invités
                </CardTitle>
                <CardDescription className="text-[#004645]/70">
                  Gérez vos invités et suivez leurs réponses en temps réel
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Search */}
            {hasGuests && (
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#009197]" />
                  <Input
                    type="text"
                    placeholder="Rechercher un invité..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 border-[#9CD9F6]/50 focus:border-[#009197] text-[#004645]"
                  />
                </div>
              </div>
            )}

            {/* Table or Empty State */}
            {!hasGuests ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-[#009197] mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2 text-[#004645]" style={{ fontFamily: "var(--font-abril)" }}>
                  Aucun invité pour le moment
                </h3>
                <p className="text-[#004645]/70 mb-6">
                  Commencez par ajouter vos premiers invités manuellement ou via un import CSV
                </p>
                <div className="flex gap-3 justify-center">
                  <AddGuestDialog eventId={eventId} onGuestAdded={fetchEvent} />
                  <ImportCSVDialog eventId={eventId} onImportComplete={fetchEvent} />
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-[#9CD9F6]/30">
                    <tr className="text-left text-sm text-[#004645]/70">
                      <th className="pb-3 font-medium">Invité</th>
                      <th className="pb-3 font-medium">Email</th>
                      <th className="pb-3 font-medium">Entreprise</th>
                      <th className="pb-3 font-medium">Tags</th>
                      <th className="pb-3 font-medium">Statut</th>
                      <th className="pb-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#9CD9F6]/30">
                    {filteredGuests?.map((guest) => (
                      <tr key={guest.id} className="text-sm hover:bg-[#9CD9F6]/5 transition-colors">
                        <td className="py-3">
                          <div className="font-medium text-[#004645]">
                            {guest.firstName} {guest.lastName}
                          </div>
                        </td>
                        <td className="py-3 text-[#004645]/70">{guest.email}</td>
                        <td className="py-3 text-[#004645]/70">{guest.company || '-'}</td>
                        <td className="py-3">
                          <div className="flex gap-1 flex-wrap">
                            {guest.tags.map((tag) => (
                              <Badge
                                key={tag}
                                variant="secondary"
                                className="text-xs bg-[#9CD9F6]/20 text-[#004645] border-[#9CD9F6]/30"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </td>
                        <td className="py-3">
                          {guest.rsvp ? (
                            guest.rsvp.attending ? (
                              <Badge className="bg-green-100 text-green-800 border-green-200">
                                ✓ Participe
                              </Badge>
                            ) : guest.rsvp.attending === false ? (
                              <Badge className="bg-red-100 text-red-800 border-red-200">
                                ✗ Décline
                              </Badge>
                            ) : (
                              <Badge className="bg-gray-100 text-gray-800 border-gray-200">
                                Indécis
                              </Badge>
                            )
                          ) : (
                            <Badge className="bg-[#FF4713]/10 text-[#FF4713] border-[#FF4713]/30">
                              En attente
                            </Badge>
                          )}
                        </td>
                        <td className="py-3">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyInvitationLink(guest.token)}
                            className="text-[#009197] hover:text-[#004645] hover:bg-[#9CD9F6]/20"
                          >
                            <LinkIcon className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
