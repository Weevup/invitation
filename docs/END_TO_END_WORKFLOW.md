# 🎯 Workflow End-to-End - De la Création à l'Événement

Guide complet du workflow événementiel, de la création initiale jusqu'au jour J et après.

---

## 📋 Vue d'ensemble

```
Phase 1: PLANIFICATION     Phase 2: INVITATIONS     Phase 3: SUIVI     Phase 4: ÉVÉNEMENT     Phase 5: POST-EVENT
    (J-90 à J-60)             (J-60 à J-30)        (J-30 à J-1)          (Jour J)            (J+1 à J+7)
         │                          │                    │                    │                     │
    Créer événement           Envoyer              Relances            Check-in             Remerciements
    Configurer RSVP          invitations           & rappels           Gestion             Analytics
    Ajouter invités          Personnaliser         Ajustements         Présence            Feedback
    Préparer contenu         Save the Date         Logistique          QR Codes            Wrap-up
```

**Temps total estimé** : 3h à 6h selon la complexité (vs 15h+ sans la plateforme)

---

## Phase 1 : PLANIFICATION (J-90 à J-60)

### ⏱️ Durée : 30 minutes à 2 heures

### Étape 1.1 : Créer l'événement (5 minutes)

**Action** : Dashboard Admin → "Nouvel événement"

**1. Choisir le template adapté**

| Type d'événement | Template recommandé | Gain de temps |
|------------------|---------------------|---------------|
| Séminaire d'entreprise | 💼 Corporate | 28 min |
| Mariage | 💍 Mariage | 28 min |
| Anniversaire d'entreprise | 🎉 Gala | 28 min |
| Formation professionnelle | 🏋️ Workshop | 28 min |
| Concert / Festival | 🎭 Festival | 28 min |

**2. Remplir les informations de base**
```
✅ Nom : "Séminaire Tech 2025"
✅ Description : "Réunion annuelle de l'équipe engineering"
✅ Date : 15 mars 2025, 09:00
✅ Lieu : Hôtel Molitor, Paris
✅ Capacité : 150 personnes
```

**3. Vérifier la configuration RSVP pré-remplie**
- Accompagnants : ❌ (Corporate)
- Repas : ✅ (Menu standard, Végétarien, Sans gluten, Halal)
- Transport : ✅
- Hébergement : ✅
- Accessibilité : ✅
- Consentement photos : ✅

**Résultat** : Événement créé avec configuration optimale en 2 minutes au lieu de 30 ⚡

---

### Étape 1.2 : Ajouter les invités (10-30 minutes)

**Option A : Import CSV (recommandé pour >20 invités)**

1. **Préparer le fichier CSV** :
```csv
firstName,lastName,email,company,jobTitle,tags
Marie,Dupont,marie.dupont@company.com,Acme Corp,CTO,"VIP,Speaker"
Jean,Martin,jean.martin@startup.io,StartupIO,CEO,"VIP"
Sophie,Bernard,sophie@agency.fr,AgencyPro,Directrice,"Partenaire"
```

2. **Importer** : Invités → "Importer CSV"
3. **Vérifier** : La plateforme détecte automatiquement :
   - ✅ Doublons (emails identiques)
   - ⚠️ Formats invalides
   - ℹ️ Colonnes manquantes

**Option B : Ajout manuel (pour <20 invités)**

Pour chaque invité :
1. Cliquer "Nouvel invité"
2. Remplir : Prénom, Nom, Email, Entreprise, Poste
3. Ajouter des tags : VIP, Presse, Partenaire, etc.
4. Enregistrer

**💡 Astuce** : Utilisez les tags pour organiser les invités par catégories. Vous pourrez filtrer et envoyer des communications ciblées plus tard.

---

### Étape 1.3 : Configurer les modules (optionnel, 10-20 minutes)

**Modules disponibles** :
- 📅 **Programme & Sessions** : Planning détaillé avec inscriptions
- ✈️ **Transport** : Gestion centralisée des déplacements
- 🏨 **Hébergement** : Rooming list et réservations
- 🎫 **Badges** : Badges personnalisés avec QR codes
- 📧 **Emails automatiques** : Confirmations et rappels

**Activation** : Vue d'ensemble → Section "Modules disponibles" → "Activer"

📚 **Documentation détaillée** : [Guide des Modules](./MODULES-USAGE.md)

---

### Étape 1.4 : Préparer le contenu visuel (10-30 minutes)

**Upload des ressources** :
- 🖼️ **Image de couverture** : 1920x1080px (bannière événement)
- 🎨 **Logo** : 500x500px (PNG transparent)
- 📸 **Photos du lieu** : Pour la page showcase

**Page showcase** : Événement → Showcase → Personnaliser
- Activer/désactiver les sections
- Personnaliser les textes
- Choisir le thème visuel

---

## Phase 2 : INVITATIONS (J-60 à J-30)

### ⏱️ Durée : 30 minutes à 1 heure

### Étape 2.1 : Personnaliser l'email d'invitation (20 minutes)

**Navigation** : Événement → Communication → "Éditeur d'emails"

**1. Choisir le template**
- Template "Invitation" (pré-rempli selon le type d'événement)
- Thème et couleurs adaptés automatiquement

**2. Personnaliser le contenu**

Exemple pour un événement corporate :
```
Objet : Invitation - {{event.name}}

Bonjour {{guest.firstName}},

Nous avons le plaisir de vous inviter à participer à {{event.name}}, qui se tiendra le {{event.date.long}} à {{event.time}}.

📍 Lieu : {{event.location}}
📅 Date : {{event.date}}
⏰ Horaire : {{event.time}}

🗺️ [Voir l'itinéraire]({{directionsLink}})

[BLOC IMAGE]

Au programme :
- 09:00 - Accueil et café
- 09:30 - Keynote d'ouverture
- 11:00 - Ateliers techniques
- 13:00 - Déjeuner networking
- 14:30 - Tables rondes
- 17:00 - Cocktail de clôture

Merci de confirmer votre participation avant le {{event.rsvpDeadline}}.

[Bouton CTA : Confirmer ma présence]
Lien : {{rsvpLink}}

À très bientôt !

L'équipe {{event.organizerName}}

---
[Ajouter au calendrier]({{calendarLink}})
[Se désinscrire]({{unsubscribeLink}})
```

**3. Variables disponibles (50+)** :
- Cliquez sur l'icône "Variables" dans l'éditeur
- Copiez-collez dans votre contenu
- La plateforme remplace automatiquement lors de l'envoi

**4. Prévisualiser**
- Vue desktop / mobile
- Avec données réelles d'un invité test

**5. Tester**
- "Email de test" → Envoyez-vous l'email
- Vérifiez l'affichage, les liens, les images

---

### Étape 2.2 : Envoyer les invitations (10 minutes)

**Processus d'envoi sécurisé** :

**1. Sélectionner les destinataires**
```
Option 1 : Tous les invités (150)
Option 2 : Filtrer par tag (VIP uniquement : 25)
Option 3 : Filtrer par statut (Non envoyé : 120)
```

**2. Planifier l'envoi**
```
Option A : Envoi immédiat
Option B : Programmer pour une date/heure précise
```

**3. Lancer l'envoi**
- Cliquez "Envoyer à tous"
- La plateforme envoie intelligemment :
  - ✅ Rate limiting (respect des limites Resend/SendGrid)
  - ✅ Retry automatique en cas d'échec temporaire
  - ✅ Logging complet pour suivi

**4. Suivre la progression**
- Dashboard → Logs d'envoi
- Statut en temps réel pour chaque invité :
  - ✅ Envoyé
  - ⏳ En cours
  - ❌ Échec (avec raison)

**💡 Astuce** : Envoyez d'abord aux VIP, attendez 1h, puis envoyez aux autres. Cela permet de vérifier que tout fonctionne.

---

## Phase 3 : SUIVI (J-30 à J-1)

### ⏱️ Durée : 1 à 2 heures réparties

### Étape 3.1 : Suivre les réponses (quotidien, 5 min/jour)

**Dashboard en temps réel** : Vue d'ensemble

**Métriques clés** :
```
📊 Taux de réponse : 68% (102/150)
✅ Confirmations : 85 (56.6%)
❌ Refus : 17 (11.3%)
⏳ En attente : 48 (32%)
👥 Accompagnants : 12
🍽️ Choix de repas :
   - Menu standard : 45
   - Végétarien : 28
   - Sans gluten : 8
   - Halal : 4
```

**Actions recommandées** :
- J-30 : Vérifier que 50% ont répondu
- J-20 : Envoyer un reminder aux non-répondants
- J-10 : Vérifier que 80% ont répondu
- J-7 : Dernier rappel aux retardataires

---

### Étape 3.2 : Envoyer des rappels (J-20 et J-7)

**Reminder J-20 (pour les non-répondants)**

1. **Créer l'email de rappel** :
```
Objet : ⏰ Rappel - {{event.name}} dans 20 jours

Bonjour {{guest.firstName}},

Nous attendons toujours votre réponse pour {{event.name}} qui aura lieu le {{event.date.long}}.

[BLOC IMAGE]

Merci de confirmer votre participation avant le {{event.rsvpDeadline}}.

[Bouton CTA : Répondre maintenant]

À très bientôt !
```

2. **Filtrer les destinataires** :
   - Statut : "En attente" uniquement
   - Exclure ceux qui ont déjà répondu

3. **Envoyer**

**Reminder J-7 (pour les confirmés)**

1. **Créer l'email de rappel** :
```
Objet : 🎉 C'est bientôt ! {{event.name}} dans 7 jours

Bonjour {{guest.firstName}},

Nous avons hâte de vous retrouver pour {{event.name}} qui aura lieu dans 7 jours !

📍 Lieu : {{event.location}}
📅 Date : {{event.date.long}}
⏰ Horaire : {{event.time}}

🗺️ [Voir l'itinéraire]({{directionsLink}})
📅 [Ajouter au calendrier]({{calendarLink}})

[INFORMATIONS PRATIQUES]
- Accueil à partir de 08:30
- Badge obligatoire à l'entrée
- Parking disponible sur place
- Dress code : {{event.dressCode}}

Votre récapitulatif :
- Statut : ✅ Confirmé
- Accompagnants : {{guest.plusOnes}}
- Repas : {{guest.mealChoice}}
- Transport : {{guest.transportNeeds}}

[QR Code d'accès]

À très bientôt !
```

2. **Filtrer** : Statut "Confirmé" uniquement

3. **Envoyer**

---

### Étape 3.3 : Ajustements logistiques (J-7)

**Exports nécessaires** :

**1. Liste finale des confirmés**
- Format : CSV
- Pour : Accueil, badges, liste d'émargement
```csv
firstName,lastName,email,company,status,plusOnes
Marie,Dupont,marie@company.com,Acme Corp,Confirmé,0
Jean,Martin,jean@startup.io,StartupIO,Confirmé,1
```

**2. Répartition des repas**
- Format : PDF ou CSV
- Pour : Traiteur
```
Menu standard : 45 personnes
Menu végétarien : 28 personnes
Menu sans gluten : 8 personnes
Menu halal : 4 personnes

Allergies :
- Arachides : 2 personnes (Marie D., Jean M.)
- Lactose : 3 personnes (Sophie B., Paul L., Anne K.)
```

**3. Besoins de transport**
- Format : CSV
- Pour : Logistique transport
```csv
firstName,lastName,needsTransport,departure,arrival
Marie,Dupont,Oui,Gare de Lyon,Venue
Paul,Laurent,Oui,Aéroport CDG,Venue
```

**4. Hébergement**
- Format : CSV (rooming list)
- Pour : Hôtel
```csv
firstName,lastName,checkIn,checkOut,roomType,specialNeeds
Sophie,Bernard,14/03 16:00,16/03 11:00,Simple,PMR
```

---

## Phase 4 : ÉVÉNEMENT (Jour J)

### ⏱️ Durée : Toute la journée

### Étape 4.1 : Check-in avec QR codes

**Mise en place** :
1. Préparer la tablette/iPad avec la webapp de check-in
2. Ouvrir : `https://votre-plateforme.com/admin/events/[id]/check-in`
3. Mode plein écran recommandé

**Processus de check-in** :

```
1. Invité présente son QR code (email de confirmation)
   ↓
2. Scanner avec la tablette
   ↓
3. Validation automatique
   ✅ Invité reconnu
   ✅ Statut mis à jour : "Présent"
   ✅ Heure d'arrivée enregistrée
   ↓
4. Remettre le badge physique
   (Si système de badges activé)
```

**Cas particuliers** :
- Invité sans QR code → Recherche manuelle par nom
- Accompagnant non enregistré → Ajout sur place possible
- Invité non invité → Vérifier la liste, sinon refuser

**Statistiques en direct** :
```
Dashboard → Check-in live
Présents : 82 / 85 confirmés
Taux de présence : 96%
Dernière arrivée : Marie Dupont (09:15)
```

---

### Étape 4.2 : Gestion des absences

**Traiter les no-shows** :

1. **Identifier** : À partir de l'heure de début +30min
   - Liste des confirmés non arrivés
   - Filtrer par statut "Confirmé" + "Absent"

2. **Contacter** (optionnel) :
   - Appel ou SMS pour confirmer l'absence
   - Mettre à jour le statut : "Absent confirmé"

3. **Ajustements** :
   - Informer le traiteur (places libres)
   - Ajuster le plan de table si nécessaire

---

### Étape 4.3 : Suivi en temps réel

**Pendant l'événement** :

**Tableau de bord opérationnel** :
```
🕐 Horaire actuel : 10:30

📍 Check-in : 82/85 (96%)
   - En cours : 3 invités attendus

📅 Programme :
   ✅ 09:00 - Accueil (Terminé)
   🔄 09:30 - Keynote (En cours)
   ⏳ 11:00 - Ateliers (À venir)

🍽️ Repas :
   - Confirmés : 85
   - No-shows : 3
   - Total à servir : 82

✈️ Transport :
   - Navettes retour prévues : 17:00, 18:00, 19:00
   - Inscriptions navettes : 45 personnes
```

**Actions possibles** :
- Envoyer un SMS aux inscrits aux sessions
- Rappeler les horaires de navettes
- Ajuster la capacité des ateliers

---

## Phase 5 : POST-EVENT (J+1 à J+7)

### ⏱️ Durée : 30 minutes à 1 heure

### Étape 5.1 : Email de remerciement (J+1)

**Template de remerciement** :

```
Objet : Merci pour votre participation à {{event.name}} !

Bonjour {{guest.firstName}},

Merci d'avoir participé à {{event.name}} ! Nous espérons que vous avez apprécié cette journée autant que nous.

[BLOC IMAGE - Photos de l'événement]

📸 Retrouvez toutes les photos de l'événement :
[Lien vers la galerie]

📊 Votre avis nous intéresse !
Aidez-nous à améliorer nos prochains événements :
[Lien vers formulaire de feedback]

🎁 Contenus exclusifs :
- [Replay des keynotes]
- [Slides des présentations]
- [Résumé des tables rondes]

À très bientôt pour de nouvelles aventures !

L'équipe {{event.organizerName}}
```

**Envoi** :
- Filtrer : Statut "Présent" uniquement
- Ne pas envoyer aux absents (email différent)

---

### Étape 5.2 : Analytics et reporting (J+2 à J+7)

**Rapport final de l'événement** :

**1. Métriques de participation**
```
📊 Statistiques Invitation
- Invités totaux : 150
- Invitations envoyées : 150
- Taux d'ouverture : 78% (117)
- Taux de clic : 65% (98)

✅ Réponses RSVP
- Confirmations : 85 (56.6%)
- Refus : 17 (11.3%)
- Sans réponse : 48 (32%)

👥 Présence Jour J
- Présents : 82 (96% des confirmés)
- Absents : 3 (4% des confirmés)
- No-shows : 3

🍽️ Repas
- Servis : 82
- Menu standard : 43
- Menu végétarien : 27
- Menu sans gluten : 8
- Menu halal : 4
```

**2. Analyse temporelle**
```
📈 Évolution des réponses
Semaine 1 (J-60) : 15 confirmations
Semaine 2 (J-53) : 25 confirmations (+10)
Semaine 3 (J-46) : 38 confirmations (+13)
Semaine 4 (J-39) : 52 confirmations (+14)
After reminder (J-20) : 72 confirmations (+20)
Last week (J-7) : 85 confirmations (+13)
```

**3. Insights & Recommandations**
```
✅ Points forts :
- Taux d'ouverture email : 78% (excellent)
- Taux de présence confirmés : 96% (excellent)
- Réactivité post-reminder : +20 confirmations

⚠️ Points d'amélioration :
- 32% de non-répondants (cible : <20%)
→ Recommandation : Envoyer reminder plus tôt (J-25 au lieu de J-20)
→ Ajouter un 2e reminder (J-10)

- 4% d'absents confirmés
→ Recommandation : SMS de rappel J-1
```

**4. Export des données**
- CSV complet pour archivage
- PDF du rapport pour la direction
- JSON pour intégration CRM/ERP

---

## 🎯 Checklist finale

### ✅ Phase 1 : Planification
- [ ] Événement créé avec template adapté
- [ ] Configuration RSVP vérifiée
- [ ] Invités importés (CSV ou manuel)
- [ ] Tags assignés pour filtrage
- [ ] Modules activés si nécessaire
- [ ] Contenu visuel uploadé
- [ ] Page showcase personnalisée

### ✅ Phase 2 : Invitations
- [ ] Email d'invitation personnalisé
- [ ] Variables dynamiques utilisées
- [ ] Images optimisées pour email
- [ ] Email de test envoyé et validé
- [ ] Invitations envoyées (J-60)
- [ ] Logs d'envoi vérifiés (100% envoyé)

### ✅ Phase 3 : Suivi
- [ ] Dashboard consulté quotidiennement
- [ ] Reminder J-20 envoyé aux non-répondants
- [ ] Reminder J-7 envoyé aux confirmés
- [ ] Exports générés (repas, transport, hébergement)
- [ ] Traiteur/logistique notifiés (J-7)
- [ ] QR codes vérifiés fonctionnels

### ✅ Phase 4 : Événement
- [ ] Tablette check-in configurée
- [ ] Badge physiques préparés (si applicable)
- [ ] Check-in opérationnel dès 08:30
- [ ] Dashboard en temps réel suivi
- [ ] Absences gérées et documentées
- [ ] Photos/vidéos capturées

### ✅ Phase 5 : Post-Event
- [ ] Email de remerciement envoyé (J+1)
- [ ] Formulaire de feedback partagé
- [ ] Contenus (replays, slides) mis à disposition
- [ ] Rapport analytique généré (J+7)
- [ ] Données archivées (CSV/PDF/JSON)
- [ ] Insights partagés avec l'équipe

---

## 💡 Conseils d'expert

### Pour un événement réussi

**1. Planification anticipée**
- Commencer 90 jours avant l'événement minimum
- Ne pas sous-estimer le temps de préparation du contenu

**2. Communication progressive**
- Save the Date (J-90) → Créer l'anticipation
- Invitation formelle (J-60) → Détails complets
- Reminder (J-20) → Relance des absents
- Confirmation (J-7) → Infos pratiques finales
- Remerciement (J+1) → Maintenir la relation

**3. Utiliser les templates**
- Gagner 93% de temps sur la configuration
- Configuration professionnelle garantie
- Personnaliser seulement ce qui est nécessaire

**4. Exploiter les variables dynamiques**
- Emails personnalisés automatiquement
- 50+ variables disponibles
- Taux d'engagement +40% vs emails génériques

**5. Tester, tester, tester**
- Email de test AVANT chaque envoi
- Vérifier sur desktop ET mobile
- Tester les liens (RSVP, calendrier, itinéraire)

---

## 📊 ROI de la plateforme

### Avant Weevup (méthode manuelle)

```
Création événement : 2h (configuration manuelle)
Ajout invités : 1h (Excel, erreurs de saisie)
Création emails : 3h (design from scratch)
Envoi invitations : 1h (BCC, risque spam)
Suivi réponses : 5h (Excel manuel, emails éparpillés)
Jour J : 2h (check-in papier/stylo)
Post-event : 1h (compilation manuelle)
---
TOTAL : 15 heures
```

### Avec Weevup

```
Création événement : 5min (templates)
Ajout invités : 10min (import CSV validé)
Création emails : 20min (variables dynamiques)
Envoi invitations : 5min (automatisé)
Suivi réponses : 30min (dashboard temps réel)
Jour J : 15min (QR codes)
Post-event : 15min (exports automatiques)
---
TOTAL : 2 heures
```

**⚡ Gain de temps : 87% (13 heures économisées)**
**💰 Économie estimée : 1,300€ à 2,600€ par événement** (selon le taux horaire)

---

## 📚 Ressources complémentaires

- [Guide des Templates](./EVENT_TEMPLATES_GUIDE.md) - 7 templates détaillés
- [Personnalisation RSVP](./RSVP_CUSTOMIZATION_GUIDE.md) - Tous les champs
- [Guide des Modules](./MODULES-USAGE.md) - Modules avancés
- [Troubleshooting Images](./TROUBLESHOOTING_IMAGES_EMAIL.md) - Problèmes d'images
- [Guide de Démarrage](./GETTING_STARTED.md) - Pour débutants

---

*Documentation mise à jour le 21/11/2025 - Version 1.0.0*
