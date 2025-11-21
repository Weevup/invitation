# Guide complet : Personnaliser tous les champs du RSVP

Ce document identifie **tous les endroits** où vous pouvez modifier les champs affichés dans le formulaire RSVP de vos invités.

## 📍 Vue d'ensemble

Le RSVP que vos invités voient est composé de plusieurs sections personnalisables :

```
┌─────────────────────────────────────┐
│ 🎯 EN-TÊTE D'ACCUEIL               │  → Section 1
├─────────────────────────────────────┤
│ 📅 INFORMATIONS DE L'ÉVÉNEMENT      │  → Section 2
├─────────────────────────────────────┤
│ ✍️ FORMULAIRE DE RÉPONSE            │  → Section 3
│   - Votre réponse (Oui/Non)         │
│   - Accompagnants                   │
│   - Choix de repas                  │
│   - Informations pratiques          │
│   - Consentements                   │
└─────────────────────────────────────┘
```

---

## 1️⃣ EN-TÊTE D'ACCUEIL

### "Bonjour {prénom} 👋"
**Fichier**: `/app/guest/[token]/page.tsx` (ligne 309-313)

```tsx
<h1 className="text-4xl font-bold mb-2 text-[#004645]">
  Bonjour {guest.firstName} 👋
</h1>
<p className="text-[#004645]/70">Vous êtes invité(e) à</p>
```

**Pour modifier**:
- Changez le texte "Bonjour" par "Hello", "Bienvenue", etc.
- Modifiez l'emoji 👋
- Changez le sous-texte "Vous êtes invité(e) à"

---

## 2️⃣ INFORMATIONS DE L'ÉVÉNEMENT

### Nom de l'événement
**Source**: Base de données (modèle `Event`)
**Où modifier**:
- Via l'interface admin: `/admin/events/[id]/edit`
- Dans la base de données: champ `Event.name`

**Code d'affichage**: `/app/guest/[token]/page.tsx` (ligne 330-332)
```tsx
<CardTitle className="text-2xl text-[#004645]">
  {event.name}
</CardTitle>
```

---

### Date et heure
**Source**: Base de données (`Event.startsAt`)
**Où modifier**: Via l'admin ou directement en DB

**Code d'affichage**: `/app/guest/[token]/page.tsx` (ligne 334-347)
```tsx
{eventDate.toLocaleDateString("fr-FR", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
})}{" "}
à{" "}
{eventDate.toLocaleTimeString("fr-FR", {
  hour: "2-digit",
  minute: "2-digit",
})}
```

**Pour personnaliser le format**:
- Changez `"fr-FR"` pour autre langue (`"en-US"`, `"de-DE"`, etc.)
- Modifiez les options de formatage
- Retirez `weekday: "long"` pour enlever le jour de la semaine

---

### Lieu (venueName et city)
**Source**: Base de données (`Event.venueName`, `Event.city`)
**Où modifier**: Via l'admin

**Code d'affichage**: `/app/guest/[token]/page.tsx` (ligne 348-353)
```tsx
{event.venueName && (
  <div className="flex items-center">
    <MapPin className="h-4 w-4 mr-2 text-[#009197]" />
    {event.venueName}, {event.city}
  </div>
)}
```

**Pour modifier**:
- Changez le séparateur `,` entre venueName et city
- Ajoutez l'adresse complète: `{event.address}`
- Changez l'icône `<MapPin />` par autre icône

---

### Description
**Source**: Base de données (`Event.description`)
**Où modifier**: Via l'admin

**Code d'affichage**: `/app/guest/[token]/page.tsx` (ligne 356-362)
```tsx
{event.description && (
  <CardContent>
    <p className="text-[#004645]/70 whitespace-pre-wrap">
      {event.description}
    </p>
  </CardContent>
)}
```

---

## 3️⃣ FORMULAIRE DE RÉPONSE

### Titre de la section
**Code**: `/app/guest/[token]/page.tsx` (ligne 368-369)
```tsx
<CardTitle className="text-[#004645]">
  Votre réponse
</CardTitle>
```

**Pour modifier**: Changez "Votre réponse" par "Votre confirmation", "RSVP", etc.

---

### Message de deadline RSVP
**Source**: Base de données (`Event.rsvpDeadline`)
**Code**: `/app/guest/[token]/page.tsx` (ligne 371-375)

```tsx
<CardDescription className="text-[#004645]/70">
  Merci de confirmer votre participation avant le{" "}
  {event.rsvpDeadline &&
    new Date(event.rsvpDeadline).toLocaleDateString("fr-FR")}
</CardDescription>
```

**Pour modifier**:
- Changez le texte "Merci de confirmer votre participation avant le"
- Changez le format de date
- Ajoutez une condition: `{event.rsvpDeadline ? "..." : "dans les meilleurs délais"}`

---

## 4️⃣ ÉTAPES DU FORMULAIRE (Personnalisables)

### ⚙️ Configuration centralisée

Toutes les étapes peuvent être personnalisées via **deux méthodes**:

#### Méthode 1: Via l'interface admin
**URL**: `/admin/events/[eventId]/rsvp-steps`

Cette page permet de:
- Activer/désactiver des étapes
- Réordonner les étapes
- Personnaliser tous les textes
- Ajouter des étapes personnalisées

#### Méthode 2: Via la base de données
**Table**: `Event`
**Champ**: `rsvpConfig` (JSON)

Structure:
```json
{
  "customSteps": [
    {
      "id": "response",
      "type": "response",
      "label": "Votre réponse",
      "enabled": true,
      "order": 0,
      "texts": {
        "responseQuestion": "Participez-vous à l'événement ?",
        "responseYes": "✓ J'accepte avec plaisir",
        "responseNo": "✗ Je ne peux malheureusement pas venir",
        "continueButton": "Continuer"
      }
    }
  ]
}
```

---

### 📝 Textes personnalisables par étape

#### ÉTAPE: Response (Oui/Non)
**Type**: `response`
**Textes personnalisables** (via `event.rsvpConfig.customSteps`):

| Clé | Valeur par défaut | Ligne dans le code |
|-----|-------------------|-------------------|
| `responseQuestion` | "Participez-vous à l'événement ?" | 385 |
| `responseYes` | "✓ J'accepte avec plaisir" | 396 |
| `responseNo` | "✗ Je ne peux malheureusement pas venir" | 402 |
| `continueButton` | "Continuer" | 414 |

**Code**: `/app/guest/[token]/page.tsx` (lignes 379-417)

**Exemple de personnalisation**:
```json
{
  "texts": {
    "responseQuestion": "Serez-vous présent(e) ?",
    "responseYes": "Oui, je viens ! 🎉",
    "responseNo": "Malheureusement, je ne peux pas",
    "continueButton": "Suivant →"
  }
}
```

---

#### ÉTAPE: Plus Ones (Accompagnants)
**Type**: `plus-ones`
**Textes personnalisables**:

| Clé | Valeur par défaut | Ligne |
|-----|-------------------|-------|
| `plusOnesLabel` | "Nombre d'accompagnants (max X)" | 427 |
| `plusOnesNone` | "Aucun" | 439 |
| `backButton` | "Retour" | 453 |
| `continueButton` | "Continuer" | 462 |

**Code**: `/app/guest/[token]/page.tsx` (lignes 420-466)

**Configuration max accompagnants**:
- **Source**: `Event.maxPlusOnes` et `Event.allowPlusOnes`
- **Où modifier**: Via l'admin ou DB

---

#### ÉTAPE: Meal (Choix de repas)
**Type**: `meal`
**Textes personnalisables**:

| Clé | Valeur par défaut | Ligne |
|-----|-------------------|-------|
| `mealLabel` | "Choix de repas" | 476 |
| `allergiesLabel` | "Allergies ou régimes spécifiques" | 491 |
| `allergiesPlaceholder` | "Précisez vos éventuelles allergies..." | 496 |
| `backButton` | "Retour" | 508 |
| `continueButton` | "Continuer" | 517 |

**Options de repas**:
- **Source**: `Event.mealOptions` (array de strings)
- **Où modifier**: Via l'admin
- **Exemple**: `["Viande", "Poisson", "Végétarien", "Végan"]`

**Code**: `/app/guest/[token]/page.tsx` (lignes 469-521)

---

#### ÉTAPE: Practical (Informations pratiques)
**Type**: `practical`
**Textes personnalisables**:

| Clé | Valeur par défaut | Ligne |
|-----|-------------------|-------|
| `practicalTitle` | "Informations pratiques" | 530 |
| `accessibilityLabel` | "Besoins d'accessibilité" | 534 |
| `accessibilityPlaceholder` | "PMR, assistance particulière..." | 540 |
| `transportLabel` | "Besoins de transport" | 546 |
| `transportPlaceholder` | "Navette, parking..." | 551 |
| `lodgingLabel` | "Besoins d'hébergement" | 557 |
| `lodgingPlaceholder` | "Hôtel, nuitée..." | 562 |
| `backButton` | "Retour" | 575 |
| `continueButton` | "Continuer" | 584 |

**Activation des champs**:
- **Source**: `Event.enableAccessibility`, `Event.enableTransport`, `Event.enableLodging`
- **Où modifier**: Via l'admin

**Code**: `/app/guest/[token]/page.tsx` (lignes 524-588)

---

#### ÉTAPE: Consent (Consentements)
**Type**: `consent`
**Textes personnalisables**:

| Clé | Valeur par défaut | Ligne |
|-----|-------------------|-------|
| `consentLabel` | "J'autorise la prise et l'utilisation de photographies..." | 608 |
| `backButton` | "Retour" | 621 |
| `continueButton` | "Continuer" | 630 |

**Activation**:
- **Source**: `Event.enablePhotoConsent`

**Code**: `/app/guest/[token]/page.tsx` (lignes 591-634)

---

#### ÉTAPE: Summary (Récapitulatif)
**Type**: `summary`
**Textes personnalisables**:

| Clé | Valeur par défaut | Ligne |
|-----|-------------------|-------|
| `summaryTitle` | "Récapitulatif" | 697 |
| `summaryIntro` | "Vous pourrez modifier votre réponse jusqu'au..." | 729 |
| `submitButton` | "Valider ma réponse" | 756 |

**Code**: `/app/guest/[token]/page.tsx` (lignes 691-761)

---

## 5️⃣ ÉTAPES PERSONNALISÉES

### Ajouter des étapes sur-mesure
**Où**: `/admin/events/[eventId]/rsvp-steps`

**Types d'étapes disponibles**:

1. **Message**: Afficher un texte informatif
2. **Custom Field**: Ajouter une question personnalisée
   - Types: text, textarea, select, radio, checkbox

**Exemple de custom field**:
```json
{
  "id": "custom-diet",
  "type": "custom",
  "label": "Préférences alimentaires",
  "enabled": true,
  "order": 5,
  "customField": {
    "type": "select",
    "label": "Quel type de cuisine préférez-vous ?",
    "placeholder": "Sélectionnez...",
    "required": true,
    "options": ["Française", "Italienne", "Asiatique", "Autre"]
  }
}
```

**Code**: `/components/rsvp-custom-steps.tsx`

---

## 6️⃣ MODIFICATION DIRECTE DU CODE

### Fichiers principaux à modifier

#### 1. Interface RSVP Guest
**Fichier**: `/app/guest/[token]/page.tsx`
**Que modifier**:
- Textes hardcodés (lignes 309-375)
- Structure du formulaire
- Styles et couleurs
- Animations

#### 2. Logique des étapes RSVP
**Fichier**: `/lib/rsvp-steps.ts`
**Que modifier**:
- Ordre des étapes par défaut
- Conditions d'affichage
- Labels par défaut

#### 3. Composants RSVP
**Fichiers**:
- `/components/rsvp-progress.tsx` - Barre de progression
- `/components/rsvp-confirmation.tsx` - Page de confirmation
- `/components/rsvp-custom-steps.tsx` - Étapes personnalisées

---

## 7️⃣ EXEMPLES DE MODIFICATIONS COURANTES

### Exemple 1: Changer "Votre réponse" en "RSVP"

**Fichier**: `/app/guest/[token]/page.tsx` (ligne 368)
```tsx
// AVANT
<CardTitle className="text-[#004645]">
  Votre réponse
</CardTitle>

// APRÈS
<CardTitle className="text-[#004645]">
  RSVP
</CardTitle>
```

---

### Exemple 2: Ajouter le pays dans le lieu

**Fichier**: `/app/guest/[token]/page.tsx` (ligne 348-353)
```tsx
// AVANT
{event.venueName && (
  <div className="flex items-center">
    <MapPin className="h-4 w-4 mr-2 text-[#009197]" />
    {event.venueName}, {event.city}
  </div>
)}

// APRÈS
{event.venueName && (
  <div className="flex items-center">
    <MapPin className="h-4 w-4 mr-2 text-[#009197]" />
    {event.venueName}, {event.city}, {event.country}
  </div>
)}
```

---

### Exemple 3: Changer le format de la date en anglais

**Fichier**: `/app/guest/[token]/page.tsx` (ligne 336-346)
```tsx
// AVANT
{eventDate.toLocaleDateString("fr-FR", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
})}

// APRÈS
{eventDate.toLocaleDateString("en-US", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
})}
```

---

### Exemple 4: Personnaliser les textes via l'admin

**Étape 1**: Allez sur `/admin/events/[eventId]/rsvp-steps`

**Étape 2**: Cliquez sur l'étape "Réponse"

**Étape 3**: Modifiez les textes:
- Question: "Serez-vous des nôtres ?"
- Oui: "Avec grand plaisir ! ✨"
- Non: "Je ne pourrai pas être présent(e)"

**Étape 4**: Sauvegardez

Les changements sont **immédiats** pour tous les invités.

---

## 8️⃣ RÉFÉRENCE COMPLÈTE DES CHAMPS

### Champs de la base de données Event

| Champ | Type | Affichage RSVP | Où modifier |
|-------|------|----------------|-------------|
| `name` | String | Titre de l'événement | Admin |
| `startsAt` | DateTime | Date et heure | Admin |
| `endsAt` | DateTime | (optionnel) | Admin |
| `venueName` | String | Nom du lieu | Admin |
| `address` | String | Adresse complète | Admin |
| `city` | String | Ville | Admin |
| `country` | String | Pays | Admin |
| `description` | Text | Description de l'événement | Admin |
| `rsvpDeadline` | DateTime | Date limite de réponse | Admin |
| `maxPlusOnes` | Int | Max accompagnants | Admin |
| `allowPlusOnes` | Boolean | Activer accompagnants | Admin |
| `requireMeal` | Boolean | Activer choix de repas | Admin |
| `mealOptions` | String[] | Options de repas | Admin |
| `enableAccessibility` | Boolean | Activer accessibilité | Admin |
| `enableTransport` | Boolean | Activer transport | Admin |
| `enableLodging` | Boolean | Activer hébergement | Admin |
| `enablePhotoConsent` | Boolean | Activer consentement photos | Admin |
| `rsvpConfig` | JSON | Configuration étapes | Admin |

---

## 9️⃣ CHECKLIST DE PERSONNALISATION

Pour personnaliser complètement votre RSVP :

### Contenu
- [ ] Nom de l'événement
- [ ] Date et heure
- [ ] Lieu (nom, ville, pays)
- [ ] Description
- [ ] Date limite RSVP
- [ ] Programme (optionnel)
- [ ] Dress code (optionnel)

### Configuration formulaire
- [ ] Autoriser accompagnants (Oui/Non)
- [ ] Nombre max d'accompagnants
- [ ] Activer choix de repas (Oui/Non)
- [ ] Définir options de repas
- [ ] Activer accessibilité
- [ ] Activer transport
- [ ] Activer hébergement
- [ ] Activer consentement photos

### Personnalisation textes
- [ ] Aller sur `/admin/events/[id]/rsvp-steps`
- [ ] Personnaliser chaque étape activée
- [ ] Réordonner les étapes si besoin
- [ ] Ajouter des étapes personnalisées

### Modifications avancées (code)
- [ ] Modifier l'en-tête d'accueil
- [ ] Changer les couleurs/styles
- [ ] Modifier le format de date
- [ ] Personnaliser les icônes
- [ ] Ajouter des champs custom

---

## 🔟 RÉSUMÉ : Où trouver quoi

| Ce que vous voulez changer | Où le faire |
|---------------------------|-------------|
| **Nom, date, lieu, description** | Admin → Édition de l'événement |
| **Options de repas** | Admin → Configuration RSVP |
| **Accompagnants (oui/non + max)** | Admin → Configuration RSVP |
| **Textes du formulaire** | Admin → `/events/[id]/rsvp-steps` |
| **Ordre des étapes** | Admin → `/events/[id]/rsvp-steps` |
| **Étapes personnalisées** | Admin → `/events/[id]/rsvp-steps` |
| **Format de date** | Code → `/app/guest/[token]/page.tsx` |
| **Couleurs et styles** | Code → `/app/guest/[token]/page.tsx` |
| **Structure complète** | Code → `/app/guest/[token]/page.tsx` |

---

## 🎯 Aide rapide

**Vous voulez modifier...**

### "Les 10 ans de Weevup"
→ Admin → Édition événement → Champ "Nom"

### "lundi 15 décembre 2025 à 20:00"
→ Admin → Édition événement → Champ "Date de début"
→ Pour le format : Code ligne 336-346

### "Molitor Paris,"
→ Admin → Édition événement → Champs "Nom du lieu" et "Ville"

### "Célébration des 10 ans..."
→ Admin → Édition événement → Champ "Description"

### "Merci de confirmer votre participation avant le"
→ Code ligne 372 OU Admin → RSVP Steps → Step Summary → texts.summaryIntro

### Toutes les questions du formulaire
→ Admin → `/events/[id]/rsvp-steps` → Modifier chaque étape

---

**Besoin d'aide supplémentaire ?**
Consultez les fichiers de référence :
- `/lib/rsvp-steps.ts` - Logique des étapes
- `/components/rsvp-custom-steps.tsx` - Étapes personnalisées
- `/app/admin/events/[id]/rsvp-steps/page.tsx` - Interface de configuration
