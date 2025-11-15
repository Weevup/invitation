# 📋 Guide de Migration du Logging

**Status:** 17/240 console statements migrés (7%)
**Système:** Pino structured logging
**Objectif:** 100% migration progressive

---

## ✅ Déjà Migré

### Fichiers Complétés (17 statements)

1. ✅ **app/api/cron/process-scheduled-emails/route.ts** (13 → 0)
   - cronLogger avec contexte job
   - Performance timing
   - Logs structurés des envois

2. ✅ **lib/email-service.ts** (4 → 0)
   - emailLogger pour toutes les opérations
   - Logging d'erreurs avec contexte provider
   - Tracking des templates

---

## 📊 Console Statements Restants (223)

### 🔴 Priorité Haute - API Routes (60 statements)

Ces fichiers nécessitent un logging structuré pour le monitoring production :

#### 1. Email & Webhooks (20 statements)
```
app/api/admin/integrations/email/route.ts (7)
app/api/webhooks/email/sendgrid/route.ts (5)
app/api/webhooks/email/resend/route.ts (5)
app/api/webhooks/email/mailgun/route.ts (5)
```

**Migration type:**
```typescript
// AVANT
console.error('Email integration test failed:', error)

// APRÈS
import { emailLogger } from '@/lib/logger'
emailLogger.error({ error, provider, config }, 'Email integration test failed')
```

#### 2. Sessions & Program (15 statements)
```
app/api/admin/events/[id]/sessions/[sessionId]/route.ts (4)
app/api/admin/events/[id]/sessions/[sessionId]/participants/route.ts (3)
app/api/admin/events/[id]/transport/manifests/[manifestId]/route.ts (3)
```

**Migration type:**
```typescript
// AVANT
console.log('Session created:', sessionId)

// APRÈS
import { createLogger } from '@/lib/logger'
const sessionLogger = createLogger({ module: 'sessions', eventId, sessionId })
sessionLogger.info({ sessionData }, 'Session created')
```

#### 3. Transport & Accommodation (12 statements)
```
app/api/admin/events/[id]/transport/[bookingId]/route.ts (3)
app/api/admin/events/[id]/accommodations/[accommodationId]/route.ts (3)
app/api/admin/events/[id]/transport/manifests/route.ts (2)
app/api/admin/events/[id]/transport/route.ts (2)
```

#### 4. Autres Routes API (13 statements)
```
app/api/track/click/[id]/route.ts (3)
app/api/checkin/[qrCodeId]/route.ts (2)
app/api/admin/users/route.ts (2)
app/api/admin/setup/route.ts (2)
```

---

### 🟠 Priorité Moyenne - Lib Utilities (50 statements)

#### lib/env.ts (9 statements)
Ce fichier vérifie les variables d'environnement au démarrage.

**Migration type:**
```typescript
// AVANT
console.warn('SMTP credentials not configured')

// APRÈS
import { createLogger } from '@/lib/logger'
const envLogger = createLogger({ module: 'env' })
envLogger.warn({ required: ['SMTP_HOST', 'SMTP_PORT'] }, 'SMTP credentials not configured')
```

#### lib/email/invitations.ts (2 statements)
#### autres lib/* files (~39 statements)

---

### 🟡 Priorité Basse - Components (113 statements)

Les composants client-side peuvent garder console.log pour le debugging navigateur, MAIS ils devraient être migrés vers des loggers spécifiques en production.

**Note:** En production, les logs côté client sont visibles dans la console du navigateur. Considérer :
- Garder console.log en dev
- Utiliser un logger conditionnel en prod
- Envoyer les erreurs critiques à un service de monitoring (Sentry)

---

## 🎯 Guide de Migration Rapide

### 1. Import du Logger

```typescript
// Logger simple
import { logger } from '@/lib/logger'

// Logger spécialisé
import { emailLogger, authLogger, rsvpLogger, dbLogger } from '@/lib/logger'

// Logger personnalisé
import { createLogger } from '@/lib/logger'
const myLogger = createLogger({ module: 'my-module', context: 'value' })
```

### 2. Remplacement des Patterns

#### Pattern 1: Simple Log
```typescript
// AVANT
console.log('User logged in')

// APRÈS
logger.info('User logged in')
```

#### Pattern 2: Log avec Données
```typescript
// AVANT
console.log('Processing order:', orderId, 'for user:', userId)

// APRÈS
logger.info({ orderId, userId }, 'Processing order')
```

#### Pattern 3: Error Logging
```typescript
// AVANT
console.error('Failed to process:', error)

// APRÈS
logger.error({ error, context: additionalData }, 'Failed to process')
```

#### Pattern 4: Performance Timing
```typescript
// AVANT
const start = Date.now()
// ... work
console.log(`Operation took ${Date.now() - start}ms`)

// APRÈS
import { startTimer } from '@/lib/logger'
const timer = startTimer()
// ... work
timer.end({ operation: 'name', result: 'data' }, 'Operation completed')
```

#### Pattern 5: API Request Logging
```typescript
// AVANT
console.log(`${request.method} ${request.url}`)

// APRÈS
import { logRequest } from '@/lib/logger'
const reqLogger = logRequest(request, '/api/route')
reqLogger.info({ params, query }, 'Request received')
```

### 3. Niveaux de Log

```typescript
logger.debug({ data }, 'Verbose info')      // Development only
logger.info({ data }, 'Normal operation')   // General info
logger.warn({ data }, 'Warning')            // Potential issues
logger.error({ error }, 'Error occurred')   // Errors
logger.fatal({ error }, 'Fatal error')      // Critical failures
```

---

## 🚀 Script de Migration Automatique

Pour migrer plusieurs fichiers rapidement, créer un script Node.js :

```javascript
// scripts/migrate-logging.js
const fs = require('fs')
const path = require('path')

function migratFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8')

  // Add import if not present
  if (!content.includes('from \'@/lib/logger\'')) {
    const importLine = 'import { logger } from \'@/lib/logger\'\n'
    const firstImportEnd = content.indexOf('\n\n')
    content = content.slice(0, firstImportEnd) + '\n' + importLine + content.slice(firstImportEnd)
  }

  // Replace simple console.log
  content = content.replace(/console\.log\((.*?)\)/g, 'logger.info($1)')

  // Replace console.error
  content = content.replace(/console\.error\((.*?)\)/g, 'logger.error($1)')

  // Replace console.warn
  content = content.replace(/console\.warn\((.*?)\)/g, 'logger.warn($1)')

  fs.writeFileSync(filePath, content)
  console.log(`✅ Migrated: ${filePath}`)
}

// Usage: node scripts/migrate-logging.js app/api/**/*.ts
```

---

## 📈 Plan de Migration Progressive

### Semaine 1 (Priorité Haute)
- [x] Système de logging créé
- [x] Cron job migré (13 console)
- [x] Email service migré (4 console)
- [ ] Webhooks email migrés (15 console)
- [ ] Routes sessions migrées (15 console)

**Objectif:** 50 console migrés (21%)

### Semaine 2 (Priorité Moyenne)
- [ ] Transport & Accommodation (12 console)
- [ ] Tracking routes (3 console)
- [ ] lib/env.ts (9 console)
- [ ] Autres lib utilities (30 console)

**Objectif:** 100 console migrés (42%)

### Semaine 3-4 (Finalisation)
- [ ] Routes API restantes (25 console)
- [ ] Components critiques (50 console)
- [ ] Tests et validation

**Objectif:** 175+ console migrés (73%)

### Maintenance Continue
- Les 65 console.log restants dans les components peuvent rester en développement
- Ajouter logger.warn() pour les cas importants
- Configurer Sentry pour les erreurs critiques

---

## 🔍 Validation

### Checklist par Fichier

Avant de marquer un fichier comme migré :

- [ ] Tous les console.log/error/warn remplacés
- [ ] Import du logger ajouté
- [ ] Contexte ajouté aux logs (pas juste des strings)
- [ ] Niveaux de log appropriés (debug/info/warn/error)
- [ ] Tests manuels effectués
- [ ] Aucune régression

### Vérification Globale

```bash
# Compter les console restants
grep -r "console\.\(log\|error\|warn\)" app/ lib/ --include="*.ts" --include="*.tsx" | wc -l

# Lister par fichier
grep -r "console\.\(log\|error\|warn\)" app/ lib/ --include="*.ts" | cut -d: -f1 | sort | uniq -c | sort -rn

# Vérifier qu'un fichier est clean
grep "console\.\(log\|error\|warn\)" path/to/file.ts
# (doit retourner vide)
```

---

## 🎁 Bénéfices Attendus

### Debugging en Production

**Avant:**
```
[Error: Failed to send email]
```

**Après:**
```json
{
  "level": "error",
  "time": 1705318800000,
  "module": "email",
  "provider": "sendgrid",
  "to": "user@example.com",
  "eventId": "evt_123",
  "error": {
    "message": "Failed to send email",
    "code": "INVALID_API_KEY",
    "stack": "..."
  },
  "msg": "Failed to send email to guest"
}
```

### Performance Insights

```json
{
  "level": "info",
  "duration": 1250,
  "operation": "fetchGuests",
  "eventId": "evt_123",
  "count": 500,
  "msg": "Guests fetched"
}
```

### Monitoring & Alerting

Avec des logs structurés JSON, on peut facilement :
- Filtrer par module, niveau, eventId, etc.
- Créer des alertes sur des patterns
- Analyser les performances
- Tracer les requêtes end-to-end

---

## 📚 Ressources

- [Pino Documentation](https://getpino.io/)
- [Best Practices for Logging](https://www.loggly.com/blog/best-practices-for-logging/)
- [Structured Logging Benefits](https://www.sumologic.com/blog/structured-logging/)

---

**Auteur:** Claude
**Date:** 2025-01-15
**Status:** ✅ Système en place, migration en cours (7%)
**Prochaine étape:** Migrer les webhooks email (15 console)
