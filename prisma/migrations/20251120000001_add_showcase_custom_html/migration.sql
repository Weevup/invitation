-- AlterTable
ALTER TABLE "Event" ADD COLUMN "showcaseCustomHTML" TEXT;

-- Update comment on Event.showcaseTheme
COMMENT ON COLUMN "Event"."showcaseTheme" IS 'Showcase theme: weevup, elegant, modern, minimal, or custom';
