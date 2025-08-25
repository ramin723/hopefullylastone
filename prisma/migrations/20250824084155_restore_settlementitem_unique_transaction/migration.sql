/*
  Warnings:

  - A unique constraint covering the columns `[transactionId]` on the table `SettlementItem` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."SettlementItem_settlementId_transactionId_key";

-- CreateIndex
CREATE UNIQUE INDEX "SettlementItem_transactionId_key" ON "public"."SettlementItem"("transactionId");
