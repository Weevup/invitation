import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Configuration pour développement (mémoire) ou production (Upstash)
const isProduction = process.env.NODE_ENV === 'production'
const useUpstash = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN

// Classe pour rate limiting en mémoire (développement)
class MemoryRatelimit {
  private cache = new Map<string, { count: number; resetAt: number }>()
  private maxRequests: number
  private windowMs: number

  constructor(maxRequests: number, windowMs: number) {
    this.maxRequests = maxRequests
    this.windowMs = windowMs
  }

  async limit(identifier: string) {
    const now = Date.now()
    const record = this.cache.get(identifier)

    // Nettoyer les anciennes entrées
    if (record && now > record.resetAt) {
      this.cache.delete(identifier)
    }

    const current = this.cache.get(identifier) || { count: 0, resetAt: now + this.windowMs }

    current.count++
    this.cache.set(identifier, current)

    const success = current.count <= this.maxRequests
    const remaining = Math.max(0, this.maxRequests - current.count)
    const reset = current.resetAt

    return {
      success,
      limit: this.maxRequests,
      remaining,
      reset: new Date(reset),
      pending: Promise.resolve(),
    }
  }
}

// Configuration Upstash Redis pour production
let redis: Redis | null = null
if (useUpstash) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  })
}

/**
 * Rate limiter pour la page de login
 * 5 tentatives par 15 minutes par IP
 */
export const loginRateLimit = useUpstash && redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '15 m'),
      analytics: true,
      prefix: 'ratelimit:login',
    })
  : new MemoryRatelimit(5, 15 * 60 * 1000)

/**
 * Rate limiter pour les soumissions RSVP
 * 10 soumissions par heure par IP
 */
export const rsvpRateLimit = useUpstash && redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '60 m'),
      analytics: true,
      prefix: 'ratelimit:rsvp',
    })
  : new MemoryRatelimit(10, 60 * 60 * 1000)

/**
 * Rate limiter pour les check-ins
 * 30 check-ins par minute par IP (pour scanner rapide)
 */
export const checkinRateLimit = useUpstash && redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(30, '1 m'),
      analytics: true,
      prefix: 'ratelimit:checkin',
    })
  : new MemoryRatelimit(30, 60 * 1000)

/**
 * Rate limiter pour les API admin générales
 * 100 requêtes par minute par IP
 */
export const adminApiRateLimit = useUpstash && redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(100, '1 m'),
      analytics: true,
      prefix: 'ratelimit:admin',
    })
  : new MemoryRatelimit(100, 60 * 1000)

/**
 * Rate limiter pour les envois d'emails
 * 50 emails par heure par admin
 */
export const emailRateLimit = useUpstash && redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(50, '60 m'),
      analytics: true,
      prefix: 'ratelimit:email',
    })
  : new MemoryRatelimit(50, 60 * 60 * 1000)

/**
 * Récupère l'identifiant pour le rate limiting (IP ou user ID)
 */
export function getRateLimitIdentifier(request: Request, fallback?: string): string {
  // Essayer d'obtenir l'IP réelle depuis les headers
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')

  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }

  if (realIp) {
    return realIp
  }

  return fallback || 'unknown'
}

/**
 * Headers de rate limit pour la réponse
 */
export function getRateLimitHeaders(result: {
  limit: number
  remaining: number
  reset: Date
}) {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.reset.getTime().toString(),
  }
}
