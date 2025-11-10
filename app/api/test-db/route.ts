import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * Route de test pour vérifier la connexion à la base de données
 */
export async function GET() {
  try {
    // Test 1: Connexion basique
    await prisma.$queryRaw`SELECT 1`

    // Test 2: Compter les utilisateurs
    const userCount = await prisma.user.count()

    // Test 3: Vérifier si le compte admin existe
    const adminUser = await prisma.user.findUnique({
      where: { email: 'contact@weevup.com' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
      }
    })

    return NextResponse.json({
      success: true,
      database: {
        connected: true,
        userCount,
      },
      adminAccount: adminUser ? {
        exists: true,
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role,
        isActive: adminUser.isActive,
      } : {
        exists: false,
        message: '❌ Compte admin contact@weevup.com introuvable',
      }
    })
  } catch (error) {
    console.error('Database test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: String(error)
    }, { status: 500 })
  }
}
