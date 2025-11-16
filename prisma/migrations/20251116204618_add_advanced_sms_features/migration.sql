-- CreateEnum
CREATE TYPE "SMSCampaignStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'SENDING', 'SENT', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ScheduledSMSStatus" AS ENUM ('PENDING', 'SCHEDULED', 'SENDING', 'SENT', 'FAILED', 'CANCELLED');

-- CreateTable
CREATE TABLE "SMSTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL DEFAULT 'custom',
    "message" TEXT NOT NULL,
    "variables" JSONB NOT NULL DEFAULT '[]',
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "lastUsedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "eventId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SMSTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SMSCampaign" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "eventId" TEXT NOT NULL,
    "templateId" TEXT,
    "message" TEXT,
    "targetType" TEXT NOT NULL DEFAULT 'manual',
    "targetTags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "guestIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "scheduledFor" TIMESTAMP(3),
    "status" "SMSCampaignStatus" NOT NULL DEFAULT 'DRAFT',
    "sentCount" INTEGER NOT NULL DEFAULT 0,
    "failedCount" INTEGER NOT NULL DEFAULT 0,
    "sentAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SMSCampaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduledSMS" (
    "id" TEXT NOT NULL,
    "guestId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "campaignId" TEXT,
    "message" TEXT NOT NULL,
    "templateName" TEXT,
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "status" "ScheduledSMSStatus" NOT NULL DEFAULT 'PENDING',
    "sentAt" TIMESTAMP(3),
    "notificationId" TEXT,
    "error" TEXT,
    "maxRetries" INTEGER NOT NULL DEFAULT 0,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScheduledSMS_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SMSOptOut" (
    "id" TEXT NOT NULL,
    "guestId" TEXT,
    "phone" TEXT NOT NULL,
    "reason" TEXT,
    "source" TEXT NOT NULL DEFAULT 'manual',
    "metadata" JSONB,
    "optedOutAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SMSOptOut_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SMSTemplate_eventId_idx" ON "SMSTemplate"("eventId");

-- CreateIndex
CREATE INDEX "SMSTemplate_category_idx" ON "SMSTemplate"("category");

-- CreateIndex
CREATE INDEX "SMSTemplate_isActive_idx" ON "SMSTemplate"("isActive");

-- CreateIndex
CREATE INDEX "SMSCampaign_eventId_idx" ON "SMSCampaign"("eventId");

-- CreateIndex
CREATE INDEX "SMSCampaign_status_idx" ON "SMSCampaign"("status");

-- CreateIndex
CREATE INDEX "SMSCampaign_scheduledFor_idx" ON "SMSCampaign"("scheduledFor");

-- CreateIndex
CREATE INDEX "ScheduledSMS_guestId_idx" ON "ScheduledSMS"("guestId");

-- CreateIndex
CREATE INDEX "ScheduledSMS_eventId_idx" ON "ScheduledSMS"("eventId");

-- CreateIndex
CREATE INDEX "ScheduledSMS_campaignId_idx" ON "ScheduledSMS"("campaignId");

-- CreateIndex
CREATE INDEX "ScheduledSMS_status_idx" ON "ScheduledSMS"("status");

-- CreateIndex
CREATE INDEX "ScheduledSMS_scheduledFor_idx" ON "ScheduledSMS"("scheduledFor");

-- CreateIndex
CREATE UNIQUE INDEX "SMSOptOut_phone_key" ON "SMSOptOut"("phone");

-- CreateIndex
CREATE INDEX "SMSOptOut_guestId_idx" ON "SMSOptOut"("guestId");

-- CreateIndex
CREATE INDEX "SMSOptOut_phone_idx" ON "SMSOptOut"("phone");

-- AddForeignKey
ALTER TABLE "SMSTemplate" ADD CONSTRAINT "SMSTemplate_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SMSCampaign" ADD CONSTRAINT "SMSCampaign_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SMSCampaign" ADD CONSTRAINT "SMSCampaign_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "SMSTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledSMS" ADD CONSTRAINT "ScheduledSMS_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledSMS" ADD CONSTRAINT "ScheduledSMS_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledSMS" ADD CONSTRAINT "ScheduledSMS_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "SMSCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SMSOptOut" ADD CONSTRAINT "SMSOptOut_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
