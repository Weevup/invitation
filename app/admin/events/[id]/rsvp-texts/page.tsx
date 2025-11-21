"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, Loader2, RotateCcw, Sparkles } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";
import { createClientLogger } from '@/lib/client-logger';
import { Alert, AlertDescription } from '@/components/ui/alert';

const logger = createClientLogger({ component: 'RSVPTextsPage' });

interface RSVPTexts {
  // Accueil
  welcomeGreeting?: string;
  welcomeSubtitle?: string;

  // Formulaire RSVP
  formTitle?: string;
  formSubtitle?: string;

  // Étape de réponse
  responseQuestion?: string;
  responseYes?: string;
  responseNo?: string;
  continueButton?: string;

  // Boutons de navigation
  previousButton?: string;
  submitButton?: string;

  // Message de succès
  successTitle?: string;
  successMessage?: string;
}

const DEFAULT_TEXTS: RSVPTexts = {
  // Accueil
  welcomeGreeting: "Bonjour {guest.firstName} 👋",
  welcomeSubtitle: "Vous êtes invité(e) à",

  // Formulaire RSVP
  formTitle: "Votre réponse",
  formSubtitle: "Merci de confirmer votre participation avant le",

  // Étape de réponse
  responseQuestion: "Participez-vous à l'événement ?",
  responseYes: "✓ J'accepte avec plaisir",
  responseNo: "✗ Je ne peux malheureusement pas venir",
  continueButton: "Continuer",

  // Boutons de navigation
  previousButton: "Précédent",
  submitButton: "Envoyer ma réponse",

  // Message de succès
  successTitle: "Merci pour votre réponse !",
  successMessage: "Votre participation a été enregistrée avec succès.",
};

export default function RSVPTextsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const eventId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [texts, setTexts] = useState<RSVPTexts>(DEFAULT_TEXTS);

  useEffect(() => {
    fetchRSVPTexts();
  }, [eventId]);

  const fetchRSVPTexts = async () => {
    try {
      const response = await fetch(`/api/admin/events/${eventId}`);
      if (response.ok) {
        const data = await response.json();

        // Load custom texts from rsvpConfig
        if (data.rsvpConfig?.customTexts) {
          setTexts({
            ...DEFAULT_TEXTS,
            ...data.rsvpConfig.customTexts,
          });
        }
      }
    } catch (error) {
      logger.error(error, { action: 'fetchRSVPTexts' });
      toast({
        title: "Erreur",
        description: "Impossible de charger les textes RSVP",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      // Get current rsvpConfig
      const eventResponse = await fetch(`/api/admin/events/${eventId}`);
      if (!eventResponse.ok) throw new Error('Failed to fetch event');

      const eventData = await eventResponse.json();
      const currentRsvpConfig = eventData.rsvpConfig || {};

      // Update with new custom texts
      const updatedRsvpConfig = {
        ...currentRsvpConfig,
        customTexts: texts,
      };

      const response = await fetch(`/api/admin/events/${eventId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rsvpConfig: updatedRsvpConfig,
        }),
      });

      if (response.ok) {
        toast({
          title: "✓ Textes enregistrés",
          description: "Les modifications ont été enregistrées avec succès",
        });
      } else {
        const error = await response.json();
        toast({
          title: "Erreur",
          description: error.error || "Impossible de sauvegarder les textes",
          variant: "destructive",
        });
      }
    } catch (error) {
      logger.error(error, { action: 'saveRSVPTexts' });
      toast({
        title: "Erreur",
        description: "Erreur lors de la sauvegarde des textes",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm("Êtes-vous sûr de vouloir restaurer les textes par défaut ?")) {
      setTexts(DEFAULT_TEXTS);
      toast({
        title: "Textes restaurés",
        description: "Les textes par défaut ont été restaurés. N'oubliez pas de sauvegarder.",
      });
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
            Personnaliser les textes RSVP
          </h1>
          <p className="text-[#004645]/70 mt-1">
            Modifiez tous les textes affichés dans le formulaire de réponse
          </p>
        </div>
        <Link href={`/admin/events/${eventId}`}>
          <Button variant="outline" className="border-[#004645] text-[#004645]">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </Link>
      </div>

      <Alert className="bg-[#9CD9F6]/10 border-[#009197]">
        <Sparkles className="h-4 w-4" />
        <AlertDescription>
          <strong>Variables disponibles :</strong> Utilisez <code className="bg-[#004645]/10 px-1 rounded">{`{guest.firstName}`}</code>, <code className="bg-[#004645]/10 px-1 rounded">{`{event.name}`}</code>, <code className="bg-[#004645]/10 px-1 rounded">{`{event.date}`}</code>, etc. pour personnaliser vos textes.
        </AlertDescription>
      </Alert>

      <div className="space-y-6">
        {/* Section Accueil */}
        <Card className="border-[#9CD9F6]/30">
          <CardHeader>
            <CardTitle className="text-[#004645]">Section d&apos;accueil</CardTitle>
            <CardDescription>Textes affichés en haut du formulaire RSVP</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="welcomeGreeting">Message d&apos;accueil</Label>
              <Input
                id="welcomeGreeting"
                value={texts.welcomeGreeting || ""}
                onChange={(e) => setTexts({ ...texts, welcomeGreeting: e.target.value })}
                placeholder="Bonjour {guest.firstName} 👋"
                className="border-[#9CD9F6]/50 focus:border-[#009197]"
              />
              <p className="text-xs text-[#004645]/60 mt-1">
                Affiché en titre principal de la page
              </p>
            </div>

            <div>
              <Label htmlFor="welcomeSubtitle">Sous-titre d&apos;accueil</Label>
              <Input
                id="welcomeSubtitle"
                value={texts.welcomeSubtitle || ""}
                onChange={(e) => setTexts({ ...texts, welcomeSubtitle: e.target.value })}
                placeholder="Vous êtes invité(e) à"
                className="border-[#9CD9F6]/50 focus:border-[#009197]"
              />
              <p className="text-xs text-[#004645]/60 mt-1">
                Affiché juste sous le message d&apos;accueil
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Section Formulaire RSVP */}
        <Card className="border-[#9CD9F6]/30">
          <CardHeader>
            <CardTitle className="text-[#004645]">En-tête du formulaire RSVP</CardTitle>
            <CardDescription>Titre et sous-titre de la section de réponse</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="formTitle">Titre du formulaire</Label>
              <Input
                id="formTitle"
                value={texts.formTitle || ""}
                onChange={(e) => setTexts({ ...texts, formTitle: e.target.value })}
                placeholder="Votre réponse"
                className="border-[#9CD9F6]/50 focus:border-[#009197]"
              />
              <p className="text-xs text-[#004645]/60 mt-1">
                Titre principal de la card RSVP
              </p>
            </div>

            <div>
              <Label htmlFor="formSubtitle">Sous-titre du formulaire</Label>
              <Input
                id="formSubtitle"
                value={texts.formSubtitle || ""}
                onChange={(e) => setTexts({ ...texts, formSubtitle: e.target.value })}
                placeholder="Merci de confirmer votre participation avant le"
                className="border-[#9CD9F6]/50 focus:border-[#009197]"
              />
              <p className="text-xs text-[#004645]/60 mt-1">
                Description sous le titre (la date limite sera ajoutée automatiquement)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Section Réponse */}
        <Card className="border-[#9CD9F6]/30">
          <CardHeader>
            <CardTitle className="text-[#004645]">Question de participation</CardTitle>
            <CardDescription>Textes de la première étape du formulaire</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="responseQuestion">Question principale</Label>
              <Input
                id="responseQuestion"
                value={texts.responseQuestion || ""}
                onChange={(e) => setTexts({ ...texts, responseQuestion: e.target.value })}
                placeholder="Participez-vous à l'événement ?"
                className="border-[#9CD9F6]/50 focus:border-[#009197]"
              />
            </div>

            <div>
              <Label htmlFor="responseYes">Réponse positive</Label>
              <Input
                id="responseYes"
                value={texts.responseYes || ""}
                onChange={(e) => setTexts({ ...texts, responseYes: e.target.value })}
                placeholder="✓ J'accepte avec plaisir"
                className="border-[#9CD9F6]/50 focus:border-[#009197]"
              />
            </div>

            <div>
              <Label htmlFor="responseNo">Réponse négative</Label>
              <Input
                id="responseNo"
                value={texts.responseNo || ""}
                onChange={(e) => setTexts({ ...texts, responseNo: e.target.value })}
                placeholder="✗ Je ne peux malheureusement pas venir"
                className="border-[#9CD9F6]/50 focus:border-[#009197]"
              />
            </div>

            <div>
              <Label htmlFor="continueButton">Bouton Continuer</Label>
              <Input
                id="continueButton"
                value={texts.continueButton || ""}
                onChange={(e) => setTexts({ ...texts, continueButton: e.target.value })}
                placeholder="Continuer"
                className="border-[#9CD9F6]/50 focus:border-[#009197]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Section Navigation */}
        <Card className="border-[#9CD9F6]/30">
          <CardHeader>
            <CardTitle className="text-[#004645]">Boutons de navigation</CardTitle>
            <CardDescription>Textes des boutons dans le formulaire</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="previousButton">Bouton Précédent</Label>
              <Input
                id="previousButton"
                value={texts.previousButton || ""}
                onChange={(e) => setTexts({ ...texts, previousButton: e.target.value })}
                placeholder="Précédent"
                className="border-[#9CD9F6]/50 focus:border-[#009197]"
              />
            </div>

            <div>
              <Label htmlFor="submitButton">Bouton Envoyer</Label>
              <Input
                id="submitButton"
                value={texts.submitButton || ""}
                onChange={(e) => setTexts({ ...texts, submitButton: e.target.value })}
                placeholder="Envoyer ma réponse"
                className="border-[#9CD9F6]/50 focus:border-[#009197]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Section Succès */}
        <Card className="border-[#9CD9F6]/30">
          <CardHeader>
            <CardTitle className="text-[#004645]">Message de confirmation</CardTitle>
            <CardDescription>Textes affichés après validation du formulaire</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="successTitle">Titre de succès</Label>
              <Input
                id="successTitle"
                value={texts.successTitle || ""}
                onChange={(e) => setTexts({ ...texts, successTitle: e.target.value })}
                placeholder="Merci pour votre réponse !"
                className="border-[#9CD9F6]/50 focus:border-[#009197]"
              />
            </div>

            <div>
              <Label htmlFor="successMessage">Message de succès</Label>
              <Textarea
                id="successMessage"
                value={texts.successMessage || ""}
                onChange={(e) => setTexts({ ...texts, successMessage: e.target.value })}
                placeholder="Votre participation a été enregistrée avec succès."
                rows={3}
                className="border-[#9CD9F6]/50 focus:border-[#009197]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-between gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={saving}
            className="border-[#FF4713] text-[#FF4713] hover:bg-[#FF4713] hover:text-white"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Restaurer les textes par défaut
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
              onClick={handleSave}
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
                  Enregistrer les textes
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
