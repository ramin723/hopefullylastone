/*
  Warnings:

  - A unique constraint covering the columns `[settlementId,transactionId]` on the table `SettlementItem` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."SettlementItem_transactionId_key";

-- CreateIndex
CREATE UNIQUE INDEX "SettlementItem_settlementId_transactionId_key" ON "public"."SettlementItem"("settlementId", "transactionId");
