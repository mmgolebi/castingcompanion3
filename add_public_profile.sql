-- Add public profile fields to Profile table only
ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "profileSlug" TEXT;
ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "isPublic" BOOLEAN NOT NULL DEFAULT false;

-- Add unique constraint
CREATE UNIQUE INDEX IF NOT EXISTS "Profile_profileSlug_key" ON "Profile"("profileSlug");
