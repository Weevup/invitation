-- AlterTable Guest: Add enhanced fields
ALTER TABLE "Guest" ADD COLUMN IF NOT EXISTS "emergencyContact" JSONB;
ALTER TABLE "Guest" ADD COLUMN IF NOT EXISTS "tShirtSize" TEXT;
ALTER TABLE "Guest" ADD COLUMN IF NOT EXISTS "arrivalTime" TIMESTAMP(3);
ALTER TABLE "Guest" ADD COLUMN IF NOT EXISTS "departureTime" TIMESTAMP(3);

-- AlterTable Event: Add enhanced fields
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "capacity" INTEGER;
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "registrationDeadline" TIMESTAMP(3);
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "hashtag" TEXT;
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "socialMediaUrls" JSONB;
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "budgetTotal" DOUBLE PRECISION;
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "budgetCurrency" TEXT NOT NULL DEFAULT 'EUR';

-- AlterTable Session: Add enhanced fields
ALTER TABLE "Session" ADD COLUMN IF NOT EXISTS "prerequisites" TEXT;
ALTER TABLE "Session" ADD COLUMN IF NOT EXISTS "difficulty" TEXT;
ALTER TABLE "Session" ADD COLUMN IF NOT EXISTS "targetAudience" TEXT;
