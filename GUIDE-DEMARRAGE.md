# 🚀 Guide de Démarrage Rapide - Invitation Manager

## 📋 Pré-requis

- ✅ Base de données PostgreSQL configurée (Neon)
- ✅ Node.js 18+ installé
- ✅ Variables d'environnement configurées dans `.env`

---

## 1️⃣ Configuration initiale (Première fois)

### Étape 1: Accéder à la page de configuration

```
http://localhost:3000/admin/setup
```

ou si déployé:

```
https://votre-domaine.vercel.app/admin/setup
```

### Étape 2: Initialiser la base de données

Sur la page de setup, cliquez sur **"Initialiser avec données de démo"**

Cela va créer:
- ✅ Toutes les tables nécessaires
- ✅ Un événement de démo "10 ans de Weevup"
- ✅ 5 invités de test
- ✅ Quelques RSVPs exemple

**Résultat attendu**: Message de succès "Configuration terminée!"

---

## 2️⃣ Créer votre premier événement

### Option A: Via l'interface admin

1. Aller sur `/admin`
2. Cliquer sur **"Nouvel événement"**
3. Remplir le formulaire:
   - Nom de l'événement
   - Date et heure
   - Lieu (nom, adresse, ville)
   - Description
   - Configuration RSVP (deadline, accompagnants, repas)
4. Cliquer sur **"Créer l'événement"**

### Option B: Via l'API

```bash
curl -X POST http://localhost:3000/api/admin/events \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mon événement",
    "slug": "mon-evenement",
    "startsAt": "2025-12-15T18:00:00.000Z",
    "venueName": "Salle des fêtes",
    "city": "Paris",
    "description": "Une soirée mémorable",
    "allowPlusOnes": true,
    "maxPlusOnes": 2,
    "requireMeal": true,
    "mealOptions": ["Viande", "Poisson", "Végétarien"]
  }'
```

---

## 3️⃣ Ajouter des invités

### Option A: Ajout manuel (1 invité)

1. Ouvrir l'événement dans `/admin/events/[id]`
2. Cliquer sur **"Ajouter un invité"**
3. Remplir:
   - Prénom, Nom
   - Email (unique par événement)
   - Entreprise (optionnel)
   - Tags (optionnel, séparés par virgules)
4. Cliquer sur **"Ajouter"**

→ Un token unique est généré automatiquement
→ Le lien d'invitation est affiché

### Option B: Import CSV (en masse)

1. Créer un fichier CSV avec ce format:

```csv
firstName,lastName,email,company,tags
Jean,Dupont,jean@example.com,Acme Corp,"VIP,Partenaire"
Marie,Martin,marie@example.com,Tech Inc,"Équipe"
Paul,Durand,paul@example.com,,Client
```

2. Sur la page événement, cliquer sur **"Importer CSV"**
3. Sélectionner le fichier
4. Vérifier la prévisualisation (5 premières lignes)
5. Cliquer sur **"Importer"**

→ Rapport détaillé avec succès/erreurs

### Option C: Via l'API

```bash
curl -X POST http://localhost:3000/api/admin/events/[ID]/guests \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Sophie",
    "lastName": "Bernard",
    "email": "sophie@example.com",
    "company": "StartupXYZ",
    "tags": ["Partenaire", "VIP"]
  }'
```

---

## 4️⃣ Configurer les emails

### Étape 1: Configurer SMTP dans `.env`

#### Avec Gmail:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=votre-email@gmail.com
SMTP_PASSWORD=votre-mot-de-passe-app

EMAIL_FROM_NAME=Weevup Events
EMAIL_FROM=votre-email@gmail.com
```

> **Note**: Pour Gmail, utilisez un "mot de passe d'application" (pas votre mot de passe normal)
> Générer ici: https://myaccount.google.com/apppasswords

#### Avec SendGrid:

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=SG.votre-api-key

EMAIL_FROM_NAME=Weevup Events
EMAIL_FROM=noreply@votre-domaine.com
```

#### Avec Mailjet:

```env
SMTP_HOST=in-v3.mailjet.com
SMTP_PORT=587
SMTP_USER=votre-api-key
SMTP_PASSWORD=votre-secret-key

EMAIL_FROM_NAME=Weevup Events
EMAIL_FROM=noreply@votre-domaine.com
```

### Étape 2: Tester avec Ethereal (test gratuit)

Si vous voulez juste tester sans vrai SMTP:

1. Aller sur https://ethereal.email/create
2. Copier les identifiants SMTP
3. Les mettre dans `.env`
4. Les emails seront visibles sur Ethereal (pas envoyés réellement)

---

## 5️⃣ Envoyer les invitations

### Sur la page événement:

1. Cliquer sur **"Envoyer les invitations"**
2. Choisir le type:
   - **Invitation initiale**: Tous les invités
   - **Rappel**: Uniquement ceux qui n'ont pas répondu
3. Vérifier le nombre de destinataires
4. Cliquer sur **"Envoyer X email(s)"**

→ Rapport détaillé après envoi
→ Logs sauvegardés dans `EmailLog`

### Contenu des emails:

**Email d'invitation:**
- Design violet professionnel
- Lien magique personnalisé
- Détails de l'événement

**Email de rappel:**
- Design orange (urgence)
- Date limite de réponse
- Lien vers RSVP

**Email de confirmation:**
- Design vert (si accepté)
- QR code pour check-in
- Récapitulatif de la réponse

---

## 6️⃣ Invités: Répondre à l'invitation

### Flux invité:

1. L'invité reçoit l'email
2. Clique sur le lien (format: `/guest/[TOKEN]`)
3. Voit la page personnalisée avec son nom
4. Remplit le formulaire RSVP en 6 étapes:
   - ✅ Participation (oui/non)
   - ✅ Accompagnants (si autorisé)
   - ✅ Choix de repas + allergies (si requis)
   - ✅ Besoins pratiques (accessibilité, transport, hébergement)
   - ✅ Consentements (photos)
   - ✅ Récapitulatif et validation

5. Reçoit un email de confirmation avec QR code (si participe)

### Modification d'une réponse:

L'invité peut retourner sur son lien à tout moment avant la deadline pour modifier sa réponse.

---

## 7️⃣ Suivre les réponses

### Dashboard événement (`/admin/events/[id]`):

Affiche en temps réel:
- 📊 Total invités
- ✅ Nombre de réponses (%)
- 👥 Participations confirmées
- ⏳ En attente de réponse

### Tableau des invités:

- ✅ Statut RSVP (Participe / Décline / En attente)
- 🔍 Recherche par nom/email
- 📋 Détails: accompagnants, repas, allergies
- 📧 Copie rapide du lien d'invitation

### Export des données:

Cliquer sur **"Exporter"** pour télécharger un CSV avec:
- Toutes les informations invités
- Statut RSVP
- Choix de repas
- Accompagnants
- Etc.

---

## 8️⃣ Raccourcis et astuces

### URLs importantes:

```
/admin                    → Dashboard principal
/admin/setup             → Configuration DB
/admin/diagnostic        → Diagnostic technique
/admin/events            → Liste événements
/admin/events/new        → Créer événement
/admin/events/[id]       → Gérer événement
/guest/[token]           → RSVP invité

/api/admin/status        → Statut DB (JSON)
/api/admin/init          → Initialiser données démo
```

### Copie rapide du lien invité:

Sur la page événement, cliquez sur l'icône 🔗 à côté de chaque invité pour copier son lien personnel.

### Filtrer les invités sans réponse:

Utilisez la barre de recherche ou triez le tableau par statut.

### Relancer les invités:

Cliquez sur "Envoyer les invitations" → "Rappel" pour envoyer uniquement aux invités sans réponse.

---

## 🆘 Résolution de problèmes

### Problème: "Database connection failed"

**Solution:**
1. Vérifier `DATABASE_URL` dans `.env`
2. S'assurer que la DB Neon est accessible
3. Aller sur `/admin/diagnostic` pour plus d'infos

### Problème: "Table doesn't exist"

**Solution:**
1. Aller sur `/admin/setup`
2. Cliquer sur "Initialiser avec données de démo"
3. Attendre la confirmation

### Problème: Les emails ne s'envoient pas

**Solution:**
1. Vérifier les variables SMTP dans `.env`
2. Tester avec Ethereal d'abord
3. Vérifier les logs dans la console
4. Consulter la table `EmailLog` pour les erreurs

### Problème: Lien invité invalide

**Solution:**
1. Vérifier que le token n'a pas expiré (90 jours)
2. Regénérer l'invité si besoin
3. Vérifier que `NEXT_PUBLIC_APP_URL` est correct

---

## 📞 Support

Pour plus d'aide:
- 📖 Consultez `VERIFICATION-REPORT.md`
- 🐛 Rapport de bugs: GitHub Issues
- 💬 Questions: Contactez l'équipe

---

## 🎉 Félicitations!

Vous êtes maintenant prêt à gérer vos événements comme un pro! 🚀

**Checklist finale:**
- ✅ DB initialisée
- ✅ Premier événement créé
- ✅ Invités ajoutés
- ✅ SMTP configuré
- ✅ Premier email envoyé
- ✅ Premier RSVP reçu

**Bon événement!** 🎊
