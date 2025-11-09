# 🔧 Guide de Réparation - "Événement non trouvé"

## 📝 Ce qu'il s'est passé

Les onglets "Vue d'ensemble" et "Invités" affichent "Événement non trouvé" car la base de données n'est pas à jour avec le code.

Il manque 2 colonnes dans la table `Guest` de votre base Neon.

## ✅ Solution Simple (1 commande)

### Étape 1 : Ouvrir un terminal

**Sur Windows :**
- Appuyez sur `Windows + R`
- Tapez `cmd` et appuyez sur Entrée

**Sur Mac :**
- Appuyez sur `Cmd + Espace`
- Tapez `terminal` et appuyez sur Entrée

### Étape 2 : Aller dans le dossier du projet

Copiez-collez cette commande (adaptez le chemin si nécessaire) :

```bash
cd C:\Users\VotreNom\Documents\invitation
```

Ou sur Mac/Linux :
```bash
cd ~/Documents/invitation
```

### Étape 3 : Exécuter UNE SEULE commande

Copiez-collez cette commande :

```bash
npx prisma db push
```

**Que va faire cette commande ?**
- Elle va se connecter à votre base Neon
- Ajouter les 2 colonnes manquantes
- Synchroniser tout automatiquement

### Étape 4 : Vérifier que ça fonctionne

Après la commande, vous devriez voir :

```
✔ Your database is now in sync with your Prisma schema.
```

C'est bon ! 🎉

### Étape 5 : Redémarrer le serveur

```bash
npm run dev
```

Ouvrez votre navigateur à `http://localhost:3000/admin` et vérifiez les onglets.

---

## ❓ En cas de problème

### Si vous voyez "command not found: npx"

Il faut d'abord installer Node.js :
- Téléchargez depuis https://nodejs.org
- Installez la version LTS (recommandée)
- Relancez le terminal et réessayez

### Si vous ne savez pas où est le projet

Cherchez le dossier qui contient :
- Un fichier `package.json`
- Un dossier `prisma/`
- Un dossier `app/`

C'est votre projet invitation !

### Si ça ne fonctionne toujours pas

Envoyez-moi une capture d'écran de l'erreur que vous voyez dans le terminal.

---

## 🎯 Alternative : Via l'interface Neon

Si la commande ne fonctionne pas, vous pouvez aussi le faire manuellement :

1. Allez sur https://console.neon.tech
2. Ouvrez votre projet `neondb`
3. Cliquez sur "SQL Editor"
4. Copiez-collez ce SQL :

```sql
ALTER TABLE "Guest"
ADD COLUMN IF NOT EXISTS "invitationSentAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "invitationEmailId" TEXT;
```

5. Cliquez sur "Run"

C'est fait ! ✅
