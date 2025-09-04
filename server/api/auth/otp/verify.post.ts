// server/api/auth/otp/verify.post.ts
import { prisma } from '../../../utils/db'
import { createRequestLogger } from '../../../utils/logger'
import { randomUUID } from 'crypto'
import { rateLimitComposite, getClientIP, hashPhone, maskPhone } from '../../../utils/rateLimiter'
import { appendResponseHeader } from 'h3'
import { VerifyOtpSchema } from '../../../validators/otp'
import { hashCode, normalizePhone, isLocked, isExpired } from '../../../utils/otp'
import { generateAccessToken, generateRefreshToken, hashRefreshToken, getRefreshTokenExpiry } from '../../../utils/tokens'

// Configuration
const ALLOW_SELF_SIGNUP = false // Currently disabled

export default defineEventHandler(async (event) => {
  const requestId = randomUUID()
  const logger = createRequestLogger(requestId)
  
  logger.info('OTP verification started')
  
  const body = await readBody<{ phone?: string; purpose?: string; code?: string }>(event)
  
  // Validate input
  const validation = VerifyOtpSchema.safeParse(body)
  if (!validation.success) {
    logger.error('OTP verification validation failed', { 
      errors: validation.error.issues.map((e: any) => e.message) 
    })
    throw createError({ 
      statusCode: 400, 
      statusMessage: validation.error.issues[0]?.message || 'Invalid input' 
    })
  }
  
  const { phone, purpose, code } = validation.data
  const normalizedPhone = normalizePhone(phone)
  
  // Rate limiting (IP + phone hash)
  const ip = getClientIP(event)
  const phoneHash = hashPhone(normalizedPhone)
  const key = `${ip}:${phoneHash}:${purpose}`
  
  const { allowed, remaining, resetAt } = rateLimitComposite({
    key,
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 10 // 10 attempts per 10 minutes
  })
  
  if (!allowed) {
    const retryAfterSec = Math.max(1, Math.ceil((resetAt - Date.now()) / 1000))
    appendResponseHeader(event, 'Retry-After', retryAfterSec)
    
    logger.warn('OTP verification rate-limited', {
      requestId,
      phone: maskPhone(normalizedPhone),
      remaining,
      resetAt
    })
    
    throw createError({
      statusCode: 429,
      statusMessage: 'Too Many Requests',
      message: 'Too many verification attempts. Please try again later.'
    })
  }
  
  logger.info('OTP verification allowed', {
    requestId,
    phone: maskPhone(normalizedPhone),
    remaining,
    resetAt
  })
  
  try {
    // Find the latest OTP for this phone/purpose
    const otp = await prisma.otpCode.findFirst({
      where: {
        phone: normalizedPhone,
        purpose,
        isUsed: false
      },
      orderBy: { createdAt: 'desc' }
    })
    
    if (!otp) {
      logger.error('OTP not found', {
        requestId,
        phone: maskPhone(normalizedPhone)
      })
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid or expired code'
      })
    }
    
    // Check if OTP is locked
    if (isLocked(otp)) {
      logger.warn('OTP is locked', {
        requestId,
        phone: maskPhone(normalizedPhone),
        lockedUntil: otp.lockedUntil
      })
      throw createError({
        statusCode: 429,
        statusMessage: 'Account temporarily locked. Please try again later.'
      })
    }
    
    // Check if OTP is expired
    if (isExpired(otp)) {
      logger.warn('OTP is expired', {
        requestId,
        phone: maskPhone(normalizedPhone),
        expiresAt: otp.expiresAt
      })
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid or expired code'
      })
    }
    
    // Verify code
    const codeHash = hashCode(code)
    if (codeHash !== otp.codeHash) {
      // Increment attempts
      const newAttempts = otp.attempts + 1
      const updateData: any = { attempts: newAttempts }
      
      // Lock if too many attempts
      if (newAttempts >= 5) {
        updateData.lockedUntil = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
        logger.warn('OTP locked due to too many attempts', {
          requestId,
          phone: maskPhone(normalizedPhone),
          attempts: newAttempts
        })
      }
      
      await prisma.otpCode.update({
        where: { id: otp.id },
        data: updateData
      })
      
      logger.warn('OTP verification failed - wrong code', {
        requestId,
        phone: maskPhone(normalizedPhone),
        attempts: newAttempts
      })
      
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid or expired code'
      })
    }
    
    // Code is correct - mark as used
    await prisma.otpCode.update({
      where: { id: otp.id },
      data: { 
        isUsed: true,
        attempts: otp.attempts + 1
      }
    })
    
    logger.info('OTP verification successful', {
      requestId,
      phone: maskPhone(normalizedPhone)
    })
    
    // Find user by phone
    const user = await prisma.user.findUnique({
      where: { phone: normalizedPhone }
    })
    
    if (!user) {
      if (!ALLOW_SELF_SIGNUP) {
        logger.warn('User not found and self-signup disabled', {
          requestId,
          phone: maskPhone(normalizedPhone)
        })
        throw createError({
          statusCode: 403,
          statusMessage: 'Self-registration is currently disabled'
        })
      }
      
      // TODO: Implement self-signup when enabled
      // For now, just throw error
      throw createError({
        statusCode: 403,
        statusMessage: 'Self-registration is currently disabled'
      })
    }
    
    // Generate tokens (same as login.post.ts)
    const accessToken = generateAccessToken({ 
      userId: user.id, 
      role: user.role, 
      phone: user.phone 
    })
    
    const refreshToken = generateRefreshToken()
    const refreshTokenHash = hashRefreshToken(refreshToken)
    const expiresAt = getRefreshTokenExpiry()
    
    // Get user agent and IP
    const userAgent = getHeader(event, 'user-agent') || undefined
    const ip = getRequestIP(event) || undefined
    
    // Save refresh token to database
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: refreshTokenHash,
        userAgent,
        ip,
        expiresAt
      }
    })
    
    // Set cookies (same as login.post.ts)
    const isProd = process.env.NODE_ENV === 'production'
    
    setCookie(event, 'at', accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProd,
      path: '/',
      maxAge: 60 * 15 // 15 minutes
    })
    
    setCookie(event, 'rt', refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProd,
      path: '/',
      maxAge: 60 * 60 * 24 * 30 // 30 days
    })
    
    logger.info('OTP login successful', { 
      userId: user.id, 
      role: user.role, 
      fullName: user.fullName 
    })
    
    return {
      ok: true,
      user: { 
        id: user.id, 
        role: user.role, 
        fullName: user.fullName, 
        phone: user.phone 
      }
    }
    
  } catch (error: any) {
    if (error.statusCode) {
      throw error // Re-throw HTTP errors
    }
    
    logger.error('OTP verification failed', {
      requestId,
      phone: maskPhone(normalizedPhone),
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    
    // Don't expose internal errors
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: 'Failed to verify OTP'
    })
  }
})
