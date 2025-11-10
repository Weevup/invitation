# Checklist Variables d'Environnement Vercel

Avant chaque déploiement, vérifiez que ces variables sont correctement configurées:

## ✅ Variables Requises

### Base de données
- `DATABASE_URL` = `postgresql://...` (URL complète de Neon)

### NextAuth
- `AUTH_SECRET` = Générer avec: `openssl rand -base64 32`
- `NEXTAUTH_SECRET` = Même valeur que AUTH_SECRET (compatibilité)
- `NEXTAUTH_URL` = **`https://votre-domaine.vercel.app`** (⚠️ AVEC https://)
- `NEXT_PUBLIC_APP_URL` = **`https://votre-domaine.vercel.app`** (⚠️ AVEC https://)

## 🔍 Points de Vérification

1. **Toutes les URLs doivent commencer par `https://`** (jamais juste `domaine.com`)
2. Pas d'espace ou caractère spécial dans les variables
3. DATABASE_URL doit contenir `?sslmode=require` à la fin
4. AUTH_SECRET doit être une chaîne aléatoire longue (32+ caractères)

## 🧪 Test après déploiement

Testez ces URLs dans l'ordre:

1. `https://votre-app.vercel.app/api/admin/check-and-fix` → Doit retourner `"success": true`
2. `https://votre-app.vercel.app/api/auth/providers` → Doit retourner du JSON sans erreur
3. `https://votre-app.vercel.app/auth/admin` → Page de login doit s'afficher

## 🚨 En cas d'erreur 500

1. Allez dans Vercel → Deployments → Dernier déploiement
2. Cliquez sur "Runtime Logs"
3. Identifiez l'erreur exacte
4. Vérifiez les variables d'environnement mentionnées dans l'erreur

## 📝 Changement de domaine

Si vous changez le domaine Vercel:

1. Mettez à jour `NEXTAUTH_URL` avec le nouveau domaine
2. Mettez à jour `NEXT_PUBLIC_APP_URL` avec le nouveau domaine
3. **Redéployez** (pas juste restart)
