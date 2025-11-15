# 📊 Guide : Monitoring & Tests

Ce guide explique comment utiliser l'infrastructure de monitoring de production et de tests mise en place dans l'application.

---

## 📋 Table des matières

1. [Monitoring de Production avec Sentry](#-monitoring-de-production-avec-sentry)
2. [Tracking de Performance avec Web Vitals](#-tracking-de-performance-avec-web-vitals)
3. [Tests Unitaires avec Vitest](#-tests-unitaires-avec-vitest)
4. [Tests E2E avec Playwright](#-tests-e2e-avec-playwright)
5. [Logging Centralisé](#-logging-centralisé)

---

## 🔍 Monitoring de Production avec Sentry

### Vue d'ensemble

L'application utilise **Sentry** pour tracker automatiquement toutes les erreurs en production :
- ✅ **Erreurs client** : 59 composants et pages avec reporting automatique
- ✅ **Erreurs serveur** : Toutes les API routes avec Pino → Sentry
- ✅ **Erreurs React** : Global error boundary pour les crashes de rendering
- ✅ **Session Replay** : 10% de toutes les sessions, 100% des sessions avec erreurs

### Configuration

#### 1. Créer un compte Sentry (gratuit)

1. Allez sur [sentry.io](https://sentry.io) et créez un compte
2. Créez un nouveau projet **Next.js**
3. Copiez le **DSN** fourni

#### 2. Configurer les variables d'environnement

Ajoutez à votre `.env` ou `.env.local` :

```bash
# Monitoring Sentry (OBLIGATOIRE en production)
NEXT_PUBLIC_SENTRY_DSN="https://votre-dsn@sentry.io/votre-project-id"

# Optionnel : Pour l'upload des source maps
SENTRY_ORG="votre-organisation"
SENTRY_PROJECT="votre-projet"
SENTRY_AUTH_TOKEN="votre-token"  # Générez sur sentry.io/settings/account/api/auth-tokens/
```

#### 3. Déployer sur Vercel

Ajoutez les variables d'environnement dans **Vercel Dashboard** → **Settings** → **Environment Variables**

### Fonctionnalités

#### Tracking automatique des erreurs

Toutes les erreurs sont automatiquement capturées et envoyées à Sentry :

```typescript
// Dans n'importe quel composant utilisant le client logger
import { createClientLogger } from '@/lib/client-logger'

const logger = createClientLogger({ component: 'MonComposant' })

try {
  await fetchData()
} catch (error) {
  // Automatiquement envoyé à Sentry en production
  logger.error(error, {
    action: 'fetchData',
    metadata: { userId: '123' }
  })
}
```

#### Session Replay

Sentry enregistre automatiquement :
- **10% de toutes les sessions** (échantillonnage aléatoire)
- **100% des sessions avec erreurs** (replay complet avant le crash)

Les replays incluent :
- Actions utilisateur (clics, saisies, navigation)
- Console logs
- Network requests
- DOM mutations

> **Note de sécurité** : Tout le texte est masqué par défaut (`maskAllText: true`)

#### Tags et contexte

Chaque erreur inclut :
- `component` : Nom du composant
- `action` : Action en cours (fetchData, submitForm, etc.)
- `metadata` : Données contextuelles (userId, eventId, etc.)
- `page` : Route courante
- `environment` : development/production

#### Tunnel anti-ad-blockers

L'application utilise la route `/monitoring` pour contourner les ad-blockers :
- Les requêtes vers Sentry passent par votre propre domaine
- Améliore le taux de capture d'erreurs de ~30%

### Utilisation du Dashboard Sentry

#### Visualiser les erreurs

1. Allez sur [sentry.io](https://sentry.io)
2. Sélectionnez votre projet
3. **Issues** → Toutes les erreurs capturées

Chaque erreur affiche :
- Stack trace complète
- Breadcrumbs (actions avant l'erreur)
- User context (si disponible)
- Device & browser info
- Session replay (si disponible)

#### Alertes

Configurez des alertes pour être notifié :
- Par email
- Slack
- Discord
- PagerDuty

**Settings** → **Alerts** → **Create Alert Rule**

Exemples d'alertes :
- Plus de 10 erreurs en 5 minutes
- Nouvelle erreur jamais vue
- Erreur affectant plus de 100 utilisateurs

#### Performance monitoring

Sentry track aussi les performances :
- Temps de réponse des API routes
- Temps de chargement des pages
- Database query performance

---

## ⚡ Tracking de Performance avec Web Vitals

### Vue d'ensemble

L'application track automatiquement les **Core Web Vitals** de Google :

| Métrique | Description | Bon | À améliorer | Mauvais |
|----------|-------------|-----|-------------|---------|
| **LCP** | Largest Contentful Paint | < 2.5s | 2.5s - 4s | > 4s |
| **FID** | First Input Delay | < 100ms | 100ms - 300ms | > 300ms |
| **CLS** | Cumulative Layout Shift | < 0.1 | 0.1 - 0.25 | > 0.25 |
| **FCP** | First Contentful Paint | < 1.8s | 1.8s - 3s | > 3s |
| **TTFB** | Time to First Byte | < 800ms | 800ms - 1800ms | > 1800ms |
| **INP** | Interaction to Next Paint | < 200ms | 200ms - 500ms | > 500ms |

### Configuration

#### Option 1 : Vercel Analytics (recommandé)

1. Dans **Vercel Dashboard** → **Analytics** → **Enable Web Vitals**
2. Ajoutez la variable d'environnement :

```bash
NEXT_PUBLIC_VERCEL_ANALYTICS_ID="votre-analytics-id"
```

3. Les métriques apparaissent dans **Vercel Dashboard** → **Analytics**

#### Option 2 : Sentry (déjà configuré)

Si Sentry est configuré, les Web Vitals sont automatiquement envoyées comme **breadcrumbs** et **metrics**.

### Fonctionnalités

#### Tracking automatique

Le composant `<WebVitals />` est déjà intégré dans `app/layout.tsx` :

```typescript
// Aucune configuration nécessaire !
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <WebVitals />  {/* ← Tracking automatique */}
      </body>
    </html>
  )
}
```

#### Detection de Long Tasks

L'application détecte automatiquement les **long tasks** (tâches bloquant le main thread > 50ms) :

```typescript
// Automatiquement tracké et envoyé à Sentry
if (entry.duration > 50ms) {
  Sentry.addBreadcrumb({
    category: 'performance',
    message: 'Long task detected',
    data: { duration: entry.duration }
  })
}
```

#### Development Logging

En mode développement, les métriques sont affichées dans la console :

```
[Web Vitals] LCP: { value: 2341, rating: 'good', delta: 12 }
[Web Vitals] FID: { value: 45, rating: 'good', delta: 3 }
[Performance] Long task detected: { duration: 87ms }
```

### Améliorer les Web Vitals

#### LCP (Largest Contentful Paint)

✅ **Déjà optimisé** :
- Images Next.js avec lazy loading
- Fonts optimisés (Lato, Abril Fatface)
- Compression automatique (Vercel)

🔧 **Améliorations possibles** :
- Utiliser un CDN pour les images
- Précharger les ressources critiques
- Réduire la taille des images

#### FID (First Input Delay)

✅ **Déjà optimisé** :
- Code splitting automatique (Next.js)
- useCallback pour les event handlers
- Vitest pour détecter les re-renders

🔧 **Améliorations possibles** :
- Différer le chargement des scripts non-critiques
- Utiliser web workers pour les tâches lourdes

#### CLS (Cumulative Layout Shift)

✅ **Déjà optimisé** :
- Dimensions explicites sur les images (`width`/`height`)
- Skeleton loaders pour le contenu dynamique
- Fonts avec `font-display: swap`

🔧 **Améliorations possibles** :
- Réserver l'espace pour les ads/embeds
- Éviter d'injecter du contenu au-dessus du fold

---

## 🧪 Tests Unitaires avec Vitest

### Vue d'ensemble

L'application utilise **Vitest** pour les tests unitaires :
- ⚡ **Rapide** : 10x plus rapide que Jest
- 🔧 **Compatible Vite** : Utilise le même config que Vite
- 🎯 **TypeScript natif** : Support total sans config
- 📸 **Snapshots** : Comme Jest
- 🎭 **Mocking** : API compatible avec Jest

### Installation

Déjà installé ! Les dépendances :

```json
{
  "devDependencies": {
    "vitest": "^4.0.9",
    "@vitejs/plugin-react": "^5.1.1",
    "@testing-library/react": "^16.3.0",
    "@testing-library/dom": "^10.4.1",
    "@testing-library/jest-dom": "^6.9.1",
    "@testing-library/user-event": "^14.6.1",
    "jsdom": "^27.2.0"
  }
}
```

### Commandes

```bash
# Mode watch (re-run automatique)
npm test

# Lancer une fois (CI)
npm run test:run

# Avec UI visuelle
npm run test:ui

# Avec coverage
npm run test:coverage

# Mode watch explicite
npm run test:watch
```

### Écrire des tests

#### Structure de base

```typescript
// lib/__tests__/mon-util.test.ts
import { describe, it, expect } from 'vitest'
import { maFonction } from '../mon-util'

describe('maFonction', () => {
  it('devrait retourner le résultat attendu', () => {
    const result = maFonction('input')
    expect(result).toBe('expected output')
  })

  it('devrait gérer les erreurs', () => {
    expect(() => maFonction(null)).toThrow('Error message')
  })
})
```

#### Tester des composants React

```typescript
// components/__tests__/MonComposant.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MonComposant } from '../MonComposant'

describe('MonComposant', () => {
  it('devrait afficher le contenu', () => {
    render(<MonComposant title="Test" />)
    expect(screen.getByText('Test')).toBeInTheDocument()
  })

  it('devrait gérer le clic', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()

    render(<MonComposant onClick={handleClick} />)

    await user.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledOnce()
  })
})
```

#### Mocking

```typescript
import { vi } from 'vitest'

// Mock une fonction
const mockFn = vi.fn()
mockFn.mockReturnValue('mocked value')

// Mock un module
vi.mock('@/lib/api', () => ({
  fetchData: vi.fn().mockResolvedValue({ data: 'test' })
}))

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    pathname: '/',
  }),
}))
```

### Configuration

Le fichier `vitest.config.ts` est déjà configuré :

```typescript
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',           // DOM API
    globals: true,                  // describe, it, expect sans import
    setupFiles: ['./vitest.setup.ts'], // Setup global
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),  // Support @/ imports
    },
  },
})
```

Le fichier `vitest.setup.ts` mock automatiquement :
- Next.js router (`useRouter`, `usePathname`, etc.)
- Next.js Image component
- IntersectionObserver (pour les composants avec scroll)

### Tests d'exemple

L'application inclut des tests d'exemple :

#### `lib/__tests__/client-logger.test.ts`

Tests pour le système de logging client :
- Messages d'erreur personnalisés (401, 404, 500, fetch, etc.)
- Création de logger avec contexte
- 11 tests, 100% passing

#### `components/__tests__/scroll-reveal.test.tsx`

Tests pour le composant d'animation au scroll :
- Rendu des children
- Application de className
- Classes de transition
- 4 tests, 100% passing

### Best Practices

#### 1. Nommer les tests clairement

```typescript
// ✅ Bon
it('should return error message for 404 status', () => {})

// ❌ Mauvais
it('works', () => {})
```

#### 2. Tester le comportement, pas l'implémentation

```typescript
// ✅ Bon - teste le comportement utilisateur
it('should display error message when form is invalid', async () => {
  const user = userEvent.setup()
  render(<LoginForm />)

  await user.click(screen.getByRole('button', { name: /submit/i }))

  expect(screen.getByText(/email is required/i)).toBeInTheDocument()
})

// ❌ Mauvais - teste les détails d'implémentation
it('should call setError when validation fails', () => {
  const setError = vi.fn()
  // ...
})
```

#### 3. Utiliser les bons selectors

Ordre de préférence (accessibilité) :

1. `getByRole` (meilleur)
2. `getByLabelText`
3. `getByPlaceholderText`
4. `getByText`
5. `getByTestId` (dernier recours)

```typescript
// ✅ Bon
screen.getByRole('button', { name: /submit/i })
screen.getByLabelText(/email/i)

// ❌ Éviter
screen.getByTestId('submit-button')
```

#### 4. Nettoyer après les tests

```typescript
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

afterEach(() => {
  cleanup()  // Déjà fait automatiquement dans vitest.setup.ts
})
```

---

## 🎭 Tests E2E avec Playwright

Voir le guide dédié : [tests/README.md](../tests/README.md)

**Tests inclus** :
- ✅ Admin Dashboard : Login, navigation, event creation
- ✅ Guest RSVP : Magic link, form submission, confirmation
- ✅ Email Preview : Template rendering, personalization

**Commandes** :

```bash
npm run test:e2e          # Lancer tous les tests
npm run test:e2e:ui       # Mode UI visuel
npm run test:e2e:debug    # Mode debug
npm run test:e2e:report   # Voir le rapport
```

---

## 📝 Logging Centralisé

### Architecture

L'application utilise un système de logging à 2 niveaux :

#### 1. Serveur (API Routes)

**Pino** pour le logging structuré JSON :

```typescript
// app/api/mon-endpoint/route.ts
import { logger } from '@/lib/logger'

export async function GET() {
  logger.info({ action: 'fetchData' }, 'Fetching data')

  try {
    const data = await fetchData()
    logger.info({ data }, 'Data fetched successfully')
    return Response.json(data)
  } catch (error) {
    logger.error({ error, action: 'fetchData' }, 'Failed to fetch data')
    throw error
  }
}
```

**Logs structurés** :

```json
{
  "level": "error",
  "time": 1699999999999,
  "msg": "Failed to fetch data",
  "action": "fetchData",
  "error": { "message": "...", "stack": "..." }
}
```

#### 2. Client (Components & Pages)

**Client Logger** avec intégration Sentry :

```typescript
// components/MonComposant.tsx
import { createClientLogger } from '@/lib/client-logger'

const logger = createClientLogger({ component: 'MonComposant' })

export function MonComposant() {
  const handleSubmit = async () => {
    try {
      await submitForm()
    } catch (error) {
      // Development : Console
      // Production : Sentry automatique
      logger.error(error, {
        action: 'submitForm',
        metadata: { formData }
      })

      // Message user-friendly
      toast.error(getUserErrorMessage(error))
    }
  }
}
```

### Coverage

#### Serveur (Pino)

✅ **16 API routes** migrées de `console.log` à Pino :
- `/api/admin/setup`
- `/api/admin/database-status`
- `/api/admin/seed`
- Etc.

#### Client (Client Logger + Sentry)

✅ **59 fichiers** avec logging centralisé :
- **20 composants** (`components/`)
- **39 pages** (`app/`)

Tous rapportent automatiquement à Sentry en production.

### Utilisation

#### Créer un logger

```typescript
import { createClientLogger } from '@/lib/client-logger'

const logger = createClientLogger({
  component: 'MyComponent',
  // Contexte par défaut optionnel
  action: 'defaultAction'
})
```

#### Logger une erreur

```typescript
try {
  await riskyOperation()
} catch (error) {
  logger.error(error, {
    action: 'riskyOperation',
    metadata: {
      userId: user.id,
      timestamp: Date.now()
    }
  })
}
```

#### Logger un warning

```typescript
if (quota > 80) {
  logger.warn('Approaching quota limit', {
    action: 'checkQuota',
    metadata: { quota, limit }
  })
}
```

#### Logger une info (dev only)

```typescript
logger.info('Data loaded', { count: data.length })
```

### Messages d'erreur user-friendly

Le helper `getUserErrorMessage()` convertit les erreurs techniques en messages compréhensibles :

```typescript
import { getUserErrorMessage } from '@/lib/client-logger'

try {
  await fetch('/api/data')
} catch (error) {
  logger.error(error, { action: 'fetchData' })

  // "Erreur de connexion. Veuillez vérifier votre connexion internet."
  toast.error(getUserErrorMessage(error))
}
```

**Messages automatiques** :
- `fetch` → "Erreur de connexion. Veuillez vérifier votre connexion internet."
- `401`/`403` → "Vous n'êtes pas autorisé à effectuer cette action."
- `404` → "Ressource non trouvée."
- `500` → "Erreur serveur. Veuillez réessayer plus tard."
- Autres → "Une erreur est survenue. Veuillez réessayer."

---

## 📊 Résumé des outils

| Outil | Usage | Environnement | Configuration requise |
|-------|-------|---------------|----------------------|
| **Sentry** | Error tracking | Production | Variables d'environnement |
| **Web Vitals** | Performance metrics | Production | Optionnel (Vercel Analytics) |
| **Vitest** | Unit tests | Development | Aucune (déjà configuré) |
| **Playwright** | E2E tests | Development/CI | Aucune (déjà configuré) |
| **Pino** | Server logging | Server | Aucune (déjà configuré) |
| **Client Logger** | Client logging | Client | Aucune (déjà configuré) |

---

## 🚀 Checklist Production

Avant de déployer en production :

### Monitoring

- [ ] Créer un compte Sentry
- [ ] Configurer `NEXT_PUBLIC_SENTRY_DSN` dans Vercel
- [ ] (Optionnel) Configurer `SENTRY_AUTH_TOKEN` pour source maps
- [ ] (Optionnel) Activer Vercel Analytics

### Tests

- [ ] Lancer `npm run test:run` (unit tests)
- [ ] Lancer `npm run test:e2e` (E2E tests)
- [ ] Vérifier que tous les tests passent

### Logs

- [ ] Vérifier que les logs serveur fonctionnent (Pino)
- [ ] Vérifier que les logs client fonctionnent (Console en dev)
- [ ] Tester une erreur et vérifier qu'elle apparaît dans Sentry

---

## 📚 Ressources

### Sentry

- [Documentation officielle](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Dashboard Sentry](https://sentry.io)
- [Best Practices](https://docs.sentry.io/platforms/javascript/best-practices/)

### Web Vitals

- [web.dev/vitals](https://web.dev/vitals/)
- [Vercel Analytics](https://vercel.com/docs/analytics)
- [Chrome DevTools Performance](https://developer.chrome.com/docs/devtools/performance/)

### Vitest

- [Documentation officielle](https://vitest.dev/)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Common mistakes](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

### Playwright

- [Documentation officielle](https://playwright.dev/)
- [Best Practices](https://playwright.dev/docs/best-practices)

---

## ❓ FAQ

### Sentry ne capture pas d'erreurs

1. Vérifiez que `NEXT_PUBLIC_SENTRY_DSN` est configuré
2. Vérifiez que l'environnement est `production` (pas `development`)
3. Vérifiez la console browser pour les erreurs Sentry
4. Testez manuellement : `throw new Error('Test Sentry')`

### Les Web Vitals ne s'affichent pas

1. Vérifiez que `<WebVitals />` est dans `app/layout.tsx`
2. Vérifiez la console browser (mode development)
3. Pour Vercel Analytics, vérifiez `NEXT_PUBLIC_VERCEL_ANALYTICS_ID`
4. Attendez quelques minutes (les métriques sont agrégées)

### Les tests unitaires échouent

1. Vérifiez que toutes les dépendances sont installées : `npm install`
2. Vérifiez qu'il n'y a pas d'imports manquants
3. Lancez avec `--reporter=verbose` pour plus de détails
4. Vérifiez les mocks dans `vitest.setup.ts`

### Comment ajouter un nouveau test ?

1. Créez `__tests__/` dans le dossier du code à tester
2. Créez `mon-fichier.test.ts` ou `mon-composant.test.tsx`
3. Importez `describe`, `it`, `expect` de vitest
4. Écrivez vos tests
5. Lancez `npm test`

---

**Dernière mise à jour** : 2025-11-15
