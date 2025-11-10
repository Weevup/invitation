# Guide de Dépannage

## Erreurs Courantes et Solutions

### ❌ Erreur: "The column User.xxx does not exist in the current database"

**Cause:** Le schéma Prisma n'est pas synchronisé avec la base de données.

**Solution:**
```bash
# Localement
npx prisma db push

# Ou configurez Vercel Build Command:
npx prisma db push --accept-data-loss && prisma generate && next build
```

---

### ❌ Erreur: "Invalid URL" avec NextAuth

**Cause:** Variable `NEXTAUTH_URL` sans le protocole `https://`

**Solution:**
- ❌ Incorrect: `invitation-app.vercel.app`
- ✅ Correct: `https://invitation-app.vercel.app`

Mettez à jour dans Vercel → Settings → Environment Variables

---

### ❌ Erreur 500 sur `/api/auth/*`

**Cause:** bcrypt n'est pas compatible avec Edge Runtime

**Solution:** Ajoutez dans `/app/api/auth/[...nextauth]/route.ts`:
```typescript
export const runtime = 'nodejs'
```

---

### ❌ Erreur: "CredentialsSignin" lors de la connexion

**Causes possibles:**
1. Mot de passe incorrect dans la DB
2. Hash bcrypt invalide
3. Compte verrouillé (trop de tentatives)

**Solution:**
1. Testez l'API: `https://votre-app.vercel.app/api/admin/check-and-fix`
2. Régénérez le compte admin avec le script SQL fourni
3. Vérifiez que le compte est `isActive: true` et `lockedUntil: null`

---

### ❌ Build Vercel échoue avec Prisma

**Cause:** Conflit de configuration ou cache

**Solution:**
1. Allez dans Deployments
2. Cliquez sur "Redeploy"
3. **Décochez** "Use existing Build Cache"

---

## Workflow de Débogage Recommandé

### 1. Vérifier les Variables d'Environnement
```bash
node scripts/verify-setup.js
```

### 2. Tester la DB
```
GET https://votre-app.vercel.app/api/admin/check-and-fix
```

Doit retourner `"success": true` avec les stats de la DB.

### 3. Tester NextAuth
```
GET https://votre-app.vercel.app/api/auth/providers
```

Doit retourner un JSON avec les providers configurés.

### 4. Tester la Page de Login
```
GET https://votre-app.vercel.app/auth/admin
```

Doit afficher le formulaire de connexion.

### 5. Consulter les Logs en Temps Réel

Vercel → Deployments → [Dernier] → Runtime Logs

---

## Outils de Diagnostic Disponibles

| URL | Description |
|-----|-------------|
| `/api/admin/check-and-fix` | Vérifie et répare la DB |
| `/api/check-env` | Affiche les variables d'environnement |
| `/api/test-db` | Teste la connexion DB |
| `/api/auth/providers` | Vérifie NextAuth |

---

## En Cas de Doute

1. Copiez l'erreur **complète** des logs Vercel
2. Vérifiez ce guide de dépannage
3. Consultez `VERCEL-ENV-CHECKLIST.md`
4. Testez les APIs de diagnostic ci-dessus
