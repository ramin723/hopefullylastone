// server/api/orders/[code].get.ts
import { prisma } from '../../utils/db'
import { requireAuth } from '../../utils/auth'
import { rateLimitComposite, getClientIP } from '../../utils/rateLimiter'
import logger from '../../utils/logger'
import { isValidOrderCode } from '../../utils/ids'

export default defineEventHandler(async (event: any) => {
  // Handle HEAD request for order validity check
  if (getMethod(event) === 'HEAD') {
    try {
      const auth = await requireAuth(event, ['VENDOR'])
      const code = getRouterParam(event, 'code')
      
      if (!code || !isValidOrderCode(code)) {
        throw createError({ statusCode: 400, statusMessage: 'Invalid order code format' })
      }
      
      const order = await prisma.order.findUnique({
        where: { code },
        select: { id: true, status: true }
      })
      
      if (!order) {
        throw createError({ statusCode: 404, statusMessage: 'Order not found' })
      }
      
      if (order.status !== 'PENDING') {
        throw createError({ statusCode: 409, statusMessage: 'Order already consumed or invalid' })
      }
      
      return { ok: true }
    } catch (error: any) {
      if (error.statusCode) {
        throw error
      }
      throw createError({ statusCode: 500, statusMessage: 'Internal server error' })
    }
  }
  
  // Original GET logic
  try {
    // 1. Authentication - only VENDOR can retrieve orders
    const auth = await requireAuth(event, ['VENDOR'])
    
    // 2. Rate limiting - 60 requests per 5 minutes per IP+User
    const ip = getClientIP(event)
    const rateKey = `orders.retrieve:${ip}:${auth.id}`
    const rateLimit = rateLimitComposite({
      key: rateKey,
      windowMs: 5 * 60 * 1000, // 5 minutes
      max: 60
    })
    
    if (!rateLimit.allowed) {
      throw createError({
        statusCode: 429,
        statusMessage: 'Too many order retrieval requests'
      })
    }
    
    // 3. Get and validate order code from URL
    const code = getRouterParam(event, 'code')
    if (!code || !isValidOrderCode(code)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid order code format'
      })
    }
    
    // 4. Find order with items and mechanic info
    const order = await prisma.order.findUnique({
      where: { code },
      include: {
        mechanic: {
          select: {
            id: true,
            code: true,
            user: {
              select: {
                fullName: true
              }
            }
          }
        },
        items: {
          select: {
            title: true,
            quantity: true,
            note: true
          }
        }
      }
    })
    
    // 5. Check if order exists
    if (!order) {
      logger.warn({ code, vendorId: auth.id }, '[ORDERS API] Order not found')
      throw createError({
        statusCode: 404,
        statusMessage: 'Order not found'
      })
    }
    
    // 6. Check if order is still valid (PENDING status)
    if (order.status !== 'PENDING') {
      logger.warn({ 
        orderId: order.id, 
        code, 
        status: order.status, 
        vendorId: auth.id 
      }, '[ORDERS API] Order already consumed or invalid')
      
      throw createError({
        statusCode: 409,
        statusMessage: 'Order already consumed or invalid'
      })
    }
    
    // 7. Log successful retrieval (mask phone for privacy)
    logger.info({
      orderId: order.id,
      code,
      vendorId: auth.id,
      customerPhone: `***${order.customerPhone.slice(-4)}`
    }, '[ORDERS API] Order retrieved for POS')
    
    // 8. Return order data for POS prefill
    return {
      ok: true,
      order: {
        id: order.id,
        code: order.code,
        mechanic: {
          id: order.mechanic.id,
          code: order.mechanic.code,
          name: order.mechanic.user.fullName
        },
        customerPhone: order.customerPhone,
        note: order.note,
        items: order.items,
        createdAt: order.createdAt
      }
    }
    
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    
    logger.error({ err: error }, '[ORDERS API] Error retrieving order')
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error while retrieving order'
    })
  }
})
