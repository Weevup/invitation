# 🎯 Peupler la Base de Données avec des Invités

## 📊 Situation Actuelle

La "Vue d'ensemble" fonctionne (✅) mais la liste des "Invités" est vide.

**Cela signifie:**
- ✅ La base de données est connectée
- ✅ Les événements existent
- ❌ Il n'y a pas d'invités créés

## 🚀 Solution : Exécuter le Seed

Le seed va créer automatiquement des données de démonstration complètes.

### Étape 1 : Vérifier l'état actuel

Ouvrez un terminal dans le dossier du projet et tapez :

```bash
node scripts/check-and-seed.js
```

Cette commande va vous dire:
- Combien d'événements vous avez
- Combien d'invités vous avez
- Si vous devez exécuter le seed

### Étape 2 : Exécuter le Seed

Si vous n'avez pas d'invités, exécutez :

```bash
npx prisma db seed
```

**Que va créer cette commande ?**

✨ **1 événement complet :**
- Tech Summit 2025 - L'Innovation en Action
- Dates : 15-16 Mai 2025
- Lieu : Palais des Congrès de Paris

👥 **67 invités avec des profils variés :**
- VIP, Speakers, Sponsors, Participants, Press
- Différentes entreprises (TechCorp, StartupLab, etc.)
- Statuts variés : Confirmés, Refusés, En attente

✅ **Des RSVP réalistes :**
- ~50 confirmations
- ~5 refus
- ~12 en attente de réponse
- Choix de repas (Végétarien, Vegan, Halal, etc.)
- Allergies alimentaires
- Accompagnants (+1, +2)

📧 **Templates d'emails :**
- Save the Date
- Invitation officielle
- Rappel RSVP
- Confirmation

### Étape 3 : Vérifier le résultat

Rechargez la page admin dans votre navigateur :

```
http://localhost:3000/admin
```

**Cliquez sur l'événement "Tech Summit 2025"**

Allez dans l'onglet **"Invités"** → Vous devriez voir les 67 invités ! 🎉

---

## 🎯 Alternative : Seed Spécifiques

Si vous voulez des données différentes, nous avons plusieurs seeds :

```bash
# Événement hybride (présentiel + en ligne)
npx prisma db seed -- --file prisma/seed-demo-hybrid.ts

# Mariage
npx prisma db seed -- --file prisma/seed-demo-wedding.ts

# Gala de charité
npx prisma db seed -- --file prisma/seed-demo-gala.ts

# Atelier/Workshop
npx prisma db seed -- --file prisma/seed-demo-workshop.ts
```

---

## ⚠️ Attention : Données Existantes

Le seed va **EFFACER** toutes les données existantes avant de créer les nouvelles.

**Si vous avez déjà des données réelles**, NE PAS exécuter le seed !

Dans ce cas, ajoutez des invités manuellement via l'interface admin :
1. Aller sur l'événement
2. Onglet "Invités"
3. Cliquer sur "Ajouter un invité" ou "Importer CSV"

---

## 🐛 En cas de Problème

### Erreur "invitationSentAt does not exist"

La migration n'a pas été appliquée. Exécutez :

```bash
npx prisma db push
```

Puis réessayez le seed.

### Erreur de connexion

Vérifiez votre fichier `.env` :
```env
DATABASE_URL="postgresql://neondb_owner:...@ep-gentle-meadow...neon.tech/neondb?sslmode=require"
```

### Le seed ne s'exécute pas

Vérifiez que le script existe dans `package.json` :
```json
"prisma": {
  "seed": "tsx prisma/seed-demo.ts"
}
```

---

## ✅ Checklist Finale

- [ ] Migration appliquée (`npx prisma db push`)
- [ ] Seed exécuté (`npx prisma db seed`)
- [ ] Serveur redémarré (`npm run dev`)
- [ ] Page admin rechargée
- [ ] Onglet "Invités" affiche 67 personnes

**Tout fonctionne ?** Bravo ! 🎉 Vous avez une base complète pour tester l'application.
