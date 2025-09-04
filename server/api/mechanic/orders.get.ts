// server/api/mechanic/orders.get.ts
import { prisma } from '../../utils/db'
import { requireAuth } from '../../utils/auth'
import { rateLimitComposite, getClientIP } from '../../utils/rateLimiter'
import logger from '../../utils/logger'

export default defineEventHandler(async (event: any) => {
  try {
    // 1. Authentication - only MECHANIC can view their orders
    const auth = await requireAuth(event, ['MECHANIC'])
    
    // 2. Rate limiting - 60 requests per 5 minutes per IP+User
    const ip = getClientIP(event)
    const rateKey = `mechanic.orders:${ip}:${auth.id}`
    const rateLimit = rateLimitComposite({
      key: rateKey,
      windowMs: 5 * 60 * 1000, // 5 minutes
      max: 60
    })
    
    if (!rateLimit.allowed) {
      throw createError({
        statusCode: 429,
        statusMessage: 'Too many requests'
      })
    }
    
    // 3. Get query parameters
    const query = getQuery(event)
    const status = query.status as string
    const search = query.search as string
    const page = Math.max(1, parseInt(query.page as string) || 1)
    const pageSize = Math.min(100, Math.max(1, parseInt(query.pageSize as string) || 20))
    const skip = (page - 1) * pageSize
    
    // 4. Get mechanic ID from auth
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
    
    // 5. Build where clause
    const where: any = {
      mechanicId: mechanic.id
    }
    
    if (status && status !== 'ALL') {
      where.status = status
    }
    
    if (search) {
      where.customerPhone = {
        contains: search.trim()
      }
    }
    
    // 5. Get orders with items count
    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where,
        select: {
          id: true,
          code: true,
          customerPhone: true,
          note: true,
          status: true,
          createdAt: true,
          _count: {
            select: {
              items: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize
      }),
      prisma.order.count({ where })
    ])
    
    // 6. Transform data
    const transformedOrders = orders.map(order => ({
      id: order.id,
      code: order.code,
      customerPhone: order.customerPhone,
      note: order.note,
      status: order.status,
      createdAt: order.createdAt,
      itemCount: order._count.items
    }))
    
    // 8. Log successful retrieval (mask phone for privacy)
    logger.info({
      mechanicId: mechanic.id,
      userId: auth.id,
      status,
      search: search ? `***${search.slice(-4)}` : null,
      page,
      pageSize,
      resultCount: transformedOrders.length,
      totalCount
    }, '[MECHANIC ORDERS API] Orders retrieved')
    
    // 9. Debug log for empty results
    if (transformedOrders.length === 0 && totalCount > 0) {
      logger.warn({
        mechanicId: mechanic.id,
        userId: auth.id,
        where,
        totalCount,
        message: 'Empty results but totalCount > 0 - possible mapping issue'
      }, '[MECHANIC ORDERS API] Empty results with non-zero total')
    }
    
    // 10. Return response
    return {
      ok: true,
      items: transformedOrders,
      hasMore: skip + pageSize < totalCount,
      totalCount,
      page,
      pageSize
    }
    
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    
    logger.error({ err: error }, '[MECHANIC ORDERS API] Error retrieving orders')
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error while retrieving orders'
    })
  }
})
