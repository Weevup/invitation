-- AlterTable
ALTER TABLE "RSVP" ADD COLUMN "customAnswers" JSONB;

-- Update comment on Event.rsvpConfig
COMMENT ON COLUMN "Event"."rsvpConfig" IS 'RSVP form configuration - customSteps: [{id, type, label, content, enabled, order}]';
