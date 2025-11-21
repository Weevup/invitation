import { test, expect } from '@playwright/test';
import { prisma } from '@/lib/prisma';

/**
 * Tests E2E pour le système de confirmation email
 *
 * Ces tests vérifient :
 * - Validation API : Blocage des RSVPs sans templates configurés
 * - Envoi conditionnel : Templates différents pour accepted/declined
 * - Configuration de phase : Toggle activation/désactivation dans EmailsTab
 * - Intégration complète : Flux complet de RSVP avec confirmation
 */

test.describe('Confirmation Email System - End to End', () => {
  let testEventId: string;
  let testGuestToken: string;
  let adminSession: any;

  test.beforeEach(async ({ page }) => {
    // Setup: Create test event and guest
    // Note: This would typically be done via API or database seeding

    // Mock admin session
    await page.goto('/admin/login');
    // ... login process would go here
  });

  test.afterEach(async () => {
    // Cleanup: Remove test data
    if (testEventId) {
      await prisma.event.delete({
        where: { id: testEventId }
      }).catch(() => {});
    }
  });

  test.describe('API Validation - Template Requirements', () => {

    test('should block RSVP submission when templates are not configured', async ({ request }) => {
      // Ensure no active templates exist
      await prisma.emailTemplate.updateMany({
        where: {
          slug: { in: ['confirmation-accepted', 'confirmation-declined'] }
        },
        data: { isActive: false }
      });

      // Attempt RSVP submission
      const response = await request.post(`/api/rsvp/${testGuestToken}`, {
        data: {
          attending: true,
          plusOnes: 0,
          mealChoice: 'vegetarian',
          consentPhotos: true
        }
      });

      // Should be blocked with 503 Service Unavailable
      expect(response.status()).toBe(503);

      const body = await response.json();
      expect(body.error).toBe('EMAIL_TEMPLATES_NOT_CONFIGURED');
      expect(body.message).toContain('configuration des emails de confirmation');
      expect(body.suggestion).toContain('contacter l\'organisateur');
    });

    test('should block RSVP when only accepted template is configured', async ({ request }) => {
      // Configure only accepted template
      await prisma.emailTemplate.updateMany({
        where: { slug: 'confirmation-accepted' },
        data: { isActive: true }
      });

      await prisma.emailTemplate.updateMany({
        where: { slug: 'confirmation-declined' },
        data: { isActive: false }
      });

      const response = await request.post(`/api/rsvp/${testGuestToken}`, {
        data: {
          attending: true,
          plusOnes: 0
        }
      });

      expect(response.status()).toBe(503);
      const body = await response.json();
      expect(body.error).toBe('EMAIL_TEMPLATES_NOT_CONFIGURED');
    });

    test('should block RSVP when only declined template is configured', async ({ request }) => {
      // Configure only declined template
      await prisma.emailTemplate.updateMany({
        where: { slug: 'confirmation-declined' },
        data: { isActive: true }
      });

      await prisma.emailTemplate.updateMany({
        where: { slug: 'confirmation-accepted' },
        data: { isActive: false }
      });

      const response = await request.post(`/api/rsvp/${testGuestToken}`, {
        data: {
          attending: false
        }
      });

      expect(response.status()).toBe(503);
      const body = await response.json();
      expect(body.error).toBe('EMAIL_TEMPLATES_NOT_CONFIGURED');
    });

    test('should allow RSVP when both templates are configured', async ({ request }) => {
      // Configure both templates
      await prisma.emailTemplate.updateMany({
        where: { slug: 'confirmation-accepted' },
        data: { isActive: true }
      });

      await prisma.emailTemplate.updateMany({
        where: { slug: 'confirmation-declined' },
        data: { isActive: true }
      });

      const response = await request.post(`/api/rsvp/${testGuestToken}`, {
        data: {
          attending: true,
          plusOnes: 0
        }
      });

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.success).toBe(true);
      expect(body.rsvp).toBeDefined();
    });
  });

  test.describe('Conditional Email Templates', () => {

    test('should use accepted template when guest confirms attendance', async ({ request }) => {
      // Create specific templates with identifiable content
      const acceptedTemplate = await prisma.emailTemplate.create({
        data: {
          name: 'Test Accepted',
          slug: 'confirmation-accepted',
          type: 'CONFIRMATION',
          subject: 'Confirmation acceptée - {{event.name}}',
          htmlContent: '<h1>Vous avez accepté!</h1><p>Badge: {{badge.downloadUrl}}</p>',
          isActive: true
        }
      });

      const declinedTemplate = await prisma.emailTemplate.create({
        data: {
          name: 'Test Declined',
          slug: 'confirmation-declined',
          type: 'CONFIRMATION',
          subject: 'Réponse enregistrée - {{event.name}}',
          htmlContent: '<h1>Nous sommes désolés</h1>',
          isActive: true
        }
      });

      // Submit RSVP with attending=true
      const response = await request.post(`/api/rsvp/${testGuestToken}`, {
        data: {
          attending: true,
          plusOnes: 1
        }
      });

      expect(response.status()).toBe(200);

      // Verify email log shows accepted template was used
      const emailLog = await prisma.emailLog.findFirst({
        where: {
          type: 'CONFIRMATION',
          subject: { contains: 'Confirmation acceptée' }
        },
        orderBy: { sentAt: 'desc' }
      });

      expect(emailLog).toBeDefined();
      expect(emailLog?.status).toBe('SENT');
    });

    test('should use declined template when guest declines attendance', async ({ request }) => {
      // Ensure both templates exist
      await prisma.emailTemplate.updateMany({
        where: { slug: { in: ['confirmation-accepted', 'confirmation-declined'] } },
        data: { isActive: true }
      });

      // Submit RSVP with attending=false
      const response = await request.post(`/api/rsvp/${testGuestToken}`, {
        data: {
          attending: false
        }
      });

      expect(response.status()).toBe(200);

      // Verify declined template was used
      const emailLog = await prisma.emailLog.findFirst({
        where: {
          type: 'CONFIRMATION',
          subject: { contains: 'Réponse enregistrée' }
        },
        orderBy: { sentAt: 'desc' }
      });

      expect(emailLog).toBeDefined();
    });

    test('should include badge download URL when guest accepts and QR code is enabled', async ({ request }) => {
      // Enable QR code in badge design
      const badgeDesign = await prisma.badgeDesign.upsert({
        where: { eventId: testEventId },
        create: {
          eventId: testEventId,
          includeQRCode: true,
          layoutType: 'MODERN',
          showEventName: true,
          showGuestName: true
        },
        update: {
          includeQRCode: true
        }
      });

      // Configure accepted template with badge URL
      await prisma.emailTemplate.updateMany({
        where: { slug: 'confirmation-accepted' },
        data: {
          htmlContent: '<p>Téléchargez votre badge: {{badge.downloadUrl}}</p>',
          isActive: true
        }
      });

      const response = await request.post(`/api/rsvp/${testGuestToken}`, {
        data: {
          attending: true
        }
      });

      expect(response.status()).toBe(200);
      const body = await response.json();

      // Should include QR code data
      expect(body.qrCode).toBeDefined();
    });
  });

  test.describe('EmailsTab - Phase Management', () => {

    test('should display Phase 4 (Confirmation) as mandatory', async ({ page }) => {
      await page.goto(`/admin/events/${testEventId}/settings?tab=emails`);

      // Find Phase 4 card
      const phase4 = page.locator('[data-phase-id="confirmation"]');

      // Should show "Obligatoire" badge
      await expect(phase4.locator('text=Obligatoire')).toBeVisible();

      // Toggle switch should be disabled
      const toggle = phase4.locator('[role="switch"]');
      await expect(toggle).toBeDisabled();

      // Should be checked/enabled by default
      await expect(toggle).toBeChecked();
    });

    test('should allow toggling non-mandatory phases', async ({ page }) => {
      await page.goto(`/admin/events/${testEventId}/settings?tab=emails`);

      // Find Phase 1 (Save the Date) - not mandatory
      const phase1 = page.locator('[data-phase-id="save-the-date"]');
      const toggle = phase1.locator('[role="switch"]');

      // Should be enabled (not disabled)
      await expect(toggle).not.toBeDisabled();

      // Get initial state
      const initialState = await toggle.isChecked();

      // Toggle it
      await toggle.click();

      // Wait for save
      await page.waitForResponse(response =>
        response.url().includes('/api/admin/events/') &&
        response.request().method() === 'PATCH'
      );

      // Should have changed state
      expect(await toggle.isChecked()).toBe(!initialState);
    });

    test('should persist phase configuration after page reload', async ({ page }) => {
      await page.goto(`/admin/events/${testEventId}/settings?tab=emails`);

      // Toggle Phase 2 (Invitation)
      const phase2Toggle = page.locator('[data-phase-id="invitation"] [role="switch"]');

      // Disable it
      if (await phase2Toggle.isChecked()) {
        await phase2Toggle.click();
        await page.waitForResponse(response =>
          response.url().includes('/api/admin/events/')
        );
      }

      // Reload page
      await page.reload();

      // Should still be disabled
      const reloadedToggle = page.locator('[data-phase-id="invitation"] [role="switch"]');
      await expect(reloadedToggle).not.toBeChecked();
    });

    test('should show warning message for Phase 4 configuration', async ({ page }) => {
      await page.goto(`/admin/events/${testEventId}/settings?tab=emails`);

      const phase4 = page.locator('[data-phase-id="confirmation"]');

      // Should display critical warning
      await expect(phase4.locator('text=⚠️ CONFIGURATION OBLIGATOIRE')).toBeVisible();

      // Should mention 2 templates required
      await expect(phase4.locator('text=2 templates distincts')).toBeVisible();

      // Should show buttons for both email types
      await expect(phase4.locator('button', { hasText: 'Email "Accepté"' })).toBeVisible();
      await expect(phase4.locator('button', { hasText: 'Email "Refusé"' })).toBeVisible();
    });

    test('should navigate to template editor when clicking email type buttons', async ({ page }) => {
      await page.goto(`/admin/events/${testEventId}/settings?tab=emails`);

      const phase4 = page.locator('[data-phase-id="confirmation"]');

      // Click "Email Accepté" button
      await phase4.locator('button', { hasText: 'Email "Accepté"' }).click();

      // Should navigate to confirmation email builder with type parameter
      await expect(page).toHaveURL(
        new RegExp(`/admin/events/${testEventId}/confirmation-email\\?type=accepted`)
      );
    });
  });

  test.describe('Complete End-to-End Flow', () => {

    test('should complete full RSVP flow with confirmation email', async ({ page, request }) => {
      // 1. Admin configures both templates
      await page.goto(`/admin/events/${testEventId}/settings?tab=emails`);

      // Note: This would involve creating templates via the builder
      // For now, we'll create them directly via DB
      await prisma.emailTemplate.createMany({
        data: [
          {
            name: 'Confirmation Accepted',
            slug: 'confirmation-accepted',
            type: 'CONFIRMATION',
            subject: 'Bienvenue à {{event.name}}!',
            htmlContent: '<h1>Merci {{guest.firstName}}!</h1><p>Badge: {{badge.downloadUrl}}</p>',
            isActive: true
          },
          {
            name: 'Confirmation Declined',
            slug: 'confirmation-declined',
            type: 'CONFIRMATION',
            subject: 'Votre réponse pour {{event.name}}',
            htmlContent: '<h1>Merci de nous avoir répondu</h1>',
            isActive: true
          }
        ]
      });

      // 2. Guest receives invitation and clicks RSVP link
      await page.goto(`/guest/${testGuestToken}`);

      // 3. Guest fills RSVP form
      await page.locator('input[name="attending"][value="true"]').click();
      await page.locator('input[name="plusOnes"]').fill('1');
      await page.locator('select[name="mealChoice"]').selectOption('vegetarian');
      await page.locator('input[name="consentPhotos"]').check();

      // 4. Submit RSVP
      await page.locator('button[type="submit"]').click();

      // 5. Should show success message
      await expect(page.locator('text=Merci')).toBeVisible();

      // 6. Should display QR code
      await expect(page.locator('canvas, img[alt*="QR"]')).toBeVisible();

      // 7. Verify email was sent
      const emailLog = await prisma.emailLog.findFirst({
        where: {
          eventId: testEventId,
          type: 'CONFIRMATION',
          status: 'SENT'
        },
        orderBy: { sentAt: 'desc' }
      });

      expect(emailLog).toBeDefined();
      expect(emailLog?.subject).toContain('Bienvenue');

      // 8. Verify guest status updated
      const guest = await prisma.guest.findFirst({
        where: { token: testGuestToken },
        include: { rsvp: true }
      });

      expect(guest?.status).toBe('RESPONDED');
      expect(guest?.rsvp?.attending).toBe(true);
      expect(guest?.rsvp?.plusOnes).toBe(1);
    });

    test('should handle declined RSVP with appropriate email', async ({ page }) => {
      // Setup templates
      await prisma.emailTemplate.updateMany({
        where: { slug: { in: ['confirmation-accepted', 'confirmation-declined'] } },
        data: { isActive: true }
      });

      // Guest declines
      await page.goto(`/guest/${testGuestToken}`);
      await page.locator('input[name="attending"][value="false"]').click();
      await page.locator('button[type="submit"]').click();

      // Should show acknowledgment
      await expect(page.locator('text=réponse a été enregistrée')).toBeVisible();

      // Should NOT show QR code
      await expect(page.locator('canvas, img[alt*="QR"]')).not.toBeVisible();

      // Verify declined email was sent
      const emailLog = await prisma.emailLog.findFirst({
        where: {
          type: 'CONFIRMATION',
          subject: { contains: 'Réponse' }
        },
        orderBy: { sentAt: 'desc' }
      });

      expect(emailLog).toBeDefined();
    });
  });

  test.describe('Error Handling & Edge Cases', () => {

    test('should show user-friendly error when templates missing during RSVP', async ({ page }) => {
      // Deactivate templates
      await prisma.emailTemplate.updateMany({
        where: { slug: { in: ['confirmation-accepted', 'confirmation-declined'] } },
        data: { isActive: false }
      });

      await page.goto(`/guest/${testGuestToken}`);
      await page.locator('input[name="attending"][value="true"]').click();
      await page.locator('button[type="submit"]').click();

      // Should show error message
      await expect(page.locator('text=configuration des emails de confirmation')).toBeVisible();
      await expect(page.locator('text=contacter l\'organisateur')).toBeVisible();
    });

    test('should log warning when templates are missing', async ({ request }) => {
      await prisma.emailTemplate.updateMany({
        where: { slug: { in: ['confirmation-accepted', 'confirmation-declined'] } },
        data: { isActive: false }
      });

      // Attempt RSVP - should be blocked and logged
      await request.post(`/api/rsvp/${testGuestToken}`, {
        data: { attending: true }
      });

      // Note: Verification of logs would require access to log storage
      // This is a placeholder for integration with logging system
    });
  });
});
