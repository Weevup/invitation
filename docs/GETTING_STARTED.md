# 🚀 Guide de Démarrage - Plateforme Weevup Events

Bienvenue sur la plateforme Weevup Events ! Ce guide vous accompagne pas à pas pour créer votre premier événement et envoyer vos premières invitations.

---

## 📋 Table des matières

1. [Créer votre premier événement](#créer-votre-premier-événement)
2. [Configurer les templates](#configurer-les-templates)
3. [Ajouter des invités](#ajouter-des-invités)
4. [Personnaliser les emails](#personnaliser-les-emails)
5. [Envoyer les invitations](#envoyer-les-invitations)
6. [Suivre les réponses](#suivre-les-réponses)

---

## 1. Créer votre premier événement

### Étape 1 : Accéder à la création

Depuis le dashboard admin, cliquez sur **"Nouvel événement"** ou **"Créer un événement"**.

### Étape 2 : Choisir un template

🎨 **Nouveau !** La plateforme propose 7 templates prédéfinis qui configurent automatiquement votre événement :

| Template | Idéal pour | Configuration auto |
|----------|------------|-------------------|
| 💼 **Corporate** | Conférences, séminaires | Pas d'accompagnants, repas standard, transport |
| 💍 **Mariage** | Cérémonies de mariage | 1 accompagnant, menus variés, hébergement |
| 🎉 **Gala** | Soirées de gala | 1 accompagnant, menu gastronomique |
| 🏋️ **Workshop** | Ateliers, formations | Pas d'accompagnants, déjeuner inclus |
| 🎭 **Festival** | Concerts, événements culturels | 3 accompagnants max, pas de repas |
| 🍽️ **Dîner privé** | Repas entre amis/famille | 1 accompagnant, options alimentaires |
| 🎤 **Conférence** | Keynotes, présentations | Pas d'accompagnants, transport |

**💡 Astuce** : Choisir un template vous fait gagner **93% de temps** (de 30 minutes à 2 minutes) !

📚 **Documentation détaillée** : [Guide des Templates d'Événements](./EVENT_TEMPLATES_GUIDE.md)

### Étape 3 : Remplir les informations de base

Renseignez les informations essentielles :
- **Nom de l'événement** : Ex. "Les 10 ans de Weevup"
- **Description** : Ex. "Célébration des 10 ans de l'agence au Molitor Paris"
- **Date et heure** : Date de début de l'événement
- **Lieu** : Nom du lieu et adresse complète
- **Capacité** : Nombre maximum d'invités (optionnel)

La configuration RSVP (accompagnants, repas, transport, etc.) est **déjà pré-remplie** selon le template choisi ! Vous pouvez la modifier si nécessaire.

---

## 2. Configurer les templates

### Configuration RSVP personnalisable

Selon vos besoins, vous pouvez ajuster :

**Accompagnants**
- Autoriser les +1, +2, +3...
- Définir le nombre maximum par invité

**Options de repas**
- Activer/désactiver les choix de repas
- Personnaliser les options (Végétarien, Végan, Sans gluten, Halal, etc.)
- Demander les allergies et restrictions alimentaires

**Modules additionnels**
- ✅ Transport (besoins de navette, covoiturage)
- ✅ Hébergement (réservation de chambres)
- ✅ Accessibilité (besoins spécifiques PMR)
- ✅ Consentement photos (autorisation de prise de photos)

📚 **Documentation complète** : [Guide de Personnalisation RSVP](./RSVP_CUSTOMIZATION_GUIDE.md)
🔧 **Référence rapide** : [RSVP Quick Reference](./RSVP_QUICK_REFERENCE.md)

### Variables dynamiques étendues

La plateforme offre **plus de 50 variables dynamiques** pour personnaliser vos communications :

**Événement**
- `{{event.name}}` - Nom de l'événement
- `{{event.date}}` - Date formatée (15 décembre 2025)
- `{{event.date.short}}` - Date courte (15 déc. 2025)
- `{{event.date.long}}` - Date longue avec jour (lundi 15 décembre 2025)
- `{{event.time}}` - Heure (20:00)
- `{{event.location}}` - Lieu
- `{{event.fullAddress}}` - Adresse complète

**Invité**
- `{{guest.firstName}}` - Prénom
- `{{guest.fullName}}` - Nom complet
- `{{guest.email}}` - Email
- `{{guest.company}}` - Entreprise
- `{{guest.jobTitle}}` - Poste

**Liens**
- `{{rsvpLink}}` - Lien de confirmation
- `{{calendarLink}}` - Ajouter au calendrier
- `{{directionsLink}}` - Itinéraire Google Maps
- `{{unsubscribeLink}}` - Se désinscrire

📚 **Liste complète** : Voir la variable helper dans l'éditeur d'emails ou consulter [lib/email/templates.ts](../lib/email/templates.ts)

---

## 3. Ajouter des invités

### Option 1 : Import CSV (recommandé pour >10 invités)

1. **Préparez votre fichier CSV** avec les colonnes :
   ```csv
   firstName,lastName,email,company,jobTitle
   Marie,Dupont,marie@example.com,Acme Corp,Directrice Marketing
   Jean,Martin,jean@example.com,Tech Inc,CTO
   ```

2. **Importez** : Dashboard → Invités → "Importer CSV"

3. **Vérifiez** : La plateforme détecte les doublons et erreurs automatiquement

### Option 2 : Ajout manuel (pour <10 invités)

1. Cliquez sur **"Nouvel invité"**
2. Renseignez les informations :
   - Prénom et Nom
   - Email (obligatoire)
   - Entreprise et Poste (optionnel)
   - Tags (pour filtrer plus tard)
3. Cliquez sur **"Ajouter"**

**💡 Astuce** : Utilisez les **tags** pour organiser vos invités (VIP, Presse, Partenaires, etc.)

---

## 4. Personnaliser les emails

### Templates d'emails disponibles

La plateforme propose 3 types d'emails automatisés :

1. **📧 Invitation** : Première annonce de l'événement
2. **✅ Confirmation** : Envoyée après validation du RSVP
3. **🔔 Reminder** : Rappel avant l'événement

### Personnalisation avec l'éditeur

**Navigation** : Événement → Communication → "Éditeur d'emails"

**Fonctionnalités de l'éditeur** :
- 🎨 **Éditeur visuel (WYSIWYG)** : Blocs drag & drop
- 🔧 **Mode code** : HTML personnalisé
- 📸 **Images** : Upload et compatibilité email garantie
- 🎨 **Thème** : Couleurs adaptées au template de l'événement
- 👁️ **Prévisualisation** : Vue desktop et mobile en temps réel
- 📧 **Email de test** : Envoyez-vous un test avant l'envoi réel

**Utiliser les variables dynamiques** :

Exemple :
```
Bonjour {{guest.firstName}},

Vous êtes invité(e) à {{event.name}} le {{event.date.long}} à {{event.time}}.

📍 Lieu : {{event.location}}
🗺️ Itinéraire : {{directionsLink}}

Merci de confirmer votre présence avant le {{event.rsvpDeadline}}.

[Confirmer ma présence]({{rsvpLink}})
```

Sera rendu comme :
```
Bonjour Marie,

Vous êtes invité(e) à Les 10 ans de Weevup le lundi 15 décembre 2025 à 20:00.

📍 Lieu : Molitor Paris
🗺️ Itinéraire : [Lien Google Maps]

Merci de confirmer votre présence avant le 1er décembre 2025.

[Confirmer ma présence]
```

**💡 Astuce** : Cliquez sur l'icône **"Variables"** dans l'éditeur pour voir toutes les variables disponibles et les copier en un clic.

📚 **Résolution de problèmes** : [Guide de Troubleshooting Images Email](./TROUBLESHOOTING_IMAGES_EMAIL.md)

---

## 5. Envoyer les invitations

### Envoi groupé sécurisé

La plateforme envoie les emails de manière intelligente :
- ✅ **Rate limiting** : Respect des limites des fournisseurs
- ✅ **Retry automatique** : Nouvelle tentative en cas d'échec
- ✅ **Suivi d'envoi** : Statut en temps réel pour chaque invité

### Processus d'envoi

1. **Préparation** : Dashboard → Communication → "Envoyer les invitations"

2. **Sélection des destinataires** :
   - Tous les invités
   - Filtrer par tag
   - Filtrer par statut (non envoyé, en attente, etc.)

3. **Test** : Envoyez-vous un email de test pour vérifier

4. **Envoi** : Cliquez sur **"Envoyer à tous"**

5. **Suivi** : Suivez la progression dans l'onglet "Logs d'envoi"

**⚠️ Important** : Une fois les invitations envoyées, les invités reçoivent un **lien personnel unique** valable jusqu'à la deadline RSVP.

---

## 6. Suivre les réponses

### Dashboard en temps réel

**Navigation** : Événement → Vue d'ensemble

**Métriques disponibles** :
- 📊 **Taux de réponse** : % de confirmations vs invitations envoyées
- ✅ **Confirmations** : Nombre de "Oui"
- ❌ **Refus** : Nombre de "Non"
- ⏳ **En attente** : Nombre sans réponse
- 👥 **Accompagnants** : Nombre total de +1, +2, etc.
- 🍽️ **Choix de repas** : Répartition par option
- ✈️ **Transport** : Besoins de transport recensés
- 🏨 **Hébergement** : Demandes d'hébergement

**Graphiques analytiques** :
- Évolution des réponses dans le temps (courbe)
- Répartition Oui/Non/En attente (camembert)
- Répartition des choix de repas (barres)

### Export des données

**Formats disponibles** :
- 📄 **CSV** : Pour traitement Excel/Google Sheets
- 📋 **PDF** : Rapport imprimable
- 📊 **JSON** : Pour intégrations techniques

**Cas d'usage** :
- Liste des confirmés → Pour le traiteur
- Liste des transports → Pour la logistique
- Liste des hébergements → Pour l'hôtel
- Manifeste d'accueil → Pour le check-in

📚 **Documentation modules** : [Guide des Modules](./MODULES-USAGE.md)

---

## 🎯 Workflows recommandés

### Workflow 1 : Événement corporate simple

```
1. Créer l'événement (template Corporate)
2. Importer les invités (CSV)
3. Personnaliser l'email d'invitation
4. Envoyer les invitations (J-30)
5. Envoyer un reminder (J-7)
6. Exporter la liste finale (J-1)
7. Check-in avec QR codes (jour J)
```

⏱️ **Temps estimé** : 30 minutes pour 100 invités

### Workflow 2 : Mariage avec gestion complète

```
1. Créer l'événement (template Mariage)
2. Ajouter les invités (manuel ou CSV)
3. Personnaliser l'email Save the Date
4. Envoyer les Save the Date (J-90)
5. Personnaliser l'invitation formelle
6. Envoyer les invitations (J-60)
7. Activer les modules Transport & Hébergement
8. Envoyer un reminder avec plan de table (J-14)
9. Exporter les listes (repas, transports, hébergement) (J-7)
10. Check-in avec badges personnalisés (jour J)
```

⏱️ **Temps estimé** : 2h pour 150 invités

📚 **Guide complet** : [Workflow End-to-End](./END_TO_END_WORKFLOW.md)

---

## 📚 Documentation complète

### Guides fonctionnels
- [Guide des Templates d'Événements](./EVENT_TEMPLATES_GUIDE.md) - 7 templates prédéfinis
- [Guide de Personnalisation RSVP](./RSVP_CUSTOMIZATION_GUIDE.md) - Tous les champs modifiables
- [RSVP Quick Reference](./RSVP_QUICK_REFERENCE.md) - Référence rapide
- [Guide des Modules](./MODULES-USAGE.md) - Programme, Transport, Hébergement
- [Analyse de Paramétrabilité](./PARAMETRABILITY_ANALYSIS.md) - Quick Wins et roadmap

### Guides techniques
- [Troubleshooting Images Email](./TROUBLESHOOTING_IMAGES_EMAIL.md) - Problèmes d'images dans les emails
- [Configuration Resend](./RESEND_SETUP.md) - Configuration du provider email
- [Système de Badges](./BADGE_SYSTEM.md) - Badges personnalisés et QR codes

### Ressources avancées
- [User Stories](./USER_STORIES.md) - Cas d'usage détaillés
- [Schema Phase 2](./SCHEMA-PHASE2-DESIGN.md) - Architecture technique
- [Documentation complète](./DOCUMENTATION.md) - Référence technique

---

## ❓ Besoin d'aide ?

### Support et communauté

📧 **Email** : support@weevup.com
🐛 **Bugs** : [GitHub Issues](https://github.com/Weevup/invitation/issues)
📖 **Documentation** : [Tous les guides](./README.md)

### FAQ rapide

**Q : Puis-je modifier un événement après création ?**
R : Oui, tous les paramètres sont modifiables. Attention, les invités déjà notifiés verront les changements.

**Q : Combien d'invités maximum ?**
R : Pas de limite technique. Testé avec succès jusqu'à 1000+ invités.

**Q : Puis-je annuler un envoi d'email ?**
R : Non, une fois l'envoi lancé, les emails sont traités. Utilisez toujours l'envoi de test avant l'envoi réel.

**Q : Les images s'affichent mal dans les emails ?**
R : Consultez le [Guide de Troubleshooting Images](./TROUBLESHOOTING_IMAGES_EMAIL.md)

**Q : Comment changer les textes du formulaire RSVP ?**
R : Consultez le [Guide de Personnalisation RSVP](./RSVP_CUSTOMIZATION_GUIDE.md) (824 lignes de documentation)

---

## 🚀 Prochaines étapes

Maintenant que vous maîtrisez les bases :

1. ✅ Explorez les **modules avancés** (Programme, Transport, Hébergement)
2. ✅ Configurez les **emails automatiques** (confirmations, reminders)
3. ✅ Activez le **système de badges** pour le check-in
4. ✅ Personnalisez la **page showcase** publique
5. ✅ Intégrez les **analytics** pour suivre les performances

**Bon événement ! 🎉**

---

*Documentation mise à jour le 21/11/2025 - Version 1.0.0*
