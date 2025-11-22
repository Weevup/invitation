-- AlterTable
ALTER TABLE "Event" ADD COLUMN "emailCampaignsConfig" JSONB;

-- Update comment on Event.emailCampaignsConfig
COMMENT ON COLUMN "Event"."emailCampaignsConfig" IS 'Email campaigns configuration: phases with enabled status, template slugs, and scheduled dates';
