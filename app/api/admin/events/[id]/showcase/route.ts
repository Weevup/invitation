import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface RouteContext {
  params: Promise<{
    id: string
  }>
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params
    const body = await request.json()

    const {
      showcaseEnabled,
      showcaseTitle,
      showcaseSubtitle,
      showcaseBannerImage,
      showcasePrimaryColor,
      showcaseSecondaryColor,
      showcaseSections,
      showcaseCustomCSS,
    } = body

    // Update event with showcase settings
    const event = await prisma.event.update({
      where: { id },
      data: {
        showcaseEnabled: showcaseEnabled ?? false,
        showcaseTitle: showcaseTitle || null,
        showcaseSubtitle: showcaseSubtitle || null,
        showcaseBannerImage: showcaseBannerImage || null,
        showcasePrimaryColor: showcasePrimaryColor || '#004645',
        showcaseSecondaryColor: showcaseSecondaryColor || '#FF4713',
        showcaseSections: showcaseSections || ['hero', 'description', 'details', 'cta'],
        showcaseCustomCSS: showcaseCustomCSS || null,
      },
    })

    return NextResponse.json({
      success: true,
      event,
    })
  } catch (error) {
    console.error('Error updating showcase:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la mise à jour',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
