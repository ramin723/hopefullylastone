// server/api/auth/otp/request.post.ts
import { prisma } from '../../../utils/db'
import { createRequestLogger } from '../../../utils/logger'
import { randomUUID } from 'crypto'
import { rateLimitComposite, getClientIP, hashPhone, maskPhone } from '../../../utils/rateLimiter'
import { appendResponseHeader } from 'h3'
import { RequestOtpSchema } from '../../../validators/otp'
import { generateNumericCode, hashCode, normalizePhone } from '../../../utils/otp'
import { sendOtpViaSms } from '../../../utils/sms'

export default defineEventHandler(async (event) => {
  const requestId = randomUUID()
  const logger = createRequestLogger(requestId)
  
  logger.info('OTP request started')
  
  const body = await readBody<{ phone?: string; purpose?: string }>(event)
  
  // Validate input
  const validation = RequestOtpSchema.safeParse(body)
  if (!validation.success) {
    logger.error('OTP request validation failed', { 
      errors: validation.error.issues.map((e: any) => e.message) 
    })
    throw createError({ 
      statusCode: 400, 
      statusMessage: validation.error.issues[0]?.message || 'Invalid input' 
    })
  }
  
  const { phone, purpose } = validation.data
  const normalizedPhone = normalizePhone(phone)
  
  // Rate limiting (IP + phone hash)
  const ip = getClientIP(event)
  const phoneHash = hashPhone(normalizedPhone)
  const key = `${ip}:${phoneHash}:${purpose}`
  
  const { allowed, remaining, resetAt } = rateLimitComposite({
    key,
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 5 // 5 requests per 10 minutes
  })
  
  if (!allowed) {
    const retryAfterSec = Math.max(1, Math.ceil((resetAt - Date.now()) / 1000))
    appendResponseHeader(event, 'Retry-After', retryAfterSec)
    
    logger.warn('OTP request rate-limited', {
      requestId,
      phone: maskPhone(normalizedPhone),
      remaining,
      resetAt
    })
    
    throw createError({
      statusCode: 429,
      statusMessage: 'Too Many Requests',
      message: 'Too many OTP requests. Please try again later.'
    })
  }
  
  logger.info('OTP request allowed', {
    requestId,
    phone: maskPhone(normalizedPhone),
    remaining,
    resetAt
  })
  
  try {
    // Check if there's a valid, unused OTP for this phone/purpose
    const existingOtp = await prisma.otpCode.findFirst({
      where: {
        phone: normalizedPhone,
        purpose,
        isUsed: false,
        expiresAt: { gt: new Date() }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    if (existingOtp) {
      logger.info('Valid OTP already exists, not generating new one', {
        requestId,
        phone: maskPhone(normalizedPhone),
        expiresAt: existingOtp.expiresAt
      })
      
      // Return success message without revealing if code exists
      return {
        ok: true,
        message: 'اگر شماره معتبر باشد، کد ارسال شد'
      }
    }
    
    // Generate new OTP
    const code = generateNumericCode(5)
    const codeHash = hashCode(code)
    const expiresAt = new Date(Date.now() + 4 * 60 * 1000) // 4 minutes
    
    // Save to database
    await prisma.otpCode.create({
      data: {
        phone: normalizedPhone,
        codeHash,
        purpose,
        expiresAt,
        attempts: 0,
        isUsed: false
      }
    })
    
    // Send SMS
    await sendOtpViaSms({ phone: normalizedPhone, code })
    
    logger.info('OTP generated and sent successfully', {
      requestId,
      phone: maskPhone(normalizedPhone),
      expiresAt
    })
    
    // Always return the same message for security
    return {
      ok: true,
      message: 'اگر شماره معتبر باشد، کد ارسال شد'
    }
    
  } catch (error) {
    logger.error('OTP request failed', {
      requestId,
      phone: maskPhone(normalizedPhone),
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    
    // Don't expose internal errors
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: 'Failed to process OTP request'
    })
  }
})
