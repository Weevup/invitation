import { handlers } from '@/auth'

// Force Node.js runtime because bcrypt is not compatible with Edge Runtime
export const runtime = 'nodejs'

export const { GET, POST } = handlers
