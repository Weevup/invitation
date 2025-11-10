# 🎨 ARCHITECTURE MODULAIRE - UX/UI SIMPLE ET ÉVOLUTIVE

## 🎯 PRINCIPE FONDAMENTAL

> **"Start simple, scale progressively"**

- ✅ Par défaut : Interface simple (RSVP classique actuel)
- ✅ Sur demande : Activation modules avancés
- ✅ Zéro friction : Ne montrer que ce qui est utilisé
- ✅ Progressive disclosure : Complexité cachée jusqu'à activation

---

## 🏗️ ARCHITECTURE EN 3 NIVEAUX

### **Niveau 1 : ÉVÉNEMENT SIMPLE (Existant - Aucun changement)**

Interface actuelle inchangée :
```
📋 Créer événement → ✉️ Inviter → 📊 Voir RSVP → ✅ Check-in
```

**Parfait pour** :
- Soirée d'entreprise simple
- Afterwork
- Cocktail
- Webinar

**Rien à activer, rien à configurer** 👍

---

### **Niveau 2 : ÉVÉNEMENT AVEC OPTIONS (Toggle simple)**

Dans le formulaire de création d'événement, ajout d'une section :

```
┌─────────────────────────────────────────────────┐
│  📦 FONCTIONNALITÉS AVANCÉES (Optionnel)        │
│                                                  │
│  [ ] 💼 Inscription & Facturation               │
│      → Gestion paiements, facturation B2B       │
│                                                  │
│  [ ] ✈️  Transport & Déplacements               │
│      → Organisation vols, trains, navettes      │
│                                                  │
│  [ ] 🏨 Hébergement                             │
│      → Gestion réservations hôtels              │
│                                                  │
│  [ ] 📅 Programme & Sessions                    │
│      → Workshops, ateliers, teambuilding        │
│                                                  │
│  [ ] 📊 Budget & Reporting                      │
│      → Suivi financier, rapports                │
│                                                  │
│  [ ] 🌍 Multi-langue                            │
│      → Interface FR/EN/ES/DE/IT                 │
└─────────────────────────────────────────────────┘
```

**Impact UX** :
- Si rien coché → Interface comme avant (simple)
- Si module coché → Nouveau menu apparaît dans la sidebar

---

### **Niveau 3 : ÉVÉNEMENT COMPLEXE (Modules activés)**

La sidebar s'adapte dynamiquement :

#### **Sans modules (défaut)** :
```
📊 Tableau de bord
📅 Événements
👥 Invités & RSVP
📈 Statistiques
⚙️  Paramètres
```

#### **Avec modules Transport + Hébergement** :
```
📊 Tableau de bord
📅 Événements
👥 Invités & RSVP
  └─ ✈️  Transport        ← NOUVEAU
  └─ 🏨 Hébergement       ← NOUVEAU
📈 Statistiques
⚙️  Paramètres
```

#### **Avec tous les modules** :
```
📊 Tableau de bord
📅 Événements
👥 Invités & RSVP
📦 Logistique
  ├─ ✈️  Transport
  ├─ 🏨 Hébergement
  └─ 📅 Sessions
💰 Budget
📈 Statistiques
⚙️  Paramètres
```

---

## 🎨 DESIGN PATTERN : PROGRESSIVE DISCLOSURE

### **Exemple 1 : Formulaire Inscription Participant**

#### **Version Simple (défaut)** :
```
┌────────────────────────┐
│ Prénom                 │
│ Nom                    │
│ Email                  │
│ Entreprise             │
│                        │
│ Présence : ○ Oui ○ Non │
│                        │
│   [ Confirmer ]        │
└────────────────────────┘
```

#### **Si module "Transport" activé** :
```
┌────────────────────────────────────────┐
│ Prénom, Nom, Email, Entreprise...      │
│ Présence : ● Oui ○ Non                 │
│                                         │
│ ✈️  DÉPLACEMENT (optionnel)            │ ← Apparaît seulement si activé
│ ┌─────────────────────────────────┐    │
│ │ [ ] J'ai besoin d'aide pour     │    │
│ │     organiser mon déplacement   │    │
│ │                                  │    │
│ │ Si oui, afficher formulaire...   │    │
│ └─────────────────────────────────┘    │
│                                         │
│   [ Confirmer ]                         │
└────────────────────────────────────────┘
```

### **Exemple 2 : Dashboard Admin**

#### **Version Simple** :
```
┌───────────────────────────────────┐
│  📊 APERÇU ÉVÉNEMENT              │
│  • 150 invités                    │
│  • 89 confirmés (59%)             │
│  • 15 en attente                  │
└───────────────────────────────────┘
```

#### **Avec module Transport activé** :
```
┌───────────────────────────────────┐
│  📊 APERÇU ÉVÉNEMENT              │
│  • 150 invités                    │
│  • 89 confirmés (59%)             │
│  • 15 en attente                  │
│                                    │
│  ✈️  TRANSPORT                     │ ← Card apparaît
│  • 45 demandes transport          │
│  • 12 vols à réserver             │
│  • 3 navettes à planifier         │
│  → Voir détails                   │
└───────────────────────────────────┘
```

---

## 🔧 IMPLÉMENTATION TECHNIQUE

### **1. Table EventModules**

```prisma
model Event {
  id       String @id @default(cuid())
  name     String
  // ... champs existants ...

  // Modules activés (JSON flexible)
  modules  Json?  @default("{}")
  // Exemple : { "registration": true, "transport": true, "accommodation": false }

  // OU version relationnelle (plus propre)
  activeModules EventModule[]
}

enum ModuleType {
  REGISTRATION    // Inscription & facturation
  TRANSPORT       // Transport & déplacements
  ACCOMMODATION   // Hébergement
  SESSIONS        // Workshops & sessions
  BUDGET          // Budget & reporting
  MULTILANG       // Multi-langue
}

model EventModule {
  id        String     @id @default(cuid())
  eventId   String
  event     Event      @relation(fields: [eventId], references: [id])

  type      ModuleType
  isActive  Boolean    @default(true)
  config    Json?      // Configuration spécifique du module

  @@unique([eventId, type])
}
```

### **2. Composant React Conditionnel**

```typescript
// components/admin/conditional-section.tsx
export function ConditionalSection({
  module,
  children
}: {
  module: ModuleType
  children: React.ReactNode
}) {
  const { event } = useEvent()
  const isModuleActive = event.modules?.[module] === true

  if (!isModuleActive) return null

  return <>{children}</>
}

// Usage dans la page
<ConditionalSection module="TRANSPORT">
  <TransportManagementCard />
</ConditionalSection>
```

### **3. Hook Custom**

```typescript
// hooks/use-event-modules.ts
export function useEventModules(eventId: string) {
  const { data: event } = useEvent(eventId)

  return {
    hasModule: (type: ModuleType) => event?.modules?.[type] === true,
    activeModules: Object.keys(event?.modules || {}).filter(k => event.modules[k]),
    toggleModule: async (type: ModuleType) => {
      // API call to toggle module
    }
  }
}

// Usage
const { hasModule } = useEventModules(eventId)

{hasModule('TRANSPORT') && <TransportSection />}
```

---

## 📐 WIREFRAMES SIMPLIFIÉS

### **Page Création Événement**

```
┌────────────────────────────────────────────────┐
│  📝 CRÉER UN ÉVÉNEMENT                         │
├────────────────────────────────────────────────┤
│                                                 │
│  INFORMATIONS DE BASE                           │
│  ┌──────────────────────────────┐              │
│  │ Nom de l'événement           │              │
│  │ Date & Heure                 │              │
│  │ Lieu                         │              │
│  │ Description                  │              │
│  └──────────────────────────────┘              │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │  💡 Besoin de fonctionnalités avancées ? │   │
│  │                                          │   │
│  │  [≡] Voir les modules disponibles       │   │ ← Bouton pliable
│  └─────────────────────────────────────────┘   │
│                                                 │
│  [ Annuler ]              [ Créer événement ]  │
└────────────────────────────────────────────────┘
```

**Après clic sur "Voir les modules"** :

```
┌────────────────────────────────────────────────┐
│  📝 CRÉER UN ÉVÉNEMENT                         │
├────────────────────────────────────────────────┤
│  ... Infos de base ...                         │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │  💡 MODULES OPTIONNELS                   │   │
│  │                                          │   │
│  │  ☑ 💼 Inscription & Paiement             │   │
│  │     Gestion inscriptions payantes        │   │
│  │                                          │   │
│  │  ☐ ✈️  Transport                         │   │
│  │     Vols, trains, navettes               │   │
│  │                                          │   │
│  │  ☐ 🏨 Hébergement                        │   │
│  │     Réservations hôtels                  │   │
│  │                                          │   │
│  │  ☐ 📅 Programme                          │   │
│  │     Workshops, sessions                  │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  [ Annuler ]              [ Créer événement ]  │
└────────────────────────────────────────────────┘
```

### **Page Gestion Événement (Vue Admin)**

#### **Sans modules** :
```
┌──────────────────────────────────────────────────┐
│ 🎉 Séminaire Marketing 2025                      │
│ 📅 15 mars 2025 • Paris                          │
├──────────────────────────────────────────────────┤
│                                                   │
│  ONGLETS                                          │
│  [●Aperçu] [○Invités] [○Emails] [○Paramètres]   │
│                                                   │
│  📊 STATISTIQUES                                  │
│  ┌─────────┬─────────┬─────────┬─────────┐       │
│  │   150   │   89    │   15    │   46    │       │
│  │ Invités │Confirmés│Attente  │Déclinés │       │
│  └─────────┴─────────┴─────────┴─────────┘       │
│                                                   │
│  ACTIONS RAPIDES                                  │
│  [✉️ Envoyer invitations] [➕ Ajouter invités]   │
│                                                   │
└──────────────────────────────────────────────────┘
```

#### **Avec modules Transport + Programme** :
```
┌──────────────────────────────────────────────────┐
│ 🎉 Séminaire Marketing 2025                      │
│ 📅 15 mars 2025 • Paris                          │
├──────────────────────────────────────────────────┤
│                                                   │
│  ONGLETS                                          │
│  [●Aperçu] [○Invités] [○Transport] [○Programme]  │ ← Nouveaux onglets
│                    [○Emails] [○Paramètres]        │
│                                                   │
│  📊 STATISTIQUES                                  │
│  ┌─────────┬─────────┬─────────┬─────────┐       │
│  │   150   │   89    │   15    │   46    │       │
│  │ Invités │Confirmés│Attente  │Déclinés │       │
│  └─────────┴─────────┴─────────┴─────────┘       │
│                                                   │
│  ✈️  TRANSPORT                                    │ ← Nouvelle section
│  ┌────────────────────────────────────────┐       │
│  │ • 45 demandes reçues                   │       │
│  │ • 12 vols à réserver                   │       │
│  │ • 3 navettes planifiées                │       │
│  │ → [Gérer transport]                    │       │
│  └────────────────────────────────────────┘       │
│                                                   │
│  📅 PROGRAMME                                     │ ← Nouvelle section
│  ┌────────────────────────────────────────┐       │
│  │ • 5 workshops créés                    │       │
│  │ • 89 inscriptions sessions             │       │
│  │ → [Gérer programme]                    │       │
│  └────────────────────────────────────────┘       │
│                                                   │
└──────────────────────────────────────────────────┘
```

---

## 🎯 WORKFLOW UTILISATEUR TYPE

### **Cas 1 : Événement Simple (défaut)**

1. Admin clique "Créer événement"
2. Remplit nom, date, lieu
3. Clique "Créer"
4. **Interface classique**, aucune complexité

**Temps** : 2 minutes
**Expérience** : Identique à l'actuel ✅

---

### **Cas 2 : Séminaire International**

1. Admin clique "Créer événement"
2. Remplit infos de base
3. Clique "Voir modules disponibles"
4. Coche :
   - ✅ Transport
   - ✅ Hébergement
   - ✅ Programme
5. Clique "Créer"
6. **Assistant de configuration** s'ouvre :
   ```
   ┌────────────────────────────────────┐
   │  🎉 CONFIGURATION MODULES          │
   │                                     │
   │  ✈️  Transport (1/3)                │
   │  ───────────────────────────────   │
   │  Où se situe votre événement ?     │
   │  ○ France  ○ Europe  ● International│
   │                                     │
   │  Prévoyez-vous des navettes ?      │
   │  ● Oui (aéroport ↔ hôtel)         │
   │  ○ Non                             │
   │                                     │
   │  [← Précédent]    [Suivant →]     │
   └────────────────────────────────────┘
   ```
7. Termine la configuration (3-4 écrans max)
8. **Interface enrichie** avec nouveaux menus

**Temps** : 5-7 minutes
**Expérience** : Guidée, pas intimidante ✅

---

## 🚦 RÈGLES UX STRICTES

### **DO ✅**
- Commencer simple par défaut
- Proposer modules lors création événement
- Permettre activation/désactivation après création
- Grouper fonctionnalités liées (Transport dans "Logistique")
- Afficher compteurs (badges) pour attirer l'attention
- Utiliser des assistants pour configuration

### **DON'T ❌**
- Afficher tous les champs d'un coup
- Forcer l'utilisation des modules
- Mélanger fonctionnalités simples et avancées
- Utiliser jargon technique
- Créer des menus à plus de 2 niveaux

---

## 📱 RESPONSIVE & MOBILE

- Desktop : Sidebar complète
- Tablet : Sidebar collapsible
- Mobile : Menu hamburger avec sections actives uniquement

---

## 🎨 DESIGN SYSTEM

### **Couleurs par Module**

```
🔵 Bleu     → Inscription & RSVP (base)
🟢 Vert     → Transport (mouvement)
🟣 Violet   → Hébergement (confort)
🟠 Orange   → Programme (activité)
🔴 Rouge    → Budget (finances)
🔵 Cyan     → Multi-langue (global)
```

### **Icônes Cohérentes**

Utiliser Lucide Icons avec cohérence :
- ✈️ `Plane` pour transport
- 🏨 `Hotel` pour hébergement
- 📅 `Calendar` pour programme
- 💰 `DollarSign` pour budget

---

## 🔄 MIGRATION PROGRESSIVE

### **Phase 1 (Semaine 1)** : Infrastructure
- Créer modèle `EventModule`
- API toggle modules
- Hook `useEventModules`

### **Phase 2 (Semaine 2)** : UI Basique
- Section "Modules optionnels" dans création événement
- Sidebar dynamique
- Composant `<ConditionalSection>`

### **Phase 3 (Semaines 3-4)** : Premier Module
- Implémenter **Transport** (module test)
- Formulaire participant conditionnel
- Dashboard admin conditionnel

### **Phase 4+ (Itératif)** : Autres Modules
- Ajouter modules un par un
- Tester UX à chaque étape
- Recueillir feedback

---

## 🎯 RÉSULTAT FINAL

### **Pour l'utilisateur novice** :
> "J'ai créé un événement simple en 2 minutes, exactement comme avant."

### **Pour l'utilisateur avancé** :
> "J'ai activé Transport et Hébergement, et l'interface s'est adaptée avec juste ce dont j'ai besoin."

### **Pour l'utilisateur expert** :
> "J'ai tous les modules actifs mais l'interface reste claire grâce au regroupement logique."

---

## ✅ VALIDATION AVEC VOUS

**Avant de coder quoi que ce soit, je veux confirmer** :

1. ✅ Interface simple par défaut (actuelle) ?
2. ✅ Activation modules optionnelle ?
3. ✅ Sidebar qui s'adapte selon modules actifs ?
4. ✅ Progressive disclosure (complexité cachée) ?
5. ✅ Assistants de configuration ?

**Qu'en pensez-vous ?** 🤔

On peut aussi faire des ajustements avant de commencer l'implémentation.
