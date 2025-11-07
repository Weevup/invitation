# 🎉 Guide de démarrage rapide - 10 ans de Weevup

Ce guide vous accompagne pour utiliser l'application pour l'événement des 10 ans de Weevup au Molitor.

## 🚀 Installation rapide

### 1. Prérequis

Assurez-vous d'avoir installé :
- **Node.js 18+** : `node --version`
- **PostgreSQL** : Base de données (ou utilisez Docker)

### 2. Installation

```bash
# Installer les dépendances
npm install

# Configurer PostgreSQL (option Docker - la plus simple)
docker run --name weevup-db \
  -e POSTGRES_PASSWORD=weevup2025 \
  -e POSTGRES_DB=invitation_manager \
  -p 5432:5432 \
  -d postgres:14
```

### 3. Configuration

Le fichier `.env` est déjà configuré avec les bonnes valeurs par défaut.

**Pour les emails (optionnel en test)** :
- Visitez https://ethereal.email/
- Créez un compte gratuit
- Copiez les identifiants SMTP dans `.env`

### 4. Initialiser la base de données

```bash
# Générer le client Prisma
npm run db:generate

# Créer les tables
npm run db:push

# Charger l'événement Weevup (10 invités de test)
npm run db:seed:weevup
```

**IMPORTANT** : Le script affiche les liens d'invitation - **notez-les ou faites une capture d'écran !**

### 5. Démarrer l'application

```bash
npm run dev
```

✅ L'application est maintenant accessible sur **http://localhost:3000**

## 📋 Votre événement Weevup

### Détails de l'événement créé

- **Nom** : 10 ans de Weevup
- **Lieu** : Molitor Paris, 13 Rue Nungesser et Coli, Paris
- **Date** : 20 juin 2025 à 19h00 (⚠️ **à ajuster dans le code si nécessaire**)
- **Deadline RSVP** : 10 juin 2025

### Programme

- 19h00 : Accueil champagne & cocktail au bord de la piscine
- 20h30 : Dîner gastronomique
- 22h00 : Rétrospective des 10 ans de Weevup
- 22h30 : Soirée festive avec DJ
- 00h30 : Clôture

### Options configurées

✅ Accompagnants autorisés (1 max)
✅ Choix de repas (Classique / Végétarien / Végan / Sans gluten / Halal)
✅ Besoins transport et accessibilité
✅ Consentement photos
✅ QR codes pour le check-in

## 🎯 Comment utiliser l'application

### Pour l'équipe Weevup (Admin)

1. **Accéder au dashboard**
   - Ouvrez http://localhost:3000/admin
   - Vous verrez l'événement "10 ans de Weevup"

2. **Gérer l'événement**
   - Cliquez sur "Gérer l'événement"
   - Visualisez les statistiques en temps réel
   - Consultez la liste des invités et leurs réponses

3. **Copier les liens d'invitation**
   - Cliquez sur l'icône 🔗 à côté de chaque invité
   - Le lien est copié dans le presse-papier
   - Envoyez-le par email/WhatsApp à l'invité

4. **Suivre les réponses**
   - Les badges indiquent le statut : ✓ Participe / ✗ Décline / En attente
   - Les stats se mettent à jour en temps réel

### Pour vos invités

Quand un invité clique sur son lien personnel :

1. **Page d'accueil personnalisée**
   - Message "Bonjour [Prénom] 👋"
   - Détails complets de l'événement

2. **Formulaire RSVP en 6 étapes**
   - Participation (oui/non)
   - Accompagnants (0 ou 1)
   - Choix de repas + allergies
   - Besoins pratiques (accessibilité, transport)
   - Consentements
   - Récapitulatif et validation

3. **Confirmation**
   - Email automatique avec QR code
   - Possibilité de modifier jusqu'au 10 juin

## 🧪 Tester avec les invités de démo

10 invités de test ont été créés avec leurs liens. Utilisez-les pour tester !

**Catégories d'invités** :
- VIP + Clients
- Partenaires
- Presse
- Staff Weevup

Pour voir les liens d'invitation, relancez :
```bash
npm run db:seed:weevup
```

Ou consultez le dashboard admin et copiez les liens avec le bouton 🔗

## 📊 Visualiser la base de données

Pour voir toutes les données en direct :

```bash
npm run db:studio
```

Ouvre une interface graphique sur http://localhost:5555

## 🎨 Personnalisation de l'événement

### Modifier la date de l'événement

Éditez `prisma/seed-weevup.ts` :

```typescript
startsAt: new Date('2025-06-20T19:00:00'), // ← Changez ici
endsAt: new Date('2025-06-21T01:00:00'),   // ← Et ici
```

Puis relancez : `npm run db:seed:weevup`

### Modifier les détails (lieu, description, etc.)

Tout est dans le fichier `prisma/seed-weevup.ts` - modifiez selon vos besoins.

### Ajouter vos vrais invités

Deux options :

**Option 1 : Via l'interface admin (à venir)**
- Fonctionnalité d'import CSV à développer

**Option 2 : Via le seed (maintenant)**
Modifiez le tableau `demoGuests` dans `prisma/seed-weevup.ts` :

```typescript
const demoGuests = [
  {
    firstName: 'Marie',
    lastName: 'Dupont',
    email: 'marie.dupont@example.com',
    company: 'TechCorp',
    tags: ['VIP', 'Client']
  },
  // Ajoutez vos invités ici...
]
```

## 📧 Configuration des emails pour la production

### Pour envoyer de vrais emails

**Option recommandée : Resend**

1. Créez un compte sur https://resend.com (gratuit jusqu'à 3000 emails/mois)
2. Obtenez votre clé API
3. Ajoutez dans `.env` :
   ```env
   RESEND_API_KEY="re_votre_cle_ici"
   ```

**Alternative : SendGrid, Mailgun, etc.**

Voir le README.md principal pour plus d'options.

## 🎫 Check-in le jour J

Chaque invité qui confirme reçoit un QR code unique dans son email.

**Le jour de l'événement** :
1. Utilisez un smartphone/tablette
2. Scannez les QR codes à l'entrée
3. L'app enregistre automatiquement l'arrivée

## ✅ Checklist avant le lancement

- [ ] PostgreSQL en cours d'exécution
- [ ] Base de données initialisée (`npm run db:push`)
- [ ] Événement Weevup créé (`npm run db:seed:weevup`)
- [ ] Application lancée (`npm run dev`)
- [ ] Dashboard admin accessible (http://localhost:3000/admin)
- [ ] Testé avec au moins 1 lien d'invitation
- [ ] Configuration email pour la production (si envoi réel)

## 🆘 Besoin d'aide ?

### Problèmes courants

**"Cannot connect to database"**
```bash
# Vérifiez que PostgreSQL est démarré
docker ps  # Si vous utilisez Docker

# Vérifiez DATABASE_URL dans .env
```

**"Les liens d'invitation ne fonctionnent pas"**
- Vérifiez que vous avez bien exécuté `npm run db:seed:weevup`
- Copiez les liens complets affichés dans la console

**"Les emails ne partent pas"**
- En développement, utilisez Ethereal Email (emails de test)
- Consultez les logs dans la console

### Documentation complète

Consultez le fichier `README.md` pour plus de détails techniques.

## 🚀 Prochaines étapes

1. **Tester l'application** avec les invités de démo
2. **Personnaliser** l'événement selon vos besoins
3. **Ajouter vos vrais invités** dans le seed
4. **Configurer les emails** pour la production
5. **Envoyer les invitations** 🎉

---

**Bon anniversaire Weevup ! 🎊**

Des questions ? Consultez le README.md ou contactez le support.
