# Analyse de paramétrabilité de la plateforme

## 🎯 Objectif
Maximiser la paramétrabilité **sans** créer une usine à gaz.

## ✅ Actuellement paramétrable (SANS code)

### Via l'interface Admin

| Élément | Paramétrable | Niveau |
|---------|-------------|--------|
| Nom événement | ✅ Oui | ⭐⭐⭐ Facile |
| Date/heure | ✅ Oui | ⭐⭐⭐ Facile |
| Lieu (nom, ville, pays) | ✅ Oui | ⭐⭐⭐ Facile |
| Description | ✅ Oui | ⭐⭐⭐ Facile |
| Deadline RSVP | ✅ Oui | ⭐⭐⭐ Facile |
| Accompagnants (oui/non + max) | ✅ Oui | ⭐⭐⭐ Facile |
| Choix de repas (oui/non) | ✅ Oui | ⭐⭐⭐ Facile |
| Options de repas | ✅ Oui | ⭐⭐⭐ Facile |
| Modules (transport, hébergement, accessibilité) | ✅ Oui | ⭐⭐⭐ Facile |
| Textes des étapes RSVP | ✅ Oui | ⭐⭐ Moyen |
| Ordre des étapes | ✅ Oui | ⭐⭐ Moyen |
| Templates email (WYSIWYG) | ✅ Oui | ⭐⭐ Moyen |
| Couleurs globales | ✅ Oui | ⭐⭐ Moyen |

## ❌ PAS paramétrable actuellement (nécessite code)

### Hardcodé dans le code

| Élément | Impact | Priorité fix |
|---------|--------|--------------|
| Message d'accueil "Bonjour {prénom} 👋" | 🟡 Moyen | 🔥🔥🔥 HIGH |
| Sous-texte "Vous êtes invité(e) à" | 🟡 Moyen | 🔥🔥🔥 HIGH |
| Titre section "Votre réponse" | 🟡 Moyen | 🔥🔥 MEDIUM |
| Format de date (fr-FR) | 🟠 Important | 🔥🔥🔥 HIGH |
| Séparateurs dans lieu (virgules) | 🟢 Faible | 🔥 LOW |
| Icônes (MapPin, Calendar, etc.) | 🟢 Faible | 🔥 LOW |
| Police de caractères | 🟠 Important | 🔥🔥 MEDIUM |
| Animations (framer-motion) | 🟢 Faible | 🔥 LOW |
| Couleurs fond gradient | 🟡 Moyen | 🔥🔥 MEDIUM |

## 🎨 Variables dynamiques existantes

```javascript
// Dans les emails et templates
{{event.name}}
{{event.date}}
{{event.time}}
{{event.location}}
{{event.address}}
{{event.city}}
{{event.description}}
{{event.organizerName}}

{{guest.firstName}}
{{guest.lastName}}
{{guest.email}}
{{guest.fullName}}

{{rsvpLink}}
{{showcaseLink}}
{{unsubscribeLink}}

{{primaryColor}}
{{secondaryColor}}
{{accentColor}}
{{fontFamily}}
```

## 💡 Variables manquantes (à ajouter)

```javascript
// Données événement étendues
{{event.country}}
{{event.venueName}}
{{event.program}}
{{event.dressCode}}
{{event.capacity}}
{{event.hashtag}}

// Données invité étendues
{{guest.company}}
{{guest.jobTitle}}
{{guest.phone}}

// Données RSVP
{{rsvp.attending}}
{{rsvp.plusOnes}}
{{rsvp.mealChoice}}

// Liens
{{calendarLink}}
{{directionsLink}}
{{websiteLink}}

// Formatage
{{event.date.short}}  // 15 déc 2025
{{event.date.long}}   // lundi 15 décembre 2025
{{event.date.iso}}    // 2025-12-15
```

## 🚀 Quick Wins (Faciles à implémenter)

### 1. Rendre paramétrables les textes hardcodés
**Effort** : 2h
**Impact** : 🔥🔥🔥 HIGH

Ajouter dans `Event.rsvpConfig` :
```json
{
  "customTexts": {
    "welcomeGreeting": "Bonjour {{guest.firstName}} 👋",
    "welcomeSubtitle": "Vous êtes invité(e) à",
    "formTitle": "Votre réponse",
    "deadlineMessage": "Merci de confirmer votre participation avant le {{event.rsvpDeadline}}"
  }
}
```

### 2. Variables dynamiques étendues
**Effort** : 1h
**Impact** : 🔥🔥 MEDIUM

Ajouter toutes les variables manquantes dans `getTemplateVariables()`

### 3. Sélecteur de format de date
**Effort** : 2h
**Impact** : 🔥🔥🔥 HIGH

```json
{
  "dateFormat": {
    "locale": "fr-FR",  // ou "en-US", "de-DE"
    "dateStyle": "long", // "short", "medium", "long", "full"
    "timeStyle": "short" // "short", "medium", "long"
  }
}
```

### 4. Templates par type d'événement
**Effort** : 3h
**Impact** : 🔥🔥🔥 HIGH

Presets pré-configurés :
- 💼 Corporate / Conférence
- 💍 Mariage
- 🎉 Gala / Anniversaire
- 🏋️ Workshop / Formation
- 🎭 Festival / Concert
- 🍽️ Dîner privé

### 5. Éditeur de thème visuel amélioré
**Effort** : 4h
**Impact** : 🔥🔥 MEDIUM

Color picker pour :
- Couleur principale
- Couleur secondaire
- Couleur accent
- Fond page
- Fond cartes
- Police titre
- Police texte

## 🎯 Principe : Progressive Disclosure

```
Niveau 1 (Simple) → 80% des utilisateurs
├─ Presets par type d'événement
├─ Modification textes via interface
└─ Activation/désactivation modules

Niveau 2 (Avancé) → 15% des utilisateurs
├─ Variables dynamiques
├─ Conditions d'affichage
├─ Thème visuel personnalisé
└─ Champs personnalisés

Niveau 3 (Expert) → 5% des utilisateurs
├─ Import/export JSON
├─ Code personnalisé (CSS/JS)
└─ API webhooks
```

## 📊 Matrice effort/impact

```
HIGH IMPACT                    ┌─────────────┬─────────────┐
                              │  🔥 DO NOW  │  🎯 PLAN    │
                              │             │             │
                              │  • Textes   │  • Thème    │
                              │  • Date fmt │  • Webhooks │
                              │  • Presets  │  • API      │
                              │  • Variables│             │
                              ├─────────────┼─────────────┤
                              │  ✅ DONE   │  ⏰ LATER   │
                              │             │             │
                              │  • Étapes   │  • Icônes   │
                              │  • Repas    │  • Anims    │
                              │  • Modules  │  • PWA      │
LOW IMPACT                    └─────────────┴─────────────┘
                              LOW EFFORT    HIGH EFFORT
```

## 🎨 Interface proposée (sans usine à gaz)

### Approche "Wizard" pour premiers pas
```
Étape 1/4 : Type d'événement
  [💼] Corporate    [💍] Mariage    [🎉] Gala

  → Applique preset adapté

Étape 2/4 : Informations
  Nom, date, lieu (existant)

Étape 3/4 : Options
  ☑ Accompagnants
  ☑ Choix de repas
  ☐ Transport

Étape 4/4 : Personnalisation
  "Voulez-vous personnaliser les textes ?"
  [Non, utiliser les défauts] [Oui, personnaliser]
```

### Section "Paramètres avancés" (repliable)
```
📝 Textes personnalisés
  └─ [Éditer] → Ouvre éditeur avec variables

🎨 Thème visuel
  └─ [Personnaliser] → Color pickers

🔧 Options avancées
  └─ Format date, variables custom, conditions
```

## 🎯 Recommandations

### À faire MAINTENANT (Quick Wins)
1. ✅ Rendre textes d'accueil paramétrables
2. ✅ Ajouter variables dynamiques manquantes
3. ✅ Sélecteur format de date
4. ✅ Templates par type d'événement

### À faire ENSUITE (v2)
5. Éditeur thème visuel complet
6. Conditions d'affichage avancées
7. Webhooks pour intégrations
8. Champs personnalisés illimités

### NE PAS faire (complexité inutile)
- ❌ Éditeur de code en ligne
- ❌ 50 options dans un seul écran
- ❌ Personnalisation pixel par pixel
- ❌ Mode "expert" trop complexe

## 💬 Philosophie

> "Make the simple easy, and the complex possible"

- **80% des utilisateurs** : Presets + modifications basiques
- **15% des utilisateurs** : Personnalisation avancée via interface
- **5% des utilisateurs** : Export JSON + code custom

## 📝 Checklist avant d'ajouter un paramètre

Avant d'ajouter un nouveau paramètre, se demander :

1. ✅ **Utile** : Au moins 20% des users en ont besoin ?
2. ✅ **Simple** : Peut s'expliquer en 1 phrase ?
3. ✅ **Visible** : L'utilisateur comprend où le trouver ?
4. ✅ **Safe** : Valeur par défaut qui marche dans 90% des cas ?
5. ✅ **Testable** : Preview en temps réel disponible ?

Si 5/5 → **GO**
Si 3-4/5 → **MAYBE** (discuter)
Si <3/5 → **NO** (trop complexe)

## 🎁 Bonus : Auto-configuration

Idée : Détection intelligente basée sur les données
```javascript
// Si event.name contient "Mariage" ou "Wedding"
→ Active template Mariage automatiquement

// Si event.capacity > 500
→ Désactive accompagnants par défaut

// Si event.mealOptions.length > 5
→ Affiche en dropdown au lieu de radio

// Si event.requireMeal === false
→ Cache complètement l'étape repas
```

## 📊 Métriques de succès

Comment mesurer qu'on n'est pas une "usine à gaz" :

- ✅ **Time to first RSVP** : < 10 minutes
- ✅ **Taux d'utilisation presets** : > 60%
- ✅ **Support tickets "comment faire"** : < 5/mois
- ✅ **Taux completion wizard** : > 85%
- ✅ **Satisfaction UI** : > 4.5/5

---

**Conclusion** : Prioriser les 4 Quick Wins = 80% du besoin avec 20% de l'effort
