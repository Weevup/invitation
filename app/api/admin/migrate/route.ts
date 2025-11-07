import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    // Execute migration SQL to add showcase fields
    await prisma.$executeRaw`
      ALTER TABLE "Event"
      ADD COLUMN IF NOT EXISTS "showcaseEnabled" BOOLEAN NOT NULL DEFAULT false,
      ADD COLUMN IF NOT EXISTS "showcaseTitle" TEXT,
      ADD COLUMN IF NOT EXISTS "showcaseSubtitle" TEXT,
      ADD COLUMN IF NOT EXISTS "showcaseBannerImage" TEXT,
      ADD COLUMN IF NOT EXISTS "showcaseTheme" TEXT NOT NULL DEFAULT 'weevup',
      ADD COLUMN IF NOT EXISTS "showcaseSections" JSONB,
      ADD COLUMN IF NOT EXISTS "showcaseCustomCSS" TEXT,
      ADD COLUMN IF NOT EXISTS "showcasePrimaryColor" TEXT NOT NULL DEFAULT '#004645',
      ADD COLUMN IF NOT EXISTS "showcaseSecondaryColor" TEXT NOT NULL DEFAULT '#FF4713',
      ADD COLUMN IF NOT EXISTS "showcaseGallery" JSONB,
      ADD COLUMN IF NOT EXISTS "showcaseFAQ" JSONB,
      ADD COLUMN IF NOT EXISTS "showcaseSpeakers" JSONB,
      ADD COLUMN IF NOT EXISTS "showcaseSponsors" JSONB,
      ADD COLUMN IF NOT EXISTS "showcaseTimeline" JSONB,
      ADD COLUMN IF NOT EXISTS "showcaseVideo" TEXT,
      ADD COLUMN IF NOT EXISTS "showcaseSocialShare" BOOLEAN NOT NULL DEFAULT true,
      ADD COLUMN IF NOT EXISTS "showcaseCountdown" BOOLEAN NOT NULL DEFAULT true
    `

    return NextResponse.json({
      success: true,
      message: 'Migration appliquée avec succès',
    })
  } catch (error) {
    console.error('Error applying migration:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la migration',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
