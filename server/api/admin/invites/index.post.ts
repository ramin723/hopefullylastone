/**
 * POST /api/admin/invites
 * 
 * Create a new invite for a user
 * 
 * Request Body:
 * {
 *   "role": "MECHANIC" | "VENDOR",
 *   "phone": string, // 10-15 digits, normalized
 *   "fullName": string (optional),
 *   "city": string (optional),
 *   "specialties": string (optional), // for MECHANIC role
 *   "storeName": string (optional), // for VENDOR role
 *   "addressLine": string (optional), // for VENDOR role
 *   "province": string (optional), // for VENDOR role
 *   "postalCode": string (optional) // 10 digits for VENDOR role
 * }
 * 
 * Response:
 * {
 *   "ok": true,
 *   "message": "دعوت با موفقیت ارسال شد",
 *   "data": {
 *     "inviteId": number,
 *     "token": string (dev only),
 *     "link": string (dev only)
 *   }
 * }
 * 
 * Security: Requires ADMIN role, includes CSRF protection, rate limiting
 * SMS: Automatically sends invite SMS to the provided phone number
 */

// server/api/admin/invites/index.post.ts
import { prisma } from '../../../utils/db'
import { createRequestLogger } from '../../../utils/logger'
import { randomUUID } from 'crypto'
import { rateLimitComposite, getClientIP, hashPhone, maskPhone } from '../../../utils/rateLimiter'
import { appendResponseHeader } from 'h3'
import { CreateInviteSchema } from '../../../validators/invite'
import { 
  generateInviteToken, 
  hashToken, 
  sendInviteSms,
  inviteActiveWhere
} from '../../../utils/invite'
import { normalizePhone } from '../../../utils/otp'
import { requireAuth, requireRole } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  const requestId = randomUUID()
  const logger = createRequestLogger(requestId)
  
  logger.info('Admin invite creation started')
  
  // Check authentication and admin role
  const user = await requireAuth(event)
  requireRole(user, 'ADMIN')
  
  const body = await readBody(event)
  
  // Validate input
  const validation = CreateInviteSchema.safeParse(body)
  if (!validation.success) {
    logger.error('Invite creation validation failed', { 
      errors: validation.error.issues.map((e: any) => e.message) 
    })
    throw createError({ 
      statusCode: 400, 
      statusMessage: validation.error.issues[0]?.message || 'Invalid input' 
    })
  }
  
  const { role, phone, fullName, city, specialties, storeName, addressLine, province, postalCode } = validation.data
  const normalizedPhone = normalizePhone(phone)
  
  // Rate limiting (IP + phone hash)
  const ip = getClientIP(event)
  const phoneHash = hashPhone(normalizedPhone)
  const key = `${ip}:${phoneHash}:invite`
  
  const { allowed, remaining, resetAt } = rateLimitComposite({
    key,
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 10 // 10 requests per 10 minutes
  })
  
  if (!allowed) {
    const retryAfterSec = Math.max(1, Math.ceil((resetAt - Date.now()) / 1000))
    appendResponseHeader(event, 'Retry-After', retryAfterSec)
    
    logger.warn('Invite creation rate-limited', {
      requestId,
      phone: maskPhone(normalizedPhone),
      remaining,
      resetAt
    })
    
    throw createError({
      statusCode: 429,
      statusMessage: 'Too Many Requests',
      message: 'Too many invite requests. Please try again later.'
    })
  }
  
  logger.info('Invite creation allowed', {
    requestId,
    phone: maskPhone(normalizedPhone),
    role,
    remaining,
    resetAt
  })
  
  try {
    // Check if user already exists with this role
    const existingUser = await prisma.user.findFirst({
      where: {
        phone: normalizedPhone,
        role,
        status: 'ACTIVE'
      },
      include: {
        Mechanic: role === 'MECHANIC',
        Vendor: role === 'VENDOR'
      }
    })
    
    if (existingUser) {
      logger.warn('User already exists with this role', {
        requestId,
        phone: maskPhone(normalizedPhone),
        role,
        userId: existingUser.id
      })
      
      throw createError({
        statusCode: 409,
        statusMessage: 'Conflict',
        message: 'کاربری با این شماره تلفن و نقش از قبل وجود دارد'
      })
    }
    
    // Check if there's an active invite for this phone/role
    const existingInvite = await prisma.invite.findFirst({
      where: inviteActiveWhere(normalizedPhone, role)
    })
    
    if (existingInvite) {
      logger.warn('Active invite already exists', {
        requestId,
        phone: maskPhone(normalizedPhone),
        role,
        inviteId: existingInvite.id
      })
      
      throw createError({
        statusCode: 409,
        statusMessage: 'Conflict',
        message: 'دعوت فعالی برای این شماره تلفن و نقش از قبل وجود دارد'
      })
    }
    
    // Generate invite token and hash
    const token = generateInviteToken(16)
    const codeHash = hashToken(token)
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000) // 48 hours
    
    // Prepare meta data
    const meta: any = {}
    if (fullName) meta.fullName = fullName
    if (city) meta.city = city
    if (specialties) meta.specialties = specialties
    if (storeName) meta.storeName = storeName
    if (addressLine) meta.addressLine = addressLine
    if (province) meta.province = province
    if (postalCode) meta.postalCode = postalCode
    
    // Create invite and send SMS in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create invite
      const invite = await tx.invite.create({
        data: {
          role,
          phone: normalizedPhone,
          codeHash,
          expiresAt,
          createdBy: user.id,
          meta: Object.keys(meta).length > 0 ? meta : null
        }
      })
      
      // Send SMS
      const smsResult = await sendInviteSms(normalizedPhone, token, role, fullName)
      
      if (!smsResult.sent) {
        // اگر SMS شکست خورد، transaction را rollback کن
        throw createError({
          statusCode: 502,
          statusMessage: 'SMS Service Unavailable',
          message: smsResult.error || 'ایجاد دعوت انجام نشد (ارسال پیامک ناموفق).'
        })
      }
      
      // Update invite with sent status
      const updatedInvite = await tx.invite.update({
        where: { id: invite.id },
        data: { sent: smsResult.sent }
      })
      
      return { invite: updatedInvite, smsResult }
    })
    
    logger.info('Invite created and SMS sent successfully', {
      requestId,
      inviteId: result.invite.id,
      phone: maskPhone(normalizedPhone),
      role,
      expiresAt
    })
    
    return {
      ok: true,
      message: 'دعوت با موفقیت ارسال شد',
      data: {
        inviteId: result.invite.id,
        sent: result.smsResult.sent,
        token: process.env.NODE_ENV === 'development' ? token : undefined, // Only return token in dev
        link: process.env.NODE_ENV === 'development' ? `${process.env.NUXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/invite/${token}` : undefined
      }
    }
    
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    
    logger.error('Invite creation failed', {
      requestId,
      phone: maskPhone(normalizedPhone),
      role,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: 'Failed to create invite'
    })
  }
})
