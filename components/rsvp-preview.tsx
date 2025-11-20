"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { ChevronLeft, ChevronRight, Smartphone } from 'lucide-react'
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion'
import type { RsvpStep } from '@/app/admin/events/[id]/rsvp-steps/page'
import type { RsvpTheme } from './rsvp-theme-editor'

interface RsvpPreviewProps {
  steps: RsvpStep[]
  eventName: string
  theme?: RsvpTheme
}

const DEFAULT_THEME: RsvpTheme = {
  primaryColor: '#004645',
  secondaryColor: '#009197',
  backgroundColor: '#ffffff',
  textColor: '#333333',
  buttonRadius: '0.5rem',
  fontFamily: 'Inter',
  borderWidth: '1px',
  accentColor: '#9CD9F6'
}

export function RsvpPreview({ steps, eventName, theme = {} }: RsvpPreviewProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [attending, setAttending] = useState<boolean | null>(null)
  const [plusOnes, setPlusOnes] = useState(0)
  const [mealChoice, setMealChoice] = useState("")
  const [photoConsent, setPhotoConsent] = useState(false)

  // Merge theme with defaults
  const appliedTheme = { ...DEFAULT_THEME, ...theme }

  // Function to evaluate conditional logic
  const evaluateCondition = (step: RsvpStep): boolean => {
    if (!step.conditional?.enabled) return true

    const { field, operator, value } = step.conditional

    let fieldValue: any
    switch (field) {
      case 'attending':
        fieldValue = attending
        break
      case 'plusOnes':
        fieldValue = plusOnes
        break
      case 'mealChoice':
        fieldValue = mealChoice
        break
      default:
        return true
    }

    switch (operator) {
      case 'equals':
        return fieldValue === value
      case 'notEquals':
        return fieldValue !== value
      case 'greaterThan':
        return fieldValue > value
      case 'lessThan':
        return fieldValue < value
      default:
        return true
    }
  }

  // Get only enabled steps that meet their conditions
  const enabledSteps = steps
    .filter(s => s.enabled && evaluateCondition(s))
    .sort((a, b) => a.order - b.order)
  const currentStep = enabledSteps[currentStepIndex]
  const progress = enabledSteps.length > 0 ? ((currentStepIndex + 1) / enabledSteps.length) * 100 : 0

  // Helper to get custom text
  const getStepText = (stepType: string, textKey: string, defaultValue: string): string => {
    const step = steps.find(s => s.type === stepType && s.enabled)
    if (!step?.texts) return defaultValue
    return (step.texts as any)[textKey] || defaultValue
  }

  const nextStep = () => {
    if (currentStepIndex < enabledSteps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1)
    }
  }

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1)
    }
  }

  // Swipe gesture handling
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipeThreshold = 50
    if (info.offset.x > swipeThreshold) {
      // Swiped right -> go to previous step
      prevStep()
    } else if (info.offset.x < -swipeThreshold) {
      // Swiped left -> go to next step
      nextStep()
    }
  }

  // Reset to first step when steps change or conditions change
  useEffect(() => {
    if (enabledSteps.length > 0 && currentStepIndex >= enabledSteps.length) {
      setCurrentStepIndex(Math.max(0, enabledSteps.length - 1))
    }
  }, [enabledSteps.length, currentStepIndex])

  // Reset to first step when major changes occur
  useEffect(() => {
    if (enabledSteps.length > 0) {
      setCurrentStepIndex(0)
    }
  }, [steps.length, steps.map(s => s.enabled).join(',')])

  if (!currentStep) {
    return (
      <Card className="border-[#9CD9F6]/30">
        <CardContent className="p-12 text-center">
          <p className="text-[#004645]/70">Aucune étape activée</p>
          <p className="text-sm text-[#004645]/50 mt-2">Activez des étapes pour voir la prévisualisation</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4" style={{ fontFamily: appliedTheme.fontFamily }}>
      {/* Mobile Optimization Badge */}
      <div className="flex items-center justify-center gap-2 text-xs text-[#009197] bg-[#009197]/10 py-2 px-3 rounded-lg">
        <Smartphone className="h-4 w-4" />
        <span>Optimisé mobile - Swipez pour naviguer</span>
      </div>

      {/* Progress Bar */}
      <Card
        className="backdrop-blur sticky top-0 z-10"
        style={{
          backgroundColor: appliedTheme.backgroundColor,
          borderColor: appliedTheme.accentColor,
          borderWidth: appliedTheme.borderWidth,
          color: appliedTheme.textColor
        }}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium" style={{ color: appliedTheme.primaryColor }}>
              Étape {currentStepIndex + 1} sur {enabledSteps.length}
            </span>
            <span className="text-xs opacity-70">{currentStep.label}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      {/* Step Content with Swipe Gesture */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        key={currentStepIndex}
      >
        <Card
        className="backdrop-blur"
        style={{
          backgroundColor: appliedTheme.backgroundColor,
          borderColor: appliedTheme.accentColor,
          borderWidth: appliedTheme.borderWidth,
          color: appliedTheme.textColor
        }}
      >
        <CardHeader>
          <CardTitle
            className="text-2xl"
            style={{
              color: appliedTheme.primaryColor,
              fontFamily: appliedTheme.fontFamily
            }}
          >
            {currentStep.label}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Message Step */}
          {currentStep.type === 'message' && currentStep.content && (
            <div
              className="prose prose-sm max-w-none text-[#004645]"
              dangerouslySetInnerHTML={{ __html: currentStep.content }}
            />
          )}

          {/* Response Step */}
          {currentStep.type === 'response' && (
            <div className="space-y-4">
              <Label className="text-lg">
                {getStepText('response', 'responseQuestion', "Participez-vous à l'événement ?")}
              </Label>
              <RadioGroup
                value={attending === null ? "" : attending.toString()}
                onValueChange={(value) => setAttending(value === "true")}
              >
                <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-accent cursor-pointer">
                  <RadioGroupItem value="true" id="preview-yes" />
                  <Label htmlFor="preview-yes" className="cursor-pointer flex-1">
                    {getStepText('response', 'responseYes', "✓ J'accepte avec plaisir")}
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-accent cursor-pointer">
                  <RadioGroupItem value="false" id="preview-no" />
                  <Label htmlFor="preview-no" className="cursor-pointer flex-1">
                    {getStepText('response', 'responseNo', "✗ Je ne peux malheureusement pas venir")}
                  </Label>
                </div>
              </RadioGroup>
            </div>
          )}

          {/* Plus Ones Step */}
          {currentStep.type === 'plus-ones' && (
            <div className="space-y-4">
              <Label>
                {getStepText('plus-ones', 'plusOnesLabel', "Nombre d'accompagnants")}
              </Label>
              <Select value={plusOnes.toString()} onValueChange={(v) => setPlusOnes(parseInt(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">
                    {getStepText('plus-ones', 'plusOnesNone', "Aucun")}
                  </SelectItem>
                  <SelectItem value="1">1 accompagnant</SelectItem>
                  <SelectItem value="2">2 accompagnants</SelectItem>
                  <SelectItem value="3">3 accompagnants</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Meal Step */}
          {currentStep.type === 'meal' && (
            <div className="space-y-4">
              <div>
                <Label>
                  {getStepText('meal', 'mealLabel', "Choix de repas")}
                </Label>
                <Select value={mealChoice} onValueChange={setMealChoice}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un menu" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="viande">Menu Viande</SelectItem>
                    <SelectItem value="poisson">Menu Poisson</SelectItem>
                    <SelectItem value="végétarien">Menu Végétarien</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>
                  {getStepText('meal', 'allergiesLabel', "Allergies ou régimes spécifiques")}
                </Label>
                <Textarea
                  placeholder={getStepText('meal', 'allergiesPlaceholder', "Précisez vos éventuelles allergies...")}
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Practical Step */}
          {currentStep.type === 'practical' && (
            <div className="space-y-4">
              <div>
                <Label>
                  {getStepText('practical', 'accessibilityLabel', "Besoins d'accessibilité")}
                </Label>
                <Input
                  placeholder={getStepText('practical', 'accessibilityPlaceholder', "PMR, assistance...")}
                />
              </div>
              <div>
                <Label>
                  {getStepText('practical', 'transportLabel', "Besoins de transport")}
                </Label>
                <Input
                  placeholder={getStepText('practical', 'transportPlaceholder', "Navette, parking...")}
                />
              </div>
              <div>
                <Label>
                  {getStepText('practical', 'lodgingLabel', "Besoins d'hébergement")}
                </Label>
                <Input
                  placeholder={getStepText('practical', 'lodgingPlaceholder', "Hôtel, nuitée...")}
                />
              </div>
            </div>
          )}

          {/* Consent Step */}
          {currentStep.type === 'consent' && (
            <div className="flex items-start space-x-2 p-4 border rounded-lg">
              <Checkbox
                id="preview-consent"
                checked={photoConsent}
                onCheckedChange={(checked) => setPhotoConsent(checked as boolean)}
              />
              <Label htmlFor="preview-consent" className="cursor-pointer text-sm leading-relaxed">
                {getStepText('consent', 'consentLabel', "J'autorise la prise et l'utilisation de photographies lors de l'événement")}
              </Label>
            </div>
          )}

          {/* Custom Step */}
          {currentStep.type === 'custom' && currentStep.customField && (
            <div className="space-y-4">
              <Label className="flex items-center gap-2">
                {currentStep.customField.question}
                {currentStep.customField.required && (
                  <span className="text-[#FF4713]">*</span>
                )}
              </Label>
              <Textarea
                placeholder={currentStep.customField.placeholder}
                rows={4}
              />
            </div>
          )}

          {/* Summary Step */}
          {currentStep.type === 'summary' && (
            <div className="space-y-6">
              <p className="text-[#004645]/70">
                {getStepText('summary', 'summaryIntro', "Vous pourrez modifier votre réponse jusqu'au jour de l'événement.")}
              </p>
              <div className="space-y-4 p-6 bg-[#9CD9F6]/10 rounded-lg">
                <div className="flex justify-between items-start">
                  <span className="text-sm font-medium text-[#004645]">Participation</span>
                  <span className="text-sm text-[#004645]/70">
                    {attending === true ? "Oui" : attending === false ? "Non" : "-"}
                  </span>
                </div>
                {plusOnes > 0 && (
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-medium text-[#004645]">Accompagnants</span>
                    <span className="text-sm text-[#004645]/70">{plusOnes}</span>
                  </div>
                )}
                {mealChoice && (
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-medium text-[#004645]">Menu</span>
                    <span className="text-sm text-[#004645]/70">{mealChoice}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6 border-t" style={{ borderColor: appliedTheme.accentColor }}>
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStepIndex === 0}
              style={{
                borderColor: appliedTheme.secondaryColor,
                color: appliedTheme.secondaryColor,
                borderRadius: appliedTheme.buttonRadius
              }}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              {getStepText(currentStep.type, 'backButton', "Retour")}
            </Button>

            {currentStepIndex < enabledSteps.length - 1 ? (
              <Button
                onClick={nextStep}
                className="text-white transition-all hover:opacity-90"
                style={{
                  background: `linear-gradient(to right, ${appliedTheme.primaryColor}, ${appliedTheme.secondaryColor})`,
                  borderRadius: appliedTheme.buttonRadius
                }}
              >
                {getStepText(currentStep.type, 'continueButton', "Continuer")}
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                className="text-white transition-all hover:opacity-90"
                style={{
                  background: `linear-gradient(to right, ${appliedTheme.primaryColor}, ${appliedTheme.secondaryColor})`,
                  borderRadius: appliedTheme.buttonRadius
                }}
              >
                {getStepText('summary', 'submitButton', "Valider ma réponse")}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
      </motion.div>

      {/* Preview Notice */}
      <div className="text-center text-xs text-[#004645]/50 italic">
        Prévisualisation en temps réel - Les modifications sont visibles instantanément
      </div>
    </div>
  )
}
