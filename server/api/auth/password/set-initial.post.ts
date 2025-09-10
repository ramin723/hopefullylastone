// server/api/auth/password/set-initial.post.ts
import { prisma } from '../../../utils/db'
import { createRequestLogger } from '../../../utils/logger'
import { randomUUID } from 'crypto'
import { rateLimitComposite, getClientIP, maskPhone } from '../../../utils/rateLimiter'
import { appendResponseHeader } from 'h3'
import { SetInitialPasswordSchema } from '../../../validators/password'
import { requireAuth } from '../../../utils/auth'
import bcrypt from 'bcryptjs'

export default defineEventHandler(async (event) => {
  const requestId = randomUUID()
  const logger = createRequestLogger(requestId)
  
  logger.info('Set initial password request started')
  
  // Check authentication
  const user = await requireAuth(event)
  
  // Rate limiting (IP + user)
  const ip = getClientIP(event)
  const rateKey = `set-initial-password:${ip}:${user.id}`
  
  const { allowed, remaining, resetAt } = rateLimitComposite({
    key: rateKey,
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 10 // 10 requests per 10 minutes
  })
  
  if (!allowed) {
    const retryAfterSec = Math.max(1, Math.ceil((resetAt - Date.now()) / 1000))
    appendResponseHeader(event, 'Retry-After', retryAfterSec)
    
    logger.warn('Set initial password rate-limited', {
      requestId,
      userId: user.id,
      phone: maskPhone(user.phone || ''),
      remaining,
      resetAt
    })
    
    throw createError({
      statusCode: 429,
      statusMessage: 'Too Many Requests',
      message: 'تعداد درخواست‌های شما بیش از حد مجاز است. لطفاً چند دقیقه صبر کنید.'
    })
  }
  
  const body = await readBody(event)
  
  // Validate input
  const validation = SetInitialPasswordSchema.safeParse(body)
  if (!validation.success) {
    logger.error('Set initial password validation failed', { 
      requestId,
      userId: user.id,
      errors: validation.error.issues.map((e: any) => e.message) 
    })
    throw createError({ 
      statusCode: 400, 
      statusMessage: validation.error.issues[0]?.message || 'Invalid input' 
    })
  }
  
  const { password } = validation.data
  
  logger.info('Set initial password request allowed', {
    requestId,
    userId: user.id,
    phone: maskPhone(user.phone || ''),
    remaining,
    resetAt
  })
  
  try {
    // Check if user must change password
    if (!user.mustChangePassword) {
      logger.warn('User tried to set initial password but mustChangePassword is false', {
        requestId,
        userId: user.id,
        phone: maskPhone(user.phone || '')
      })
      
      throw createError({
        statusCode: 409,
        statusMessage: 'Conflict',
        message: 'این مرحله قبلاً انجام شده است. شما می‌توانید به پنل کاربری خود بروید.'
      })
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)
    
    // Update user in transaction
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: {
          passwordHash,
          mustChangePassword: false
        }
      })
    })
    
    logger.info('Initial password set successfully', {
      requestId,
      userId: user.id,
      phone: maskPhone(user.phone || '')
    })
    
    return {
      ok: true,
      message: 'رمز عبور با موفقیت ثبت شد'
    }
    
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    
    logger.error('Set initial password failed', {
      requestId,
      userId: user.id,
      phone: maskPhone(user.phone || ''),
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: 'خطا در ثبت رمز عبور'
    })
  }
})
