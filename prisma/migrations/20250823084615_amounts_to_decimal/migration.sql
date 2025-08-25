/*
  Warnings:

  - You are about to drop the column `mechanicAmount` on the `Commission` table. All the data in the column will be lost.
  - You are about to drop the column `platformAmount` on the `Commission` table. All the data in the column will be lost.
  - You are about to drop the column `mechanicAmount` on the `SettlementItem` table. All the data in the column will be lost.
  - You are about to drop the column `platformAmount` on the `SettlementItem` table. All the data in the column will be lost.
  - Added the required column `mechanicShare` to the `Commission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `platformShare` to the `Commission` table without a default value. This is not possible if the table is not empty.

*/

-- Step 1: Add new columns with default values
ALTER TABLE "public"."Commission" ADD COLUMN "mechanicShare" DECIMAL(18,0) DEFAULT 0;
ALTER TABLE "public"."Commission" ADD COLUMN "platformShare" DECIMAL(18,0) DEFAULT 0;

-- Step 2: Copy data from old columns to new columns
UPDATE "public"."Commission" SET 
  "mechanicShare" = "mechanicAmount",
  "platformShare" = "platformAmount";

-- Step 3: Make new columns NOT NULL
ALTER TABLE "public"."Commission" ALTER COLUMN "mechanicShare" SET NOT NULL;
ALTER TABLE "public"."Commission" ALTER COLUMN "platformShare" SET NOT NULL;

-- Step 4: Drop old columns
ALTER TABLE "public"."Commission" DROP COLUMN "mechanicAmount";
ALTER TABLE "public"."Commission" DROP COLUMN "platformAmount";

-- Step 5: Update Settlement table
ALTER TABLE "public"."Settlement" ALTER COLUMN "totalAmountEligible" SET DEFAULT 0;
ALTER TABLE "public"."Settlement" ALTER COLUMN "totalAmountEligible" SET DATA TYPE DECIMAL(18,0);
ALTER TABLE "public"."Settlement" ALTER COLUMN "totalMechanicAmount" SET DEFAULT 0;
ALTER TABLE "public"."Settlement" ALTER COLUMN "totalMechanicAmount" SET DATA TYPE DECIMAL(18,0);
ALTER TABLE "public"."Settlement" ALTER COLUMN "totalPlatformAmount" SET DEFAULT 0;
ALTER TABLE "public"."Settlement" ALTER COLUMN "totalPlatformAmount" SET DATA TYPE DECIMAL(18,0);

-- Step 6: Update SettlementItem table
ALTER TABLE "public"."SettlementItem" ADD COLUMN "mechanicShare" DECIMAL(18,0) DEFAULT 0;
ALTER TABLE "public"."SettlementItem" ADD COLUMN "platformShare" DECIMAL(18,0) DEFAULT 0;

-- Step 7: Copy data from old columns to new columns
UPDATE "public"."SettlementItem" SET 
  "mechanicShare" = "mechanicAmount",
  "platformShare" = "platformAmount";

-- Step 8: Make new columns NOT NULL
ALTER TABLE "public"."SettlementItem" ALTER COLUMN "mechanicShare" SET NOT NULL;
ALTER TABLE "public"."SettlementItem" ALTER COLUMN "platformShare" SET NOT NULL;

-- Step 9: Drop old columns
ALTER TABLE "public"."SettlementItem" DROP COLUMN "mechanicAmount";
ALTER TABLE "public"."SettlementItem" DROP COLUMN "platformAmount";

-- Step 10: Update Transaction table
ALTER TABLE "public"."Transaction" ALTER COLUMN "amountTotal" SET DATA TYPE DECIMAL(18,0);
ALTER TABLE "public"."Transaction" ALTER COLUMN "amountEligible" SET DATA TYPE DECIMAL(18,0);
