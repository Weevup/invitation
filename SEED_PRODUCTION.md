# Guide : Charger les données de démonstration en production

Ce guide explique comment charger le seed de données de démonstration en production sur Vercel.

## ⚠️ Avertissement Important

**Le seed supprimera tous les événements existants** sauf les comptes administrateurs qui seront préservés. Assurez-vous de sauvegarder vos données avant de continuer.

## 📋 Prérequis

- Accès admin à l'application
- Accès au dashboard Vercel du projet
- Au moins un compte admin déjà créé dans la base de données

## 🚀 Étape 1 : Activer le seed en production

Par défaut, le seed est désactivé en production par sécurité. Pour l'activer :

1. Aller sur [Vercel Dashboard](https://vercel.com)
2. Sélectionner le projet `invitation`
3. Aller dans **Settings** → **Environment Variables**
4. Ajouter une nouvelle variable :
   - **Name**: `ALLOW_SEED`
   - **Value**: `true`
   - **Environments**: Cocher **Production**
5. Cliquer sur **Save**
6. **Redéployer** l'application :
   - Aller dans l'onglet **Deployments**
   - Cliquer sur les trois points `...` du dernier déploiement
   - Cliquer sur **Redeploy**

## 📊 Étape 2 : Charger les données de démonstration

### Option A : Via l'interface admin (recommandé)

1. Se connecter à l'application : `https://votre-domaine.com/admin`
2. Aller dans **Système** (menu latéral)
3. Dans la section **Données de démonstration**, cliquer sur le bouton **"Charger les données de démonstration"**
4. Attendre la confirmation (peut prendre 30-60 secondes)
5. Vérifier les résultats affichés

### Option B : Via API (avancé)

```bash
# Obtenir un token de session admin valide
TOKEN="votre-token-session"

# Appeler l'API seed
curl -X POST https://votre-domaine.com/api/admin/seed \
  -H "Cookie: next-auth.session-token=$TOKEN" \
  -H "Content-Type: application/json"
```

## 🎉 Données créées

Le seed crée **2 événements complets** avec toutes les fonctionnalités :

### Événement 1 : **10 ans Weevup - Célébration**
- **Date** : 20 juin 2025
- **Lieu** : Le Pavillon Royal, Paris
- **Invités** : 10 (5 VIP clients + 5 équipe)
- **RSVP** : 10 confirmations avec check-ins
- **Agenda** : 5 sessions (cocktail, cérémonie, témoignages, dîner, soirée)
- **Timeline** : 9 événements sur 3 jours (arrivées, check-in, sessions, départs)
- **Transport** : 4 réservations individuelles + 1 navette CDG
- **Hébergement** : 2 hôtels (30 chambres), 7 assignations
- **Emails** : 24 emails envoyés (Save the Date, Invitations, Rappels)
- **Showcase** : Page publique complète avec timeline, speakers, sponsors, gallery, FAQ

### Événement 2 : **Tech Summit 2025**
- **Date** : 15-16 septembre 2025 (2 jours)
- **Lieu** : Paris Convention Center
- **Invités** : 10 (3 speakers VIP + 7 participants)
- **RSVP** : 8 confirmations
- **Agenda** : 13 sessions sur 2 jours (keynotes, workshops, panels, networking)
- **Timeline** : 10 événements sur 4 jours (J-1 check-in → conférence → départs)
- **Transport** : 5 réservations VIP + 3 navettes
- **Hébergement** : 2 hôtels (35 chambres), 8 assignations
- **Emails** : 24 emails envoyés
- **Showcase** : Page publique avec programme 2 jours, speakers internationaux

## 📈 Fonctionnalités démontrées

- ✅ **Vue d'ensemble** : Événements avec détails complets
- ✅ **Showcase** : Pages publiques avec timeline, speakers, sponsors, gallery, FAQ
- ✅ **Invités** : 20 invités avec tags, entreprises, statuts variés
- ✅ **Check-in** : QR codes générés, check-ins simulés
- ✅ **RSVP** : Confirmations avec choix de repas, allergies, accompagnants
- ✅ **Envoi & Suivi** : 48 emails avec statuts (SENT, DELIVERED, OPENED, CLICKED)
- ✅ **Dashboard Planif.** : Données complètes pour analytics
- ✅ **Agenda** : 18 sessions (gala 1 jour + conférence 2 jours) avec speakers, horaires, salles
- ✅ **Timeline** : 19 événements intégrés montrant le parcours complet (arrivées → hébergement → sessions → départs)
- ✅ **Programme** : Programme détaillé affiché sur showcase public
- ✅ **Transport** : 9 réservations (vol, train, taxi, navettes) + 4 manifestes **synchronisés avec timeline**
- ✅ **Hébergement** : 4 hôtels, 65 chambres, 15 assignations **liées aux arrivées/départs dans timeline**

## 🔄 Étape 3 : Vider la base de données (optionnel)

Si vous souhaitez supprimer les données de démonstration :

1. Aller dans **Système** → Section **Gestion de la base de données**
2. Cliquer sur **"Vider la base de données"**
3. Confirmer l'action
4. **Note** : Les comptes administrateurs sont préservés

## 🔐 Sécurité

### Préservation des comptes admin

Le seed utilise une logique intelligente pour préserver vos comptes admin :

```typescript
// Le seed cherche d'abord un admin existant
let adminUser = await prisma.user.findFirst({
  where: { role: 'ADMIN' }
})

// Si aucun admin n'existe, créer l'admin par défaut
if (!adminUser) {
  adminUser = await prisma.user.create({
    data: {
      email: 'contact@weevup.com',
      password: await bcrypt.hash('admin123', 10),
      name: 'Admin Weevup',
      role: 'ADMIN'
    }
  })
}

// Utiliser cet admin pour créer les événements
```

**Résultat** : Si vous avez déjà un compte admin, il ne sera pas modifié. Si vous n'en avez pas, un compte `contact@weevup.com` avec mot de passe `admin123` sera créé.

### Désactiver le seed après utilisation

**Important** : Après avoir chargé les données, il est recommandé de désactiver le seed :

1. Retourner dans Vercel Dashboard → **Settings** → **Environment Variables**
2. Trouver la variable `ALLOW_SEED`
3. Cliquer sur **Edit** → Changer la valeur en `false` ou supprimer la variable
4. **Save** et redéployer

## 🐛 Dépannage

### Erreur : "Cette opération est désactivée en production"
➡️ Vous n'avez pas activé `ALLOW_SEED=true` dans les variables d'environnement Vercel

### Erreur : "Database already contains events"
➡️ Des événements existent déjà. Utilisez d'abord "Vider la base de données" dans la page Système

### Erreur : "Unauthorized"
➡️ Vous n'êtes pas connecté avec un compte admin. Reconnectez-vous

### Le seed prend beaucoup de temps
➡️ Normal, il crée plus de 100 entrées en base de données. Attendez jusqu'à 60 secondes

### Les compteurs ne se mettent pas à jour
➡️ Rafraîchissez la page Système avec le bouton "Actualiser Tout"

## 📞 Support

Pour toute question ou problème :
- Vérifier les logs Vercel : Dashboard → Deployment → **Function Logs**
- Consulter les logs dans la console navigateur (F12)
- Vérifier que la base de données PostgreSQL est accessible

## 🔗 URLs utiles après le seed

- **Page admin** : `/admin`
- **Événement 10 ans Weevup** : `/event/10-ans-weevup-celebration`
- **Événement Tech Summit** : `/event/tech-summit-2025`
- **Page Système** : `/admin/system`
- **Analytics** : `/admin/analytics`
- **RSVP** : `/admin/rsvp`

## ✨ Prochaines étapes

Après avoir chargé les données de démonstration :

1. Explorer les pages showcase publiques
2. Tester le workflow RSVP avec un lien invité
3. Consulter les statistiques dans le dashboard
4. Configurer SendGrid pour tester l'envoi d'emails
5. Personnaliser les templates d'emails
6. Ajouter vos propres événements

---

**Note** : Ce seed est conçu pour la démonstration et les tests. En production finale, vous créerez vos propres événements via l'interface admin.
