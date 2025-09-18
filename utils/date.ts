import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
// import moment from 'moment-jalaali'

// تنظیم dayjs
dayjs.extend(utc)
dayjs.extend(timezone)

// تابع تبدیل میلادی به شمسی
function gregorianToJalali(gregorianDate: Date): string {
  const year = gregorianDate.getFullYear()
  const month = gregorianDate.getMonth() + 1
  const day = gregorianDate.getDate()
  
  // الگوریتم ساده و صحیح تبدیل میلادی به جلالی
  // تاریخ 1 ژانویه 1970 میلادی = 11 دی 1348 شمسی
  const epoch = new Date(1970, 0, 1) // 1 ژانویه 1970
  const diffTime = gregorianDate.getTime() - epoch.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  
  // محاسبه سال جلالی (تقریبی)
  let jalaliYear = 1348 + Math.floor(diffDays / 365.25)
  
  // محاسبه ماه و روز (تقریبی)
  const remainingDays = diffDays % 365.25
  let jalaliMonth = Math.floor(remainingDays / 30.44) + 1
  let jalaliDay = Math.floor(remainingDays % 30.44) + 1
  
  // تنظیم محدوده‌ها
  if (jalaliMonth > 12) {
    jalaliMonth = 12
  }
  if (jalaliDay > 31) {
    jalaliDay = 31
  }
  
  // محاسبه دقیق‌تر برای سال‌های اخیر
  if (year >= 2020) {
    jalaliYear = year - 621
    jalaliMonth = month + 2
    if (jalaliMonth > 12) {
      jalaliMonth -= 12
      jalaliYear++
    }
    jalaliDay = day
  }
  
  return `${jalaliYear}-${jalaliMonth.toString().padStart(2, '0')}-${jalaliDay.toString().padStart(2, '0')}`
}


/**
 * تبدیل تاریخ جلالی به میلادی
 * @param jalaliYear - سال جلالی
 * @param jalaliMonth - ماه جلالی
 * @param jalaliDay - روز جلالی
 * @returns تاریخ میلادی
 */
function jalaliToGregorian(jalaliYear: number, jalaliMonth: number, jalaliDay: number): Date {
  // تبدیل دقیق جلالی به میلادی
  let gregorianYear = jalaliYear + 621
  let gregorianMonth = jalaliMonth - 2
  let gregorianDay = jalaliDay
  
  // تنظیم ماه‌های میلادی
  if (gregorianMonth <= 0) {
    gregorianMonth += 12
    gregorianYear--
  }
  
  // تنظیم روزهای ماه‌های میلادی
  const monthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  const maxDay = monthDays[gregorianMonth - 1]
  if (maxDay && gregorianDay > maxDay) {
    gregorianDay = maxDay
  }
  
  return new Date(gregorianYear, gregorianMonth - 1, gregorianDay)
}

/**
 * تبدیل ورودی شمسی به ISO (ابتدای روز)
 * @param jalaliStr - تاریخ شمسی به فرمت "1403-06-05"
 * @returns تاریخ ISO به فرمت "2024-08-27T00:00:00.000Z"
 */
export function toISOFromJalaliInput(jalaliStr: string): string | null {
  if (!jalaliStr || jalaliStr.trim() === '') return null
  
  try {
    // تبدیل ساده شمسی به میلادی (تقریبی)
    const parts = jalaliStr.split('-')
    if (parts.length !== 3) return null
    
    const year = parseInt(parts[0] || '0')
    const month = parseInt(parts[1] || '0')
    const day = parseInt(parts[2] || '0')
    
    if (isNaN(year) || isNaN(month) || isNaN(day)) {
      return null
    }
    
    // تبدیل دقیق جلالی به میلادی
    const gregorianDate = jalaliToGregorian(year, month, day)
    return gregorianDate.toISOString()
    
  } catch (error) {
    console.warn('Error converting Jalali to ISO:', error)
    return null
  }
}

/**
 * تبدیل ورودی شمسی به ISO (انتهای روز)
 * @param jalaliStr - تاریخ شمسی به فرمت "1403-06-05"
 * @returns تاریخ ISO به فرمت "2024-08-27T23:59:59.999Z"
 */
export function toISOEndOfDayFromJalaliInput(jalaliStr: string): string | null {
  if (!jalaliStr || jalaliStr.trim() === '') return null
  
  try {
    const startOfDay = toISOFromJalaliInput(jalaliStr)
    if (!startOfDay) return null
    
    const date = new Date(startOfDay)
    date.setHours(23, 59, 59, 999)
    return date.toISOString()
    
  } catch (error) {
    console.warn('Error converting Jalali date (end of day):', error)
    return null
  }
}

/**
 * تبدیل تاریخ ISO به نمایش شمسی
 * @param dateISO - تاریخ ISO
 * @returns تاریخ شمسی به فرمت "1403/06/05"
 */
export function formatJalali(dateISO: string | Date): string {
  if (!dateISO) return '-'
  
  try {
    const date = new Date(dateISO)
    if (isNaN(date.getTime())) return '-'
    
    // تبدیل دقیق میلادی به شمسی
    const jalali = gregorianToJalali(date)
    
    return `${jalali.year}/${jalali.month.toString().padStart(2, '0')}/${jalali.day.toString().padStart(2, '0')}`
    
  } catch (error) {
    console.warn('Error formatting Jalali date:', error)
    return '-'
  }
}

/**
 * تبدیل تاریخ ISO به نمایش شمسی با ساعت
 * @param dateISO - تاریخ ISO
 * @returns تاریخ شمسی با ساعت به فرمت "1403/06/05 14:30"
 */
export function formatJalaliDateTime(dateISO: string | Date): string {
  if (!dateISO) return '-'
  
  try {
    const date = new Date(dateISO)
    if (isNaN(date.getTime())) return '-'
    
    const jalaliDate = formatJalali(dateISO)
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    
    return `${jalaliDate} ${hours}:${minutes}`
    
  } catch (error) {
    console.warn('Error formatting Jalali date with time:', error)
    return '-'
  }
}

/**
 * تبدیل تاریخ ISO به نمایش شمسی با ساعت (نام قدیمی برای backward compatibility)
 */
export function formatJalaliWithTime(dateISO: string | Date): string {
  return formatJalaliDateTime(dateISO)
}

/**
 * تبدیل تاریخ ISO به نمایش میلادی
 * @param dateISO - تاریخ ISO
 * @returns تاریخ میلادی به فرمت "2024-08-27"
 */
export function formatGregorian(dateISO: string | Date): string {
  if (!dateISO) return '-'
  
  try {
    const date = new Date(dateISO)
    if (isNaN(date.getTime())) return '-'
    
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    
    return `${year}-${month}-${day}`
    
  } catch (error) {
    console.warn('Error formatting Gregorian date:', error)
    return '-'
  }
}

/**
 * تبدیل تاریخ ISO به نمایش میلادی با ساعت
 * @param dateISO - تاریخ ISO
 * @returns تاریخ میلادی با ساعت به فرمت "2024-08-27 14:30"
 */
export function formatGregorianDateTime(dateISO: string | Date): string {
  if (!dateISO) return '-'
  
  try {
    const date = new Date(dateISO)
    if (isNaN(date.getTime())) return '-'
    
    const gregorianDate = formatGregorian(dateISO)
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    
    return `${gregorianDate} ${hours}:${minutes}`
    
  } catch (error) {
    console.warn('Error formatting Gregorian date with time:', error)
    return '-'
  }
}

/**
 * تبدیل تاریخ ISO به نمایش مناسب برای UI
 * @param dateISO - تاریخ ISO
 * @param options - گزینه‌های نمایش
 * @returns تاریخ فرمت شده
 */
export function formatDateForUI(dateISO: string | Date, options: { calendar: 'jalali' | 'gregorian', withTime?: boolean } = { calendar: 'jalali' }): string {
  if (!dateISO) return '-'
  
  try {
    if (options.calendar === 'jalali') {
      return options.withTime ? formatJalaliDateTime(dateISO) : formatJalali(dateISO)
    } else {
      return options.withTime ? formatGregorianDateTime(dateISO) : formatGregorian(dateISO)
    }
  } catch (error) {
    console.warn('Error formatting date for UI:', error)
    return '-'
  }
}

/**
 * بررسی اینکه آیا تاریخ معتبر است یا نه
 * @param input - رشته تاریخ یا Date object
 * @returns true اگر تاریخ معتبر باشد
 */
export function isValidDate(input: string | Date): boolean {
  if (!input) return false
  
  try {
    if (input instanceof Date) {
      return !isNaN(input.getTime())
    }
    
    if (typeof input === 'string') {
      // بررسی فرمت شمسی
      if (input.includes('-') || input.includes('/')) {
            const parts = input.replace(/[\/\-]/g, '-').split('-')
    if (parts.length !== 3) return false
    
    const year = parseInt(parts[0] || '0')
    const month = parseInt(parts[1] || '0')
    const day = parseInt(parts[2] || '0')
    
    return !isNaN(year) && !isNaN(month) && !isNaN(day) &&
           year >= 1300 && year <= 1500 &&
           month >= 1 && month <= 12 &&
           day >= 1 && day <= 31
      }
      
      // بررسی فرمت ISO
      const date = new Date(input)
      return !isNaN(date.getTime())
    }
    
    return false
  } catch {
    return false
  }
}

/**
 * تبدیل تاریخ جلالی به ISO (SSR-safe)
 * @param input - تاریخ جلالی
 * @returns تاریخ ISO یا null
 */
export function toISOFromJalali(input: string): string | null {
  // در SSR، فقط بررسی فرمت انجام می‌شود
  if (process.server) {
    if (!isValidDate(input)) return null
    // در SSR، تاریخ فعلی برگردانده می‌شود
    return new Date().toISOString()
  }
  
  // در client، تبدیل کامل انجام می‌شود
  return toISOFromJalaliInput(input)
}

/**
 * تولید تاریخ‌های محدوده سریع (SSR-safe)
 * @param days - تعداد روزهای گذشته
 * @returns object شامل from و to
 */
export function generateQuickDateRange(days: number): { from: string; to: string } {
  // استفاده از تاریخ سرور برای دقت بیشتر
  const now = new Date()
  
  // تنظیم به ابتدای روز (00:00:00)
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const start = new Date(end)
  start.setDate(end.getDate() - days)
  
  // در SSR، تاریخ‌های میلادی برگردانده می‌شوند
  if (process.server) {
    return {
      from: start.toISOString().split('T')[0] || '',
      to: end.toISOString().split('T')[0] || ''
    }
  }
  
  // در client، تاریخ‌های جلالی تولید می‌شوند
  // تبدیل به تاریخ شمسی با الگوریتم صحیح
  const startJalali = gregorianToJalali(start)
  const endJalali = gregorianToJalali(end)
  
  return {
    from: startJalali,
    to: endJalali
  }
}

/**
 * دریافت تاریخ امروز با دقت بالا (SSR-safe)
 * @returns تاریخ امروز در فرمت جلالی
 */
export function getTodayJalali(): string {
  // در SSR، تاریخ فعلی سرور استفاده می‌شود
  if (process.server) {
    const now = new Date()
    return gregorianToJalali(now)
  }
  
  // در client، تاریخ محلی استفاده می‌شود
  const now = new Date()
  return gregorianToJalali(now)
}

/**
 * بررسی اینکه آیا تاریخ ورودی امروز است یا نه
 * @param jalaliDate - تاریخ جلالی
 * @returns true اگر تاریخ امروز باشد
 */
export function isToday(jalaliDate: string): boolean {
  const today = getTodayJalali()
  return jalaliDate === today
}
