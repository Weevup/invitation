import { test, expect } from '@playwright/test';

/**
 * Tests E2E pour le parcours RSVP invité
 *
 * Ces tests vérifient le parcours complet d'un invité :
 * - Accès via lien d'invitation
 * - Navigation dans le formulaire RSVP dynamique
 * - Soumission de la réponse
 * - Affichage de la confirmation
 */

test.describe('Guest RSVP Flow', () => {

  test.beforeEach(async ({ page }) => {
    // Note: Dans un vrai test, vous devriez créer un invité de test
    // avec un token connu via une API de setup de test
  });

  test('should display RSVP form with dynamic steps', async ({ page }) => {
    // Simuler l'accès via un lien d'invitation
    // Dans un vrai test, utilisez un token de test réel
    const testToken = 'test-token-123';

    // Mock de l'API pour retourner des données de test
    await page.route('**/api/guest/**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          guest: {
            id: '1',
            firstName: 'Jean',
            lastName: 'Test',
            email: 'jean.test@example.com',
          },
          event: {
            id: '1',
            name: 'Événement Test',
            startsAt: new Date('2025-12-31T19:00:00Z').toISOString(),
            venueName: 'Salle Test',
            city: 'Paris',
            description: 'Un événement de test',
            maxPlusOnes: 2,
            allowPlusOnes: true,
            requireMeal: true,
            mealOptions: ['Menu Viande', 'Menu Végétarien'],
            enableTransport: true,
            enableLodging: true,
            enableAccessibility: true,
            enablePhotoConsent: true,
          }
        })
      });
    });

    await page.goto(`/guest/${testToken}`);

    // Vérifier que le formulaire RSVP s'affiche
    await expect(page.getByText('Bonjour Jean')).toBeVisible();
    await expect(page.getByText('Événement Test')).toBeVisible();

    // Vérifier que la barre de progression est visible
    await expect(page.getByText(/Étape/)).toBeVisible();
  });

  test('should navigate through RSVP steps dynamically', async ({ page }) => {
    // Mock de l'API
    await page.route('**/api/guest/**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          guest: {
            id: '1',
            firstName: 'Marie',
            lastName: 'Test',
            email: 'marie.test@example.com',
          },
          event: {
            id: '1',
            name: 'Gala Test',
            startsAt: new Date('2025-12-31T19:00:00Z').toISOString(),
            venueName: 'Grand Palais',
            city: 'Paris',
            maxPlusOnes: 1,
            allowPlusOnes: true,
            requireMeal: true,
            mealOptions: ['Menu Omnivore', 'Menu Végétarien', 'Menu Vegan'],
            enableTransport: false,
            enableLodging: false,
            enableAccessibility: false,
            enablePhotoConsent: true,
          }
        })
      });
    });

    await page.goto('/guest/test-token');

    // Étape 1: Réponse
    await page.getByLabel(/J'accepte avec plaisir/).click();
    await page.getByRole('button', { name: /Continuer/ }).click();

    // Étape 2: Accompagnants (doit être visible car allowPlusOnes = true)
    await expect(page.getByText(/Nombre d'accompagnants/)).toBeVisible();
    await page.getByRole('button', { name: /Continuer/ }).click();

    // Étape 3: Repas (doit être visible car requireMeal = true)
    await expect(page.getByText(/Choix de repas/)).toBeVisible();
    await page.getByRole('combobox').click();
    await page.getByRole('option', { name: 'Menu Végétarien' }).click();
    await page.getByRole('button', { name: /Continuer/ }).click();

    // Étape Infos pratiques devrait être SAUTÉE car tous les enables sont false
    // On devrait arriver directement au consentement

    // Étape Consentement
    await expect(page.getByText(/Consentements/)).toBeVisible();
    await page.getByRole('button', { name: /Continuer/ }).click();

    // Étape Récapitulatif
    await expect(page.getByText(/Récapitulatif/)).toBeVisible();
    await expect(page.getByText(/Participation.*Oui/)).toBeVisible();
  });

  test('should skip optional steps when not enabled', async ({ page }) => {
    // Configuration minimale : seulement la réponse
    await page.route('**/api/guest/**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          guest: {
            id: '1',
            firstName: 'Pierre',
            lastName: 'Test',
            email: 'pierre.test@example.com',
          },
          event: {
            id: '1',
            name: 'Événement Simple',
            startsAt: new Date('2025-12-31T19:00:00Z').toISOString(),
            venueName: 'Lieu',
            city: 'Paris',
            maxPlusOnes: 0,
            allowPlusOnes: false,      // Pas d'accompagnants
            requireMeal: false,          // Pas de repas
            mealOptions: [],
            enableTransport: false,      // Pas de transport
            enableLodging: false,        // Pas d'hébergement
            enableAccessibility: false,  // Pas d'accessibilité
            enablePhotoConsent: false,   // Pas de consentement photo
          }
        })
      });
    });

    await page.goto('/guest/test-token');

    // Étape 1: Réponse
    await page.getByLabel(/J'accepte avec plaisir/).click();
    await page.getByRole('button', { name: /Continuer/ }).click();

    // Devrait aller DIRECTEMENT au récapitulatif car toutes les étapes sont désactivées
    await expect(page.getByText(/Récapitulatif/)).toBeVisible({ timeout: 5000 });
  });

  test('should handle declining invitation', async ({ page }) => {
    await page.route('**/api/guest/**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          guest: {
            id: '1',
            firstName: 'Sophie',
            lastName: 'Test',
            email: 'sophie.test@example.com',
          },
          event: {
            id: '1',
            name: 'Événement Test',
            startsAt: new Date('2025-12-31T19:00:00Z').toISOString(),
            venueName: 'Lieu',
            city: 'Paris',
            maxPlusOnes: 1,
            allowPlusOnes: true,
            requireMeal: true,
            mealOptions: ['Menu A'],
            enableTransport: true,
            enableLodging: true,
            enableAccessibility: true,
            enablePhotoConsent: true,
          }
        })
      });
    });

    await page.goto('/guest/test-token');

    // Décliner l'invitation
    await page.getByLabel(/Je ne peux malheureusement pas venir/).click();
    await page.getByRole('button', { name: /Continuer/ }).click();

    // Devrait aller directement au récapitulatif en sautant toutes les étapes intermédiaires
    await expect(page.getByText(/Récapitulatif/)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/Participation.*Non/)).toBeVisible();
  });
});
