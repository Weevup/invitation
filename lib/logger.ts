import pino from 'pino'

/**
 * Centralized logging system using Pino
 *
 * Usage:
 *   import { logger } from '@/lib/logger'
 *
 *   logger.info({ userId: '123', eventId: '456' }, 'User accessed event')
 *   logger.error({ error }, 'Failed to send email')
 *   logger.debug({ data }, 'Debug information')
 */

// Determine log level based on environment
const logLevel = process.env.NODE_ENV === 'production'
  ? 'info'
  : process.env.LOG_LEVEL || 'debug'

// Browser-safe logger configuration
const isBrowser = typeof window !== 'undefined'

export const logger = isBrowser
  ? // Browser logger (minimal, logs to console)
    pino({
      level: logLevel,
      browser: {
        asObject: true,
      },
    })
  : // Server logger (structured, pretty in dev)
    pino({
      level: logLevel,
      formatters: {
        level: (label) => {
          return { level: label }
        },
      },
      transport: process.env.NODE_ENV !== 'production'
        ? {
            target: 'pino-pretty',
            options: {
              colorize: true,
              translateTime: 'SYS:standard',
              ignore: 'pid,hostname',
            },
          }
        : undefined,
    })

/**
 * Create a child logger with additional context
 *
 * @example
 * const eventLogger = createLogger({ module: 'events', eventId: '123' })
 * eventLogger.info('Event created')
 */
export function createLogger(bindings: Record<string, any>) {
  return logger.child(bindings)
}

/**
 * Log request/response for API routes
 *
 * @example
 * export async function GET(request: Request) {
 *   const reqLogger = logRequest(request, '/api/events')
 *   try {
 *     // ... handle request
 *     reqLogger.info({ status: 200 }, 'Request successful')
 *   } catch (error) {
 *     reqLogger.error({ error }, 'Request failed')
 *   }
 * }
 */
export function logRequest(request: Request, route: string) {
  const method = request.method
  const url = new URL(request.url)

  return createLogger({
    module: 'api',
    route,
    method,
    path: url.pathname,
    query: Object.fromEntries(url.searchParams),
  })
}

/**
 * Performance timing helper
 *
 * @example
 * const timer = startTimer()
 * // ... do some work
 * timer.end({ operation: 'fetchGuests' }, 'Guests fetched')
 */
export function startTimer() {
  const start = Date.now()

  return {
    end: (bindings: Record<string, any>, message: string) => {
      const duration = Date.now() - start
      logger.info({ ...bindings, duration }, message)
    },
  }
}

/**
 * Log database queries (for debugging slow queries)
 */
export const dbLogger = createLogger({ module: 'database' })

/**
 * Log email operations
 */
export const emailLogger = createLogger({ module: 'email' })

/**
 * Log authentication operations
 */
export const authLogger = createLogger({ module: 'auth' })

/**
 * Log RSVP operations
 */
export const rsvpLogger = createLogger({ module: 'rsvp' })
