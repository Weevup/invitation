import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin, handleAuthError } from '@/lib/auth-utils'
import { safeDecrypt, isEncrypted } from '@/lib/encryption'

/**
 * GET /api/admin/integrations/email/debug
 * Diagnostic pour vérifier le chiffrement/déchiffrement des clés API
 */
export async function GET() {
  try {
    await requireAdmin()

    // Récupérer toutes les intégrations
    const integrations = await prisma.emailIntegration.findMany({
      select: {
        id: true,
        provider: true,
        isActive: true,
        isPrimary: true,
        apiKey: true,
        fromEmail: true,
        createdAt: true,
        updatedAt: true,
      }
    })

    const diagnostics = integrations.map(integration => {
      let decryptedKey: string | null = null
      let decryptError: string | null = null
      let keyFormat: string = 'N/A'

      if (integration.apiKey) {
        try {
          // Vérifier si la clé est chiffrée
          const encrypted = isEncrypted(integration.apiKey)

          // Essayer de déchiffrer
          decryptedKey = safeDecrypt(integration.apiKey)

          // Masquer la clé (montrer seulement début et fin)
          if (decryptedKey && decryptedKey.length > 8) {
            keyFormat = `${decryptedKey.slice(0, 6)}...${decryptedKey.slice(-4)}`
          }

          return {
            id: integration.id,
            provider: integration.provider,
            isActive: integration.isActive,
            isPrimary: integration.isPrimary,
            fromEmail: integration.fromEmail,
            encryptionStatus: {
              isEncrypted: encrypted,
              canDecrypt: true,
              keyFormat,
              startsWithSG: decryptedKey?.startsWith('SG.') || false,
              keyLength: decryptedKey?.length || 0,
              hasSpaces: decryptedKey?.includes(' ') || false,
              hasNewlines: decryptedKey?.includes('\n') || decryptedKey?.includes('\r') || false,
            },
            createdAt: integration.createdAt,
            updatedAt: integration.updatedAt,
          }
        } catch (error) {
          decryptError = error instanceof Error ? error.message : 'Unknown error'
          return {
            id: integration.id,
            provider: integration.provider,
            isActive: integration.isActive,
            isPrimary: integration.isPrimary,
            fromEmail: integration.fromEmail,
            encryptionStatus: {
              isEncrypted: isEncrypted(integration.apiKey),
              canDecrypt: false,
              error: decryptError,
              rawKeyPreview: integration.apiKey.slice(0, 50) + '...',
            },
            createdAt: integration.createdAt,
            updatedAt: integration.updatedAt,
          }
        }
      }

      return {
        id: integration.id,
        provider: integration.provider,
        isActive: integration.isActive,
        isPrimary: integration.isPrimary,
        fromEmail: integration.fromEmail,
        encryptionStatus: {
          hasApiKey: false,
        },
        createdAt: integration.createdAt,
        updatedAt: integration.updatedAt,
      }
    })

    return NextResponse.json({
      integrations: diagnostics,
      encryptionKeySet: !!process.env.ENCRYPTION_KEY,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return handleAuthError(error)
  }
}
