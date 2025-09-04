// server/api/mechanic/stats.get.ts
import { prisma } from '../../utils/db'
import { requireAuth } from '../../utils/auth'
import { rateLimitComposite, getClientIP } from '../../utils/rateLimiter'
import logger from '../../utils/logger'

export default defineEventHandler(async (event: any) => {
  try {
    // 1. Authentication - only MECHANIC can view their stats
    const auth = await requireAuth(event, ['MECHANIC'])
    
    // 2. Rate limiting - 100 requests per 5 minutes per IP+User
    const ip = getClientIP(event)
    const rateKey = `mechanic.stats:${ip}:${auth.id}`
    const rateLimit = rateLimitComposite({
      key: rateKey,
      windowMs: 5 * 60 * 1000, // 5 minutes
      max: 100
    })
    
    if (!rateLimit.allowed) {
      throw createError({
        statusCode: 429,
        statusMessage: 'Too many requests'
      })
    }
    
    // 3. Get mechanic ID from auth
    const mechanic = await prisma.mechanic.findUnique({
      where: { userId: auth.id },
      select: { id: true }
    })
    
    if (!mechanic) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Mechanic not found'
      })
    }
    
    // 4. Get stats
    const [totalTransactions, totalOrdersResult, totalEarnings] = await Promise.all([
      // Total transactions
      prisma.transaction.count({
        where: { mechanicId: mechanic.id }
      }),
      // Total orders - with fallback for P2021 (table not found)
      (async () => {
        try {
          return await prisma.order.count({
            where: { mechanicId: mechanic.id }
          })
        } catch (err: any) {
          if (err.code === 'P2021' || err.name === 'PrismaClientKnownRequestError') {
            logger.warn('[MECHANIC STATS API] Order table not found, using fallback value')
            return 0
          }
          throw err
        }
      })(),
      // Total earnings (sum of mechanic amounts from commissions)
      prisma.commission.aggregate({
        where: { 
          transaction: { mechanicId: mechanic.id }
        },
        _sum: { mechanicAmount: true }
      })
    ])
    
    const totalOrders = totalOrdersResult
    
    // 5. Log successful retrieval
    logger.info({
      mechanicId: mechanic.id,
      userId: auth.id
    }, '[MECHANIC STATS API] Stats retrieved')
    
    // 6. Return response
    return {
      ok: true,
      totalTransactions,
      totalOrders,
      totalEarnings: totalEarnings._sum.mechanicAmount || 0
    }
    
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    
    logger.error({ err: error }, '[MECHANIC STATS API] Error retrieving stats')
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error while retrieving stats'
    })
  }
})
