import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface SummaryStepProps {
  attending: boolean | null;
  plusOnes: number;
  mealChoice: string;
  allergies: string;
  allowPlusOnes: boolean;
  rsvpDeadline?: string;
  submitting: boolean;
  onBack: () => void;
  onSubmit: () => void;
  texts: {
    submitButton: string;
  };
  getStepText: (stepType: string, textKey: string, defaultValue: string) => string;
}

export const SummaryStep = React.memo(({
  attending,
  plusOnes,
  mealChoice,
  allergies,
  allowPlusOnes,
  rsvpDeadline,
  submitting,
  onBack,
  onSubmit,
  texts,
  getStepText
}: SummaryStepProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-4"
    >
      <h3 className="text-lg font-semibold">
        {getStepText('summary', 'summaryTitle', "Récapitulatif")}
      </h3>
      <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
        <p>
          <strong>{getStepText('summary', 'summaryParticipation', "Participation")} :</strong>{" "}
          {attending ? getStepText('summary', 'summaryYes', "Oui ✓") : getStepText('summary', 'summaryNo', "Non")}
        </p>
        {attending && (
          <>
            {allowPlusOnes && (
              <p>
                <strong>{getStepText('summary', 'summaryPlusOnes', "Accompagnants")} :</strong> {plusOnes}
              </p>
            )}
            {mealChoice && (
              <p>
                <strong>{getStepText('summary', 'summaryMeal', "Repas")} :</strong> {mealChoice}
              </p>
            )}
            {allergies && (
              <p>
                <strong>{getStepText('summary', 'summaryAllergies', "Allergies")} :</strong> {allergies}
              </p>
            )}
          </>
        )}
      </div>
      {getStepText('summary', 'summaryIntro', '') ? (
        <p className="text-sm text-[#004645]/70">
          {getStepText('summary', 'summaryIntro', '')}
        </p>
      ) : (
        <p className="text-sm text-[#004645]/70">
          {(getStepText('summary', 'summaryModifyUntil', 'Vous pourrez modifier votre réponse jusqu\'au {deadline}'))
            .replace('{deadline}', rsvpDeadline ? new Date(rsvpDeadline).toLocaleDateString("fr-FR") : '')}
        </p>
      )}
      <div className="flex space-x-2">
        <Button
          variant="outline"
          onClick={onBack}
          className="border-[#004645] text-[#004645] hover:bg-[#004645] hover:text-white"
        >
          {getStepText('summary', 'backButton', "Retour")}
        </Button>
        <Button
          onClick={onSubmit}
          disabled={submitting}
          className="flex-1 bg-gradient-to-r from-[#004645] to-[#009197] hover:from-[#006C51] hover:to-[#009197] text-white"
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enregistrement...
            </>
          ) : (
            getStepText('summary', 'submitButton', texts.submitButton)
          )}
        </Button>
      </div>
    </motion.div>
  );
});

SummaryStep.displayName = 'SummaryStep';
