# Documentation - Modules de Planification Événement

## 🚀 Guide de démarrage rapide

### 1. Activer les modules

**Navigation** : Vue d'ensemble de l'événement → Section "Modules disponibles"

**Modules disponibles** :
- **Programme & Sessions** : Gérer l'agenda et les inscriptions
- **Transport** : Centraliser les déplacements
- **Hébergement** : Créer la rooming list

**Action** : Cliquer sur "Activer" pour chaque module souhaité.

---

## 📅 Module PROGRAMME

### Créer une session

1. **Accéder** : Navigation sidebar → Programme → Sessions
2. **Cliquer** : "Nouvelle session"
3. **Remplir le formulaire** :
   - **Titre** : Ex. "Keynote d'ouverture"
   - **Type** : Choisir parmi 14 types (Keynote, Workshop, Conférence, etc.)
   - **Date et horaires** : Date, heure début, heure fin
   - **Lieu** : Venue, salle, adresse si différente
   - **Capacité** : Nombre maximum de participants (optionnel)
   - **Inscription obligatoire** : Activer si nécessaire
4. **Enregistrer**

**💡 Astuce** : La durée est calculée automatiquement. Utilisez les couleurs pour distinguer les types de sessions dans la timeline.

---

### Gérer les participants d'une session

1. **Accéder** : Programme → Sessions → Cliquer sur une session
2. **Cliquer** : "Gérer les participants"
3. **Ajouter des participants** :
   - Rechercher un invité par nom/email
   - Cliquer pour l'ajouter
   - Le statut passe à "Inscrit"
4. **Gérer la capacité** :
   - Si la session est pleine → Les nouveaux participants vont en liste d'attente
   - Vous pouvez promouvoir depuis la liste d'attente

**💡 Astuce** : Utilisez les filtres pour voir uniquement les sessions pleines ou celles nécessitant des inscriptions.

---

### Utiliser la Timeline globale

**Navigation** : Dashboard Planif. → Timeline

**Fonctionnalités** :
- **Vue chronologique** : Toutes les sessions, transports, hébergements par jour
- **Filtres disponibles** :
  - **Par participant** : Voir le planning d'un invité spécifique
  - **Par type** : Sessions, Arrivées, Départs, Check-in/out, etc.
  - **Par date** : Période personnalisée
- **Codes couleur** :
  - 🔵 Bleu : Sessions
  - 🟢 Teal : Arrivées transport
  - 🔴 Rouge : Départs transport
  - 🟣 Violet : Hébergement

**Exemple d'usage** :
```
Besoin : Voir le planning de Marie Dupont
1. Cliquer sur "Filtres"
2. Rechercher "Marie Dupont"
3. Sélectionner
→ La timeline affiche uniquement ses sessions, transports et hébergement
```

---

### Détecter les conflits horaires

**Automatique** : Le système détecte les chevauchements.

**Voir les alertes** :
1. Dashboard Planif. → Section "Alertes Critiques"
2. Alerte : "X participant(s) inscrit(s) à des sessions qui se chevauchent"
3. Cliquer sur l'alerte → Voir les détails
4. Voir la liste des conflits avec noms et sessions

**Résoudre** :
1. Aller à la timeline (lien dans l'alerte)
2. Filtrer par participant concerné
3. Retirer de l'une des sessions en conflit
4. Retour au dashboard → L'alerte disparaît ✅

---

## ✈️ Module TRANSPORT

### Enregistrer un transport individuel

1. **Accéder** : Transport → "Nouveau transport"
2. **Sélectionner l'invité** : Recherche par nom/email
3. **Choisir le type** :
   - Vol (FLIGHT)
   - Train (TRAIN)
   - Navette (SHUTTLE)
   - Taxi (TAXI)
   - Location (CAR_RENTAL)
   - Voiture personnelle (PERSONAL_CAR)
4. **Remplir les détails** :
   - **Départ** : Ville/Aéroport, Date, Heure
   - **Arrivée** : Ville/Aéroport, Date, Heure
   - **Compagnie** : Ex. "Air France"
   - **Référence** : N° de vol/train
   - **Siège** : Ex. "12A"
5. **Définir le statut** : Demandé → En attente → Confirmé → Réservé
6. **Coût** : Montant et devise

**💡 Astuce** : Marquez "Pris en charge par l'entreprise" pour le suivi budget.

---

### Créer une navette collective (Manifeste)

**Cas d'usage** : Navette aéroport → hôtel pour 15 personnes

1. **Accéder** : Transport → Manifestes → "Nouveau manifeste"
2. **Remplir** :
   - **Nom** : "Navette Aéroport CDG → Hôtel Marriott"
   - **Type** : SHUTTLE
   - **Départ** : Terminal 2E, 15h00
   - **Arrivée** : Hôtel Marriott, 16h00
   - **Capacité** : 20 places
   - **Coût par personne** : 25€
3. **Enregistrer**
4. **Ajouter des participants** :
   - Cliquer sur le manifeste
   - Ajouter les invités un par un
   - Le compteur se met à jour automatiquement (15/20)

**💡 Astuce** : Le statut passe à "Complet" quand la capacité est atteinte.

---

### Suivre les arrivées

**Dashboard** : Vous voyez automatiquement :
- Nombre de transports confirmés vs total
- Alerte si invités sans transport

**Timeline** :
1. Filtrer par type "Arrivées"
2. Voir toutes les arrivées chronologiquement
3. Export possible pour l'équipe d'accueil

**Alerte "Invités sans transport"** :
- S'affiche automatiquement dans le Dashboard
- Cliquer → Voir la liste
- Ajouter les transports manquants

---

## 🏨 Module HÉBERGEMENT

### Ajouter un hébergement

1. **Accéder** : Hébergement → "Nouvel hébergement"
2. **Formulaire complet** :

**Informations de base** :
- Nom : "Hôtel Marriott Paris"
- Type : Hôtel
- Étoiles : ⭐⭐⭐⭐

**Adresse** :
- Adresse, Ville, Code postal, Pays

**Contact** :
- Téléphone, Email, Site web
- Personne de contact

**Capacité & Horaires** :
- Chambres totales : 100
- Chambres allouées pour l'événement : 30
- Check-in : 14:00
- Check-out : 11:00
- Early check-in / Late check-out disponibles

**Tarification** :
- Tarif négocié : 120€ par nuit
- Devise : EUR

3. **Options** :
   - ✅ "Hébergement préféré" : Marque comme officiel
4. **Enregistrer**

---

### Créer les chambres

1. **Cliquer** sur un hébergement
2. **Cliquer** : "Ajouter des chambres"
3. **Pour chaque chambre** :
   - N° : "101", "Suite Présidentielle", etc.
   - Étage : 1
   - Type : Simple, Double, Twin, Triple, Suite, Studio, Appartement
   - Capacité max : 2
   - Configuration lits : "1 lit King"
   - Vue : "Vue mer"
   - ♿ Accessible PMR
   - 🚭 Fumeurs autorisés
   - Tarif : 150€/nuit

**💡 Astuce bulk** : Créez chambre par chambre. Le système gère automatiquement les statuts.

---

### Créer la Rooming List (Assigner les invités)

**Vue d'ensemble** : Hébergement → Cliquer sur un hôtel → Rooming List complète

**Assigner un invité** :
1. **Sur une chambre disponible** : Cliquer "Assigner"
2. **Dialog d'assignation** :
   - **Rechercher l'invité** : Taper nom/email → Sélectionner
   - **Dates** : Check-in + Check-out
   - Le système calcule le nombre de nuits
   - **Chambre partagée** : Si plusieurs invités, marquer l'invité principal
   - **Demandes spéciales** : "Lit bébé", "Étage élevé", etc.
3. **Enregistrer**
4. La chambre passe en statut "Assignée" ✅

**Validations automatiques** :
- ❌ Impossible d'assigner si capacité atteinte
- ❌ Date départ doit être après date arrivée
- ✅ Le statut se met à jour automatiquement

---

### Gérer les assignations

**Visualiser** :
- Toutes les chambres sont triées : Disponible → Assignée → Bloquée
- Pour chaque chambre assignée, vous voyez :
  - Les invités avec dates de séjour
  - Badge "Principal" pour invité principal
  - Email et entreprise

**Modifier/Supprimer** :
- Cliquer ❌ sur une assignation
- Confirmation requise
- La chambre redevient "Disponible" si aucun invité restant

**Stats en temps réel** :
- Taux d'occupation : 75% (22/30 chambres)
- Invités logés : 28
- Chambres disponibles : 8

---

## 📊 Dashboard Planification

### Vue d'ensemble

**Accès** : Dashboard Planif. (icône Activity dans sidebar)

**Contenu** :

**Stats globales** :
- Invités (total / confirmés)
- Sessions (total / publiées)
- Transports (total / confirmés)
- Hébergements (chambres totales / assignées / invités logés)

**Alertes automatiques** (8 types) :
1. 🔴 **Conflits horaires** (critique)
2. 🟠 **Invités sans transport** (moyen)
3. 🟠 **Invités sans hébergement** (moyen)
4. 🟠 **Transports non confirmés** (moyen)
5. 🟢 **Sessions sans participants** (info)
6. 🟢 **Sessions pleines** (info)
7. 🟢 **Sessions à venir <24h** (info)
8. 🟢 **Invités sans sessions** (info)

**Graphiques** :
- Répartition types de sessions
- Répartition types de transport
- Taux de remplissage sessions

---

### Utiliser les alertes

**Workflow** :
1. Dashboard affiche l'alerte avec compteur
2. Cliquer sur l'alerte
3. Voir les détails (liste invités, sessions, etc.)
4. Action directe via bouton (lien vers page appropriée)
5. Résoudre le problème
6. L'alerte disparaît automatiquement ✅

**Exemple** :
```
Alerte : "5 invités sans hébergement"
Action : Cliquer → Voir les 5 invités
Résolution : Aller à Hébergement → Assigner les chambres
Résultat : Alerte disparaît
```

---

## 📤 Exports

### Export Manifeste Excel complet

**Accès** : Dashboard ou Timeline → Bouton "Manifeste Excel"

**Contenu du fichier** (6 feuilles) :
1. **Vue d'ensemble** : Stats événement
2. **Invités** : Liste complète avec RSVP, sessions, transports
3. **Sessions** : Détails + participants
4. **Transports** : Tous les transports avec invités
5. **Matrice Sessions** : Tableau invités × sessions (✓ = inscrit)
6. **Timeline** : Chronologie complète

**Usage** : Partagez avec l'équipe, imprimez, analysez dans Excel.

---

### Export Timeline PDF

**Accès** : Dashboard ou Timeline → Bouton "Timeline PDF"

**Contenu** :
- Timeline visuelle formatée
- Organisée par jour
- Codes couleur professionnels
- Horaires clairs
- Prêt à imprimer/distribuer

**Usage** : Affichage sur site, distribution participants, brief équipe.

---

### Export Programme Participant individuel

**Accès** : Page Invités → Icône téléchargement sur chaque invité

**Contenu personnalisé** :
- Informations invité
- Statut RSVP
- Tous les transports avec détails
- Hébergement (chambre, dates)
- Sessions inscrites organisées par jour
- Infos complémentaires (repas, allergies)

**Usage** : Envoyez à chaque participant son planning personnalisé.

---

## 🔄 Workflows complets

### Organiser un séminaire 2 jours (50 personnes)

**Jour -30** :
1. Créer l'événement
2. Activer modules : Programme, Transport, Hébergement
3. Importer les 50 invités
4. Créer le programme (10 sessions)

**Jour -20** :
5. Enregistrer les transports (vols + navettes)
6. Créer 2 navettes aéroport-hôtel
7. Réserver 30 chambres, créer la rooming list

**Jour -10** :
8. Gérer les inscriptions aux workshops
9. Vérifier le dashboard → Résoudre alertes
10. Exporter manifeste Excel → Partager équipe

**Jour -3** :
11. Exporter programmes individuels
12. Envoyer à chaque participant
13. Exporter timeline PDF → Brief équipe

**Jour J** :
14. Timeline en temps réel pour coordination
15. Check-in hébergement via rooming list

---

### Résoudre un conflit horaire

**Problème détecté** : Dashboard → Alerte rouge "2 conflits horaires"

**Étapes** :
1. Cliquer sur l'alerte
2. Voir : "Marie Dupont inscrite Workshop A (14h-16h) ET Workshop B (15h-17h)"
3. Cliquer "Voir la timeline"
4. Timeline filtrée sur Marie
5. Aller à Sessions → Workshop B
6. Retirer Marie de Workshop B
7. L'inscrire à Workshop C (10h-12h)
8. Retour Dashboard → Alerte disparue ✅

---

## ❓ FAQ

### Comment activer un module ?
Vue d'ensemble événement → Modules disponibles → Activer

### Puis-je désactiver un module ?
Oui, mais les données restent. Réactivez pour les retrouver.

### Les alertes sont-elles automatiques ?
Oui, le système détecte en temps réel.

### Puis-je exporter sans modules activés ?
Oui, mais l'export contiendra uniquement les données disponibles.

### Comment gérer plusieurs hôtels ?
Créez plusieurs hébergements. La rooming list est par hébergement.

### Les participants peuvent-ils voir leur planning ?
Exportez leur fiche individuelle en PDF et envoyez-la.

### Comment suivre le budget transport ?
Renseignez les coûts dans chaque transport. Exportez le manifeste Excel.

### Puis-je créer des sessions récurrentes ?
Non pour l'instant, créez chaque session individuellement.

---

## 🆘 Support

**Documentation** : `/admin/modules-showcase/documentation`
**Showcas modules** : `/admin/modules-showcase`
**User Stories** : Voir `docs/USER_STORIES.md`

**Besoin d'aide ?** Consultez les tooltips (🛈) dans chaque page.
