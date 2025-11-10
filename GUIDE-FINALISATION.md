# 🎯 Guide de Finalisation - Phase 1

## 📋 Situation Actuelle

### ✅ Ce qui est fait

**Code Phase 1 (100% complet)** :
- ✅ Tous les correctifs de sécurité appliqués (Open Redirect, XSS, Webhooks)
- ✅ Encryption centralisée (`lib/encryption.ts`)
- ✅ Validation environnement (`lib/env.ts`)
- ✅ Rate limiting avec Zod
- ✅ Webhooks sécurisés (signatures obligatoires)
- ✅ 6 migrations Prisma créées

**Configuration** :
- ✅ Fichier `.env` créé avec DATABASE_URL Neon
- ✅ Dépendances npm installées
- ✅ Configuration déjà dans Vercel

### ⚠️ Ce qui reste à vérifier

**Base de données Neon** :
- Les migrations Prisma doivent être appliquées sur Neon
- Si déployé sur Vercel, c'est probablement déjà fait automatiquement

---

## 🔍 Étape 1 : Vérifier l'état de la base de données

### Option A : Via psql (local)

```bash
# Se connecter à Neon
psql 'postgresql://neondb_owner:npg_7qTIH2pMYJBW@ep-gentle-meadow-abxleko9-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require'

# Une fois connecté, exécuter :
\dt

# Vérifier les migrations appliquées :
SELECT migration_name FROM "_prisma_migrations" ORDER BY started_at;
```

**Résultat attendu** : Vous devriez voir 6 migrations appliquées :
1. `20250101_init`
2. `20250107_add_showcase_fields`
3. `20250108_add_communication_and_features`
4. `20250108_add_email_templates`
5. `20250108_add_email_integrations`
6. `20251109_add_invitation_tracking_fields`

### Option B : Via script

```bash
psql 'postgresql://neondb_owner:npg_7qTIH2pMYJBW@ep-gentle-meadow-abxleko9-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require' -f scripts/check-db-status.sql
```

---

## 🚀 Étape 2 : Appliquer les migrations (si nécessaire)

### Option A : Via Vercel (Recommandé)

Si votre projet est déployé sur Vercel :

1. **Les migrations s'appliquent automatiquement** lors du build via :
   ```json
   "build": "prisma migrate deploy && next build"
   ```

2. **Forcer un redéploiement** :
   ```bash
   # Dans votre terminal local (avec Vercel CLI)
   vercel --prod
   ```

3. **Ou via l'interface Vercel** :
   - Allez sur votre projet Vercel
   - Onglet "Deployments"
   - Cliquez sur "Redeploy" sur le dernier déploiement

### Option B : En local (si vous avez Node.js local)

```bash
# Installer les dépendances localement
npm install

# Appliquer les migrations
npx prisma migrate deploy

# Vérifier
npx prisma studio
```

### Option C : Appliquer manuellement via SQL

Si les deux options ci-dessus échouent, vous pouvez appliquer le SQL complet :

```bash
psql 'postgresql://neondb_owner:npg_7qTIH2pMYJBW@ep-gentle-meadow-abxleko9-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require' < scripts/apply-all-migrations.sql
```

---

## 🧪 Étape 3 : Tester l'application

### En développement local

```bash
npm run dev
```

Puis accédez à :
- Admin dashboard : http://localhost:3000/admin
- Créer un événement : http://localhost:3000/admin/events/new

### En production (Vercel)

Visitez votre URL Vercel et testez :
1. **Création d'un événement** via `/admin/events/new`
2. **Import CSV de guests**
3. **Envoi d'emails de test**
4. **Page RSVP invité** avec un token

---

## 📊 Étape 4 : Seed de données (optionnel)

Si vous voulez des données de démonstration :

### Via Vercel

Ajoutez une commande dans `package.json` et exécutez-la via Vercel CLI :

```bash
# En local avec connexion Neon
npm run db:seed
```

### Ou créez un utilisateur admin manuellement

```sql
INSERT INTO "User" (id, email, role, "createdAt", "updatedAt")
VALUES (
  'admin-1',
  'admin@weevup.com',
  'ADMIN',
  NOW(),
  NOW()
);
```

---

## ✅ Checklist de finalisation

- [ ] Base de données Neon accessible
- [ ] 6 migrations Prisma appliquées
- [ ] Tables créées (User, Event, Guest, RSVP, etc.)
- [ ] Fichier `.env` configuré (local)
- [ ] Variables d'environnement dans Vercel
- [ ] Application build sans erreur
- [ ] Test de création d'événement
- [ ] Test d'envoi d'email
- [ ] Test page RSVP invité

---

## 🐛 Résolution de problèmes

### Erreur : "prisma: not found" ou "403 Forbidden"

**Cause** : Environnement sandbox ou binaires Prisma non téléchargés

**Solution** :
1. Utilisez Vercel pour appliquer les migrations (automatique)
2. Ou en local : `npm install && npx prisma generate`

### Erreur : "Table does not exist"

**Cause** : Les migrations ne sont pas appliquées

**Solution** : Suivre l'Étape 2 ci-dessus

### Erreur de build Next.js

**Vérifiez** :
- Toutes les dépendances sont installées
- Le client Prisma est généré : `npx prisma generate`
- Le `.env` contient bien `DATABASE_URL`

---

## 📝 État de la Phase 1

### Fonctionnalités complètes

✅ **Gestion invités** : Import CSV, tags, tokens sécurisés
✅ **Dashboard admin** : Statistiques, analytics
✅ **Formulaire RSVP** : 7 étapes avec validation
✅ **Emails** : 3 templates professionnels (invitation, confirmation, reminder)
✅ **QR Codes** : Génération automatique pour check-in
✅ **Sécurité** : Encryption, rate limiting, validation
✅ **Base de données** : 6 migrations Prisma prêtes

### Prochaines étapes (Phase 2)

- Billetterie & Paiements
- Analytics avancés
- Multi-langue
- Intégrations tierces (Stripe, Eventbrite)

---

## 🆘 Support

Si vous rencontrez des problèmes :

1. **Vérifiez les logs Vercel** : https://vercel.com/dashboard → votre projet → Logs
2. **Testez la connexion Neon** :
   ```bash
   psql 'postgresql://neondb_owner:npg_7qTIH2pMYJBW@...'
   ```
3. **Ouvrez une issue GitHub** avec les détails de l'erreur

---

## 🎉 Conclusion

**La Phase 1 est complète au niveau code.** Il ne reste plus qu'à :

1. ✅ Vérifier que les migrations sont appliquées sur Neon
2. ✅ Tester l'application en production
3. 🚀 Déployer et utiliser !

**Temps estimé pour finaliser** : 5-10 minutes
