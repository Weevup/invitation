"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Briefcase, Users, UserCog } from "lucide-react";
import { toast } from "sonner";
import { createClientLogger, getUserErrorMessage } from "@/lib/client-logger";

const logger = createClientLogger({ component: 'EditGuestDialog' });

interface Guest {
  id: string
  firstName: string
  lastName: string
  email: string
  company?: string
  tags: string[]
  jobTitle?: string
  department?: string
  companySize?: string
  industry?: string
  phoneNumber?: string
  phone?: string
  linkedinUrl?: string
  dietaryReqs?: string
  accessibility?: string
  adminNotes?: string
}

interface EditGuestDialogProps {
  eventId: string;
  guest: Guest;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGuestUpdated: () => void;
}

export function EditGuestDialog({ eventId, guest, open, onOpenChange, onGuestUpdated }: EditGuestDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    tags: "",
    // Professional information
    jobTitle: "",
    department: "",
    companySize: "",
    industry: "",
    linkedinUrl: "",
    phoneNumber: "",
    phone: "",
    // Event-specific needs
    dietaryReqs: "",
    accessibility: "",
    adminNotes: "",
  });

  // Initialize form data when guest changes
  useEffect(() => {
    if (guest) {
      setFormData({
        firstName: guest.firstName || "",
        lastName: guest.lastName || "",
        email: guest.email || "",
        company: guest.company || "",
        tags: guest.tags?.join(", ") || "",
        jobTitle: guest.jobTitle || "",
        department: guest.department || "",
        companySize: guest.companySize || "",
        industry: guest.industry || "",
        linkedinUrl: guest.linkedinUrl || "",
        phoneNumber: guest.phoneNumber || "",
        phone: guest.phone || "",
        dietaryReqs: guest.dietaryReqs || "",
        accessibility: guest.accessibility || "",
        adminNotes: guest.adminNotes || "",
      });
    }
  }, [guest]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/admin/events/${eventId}/guests/${guest.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Invité mis à jour avec succès");
        onOpenChange(false);
        onGuestUpdated();
      } else {
        setError(data.error || "Erreur lors de la modification de l'invité");
        toast.error(data.error || "Erreur lors de la modification");
      }
    } catch (error) {
      logger.error(error, { action: 'updateGuest', metadata: { eventId, guestId: guest.id } });
      const errorMessage = getUserErrorMessage(error);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Modifier l&apos;invité</DialogTitle>
            <DialogDescription>
              Modifiez les informations de {guest.firstName} {guest.lastName}
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="basic" className="mt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">
                <UserCog className="h-4 w-4 mr-2" />
                Informations de base
              </TabsTrigger>
              <TabsTrigger value="professional">
                <Briefcase className="h-4 w-4 mr-2" />
                Professionnel
              </TabsTrigger>
              <TabsTrigger value="needs">
                <Users className="h-4 w-4 mr-2" />
                Besoins
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: Informations de base */}
            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Prénom *</Label>
                  <Input
                    id="firstName"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="Sophie"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Nom *</Label>
                  <Input
                    id="lastName"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="Martin"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="sophie.martin@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Entreprise</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="Tech Solutions"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags (séparés par des virgules)</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="VIP, Presse, Sponsor"
                />
              </div>
            </TabsContent>

            {/* TAB 2: Informations professionnelles */}
            <TabsContent value="professional" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="jobTitle">Fonction / Poste</Label>
                  <Input
                    id="jobTitle"
                    value={formData.jobTitle}
                    onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                    placeholder="Directeur Marketing"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Département</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="Marketing & Communication"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companySize">Taille de l&apos;entreprise</Label>
                  <Select value={formData.companySize} onValueChange={(value) => setFormData({ ...formData, companySize: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Aucune</SelectItem>
                      <SelectItem value="TPE">TPE (1-10 employés)</SelectItem>
                      <SelectItem value="PME">PME (11-250 employés)</SelectItem>
                      <SelectItem value="ETI">ETI (251-5000 employés)</SelectItem>
                      <SelectItem value="GE">Grande Entreprise (5000+)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry">Secteur d&apos;activité</Label>
                  <Input
                    id="industry"
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    placeholder="Tech, Finance, Santé..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">
                  Téléphone mobile (pour SMS)
                  <span className="text-xs text-muted-foreground ml-2">Format international: +33...</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+33612345678"
                />
                <p className="text-xs text-muted-foreground">
                  Format requis pour SMS : +33612345678 (sans espaces)
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Téléphone fixe (optionnel)</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    placeholder="01 23 45 67 89"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedinUrl">Profil LinkedIn</Label>
                  <Input
                    id="linkedinUrl"
                    type="url"
                    value={formData.linkedinUrl}
                    onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>
              </div>
            </TabsContent>

            {/* TAB 3: Besoins événementiels */}
            <TabsContent value="needs" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="dietaryReqs">Restrictions alimentaires</Label>
                <Textarea
                  id="dietaryReqs"
                  value={formData.dietaryReqs}
                  onChange={(e) => setFormData({ ...formData, dietaryReqs: e.target.value })}
                  placeholder="Végétarien, sans gluten, allergies..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="accessibility">Besoins d&apos;accessibilité</Label>
                <Textarea
                  id="accessibility"
                  value={formData.accessibility}
                  onChange={(e) => setFormData({ ...formData, accessibility: e.target.value })}
                  placeholder="Fauteuil roulant, malvoyant, autres besoins..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="adminNotes">Notes privées (admin uniquement)</Label>
                <Textarea
                  id="adminNotes"
                  value={formData.adminNotes}
                  onChange={(e) => setFormData({ ...formData, adminNotes: e.target.value })}
                  placeholder="Notes internes, informations confidentielles..."
                  rows={3}
                />
              </div>
            </TabsContent>
          </Tabs>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm">
              {error}
            </div>
          )}

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Enregistrement..." : "Enregistrer les modifications"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
