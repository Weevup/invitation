# RSVP - Référence Rapide

## 🎯 Modification rapide des champs

### Interface Admin (Sans toucher au code)

```
/admin/events/[eventId]
│
├─ 📝 Édition de base
│  ├─ Nom de l'événement ..................... "Les 10 ans de Weevup"
│  ├─ Date et heure .......................... "15 décembre 2025 à 20:00"
│  ├─ Lieu ................................... "Molitor Paris"
│  ├─ Ville .................................. "Paris"
│  ├─ Pays ................................... "France"
│  ├─ Description ............................ "Célébration des 10 ans..."
│  └─ Date limite RSVP ....................... "1er décembre 2025"
│
├─ ⚙️ Configuration RSVP
│  ├─ Autoriser accompagnants ................ ☑️ Oui / ☐ Non
│  ├─ Max accompagnants ...................... 2
│  ├─ Choix de repas ......................... ☑️ Oui / ☐ Non
│  ├─ Options de repas ....................... ["Viande", "Poisson", "Végétarien"]
│  ├─ Accessibilité .......................... ☑️ Activé
│  ├─ Transport .............................. ☑️ Activé
│  ├─ Hébergement ............................ ☑️ Activé
│  └─ Consentement photos .................... ☑️ Activé
│
└─ 🎨 Personnalisation textes (via /rsvp-steps)
   ├─ Étape "Réponse"
   │  ├─ Question ............................ "Participez-vous à l'événement ?"
   │  ├─ Oui ................................. "✓ J'accepte avec plaisir"
   │  ├─ Non ................................. "✗ Je ne peux malheureusement pas venir"
   │  └─ Bouton .............................. "Continuer"
   │
   ├─ Étape "Accompagnants"
   │  ├─ Label ............................... "Nombre d'accompagnants"
   │  └─ Aucun ............................... "Aucun"
   │
   ├─ Étape "Repas"
   │  ├─ Label ............................... "Choix de repas"
   │  ├─ Allergies ........................... "Allergies ou régimes spécifiques"
   │  └─ Placeholder ......................... "Précisez vos éventuelles allergies..."
   │
   ├─ Étape "Informations pratiques"
   │  ├─ Titre ............................... "Informations pratiques"
   │  ├─ Accessibilité ....................... "Besoins d'accessibilité"
   │  ├─ Transport ........................... "Besoins de transport"
   │  └─ Hébergement ......................... "Besoins d'hébergement"
   │
   └─ Étape "Récapitulatif"
      ├─ Titre ............................... "Récapitulatif"
      ├─ Message ............................. "Vous pourrez modifier..."
      └─ Bouton .............................. "Valider ma réponse"
```

---

## 📍 Carte des emplacements dans le code

```
/app/guest/[token]/page.tsx
│
├─ LIGNE 309-313 ............ En-tête "Bonjour {prénom} 👋"
├─ LIGNE 330-332 ............ Nom de l'événement (event.name)
├─ LIGNE 336-346 ............ Date et heure (formatage)
├─ LIGNE 348-353 ............ Lieu (venueName + city)
├─ LIGNE 356-362 ............ Description (event.description)
├─ LIGNE 368-369 ............ Titre "Votre réponse"
├─ LIGNE 372-375 ............ Message deadline
│
├─ ÉTAPES DU FORMULAIRE
│  ├─ LIGNE 379-417 ......... Étape "Réponse" (Oui/Non)
│  ├─ LIGNE 420-466 ......... Étape "Accompagnants"
│  ├─ LIGNE 469-521 ......... Étape "Choix de repas"
│  ├─ LIGNE 524-588 ......... Étape "Informations pratiques"
│  ├─ LIGNE 591-634 ......... Étape "Consentements"
│  └─ LIGNE 691-761 ......... Étape "Récapitulatif"
│
└─ LIGNE 768-791 ............ Page de confirmation
```

---

## 🔧 Modifications les plus courantes

### 1. Changer le message de bienvenue
```tsx
// Fichier: /app/guest/[token]/page.tsx
// Ligne: 309-313

// ACTUEL
<h1>Bonjour {guest.firstName} 👋</h1>
<p>Vous êtes invité(e) à</p>

// EXEMPLES
<h1>Welcome {guest.firstName} 🎉</h1>
<p>You're invited to</p>

<h1>Salut {guest.firstName} !</h1>
<p>Tu es invité(e) à</p>
```

### 2. Changer "Votre réponse" en "RSVP"
```tsx
// Ligne: 368-369
<CardTitle>Votre réponse</CardTitle>
// ↓
<CardTitle>RSVP</CardTitle>
```

### 3. Ajouter le pays dans le lieu
```tsx
// Ligne: 351
{event.venueName}, {event.city}
// ↓
{event.venueName}, {event.city}, {event.country}
```

### 4. Format date en anglais
```tsx
// Ligne: 336
eventDate.toLocaleDateString("fr-FR", {...})
// ↓
eventDate.toLocaleDateString("en-US", {...})
```

### 5. Personnaliser "Participez-vous ?"
```
Interface Admin → /admin/events/[id]/rsvp-steps
→ Cliquez sur "Réponse"
→ Modifiez "Question"
```

---

## 📊 Tableau de correspondance

| Vous voyez dans le RSVP | Source | Où modifier |
|-------------------------|--------|-------------|
| "Les 10 ans de Weevup" | `Event.name` | Admin → Édition |
| "lundi 15 décembre 2025" | `Event.startsAt` | Admin → Édition |
| "20:00" | `Event.startsAt` | Admin → Édition |
| "Molitor Paris," | `Event.venueName` + `Event.city` | Admin → Édition |
| "Célébration des 10 ans..." | `Event.description` | Admin → Édition |
| "Merci de confirmer avant le" | Code ligne 372 | `/app/guest/[token]/page.tsx` |
| "Participez-vous ?" | `rsvpConfig.customSteps` | Admin → RSVP Steps |
| "✓ J'accepte avec plaisir" | `rsvpConfig.customSteps` | Admin → RSVP Steps |
| "Nombre d'accompagnants" | `rsvpConfig.customSteps` | Admin → RSVP Steps |
| "Choix de repas" | `rsvpConfig.customSteps` | Admin → RSVP Steps |
| Options ["Viande", "Poisson"] | `Event.mealOptions` | Admin → Config RSVP |

---

## 🎨 Personnalisation via Admin (sans code)

### Accès
```
https://votre-site.com/admin/events/[eventId]/rsvp-steps
```

### Actions possibles
- ✅ Modifier tous les textes des étapes
- ✅ Activer/désactiver des étapes
- ✅ Réordonner les étapes
- ✅ Ajouter des questions personnalisées
- ✅ Configurer les champs obligatoires

### Exemple: Personnaliser l'étape "Réponse"
```
1. Ouvrir /admin/events/[eventId]/rsvp-steps
2. Cliquer sur l'étape "Réponse"
3. Modifier:
   - Question: "Serez-vous des nôtres ?"
   - Oui: "Avec grand plaisir ! ✨"
   - Non: "Je ne pourrai pas venir"
   - Bouton: "Suivant →"
4. Cliquer "Sauvegarder"
```

**Changement immédiat** → Tous les invités voient les nouveaux textes.

---

## 🚀 Workflows courants

### Workflow 1: Événement multilingue (anglais)
```
1. Code → /app/guest/[token]/page.tsx
   - Ligne 309: "Hello" au lieu de "Bonjour"
   - Ligne 312: "You're invited to"
   - Ligne 336: toLocaleDateString("en-US")

2. Admin → /rsvp-steps
   - Response: "Will you attend?"
   - Yes: "Yes, I'll be there!"
   - No: "Sorry, I can't make it"
```

### Workflow 2: Événement sans repas
```
Admin → Édition événement
- "Choix de repas" → ☐ Désactivé

Résultat: L'étape "Repas" disparaît du RSVP
```

### Workflow 3: Simplifier le RSVP (minimum)
```
Admin → /rsvp-steps
- Désactiver "Accompagnants"
- Désactiver "Informations pratiques"
- Désactiver "Consentements"

Résultat: RSVP simplifié avec seulement Réponse + Récapitulatif
```

---

## 🎯 Checklist Express

Avant de publier votre RSVP:

**Contenu de base**
- [ ] Nom correct
- [ ] Date et heure correctes
- [ ] Lieu complet (nom + ville)
- [ ] Description claire
- [ ] Date limite RSVP définie

**Configuration**
- [ ] Accompagnants (Oui/Non)
- [ ] Repas (Oui/Non) + options
- [ ] Modules optionnels activés si besoin

**Personnalisation**
- [ ] Textes vérifiés dans /rsvp-steps
- [ ] Test du parcours complet
- [ ] Envoi d'un RSVP test à soi-même

---

## 📞 Aide

**Documentation complète**: `docs/RSVP_CUSTOMIZATION_GUIDE.md`
**Code source**: `/app/guest/[token]/page.tsx`
**Configuration**: `/admin/events/[id]/rsvp-steps`
