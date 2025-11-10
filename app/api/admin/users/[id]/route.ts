import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { requireAdmin, handleAuthError } from '@/lib/auth-utils'
import { requireUserModificationAccess } from '@/lib/permissions'

// Validation schema pour la mise à jour
const updateUserSchema = z.object({
  email: z.string().email('Email invalide').optional(),
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').optional(),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères').optional(),
  role: z.enum(['ADMIN', 'GUEST']).optional(),
  isActive: z.boolean().optional(),
})

/**
 * GET /api/admin/users/[id]
 * Récupère les détails d'un utilisateur
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin()
    const { id } = await params

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        loginAttempts: true,
        lockedUntil: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            adminEvents: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json({ user })
  } catch (error) {
    return handleAuthError(error)
  }
}

/**
 * PUT /api/admin/users/[id]
 * Met à jour un utilisateur (avec vérification des droits)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin()
    const { id } = await params
    const body = await request.json()

    // Vérifier que l'admin peut modifier cet utilisateur
    // (actuellement : uniquement ses propres infos, sauf super-admin)
    await requireUserModificationAccess(id, session.user.id)

    // Validation
    const validation = updateUserSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: validation.error.errors },
        { status: 400 }
      )
    }

    const data = validation.data

    // Vérifier si l'utilisateur existe
    const existingUser = await prisma.user.findUnique({
      where: { id },
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    // Si l'email est changé, vérifier qu'il n'est pas déjà utilisé
    if (data.email && data.email !== existingUser.email) {
      const emailTaken = await prisma.user.findUnique({
        where: { email: data.email },
      })

      if (emailTaken) {
        return NextResponse.json(
          { error: 'Cet email est déjà utilisé' },
          { status: 409 }
        )
      }
    }

    // Préparer les données de mise à jour
    const updateData: any = { ...data }

    // Hash du nouveau mot de passe si fourni
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10)
    }

    // Réinitialiser les tentatives de connexion si le compte est réactivé
    if (data.isActive === true && !existingUser.isActive) {
      updateData.loginAttempts = 0
      updateData.lockedUntil = null
    }

    // Mettre à jour l'utilisateur
    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        loginAttempts: true,
        lockedUntil: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({
      message: 'Utilisateur mis à jour avec succès',
      user,
    })
  } catch (error) {
    return handleAuthError(error)
  }
}

/**
 * DELETE /api/admin/users/[id]
 * Supprime un utilisateur (avec vérification des droits)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin()
    const { id} = await params

    // Vérifier que l'admin peut supprimer cet utilisateur
    await requireUserModificationAccess(id, session.user.id)

    // Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            adminEvents: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    // Empêcher la suppression du dernier admin
    if (user.role === 'ADMIN') {
      const adminCount = await prisma.user.count({
        where: { role: 'ADMIN', isActive: true },
      })

      if (adminCount <= 1) {
        return NextResponse.json(
          { error: 'Impossible de supprimer le dernier administrateur actif' },
          { status: 400 }
        )
      }
    }

    // Supprimer l'utilisateur
    await prisma.user.delete({
      where: { id },
    })

    return NextResponse.json({
      message: 'Utilisateur supprimé avec succès',
    })
  } catch (error) {
    return handleAuthError(error)
  }
}
