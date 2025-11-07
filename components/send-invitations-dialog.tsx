"use client";

import { useState } from "react";
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
import { Send, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface SendInvitationsDialogProps {
  eventId: string;
  totalGuests: number;
  pendingGuests: number;
}

export function SendInvitationsDialog({
  eventId,
  totalGuests,
  pendingGuests,
}: SendInvitationsDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailType, setEmailType] = useState<"INVITE" | "REMINDER">("INVITE");
  const [results, setResults] = useState<{
    total: number;
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);

  const handleSend = async () => {
    setLoading(true);
    setResults(null);

    try {
      const response = await fetch(
        `/api/admin/events/${eventId}/send-invitations`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: emailType,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setResults(data.results);
      } else {
        setResults({
          total: 0,
          success: 0,
          failed: 1,
          errors: [data.error || "Erreur inconnue"],
        });
      }
    } catch (error) {
      setResults({
        total: 0,
        success: 0,
        failed: 1,
        errors: ["Erreur de connexion"],
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setResults(null);
    setEmailType("INVITE");
  };

  const getTargetCount = () => {
    return emailType === "REMINDER" ? pendingGuests : totalGuests;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        <Button>
          <Send className="h-4 w-4 mr-2" />
          Envoyer les invitations
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Envoyer des invitations</DialogTitle>
          <DialogDescription>
            Envoyez des emails d&apos;invitation ou de rappel à vos invités
          </DialogDescription>
        </DialogHeader>

        {!results ? (
          <div className="space-y-4 py-4">
            <RadioGroup value={emailType} onValueChange={(v) => setEmailType(v as "INVITE" | "REMINDER")}>
              <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent cursor-pointer">
                <RadioGroupItem value="INVITE" id="invite" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="invite" className="cursor-pointer font-medium">
                    Invitation initiale
                  </Label>
                  <p className="text-sm text-gray-600 mt-1">
                    Envoyer l&apos;invitation à tous les invités ({totalGuests}{" "}
                    personnes)
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent cursor-pointer">
                <RadioGroupItem value="REMINDER" id="reminder" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="reminder" className="cursor-pointer font-medium">
                    Rappel
                  </Label>
                  <p className="text-sm text-gray-600 mt-1">
                    Envoyer un rappel uniquement aux invités qui n&apos;ont pas encore
                    répondu ({pendingGuests} personnes)
                  </p>
                </div>
              </div>
            </RadioGroup>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-sm">
              <p className="text-blue-800">
                <strong>📧 {getTargetCount()} email(s)</strong> seront envoyés.
              </p>
              {emailType === "INVITE" && (
                <p className="text-blue-700 mt-1">
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
