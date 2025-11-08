"use client"

import { CheckCircle, Circle } from 'lucide-react'

interface Step {
  number: number
  label: string
  completed: boolean
  active: boolean
}

interface RSVPProgressProps {
  currentStep: number
  totalSteps: number
  stepLabels?: string[]
}

export function RSVPProgress({ currentStep, totalSteps, stepLabels }: RSVPProgressProps) {
  const steps: Step[] = Array.from({ length: totalSteps }, (_, i) => ({
    number: i + 1,
    label: stepLabels?.[i] || `Étape ${i + 1}`,
    completed: i + 1 < currentStep,
    active: i + 1 === currentStep
  }))

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center flex-1">
            {/* Step Circle */}
            <div className="flex flex-col items-center relative">
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm
                  transition-all duration-300 relative z-10
                  ${step.completed
                    ? 'bg-[#009197] text-white shadow-lg scale-110'
                    : step.active
                    ? 'bg-[#FF4713] text-white shadow-xl scale-125 animate-pulse'
                    : 'bg-gray-200 text-gray-500'
                  }
                `}
              >
                {step.completed ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <span>{step.number}</span>
                )}
              </div>
              <span
                className={`
                  text-xs mt-2 font-medium whitespace-nowrap
                  ${step.active ? 'text-[#FF4713]' : step.completed ? 'text-[#009197]' : 'text-gray-400'}
                `}
              >
                {step.label}
              </span>
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div className="flex-1 h-0.5 mx-2 relative">
                <div className="absolute inset-0 bg-gray-200" />
                <div
                  className={`
                    absolute inset-0 transition-all duration-500
                    ${step.completed ? 'bg-[#009197]' : 'bg-transparent'}
                  `}
                  style={{
                    width: step.completed ? '100%' : '0%'
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="mt-4 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#004645] via-[#009197] to-[#9CD9F6] transition-all duration-500 ease-out"
          style={{
            width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%`
          }}
        />
      </div>

      {/* Step Counter */}
      <div className="mt-2 text-center">
        <span className="text-sm text-[#004645]/70">
          Étape <strong className="text-[#FF4713]">{currentStep}</strong> sur <strong>{totalSteps}</strong>
        </span>
      </div>
    </div>
  )
}
