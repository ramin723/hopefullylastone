// server/api/orders/[code]/public.get.ts
import { prisma } from '../../../utils/db'
import { rateLimitComposite, getClientIP } from '../../../utils/rateLimiter'
import logger from '../../../utils/logger'
import { isValidOrderCode } from '../../../utils/ids'

export default defineEventHandler(async (event: any) => {
  const requestId = crypto.randomUUID()
  
  try {
    // 1. Log request start
    logger.info({
      requestId,
      endpoint: 'GET /api/orders/[code]/public',
      userAgent: getHeader(event, 'user-agent'),
      ip: getClientIP(event)
    }, '[PUBLIC ORDERS API] Request started')
    
    // 2. Rate limiting - 30 requests per 5 minutes per IP
    logger.info({
      requestId,
      ip: getClientIP(event)
    }, '[PUBLIC ORDERS API] Entering rate-limit check')
    
    const ip = getClientIP(event)
    const rateKey = `orders.public:${ip}`
    const rateLimit = rateLimitComposite({
      key: rateKey,
      windowMs: 5 * 60 * 1000, // 5 minutes
      max: 30
    })
    
    logger.info({
      requestId,
      ip,
      allowed: rateLimit.allowed,
      remaining: rateLimit.remaining,
      resetAt: rateLimit.resetAt
    }, '[PUBLIC ORDERS API] Rate-limit check completed')
    
    if (!rateLimit.allowed) {
      logger.warn({
        requestId,
        ip,
        remaining: rateLimit.remaining,
        resetAt: rateLimit.resetAt
      }, '[PUBLIC ORDERS API] Rate limit exceeded')
      
      throw createError({
        statusCode: 429,
        statusMessage: 'Too many requests'
      })
    }
    
    // 3. Get order code from params
    const code = getRouterParam(event, 'code')
    
    if (!code || !isValidOrderCode(code)) {
      logger.warn({
        requestId,
        code: code ? `***${code.slice(-4)}` : 'null',
        message: 'Invalid order code format'
      }, '[PUBLIC ORDERS API] Invalid order code')
      
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid order code format'
      })
    }
    
    // 4. Check if order exists and is PENDING
    const order = await prisma.order.findUnique({
      where: { code },
      select: {
        id: true,
        status: true,
        createdAt: true
      }
    })
    
    if (!order) {
      logger.info({
        requestId,
        code: `***${code.slice(-4)}`,
        message: 'Order not found'
      }, '[PUBLIC ORDERS API] Order not found')
      
      throw createError({
        statusCode: 404,
        statusMessage: 'Order not found'
      })
    }
    
    if (order.status !== 'PENDING') {
      logger.info({
        requestId,
        orderId: order.id,
        code: `***${code.slice(-4)}`,
        status: order.status,
        message: 'Order status is not PENDING'
      }, '[PUBLIC ORDERS API] Order status not PENDING')
      
      throw createError({
        statusCode: 404,
        statusMessage: 'Order not available'
      })
    }
    
    // 5. Log successful validation (mask sensitive data)
    logger.info({
      requestId,
      orderId: order.id,
      code: `***${code.slice(-4)}`,
      status: order.status,
      createdAt: order.createdAt
    }, '[PUBLIC ORDERS API] Order validation successful')
    
    // 6. Return minimal response (no PII)
    return {
      ok: true,
      message: 'Order is valid and available'
    }
    
  } catch (error: any) {
    // Log specific error types with clear messages
    if (error.statusCode === 400) {
      logger.warn({
        requestId,
        message: 'Bad request - Invalid order code format'
      }, '[PUBLIC ORDERS API] Bad request')
    } else if (error.statusCode === 404) {
      logger.info({
        requestId,
        message: 'Order not found or not available'
      }, '[PUBLIC ORDERS API] Not found')
    } else if (error.statusCode === 429) {
      logger.warn({
        requestId,
        message: 'Rate limit exceeded'
      }, '[PUBLIC ORDERS API] Rate limit exceeded')
    } else if (error.statusCode) {
      logger.error({
        requestId,
        statusCode: error.statusCode,
        message: error.statusMessage
      }, '[PUBLIC ORDERS API] Client error')
    } else {
      logger.error({
        requestId,
        err: error
      }, '[PUBLIC ORDERS API] Internal server error')
    }
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error while validating order'
    })
  }
})
