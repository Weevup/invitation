import React from 'react';
import { motion } from 'framer-motion';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface MealStepProps {
  mealChoice: string;
  allergies: string;
  mealOptions: string[];
  onMealChoiceChange: (value: string) => void;
  onAllergiesChange: (value: string) => void;
  onBack: () => void;
  onContinue: () => void;
  texts: {
    mealPlaceholder?: string;
    continueButton: string;
    previousButton: string;
  };
  getStepText: (stepType: string, textKey: string, defaultValue: string) => string;
}

export const MealStep = React.memo(({
  mealChoice,
  allergies,
  mealOptions,
  onMealChoiceChange,
  onAllergiesChange,
  onBack,
  onContinue,
  texts,
  getStepText
}: MealStepProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-4"
    >
      <Label htmlFor="meal" className="text-lg">
        {getStepText('meal', 'mealLabel', "Choix de repas")}
      </Label>
      <Select value={mealChoice} onValueChange={onMealChoiceChange}>
        <SelectTrigger>
          <SelectValue placeholder={getStepText('meal', 'mealPlaceholder', texts.mealPlaceholder || "Sélectionnez votre choix")} />
        </SelectTrigger>
        <SelectContent>
          {mealOptions.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="space-y-2">
        <Label htmlFor="allergies">
          {getStepText('meal', 'allergiesLabel', "Allergies ou régimes spécifiques")}
        </Label>
        <Textarea
          id="allergies"
          value={allergies}
          onChange={(e) => onAllergiesChange(e.target.value)}
          placeholder={getStepText('meal', 'allergiesPlaceholder', "Précisez vos éventuelles allergies...")}
        />
      </div>
      <div className="flex space-x-2">
        <Button
          variant="outline"
          onClick={onBack}
          className="border-[#004645] text-[#004645] hover:bg-[#004645] hover:text-white"
        >
          {getStepText('meal', 'backButton', texts.previousButton)}
        </Button>
        <Button
          onClick={onContinue}
          className="flex-1 bg-gradient-to-r from-[#004645] to-[#009197] hover:from-[#006C51] hover:to-[#009197] text-white"
        >
          {getStepText('meal', 'continueButton', texts.continueButton)}
        </Button>
      </div>
    </motion.div>
  );
});

MealStep.displayName = 'MealStep';
