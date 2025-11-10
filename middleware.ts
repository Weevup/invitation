import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Middleware d'authentification pour Edge Runtime (Vercel)
 *
 * Ce middleware protège:
 * - Les pages admin (/admin/*)
 * - Les API admin (/api/admin/*)
 *
 * Il vérifie uniquement la présence du cookie de session NextAuth
 * car il s'exécute dans l'Edge Runtime (pas d'accès à Prisma/bcrypt)
 */
export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Pages publiques - toujours accessibles
  const publicPaths = [
    '/auth/admin',
    '/admin/login', // Keep for backward compatibility
    '/test-login',
    '/simple-login',
    '/env-check',
    '/api/check-env',
    '/api/test-db',
    '/api/admin/check-and-fix',
    '/_next',
    '/api/auth',
    '/api/setup-admin',
    '/setup',
    '/favicon.ico'
  ]

  // Vérifier si la route est publique
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // Nom du cookie de session selon l'environnement
  const sessionCookieName = process.env.NODE_ENV === 'production'
    ? '__Secure-authjs.session-token'
    : 'authjs.session-token'

  const hasSession = request.cookies.has(sessionCookieName)

  // Protection des routes API admin
  if (pathname.startsWith('/api/admin')) {
    if (!hasSession) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'Vous devez être connecté pour accéder à cette ressource'
        },
        { status: 401 }
      )
    }
    return NextResponse.next()
  }

  // Protection des pages admin
  if (pathname.startsWith('/admin')) {
    if (!hasSession) {
      const loginUrl = new URL('/auth/admin', request.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
    return NextResponse.next()
  }

  // Toutes les autres routes
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*'
  ]
}
