import type { NextAuthConfig } from 'next-auth'

export const authConfig = {
  pages: {
    signIn: '/admin/login',
  },
  callbacks: {
    // Note: Route protection is now handled by middleware.ts
    // This keeps auth.config.ts lightweight and Edge-compatible
    authorized() {
      // Always return true since middleware handles all protection
      return true
    },
  },
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig
