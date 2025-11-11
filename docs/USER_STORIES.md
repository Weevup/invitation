# User Stories - Modules Planification Événement

## 📅 Module PROGRAMME (Agenda & Sessions)

### US-PROG-001 : Créer une session
**En tant qu'** organisateur d'événement
**Je veux** créer des sessions dans le programme
**Afin de** structurer le déroulement de mon événement

**Critères d'acceptation :**
- ✅ Je peux définir : titre, description, type (keynote, workshop, meal, etc.)
- ✅ Je peux définir les horaires (date, heure début/fin)
- ✅ Je peux définir le lieu (venue, salle, adresse)
- ✅ Je peux définir la capacité maximale
- ✅ Je peux activer l'inscription obligatoire
- ✅ Je peux ajouter des intervenants (speakers)
- ✅ Je peux choisir une couleur et icône pour l'affichage
- ✅ Le système calcule automatiquement la durée

**User flow :**
1. Accéder à Programme → Sessions
2. Cliquer "Nouvelle session"
3. Remplir le formulaire
4. Enregistrer → La session apparaît dans la liste et la timeline

---

### US-PROG-002 : Gérer les inscriptions aux sessions
**En tant qu'** organisateur
**Je veux** gérer qui participe à quelle session
**Afin de** contrôler les capacités et avoir une vue d'ensemble

**Critères d'acceptation :**
- ✅ Je peux voir la liste des participants d'une session
- ✅ Je peux ajouter/retirer des participants manuellement
- ✅ Je vois la capacité (ex: 45/50)
- ✅ Je peux mettre des participants en liste d'attente
- ✅ Je suis alerté quand une session est pleine
- ✅ Je peux exporter la liste des participants

**User flow :**
1. Cliquer sur une session
2. Cliquer "Gérer les participants"
3. Rechercher et ajouter des invités
4. Voir le statut (confirmé, liste d'attente)

---

### US-PROG-003 : Visualiser la timeline globale
**En tant qu'** organisateur
**Je veux** voir une timeline chronologique complète
**Afin d'** avoir une vue d'ensemble de l'événement

**Critères d'acceptation :**
- ✅ Je vois toutes les sessions organisées par jour
- ✅ Je vois les arrivées/départs des transports
- ✅ Je vois les check-in/check-out hébergements
- ✅ Je peux filtrer par participant
- ✅ Je peux filtrer par type d'événement
- ✅ Je peux filtrer par date
- ✅ Les codes couleurs sont clairs et cohérents

**User flow :**
1. Accéder à Dashboard Planif. → Timeline
2. Utiliser les filtres pour affiner la vue
3. Cliquer sur un élément pour voir les détails

---

### US-PROG-004 : Détecter les conflits
**En tant qu'** organisateur
**Je veux** être alerté des conflits d'horaires
**Afin d'** éviter qu'un participant soit inscrit à deux sessions simultanées

**Critères d'acceptation :**
- ✅ Le système détecte automatiquement les chevauchements
- ✅ Une alerte apparaît dans le dashboard
- ✅ L'alerte indique les participants et sessions concernés
- ✅ Un lien direct permet de corriger le problème

**User flow :**
1. Aller au Dashboard Planif.
2. Voir l'alerte "Conflits horaires détectés"
3. Cliquer sur l'alerte → Aller à la timeline filtrée

---

## ✈️ Module TRANSPORT

### US-TRANS-001 : Enregistrer un transport individuel
**En tant qu'** organisateur
**Je veux** enregistrer les informations de transport d'un invité
**Afin de** centraliser et suivre tous les déplacements

**Critères d'acceptation :**
- ✅ Je peux choisir le type : vol, train, navette, taxi, voiture de location, voiture perso
- ✅ Je peux saisir : départ (lieu, date, heure), arrivée (lieu, date, heure)
- ✅ Je peux saisir : compagnie, numéro de vol/train, référence, siège
- ✅ Je peux définir le statut : demandé, en attente, confirmé, réservé, annulé
- ✅ Je peux indiquer si c'est pris en charge par l'entreprise
- ✅ Je peux ajouter le coût estimé/réel

**User flow :**
1. Aller à Transport
2. Cliquer "Nouveau transport"
3. Sélectionner l'invité
4. Remplir les informations
5. Enregistrer

---

### US-TRANS-002 : Créer une navette collective (manifeste)
**En tant qu'** organisateur
**Je veux** créer des navettes collectives
**Afin de** mutualiser les transports et optimiser les coûts

**Critères d'acceptation :**
- ✅ Je peux créer un manifeste avec nom, type, trajet
- ✅ Je peux définir la capacité maximale
- ✅ Je peux ajouter des participants au manifeste
- ✅ Le système compte automatiquement les places restantes
- ✅ Je peux définir le coût par personne
- ✅ Je vois le statut du manifeste (draft, ouvert, complet, confirmé)

**User flow :**
1. Aller à Transport → Manifestes
2. Créer un nouveau manifeste
3. Ajouter des participants
4. Suivre le remplissage

---

### US-TRANS-003 : Suivre les arrivées en temps réel
**En tant qu'** organisateur
**Je veux** voir qui arrive et quand
**Afin de** planifier l'accueil et anticiper les besoins

**Critères d'acceptation :**
- ✅ Je vois une liste des arrivées triée par date/heure
- ✅ Je vois le statut de chaque transport
- ✅ Je peux filtrer par type de transport
- ✅ Je peux exporter la liste
- ✅ Les arrivées apparaissent dans la timeline globale

**User flow :**
1. Dashboard Planif. → Voir les alertes
2. Timeline → Filtrer par "Arrivées"
3. Transport → Vue "Arrivées à venir"

---

### US-TRANS-004 : Alertes transports manquants
**En tant qu'** organisateur
**Je veux** être alerté des invités sans transport
**Afin de** m'assurer que tout le monde peut venir

**Critères d'acceptation :**
- ✅ Le dashboard affiche "X invités sans transport"
- ✅ La liste des invités concernés est accessible
- ✅ Un lien direct permet d'ajouter un transport
- ✅ L'alerte disparaît quand tous les invités ont un transport

**User flow :**
1. Dashboard Planif. → Voir l'alerte
2. Cliquer sur l'alerte
3. Voir la liste des invités
4. Ajouter les transports manquants

---

## 🏨 Module HÉBERGEMENT

### US-ACC-001 : Ajouter un hébergement
**En tant qu'** organisateur
**Je veux** ajouter un hôtel ou hébergement
**Afin de** centraliser les informations de logement

**Critères d'acceptation :**
- ✅ Je peux saisir : nom, type, adresse complète, contact
- ✅ Je peux définir le nombre d'étoiles
- ✅ Je peux marquer comme "hébergement préféré"
- ✅ Je peux définir les horaires de check-in/check-out
- ✅ Je peux ajouter le tarif négocié
- ✅ Je peux ajouter des notes internes

**User flow :**
1. Aller à Hébergement
2. Cliquer "Nouvel hébergement"
3. Remplir le formulaire complet
4. Enregistrer

---

### US-ACC-002 : Créer les chambres d'un hébergement
**En tant qu'** organisateur
**Je veux** créer les chambres disponibles
**Afin de** pouvoir assigner les invités

**Critères d'acceptation :**
- ✅ Je peux créer une chambre avec : numéro, étage, type
- ✅ Types disponibles : simple, double, twin, triple, suite, studio, appartement
- ✅ Je peux définir la capacité maximale
- ✅ Je peux indiquer : configuration lits, vue, accessibilité PMR
- ✅ Je peux définir le tarif par nuit
- ✅ Le système gère automatiquement le statut (disponible/assignée)

**User flow :**
1. Cliquer sur un hébergement
2. Cliquer "Ajouter des chambres"
3. Remplir les informations
4. Répéter pour chaque chambre

---

### US-ACC-003 : Assigner un invité à une chambre (Rooming List)
**En tant qu'** organisateur
**Je veux** assigner les invités aux chambres
**Afin de** créer la rooming list complète

**Critères d'acceptation :**
- ✅ Je peux rechercher un invité par nom/email
- ✅ Je peux définir les dates de check-in/check-out
- ✅ Le système calcule le nombre de nuits
- ✅ Je peux marquer l'invité principal (chambre partagée)
- ✅ Je peux ajouter des demandes spéciales
- ✅ Le système bloque si la capacité est atteinte
- ✅ Le statut de la chambre passe automatiquement à "Assignée"

**User flow :**
1. Aller sur un hébergement → Rooming List
2. Cliquer "Assigner" sur une chambre
3. Rechercher l'invité
4. Définir les dates
5. Enregistrer

---

### US-ACC-004 : Visualiser la rooming list complète
**En tant qu'** organisateur
**Je veux** voir toutes les assignations d'un hébergement
**Afin d'** avoir une vue d'ensemble et gérer les chambres

**Critères d'acceptation :**
- ✅ Je vois toutes les chambres triées par statut puis numéro
- ✅ Pour chaque chambre, je vois : type, capacité, occupants
- ✅ Pour chaque occupant, je vois : nom, dates, statut
- ✅ Je peux retirer une assignation facilement
- ✅ Les chambres disponibles sont clairement identifiables
- ✅ Les statistiques d'occupation sont visibles

**User flow :**
1. Aller à Hébergement
2. Cliquer sur un hébergement
3. Voir la rooming list complète
4. Gérer les assignations

---

### US-ACC-005 : Suivre les statistiques d'hébergement
**En tant qu'** organisateur
**Je veux** voir les statistiques de mes hébergements
**Afin de** suivre l'occupation et identifier les problèmes

**Critères d'acceptation :**
- ✅ Je vois : nombre total de chambres, disponibles, assignées
- ✅ Je vois le taux d'occupation en pourcentage
- ✅ Je vois le nombre d'invités logés
- ✅ Je vois les statistiques par hébergement
- ✅ Une alerte m'indique les invités sans chambre
- ✅ Les stats sont mises à jour en temps réel

**User flow :**
1. Dashboard Planif. → Voir les stats hébergement
2. Hébergement → Voir les stats globales
3. Cliquer sur un hébergement → Voir les stats détaillées

---

## 📊 Module DASHBOARD PLANIFICATION

### US-DASH-001 : Vue d'ensemble de l'événement
**En tant qu'** organisateur
**Je veux** avoir une vue d'ensemble complète
**Afin de** suivre l'avancement et identifier les problèmes

**Critères d'acceptation :**
- ✅ Je vois les stats clés : invités, sessions, transports, hébergements
- ✅ Je vois les alertes par ordre de priorité (critiques en haut)
- ✅ Je vois des graphiques de répartition (types de sessions, transports)
- ✅ Je peux cliquer sur une alerte pour agir
- ✅ Je peux exporter le manifeste complet ou la timeline

**User flow :**
1. Accéder au Dashboard Planif.
2. Consulter les stats et alertes
3. Cliquer sur une alerte pour résoudre
4. Exporter si besoin

---

### US-DASH-002 : Système d'alertes intelligent
**En tant qu'** organisateur
**Je veux** être alerté automatiquement des problèmes
**Afin de** ne rien oublier et anticiper

**Types d'alertes :**
1. 🔴 **Critiques (High)** : Conflits horaires participants
2. 🟠 **Moyennes (Medium)** : Invités sans transport/hébergement, transports non confirmés
3. 🟢 **Informatives (Low)** : Sessions pleines, sessions sans participants, sessions à venir

**Critères d'acceptation :**
- ✅ Les alertes sont automatiquement détectées
- ✅ Elles sont triées par priorité
- ✅ Chaque alerte a un lien d'action direct
- ✅ Elles disparaissent quand le problème est résolu

---

## 📤 Module EXPORTS

### US-EXP-001 : Exporter le manifeste Excel complet
**En tant qu'** organisateur
**Je veux** exporter toutes les données en Excel
**Afin d'** avoir un document complet à partager ou imprimer

**Contenu de l'export :**
- ✅ Vue d'ensemble (stats événement)
- ✅ Liste invités avec RSVP, sessions, transports
- ✅ Sessions avec participants
- ✅ Transports détaillés
- ✅ Matrice invités × sessions
- ✅ Timeline complète

**User flow :**
1. Dashboard → Cliquer "Manifeste Excel"
2. Le fichier se télécharge automatiquement
3. Ouvrir avec Excel

---

### US-EXP-002 : Exporter la timeline PDF
**En tant qu'** organisateur
**Je veux** exporter la timeline en PDF
**Afin de** l'imprimer et la distribuer

**Critères d'acceptation :**
- ✅ Le PDF est formaté professionnellement
- ✅ Les couleurs de l'événement sont respectées
- ✅ Les événements sont organisés par jour
- ✅ Les horaires sont clairs
- ✅ Le document est prêt à imprimer

---

### US-EXP-003 : Exporter le programme individuel d'un participant
**En tant qu'** organisateur
**Je veux** générer le programme personnalisé d'un invité
**Afin de** lui envoyer son planning complet

**Contenu de l'export :**
- ✅ Informations invité
- ✅ Statut RSVP
- ✅ Transports (départ/arrivée avec détails)
- ✅ Hébergement (chambre, dates)
- ✅ Sessions inscrites par jour
- ✅ Informations complémentaires (repas, allergies)

**User flow :**
1. Page Invités → Cliquer sur l'icône téléchargement
2. Le PDF personnel se télécharge
3. L'envoyer à l'invité

---

## 🎯 Scénarios d'usage complets

### Scénario 1 : Organiser un séminaire d'entreprise 2 jours
1. **Créer l'événement** et activer les modules Programme, Transport, Hébergement
2. **Importer les invités** (50 personnes)
3. **Créer le programme** :
   - J1 matin : Accueil + Keynote
   - J1 après-midi : 3 workshops simultanés
   - J1 soir : Dîner de gala
   - J2 matin : Session plénière
   - J2 midi : Déjeuner de clôture
4. **Gérer les inscriptions** aux workshops (capacité limitée)
5. **Enregistrer les transports** :
   - 10 vols à réserver
   - 2 navettes aéroport → hôtel
6. **Créer la rooming list** :
   - Réserver 1 hôtel, 30 chambres
   - Assigner les invités
7. **Suivre via le Dashboard** :
   - Vérifier les alertes
   - S'assurer qu'il n'y a pas de conflits
8. **Exporter** le manifeste complet et les programmes individuels

### Scénario 2 : Détecter et résoudre un conflit
1. **Dashboard** → Alerte "2 participants inscrits à des sessions qui se chevauchent"
2. **Cliquer** sur l'alerte → Aller à la timeline
3. **Voir** que Marie est inscrite au Workshop A (14h-16h) ET Workshop B (15h-17h)
4. **Retirer** Marie du Workshop B
5. **L'inscrire** à un autre créneau
6. **Retour Dashboard** → L'alerte a disparu ✅

---

## 📈 Métriques de succès

### Pour les organisateurs :
- ⏱️ **Temps de planification réduit de 70%** vs outils manuels
- 🎯 **0 conflit non détecté** grâce aux alertes automatiques
- 📊 **100% de visibilité** sur l'événement en temps réel
- 📄 **1 clic** pour générer tous les documents nécessaires

### Pour les participants :
- ✅ **Programme personnalisé clair** reçu automatiquement
- 🚗 **Transports et hébergement** organisés
- 📅 **Aucun conflit** d'horaire dans leur planning
