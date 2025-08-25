-- Migration: rename_commission_columns
-- تغییر نام ستون‌های کمیسیون به نام‌های استاندارد

-- تغییر نام ستون‌های Commission
ALTER TABLE "public"."Commission" RENAME COLUMN "mechanicShare" TO "mechanicAmount";
ALTER TABLE "public"."Commission" RENAME COLUMN "platformShare" TO "platformAmount";

-- تغییر نام ستون‌های SettlementItem
ALTER TABLE "public"."SettlementItem" RENAME COLUMN "mechanicShare" TO "mechanicAmount";
ALTER TABLE "public"."SettlementItem" RENAME COLUMN "platformShare" TO "platformAmount";
