# 📱 GUIDE COMPLET SMS - NAVIGATION ET UTILISATION

## 🎯 ACCÈS AUX FONCTIONNALITÉS SMS

### 📍 **ÉTAPE 1 : Accéder à votre événement**

1. Connectez-vous à l'espace admin : **http://localhost:3000/admin**
2. Cliquez sur un de vos événements
3. Vous êtes maintenant dans `/admin/events/[id]`

---

### 📍 **ÉTAPE 2 : Navigation SMS dans la sidebar (menu de gauche)**

Une fois dans votre événement, regardez **la sidebar à gauche**. Vous verrez une section :

```
SMS & NOTIFICATIONS
├─ Templates SMS        ← Créer et gérer vos templates réutilisables
└─ Analytics SMS        ← Statistiques et historique d'envoi
```

**📝 Chemins complets :**
- Templates SMS : `/admin/events/[id]/sms-templates`
- Analytics SMS : `/admin/events/[id]/notifications/analytics`

---

## 🔧 FONCTIONNALITÉS DISPONIBLES

### 1️⃣ **AJOUTER UN NUMÉRO DE TÉLÉPHONE AUX INVITÉS**

**📍 Où :** Page **Invités** > Bouton **"Ajouter un invité"**

**🔍 Comment :**
1. Cliquez sur "Invités" dans la sidebar
2. Cliquez sur le bouton "Ajouter un invité" (en haut à droite)
3. Dans le formulaire, **cliquez sur l'onglet "Professionnel"** (2ème onglet)
4. Remplissez le champ **"Téléphone mobile (pour SMS)"**
5. Format requis : **+33612345678** (international, sans espaces)

**💡 Astuce :** Il y a aussi un champ "Téléphone fixe (optionnel)" pour les numéros legacy.

---

### 2️⃣ **CRÉER ET GÉRER DES TEMPLATES SMS**

**📍 Où :** Sidebar > **SMS & NOTIFICATIONS** > **Templates SMS**

**🔍 Ce que vous pouvez faire :**

#### ✨ Templates par défaut fournis
Vous avez **6 templates prédéfinis** :
1. **Confirmation RSVP** - Confirmation de présence
2. **Rappel J-7** - Rappel 7 jours avant l'événement
3. **Rappel J-1** - Rappel 1 jour avant l'événement
4. **Info importante** - Informations urgentes
5. **Invitation dernière minute** - Invitation rapide
6. **Merci** - Remerciement après l'événement

#### 🎨 Créer un nouveau template
1. Cliquez sur **"Nouveau template"**
2. Donnez-lui un nom (ex: "Rappel J-3")
3. Choisissez une catégorie :
   - RSVP Confirmation
   - Rappels
   - Informations
   - Personnalisé
4. Écrivez votre message avec des variables dynamiques
5. Cliquez sur "Créer"

#### 🔤 Variables disponibles (insertion automatique)
- `{firstName}` - Prénom de l'invité
- `{lastName}` - Nom de l'invité
- `{fullName}` - Nom complet
- `{company}` - Entreprise
- `{jobTitle}` - Fonction
- `{eventName}` - Nom de l'événement
- `{eventDate}` - Date de l'événement
- `{eventTime}` - Heure de l'événement
- `{venueName}` - Nom du lieu
- `{venueAddress}` - Adresse du lieu
- `{rsvpLink}` - Lien de confirmation
- `{rsvpDeadline}` - Date limite RSVP

#### 📋 Exemple de template
```
Bonjour {firstName} !

{eventName} a lieu dans 7 jours, le {eventDate} à {eventTime}.

Rendez-vous à {venueName} !

Confirmez votre présence : {rsvpLink}

À très bientôt !
```

#### ⚙️ Actions disponibles
- **Aperçu** - Voir le rendu avec des exemples
- **Modifier** - Éditer le template
- **Dupliquer** - Créer une copie
- **Supprimer** - Effacer (sauf templates par défaut)

---

### 3️⃣ **ENVOYER DES SMS AUX INVITÉS**

**📍 Où :** Page **Invités** > Bouton **"Envoyer SMS"** (en haut à droite)

**🔍 Comment envoyer un SMS :**

#### Étape 1 : Filtrer vos invités (optionnel)
Avant d'envoyer, vous pouvez filtrer :
- **Par statut :** Confirmés / Déclinés / En attente
- **Par tag :** VIP, Presse, Sponsor, etc.
- **Par secteur :** Tech, Finance, etc.
- **Par fonction :** CEO, Manager, etc.
- **Recherche :** Par nom, email, entreprise

#### Étape 2 : Cliquer sur "Envoyer SMS"
- Le bouton affiche le **nombre d'invités avec téléphone**
- Exemple : **"Envoyer SMS [12]"** = 12 invités avec numéro valide

#### Étape 3 : Composer votre message
Dans la dialog qui s'ouvre :

1. **Vérifiez les destinataires**
   - Vous verrez combien d'invités recevront le SMS
   - Combien d'invités n'ont PAS de téléphone (seront ignorés)

2. **Choisissez un template** (optionnel)
   - Cliquez sur un des templates prédéfinis
   - Le message se remplit automatiquement
   - Les variables seront remplacées automatiquement

3. **OU écrivez un message personnalisé**
   - Saisissez votre message directement
   - Maximum 1600 caractères
   - 1 SMS = 160 caractères
   - Au-delà = SMS concaténés

4. **Vérifiez le compteur**
   - Nombre de caractères utilisés
   - Nombre de SMS qui seront envoyés
   - Caractères restants

5. **Cliquez sur "Envoyer"**
   - Les SMS sont envoyés via Twilio
   - Vous verrez le résultat : nombre réussi / échoué

---

### 4️⃣ **CONSULTER LES ANALYTICS SMS**

**📍 Où :** Sidebar > **SMS & NOTIFICATIONS** > **Analytics SMS**

**🔍 Ce que vous pouvez voir :**

#### 📊 Statistiques globales
- **Total envoyés** - Nombre total de SMS
- **Réussis** - SMS délivrés avec succès
- **Échoués** - SMS en échec
- **En attente** - SMS en cours d'envoi
- **Taux de délivrance** - Pourcentage de succès
- **Coût estimé** - Estimation des frais Twilio

#### 📈 Utilisation des templates
- Templates les plus utilisés
- Nombre d'utilisations par template
- Dernière utilisation

#### 📅 Statistiques journalières
- Évolution des envois par jour
- Nombre de réussites/échecs par jour

#### 🏆 Top destinataires
- Invités ayant reçu le plus de SMS
- Nombre de messages par invité

#### 📜 Historique complet
- Liste des 100 dernières notifications
- Statuts détaillés : PENDING, SENDING, SENT, DELIVERED, FAILED
- Horodatage de chaque SMS
- Codes d'erreur si échec

---

## 🎬 WORKFLOW COMPLET - EXEMPLE PRATIQUE

### Scénario : Envoyer un rappel J-7 aux invités confirmés

#### ✅ Étape 1 : Préparer les invités
1. Allez sur **Invités**
2. Vérifiez que vos invités ont un numéro de téléphone
3. Si besoin, ajoutez les numéros :
   - Cliquez sur "Ajouter un invité"
   - Onglet "Professionnel"
   - Remplissez "Téléphone mobile (pour SMS)" avec format +33...

#### ✅ Étape 2 : Créer un template (optionnel)
1. Allez sur **Templates SMS** (sidebar)
2. Cliquez sur "Nouveau template"
3. Nom : "Rappel J-7"
4. Catégorie : "Rappels"
5. Message :
```
Bonjour {firstName} !

{eventName} a lieu dans 7 jours, le {eventDate} à {eventTime}.

Lieu : {venueName}
Adresse : {venueAddress}

N'oubliez pas de confirmer votre présence : {rsvpLink}

À très bientôt !
L'équipe Weevup
```
6. Cliquez sur "Créer"

#### ✅ Étape 3 : Filtrer les invités confirmés
1. Retournez sur **Invités**
2. Dans les filtres en haut :
   - Statut : Sélectionnez **"Confirmés"**
3. Vérifiez le nombre d'invités affichés

#### ✅ Étape 4 : Envoyer le SMS
1. Cliquez sur **"Envoyer SMS"** (en haut à droite)
2. Vérifiez le nombre d'invités qui recevront le SMS
3. Sélectionnez votre template "Rappel J-7" OU écrivez un message
4. Vérifiez le nombre de caractères et de SMS
5. Cliquez sur **"Envoyer"**

#### ✅ Étape 5 : Vérifier l'envoi
1. Allez sur **Analytics SMS** (sidebar)
2. Consultez les statistiques :
   - Nombre de SMS envoyés
   - Taux de succès
   - Historique détaillé

---

## 🚨 RÉSOLUTION DE PROBLÈMES

### ❌ "Je ne vois pas le bouton Envoyer SMS"

**Causes possibles :**
1. Aucun invité sélectionné
2. Aucun invité n'a de numéro de téléphone
3. Le serveur Next.js n'a pas été redémarré

**Solution :**
1. Vérifiez que vous avez des invités avec numéro de téléphone
2. Redémarrez le serveur : `npm run dev`
3. Videz le cache du navigateur (Ctrl + Shift + R)

---

### ❌ "Je ne vois pas Templates SMS dans la sidebar"

**Causes possibles :**
1. Le build Next.js n'a pas été fait
2. Les permissions des dossiers étaient restrictives (corrigé ✅)
3. Le serveur n'a pas redémarré

**Solution :**
1. Arrêtez le serveur (Ctrl + C)
2. Relancez : `npm run dev`
3. Rechargez la page dans le navigateur
4. Si toujours invisible, vérifiez que vous êtes bien dans un événement (URL : `/admin/events/[id]/...`)

---

### ❌ "L'envoi de SMS échoue"

**Causes possibles :**
1. Configuration Twilio manquante
2. Numéro de téléphone au mauvais format
3. Crédit Twilio épuisé

**Solution :**
1. Vérifiez les variables d'environnement `.env` :
```
TWILIO_ACCOUNT_SID=votre_account_sid
TWILIO_AUTH_TOKEN=votre_auth_token
TWILIO_PHONE_NUMBER=votre_numero_twilio
```
2. Vérifiez le format des numéros : **+33612345678** (format E.164)
3. Vérifiez le crédit Twilio sur votre compte

---

## 📸 CAPTURES D'ÉCRAN ATTENDUES

### Navigation SMS dans la sidebar
```
📋 GESTION ÉVÉNEMENT
├─ Vue d'ensemble
├─ Configuration
├─ Données
├─ Showcase
├─ Invités           ← Page pour envoyer SMS
├─ Check-in
├─ Badges
└─ Analytics Pro

📧 EMAIL & COMMUNICATIONS
├─ Templates
├─ Campagnes
├─ Analytics
└─ Configuration RSVP

📱 SMS & NOTIFICATIONS   ← SECTION SMS
├─ Templates SMS         ← Créer des templates
└─ Analytics SMS         ← Voir les statistiques
```

---

## 🔗 URLS DIRECTES

Si vous êtes dans l'événement avec ID `abc123` :

- **Templates SMS :** `http://localhost:3000/admin/events/abc123/sms-templates`
- **Analytics SMS :** `http://localhost:3000/admin/events/abc123/notifications/analytics`
- **Page Invités :** `http://localhost:3000/admin/events/abc123/guests`

---

## 💡 CONSEILS ET BONNES PRATIQUES

### ✅ Format des numéros de téléphone
- **Correct :** +33612345678
- **Incorrect :** 06 12 34 56 78
- **Incorrect :** 0612345678
- **Incorrect :** +33 6 12 34 56 78

### ✅ Optimisation des messages
- 160 caractères = 1 SMS
- 161-320 caractères = 2 SMS concaténés
- Maximum recommandé : 480 caractères (3 SMS)
- Maximum système : 1600 caractères

### ✅ Variables dynamiques
- Utilisez `{firstName}` au lieu du nom en dur
- Personnalisez avec `{company}` et `{jobTitle}`
- Toujours inclure `{rsvpLink}` pour la confirmation
- Ajoutez `{eventDate}` et `{eventTime}` pour les rappels

### ✅ Timing des envois
- Rappel J-7 : 1 semaine avant
- Rappel J-1 : Veille de l'événement
- Confirmation RSVP : Immédiatement après inscription
- Info importante : Dès que nécessaire

---

## 🎯 CHECKLIST DE VÉRIFICATION

Avant d'envoyer des SMS, vérifiez :

- [ ] Les invités ont des numéros de téléphone au format international (+33...)
- [ ] Le template SMS est créé et testé (aperçu)
- [ ] Les variables sont correctement utilisées
- [ ] Le message ne dépasse pas 480 caractères (3 SMS max recommandé)
- [ ] Les filtres d'invités sont corrects (confirmés, tags, etc.)
- [ ] La configuration Twilio est en place (.env)
- [ ] Vous avez suffisamment de crédit Twilio

---

## 📞 SUPPORT

Si vous rencontrez des problèmes :

1. Vérifiez ce guide
2. Consultez les logs : `/tmp/nextjs.log`
3. Vérifiez la console du navigateur (F12)
4. Vérifiez les variables d'environnement `.env`

---

**Dernière mise à jour :** 17 novembre 2025
**Version :** 1.0
