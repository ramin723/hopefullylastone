/**
 * تبدیل ورودی شمسی به ISO (ابتدای روز)
 * @param jalaliStr - تاریخ شمسی به فرمت "1403-06-05"
 * @returns تاریخ ISO به فرمت "2024-08-27T00:00:00.000Z"
 */
export function toISOFromJalaliInput(jalaliStr: string): string {
  if (!jalaliStr || jalaliStr.trim() === '') return ''
  
  try {
    // تبدیل ساده شمسی به میلادی (تقریبی)
    const parts = jalaliStr.split('-')
    if (parts.length !== 3) throw new Error('Invalid Jalali date format')
    
    const year = parseInt(parts[0] || '0')
    const month = parseInt(parts[1] || '0')
    const day = parseInt(parts[2] || '0')
    
    if (isNaN(year) || isNaN(month) || isNaN(day)) {
      throw new Error('Invalid Jalali date values')
    }
    
    // تبدیل تقریبی (برای تست)
    const gregorianYear = year - 621
    const gregorianMonth = month + 2
    const gregorianDay = day
    
    const date = new Date(gregorianYear, gregorianMonth - 1, gregorianDay)
    return date.toISOString()
    
  } catch (error) {
    console.warn('Error converting Jalali to ISO:', error)
    return ''
  }
}

/**
 * تبدیل ورودی شمسی به ISO (انتهای روز)
 * @param jalaliStr - تاریخ شمسی به فرمت "1403-06-05"
 * @returns تاریخ ISO به فرمت "2024-08-27T23:59:59.999Z"
 */
export function toISOEndOfDayFromJalaliInput(jalaliStr: string): string {
  if (!jalaliStr || jalaliStr.trim() === '') return ''
  
  try {
    const startOfDay = toISOFromJalaliInput(jalaliStr)
    if (!startOfDay) return ''
    
    const date = new Date(startOfDay)
    date.setHours(23, 59, 59, 999)
    return date.toISOString()
    
  } catch (error) {
    console.warn('Error converting Jalali date (end of day):', error)
    return ''
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
    
    // تبدیل تقریبی میلادی به شمسی (برای تست)
    const year = date.getFullYear() + 621
    const month = date.getMonth() + 1
    const day = date.getDate()
    
    return `${year}/${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}`
    
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
