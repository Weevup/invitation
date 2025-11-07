import jwt, { Secret, SignOptions } from 'jsonwebtoken'
import { prisma } from './prisma'
import crypto from 'crypto'

const JWT_SECRET = (process.env.JWT_SECRET || 'your-secret-key-change-in-production') as Secret

export interface TokenPayload {
  guestId: string
  eventId: string
  email: string
  type: 'guest' | 'admin'
}

export function generateToken(payload: TokenPayload, expiresIn: string = '30d'): string {
  const options: SignOptions = { expiresIn }
  return jwt.sign(payload, JWT_SECRET, options)
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload
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
