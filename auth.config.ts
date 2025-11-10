import type { NextAuthConfig } from 'next-auth'
import { NextResponse } from 'next/server'

export const authConfig = {
  pages: {
    signIn: '/admin/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnAdmin = nextUrl.pathname.startsWith('/admin')
      const isOnAdminApi = nextUrl.pathname.startsWith('/api/admin')
      const isOnLogin = nextUrl.pathname.startsWith('/admin/login')

      // Handle admin API routes - return JSON 401 instead of redirect
      if (isOnAdminApi) {
        if (isLoggedIn) return true
        return NextResponse.json(
          { error: 'Unauthorized', message: 'You must be logged in to access this resource.' },
          { status: 401 }
        )
      }

      // Handle admin pages
      if (isOnAdmin) {
        if (isOnLogin) {
          return true // Always allow access to login page
        }
        if (isLoggedIn) return true
        return false // Redirect unauthenticated users to login page
      }

      return true
    },
  },
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig
