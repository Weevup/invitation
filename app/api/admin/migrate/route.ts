import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    // =====================================================
    // ÉTAPE 1: Créer tous les ENUMs
    // =====================================================

    await prisma.$executeRawUnsafe(`
      DO $$ BEGIN
        CREATE TYPE "UserRole" AS ENUM ('GUEST', 'ADMIN');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `)

    await prisma.$executeRawUnsafe(`
      DO $$ BEGIN
        CREATE TYPE "GuestStatus" AS ENUM ('PENDING', 'INVITED', 'RESPONDED', 'BOUNCED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `)

    await prisma.$executeRawUnsafe(`
      DO $$ BEGIN
        CREATE TYPE "EmailType" AS ENUM ('SAVE_THE_DATE', 'INVITE', 'INVITATION', 'REMINDER', 'CONFIRMATION', 'INFO', 'CUSTOM');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `)

    await prisma.$executeRawUnsafe(`
      DO $$ BEGIN
        CREATE TYPE "EmailStatus" AS ENUM ('PENDING', 'SENT', 'DELIVERED', 'OPENED', 'CLICKED', 'BOUNCED', 'FAILED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `)

    await prisma.$executeRawUnsafe(`
      DO $$ BEGIN
        CREATE TYPE "EmailProvider" AS ENUM ('SENDGRID', 'RESEND', 'MAILGUN', 'SMTP');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `)

    // =====================================================
    // ÉTAPE 2: Créer la table User
    // =====================================================

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "User" (
        "id" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "role" "UserRole" NOT NULL DEFAULT 'GUEST',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "User_pkey" PRIMARY KEY ("id")
      )
    `)

    await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email")`)

    // =====================================================
    // ÉTAPE 3: Créer la table Event
    // =====================================================

    await prisma.$executeRawUnsafe(`
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
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
      )
    `)

    await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "Event_slug_key" ON "Event"("slug")`)
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Event_slug_idx" ON "Event"("slug")`)
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Event_adminId_idx" ON "Event"("adminId")`)

    // Ajouter la foreign key pour Event -> User
    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'Event_adminId_fkey'
        ) THEN
          ALTER TABLE "Event" ADD CONSTRAINT "Event_adminId_fkey"
          FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;
      END $$;
    `)

    // Ajouter les colonnes supplémentaires d'Event (RSVP, Showcase, etc.)
    await prisma.$executeRaw`
      ALTER TABLE "Event"
      ADD COLUMN IF NOT EXISTS "rsvpDeadline" TIMESTAMP(3),
      ADD COLUMN IF NOT EXISTS "maxPlusOnes" INTEGER NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "allowPlusOnes" BOOLEAN NOT NULL DEFAULT false,
      ADD COLUMN IF NOT EXISTS "requireMeal" BOOLEAN NOT NULL DEFAULT false,
      ADD COLUMN IF NOT EXISTS "mealOptions" TEXT[] DEFAULT ARRAY[]::TEXT[],
      ADD COLUMN IF NOT EXISTS "saveTheDateConfig" JSONB,
      ADD COLUMN IF NOT EXISTS "invitationConfig" JSONB,
      ADD COLUMN IF NOT EXISTS "rsvpConfig" JSONB,
      ADD COLUMN IF NOT EXISTS "enableTransport" BOOLEAN NOT NULL DEFAULT false,
      ADD COLUMN IF NOT EXISTS "enableLodging" BOOLEAN NOT NULL DEFAULT false,
      ADD COLUMN IF NOT EXISTS "enableAccessibility" BOOLEAN NOT NULL DEFAULT true,
      ADD COLUMN IF NOT EXISTS "enablePhotoConsent" BOOLEAN NOT NULL DEFAULT true,
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

    // =====================================================
    // ÉTAPE 4: Créer la table Guest
    // =====================================================

    await prisma.$executeRawUnsafe(`
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
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Guest_pkey" PRIMARY KEY ("id")
      )
    `)

    await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "Guest_token_key" ON "Guest"("token")`)
    await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "Guest_tokenHash_key" ON "Guest"("tokenHash")`)
    await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "Guest_eventId_email_key" ON "Guest"("eventId", "email")`)
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Guest_tokenHash_idx" ON "Guest"("tokenHash")`)
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Guest_eventId_idx" ON "Guest"("eventId")`)

    // Foreign key Guest -> Event
    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'Guest_eventId_fkey'
        ) THEN
          ALTER TABLE "Guest" ADD CONSTRAINT "Guest_eventId_fkey"
          FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;
      END $$;
    `)

    // =====================================================
    // ÉTAPE 5: Créer la table RSVP
    // =====================================================

    await prisma.$executeRawUnsafe(`
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
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "RSVP_pkey" PRIMARY KEY ("id")
      )
    `)

    await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "RSVP_guestId_key" ON "RSVP"("guestId")`)
    await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "RSVP_qrCodeId_key" ON "RSVP"("qrCodeId")`)
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "RSVP_eventId_idx" ON "RSVP"("eventId")`)

    // Foreign keys RSVP
    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'RSVP_eventId_fkey'
        ) THEN
          ALTER TABLE "RSVP" ADD CONSTRAINT "RSVP_eventId_fkey"
          FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;
      END $$;
    `)

    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'RSVP_guestId_fkey'
        ) THEN
          ALTER TABLE "RSVP" ADD CONSTRAINT "RSVP_guestId_fkey"
          FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;
      END $$;
    `)

    // =====================================================
    // ÉTAPE 6: Créer la table Checkin
    // =====================================================

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Checkin" (
        "id" TEXT NOT NULL,
        "eventId" TEXT NOT NULL,
        "guestId" TEXT NOT NULL,
        "qrCodeId" TEXT NOT NULL,
        "checkedInAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "desk" TEXT,
        "notes" TEXT,
        CONSTRAINT "Checkin_pkey" PRIMARY KEY ("id")
      )
    `)

    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Checkin_eventId_idx" ON "Checkin"("eventId")`)
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Checkin_guestId_idx" ON "Checkin"("guestId")`)

    // Foreign keys Checkin
    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'Checkin_eventId_fkey'
        ) THEN
          ALTER TABLE "Checkin" ADD CONSTRAINT "Checkin_eventId_fkey"
          FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;
      END $$;
    `)

    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'Checkin_guestId_fkey'
        ) THEN
          ALTER TABLE "Checkin" ADD CONSTRAINT "Checkin_guestId_fkey"
          FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;
      END $$;
    `)

    // =====================================================
    // ÉTAPE 7: Créer la table EmailLog
    // =====================================================

    await prisma.$executeRawUnsafe(`
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
      )
    `)

    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "EmailLog_eventId_idx" ON "EmailLog"("eventId")`)
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "EmailLog_guestId_idx" ON "EmailLog"("guestId")`)
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "EmailLog_status_idx" ON "EmailLog"("status")`)

    // Foreign keys EmailLog
    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'EmailLog_eventId_fkey'
        ) THEN
          ALTER TABLE "EmailLog" ADD CONSTRAINT "EmailLog_eventId_fkey"
          FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;
      END $$;
    `)

    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'EmailLog_guestId_fkey'
        ) THEN
          ALTER TABLE "EmailLog" ADD CONSTRAINT "EmailLog_guestId_fkey"
          FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;
      END $$;
    `)

    // =====================================================
    // ÉTAPE 8: Créer la table EmailTracking
    // =====================================================

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

    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "EmailTracking_eventId_idx" ON "EmailTracking"("eventId")`)
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "EmailTracking_guestId_idx" ON "EmailTracking"("guestId")`)
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "EmailTracking_type_idx" ON "EmailTracking"("type")`)
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "EmailTracking_status_idx" ON "EmailTracking"("status")`)

    // Foreign keys EmailTracking
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

    // =====================================================
    // ÉTAPE 9: Créer la table EmailIntegration
    // =====================================================

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "EmailIntegration" (
        "id" TEXT NOT NULL,
        "provider" "EmailProvider" NOT NULL,
        "isActive" BOOLEAN NOT NULL DEFAULT false,
        "isPrimary" BOOLEAN NOT NULL DEFAULT false,
        "apiKey" TEXT,
        "apiSecret" TEXT,
        "smtpHost" TEXT,
        "smtpPort" INTEGER,
        "smtpUser" TEXT,
        "smtpPass" TEXT,
        "fromEmail" TEXT,
        "fromName" TEXT,
        "replyTo" TEXT,
        "webhookUrl" TEXT,
        "webhookSecret" TEXT,
        "trackOpens" BOOLEAN NOT NULL DEFAULT true,
        "trackClicks" BOOLEAN NOT NULL DEFAULT true,
        "dailyLimit" INTEGER,
        "monthlyLimit" INTEGER,
        "lastTestedAt" TIMESTAMP(3),
        "lastUsedAt" TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "EmailIntegration_pkey" PRIMARY KEY ("id")
      )
    `)

    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "EmailIntegration_provider_idx" ON "EmailIntegration"("provider")`)
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "EmailIntegration_isActive_idx" ON "EmailIntegration"("isActive")`)
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "EmailIntegration_isPrimary_idx" ON "EmailIntegration"("isPrimary")`)

    // =====================================================
    // ÉTAPE 10: Créer la table EmailTemplate
    // =====================================================

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "EmailTemplate" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "slug" TEXT NOT NULL,
        "description" TEXT,
        "type" "EmailType" NOT NULL,
        "subject" TEXT NOT NULL,
        "htmlContent" TEXT NOT NULL,
        "textContent" TEXT,
        "primaryColor" TEXT NOT NULL DEFAULT '#004645',
        "secondaryColor" TEXT NOT NULL DEFAULT '#009197',
        "accentColor" TEXT NOT NULL DEFAULT '#FF4713',
        "fontFamily" TEXT NOT NULL DEFAULT 'Arial, sans-serif',
        "isDefault" BOOLEAN NOT NULL DEFAULT false,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "previewImage" TEXT,
        "usageCount" INTEGER NOT NULL DEFAULT 0,
        "lastUsedAt" TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "EmailTemplate_pkey" PRIMARY KEY ("id")
      )
    `)

    await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "EmailTemplate_slug_key" ON "EmailTemplate"("slug")`)
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "EmailTemplate_type_idx" ON "EmailTemplate"("type")`)
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "EmailTemplate_isActive_idx" ON "EmailTemplate"("isActive")`)
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "EmailTemplate_isDefault_idx" ON "EmailTemplate"("isDefault")`)

    return NextResponse.json({
      success: true,
      message: '✅ Migration complète réussie - Toutes les tables ont été créées (User, Event, Guest, RSVP, Checkin, EmailLog, EmailTracking, EmailIntegration, EmailTemplate)',
      tables: [
        'User',
        'Event',
        'Guest',
        'RSVP',
        'Checkin',
        'EmailLog',
        'EmailTracking',
        'EmailIntegration',
        'EmailTemplate'
      ],
      enums: [
        'UserRole',
        'GuestStatus',
        'EmailType',
        'EmailStatus',
        'EmailProvider'
      ]
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
