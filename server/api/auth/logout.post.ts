// server/api/auth/logout.post.ts
import { prisma } from '../../utils/db'
import { createRequestLogger } from '../../utils/logger'
import { randomUUID } from 'crypto'
import { setCookie, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const requestId = randomUUID()
  const logger = createRequestLogger(requestId)
  
  logger.info('[AUTH] Logout attempt started', { requestId })
  
  try {
    // پاک‌کردن همه رفرش‌توکن‌های کاربر (اگر userId در context موجود باشد)
    // در غیر این صورت، فقط کوکی‌ها را پاک می‌کنیم
    const userId = (event.context as any)?.authUserId
    if (userId) {
      await prisma.refreshToken.deleteMany({
        where: { userId }
      })
      logger.info('[AUTH] Refresh tokens deleted for user', { requestId, userId })
    }
    
    // پاک‌کردن کوکی‌ها با تنظیمات امنیتی
    const isProd = process.env.NODE_ENV === 'production'
    const cookieOpts = {
      httpOnly: true,
      sameSite: 'lax' as const,
      secure: isProd,
      path: '/',
      maxAge: 0
    }
    
    // ست با تاریخ گذشته
    setCookie(event, 'at', '', { ...cookieOpts, maxAge: 0 })
    setCookie(event, 'rt', '', { ...cookieOpts, maxAge: 0 })
    // csrf ممکن است httpOnly:false باشد
    setCookie(event, 'csrf', '', { ...cookieOpts, httpOnly: false, maxAge: 0 })
    
    logger.info('[AUTH] Logout successful', { requestId, userId })
    return { ok: true }
    
  } catch (error: any) {
    logger.error('[AUTH] Logout failed', { 
      requestId, 
      error: error?.message || 'Unknown error' 
    })
    throw createError({ 
      statusCode: 500, 
      statusMessage: 'Logout failed' 
    })
  }
})
