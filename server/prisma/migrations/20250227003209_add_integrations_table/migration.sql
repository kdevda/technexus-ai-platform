/*
  Warnings:

  - A unique constraint covering the columns `[organization_id]` on the table `twilio_configs` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "resend_configs" DROP CONSTRAINT "resend_configs_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "twilio_configs" DROP CONSTRAINT "twilio_configs_organization_id_fkey";

-- AlterTable
ALTER TABLE "resend_configs" ADD COLUMN     "integration_id" TEXT,
ALTER COLUMN "enabled" SET DEFAULT false;

-- AlterTable
ALTER TABLE "twilio_configs" ADD COLUMN     "integration_id" TEXT,
ALTER COLUMN "enabled" SET DEFAULT false;

-- CreateTable
CREATE TABLE "integrations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "is_enabled" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "integrations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "integrations_name_key" ON "integrations"("name");

-- CreateIndex
CREATE UNIQUE INDEX "twilio_configs_organization_id_key" ON "twilio_configs"("organization_id");

-- AddForeignKey
ALTER TABLE "twilio_configs" ADD CONSTRAINT "twilio_configs_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "twilio_configs" ADD CONSTRAINT "twilio_configs_integration_id_fkey" FOREIGN KEY ("integration_id") REFERENCES "integrations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resend_configs" ADD CONSTRAINT "resend_configs_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resend_configs" ADD CONSTRAINT "resend_configs_integration_id_fkey" FOREIGN KEY ("integration_id") REFERENCES "integrations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
