// server/utils/otp.ts
import crypto from 'node:crypto'
// import type { OtpCode } from '@prisma/client'

/**
 * Generate a random numeric OTP code
 * @param len Length of the code (default: 5)
 * @returns Numeric string code
 */
export function generateNumericCode(len: number = 5): string {
  const min = Math.pow(10, len - 1)
  const max = Math.pow(10, len) - 1
  const code = Math.floor(Math.random() * (max - min + 1)) + min
  return code.toString()
}

/**
 * Hash OTP code using SHA-256
 * @param code Plain text OTP code
 * @returns Hashed code
 */
export function hashCode(code: string): string {
  return crypto.createHash('sha256').update(code).digest('hex')
}

/**
 * Check if OTP record is locked
 * @param otp OtpCode record from database
 * @returns true if locked, false otherwise
 */
export function isLocked(otp: any): boolean {
  if (!otp.lockedUntil) return false
  return new Date() < otp.lockedUntil
}


/**
 * Normalize phone number (trim, remove spaces, etc.)
 * @param phone Raw phone number
 * @returns Normalized phone number
 */
export function normalizePhone(phone: string): string {
  return (phone || '').trim().replace(/\s+/g, '')
}

/**
 * Check if OTP code is expired
 * @param otp OtpCode record from database
 * @returns true if expired, false otherwise
 */
export function isExpired(otp: any): boolean {
  return new Date() > otp.expiresAt
}

/**
 * Check if OTP code is valid (not expired, not used, not locked)
 * @param otp OtpCode record from database
 * @returns true if valid, false otherwise
 */
export function isValid(otp: any): boolean {
  return !isExpired(otp) && !otp.isUsed && !isLocked(otp)
}
