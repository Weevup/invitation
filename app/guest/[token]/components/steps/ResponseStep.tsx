import React from 'react';
import { motion } from 'framer-motion';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface ResponseStepProps {
  attending: boolean | null;
  onAttendingChange: (value: boolean) => void;
  onContinue: () => void;
  texts: {
    responseQuestion: string;
    responseYes: string;
    responseNo: string;
    continueButton: string;
  };
  getStepText: (stepType: string, textKey: string, defaultValue: string) => string;
}

export const ResponseStep = React.memo(({
  attending,
  onAttendingChange,
  onContinue,
  texts,
  getStepText
}: ResponseStepProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-4"
    >
      <Label className="text-lg">
        {getStepText('response', 'responseQuestion', texts.responseQuestion)}
      </Label>
      <RadioGroup
        value={attending === null ? "" : attending.toString()}
        onValueChange={(value) => onAttendingChange(value === "true")}
        aria-label={texts.responseQuestion}
        aria-required="true"
      >
        <RadioOption
          value="true"
          id="yes"
          label={getStepText('response', 'responseYes', texts.responseYes)}
        />
        <RadioOption
          value="false"
          id="no"
          label={getStepText('response', 'responseNo', texts.responseNo)}
        />
      </RadioGroup>
      <Button
        onClick={onContinue}
        disabled={attending === null}
        className="w-full bg-gradient-to-r from-[#004645] to-[#009197] hover:from-[#006C51] hover:to-[#009197] text-white"
      >
        {getStepText('response', 'continueButton', texts.continueButton)}
      </Button>
    </motion.div>
  );
});

ResponseStep.displayName = 'ResponseStep';

// Reusable radio option component
const RadioOption = ({ value, id, label }: { value: string; id: string; label: string }) => (
  <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-accent cursor-pointer">
    <RadioGroupItem value={value} id={id} />
    <Label htmlFor={id} className="cursor-pointer flex-1">
      {label}
    </Label>
  </div>
);
