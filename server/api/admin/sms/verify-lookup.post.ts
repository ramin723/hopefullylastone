/**
 * POST /api/admin/sms/verify-lookup
 * 
 * ADMIN-only debug endpoint to test Kavenegar VerifyLookup API
 * 
 * Request Body:
 * {
 *   "receptor": string, // phone number
 *   "template": string (optional), // template name, defaults to runtimeConfig.kavenegar.templateOtp
 *   "token": string (optional) // token to send, defaults to '12345'
 * }
 * 
 * Response:
 * {
 *   "ok": boolean,
 *   "provider": "kavenegar",
 *   "attempted": "verifylookup",
 *   "normalized": string,
 *   "masked": string,
 *   "template": string,
 *   "tokenSample": string,
 *   "raw": any (optional),
 *   "status": number (optional),
 *   "error": string (optional),
 *   "devBypass": boolean (optional)
 * }
 * 
 * Security: Requires ADMIN role, includes CSRF protection, rate limiting
 */

import { requireAuth } from '../../../utils/auth'
import { kavenegarVerifyLookupDebug } from '../../../utils/sms'
import { rateLimitComposite, getClientIP } from '../../../utils/rateLimiter'
import { appendResponseHeader } from 'h3'
import { createRequestLogger } from '../../../utils/logger'
import { randomUUID } from 'crypto'

export default defineEventHandler(async (event) => {
  const requestId = randomUUID()
  const logger = createRequestLogger(requestId)
  
  logger.info('Admin SMS verify-lookup debug started')
  
  // Check authentication and admin role
  const user = await requireAuth(event)
  requireRole(user, 'ADMIN')
  
  const body = await readBody(event)
  const { receptor, template, token } = body
  
  // Validate required fields
  if (!receptor) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'receptor is required'
    })
  }
  
  // Rate limiting (IP + user)
  const ip = getClientIP(event)
  const key = `${ip}:${user.id}:sms-debug`
  
  const { allowed, remaining, resetAt } = rateLimitComposite({
    key,
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 5 // 5 requests per 10 minutes
  })
  
  if (!allowed) {
    const retryAfterSec = Math.max(1, Math.ceil((resetAt - Date.now()) / 1000))
    appendResponseHeader(event, 'Retry-After', retryAfterSec)
    
    logger.warn('SMS debug rate-limited', {
      requestId,
      userId: user.id,
      remaining,
      resetAt
    })
    
    throw createError({
      statusCode: 429,
      statusMessage: 'Too Many Requests',
      message: 'Too many debug requests. Please try again later.'
    })
  }
  
  logger.info('SMS debug allowed', {
    requestId,
    userId: user.id,
    phone: receptor.replace(/^(\d{4})\d+(\d{4})$/, '$1***$2'),
    remaining,
    resetAt
  })
  
  try {
    // Get default template from runtime config
    const config = useRuntimeConfig()
    const defaultTemplate = config.kavenegar?.templateOtp || 'otp-login'
    const defaultToken = '12345'
    
    // Call debug function
    const result = await kavenegarVerifyLookupDebug({
      receptor,
      template: template || defaultTemplate,
      token: token || defaultToken
    })
    
    logger.info('SMS verify-lookup debug completed', {
      requestId,
      userId: user.id,
      ok: result.ok,
      template: result.template,
      status: result.status
    })
    
    return result
    
  } catch (error: any) {
    logger.error('SMS verify-lookup debug failed', {
      requestId,
      userId: user.id,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: 'Failed to test SMS verify-lookup'
    })
  }
})
