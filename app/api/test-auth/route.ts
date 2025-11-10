import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        role: true,
        isActive: true,
        loginAttempts: true,
        lockedUntil: true,
      },
    })

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Utilisateur non trouvé',
        email
      })
    }

    const passwordMatch = await bcrypt.compare(password, user.password)

    return NextResponse.json({
      success: true,
      userFound: true,
      passwordMatch,
      userDetails: {
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        loginAttempts: user.loginAttempts,
        isLocked: user.lockedUntil ? new Date(user.lockedUntil) > new Date() : false
      }
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
