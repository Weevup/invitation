import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { createLogger } from '@/lib/logger'

const setupAdminLogger = createLogger({ module: 'system', type: 'setup-admin' })

/**
 * API temporaire pour créer le compte admin principal
 * Cette route est sécurisée et ne peut créer qu'un seul admin au setup initial
 */
export async function POST(request: NextRequest) {
  try {
    // Vérifier si des admins existent déjà
    const existingAdmins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
    })

    // Si des admins existent déjà, refuser la création
    if (existingAdmins.length > 0) {
      return NextResponse.json(
        {
          error: 'Un ou plusieurs administrateurs existent déjà',
          message: 'Utilisez la page de gestion des utilisateurs pour créer de nouveaux comptes',
        },
        { status: 403 }
      )
    }

    // Créer le compte admin principal
    const defaultPassword = await bcrypt.hash('Weevup2025!', 10)

    const adminUser = await prisma.user.create({
      data: {
        email: 'julien.boisard@weevup.fr',
        name: 'Julien Boisard',
        password: defaultPassword,
        role: 'ADMIN',
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Compte administrateur créé avec succès',
      user: adminUser,
      credentials: {
        email: 'julien.boisard@weevup.fr',
        password: 'Weevup2025!',
        note: 'Veuillez changer ce mot de passe immédiatement après la première connexion',
      },
    })
  } catch (error) {
    setupAdminLogger.error({ error, stack: error instanceof Error ? error.stack : undefined }, 'Error creating admin user')
    return NextResponse.json(
      {
        error: 'Erreur lors de la création du compte administrateur',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
