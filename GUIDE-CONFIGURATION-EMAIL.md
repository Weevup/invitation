# 📧 Guide Complet de Configuration Email - Weevup Invitation

> **Guide détaillé pour configurer l'envoi d'emails avec Resend, synchroniser la base de données et utiliser les templates.**

---

## 📋 Table des Matières

1. [Vue d'ensemble du système](#1-vue-densemble-du-système)
2. [Configuration de Resend](#2-configuration-de-resend)
3. [Synchronisation de la base de données](#3-synchronisation-de-la-base-de-données)
4. [Utilisation des templates d'email](#4-utilisation-des-templates-demail)
5. [Envoi d'invitations](#5-envoi-dinvitations)
6. [Dépannage](#6-dépannage)

---

## 1. Vue d'ensemble du système

### Architecture Email

Votre application utilise une architecture modulaire pour l'envoi d'emails :

```
┌─────────────────────┐
│   Application       │
│   Next.js           │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  lib/email/         │
│  - resend.ts       │  ← Lazy initialization
│  - templates.ts    │  ← Rendu des templates
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Resend API         │  ← Service d'envoi
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Destinataires      │
└─────────────────────┘
```

### Composants Clés

| Composant | Rôle | Fichier |
|-----------|------|---------|
| **Resend Client** | Connexion à l'API Resend | `lib/email/resend.ts` |
| **Templates** | Rendu des emails HTML | `lib/email/templates.ts` |
| **EmailIntegration** | Config BDD (optionnel) | Table PostgreSQL |
| **EmailTemplate** | Templates personnalisés | Table PostgreSQL |
| **EmailLog** | Historique d'envoi | Table PostgreSQL |

---

## 2. Configuration de Resend

### Étape 1 : Créer un compte Resend

1. **Allez sur** https://resend.com
2. **Cliquez sur** "Sign Up" (ou "Get Started")
3. **Inscrivez-vous** avec votre email professionnel
4. **Vérifiez** votre email

### Étape 2 : Vérifier votre domaine

#### Option A : Domaine personnalisé (Recommandé pour production)

1. Dans le dashboard Resend, allez dans **"Domains"**
2. Cliquez sur **"Add Domain"**
3. Entrez votre domaine : `weevup.fr`

4. **Configurez les enregistrements DNS** :

Resend va vous donner des enregistrements à ajouter dans votre zone DNS :

```
Type    Nom                     Valeur
────────────────────────────────────────────────────────────
TXT     @                       resend-domain-verification=xxx
TXT     _dmarc                  v=DMARC1; p=none
TXT     @                       v=spf1 include:resend.com ~all
CNAME   resend._domainkey       resend._domainkey.resend.com
MX      @                       feedback-smtp.resend.com (priority 10)
```

5. **Ajoutez ces enregistrements** dans votre gestionnaire DNS (OVH, Cloudflare, etc.)

**Exemple avec OVH :**
- Connectez-vous à votre espace OVH
- Allez dans "Web Cloud" → "Noms de domaine" → `weevup.fr`
- Cliquez sur "Zone DNS"
- Cliquez sur "Ajouter une entrée"
- Sélectionnez le type d'enregistrement (TXT, CNAME, MX)
- Copiez/collez les valeurs fournies par Resend

6. **Attendez la vérification** (peut prendre de 10 minutes à 48h)
   - Statut vérifié : ✅ "Verified"
   - Vous pouvez maintenant envoyer depuis `@weevup.fr`

#### Option B : Domaine de test (Pour développement)

Si vous ne voulez pas configurer de domaine tout de suite :

- Utilisez `onboarding@resend.dev` comme expéditeur
- **Limites** : 100 emails/jour max
- **Note** : Les emails peuvent aller dans les spams

### Étape 3 : Créer une clé API

1. Dans le dashboard Resend, allez dans **"API Keys"**
2. Cliquez sur **"Create API Key"**
3. **Donnez un nom** : `Weevup Production` (ou `Weevup Dev`)
4. **Permissions** :
   - ✅ Sending access (minimum requis)
   - ✅ Full access (recommandé)
5. Cliquez sur **"Add"**
6. **COPIEZ LA CLÉ IMMÉDIATEMENT** ⚠️

```
re_1A2B3C4D5E6F7G8H9I0J
```

⚠️ **Important** : Cette clé ne sera JAMAIS réaffichée. Si vous la perdez, créez-en une nouvelle.

### Étape 4 : Configurer dans Vercel

#### 4a. Accéder aux Variables d'Environnement

1. Allez sur https://vercel.com/dashboard
2. Sélectionnez votre projet **"invitation"**
3. Cliquez sur **"Settings"** (onglet en haut)
4. Dans le menu latéral, cliquez sur **"Environment Variables"**

#### 4b. Ajouter les Variables

Ajoutez les 3 variables suivantes :

| Variable | Valeur | Environnements |
|----------|--------|----------------|
| `RESEND_API_KEY` | `re_xxx...` (votre clé copiée) | ✅ Production, ✅ Preview |
| `EMAIL_FROM` | `julien@weevup.fr` ou `noreply@weevup.fr` | ✅ Production, ✅ Preview |
| `EMAIL_FROM_NAME` | `Weevup` ou `Julien - Weevup` | ✅ Production, ✅ Preview |

**Comment ajouter chaque variable :**

1. Cliquez sur **"Add New"**
2. **Name** : `RESEND_API_KEY`
3. **Value** : Collez votre clé API
4. **Environments** : Cochez `Production` et `Preview`
5. Cliquez sur **"Save"**
6. Répétez pour `EMAIL_FROM` et `EMAIL_FROM_NAME`

#### 4c. Redéployer l'Application

1. Allez dans **"Deployments"** (onglet en haut)
2. Cliquez sur les **3 petits points** à côté du dernier déploiement
3. Cliquez sur **"Redeploy"**
4. Attendez la fin du build (~2 minutes)

### Étape 5 : Vérifier que ça fonctionne

1. Allez sur votre application : `https://votre-app.vercel.app`
2. Connectez-vous au dashboard admin : `/admin`
3. Allez dans **Settings** → **Email** (ou `/admin/settings/email`)
4. Dans l'onglet **"Test"** :
   - Entrez votre email
   - Cliquez sur "Envoyer un email de test"
5. ✅ **Succès** : Vous recevez l'email dans quelques secondes

**Si ça ne marche pas**, consultez la section [Dépannage](#6-dépannage).

---

## 3. Synchronisation de la Base de Données

### Pourquoi synchroniser ?

Pour utiliser les fonctionnalités avancées (interface web d'intégrations, templates personnalisés), vous devez créer les tables dans PostgreSQL :

- `EmailIntegration` - Configuration des providers email
- `EmailTemplate` - Templates d'emails personnalisés
- `EmailLog` - Historique des envois
- `EmailTracking` - Tracking des ouvertures/clics

### Méthode 1 : Depuis votre machine locale (RECOMMANDÉ)

#### Étape 1 : Récupérer DATABASE_URL depuis Vercel

1. Vercel Dashboard → Votre projet → **Settings** → **Environment Variables**
2. Trouvez `DATABASE_URL`
3. Cliquez sur l'icône œil 👁️ pour révéler la valeur
4. **Copiez** la connection string complète :

```
postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require
```

#### Étape 2 : Configurer localement

1. Ouvrez votre projet en local
2. Ouvrez `.env` (ou créez-le)
3. **Ajoutez temporairement** :

```bash
DATABASE_URL="postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require"
```

#### Étape 3 : Synchroniser

```bash
# Générer le client Prisma
npm run db:generate

# Synchroniser le schéma avec la BDD
npm run db:push

# (Optionnel) Charger les templates de démonstration
npm run db:seed:templates
```

**Résultat attendu :**

```
✔ Generated Prisma Client
✔ Your database is now in sync with your Prisma schema
```

#### Étape 4 : Vérifier

```bash
# Ouvrir Prisma Studio pour visualiser la BDD
npm run db:studio
```

Ouvrez http://localhost:5555 dans votre navigateur et vérifiez que ces tables existent :

- ✅ EmailIntegration
- ✅ EmailTemplate
- ✅ EmailLog
- ✅ EmailTracking

#### Étape 5 : Nettoyage

⚠️ **Important** : Supprimez `DATABASE_URL` de votre `.env` local si vous avez une BDD locale différente.

### Méthode 2 : Script automatique

```bash
./scripts/setup-database.sh
```

Ce script va :
1. Vérifier que `DATABASE_URL` est configuré
2. Générer le client Prisma
3. Synchroniser la BDD
4. (Optionnel) Charger les données de seed

### Vérifier que la synchronisation a réussi

1. Allez sur votre app : `https://votre-app.vercel.app/admin/settings/integrations`
2. Essayez de configurer Resend dans l'interface web
3. Si vous pouvez cliquer sur "Enregistrer" sans erreur → ✅ La BDD est synchronisée !

---

## 4. Utilisation des Templates d'Email

### Qu'est-ce qu'un template ?

Un template est un modèle HTML d'email réutilisable avec :
- Des **variables dynamiques** : `{{guest.firstName}}`, `{{event.name}}`
- Des **styles personnalisés** : couleurs, polices
- Du **contenu HTML** : structure de l'email

### Accéder à la page Templates

1. Dashboard Admin → **Templates** (ou `/admin/templates`)
2. Vous verrez la liste de vos templates

### Créer un nouveau template

#### Étape 1 : Cliquer sur "Nouveau Template"

#### Étape 2 : Remplir les informations

**Informations de base :**

| Champ | Exemple | Description |
|-------|---------|-------------|
| **Nom** | `Invitation Gala 2025` | Nom descriptif |
| **Slug** | `invitation-gala-2025` | Identifiant unique (auto-généré) |
| **Type** | `INVITATION` | Type d'email |
| **Description** | `Template pour le gala annuel` | Description optionnelle |

**Sujet de l'email :**

```
Vous êtes invité au {{event.name}} le {{event.date}}
```

**Couleurs :**

- **Primaire** : `#004645` (vert foncé Weevup)
- **Secondaire** : `#009197` (vert clair)
- **Accent** : `#FF4713` (orange)

#### Étape 3 : Éditer le HTML

**Structure de base fournie :**

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: {{fontFamily}};
      background-color: #f5f5f5;
    }
    .header {
      background: linear-gradient(135deg, {{primaryColor}}, {{secondaryColor}});
      color: #ffffff;
      padding: 40px;
    }
    .button {
      background-color: {{accentColor}};
      color: #fff;
      padding: 12px 30px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>{{event.name}}</h1>
    <p>{{event.date}} • {{event.location}}</p>
  </div>

  <div class="content">
    <h2>Bonjour {{guest.firstName}},</h2>
    <p>Nous avons le plaisir de vous inviter...</p>

    <a href="{{rsvpLink}}" class="button">
      Confirmer ma présence
    </a>
  </div>
</body>
</html>
```

#### Étape 4 : Variables disponibles

Vous pouvez utiliser ces variables dans votre template :

| Variable | Exemple de valeur | Utilisation |
|----------|-------------------|-------------|
| `{{event.name}}` | `Tech Summit 2025` | Nom de l'événement |
| `{{event.date}}` | `15 septembre 2025` | Date formatée |
| `{{event.time}}` | `9h00` | Heure |
| `{{event.location}}` | `Station F, Paris` | Lieu |
| `{{event.address}}` | `5 Parvis Alan Turing...` | Adresse complète |
| `{{guest.firstName}}` | `Jean` | Prénom de l'invité |
| `{{guest.lastName}}` | `Dupont` | Nom de l'invité |
| `{{rsvpLink}}` | `https://...` | Lien de confirmation |
| `{{primaryColor}}` | `#004645` | Couleur primaire |
| `{{secondaryColor}}` | `#009197` | Couleur secondaire |
| `{{accentColor}}` | `#FF4713` | Couleur accent |

#### Étape 5 : Prévisualiser

- **Panneau de droite** : Aperçu en temps réel avec données de test
- Modifiez le HTML et voyez le résultat instantanément

#### Étape 6 : Sauvegarder

Cliquez sur **"Enregistrer"** en bas à droite.

### Modifier un template existant

1. Trouvez le template dans la liste
2. Cliquez sur **"Modifier"** (icône crayon)
3. Faites vos modifications
4. Cliquez sur **"Enregistrer"**

### Dupliquer un template

1. Cliquez sur **l'icône de copie** sur un template
2. Un nouveau template est créé avec "(Copie)" ajouté au nom
3. Modifiez-le selon vos besoins

### Supprimer un template

⚠️ **Attention** : Les templates par défaut ne peuvent pas être supprimés.

1. Cliquez sur **l'icône corbeille**
2. Confirmez la suppression

---

## 5. Envoi d'Invitations

### Préparer un événement

#### Étape 1 : Créer un événement

1. Dashboard Admin → **Événements** → **"Nouvel Événement"**
2. Remplissez les informations :
   - Nom, date, lieu
   - Description
   - Programme

#### Étape 2 : Ajouter des invités

**Option A : Ajout manuel**

1. Dans votre événement → **"Invités"** → **"Ajouter un invité"**
2. Remplissez : prénom, nom, email

**Option B : Import CSV**

1. Préparez un fichier CSV :

```csv
firstName,lastName,email,company,tags
Jean,Dupont,jean.dupont@example.com,Acme Corp,VIP
Marie,Martin,marie.martin@example.com,Tech Inc,Speaker
```

2. Cliquez sur **"Importer CSV"**
3. Sélectionnez votre fichier
4. Mappez les colonnes
5. Importez

### Envoyer les invitations

#### Étape 1 : Aller dans l'onglet "Invitations"

1. Dans votre événement → **"Invitations"** (ou **"Send Invitations"**)

#### Étape 2 : Sélectionner les destinataires

Vous pouvez filtrer par :
- ✅ **Tous les invités**
- ✅ **Par statut** : Pending, Invited, Responded
- ✅ **Par tags** : VIP, Speaker, Sponsor...

Exemple : Envoyer uniquement aux VIP qui n'ont pas encore reçu d'invitation.

#### Étape 3 : Choisir un template

1. Sélectionnez un template dans le menu déroulant
2. **Aperçu** : Cliquez sur l'œil pour voir le rendu

#### Étape 4 : Personnaliser (optionnel)

- **Sujet** : Modifiez le sujet de l'email
- **Message** : Ajoutez un message personnalisé

#### Étape 5 : Envoyer

1. Cliquez sur **"Envoyer les invitations"**
2. Confirmez
3. **Progression** : Une barre de progression s'affiche
4. **Résultat** :
   ```
   ✅ 45 invitations envoyées avec succès
   ❌ 2 échecs (adresses invalides)
   ```

### Suivre les envois

#### Dans l'onglet "Emails"

Vous verrez un tableau avec :

| Invité | Type | Sujet | Statut | Envoyé le | Ouvert |
|--------|------|-------|--------|-----------|---------|
| Jean Dupont | INVITATION | Vous êtes invité... | ✅ Envoyé | 01/11 14:30 | ✅ Oui |
| Marie Martin | INVITATION | Vous êtes invité... | ✅ Envoyé | 01/11 14:30 | ⏳ Non |
| Paul Durand | INVITATION | Vous êtes invité... | ❌ Échec | 01/11 14:30 | - |

**Statuts possibles :**

- 🕐 **Pending** : En attente d'envoi
- ✅ **Sent** : Envoyé
- 📧 **Delivered** : Délivré au serveur du destinataire
- 👁️ **Opened** : Ouvert par le destinataire
- 🖱️ **Clicked** : Lien cliqué
- ⚠️ **Bounced** : Rebond (adresse invalide)
- ❌ **Failed** : Échec

---

## 6. Dépannage

### Problème : "Impossible d'enregistrer la configuration Resend"

**Cause** : La table `EmailIntegration` n'existe pas dans la base de données.

**Solution** :

```bash
# Avec DATABASE_URL dans .env
npm run db:push
```

### Problème : "La page Templates ne charge pas"

**Cause** : La table `EmailTemplate` n'existe pas.

**Solution** :

```bash
npm run db:push
npm run db:seed:templates  # Charger les templates par défaut
```

### Problème : "Error: Missing API key"

**Cause 1** : `RESEND_API_KEY` n'est pas configuré dans Vercel.

**Solution** :
1. Vercel → Settings → Environment Variables
2. Ajoutez `RESEND_API_KEY`
3. Redéployez

**Cause 2** : Erreur de build (déjà corrigée dans votre version).

### Problème : "Les emails vont dans les spams"

**Causes possibles :**

1. **Domaine non vérifié**
   - ✅ Vérifiez votre domaine dans Resend
   - ✅ Configurez SPF, DKIM, DMARC

2. **Email expéditeur non correspondant**
   - Si vous utilisez `julien@weevup.fr`, vérifiez que `weevup.fr` est bien validé dans Resend

3. **Contenu suspect**
   - Évitez les mots "spam" : "GRATUIT", "URGENT", "CLIQUEZ ICI"
   - Utilisez un bon ratio texte/images

**Solution rapide** :
```
Demandez aux destinataires d'ajouter votre adresse dans leurs contacts.
```

### Problème : "Test email failed: 403 Forbidden"

**Cause** : Clé API invalide ou révoquée.

**Solution** :
1. Créez une nouvelle clé API dans Resend
2. Mettez à jour `RESEND_API_KEY` dans Vercel
3. Redéployez

### Problème : "Connection timeout" lors du seed

**Cause** : DATABASE_URL incorrecte ou BDD inaccessible.

**Solution** :
```bash
# Tester la connexion
npm run db:studio

# Si ça ne marche pas, vérifier DATABASE_URL
echo $DATABASE_URL
```

### Problème : "Table EmailIntegration already exists"

**C'est normal !** Les migrations utilisent `CREATE TABLE IF NOT EXISTS`.

### Vérifier les logs Vercel

1. Vercel Dashboard → Votre projet → **"Logs"**
2. Filtrez par fonction : `/api/admin/templates`
3. Cherchez les erreurs

### Vérifier les logs Resend

1. Dashboard Resend → **"Logs"**
2. Vous verrez tous les emails envoyés
3. Cliquez sur un email pour voir les détails :
   - ✅ Delivered
   - 📧 Opened
   - 🔗 Clicked

---

## 📚 Ressources Complémentaires

### Documentation Officielle

- [Resend Docs](https://resend.com/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Next.js Email](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

### Fichiers du Projet

| Fichier | Description |
|---------|-------------|
| `lib/email/resend.ts` | Client Resend avec lazy initialization |
| `lib/email/templates.ts` | Rendu des templates |
| `app/api/admin/templates/route.ts` | API CRUD templates |
| `app/admin/templates/page.tsx` | Interface de gestion des templates |
| `DATABASE-SYNC.md` | Guide de synchronisation BDD |
| `scripts/setup-database.sh` | Script automatique de setup |

### Commandes Utiles

```bash
# Base de données
npm run db:generate       # Générer le client Prisma
npm run db:push           # Synchroniser le schéma
npm run db:studio         # Ouvrir l'interface graphique
npm run db:seed:templates # Charger les templates par défaut

# Développement
npm run dev               # Démarrer en local
npm run build             # Builder pour production
```

---

## ✅ Checklist de Configuration Complète

### Resend

- [ ] Compte créé
- [ ] Domaine vérifié (ou utilise domaine de test)
- [ ] Clé API créée
- [ ] Variables d'environnement configurées dans Vercel :
  - [ ] `RESEND_API_KEY`
  - [ ] `EMAIL_FROM`
  - [ ] `EMAIL_FROM_NAME`
- [ ] Application redéployée
- [ ] Email de test envoyé et reçu

### Base de Données

- [ ] `DATABASE_URL` configurée dans Vercel
- [ ] Schéma synchronisé (`npm run db:push`)
- [ ] Tables créées :
  - [ ] EmailIntegration
  - [ ] EmailTemplate
  - [ ] EmailLog
  - [ ] EmailTracking
- [ ] Templates de base chargés (`npm run db:seed:templates`)

### Application

- [ ] Page `/admin/settings/integrations` accessible
- [ ] Page `/admin/templates` accessible et affiche les templates
- [ ] Possibilité de créer un événement
- [ ] Possibilité d'ajouter des invités
- [ ] Possibilité d'envoyer des invitations

---

## 🎉 Vous êtes prêt !

Votre système d'envoi d'emails est maintenant entièrement configuré. Vous pouvez :

✅ Envoyer des invitations personnalisées
✅ Créer des templates sur mesure
✅ Suivre les ouvertures et clics
✅ Gérer plusieurs événements

**Besoin d'aide ?** Consultez la section [Dépannage](#6-dépannage) ou ouvrez une issue sur GitHub.

---

**Dernière mise à jour** : Novembre 2024
**Version** : 1.0
