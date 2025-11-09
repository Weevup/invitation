-- AlterTable
ALTER TABLE "Guest"
ADD COLUMN IF NOT EXISTS "invitationSentAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "invitationEmailId" TEXT;
