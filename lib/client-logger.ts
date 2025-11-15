/**
 * Client-Side Error Handling and Logging Utility
 *
 * Provides centralized error handling for client-side code with:
 * - Consistent error logging
 * - User-friendly error messages
 * - Production monitoring integration (Sentry, etc.)
 * - Development debugging support
 */

export interface ErrorContext {
  /** Component or module where error occurred */
  component?: string
  /** Action being performed when error occurred */
  action?: string
  /** Additional context data */
  metadata?: Record<string, any>
}

export interface ClientLoggerConfig {
  /** Enable Sentry or other monitoring in production */
  enableMonitoring?: boolean
  /** Environment (development, production) */
  environment?: string
}

class ClientLogger {
  private config: ClientLoggerConfig
  private isDevelopment: boolean

  constructor(config: ClientLoggerConfig = {}) {
    this.config = config
    this.isDevelopment = process.env.NODE_ENV === 'development'
  }

  /**
   * Log an error with context
   * In development: logs to console
   * In production: can send to monitoring service
   */
  error(error: Error | unknown, context?: ErrorContext): void {
    const errorMessage = this.formatError(error)
    const fullContext = {
      timestamp: new Date().toISOString(),
      ...context,
      error: errorMessage,
    }

    // Always log to console in development
    if (this.isDevelopment) {
      console.error('[Client Error]', fullContext)
      if (error instanceof Error && error.stack) {
        console.error('Stack trace:', error.stack)
      }
    }

    // In production, send to monitoring service
    if (!this.isDevelopment && this.config.enableMonitoring) {
      this.sendToMonitoring(error, fullContext)
    }
  }

  /**
   * Log a warning
   */
  warn(message: string, context?: ErrorContext): void {
    const fullContext = {
      timestamp: new Date().toISOString(),
      ...context,
      message,
    }

    if (this.isDevelopment) {
      console.warn('[Client Warning]', fullContext)
    }

    if (!this.isDevelopment && this.config.enableMonitoring) {
      this.sendToMonitoring(new Error(message), { ...fullContext, level: 'warning' })
    }
  }

  /**
   * Log info message (development only)
   */
  info(message: string, data?: Record<string, any>): void {
    if (this.isDevelopment) {
      console.log('[Client Info]', message, data)
    }
  }

  /**
   * Format error into readable message
   */
  private formatError(error: Error | unknown): string {
    if (error instanceof Error) {
      return error.message
    }
    if (typeof error === 'string') {
      return error
    }
    return 'Unknown error occurred'
  }

  /**
   * Send error to monitoring service (Sentry, LogRocket, etc.)
   * Placeholder for future integration
   */
  private sendToMonitoring(error: Error | unknown, context: Record<string, any>): void {
    // TODO: Integrate with Sentry or other monitoring service
    // Example:
    // if (typeof window !== 'undefined' && window.Sentry) {
    //   window.Sentry.captureException(error, { extra: context })
    // }
  }
}

// Singleton instance
const clientLogger = new ClientLogger({
  enableMonitoring: process.env.NODE_ENV === 'production',
  environment: process.env.NODE_ENV,
})

/**
 * Create a scoped logger for a specific component or module
 */
export function createClientLogger(defaultContext: ErrorContext) {
  return {
    error: (error: Error | unknown, additionalContext?: Partial<ErrorContext>) =>
      clientLogger.error(error, { ...defaultContext, ...additionalContext }),

    warn: (message: string, additionalContext?: Partial<ErrorContext>) =>
      clientLogger.warn(message, { ...defaultContext, ...additionalContext }),

    info: (message: string, data?: Record<string, any>) =>
      clientLogger.info(message, data),
  }
}

/**
 * Handle async errors with automatic logging
 * Usage: handleAsyncError(asyncFunction, { component: 'MyComponent', action: 'fetchData' })
 */
export async function handleAsyncError<T>(
  fn: () => Promise<T>,
  context: ErrorContext,
  onError?: (error: Error | unknown) => void
): Promise<T | null> {
  try {
    return await fn()
  } catch (error) {
    clientLogger.error(error, context)
    if (onError) {
      onError(error)
    }
    return null
  }
}

/**
 * Get user-friendly error message
 */
export function getUserErrorMessage(error: Error | unknown): string {
  if (error instanceof Error) {
    // Check for common error patterns
    if (error.message.includes('fetch')) {
      return 'Erreur de connexion. Veuillez vérifier votre connexion internet.'
    }
    if (error.message.includes('401') || error.message.includes('403')) {
      return 'Vous n\'êtes pas autorisé à effectuer cette action.'
    }
    if (error.message.includes('404')) {
      return 'Ressource non trouvée.'
    }
    if (error.message.includes('500')) {
      return 'Erreur serveur. Veuillez réessayer plus tard.'
    }

    // Return the error message if it looks user-friendly
    if (error.message.length < 100 && !error.message.includes('TypeError')) {
      return error.message
    }
  }

  return 'Une erreur est survenue. Veuillez réessayer.'
}

// Export singleton for direct usage
export { clientLogger }
export default clientLogger
