// server/utils/ids.ts
import { randomBytes } from 'crypto'

/**
 * Generate a unique order code for QR codes
 * Returns a 12-character URL-safe string
 */
export function generateOrderCode(): string {
  // Generate 9 random bytes and encode as base64url
  const bytes = randomBytes(9)
  const base64 = bytes.toString('base64')
    .replace(/\+/g, '-')  // Replace + with -
    .replace(/\//g, '_')  // Replace / with _
    .replace(/=/g, '')    // Remove padding
  
  // Ensure exactly 12 characters
  return base64.slice(0, 12)
}

/**
 * Validate if an order code format is correct
 */
export function isValidOrderCode(code: string): boolean {
  return /^[A-Za-z0-9_-]{12}$/.test(code)
}

export function generateMechanicCode(): string {
  const bytes = randomBytes(6)
  const base64 = bytes.toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
  return base64.slice(0, 8).toUpperCase()
}

export function isValidMechanicCode(code: string): boolean {
  return /^[A-Z0-9_-]{8}$/.test(code)
}
