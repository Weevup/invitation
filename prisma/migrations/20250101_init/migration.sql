-- CreateEnum
DO $$ BEGIN
 CREATE TYPE "UserRole" AS ENUM ('GUEST', 'ADMIN');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "GuestStatus" AS ENUM ('PENDING', 'INVITED', 'RESPONDED', 'BOUNCED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "EmailType" AS ENUM ('SAVE_THE_DATE', 'INVITE', 'INVITATION', 'REMINDER', 'CONFIRMATION', 'INFO', 'CUSTOM');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "EmailStatus" AS ENUM ('PENDING', 'SENT', 'DELIVERED', 'OPENED', 'CLICKED', 'BOUNCED', 'FAILED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- CreateTable User
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'GUEST',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable Event
CREATE TABLE IF NOT EXISTS "Event" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3),
    "venueName" TEXT,
    "address" TEXT,
    "city" TEXT,
    "country" TEXT,
    "coverImage" TEXT,
    "description" TEXT,
    "program" TEXT,
    "dressCode" TEXT,
    "adminId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable Guest
CREATE TABLE IF NOT EXISTS "Guest" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "company" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "token" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "tokenExpiry" TIMESTAMP(3),
    "status" "GuestStatus" NOT NULL DEFAULT 'PENDING',
    "lastEmailAt" TIMESTAMP(3),
    "invitationSentAt" TIMESTAMP(3),
    "invitationEmailId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Guest_pkey" PRIMARY KEY ("id")
);

-- CreateTable RSVP
CREATE TABLE IF NOT EXISTS "RSVP" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "guestId" TEXT NOT NULL,
    "attending" BOOLEAN,
    "plusOnes" INTEGER NOT NULL DEFAULT 0,
    "mealChoice" TEXT,
    "allergies" TEXT,
    "accessibilityNotes" TEXT,
    "transportNeeds" TEXT,
    "lodgingNeeds" TEXT,
    "consentPhotos" BOOLEAN NOT NULL DEFAULT false,
    "qrCodeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RSVP_pkey" PRIMARY KEY ("id")
);

-- CreateTable Checkin
CREATE TABLE IF NOT EXISTS "Checkin" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "guestId" TEXT NOT NULL,
    "qrCodeId" TEXT NOT NULL,
    "checkedInAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "desk" TEXT,
    "notes" TEXT,

    CONSTRAINT "Checkin_pkey" PRIMARY KEY ("id")
);

-- CreateTable EmailLog
CREATE TABLE IF NOT EXISTS "EmailLog" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "guestId" TEXT NOT NULL,
    "type" "EmailType" NOT NULL,
    "status" "EmailStatus" NOT NULL DEFAULT 'PENDING',
    "subject" TEXT NOT NULL,
    "providerId" TEXT,
    "sentAt" TIMESTAMP(3),
    "openedAt" TIMESTAMP(3),
    "clickedAt" TIMESTAMP(3),
    "bouncedAt" TIMESTAMP(3),
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");

CREATE UNIQUE INDEX IF NOT EXISTS "Event_slug_key" ON "Event"("slug");
CREATE INDEX IF NOT EXISTS "Event_slug_idx" ON "Event"("slug");
CREATE INDEX IF NOT EXISTS "Event_adminId_idx" ON "Event"("adminId");

CREATE UNIQUE INDEX IF NOT EXISTS "Guest_token_key" ON "Guest"("token");
CREATE UNIQUE INDEX IF NOT EXISTS "Guest_tokenHash_key" ON "Guest"("tokenHash");
CREATE UNIQUE INDEX IF NOT EXISTS "Guest_eventId_email_key" ON "Guest"("eventId", "email");
CREATE INDEX IF NOT EXISTS "Guest_tokenHash_idx" ON "Guest"("tokenHash");
CREATE INDEX IF NOT EXISTS "Guest_eventId_idx" ON "Guest"("eventId");

CREATE UNIQUE INDEX IF NOT EXISTS "RSVP_guestId_key" ON "RSVP"("guestId");
CREATE UNIQUE INDEX IF NOT EXISTS "RSVP_qrCodeId_key" ON "RSVP"("qrCodeId");
CREATE INDEX IF NOT EXISTS "RSVP_eventId_idx" ON "RSVP"("eventId");

CREATE INDEX IF NOT EXISTS "Checkin_eventId_idx" ON "Checkin"("eventId");
CREATE INDEX IF NOT EXISTS "Checkin_guestId_idx" ON "Checkin"("guestId");

CREATE INDEX IF NOT EXISTS "EmailLog_eventId_idx" ON "EmailLog"("eventId");
CREATE INDEX IF NOT EXISTS "EmailLog_guestId_idx" ON "EmailLog"("guestId");
CREATE INDEX IF NOT EXISTS "EmailLog_status_idx" ON "EmailLog"("status");

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'Event_adminId_fkey'
    ) THEN
        ALTER TABLE "Event" ADD CONSTRAINT "Event_adminId_fkey"
        FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'Guest_eventId_fkey'
    ) THEN
        ALTER TABLE "Guest" ADD CONSTRAINT "Guest_eventId_fkey"
        FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'RSVP_eventId_fkey'
    ) THEN
        ALTER TABLE "RSVP" ADD CONSTRAINT "RSVP_eventId_fkey"
        FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'RSVP_guestId_fkey'
    ) THEN
        ALTER TABLE "RSVP" ADD CONSTRAINT "RSVP_guestId_fkey"
        FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'Checkin_eventId_fkey'
    ) THEN
        ALTER TABLE "Checkin" ADD CONSTRAINT "Checkin_eventId_fkey"
        FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'Checkin_guestId_fkey'
    ) THEN
        ALTER TABLE "Checkin" ADD CONSTRAINT "Checkin_guestId_fkey"
        FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'EmailLog_eventId_fkey'
    ) THEN
        ALTER TABLE "EmailLog" ADD CONSTRAINT "EmailLog_eventId_fkey"
        FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'EmailLog_guestId_fkey'
    ) THEN
        ALTER TABLE "EmailLog" ADD CONSTRAINT "EmailLog_guestId_fkey"
        FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
