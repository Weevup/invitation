import { auth } from '@/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth

  const isAdminRoute = nextUrl.pathname.startsWith('/admin')
  const isAdminApiRoute = nextUrl.pathname.startsWith('/api/admin')
  const isLoginPage = nextUrl.pathname === '/admin/login'

  // Protect admin routes
  if (isAdminRoute && !isLoginPage && !isLoggedIn) {
    return NextResponse.redirect(new URL('/admin/login', nextUrl))
  }

  // Protect admin API routes
  if (isAdminApiRoute && !isLoggedIn) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'You must be logged in to access this resource.' },
      { status: 401 }
    )
  }

  // Redirect to dashboard if already logged in and trying to access login page
  if (isLoginPage && isLoggedIn) {
    return NextResponse.redirect(new URL('/admin', nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
