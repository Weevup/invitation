import React from 'react';
import { motion } from 'framer-motion';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface PracticalStepProps {
  accessibilityNotes: string;
  transportNeeds: string;
  lodgingNeeds: string;
  enableAccessibility: boolean;
  enableTransport: boolean;
  enableLodging: boolean;
  onAccessibilityChange: (value: string) => void;
  onTransportChange: (value: string) => void;
  onLodgingChange: (value: string) => void;
  onBack: () => void;
  onContinue: () => void;
  texts: {
    continueButton: string;
    previousButton: string;
  };
  getStepText: (stepType: string, textKey: string, defaultValue: string) => string;
}

export const PracticalStep = React.memo(({
  accessibilityNotes,
  transportNeeds,
  lodgingNeeds,
  enableAccessibility,
  enableTransport,
  enableLodging,
  onAccessibilityChange,
  onTransportChange,
  onLodgingChange,
  onBack,
  onContinue,
  texts,
  getStepText
}: PracticalStepProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-4"
    >
      <h3 className="text-lg font-semibold">
        {getStepText('practical', 'practicalTitle', "Informations pratiques")}
      </h3>
      {enableAccessibility && (
        <div className="space-y-2">
          <Label htmlFor="accessibility">
            {getStepText('practical', 'accessibilityLabel', "Besoins d'accessibilité")}
          </Label>
          <Textarea
            id="accessibility"
            value={accessibilityNotes}
            onChange={(e) => onAccessibilityChange(e.target.value)}
            placeholder={getStepText('practical', 'accessibilityPlaceholder', "PMR, assistance particulière...")}
          />
        </div>
      )}
      {enableTransport && (
        <div className="space-y-2">
          <Label htmlFor="transport">
            {getStepText('practical', 'transportLabel', "Besoins de transport")}
          </Label>
          <Textarea
            id="transport"
            value={transportNeeds}
            onChange={(e) => onTransportChange(e.target.value)}
            placeholder={getStepText('practical', 'transportPlaceholder', "Navette, parking...")}
          />
        </div>
      )}
      {enableLodging && (
        <div className="space-y-2">
          <Label htmlFor="lodging">
            {getStepText('practical', 'lodgingLabel', "Besoins d'hébergement")}
          </Label>
          <Textarea
            id="lodging"
            value={lodgingNeeds}
            onChange={(e) => onLodgingChange(e.target.value)}
            placeholder={getStepText('practical', 'lodgingPlaceholder', "Hôtel, nuitée...")}
          />
        </div>
      )}
      <div className="flex space-x-2">
        <Button
          variant="outline"
          onClick={onBack}
          className="border-[#004645] text-[#004645] hover:bg-[#004645] hover:text-white"
        >
          {getStepText('practical', 'backButton', texts.previousButton)}
        </Button>
        <Button
          onClick={onContinue}
          className="flex-1 bg-gradient-to-r from-[#004645] to-[#009197] hover:from-[#006C51] hover:to-[#009197] text-white"
        >
          {getStepText('practical', 'continueButton', texts.continueButton)}
        </Button>
      </div>
    </motion.div>
  );
});

PracticalStep.displayName = 'PracticalStep';
