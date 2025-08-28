// server/api/auth/login.post.ts
import { prisma } from '../../utils/db'
import bcrypt from 'bcryptjs'
import { generateAccessToken, generateRefreshToken, hashRefreshToken, getRefreshTokenExpiry } from '../../utils/tokens'
import { createRequestLogger } from '../../utils/logger'
import { randomUUID } from 'crypto'
import { rateLimitComposite, buildLoginKey, maskPhone } from '../../utils/rateLimiter'
import { appendResponseHeader } from 'h3'

export default defineEventHandler(async (event) => {
  const requestId = randomUUID()
  const logger = createRequestLogger(requestId)
  
  logger.info('Login attempt started')
  
  const body = await readBody<{ phone?: string; password?: string }>(event)
  
  if (!body?.phone || !body?.password) {
    logger.error('Login failed: missing phone or password')
    throw createError({ statusCode: 400, statusMessage: 'phone & password required' })
  }

  // ---- Rate Limit (IP + phone) BEFORE password check ----
  const key = buildLoginKey(event, body.phone)
  const { allowed, remaining, resetAt } = rateLimitComposite({
    key,
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 5
  })

  if (!allowed) {
    const retryAfterSec = Math.max(1, Math.ceil((resetAt - Date.now()) / 1000))
    // استاندارد: Retry-After برای کلاینت‌ها/ریورس‌پراکسی‌ها
    appendResponseHeader(event, 'Retry-After', retryAfterSec)

    logger.warn('[AUTH] Login rate-limited', {
      requestId,
      phone: maskPhone(body.phone),
      remaining,
      resetAt
    })

    throw createError({
      statusCode: 429,
      statusMessage: 'Too Many Requests',
      message: 'Too many login attempts. Please try again later.'
    })
  }

  // در لاگ سطح info: باقی‌مانده برای مشاهده رفتار
  logger.info('[AUTH] Login attempt allowed', {
    requestId,
    phone: maskPhone(body.phone),
    remaining,
    resetAt
  })
  // -------------------------------------------------------

  const user = await prisma.user.findUnique({ where: { phone: body.phone } })
  if (!user) {
    logger.error('Login failed: user not found', { phone: body.phone })
    throw createError({ statusCode: 401, statusMessage: 'Invalid credentials' })
  }

  const ok = await bcrypt.compare(body.password, user.passwordHash)
  if (!ok) {
    logger.error('Login failed: wrong password', { phone: body.phone })
    throw createError({ statusCode: 401, statusMessage: 'Invalid credentials' })
  }

  // Generate tokens
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
  
  // Set cookies
  const isProd = process.env.NODE_ENV === 'production'
  
  setCookie(event, 'at', accessToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd,      // ← DEV: false  |  PROD: true
    path: '/',
    maxAge: 60 * 15      // 15m
  })
  
  setCookie(event, 'rt', refreshToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd,      // ← DEV: false  |  PROD: true
    path: '/',
    maxAge: 60 * 60 * 24 * 30 // 30d
  })
  
  logger.info('Login successful', { 
    userId: user.id, 
    role: user.role, 
    fullName: user.fullName 
  })
  
  return {
    user: { 
      id: user.id, 
      role: user.role, 
      fullName: user.fullName, 
      phone: user.phone 
    }
  }
})
