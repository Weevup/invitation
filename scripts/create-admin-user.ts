/**
 * Script pour créer le compte administrateur principal
 * Usage: npx tsx scripts/create-admin-user.ts
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('🔍 Vérification des utilisateurs existants...')

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email: 'julien.boisard@weevup.fr' },
    })

    if (existingUser) {
      console.log('⚠️  L\'utilisateur julien.boisard@weevup.fr existe déjà')
      console.log('📧 Email:', existingUser.email)
      console.log('👤 Nom:', existingUser.name)
      console.log('🔐 Rôle:', existingUser.role)
      console.log('✅ Actif:', existingUser.isActive)
      return
    }

    console.log('🔨 Création du compte administrateur...')

    // Hash du mot de passe
    const password = 'Weevup2025!'
    const hashedPassword = await bcrypt.hash(password, 10)

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        email: 'julien.boisard@weevup.fr',
        name: 'Julien Boisard',
        password: hashedPassword,
        role: 'ADMIN',
        isActive: true,
      },
    })

    console.log('\n✅ Compte administrateur créé avec succès!')
    console.log('\n📋 Informations de connexion:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📧 Email:', user.email)
    console.log('🔑 Mot de passe:', password)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('\n⚠️  IMPORTANT: Changez ce mot de passe après la première connexion!')
    console.log('🌐 URL de connexion: https://votre-domaine.vercel.app/admin/login')

  } catch (error) {
    console.error('❌ Erreur lors de la création du compte:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
