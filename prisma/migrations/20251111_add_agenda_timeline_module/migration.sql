-- CreateEnum for Session and Timeline types
CREATE TYPE "SessionType" AS ENUM ('KEYNOTE', 'WORKSHOP', 'CONFERENCE', 'TEAMBUILDING', 'MEAL', 'BREAK', 'TRANSFER', 'ARRIVAL', 'DEPARTURE', 'FREE_TIME', 'NETWORKING', 'TRAINING', 'PANEL', 'OTHER');

CREATE TYPE "SessionStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ONGOING', 'COMPLETED', 'CANCELLED');

CREATE TYPE "TimelineType" AS ENUM ('SESSION', 'TRANSPORT_ARRIVAL', 'TRANSPORT_DEPARTURE', 'HOTEL_CHECKIN', 'HOTEL_CHECKOUT', 'MEAL', 'BREAK', 'TRANSFER', 'FREE_TIME', 'CUSTOM');

-- AlterTable TransportBooking - Add new fields
ALTER TABLE "TransportBooking"
ADD COLUMN IF NOT EXISTS "departureTime" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "arrivalTime" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "manifestId" TEXT,
ADD COLUMN IF NOT EXISTS "linkedSessionId" TEXT;

-- CreateTable Session
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "SessionType" NOT NULL,
    "status" "SessionStatus" NOT NULL DEFAULT 'DRAFT',
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER NOT NULL,
    "venue" TEXT,
    "room" TEXT,
    "address" TEXT,
    "capacity" INTEGER,
    "minParticipants" INTEGER,
    "requiresRegistration" BOOLEAN NOT NULL DEFAULT false,
    "registrationDeadline" TIMESTAMP(3),
    "registrationsClosed" BOOLEAN NOT NULL DEFAULT false,
    "speakers" JSONB,
    "equipment" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "materials" TEXT,
    "catering" TEXT,
    "color" TEXT,
    "icon" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "isHighlighted" BOOLEAN NOT NULL DEFAULT false,
    "timelineOrder" INTEGER,
    "notes" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable SessionParticipant
CREATE TABLE "SessionParticipant" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "guestId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'registered',
    "waitlistPosition" INTEGER,
    "checkedInAt" TIMESTAMP(3),
    "checkedInBy" TEXT,
    "rating" INTEGER,
    "feedback" TEXT,
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "SessionParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable TimelineEvent
CREATE TABLE "TimelineEvent" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "type" "TimelineType" NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "allDay" BOOLEAN NOT NULL DEFAULT false,
    "sessionId" TEXT,
    "transportId" TEXT,
    "accommodationId" TEXT,
    "affectedGuestIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isGlobalEvent" BOOLEAN NOT NULL DEFAULT false,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "color" TEXT,
    "location" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "notifyParticipants" BOOLEAN NOT NULL DEFAULT false,
    "notificationSent" BOOLEAN NOT NULL DEFAULT false,
    "notifyBefore" INTEGER,
    "order" INTEGER NOT NULL DEFAULT 0,
    "category" TEXT,
    "metadata" JSONB,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TimelineEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Session_eventId_startTime_idx" ON "Session"("eventId", "startTime");
CREATE INDEX "Session_type_idx" ON "Session"("type");
CREATE INDEX "Session_status_idx" ON "Session"("status");

CREATE UNIQUE INDEX "SessionParticipant_sessionId_guestId_key" ON "SessionParticipant"("sessionId", "guestId");
CREATE INDEX "SessionParticipant_sessionId_idx" ON "SessionParticipant"("sessionId");
CREATE INDEX "SessionParticipant_guestId_idx" ON "SessionParticipant"("guestId");
CREATE INDEX "SessionParticipant_status_idx" ON "SessionParticipant"("status");

CREATE INDEX "TimelineEvent_eventId_startTime_idx" ON "TimelineEvent"("eventId", "startTime");
CREATE INDEX "TimelineEvent_type_idx" ON "TimelineEvent"("type");
CREATE INDEX "TimelineEvent_isPublic_idx" ON "TimelineEvent"("isPublic");

CREATE INDEX "TransportBooking_departureTime_idx" ON "TransportBooking"("departureTime");
CREATE INDEX "TransportBooking_arrivalTime_idx" ON "TransportBooking"("arrivalTime");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SessionParticipant" ADD CONSTRAINT "SessionParticipant_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SessionParticipant" ADD CONSTRAINT "SessionParticipant_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "TimelineEvent" ADD CONSTRAINT "TimelineEvent_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "TransportBooking" ADD CONSTRAINT "TransportBooking_manifestId_fkey" FOREIGN KEY ("manifestId") REFERENCES "TransportManifest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "TransportBooking" ADD CONSTRAINT "TransportBooking_linkedSessionId_fkey" FOREIGN KEY ("linkedSessionId") REFERENCES "Session"("id") ON DELETE SET NULL ON UPDATE CASCADE;
