# Exemple d'Implémentation Technique

## 🏗️ Architecture Proposée

### 1. Extension de l'Interface RsvpStep

```typescript
// app/admin/events/[id]/rsvp-steps/types.ts

export type RsvpStepType =
  // Types existants
  | 'message'
  | 'response'
  | 'plus-ones'
  | 'meal'
  | 'practical'
  | 'consent'
  | 'custom'
  | 'summary'
  // Nouveaux types
  | 'professional-info'
  | 'workshop-registration'
  | 'networking-preferences'
  | 'group-delegation'
  | 'technical-requirements'
  | 'travel-accommodation'
  | 'dietary-detailed'
  | 'engagement-consents'
  | 'side-activities'
  | 'custom-advanced'

export type FieldType =
  | 'text'
  | 'textarea'
  | 'email'
  | 'tel'
  | 'url'
  | 'number'
  | 'date'
  | 'datetime'
  | 'time'
  | 'select'
  | 'multi-select'
  | 'radio'
  | 'checkbox'
  | 'file'
  | 'rating'
  | 'slider'
  | 'color'
  | 'date-range'
  | 'time-slots'

export interface FieldDefinition {
  id: string
  type: FieldType
  label: string
  placeholder?: string
  required: boolean

  // Options pour select/radio/checkbox
  options?: Array<{
    value: string
    label: string
    disabled?: boolean
    icon?: string
    image?: string
    description?: string
  }>

  // Validation
  validation?: {
    pattern?: string // Regex
    min?: number
    max?: number
    minLength?: number
    maxLength?: number
    customValidator?: string // Nom de la fonction de validation
    errorMessage?: string
  }

  // Logique conditionnelle
  conditional?: {
    field: string
    operator: 'equals' | 'notEquals' | 'greaterThan' | 'lessThan' | 'contains' | 'in'
    value: any
    action: 'show' | 'hide' | 'require' | 'optional'
  }

  // Limites (pour multi-select, workshop registration, etc.)
  limits?: {
    maxSelections?: number
    maxCapacity?: number
    showRemaining?: boolean
    waitlistEnabled?: boolean
  }

  // Calculs automatiques
  computed?: {
    formula: string // Ex: "(nights * pricePerNight) + extras"
    displayAs: 'number' | 'currency' | 'percentage'
    currencyCode?: string
    showInSummary: boolean
  }

  // Aide et documentation
  help?: {
    tooltip?: string
    description?: string
    example?: string
    link?: string
  }

  // Valeur par défaut
  defaultValue?: any

  // Pré-remplissage depuis profil
  prefillFrom?: 'profile.company' | 'profile.jobTitle' | 'profile.email' | string
}

export interface RsvpStep {
  id: string
  type: RsvpStepType
  label: string
  description?: string
  enabled: boolean
  order: number

  // Pour les étapes de type 'message'
  content?: string // HTML/Markdown

  // Pour les nouveaux types d'étapes avec champs multiples
  fields?: FieldDefinition[]

  // Configuration spécifique par type
  config?: {
    // Pour 'workshop-registration'
    workshops?: Array<{
      id: string
      title: string
      description: string
      startTime: string
      endTime: string
      capacity: number
      registered: number
      level: 'beginner' | 'intermediate' | 'advanced'
      tags: string[]
    }>

    // Pour 'travel-accommodation'
    accommodation?: {
      hotels: Array<{
        id: string
        name: string
        pricePerNight: number
        roomTypes: Array<{
          type: string
          price: number
          available: number
        }>
      }>
      shuttleSchedule: Array<{
        time: string
        from: string
        to: string
      }>
    }

    // Pour 'networking-preferences'
    networking?: {
      availableSlots: Array<{
        date: string
        startTime: string
        endTime: string
        duration: number // minutes
      }>
      interests: string[]
      lookingFor: Array<{
        value: string
        label: string
      }>
    }

    // Pour 'dietary-detailed'
    dietary?: {
      menus: Array<{
        id: string
        name: string
        description: string
        image?: string
        dietary: string[] // 'vegetarian', 'vegan', 'gluten-free', etc.
        allergens: string[]
        price?: number
      }>
      commonAllergens: string[]
      commonDiets: string[]
    }
  }

  // Textes personnalisables (comme actuellement)
  texts?: Record<string, string>

  // Logique conditionnelle au niveau de l'étape
  conditional?: {
    enabled: boolean
    field: string
    operator: 'equals' | 'notEquals' | 'greaterThan' | 'lessThan' | 'contains'
    value: any
  }
}
```

---

## 🎨 Exemple 1: Étape "Informations Professionnelles"

### Configuration JSON

```json
{
  "id": "professional-info",
  "type": "professional-info",
  "label": "Informations Professionnelles",
  "description": "Ces informations nous aideront à personnaliser votre expérience",
  "enabled": true,
  "order": 2,
  "fields": [
    {
      "id": "company",
      "type": "text",
      "label": "Entreprise",
      "placeholder": "Nom de votre organisation",
      "required": true,
      "prefillFrom": "profile.company",
      "validation": {
        "minLength": 2,
        "maxLength": 100,
        "errorMessage": "Le nom de l'entreprise doit contenir entre 2 et 100 caractères"
      }
    },
    {
      "id": "jobTitle",
      "type": "text",
      "label": "Fonction",
      "placeholder": "Votre poste",
      "required": true,
      "prefillFrom": "profile.jobTitle",
      "help": {
        "example": "Ex: Directeur Marketing, Développeur Full-Stack"
      }
    },
    {
      "id": "industry",
      "type": "select",
      "label": "Secteur d'activité",
      "required": true,
      "options": [
        { "value": "tech", "label": "Technologies" },
        { "value": "finance", "label": "Finance / Banque" },
        { "value": "health", "label": "Santé / Médical" },
        { "value": "retail", "label": "Commerce / Retail" },
        { "value": "consulting", "label": "Conseil" },
        { "value": "education", "label": "Éducation" },
        { "value": "manufacturing", "label": "Industrie" },
        { "value": "other", "label": "Autre" }
      ]
    },
    {
      "id": "companySize",
      "type": "select",
      "label": "Taille de l'entreprise",
      "required": false,
      "options": [
        { "value": "1-10", "label": "1-10 employés (TPE)" },
        { "value": "11-50", "label": "11-50 employés (PME)" },
        { "value": "51-250", "label": "51-250 employés (ETI)" },
        { "value": "251-1000", "label": "251-1000 employés" },
        { "value": "1000+", "label": "1000+ employés (Grand groupe)" }
      ]
    },
    {
      "id": "interests",
      "type": "multi-select",
      "label": "Domaines d'intérêt",
      "placeholder": "Sélectionnez jusqu'à 5 domaines",
      "required": false,
      "limits": {
        "maxSelections": 5
      },
      "options": [
        { "value": "ai", "label": "Intelligence Artificielle", "icon": "🤖" },
        { "value": "cloud", "label": "Cloud Computing", "icon": "☁️" },
        { "value": "security", "label": "Cybersécurité", "icon": "🔒" },
        { "value": "devops", "label": "DevOps", "icon": "⚙️" },
        { "value": "data", "label": "Data Science", "icon": "📊" },
        { "value": "blockchain", "label": "Blockchain", "icon": "⛓️" },
        { "value": "iot", "label": "IoT", "icon": "📡" },
        { "value": "mobile", "label": "Mobile", "icon": "📱" }
      ]
    },
    {
      "id": "participationGoals",
      "type": "textarea",
      "label": "Objectifs de participation",
      "placeholder": "Que souhaitez-vous retirer de cet événement ?",
      "required": false,
      "validation": {
        "maxLength": 500
      },
      "help": {
        "description": "Cela nous aidera à vous proposer les bons contacts et ateliers",
        "example": "Ex: Découvrir les nouvelles tendances en IA, rencontrer des partenaires potentiels"
      }
    }
  ]
}
```

### Composant React

```tsx
// app/guest/[token]/components/steps/ProfessionalInfoStep.tsx

import React from 'react';
import { motion } from 'framer-motion';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MultiSelect } from '@/components/ui/multi-select';
import { Button } from '@/components/ui/button';
import { InfoIcon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface ProfessionalInfoStepProps {
  data: {
    company: string;
    jobTitle: string;
    industry: string;
    companySize: string;
    interests: string[];
    participationGoals: string;
  };
  fields: FieldDefinition[];
  onChange: (fieldId: string, value: any) => void;
  onBack: () => void;
  onContinue: () => void;
  texts: {
    continueButton: string;
    previousButton: string;
  };
}

export const ProfessionalInfoStep = React.memo(({
  data,
  fields,
  onChange,
  onBack,
  onContinue,
  texts
}: ProfessionalInfoStepProps) => {
  const renderField = (field: FieldDefinition) => {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'tel':
      case 'url':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id} className="flex items-center gap-2">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
              {field.help?.tooltip && (
                <Tooltip>
                  <TooltipTrigger>
                    <InfoIcon className="h-4 w-4 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{field.help.tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </Label>
            {field.help?.description && (
              <p className="text-sm text-gray-500">{field.help.description}</p>
            )}
            <Input
              id={field.id}
              type={field.type}
              value={data[field.id] || ''}
              onChange={(e) => onChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              required={field.required}
            />
            {field.help?.example && (
              <p className="text-xs text-gray-400 italic">{field.help.example}</p>
            )}
          </div>
        );

      case 'textarea':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </Label>
            {field.help?.description && (
              <p className="text-sm text-gray-500">{field.help.description}</p>
            )}
            <Textarea
              id={field.id}
              value={data[field.id] || ''}
              onChange={(e) => onChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              required={field.required}
              maxLength={field.validation?.maxLength}
            />
            {field.validation?.maxLength && (
              <p className="text-xs text-gray-400 text-right">
                {(data[field.id] || '').length} / {field.validation.maxLength}
              </p>
            )}
          </div>
        );

      case 'select':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Select
              value={data[field.id] || ''}
              onValueChange={(value) => onChange(field.id, value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={field.placeholder || 'Sélectionnez'} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    disabled={option.disabled}
                  >
                    {option.icon && <span className="mr-2">{option.icon}</span>}
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case 'multi-select':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
              {field.limits?.maxSelections && (
                <span className="text-sm text-gray-500 ml-2">
                  (max {field.limits.maxSelections})
                </span>
              )}
            </Label>
            <MultiSelect
              options={field.options || []}
              selected={data[field.id] || []}
              onChange={(values) => onChange(field.id, values)}
              maxSelections={field.limits?.maxSelections}
              placeholder={field.placeholder}
            />
            {field.limits?.maxSelections && (
              <p className="text-xs text-gray-400">
                {(data[field.id] || []).length} / {field.limits.maxSelections} sélectionnés
              </p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      {fields.map((field) => renderField(field))}

      <div className="flex space-x-2 pt-4">
        <Button
          variant="outline"
          onClick={onBack}
          className="border-[#004645] text-[#004645] hover:bg-[#004645] hover:text-white"
        >
          {texts.previousButton}
        </Button>
        <Button
          onClick={onContinue}
          className="flex-1 bg-gradient-to-r from-[#004645] to-[#009197] hover:from-[#006C51] hover:to-[#009197] text-white"
        >
          {texts.continueButton}
        </Button>
      </div>
    </motion.div>
  );
});

ProfessionalInfoStep.displayName = 'ProfessionalInfoStep';
```

---

## 🎯 Exemple 2: Étape "Sélection d'Ateliers"

### Configuration JSON

```json
{
  "id": "workshop-registration",
  "type": "workshop-registration",
  "label": "Sélection d'ateliers",
  "description": "Choisissez jusqu'à 3 ateliers parmi notre programme",
  "enabled": true,
  "order": 4,
  "config": {
    "workshops": [
      {
        "id": "ws-k8s",
        "title": "Kubernetes en Production",
        "description": "Déploiement et orchestration de containers à grande échelle",
        "startTime": "2025-06-15T10:00:00",
        "endTime": "2025-06-15T12:00:00",
        "capacity": 30,
        "registered": 18,
        "level": "intermediate",
        "tags": ["DevOps", "Cloud", "Containers"]
      },
      {
        "id": "ws-cicd",
        "title": "CI/CD avec GitLab",
        "description": "Mise en place d'un pipeline complet de déploiement automatisé",
        "startTime": "2025-06-15T10:00:00",
        "endTime": "2025-06-15T12:00:00",
        "capacity": 20,
        "registered": 5,
        "level": "beginner",
        "tags": ["DevOps", "Git", "Automation"]
      },
      {
        "id": "ws-terraform",
        "title": "Infrastructure as Code avec Terraform",
        "description": "Gérez votre infrastructure cloud de manière déclarative",
        "startTime": "2025-06-15T14:00:00",
        "endTime": "2025-06-15T16:00:00",
        "capacity": 25,
        "registered": 25,
        "level": "intermediate",
        "tags": ["IaC", "Cloud", "Automation"]
      }
    ],
    "maxWorkshops": 3,
    "detectConflicts": true
  },
  "fields": [
    {
      "id": "selectedWorkshops",
      "type": "multi-select",
      "label": "Ateliers sélectionnés",
      "required": true,
      "limits": {
        "maxSelections": 3,
        "showRemaining": true
      }
    },
    {
      "id": "equipmentNeeded",
      "type": "checkbox",
      "label": "J'apporte mon ordinateur portable",
      "required": false
    },
    {
      "id": "specialRequests",
      "type": "textarea",
      "label": "Demandes particulières",
      "placeholder": "Prérequis logiciels, questions...",
      "required": false
    }
  ]
}
```

### Composant React avec Détection de Conflits

```tsx
// app/guest/[token]/components/steps/WorkshopRegistrationStep.tsx

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle, Users, Clock, Award } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Workshop {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  capacity: number;
  registered: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
}

interface WorkshopRegistrationStepProps {
  workshops: Workshop[];
  selectedWorkshops: string[];
  maxWorkshops: number;
  onChange: (workshopIds: string[]) => void;
  onBack: () => void;
  onContinue: () => void;
  texts: any;
}

export const WorkshopRegistrationStep = React.memo(({
  workshops,
  selectedWorkshops,
  maxWorkshops,
  onChange,
  onBack,
  onContinue,
  texts
}: WorkshopRegistrationStepProps) => {
  // Détection des conflits d'horaires
  const conflicts = useMemo(() => {
    const selected = workshops.filter(w => selectedWorkshops.includes(w.id));
    const conflictPairs: string[][] = [];

    for (let i = 0; i < selected.length; i++) {
      for (let j = i + 1; j < selected.length; j++) {
        const w1 = selected[i];
        const w2 = selected[j];

        // Check time overlap
        const start1 = new Date(w1.startTime);
        const end1 = new Date(w1.endTime);
        const start2 = new Date(w2.startTime);
        const end2 = new Date(w2.endTime);

        if (start1 < end2 && start2 < end1) {
          conflictPairs.push([w1.id, w2.id]);
        }
      }
    }

    return conflictPairs;
  }, [workshops, selectedWorkshops]);

  const toggleWorkshop = (workshopId: string) => {
    if (selectedWorkshops.includes(workshopId)) {
      onChange(selectedWorkshops.filter(id => id !== workshopId));
    } else if (selectedWorkshops.length < maxWorkshops) {
      onChange([...selectedWorkshops, workshopId]);
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelLabel = (level: string) => {
    switch (level) {
      case 'beginner': return 'Débutant';
      case 'intermediate': return 'Intermédiaire';
      case 'advanced': return 'Avancé';
      default: return level;
    }
  };

  // Group workshops by time slot
  const workshopsByTime = useMemo(() => {
    const grouped: Record<string, Workshop[]> = {};
    workshops.forEach(w => {
      const timeKey = new Date(w.startTime).toLocaleString('fr-FR', {
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
      if (!grouped[timeKey]) grouped[timeKey] = [];
      grouped[timeKey].push(w);
    });
    return grouped;
  }, [workshops]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Sélectionnez jusqu'à <strong>{maxWorkshops}</strong> ateliers
        </p>
        <Badge variant={selectedWorkshops.length >= maxWorkshops ? "default" : "outline"}>
          {selectedWorkshops.length} / {maxWorkshops}
        </Badge>
      </div>

      {conflicts.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            ⚠️ Attention : Vous avez sélectionné des ateliers en conflit d'horaire
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        {Object.entries(workshopsByTime).map(([timeSlot, slotWorkshops]) => (
          <div key={timeSlot}>
            <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {timeSlot}
            </h3>
            <div className="grid gap-3 ml-6">
              {slotWorkshops.map((workshop) => {
                const isFull = workshop.registered >= workshop.capacity;
                const isSelected = selectedWorkshops.includes(workshop.id);
                const canSelect = isSelected || (!isFull && selectedWorkshops.length < maxWorkshops);
                const remaining = workshop.capacity - workshop.registered;

                return (
                  <Card
                    key={workshop.id}
                    className={`p-4 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[#009197] bg-[#009197]/5 shadow-md'
                        : 'border-gray-200 hover:border-[#009197]/50'
                    } ${!canSelect ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={() => canSelect && toggleWorkshop(workshop.id)}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={isSelected}
                        disabled={!canSelect}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-semibold text-[#004645]">
                            {workshop.title}
                          </h4>
                          <Badge className={getLevelColor(workshop.level)}>
                            <Award className="h-3 w-3 mr-1" />
                            {getLevelLabel(workshop.level)}
                          </Badge>
                        </div>

                        <p className="text-sm text-gray-600 mt-1">
                          {workshop.description}
                        </p>

                        <div className="flex items-center gap-4 mt-3">
                          <div className="flex items-center gap-1 text-sm">
                            <Users className="h-4 w-4 text-gray-400" />
                            <span className={isFull ? 'text-red-600 font-semibold' : 'text-gray-600'}>
                              {isFull ? 'COMPLET' : `${remaining} places restantes`}
                            </span>
                          </div>

                          <div className="flex gap-1">
                            {workshop.tags.map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="flex space-x-2 pt-4">
        <Button
          variant="outline"
          onClick={onBack}
          className="border-[#004645] text-[#004645] hover:bg-[#004645] hover:text-white"
        >
          {texts.previousButton}
        </Button>
        <Button
          onClick={onContinue}
          disabled={selectedWorkshops.length === 0 || conflicts.length > 0}
          className="flex-1 bg-gradient-to-r from-[#004645] to-[#009197] hover:from-[#006C51] hover:to-[#009197] text-white"
        >
          {texts.continueButton}
        </Button>
      </div>
    </motion.div>
  );
});

WorkshopRegistrationStep.displayName = 'WorkshopRegistrationStep';
```

---

## 🔄 Modifications Base de Données

### Schéma Prisma Étendu

```prisma
// prisma/schema.prisma

model Event {
  id                String   @id @default(cuid())
  name              String
  // ... champs existants ...

  // Configuration RSVP enrichie
  rsvpConfig        Json?    // Stocke la config complète des étapes

  // Nouveaux champs pour workshops
  workshops         Workshop[]

  rsvps             Rsvp[]
}

model Workshop {
  id          String   @id @default(cuid())
  eventId     String
  event       Event    @relation(fields: [eventId], references: [id], onDelete: Cascade)

  title       String
  description String   @db.Text
  startTime   DateTime
  endTime     DateTime
  capacity    Int
  level       String   // 'beginner', 'intermediate', 'advanced'
  tags        String[] // Array de tags
  location    String?

  registrations WorkshopRegistration[]

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([eventId])
}

model Rsvp {
  id                  String   @id @default(cuid())
  guestId             String
  eventId             String

  // ... champs existants ...

  // Nouvelles données structurées
  professionalInfo    Json?    // Infos professionnelles
  networkingPrefs     Json?    // Préférences networking
  travelAccommodation Json?    // Voyage & hébergement
  dietaryDetails      Json?    // Régime alimentaire détaillé
  technicalReqs       Json?    // Besoins techniques
  sideActivities      Json?    // Activités parallèles
  customFields        Json?    // Champs personnalisés

  workshopRegistrations WorkshopRegistration[]

  // ... reste des champs ...
}

model WorkshopRegistration {
  id          String   @id @default(cuid())
  rsvpId      String
  rsvp        Rsvp     @relation(fields: [rsvpId], references: [id], onDelete: Cascade)
  workshopId  String
  workshop    Workshop @relation(fields: [workshopId], references: [id], onDelete: Cascade)

  status      String   @default("registered") // 'registered', 'waitlist', 'cancelled'

  createdAt   DateTime @default(now())

  @@unique([rsvpId, workshopId])
  @@index([workshopId])
}
```

---

## 📡 API Routes

### GET /api/admin/events/[id]/workshops

```typescript
// app/api/admin/events/[id]/workshops/route.ts

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const workshops = await prisma.workshop.findMany({
    where: { eventId: params.id },
    include: {
      _count: {
        select: { registrations: true }
      }
    },
    orderBy: { startTime: 'asc' }
  });

  return NextResponse.json(
    workshops.map(w => ({
      ...w,
      registered: w._count.registrations,
      available: w.capacity - w._count.registrations
    }))
  );
}
```

### POST /api/guest/rsvp/[token] (Extended)

```typescript
// app/api/guest/rsvp/[token]/route.ts

export async function POST(
  req: Request,
  { params }: { params: { token: string } }
) {
  const body = await req.json();

  const {
    attending,
    plusOnes,
    // ... champs existants ...

    // Nouveaux champs
    professionalInfo,
    selectedWorkshops,
    networkingPrefs,
    travelAccommodation,
    dietaryDetails,
    technicalReqs,
    sideActivities,
    customFields
  } = body;

  // Transaction pour garantir la cohérence
  const result = await prisma.$transaction(async (tx) => {
    // 1. Créer ou mettre à jour le RSVP
    const rsvp = await tx.rsvp.upsert({
      where: {
        guestId_eventId: {
          guestId: guest.id,
          eventId: event.id
        }
      },
      create: {
        guestId: guest.id,
        eventId: event.id,
        attending,
        plusOnes,
        professionalInfo,
        networkingPrefs,
        travelAccommodation,
        dietaryDetails,
        technicalReqs,
        sideActivities,
        customFields
      },
      update: {
        attending,
        plusOnes,
        professionalInfo,
        networkingPrefs,
        travelAccommodation,
        dietaryDetails,
        technicalReqs,
        sideActivities,
        customFields
      }
    });

    // 2. Gérer les inscriptions aux workshops
    if (selectedWorkshops && selectedWorkshops.length > 0) {
      // Supprimer les anciennes inscriptions
      await tx.workshopRegistration.deleteMany({
        where: { rsvpId: rsvp.id }
      });

      // Créer les nouvelles inscriptions
      for (const workshopId of selectedWorkshops) {
        // Vérifier la capacité
        const workshop = await tx.workshop.findUnique({
          where: { id: workshopId },
          include: {
            _count: { select: { registrations: true } }
          }
        });

        if (!workshop) continue;

        const isFull = workshop._count.registrations >= workshop.capacity;

        await tx.workshopRegistration.create({
          data: {
            rsvpId: rsvp.id,
            workshopId,
            status: isFull ? 'waitlist' : 'registered'
          }
        });
      }
    }

    return rsvp;
  });

  return NextResponse.json({ success: true, rsvp: result });
}
```

---

## 📊 Exports Enrichis

### Export Excel avec Onglets Multiples

```typescript
// lib/exports/rsvp-excel-export.ts

import ExcelJS from 'exceljs';

export async function generateRSVPExport(eventId: string) {
  const workbook = new ExcelJS.Workbook();

  // Onglet 1: Liste générale
  const mainSheet = workbook.addWorksheet('Participants');
  mainSheet.columns = [
    { header: 'Nom', key: 'lastName', width: 20 },
    { header: 'Prénom', key: 'firstName', width: 20 },
    { header: 'Email', key: 'email', width: 30 },
    { header: 'Entreprise', key: 'company', width: 25 },
    { header: 'Fonction', key: 'jobTitle', width: 25 },
    { header: 'Présent', key: 'attending', width: 10 },
    { header: '+1', key: 'plusOnes', width: 10 }
  ];

  // Onglet 2: Infos professionnelles
  const professionalSheet = workbook.addWorksheet('Profils Pro');
  professionalSheet.columns = [
    { header: 'Nom complet', key: 'fullName', width: 30 },
    { header: 'Entreprise', key: 'company', width: 25 },
    { header: 'Fonction', key: 'jobTitle', width: 25 },
    { header: 'Secteur', key: 'industry', width: 20 },
    { header: 'Taille entreprise', key: 'companySize', width: 20 },
    { header: 'Centres d\'intérêt', key: 'interests', width: 40 }
  ];

  // Onglet 3: Workshops
  const workshopsSheet = workbook.addWorksheet('Ateliers');
  workshopsSheet.columns = [
    { header: 'Atelier', key: 'workshop', width: 40 },
    { header: 'Horaire', key: 'time', width: 20 },
    { header: 'Participant', key: 'participant', width: 30 },
    { header: 'Email', key: 'email', width: 30 },
    { header: 'Entreprise', key: 'company', width: 25 }
  ];

  // Onglet 4: Hébergement
  const accommodationSheet = workbook.addWorksheet('Hébergement');
  accommodationSheet.columns = [
    { header: 'Nom', key: 'name', width: 30 },
    { header: 'Arrivée', key: 'checkIn', width: 15 },
    { header: 'Départ', key: 'checkOut', width: 15 },
    { header: 'Nuits', key: 'nights', width: 10 },
    { header: 'Type chambre', key: 'roomType', width: 20 },
    { header: 'Navette', key: 'shuttle', width: 15 }
  ];

  // Onglet 5: Régimes alimentaires
  const dietarySheet = workbook.addWorksheet('Régimes & Allergies');
  dietarySheet.columns = [
    { header: 'Nom', key: 'name', width: 30 },
    { header: 'Régime', key: 'diet', width: 20 },
    { header: 'Allergies', key: 'allergies', width: 40 },
    { header: 'Menu choisi', key: 'menu', width: 30 }
  ];

  // Remplir les données...
  const rsvps = await prisma.rsvp.findMany({
    where: { eventId },
    include: {
      guest: true,
      workshopRegistrations: {
        include: { workshop: true }
      }
    }
  });

  // ... populate sheets ...

  return workbook;
}
```

---

## 🎨 Interface Admin - Éditeur Drag & Drop

### Composant pour Créer des Étapes

```tsx
// components/rsvp-step-builder.tsx

import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { StepCard } from './step-card';
import { StepTypeSelector } from './step-type-selector';

export function RSVPStepBuilder({ steps, onChange }: Props) {
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = steps.findIndex(s => s.id === active.id);
      const newIndex = steps.findIndex(s => s.id === over.id);
      onChange(arrayMove(steps, oldIndex, newIndex));
    }
  };

  return (
    <div className="space-y-4">
      <StepTypeSelector onAdd={(type) => {/* ajouter étape */}} />

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={steps.map(s => s.id)} strategy={verticalListSortingStrategy}>
          {steps.map((step, index) => (
            <StepCard
              key={step.id}
              step={step}
              index={index}
              onEdit={(updated) => {/* modifier */}}
              onDelete={() => {/* supprimer */}}
              onDuplicate={() => {/* dupliquer */}}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}
```

---

Cette implémentation technique montre comment intégrer les nouveaux types d'étapes dans l'architecture existante de manière progressive et modulaire ! 🚀
