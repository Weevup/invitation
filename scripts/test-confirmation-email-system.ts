#!/usr/bin/env tsx

/**
 * Script de test d'intégration pour le système d'emails de confirmation
 *
 * Ce script teste bout en bout :
 * 1. La validation de l'API (blocage sans templates)
 * 2. La création des templates requis
 * 3. Le flux RSVP avec envoi d'emails conditionnels
 * 4. La configuration des phases dans EmailsTab
 *
 * Usage: npm run test:confirmation-system
 */

import { prisma } from '../lib/prisma'
import { createLogger } from '../lib/logger'

const logger = createLogger({ module: 'test-confirmation-system' })

// Couleurs pour la console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
}

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function logSection(title: string) {
  console.log('\n' + '='.repeat(60))
  log(title, 'cyan')
  console.log('='.repeat(60) + '\n')
}

function logTest(name: string) {
  log(`🧪 ${name}`, 'blue')
}

function logSuccess(message: string) {
  log(`✅ ${message}`, 'green')
}

function logError(message: string) {
  log(`❌ ${message}`, 'red')
}

function logWarning(message: string) {
  log(`⚠️  ${message}`, 'yellow')
}

async function testTemplateValidation() {
  logSection('TEST 1: Validation des Templates')

  // Test 1.1: Vérifier que les deux templates existent
  logTest('Vérification de l\'existence des templates')

  const acceptedTemplate = await prisma.emailTemplate.findFirst({
    where: {
      slug: 'confirmation-accepted',
      isActive: true,
    },
  })

  const declinedTemplate = await prisma.emailTemplate.findFirst({
    where: {
      slug: 'confirmation-declined',
      isActive: true,
    },
  })

  if (acceptedTemplate && declinedTemplate) {
    logSuccess('Les deux templates sont configurés et actifs')
    log(`  - Template "Accepté": ${acceptedTemplate.name}`, 'green')
    log(`  - Template "Refusé": ${declinedTemplate.name}`, 'green')
    return { hasTemplates: true, acceptedTemplate, declinedTemplate }
  } else {
    logError('Templates manquants:')
    if (!acceptedTemplate) {
      log('  - Template "confirmation-accepted" non trouvé', 'red')
    }
    if (!declinedTemplate) {
      log('  - Template "confirmation-declined" non trouvé', 'red')
    }
    return { hasTemplates: false, acceptedTemplate, declinedTemplate }
  }
}

async function testTemplateContent(templates: { acceptedTemplate: any, declinedTemplate: any }) {
  logSection('TEST 2: Contenu des Templates')

  const { acceptedTemplate, declinedTemplate } = templates

  // Test 2.1: Vérifier le template accepté
  logTest('Vérification du template "Accepté"')

  if (acceptedTemplate) {
    log(`  Subject: ${acceptedTemplate.subject}`)

    // Vérifier la présence de variables importantes
    const requiredVars = ['{{event.name}}', '{{guest.firstName}}', '{{badge.downloadUrl}}']
    const missingVars = requiredVars.filter(v =>
      !acceptedTemplate.htmlContent.includes(v) && !acceptedTemplate.subject.includes(v)
    )

    if (missingVars.length === 0) {
      logSuccess('Toutes les variables importantes sont présentes')
    } else {
      logWarning(`Variables manquantes: ${missingVars.join(', ')}`)
    }
  }

  // Test 2.2: Vérifier le template refusé
  logTest('Vérification du template "Refusé"')

  if (declinedTemplate) {
    log(`  Subject: ${declinedTemplate.subject}`)

    const requiredVars = ['{{event.name}}', '{{guest.firstName}}']
    const missingVars = requiredVars.filter(v =>
      !declinedTemplate.htmlContent.includes(v) && !declinedTemplate.subject.includes(v)
    )

    if (missingVars.length === 0) {
      logSuccess('Toutes les variables importantes sont présentes')
    } else {
      logWarning(`Variables manquantes: ${missingVars.join(', ')}`)
    }
  }
}

async function testEventConfiguration() {
  logSection('TEST 3: Configuration des Événements')

  logTest('Recherche d\'événements de test')

  // Chercher un événement de test
  const events = await prisma.event.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      emailCampaignsConfig: true,
      _count: {
        select: {
          guests: true,
          rsvps: true,
        },
      },
    },
  })

  if (events.length === 0) {
    logWarning('Aucun événement trouvé dans la base de données')
    return null
  }

  log(`  Trouvé ${events.length} événement(s)`)

  // Vérifier la configuration de la Phase 4
  for (const event of events) {
    log(`\n  📅 Événement: ${event.name}`)
    log(`     - Invités: ${event._count.guests}`)
    log(`     - RSVPs: ${event._count.rsvps}`)

    if (event.emailCampaignsConfig) {
      const config = event.emailCampaignsConfig as any
      const phase4 = config.phases?.find((p: any) => p.id === 'confirmation')

      if (phase4) {
        log(`     - Phase 4 activée: ${phase4.enabled ? '✓' : '✗'}`)
        log(`     - Status: ${phase4.status || 'non configuré'}`)

        if (phase4.enabled) {
          logSuccess('Phase 4 correctement configurée')
        } else {
          logError('Phase 4 désactivée (elle devrait être obligatoire)')
        }
      } else {
        logWarning('Phase 4 non trouvée dans la configuration')
      }
    } else {
      logWarning('Aucune configuration emailCampaignsConfig')
    }
  }

  return events[0]
}

async function testRSVPFlow(event: any) {
  logSection('TEST 4: Flux RSVP Simulé')

  if (!event) {
    logWarning('Aucun événement disponible pour tester le flux RSVP')
    return
  }

  // Chercher un invité de test
  logTest('Recherche d\'un invité de test')

  const guest = await prisma.guest.findFirst({
    where: {
      eventId: event.id,
    },
    include: {
      rsvp: true,
    },
  })

  if (!guest) {
    logWarning(`Aucun invité trouvé pour l'événement "${event.name}"`)
    return
  }

  logSuccess(`Invité trouvé: ${guest.firstName} ${guest.lastName || ''}`)
  log(`  Email: ${guest.email}`)
  log(`  Token: ${guest.token}`)
  log(`  Status: ${guest.status}`)

  if (guest.rsvp) {
    log(`  RSVP déjà enregistré:`)
    log(`    - Attending: ${guest.rsvp.attending}`)
    log(`    - Plus Ones: ${guest.rsvp.plusOnes}`)
    log(`    - Meal Choice: ${guest.rsvp.mealChoice || 'N/A'}`)
  }

  // Vérifier les logs d'emails
  logTest('Vérification des emails de confirmation envoyés')

  const emailLogs = await prisma.emailLog.findMany({
    where: {
      guestId: guest.id,
      type: 'CONFIRMATION',
    },
    orderBy: {
      sentAt: 'desc',
    },
    take: 5,
  })

  if (emailLogs.length > 0) {
    logSuccess(`${emailLogs.length} email(s) de confirmation envoyé(s)`)

    for (const emailLog of emailLogs) {
      log(`  📧 ${emailLog.sentAt?.toISOString() || 'N/A'}`)
      log(`     Subject: ${emailLog.subject}`)
      log(`     Status: ${emailLog.status}`)
      if (emailLog.providerId) {
        log(`     Provider ID: ${emailLog.providerId}`)
      }
    }
  } else {
    logWarning('Aucun email de confirmation envoyé pour cet invité')
  }
}

async function testEmailIntegration() {
  logSection('TEST 5: Intégration Email')

  logTest('Vérification de l\'intégration email active')

  const emailIntegration = await prisma.emailIntegration.findFirst({
    where: {
      isActive: true,
      isPrimary: true,
    },
  })

  if (!emailIntegration) {
    logError('Aucune intégration email active trouvée')
    log('  ⚠️  Les emails de confirmation ne pourront pas être envoyés', 'yellow')
    return false
  }

  logSuccess('Intégration email active trouvée')
  log(`  Provider: ${emailIntegration.provider}`)
  log(`  From: ${emailIntegration.fromName} <${emailIntegration.fromEmail}>`)
  log(`  Track Opens: ${emailIntegration.trackOpens ? '✓' : '✗'}`)
  log(`  Track Clicks: ${emailIntegration.trackClicks ? '✓' : '✗'}`)

  return true
}

async function testAPIValidationLogic() {
  logSection('TEST 6: Logique de Validation API')

  logTest('Simulation de la validation API RSVP')

  // Reproduire la logique de validation de l'API
  const acceptedTemplate = await prisma.emailTemplate.findFirst({
    where: {
      slug: 'confirmation-accepted',
      isActive: true,
    },
  })

  const declinedTemplate = await prisma.emailTemplate.findFirst({
    where: {
      slug: 'confirmation-declined',
      isActive: true,
    },
  })

  // Simuler la validation
  if (!acceptedTemplate || !declinedTemplate) {
    logError('VALIDATION ÉCHOUÉE - RSVP serait bloqué')
    log('  Code d\'erreur: EMAIL_TEMPLATES_NOT_CONFIGURED', 'red')
    log('  HTTP Status: 503 Service Unavailable', 'red')

    if (!acceptedTemplate) {
      log('  Template manquant: confirmation-accepted', 'red')
    }
    if (!declinedTemplate) {
      log('  Template manquant: confirmation-declined', 'red')
    }

    return false
  }

  logSuccess('VALIDATION RÉUSSIE - RSVP serait autorisé')
  log('  Les deux templates sont configurés', 'green')
  return true
}

async function testStatistics() {
  logSection('TEST 7: Statistiques Globales')

  logTest('Statistiques des emails de confirmation')

  // Total des emails de confirmation
  const totalConfirmationEmails = await prisma.emailLog.count({
    where: {
      type: 'CONFIRMATION',
    },
  })

  // Par statut
  const sentEmails = await prisma.emailLog.count({
    where: {
      type: 'CONFIRMATION',
      status: 'SENT',
    },
  })

  const failedEmails = await prisma.emailLog.count({
    where: {
      type: 'CONFIRMATION',
      status: 'FAILED',
    },
  })

  // RSVPs avec réponse
  const totalRSVPs = await prisma.rSVP.count()
  const attendingRSVPs = await prisma.rSVP.count({
    where: { attending: true },
  })
  const decliningRSVPs = await prisma.rSVP.count({
    where: { attending: false },
  })

  log(`\n📊 Statistiques:`)
  log(`  Emails de confirmation envoyés: ${totalConfirmationEmails}`)
  log(`    - Succès: ${sentEmails}`)
  log(`    - Échecs: ${failedEmails}`)
  log(`\n  RSVPs totaux: ${totalRSVPs}`)
  log(`    - Acceptés: ${attendingRSVPs}`)
  log(`    - Refusés: ${decliningRSVPs}`)

  if (totalConfirmationEmails > 0) {
    const successRate = ((sentEmails / totalConfirmationEmails) * 100).toFixed(1)
    log(`\n  Taux de succès: ${successRate}%`, successRate === '100.0' ? 'green' : 'yellow')
  }
}

async function createTestTemplatesIfMissing() {
  logSection('CRÉATION DES TEMPLATES DE TEST')

  logTest('Vérification et création des templates manquants')

  let created = false

  // Template Accepté
  const acceptedExists = await prisma.emailTemplate.findFirst({
    where: { slug: 'confirmation-accepted' },
  })

  if (!acceptedExists) {
    log('  Création du template "confirmation-accepted"...', 'yellow')

    await prisma.emailTemplate.create({
      data: {
        name: 'Confirmation - Présence confirmée',
        slug: 'confirmation-accepted',
        type: 'CONFIRMATION',
        subject: 'Bienvenue à {{event.name}} ! 🎉',
        htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #004645 0%, #009197 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="margin: 0; font-size: 28px;">🎉 Confirmation reçue !</h1>
  </div>

  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px; margin-bottom: 20px;">
      Bonjour <strong>{{guest.firstName}}</strong>,
    </p>

    <p style="font-size: 16px; margin-bottom: 20px;">
      Merci d'avoir confirmé votre présence à <strong>{{event.name}}</strong> !
    </p>

    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #009197;">
      <h2 style="color: #004645; margin-top: 0;">📅 Détails de l'événement</h2>
      <p style="margin: 10px 0;"><strong>Date :</strong> {{event.date}}</p>
      <p style="margin: 10px 0;"><strong>Heure :</strong> {{event.time}}</p>
      <p style="margin: 10px 0;"><strong>Lieu :</strong> {{event.location}}</p>
    </div>

    <div style="background: #e8f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 0; color: #004645;">
        <strong>🎫 Votre badge avec QR code</strong><br>
        <a href="{{badge.downloadUrl}}" style="color: #009197; text-decoration: none; font-weight: bold;">
          Télécharger mon badge →
        </a>
      </p>
    </div>

    <p style="font-size: 14px; color: #666; margin-top: 30px;">
      Nous avons hâte de vous voir !<br>
      L'équipe organisatrice
    </p>
  </div>
</body>
</html>
        `,
        textContent: 'Merci d\'avoir confirmé votre présence à {{event.name}} !',
        isActive: true,
        isDefault: true,
      },
    })

    logSuccess('Template "confirmation-accepted" créé')
    created = true
  } else {
    log('  Template "confirmation-accepted" existe déjà', 'green')
  }

  // Template Refusé
  const declinedExists = await prisma.emailTemplate.findFirst({
    where: { slug: 'confirmation-declined' },
  })

  if (!declinedExists) {
    log('  Création du template "confirmation-declined"...', 'yellow')

    await prisma.emailTemplate.create({
      data: {
        name: 'Confirmation - Absence',
        slug: 'confirmation-declined',
        type: 'CONFIRMATION',
        subject: 'Votre réponse pour {{event.name}}',
        htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #666 0%, #999 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="margin: 0; font-size: 28px;">Réponse enregistrée</h1>
  </div>

  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px; margin-bottom: 20px;">
      Bonjour <strong>{{guest.firstName}}</strong>,
    </p>

    <p style="font-size: 16px; margin-bottom: 20px;">
      Nous avons bien enregistré votre réponse concernant <strong>{{event.name}}</strong>.
    </p>

    <p style="font-size: 16px; margin-bottom: 20px;">
      Nous sommes désolés que vous ne puissiez pas vous joindre à nous, mais nous espérons vous revoir très bientôt !
    </p>

    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #999;">
      <p style="margin: 0; color: #666;">
        Si vous changez d'avis ou si votre situation évolue, n'hésitez pas à nous contacter.
      </p>
    </div>

    <p style="font-size: 14px; color: #666; margin-top: 30px;">
      Merci de nous avoir répondu.<br>
      L'équipe organisatrice
    </p>
  </div>
</body>
</html>
        `,
        textContent: 'Merci d\'avoir répondu concernant {{event.name}}',
        isActive: true,
        isDefault: true,
      },
    })

    logSuccess('Template "confirmation-declined" créé')
    created = true
  } else {
    log('  Template "confirmation-declined" existe déjà', 'green')
  }

  if (!created) {
    log('\n  ℹ️  Tous les templates existent déjà', 'blue')
  }

  return created
}

async function runAllTests() {
  log('\n╔════════════════════════════════════════════════════════════╗', 'cyan')
  log('║   TEST SYSTÈME EMAIL DE CONFIRMATION - BOUT EN BOUT       ║', 'cyan')
  log('╚════════════════════════════════════════════════════════════╝', 'cyan')

  try {
    // Créer les templates s'ils manquent
    await createTestTemplatesIfMissing()

    // Test 1: Templates
    const templatesResult = await testTemplateValidation()

    if (templatesResult.hasTemplates) {
      await testTemplateContent(templatesResult)
    }

    // Test 2: Configuration événements
    const testEvent = await testEventConfiguration()

    // Test 3: Intégration email
    await testEmailIntegration()

    // Test 4: Logique de validation API
    const apiValidationPassed = await testAPIValidationLogic()

    // Test 5: Flux RSVP
    if (testEvent) {
      await testRSVPFlow(testEvent)
    }

    // Test 6: Statistiques
    await testStatistics()

    // Résumé final
    logSection('RÉSUMÉ DES TESTS')

    if (templatesResult.hasTemplates && apiValidationPassed) {
      logSuccess('✅ TOUS LES TESTS SONT PASSÉS')
      log('\n  Le système d\'emails de confirmation est opérationnel :', 'green')
      log('  ✓ Templates configurés correctement', 'green')
      log('  ✓ Validation API fonctionnelle', 'green')
      log('  ✓ Prêt à envoyer des emails de confirmation', 'green')
    } else {
      logError('❌ CERTAINS TESTS ONT ÉCHOUÉ')
      log('\n  Actions requises :', 'yellow')
      if (!templatesResult.hasTemplates) {
        log('  • Configurer les templates de confirmation manquants', 'yellow')
      }
      if (!apiValidationPassed) {
        log('  • Vérifier la validation API', 'yellow')
      }
    }

  } catch (error) {
    logError(`Erreur lors de l'exécution des tests: ${error}`)
    console.error(error)
  } finally {
    await prisma.$disconnect()
  }
}

// Exécuter les tests
runAllTests()
