/*
  Warnings:

  - Added the required column `organization_id` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- Create a default organization for existing users
INSERT INTO "organizations" ("id", "name", "created_at", "updated_at")
SELECT 
  gen_random_uuid(),
  'Default Organization',
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM "organizations" LIMIT 1);

-- Get the ID of the default organization
DO $$ 
DECLARE
  default_org_id TEXT;
BEGIN
  SELECT id INTO default_org_id FROM "organizations" LIMIT 1;

  -- Add the organization_id column
  ALTER TABLE "users" ADD COLUMN "organization_id" TEXT;
  
  -- Update existing users to use the default organization
  UPDATE "users" SET "organization_id" = default_org_id WHERE "organization_id" IS NULL;
  
  -- Now make the column required
  ALTER TABLE "users" ALTER COLUMN "organization_id" SET NOT NULL;
  
  -- Add the status column if it doesn't exist
  ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'offline';
END $$;

-- Add foreign key constraint
ALTER TABLE "users" ADD CONSTRAINT "users_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
