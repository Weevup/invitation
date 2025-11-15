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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Send, Loader2, CheckCircle, AlertCircle, Mail } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { createClientLogger, getUserErrorMessage } from "@/lib/client-logger";

const logger = createClientLogger({ component: 'SendInvitationsDialog' });

interface SendInvitationsDialogProps {
  eventId: string;
  totalGuests: number;
  pendingGuests: number;
}

interface EmailTemplate {
  id: string;
  name: string;
  slug: string;
  type: string;
  description?: string;
}

export function SendInvitationsDialog({
  eventId,
  totalGuests,
  pendingGuests,
}: SendInvitationsDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailType, setEmailType] = useState<"invitation" | "save-the-date" | "reminder">("invitation");
  const [templateId, setTemplateId] = useState<string>("");
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [results, setResults] = useState<{
    total: number;
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);

  // Fetch templates when dialog opens
  useEffect(() => {
    if (open && templates.length === 0) {
      fetchTemplates();
    }
  }, [open]);

  const fetchTemplates = async () => {
    setLoadingTemplates(true);
    try {
      const response = await fetch('/api/admin/templates');
      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
      }
    } catch (error) {
      logger.error(error, { action: 'fetchTemplates' });
      toast.error(getUserErrorMessage(error));
    } finally {
      setLoadingTemplates(false);
    }
  };

  const handleSend = async () => {
    setLoading(true);
    setResults(null);

    try {
      const response = await fetch(
        `/api/admin/events/${eventId}/send-emails`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: emailType,
            templateId: templateId || undefined,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setResults(data.results);
        if (data.results.success > 0) {
          toast.success(`${data.results.success} email(s) envoyé(s) avec succès`);
        }
      } else {
        setResults({
          total: 0,
          success: 0,
          failed: 1,
          errors: [data.error || "Erreur inconnue"],
        });
        toast.error(data.error || "Erreur lors de l'envoi");
      }
    } catch (error) {
      setResults({
        total: 0,
        success: 0,
        failed: 1,
        errors: ["Erreur de connexion"],
      });
      toast.error("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setResults(null);
    setEmailType("invitation");
    setTemplateId("");
  };

  const getTargetCount = () => {
    return emailType === "reminder" ? pendingGuests : totalGuests;
  };

  const getFilteredTemplates = () => {
    if (emailType === "save-the-date") {
      return templates.filter(t => t.type === "SAVE_THE_DATE");
    } else if (emailType === "invitation") {
      return templates.filter(t => t.type === "INVITE");
    } else if (emailType === "reminder") {
      return templates.filter(t => t.type === "REMINDER");
    }
    return templates;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Send className="h-4 w-4 mr-2" />
          Envoyer les invitations
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Envoyer des invitations</DialogTitle>
          <DialogDescription>
            Envoyez des emails à vos invités avec un template personnalisé
          </DialogDescription>
        </DialogHeader>

        {!results ? (
          <div className="space-y-4 py-4">
            {/* Type d'email */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Type d&apos;email</Label>
              <RadioGroup value={emailType} onValueChange={(v) => setEmailType(v as typeof emailType)}>
                <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-accent cursor-pointer">
                  <RadioGroupItem value="save-the-date" id="std" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="std" className="cursor-pointer font-medium text-sm">
                      Save the Date
                    </Label>
                    <p className="text-xs text-gray-600 mt-0.5">
                      Annonce préliminaire de l&apos;événement
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-accent cursor-pointer">
                  <RadioGroupItem value="invitation" id="invite" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="invite" className="cursor-pointer font-medium text-sm">
                      Invitation officielle
                    </Label>
                    <p className="text-xs text-gray-600 mt-0.5">
                      Invitation complète avec RSVP ({totalGuests} personnes)
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-accent cursor-pointer">
                  <RadioGroupItem value="reminder" id="reminder" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="reminder" className="cursor-pointer font-medium text-sm">
                      Rappel
                    </Label>
                    <p className="text-xs text-gray-600 mt-0.5">
                      Pour les invités sans réponse ({pendingGuests} personnes)
                    </p>
                  </div>
                </div>
              </RadioGroup>
            </div>

            {/* Sélecteur de template */}
            <div className="space-y-2">
              <Label htmlFor="template" className="text-sm font-medium">
                Template email (optionnel)
              </Label>
              <Select value={templateId} onValueChange={setTemplateId}>
                <SelectTrigger id="template">
                  <SelectValue placeholder={
                    loadingTemplates
                      ? "Chargement..."
                      : "Template par défaut (hardcodé)"
                  } />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span>Template par défaut (hardcodé)</span>
                    </div>
                  </SelectItem>
                  {getFilteredTemplates().map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{template.name}</span>
                        {template.description && (
                          <span className="text-xs text-gray-500">{template.description}</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                {templateId
                  ? "Un template personnalisé sera utilisé"
                  : "Le template codé en dur dans l'application sera utilisé"}
              </p>
            </div>

            {/* Info box */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-sm">
              <p className="text-blue-800">
                <strong>📧 {getTargetCount()} email(s)</strong> seront envoyés.
              </p>
              {emailType === "invitation" && (
                <p className="text-blue-700 mt-1 text-xs">
                  Note : Les invités qui ont déjà reçu une invitation recevront
                  à nouveau l&apos;email.
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            {results.success > 0 && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-800">
                    {results.success} email(s) envoyé(s) avec succès
                  </p>
                </div>
              </div>
            )}

            {results.failed > 0 && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-800 mb-2">
                      {results.failed} erreur(s) :
                    </p>
                    <ul className="text-xs text-red-700 space-y-1 max-h-40 overflow-y-auto">
                      {results.errors.map((error, idx) => (
                        <li key={idx}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {results.success === 0 && results.failed === 0 && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-yellow-800">
                  Aucun email n&apos;a été envoyé. Vérifiez vos critères de
                  sélection.
                </p>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading}
          >
            {results ? "Fermer" : "Annuler"}
          </Button>
          {!results && (
            <Button onClick={handleSend} disabled={loading || getTargetCount() === 0}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Envoyer {getTargetCount()} email(s)
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
