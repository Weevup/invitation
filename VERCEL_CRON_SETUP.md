# 🕒 Configuration Vercel Cron - Scheduled Emails

## Vue d'ensemble

Ce projet utilise **Vercel Cron Jobs** pour traiter automatiquement les emails programmés. Le cron s'exécute **toutes les 5 minutes** et envoie les emails dont la date d'envoi est passée.

---

## 🔧 Configuration requise

### 1. Générer un CRON_SECRET

Sur votre machine locale, générez un secret aléatoire :

```bash
openssl rand -base64 32
```

Exemple de résultat :
```
bX9kM2VjUmV0U2VjcjN0S2V5Rm9yQ3JvbkpvYjE=
```

### 2. Ajouter le secret dans Vercel

1. Allez sur votre projet Vercel : https://vercel.com/dashboard
2. Cliquez sur votre projet
3. Allez dans **Settings** → **Environment Variables**
4. Ajoutez une nouvelle variable :
   - **Name**: `CRON_SECRET`
   - **Value**: Le secret généré ci-dessus
   - **Environments**: Cochez `Production`, `Preview`, et `Development`
5. Cliquez sur **Save**

### 3. Redéployer

Après avoir ajouté la variable d'environnement, redéployez votre projet :
- Soit en faisant un nouveau commit et push
- Soit en cliquant sur **Redeploy** dans Vercel Dashboard

---

## 📋 Configuration du Cron Job

Le fichier `vercel.json` contient la configuration :

```json
{
  "crons": [
    {
      "path": "/api/cron/process-scheduled-emails",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

**Schedule**: `*/5 * * * *` = Toutes les 5 minutes

Pour modifier la fréquence, consultez : https://crontab.guru/

---

## 🔍 Vérifier que ça fonctionne

### 1. Vérifier les logs Vercel

Dans Vercel Dashboard → votre projet → **Logs** :
- Filtrer par `/api/cron/process-scheduled-emails`
- Vous devriez voir des logs toutes les 5 minutes

### 2. Vérifier les Cron Jobs

Vercel Dashboard → votre projet → **Cron Jobs** :
- Vous devriez voir le cron configuré
- Status : `Active`
- Last Run : Horodatage récent

### 3. Tester manuellement

Vous pouvez déclencher le cron manuellement avec curl (remplacez les valeurs) :

```bash
curl -X GET \
  'https://votre-domaine.vercel.app/api/cron/process-scheduled-emails' \
  -H 'Authorization: Bearer VOTRE_CRON_SECRET'
```

Réponse attendue (si pas d'emails à envoyer) :
```json
{
  "success": true,
  "processed": 0,
  "message": "No emails to process"
}
```

---

## 📊 Monitoring des emails programmés

### Via Prisma Studio

```bash
npx prisma studio
```

1. Ouvrez la table `ScheduledEmail`
2. Vérifiez les emails avec :
   - `status = 'PENDING'` → En attente d'envoi
   - `status = 'PROCESSING'` → En cours d'envoi
   - `status = 'SENT'` → Envoyé avec succès
   - `status = 'FAILED'` → Échec (voir `errorMessage`)

### Via l'interface

Allez sur `/admin/events/[id]/communications` :
- Onglet **Analytics** pour voir les statistiques
- Les emails programmés apparaîtront dans les stats après envoi

---

## ❌ Troubleshooting

### Le cron ne s'exécute pas

**Vérifications** :
1. ✅ Variable `CRON_SECRET` existe dans Vercel
2. ✅ Fichier `vercel.json` est commité et pushé
3. ✅ Redéploiement effectué après ajout de la variable
4. ✅ Plan Vercel supporte les Cron Jobs (Pro plan ou supérieur)

**Note** : Les Cron Jobs Vercel sont **uniquement disponibles en production**, pas en preview ou dev.

### Les emails ne sont pas envoyés

**Vérifications** :
1. ✅ EmailIntegration configurée (`/admin/settings/integrations`)
2. ✅ EmailIntegration `isPrimary = true` et `isActive = true`
3. ✅ `scheduledFor` est dans le passé
4. ✅ Vérifier les logs du cron pour voir les erreurs

### Erreur "Unauthorized" dans les logs

Le `CRON_SECRET` n'est pas configuré correctement :
1. Vérifiez que la variable existe dans Vercel
2. Vérifiez qu'elle est bien disponible en production
3. Redéployez le projet

---

## 🔐 Sécurité

### Pourquoi un CRON_SECRET ?

Sans authentification, n'importe qui pourrait appeler votre endpoint cron et déclencher des envois massifs d'emails.

Le `CRON_SECRET` :
- ✅ Authentifie les requêtes Vercel Cron
- ✅ Bloque les appels externes non autorisés
- ✅ Protège contre les abus

### Headers Vercel Cron

Vercel envoie automatiquement le header :
```
Authorization: Bearer <CRON_SECRET>
```

Notre API vérifie ce header avant d'exécuter le job.

---

## 📈 Limites Vercel Cron

| Plan | Exécutions/mois | Durée max |
|------|-----------------|-----------|
| Hobby | ❌ Non disponible | - |
| Pro | 10,000 | 10 secondes |
| Enterprise | Illimité | Configurable |

**Note** : Pour plus de 50 emails par exécution, considérer d'augmenter la limite ou utiliser un job queue externe (Upstash QStash, Inngest, etc.)

---

## 🎯 Configuration avancée

### Modifier la fréquence

Dans `vercel.json`, changez le `schedule` :

```json
{
  "schedule": "0 * * * *"  // Toutes les heures
  "schedule": "0 9 * * *"  // Tous les jours à 9h
  "schedule": "*/10 * * * *"  // Toutes les 10 minutes
}
```

### Ajouter un timeout personnalisé

Vercel Pro limite à 10 secondes par défaut. Si vous avez Enterprise :

```json
{
  "crons": [
    {
      "path": "/api/cron/process-scheduled-emails",
      "schedule": "*/5 * * * *",
      "timeout": 30
    }
  ]
}
```

---

## 📚 Ressources

- [Vercel Cron Jobs Documentation](https://vercel.com/docs/cron-jobs)
- [Cron Schedule Expression](https://crontab.guru/)
- [Vercel Edge Functions Limits](https://vercel.com/docs/concepts/limits/overview#edge-functions)

---

## ✅ Checklist de mise en production

- [ ] `CRON_SECRET` généré et ajouté dans Vercel
- [ ] `vercel.json` commité et pushé
- [ ] Projet redéployé
- [ ] EmailIntegration configurée et active
- [ ] Test manuel du cron réussi
- [ ] Logs Vercel vérifiés (pas d'erreurs)
- [ ] Premier email programmé testé
- [ ] Monitoring configuré (notifications d'erreurs si nécessaire)

