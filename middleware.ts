import NextAuth from 'next-auth'
import { authConfig } from './auth.config'

// Use only auth.config.ts for Edge Runtime compatibility (no Prisma, no bcrypt)
export default NextAuth(authConfig).auth

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
