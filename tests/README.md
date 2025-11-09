# Tests End-to-End (E2E)

Ce projet utilise [Playwright](https://playwright.dev/) pour les tests end-to-end automatisés.

## Installation

Installer Playwright et ses navigateurs :

```bash
npm install
npx playwright install
```

## Exécution des tests

### Lancer tous les tests
```bash
npm run test:e2e
```

### Lancer les tests en mode UI interactif
```bash
npm run test:e2e:ui
```

### Lancer les tests avec les navigateurs visibles
```bash
npm run test:e2e:headed
```

### Déboguer un test spécifique
```bash
npm run test:e2e:debug
```

### Voir le rapport HTML des tests
```bash
npm run test:e2e:report
```

## Structure des tests

```
tests/
└── e2e/
    ├── guest-rsvp.spec.ts       # Tests du parcours RSVP invité
    ├── admin-dashboard.spec.ts   # Tests du dashboard admin
    └── email-preview.spec.ts     # Tests de la modal de prévisualisation
```

## Tests implémentés

### 1. Guest RSVP Flow (`guest-rsvp.spec.ts`)

Tests du parcours de réponse RSVP pour les invités :

- ✅ Affichage du formulaire RSVP avec barre de progression dynamique
- ✅ Navigation à travers les étapes adaptées à la configuration de l'événement
- ✅ Saut automatique des étapes désactivées
- ✅ Gestion de l'acceptation et du refus d'invitation
- ✅ Validation du comportement dynamique basé sur la config

**Points clés testés :**
- La barre de progression affiche uniquement les étapes actives
- Les étapes sont sautées selon la configuration (`allowPlusOnes`, `requireMeal`, etc.)
- L'utilisateur qui décline va directement au récapitulatif

### 2. Admin Dashboard (`admin-dashboard.spec.ts`)

Tests du tableau de bord administrateur :

- ✅ Affichage de l'état vide amélioré avec CTA principal
- ✅ Présence des 3 étapes explicatives
- ✅ CTA secondaire (démo) moins proéminent
- ✅ Navigation vers la création d'événement
- ✅ Affichage des statistiques quand des événements existent
- ✅ Fonction d'actualisation des données

**Points clés testés :**
- L'état vide guide l'utilisateur avec un CTA unique principal
- Le bouton de démo est en variante `ghost` (moins visible)
- Les stats s'affichent correctement quand il y a des données

### 3. Email Preview Modal (`email-preview.spec.ts`)

Tests de la modal de prévisualisation des emails :

- ✅ Ouverture de la modal depuis la liste des templates
- ✅ Extraction et affichage automatique des variables
- ✅ Modification en temps réel des variables
- ✅ Réinitialisation aux valeurs d'exemple
- ✅ Basculement entre mode desktop et mobile
- ✅ Basculement entre aperçu HTML et code source
- ✅ Mise à jour du sujet avec les variables

**Points clés testés :**
- Les variables sont automatiquement détectées (format `{{variable}}`)
- Les modifications se reflètent immédiatement dans l'aperçu
- Le mode mobile affiche correctement le responsive

## Configuration

La configuration Playwright se trouve dans `playwright.config.ts`.

### Navigateurs testés

- Chromium (Chrome/Edge)
- Firefox
- WebKit (Safari)
- Mobile Chrome (Pixel 5)
- Mobile Safari (iPhone 12)

### Paramètres importants

```typescript
{
  baseURL: 'http://localhost:3000',
  trace: 'on-first-retry',        // Trace en cas d'échec
  screenshot: 'only-on-failure',  // Screenshot sur échec
  video: 'retain-on-failure',     // Vidéo conservée sur échec
  webServer: {
    command: 'npm run dev',       // Lance le serveur auto
    url: 'http://localhost:3000',
    reuseExistingServer: true,
  }
}
```

## Bonnes pratiques

### 1. Mock des APIs

Les tests utilisent `page.route()` pour mocker les réponses des APIs :

```typescript
await page.route('**/api/guest/**', async route => {
  await route.fulfill({
    status: 200,
    body: JSON.stringify({ /* data */ })
  });
});
```

### 2. Attente des éléments

Utilisez `await expect().toBeVisible()` au lieu de `waitFor()` :

```typescript
// ✅ Bon
await expect(page.getByText('Welcome')).toBeVisible();

// ❌ Éviter
await page.waitForSelector('text=Welcome');
```

### 3. Sélecteurs

Privilégiez les sélecteurs sémantiques :

```typescript
// ✅ Bon
page.getByRole('button', { name: 'Submit' })
page.getByLabel('Email')
page.getByText('Welcome')

// ❌ Éviter
page.locator('.btn-submit')
page.locator('#email-input')
```

## Débogage

### Mode trace

Pour voir la trace d'un test en échec :

```bash
npx playwright show-trace trace.zip
```

### Mode debug

Pour déboguer un test spécifique :

```bash
npx playwright test --debug guest-rsvp.spec.ts
```

### Inspector

Pause le test et ouvre l'inspecteur :

```typescript
await page.pause();
```

## CI/CD

Les tests sont configurés pour s'exécuter en CI avec :

- Retry automatique (2 fois)
- Exécution séquentielle (workers: 1)
- Rapport GitHub Actions

## Extension future

Pour ajouter de nouveaux tests :

1. Créer un fichier `*.spec.ts` dans `tests/e2e/`
2. Importer `test` et `expect` de `@playwright/test`
3. Utiliser `test.describe()` pour grouper les tests
4. Mocker les APIs nécessaires
5. Tester les parcours utilisateurs

### Exemple de nouveau test

```typescript
import { test, expect } from '@playwright/test';

test.describe('New Feature', () => {
  test('should work as expected', async ({ page }) => {
    // Arrange
    await page.goto('/feature');

    // Act
    await page.getByRole('button').click();

    // Assert
    await expect(page.getByText('Success')).toBeVisible();
  });
});
```

## Ressources

- [Documentation Playwright](https://playwright.dev/)
- [Guide Best Practices](https://playwright.dev/docs/best-practices)
- [API Reference](https://playwright.dev/docs/api/class-playwright)
- [Sélecteurs](https://playwright.dev/docs/selectors)
