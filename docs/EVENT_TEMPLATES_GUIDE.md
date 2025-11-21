# Guide des Templates d'Événements

## 🎯 Vue d'ensemble

Les templates d'événements sont des **configurations pré-définies** qui adaptent automatiquement votre plateforme selon le type d'événement. Chaque template configure :

- ✅ Options RSVP (accompagnants, repas, modules)
- 🎨 Thème visuel (couleurs, polices)
- 💬 Textes adaptés au ton
- 🍽️ Options de repas appropriées

**Objectif** : Réduire le temps de configuration de 30 minutes à 2 minutes.

---

## 📦 Templates disponibles

### 1. 💼 Corporate / Événement d'entreprise

**Idéal pour** : Conférences, séminaires, réunions d'entreprise

**Configuration** :
- ❌ Pas d'accompagnants
- ✅ Repas : Menu standard, Végétarien, Sans gluten, Halal
- ✅ Transport, Hébergement, Accessibilité
- ✅ Consentement photos

**Ton** : Professionnel, formel
- "Bonjour {{guest.firstName}}"
- "Merci de confirmer votre participation"
- "✓ Je confirme ma participation"

**Couleurs** : Bleu (#1e40af)
**Dress code** : Tenue professionnelle

---

### 2. 💍 Mariage

**Idéal pour** : Cérémonies et réceptions de mariage

**Configuration** :
- ✅ 1 accompagnant maximum
- ✅ Repas : Menu Viande, Menu Poisson, Menu Végétarien, Menu Enfant
- ✅ Transport, Hébergement, Accessibilité
- ✅ Consentement photos

**Ton** : Chaleureux, romantique
- "Cher(e) {{guest.firstName}} 💕"
- "Serez-vous des nôtres pour célébrer ce jour unique ?"
- "✓ Avec grand plaisir !"

**Couleurs** : Rose (#ec4899)
**Dress code** : Tenue de cérémonie

---

### 3. 🎉 Gala / Soirée

**Idéal pour** : Soirées de gala, anniversaires, célébrations

**Configuration** :
- ✅ 1 accompagnant maximum
- ✅ Repas : Menu Gastronomique, Menu Végétarien, Menu Végan
- ✅ Transport, Accessibilité
- ✅ Consentement photos

**Ton** : Élégant, festif
- "Bonjour {{guest.firstName}} ✨"
- "Nous ferez-vous l'honneur de votre présence ?"
- "✓ J'accepte avec plaisir"

**Couleurs** : Violet (#8b5cf6)
**Dress code** : Tenue de soirée

---

### 4. 🏋️ Workshop / Formation

**Idéal pour** : Ateliers, formations, sessions de travail

**Configuration** :
- ❌ Pas d'accompagnants
- ✅ Repas : Déjeuner inclus, Végétarien, Sans gluten
- ✅ Transport, Accessibilité
- ❌ Pas de consentement photos

**Ton** : Pratique, direct
- "Bonjour {{guest.firstName}}"
- "Confirmez-vous votre inscription ?"
- "✓ Je m'inscris"

**Couleurs** : Vert (#059669)
**Dress code** : Tenue décontractée

---

### 5. 🎭 Festival / Concert

**Idéal pour** : Festivals, concerts, événements culturels

**Configuration** :
- ✅ 3 accompagnants maximum
- ❌ Pas de repas
- ✅ Transport, Hébergement, Accessibilité
- ✅ Consentement photos

**Ton** : Décontracté, enjoué
- "Hey {{guest.firstName}} ! 🎸"
- "Tu viens faire la fête ?"
- "✓ Carrément !"

**Couleurs** : Rouge (#dc2626)
**Dress code** : Tenue libre / Festive

---

### 6. 🍽️ Dîner privé

**Idéal pour** : Dîners, repas entre amis ou famille

**Configuration** :
- ✅ 1 accompagnant maximum
- ✅ Repas : Omnivore, Végétarien, Végan, Pescetarien
- ❌ Pas de transport, hébergement, accessibilité
- ❌ Pas de consentement photos

**Ton** : Convivial, intime
- "Cher(e) {{guest.firstName}} 🍷"
- "Serez-vous des nôtres ?"
- "✓ Avec plaisir"

**Couleurs** : Orange (#ea580c)
**Dress code** : Tenue confortable

---

### 7. 🎤 Conférence

**Idéal pour** : Conférences, keynotes, présentations

**Configuration** :
- ❌ Pas d'accompagnants
- ❌ Pas de repas
- ✅ Transport, Hébergement, Accessibilité
- ✅ Consentement photos

**Ton** : Professionnel
- "Bonjour {{guest.firstName}}"
- "Confirmez-vous votre participation ?"
- "✓ Je confirme"

**Couleurs** : Cyan (#0891b2)
**Dress code** : Business casual

---

## 🚀 Comment utiliser

### Méthode 1 : À la création d'un événement

```tsx
import { EventTemplateSelector } from '@/components/event-template-selector'

<EventTemplateSelector
  onSelectTemplate={(template) => {
    // Appliquer la configuration du template
    setAllowPlusOnes(template.rsvpConfig.allowPlusOnes)
    setMaxPlusOnes(template.rsvpConfig.maxPlusOnes)
    setRequireMeal(template.rsvpConfig.requireMeal)
    setMealOptions(template.rsvpConfig.mealOptions)
    // ... etc
  }}
/>
```

### Méthode 2 : Version compacte (Quick selector)

```tsx
import { EventTemplateQuickSelector } from '@/components/event-template-selector'

<EventTemplateQuickSelector
  onSelectTemplate={(template) => applyTemplate(template)}
  selectedTemplateId={currentType}
/>
```

### Méthode 3 : Programmatique

```tsx
import { getEventTemplate } from '@/lib/event-templates'

const template = getEventTemplate('wedding')

// Appliquer la config
await prisma.event.create({
  data: {
    ...eventData,
    allowPlusOnes: template.rsvpConfig.allowPlusOnes,
    maxPlusOnes: template.rsvpConfig.maxPlusOnes,
    requireMeal: template.rsvpConfig.requireMeal,
    mealOptions: template.rsvpConfig.mealOptions,
    // ...
  }
})
```

---

## 📊 Comparaison des configurations

| Feature | Corporate | Mariage | Gala | Workshop | Festival | Dîner | Conférence |
|---------|-----------|---------|------|----------|----------|-------|------------|
| **Accompagnants** | ❌ | ✅ (1) | ✅ (1) | ❌ | ✅ (3) | ✅ (1) | ❌ |
| **Repas** | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| **Transport** | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| **Hébergement** | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ✅ |
| **Accessibilité** | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| **Photos** | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ |
| **Ton** | Formel | Romantique | Élégant | Pratique | Enjoué | Convivial | Pro |

---

## 🎨 Palettes de couleurs

```css
/* Corporate */
--primary: #1e40af;    /* Bleu marine */
--secondary: #3b82f6;  /* Bleu clair */
--accent: #ef4444;     /* Rouge */

/* Mariage */
--primary: #ec4899;    /* Rose */
--secondary: #f9a8d4;  /* Rose clair */
--accent: #fbbf24;     /* Or */

/* Gala */
--primary: #8b5cf6;    /* Violet */
--secondary: #a78bfa;  /* Violet clair */
--accent: #fbbf24;     /* Or */

/* Workshop */
--primary: #059669;    /* Vert */
--secondary: #10b981;  /* Vert clair */
--accent: #f59e0b;     /* Orange */

/* Festival */
--primary: #dc2626;    /* Rouge */
--secondary: #f87171;  /* Rouge clair */
--accent: #fbbf24;     /* Or */

/* Dîner */
--primary: #ea580c;    /* Orange */
--secondary: #fb923c;  /* Orange clair */
--accent: #84cc16;     /* Vert lime */

/* Conférence */
--primary: #0891b2;    /* Cyan */
--secondary: #22d3ee;  /* Cyan clair */
--accent: #f97316;     /* Orange vif */
```

---

## ✨ Personnalisation après sélection

Les templates sont un **point de départ**, pas une contrainte ! Après sélection :

✅ Vous pouvez modifier n'importe quel paramètre
✅ Ajouter/retirer des options de repas
✅ Changer les couleurs
✅ Personnaliser tous les textes
✅ Activer/désactiver des modules

**Workflow recommandé** :
1. Sélectionner le template le plus proche
2. Laisser la config par défaut si elle convient
3. Ajuster seulement ce qui doit l'être
4. Sauvegarder

---

## 🎯 Bénéfices

**Avant les templates** :
- ⏱️ 30 minutes de configuration
- ❓ Hésitation sur les options à activer
- 🤔 Textes génériques peu adaptés
- 🎨 Choix de couleurs aléatoires

**Avec les templates** :
- ⚡ 2 minutes de configuration
- ✅ Configuration adaptée automatiquement
- 💬 Textes au ton approprié
- 🎨 Palette harmonieuse pré-définie

**Gain de temps estimé** : **93%** (28 minutes économisées par événement)

---

## 🔮 Évolutions futures

### v2.0 (À venir)
- ⭐ Templates community (partagés par les users)
- 📥 Import/export de templates personnalisés
- 🌐 Templates multilingues
- 🎯 Templates par industrie (Tech, Santé, Éducation...)

### v3.0 (Roadmap)
- 🤖 IA : Suggestion automatique de template basée sur le nom de l'événement
- 📊 Analytics : Templates les plus utilisés/performants
- 🎨 Theme builder : Créer ses propres templates visuellement

---

## 💡 Cas d'usage

### Cas 1 : Événement corporate récurrent
```
Problème : Créer 12 conférences par an avec la même config
Solution : Sélectionner "Conférence" à chaque fois → Config cohérente instantanée
```

### Cas 2 : Agence événementielle multi-clients
```
Problème : Gérer des mariages, galas, workshops avec des configs différentes
Solution : Template adapté à chaque type → Pas de confusion, professionnalisme
```

### Cas 3 : Premier événement
```
Problème : Ne pas savoir quelles options activer
Solution : Template guide l'utilisateur vers les bonnes pratiques
```

---

## 📝 Checklist de sélection

Avant de choisir un template, demandez-vous :

- [ ] Quel est le **ton** de mon événement ? (Formel/Décontracté)
- [ ] Y aura-t-il des **accompagnants** ?
- [ ] Un **repas** est-il prévu ?
- [ ] Besoin de **transport** / **hébergement** ?
- [ ] Événement **public** ou **privé** ?

Ces réponses vous guideront vers le bon template.

---

## 🚀 Quick Start

```bash
# 1. Importer les templates
import { EventTemplateSelector } from '@/components/event-template-selector'
import { getEventTemplate } from '@/lib/event-templates'

# 2. Afficher le sélecteur
<EventTemplateSelector onSelectTemplate={handleSelect} />

# 3. Appliquer la config
const template = getEventTemplate('wedding')
applyConfig(template.rsvpConfig)
applyTheme(template.theme)
applyTexts(template.customTexts)

# 4. C'est tout ! ✅
```

---

**Documentation mise à jour le** : 21/11/2025
**Version** : 1.0.0
**Auteur** : Weevup Platform
