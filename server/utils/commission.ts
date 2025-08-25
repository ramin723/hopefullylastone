// server/utils/commission.ts
import { Prisma } from '@prisma/client'

export function computeCommission(
  amountEligible: number | string | Prisma.Decimal,
  rateMechanic = 0.03,
  ratePlatform = 0.02
) {
  const amt = new Prisma.Decimal(amountEligible)
  const mechanicAmount = amt.mul(new Prisma.Decimal(rateMechanic)).toDecimalPlaces(0)
  const platformAmount = amt.mul(new Prisma.Decimal(ratePlatform)).toDecimalPlaces(0)
  return { mechanicAmount, platformAmount }
}
