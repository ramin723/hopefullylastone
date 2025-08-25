/*
  Warnings:

  - You are about to alter the column `ip` on the `RefreshToken` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(64)`.

*/
-- DropForeignKey
ALTER TABLE "public"."RefreshToken" DROP CONSTRAINT "RefreshToken_userId_fkey";

-- DropIndex
DROP INDEX "public"."RefreshToken_tokenHash_idx";

-- DropIndex
DROP INDEX "public"."RefreshToken_tokenHash_key";

-- AlterTable
ALTER TABLE "public"."RefreshToken" ALTER COLUMN "ip" SET DATA TYPE VARCHAR(64);

-- CreateIndex
CREATE INDEX "RefreshToken_expiresAt_idx" ON "public"."RefreshToken"("expiresAt");

-- AddForeignKey
ALTER TABLE "public"."RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
