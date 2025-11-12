import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin, handleAuthError } from '@/lib/auth-utils'
import { requireEventOwnership } from '@/lib/permissions'

/**
 * GET /api/admin/events/[id]/showcase-data
 * Récupère uniquement les données showcase (optimisé pour performance)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin()
    const { id } = await params

    // Vérifier que l'admin est propriétaire de l'événement
    await requireEventOwnership(id, session.user.id)

    // Récupérer UNIQUEMENT les champs nécessaires pour le showcase
    const event = await prisma.event.findUnique({
      where: { id },
      select: {
        id: true,
        slug: true,
        showcaseEnabled: true,
        showcaseTitle: true,
        showcaseSubtitle: true,
        showcaseBannerImage: true,
        showcaseTheme: true,
        showcaseSections: true,
        showcasePrimaryColor: true,
        showcaseSecondaryColor: true,
        showcaseCustomCSS: true,
        showcaseGallery: true,
        showcaseFAQ: true,
        showcaseVideo: true,
        showcaseCountdown: true,
        showcaseSocialShare: true,
        showcaseSpeakers: true,
        showcaseSponsors: true,
        showcaseTimeline: true,
        showcaseSectionContents: true,
      },
    })

    if (!event) {
      return NextResponse.json(
        { error: 'Événement introuvable' },
        { status: 404 }
      )
    }

    return NextResponse.json(event)
  } catch (error) {
    return handleAuthError(error)
  }
}
