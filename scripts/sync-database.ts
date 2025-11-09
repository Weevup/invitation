/**
 * Script pour synchroniser la base de données avec le schéma Prisma
 *
 * Ce script applique toutes les migrations SQL dans l'ordre chronologique.
 * Utilisez-le quand vous ne pouvez pas utiliser `prisma migrate deploy` ou `prisma db push`
 *
 * Usage:
 *   npx tsx scripts/sync-database.ts
 *
 * Assurez-vous que DATABASE_URL est configuré dans .env ou les variables d'environnement
 */

import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

interface Migration {
  name: string
  path: string
  sql: string
}

async function getMigrations(): Promise<Migration[]> {
  const migrationsDir = path.join(process.cwd(), 'prisma', 'migrations')
  const folders = fs.readdirSync(migrationsDir)
    .filter(name => !name.endsWith('.toml'))
    .sort() // Tri alphabétique = chronologique

  const migrations: Migration[] = []

  for (const folder of folders) {
    const sqlPath = path.join(migrationsDir, folder, 'migration.sql')
    if (fs.existsSync(sqlPath)) {
      const sql = fs.readFileSync(sqlPath, 'utf-8')
      migrations.push({
        name: folder,
        path: sqlPath,
        sql
      })
    }
  }

  return migrations
}

async function applyMigration(migration: Migration): Promise<boolean> {
  try {
    console.log(`📝 Application de la migration: ${migration.name}`)

    // Exécuter le SQL brut
    await prisma.$executeRawUnsafe(migration.sql)

    console.log(`✅ Migration appliquée: ${migration.name}`)
    return true
  } catch (error) {
    console.error(`❌ Erreur lors de l'application de ${migration.name}:`, error)
    return false
  }
}

async function main() {
  console.log('🔄 Synchronisation de la base de données...\n')

  try {
    // Test de connexion
    await prisma.$connect()
    console.log('✅ Connexion à la base de données réussie\n')

    // Récupérer toutes les migrations
    const migrations = await getMigrations()
    console.log(`📋 ${migrations.length} migration(s) trouvée(s):\n`)

    migrations.forEach((m, i) => {
      console.log(`  ${i + 1}. ${m.name}`)
    })
    console.log('')

    // Appliquer chaque migration
    let successCount = 0
    let errorCount = 0

    for (const migration of migrations) {
      const success = await applyMigration(migration)
      if (success) {
        successCount++
      } else {
        errorCount++
      }
      console.log('') // Ligne vide entre les migrations
    }

    // Résumé
    console.log('═'.repeat(60))
    console.log(`✨ Synchronisation terminée!`)
    console.log(`   Réussies: ${successCount}`)
    console.log(`   Erreurs:  ${errorCount}`)
    console.log('═'.repeat(60))

    if (errorCount > 0) {
      console.log('\n⚠️  Certaines migrations ont échoué.')
      console.log('   Cela peut être normal si les tables existent déjà.')
      console.log('   Vérifiez les erreurs ci-dessus pour plus de détails.\n')
    }

  } catch (error) {
    console.error('❌ Erreur critique:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((error) => {
    console.error('❌ Erreur non gérée:', error)
    process.exit(1)
  })
