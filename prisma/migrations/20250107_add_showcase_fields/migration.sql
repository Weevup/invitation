-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "showcaseEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "showcaseTitle" TEXT,
ADD COLUMN     "showcaseSubtitle" TEXT,
ADD COLUMN     "showcaseBannerImage" TEXT,
ADD COLUMN     "showcaseTheme" TEXT NOT NULL DEFAULT 'weevup',
ADD COLUMN     "showcaseSections" JSONB,
ADD COLUMN     "showcaseCustomCSS" TEXT,
ADD COLUMN     "showcasePrimaryColor" TEXT NOT NULL DEFAULT '#004645',
ADD COLUMN     "showcaseSecondaryColor" TEXT NOT NULL DEFAULT '#FF4713';
