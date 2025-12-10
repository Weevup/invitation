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
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Send,
  Loader2,
  CheckCircle,
  AlertCircle,
  QrCode,
  Users,
  Mail
} from "lucide-react";
import { toast } from "sonner";
import { createClientLogger, getUserErrorMessage } from "@/lib/client-logger";

const logger = createClientLogger({ component: 'SendConvocationsDialog' });

interface Guest {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string;
  company: string | null;
  rsvp: {
    attending: boolean;
    respondedAt?: string;
  } | null;
  lastEmailAt?: string | null;
}

interface SendConvocationsDialogProps {
  eventId: string;
  confirmedGuests: Guest[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: () => void;
}

export function SendConvocationsDialog({
  eventId,
  confirmedGuests,
  open,
  onOpenChange,
  onComplete,
}: SendConvocationsDialogProps) {
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [results, setResults] = useState<{
    sent: number;
    failed: number;
    errors: string[];
  } | null>(null);

  // Initialize with all guests selected when dialog opens
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setSelectedIds(confirmedGuests.map(g => g.id));
      setResults(null);
    }
    onOpenChange(isOpen);
  };

  const toggleGuest = (guestId: string) => {
    setSelectedIds(prev =>
      prev.includes(guestId)
        ? prev.filter(id => id !== guestId)
        : [...prev, guestId]
    );
  };

  const toggleAll = () => {
    if (selectedIds.length === confirmedGuests.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(confirmedGuests.map(g => g.id));
    }
  };

  const handleSend = async () => {
    if (selectedIds.length === 0) {
      toast.error("Veuillez selectionner au moins un invite");
      return;
    }

    setLoading(true);
    setResults(null);

    try {
      const response = await fetch(
        `/api/admin/events/${eventId}/guests/send-final-invites`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            guestIds: selectedIds,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setResults({
          sent: data.sent,
          failed: data.failed,
          errors: data.errors || [],
        });
        if (data.sent > 0) {
          toast.success(`${data.sent} convocation(s) envoyee(s) avec succes`);
          if (onComplete) {
            onComplete();
          }
        }
      } else {
        setResults({
          sent: 0,
          failed: 1,
          errors: [data.error || "Erreur inconnue"],
        });
        toast.error(data.error || "Erreur lors de l'envoi");
      }
    } catch (error) {
      logger.error(error, { action: 'sendConvocations' });
      setResults({
        sent: 0,
        failed: 1,
        errors: [getUserErrorMessage(error)],
      });
      toast.error("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setResults(null);
    setSelectedIds([]);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-[#009197]" />
            Envoyer les convocations avec QR Code
          </DialogTitle>
          <DialogDescription>
            Envoyez les convocations finales aux invites confirmes avec leur QR code d&apos;acces pour le check-in
          </DialogDescription>
        </DialogHeader>

        {!results ? (
          <div className="space-y-4 py-4">
            {/* Info box */}
            <div className="bg-[#9CD9F6]/20 border border-[#9CD9F6] rounded-md p-3">
              <div className="flex items-start gap-2">
                <Mail className="h-5 w-5 text-[#009197] mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-[#004645]">
                    Convocation officielle avec QR Code
                  </p>
                  <p className="text-[#004645]/70 mt-1">
                    Chaque invite recevra un email avec les informations de l&apos;evenement
                    et son QR code personnel a presenter a l&apos;entree.
                  </p>
                </div>
              </div>
            </div>

            {/* Selection header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="select-all"
                  checked={selectedIds.length === confirmedGuests.length && confirmedGuests.length > 0}
                  onCheckedChange={toggleAll}
                />
                <label
                  htmlFor="select-all"
                  className="text-sm font-medium cursor-pointer"
                >
                  Tout selectionner
                </label>
              </div>
              <Badge variant="outline" className="border-[#009197] text-[#009197]">
                <Users className="h-3 w-3 mr-1" />
                {selectedIds.length} / {confirmedGuests.length} selectionne(s)
              </Badge>
            </div>

            {/* Guest list */}
            {confirmedGuests.length === 0 ? (
              <div className="text-center py-8 text-[#004645]/70">
                <CheckCircle className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>Aucun invite confirme pour le moment</p>
              </div>
            ) : (
              <ScrollArea className="h-[300px] border rounded-lg">
                <div className="divide-y">
                  {confirmedGuests.map((guest) => (
                    <div
                      key={guest.id}
                      className={`flex items-center gap-3 p-3 hover:bg-[#9CD9F6]/10 transition-colors cursor-pointer ${
                        selectedIds.includes(guest.id) ? 'bg-[#9CD9F6]/5' : ''
                      }`}
                      onClick={() => toggleGuest(guest.id)}
                    >
                      <Checkbox
                        checked={selectedIds.includes(guest.id)}
                        onCheckedChange={() => toggleGuest(guest.id)}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-[#004645] truncate">
                          {guest.firstName} {guest.lastName}
                        </p>
                        <p className="text-sm text-[#004645]/70 truncate">
                          {guest.email}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {guest.lastEmailAt && (
                          <Badge variant="outline" className="text-xs">
                            Deja envoye
                          </Badge>
                        )}
                        <Badge variant="outline" className="border-green-600 text-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Confirme
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}

            {/* Warning if some already received */}
            {confirmedGuests.some(g => g.lastEmailAt) && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 text-sm">
                <p className="text-yellow-800">
                  <strong>Note :</strong> Certains invites ont deja recu un email recemment.
                  Ils recevront tout de meme la convocation si selectionnes.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4 py-4">
            {results.sent > 0 && (
              <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-md">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <div>
                  <p className="font-medium text-green-800">
                    {results.sent} convocation(s) envoyee(s) avec succes
                  </p>
                  <p className="text-sm text-green-700 mt-1">
                    Les invites ont recu leur QR code par email.
                  </p>
                </div>
              </div>
            )}

            {results.failed > 0 && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-6 w-6 text-red-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-800 mb-2">
                      {results.failed} erreur(s) :
                    </p>
                    <ul className="text-sm text-red-700 space-y-1 max-h-40 overflow-y-auto">
                      {results.errors.map((error, idx) => (
                        <li key={idx}>- {error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {results.sent === 0 && results.failed === 0 && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-yellow-800">
                  Aucune convocation n&apos;a ete envoyee.
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
            <Button
              onClick={handleSend}
              disabled={loading || selectedIds.length === 0}
              className="bg-gradient-to-r from-[#004645] to-[#009197] hover:from-[#006C51] hover:to-[#009197]"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Envoyer {selectedIds.length} convocation(s)
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
