# Guide de Configuration Email - Weevup

## Configuration recommandée pour julien@weevup.fr

### 1. Changer l'adresse d'envoi (From)

**Objectif** : Utiliser `julien@weevup.fr` au lieu de `no-reply@...` pour améliorer la délivrabilité et la confiance.

**Étapes** :
1. Aller dans **Admin → Paramètres → Intégrations Email**
2. Modifier l'intégration SendGrid active
3. Changer :
   - **From Email** : `julien@weevup.fr`
   - **From Name** : `Julien - Weevup` (ou simplement `Weevup`)
   - **Reply-To** : `julien@weevup.fr`
4. Enregistrer les modifications

**Avantages** :
- ✅ Les emails paraissent plus personnels et dignes de confiance
- ✅ Les destinataires peuvent répondre directement
- ✅ Meilleur taux d'ouverture (10-15% en moyenne)
- ✅ Réduit le risque de spam

---

## 2. Configuration DNS pour SendGrid

Pour que SendGrid puisse envoyer des emails depuis `julien@weevup.fr`, vous devez configurer les enregistrements DNS suivants :

### A. Authentification de domaine (DKIM, SPF, DMARC)

**Accéder à la configuration** :
1. Connectez-vous à SendGrid
2. Allez dans **Settings → Sender Authentication**
3. Cliquez sur **Authenticate Your Domain**
4. Suivez l'assistant pour le domaine `weevup.fr`

**Enregistrements DNS à ajouter** (SendGrid vous donnera les valeurs exactes) :

#### SPF Record
```dns
Type: TXT
Host: @
Value: v=spf1 include:sendgrid.net ~all
```

#### DKIM Records (2 enregistrements CNAME)
```dns
Type: CNAME
Host: s1._domainkey
Value: s1.domainkey.u12345678.wl123.sendgrid.net

Type: CNAME
Host: s2._domainkey
Value: s2.domainkey.u12345678.wl123.sendgrid.net
```

#### DMARC Record
```dns
Type: TXT
Host: _dmarc
Value: v=DMARC1; p=none; rua=mailto:julien@weevup.fr
```

**Note** : Les valeurs exactes seront fournies par SendGrid. Ces exemples sont indicatifs.

---

## 3. Lien de Désinscription

### Fonctionnement

Le système de désinscription est déjà configuré et fonctionne automatiquement :

1. **Headers automatiques** : Tous les emails incluent maintenant les headers `List-Unsubscribe` et `List-Unsubscribe-Post` (requis par Gmail et autres)

2. **Variable disponible** : `{{unsubscribeUrl}}` est disponible dans tous les templates

3. **Vérification automatique** : Avant d'envoyer un email, le système vérifie si le destinataire s'est désinscrit

### Ajouter le lien dans les templates

Dans l'éditeur de templates d'email :

**Footer recommandé** :
```html
<div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; text-align: center;">
  <p>
    Vous recevez cet email car vous êtes inscrit à l'événement {{event.name}}.
  </p>
  <p>
    <a href="{{unsubscribeUrl}}" style="color: #6b7280; text-decoration: underline;">
      Se désinscrire
    </a>
  </p>
</div>
```

**Pour l'éditeur WYSIWYG** :
1. Ouvrir le template dans l'éditeur
2. Ajouter un bloc "Text" ou "Button" en bas du template
3. Pour un lien texte : `Se désinscrire` → Lien : `{{unsubscribeUrl}}`
4. Pour un bouton : Texte du bouton `Se désinscrire` → URL : `{{unsubscribeUrl}}`

**Templates concernés** :
- ✅ `confirmation-accepted` (confirmation de présence)
- ✅ `confirmation-declined` (confirmation d'absence)
- ✅ Templates d'invitation
- ✅ Templates de rappel

---

## 4. Test de Configuration

### A. Vérifier l'authentification de domaine

1. Aller sur SendGrid → Settings → Sender Authentication
2. Vérifier que le statut est **"Verified"** avec une coche verte
3. Si non vérifié, cliquez sur "Verify" après avoir ajouté les DNS

### B. Tester l'envoi

1. Aller dans votre application → Liste des invités
2. Sélectionner 1-2 invités de test (votre propre email)
3. Cliquer sur "Renvoyer"
4. Vérifier :
   - ✅ Email reçu dans la boîte de réception (pas spam)
   - ✅ From: `Julien - Weevup <julien@weevup.fr>`
   - ✅ Lien de désinscription visible en bas
   - ✅ Option "Se désinscrire" dans Gmail (3 points → Se désinscrire de la liste)

### C. Vérifier les DNS

Utiliser un outil comme [MXToolbox](https://mxtoolbox.com/) :
1. SPF Check : `https://mxtoolbox.com/spf.aspx` → Entrez `weevup.fr`
2. DKIM Check : `https://mxtoolbox.com/dkim.aspx` → Entrez `s1._domainkey.weevup.fr`
3. DMARC Check : `https://mxtoolbox.com/dmarc.aspx` → Entrez `weevup.fr`

---

## 5. Bonnes Pratiques pour la Délivrabilité

### Avant l'envoi :
- ✅ Nettoyer la liste des emails invalides ou bounced
- ✅ Tester avec votre propre email d'abord
- ✅ Éviter les mots spam (GRATUIT, URGENT, CLIQUEZ ICI)
- ✅ Personnaliser avec `{{guest.firstName}}`

### Contenu des emails :
- ✅ Ratio texte/images équilibré (60/40)
- ✅ Éviter les images trop lourdes
- ✅ Toujours inclure une version texte
- ✅ Lien de désinscription visible

### Après l'envoi :
- ✅ Surveiller le taux de bounce sur SendGrid
- ✅ Vérifier le taux d'ouverture (normal : 15-25%)
- ✅ Supprimer les emails qui bouncent définitivement
- ✅ Respecter les désinscriptions

---

## 6. Résolution de Problèmes

### Les emails arrivent en spam

**Solutions** :
1. Vérifier que l'authentification SendGrid est validée (DNS)
2. Demander aux destinataires d'ajouter `julien@weevup.fr` à leurs contacts
3. Éviter trop de liens dans l'email
4. Réduire la taille des images
5. Tester le contenu avec [Mail Tester](https://www.mail-tester.com/)

### Les emails ne sont pas délivrés

**Solutions** :
1. Vérifier dans SendGrid Activity : Settings → Activity
2. Chercher l'email du destinataire
3. Vérifier le statut :
   - **Processed** → En cours d'envoi
   - **Delivered** → Livré au serveur de mail
   - **Bounce** → Email invalide ou serveur refuse
   - **Dropped** → Email dans la liste de suppression SendGrid

### Gmail affiche "opened" mais le destinataire n'a pas reçu

**Explications possibles** :
1. **Filtres anti-spam** : Les scanners de sécurité ouvrent l'email pour le scanner
2. **Apple Mail Privacy Protection** : Pré-charge les images automatiquement
3. **Email dans spam/promotions** : Demander de vérifier ces dossiers
4. **Filtres personnels** : L'utilisateur a peut-être un filtre qui déplace l'email

---

## 7. Nouvelles Fonctionnalités Disponibles

### A. Statut de livraison des emails
Dans la liste des invités, vous pouvez maintenant voir :
- 📧 **Ouvert** (vert) : L'email a été ouvert
- 📬 **Livré** (orange) : Email livré mais pas ouvert
- 📤 **Envoyé** (bleu) : Email envoyé, en attente de confirmation
- ⚠️ **Échec** (rouge) : Bounce ou erreur
- ⏸️ **Non envoyé** (gris) : Pas encore envoyé

### B. Filtre par statut email
Nouveau filtre dans la liste des invités pour :
- Voir uniquement les "non-ouverts"
- Identifier rapidement les problèmes de livraison
- Cibler les relances

### C. Sélection rapide "Non-ouverts"
Bouton "Sélectionner non-ouverts" qui sélectionne automatiquement tous les invités avec statut "Livré" ou "Envoyé" (mais pas ouvert).

### D. Renvoyer les invitations
Bouton "Renvoyer" dans la barre de sélection pour renvoyer l'invitation aux invités sélectionnés.

### E. Système de désinscription
- Page de désinscription : `/unsubscribe`
- Vérification automatique avant chaque envoi
- Headers List-Unsubscribe dans tous les emails

---

## Support

Pour toute question ou problème :
- **Email** : julien@weevup.fr
- **Documentation SendGrid** : https://docs.sendgrid.com/
- **Vérification DNS** : https://mxtoolbox.com/

---

**Dernière mise à jour** : 24 novembre 2025
