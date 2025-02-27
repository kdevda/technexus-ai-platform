-- CreateTable
CREATE TABLE "resend_configs" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "api_key" TEXT NOT NULL,
    "from_email" TEXT NOT NULL,
    "domain" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "webhook_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resend_configs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "resend_configs_organization_id_key" ON "resend_configs"("organization_id");

-- AddForeignKey
ALTER TABLE "resend_configs" ADD CONSTRAINT "resend_configs_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
