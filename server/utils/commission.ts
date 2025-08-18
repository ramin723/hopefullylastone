// server/utils/commission.ts
export function computeCommission(
  amountEligible: number,
  rateMechanic = 0.03,
  ratePlatform = 0.02
) {
  const mechanicAmount = Math.round(amountEligible * rateMechanic)
  const platformAmount = Math.round(amountEligible * ratePlatform)
  return { mechanicAmount, platformAmount }
}
