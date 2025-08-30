/**
 * Helper functions for date input handling in UI forms
 * تبدیل ورودی‌های تاریخ فیلتر به فرمت ISO برای API
 */

import { toISOFromJalaliInput, toISOEndOfDayFromJalaliInput, isValidDate } from './date'

/**
 * تبدیل ورودی تاریخ فیلتر به ISO (ابتدای روز)
 * @param input - ورودی تاریخ (شمسی یا ISO)
 * @returns تاریخ ISO یا null
 */
export function normalizeDateInputToISO(input: string | Date | null): string | null {
  if (!input) return null
  
  // اگر Date object باشد
  if (input instanceof Date) {
    return input.toISOString()
  }
  
  // اگر string باشد
  if (typeof input === 'string') {
    // اگر فرمت ISO باشد (شامل T یا Z)
    if (input.includes('T') || input.includes('Z')) {
      return input
    }
    
    // اگر فرمت شمسی باشد (شامل خط تیره)
    if (input.includes('-')) {
      return toISOFromJalaliInput(input)
    }
    
    // اگر فرمت شمسی با / باشد
    if (input.includes('/')) {
      const normalized = input.replace(/\//g, '-')
      return toISOFromJalaliInput(normalized)
    }
  }
  
  return null
}

/**
 * تبدیل ورودی تاریخ فیلتر به ISO (انتهای روز)
 * @param input - ورودی تاریخ (شمسی یا ISO)
 * @returns تاریخ ISO یا null
 */
export function normalizeDateInputToISOEndOfDay(input: string | Date | null): string | null {
  if (!input) return null
  
  // اگر Date object باشد
  if (input instanceof Date) {
    const date = new Date(input)
    date.setHours(23, 59, 59, 999)
    return date.toISOString()
  }
  
  // اگر string باشد
  if (typeof input === 'string') {
    // اگر فرمت ISO باشد (شامل T یا Z)
    if (input.includes('T') || input.includes('Z')) {
      const date = new Date(input)
      date.setHours(23, 59, 59, 999)
      return date.toISOString()
    }
    
    // اگر فرمت شمسی باشد (شامل خط تیره)
    if (input.includes('-')) {
      return toISOEndOfDayFromJalaliInput(input)
    }
    
    // اگر فرمت شمسی با / باشد
    if (input.includes('/')) {
      const normalized = input.replace(/\//g, '-')
      return toISOEndOfDayFromJalaliInput(normalized)
    }
  }
  
  return null
}

/**
 * بررسی اینکه آیا ورودی تاریخ معتبر است
 * @param input - ورودی تاریخ
 * @returns boolean
 */
export function isValidDateInput(input: string | Date | null): boolean {
  if (!input) return false
  
  try {
    if (input instanceof Date) {
      return !isNaN(input.getTime())
    }
    
    if (typeof input === 'string') {
      return isValidDate(input)
    }
    
    return false
  } catch {
    return false
  }
}


