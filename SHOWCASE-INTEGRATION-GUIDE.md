# Guide d'intégration Showcase Builder Avancé

## 📋 Résumé des composants créés

### 1. Infrastructure de templates
- ✅ `lib/showcase-templates.ts` - 5 templates complets
- ✅ `components/showcase/template-selector.tsx` - Sélecteur visuel
- ✅ `components/showcase/section-editor.tsx` - Éditeur avancé de sections
- ✅ `components/showcase/draggable-section-list.tsx` - Drag & drop
- ✅ `components/showcase/split-preview.tsx` - Aperçu splitscreen responsive
- ✅ `components/ui/slider.tsx` - Composant UI slider

## 🔧 Modifications à apporter au showcase-builder.tsx

### Étape 1: Imports supplémentaires

```typescript
// Ajouter ces imports en haut du fichier
import { TemplateSelector } from '@/components/showcase/template-selector'
import { DraggableSectionList } from '@/components/showcase/draggable-section-list'
import { SectionEditor } from '@/components/showcase/section-editor'
import { SplitPreview } from '@/components/showcase/split-preview'
import { showcaseTemplates, type SectionConfig, type ShowcaseTemplate } from '@/lib/showcase-templates'
import { Plus } from 'lucide-react'
```

### Étape 2: États supplémentaires

```typescript
// Remplacer:
const [sections, setSections] = useState<string[]>(...)

// Par:
const [sectionConfigs, setSectionConfigs] = useState<SectionConfig[]>([])
const [showTemplateSelector, setShowTemplateSelector] = useState(false)
const [editingSection, setEditingSection] = useState<SectionConfig | null>(null)
const [showPreview, setShowPreview] = useState(false)
```

### Étape 3: Fonctions de gestion

```typescript
// Appliquer un template
const handleTemplateSelect = (template: ShowcaseTemplate) => {
  setSectionConfigs(template.sections)
  setPrimaryColor(template.primaryColor)
  setSecondaryColor(template.secondaryColor)
  setShowTemplateSelector(false)
}

// Réorganiser les sections
const handleSectionsReorder = (newSections: SectionConfig[]) => {
  setSectionConfigs(newSections)
}

// Toggle section
const handleSectionToggle = (sectionId: string) => {
  setSectionConfigs(prev =>
    prev.map(s => s.id === sectionId ? { ...s, enabled: !s.enabled } : s)
  )
}

// Éditer une section
const handleSectionEdit = (section: SectionConfig) => {
  setEditingSection(section)
}

// Sauvegarder l'édition
const handleSectionUpdate = (updatedSection: SectionConfig) => {
  setSectionConfigs(prev =>
    prev.map(s => s.id === updatedSection.id ? updatedSection : s)
  )
  setEditingSection(null)
}

// Supprimer une section
const handleSectionDelete = (sectionId: string) => {
  setSectionConfigs(prev => prev.filter(s => s.id !== sectionId))
}

// Ajouter une nouvelle section
const handleAddSection = (type: string) => {
  const newSection: SectionConfig = {
    id: `${type}-${Date.now()}`,
    type,
    enabled: true,
    order: sectionConfigs.length,
    layout: 'container',
    alignment: 'center',
    paddingTop: 'lg',
    paddingBottom: 'lg',
    animationType: 'fade',
    animationDuration: 'normal',
  }
  setSectionConfigs(prev => [...prev, newSection])
}
```

### Étape 4: Modifier le Tab "Sections"

```typescript
<TabsContent value="sections" className="space-y-4">
  <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur">
    <CardHeader>
      <div className="flex items-center justify-between">
        <div>
          <CardTitle className="text-[#004645]">Sections de la page</CardTitle>
          <CardDescription>Glissez-déposez pour réorganiser</CardDescription>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowTemplateSelector(true)}
            className="border-[#009197] text-[#009197] hover:bg-[#009197]/10"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Choisir un template
          </Button>
          <Button
            variant="outline"
            onClick={() => {/* Ouvrir menu d'ajout de section */}}
            className="border-[#FF4713] text-[#FF4713] hover:bg-[#FF4713]/10"
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une section
          </Button>
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <DraggableSectionList
        sections={sectionConfigs}
        onReorder={handleSectionsReorder}
        onToggle={handleSectionToggle}
        onEdit={handleSectionEdit}
        onDelete={handleSectionDelete}
      />
    </CardContent>
  </Card>
</TabsContent>
```

### Étape 5: Ajouter les modals/dialogs

```typescript
{/* En fin de composant, avant le closing </div> */}

{/* Template Selector */}
<TemplateSelector
  open={showTemplateSelector}
  onSelect={handleTemplateSelect}
  onClose={() => setShowTemplateSelector(false)}
/>

{/* Section Editor */}
{editingSection && (
  <Dialog open={!!editingSection} onOpenChange={() => setEditingSection(null)}>
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Configuration de la section</DialogTitle>
      </DialogHeader>
      <SectionEditor
        section={editingSection}
        onChange={handleSectionUpdate}
      />
      <DialogFooter>
        <Button onClick={() => setEditingSection(null)}>Fermer</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
)}

{/* Split Preview */}
<SplitPreview
  eventSlug={eventSlug}
  isVisible={showPreview}
  onToggle={() => setShowPreview(!showPreview)}
/>
```

### Étape 6: Modifier la fonction handleSave()

```typescript
const handleSave = async () => {
  setSaving(true)
  setError('')
  setSaved(false)

  try {
    const response = await fetch(`/api/admin/events/${eventId}/showcase`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        showcaseEnabled: enabled,
        showcaseTitle: title || null,
        showcaseSubtitle: subtitle || null,
        showcaseBannerImage: bannerImage || null,
        showcasePrimaryColor: primaryColor,
        showcaseSecondaryColor: secondaryColor,
        showcaseSections: sectionConfigs, // <-- Envoyer les configs complètes
        showcaseCustomCSS: customCSS || null,
        showcaseGallery: gallery.length > 0 ? gallery : null,
        showcaseFAQ: faq.length > 0 ? faq : null,
        showcaseVideo: videoUrl || null,
        showcaseCountdown: countdown,
        showcaseSocialShare: socialShare,
        showcaseSpeakers: speakers.length > 0 ? speakers : null,
        showcaseSponsors: sponsors.length > 0 ? sponsors : null,
        showcaseTimeline: timeline.length > 0 ? timeline : null,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to save showcase settings')
    }

    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  } catch (err) {
    setError('Erreur lors de la sauvegarde')
    console.error('Save error:', err)
  } finally {
    setSaving(false)
  }
}
```

## 📝 Modifications du schéma Prisma

```prisma
// Le champ showcaseSections stocke maintenant un Array de SectionConfig
showcaseSections Json? // Array of SectionConfig objects with advanced settings
```

**Format JSON stocké:**
```json
[
  {
    "id": "hero-1",
    "type": "hero",
    "enabled": true,
    "order": 0,
    "layout": "fullwidth",
    "alignment": "center",
    "paddingTop": "xl",
    "paddingBottom": "xl",
    "backgroundColor": "#1a1a1a",
    "backgroundOverlay": true,
    "overlayOpacity": 60,
    "animationType": "fade",
    "animationDuration": "slow"
  },
  // ... autres sections
]
```

## 🎨 Fonctionnalités disponibles

### Templates prêts à l'emploi
1. **Événement Corporate** - 7 sections, noir & or
2. **Festival/Concert** - 6 sections, rouge & orange
3. **Conférence Tech** - 7 sections, bleu & violet
4. **Gala Charité** - 6 sections, royal purple
5. **Lancement Produit** - 6 sections, bleu océan

### Personnalisation par section
- **Layout**: fullwidth, container, split, grid (1-4 colonnes)
- **Espacement**: padding/margin (none, sm, md, lg, xl)
- **Fond**: couleur, image, overlay avec opacité, motifs
- **Animation**: fade/slide/zoom avec durée et délai

### Interface utilisateur
- ✅ Drag & drop des sections
- ✅ Aperçu en temps réel (desktop/tablet/mobile)
- ✅ Éditeur visuel avancé
- ✅ Sélecteur de templates avec preview

## 🚀 Prochaines étapes

1. Appliquer les modifications au `showcase-builder.tsx`
2. Tester l'intégration complète
3. Mettre à jour l'API pour gérer les nouveaux formats
4. Adapter la page publique `/event/[slug]` pour utiliser les configs avancées
5. Ajouter la documentation utilisateur
