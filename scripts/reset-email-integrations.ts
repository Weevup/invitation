/**
 * Script pour supprimer toutes les intégrations email
 * Utilise après changement d'ENCRYPTION_KEY
 *
 * Usage: npx tsx scripts/reset-email-integrations.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🧹 Suppression de toutes les intégrations email...')

  const result = await prisma.emailIntegration.deleteMany({})

  console.log(`✅ ${result.count} intégration(s) supprimée(s)`)
  console.log('Vous pouvez maintenant reconfigurer vos intégrations email avec la nouvelle ENCRYPTION_KEY')
}

main()
  .catch((error) => {
    console.error('❌ Erreur:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
