// server/utils/decimal.ts
import { Prisma } from '@prisma/client'

/**
 * تبدیل Prisma.Decimal به number
 * اگر مقدار null یا undefined باشد، 0 برمی‌گرداند
 */
export function decimalToNumber(value: Prisma.Decimal | null | undefined): number {
  if (!value) return 0
  
  // اگر Prisma.Decimal باشد
  if (typeof value === 'object' && 'toNumber' in value) {
    return value.toNumber()
  }
  
  // اگر string یا number باشد
  return Number(value)
}

/**
 * تبدیل array از Decimal به number
 */
export function decimalArrayToNumber(values: (Prisma.Decimal | null | undefined)[]): number[] {
  return values.map(decimalToNumber)
}
