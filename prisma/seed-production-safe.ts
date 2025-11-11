import { PrismaClient } from '@prisma/client'
import { hashToken, generateGuestToken } from '../lib/auth'
import bcrypt from 'bcryptjs'
import { encrypt } from '../lib/encryption'

const prisma = new PrismaClient()

/**
 * Production-safe seed
 * - Préserve les comptes admin existants
 * - Crée une EmailIntegration de test si aucune n'existe
 * - Ajoute des données de démo sans supprimer les données existantes
 */
async function main() {
  console.log('🌱 Production-safe seeding...')

  // ==================================================
  // 1. ADMIN - Upsert (ne supprime pas les existants)
  // ==================================================
  const defaultPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@weevup.com' },
    update: {},
    create: {
      email: 'admin@weevup.com',
      password: defaultPassword,
      name: 'Admin Weevup',
      role: 'ADMIN',
    },
  })

  console.log('✅ Admin user ready:', admin.email)

  // ==================================================
  // 2. EMAIL INTEGRATION - Crée Resend test si aucune n'existe
  // ==================================================
  const existingIntegration = await prisma.emailIntegration.findFirst()

  if (!existingIntegration) {
    // Créer une intégration Resend avec une clé de test
    // En production, l'admin devra remplacer cette clé par une vraie
    const resendIntegration = await prisma.emailIntegration.create({
      data: {
        provider: 'RESEND',
        apiKey: encrypt('re_test_key_replace_me'), // Clé de test encryptée
        fromEmail: 'onboarding@resend.dev', // Email de test Resend
        fromName: 'Weevup Events',
        replyTo: 'hello@weevup.com',
        isActive: true,
        isPrimary: true,
        trackOpens: true,
        trackClicks: true,
      },
    })

    console.log('✅ Email Integration created (TEST MODE - Resend)')
    console.log('   ⚠️  Remplacez la clé API dans /admin/settings/integrations')
  } else {
    console.log('✅ Email Integration already exists')
  }

  // ==================================================
  // 3. DEMO EVENT - Optionnel (décommenter si besoin)
  // ==================================================
  const eventCount = await prisma.event.count({
    where: { adminId: admin.id }
  })

  if (eventCount === 0) {
    console.log('📅 Création d\'un événement de démo...')

    const demoEvent = await prisma.event.create({
      data: {
        name: 'Événement de Démo',
        slug: 'demo-event',
        startsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Dans 30 jours
        endsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000), // +4h
        venueName: 'Centre de Conférence',
        address: '123 Rue de la Paix',
        city: 'Paris',
        country: 'France',
        description: 'Ceci est un événement de démonstration. Vous pouvez le modifier ou le supprimer.',
        rsvpDeadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000), // Dans 25 jours
        maxPlusOnes: 1,
        adminId: admin.id,
      },
    })

    // Créer quelques invités de test
    const guests = await Promise.all([
      {
        firstName: 'Marie',
        lastName: 'Dupont',
        email: 'marie.dupont@example.com',
      },
      {
        firstName: 'Jean',
        lastName: 'Martin',
        email: 'jean.martin@example.com',
      },
      {
        firstName: 'Sophie',
        lastName: 'Bernard',
        email: 'sophie.bernard@example.com',
      },
    ].map(async (guestData) => {
      const token = generateGuestToken()
      const tokenHash = await hashToken(token)

      return prisma.guest.create({
        data: {
          ...guestData,
          eventId: demoEvent.id,
          token,
          tokenHash,
          status: 'PENDING',
        },
      })
    }))

    console.log(`✅ Événement de démo créé avec ${guests.length} invités`)
  } else {
    console.log('✅ Événements existants préservés')
  }

  console.log('\n🎉 Seed production-safe terminé avec succès !')
  console.log('\n📋 Prochaines étapes :')
  console.log('   1. Connectez-vous : ' + admin.email + ' / admin123')
  console.log('   2. Configurez votre email : /admin/settings/integrations')
  console.log('   3. Remplacez la clé API de test par votre vraie clé')
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
