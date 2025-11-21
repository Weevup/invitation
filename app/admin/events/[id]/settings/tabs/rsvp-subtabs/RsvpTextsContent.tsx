"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, Loader2, RotateCcw, Sparkles } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { createClientLogger } from '@/lib/client-logger';
import { Alert, AlertDescription } from '@/components/ui/alert';

const logger = createClientLogger({ component: 'RsvpTextsContent' });

interface RSVPTexts {
  // Accueil
  welcomeGreeting?: string;
  welcomeSubtitle?: string;

  // Formulaire RSVP
  formTitle?: string;
  formSubtitle?: string;
  formBadge?: string;
  formFeatures?: string;

  // Étape de réponse
  responseQuestion?: string;
  responseYes?: string;
  responseNo?: string;
  continueButton?: string;

  // Étape accompagnants
  plusOnesLabel?: string;
  plusOnesNone?: string;

  // Étape repas
  mealLabel?: string;
  mealPlaceholder?: string;
  allergiesLabel?: string;
  allergiesPlaceholder?: string;

  // Étape informations pratiques
  practicalTitle?: string;
  accessibilityLabel?: string;
  accessibilityPlaceholder?: string;
  transportLabel?: string;
  transportPlaceholder?: string;
  lodgingLabel?: string;
  lodgingPlaceholder?: string;

  // Étape consentements
  consentTitle?: string;
  consentLabel?: string;

  // Étape récapitulatif
  summaryTitle?: string;
  summaryIntro?: string;
  summaryParticipation?: string;
  summaryYes?: string;
  summaryNo?: string;
  summaryPlusOnes?: string;
  summaryMeal?: string;
  summaryAllergies?: string;
  summaryModifyUntil?: string;

  // Affichage de la date d'événement
  eventDateLabel?: string; // Pour personnaliser l'affichage de la date
  eventLocationLabel?: string; // Pour personnaliser l'affichage du lieu

  // Indicateurs visuels
  autosaveIndicator?: string;
  loadingMessage?: string;
  savingMessage?: string;

  // Boutons de navigation
  previousButton?: string;
  submitButton?: string;
  backButton?: string;

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
  formBadge: "✨ Optimisé",
  formFeatures: "💾 Sauvegarde automatique • ⚡ Performance améliorée",

  // Étape de réponse
  responseQuestion: "Participez-vous à l'événement ?",
  responseYes: "✓ J'accepte avec plaisir",
  responseNo: "✗ Je ne peux malheureusement pas venir",
  continueButton: "Continuer",

  // Étape accompagnants
  plusOnesLabel: "Nombre d'accompagnants (max {maxPlusOnes})",
  plusOnesNone: "Aucun",

  // Étape repas
  mealLabel: "Choix de repas",
  mealPlaceholder: "Sélectionnez votre choix",
  allergiesLabel: "Allergies ou régimes spécifiques",
  allergiesPlaceholder: "Précisez vos éventuelles allergies...",

  // Étape informations pratiques
  practicalTitle: "Informations pratiques",
  accessibilityLabel: "Besoins d'accessibilité",
  accessibilityPlaceholder: "PMR, assistance particulière...",
  transportLabel: "Besoins de transport",
  transportPlaceholder: "Navette, parking...",
  lodgingLabel: "Besoins d'hébergement",
  lodgingPlaceholder: "Hôtel, nuitée...",

  // Étape consentements
  consentTitle: "Consentements",
  consentLabel: "J'autorise la prise et l'utilisation de photographies durant l'événement à des fins de communication",

  // Étape récapitulatif
  summaryTitle: "Récapitulatif",
  summaryIntro: "",
  summaryParticipation: "Participation :",
  summaryYes: "Oui ✓",
  summaryNo: "Non",
  summaryPlusOnes: "Accompagnants :",
  summaryMeal: "Repas :",
  summaryAllergies: "Allergies :",
  summaryModifyUntil: "Vous pourrez modifier votre réponse jusqu'au",

  // Affichage de la date d'événement
  eventDateLabel: "", // Vide = utilise le format par défaut
  eventLocationLabel: "", // Vide = utilise le format par défaut

  // Indicateurs visuels
  autosaveIndicator: "Enregistré automatiquement",
  loadingMessage: "Chargement...",
  savingMessage: "Enregistrement...",

  // Boutons de navigation
  previousButton: "Précédent",
  submitButton: "Envoyer ma réponse",
  backButton: "Retour",

  // Message de succès
  successTitle: "Merci pour votre réponse !",
  successMessage: "Votre participation a été enregistrée avec succès.",
};

interface RsvpTextsContentProps {
  eventId: string
}

export function RsvpTextsContent({ eventId }: RsvpTextsContentProps) {
  const { toast } = useToast();

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

        {/* Section Accompagnants */}
        <Card className="border-[#9CD9F6]/30">
          <CardHeader>
            <CardTitle className="text-[#004645]">Étape accompagnants</CardTitle>
            <CardDescription>Textes pour le choix du nombre d&apos;accompagnants</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="plusOnesLabel">Label du champ</Label>
              <Input
                id="plusOnesLabel"
                value={texts.plusOnesLabel || ""}
                onChange={(e) => setTexts({ ...texts, plusOnesLabel: e.target.value })}
                placeholder="Nombre d'accompagnants (max {maxPlusOnes})"
                className="border-[#9CD9F6]/50 focus:border-[#009197]"
              />
              <p className="text-xs text-[#004645]/60 mt-1">
                Utilisez {`{maxPlusOnes}`} pour afficher le maximum
              </p>
            </div>

            <div>
              <Label htmlFor="plusOnesNone">Option &quot;Aucun&quot;</Label>
              <Input
                id="plusOnesNone"
                value={texts.plusOnesNone || ""}
                onChange={(e) => setTexts({ ...texts, plusOnesNone: e.target.value })}
                placeholder="Aucun"
                className="border-[#9CD9F6]/50 focus:border-[#009197]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Section Repas */}
        <Card className="border-[#9CD9F6]/30">
          <CardHeader>
            <CardTitle className="text-[#004645]">Étape choix de repas</CardTitle>
            <CardDescription>Textes pour le choix de repas et allergies</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="mealLabel">Label du champ repas</Label>
              <Input
                id="mealLabel"
                value={texts.mealLabel || ""}
                onChange={(e) => setTexts({ ...texts, mealLabel: e.target.value })}
                placeholder="Choix de repas"
                className="border-[#9CD9F6]/50 focus:border-[#009197]"
              />
            </div>

            <div>
              <Label htmlFor="mealPlaceholder">Placeholder du sélecteur</Label>
              <Input
                id="mealPlaceholder"
                value={texts.mealPlaceholder || ""}
                onChange={(e) => setTexts({ ...texts, mealPlaceholder: e.target.value })}
                placeholder="Sélectionnez votre choix"
                className="border-[#9CD9F6]/50 focus:border-[#009197]"
              />
            </div>

            <div>
              <Label htmlFor="allergiesLabel">Label des allergies</Label>
              <Input
                id="allergiesLabel"
                value={texts.allergiesLabel || ""}
                onChange={(e) => setTexts({ ...texts, allergiesLabel: e.target.value })}
                placeholder="Allergies ou régimes spécifiques"
                className="border-[#9CD9F6]/50 focus:border-[#009197]"
              />
            </div>

            <div>
              <Label htmlFor="allergiesPlaceholder">Placeholder des allergies</Label>
              <Input
                id="allergiesPlaceholder"
                value={texts.allergiesPlaceholder || ""}
                onChange={(e) => setTexts({ ...texts, allergiesPlaceholder: e.target.value })}
                placeholder="Précisez vos éventuelles allergies..."
                className="border-[#9CD9F6]/50 focus:border-[#009197]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Section Informations pratiques */}
        <Card className="border-[#9CD9F6]/30">
          <CardHeader>
            <CardTitle className="text-[#004645]">Étape informations pratiques</CardTitle>
            <CardDescription>Textes pour transport, hébergement, accessibilité</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="practicalTitle">Titre de la section</Label>
              <Input
                id="practicalTitle"
                value={texts.practicalTitle || ""}
                onChange={(e) => setTexts({ ...texts, practicalTitle: e.target.value })}
                placeholder="Informations pratiques"
                className="border-[#9CD9F6]/50 focus:border-[#009197]"
              />
            </div>

            <div>
              <Label htmlFor="accessibilityLabel">Label accessibilité</Label>
              <Input
                id="accessibilityLabel"
                value={texts.accessibilityLabel || ""}
                onChange={(e) => setTexts({ ...texts, accessibilityLabel: e.target.value })}
                placeholder="Besoins d'accessibilité"
                className="border-[#9CD9F6]/50 focus:border-[#009197]"
              />
            </div>

            <div>
              <Label htmlFor="accessibilityPlaceholder">Placeholder accessibilité</Label>
              <Input
                id="accessibilityPlaceholder"
                value={texts.accessibilityPlaceholder || ""}
                onChange={(e) => setTexts({ ...texts, accessibilityPlaceholder: e.target.value })}
                placeholder="PMR, assistance particulière..."
                className="border-[#9CD9F6]/50 focus:border-[#009197]"
              />
            </div>

            <div>
              <Label htmlFor="transportLabel">Label transport</Label>
              <Input
                id="transportLabel"
                value={texts.transportLabel || ""}
                onChange={(e) => setTexts({ ...texts, transportLabel: e.target.value })}
                placeholder="Besoins de transport"
                className="border-[#9CD9F6]/50 focus:border-[#009197]"
              />
            </div>

            <div>
              <Label htmlFor="transportPlaceholder">Placeholder transport</Label>
              <Input
                id="transportPlaceholder"
                value={texts.transportPlaceholder || ""}
                onChange={(e) => setTexts({ ...texts, transportPlaceholder: e.target.value })}
                placeholder="Navette, parking..."
                className="border-[#9CD9F6]/50 focus:border-[#009197]"
              />
            </div>

            <div>
              <Label htmlFor="lodgingLabel">Label hébergement</Label>
              <Input
                id="lodgingLabel"
                value={texts.lodgingLabel || ""}
                onChange={(e) => setTexts({ ...texts, lodgingLabel: e.target.value })}
                placeholder="Besoins d'hébergement"
                className="border-[#9CD9F6]/50 focus:border-[#009197]"
              />
            </div>

            <div>
              <Label htmlFor="lodgingPlaceholder">Placeholder hébergement</Label>
              <Input
                id="lodgingPlaceholder"
                value={texts.lodgingPlaceholder || ""}
                onChange={(e) => setTexts({ ...texts, lodgingPlaceholder: e.target.value })}
                placeholder="Hôtel, nuitée..."
                className="border-[#9CD9F6]/50 focus:border-[#009197]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Section Consentements */}
        <Card className="border-[#9CD9F6]/30">
          <CardHeader>
            <CardTitle className="text-[#004645]">Étape consentements</CardTitle>
            <CardDescription>Textes pour les autorisations photos/vidéos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="consentTitle">Titre de la section</Label>
              <Input
                id="consentTitle"
                value={texts.consentTitle || ""}
                onChange={(e) => setTexts({ ...texts, consentTitle: e.target.value })}
                placeholder="Consentements"
                className="border-[#9CD9F6]/50 focus:border-[#009197]"
              />
            </div>

            <div>
              <Label htmlFor="consentLabel">Label du consentement photos</Label>
              <Textarea
                id="consentLabel"
                value={texts.consentLabel || ""}
                onChange={(e) => setTexts({ ...texts, consentLabel: e.target.value })}
                placeholder="J'autorise la prise et l'utilisation de photographies durant l'événement à des fins de communication"
                className="border-[#9CD9F6]/50 focus:border-[#009197]"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Section Récapitulatif */}
        <Card className="border-[#9CD9F6]/30">
          <CardHeader>
            <CardTitle className="text-[#004645]">Étape récapitulatif</CardTitle>
            <CardDescription>Textes pour la page de synthèse avant validation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="summaryTitle">Titre du récapitulatif</Label>
              <Input
                id="summaryTitle"
                value={texts.summaryTitle || ""}
                onChange={(e) => setTexts({ ...texts, summaryTitle: e.target.value })}
                placeholder="Récapitulatif"
                className="border-[#9CD9F6]/50 focus:border-[#009197]"
              />
            </div>

            <div>
              <Label htmlFor="summaryIntro">Introduction du récapitulatif</Label>
              <Textarea
                id="summaryIntro"
                value={texts.summaryIntro || ""}
                onChange={(e) => setTexts({ ...texts, summaryIntro: e.target.value })}
                placeholder="Texte d'introduction optionnel (laissez vide pour utiliser le texte par défaut)"
                className="border-[#9CD9F6]/50 focus:border-[#009197]"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="summaryParticipation">Label &quot;Participation&quot;</Label>
              <Input
                id="summaryParticipation"
                value={texts.summaryParticipation || ""}
                onChange={(e) => setTexts({ ...texts, summaryParticipation: e.target.value })}
                placeholder="Participation :"
                className="border-[#9CD9F6]/50 focus:border-[#009197]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="summaryYes">Réponse &quot;Oui&quot;</Label>
                <Input
                  id="summaryYes"
                  value={texts.summaryYes || ""}
                  onChange={(e) => setTexts({ ...texts, summaryYes: e.target.value })}
                  placeholder="Oui ✓"
                  className="border-[#9CD9F6]/50 focus:border-[#009197]"
                />
              </div>

              <div>
                <Label htmlFor="summaryNo">Réponse &quot;Non&quot;</Label>
                <Input
                  id="summaryNo"
                  value={texts.summaryNo || ""}
                  onChange={(e) => setTexts({ ...texts, summaryNo: e.target.value })}
                  placeholder="Non"
                  className="border-[#9CD9F6]/50 focus:border-[#009197]"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="summaryPlusOnes">Label &quot;Accompagnants&quot;</Label>
              <Input
                id="summaryPlusOnes"
                value={texts.summaryPlusOnes || ""}
                onChange={(e) => setTexts({ ...texts, summaryPlusOnes: e.target.value })}
                placeholder="Accompagnants :"
                className="border-[#9CD9F6]/50 focus:border-[#009197]"
              />
            </div>

            <div>
              <Label htmlFor="summaryMeal">Label &quot;Repas&quot;</Label>
              <Input
                id="summaryMeal"
                value={texts.summaryMeal || ""}
                onChange={(e) => setTexts({ ...texts, summaryMeal: e.target.value })}
                placeholder="Repas :"
                className="border-[#9CD9F6]/50 focus:border-[#009197]"
              />
            </div>

            <div>
              <Label htmlFor="summaryAllergies">Label &quot;Allergies&quot;</Label>
              <Input
                id="summaryAllergies"
                value={texts.summaryAllergies || ""}
                onChange={(e) => setTexts({ ...texts, summaryAllergies: e.target.value })}
                placeholder="Allergies :"
                className="border-[#9CD9F6]/50 focus:border-[#009197]"
              />
            </div>

            <div>
              <Label htmlFor="summaryModifyUntil">Texte &quot;Modifier jusqu&apos;au&quot;</Label>
              <Input
                id="summaryModifyUntil"
                value={texts.summaryModifyUntil || ""}
                onChange={(e) => setTexts({ ...texts, summaryModifyUntil: e.target.value })}
                placeholder="Vous pourrez modifier votre réponse jusqu'au"
                className="border-[#9CD9F6]/50 focus:border-[#009197]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Section Indicateurs visuels */}
        <Card className="border-[#9CD9F6]/30">
          <CardHeader>
            <CardTitle className="text-[#004645]">Indicateurs visuels</CardTitle>
            <CardDescription>Badges, messages de chargement et sauvegarde</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="formBadge">Badge &quot;Optimisé&quot;</Label>
              <Input
                id="formBadge"
                value={texts.formBadge || ""}
                onChange={(e) => setTexts({ ...texts, formBadge: e.target.value })}
                placeholder="✨ Optimisé"
                className="border-[#9CD9F6]/50 focus:border-[#009197]"
              />
            </div>

            <div>
              <Label htmlFor="formFeatures">Description des fonctionnalités</Label>
              <Input
                id="formFeatures"
                value={texts.formFeatures || ""}
                onChange={(e) => setTexts({ ...texts, formFeatures: e.target.value })}
                placeholder="💾 Sauvegarde automatique • ⚡ Performance améliorée"
                className="border-[#9CD9F6]/50 focus:border-[#009197]"
              />
            </div>

            <div>
              <Label htmlFor="autosaveIndicator">Indicateur d&apos;autosave</Label>
              <Input
                id="autosaveIndicator"
                value={texts.autosaveIndicator || ""}
                onChange={(e) => setTexts({ ...texts, autosaveIndicator: e.target.value })}
                placeholder="Enregistré automatiquement"
                className="border-[#9CD9F6]/50 focus:border-[#009197]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="loadingMessage">Message de chargement</Label>
                <Input
                  id="loadingMessage"
                  value={texts.loadingMessage || ""}
                  onChange={(e) => setTexts({ ...texts, loadingMessage: e.target.value })}
                  placeholder="Chargement..."
                  className="border-[#9CD9F6]/50 focus:border-[#009197]"
                />
              </div>

              <div>
                <Label htmlFor="savingMessage">Message de sauvegarde</Label>
                <Input
                  id="savingMessage"
                  value={texts.savingMessage || ""}
                  onChange={(e) => setTexts({ ...texts, savingMessage: e.target.value })}
                  placeholder="Enregistrement..."
                  className="border-[#9CD9F6]/50 focus:border-[#009197]"
                />
              </div>
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
              <Button
                type="button"
                variant="outline"
                className="border-[#004645] text-[#004645]"
              >
                Annuler
              </Button>
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
