# Phase 2 : Proposition de Refonte Navigation

## Problème identifié

**Navigation actuelle (8-12 onglets) :**
```
1. Vue d'ensemble
2. Save the Date       }
3. Invitation          } Workflow Email (éparpillé)
4. RSVP                }
5. Showcase
6. Invités
7. Check-in
8. Communications      } Encore email !
9. Dashboard Planif.   } Modules conditionnels
10. Programme          }
11. Transport          }
12. Hébergement        }
```

**Confusion utilisateur :**
- Emails éparpillés sur 4 onglets différents
- Pas de regroupement logique
- "Communications" fait doublon avec STD/Invitation/RSVP

---

## Solution proposée

### **Option A - Navigation avec sections (Recommandée)**

Ajouter des séparateurs visuels sans changer les URLs :

```
┌─────────────────────────┐
│ GESTION ÉVÉNEMENT       │
├─────────────────────────┤
│ 📊 Vue d'ensemble       │
│ ✨ Showcase             │
│ 👥 Invités              │
│ ✓  Check-in             │
│                         │
├─────────────────────────┤
│ EMAIL & COMMUNICATIONS  │
├─────────────────────────┤
│ 🔔 Save the Date        │
│ 💌 Invitation           │
│ ✅ RSVP                 │
│ 📨 Envoi & Suivi        │ <- Renommé de "Communications"
│                         │
├─────────────────────────┤
│ MODULES AVANCÉS         │
├─────────────────────────┤
│ 📈 Dashboard Planif.    │
│ 📅 Programme            │
│ ✈️  Transport           │
│ 🏨 Hébergement          │
└─────────────────────────┘
```

**Avantages :**
- ✅ Garde les mêmes URLs (pas de breaking change)
- ✅ Groupement visuel clair
- ✅ Facile à implémenter
- ✅ Améliore la lisibilité

---

### **Option B - Navigation avec menu déroulant (Plus complexe)**

Regrouper sous un seul menu "Communications" :

```
┌─────────────────────────┐
│ 📊 Vue d'ensemble       │
│ ✨ Showcase             │
│ 👥 Invités              │
│ ✓  Check-in             │
│                         │
│ ▼ Communications        │ <- Cliquable, se déploie
│   ├─ Save the Date      │
│   ├─ Invitation         │
│   ├─ RSVP               │
│   └─ Envoi & Analytics  │
│                         │
│ ▼ Modules Avancés       │
│   ├─ Dashboard          │
│   ├─ Programme          │
│   ├─ Transport          │
│   └─ Hébergement        │
└─────────────────────────┘
```

**Avantages :**
- ✅ Moins d'items visibles
- ✅ Navigation plus compacte
- ❌ Plus complexe à implémenter
- ❌ Nécessite un clic supplémentaire

---

## Recommandation

**Implémenter l'Option A** pour :
1. Simplicité d'implémentation
2. Pas de changement de comportement
3. Amélioration immédiate de la lisibilité
4. Compatible avec les habitudes utilisateurs

On peut toujours passer à l'Option B plus tard si nécessaire.

---

## Changements à apporter

### 1. Modifier `/app/admin/events/[id]/layout.tsx`

```typescript
// Organiser les navItems en sections
const navigationSections = [
  {
    title: "GESTION ÉVÉNEMENT",
    items: [
      { label: 'Vue d\'ensemble', href: `/admin/events/${eventId}`, icon: LayoutDashboard, exact: true },
      { label: 'Showcase', href: `/admin/events/${eventId}/showcase`, icon: Sparkles },
      { label: 'Invités', href: `/admin/events/${eventId}/guests`, icon: Users },
      { label: 'Check-in', href: `/admin/events/${eventId}/checkin`, icon: QrCode },
    ]
  },
  {
    title: "EMAIL & COMMUNICATIONS",
    items: [
      { label: 'Save the Date', href: `/admin/events/${eventId}/save-the-date`, icon: Bell },
      { label: 'Invitation', href: `/admin/events/${eventId}/invitation`, icon: Mail },
      { label: 'RSVP', href: `/admin/events/${eventId}/rsvp-config`, icon: UserCheck },
      { label: 'Envoi & Suivi', href: `/admin/events/${eventId}/communications`, icon: Send },
    ]
  },
  {
    title: "MODULES AVANCÉS",
    items: moduleNavItems, // Calculé dynamiquement
    condition: moduleNavItems.length > 0
  }
]
```

### 2. Améliorer le style visuel

- Ajouter des headers de section en gris clair
- Espacer les sections
- Améliorer les icônes

---

## Implémentation prévue

1. ✅ Créer les sections dans le layout
2. ✅ Ajouter les séparateurs visuels
3. ✅ Renommer "Communications" → "Envoi & Suivi"
4. ✅ Tester sur tous les écrans

