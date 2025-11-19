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
import { AlertTriangle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { createClientLogger, getUserErrorMessage } from "@/lib/client-logger";

const logger = createClientLogger({ component: 'DeleteGuestDialog' });

interface Guest {
  id: string
  firstName: string
  lastName: string
  email: string
  company?: string
  rsvp?: {
    attending?: boolean
  }
}

interface DeleteGuestDialogProps {
  eventId: string;
  guest: Guest;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGuestDeleted: () => void;
}

export function DeleteGuestDialog({ eventId, guest, open, onOpenChange, onGuestDeleted }: DeleteGuestDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);

    try {
      const response = await fetch(`/api/admin/events/${eventId}/guests/${guest.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        const fullName = guest.lastName ? `${guest.firstName} ${guest.lastName}` : guest.firstName;
        toast.success(`${fullName} a été supprimé(e)`);
        onOpenChange(false);
        onGuestDeleted();
      } else {
        const data = await response.json();
        toast.error(data.error || "Erreur lors de la suppression");
      }
    } catch (error) {
      logger.error(error, { action: 'deleteGuest', metadata: { eventId, guestId: guest.id } });
      toast.error(getUserErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const hasRsvp = guest.rsvp?.attending !== undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 rounded-full">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <DialogTitle className="text-xl">Supprimer cet invité ?</DialogTitle>
              <DialogDescription>
                Cette action est irréversible
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Guest Info */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="font-semibold text-lg text-gray-900">
              {guest.firstName} {guest.lastName}
            </p>
            <p className="text-sm text-gray-600">{guest.email}</p>
            {guest.company && (
              <p className="text-sm text-gray-600">{guest.company}</p>
            )}
          </div>

          {/* Warning Message */}
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-900">
              Les éléments suivants seront supprimés :
            </p>
            <ul className="text-sm text-gray-700 space-y-1 ml-4">
              <li className="flex items-center gap-2">
                <span className="text-red-500">•</span>
                Fiche invité et toutes les informations personnelles
              </li>
              {hasRsvp && (
                <li className="flex items-center gap-2">
                  <span className="text-red-500">•</span>
                  Réponse RSVP ({guest.rsvp?.attending ? "Participe" : "Ne participe pas"})
                </li>
              )}
              <li className="flex items-center gap-2">
                <span className="text-red-500">•</span>
                Historique d&apos;envoi d&apos;emails et tracking
              </li>
              <li className="flex items-center gap-2">
                <span className="text-red-500">•</span>
                Check-in et accès à l&apos;événement
              </li>
              <li className="flex items-center gap-2">
                <span className="text-red-500">•</span>
                Badges et documents associés
              </li>
            </ul>
          </div>

          {/* Final Warning */}
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800 font-medium">
              ⚠️ Cette action ne peut pas être annulée. L&apos;invité ne pourra plus accéder à son invitation.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Annuler
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? (
              "Suppression..."
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer définitivement
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
