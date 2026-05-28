-- CreateEnum
CREATE TYPE "CompanyBillingStatus" AS ENUM ('UNPAID', 'TRIALING', 'ACTIVE', 'PAST_DUE', 'CANCELED');

-- CreateTable
CREATE TABLE "companies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "billing_status" "CompanyBillingStatus" NOT NULL DEFAULT 'UNPAID',
    "payment_provider" TEXT,
    "payment_customer_id" TEXT,
    "payment_subscription_id" TEXT,
    "paid_until" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "User" ADD COLUMN "company_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "WorkPoint" ADD COLUMN "company_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "invitations" ADD COLUMN "company_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "chats" ADD COLUMN "company_id" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "companies_billing_status_idx" ON "companies"("billing_status");

-- CreateIndex
CREATE UNIQUE INDEX "companies_payment_customer_id_key" ON "companies"("payment_customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "companies_payment_subscription_id_key" ON "companies"("payment_subscription_id");

-- CreateIndex
CREATE INDEX "User_company_id_idx" ON "User"("company_id");

-- CreateIndex
CREATE UNIQUE INDEX "User_one_admin_per_company_idx" ON "User"("company_id") WHERE "role" = 'ADMIN';

-- CreateIndex
CREATE INDEX "WorkPoint_company_id_idx" ON "WorkPoint"("company_id");

-- CreateIndex
CREATE INDEX "invitations_company_id_idx" ON "invitations"("company_id");

-- CreateIndex
CREATE INDEX "invitations_company_id_email_idx" ON "invitations"("company_id", "email");

-- CreateIndex
CREATE INDEX "chats_company_id_idx" ON "chats"("company_id");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkPoint" ADD CONSTRAINT "WorkPoint_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chats" ADD CONSTRAINT "chats_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
