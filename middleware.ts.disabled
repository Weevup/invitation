import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Lightweight middleware for Edge runtime
 * Checks for NextAuth session cookie without importing NextAuth
 * This avoids Edge runtime compatibility issues
 */
export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Always allow access to login page
  if (pathname === '/admin/login') {
    return NextResponse.next()
  }

  // Check for NextAuth session cookie
  const sessionCookieName = process.env.NODE_ENV === 'production'
    ? '__Secure-authjs.session-token'
    : 'authjs.session-token'

  const hasSession = request.cookies.has(sessionCookieName)

  // Handle admin API routes - return JSON 401 if not authenticated
  if (pathname.startsWith('/api/admin')) {
    if (!hasSession) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'You must be logged in to access this resource.' },
        { status: 401 }
      )
    }
    return NextResponse.next()
  }

  // Handle admin pages - redirect to login if not authenticated
  if (pathname.startsWith('/admin')) {
    if (!hasSession) {
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
