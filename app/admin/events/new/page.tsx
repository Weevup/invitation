"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Info } from "lucide-react";
import Link from "next/link";
import { WeevupLogo } from "@/components/weevup-logo";
import { createClientLogger } from '@/lib/client-logger'
import { EventTemplateQuickSelector } from '@/components/event-template-selector'
import { type EventTemplateConfig } from '@/lib/event-templates'
import { Alert, AlertDescription } from '@/components/ui/alert'

const logger = createClientLogger({ component: 'NewPage' })


export default function NewEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<EventTemplateConfig | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    date: "",
    location: "",
    capacity: "",
    // RSVP Configuration
    allowPlusOnes: false,
    maxPlusOnes: 0,
    requireMeal: false,
    mealOptions: [] as string[],
    enableTransport: false,
    enableLodging: false,
    enableAccessibility: true,
    enablePhotoConsent: true,
  });

  const handleSelectTemplate = (template: EventTemplateConfig) => {
    setSelectedTemplate(template);
    // Apply template configuration to form
    setFormData(prev => ({
      ...prev,
      allowPlusOnes: template.rsvpConfig.allowPlusOnes,
      maxPlusOnes: template.rsvpConfig.maxPlusOnes,
      requireMeal: template.rsvpConfig.requireMeal,
      mealOptions: template.rsvpConfig.mealOptions,
      enableTransport: template.rsvpConfig.enableTransport,
      enableLodging: template.rsvpConfig.enableLodging,
      enableAccessibility: template.rsvpConfig.enableAccessibility,
      enablePhotoConsent: template.rsvpConfig.enablePhotoConsent,
    }));
    logger.info('Template selected', { templateId: template.id, templateName: template.name });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Sending data:', formData);
      const response = await fetch('/api/admin/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log('Response:', data);

      if (response.ok) {
        router.push(`/admin/events/${data.id}`);
      } else {
        setError(data.error || "Erreur lors de la création de l'événement");
        if (data.details) {
          logger.error(data.details, { action: 'createEvent', metadata: { details: true } });
        }
      }
    } catch (error) {
      logger.error(error, { action: 'creatingEvent' });
      setError("Erreur de connexion: " + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#9CD9F6] via-white to-[#9CD9F6]">
      {/* Lignes graphiques orange décoratives */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
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
                <span className="text-xl font-bold text-[#004645]" style={{ fontFamily: "var(--font-abril)" }}>
                  WEEVUP
                </span>
                <p className="text-xs text-[#004645]/70">Nouvel événement</p>
              </div>
            </div>
            <Link href="/admin">
              <Button variant="ghost" className="text-[#004645] hover:text-[#FF4713]">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="relative container mx-auto px-4 py-8 max-w-2xl">
        <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-2xl text-[#004645]" style={{ fontFamily: "var(--font-abril)" }}>
              Créer un nouvel événement
            </CardTitle>
            <CardDescription className="text-[#004645]/70">
              Renseignez les informations de votre événement
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Event Template Selector */}
            <div className="mb-6 space-y-3">
              <div className="flex items-center gap-2">
                <label className="block text-sm font-medium text-[#004645]">
                  Type d&apos;événement
                </label>
                <Info className="h-4 w-4 text-[#004645]/50" />
              </div>
              <EventTemplateQuickSelector
                onSelectTemplate={handleSelectTemplate}
                selectedTemplateId={selectedTemplate?.id}
              />
              {selectedTemplate && (
                <Alert className="bg-[#9CD9F6]/10 border-[#009197]">
                  <AlertDescription className="text-sm text-[#004645]">
                    ✨ <strong>{selectedTemplate.name}</strong> sélectionné - Configuration RSVP pré-remplie automatiquement
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2 text-[#004645]">
                  Nom de l&apos;événement *
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-[#9CD9F6]/50 rounded-md focus:outline-none focus:ring-2 focus:ring-[#009197] text-[#004645]"
                  placeholder="10 ans de Weevup"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-2 text-[#004645]">
                  Description
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-[#9CD9F6]/50 rounded-md focus:outline-none focus:ring-2 focus:ring-[#009197] text-[#004645]"
                  rows={4}
                  placeholder="Célébration des 10 ans de l'agence au Molitor Paris"
                />
              </div>

              <div>
                <label htmlFor="date" className="block text-sm font-medium mb-2 text-[#004645]">
                  Date de l&apos;événement *
                </label>
                <input
                  id="date"
                  type="datetime-local"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border border-[#9CD9F6]/50 rounded-md focus:outline-none focus:ring-2 focus:ring-[#009197] text-[#004645]"
                />
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium mb-2 text-[#004645]">
                  Lieu *
                </label>
                <input
                  id="location"
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 border border-[#9CD9F6]/50 rounded-md focus:outline-none focus:ring-2 focus:ring-[#009197] text-[#004645]"
                  placeholder="Molitor Paris, 13 Rue Nungesser et Coli, 75016 Paris"
                />
              </div>

              <div>
                <label htmlFor="capacity" className="block text-sm font-medium mb-2 text-[#004645]">
                  Capacité maximale
                </label>
                <input
                  id="capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  className="w-full px-3 py-2 border border-[#9CD9F6]/50 rounded-md focus:outline-none focus:ring-2 focus:ring-[#009197] text-[#004645]"
                  placeholder="200"
                />
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-800">
                  <p className="font-medium">Erreur</p>
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-[#004645] to-[#009197] hover:from-[#006C51] hover:to-[#009197] text-white"
                >
                  {loading ? "Création..." : "Créer l'événement"}
                </Button>
                <Link href="/admin" className="flex-1">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-[#004645] text-[#004645] hover:bg-[#004645] hover:text-white"
                  >
                    Annuler
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
