"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Calendar, MapPin, Clock, Users, Loader2, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { RSVPProgress } from "@/components/rsvp-progress";
import { RSVPConfirmation } from "@/components/rsvp-confirmation";
import { buildSteps, getNextStep, getPreviousStep, type StepConfig } from "@/lib/rsvp-steps";
import { RsvpCustomStep } from "@/components/rsvp-custom-steps";
import type { RsvpStep } from "@/app/admin/events/[id]/settings/tabs/rsvp-subtabs/RsvpStepsContent";
import { ResponseStep } from "./components/steps/ResponseStep";
import { PlusOnesStep } from "./components/steps/PlusOnesStep";
import { MealStep } from "./components/steps/MealStep";
import { PracticalStep } from "./components/steps/PracticalStep";
import { ConsentStep } from "./components/steps/ConsentStep";
import { SummaryStep } from "./components/steps/SummaryStep";

interface GuestData {
  guest: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    company?: string;
  };
  event: {
    id: string;
    name: string;
    startsAt: string;
    endsAt?: string;
    venueName?: string;
    address?: string;
    city?: string;
    description?: string;
    program?: string;
    dressCode?: string;
    rsvpDeadline?: string;
    maxPlusOnes: number;
    allowPlusOnes: boolean;
    requireMeal: boolean;
    mealOptions: string[];
    enableTransport: boolean;
    enableLodging: boolean;
    enableAccessibility: boolean;
    enablePhotoConsent: boolean;
    rsvpConfig?: {
      customSteps?: RsvpStep[];
      customTexts?: {
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
      };
      // Page de confirmation finale
      confirmationButtonText?: string;
      confirmationButtonUrl?: string;
      confirmationTitleAccepted?: string;
      confirmationTextAccepted?: string;
      confirmationTitleDeclined?: string;
      confirmationTextDeclined?: string;
    };
  };
  rsvp?: {
    attending?: boolean;
    plusOnes: number;
    mealChoice?: string;
    allergies?: string;
    accessibilityNotes?: string;
    transportNeeds?: string;
    lodgingNeeds?: string;
    consentPhotos: boolean;
  };
}

export default function GuestPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const token = params.token as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [data, setData] = useState<GuestData | null>(null);
  const [currentStepId, setCurrentStepId] = useState('response');
  const [steps, setSteps] = useState<StepConfig[]>([]);
  const [showAutosaved, setShowAutosaved] = useState(false);

  // Form state
  const [attending, setAttending] = useState<boolean | null>(null);
  const [plusOnes, setPlusOnes] = useState(0);
  const [mealChoice, setMealChoice] = useState("");
  const [allergies, setAllergies] = useState("");
  const [accessibilityNotes, setAccessibilityNotes] = useState("");
  const [transportNeeds, setTransportNeeds] = useState("");
  const [lodgingNeeds, setLodgingNeeds] = useState("");
  const [consentPhotos, setConsentPhotos] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [customAnswers, setCustomAnswers] = useState<Record<string, string>>({});

  const fetchGuestData = useCallback(async () => {
    try {
      const response = await fetch(`/api/guest/${token}`);
      if (!response.ok) {
        throw new Error("Invalid invitation link");
      }
      const result = await response.json();
      setData(result);

      // Pre-fill if RSVP exists
      if (result.rsvp) {
        setAttending(result.rsvp.attending ?? null);
        setPlusOnes(result.rsvp.plusOnes || 0);
        setMealChoice(result.rsvp.mealChoice || "");
        setAllergies(result.rsvp.allergies || "");
        setAccessibilityNotes(result.rsvp.accessibilityNotes || "");
        setTransportNeeds(result.rsvp.transportNeeds || "");
        setLodgingNeeds(result.rsvp.lodgingNeeds || "");
        setConsentPhotos(result.rsvp.consentPhotos || false);
      }
    } catch (error) {
      toast({
        title: "❌ Lien d'invitation invalide ou expiré",
        description: "Ce lien ne fonctionne plus. Contactez l'organisateur pour recevoir un nouveau lien d'invitation.",
        variant: "destructive",
        duration: 10000, // Longer duration for important errors
      });
      // Redirect after showing the message
      setTimeout(() => {
        router.push("/");
      }, 3000);
    } finally {
      setLoading(false);
    }
  }, [token, toast, router]);

  useEffect(() => {
    fetchGuestData();
  }, [fetchGuestData]);

  // Helper to get custom text for a step
  const getStepText = (stepType: string, textKey: string, defaultValue: string): string => {
    if (!data?.event.rsvpConfig?.customSteps) return defaultValue;

    const step = data.event.rsvpConfig.customSteps.find(s => s.type === stepType && s.enabled);
    if (!step?.texts) return defaultValue;

    return (step.texts as any)[textKey] || defaultValue;
  };

  // Memoized custom texts for better performance
  const customTexts = useMemo(() => ({
    // Accueil
    welcomeGreeting: data?.event.rsvpConfig?.customTexts?.welcomeGreeting || `Bonjour ${data?.guest.firstName || ''} 👋`,
    welcomeSubtitle: data?.event.rsvpConfig?.customTexts?.welcomeSubtitle || "Vous êtes invité(e) à",

    // Formulaire RSVP
    formTitle: data?.event.rsvpConfig?.customTexts?.formTitle || "Votre réponse",
    formSubtitle: data?.event.rsvpConfig?.customTexts?.formSubtitle || "Merci de confirmer votre participation avant le",
    formBadge: data?.event.rsvpConfig?.customTexts?.formBadge || "✨ Optimisé",
    formFeatures: data?.event.rsvpConfig?.customTexts?.formFeatures || "💾 Sauvegarde automatique • ⚡ Performance améliorée",

    // Étape de réponse
    responseQuestion: data?.event.rsvpConfig?.customTexts?.responseQuestion || "Participez-vous à l'événement ?",
    responseYes: data?.event.rsvpConfig?.customTexts?.responseYes || "✓ J'accepte avec plaisir",
    responseNo: data?.event.rsvpConfig?.customTexts?.responseNo || "✗ Je ne peux malheureusement pas venir",
    continueButton: data?.event.rsvpConfig?.customTexts?.continueButton || "Continuer",

    // Étape accompagnants
    plusOnesLabel: data?.event.rsvpConfig?.customTexts?.plusOnesLabel || "Nombre d'accompagnants (max {maxPlusOnes})",
    plusOnesNone: data?.event.rsvpConfig?.customTexts?.plusOnesNone || "Aucun",

    // Étape repas
    mealLabel: data?.event.rsvpConfig?.customTexts?.mealLabel || "Choix de repas",
    mealPlaceholder: data?.event.rsvpConfig?.customTexts?.mealPlaceholder || "Sélectionnez votre choix",
    allergiesLabel: data?.event.rsvpConfig?.customTexts?.allergiesLabel || "Allergies ou régimes spécifiques",
    allergiesPlaceholder: data?.event.rsvpConfig?.customTexts?.allergiesPlaceholder || "Précisez vos éventuelles allergies...",

    // Étape informations pratiques
    practicalTitle: data?.event.rsvpConfig?.customTexts?.practicalTitle || "Informations pratiques",
    accessibilityLabel: data?.event.rsvpConfig?.customTexts?.accessibilityLabel || "Besoins d'accessibilité",
    accessibilityPlaceholder: data?.event.rsvpConfig?.customTexts?.accessibilityPlaceholder || "PMR, assistance particulière...",
    transportLabel: data?.event.rsvpConfig?.customTexts?.transportLabel || "Besoins de transport",
    transportPlaceholder: data?.event.rsvpConfig?.customTexts?.transportPlaceholder || "Navette, parking...",
    lodgingLabel: data?.event.rsvpConfig?.customTexts?.lodgingLabel || "Besoins d'hébergement",
    lodgingPlaceholder: data?.event.rsvpConfig?.customTexts?.lodgingPlaceholder || "Hôtel, nuitée...",

    // Étape consentements
    consentTitle: data?.event.rsvpConfig?.customTexts?.consentTitle || "Consentements",
    consentLabel: data?.event.rsvpConfig?.customTexts?.consentLabel || "J'autorise la prise et l'utilisation de photographies durant l'événement à des fins de communication",

    // Étape récapitulatif
    summaryTitle: data?.event.rsvpConfig?.customTexts?.summaryTitle || "Récapitulatif",
    summaryIntro: data?.event.rsvpConfig?.customTexts?.summaryIntro || "",
    summaryParticipation: data?.event.rsvpConfig?.customTexts?.summaryParticipation || "Participation :",
    summaryYes: data?.event.rsvpConfig?.customTexts?.summaryYes || "Oui ✓",
    summaryNo: data?.event.rsvpConfig?.customTexts?.summaryNo || "Non",
    summaryPlusOnes: data?.event.rsvpConfig?.customTexts?.summaryPlusOnes || "Accompagnants :",
    summaryMeal: data?.event.rsvpConfig?.customTexts?.summaryMeal || "Repas :",
    summaryAllergies: data?.event.rsvpConfig?.customTexts?.summaryAllergies || "Allergies :",
    summaryModifyUntil: data?.event.rsvpConfig?.customTexts?.summaryModifyUntil || "Vous pourrez modifier votre réponse jusqu'au",

    // Indicateurs visuels
    autosaveIndicator: data?.event.rsvpConfig?.customTexts?.autosaveIndicator || "Enregistré automatiquement",
    loadingMessage: data?.event.rsvpConfig?.customTexts?.loadingMessage || "Chargement...",
    savingMessage: data?.event.rsvpConfig?.customTexts?.savingMessage || "Enregistrement...",

    // Boutons de navigation
    previousButton: data?.event.rsvpConfig?.customTexts?.previousButton || "Précédent",
    submitButton: data?.event.rsvpConfig?.customTexts?.submitButton || "Envoyer ma réponse",
    backButton: data?.event.rsvpConfig?.customTexts?.backButton || "Retour",

    // Message de succès
    successTitle: data?.event.rsvpConfig?.customTexts?.successTitle || "Merci pour votre réponse !",
    successMessage: data?.event.rsvpConfig?.customTexts?.successMessage || "Votre participation a été enregistrée",
  }), [data?.event.rsvpConfig?.customTexts, data?.guest.firstName]);

  // localStorage autosave: Load draft on mount
  useEffect(() => {
    if (!data?.event || !data?.guest) return;

    const draftKey = `rsvp-draft-${data.event.id}-${data.guest.id}`;
    const draft = localStorage.getItem(draftKey);

    if (draft && !data.rsvp) {
      try {
        const saved = JSON.parse(draft);
        setAttending(saved.attending ?? null);
        setPlusOnes(saved.plusOnes || 0);
        setMealChoice(saved.mealChoice || "");
        setAllergies(saved.allergies || "");
        setAccessibilityNotes(saved.accessibilityNotes || "");
        setTransportNeeds(saved.transportNeeds || "");
        setLodgingNeeds(saved.lodgingNeeds || "");
        setConsentPhotos(saved.consentPhotos || false);
        setCustomAnswers(saved.customAnswers || {});

        toast({
          title: "📝 Brouillon restauré",
          description: "Vos réponses précédentes ont été récupérées",
          duration: 4000,
        });
      } catch (error) {
        // Invalid draft, ignore
        localStorage.removeItem(draftKey);
      }
    }
  }, [data?.event, data?.rsvp, data?.guest, toast]);

  // localStorage autosave: Save on field changes (debounced)
  useEffect(() => {
    if (!data?.event || !data?.guest || data?.rsvp) return; // Don't autosave if already submitted

    const timeout = setTimeout(() => {
      const draftKey = `rsvp-draft-${data.event.id}-${data.guest.id}`;
      const formData = {
        attending,
        plusOnes,
        mealChoice,
        allergies,
        accessibilityNotes,
        transportNeeds,
        lodgingNeeds,
        consentPhotos,
        customAnswers,
      };

      localStorage.setItem(draftKey, JSON.stringify(formData));

      // Show autosave indicator
      setShowAutosaved(true);
      setTimeout(() => setShowAutosaved(false), 2000); // Hide after 2 seconds
    }, 1000); // 1 second debounce

    return () => clearTimeout(timeout);
  }, [attending, plusOnes, mealChoice, allergies, accessibilityNotes, transportNeeds, lodgingNeeds, consentPhotos, customAnswers, data?.event, data?.rsvp, data?.guest]);

  // Focus management: Focus first input when step changes
  useEffect(() => {
    if (currentStepId && currentStepId !== 'success') {
      const timer = setTimeout(() => {
        const firstInteractive = document.querySelector(`input:not([type="hidden"]), button, textarea, select`) as HTMLElement;
        firstInteractive?.focus();
      }, 100); // Small delay to ensure DOM is updated

      return () => clearTimeout(timer);
    }
  }, [currentStepId]);

  // Rebuild steps when event data or attending status changes
  useEffect(() => {
    if (data?.event) {
      // Use custom steps if defined, otherwise build default steps
      if (data.event.rsvpConfig?.customSteps && data.event.rsvpConfig.customSteps.length > 0) {
        // Filter and map custom steps to StepConfig format
        const enabledCustomSteps = data.event.rsvpConfig.customSteps
          .filter(s => s.enabled)
          .sort((a, b) => a.order - b.order)
          .map(s => ({
            id: s.id,
            label: s.label,
            enabled: true
          }));

        // Filter steps based on attending status
        let filteredSteps = enabledCustomSteps;
        if (attending === false) {
          // Only show response and summary when declining
          filteredSteps = enabledCustomSteps.filter(s =>
            s.id === 'response' || s.id === 'summary' || s.id.startsWith('welcome') || s.id.startsWith('message')
          );
        }

        setSteps(filteredSteps);
      } else {
        // Use default step builder
        const newSteps = buildSteps(
          {
            allowPlusOnes: data.event.allowPlusOnes,
            requireMeal: data.event.requireMeal,
            enableAccessibility: data.event.enableAccessibility,
            enableTransport: data.event.enableTransport,
            enableLodging: data.event.enableLodging,
            enablePhotoConsent: data.event.enablePhotoConsent,
          },
          attending
        );
        setSteps(newSteps);
      }

      // If attending status changes from true to false, jump to summary
      if (attending === false && currentStepId !== 'response') {
        setCurrentStepId('summary');
      }
    }
  }, [data?.event, attending, currentStepId]);

  const handleSubmit = async () => {
    if (attending === null) {
      toast({
        title: "Erreur",
        description: "Veuillez indiquer si vous participez",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`/api/rsvp/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attending,
          plusOnes,
          mealChoice,
          allergies,
          accessibilityNotes,
          transportNeeds,
          lodgingNeeds,
          consentPhotos,
          customAnswers,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(JSON.stringify(errorData));
      }

      const result = await response.json();
      if (result.qrCode) {
        setQrCode(result.qrCode);
      }

      // Clear localStorage draft on successful submission
      if (data?.event && data?.guest) {
        const draftKey = `rsvp-draft-${data.event.id}-${data.guest.id}`;
        localStorage.removeItem(draftKey);
      }

      toast({
        title: "✓ Réponse enregistrée",
        description: attending
          ? "Merci ! Votre participation est confirmée. Un email de confirmation vous a été envoyé."
          : "Votre réponse a été enregistrée. Nous espérons vous voir lors d'un prochain événement.",
      });

      setCurrentStepId('success');
    } catch (error) {
      // Parse detailed error message
      let errorMessage = "Impossible d'enregistrer votre réponse";
      let errorSuggestion = "Veuillez réessayer.";

      try {
        const errorData = JSON.parse((error as Error).message);
        if (errorData.message) {
          errorMessage = errorData.message;
        }
        if (errorData.suggestion) {
          errorSuggestion = errorData.suggestion;
        }
      } catch {
        // If parsing fails, use default message
      }

      toast({
        title: "❌ " + errorMessage,
        description: errorSuggestion,
        variant: "destructive",
        duration: 8000, // Longer duration for error messages with suggestions
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#9CD9F6] via-white to-[#9CD9F6] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#009197]" />
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const { guest, event } = data;
  const eventDate = new Date(event.startsAt);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#9CD9F6] via-white to-[#9CD9F6] py-8">
      {/* Lignes graphiques orange décoratives */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <svg className="absolute top-0 right-0 w-1/4 h-1/4" viewBox="0 0 200 200">
          <path
            d="M 0 50 Q 50 50, 50 100 T 100 150 T 150 200"
            stroke="#FF4713"
            strokeWidth="2"
            fill="none"
            opacity="0.2"
          />
        </svg>
        <svg className="absolute bottom-0 left-0 w-1/4 h-1/4" viewBox="0 0 200 200">
          <path
            d="M 200 150 Q 150 150, 150 100 T 100 50 T 50 0"
            stroke="#FF4713"
            strokeWidth="2"
            fill="none"
            opacity="0.2"
          />
        </svg>
      </div>

      <div className="relative container mx-auto px-4 max-w-3xl">
        {currentStepId !== 'success' && (
          <>
            {/* Welcome Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <h1 className="text-4xl font-bold mb-2 text-[#004645]" style={{ fontFamily: "var(--font-abril)" }}>
                {customTexts.welcomeGreeting.replace('{guest.firstName}', guest.firstName)}
              </h1>
              <p className="text-[#004645]/70">{customTexts.welcomeSubtitle}</p>
            </motion.div>

            {/* Progress Bar */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <RSVPProgress
                currentStepId={currentStepId}
                steps={steps.filter(s => s.id !== 'success')}
              />
            </motion.div>

            {/* Event Info Card */}
            <Card className="mb-8 border-[#9CD9F6]/30 bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-2xl text-[#004645]" style={{ fontFamily: "var(--font-abril)" }}>
                  {event.name}
                </CardTitle>
                <CardDescription className="space-y-2 text-base text-[#004645]/70">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-[#009197]" />
                    {eventDate.toLocaleDateString("fr-FR", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}{" "}
                    à{" "}
                    {eventDate.toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                  {event.venueName && (
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-[#009197]" />
                      {event.venueName}, {event.city}
                    </div>
                  )}
                </CardDescription>
              </CardHeader>
              {event.description && (
                <CardContent>
                  <p className="text-[#004645]/70 whitespace-pre-wrap">
                    {event.description}
                  </p>
                </CardContent>
              )}
            </Card>

            {/* RSVP Form */}
            <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[#004645]" style={{ fontFamily: "var(--font-abril)" }}>
                    {customTexts.formTitle}
                  </CardTitle>
                  <span className="text-xs bg-gradient-to-r from-[#009197] to-[#004645] text-white px-3 py-1 rounded-full font-medium flex items-center gap-1">
                    {customTexts.formBadge}
                  </span>
                </div>
                <CardDescription className="text-[#004645]/70">
                  {customTexts.formSubtitle}{" "}
                  {event.rsvpDeadline &&
                    new Date(event.rsvpDeadline).toLocaleDateString("fr-FR")}
                  <span className="block text-xs mt-1 text-[#009197]">
                    {customTexts.formFeatures}
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Step: Response */}
                {currentStepId === 'response' && (
                  <ResponseStep
                    attending={attending}
                    onAttendingChange={(value) => setAttending(value)}
                    onContinue={() => {
                      const next = getNextStep('response', steps);
                      if (next) setCurrentStepId(next);
                    }}
                    texts={customTexts}
                    getStepText={getStepText}
                  />
                )}

                {/* Step: Plus Ones */}
                {currentStepId === 'plus-ones' && (
                  <PlusOnesStep
                    plusOnes={plusOnes}
                    maxPlusOnes={event.maxPlusOnes}
                    onPlusOnesChange={(value) => setPlusOnes(value)}
                    onBack={() => {
                      const prev = getPreviousStep('plus-ones', steps);
                      if (prev) setCurrentStepId(prev);
                    }}
                    onContinue={() => {
                      const next = getNextStep('plus-ones', steps);
                      if (next) setCurrentStepId(next);
                    }}
                    texts={customTexts}
                    getStepText={getStepText}
                  />
                )}

                {/* Step: Meal Choice */}
                {currentStepId === 'meal' && (
                  <MealStep
                    mealChoice={mealChoice}
                    allergies={allergies}
                    mealOptions={event.mealOptions}
                    onMealChoiceChange={(value) => setMealChoice(value)}
                    onAllergiesChange={(value) => setAllergies(value)}
                    onBack={() => {
                      const prev = getPreviousStep('meal', steps);
                      if (prev) setCurrentStepId(prev);
                    }}
                    onContinue={() => {
                      const next = getNextStep('meal', steps);
                      if (next) setCurrentStepId(next);
                    }}
                    texts={customTexts}
                    getStepText={getStepText}
                  />
                )}

                {/* Step: Practical Info */}
                {currentStepId === 'practical' && (
                  <PracticalStep
                    accessibilityNotes={accessibilityNotes}
                    transportNeeds={transportNeeds}
                    lodgingNeeds={lodgingNeeds}
                    enableAccessibility={event.enableAccessibility}
                    enableTransport={event.enableTransport}
                    enableLodging={event.enableLodging}
                    onAccessibilityChange={(value) => setAccessibilityNotes(value)}
                    onTransportChange={(value) => setTransportNeeds(value)}
                    onLodgingChange={(value) => setLodgingNeeds(value)}
                    onBack={() => {
                      const prev = getPreviousStep('practical', steps);
                      if (prev) setCurrentStepId(prev);
                    }}
                    onContinue={() => {
                      const next = getNextStep('practical', steps);
                      if (next) setCurrentStepId(next);
                    }}
                    texts={customTexts}
                    getStepText={getStepText}
                  />
                )}

                {/* Step: Consents */}
                {currentStepId === 'consent' && (
                  <ConsentStep
                    consentPhotos={consentPhotos}
                    enablePhotoConsent={event.enablePhotoConsent}
                    onConsentChange={(value) => setConsentPhotos(value)}
                    onBack={() => {
                      const prev = getPreviousStep('consent', steps);
                      if (prev) setCurrentStepId(prev);
                    }}
                    onContinue={() => {
                      const next = getNextStep('consent', steps);
                      if (next) setCurrentStepId(next);
                    }}
                    texts={customTexts}
                    getStepText={getStepText}
                  />
                )}

                {/* Custom Steps (message and custom fields) */}
                {data.event.rsvpConfig?.customSteps
                  ?.filter(s => s.enabled && (s.type === 'message' || s.type === 'custom'))
                  .map(customStep => {
                    if (currentStepId !== customStep.id) return null;

                    return (
                      <motion.div
                        key={customStep.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-4"
                      >
                        <RsvpCustomStep
                          step={customStep}
                          value={customAnswers[customStep.id] || ''}
                          onChange={(value) => setCustomAnswers({ ...customAnswers, [customStep.id]: value })}
                        />
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            onClick={() => {
                              const prev = getPreviousStep(customStep.id, steps);
                              if (prev) setCurrentStepId(prev);
                            }}
                            className="border-[#004645] text-[#004645] hover:bg-[#004645] hover:text-white"
                          >
                            Retour
                          </Button>
                          <Button
                            onClick={() => {
                              // Validation for required custom fields
                              if (customStep.type === 'custom' && customStep.customField?.required) {
                                if (!customAnswers[customStep.id]?.trim()) {
                                  toast({
                                    title: "Champ obligatoire",
                                    description: "Veuillez répondre à cette question",
                                    variant: "destructive",
                                  });
                                  return;
                                }
                              }
                              const next = getNextStep(customStep.id, steps);
                              if (next) setCurrentStepId(next);
                            }}
                            className="flex-1 bg-gradient-to-r from-[#004645] to-[#009197] hover:from-[#006C51] hover:to-[#009197] text-white"
                          >
                            Continuer
                          </Button>
                        </div>
                      </motion.div>
                    );
                  })}

                {/* Step: Summary */}
                {currentStepId === 'summary' && (
                  <SummaryStep
                    attending={attending}
                    plusOnes={plusOnes}
                    mealChoice={mealChoice}
                    allergies={allergies}
                    allowPlusOnes={event.allowPlusOnes}
                    rsvpDeadline={event.rsvpDeadline}
                    submitting={submitting}
                    onBack={() => {
                      const prev = getPreviousStep('summary', steps);
                      if (prev) setCurrentStepId(prev);
                    }}
                    onSubmit={handleSubmit}
                    texts={customTexts}
                    getStepText={getStepText}
                  />
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* Success Step */}
        {currentStepId === 'success' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <RSVPConfirmation
              attending={attending ?? false}
              guestName={guest.firstName}
              eventName={event.name}
              qrCodeData={qrCode || undefined}
              customTitle={
                attending
                  ? data?.event.rsvpConfig?.confirmationTitleAccepted
                  : data?.event.rsvpConfig?.confirmationTitleDeclined
              }
              customMessage={
                attending
                  ? data?.event.rsvpConfig?.confirmationTextAccepted
                  : data?.event.rsvpConfig?.confirmationTextDeclined
              }
            />
            <div className="mt-6 text-center">
              <Button
                onClick={() => {
                  const url = data?.event.rsvpConfig?.confirmationButtonUrl || "/"
                  if (url.startsWith('http://') || url.startsWith('https://')) {
                    window.location.href = url
                  } else {
                    router.push(url)
                  }
                }}
                variant="outline"
                size="lg"
                className="border-[#004645] text-[#004645] hover:bg-[#004645] hover:text-white"
              >
                {data?.event.rsvpConfig?.confirmationButtonText || "Retour à l'accueil"}
              </Button>
            </div>
          </motion.div>
        )}

        {/* Autosave indicator */}
        {showAutosaved && currentStepId !== 'success' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-8 right-8 bg-white border border-[#009197]/20 shadow-lg rounded-lg px-4 py-3 flex items-center space-x-2 z-50"
          >
            <CheckCircle2 className="h-5 w-5 text-[#009197]" />
            <span className="text-sm text-[#004645] font-medium">
              {customTexts.autosaveIndicator}
            </span>
          </motion.div>
        )}
      </div>
    </div>
  );
}
