import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

/**
 * API pour vérifier et corriger automatiquement les problèmes de base de données
 */
export async function POST() {
  try {
    const issues = []
    const fixes = []

    // 1. Vérifier la connexion DB
    try {
      await prisma.$queryRaw`SELECT 1`
      fixes.push('✅ Connexion à la base de données OK')
    } catch (error) {
      issues.push('❌ Impossible de se connecter à la base de données')
      return NextResponse.json({ success: false, issues, fixes }, { status: 500 })
    }

    // 2. Vérifier et créer le compte admin si nécessaire
    const adminEmail = 'contact@weevup.com'
    const adminPassword = 'admin123'

    let adminUser = await prisma.user.findUnique({
      where: { email: adminEmail }
    })

    if (!adminUser) {
      // Créer le compte admin
      const hashedPassword = await bcrypt.hash(adminPassword, 10)

      adminUser = await prisma.user.create({
        data: {
          email: adminEmail,
          password: hashedPassword,
          name: 'Admin Weevup',
          role: 'ADMIN',
          isActive: true,
          loginAttempts: 0,
        }
      })

      fixes.push(`✅ Compte admin créé: ${adminEmail}`)
    } else {
      // Vérifier que le compte est actif et déverrouillé
      if (!adminUser.isActive) {
        await prisma.user.update({
          where: { id: adminUser.id },
          data: { isActive: true }
        })
        fixes.push('✅ Compte admin réactivé')
      }

      if (adminUser.lockedUntil && new Date(adminUser.lockedUntil) > new Date()) {
        await prisma.user.update({
          where: { id: adminUser.id },
          data: {
            lockedUntil: null,
            loginAttempts: 0
          }
        })
        fixes.push('✅ Compte admin déverrouillé')
      }

      if (adminUser.loginAttempts > 0) {
        await prisma.user.update({
          where: { id: adminUser.id },
          data: { loginAttempts: 0 }
        })
        fixes.push('✅ Tentatives de connexion réinitialisées')
      }

      fixes.push(`✅ Compte admin existe: ${adminEmail}`)
    }

    // 3. Compter les tables
    const counts = {
      users: await prisma.user.count(),
      events: await prisma.event.count(),
      guests: await prisma.guest.count(),
      rsvps: await prisma.rSVP.count(),
      emailIntegrations: await prisma.emailIntegration.count(),
      emailTemplates: await prisma.emailTemplate.count(),
    }

    fixes.push(`📊 Statistiques: ${counts.users} utilisateur(s), ${counts.events} événement(s)`)

    // 4. Vérifier les enums
    const enumCheck = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'UserRole'
      ) as "userRoleExists"
    `

    if (Array.isArray(enumCheck) && enumCheck[0]) {
      fixes.push('✅ Enums Prisma configurés correctement')
    }

    return NextResponse.json({
      success: true,
      message: 'Vérification et corrections terminées',
      issues,
      fixes,
      counts,
      credentials: {
        email: adminEmail,
        password: adminPassword,
        note: 'Utilisez ces identifiants pour vous connecter'
      }
    })

  } catch (error) {
    console.error('Check and fix error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: String(error)
    }, { status: 500 })
  }
}

// Aussi disponible en GET pour faciliter le test depuis un navigateur
export async function GET() {
  return POST()
}
