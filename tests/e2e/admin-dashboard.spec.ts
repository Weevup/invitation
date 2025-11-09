import { test, expect } from '@playwright/test';

/**
 * Tests E2E pour le dashboard administrateur
 *
 * Ces tests vérifient :
 * - Affichage de l'état vide avec CTA principal
 * - Navigation vers la création d'événement
 * - Affichage des statistiques
 */

test.describe('Admin Dashboard', () => {

  test('should display empty state with single prominent CTA', async ({ page }) => {
    // Mock des APIs pour retourner un dashboard vide
    await page.route('**/api/admin/events', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    });

    await page.route('**/api/admin/dashboard/stats', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          overview: {
            totalEvents: 0,
            upcomingEvents: 0,
            pastEvents: 0,
            todayEvents: 0,
            totalGuests: 0,
            totalRsvps: 0,
            responseRate: 0,
            confirmedRsvps: 0,
            pendingRsvps: 0,
          },
          email: {
            totalSent: 0,
            openRate: 0,
            clickRate: 0,
            activeIntegrations: 0,
            activeTemplates: 0,
          },
          recentActivity: [],
          topEvents: [],
        })
      });
    });

    await page.goto('/admin');

    // Vérifier le titre du dashboard
    await expect(page.getByText('Tableau de bord')).toBeVisible();

    // Vérifier l'état vide amélioré
    await expect(page.getByText(/Bienvenue sur votre dashboard/)).toBeVisible();
    await expect(page.getByText(/Commencez par créer votre premier événement/)).toBeVisible();

    // Vérifier les 3 étapes
    await expect(page.getByText(/Créez votre événement/)).toBeVisible();
    await expect(page.getByText(/Invitez vos participants/)).toBeVisible();
    await expect(page.getByText(/Suivez les réponses/)).toBeVisible();

    // Vérifier le CTA principal
    const mainCTA = page.getByRole('link', { name: /Créer mon premier événement/ });
    await expect(mainCTA).toBeVisible();

    // Vérifier que le CTA a les bonnes classes (gradient, shadow, etc.)
    await expect(mainCTA.locator('button')).toHaveClass(/bg-gradient-to-r/);

    // Vérifier que l'action secondaire (démo) est moins proéminente
    const demoCTA = page.getByRole('button', { name: /Charger un événement de démonstration/ });
    await expect(demoCTA).toBeVisible();
    await expect(demoCTA).toHaveClass(/variant-ghost/); // Variante ghost pour moins d'emphase
  });

  test('should navigate to create event from empty state', async ({ page }) => {
    await page.route('**/api/admin/events', async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify([])
      });
    });

    await page.route('**/api/admin/dashboard/stats', async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          overview: {
            totalEvents: 0,
            upcomingEvents: 0,
            pastEvents: 0,
            todayEvents: 0,
            totalGuests: 0,
            totalRsvps: 0,
            responseRate: 0,
            confirmedRsvps: 0,
            pendingRsvps: 0,
          },
          email: {
            totalSent: 0,
            openRate: 0,
            clickRate: 0,
            activeIntegrations: 0,
            activeTemplates: 0,
          },
          recentActivity: [],
          topEvents: [],
        })
      });
    });

    await page.goto('/admin');

    // Cliquer sur le CTA principal
    await page.getByRole('link', { name: /Créer mon premier événement/ }).click();

    // Vérifier la redirection vers la page de création
    await expect(page).toHaveURL(/\/admin\/events\/new/);
  });

  test('should display stats when events exist', async ({ page }) => {
    // Mock avec des données
    await page.route('**/api/admin/events', async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify([
          {
            id: '1',
            name: 'Tech Summit 2025',
            startsAt: new Date('2025-09-15T09:00:00Z').toISOString(),
            venueName: 'Station F',
            city: 'Paris',
            _count: {
              guests: 50,
              rsvps: 35
            }
          },
          {
            id: '2',
            name: 'Workshop Innovation',
            startsAt: new Date('2025-10-20T14:00:00Z').toISOString(),
            venueName: 'Le Cargo',
            city: 'Lyon',
            _count: {
              guests: 30,
              rsvps: 28
            }
          }
        ])
      });
    });

    await page.route('**/api/admin/dashboard/stats', async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          overview: {
            totalEvents: 2,
            upcomingEvents: 2,
            pastEvents: 0,
            todayEvents: 0,
            totalGuests: 80,
            totalRsvps: 63,
            responseRate: 78.75,
            confirmedRsvps: 55,
            pendingRsvps: 17,
          },
          email: {
            totalSent: 150,
            openRate: 65.5,
            clickRate: 42.3,
            activeIntegrations: 1,
            activeTemplates: 3,
          },
          recentActivity: [
            {
              id: '1',
              guestName: 'Marie Dupont',
              eventName: 'Tech Summit 2025',
              status: 'CONFIRMED',
              createdAt: new Date().toISOString()
            }
          ],
          topEvents: [
            {
              id: '1',
              name: 'Tech Summit 2025',
              guests: 50,
              rsvps: 35,
              responseRate: 70
            }
          ],
        })
      });
    });

    await page.goto('/admin');

    // Vérifier que les stats s'affichent
    await expect(page.getByText('2')).toBeVisible(); // Total events
    await expect(page.getByText('80')).toBeVisible(); // Total guests

    // Vérifier que les événements sont listés
    await expect(page.getByText('Tech Summit 2025')).toBeVisible();
    await expect(page.getByText('Workshop Innovation')).toBeVisible();

    // L'état vide ne devrait PAS être visible
    await expect(page.getByText(/Créer mon premier événement/)).not.toBeVisible();
  });

  test('should allow refreshing dashboard data', async ({ page }) => {
    let requestCount = 0;

    await page.route('**/api/admin/events', async route => {
      requestCount++;
      await route.fulfill({
        status: 200,
        body: JSON.stringify([])
      });
    });

    await page.route('**/api/admin/dashboard/stats', async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          overview: {
            totalEvents: 0,
            upcomingEvents: 0,
            pastEvents: 0,
            todayEvents: 0,
            totalGuests: 0,
            totalRsvps: 0,
            responseRate: 0,
            confirmedRsvps: 0,
            pendingRsvps: 0,
          },
          email: {
            totalSent: 0,
            openRate: 0,
            clickRate: 0,
            activeIntegrations: 0,
            activeTemplates: 0,
          },
          recentActivity: [],
          topEvents: [],
        })
      });
    });

    await page.goto('/admin');

    const initialRequests = requestCount;

    // Cliquer sur le bouton Actualiser
    await page.getByRole('button', { name: /Actualiser/ }).click();

    // Vérifier qu'une nouvelle requête a été faite
    await expect.poll(() => requestCount).toBeGreaterThan(initialRequests);
  });
});
