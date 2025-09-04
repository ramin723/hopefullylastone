// server/api/orders/index.post.ts
import { prisma } from '../../utils/db'
import { requireAuth } from '../../utils/auth'
import { rateLimitComposite, getClientIP } from '../../utils/rateLimiter'
import logger from '../../utils/logger'
import { CreateOrderSchema } from '../../validators/orders'
import { generateOrderCode } from '../../utils/ids'

export default defineEventHandler(async (event: any) => {
  const requestId = crypto.randomUUID()
  
  try {
    // 1. Log request start
    logger.info({
      requestId,
      endpoint: 'POST /api/orders',
      userAgent: getHeader(event, 'user-agent'),
      ip: getClientIP(event)
    }, '[ORDERS API] Request started')
    
    // 2. Authentication - only MECHANIC can create orders
    const auth = await requireAuth(event, ['MECHANIC'])
    
    // 3. Log authentication success
    logger.info({
      requestId,
      userId: auth.id,
      role: auth.role
    }, '[ORDERS API] Authentication successful')
    
    // 4. Rate limiting - 30 requests per 5 minutes per IP+User
    logger.info({
      requestId,
      userId: auth.id,
      role: auth.role
    }, '[ORDERS API] Entering rate-limit check')
    
    const ip = getClientIP(event)
    const rateKey = `orders.create:${ip}:${auth.id}`
    const rateLimit = rateLimitComposite({
      key: rateKey,
      windowMs: 5 * 60 * 1000, // 5 minutes
      max: 30
    })
    
    logger.info({
      requestId,
      userId: auth.id,
      role: auth.role,
      allowed: rateLimit.allowed,
      remaining: rateLimit.remaining,
      resetAt: rateLimit.resetAt
    }, '[ORDERS API] Rate-limit check completed')
    
    if (!rateLimit.allowed) {
      logger.warn({
        requestId,
        userId: auth.id,
        role: auth.role,
        remaining: rateLimit.remaining,
        resetAt: rateLimit.resetAt
      }, '[ORDERS API] Rate limit exceeded')
      
      throw createError({
        statusCode: 429,
        statusMessage: 'Too many order creation requests'
      })
    }
    
    // 3. Validate request body
    const body = await readBody(event)
    const validation = CreateOrderSchema.safeParse(body)
    
    if (!validation.success) {
      throw createError({
        statusCode: 400,
        statusMessage: validation.error.issues.map((i: any) => i.message).join(', ')
      })
    }
    
    const { customerPhone, note, items } = validation.data
    
    // 4. Generate unique order code
    let orderCode: string
    let attempts = 0
    const maxAttempts = 10
    
    do {
      orderCode = generateOrderCode()
      attempts++
      
      if (attempts > maxAttempts) {
        throw createError({
          statusCode: 500,
          statusMessage: 'Failed to generate unique order code'
        })
      }
    } while (await (prisma as any).order.findUnique({ where: { code: orderCode } }))
    
    // 5. Get mechanic ID from auth
    const mechanic = await prisma.mechanic.findUnique({
      where: { userId: auth.id },
      select: { id: true }
    })
    
    if (!mechanic) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Mechanic profile not found'
      })
    }
    
    // 6. Create order with items in transaction
    const order = await prisma.$transaction(async (tx: any) => {
      const newOrder = await (tx as any).order.create({
        data: {
          code: orderCode,
          mechanicId: mechanic.id,
          customerPhone: customerPhone.trim(),
          note: note?.trim() || null,
          status: 'PENDING'
        }
      })
      
      // Create order items
      await (tx as any).orderItem.createMany({
        data: items.map((item: any) => ({
          orderId: newOrder.id,
          title: item.title.trim(),
          quantity: item.quantity,
          note: item.note?.trim() || null
        }))
      })
      
      return newOrder
    })
    
    // 7. Build share URL
    const config = useRuntimeConfig()
    const baseUrl = config.public.appBaseURL || getRequestURL(event).origin
    const shareUrl = `${baseUrl}/o/${orderCode}`
    
    // 8. Log success (mask phone for privacy)
    logger.info({
      orderId: order.id,
      orderCode,
      mechanicId: mechanic.id,
      customerPhone: `***${customerPhone.slice(-4)}`,
      itemCount: items.length
    }, '[ORDERS API] New order created')
    
    // 9. Return response
    return {
      ok: true,
      order: {
        id: order.id,
        code: order.code,
        shareUrl
      }
    }
    
  } catch (error: any) {
    // Log specific error types with clear messages
    if (error.statusCode === 401) {
      logger.warn({
        requestId,
        message: 'Unauthorized access attempt'
      }, '[ORDERS API] Authentication failed')
    } else if (error.statusCode === 403) {
      logger.warn({
        requestId,
        message: 'Forbidden access - Invalid CSRF token or insufficient permissions'
      }, '[ORDERS API] Authorization failed')
    } else if (error.statusCode === 429) {
      logger.warn({
        requestId,
        message: 'Rate limit exceeded'
      }, '[ORDERS API] Rate limit exceeded')
    } else if (error.statusCode === 422) {
      logger.warn({
        requestId,
        message: 'Validation error',
        validationErrors: error.data?.message || 'Invalid request data'
      }, '[ORDERS API] Validation failed')
    } else if (error.statusCode) {
      logger.error({
        requestId,
        statusCode: error.statusCode,
        message: error.statusMessage
      }, '[ORDERS API] Client error')
    } else {
      logger.error({
        requestId,
        err: error
      }, '[ORDERS API] Internal server error')
    }
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error while creating order'
    })
  }
})
