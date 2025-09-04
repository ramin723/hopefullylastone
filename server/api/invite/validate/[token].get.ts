// server/api/invite/validate/[token].get.ts
import { prisma } from '../../../utils/db'
import { createRequestLogger } from '../../../utils/logger'
import { randomUUID } from 'crypto'
import { rateLimitComposite, getClientIP } from '../../../utils/rateLimiter'
import { appendResponseHeader } from 'h3'
import { ValidateInviteSchema } from '../../../validators/invite'
import { hashToken, isInviteValid } from '../../../utils/invite'
import { maskPhone } from '../../../utils/rateLimiter'

export default defineEventHandler(async (event) => {
  const requestId = randomUUID()
  const logger = createRequestLogger(requestId)
  
  logger.info('Invite validation started')
  
  const token = getRouterParam(event, 'token')
  
  // Validate token format
  const validation = ValidateInviteSchema.safeParse({ token })
  if (!validation.success) {
    logger.error('Invite validation failed - invalid token format', { 
      requestId,
      errors: validation.error.issues.map((e: any) => e.message) 
    })
    throw createError({ 
      statusCode: 400, 
      statusMessage: 'Invalid invite token format' 
    })
  }
  
  // Rate limiting (IP based)
  const ip = getClientIP(event)
  const key = `${ip}:invite-validate`
  
  const { allowed, remaining, resetAt } = rateLimitComposite({
    key,
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 60 // 60 requests per 5 minutes
  })
  
  if (!allowed) {
    const retryAfterSec = Math.max(1, Math.ceil((resetAt - Date.now()) / 1000))
    appendResponseHeader(event, 'Retry-After', retryAfterSec)
    
    logger.warn('Invite validation rate-limited', {
      requestId,
      remaining,
      resetAt
    })
    
    throw createError({
      statusCode: 429,
      statusMessage: 'Too Many Requests',
      message: 'Too many validation requests. Please try again later.'
    })
  }
  
  logger.info('Invite validation allowed', {
    requestId,
    remaining,
    resetAt
  })
  
  try {
    // Hash the token to find the invite
    const tokenHash = hashToken(token!)
    
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
        reason,
        expiresAt: invite.expiresAt,
        usedAt: invite.usedAt
      })
      
      throw createError({
        statusCode: 410,
        statusMessage: 'Invite is no longer valid',
        message: reason === 'used' ? 'این دعوت قبلاً استفاده شده است' : 'این دعوت منقضی شده است'
      })
    }
    
    logger.info('Invite validation successful', {
      requestId,
      inviteId: invite.id,
      role: invite.role,
      phone: maskPhone(invite.phone),
      expiresAt: invite.expiresAt
    })
    
    return {
      ok: true,
      data: {
        role: invite.role,
        phone: invite.phone, // Return actual phone for OTP requests
        phoneMasked: maskPhone(invite.phone), // Return masked phone for display
        meta: invite.meta,
        expiresAt: invite.expiresAt,
        createdBy: invite.createdByUser.fullName
      }
    }
    
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    
    logger.error('Invite validation failed', {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: 'Failed to validate invite'
    })
  }
})
