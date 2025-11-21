"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, Loader2, Trash2 } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";
import { createClientLogger } from '@/lib/client-logger';

const logger = createClientLogger({ component: 'EditEventPage' });

interface EventData {
  id: string;
  name: string;
  slug: string;
  description?: string;
  program?: string;
  dressCode?: string;
  startsAt: string;
  endsAt?: string;
  venueName?: string;
  address?: string;
  city?: string;
  country?: string;
  capacity?: number;
  rsvpDeadline?: string;
  coverImage?: string;
  hashtag?: string;
}

export default function EditEventPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const eventId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState<EventData>({
    id: "",
    name: "",
    slug: "",
    description: "",
    program: "",
    dressCode: "",
    startsAt: "",
    endsAt: "",
    venueName: "",
    address: "",
    city: "",
    country: "",
    capacity: undefined,
    rsvpDeadline: "",
    coverImage: "",
    hashtag: "",
  });

  useEffect(() => {
    fetchEvent();
  }, [eventId]);

  const fetchEvent = async () => {
    try {
      const response = await fetch(`/api/admin/events/${eventId}`);
      if (response.ok) {
        const data = await response.json();

        // Format dates for input fields
        const formatDateForInput = (date: string | null | undefined) => {
          if (!date) return "";
          const d = new Date(date);
          return d.toISOString().slice(0, 16); // Format: "2025-12-15T20:00"
        };

        setFormData({
          id: data.id,
          name: data.name || "",
          slug: data.slug || "",
          description: data.description || "",
          program: data.program || "",
          dressCode: data.dressCode || "",
          startsAt: formatDateForInput(data.startsAt),
          endsAt: formatDateForInput(data.endsAt),
          venueName: data.venueName || "",
          address: data.address || "",
          city: data.city || "",
          country: data.country || "",
          capacity: data.capacity || undefined,
          rsvpDeadline: formatDateForInput(data.rsvpDeadline),
          coverImage: data.coverImage || "",
          hashtag: data.hashtag || "",
        });
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de charger l'événement",
          variant: "destructive",
        });
      }
    } catch (error) {
      logger.error('Error fetching event', { error });
      toast({
        title: "Erreur",
        description: "Erreur lors du chargement de l'événement",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Prepare data for API
      const updateData = {
        name: formData.name,
        description: formData.description || null,
        program: formData.program || null,
        dressCode: formData.dressCode || null,
        startsAt: formData.startsAt ? new Date(formData.startsAt).toISOString() : null,
        endsAt: formData.endsAt ? new Date(formData.endsAt).toISOString() : null,
        venueName: formData.venueName || null,
        address: formData.address || null,
        city: formData.city || null,
        country: formData.country || null,
        capacity: formData.capacity ? parseInt(formData.capacity.toString()) : null,
        rsvpDeadline: formData.rsvpDeadline ? new Date(formData.rsvpDeadline).toISOString() : null,
        coverImage: formData.coverImage || null,
        hashtag: formData.hashtag || null,
      };

      const response = await fetch(`/api/admin/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        toast({
          title: "✓ Événement mis à jour",
          description: "Les modifications ont été enregistrées avec succès",
        });
        router.push(`/admin/events/${eventId}`);
      } else {
        const error = await response.json();
        toast({
          title: "Erreur",
          description: error.error || "Impossible de mettre à jour l'événement",
          variant: "destructive",
        });
      }
    } catch (error) {
      logger.error('Error updating event', { error });
      toast({
        title: "Erreur",
        description: "Erreur lors de la mise à jour de l'événement",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet événement ? Cette action est irréversible.")) {
      return;
    }

    setDeleting(true);

    try {
      const response = await fetch(`/api/admin/events/${eventId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: "✓ Événement supprimé",
          description: "L'événement a été supprimé avec succès",
        });
        router.push('/admin/events');
      } else {
        const error = await response.json();
        toast({
          title: "Erreur",
          description: error.error || "Impossible de supprimer l'événement",
          variant: "destructive",
        });
      }
    } catch (error) {
      logger.error('Error deleting event', { error });
      toast({
        title: "Erreur",
        description: "Erreur lors de la suppression de l'événement",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#009197]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#004645]" style={{ fontFamily: "var(--font-abril)" }}>
            Modifier l&apos;événement
          </h1>
          <p className="text-[#004645]/70 mt-1">
            Modifiez les détails de votre événement
          </p>
        </div>
        <Link href={`/admin/events/${eventId}`}>
          <Button variant="outline" className="border-[#004645] text-[#004645]">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations principales */}
        <Card className="border-[#9CD9F6]/30">
          <CardHeader>
            <CardTitle className="text-[#004645]">Informations principales</CardTitle>
            <CardDescription>Nom, description et détails de l&apos;événement</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="name">Nom de l&apos;événement *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Les 10 ans de Weevup"
                  className="border-[#9CD9F6]/50 focus:border-[#009197]"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Célébration des 10 ans de l'agence au Molitor pour une pool party."
                  rows={3}
                  className="border-[#9CD9F6]/50 focus:border-[#009197]"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="program">Programme</Label>
                <Textarea
                  id="program"
                  value={formData.program}
                  onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                  placeholder="Déroulement de la journée..."
                  rows={4}
                  className="border-[#9CD9F6]/50 focus:border-[#009197]"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Date et horaires */}
        <Card className="border-[#9CD9F6]/30">
          <CardHeader>
            <CardTitle className="text-[#004645]">Date et horaires</CardTitle>
            <CardDescription>Quand votre événement aura-t-il lieu ?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startsAt">Date et heure de début *</Label>
                <Input
                  id="startsAt"
                  type="datetime-local"
                  value={formData.startsAt}
                  onChange={(e) => setFormData({ ...formData, startsAt: e.target.value })}
                  required
                  className="border-[#9CD9F6]/50 focus:border-[#009197]"
                />
              </div>

              <div>
                <Label htmlFor="endsAt">Date et heure de fin</Label>
                <Input
                  id="endsAt"
                  type="datetime-local"
                  value={formData.endsAt}
                  onChange={(e) => setFormData({ ...formData, endsAt: e.target.value })}
                  className="border-[#9CD9F6]/50 focus:border-[#009197]"
                />
              </div>

              <div>
                <Label htmlFor="rsvpDeadline">Date limite de réponse</Label>
                <Input
                  id="rsvpDeadline"
                  type="datetime-local"
                  value={formData.rsvpDeadline}
                  onChange={(e) => setFormData({ ...formData, rsvpDeadline: e.target.value })}
                  className="border-[#9CD9F6]/50 focus:border-[#009197]"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lieu */}
        <Card className="border-[#9CD9F6]/30">
          <CardHeader>
            <CardTitle className="text-[#004645]">Lieu</CardTitle>
            <CardDescription>Où votre événement aura-t-il lieu ?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="venueName">Nom du lieu</Label>
                <Input
                  id="venueName"
                  value={formData.venueName}
                  onChange={(e) => setFormData({ ...formData, venueName: e.target.value })}
                  placeholder="Molitor Paris"
                  className="border-[#9CD9F6]/50 focus:border-[#009197]"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="address">Adresse</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="13 Rue Nungesser et Coli"
                  className="border-[#9CD9F6]/50 focus:border-[#009197]"
                />
              </div>

              <div>
                <Label htmlFor="city">Ville</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Paris"
                  className="border-[#9CD9F6]/50 focus:border-[#009197]"
                />
              </div>

              <div>
                <Label htmlFor="country">Pays</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  placeholder="France"
                  className="border-[#9CD9F6]/50 focus:border-[#009197]"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Détails supplémentaires */}
        <Card className="border-[#9CD9F6]/30">
          <CardHeader>
            <CardTitle className="text-[#004645]">Détails supplémentaires</CardTitle>
            <CardDescription>Informations complémentaires sur l&apos;événement</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="capacity">Capacité maximale</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={formData.capacity || ""}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value ? parseInt(e.target.value) : undefined })}
                  placeholder="200"
                  className="border-[#9CD9F6]/50 focus:border-[#009197]"
                />
              </div>

              <div>
                <Label htmlFor="dressCode">Dress code</Label>
                <Input
                  id="dressCode"
                  value={formData.dressCode}
                  onChange={(e) => setFormData({ ...formData, dressCode: e.target.value })}
                  placeholder="Cocktail, Tenue de soirée..."
                  className="border-[#9CD9F6]/50 focus:border-[#009197]"
                />
              </div>

              <div>
                <Label htmlFor="hashtag">Hashtag</Label>
                <Input
                  id="hashtag"
                  value={formData.hashtag}
                  onChange={(e) => setFormData({ ...formData, hashtag: e.target.value })}
                  placeholder="#Weevup10ans"
                  className="border-[#9CD9F6]/50 focus:border-[#009197]"
                />
              </div>

              <div>
                <Label htmlFor="coverImage">URL de l&apos;image de couverture</Label>
                <Input
                  id="coverImage"
                  value={formData.coverImage}
                  onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                  placeholder="https://..."
                  className="border-[#9CD9F6]/50 focus:border-[#009197]"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-between gap-4">
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting || saving}
          >
            {deleting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Suppression...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer l&apos;événement
              </>
            )}
          </Button>

          <div className="flex gap-4">
            <Link href={`/admin/events/${eventId}`}>
              <Button
                type="button"
                variant="outline"
                className="border-[#004645] text-[#004645]"
              >
                Annuler
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={saving}
              className="bg-gradient-to-r from-[#004645] to-[#009197] hover:from-[#006C51] hover:to-[#009197] text-white"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Enregistrer les modifications
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
