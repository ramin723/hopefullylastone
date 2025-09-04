/*
  Warnings:

  - The `tier` column on the `Mechanic` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to alter the column `percentDefault` on the `Vendor` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(5,2)`.

*/
-- CreateEnum
CREATE TYPE "public"."MechanicTier" AS ENUM ('BASIC', 'PRO', 'ELITE');

-- AlterTable
ALTER TABLE "public"."Mechanic" ADD COLUMN     "city" TEXT,
ADD COLUMN     "specialties" TEXT,
DROP COLUMN "tier",
ADD COLUMN     "tier" "public"."MechanicTier";

-- AlterTable
ALTER TABLE "public"."Vendor" ADD COLUMN     "addressLine" TEXT,
ADD COLUMN     "banReason" TEXT,
ADD COLUMN     "bannedAt" TIMESTAMP(3),
ADD COLUMN     "isActive" BOOLEAN DEFAULT true,
ADD COLUMN     "latitude" DECIMAL(10,7),
ADD COLUMN     "longitude" DECIMAL(10,7),
ADD COLUMN     "postalCode" TEXT,
ADD COLUMN     "province" TEXT,
ALTER COLUMN "percentDefault" DROP NOT NULL,
ALTER COLUMN "percentDefault" DROP DEFAULT,
ALTER COLUMN "percentDefault" SET DATA TYPE DECIMAL(5,2);

-- CreateTable
CREATE TABLE "public"."OtpCode" (
    "id" SERIAL NOT NULL,
    "phone" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OtpCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OtpCode_phone_purpose_idx" ON "public"."OtpCode"("phone", "purpose");

-- CreateIndex
CREATE INDEX "OtpCode_expiresAt_idx" ON "public"."OtpCode"("expiresAt");

-- CreateIndex
CREATE INDEX "Vendor_city_idx" ON "public"."Vendor"("city");

-- CreateIndex
CREATE INDEX "Vendor_storeName_idx" ON "public"."Vendor"("storeName");
