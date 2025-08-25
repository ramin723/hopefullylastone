/*
  Warnings:

  - You are about to drop the column `periodEnd` on the `Settlement` table. All the data in the column will be lost.
  - You are about to drop the column `periodStart` on the `Settlement` table. All the data in the column will be lost.
  - You are about to drop the column `totalVendorPayable` on the `Settlement` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[transactionId]` on the table `SettlementItem` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `periodFrom` to the `Settlement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `periodTo` to the `Settlement` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Settlement" DROP COLUMN "periodEnd",
DROP COLUMN "periodStart",
DROP COLUMN "totalVendorPayable",
ADD COLUMN     "paidAt" TIMESTAMP(3),
ADD COLUMN     "periodFrom" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "periodTo" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "totalAmountEligible" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalMechanicAmount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalPlatformAmount" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "status" SET DEFAULT 'OPEN';

-- AlterTable
ALTER TABLE "public"."SettlementItem" ALTER COLUMN "platformAmount" SET DEFAULT 0,
ALTER COLUMN "mechanicAmount" SET DEFAULT 0;

-- CreateTable
CREATE TABLE "public"."RefreshToken" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userAgent" TEXT,
    "ip" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_tokenHash_key" ON "public"."RefreshToken"("tokenHash");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "public"."RefreshToken"("userId");

-- CreateIndex
CREATE INDEX "RefreshToken_tokenHash_idx" ON "public"."RefreshToken"("tokenHash");

-- CreateIndex
CREATE INDEX "Settlement_vendorId_status_idx" ON "public"."Settlement"("vendorId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "SettlementItem_transactionId_key" ON "public"."SettlementItem"("transactionId");

-- AddForeignKey
ALTER TABLE "public"."RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
