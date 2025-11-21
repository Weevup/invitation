"use client"

import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { RsvpStep } from '@/app/admin/events/[id]/settings/tabs/rsvp-subtabs/RsvpStepsContent'

interface RsvpCustomStepProps {
  step: RsvpStep
  value: string
  onChange: (value: string) => void
}

export function RsvpCustomStep({ step, value, onChange }: RsvpCustomStepProps) {
  if (step.type === 'message') {
    return (
      <div className="space-y-4">
        <div
          className="prose prose-sm max-w-none text-[#004645]"
          dangerouslySetInnerHTML={{ __html: step.content || '' }}
        />
      </div>
    )
  }

  if (step.type === 'custom' && step.customField) {
    return (
      <div className="space-y-4">
        <Label htmlFor={`custom-${step.id}`} className="text-lg">
          {step.customField.question}
          {step.customField.required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <Textarea
          id={`custom-${step.id}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={step.customField.placeholder}
          rows={4}
          required={step.customField.required}
        />
      </div>
    )
  }

  return null
}
