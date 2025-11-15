"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sparkles, TrendingUp, FileText, ExternalLink, Calendar } from 'lucide-react'

interface ChangelogItem {
  id: string
  title: string
  date: string
  version?: string
  type: 'feature' | 'improvement' | 'optimization' | 'bugfix'
  description: string
  highlights: string[]
  details?: string
  impact?: {
    label: string
    value: string
  }[]
  files?: {
    created: number
    modified: number
    deleted?: number
  }
}

const typeConfig = {
  feature: {
    label: 'Nouvelle fonctionnalité',
    icon: Sparkles,
    color: 'bg-gradient-to-r from-purple-500 to-pink-500',
    badgeColor: 'bg-purple-100 text-purple-800',
  },
  improvement: {
    label: 'Amélioration',
    icon: TrendingUp,
    color: 'bg-gradient-to-r from-blue-500 to-cyan-500',
    badgeColor: 'bg-blue-100 text-blue-800',
  },
  optimization: {
    label: 'Optimisation',
    icon: TrendingUp,
    color: 'bg-gradient-to-r from-green-500 to-emerald-500',
    badgeColor: 'bg-green-100 text-green-800',
  },
  bugfix: {
    label: 'Correction',
    icon: FileText,
    color: 'bg-gradient-to-r from-orange-500 to-red-500',
    badgeColor: 'bg-orange-100 text-orange-800',
  },
}

export const changelogData: ChangelogItem[] = [
  {
    id: 'badge-system-2025-01-15',
    title: 'Système de Badges Professionnels',
    date: '2025-01-15',
    type: 'feature',
    description: 'Création complète d\'un système de badges personnalisables avec QR codes, templates prédéfinis et export PDF haute qualité pour vos événements.',
    highlights: [
      '🎫 Génération automatique de badges avec QR codes',
      '🎨 3 templates professionnels (Corporate, VIP, Lanyard)',
      '📄 Export PDF haute qualité (300 DPI)',
      '⚙️ Personnalisation complète (taille, orientation, champs)',
      '📊 Suivi des impressions et statistiques',
      '🔄 Génération par lot pour plusieurs invités',
    ],
    details: `
### Problème résolu
Besoin d'un système professionnel pour générer des badges d'identification lors des événements, avec intégration au système de check-in existant.

### Solution
- **Templates prêts** : 3 designs professionnels (Corporate Standard, VIP Premium, Lanyard)
- **Personnalisation** : Champs configurables (nom, entreprise, fonction, QR code, logo)
- **QR Code** : Intégration automatique avec le système de check-in
- **Export PDF** : Qualité impression 300 DPI, multiple badges par page
- **Gestion** : Suivi des impressions, génération par lot, statistiques

### Architecture
- 3 nouveaux modèles Prisma (BadgeTemplate, BadgeDesign, Badge)
- 5 API routes pour gestion complète
- Composants React réutilisables
- Validation Zod stricte

### Impact
- ⏱️ **Gain de temps** : Templates prêts à l'emploi
- 🎯 **Qualité pro** : Export PDF 300 DPI
- 🔗 **Intégration** : QR codes liés au check-in
- 📊 **Suivi** : Statistiques d'impression
    `,
    impact: [
      { label: 'Templates', value: '3' },
      { label: 'Qualité PDF', value: '300 DPI' },
      { label: 'API Routes', value: '5' },
      { label: 'Lignes ajoutées', value: '+2,100' },
    ],
    files: {
      created: 13,
      modified: 5,
    }
  },
  {
    id: 'rsvp-improvements-2025-01-15',
    title: 'Prévisualisation Interactive RSVP & Templates',
    date: '2025-01-15',
    type: 'feature',
    description: 'Ajout d\'une prévisualisation multi-étapes interactive et de 7 templates prédéfinis pour configurer rapidement vos formulaires RSVP.',
    highlights: [
      '🎬 Prévisualisation interactive multi-étapes',
      '✨ 7 templates prédéfinis (Mariage, Corporate, Gala, etc.)',
      '👁️ 3 modes de visualisation (Édition, Aperçu, Test interactif)',
      '🎯 Navigation étape par étape comme vos invités',
      '✅ Validation en temps réel',
      '🎨 Animations fluides avec Framer Motion',
    ],
    details: `
### Problème résolu
Auparavant, la prévisualisation montrait tous les champs sur une seule page, rendant impossible la visualisation du parcours multi-étapes réel que les invités expérimentent.

### Solution
- **Test interactif** : Naviguez à travers les 6 étapes (Réponse → Accompagnants → Repas → Infos pratiques → Consentements → Récapitulatif)
- **Templates prêts** : Configurez un événement en 2 secondes avec nos templates (Simple, Corporate, Mariage, Gala, Party, Conférence, Personnalisé)
- **Logique conditionnelle** : Les étapes s'adaptent automatiquement (si absent → passe direct au récapitulatif)

### Impact
- ⏱️ **-80% temps de configuration** grâce aux templates
- 🎯 **100% visibilité** du parcours utilisateur
- ✅ **Moins d'erreurs** grâce à la prévisualisation interactive
    `,
    impact: [
      { label: 'Temps de config', value: '-80%' },
      { label: 'Modes preview', value: '3' },
      { label: 'Templates', value: '7' },
      { label: 'Lignes ajoutées', value: '+1,200' },
    ],
    files: {
      created: 3,
      modified: 1,
    }
  },
  {
    id: 'code-optimization-2025-01-15',
    title: 'Optimisations Majeures du Code & Enrichissement DB',
    date: '2025-01-15',
    type: 'optimization',
    description: 'Refactorisation majeure avec déduplication de code (-1,529 lignes), enrichissement du schéma de base de données et amélioration du typage TypeScript.',
    highlights: [
      '🔥 -67% de code dupliqué (-1,529 lignes)',
      '🗄️ +13 nouveaux champs enrichis (emergencyContact, tShirtSize, budget, etc.)',
      '🎯 +7 schémas Zod pour validation runtime',
      '📦 Nouveau composant SessionDetailPage réutilisable',
      '🔧 Types TypeScript stricts (types/showcase.ts)',
      '📊 Migration SQL automatique',
    ],
    details: `
### Déduplication massive
3 pages identiques de 763 lignes consolidées en 1 composant réutilisable + 3 wrappers légers.

**Avant** : 2,289 lignes dupliquées
**Après** : 760 lignes total → **Économie de 1,529 lignes (-67%)**

### Nouveaux champs DB

**Guest Model**
- emergencyContact (JSON) : Contact d'urgence
- tShirtSize : Taille vêtement (XS-XXXL)
- arrivalTime/departureTime : Horaires précis

**Event Model**
- capacity : Capacité max
- registrationDeadline : Date limite
- hashtag : #MonEvent2025
- socialMediaUrls (JSON) : Réseaux sociaux
- budgetTotal/budgetCurrency : Gestion budget

**Session Model**
- prerequisites : Prérequis
- difficulty : Niveau (débutant/intermédiaire/avancé)
- targetAudience : Public cible

### Type Safety
Remplacement des 'any' par des types stricts avec Zod schemas pour validation runtime.
    `,
    impact: [
      { label: 'Code dupliqué', value: '-67%' },
      { label: 'Champs DB', value: '+13' },
      { label: 'Schémas Zod', value: '+7' },
      { label: 'Types créés', value: '+7' },
    ],
    files: {
      created: 4,
      modified: 5,
    }
  },
]

interface ChangelogCardProps {
  item: ChangelogItem
  compact?: boolean
}

export function ChangelogCard({ item, compact = false }: ChangelogCardProps) {
  const config = typeConfig[item.type]
  const Icon = config.icon

  if (compact) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Card className="cursor-pointer hover:shadow-lg transition-all border-l-4 hover:border-l-[#009197] border-[#9CD9F6]/30">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`p-2 rounded-lg ${config.color}`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <Badge className={config.badgeColor}>{config.label}</Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {item.date}
                      </span>
                    </div>
                    <CardTitle className="text-base text-[#004645] line-clamp-1">
                      {item.title}
                    </CardTitle>
                  </div>
                </div>
                <ExternalLink className="h-4 w-4 text-[#009197] flex-shrink-0" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-[#004645]/70 line-clamp-2">{item.description}</p>
            </CardContent>
          </Card>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-3 rounded-lg ${config.color}`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge className={config.badgeColor}>{config.label}</Badge>
                  <span className="text-sm text-muted-foreground">{item.date}</span>
                </div>
                <DialogTitle className="text-2xl text-[#004645]">{item.title}</DialogTitle>
              </div>
            </div>
            <DialogDescription>{item.description}</DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-6">
              {/* Highlights */}
              <div>
                <h4 className="font-semibold text-[#004645] mb-3">✨ Points clés</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {item.highlights.map((highlight, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm">
                      <span className="text-[#009197]">•</span>
                      <span className="text-[#004645]/80">{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Impact */}
              {item.impact && (
                <div>
                  <h4 className="font-semibold text-[#004645] mb-3">📊 Impact</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {item.impact.map((metric, idx) => (
                      <Card key={idx} className="border-[#9CD9F6]/30">
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-[#009197]">{metric.value}</div>
                          <div className="text-xs text-[#004645]/70 mt-1">{metric.label}</div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Details */}
              {item.details && (
                <div>
                  <h4 className="font-semibold text-[#004645] mb-3">📄 Détails</h4>
                  <div className="prose prose-sm max-w-none">
                    <pre className="whitespace-pre-wrap text-sm text-[#004645]/80 font-sans bg-gray-50 p-4 rounded-lg">
                      {item.details}
                    </pre>
                  </div>
                </div>
              )}

              {/* Files */}
              {item.files && (
                <div>
                  <h4 className="font-semibold text-[#004645] mb-3">📁 Fichiers</h4>
                  <div className="flex gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-green-50">+{item.files.created}</Badge>
                      <span className="text-[#004645]/70">créés</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-blue-50">~{item.files.modified}</Badge>
                      <span className="text-[#004645]/70">modifiés</span>
                    </div>
                    {item.files.deleted && (
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-red-50">-{item.files.deleted}</Badge>
                        <span className="text-[#004645]/70">supprimés</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    )
  }

  // Full version (not compact)
  return (
    <Card className="border-l-4 hover:shadow-lg transition-all" style={{ borderLeftColor: config.color.split(' ')[1] }}>
      <CardHeader>
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-lg ${config.color}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={config.badgeColor}>{config.label}</Badge>
              <span className="text-sm text-muted-foreground">{item.date}</span>
            </div>
            <CardTitle className="text-xl text-[#004645]">{item.title}</CardTitle>
            <CardDescription className="mt-2">{item.description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-semibold text-[#004645] mb-2">Points clés</h4>
          <ul className="space-y-1">
            {item.highlights.map((highlight, idx) => (
              <li key={idx} className="text-sm text-[#004645]/80">{highlight}</li>
            ))}
          </ul>
        </div>

        {item.impact && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {item.impact.map((metric, idx) => (
              <div key={idx} className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-lg font-bold text-[#009197]">{metric.value}</div>
                <div className="text-xs text-[#004645]/70">{metric.label}</div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
