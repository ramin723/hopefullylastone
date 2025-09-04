// server/api/invite/accept.post.ts
import { prisma } from '../../utils/db'
import { createRequestLogger } from '../../utils/logger'
import { randomUUID } from 'crypto'
import { rateLimitComposite, getClientIP } from '../../utils/rateLimiter'
import { appendResponseHeader } from 'h3'
import { AcceptInviteSchema } from '../../validators/invite'
import { hashToken, isInviteValid } from '../../utils/invite'
import { normalizePhone } from '../../utils/otp'
import { maskPhone } from '../../utils/rateLimiter'
import { hashCode, isValid } from '../../utils/otp'
import { generateTokens } from '../../utils/tokens'

export default defineEventHandler(async (event) => {
  const requestId = randomUUID()
  const logger = createRequestLogger(requestId)
  
  logger.info('Invite acceptance started')
  
  const body = await readBody(event)
  
  // Validate input
  const validation = AcceptInviteSchema.safeParse(body)
  if (!validation.success) {
    logger.error('Invite acceptance validation failed', { 
      requestId,
      errors: validation.error.issues.map((e: any) => e.message) 
    })
    throw createError({ 
      statusCode: 400, 
      statusMessage: validation.error.issues[0]?.message || 'Invalid input' 
    })
  }
  
  const { token, otpCode } = validation.data
  
  // Rate limiting (IP based)
  const ip = getClientIP(event)
  const key = `${ip}:invite-accept`
  
  const { allowed, remaining, resetAt } = rateLimitComposite({
    key,
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 10 // 10 requests per 10 minutes
  })
  
  if (!allowed) {
    const retryAfterSec = Math.max(1, Math.ceil((resetAt - Date.now()) / 1000))
    appendResponseHeader(event, 'Retry-After', retryAfterSec)
    
    logger.warn('Invite acceptance rate-limited', {
      requestId,
      remaining,
      resetAt
    })
    
    throw createError({
      statusCode: 429,
      statusMessage: 'Too Many Requests',
      message: 'Too many acceptance requests. Please try again later.'
    })
  }
  
  logger.info('Invite acceptance allowed', {
    requestId,
    remaining,
    resetAt
  })
  
  try {
    // Find the invite
    const tokenHash = hashToken(token)
    const invite = await prisma.invite.findFirst({
      where: { codeHash: tokenHash },
      include: {
        createdByUser: {
          select: {
            id: true,
            fullName: true
          }
        }
      }
    })
    
    if (!invite) {
      logger.warn('Invite not found', { requestId })
      throw createError({
        statusCode: 404,
        statusMessage: 'Invite not found'
      })
    }
    
    // Check if invite is valid
    if (!isInviteValid(invite)) {
      const reason = invite.usedAt ? 'used' : 'expired'
      logger.warn('Invite is invalid', { 
        requestId, 
        inviteId: invite.id,
        reason
      })
      
      throw createError({
        statusCode: 410,
        statusMessage: 'Invite is no longer valid',
        message: reason === 'used' ? 'این دعوت قبلاً استفاده شده است' : 'این دعوت منقضی شده است'
      })
    }
    
    // Verify OTP
    const normalizedPhone = normalizePhone(invite.phone)
    const otpCodeHash = hashCode(otpCode)
    
    const otpRecord = await prisma.otpCode.findFirst({
      where: {
        phone: normalizedPhone,
        codeHash: otpCodeHash,
        purpose: 'login',
        isUsed: false,
        expiresAt: { gt: new Date() }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    if (!otpRecord || !isValid(otpRecord)) {
      logger.warn('Invalid OTP for invite acceptance', {
        requestId,
        inviteId: invite.id,
        phone: maskPhone(normalizedPhone)
      })
      
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid OTP',
        message: 'کد تأیید نامعتبر است'
      })
    }
    
    // Mark OTP as used
    await prisma.otpCode.update({
      where: { id: otpRecord.id },
      data: { isUsed: true }
    })
    
    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { phone: normalizedPhone },
      include: {
        Mechanic: invite.role === 'MECHANIC',
        Vendor: invite.role === 'VENDOR'
      }
    })
    
    if (user) {
      // User exists, check if they have the correct role and status
      if (user.role !== invite.role) {
        logger.warn('User exists with different role', {
          requestId,
          userId: user.id,
          userRole: user.role,
          inviteRole: invite.role
        })
        
        throw createError({
          statusCode: 409,
          statusMessage: 'User role mismatch',
          message: 'کاربری با این شماره تلفن با نقش متفاوت وجود دارد'
        })
      }
      
      if (user.status !== 'ACTIVE') {
        // Reactivate user
        user = await prisma.user.update({
          where: { id: user.id },
          data: { status: 'ACTIVE' },
          include: {
            Mechanic: invite.role === 'MECHANIC',
            Vendor: invite.role === 'VENDOR'
          }
        })
        
        logger.info('User reactivated', {
          requestId,
          userId: user.id,
          phone: maskPhone(normalizedPhone)
        })
      }
      
      // Set mustSetPassword flag
      user = await prisma.user.update({
        where: { id: user.id },
        data: { 
          // Update user info from invite meta if provided
          fullName: (invite.meta as any)?.fullName || user.fullName
        },
        include: {
          Mechanic: invite.role === 'MECHANIC',
          Vendor: invite.role === 'VENDOR'
        }
      })
      
    } else {
      // Create new user
      const userData: any = {
        fullName: (invite.meta as any)?.fullName || 'کاربر جدید',
        phone: normalizedPhone,
        passwordHash: '', // Will be set when user sets password
        role: invite.role,
        status: 'ACTIVE'
      }
      
      user = await prisma.user.create({
        data: userData,
        include: {
          Mechanic: invite.role === 'MECHANIC',
          Vendor: invite.role === 'VENDOR'
        }
      })
      
      // Create role-specific record
      if (invite.role === 'MECHANIC') {
        const mechanicData: any = {
          userId: user.id,
          code: `M${user.id.toString().padStart(6, '0')}`,
          city: (invite.meta as any)?.city,
          specialties: (invite.meta as any)?.specialties
        }
        
        await prisma.mechanic.create({
          data: mechanicData
        })
        
      } else if (invite.role === 'VENDOR') {
        const vendorData: any = {
          userId: user.id,
          storeName: (invite.meta as any)?.storeName || 'فروشگاه جدید',
          city: (invite.meta as any)?.city,
          addressLine: (invite.meta as any)?.addressLine,
          province: (invite.meta as any)?.province,
          postalCode: (invite.meta as any)?.postalCode
        }
        
        await prisma.vendor.create({
          data: vendorData
        })
      }
      
      logger.info('New user created from invite', {
        requestId,
        userId: user.id,
        role: invite.role,
        phone: maskPhone(normalizedPhone)
      })
    }
    
    // Mark invite as used
    await prisma.invite.update({
      where: { id: invite.id },
      data: { usedAt: new Date() }
    })
    
    // Generate tokens for login
    const tokens = await generateTokens(user.id, event)
    
    logger.info('Invite accepted successfully', {
      requestId,
      inviteId: invite.id,
      userId: user.id,
      role: invite.role,
      phone: maskPhone(normalizedPhone)
    })
    
    return {
      ok: true,
      data: {
        user: {
          id: user.id,
          fullName: user.fullName,
          role: user.role,
          mustSetPassword: !user.passwordHash || user.passwordHash === ''
        },
        tokens,
        redirectTo: invite.role === 'MECHANIC' ? '/mechanic' : '/vendor'
      }
    }
    
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    
    logger.error('Invite acceptance failed', {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: 'Failed to accept invite'
    })
  }
})
