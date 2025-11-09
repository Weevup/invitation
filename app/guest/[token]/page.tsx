"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Calendar, MapPin, Clock, Users, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { RSVPProgress } from "@/components/rsvp-progress";
import { RSVPConfirmation } from "@/components/rsvp-confirmation";

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
  const [step, setStep] = useState(1);

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

      toast({
        title: "✓ Réponse enregistrée",
        description: attending
          ? "Merci ! Votre participation est confirmée. Un email de confirmation vous a été envoyé."
          : "Votre réponse a été enregistrée. Nous espérons vous voir lors d'un prochain événement.",
      });

      setStep(7); // Success step
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
        {step < 7 && (
          <>
            {/* Welcome Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <h1 className="text-4xl font-bold mb-2 text-[#004645]" style={{ fontFamily: "var(--font-abril)" }}>
                Bonjour {guest.firstName} 👋
              </h1>
              <p className="text-[#004645]/70">Vous êtes invité(e) à</p>
            </motion.div>

            {/* Progress Bar */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <RSVPProgress
                currentStep={step}
                totalSteps={7}
                stepLabels={[
                  'Réponse',
                  'Accompagnants',
                  'Repas',
                  'Accès',
                  'Transport',
                  'Hébergement',
                  'Confirmation'
                ]}
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
                <CardTitle className="text-[#004645]" style={{ fontFamily: "var(--font-abril)" }}>
                  Votre réponse
                </CardTitle>
                <CardDescription className="text-[#004645]/70">
                  Merci de confirmer votre participation avant le{" "}
                  {event.rsvpDeadline &&
                    new Date(event.rsvpDeadline).toLocaleDateString("fr-FR")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Step 1: Attendance */}
                {step === 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4"
                  >
                    <Label className="text-lg">Participez-vous à l&apos;événement ?</Label>
                    <RadioGroup
                      value={attending === null ? "" : attending.toString()}
                      onValueChange={(value) =>
                        setAttending(value === "true")
                      }
                    >
                      <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-accent cursor-pointer">
                        <RadioGroupItem value="true" id="yes" />
                        <Label htmlFor="yes" className="cursor-pointer flex-1">
                          ✓ J&apos;accepte avec plaisir
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-accent cursor-pointer">
                        <RadioGroupItem value="false" id="no" />
                        <Label htmlFor="no" className="cursor-pointer flex-1">
                          ✗ Je ne peux malheureusement pas venir
                        </Label>
                      </div>
                    </RadioGroup>
                    <Button
                      onClick={() => attending !== null && setStep(attending ? 2 : 6)}
                      disabled={attending === null}
                      className="w-full bg-gradient-to-r from-[#004645] to-[#009197] hover:from-[#006C51] hover:to-[#009197] text-white"
                    >
                      Continuer
                    </Button>
                  </motion.div>
                )}

                {/* Step 2: Plus Ones */}
                {step === 2 && attending && event.allowPlusOnes && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4"
                  >
                    <Label htmlFor="plusOnes" className="text-lg">
                      Nombre d&apos;accompagnants (max {event.maxPlusOnes})
                    </Label>
                    <Select
                      value={plusOnes.toString()}
                      onValueChange={(value) => setPlusOnes(parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: event.maxPlusOnes + 1 }, (_, i) => (
                          <SelectItem key={i} value={i.toString()}>
                            {i === 0 ? "Aucun" : i}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex space-x-2">
                      <Button variant="outline" onClick={() => setStep(1)} className="border-[#004645] text-[#004645] hover:bg-[#004645] hover:text-white">
                        Retour
                      </Button>
                      <Button onClick={() => setStep(3)} className="flex-1 bg-gradient-to-r from-[#004645] to-[#009197] hover:from-[#006C51] hover:to-[#009197] text-white">
                        Continuer
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Meal Choice */}
                {step === 3 && attending && event.requireMeal && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4"
                  >
                    <Label htmlFor="meal" className="text-lg">
                      Choix de repas
                    </Label>
                    <Select value={mealChoice} onValueChange={setMealChoice}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez votre choix" />
                      </SelectTrigger>
                      <SelectContent>
                        {event.mealOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="space-y-2">
                      <Label htmlFor="allergies">Allergies ou régimes spécifiques</Label>
                      <Textarea
                        id="allergies"
                        value={allergies}
                        onChange={(e) => setAllergies(e.target.value)}
                        placeholder="Précisez vos éventuelles allergies..."
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => setStep(event.allowPlusOnes ? 2 : 1)}
                        className="border-[#004645] text-[#004645] hover:bg-[#004645] hover:text-white"
                      >
                        Retour
                      </Button>
                      <Button onClick={() => setStep(4)} className="flex-1 bg-gradient-to-r from-[#004645] to-[#009197] hover:from-[#006C51] hover:to-[#009197] text-white">
                        Continuer
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Step 4: Accessibility & Transport */}
                {step === 4 && attending && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4"
                  >
                    <h3 className="text-lg font-semibold">Informations pratiques</h3>
                    {event.enableAccessibility && (
                      <div className="space-y-2">
                        <Label htmlFor="accessibility">
                          Besoins d&apos;accessibilité
                        </Label>
                        <Textarea
                          id="accessibility"
                          value={accessibilityNotes}
                          onChange={(e) => setAccessibilityNotes(e.target.value)}
                          placeholder="PMR, assistance particulière..."
                        />
                      </div>
                    )}
                    {event.enableTransport && (
                      <div className="space-y-2">
                        <Label htmlFor="transport">Besoins de transport</Label>
                        <Textarea
                          id="transport"
                          value={transportNeeds}
                          onChange={(e) => setTransportNeeds(e.target.value)}
                          placeholder="Navette, parking..."
                        />
                      </div>
                    )}
                    {event.enableLodging && (
                      <div className="space-y-2">
                        <Label htmlFor="lodging">Besoins d&apos;hébergement</Label>
                        <Textarea
                          id="lodging"
                          value={lodgingNeeds}
                          onChange={(e) => setLodgingNeeds(e.target.value)}
                          placeholder="Hôtel, nuitée..."
                        />
                      </div>
                    )}
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => setStep(event.requireMeal ? 3 : event.allowPlusOnes ? 2 : 1)}
                        className="border-[#004645] text-[#004645] hover:bg-[#004645] hover:text-white"
                      >
                        Retour
                      </Button>
                      <Button onClick={() => setStep(5)} className="flex-1 bg-gradient-to-r from-[#004645] to-[#009197] hover:from-[#006C51] hover:to-[#009197] text-white">
                        Continuer
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Step 5: Consents */}
                {step === 5 && attending && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4"
                  >
                    <h3 className="text-lg font-semibold">Consentements</h3>
                    {event.enablePhotoConsent && (
                      <div className="flex items-start space-x-2">
                        <input
                          type="checkbox"
                          id="photos"
                          checked={consentPhotos}
                          onChange={(e) => setConsentPhotos(e.target.checked)}
                          className="mt-1"
                        />
                        <Label htmlFor="photos" className="cursor-pointer">
                          J&apos;autorise la prise et l&apos;utilisation de photographies durant
                          l&apos;événement à des fins de communication
                        </Label>
                      </div>
                    )}
                    <div className="flex space-x-2">
                      <Button variant="outline" onClick={() => setStep(4)} className="border-[#004645] text-[#004645] hover:bg-[#004645] hover:text-white">
                        Retour
                      </Button>
                      <Button onClick={() => setStep(6)} className="flex-1 bg-gradient-to-r from-[#004645] to-[#009197] hover:from-[#006C51] hover:to-[#009197] text-white">
                        Continuer
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Step 6: Summary */}
                {step === 6 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4"
                  >
                    <h3 className="text-lg font-semibold">Récapitulatif</h3>
                    <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
                      <p>
                        <strong>Participation :</strong>{" "}
                        {attending ? "Oui ✓" : "Non"}
                      </p>
                      {attending && (
                        <>
                          {event.allowPlusOnes && (
                            <p>
                              <strong>Accompagnants :</strong> {plusOnes}
                            </p>
                          )}
                          {mealChoice && (
                            <p>
                              <strong>Repas :</strong> {mealChoice}
                            </p>
                          )}
                          {allergies && (
                            <p>
                              <strong>Allergies :</strong> {allergies}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                    <p className="text-sm text-[#004645]/70">
                      Vous pourrez modifier votre réponse jusqu&apos;au{" "}
                      {event.rsvpDeadline &&
                        new Date(event.rsvpDeadline).toLocaleDateString("fr-FR")}
                    </p>
                    <div className="flex space-x-2">
                      <Button variant="outline" onClick={() => setStep(attending ? 5 : 1)} className="border-[#004645] text-[#004645] hover:bg-[#004645] hover:text-white">
                        Retour
                      </Button>
                      <Button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="flex-1 bg-gradient-to-r from-[#004645] to-[#009197] hover:from-[#006C51] hover:to-[#009197] text-white"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Enregistrement...
                          </>
                        ) : (
                          "Valider ma réponse"
                        )}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* Success Step */}
        {step === 7 && (
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
            />
            <div className="mt-6 text-center">
              <Button
                onClick={() => router.push("/")}
                variant="outline"
                size="lg"
                className="border-[#004645] text-[#004645] hover:bg-[#004645] hover:text-white"
              >
                Retour à l&apos;accueil
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
