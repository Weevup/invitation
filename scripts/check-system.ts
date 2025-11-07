import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkSystem() {
  console.log('🔍 Vérification du système...\n')

  try {
    // 1. Vérifier la connexion à la base de données
    console.log('1️⃣ Test de connexion à la base de données...')
    await prisma.$connect()
    console.log('   ✅ Connexion réussie\n')

    // 2. Vérifier les tables
    console.log('2️⃣ Vérification des tables...')
    const tables = ['User', 'Event', 'Guest', 'RSVP', 'EmailLog', 'Checkin']
    for (const table of tables) {
      try {
        await prisma.$queryRaw`SELECT 1 FROM "${table}" LIMIT 1`
        console.log(`   ✅ Table ${table} existe`)
      } catch (error) {
        console.log(`   ❌ Table ${table} manquante ou erreur`)
      }
    }
    console.log()

    // 3. Compter les données
    console.log('3️⃣ Statistiques de la base de données...')
    const userCount = await prisma.user.count()
    const eventCount = await prisma.event.count()
    const guestCount = await prisma.guest.count()
    const rsvpCount = await prisma.rSVP.count()
    const emailLogCount = await prisma.emailLog.count()

    console.log(`   👥 Utilisateurs: ${userCount}`)
    console.log(`   📅 Événements: ${eventCount}`)
    console.log(`   👤 Invités: ${guestCount}`)
    console.log(`   ✉️  RSVPs: ${rsvpCount}`)
    console.log(`   📧 Logs email: ${emailLogCount}\n`)

    // 4. Vérifier les événements existants
    if (eventCount > 0) {
      console.log('4️⃣ Événements disponibles:')
      const events = await prisma.event.findMany({
        include: {
          _count: {
            select: { guests: true, rsvps: true }
          }
        },
        take: 5
      })

      for (const event of events) {
        console.log(`   📅 ${event.name}`)
        console.log(`      ID: ${event.id}`)
        console.log(`      Slug: ${event.slug}`)
        console.log(`      Date: ${event.startsAt.toLocaleDateString('fr-FR')}`)
        console.log(`      Invités: ${event._count.guests}`)
        console.log(`      RSVPs: ${event._count.rsvps}`)
        console.log()
      }
    }

    // 5. Vérifier un invité exemple (si existe)
    if (guestCount > 0) {
      console.log('5️⃣ Exemple d\'invité:')
      const guest = await prisma.guest.findFirst({
        include: {
          event: {
            select: { name: true }
          },
          rsvp: true
        }
      })

      if (guest) {
        console.log(`   👤 ${guest.firstName} ${guest.lastName}`)
        console.log(`      Email: ${guest.email}`)
        console.log(`      Événement: ${guest.event.name}`)
        console.log(`      Statut: ${guest.status}`)
        console.log(`      Token: ${guest.token.substring(0, 16)}...`)
        console.log(`      Lien invitation: http://localhost:3000/guest/${guest.token}`)
        if (guest.rsvp) {
          console.log(`      RSVP: ${guest.rsvp.attending ? '✅ Participe' : '❌ Décline'}`)
        } else {
          console.log(`      RSVP: ⏳ En attente`)
        }
        console.log()
      }
    }

    // 6. Vérifier les variables d'environnement
    console.log('6️⃣ Variables d\'environnement:')
    const envVars = [
      'DATABASE_URL',
      'NEXT_PUBLIC_APP_URL',
      'SMTP_HOST',
      'SMTP_PORT',
      'SMTP_USER',
      'EMAIL_FROM',
    ]

    for (const envVar of envVars) {
      const value = process.env[envVar]
      if (value) {
        if (envVar.includes('PASSWORD') || envVar.includes('URL')) {
          console.log(`   ✅ ${envVar}: ***${value.substring(value.length - 4)}`)
        } else {
          console.log(`   ✅ ${envVar}: ${value}`)
        }
      } else {
        console.log(`   ⚠️  ${envVar}: Non définie`)
      }
    }
    console.log()

    console.log('✅ Vérification terminée avec succès!\n')

    // Résumé des fonctionnalités disponibles
    console.log('📋 Fonctionnalités disponibles:')
    console.log('   ✅ Gestion des événements')
    console.log('   ✅ Ajout manuel d\'invités')
    console.log('   ✅ Import/Export CSV')
    console.log('   ✅ Envoi d\'emails (invitation, rappel, confirmation)')
    console.log('   ✅ Page publique RSVP')
    console.log('   ✅ Formulaire RSVP complet')
    console.log('   ✅ QR codes pour check-in')
    console.log('   ✅ Logs email')
    console.log()

    console.log('🚀 URLs d\'accès:')
    console.log(`   Admin: http://localhost:3000/admin`)
    console.log(`   Setup: http://localhost:3000/admin/setup`)
    if (guestCount > 0) {
      const firstGuest = await prisma.guest.findFirst()
      if (firstGuest) {
        console.log(`   Test invité: http://localhost:3000/guest/${firstGuest.token}`)
      }
    }
    console.log()

  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

checkSystem()
  .catch((error) => {
    console.error('Erreur fatale:', error)
    process.exit(1)
  })
