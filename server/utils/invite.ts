// server/utils/invite.ts
import crypto from 'node:crypto'
import { normalizePhone } from './otp'
import { maskPhone } from './rateLimiter'
import { sendInviteViaVerifyLookup } from './sms'

/**
 * Generate a URL-safe random token for invite
 * @param length Length of the token (default: 16)
 * @returns URL-safe random string
 */
export function generateInviteToken(length: number = 16): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'
  let result = ''
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  
  return result
}

/**
 * Hash invite token using SHA-256
 * @param token Plain text invite token
 * @returns Hashed token
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

/**
 * Build shareable invite URL
 * @param token Plain text invite token
 * @returns Full invite URL
 */
export function buildShareUrl(token: string): string {
  const baseUrl = process.env.NUXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  return `${baseUrl}/invite/${token}`
}

/**
 * Generate SMS message for invite
 * @param token Invite token
 * @param role User role (MECHANIC or VENDOR)
 * @param fullName Optional full name
 * @returns Formatted SMS message
 */
export function generateInviteMessage(token: string, role: string, fullName?: string): string {
  const roleText = role === 'MECHANIC' ? 'مکانیک' : 'فروشگاه'
  const nameText = fullName ? ` ${fullName} عزیز` : ''
  const url = buildShareUrl(token)
  
  return `سلام${nameText}!\nشما برای ثبت‌نام به عنوان ${roleText} دعوت شده‌اید.\nلینک دعوت: ${url}\nاین لینک تا 48 ساعت معتبر است.`
}

/**
 * Send invite SMS via VerifyLookup
 * @param phone Phone number
 * @param token Invite token
 * @param role User role
 * @param fullName Optional full name
 * @returns Promise with send result
 */
export async function sendInviteSms(
  phone: string, 
  token: string, 
  role: string, 
  fullName?: string
): Promise<{ ok: boolean; sent: boolean; error?: string }> {
  const normalizedPhone = normalizePhone(phone)
  
  try {
    const result = await sendInviteViaVerifyLookup({ 
      phone: normalizedPhone, 
      token: token,
      template: 'invite-code'
    })
    
    return {
      ok: true,
      sent: true
    }
  } catch (error: any) {
    console.error('[SMS] Invite send failed', {
      phoneMasked: maskPhone(normalizedPhone),
      error: error.message
    })
    
    return {
      ok: false,
      sent: false,
      error: error.message
    }
  }
}

/**
 * Check if invite is expired
 * @param expiresAt Expiration date
 * @returns true if expired, false otherwise
 */
export function isInviteExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt
}

/**
 * Check if invite is used
 * @param usedAt Usage date (null if not used)
 * @returns true if used, false otherwise
 */
export function isInviteUsed(usedAt: Date | null): boolean {
  return usedAt !== null
}

/**
 * Check if invite is valid (not expired, not used)
 * @param invite Invite object with expiresAt and usedAt
 * @returns true if valid, false otherwise
 */
export function isInviteValid(invite: { expiresAt: Date; usedAt: Date | null }): boolean {
  return !isInviteExpired(invite.expiresAt) && !isInviteUsed(invite.usedAt)
}

/**
 * Check if invite is active (not used, not canceled, not expired)
 * @param invite Invite object
 * @returns true if active, false otherwise
 */
export function inviteIsActive(invite: { usedAt: Date | null; canceledAt: Date | null; expiresAt: Date }): boolean {
  return !invite.usedAt && !invite.canceledAt && invite.expiresAt > new Date()
}

/**
 * Get where clause for active invites
 * @param phone Phone number
 * @param role User role
 * @returns Where clause object
 */
export function inviteActiveWhere(phone: string, role: 'MECHANIC' | 'VENDOR') {
  return {
    phone: normalizePhone(phone),
    role,
    usedAt: null,
    canceledAt: null,
    expiresAt: { gt: new Date() }
  }
}

/**
 * Get invite status for display
 * @param invite Invite object
 * @returns Status string
 */
export function getInviteStatus(invite: { expiresAt: Date; usedAt: Date | null; canceledAt: Date | null; meta?: any }): string {
  if (invite.usedAt) {
    return 'USED'
  }
  if (invite.canceledAt) {
    return 'CANCELED'
  }
  if (isInviteExpired(invite.expiresAt)) {
    return 'EXPIRED'
  }
  return 'ACTIVE'
}

