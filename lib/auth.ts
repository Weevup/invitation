import jwt from 'jsonwebtoken'
import { prisma } from './prisma'
import crypto from 'crypto'

// Lazy initialization to avoid build-time errors
let JWT_SECRET: string | null = null

function getJwtSecret(): string {
  if (JWT_SECRET !== null) {
    return JWT_SECRET
  }

  const secret = process.env.JWT_SECRET
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET must be defined in production')
    }
    console.warn('⚠️  Using default JWT_SECRET in development. Set JWT_SECRET in .env for production.')
    JWT_SECRET = 'dev-secret-change-in-production'
    return JWT_SECRET
  }

  JWT_SECRET = secret
  return JWT_SECRET
}

export interface TokenPayload {
  guestId: string
  eventId: string
  email: string
  type: 'guest' | 'admin'
}

export function generateToken(payload: TokenPayload, expiresIn: string | number = '30d'): string {
  // Cast en any pour compatibilité avec différentes versions de @types/jsonwebtoken
  return jwt.sign(payload, getJwtSecret(), { expiresIn } as any)
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, getJwtSecret()) as TokenPayload
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
