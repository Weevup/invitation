import jwt, { Secret, SignOptions } from 'jsonwebtoken'
import { prisma } from './prisma'
import crypto from 'crypto'

// Valider que JWT_SECRET est défini en production
const JWT_SECRET = process.env.JWT_SECRET as Secret

if (!JWT_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('JWT_SECRET must be defined in production environment')
}

// Fallback pour développement uniquement
const JWT_SECRET_DEV = JWT_SECRET || 'dev-secret-key-not-for-production' as Secret

export interface TokenPayload {
  guestId: string
  eventId: string
  email: string
  type: 'guest' | 'admin'
}

export function generateToken(payload: TokenPayload, expiresIn: string = '30d'): string {
  // Cast en any pour éviter les problèmes de compatibilité de types entre versions de jsonwebtoken
  return jwt.sign(payload, JWT_SECRET_DEV, { expiresIn } as any)
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET_DEV) as TokenPayload
  } catch (error) {
    return null
  }
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

export function generateGuestToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export async function validateGuestToken(token: string) {
  const tokenHash = hashToken(token)

  const guest = await prisma.guest.findUnique({
    where: { tokenHash },
    include: {
      event: true,
      rsvp: true,
    },
  })

  if (!guest) {
    return null
  }

  // Check if token is expired
  if (guest.tokenExpiry && guest.tokenExpiry < new Date()) {
    return null
  }

  return guest
}
