import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin, handleAuthError } from '@/lib/auth-utils'

/**
 * DELETE /api/admin/integrations/email/reset
 * Supprime TOUTES les intégrations email (utile après changement d'ENCRYPTION_KEY)
 */
export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin()

    // Supprimer toutes les intégrations email
    const result = await prisma.emailIntegration.deleteMany({})

    return NextResponse.json({
      success: true,
      message: `${result.count} intégration(s) supprimée(s)`,
      count: result.count,
    })
  } catch (error) {
    console.error('Error resetting integrations:', error)
    return handleAuthError(error)
  }
}
