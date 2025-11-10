import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Vérification de l\'état du compte admin...\n')

  // Check for all admin users
  const allAdmins = await prisma.user.findMany({
    where: { role: 'ADMIN' },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      createdAt: true,
      loginAttempts: true,
      lockedUntil: true,
    },
  })

  if (allAdmins.length === 0) {
    console.log('❌ Aucun compte administrateur trouvé')
    console.log('💡 Vous pouvez créer un compte avec: npm run admin:create')
    return
  }

  console.log(`✅ ${allAdmins.length} compte(s) administrateur trouvé(s):\n`)

  for (const admin of allAdmins) {
    console.log(`📧 Email: ${admin.email}`)
    console.log(`👤 Nom: ${admin.name}`)
    console.log(`🔐 Rôle: ${admin.role}`)
    console.log(`✔️  Actif: ${admin.isActive ? 'Oui' : 'Non'}`)
    console.log(`📅 Créé le: ${admin.createdAt.toLocaleDateString('fr-FR')}`)
    console.log(`🔒 Tentatives de connexion: ${admin.loginAttempts}`)

    if (admin.lockedUntil && new Date(admin.lockedUntil) > new Date()) {
      console.log(`⚠️  Compte verrouillé jusqu'à: ${admin.lockedUntil.toLocaleString('fr-FR')}`)
    }

    console.log('')
  }

  // Check specifically for the target email
  const targetEmail = 'julien.boisard@weevup.fr'
  const targetUser = allAdmins.find(u => u.email === targetEmail)

  if (targetUser) {
    console.log(`✅ Le compte ${targetEmail} existe`)
    if (!targetUser.isActive) {
      console.log(`⚠️  Le compte est INACTIF`)
    }
    if (targetUser.lockedUntil && new Date(targetUser.lockedUntil) > new Date()) {
      console.log(`⚠️  Le compte est VERROUILLÉ`)
    }
  } else {
    console.log(`❌ Le compte ${targetEmail} n'existe PAS`)
    console.log(`💡 Vous pouvez le créer avec l'API /api/setup-admin`)
  }
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
