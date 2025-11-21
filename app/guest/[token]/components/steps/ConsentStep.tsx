import React from 'react';
import { motion } from 'framer-motion';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface ConsentStepProps {
  consentPhotos: boolean;
  enablePhotoConsent: boolean;
  onConsentChange: (value: boolean) => void;
  onBack: () => void;
  onContinue: () => void;
  texts: {
    continueButton: string;
    previousButton: string;
  };
  getStepText: (stepType: string, textKey: string, defaultValue: string) => string;
}

export const ConsentStep = React.memo(({
  consentPhotos,
  enablePhotoConsent,
  onConsentChange,
  onBack,
  onContinue,
  texts,
  getStepText
}: ConsentStepProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-4"
    >
      <h3 className="text-lg font-semibold">Consentements</h3>
      {enablePhotoConsent && (
        <div className="flex items-start space-x-2">
          <input
            type="checkbox"
            id="photos"
            checked={consentPhotos}
            onChange={(e) => onConsentChange(e.target.checked)}
            className="mt-1"
          />
          <Label htmlFor="photos" className="cursor-pointer">
            {getStepText('consent', 'consentLabel', "J'autorise la prise et l'utilisation de photographies durant l'événement à des fins de communication")}
          </Label>
        </div>
      )}
      <div className="flex space-x-2">
        <Button
          variant="outline"
          onClick={onBack}
          className="border-[#004645] text-[#004645] hover:bg-[#004645] hover:text-white"
        >
          {getStepText('consent', 'backButton', texts.previousButton)}
        </Button>
        <Button
          onClick={onContinue}
          className="flex-1 bg-gradient-to-r from-[#004645] to-[#009197] hover:from-[#006C51] hover:to-[#009197] text-white"
        >
          {getStepText('consent', 'continueButton', texts.continueButton)}
        </Button>
      </div>
    </motion.div>
  );
});

ConsentStep.displayName = 'ConsentStep';
