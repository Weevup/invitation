import crypto from 'crypto'

/**
 * Centralized encryption utilities for sensitive data
 * Uses AES-256-CBC encryption algorithm
 */

// Validate and get encryption key (lazy initialization to avoid build-time errors)
let ENCRYPTION_KEY: string | null = null

function getEncryptionKey(): string {
  if (ENCRYPTION_KEY !== null) {
    return ENCRYPTION_KEY
  }

  const key = process.env.ENCRYPTION_KEY

  if (!key) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'ENCRYPTION_KEY must be defined in production (minimum 32 characters). ' +
        'Generate one with: openssl rand -hex 32'
      )
    }
    console.warn(
      '⚠️  Using default ENCRYPTION_KEY in development. ' +
      'Set ENCRYPTION_KEY in .env for production.'
    )
    // Use a random key in development to avoid accidental dependency on default
    ENCRYPTION_KEY = crypto.randomBytes(32).toString('hex')
    return ENCRYPTION_KEY
  }

  if (key.length < 32) {
    throw new Error(
      'ENCRYPTION_KEY must be at least 32 characters long for AES-256. ' +
      'Generate one with: openssl rand -hex 32'
    )
  }

  ENCRYPTION_KEY = key
  return ENCRYPTION_KEY
}

/**
 * Generate a 32-byte key from the encryption key (for AES-256)
 */
function getKey(): Buffer {
  return Buffer.from(
    crypto
      .createHash('sha256')
      .update(getEncryptionKey())
      .digest('hex')
      .slice(0, 64),
    'hex'
  )
}

/**
 * Encrypt a string value
 * @param text - The plain text to encrypt
 * @returns Encrypted string in format: iv:encryptedData
 */
export function encrypt(text: string): string {
  if (!text) {
    throw new Error('Cannot encrypt empty text')
  }

  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv('aes-256-cbc', getKey(), iv)

  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')

  return `${iv.toString('hex')}:${encrypted}`
}

/**
 * Decrypt an encrypted string
 * @param encryptedText - The encrypted text in format: iv:encryptedData
 * @returns Decrypted plain text
 */
export function decrypt(encryptedText: string): string {
  if (!encryptedText) {
    throw new Error('Cannot decrypt empty text')
  }

  const parts = encryptedText.split(':')
  if (parts.length !== 2) {
    throw new Error('Invalid encrypted text format. Expected format: iv:encryptedData')
  }

  const [ivHex, encrypted] = parts
  const iv = Buffer.from(ivHex, 'hex')
  const decipher = crypto.createDecipheriv('aes-256-cbc', getKey(), iv)

  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')

  return decrypted
}

/**
 * Check if a string appears to be encrypted (has iv:data format)
 */
export function isEncrypted(text: string): boolean {
  if (!text) return false
  const parts = text.split(':')
  return parts.length === 2 && /^[0-9a-f]+$/.test(parts[0]) && /^[0-9a-f]+$/.test(parts[1])
}

/**
 * Safely encrypt sensitive data, handling already encrypted data
 * @param text - Text that may or may not be encrypted
 * @returns Encrypted text
 */
export function safeEncrypt(text: string): string {
  if (!text) return text
  if (isEncrypted(text)) return text
  return encrypt(text)
}

/**
 * Safely decrypt data, handling plain text
 * @param text - Text that may or may not be encrypted
 * @returns Decrypted text
 */
export function safeDecrypt(text: string): string {
  if (!text) return text
  if (!isEncrypted(text)) return text
  return decrypt(text)
}
