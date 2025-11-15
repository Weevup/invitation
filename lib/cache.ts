/**
 * Redis caching layer using Upstash
 *
 * Provides a simple caching interface for expensive database queries:
 * - Events with stats (5 min TTL)
 * - Guest lists (5 min TTL)
 * - Dashboard stats (2 min TTL)
 *
 * Usage:
 *   import { getCachedEvent, invalidateEventCache } from '@/lib/cache'
 *
 *   const event = await getCachedEvent(eventId, async () => {
 *     return await prisma.event.findUnique({ where: { id: eventId } })
 *   })
 */

import { Redis } from '@upstash/redis'
import { dbLogger } from './logger'

// Initialize Upstash Redis client
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null

// Cache disabled if Redis not configured
const isCacheEnabled = () => redis !== null

/**
 * Generic cache get/set with fallback
 *
 * @param key - Cache key
 * @param fetchFn - Function to fetch data if not in cache
 * @param ttl - Time to live in seconds (default: 300 = 5 minutes)
 */
export async function getOrSet<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl: number = 300
): Promise<T> {
  if (!isCacheEnabled()) {
    dbLogger.debug({ key }, 'Cache disabled, fetching from source')
    return await fetchFn()
  }

  try {
    // Try to get from cache
    const cached = await redis!.get<T>(key)

    if (cached !== null) {
      dbLogger.debug({ key, hit: true }, 'Cache hit')
      return cached
    }

    // Cache miss - fetch from source
    dbLogger.debug({ key, hit: false }, 'Cache miss')
    const data = await fetchFn()

    // Store in cache
    await redis!.set(key, data, { ex: ttl })
    dbLogger.debug({ key, ttl }, 'Cached data')

    return data
  } catch (error) {
    // If cache fails, fallback to direct fetch
    dbLogger.warn({ error, key }, 'Cache error, falling back to direct fetch')
    return await fetchFn()
  }
}

/**
 * Invalidate (delete) a cache key
 */
export async function invalidate(key: string): Promise<void> {
  if (!isCacheEnabled()) return

  try {
    await redis!.del(key)
    dbLogger.debug({ key }, 'Cache invalidated')
  } catch (error) {
    dbLogger.warn({ error, key }, 'Failed to invalidate cache')
  }
}

/**
 * Invalidate multiple keys matching a pattern
 * WARNING: Can be slow with many keys, use sparingly
 */
export async function invalidatePattern(pattern: string): Promise<void> {
  if (!isCacheEnabled()) return

  try {
    // Note: Upstash Redis doesn't support SCAN, so we can't use patterns efficiently
    // For now, just log a warning
    dbLogger.warn({ pattern }, 'Pattern invalidation not supported, invalidate specific keys instead')
  } catch (error) {
    dbLogger.warn({ error, pattern }, 'Failed to invalidate pattern')
  }
}

// ============================================================================
// Event Caching
// ============================================================================

/**
 * Cache key for event data
 */
function eventKey(eventId: string): string {
  return `event:${eventId}`
}

/**
 * Cache key for event stats
 */
function eventStatsKey(eventId: string): string {
  return `event:${eventId}:stats`
}

/**
 * Get or fetch event data with caching (5 min TTL)
 */
export async function getCachedEvent<T>(
  eventId: string,
  fetchFn: () => Promise<T>
): Promise<T> {
  return await getOrSet(eventKey(eventId), fetchFn, 300) // 5 minutes
}

/**
 * Get or fetch event stats with caching (5 min TTL)
 */
export async function getCachedEventStats<T>(
  eventId: string,
  fetchFn: () => Promise<T>
): Promise<T> {
  return await getOrSet(eventStatsKey(eventId), fetchFn, 300) // 5 minutes
}

/**
 * Invalidate event cache when event is updated
 */
export async function invalidateEventCache(eventId: string): Promise<void> {
  await Promise.all([
    invalidate(eventKey(eventId)),
    invalidate(eventStatsKey(eventId)),
  ])
  dbLogger.info({ eventId }, 'Event cache invalidated')
}

// ============================================================================
// Guest Caching
// ============================================================================

/**
 * Cache key for guest list
 */
function guestListKey(eventId: string): string {
  return `event:${eventId}:guests`
}

/**
 * Cache key for confirmed guests (for check-in)
 */
function confirmedGuestsKey(eventId: string): string {
  return `event:${eventId}:guests:confirmed`
}

/**
 * Get or fetch guest list with caching (5 min TTL)
 */
export async function getCachedGuestList<T>(
  eventId: string,
  fetchFn: () => Promise<T>
): Promise<T> {
  return await getOrSet(guestListKey(eventId), fetchFn, 300) // 5 minutes
}

/**
 * Get or fetch confirmed guests with caching (5 min TTL)
 */
export async function getCachedConfirmedGuests<T>(
  eventId: string,
  fetchFn: () => Promise<T>
): Promise<T> {
  return await getOrSet(confirmedGuestsKey(eventId), fetchFn, 300) // 5 minutes
}

/**
 * Invalidate guest cache when guests are updated
 */
export async function invalidateGuestCache(eventId: string): Promise<void> {
  await Promise.all([
    invalidate(guestListKey(eventId)),
    invalidate(confirmedGuestsKey(eventId)),
  ])
  dbLogger.info({ eventId }, 'Guest cache invalidated')
}

// ============================================================================
// Dashboard Caching
// ============================================================================

/**
 * Cache key for dashboard stats
 */
function dashboardStatsKey(adminId: string): string {
  return `dashboard:${adminId}:stats`
}

/**
 * Get or fetch dashboard stats with caching (2 min TTL)
 *
 * Shorter TTL for dashboard as it's more dynamic
 */
export async function getCachedDashboardStats<T>(
  adminId: string,
  fetchFn: () => Promise<T>
): Promise<T> {
  return await getOrSet(dashboardStatsKey(adminId), fetchFn, 120) // 2 minutes
}

/**
 * Invalidate dashboard cache for a specific admin
 */
export async function invalidateDashboardCache(adminId: string): Promise<void> {
  await invalidate(dashboardStatsKey(adminId))
  dbLogger.info({ adminId }, 'Dashboard cache invalidated')
}

// ============================================================================
// Session Caching (for check-in pages)
// ============================================================================

/**
 * Cache key for session participants
 */
function sessionParticipantsKey(sessionId: string): string {
  return `session:${sessionId}:participants`
}

/**
 * Get or fetch session participants with caching (5 min TTL)
 */
export async function getCachedSessionParticipants<T>(
  sessionId: string,
  fetchFn: () => Promise<T>
): Promise<T> {
  return await getOrSet(sessionParticipantsKey(sessionId), fetchFn, 300)
}

/**
 * Invalidate session cache when participants change
 */
export async function invalidateSessionCache(sessionId: string): Promise<void> {
  await invalidate(sessionParticipantsKey(sessionId))
  dbLogger.info({ sessionId }, 'Session cache invalidated')
}

// ============================================================================
// Helper: Cache Warming
// ============================================================================

/**
 * Warm up cache for an event (pre-load common queries)
 *
 * Call this after creating/updating an event to populate cache
 */
export async function warmEventCache(
  eventId: string,
  fetchEvent: () => Promise<any>,
  fetchStats: () => Promise<any>,
  fetchGuests: () => Promise<any>
): Promise<void> {
  if (!isCacheEnabled()) return

  try {
    await Promise.all([
      getCachedEvent(eventId, fetchEvent),
      getCachedEventStats(eventId, fetchStats),
      getCachedGuestList(eventId, fetchGuests),
    ])
    dbLogger.info({ eventId }, 'Event cache warmed')
  } catch (error) {
    dbLogger.warn({ error, eventId }, 'Failed to warm event cache')
  }
}

// ============================================================================
// Health Check
// ============================================================================

/**
 * Check if Redis cache is available and healthy
 */
export async function isCacheHealthy(): Promise<boolean> {
  if (!isCacheEnabled()) return false

  try {
    await redis!.ping()
    return true
  } catch {
    return false
  }
}

/**
 * Get cache statistics (for monitoring)
 */
export async function getCacheStats(): Promise<{
  enabled: boolean
  healthy: boolean
  info?: Record<string, any>
}> {
  const enabled = isCacheEnabled()

  if (!enabled) {
    return { enabled: false, healthy: false }
  }

  try {
    await redis!.ping()
    // Note: Upstash doesn't support INFO command, so we can't get detailed stats
    return {
      enabled: true,
      healthy: true,
      info: {
        provider: 'upstash',
        url: process.env.UPSTASH_REDIS_REST_URL?.split('@')[1], // Hide credentials
      },
    }
  } catch (error) {
    return {
      enabled: true,
      healthy: false,
      info: { error: error instanceof Error ? error.message : 'Unknown error' },
    }
  }
}
