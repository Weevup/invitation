/**
 * Type definitions for showcase-related data structures
 * This file provides proper TypeScript types to replace 'any' usage
 */

export interface Speaker {
  name: string
  title: string
  bio: string
  photo: string
  email?: string
}

export interface Sponsor {
  name: string
  logo: string
  website: string
  tier: 'platinum' | 'gold' | 'silver' | 'bronze'
}

export interface TimelineItem {
  time: string
  title: string
  description: string
  icon?: string
}

export interface FAQItem {
  question: string
  answer: string
}

export interface SectionConfig {
  id: string
  enabled: boolean
  order: number
  customSettings?: Record<string, unknown>
}

export interface SectionContent {
  title?: string
  subtitle?: string
  description?: string
  image?: string
  buttons?: Array<{
    label: string
    url: string
    variant?: 'default' | 'outline' | 'ghost'
  }>
  customHTML?: string
}

export type SectionContents = Record<string, SectionContent>

export interface SocialMediaUrls {
  twitter?: string
  instagram?: string
  linkedin?: string
  facebook?: string
  youtube?: string
}

export interface EmergencyContact {
  name: string
  phone: string
  relationship: string
}
