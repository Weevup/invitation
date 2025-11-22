# Guide de Test - Système d'Emails de Confirmation

Ce document décrit comment tester le système complet d'emails de confirmation de bout en bout.

## 🎯 Vue d'ensemble

Le système d'emails de confirmation implémente une protection robuste pour garantir que les invités reçoivent toujours des emails appropriés lorsqu'ils répondent aux RSVPs.

### Fonctionnalités clés testées :

1. ✅ **Validation API stricte** - Blocage des RSVPs sans templates configurés
2. ✅ **Emails conditionnels** - Templates différents selon la réponse (accepté/refusé)
3. ✅ **Configuration de phase** - Phase 4 marquée comme obligatoire
4. ✅ **Intégration badge/QR code** - Liens de téléchargement inclus dans les emails
5. ✅ **Gestion d'erreurs** - Messages clairs pour les utilisateurs

---

## 📋 Tests Automatisés

### 1. Tests E2E Playwright

**Fichier** : `/tests/e2e/confirmation-email.spec.ts`

**Commande** :
```bash
npm run test:e2e
```

**Ce qui est testé** :
- Validation API avec templates manquants
- Envoi d'emails conditionnels
- Interface de configuration EmailsTab
- Flux RSVP complet

### 2. Script d'intégration

**Fichier** : `/scripts/test-confirmation-email-system.ts`

**Commande** :
```bash
npm run test:confirmation-system
```

**Ce qui est vérifié** :
- Présence des templates requis
- Configuration des événements
- Logs d'emails
- Statistiques globales

---

## 🧪 Tests Manuels - Étape par Étape

### Test 1 : Validation API - Templates Manquants

**Objectif** : Vérifier que l'API bloque les RSVPs si les templates ne sont pas configurés.

**Étapes** :

1. **Désactiver les templates de confirmation** :
   ```sql
   UPDATE "EmailTemplate"
   SET "isActive" = false
   WHERE "slug" IN ('confirmation-accepted', 'confirmation-declined');
   ```

2. **Tenter un RSVP** :
   - Accéder à : `/guest/[TOKEN_INVITÉ]`
   - Remplir le formulaire RSVP
   - Cliquer sur "Confirmer"

3. **Résultat attendu** :
   ```
   ❌ Erreur HTTP 503
   Message : "La configuration des emails de confirmation n'est pas terminée"
   Suggestion : "L'organisateur doit configurer les templates..."
   ```

4. **Vérifier dans le code** :
   - Fichier : `/app/api/rsvp/[token]/route.ts`
   - Lignes : 123-157
   - La validation bloque bien le RSVP

---

### Test 2 : Création des Templates

**Objectif** : Créer les deux templates requis.

**Étapes** :

1. **Accéder à l'administration** :
   ```
   /admin/events/[EVENT_ID]/settings?tab=emails
   ```

2. **Créer le template "Accepté"** :
   - Cliquer sur "Email Accepté" dans la Phase 4
   - URL : `/admin/events/[EVENT_ID]/confirmation-email?type=accepted`
   - Configurer :
     - **Nom** : "Confirmation - Présence confirmée"
     - **Slug** : `confirmation-accepted`
     - **Subject** : "Bienvenue à {{event.name}} ! 🎉"
     - **Contenu** : Inclure les variables :
       - `{{guest.firstName}}`
       - `{{event.name}}`
       - `{{event.date}}`
       - `{{event.location}}`
       - `{{badge.downloadUrl}}` ⚠️ IMPORTANT pour le QR code

3. **Créer le template "Refusé"** :
   - Cliquer sur "Email Refusé" dans la Phase 4
   - URL : `/admin/events/[EVENT_ID]/confirmation-email?type=declined`
   - Configurer :
     - **Nom** : "Confirmation - Absence"
     - **Slug** : `confirmation-declined`
     - **Subject** : "Votre réponse pour {{event.name}}"
     - **Contenu** : Message de regret personnalisé

4. **Vérifier dans la base de données** :
   ```sql
   SELECT name, slug, "isActive"
   FROM "EmailTemplate"
   WHERE slug IN ('confirmation-accepted', 'confirmation-declined');
   ```

   Résultat attendu : 2 lignes avec `isActive = true`

---

### Test 3 : RSVP avec Confirmation "Accepté"

**Objectif** : Vérifier que le bon template est utilisé quand l'invité accepte.

**Étapes** :

1. **Activer les deux templates** (voir Test 2)

2. **Accéder au formulaire RSVP** :
   ```
   /guest/[TOKEN_INVITÉ]
   ```

3. **Remplir le formulaire** :
   - ✅ Sélectionner "Je confirme ma présence"
   - Nombre d'accompagnants : 1
   - Choix du menu : Végétarien
   - ✅ Cocher "J'accepte les photos"

4. **Soumettre le formulaire**

5. **Vérifications** :

   a. **Page de confirmation** :
      - ✅ Message "Merci pour votre confirmation"
      - ✅ QR code affiché
      - ✅ Lien de téléchargement du badge

   b. **Email envoyé** :
      - Vérifier la boîte mail de l'invité
      - ✅ Subject : "Bienvenue à [NOM ÉVÉNEMENT] ! 🎉"
      - ✅ Contenu du template "accepted"
      - ✅ Lien badge présent

   c. **Base de données** :
      ```sql
      SELECT * FROM "EmailLog"
      WHERE "guestId" = '[ID_INVITÉ]'
      AND "type" = 'CONFIRMATION'
      ORDER BY "sentAt" DESC
      LIMIT 1;
      ```
      - ✅ Status : "SENT"
      - ✅ Subject contient "Bienvenue"

   d. **RSVP enregistré** :
      ```sql
      SELECT * FROM "RSVP" WHERE "guestId" = '[ID_INVITÉ]';
      ```
      - ✅ attending : true
      - ✅ plusOnes : 1

---

### Test 4 : RSVP avec Confirmation "Refusé"

**Objectif** : Vérifier que le template "declined" est utilisé.

**Étapes** :

1. **Utiliser un autre invité** :
   ```
   /guest/[AUTRE_TOKEN]
   ```

2. **Décliner l'invitation** :
   - ❌ Sélectionner "Je ne pourrai malheureusement pas venir"
   - Soumettre

3. **Vérifications** :

   a. **Page de confirmation** :
      - ✅ Message "Merci d'avoir répondu"
      - ❌ PAS de QR code
      - ❌ PAS de lien badge

   b. **Email envoyé** :
      - ✅ Subject : "Votre réponse pour [NOM ÉVÉNEMENT]"
      - ✅ Contenu du template "declined"
      - ✅ Message de regret

   c. **Base de données** :
      ```sql
      SELECT * FROM "EmailLog"
      WHERE "guestId" = '[ID_INVITÉ]'
      AND "type" = 'CONFIRMATION';
      ```
      - ✅ Subject contient "Votre réponse"

---

### Test 5 : Configuration des Phases dans EmailsTab

**Objectif** : Vérifier l'interface de gestion des campagnes email.

**Étapes** :

1. **Accéder à l'onglet Emails** :
   ```
   /admin/events/[EVENT_ID]/settings?tab=emails
   ```

2. **Vérifier Phase 4 (Confirmation)** :

   a. **Indicateurs visuels** :
      - ✅ Badge "Obligatoire" affiché
      - ✅ Fond vert (couleur #4caf50)
      - ✅ Icône CheckCheck
      - ✅ Badge "⚡ Automatique"

   b. **Toggle désactivé** :
      - ✅ Switch coché (enabled: true)
      - ✅ Switch grisé (disabled: true)
      - ❌ Impossible de désactiver

   c. **Avertissement visible** :
      - ✅ Encadré rouge avec "⚠️ CONFIGURATION OBLIGATOIRE"
      - ✅ Mention "2 templates distincts"
      - ✅ Explication des deux types d'emails

   d. **Boutons d'action** :
      - ✅ Bouton "Email Accepté" (vert)
      - ✅ Bouton "Email Refusé" (rouge)
      - ✅ Bouton "Tester les 2"

3. **Tester les autres phases** :

   a. **Phase 1 (Save the Date)** :
      - ✅ Toggle activable/désactivable
      - ✅ Désactivée par défaut (enabled: false)
      - ❌ PAS de badge "Obligatoire"

   b. **Phase 2 (Invitation)** :
      - ✅ Toggle fonctionnel
      - ✅ Activée par défaut (enabled: true)

4. **Tester la persistance** :
   - Désactiver une phase non-obligatoire
   - Rafraîchir la page
   - ✅ État conservé après reload

---

### Test 6 : Intégration Badge/QR Code

**Objectif** : Vérifier que le badge avec QR code est bien inclus.

**Prérequis** : Badge design activé avec QR code.

**Étapes** :

1. **Activer le QR code sur le badge** :
   ```sql
   UPDATE "BadgeDesign"
   SET "includeQRCode" = true
   WHERE "eventId" = '[EVENT_ID]';
   ```

2. **Faire un RSVP "Accepté"** (voir Test 3)

3. **Vérifier le lien badge** :

   a. **Dans l'email reçu** :
      - Rechercher `{{badge.downloadUrl}}`
      - ✅ Lien présent et valide
      - Format : `/guest/[TOKEN]/badge`

   b. **Cliquer sur le lien** :
      - ✅ Badge PDF généré
      - ✅ QR code visible sur le badge
      - ✅ Informations de l'invité correctes

4. **Vérifier le code source** :
   - Fichier : `/app/api/rsvp/[token]/route.ts`
   - Lignes : 196-211
   - Variable `badgeDownloadUrl` correctement générée

---

### Test 7 : Gestion d'Erreurs

**Objectif** : Vérifier que les erreurs sont gérées proprement.

**Scénarios à tester** :

#### 7.1 : Template manquant pendant l'envoi

**Étapes** :
1. Désactiver un template pendant qu'un RSVP est en cours
2. ✅ Erreur 503 retournée
3. ✅ Message utilisateur clair
4. ✅ Log d'avertissement créé

**Vérifier les logs** :
```typescript
// lib/logger.ts
rsvpLogger.warn({
  eventId: guest.eventId,
  missingTemplates: {
    accepted: !acceptedTemplate,
    declined: !declinedTemplate
  }
}, 'RSVP blocked: Missing confirmation email templates')
```

#### 7.2 : Intégration email inactive

**Étapes** :
1. Désactiver toutes les intégrations email
2. Tenter un RSVP
3. ✅ Erreur "No active email integration found"
4. ✅ Transaction RSVP rollback (pas de RSVP enregistré)

#### 7.3 : Variables manquantes dans le template

**Étapes** :
1. Créer un template sans les variables requises
2. Faire un RSVP
3. ✅ Email envoyé mais avec variables vides
4. 💡 Amélioration possible : Validation des variables avant envoi

---

## 🔍 Points de Validation dans le Code

### 1. API RSVP - Validation Templates

**Fichier** : `app/api/rsvp/[token]/route.ts`

**Lignes critiques** :

```typescript:app/api/rsvp/[token]/route.ts
// Lignes 123-157 : VALIDATION CRITIQUE
const acceptedTemplate = await prisma.emailTemplate.findFirst({
  where: {
    slug: 'confirmation-accepted',
    isActive: true,
  },
})

const declinedTemplate = await prisma.emailTemplate.findFirst({
  where: {
    slug: 'confirmation-declined',
    isActive: true,
  },
})

// BLOCAGE si un template manque
if (!acceptedTemplate || !declinedTemplate) {
  rsvpLogger.warn({
    eventId: guest.eventId,
    missingTemplates: {
      accepted: !acceptedTemplate,
      declined: !declinedTemplate
    }
  }, 'RSVP blocked: Missing confirmation email templates')

  return NextResponse.json(
    {
      error: 'EMAIL_TEMPLATES_NOT_CONFIGURED',
      message: 'La configuration des emails de confirmation n\'est pas terminée',
      suggestion: 'L\'organisateur doit configurer...'
    },
    { status: 503 }
  )
}
```

### 2. Sélection Conditionnelle du Template

**Lignes 219-242** :

```typescript:app/api/rsvp/[token]/route.ts
// Sélection du bon template selon la réponse
const conditionalSlug = attending ? 'confirmation-accepted' : 'confirmation-declined'
let customTemplate = await prisma.emailTemplate.findFirst({
  where: {
    slug: conditionalSlug,
    isActive: true,
  },
})

// Fallback vers template générique si nécessaire
if (!customTemplate) {
  customTemplate = await prisma.emailTemplate.findFirst({
    where: {
      type: 'CONFIRMATION',
      isActive: true,
    },
    orderBy: [
      { isDefault: 'desc' },
      { updatedAt: 'desc' }
    ]
  })
}
```

### 3. Génération du Badge/QR Code

**Lignes 196-211** :

```typescript:app/api/rsvp/[token]/route.ts
// Générer le QR code si l'invité accepte
let qrCodeData = null
let badgeDownloadUrl = null
if (attending) {
  const checkinUrl = getCheckinUrl(rsvp.qrCodeId)
  qrCodeData = await generateQRCode(checkinUrl)

  // Vérifier si le badge a le QR code activé
  const badgeDesign = await prisma.badgeDesign.findUnique({
    where: { eventId: guest.eventId }
  })

  if (badgeDesign?.includeQRCode) {
    badgeDownloadUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/guest/${guest.token}/badge`
  }
}
```

### 4. EmailsTab - Configuration des Phases

**Fichier** : `app/admin/events/[id]/settings/tabs/EmailsTab.tsx`

**Points clés** :

```typescript:app/admin/events/[id]/settings/tabs/EmailsTab.tsx
// Lignes 92-105 : Phase 4 OBLIGATOIRE
{
  id: 'confirmation',
  phase: 4,
  title: 'Confirmation Automatique',
  description: '⚠️ CRITIQUE : 2 templates requis...',
  icon: CheckCheck,
  color: '#4caf50',
  isAutomatic: true,
  enabled: true,        // ✅ Toujours activée
  isMandatory: true,   // ✅ Ne peut pas être désactivée
  templateName: 'Non configuré'
}

// Lignes 317-333 : Toggle avec vérification isMandatory
<Switch
  id={`phase-${phase.id}-toggle`}
  checked={phase.enabled}
  onCheckedChange={(checked) => togglePhaseEnabled(phase.id, checked)}
  disabled={phase.isMandatory || loading}  // ✅ Désactivé si mandatory
/>
{phase.isMandatory && (
  <Badge variant="outline" className="border-red-500">
    Obligatoire
  </Badge>
)}
```

---

## 📊 Métriques de Succès

### Critères de validation :

- ✅ **100% blocage** - Aucun RSVP accepté sans les 2 templates
- ✅ **0 email vide** - Tous les emails envoyés contiennent du contenu valide
- ✅ **Sélection correcte** - Template "accepted" pour acceptés, "declined" pour refusés
- ✅ **Phase 4 protégée** - Impossible de désactiver via l'interface
- ✅ **Badge intégré** - URL de téléchargement incluse dans les emails "accepted"

### Statistiques attendues :

```sql
-- Emails de confirmation envoyés
SELECT
  COUNT(*) as total,
  SUM(CASE WHEN status = 'SENT' THEN 1 ELSE 0 END) as sent,
  SUM(CASE WHEN status = 'FAILED' THEN 1 ELSE 0 END) as failed
FROM "EmailLog"
WHERE type = 'CONFIRMATION';

-- RSVPs par type
SELECT
  attending,
  COUNT(*) as count
FROM "RSVP"
GROUP BY attending;
```

**Résultat attendu** : Taux de succès > 99%

---

## 🐛 Problèmes Connus et Solutions

### Problème 1 : Templates créés mais marqués comme inactifs

**Symptôme** : RSVP bloqué malgré la création des templates

**Solution** :
```sql
UPDATE "EmailTemplate"
SET "isActive" = true
WHERE "slug" IN ('confirmation-accepted', 'confirmation-declined');
```

### Problème 2 : Badge URL manquante dans l'email

**Cause** : QR code non activé sur le badge design

**Solution** :
```sql
UPDATE "BadgeDesign"
SET "includeQRCode" = true
WHERE "eventId" = '[EVENT_ID]';
```

### Problème 3 : Variable non remplacée dans le template

**Cause** : Nom de variable incorrect (casse ou syntaxe)

**Variables valides** :
- `{{guest.firstName}}`
- `{{guest.lastName}}`
- `{{guest.email}}`
- `{{event.name}}`
- `{{event.date}}`
- `{{event.time}}`
- `{{event.location}}`
- `{{event.address}}`
- `{{badge.downloadUrl}}`

---

## ✅ Checklist Finale

Avant de considérer le système comme fonctionnel :

### Configuration :
- [ ] Template "confirmation-accepted" créé et actif
- [ ] Template "confirmation-declined" créé et actif
- [ ] Variables correctes dans les deux templates
- [ ] Badge design configuré avec QR code
- [ ] Intégration email active (SMTP, SendGrid, etc.)

### Tests fonctionnels :
- [ ] RSVP bloqué sans templates → ✅ Erreur 503
- [ ] RSVP accepté → Email "accepted" + QR code
- [ ] RSVP refusé → Email "declined" sans QR code
- [ ] Phase 4 impossible à désactiver dans EmailsTab
- [ ] Toggle des autres phases fonctionnel
- [ ] Configuration persistée après reload

### Monitoring :
- [ ] Logs d'avertissement si templates manquants
- [ ] EmailLog créé pour chaque email envoyé
- [ ] Statistiques correctes dans le dashboard

---

## 🚀 Commandes Utiles

### Vérifier l'état du système

```bash
# Test automatique complet
npm run test:confirmation-system

# Tests E2E
npm run test:e2e

# Tests spécifiques
npm run test:e2e -- confirmation-email.spec.ts
```

### Base de données

```bash
# Ouvrir Prisma Studio
npm run db:studio

# Créer les templates de démo
npm run db:seed:templates
```

### Debugging

```bash
# Logs en temps réel
tail -f logs/app.log | grep -i "confirmation\|rsvp"

# Vérifier les emails envoyés
SELECT * FROM "EmailLog"
WHERE type = 'CONFIRMATION'
ORDER BY "sentAt" DESC
LIMIT 10;
```

---

## 📞 Support

Si vous rencontrez des problèmes :

1. Vérifier les logs : `/logs/app.log`
2. Consulter la validation API : `/app/api/rsvp/[token]/route.ts:123-157`
3. Vérifier la configuration : Base de données → Tables `EmailTemplate` et `Event`

---

**Dernière mise à jour** : 21 novembre 2025
**Version** : 1.0.0
**Auteur** : Système de validation automatique
