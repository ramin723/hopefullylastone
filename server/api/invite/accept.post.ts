// server/api/invite/accept.post.ts
import { prisma } from '../../utils/db'
import { createRequestLogger } from '../../utils/logger'
import { randomUUID } from 'crypto'
import { rateLimitComposite, getClientIP } from '../../utils/rateLimiter'
import { appendResponseHeader, setCookie } from 'h3'
import { AcceptInviteSchema } from '../../validators/invite'
import { hashToken, isInviteValid } from '../../utils/invite'
import { normalizePhone } from '../../utils/otp'
import { maskPhone } from '../../utils/rateLimiter'
import { hashCode, isValid } from '../../utils/otp'
import { generateTokens } from '../../utils/tokens'
import { generateMechanicCodeUnique } from '../../utils/ids'

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
    
    // Check if invite is valid (not expired, not used)
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
    
    // ATOMIC TRANSACTION: All operations in one transaction
    const result = await prisma.$transaction(async (tx) => {
      // Mark OTP as used
      await tx.otpCode.update({
        where: { id: otpRecord.id },
        data: { isUsed: true }
      })
      
      // Check if user already exists
      let user = await tx.user.findUnique({
        where: { phone: normalizedPhone },
        include: {
          Mechanic: invite.role === 'MECHANIC',
          Vendor: invite.role === 'VENDOR'
        }
      })
      
      let userCreated = false
      let roleEntityCreated = false
      let qrGenerated = false
      
      if (user) {
        // User exists, check if they have the correct role
        if (user.role !== invite.role) {
          logger.warn('User exists with different role', {
            requestId,
            userId: user.id,
            userRole: user.role,
            inviteRole: invite.role
          })
          
          throw createError({
            statusCode: 400,
            statusMessage: 'User role mismatch',
            message: 'کاربری با این شماره تلفن با نقش متفاوت وجود دارد'
          })
        }
        
        // Reactivate user if needed
        if (user.status !== 'ACTIVE') {
          user = await tx.user.update({
            where: { id: user.id },
            data: { status: 'ACTIVE' },
            include: {
              Mechanic: invite.role === 'MECHANIC',
              Vendor: invite.role === 'VENDOR'
            }
          })
        }
        
        // Update user info from invite meta if provided
        if (invite.meta && (invite.meta as any)?.fullName) {
          user = await tx.user.update({
            where: { id: user.id },
            data: { 
              fullName: (invite.meta as any).fullName
            },
            include: {
              Mechanic: invite.role === 'MECHANIC',
              Vendor: invite.role === 'VENDOR'
            }
          })
        }
        
        // If user has no password, set mustChangePassword flag
        const hasPassword = user.passwordHash && user.passwordHash.length > 0
        console.debug('[INVITE ACCEPT] User exists check', {
          userId: user.id,
          hasPassword,
          currentMustChangePassword: user.mustChangePassword,
          passwordHashLength: user.passwordHash?.length || 0
        })
        
        if (!hasPassword) {
          user = await tx.user.update({
            where: { id: user.id },
            data: { 
              mustChangePassword: true
            } as any,
            include: {
              Mechanic: invite.role === 'MECHANIC',
              Vendor: invite.role === 'VENDOR'
            }
          })
          console.debug('[INVITE ACCEPT] Set mustChangePassword to true', {
            userId: user.id,
            newMustChangePassword: user.mustChangePassword
          })
        }
        
      } else {
        // Create new user
        const userData: any = {
          fullName: (invite.meta as any)?.fullName || 'کاربر جدید',
          phone: normalizedPhone,
          passwordHash: '', // Will be set when user sets password
          mustChangePassword: true, // User must set password on first login
          role: invite.role,
          status: 'ACTIVE'
        }
        
        user = await tx.user.create({
          data: userData,
          include: {
            Mechanic: invite.role === 'MECHANIC',
            Vendor: invite.role === 'VENDOR'
          }
        })
        
        userCreated = true
      }
      
      // Create or update role-specific entity
      if (invite.role === 'MECHANIC') {
        let mechanic = user.Mechanic
        
        if (!mechanic) {
          // Create new mechanic
          const mechanicCode = await generateMechanicCodeUnique(tx)
          const mechanicData: any = {
            userId: user.id,
            code: mechanicCode,
            qrActive: true,
            city: (invite.meta as any)?.city,
            specialties: (invite.meta as any)?.specialties
          }
          
          mechanic = await tx.mechanic.create({
            data: mechanicData
          })
          
          roleEntityCreated = true
          qrGenerated = true
        } else {
          // Update existing mechanic
          const updateData: any = {}
          
          if (!mechanic.code) {
            updateData.code = await generateMechanicCodeUnique(tx)
            qrGenerated = true
          }
          
          if (!mechanic.qrActive) {
            updateData.qrActive = true
          }
          
          if (Object.keys(updateData).length > 0) {
            mechanic = await tx.mechanic.update({
              where: { id: mechanic.id },
              data: updateData
            })
          }
        }
        
      } else if (invite.role === 'VENDOR') {
        let vendor = user.Vendor
        
        if (!vendor) {
          // Create new vendor
          const vendorData: any = {
            userId: user.id,
            storeName: (invite.meta as any)?.storeName || 'فروشگاه جدید',
            city: (invite.meta as any)?.city,
            addressLine: (invite.meta as any)?.addressLine,
            province: (invite.meta as any)?.province,
            postalCode: (invite.meta as any)?.postalCode,
            isActive: true
          }
          
          vendor = await tx.vendor.create({
            data: vendorData
          })
          
          roleEntityCreated = true
        } else {
          // Update existing vendor if needed
          const updateData: any = {}
          
          if (invite.meta && (invite.meta as any)?.storeName) {
            updateData.storeName = (invite.meta as any).storeName
          }
          
          if (invite.meta && (invite.meta as any)?.city) {
            updateData.city = (invite.meta as any).city
          }
          
          if (Object.keys(updateData).length > 0) {
            vendor = await tx.vendor.update({
              where: { id: vendor.id },
              data: updateData
            })
          }
        }
      }
      
      // Mark invite as used
      await tx.invite.update({
        where: { id: invite.id },
        data: { usedAt: new Date() }
      })
      
      return {
        user,
        userCreated,
        roleEntityCreated,
        qrGenerated
      }
    })
    
    // Generate tokens for login
    const tokens = await generateTokens(result.user.id, event)
    
    // Set cookies with proper flags for dev/prod
    const isProd = process.env.NODE_ENV === 'production'
    
    setCookie(event, 'at', tokens.accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProd,      // ← DEV: false  |  PROD: true
      path: '/',
      maxAge: 60 * 15      // 15m
    })
    
    setCookie(event, 'rt', tokens.refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProd,      // ← DEV: false  |  PROD: true
      path: '/',
      maxAge: 60 * 60 * 24 * 30 // 30d
    })
    
    // Log cookie flags for debugging in dev
    if (!isProd) {
      logger.info('Cookie flags set for development', {
        requestId,
        secure: false,
        sameSite: 'lax',
        httpOnly: true,
        path: '/'
      })
    }
    
    logger.info('Invite accepted successfully', {
      requestId,
      inviteId: invite.id,
      userId: result.user.id,
      role: invite.role,
      phone: maskPhone(normalizedPhone),
      userCreated: result.userCreated,
      roleEntityCreated: result.roleEntityCreated,
      qrGenerated: result.qrGenerated,
      mustChangePassword: (result.user as any).mustChangePassword
    })
    
    // Debug log for mustChangePassword flag
    console.info('[INVITE ACCEPT] User invite accepted', {
      userId: result.user.id,
      role: invite.role,
      mustChangePassword: (result.user as any).mustChangePassword,
      hasPassword: result.user.passwordHash && result.user.passwordHash.length > 0,
      userCreated: result.userCreated,
      expectedRedirect: (result.user as any).mustChangePassword ? '/onboarding/set-password' : (invite.role === 'MECHANIC' ? '/mechanic' : '/vendor'),
      timestamp: new Date().toISOString()
    })
    
    return {
      ok: true,
      user: {
        id: result.user.id,
        role: result.user.role,
        fullName: result.user.fullName,
        phone: result.user.phone
      },
      created: {
        user: result.userCreated,
        roleEntity: result.roleEntityCreated,
        qrGenerated: result.qrGenerated
      },
      redirect: invite.role === 'MECHANIC' ? '/mechanic' : '/vendor',
      tokens
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