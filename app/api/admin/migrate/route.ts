import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    // Execute migration SQL to add all fields
    // Step 1: Add showcase fields
    await prisma.$executeRaw`
      ALTER TABLE "Event"
      ADD COLUMN IF NOT EXISTS "showcaseEnabled" BOOLEAN NOT NULL DEFAULT true,
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

    // Step 2: Add RSVP configuration fields
    await prisma.$executeRaw`
      ALTER TABLE "Event"
      ADD COLUMN IF NOT EXISTS "rsvpDeadline" TIMESTAMP(3),
      ADD COLUMN IF NOT EXISTS "maxPlusOnes" INTEGER NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "allowPlusOnes" BOOLEAN NOT NULL DEFAULT false,
      ADD COLUMN IF NOT EXISTS "requireMeal" BOOLEAN NOT NULL DEFAULT false,
      ADD COLUMN IF NOT EXISTS "mealOptions" TEXT[] DEFAULT ARRAY[]::TEXT[]
    `

    // Step 3: Add communication configuration fields
    await prisma.$executeRaw`
      ALTER TABLE "Event"
      ADD COLUMN IF NOT EXISTS "saveTheDateConfig" JSONB,
      ADD COLUMN IF NOT EXISTS "invitationConfig" JSONB,
      ADD COLUMN IF NOT EXISTS "rsvpConfig" JSONB
    `

    // Step 4: Add feature flags
    await prisma.$executeRaw`
      ALTER TABLE "Event"
      ADD COLUMN IF NOT EXISTS "enableTransport" BOOLEAN NOT NULL DEFAULT false,
      ADD COLUMN IF NOT EXISTS "enableLodging" BOOLEAN NOT NULL DEFAULT false,
      ADD COLUMN IF NOT EXISTS "enableAccessibility" BOOLEAN NOT NULL DEFAULT true,
      ADD COLUMN IF NOT EXISTS "enablePhotoConsent" BOOLEAN NOT NULL DEFAULT true
    `

    // Step 5: Create EmailTracking table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "EmailTracking" (
        "id" TEXT NOT NULL,
        "eventId" TEXT NOT NULL,
        "guestId" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "status" TEXT NOT NULL,
        "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "openedAt" TIMESTAMP(3),
        "clickedAt" TIMESTAMP(3),
        CONSTRAINT "EmailTracking_pkey" PRIMARY KEY ("id")
      )
    `)

    // Step 6: Create indexes for EmailTracking
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "EmailTracking_eventId_idx" ON "EmailTracking"("eventId")`)
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "EmailTracking_guestId_idx" ON "EmailTracking"("guestId")`)
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "EmailTracking_type_idx" ON "EmailTracking"("type")`)
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "EmailTracking_status_idx" ON "EmailTracking"("status")`)

    // Step 7: Add foreign keys for EmailTracking
    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'EmailTracking_eventId_fkey'
        ) THEN
          ALTER TABLE "EmailTracking" ADD CONSTRAINT "EmailTracking_eventId_fkey"
          FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;
      END $$;
    `)

    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'EmailTracking_guestId_fkey'
        ) THEN
          ALTER TABLE "EmailTracking" ADD CONSTRAINT "EmailTracking_guestId_fkey"
          FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;
      END $$;
    `)

    return NextResponse.json({
      success: true,
      message: 'Migration appliquée avec succès - Tous les champs ont été ajoutés',
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
