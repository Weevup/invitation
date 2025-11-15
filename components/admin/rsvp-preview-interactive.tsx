"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { RSVPProgress } from '@/components/rsvp-progress'
import { buildSteps, getNextStep, getPreviousStep, type StepConfig } from '@/lib/rsvp-steps'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Check, X } from 'lucide-react'

interface FormField {
  id: string
  type: 'text' | 'email' | 'phone' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'number'
  label: string
  placeholder?: string
  required: boolean
  options?: string[]
  description?: string
}

interface RSVPConfig {
  allowPlusOne: boolean
  maxPlusOnes: number
  collectDietaryRestrictions: boolean
  collectMealChoice: boolean
  mealOptions: string[]
  collectAccommodation: boolean
  confirmationMessage: string
  declineMessage: string
}

interface RSVPPreviewInteractiveProps {
  fields: FormField[]
  config: RSVPConfig
  eventName: string
}

export function RSVPPreviewInteractive({ fields, config, eventName }: RSVPPreviewInteractiveProps) {
  const [currentStepId, setCurrentStepId] = useState('response')
  const [steps, setSteps] = useState<StepConfig[]>([])

  // Form state
  const [attending, setAttending] = useState<boolean | null>(null)
  const [plusOnes, setPlusOnes] = useState(0)
  const [mealChoice, setMealChoice] = useState('')
  const [formValues, setFormValues] = useState<Record<string, string | string[]>>({})

  // Rebuild steps when attending changes
  useEffect(() => {
    const eventConfig = {
      allowPlusOnes: config.allowPlusOne,
      requireMeal: config.collectMealChoice,
      enableAccessibility: true,
      enableTransport: false,
      enableLodging: config.collectAccommodation,
      enablePhotoConsent: true,
    }
    const newSteps = buildSteps(eventConfig, attending)
    setSteps(newSteps)

    // Reset to response if declining
    if (attending === false && currentStepId !== 'response') {
      setCurrentStepId('summary')
    }
  }, [attending, config, currentStepId])

  const handleNext = () => {
    const next = getNextStep(currentStepId, steps)
    if (next) setCurrentStepId(next)
  }

  const handlePrevious = () => {
    const prev = getPreviousStep(currentStepId, steps)
    if (prev) setCurrentStepId(prev)
  }

  const canGoNext = () => {
    if (currentStepId === 'response') return attending !== null
    if (currentStepId === 'meal' && config.collectMealChoice && attending) return mealChoice !== ''
    return true
  }

  const renderStep = () => {
    switch (currentStepId) {
      case 'response':
        return (
          <motion.div
            key="response"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-2xl font-bold text-[#004645] mb-2">
                Serez-vous présent(e) ?
              </h3>
              <p className="text-[#004645]/70">
                Merci de nous confirmer votre participation à <strong>{eventName}</strong>
              </p>
            </div>

            <RadioGroup value={attending === null ? '' : attending ? 'yes' : 'no'} onValueChange={(val) => setAttending(val === 'yes')}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className={`cursor-pointer transition-all ${attending === true ? 'border-[#009197] border-2 bg-[#009197]/5' : 'border-[#9CD9F6]/30'}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="yes" id="yes" className="text-[#009197]" />
                      <Label htmlFor="yes" className="cursor-pointer flex items-center gap-2 text-lg">
                        <Check className="h-5 w-5 text-[#009197]" />
                        Oui, je serai présent(e)
                      </Label>
                    </div>
                  </CardContent>
                </Card>

                <Card className={`cursor-pointer transition-all ${attending === false ? 'border-[#FF4713] border-2 bg-[#FF4713]/5' : 'border-[#9CD9F6]/30'}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="no" id="no" className="text-[#FF4713]" />
                      <Label htmlFor="no" className="cursor-pointer flex items-center gap-2 text-lg">
                        <X className="h-5 w-5 text-[#FF4713]" />
                        Non, je ne pourrai pas venir
                      </Label>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </RadioGroup>

            {/* Custom fields for response step */}
            {fields.filter(f => f.id !== 'attending').length > 0 && (
              <div className="space-y-4 pt-4 border-t border-[#9CD9F6]/30">
                {fields.filter(f => f.id !== 'attending').map(field => (
                  <div key={field.id} className="space-y-2">
                    <Label className="text-[#004645]">
                      {field.label}
                      {field.required && <span className="text-[#FF4713] ml-1">*</span>}
                    </Label>
                    {field.description && (
                      <p className="text-sm text-[#004645]/70">{field.description}</p>
                    )}
                    {renderField(field)}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )

      case 'plus-ones':
        return (
          <motion.div
            key="plus-ones"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-2xl font-bold text-[#004645] mb-2">
                Accompagnants
              </h3>
              <p className="text-[#004645]/70">
                Combien de personnes vous accompagneront ? (Maximum : {config.maxPlusOnes})
              </p>
            </div>

            <div className="space-y-4">
              <Label htmlFor="plusOnes" className="text-lg">Nombre d&apos;accompagnants</Label>
              <Select value={plusOnes.toString()} onValueChange={(val) => setPlusOnes(parseInt(val))}>
                <SelectTrigger className="border-[#9CD9F6]/30">
                  <SelectValue placeholder="Sélectionnez" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: config.maxPlusOnes + 1 }, (_, i) => (
                    <SelectItem key={i} value={i.toString()}>
                      {i === 0 ? 'Aucun accompagnant' : `${i} accompagnant${i > 1 ? 's' : ''}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </motion.div>
        )

      case 'meal':
        return (
          <motion.div
            key="meal"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-2xl font-bold text-[#004645] mb-2">
                Préférences alimentaires
              </h3>
              <p className="text-[#004645]/70">
                Aidez-nous à préparer votre repas
              </p>
            </div>

            {config.collectMealChoice && (
              <div className="space-y-4">
                <Label className="text-lg">Choix du menu *</Label>
                <RadioGroup value={mealChoice} onValueChange={setMealChoice}>
                  <div className="space-y-2">
                    {config.mealOptions.map((option, idx) => (
                      <Card key={idx} className={`cursor-pointer transition-all ${mealChoice === option ? 'border-[#009197] border-2 bg-[#009197]/5' : 'border-[#9CD9F6]/30'}`}>
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3">
                            <RadioGroupItem value={option} id={`meal_${idx}`} />
                            <Label htmlFor={`meal_${idx}`} className="cursor-pointer flex-1">{option}</Label>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </RadioGroup>
              </div>
            )}

            {config.collectDietaryRestrictions && (
              <div className="space-y-2">
                <Label htmlFor="allergies">Allergies ou régimes spéciaux</Label>
                <Textarea
                  id="allergies"
                  placeholder="Ex: Végétarien, sans gluten, allergie aux fruits à coque..."
                  className="border-[#9CD9F6]/30"
                  rows={3}
                />
              </div>
            )}
          </motion.div>
        )

      case 'practical':
        return (
          <motion.div
            key="practical"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-2xl font-bold text-[#004645] mb-2">
                Informations pratiques
              </h3>
              <p className="text-[#004645]/70">
                Pour mieux organiser votre venue
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="accessibility">Besoins d&apos;accessibilité</Label>
                <Textarea
                  id="accessibility"
                  placeholder="Ex: Fauteuil roulant, assistance auditive..."
                  className="border-[#9CD9F6]/30"
                  rows={2}
                />
              </div>

              {config.collectAccommodation && (
                <div className="space-y-2">
                  <Label htmlFor="accommodation">Besoin d&apos;hébergement</Label>
                  <Textarea
                    id="accommodation"
                    placeholder="Indiquez vos besoins en hébergement..."
                    className="border-[#9CD9F6]/30"
                    rows={2}
                  />
                </div>
              )}
            </div>
          </motion.div>
        )

      case 'consent':
        return (
          <motion.div
            key="consent"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-2xl font-bold text-[#004645] mb-2">
                Consentements
              </h3>
              <p className="text-[#004645]/70">
                Merci de nous indiquer vos préférences
              </p>
            </div>

            <Card className="border-[#9CD9F6]/30">
              <CardContent className="p-6">
                <div className="flex items-start space-x-3">
                  <Checkbox id="photos" />
                  <div className="space-y-1">
                    <Label htmlFor="photos" className="cursor-pointer font-medium">
                      Autorisation de prise de photos et vidéos
                    </Label>
                    <p className="text-sm text-[#004645]/70">
                      J&apos;autorise l&apos;utilisation de mon image lors de l&apos;événement pour la communication de l&apos;organisateur
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )

      case 'summary':
        return (
          <motion.div
            key="summary"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-2xl font-bold text-[#004645] mb-2">
                Récapitulatif
              </h3>
              <p className="text-[#004645]/70">
                Vérifiez vos informations avant de confirmer
              </p>
            </div>

            <Card className="border-[#9CD9F6]/30 bg-white">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#9CD9F6]/30">
                  <span className="text-[#004645]/70">Participation</span>
                  <span className={`font-semibold ${attending ? 'text-[#009197]' : 'text-[#FF4713]'}`}>
                    {attending ? '✓ Présent(e)' : '✗ Absent(e)'}
                  </span>
                </div>

                {attending && config.allowPlusOne && (
                  <div className="flex items-center justify-between pb-3 border-b border-[#9CD9F6]/30">
                    <span className="text-[#004645]/70">Accompagnants</span>
                    <span className="font-semibold text-[#004645]">{plusOnes}</span>
                  </div>
                )}

                {attending && config.collectMealChoice && mealChoice && (
                  <div className="flex items-center justify-between pb-3 border-b border-[#9CD9F6]/30">
                    <span className="text-[#004645]/70">Menu choisi</span>
                    <span className="font-semibold text-[#004645]">{mealChoice}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {attending && (
              <Card className="border-[#009197]/50 bg-[#009197]/5">
                <CardContent className="p-6">
                  <p className="text-[#004645]">
                    {config.confirmationMessage}
                  </p>
                </CardContent>
              </Card>
            )}

            {!attending && (
              <Card className="border-[#FF4713]/50 bg-[#FF4713]/5">
                <CardContent className="p-6">
                  <p className="text-[#004645]">
                    {config.declineMessage}
                  </p>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )

      case 'success':
        return (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6 py-8"
          >
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-[#009197] flex items-center justify-center">
                <Check className="h-12 w-12 text-white" />
              </div>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-[#004645] mb-2">
                Merci !
              </h3>
              <p className="text-lg text-[#004645]/70">
                Votre réponse a été enregistrée avec succès
              </p>
            </div>
          </motion.div>
        )

      default:
        return null
    }
  }

  const renderField = (field: FormField) => {
    switch (field.type) {
      case 'textarea':
        return <Textarea placeholder={field.placeholder} className="border-[#9CD9F6]/30" />

      case 'text':
      case 'email':
      case 'phone':
      case 'number':
        return <Input type={field.type} placeholder={field.placeholder} className="border-[#9CD9F6]/30" />

      case 'select':
        return (
          <Select>
            <SelectTrigger className="border-[#9CD9F6]/30">
              <SelectValue placeholder="Sélectionnez une option" />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option, idx) => (
                <SelectItem key={idx} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case 'radio':
        return (
          <RadioGroup>
            <div className="space-y-2">
              {field.options?.map((option, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <RadioGroupItem value={option} id={`${field.id}_${idx}`} />
                  <Label htmlFor={`${field.id}_${idx}`} className="cursor-pointer">{option}</Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        )

      case 'checkbox':
        return (
          <div className="space-y-2">
            {field.options?.map((option, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Checkbox id={`${field.id}_${idx}`} />
                <Label htmlFor={`${field.id}_${idx}`} className="cursor-pointer">{option}</Label>
              </div>
            ))}
          </div>
        )

      default:
        return null
    }
  }

  const enabledSteps = steps.filter(s => s.enabled && s.id !== 'success')
  const currentIndex = enabledSteps.findIndex(s => s.id === currentStepId)
  const isLastStep = currentIndex === enabledSteps.length - 1

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      {currentStepId !== 'success' && (
        <RSVPProgress currentStepId={currentStepId} steps={steps.filter(s => s.id !== 'success')} />
      )}

      {/* Step Content */}
      <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-[#004645]">Aperçu interactif du parcours RSVP</CardTitle>
          <CardDescription>
            Naviguez à travers le formulaire comme vos invités le verront
          </CardDescription>
        </CardHeader>
        <CardContent className="min-h-[400px]">
          <AnimatePresence mode="wait">
            {renderStep()}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      {currentStepId !== 'success' && (
        <div className="flex justify-between gap-4">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStepId === 'response'}
            className="border-[#9CD9F6]/30"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Précédent
          </Button>

          <Button
            onClick={isLastStep ? () => setCurrentStepId('success') : handleNext}
            disabled={!canGoNext()}
            className="bg-gradient-to-r from-[#004645] to-[#009197] text-white"
          >
            {isLastStep ? 'Confirmer' : 'Suivant'}
            {!isLastStep && <ChevronRight className="h-4 w-4 ml-2" />}
          </Button>
        </div>
      )}

      {currentStepId === 'success' && (
        <Button
          onClick={() => {
            setCurrentStepId('response')
            setAttending(null)
            setPlusOnes(0)
            setMealChoice('')
          }}
          variant="outline"
          className="w-full border-[#009197] text-[#009197]"
        >
          Recommencer la prévisualisation
        </Button>
      )}
    </div>
  )
}
