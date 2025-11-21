# Propositions d'Étapes RSVP pour l'Événementiel

## 📋 Vue d'ensemble

Ce document propose des types d'étapes et de questions enrichis pour créer des formulaires RSVP complets, adaptés aux besoins variés de l'événementiel professionnel et privé.

---

## 🎯 Nouveaux Types d'Étapes Proposés

### 1. **Informations Professionnelles** (`professional-info`)

**Cas d'usage** : Conférences, salons, événements networking, B2B

**Champs disponibles** :
- **Entreprise** (texte) - Nom de l'organisation
- **Fonction** (texte) - Poste occupé
- **Secteur d'activité** (select) - Liste personnalisable
- **Taille de l'entreprise** (select) - TPE, PME, ETI, Grand groupe
- **Objectifs de participation** (textarea) - Pourquoi participer ?
- **Domaines d'intérêt** (multi-select) - Technologies, Marketing, Sales, etc.

**Exemple d'utilisation** :
```
Salon Tech 2025
→ Étape "Profil professionnel"
  - Entreprise: [________]
  - Fonction: [________]
  - Je suis intéressé par: ☐ IA ☐ Cloud ☐ Cybersécurité ☐ DevOps
```

---

### 2. **Ateliers & Sessions** (`workshop-registration`)

**Cas d'usage** : Conférences avec sessions parallèles, formation, masterclass

**Champs disponibles** :
- **Sessions disponibles** (multi-select avec limite) - Choix de workshops
- **Horaires préférés** (time-slots) - Sélection de créneaux
- **Niveau d'expertise** (select) - Débutant, Intermédiaire, Expert
- **Matériel nécessaire** (checkbox) - PC portable, tablette, etc.
- **Préparation requise** (info + checkbox) - Prérequis logiciels

**Fonctionnalités** :
- Limite de places par atelier (affichage en temps réel)
- Conflits d'horaires détectés automatiquement
- Suggestions basées sur le profil

**Exemple** :
```
Conférence DevOps 2025
→ Étape "Sélection d'ateliers"

  🕐 10h-12h
  ☐ Kubernetes avancé (12/30 places) [Intermédiaire]
  ☐ CI/CD avec GitLab (5/20 places) [Débutant]

  🕑 14h-16h
  ☐ Terraform en production (COMPLET)
  ☐ Monitoring avec Prometheus (18/25 places)
```

---

### 3. **Préférences Réseautage** (`networking-preferences`)

**Cas d'usage** : Events networking, speed business meetings, B2B matchmaking

**Champs disponibles** :
- **Profil de networking** (select) - Cherche clients, partenaires, investisseurs, talents
- **Centres d'intérêt business** (multi-select)
- **Disponibilité pour rendez-vous** (time-slots)
- **Pitch elevator** (textarea, max 150 caractères)
- **LinkedIn / Site web** (URL)
- **Préférence de contact** (checkbox) - Email, LinkedIn, Téléphone

**Exemple** :
```
Business Networking Event
→ Étape "Profil networking"

  Je recherche : ☐ Clients ☑ Partenaires ☐ Investisseurs

  Mon pitch (150 car.) :
  [Fondateur startup SaaS RH, cherche partenaires commerciaux...]

  Disponible pour RDV : ☑ Jeudi 14h-17h ☑ Vendredi 9h-12h
```

---

### 4. **Informations Groupe/Délégation** (`group-delegation`)

**Cas d'usage** : Événements corporate, séminaires d'entreprise, groupes

**Champs disponibles** :
- **Nombre total de participants** (number)
- **Liste des participants** (dynamic fields) - Nom, prénom, fonction, email
- **Besoins spécifiques par personne** (textarea par participant)
- **Budget formation** (select ou number) - Si applicable
- **Autorité de signature** (checkbox) - Pour facturation

**Fonctionnalités** :
- Ajout/suppression dynamique de participants
- Import CSV de liste
- Export PDF de la délégation

**Exemple** :
```
Séminaire Management 2025
→ Étape "Composition de votre délégation"

  Nombre de participants : 5

  👤 Participant 1
     Nom: Dupont | Prénom: Jean | Email: j.dupont@...
     Fonction: Directeur RH
     Régime spécial: ☐ Végétarien ☐ Sans gluten

  👤 Participant 2...

  [+ Ajouter un participant] [📥 Importer CSV]
```

---

### 5. **Besoins Techniques** (`technical-requirements`)

**Cas d'usage** : Conférences, speakers, exposants, stands

**Champs disponibles** :
- **Matériel audiovisuel** (multi-select) - Vidéoprojecteur, micro, écran
- **Connexion internet** (select) - Wifi, câblé, débit requis
- **Mobilier** (multi-select) - Tables, chaises, podium
- **Électricité** (number) - Nombre de prises nécessaires
- **Besoins spécifiques** (textarea)
- **Setup requis** (datetime) - Heure d'installation

**Exemple** :
```
Salon Expo 2025 - Stand Exposant
→ Étape "Besoins techniques"

  Matériel AV :
  ☑ Écran 55" ☑ 2x Spots LED ☐ Sonorisation

  Électricité : [4] prises 220V

  Installation requise : 📅 Mercredi 8h
```

---

### 6. **Hébergement & Voyage** (`travel-accommodation`)

**Cas d'usage** : Événements multi-jours, conférences internationales

**Champs disponibles** :
- **Besoin d'hébergement** (yes/no)
- **Type de chambre** (select) - Simple, double, suite
- **Dates d'arrivée/départ** (date range)
- **Compagnon de chambre** (text) - Nom si partage souhaité
- **Moyen de transport** (select) - Avion, train, voiture
- **Besoin de navette** (yes/no + horaires)
- **Vol/Train** (text) - Numéro et horaires

**Fonctionnalités** :
- Calcul automatique du nombre de nuits
- Suggestion de navettes en fonction des arrivées

**Exemple** :
```
Conférence Internationale Paris 2025
→ Étape "Hébergement & Voyage"

  Hébergement : ☑ Oui
  Type : ◉ Chambre simple ○ Chambre double

  📅 Arrivée : 14/06/2025
  📅 Départ : 16/06/2025
  → 2 nuits | 280€ TTC

  Transport :
  ✈️ Vol Air France AF1234 - Arrivée CDG 15h20
  🚐 Navette aéroport : ☑ Oui (départ 16h)
```

---

### 7. **Régime Alimentaire Détaillé** (`dietary-detailed`)

**Cas d'usage** : Galas, dîners, événements avec repas élaborés

**Champs disponibles** :
- **Régime principal** (select) - Omnivore, Végétarien, Vegan, Pescetarien
- **Restrictions religieuses** (multi-select) - Halal, Casher
- **Allergies** (multi-select + textarea) - Liste prédéfinie + autre
- **Intolérances** (multi-select) - Gluten, lactose, fruits à coque
- **Choix de menu** (select avec images) - Entrée, plat, dessert
- **Boissons** (multi-select) - Alcool, soft, préférences

**Fonctionnalités** :
- Photos des plats
- Détection de conflits (ex: végétarien + choix viande)
- Export pour traiteur au format standardisé

**Exemple** :
```
Gala de Charité 2025
→ Étape "Préférences gastronomiques"

  Régime : ◉ Végétarien ○ Vegan ○ Omnivore

  Allergies :
  ☑ Fruits à coque ☐ Crustacés ☐ Gluten
  ☐ Lactose ☐ Œufs ☐ Autre : [_______]

  Menu végétarien :
  Entrée : ◉ Salade grecque ○ Houmous maison
  Plat   : ◉ Risotto champignons ○ Curry légumes
  Dessert: ◉ Tarte citron ○ Fondant chocolat
```

---

### 8. **Engagement & Consentements** (`engagement-consents`)

**Cas d'usage** : RGPD, marketing, communication événementielle

**Champs disponibles** :
- **Consentement photos/vidéos** (checkbox + détails)
- **Newsletter événement** (checkbox)
- **Partage de coordonnées** (checkbox) - Avec sponsors/exposants
- **Badge nominatif** (checkbox) - Affichage nom/entreprise
- **Répertoire participants** (checkbox) - Annuaire networking
- **Communications futures** (multi-checkbox) - Email, SMS, téléphone

**Fonctionnalités** :
- Textes personnalisables RGPD-compliant
- Export des consentements pour audit
- Gestion du retrait de consentement

**Exemple** :
```
TechConf 2025
→ Étape "Consentements & Communications"

  📸 Médias
  ☑ J'autorise la captation de mon image durant l'événement
    pour usage sur les réseaux sociaux et site web

  📧 Communications
  ☑ Newsletter mensuelle TechConf
  ☐ Offres partenaires (sponsors)
  ☑ Inclusion dans l'annuaire participants (networking)

  🏷️ Badge
  Afficher sur mon badge :
  ☑ Nom complet ☑ Entreprise ☐ Fonction
```

---

### 9. **Activités Parallèles** (`side-activities`)

**Cas d'usage** : Team building, activités sociales, soirées

**Champs disponibles** :
- **Soirée de gala** (yes/no + accompagnant)
- **Activités sportives** (multi-select) - Golf, running, yoga
- **Visites culturelles** (multi-select) - Musées, city tour
- **Team building** (select) - Type d'activité préféré
- **Niveau physique** (select) - Pour activités sportives
- **Accompagnants non-inscrits** (number + noms)

**Exemple** :
```
Séminaire + Team Building
→ Étape "Activités parallèles"

  🌃 Soirée de gala (Jeudi 20h)
  ☑ Je participe
  ☑ +1 accompagnant : Sophie Martin

  🏃 Activités sportives (Vendredi matin)
  ☑ Course 10km (7h) - Niveau : ◉ Débutant ○ Confirmé
  ☐ Yoga (8h30)
  ☐ Golf 9 trous (9h) - [COMPLET]

  🏛️ Visite culturelle (Samedi après-midi)
  ◉ Musée du Louvre ○ Château de Versailles
```

---

### 10. **Questions Personnalisées Avancées** (`custom-advanced`)

**Cas d'usage** : Enquêtes, sondages, feedback pré-événement

**Types de champs disponibles** :
- **Texte court** (input) - Questions simples
- **Texte long** (textarea) - Questions ouvertes
- **Choix unique** (radio) - QCM
- **Choix multiple** (checkbox) - Plusieurs réponses
- **Échelle de notation** (1-5 étoiles, 1-10) - Évaluation
- **Date/Heure** (datetime) - Disponibilités
- **Fichier** (upload) - CV, présentation, etc.
- **URL** (input URL) - Liens réseaux sociaux
- **Numéro de téléphone** (tel) - Format international
- **Email** (email) - Avec validation

**Fonctionnalités** :
- **Logique conditionnelle** - Affichage selon réponses précédentes
- **Validation personnalisée** - Regex, format, longueur
- **Questions obligatoires** - Marquées avec *
- **Aide contextuelle** - Tooltips, exemples

**Exemple** :
```
Conférence Startup 2025
→ Étape "Votre projet"

  ⭐ Obligatoire
  À quel stade est votre startup ? ⭐
  ○ Idée
  ◉ MVP
  ○ Lancement
  ○ Scale-up

  [SI MVP ou + → Question suivante affichée]

  💰 Avez-vous levé des fonds ?
  ◉ Oui ○ Non

  [SI Oui → Champ suivant affiché]
  Montant levé : [________] €

  📄 Pitch deck (optionnel)
  [Choisir un fichier] Format PDF, max 10Mo
```

---

## 🎨 Améliorations de l'Interface

### Templates d'Événements Prêts à l'Emploi

1. **Conférence Professionnelle**
   - Infos pro → Ateliers → Réseautage → Hébergement → Repas → Consentements

2. **Gala / Soirée de Charité**
   - Réponse → Accompagnants → Menu détaillé → Activités → Don (optionnel)

3. **Séminaire d'Entreprise**
   - Délégation → Hébergement → Ateliers → Team building → Besoins techniques

4. **Salon / Exposition**
   - Infos exposant → Besoins techniques → Personnel → Matériel → Logistique

5. **Événement Networking**
   - Profil pro → Réseautage → Créneaux RDV → Badge → Consentements

6. **Formation / Masterclass**
   - Niveau → Objectifs → Matériel → Prérequis → Certification

---

## 🔧 Fonctionnalités Techniques Avancées

### 1. **Logique Conditionnelle Améliorée**
```typescript
conditional: {
  enabled: true,
  rules: [
    {
      field: 'attending',
      operator: 'equals',
      value: true,
      AND: [
        { field: 'plusOnes', operator: 'greaterThan', value: 0 }
      ]
    }
  ],
  action: 'show' // ou 'hide', 'require', 'optional'
}
```

### 2. **Validation Multi-Niveaux**
```typescript
validation: {
  required: true,
  pattern: '^[0-9]{10}$', // Regex
  min: 0,
  max: 10,
  minLength: 5,
  maxLength: 200,
  custom: (value) => { /* fonction personnalisée */ },
  errorMessage: "Format invalide"
}
```

### 3. **Champs Dépendants**
```typescript
dependencies: {
  enabledIf: 'enableAccommodation === true',
  requiredIf: 'travelDistance > 100',
  visibleIf: 'vipStatus === true'
}
```

### 4. **Calculs Automatiques**
```typescript
computed: {
  totalCost: '(nights * 120) + (meals * 45) + (extraBed * 30)',
  displayAs: 'currency', // 'number', 'percentage', 'date'
  showInSummary: true
}
```

### 5. **Limites et Quotas**
```typescript
limits: {
  maxSelections: 3, // Pour multi-select
  maxCapacity: 50, // Places disponibles
  showRemaining: true, // Afficher "12/50 places"
  waitlist: true // File d'attente si complet
}
```

---

## 📊 Export et Intégrations

### Formats d'Export Enrichis

1. **Export Traiteur**
   - Récapitulatif régimes par type
   - Liste allergies par personne
   - Total par menu

2. **Export Logistique**
   - Besoins techniques consolidés
   - Planning installation
   - Contact par exposant

3. **Export Hôtel**
   - Liste arrivées/départs
   - Types de chambres
   - Besoins spéciaux

4. **Export Networking**
   - Annuaire participants
   - Profils business
   - Planning RDV

5. **Export Marketing**
   - Consentements segmentés
   - Centres d'intérêt
   - Profils participants

---

## 🚀 Roadmap de Mise en Œuvre

### Phase 1 - Types de Base (2 semaines)
- ✅ Informations professionnelles
- ✅ Hébergement & Voyage
- ✅ Régime alimentaire détaillé

### Phase 2 - Avancé (3 semaines)
- ✅ Ateliers & Sessions
- ✅ Networking
- ✅ Groupe/Délégation

### Phase 3 - Expert (4 semaines)
- ✅ Besoins techniques
- ✅ Activités parallèles
- ✅ Questions personnalisées avancées

### Phase 4 - Polish (2 semaines)
- ✅ Templates prêts à l'emploi
- ✅ Exports spécialisés
- ✅ Documentation complète

---

## 💡 Exemples Concrets d'Utilisation

### Exemple 1: Conférence Tech avec 500 participants
```
Étapes configurées :
1. Bienvenue + Video teaser
2. Réponse de participation
3. Informations professionnelles (entreprise, fonction, intérêts)
4. Sélection de 3 ateliers sur 15 disponibles
5. Préférences networking (pitch + créneaux RDV)
6. Hébergement (2 nuits, types de chambres)
7. Menu (végétarien/omnivore + allergies)
8. Activités : Soirée gala + Running matinal
9. Consentements (photos + annuaire + newsletter)
10. Récapitulatif

Résultat :
- 87% de complétion
- Taux de participation ateliers : 92%
- 240 RDV networking générés automatiquement
- Export Excel pour hôtel en 1 clic
```

### Exemple 2: Salon B2B avec Exposants
```
Étapes configurées :
1. Informations exposant (raison sociale, contact)
2. Taille et type de stand (9m², 12m², 20m²)
3. Besoins techniques (électricité, wifi, AV)
4. Mobilier et décoration
5. Personnel sur stand (liste + badges)
6. Horaires installation/démontage
7. Parking et accès véhicules
8. Services additionnels (hôtesse, nettoyage)
9. Consentements + CGV
10. Paiement et facturation

Résultat :
- Planning installation automatisé
- Commande matériel consolidée
- Badges générés automatiquement
- Factures envoyées par email
```

---

## 🎯 Bénéfices

### Pour les Organisateurs
✅ Collecte exhaustive des informations
✅ Moins d'échanges d'emails
✅ Exports adaptés à chaque prestataire
✅ Automatisation des tâches répétitives
✅ Meilleure expérience participant

### Pour les Participants
✅ Formulaire adapté au type d'événement
✅ Clarté des informations demandées
✅ Gain de temps (autosave, pré-remplissage)
✅ Transparence sur l'utilisation des données
✅ Confirmations et récapitulatifs automatiques

---

**Version** : 1.0
**Date** : 2025-01-21
**Auteur** : Claude Code - Weevup Invitation Platform
