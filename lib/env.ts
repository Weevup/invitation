/**
 * Environment variable validation
 * This file validates critical environment variables at startup
 * to fail fast if configuration is incorrect
 */

const isProduction = process.env.NODE_ENV === 'production'
const isDevelopment = process.env.NODE_ENV === 'development'

/**
 * Validate and get NEXT_PUBLIC_APP_URL
 */
export function getAppUrl(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL

  if (!url) {
    if (isProduction) {
      throw new Error(
        'NEXT_PUBLIC_APP_URL must be set in production. ' +
        'This is required for generating invitation links and redirects.'
      )
    }
    console.warn('⚠️  NEXT_PUBLIC_APP_URL not set, using default: http://localhost:3000')
    return 'http://localhost:3000'
  }

  // Validate URL format
  try {
    new URL(url)
  } catch (error) {
    throw new Error(
      `NEXT_PUBLIC_APP_URL is not a valid URL: ${url}. ` +
      'It must be a complete URL including protocol (e.g., https://example.com)'
    )
  }

  // Warn if using localhost in production
  if (isProduction && (url.includes('localhost') || url.includes('127.0.0.1'))) {
    console.error(
      '❌ NEXT_PUBLIC_APP_URL is set to localhost in production! ' +
      'This will break invitation links. Set it to your production domain.'
    )
  }

  return url
}

/**
 * Get app URL without throwing errors (for optional usage)
 */
export function getAppUrlSafe(): string {
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
}

/**
 * Validate critical environment variables on startup
 * Call this in your root layout or application entry point
 */
export function validateEnv(): void {
  const errors: string[] = []
  const warnings: string[] = []

  // Database URL
  if (!process.env.DATABASE_URL) {
    errors.push('DATABASE_URL is required')
  }

  // App URL (production only)
  if (isProduction) {
    try {
      getAppUrl()
    } catch (error) {
      errors.push((error as Error).message)
    }
  }

  // Auth secret (production only)
  if (isProduction) {
    const authSecret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET
    if (!authSecret) {
      errors.push('AUTH_SECRET or NEXTAUTH_SECRET must be set in production')
    } else if (authSecret.length < 32) {
      warnings.push('AUTH_SECRET should be at least 32 characters for security')
    }
  }

  // JWT secret (production only)
  if (isProduction && !process.env.JWT_SECRET) {
    errors.push('JWT_SECRET must be set in production')
  }

  // Encryption key (production only)
  if (isProduction) {
    const encryptionKey = process.env.ENCRYPTION_KEY
    if (!encryptionKey) {
      errors.push('ENCRYPTION_KEY must be set in production')
    } else if (encryptionKey.length < 32) {
      errors.push('ENCRYPTION_KEY must be at least 32 characters long')
    }
  }

  // Email configuration
  const hasEmailProvider = process.env.RESEND_API_KEY || process.env.SENDGRID_API_KEY || process.env.SMTP_HOST
  if (!hasEmailProvider && !isDevelopment) {
    warnings.push(
      'No email provider configured. ' +
      'Set RESEND_API_KEY, SENDGRID_API_KEY, or SMTP_HOST to send emails.'
    )
  }

  // Display errors and warnings
  if (errors.length > 0) {
    console.error('\n❌ Environment validation failed:\n')
    errors.forEach(error => console.error(`  - ${error}`))
    console.error('\nCheck your .env file and compare with .env.example\n')

    if (isProduction) {
      throw new Error('Environment validation failed. See errors above.')
    }
  }

  if (warnings.length > 0) {
    console.warn('\n⚠️  Environment warnings:\n')
    warnings.forEach(warning => console.warn(`  - ${warning}`))
    console.warn('')
  }

  if (errors.length === 0 && warnings.length === 0 && isDevelopment) {
    console.log('✅ Environment validation passed')
  }
}
