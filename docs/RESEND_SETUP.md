# Configuration Resend pour Weevup

## 🚀 Pourquoi Resend ?

- ✅ **3 000 emails/mois gratuits** (parfait pour démarrer)
- ✅ API moderne et simple
- ✅ SDK Next.js natif
- ✅ Excellente délivrabilité
- ✅ Dashboard élégant
- ✅ Templates avec React

---

## 📋 Étape 1 : Créer un compte Resend

1. Allez sur [resend.com](https://resend.com)
2. Créez un compte gratuit
3. Vérifiez votre email

---

## 🔑 Étape 2 : Obtenir votre API Key

1. Connectez-vous à votre [dashboard Resend](https://resend.com/api-keys)
2. Cliquez sur **"Create API Key"**
3. Donnez un nom : `Weevup Production` ou `Weevup Dev`
4. Copiez la clé (elle commence par `re_`)

⚠️ **Important** : Cette clé ne sera affichée qu'une seule fois !

---

## 🌐 Étape 3 : Configurer votre domaine (Recommandé)

### Option A : Utiliser votre domaine (Production)

1. Dans Resend, allez dans **"Domains"**
2. Cliquez sur **"Add Domain"**
3. Entrez votre domaine : `weevup.com`
4. Ajoutez les enregistrements DNS fournis :
   - **SPF** : TXT record
   - **DKIM** : CNAME records (3)
   - **DMARC** : TXT record

5. Attendez la vérification (1-48h)

**Emails que vous pourrez envoyer :**
```
noreply@weevup.com
invitations@weevup.com
hello@weevup.com
```

### Option B : Utiliser le domaine Resend (Tests)

Pour commencer rapidement, vous pouvez utiliser :
```
onboarding@resend.dev
```

⚠️ **Limite** : Vous ne pourrez envoyer qu'à votre propre email vérifié.

---

## ⚙️ Étape 4 : Configuration dans Weevup

### 1. Ajouter la clé API dans `.env`

Créez ou modifiez votre fichier `.env` :

```bash
# Resend Configuration
RESEND_API_KEY="re_votre_cle_api_ici"

# Email Configuration
EMAIL_FROM="noreply@weevup.com"
EMAIL_FROM_NAME="Weevup Events"

# App URL
NEXT_PUBLIC_APP_URL="https://votre-app.vercel.app"
```

### 2. Sur Vercel (Production)

1. Allez dans votre projet Vercel
2. **Settings** → **Environment Variables**
3. Ajoutez :
   - `RESEND_API_KEY` = `re_...`
   - `EMAIL_FROM` = `noreply@weevup.com`
   - `EMAIL_FROM_NAME` = `Weevup Events`

---

## ✅ Étape 5 : Tester l'envoi

### Test via l'API

```bash
curl -X POST http://localhost:3000/api/admin/test-email \
  -H "Content-Type: application/json" \
  -d '{"email": "votre@email.com"}'
```

### Test via l'interface admin

1. Allez sur `/admin/settings`
2. Section **"Configuration Email"**
3. Cliquez sur **"Tester l'envoi"**
4. Entrez votre email
5. Vérifiez votre boîte de réception

---

## 📧 Utilisation dans le code

### Envoyer une invitation à un invité

```typescript
import { sendInvitation } from '@/lib/email/invitations'

// Envoyer à un seul invité
await sendInvitation(event, guest)

// Envoyer à tous les invités d'un événement
await sendBulkInvitations(eventId)

// Envoyer uniquement à certains invités
await sendBulkInvitations(eventId, ['guest-id-1', 'guest-id-2'])
```

### Envoyer un email personnalisé

```typescript
import { sendEmail } from '@/lib/email/resend'

await sendEmail({
  to: 'invité@example.com',
  subject: 'Vous êtes invité !',
  html: '<h1>Bienvenue</h1>',
  text: 'Bienvenue'
})
```

---

## 🎨 Créer des templates d'emails

1. Allez dans `/admin/templates`
2. Cliquez sur **"Nouveau Template"**
3. Choisissez le type : `INVITE`, `REMINDER`, `CONFIRMATION`
4. Personnalisez :
   - Sujet
   - Contenu HTML
   - Couleurs
5. Sauvegardez

### Variables disponibles dans les templates

```html
{{event.name}}          - Nom de l'événement
{{event.date}}          - Date formatée
{{event.time}}          - Heure
{{event.location}}      - Lieu
{{event.address}}       - Adresse complète
{{guest.firstName}}     - Prénom
{{guest.lastName}}      - Nom
{{guest.email}}         - Email
{{rsvpLink}}           - Lien de confirmation
{{showcaseLink}}       - Lien vers la page événement
{{primaryColor}}       - Couleur primaire du template
{{secondaryColor}}     - Couleur secondaire
{{accentColor}}        - Couleur accent
```

---

## 📊 Monitoring et Analytics

### Dashboard Resend

1. Allez sur [resend.com/emails](https://resend.com/emails)
2. Vous verrez :
   - ✅ Emails envoyés
   - 📬 Emails livrés
   - 👁️ Emails ouverts (si activé)
   - 🔗 Liens cliqués
   - ❌ Rejets et bounces

### Dans Weevup

Les emails envoyés sont trackés dans la base de données :

```typescript
// Chaque invité a :
guest.invitationSentAt      // Date d'envoi
guest.invitationEmailId     // ID Resend pour tracking
```

---

## 🔧 Dépannage

### "RESEND_API_KEY is not configured"

✅ **Solution** : Vérifiez que `.env` contient bien `RESEND_API_KEY`

```bash
# Vérifier
cat .env | grep RESEND

# Si vide, ajouter
echo 'RESEND_API_KEY="re_..."' >> .env
```

### "Domain not verified"

✅ **Solution** : Utilisez `onboarding@resend.dev` pour les tests

ou attendez que votre domaine soit vérifié (DNS propagation)

### Les emails arrivent en spam

✅ **Solutions** :
1. Vérifiez SPF, DKIM, DMARC
2. Ajoutez un lien de désinscription
3. Évitez les mots spam ("gratuit", "urgent", etc.)
4. Chauffez votre domaine (envoyez progressivement)

### "Rate limit exceeded"

✅ **Solution** : Plan gratuit = 100 emails/jour

Upgradez vers le plan payant : 20$/mois pour 50K emails

---

## 💰 Tarifs Resend

| Plan | Prix | Emails/mois | Idéal pour |
|------|------|-------------|------------|
| **Free** | 0€ | 3 000 | Tests, petits événements |
| **Pro** | 20$/mois | 50 000 | Production, 100+ événements/mois |
| **Business** | Sur demande | Illimité | Grandes entreprises |

**Calcul pour Weevup** :
- 1 événement = ~50 invités
- 100 événements/mois = 5 000 emails
- → Plan Free suffit pour démarrer
- → Plan Pro quand vous dépassez 60 événements/mois

---

## 🎯 Prochaines étapes

1. ✅ Configurer Resend (vous êtes ici)
2. 📧 Créer vos templates d'invitation
3. 👥 Importer vos invités
4. 🚀 Envoyer vos premières invitations
5. 📊 Tracker les RSVP

---

## 🆘 Support

- [Documentation Resend](https://resend.com/docs)
- [Discord Resend](https://resend.com/discord)
- Email : support@resend.com
- Dashboard : [resend.com](https://resend.com)

---

**Félicitations !** 🎉

Vous êtes prêt à envoyer vos premières invitations avec Resend.
