import React from 'react';
import { motion } from 'framer-motion';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PlusOnesStepProps {
  plusOnes: number;
  maxPlusOnes: number;
  onPlusOnesChange: (value: number) => void;
  onBack: () => void;
  onContinue: () => void;
  texts: {
    continueButton: string;
    previousButton: string;
  };
  getStepText: (stepType: string, textKey: string, defaultValue: string) => string;
}

export const PlusOnesStep = React.memo(({
  plusOnes,
  maxPlusOnes,
  onPlusOnesChange,
  onBack,
  onContinue,
  texts,
  getStepText
}: PlusOnesStepProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-4"
    >
      <Label htmlFor="plusOnes" className="text-lg">
        {getStepText('plus-ones', 'plusOnesLabel', `Nombre d'accompagnants (max ${maxPlusOnes})`)}
      </Label>
      <Select
        value={plusOnes.toString()}
        onValueChange={(value) => onPlusOnesChange(parseInt(value))}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Array.from({ length: maxPlusOnes + 1 }, (_, i) => (
            <SelectItem key={i} value={i.toString()}>
              {i === 0 ? getStepText('plus-ones', 'plusOnesNone', "Aucun") : i}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="flex space-x-2">
        <Button
          variant="outline"
          onClick={onBack}
          className="border-[#004645] text-[#004645] hover:bg-[#004645] hover:text-white"
        >
          {getStepText('plus-ones', 'backButton', texts.previousButton)}
        </Button>
        <Button
          onClick={onContinue}
          className="flex-1 bg-gradient-to-r from-[#004645] to-[#009197] hover:from-[#006C51] hover:to-[#009197] text-white"
        >
          {getStepText('plus-ones', 'continueButton', texts.continueButton)}
        </Button>
      </div>
    </motion.div>
  );
});

PlusOnesStep.displayName = 'PlusOnesStep';
