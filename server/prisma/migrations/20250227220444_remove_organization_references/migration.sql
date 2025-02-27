/*
  Warnings:

  - You are about to drop the column `organization_id` on the `call_history` table. All the data in the column will be lost.
  - You are about to drop the column `organization_id` on the `resend_configs` table. All the data in the column will be lost.
  - You are about to drop the column `organization_id` on the `twilio_configs` table. All the data in the column will be lost.
  - You are about to drop the column `organization_id` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `organizations` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[integration_id]` on the table `resend_configs` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[integration_id]` on the table `twilio_configs` will be added. If there are existing duplicate values, this will fail.
  - Made the column `integration_id` on table `resend_configs` required. This step will fail if there are existing NULL values in that column.
  - Made the column `integration_id` on table `twilio_configs` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "call_history" DROP CONSTRAINT "call_history_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "resend_configs" DROP CONSTRAINT "resend_configs_integration_id_fkey";

-- DropForeignKey
ALTER TABLE "resend_configs" DROP CONSTRAINT "resend_configs_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "twilio_configs" DROP CONSTRAINT "twilio_configs_integration_id_fkey";

-- DropForeignKey
ALTER TABLE "twilio_configs" DROP CONSTRAINT "twilio_configs_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_organization_id_fkey";

-- DropIndex
DROP INDEX "resend_configs_organization_id_key";

-- DropIndex
DROP INDEX "twilio_configs_organization_id_key";

-- AlterTable
ALTER TABLE "call_history" DROP COLUMN "organization_id";

-- AlterTable
ALTER TABLE "resend_configs" DROP COLUMN "organization_id",
ALTER COLUMN "integration_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "twilio_configs" DROP COLUMN "organization_id",
ALTER COLUMN "integration_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "organization_id";

-- DropTable
DROP TABLE "organizations";

-- CreateIndex
CREATE UNIQUE INDEX "resend_configs_integration_id_key" ON "resend_configs"("integration_id");

-- CreateIndex
CREATE UNIQUE INDEX "twilio_configs_integration_id_key" ON "twilio_configs"("integration_id");

-- AddForeignKey
ALTER TABLE "twilio_configs" ADD CONSTRAINT "twilio_configs_integration_id_fkey" FOREIGN KEY ("integration_id") REFERENCES "integrations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resend_configs" ADD CONSTRAINT "resend_configs_integration_id_fkey" FOREIGN KEY ("integration_id") REFERENCES "integrations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
