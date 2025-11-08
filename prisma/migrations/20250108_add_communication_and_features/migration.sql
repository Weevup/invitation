-- AlterTable Event: Add RSVP configuration fields
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "rsvpDeadline" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "maxPlusOnes" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "allowPlusOnes" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "requireMeal" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "mealOptions" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable Event: Add communication configuration fields
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "saveTheDateConfig" JSONB,
ADD COLUMN IF NOT EXISTS "invitationConfig" JSONB,
ADD COLUMN IF NOT EXISTS "rsvpConfig" JSONB;

-- AlterTable Event: Add feature flags
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "enableTransport" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "enableLodging" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "enableAccessibility" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS "enablePhotoConsent" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable Event: Add advanced showcase fields
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "showcaseGallery" JSONB,
ADD COLUMN IF NOT EXISTS "showcaseFAQ" JSONB,
ADD COLUMN IF NOT EXISTS "showcaseSpeakers" JSONB,
ADD COLUMN IF NOT EXISTS "showcaseSponsors" JSONB,
ADD COLUMN IF NOT EXISTS "showcaseTimeline" JSONB,
ADD COLUMN IF NOT EXISTS "showcaseVideo" TEXT,
ADD COLUMN IF NOT EXISTS "showcaseSocialShare" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS "showcaseCountdown" BOOLEAN NOT NULL DEFAULT true;

-- Update showcaseEnabled default if it exists
ALTER TABLE "Event" ALTER COLUMN "showcaseEnabled" SET DEFAULT true;

-- CreateTable EmailTracking
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
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "EmailTracking_eventId_idx" ON "EmailTracking"("eventId");
CREATE INDEX IF NOT EXISTS "EmailTracking_guestId_idx" ON "EmailTracking"("guestId");
CREATE INDEX IF NOT EXISTS "EmailTracking_type_idx" ON "EmailTracking"("type");
CREATE INDEX IF NOT EXISTS "EmailTracking_status_idx" ON "EmailTracking"("status");

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'EmailTracking_eventId_fkey'
    ) THEN
        ALTER TABLE "EmailTracking" ADD CONSTRAINT "EmailTracking_eventId_fkey"
        FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'EmailTracking_guestId_fkey'
    ) THEN
        ALTER TABLE "EmailTracking" ADD CONSTRAINT "EmailTracking_guestId_fkey"
        FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
