"use client"

import { ReactNode } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollReveal } from '@/components/scroll-reveal'

interface SectionCardProps {
  children: ReactNode
  className?: string
  gradient?: boolean
  primaryColor?: string
  secondaryColor?: string
}

export function SectionCard({
  children,
  className = '',
  gradient = false,
  primaryColor = '#004645',
  secondaryColor = '#FF4713'
}: SectionCardProps) {
  return (
    <ScrollReveal>
      <Card
        className={`
          border-2 border-transparent
          bg-white/90 backdrop-blur-sm
          hover:shadow-2xl hover:scale-[1.02]
          transition-all duration-300 ease-out
          relative overflow-hidden
          ${className}
        `}
        style={{
          borderImageSource: gradient
            ? `linear-gradient(135deg, ${primaryColor}20, ${secondaryColor}20)`
            : undefined,
          borderImageSlice: gradient ? 1 : undefined
        }}
      >
        {gradient && (
          <div
            className="absolute top-0 left-0 right-0 h-1"
            style={{
              background: `linear-gradient(90deg, ${primaryColor}, ${secondaryColor})`
            }}
          />
        )}
        <CardContent className="pt-6">
          {children}
        </CardContent>
      </Card>
    </ScrollReveal>
  )
}
