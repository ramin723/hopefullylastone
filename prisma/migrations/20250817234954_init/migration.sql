-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('MECHANIC', 'VENDOR', 'ADMIN');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" SERIAL NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "public"."UserRole" NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Mechanic" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "qrActive" BOOLEAN NOT NULL DEFAULT true,
    "tier" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Mechanic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Vendor" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "storeName" TEXT NOT NULL,
    "city" TEXT,
    "percentDefault" DOUBLE PRECISION NOT NULL DEFAULT 0.05,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Vendor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Transaction" (
    "id" SERIAL NOT NULL,
    "mechanicId" INTEGER NOT NULL,
    "vendorId" INTEGER NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "amountTotal" INTEGER NOT NULL,
    "amountEligible" INTEGER NOT NULL,
    "note" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Commission" (
    "id" SERIAL NOT NULL,
    "transactionId" INTEGER NOT NULL,
    "rateMechanic" DOUBLE PRECISION NOT NULL DEFAULT 0.03,
    "ratePlatform" DOUBLE PRECISION NOT NULL DEFAULT 0.02,
    "mechanicAmount" INTEGER NOT NULL,
    "platformAmount" INTEGER NOT NULL,

    CONSTRAINT "Commission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Settlement" (
    "id" SERIAL NOT NULL,
    "vendorId" INTEGER NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "totalVendorPayable" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Settlement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SettlementItem" (
    "id" SERIAL NOT NULL,
    "settlementId" INTEGER NOT NULL,
    "transactionId" INTEGER NOT NULL,
    "platformAmount" INTEGER NOT NULL,
    "mechanicAmount" INTEGER NOT NULL,

    CONSTRAINT "SettlementItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PriceCache" (
    "id" SERIAL NOT NULL,
    "isacoCode" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "vehicleModels" TEXT,
    "retailPrice" INTEGER,
    "wholesalePrice" INTEGER,
    "source" TEXT,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PriceCache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PriceHistory" (
    "id" SERIAL NOT NULL,
    "isacoCode" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "seenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PriceHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "public"."User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Mechanic_userId_key" ON "public"."Mechanic"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Mechanic_code_key" ON "public"."Mechanic"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Vendor_userId_key" ON "public"."Vendor"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Commission_transactionId_key" ON "public"."Commission"("transactionId");

-- AddForeignKey
ALTER TABLE "public"."Mechanic" ADD CONSTRAINT "Mechanic_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Vendor" ADD CONSTRAINT "Vendor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Transaction" ADD CONSTRAINT "Transaction_mechanicId_fkey" FOREIGN KEY ("mechanicId") REFERENCES "public"."Mechanic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Transaction" ADD CONSTRAINT "Transaction_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "public"."Vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Commission" ADD CONSTRAINT "Commission_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "public"."Transaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Settlement" ADD CONSTRAINT "Settlement_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "public"."Vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SettlementItem" ADD CONSTRAINT "SettlementItem_settlementId_fkey" FOREIGN KEY ("settlementId") REFERENCES "public"."Settlement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SettlementItem" ADD CONSTRAINT "SettlementItem_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "public"."Transaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
