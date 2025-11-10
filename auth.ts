import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { authConfig } from './auth.config'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

async function getUser(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        role: true,
        isActive: true,
        loginAttempts: true,
        lockedUntil: true,
      },
    })
    return user
  } catch (error) {
    console.error('Failed to fetch user:', error)
    throw new Error('Failed to fetch user.')
  }
}

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials)

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data
          const user = await getUser(email)

          if (!user) return null

          // Check if account is locked
          if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
            throw new Error('Account is locked. Please try again later.')
          }

          // Check if account is active
          if (!user.isActive) {
            throw new Error('Account is disabled. Please contact an administrator.')
          }

          const passwordsMatch = await bcrypt.compare(password, user.password)

          if (passwordsMatch) {
            // Reset login attempts on successful login
            await prisma.user.update({
              where: { id: user.id },
              data: {
                loginAttempts: 0,
                lastLoginAt: new Date(),
                lockedUntil: null,
              },
            })

            return {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
            }
          } else {
            // Increment login attempts
            const newAttempts = user.loginAttempts + 1
            const shouldLock = newAttempts >= 5

            await prisma.user.update({
              where: { id: user.id },
              data: {
                loginAttempts: newAttempts,
                lockedUntil: shouldLock
                  ? new Date(Date.now() + 15 * 60 * 1000) // Lock for 15 minutes
                  : null,
              },
            })

            if (shouldLock) {
              throw new Error('Too many failed attempts. Account locked for 15 minutes.')
            }
          }
        }

        return null
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
})
