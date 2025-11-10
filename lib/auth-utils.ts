import { auth } from '@/auth'
import { NextResponse } from 'next/server'

/**
 * Types pour la gestion des erreurs d'authentification
 */
export class AuthError extends Error {
  constructor(
    message: string,
    public code: 'UNAUTHORIZED' | 'FORBIDDEN' | 'ACCOUNT_LOCKED' | 'ACCOUNT_INACTIVE'
  ) {
    super(message)
    this.name = 'AuthError'
  }
}

/**
 * Vérifie qu'un utilisateur est authentifié
 * @throws {AuthError} Si l'utilisateur n'est pas authentifié
 */
export async function requireAuth() {
  const session = await auth()

  if (!session?.user) {
    throw new AuthError('Non authentifié', 'UNAUTHORIZED')
  }

  return session
}

/**
 * Vérifie qu'un utilisateur est authentifié ET a le rôle ADMIN
 * @throws {AuthError} Si l'utilisateur n'est pas authentifié ou n'est pas admin
 */
export async function requireAdmin() {
  const session = await requireAuth()

  if (session.user.role !== 'ADMIN') {
    throw new AuthError('Accès réservé aux administrateurs', 'FORBIDDEN')
  }

  return session
}

/**
 * Gestionnaire d'erreurs d'authentification pour les routes API
 * Convertit les erreurs en réponses JSON appropriées
 */
export function handleAuthError(error: unknown): NextResponse {
  console.error('Auth error:', error)

  if (error instanceof AuthError) {
    switch (error.code) {
      case 'UNAUTHORIZED':
        return NextResponse.json(
          { error: 'Non authentifié', message: error.message },
          { status: 401 }
        )
      case 'FORBIDDEN':
        return NextResponse.json(
          { error: 'Accès interdit', message: error.message },
          { status: 403 }
        )
      case 'ACCOUNT_LOCKED':
        return NextResponse.json(
          { error: 'Compte verrouillé', message: error.message },
          { status: 403 }
        )
      case 'ACCOUNT_INACTIVE':
        return NextResponse.json(
          { error: 'Compte inactif', message: error.message },
          { status: 403 }
        )
    }
  }

  // Erreur générique
  return NextResponse.json(
    {
      error: 'Erreur serveur',
      message: error instanceof Error ? error.message : 'Une erreur est survenue'
    },
    { status: 500 }
  )
}

/**
 * Wrapper pour protéger facilement une route API
 * Usage: export const GET = withAuth(async (request, session) => { ... })
 */
export function withAuth<T extends any[]>(
  handler: (request: Request, session: Awaited<ReturnType<typeof requireAuth>>, ...args: T) => Promise<NextResponse>
) {
  return async (request: Request, ...args: T) => {
    try {
      const session = await requireAuth()
      return await handler(request, session, ...args)
    } catch (error) {
      return handleAuthError(error)
    }
  }
}

/**
 * Wrapper pour protéger une route API qui nécessite le rôle ADMIN
 * Usage: export const GET = withAdminAuth(async (request, session) => { ... })
 */
export function withAdminAuth<T extends any[]>(
  handler: (request: Request, session: Awaited<ReturnType<typeof requireAdmin>>, ...args: T) => Promise<NextResponse>
) {
  return async (request: Request, ...args: T) => {
    try {
      const session = await requireAdmin()
      return await handler(request, session, ...args)
    } catch (error) {
      return handleAuthError(error)
    }
  }
}
