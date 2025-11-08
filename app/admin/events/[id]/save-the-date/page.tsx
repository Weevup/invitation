"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Calendar, MapPin, Sparkles, Eye, EyeOff, Save, Upload,
  ArrowLeft, Bell, Clock, Info
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";

export default function SaveTheDateBuilderPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const eventId = params.id as string;

  const [previewMode, setPreviewMode] = useState(false);
  const [loading, setLoading] = useState(false);

  const [design, setDesign] = useState({
    // Contenu
    eventName: "Votre événement",
    tagline: "Réservez la date !",
    dateAnnouncement: "12 Mars 2026",
    locationHint: "Paris, France",
    teaserMessage: "Les détails suivront prochainement. En attendant, bloquez cette date dans votre agenda !",

    // Visuel
    headerImage: "",
    logoImage: "",
    backgroundColor: "#9CD9F6",
    primaryColor: "#004645",
    secondaryColor: "#FF4713",
    accentColor: "#009197",

    // Call to Action
    ctaText: "Je bloque la date",
    ctaAction: "interest", // interest, reminder, none
    showInterestForm: true,

    // Options
    showCountdown: true,
    showSocialShare: false,
    animationStyle: "subtle", // subtle, none, festive

    // Message personnalisé
    footerMessage: "Invitation officielle à venir",
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/events/${eventId}/save-the-date`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(design),
      });

      if (response.ok) {
        toast({
          title: "Enregistré !",
          description: "Votre Save the Date a été sauvegardé avec succès",
        });
      } else {
        throw new Error("Erreur lors de l'enregistrement");
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d&apos;enregistrer le Save the Date",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#9CD9F6] via-white to-[#9CD9F6]">
      {/* Header */}
      <header className="border-b border-[#9CD9F6]/30 bg-white/80 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/admin/events/${eventId}`}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-[#004645]" style={{ fontFamily: "var(--font-abril)" }}>
                  Save the Date Builder
                </h1>
                <p className="text-sm text-[#004645]/70">
                  Créez votre pré-invitation pour annoncer la date de votre événement
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setPreviewMode(!previewMode)}
                className="border-[#004645] text-[#004645]"
              >
                {previewMode ? (
                  <>
                    <EyeOff className="h-4 w-4 mr-2" />
                    Édition
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Aperçu
                  </>
                )}
              </Button>
              <Button
                onClick={handleSave}
                disabled={loading}
                className="bg-gradient-to-r from-[#004645] to-[#009197] hover:from-[#006C51] hover:to-[#009197] text-white"
              >
                <Save className="h-4 w-4 mr-2" />
                Enregistrer
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Info Card */}
        <Card className="mb-6 border-[#FF4713]/30 bg-gradient-to-r from-[#FF4713]/5 to-transparent">
          <CardHeader>
            <div className="flex items-start gap-3">
              <Bell className="h-6 w-6 text-[#FF4713] mt-1" />
              <div>
                <CardTitle className="text-[#004645] mb-2">Qu&apos;est-ce qu&apos;un Save the Date ?</CardTitle>
                <CardDescription className="text-[#004645]/70">
                  Le Save the Date est une <strong>pré-invitation</strong> envoyée 2-3 mois avant l&apos;événement.
                  Il sert à <strong>bloquer la date</strong> dans les agendas sans donner tous les détails.
                  C&apos;est l&apos;étape 1 du cycle : Save the Date → Invitation → RSVP.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Configuration Panel */}
          {!previewMode && (
            <div>
              <Tabs defaultValue="content" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="content">Contenu</TabsTrigger>
                  <TabsTrigger value="design">Design</TabsTrigger>
                  <TabsTrigger value="cta">CTA</TabsTrigger>
                  <TabsTrigger value="options">Options</TabsTrigger>
                </TabsList>

                {/* Contenu Tab */}
                <TabsContent value="content" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-[#004645]">Contenu du message</CardTitle>
                      <CardDescription>
                        Informations principales du Save the Date
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="eventName">Nom de l&apos;événement</Label>
                        <Input
                          id="eventName"
                          value={design.eventName}
                          onChange={(e) => setDesign({ ...design, eventName: e.target.value })}
                          placeholder="Sommet de l'Innovation 2026"
                        />
                      </div>

                      <div>
                        <Label htmlFor="tagline">Accroche</Label>
                        <Input
                          id="tagline"
                          value={design.tagline}
                          onChange={(e) => setDesign({ ...design, tagline: e.target.value })}
                          placeholder="Réservez la date !"
                        />
                      </div>

                      <div>
                        <Label htmlFor="dateAnnouncement">Annonce de la date</Label>
                        <Input
                          id="dateAnnouncement"
                          value={design.dateAnnouncement}
                          onChange={(e) => setDesign({ ...design, dateAnnouncement: e.target.value })}
                          placeholder="12 Mars 2026"
                        />
                        <p className="text-xs text-[#004645]/60 mt-1">
                          Format libre (ex: "Printemps 2026", "12-13 Mars 2026")
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="locationHint">Indice de lieu</Label>
                        <Input
                          id="locationHint"
                          value={design.locationHint}
                          onChange={(e) => setDesign({ ...design, locationHint: e.target.value })}
                          placeholder="Paris, France"
                        />
                        <p className="text-xs text-[#004645]/60 mt-1">
                          Ville ou région (sans adresse précise)
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="teaserMessage">Message teaser</Label>
                        <Textarea
                          id="teaserMessage"
                          value={design.teaserMessage}
                          onChange={(e) => setDesign({ ...design, teaserMessage: e.target.value })}
                          placeholder="Les détails suivront prochainement..."
                          rows={4}
                        />
                      </div>

                      <div>
                        <Label htmlFor="footerMessage">Message de pied de page</Label>
                        <Input
                          id="footerMessage"
                          value={design.footerMessage}
                          onChange={(e) => setDesign({ ...design, footerMessage: e.target.value })}
                          placeholder="Invitation officielle à venir"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Design Tab */}
                <TabsContent value="design" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-[#004645]">Apparence visuelle</CardTitle>
                      <CardDescription>
                        Personnalisez les couleurs et images
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Image d&apos;en-tête</Label>
                        <div className="flex gap-2">
                          <Input
                            value={design.headerImage}
                            onChange={(e) => setDesign({ ...design, headerImage: e.target.value })}
                            placeholder="URL de l'image"
                          />
                          <Button variant="outline" size="icon">
                            <Upload className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div>
                        <Label>Logo</Label>
                        <div className="flex gap-2">
                          <Input
                            value={design.logoImage}
                            onChange={(e) => setDesign({ ...design, logoImage: e.target.value })}
                            placeholder="URL du logo"
                          />
                          <Button variant="outline" size="icon">
                            <Upload className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="backgroundColor">Couleur de fond</Label>
                          <div className="flex gap-2">
                            <Input
                              id="backgroundColor"
                              type="color"
                              value={design.backgroundColor}
                              onChange={(e) => setDesign({ ...design, backgroundColor: e.target.value })}
                              className="h-10 w-20"
                            />
                            <Input
                              value={design.backgroundColor}
                              onChange={(e) => setDesign({ ...design, backgroundColor: e.target.value })}
                              placeholder="#9CD9F6"
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="primaryColor">Couleur principale</Label>
                          <div className="flex gap-2">
                            <Input
                              id="primaryColor"
                              type="color"
                              value={design.primaryColor}
                              onChange={(e) => setDesign({ ...design, primaryColor: e.target.value })}
                              className="h-10 w-20"
                            />
                            <Input
                              value={design.primaryColor}
                              onChange={(e) => setDesign({ ...design, primaryColor: e.target.value })}
                              placeholder="#004645"
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="secondaryColor">Couleur secondaire</Label>
                          <div className="flex gap-2">
                            <Input
                              id="secondaryColor"
                              type="color"
                              value={design.secondaryColor}
                              onChange={(e) => setDesign({ ...design, secondaryColor: e.target.value })}
                              className="h-10 w-20"
                            />
                            <Input
                              value={design.secondaryColor}
                              onChange={(e) => setDesign({ ...design, secondaryColor: e.target.value })}
                              placeholder="#FF4713"
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="accentColor">Couleur d&apos;accent</Label>
                          <div className="flex gap-2">
                            <Input
                              id="accentColor"
                              type="color"
                              value={design.accentColor}
                              onChange={(e) => setDesign({ ...design, accentColor: e.target.value })}
                              className="h-10 w-20"
                            />
                            <Input
                              value={design.accentColor}
                              onChange={(e) => setDesign({ ...design, accentColor: e.target.value })}
                              placeholder="#009197"
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* CTA Tab */}
                <TabsContent value="cta" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-[#004645]">Call-to-Action</CardTitle>
                      <CardDescription>
                        Actions que vos invités peuvent effectuer
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="ctaText">Texte du bouton</Label>
                        <Input
                          id="ctaText"
                          value={design.ctaText}
                          onChange={(e) => setDesign({ ...design, ctaText: e.target.value })}
                          placeholder="Je bloque la date"
                        />
                      </div>

                      <div>
                        <Label htmlFor="ctaAction">Action du bouton</Label>
                        <select
                          id="ctaAction"
                          value={design.ctaAction}
                          onChange={(e) => setDesign({ ...design, ctaAction: e.target.value })}
                          className="w-full h-10 px-3 rounded-md border border-input bg-background"
                        >
                          <option value="interest">Manifester son intérêt</option>
                          <option value="reminder">Recevoir un rappel</option>
                          <option value="none">Aucune action (info seulement)</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-[#9CD9F6]/10 rounded-lg">
                        <div>
                          <Label htmlFor="showInterestForm">Formulaire d&apos;intérêt</Label>
                          <p className="text-xs text-[#004645]/60">
                            Permet de collecter les personnes intéressées
                          </p>
                        </div>
                        <Switch
                          id="showInterestForm"
                          checked={design.showInterestForm}
                          onCheckedChange={(checked) => setDesign({ ...design, showInterestForm: checked })}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Options Tab */}
                <TabsContent value="options" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-[#004645]">Options avancées</CardTitle>
                      <CardDescription>
                        Fonctionnalités supplémentaires
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-[#9CD9F6]/10 rounded-lg">
                        <div>
                          <Label htmlFor="showCountdown">Compte à rebours</Label>
                          <p className="text-xs text-[#004645]/60">
                            Affiche le temps restant jusqu&apos;à l&apos;événement
                          </p>
                        </div>
                        <Switch
                          id="showCountdown"
                          checked={design.showCountdown}
                          onCheckedChange={(checked) => setDesign({ ...design, showCountdown: checked })}
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 bg-[#9CD9F6]/10 rounded-lg">
                        <div>
                          <Label htmlFor="showSocialShare">Partage sur réseaux sociaux</Label>
                          <p className="text-xs text-[#004645]/60">
                            Boutons de partage LinkedIn, Twitter, Facebook
                          </p>
                        </div>
                        <Switch
                          id="showSocialShare"
                          checked={design.showSocialShare}
                          onCheckedChange={(checked) => setDesign({ ...design, showSocialShare: checked })}
                        />
                      </div>

                      <div>
                        <Label htmlFor="animationStyle">Style d&apos;animation</Label>
                        <select
                          id="animationStyle"
                          value={design.animationStyle}
                          onChange={(e) => setDesign({ ...design, animationStyle: e.target.value })}
                          className="w-full h-10 px-3 rounded-md border border-input bg-background"
                        >
                          <option value="subtle">Subtil</option>
                          <option value="none">Aucune</option>
                          <option value="festive">Festif</option>
                        </select>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}

          {/* Preview Panel */}
          <div className={previewMode ? "lg:col-span-2" : ""}>
            <Card className="sticky top-24">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[#004645]">Aperçu</CardTitle>
                  <Badge variant="secondary">
                    <Eye className="h-3 w-3 mr-1" />
                    Prévisualisation
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {/* Preview of Save the Date */}
                <div
                  className="rounded-lg overflow-hidden shadow-2xl"
                  style={{ backgroundColor: design.backgroundColor }}
                >
                  {/* Header Image */}
                  {design.headerImage && (
                    <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                      <img src={design.headerImage} alt="Header" className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className="p-8 text-center">
                    {/* Logo */}
                    {design.logoImage && (
                      <div className="mb-6">
                        <img src={design.logoImage} alt="Logo" className="h-16 mx-auto" />
                      </div>
                    )}

                    {/* Tagline */}
                    <p
                      className="text-sm uppercase tracking-widest mb-4"
                      style={{ color: design.accentColor }}
                    >
                      {design.tagline}
                    </p>

                    {/* Event Name */}
                    <h1
                      className="text-4xl font-bold mb-6"
                      style={{ fontFamily: "var(--font-abril)", color: design.primaryColor }}
                    >
                      {design.eventName}
                    </h1>

                    {/* Date & Location */}
                    <div className="flex items-center justify-center gap-6 mb-6">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" style={{ color: design.secondaryColor }} />
                        <span className="font-semibold" style={{ color: design.primaryColor }}>
                          {design.dateAnnouncement}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-5 w-5" style={{ color: design.secondaryColor }} />
                        <span className="font-semibold" style={{ color: design.primaryColor }}>
                          {design.locationHint}
                        </span>
                      </div>
                    </div>

                    {/* Countdown */}
                    {design.showCountdown && (
                      <div className="mb-6 flex justify-center gap-4">
                        {[
                          { value: "45", label: "Jours" },
                          { value: "12", label: "Heures" },
                          { value: "34", label: "Minutes" },
                        ].map((item) => (
                          <div key={item.label} className="text-center">
                            <div
                              className="text-3xl font-bold"
                              style={{ fontFamily: "var(--font-abril)", color: design.secondaryColor }}
                            >
                              {item.value}
                            </div>
                            <div className="text-xs uppercase" style={{ color: design.primaryColor }}>
                              {item.label}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Teaser Message */}
                    <p className="mb-8 max-w-md mx-auto" style={{ color: design.primaryColor }}>
                      {design.teaserMessage}
                    </p>

                    {/* CTA Button */}
                    {design.ctaAction !== "none" && (
                      <Button
                        size="lg"
                        className="mb-6"
                        style={{
                          backgroundColor: design.secondaryColor,
                          color: "white",
                        }}
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        {design.ctaText}
                      </Button>
                    )}

                    {/* Footer Message */}
                    <p
                      className="text-sm italic"
                      style={{ color: design.primaryColor, opacity: 0.7 }}
                    >
                      {design.footerMessage}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
